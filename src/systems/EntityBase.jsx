/**
 * EntityBase v2 - Maximum Auto-Detection
 *
 * Given only a modelPath, automatically:
 *   1. Measure original bounding box
 *   2. Scale to a sensible game size (targetHeight auto-detected)
 *   3. Detect feet position (minY) for ground snapping
 *   4. Auto-map animations (Walk, Idle, etc. with fuzzy matching)
 *   5. Calculate appropriate movement speed based on model size
 *   6. Find initial spawn position on ground
 *
 * Usage:
 *   const entity = useEntityBase('./assets/Horse.glb')
 *   // entity = { scene, calibration, mixer, names, playAnimation, autoSpeed }
 */

import { useRef, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

// ============================================================
// AUTO-TARGET-HEIGHT: sensible defaults based on model type
// ============================================================

// Common model prefixes and their ideal game heights (in world units)
const HEIGHT_HINTS = {
  horse: 3.5,    stallion: 3.5,  pony: 2.0,
  tiger: 1.8,    lion: 1.8,      wolf: 1.5,     dog: 1.2,      cat: 0.5,
  bear: 3.0,     deer: 2.5,      boar: 1.5,     rabbit: 0.6,
  elephant: 5.0, giraffe: 6.0,   rhino: 3.0,
  human: 1.8,    knight: 2.0,    soldier: 1.8,  character: 1.8, player: 1.8,
  dragon: 5.0,   bird: 1.0,      eagle: 1.0,
  tree: 5.0,     rock: 2.0,      building: 10.0, house: 8.0,
}

function guessTargetHeight(modelPath, originalHeight) {
  const name = modelPath.toLowerCase()
  
  // Check if any hint matches
  for (const [key, height] of Object.entries(HEIGHT_HINTS)) {
    if (name.includes(key)) return height
  }
  
  // No hint: use a formula based on original size
  // If original is huge (>50), scale to ~2.5 units
  // If original is tiny (<1), keep as is
  // Otherwise, target 2.5 units
  if (originalHeight > 50) return 2.5
  if (originalHeight < 0.5) return originalHeight
  return 2.5
}

// ============================================================
// ANIMATION NAME FUZZY MATCHING
// ============================================================

const ANIM_PATTERNS = {
  idle:    ['idle', 'stand', 'wait', 'rest', 'default', 'breath'],
  walk:    ['walk', 'run', 'jog', 'trot', 'pace', 'move', 'forward', 'locomotion'],
  gallop:  ['gallop', 'sprint', 'dash', 'fast_run', 'canter'],
  attack:  ['attack', 'hit', 'strike', 'bite', 'claw', 'kick', 'headbutt'],
  death:   ['death', 'die', 'dead', 'defeat'],
  jump:    ['jump', 'leap', 'hop'],
  eat:     ['eat', 'graze', 'chew', 'feed'],
  hit:     ['hit', 'react', 'pain', 'damage', 'flinch'],
}

function autoMapAnimations(names, modelPath) {
  const mapped = {}
  
  for (const [actionType, patterns] of Object.entries(ANIM_PATTERNS)) {
    // Score each name against each pattern, pick best match
    let bestScore = -1
    let bestName = null
    
    for (const name of names) {
      const lower = name.toLowerCase()
      for (const pattern of patterns) {
        if (!lower.includes(pattern)) continue
        // Score: shorter names are better ("Idle" > "Idle_HitReact_Left")
        // Exact match gets huge bonus
        const exactBonus = lower === pattern ? 1000 : 0
        const lengthPenalty = lower.length - pattern.length
        const score = exactBonus + 100 - lengthPenalty
        if (score > bestScore) {
          bestScore = score
          bestName = name
        }
      }
    }
    
    if (bestName) mapped[actionType] = bestName
  }
  
  console.log(`[AutoAnim] Mapped:`, mapped)
  return mapped
}

// ============================================================
// CALIBRATION
// ============================================================

function calibrateModel(scene, targetHeight) {
  scene.updateMatrixWorld(true)
  
  const box = new THREE.Box3().setFromObject(scene)
  const currentHeight = box.max.y - box.min.y
  
  const scale = currentHeight > 0.001 ? targetHeight / currentHeight : 1
  
  scene.scale.multiplyScalar(scale)
  scene.updateMatrixWorld(true)
  
  const finalBox = new THREE.Box3().setFromObject(scene)
  
  return {
    minY: finalBox.min.y,
    maxY: finalBox.max.y,
    height: finalBox.max.y - finalBox.min.y,
    feetOffset: -finalBox.minY,  // y to add so feet touch ground
    scaleApplied: scale,
    originalHeight: currentHeight,
    centerY: (finalBox.min.y + finalBox.max.y) / 2,
  }
}

// ============================================================
// MAIN HOOK
// ============================================================

export function useEntityBase({ modelPath, targetHeight, shadow = true }) {
  const { scene, animations } = useGLTF(modelPath)
  const mixerRef = useRef(null)
  const actionsRef = useRef({})
  const calibrationRef = useRef(null)
  const animMapRef = useRef({})
  const activeActionRef = useRef(null)
  const initializedRef = useRef(false)
  
  useEffect(() => {
    if (!scene || initializedRef.current) return
    initializedRef.current = true
    
    // Enable shadows
    if (shadow) {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = false
        }
      })
    }
    
    // Measure original size before scaling
    const rawBox = new THREE.Box3().setFromObject(scene)
    const originalHeight = rawBox.max.y - rawBox.min.y
    
    // Auto-detect target height if not specified
    const finalTarget = targetHeight || guessTargetHeight(modelPath, originalHeight)
    
    // Calibrate
    calibrationRef.current = calibrateModel(scene, finalTarget)
    const cal = calibrationRef.current
    
    console.log(
      `[Entity] ${modelPath.split('/').pop()}: ` +
      `original=${originalHeight.toFixed(1)} → ` +
      `target=${finalTarget.toFixed(1)} (scale ${cal.scaleApplied.toFixed(3)}), ` +
      `feet at local Y=${cal.minY.toFixed(3)}`
    )
    
    // Animation mixer
    if (animations && animations.length > 0) {
      const mixer = new THREE.AnimationMixer(scene)
      mixerRef.current = mixer
      
      const actions = {}
      const names = []
      animations.forEach((clip) => {
        actions[clip.name] = mixer.clipAction(clip)
        names.push(clip.name)
      })
      actionsRef.current = actions
      
      // Auto-map animation names
      animMapRef.current = autoMapAnimations(names, modelPath)
      
      console.log(`[Entity] ${names.length} animations, auto-mapped:`, animMapRef.current)
      
      // Play idle (auto-detected)
      const idleName = animMapRef.current['idle'] || names[0]
      const idleAction = actions[idleName]
      if (idleAction) {
        idleAction.play()
        activeActionRef.current = idleAction
        console.log(`[Entity] Playing initial: "${idleName}"`)
      }
    }
    
    return () => {
      mixerRef.current?.stopAllAction()
    }
  }, [scene, animations, modelPath, targetHeight, shadow])
  
  function playAnimation(typeOrName, fadeTime = 0.3) {
    const actions = actionsRef.current
    const mixer = mixerRef.current
    const animMap = animMapRef.current
    if (!mixer || !actions) return false
    
    // If typeOrName is a known type (e.g., 'Walk', 'Idle'), look it up
    const type = typeOrName.toLowerCase()
    const mappedName = animMap[type] || typeOrName
    const next = actions[mappedName]
    
    if (!next) return false
    if (activeActionRef.current === next) return false
    
    if (activeActionRef.current) activeActionRef.current.fadeOut(fadeTime)
    next.reset().fadeIn(fadeTime).play()
    activeActionRef.current = next
    return true
  }
  
  // Auto-calculate speed based on model height
  function getAutoSpeed() {
    const cal = calibrationRef.current
    if (!cal) return 3
    // Bigger models should move proportionally
    return Math.max(1, Math.min(8, cal.height * 0.8))
  }
  
  return {
    scene,
    calibration: calibrationRef.current,
    mixer: mixerRef,
    actions: actionsRef.current,
    names: animations?.map(a => a.name) || [],
    animMap: animMapRef.current,
    playAnimation,
    getAutoSpeed,
  }
}
