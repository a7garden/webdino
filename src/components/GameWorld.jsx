import { useThree } from '@react-three/fiber'
import { useGame } from '../hooks/useGame'
import Player from './Player'
import Dinosaur from './Dinosaur'
import Ground from './Ground'
import Portal from './Portal'
import PlayerController from './PlayerController'

export default function GameWorld() {
  const camera = useThree(state => state.camera)
  const { player, isAngelMode, dinoManager, gameState } = useGame()

  if (gameState === 'start') return null

  return (
    <>
      <Ground station="land" />

      {dinoManager.dinosaurs.map((dino, i) => (
        <Dinosaur
          key={i}
          type={dino.type}
          position={dino.position}
        />
      ))}

      <Portal />

      <Player player={player} isAngelMode={isAngelMode} />

      <PlayerController camera={camera} />
    </>
  )
}
