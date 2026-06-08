import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const portalData = [
  { station: 'land', position: { x: 0, y: 2, z: -40 }, color: 0x8B4513 },
  { station: 'water', position: { x: 40, y: 2, z: 0 }, color: 0x006994 },
  { station: 'sky', position: { x: -40, y: 2, z: 0 }, color: 0x87CEEB }
]

export default function Portal({ portals }) {
  const torusRefs = useRef([])

  useFrame((state) => {
    torusRefs.current.forEach((torus, i) => {
      if (torus) {
        torus.rotation.z = state.clock.elapsedTime * 0.5 + i * 2
      }
    })
  })

  return (
    <group>
      {portalData.map((p, i) => (
        <group key={p.station} position={[p.position.x, p.position.y, p.position.z]}>
          <mesh ref={el => torusRefs.current[i] = el} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[2.5, 0.4, 16, 32]} />
            <meshStandardMaterial
              color={p.color}
              emissive={p.color}
              emissiveIntensity={0.6}
              transparent
              opacity={0.9}
            />
          </mesh>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <circleGeometry args={[2.3, 32]} />
            <meshBasicMaterial color={0x000000} side={THREE.DoubleSide} transparent opacity={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  )
}