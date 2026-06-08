# Dino Quiz Adventure - Agent Documentation

## Project Overview

Dino Quiz Adventure is a 3D quiz game where players interact with dinosaurs, answer quiz questions to collect items, synthesize rare items, and ultimately transform into an angel.

## Tech Stack

- **Framework**: React 18 + Vite
- **3D Engine**: Three.js via @react-three/fiber and @react-three/drei
- **State Management**: React hooks (useState, useRef, useCallback, useEffect)

## Project Structure

```
src/
├── components/          # React UI components
│   ├── GameCanvas.jsx   # R3F Canvas wrapper
│   ├── Player.jsx        # Player 3D character
│   ├── Dinosaur.jsx      # 3D dinosaur with fallback
│   ├── Ground.jsx        # Ground plane + trees
│   ├── Portal.jsx        # Station teleport portals
│   ├── HUD.jsx          # Game HUD overlay
│   ├── UI.jsx           # Crosshair, InteractionPrompt
│   ├── QuizDialog.jsx   # Quiz question UI
│   ├── Panels.jsx        # Inventory & Portal panels
│   ├── StartScreen.jsx  # Start screen
│   ├── OverlayScreens.jsx # Angel/Win/Transition screens
│   └── ControlsHelp.jsx # Controls help bar
├── hooks/
│   └── useGame.js       # Main game state & logic
├── App.jsx              # Main app component
├── main.jsx             # Entry point
└── index.css            # Global styles
```

## Game Architecture

### State Flow

```
start → playing → quiz → playing → angel → win
         ↑___________|                  |
         └──────────────────────────────┘ (restart)
```

### Key State Variables (useGame hook)

| Variable | Type | Purpose |
|----------|------|---------|
| `gameState` | string | Current state: 'start', 'playing', 'quiz', 'angel', 'win' |
| `isAngelMode` | boolean | Whether player has angel transformation |
| `inventoryCounts` | object | { items, rare, portal } counts |
| `nearbyDino` | object | Dinosaur player is close to |
| `showQuiz` | boolean | Show quiz dialog |
| `showInventory` | boolean | Show inventory panel |
| `showPortal` | boolean | Show portal panel |

### Item Synthesis

```
items: 0/10 → (10 items) → rare: 0/5
rare: 0/5 → (5 rare) → portal: 0/3
portal: 0/3 → (3 portals) → angel transformation (WIN)
```

## Components

### GameCanvas.jsx
- R3F Canvas wrapper with lights and scene
- Sets up camera, renderer, and lighting

### Player.jsx
- 3D player character with body parts
- Angel wings and halo when `isAngelMode` true
- Wing animation via useFrame

### Dinosaur.jsx
- 3D dinosaur with FBX model loading
- Fallback geometry if model fails
- Wandering AI behavior

### Ground.jsx
- Ground plane with station-based coloring
- Procedurally generated trees

### Portal.jsx
- 3 teleport portals for stations
- Rotating torus animation

### QuizDialog.jsx
- Modal quiz interface
- Answer buttons with feedback
- Handles quiz progression

## Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Controls

| Key | Action |
|-----|--------|
| WASD | Move |
| Mouse | Look around |
| E | Interact with dinosaur |
| I | Toggle inventory |
| P | Toggle portal panel |
| ESC | Close dialogs |
| Space | Jump (or fly if angel) |
| Shift | Sprint |

## Assets

```
assets/
├── models/           # FBX dinosaur models
│   ├── Raptor_Animated_FBX.fbx
│   ├── Stegasaurus_20K.fbx
│   └── Pachycephalasaurus_24K.fbx
├── textures/         # Model textures
└── images/           # Image assets
```

## Notes

- Assets in `assets/` folder are served from public directory
- Dino quiz data is randomly shuffled from pool of 10 questions
- Player starts at position (0, 1, 0) facing forward
- 10 dinosaurs spawn at predefined positions with random type assignment