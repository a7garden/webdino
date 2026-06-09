/**
 * WebDino - Main App
 * 
 * Architecture:
 *   MapLoader (GLB → classifyScene → NavMesh)
 *   EntityBase (GLB → calibrate + animations + ground positioning)
 *   Horse → EntityBase + AI movement
 */

import { useState, useEffect, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Environment, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

import { NavMesh } from './systems/NavMesh'
import { classifyScene } from './systems/MapLoader'
import { Horse } from './entities/Horse'

// ============================================================
// MAP COMPONENT - loads GLB, classifies, feeds NavMesh
// ============================================================

function Map({ mapPath, onReady }) {
  const { scene } = useGLTF(mapPath)
  
  useEffect(() => {
    if (scene) {
      const classified = classifyScene(scene)
      onReady(classified)
    }
  }, [scene, mapPath, onReady])
  
  return <primitive object={scene} />
}

// ============================================================
// WORLD - orchestrates map + entities
// ============================================================

function World() {
  const [mapData, setMapData] = useState(null)
  const navMesh = useMemo(() => new NavMesh(), [])
  
  // Feed classified meshes into NavMesh when map loads
  useEffect(() => {
    if (mapData) {
      navMesh.build(mapData)
      console.log('[World] NavMesh built')
    }
  }, [mapData, navMesh])
  
  const ready = mapData && mapData.grounds.length > 0
  
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[50, 80, 30]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={200}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      <hemisphereLight args={['#87ceeb', '#3a5f0b', 0.4]} />
      
      {/* Map */}
      <Map mapPath="./assets/Map.glb" onReady={setMapData} />
      
      {/* Entities (only when navmesh is ready) */}
      {ready && <Horse navMesh={navMesh} />}
      
      {/* Environment */}
      <Environment preset="forest" />
    </>
  )
}

// ============================================================
// SCENE WRAPPER (camera + controls)
// ============================================================

function Scene() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[15, 15, 20]} fov={55} />
      <OrbitControls enableDamping dampingFactor={0.05} />
      <World />
    </>
  )
}

// ============================================================
// APP ROOT
// ============================================================

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1a1a1a' }}>
      <Canvas shadows camera={{ position: [15, 15, 20], fov: 55 }}>
        <Scene />
      </Canvas>
    </div>
  )
}

export default App
