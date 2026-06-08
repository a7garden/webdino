import { useGame } from '../hooks/useGame'

export default function InventoryPanel({ onClose }) {
  return (
    <div id="inventory-panel">
      <div className="inventory-header">
        <h2>인벤토리</h2>
        <button onClick={onClose}>[X]</button>
      </div>
      <div className="inventory-info">
        <p>아이템 10개 → 합성 → 레어 아이템</p>
        <p>레어 5개 → 포탈 아이템</p>
      </div>
    </div>
  )
}

export function PortalPanel({ onClose, onSelectStation }) {
  return (
    <div id="portal-panel">
      <div className="portal-header">
        <h2>스테이션 이동</h2>
        <button onClick={onClose}>[X]</button>
      </div>
      <div className="portal-buttons">
        <button className="portal-btn" data-station="land" onClick={() => onSelectStation('land')}>🌍 땅 스테이션</button>
        <button className="portal-btn" data-station="water" onClick={() => onSelectStation('water')}>🌊 물속 스테이션</button>
        <button className="portal-btn" data-station="sky" onClick={() => onSelectStation('sky')}>☁️ 하늘 스테이션</button>
      </div>
      <div className="portal-info">레어 아이템 5개 필요</div>
    </div>
  )
}