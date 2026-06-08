import { useFrame, useThree } from '@react-three/fiber'
import { useGame, setNearbyDino } from '../hooks/useGame'
import * as THREE from 'three'

const _euler = new THREE.Euler(0, 0, 0, 'YXZ')
const _moveDir = new THREE.Vector3()

export default function PlayerController({ camera }) {
  const {
    player,
    eulerRef,
    velocityRef,
    keysRef,
    isGroundedRef,
    isAngelMode,
    gameState,
    dinoManager
  } = useGame()

  useFrame((_, delta) => {
    if (!camera) return
    if (gameState === 'start' || gameState === 'win') return

    const dt = Math.min(delta, 0.05)

    const yaw = eulerRef.current.y
    const pitch = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, eulerRef.current.x))

    if (gameState === 'playing' || gameState === 'quiz' || gameState === 'angel') {
      const camDist = 10
      const offsetX = camDist * Math.sin(yaw) * Math.cos(pitch)
      const offsetY = camDist * Math.sin(pitch) + 4
      const offsetZ = camDist * Math.cos(yaw) * Math.cos(pitch)
      camera.position.set(
        player.x + offsetX,
        player.y + offsetY,
        player.z + offsetZ
      )
      _euler.set(pitch, yaw, 0, 'YXZ')
      camera.quaternion.setFromEuler(_euler)
      camera.updateMatrixWorld()
    }

    if (gameState === 'playing' || gameState === 'angel') {
      const moveSpeed = (keysRef.current.sprint ? 12 : 6) * dt
      _moveDir.set(0, 0, 0)
      if (keysRef.current.forward) _moveDir.z -= 1
      if (keysRef.current.backward) _moveDir.z += 1
      if (keysRef.current.left) _moveDir.x -= 1
      if (keysRef.current.right) _moveDir.x += 1

      if (_moveDir.lengthSq() > 0) {
        _moveDir.normalize()
        const cy = Math.cos(yaw)
        const sy = Math.sin(yaw)
        const mx = _moveDir.x * cy + _moveDir.z * sy
        const mz = -_moveDir.x * sy + _moveDir.z * cy
        player.x += mx * moveSpeed
        player.z += mz * moveSpeed
      }

      if (isAngelMode) {
        if (keysRef.current.flyUp) player.y += 8 * dt
        if (keysRef.current.flyDown) player.y -= 8 * dt
        velocityRef.current.set(0, 0, 0)
      } else {
        if (keysRef.current.jump && isGroundedRef.current) {
          velocityRef.current.y = 8
          isGroundedRef.current = false
          keysRef.current.jump = false
        }
        velocityRef.current.y -= 20 * dt
        player.y += velocityRef.current.y * dt
        if (player.y <= 1) {
          player.y = 1
          velocityRef.current.y = 0
          isGroundedRef.current = true
        }
      }
    }

    let nearest = null
    let minDist = 5
    dinoManager.dinosaurs.forEach((dino) => {
      if (!dino.isActive) return
      const dx = dino.position.x - player.x
      const dz = dino.position.z - player.z
      const dist = Math.sqrt(dx * dx + dz * dz)
      if (dist < minDist) {
        minDist = dist
        nearest = dino
      }
    })
    setNearbyDino(nearest)
  })

  return null
}
