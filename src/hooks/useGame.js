import { useState, useEffect } from 'react'
import * as THREE from 'three'

const dinoTypes = ['velociraptor', 'stegasaurus', 'pachycephalasaurus']

const dinoNames = {
  velociraptor: ['래피', '스위프트', '크리프트', '론'],
  stegasaurus: ['스테고', '플레이트', '소러스', '에코'],
  pachycephalasaurus: ['패키', '헤드', '본', '스매쉬']
}

const allQuizzes = [
  { q: '공룡은 언제 地球에 나타났나요?', a: ['2억 3천만 년 전', '6천 6백만 년 전', '1천만 년 전', '5억 년 전'], c: 0 },
  { q: '가장 큰 공룡은?', a: ['티라노사우루스', '아르젠티노사우루스', '브라키오사우루스', '밀로사우루스'], c: 1 },
  { q: '공룡의 분류는?', a: ['포유류', '파충류', '조류', '양서류'], c: 1 },
  { q: '티라노사우루스의 식성은?', a: ['초식', '육식', '잡식', '청소'], c: 1 },
  { q: '공룡의 마지막 후손은?', a: ['포유류', '조류', '파충류', '양서류'], c: 1 },
  { q: '세 개의 뿔이 있는 공룡은?', a: ['티라노사우루스', '트리케라톱스', '스테고사우루스', '파키세팔로사우루스'], c: 1 },
  { q: '날개가 있는 공룡은?', a: ['티라노사우루스', '브라키오사우루스', '프테라노돈', '스테고사우루스'], c: 2 },
  { q: '공룡의 종류는 약 몇 종?', a: ['약 500종', '약 1000종', '약 2000종', '약 10000종'], c: 1 },
  { q: '가장 똑똑한 공룡은?', a: ['티라노사우루스', '스트로보사우루스', '트리오벡스', '파키세팔로사우루스'], c: 2 },
  { q: '공룡의 조상은?', a: ['조류', '파충류', '양서류', '포유류'], c: 1 }
]

const spawnPoints = [
  { x: 10, y: 0, z: -15 }, { x: -20, y: 0, z: 10 }, { x: 15, y: 0, z: 20 },
  { x: -25, y: 0, z: -20 }, { x: 30, y: 0, z: -5 }, { x: -10, y: 0, z: 30 },
  { x: 5, y: 0, z: -30 }, { x: -30, y: 0, z: 15 }, { x: 25, y: 0, z: 25 }, { x: -15, y: 0, z: -10 }
]

function generateQuizzes() {
  return [...allQuizzes].sort(() => Math.random() - 0.5).slice(0, 3)
}

const player = new THREE.Vector3(0, 1, 0)
const dinoManager = {
  dinosaurs: spawnPoints.map((pos, i) => {
    const type = dinoTypes[i % dinoTypes.length]
    return {
      type,
      name: dinoNames[type][i % 4],
      position: pos,
      quizzes: generateQuizzes(),
      isActive: true
    }
  })
}
const inventory = { items: [], rareItems: [], portalItems: [] }
const eulerRef = { current: { x: 0, y: 0 } }
const velocityRef = { current: new THREE.Vector3() }
const isGroundedRef = { current: true }
const keysRef = {
  current: {
    forward: false, backward: false, left: false, right: false,
    jump: false, sprint: false, flyUp: false, flyDown: false
  }
}

const state = {
  gameState: 'start',
  isAngelMode: false,
  inventoryCounts: { items: 0, rare: 0, portal: 0 },
  nearbyDino: null,
  showQuiz: false,
  selectedDino: null,
  showInventory: false,
  showPortal: false,
  showAngelScreen: false,
  showWinScreen: false
}

const listeners = new Set()

function notify() {
  listeners.forEach(fn => fn())
}

const startGame = () => {
  state.gameState = 'playing'
  player.set(0, 1, 0)
  eulerRef.current.x = 0
  eulerRef.current.y = 0
  velocityRef.current.set(0, 0, 0)
  isGroundedRef.current = true
  state.nearbyDino = null
  notify()
}

const restart = () => {
  inventory.items = []
  inventory.rareItems = []
  inventory.portalItems = []
  state.inventoryCounts = { items: 0, rare: 0, portal: 0 }
  state.isAngelMode = false
  state.showWinScreen = false
  dinoManager.dinosaurs.forEach(d => d.isActive = true)
  player.set(0, 1, 0)
  eulerRef.current.x = 0
  eulerRef.current.y = 0
  state.gameState = 'playing'
  notify()
}

