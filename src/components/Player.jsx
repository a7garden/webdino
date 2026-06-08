import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Player({ player, isAngelMode }) {
  const groupRef = useRef()
  const leftWingRef = useRef()
  const rightWingRef = useRef()
  const haloRef = useRef()

  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.position.copy(player)

    if (isAngelMode) {
      const time = Date.now() * 0.002
      if (leftWingRef.current) leftWingRef.current.rotation.z = Math.sin(time) * 0.3
      if (rightWingRef.current) rightWingRef.current.rotation.z = -Math.sin(time) * 0.3
      if (haloRef.current) haloRef.current.position.y = 2.6 + Math.sin(time * 2) * 0.05
    }
  })

  return (
    <group ref={groupRef} name="Player">
      <mesh castShadow position={[0, 1.2, 0]}>
        <capsuleGeometry args={[0.4, 1.2, 8, 16]} />
        <meshStandardMaterial
          color={isAngelMode ? 0x444488 : 0x4488ff}
          roughness={0.7}
          emissive={isAngelMode ? 0x444400 : 0x000000}
          emissiveIntensity={isAngelMode ? 0.3 : 0}
        />
      </mesh>
      <mesh position={[0, 2.1, 0]} castShadow>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color={0xffcc99} roughness={0.8} />
      </mesh>
      <mesh position={[-0.1, 2.15, 0.25]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color={0x000000} />
      </mesh>
      <mesh position={[0.1, 2.15, 0.25]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color={0x000000} />
      </mesh>
      <mesh castShadow position={[-0.6, 1.4, 0]}>
        <capsuleGeometry args={[0.1, 0.6, 4, 8]} />
        <meshStandardMaterial color={0x4488ff} roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0.6, 1.4, 0]}>
        <capsuleGeometry args={[0.1, 0.6, 4, 8]} />
        <meshStandardMaterial color={0x4488ff} roughness={0.7} />
      </mesh>
      <mesh castShadow position={[-0.2, 0.4, 0]}>
        <capsuleGeometry args={[0.12, 0.7, 4, 8]} />
        <meshStandardMaterial color={0x334466} roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0.2, 0.4, 0]}>
        <capsuleGeometry args={[0.12, 0.7, 4, 8]} />
        <meshStandardMaterial color={0x334466} roughness={0.7} />
      </mesh>
      {isAngelMode && (
        <>
          <mesh ref={leftWingRef} position={[-1, 2.2, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[2, 1]} />
            <meshStandardMaterial color={0xffffff} side={THREE.DoubleSide} transparent opacity={0.9} />
          </mesh>
          <mesh ref={rightWingRef} position={[1, 2.2, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[2, 1]} />
            <meshStandardMaterial color={0xffffff} side={THREE.DoubleSide} transparent opacity={0.9} />
          </mesh>
          <mesh ref={haloRef} position={[0, 2.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.4, 0.05, 8, 32]} />
            <meshBasicMaterial color={0xffd700} transparent opacity={0.8} />
          </mesh>
        </>
      )}
    </group>
  )
}