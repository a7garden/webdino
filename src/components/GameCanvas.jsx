import { Canvas } from '@react-three/fiber'
import { ACESFilmicToneMapping, SRGBColorSpace } from 'three'
import GameWorld from './GameWorld'

export default function GameCanvas() {
  return (
    <div id="game-container" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [0, 5, 12], fov: 70, near: 0.1, far: 1000 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        onCreated={({ gl, camera }) => {
          gl.setClearColor(0x87CEEB, 1)
          gl.outputColorSpace = SRGBColorSpace
          gl.toneMapping = ACESFilmicToneMapping
          gl.toneMappingExposure = 1.0
          console.log('[Canvas] created. Camera at:', camera.position.toArray())
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={1.5} />
        <hemisphereLight args={[0xffffff, 0x444444, 0.6]} />
        <directionalLight
          position={[30, 50, 30]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[-30, 30, -30]} intensity={0.5} />

        <GameWorld />
      </Canvas>
    </div>
  )
}
