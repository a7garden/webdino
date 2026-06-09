/**
 * Horse Entity - Fully auto-configured
 * 
 * Only needs: modelPath and navMesh.
 * Everything else (scale, speed, animations, spawn position) is auto-detected.
 */

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useEntityBase } from '../systems/EntityBase'

export function Horse({ navMesh }) {
  const groupRef = useRef()
  
  const {
    scene, calibration, mixer,
    playAnimation, getAutoSpeed
  } = useEntityBase({
    modelPath: './assets/Horse.glb',
    // targetHeight: auto-detected from filename → 3.5 for "horse"
  })
  
  const state = useRef({
    position: new THREE.Vector3(0, 0, 14.77),
    rotation: Math.PI,
    targetRotation: Math.PI,
    turnTimer: 0,
    stuckTimer: 0,
    lastPosition: new THREE.Vector3(),
    isMoving: false,
    initialized: false,
  })
  
  useFrame((_, delta) => {
    if (!groupRef.current || !navMesh || !calibration) return
    
    const s = state.current
    const speed = getAutoSpeed()
    
    // Update the animation mixer
    if (mixer.current) mixer.current.update(delta)
    
    // --- Init ---
    if (!s.initialized) {
      const groundY = navMesh.getGroundHeight(s.position.x, s.position.z)
      groupRef.current.position.set(s.position.x, groundY + calibration.feetOffset, s.position.z)
      groupRef.current.rotation.y = s.rotation
      s.initialized = true
      playAnimation('idle')
      return
    }
    
    // --- Stuck detection ---
    const moved = s.position.distanceTo(s.lastPosition)
    s.stuckTimer = moved < 0.02 ? s.stuckTimer + delta : 0
    s.lastPosition.copy(s.position)
    s.turnTimer += delta
    
    // --- Steering ---
    const avoidVec = navMesh.getAvoidanceVector(s.position.x, s.position.z, calibration.height * 0.8)
    
    let targetRot = s.targetRotation
    
    if (avoidVec) {
      targetRot = Math.atan2(avoidVec.x, avoidVec.z)
      s.turnTimer = 0
    } else if (s.stuckTimer > 0.8) {
      targetRot = s.rotation + (Math.random() > 0.5 ? 1 : -1) * Math.PI / 2
      s.stuckTimer = 0
    } else if (s.turnTimer > 3 + Math.random() * 5) {
      targetRot = s.rotation + (Math.random() - 0.5) * Math.PI * 0.8
      s.turnTimer = 0
    }
    
    // Smooth rotation
    let rotDiff = targetRot - s.rotation
    while (rotDiff > Math.PI) rotDiff -= Math.PI * 2
    while (rotDiff < -Math.PI) rotDiff += Math.PI * 2
    s.rotation += rotDiff * 2.5 * delta
    s.targetRotation = targetRot
    
    // --- Movement ---
    const forward = new THREE.Vector3(Math.sin(s.rotation), 0, Math.cos(s.rotation))
    const newPos = s.position.clone().add(forward.multiplyScalar(speed * delta))
    
    const collRadius = calibration.height * 0.15  // proportional to model size
    
    if (!navMesh.checkCollision(newPos.x, newPos.z, collRadius)) {
      s.position.copy(newPos)
      s.isMoving = true
      playAnimation('walk')
    } else {
      s.isMoving = false
      const leftDir = new THREE.Vector3(Math.sin(s.rotation - 1), 0, Math.cos(s.rotation - 1))
      const rightDir = new THREE.Vector3(Math.sin(s.rotation + 1), 0, Math.cos(s.rotation + 1))
      const step = speed * delta
      
      if (!navMesh.checkCollision(s.position.x + leftDir.x * step, s.position.z + leftDir.z * step, collRadius)) {
        s.position.add(leftDir.multiplyScalar(step))
        s.targetRotation = s.rotation - 1
        playAnimation('walk')
      } else if (!navMesh.checkCollision(s.position.x + rightDir.x * step, s.position.z + rightDir.z * step, collRadius)) {
        s.position.add(rightDir.multiplyScalar(step))
        s.targetRotation = s.rotation + 1
        playAnimation('walk')
      } else {
        playAnimation('idle')
      }
    }
    
    // Bound clamping
    const dist = Math.sqrt(s.position.x ** 2 + s.position.z ** 2)
    const maxDist = 20
    if (dist > maxDist) {
      s.position.x *= maxDist / dist
      s.position.z *= maxDist / dist
    }
    
    if (!s.isMoving && s.stuckTimer < 0.5) {
      playAnimation('idle')
    }
    
    // --- Apply transform ---
    groupRef.current.position.set(
      s.position.x,
      navMesh.getGroundHeight(s.position.x, s.position.z) + calibration.feetOffset,
      s.position.z
    )
    groupRef.current.rotation.y = s.rotation
  })
  
  return <primitive ref={groupRef} object={scene} />
}
