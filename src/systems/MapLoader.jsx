/**
 * Map Classification System
 * 
 * Given a GLTF scene, classifies meshes into:
 * - grounds: walkable terrain (flat, large)
 * - obstacles: things to avoid (trees, rocks, etc.)
 * - all: every mesh (for ground height sampling)
 *
 * Classification uses:
 * 1. Name keywords (primary)
 * 2. Geometry shape analysis (fallback)
 * 3. Index heuristic (final fallback)
 */

import * as THREE from 'three'

// Keywords for name-based classification (easily extendable)
const GROUND_KEYS = [
  'ground', 'terrain', 'floor', 'base', 'earth', 'road', 'path', 'sand', 'dirt',
  'plane', 'land', 'soil', 'mud', 'grass', 'landscape', 'island', 'mountain',
  'hill', 'cliff', 'valley', 'plateau', 'field', 'meadow', 'prairie', 'tile'
]

const OBSTACLE_KEYS = [
  'tree', 'rock', 'stone', 'boulder', 'prop', 'furniture', 'building', 'wall',
  'crate', 'box', 'barrel', 'pillar', 'column', 'stump', 'branch', 'bush',
  'shrub', 'flower', 'mushroom', 'fungus', 'plant', 'foliage', 'hedge',
  'fence', 'post', 'sign', 'lamp', 'bench', 'table', 'chair', 'statue',
  'monument', 'tomb', 'grave', 'ruins', 'debris', 'rubble', 'log', 'trunk',
  'spike', 'thorn', 'crystal', 'ore', 'stalagmite', 'stalactite', 'coral'
]

/**
 * Classify a single mesh as 'ground' or 'obstacle'.
 */
function classifyMesh(mesh, index = 0) {
  const name = (mesh.name || '').toLowerCase()
  
  // 1. Name keywords
  if (GROUND_KEYS.some(k => name.includes(k))) return 'ground'
  if (OBSTACLE_KEYS.some(k => name.includes(k))) return 'obstacle'
  
  // 2. Geometry shape analysis
  if (mesh.geometry) {
    const box = new THREE.Box3().setFromObject(mesh)
    const size = new THREE.Vector3()
    box.getSize(size)
    
    // Large flat objects → ground
    const isFlat = size.y < size.x * 0.3 && size.y < size.z * 0.3
    const area = size.x * size.z
    if (isFlat && (size.x > 10 || size.z > 10 || area > 100)) return 'ground'
    
    // Small vertical objects → obstacle
    if (size.x < 5 && size.y < 10 && size.z < 5 && size.y > size.x * 0.5) return 'obstacle'
  }
  
  // 3. Index heuristic (first 10 meshes tend to be ground)
  if (index < 10) return 'ground'
  
  // 4. Default to obstacle for safety
  return 'obstacle'
}

/**
 * Classify all meshes in a Three.js scene and deep-clone them for NavMesh.
 * Returns { grounds[], obstacles[], all[] }
 */
export function classifyScene(scene) {
  const grounds = []
  const obstacles = []
  const all = []
  let index = 0
  
  scene.traverse((child) => {
    if (!child.isMesh) return
    
    // Deep clone for NavMesh (so we can add/remove without affecting render)
    const clone = child.clone()
    all.push(clone)
    
    const category = classifyMesh(child, index++)
    if (category === 'ground') {
      grounds.push(clone)
    } else {
      obstacles.push(clone)
    }
  })
  
  console.log(`[MapSystem] Classified: ${grounds.length} ground, ${obstacles.length} obstacles, ${all.length} total`)
  return { grounds, obstacles, all }
}
