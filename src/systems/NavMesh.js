/**
 * NavMesh System - Pure JS, no React dependency
 * 
 * Responsibilities:
 * - Receive classified meshes (ground vs obstacle)
 * - Spatial grid for fast collision queries
 * - Ground height sampling via raycast
 * - Obstacle proximity queries
 * 
 * Usage:
 *   const navMesh = new NavMesh()
 *   navMesh.build({ grounds: [...], obstacles: [...] })
 *   const height = navMesh.getGroundHeight(x, z)
 *   const nearby = navMesh.getNearbyObstacles(x, z, radius)
 */

import * as THREE from 'three'

export class NavMesh {
  constructor(gridSize = 5) {
    this.grounds = []
    this.obstacles = []
    this.allMeshes = []
    this.gridSize = gridSize
    this.grid = new Map()
    this._raycaster = new THREE.Raycaster()
    this._down = new THREE.Vector3(0, -1, 0)
  }

  /**
   * Build the navmesh from classified meshes.
   * Rebuilds spatial grid for collision queries.
   */
  build({ grounds = [], obstacles = [], allMeshes = null } = {}) {
    this.grounds = grounds
    this.obstacles = obstacles
    this.allMeshes = allMeshes || [...grounds, ...obstacles]
    this._buildGrid()
  }

  _buildGrid() {
    this.grid.clear()
    for (const obj of this.obstacles) {
      if (!obj.geometry) continue
      const box = new THREE.Box3().setFromObject(obj)
      const center = new THREE.Vector3()
      box.getCenter(center)
      const gx = Math.floor(center.x / this.gridSize)
      const gz = Math.floor(center.z / this.gridSize)
      const key = `${gx},${gz}`
      if (!this.grid.has(key)) this.grid.set(key, [])
      this.grid.get(key).push({
        obj,
        center: center.clone(),
        radius: Math.max(box.max.x - box.min.x, box.max.z - box.min.z) / 2 * 0.7
      })
    }
  }

  /**
   * Get ground/terrain height at world position (x, z).
   * Prefers flat surfaces (normal.y > 0.85).
   * Returns 0 if no ground found.
   */
  getGroundHeight(x, z) {
    if (this.allMeshes.length === 0) return 0
    
    this._raycaster.set(new THREE.Vector3(x, 200, z), this._down)
    
    const hits = []
    for (const mesh of this.allMeshes) {
      const intersections = this._raycaster.intersectObject(mesh, true)
      for (const hit of intersections) {
        if (hit.face) {
          hits.push({
            y: hit.point.y,
            normalY: Math.abs(hit.face.normal.y),
            distance: hit.distance
          })
        }
      }
    }
    
    if (hits.length === 0) return 0
    
    // Prefer flat surfaces
    const flatHits = hits.filter(h => h.normalY > 0.85)
    if (flatHits.length > 0) return Math.max(...flatHits.map(h => h.y))
    
    hits.sort((a, b) => a.distance - b.distance)
    return hits[0].y
  }

  /**
   * Get obstacles near a position.
   * Returns array of { center, radius, obj } within queryRadius.
   */
  getNearbyObstacles(x, z, queryRadius) {
    const nearby = []
    const gx1 = Math.floor((x - queryRadius) / this.gridSize)
    const gx2 = Math.floor((x + queryRadius) / this.gridSize)
    const gz1 = Math.floor((z - queryRadius) / this.gridSize)
    const gz2 = Math.floor((z + queryRadius) / this.gridSize)
    
    for (let gx = gx1; gx <= gx2; gx++) {
      for (let gz = gz1; gz <= gz2; gz++) {
        const key = `${gx},${gz}`
        if (this.grid.has(key)) {
          for (const item of this.grid.get(key)) {
            const dist = Math.sqrt((x - item.center.x) ** 2 + (z - item.center.z) ** 2)
            if (dist < queryRadius + item.radius) {
              nearby.push(item)
            }
          }
        }
      }
    }
    return nearby
  }

  /**
   * Check if a circle at (x,z) with given radius collides with any obstacle.
   */
  checkCollision(x, z, radius) {
    const nearby = this.getNearbyObstacles(x, z, radius + 3)
    for (const item of nearby) {
      const dist = Math.sqrt((x - item.center.x) ** 2 + (z - item.center.z) ** 2)
      if (dist < radius + item.radius) return true
    }
    return false
  }

  /**
   * Get avoidance vector at position (for obstacle steering).
   * Returns normalized direction away from nearby obstacles, or null if clear.
   */
  getAvoidanceVector(x, z, avoidRadius) {
    const nearby = this.getNearbyObstacles(x, z, avoidRadius)
    let ax = 0, az = 0
    
    for (const item of nearby) {
      const dx = x - item.center.x
      const dz = z - item.center.z
      const dist = Math.sqrt(dx * dx + dz * dz)
      if (dist < avoidRadius && dist > 0.001) {
        const strength = 1 - dist / avoidRadius
        ax += (dx / dist) * strength
        az += (dz / dist) * strength
      }
    }
    
    if (ax === 0 && az === 0) return null
    return new THREE.Vector3(ax, 0, az).normalize()
  }
}
