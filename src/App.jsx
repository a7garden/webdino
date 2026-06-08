import { useEffect } from 'react'
import { useGame } from './hooks/useGame'
import GameCanvas from './components/GameCanvas'
import HUD from './components/HUD'
import Crosshair, { InteractionPrompt } from './components/UI'
import QuizDialog from './components/QuizDialog'
import InventoryPanel from './components/Panels'
import { PortalPanel } from './components/Panels'
import StartScreen from './components/StartScreen'
import WinScreen, { AngelScreen } from './components/OverlayScreens'
import ControlsHelp from './components/ControlsHelp'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  const {
    gameState,
    showQuiz,
    selectedDino,
    showInventory,
    showPortal,
    showAngelScreen,
    showWinScreen,
    startGame,
    restart,
    setShowInventory,
    setShowPortal,
    eulerRef,
    nearbyDino
  } = useGame()

  console.log('[App] render, gameState:', gameState)

  useEffect(() => {
    if (gameState !== 'playing' && gameState !== 'quiz' && gameState !== 'angel') return

    const lookSpeed = 0.002

    const handleMouseMove = (e) => {
      if (document.pointerLockElement) {
        eulerRef.current.y -= e.movementX * lookSpeed
        eulerRef.current.x -= e.movementY * lookSpeed
        eulerRef.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, eulerRef.current.x))
      }
    }

    const handleClick = () => {
      document.body.requestPointerLock()
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('click', handleClick)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('click', handleClick)
    }
  }, [gameState, eulerRef])

  return (
    <ErrorBoundary>
      <>
        {gameState === 'start' && <StartScreen onStart={startGame} />}

        <GameCanvas />

        {gameState !== 'start' && (
          <>
            <HUD />
            <Crosshair />
            <InteractionPrompt show={gameState === 'playing' && !!nearbyDino} />

            {showQuiz && selectedDino && (
              <QuizDialog
                dino={selectedDino}
                onClose={() => setShowQuiz(false)}
              />
            )}

            {showInventory && <InventoryPanel onClose={() => setShowInventory(false)} />}
            {showPortal && <PortalPanel onClose={() => setShowPortal(false)} onSelectStation={() => {}} />}

            <AngelScreen show={showAngelScreen} />
            <WinScreen onRestart={restart} show={showWinScreen} />

            <ControlsHelp />
          </>
        )}
      </>
    </ErrorBoundary>
  )
}

export default App