const handleQuizAnswer = (isCorrect) => {
  if (isCorrect) {
    inventory.items.push({ type: 'dino', id: Date.now(), icon: '🦖' })
    state.inventoryCounts = { ...state.inventoryCounts, items: inventory.items.length }

    if (inventory.items.length >= 10) {
      inventory.items = []
      const rare = { type: 'rare', id: Date.now(), icon: ['⭐', '💎', '🌟', '✨', '🔮'][Math.floor(Math.random() * 5)] }
      inventory.rareItems.push(rare)
      state.inventoryCounts = { ...state.inventoryCounts, items: 0, rare: inventory.rareItems.length }

      if (inventory.rareItems.length >= 5) {
        inventory.rareItems = []
        const stations = ['land', 'water', 'sky']
        const existing = inventory.portalItems.map(p => p.station)
        const available = stations.filter(s => !existing.includes(s))
        if (available.length > 0) {
          const station = available[0]
          inventory.portalItems.push({ type: 'portal', station, id: Date.now(), icon: { land: '🌍', water: '🌊', sky: '☁️' }[station] })
          state.inventoryCounts = { ...state.inventoryCounts, rare: 0, portal: inventory.portalItems.length }
        } else {
          state.isAngelMode = true
          state.showAngelScreen = true
          setTimeout(() => {
            state.showAngelScreen = false
            state.showWinScreen = true
            notify()
          }, 3500)
          state.gameState = 'angel'
        }
      }
    }
  }
  state.showQuiz = false
  state.selectedDino = null
  state.gameState = 'playing'
  notify()
}

const tryInteractWithDino = () => {
  if (state.gameState !== 'playing') return

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

  if (nearest) {
    state.selectedDino = nearest
    state.showQuiz = true
    state.gameState = 'quiz'
    notify()
  }
}

const teleportToStation = (station) => {
  if (inventory.portalItems.length < 3 && !state.isAngelMode) {
    return
  }
  state.showPortal = false
  notify()
}

export function setNearbyDino(dino) {
  if (state.nearbyDino !== dino) {
    state.nearbyDino = dino
    notify()
  }
}

const setShowInventory = (v) => {
  state.showInventory = typeof v === 'function' ? v(state.showInventory) : v
  notify()
}
const setShowPortal = (v) => {
  state.showPortal = typeof v === 'function' ? v(state.showPortal) : v
  notify()
}
const setShowQuiz = (v) => {
  state.showQuiz = typeof v === 'function' ? v(state.showQuiz) : v
  notify()
}

let keyListenersAttached = false
function attachKeyListeners() {
  if (keyListenersAttached) return
  keyListenersAttached = true

  const handleKeyDown = (e) => {
    switch (e.code) {
      case 'KeyW': case 'ArrowUp': keysRef.current.forward = true; break
      case 'KeyS': case 'ArrowDown': keysRef.current.backward = true; break
      case 'KeyA': case 'ArrowLeft': keysRef.current.left = true; break
      case 'KeyD': case 'ArrowRight': keysRef.current.right = true; break
      case 'Space': state.isAngelMode ? keysRef.current.flyUp = true : keysRef.current.jump = true; break
      case 'ShiftLeft': keysRef.current.sprint = true; break
      case 'ControlLeft': if (state.isAngelMode) keysRef.current.flyDown = true; break
      case 'KeyE': if (state.gameState === 'playing') tryInteractWithDino(); break
      case 'KeyI': setShowInventory(!state.showInventory); break
      case 'KeyP': setShowPortal(!state.showPortal); break
      case 'Escape':
        if (state.showQuiz) {
          state.showQuiz = false
          state.selectedDino = null
          state.gameState = 'playing'
          notify()
        }
        break
    }
  }

  const handleKeyUp = (e) => {
    switch (e.code) {
      case 'KeyW': case 'ArrowUp': keysRef.current.forward = false; break
      case 'KeyS': case 'ArrowDown': keysRef.current.backward = false; break
      case 'KeyA': case 'ArrowLeft': keysRef.current.left = false; break
      case 'KeyD': case 'ArrowRight': keysRef.current.right = false; break
      case 'Space': keysRef.current.flyUp = false; keysRef.current.jump = false; break
      case 'ShiftLeft': keysRef.current.sprint = false; break
      case 'ControlLeft': keysRef.current.flyDown = false; break
    }
  }

  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)
}

export function useGame() {
  const [, setVersion] = useState(0)

  useEffect(() => {
    attachKeyListeners()
    const fn = () => setVersion(v => v + 1)
    listeners.add(fn)
    return () => {
      listeners.delete(fn)
    }
  }, [])

  return {
    gameState: state.gameState,
    isAngelMode: state.isAngelMode,
    inventoryCounts: state.inventoryCounts,
    nearbyDino: state.nearbyDino,
    showQuiz: state.showQuiz,
    selectedDino: state.selectedDino,
    showInventory: state.showInventory,
    showPortal: state.showPortal,
    showAngelScreen: state.showAngelScreen,
    showWinScreen: state.showWinScreen,
    player,
    dinoManager,
    eulerRef,
    velocityRef,
    keysRef,
    isGroundedRef,
    startGame,
    restart,
    handleQuizAnswer,
    tryInteractWithDino,
    teleportToStation,
    setShowInventory,
    setShowPortal,
    setShowQuiz
  }
}
