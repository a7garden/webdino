import { useGame } from '../hooks/useGame'

export default function HUD() {
  const { inventoryCounts } = useGame()

  return (
    <div id="hud">
      <div className="hud-item">🦖 공룡: {inventoryCounts.items}/10</div>
      <div className="hud-item">⭐ 레어: {inventoryCounts.rare}/5</div>
      <div className="hud-item">🔮 포탈: {inventoryCounts.portal}/3</div>
    </div>
  )
}