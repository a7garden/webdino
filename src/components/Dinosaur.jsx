import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const colors = {
  velociraptor: 0x228B22,
  stegasaurus: 0x4A4A4A,
  pachycephalasaurus: 0x8B4513
}

export default function Dinosaur({ type, position }) {
  const groupRef = useRef()

  const moveTimerRef = useRef(0)
  const moveIntervalRef = useRef(2 + Math.random() * 3)
  const targetXRef = useRef(position.x)
  const targetZRef = useRef(position.z)
  const moveSpeedRef = useRef(0.5 + Math.random() * 0.5)
  const wanderRangeRef = useRef(3 + Math.random() * 2)
  const breatheOffsetRef = useRef(Math.random() * Math.PI * 2)

  useFrame((_, delta) => {
    if (!groupRef.current) return

    moveTimerRef.current += delta
    if (moveTimerRef.current >= moveIntervalRef.current) {
      moveTimerRef.current = 0
      moveIntervalRef.current = 2 + Math.random() * 3
      targetXRef.current = groupRef.current.position.x + (Math.random() - 0.5) * wanderRangeRef.current
      targetZRef.current = groupRef.current.position.z + (Math.random() - 0.5) * wanderRangeRef.current
    }

    const dx = targetXRef.current - groupRef.current.position.x
    const dz = targetZRef.current - groupRef.current.position.z
    const dist = Math.sqrt(dx * dx + dz * dz)

    if (dist > 0.1) {
      groupRef.current.position.x += (dx / dist) * moveSpeedRef.current * delta
      groupRef.current.position.z += (dz / dist) * moveSpeedRef.current * delta
      const targetRotY = Math.atan2(dx, dz)
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.05)
    }

    groupRef.current.position.y = position.y + Math.sin(Date.now() * 0.002 + breatheOffsetRef.current) * 0.05
  })

  return (
    <group ref={groupRef} position={[position.x, position.y, position.z]}>
      <FallbackModel type={type} />
    </group>
  )
}

function FallbackModel({ type }) {
  const color = colors[type] || 0x888888

  return (
    <group>
      <mesh castShadow rotation={[0, 0, Math.PI / 2]} position={[0, 1.2, 0]}>
        <capsuleGeometry args={[0.5, 1.5, 8, 16]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh castShadow position={[1.2, 1.5, 0]}>
        <boxGeometry args={[0.8, 0.6, 0.6]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh position={[1.5, 1.6, 0.3]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color={0xff0000} />
      </mesh>
      <mesh position={[1.5, 1.6, -0.3]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color={0xff0000} />
      </mesh>
      <mesh castShadow rotation={[0, 0, -Math.PI / 2]} position={[-1.5, 1.2, 0]}>
        <coneGeometry args={[0.3, 2.5, 8]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {[[0.4, 0.4, 0.3], [0.4, 0.4, -0.3], [-0.5, 0.4, 0.3], [-0.5, 0.4, -0.3]].map((pos, i) => (
        <mesh key={i} castShadow position={pos}>
          <capsuleGeometry args={[0.12, 0.6, 4, 8]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}
