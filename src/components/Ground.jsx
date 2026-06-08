import { useMemo } from 'react'
import * as THREE from 'three'

export default function Ground({ station = 'land' }) {
  const color = station === 'water' ? 0x006994 : station === 'sky' ? 0x87CEEB : 0x3A5F0B

  const trees = useMemo(() => {
    const list = []
    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 2
      const radius = 15 + (i % 5) * 8
      list.push({
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        scale: 0.8 + (i % 3) * 0.2
      })
    }
    return list
  }, [])

  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color={color} roughness={1.0} side={THREE.DoubleSide} />
      </mesh>

      {trees.map((tree, i) => (
        <group key={i} position={[tree.x, 0, tree.z]} scale={[tree.scale, tree.scale, tree.scale]}>
          <mesh castShadow position={[0, 2, 0]}>
            <cylinderGeometry args={[0.3, 0.5, 4, 8]} />
            <meshStandardMaterial color={0x4A3728} />
          </mesh>
          <mesh castShadow position={[0, 4.5, 0]}>
            <coneGeometry args={[1.8, 3.5, 8]} />
            <meshStandardMaterial color={0x228B22} />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.5, 3.5, 32]} />
        <meshBasicMaterial color={0xffd700} side={THREE.DoubleSide} transparent opacity={0.7} />
      </mesh>
    </group>
  )
}
