export default function WinScreen({ onRestart }) {
  return (
    <div id="win-screen" className="hidden">
      <div className="win-content">
        <h1>🎉 축하합니다! 🎉</h1>
        <div className="angel-wings-large">🪽</div>
        <p>천사 케릭터로 변신했습니다!</p>
        <button id="restart-button" onClick={onRestart}>다시 시작</button>
      </div>
    </div>
  )
}

export function AngelScreen({ show }) {
  return (
    <div id="angel-screen" className={show ? '' : 'hidden'}>
      <div className="angel-content">
        <div className="angel-wings">🪽</div>
        <div className="angel-halo">👼</div>
        <h1>천사 변신!</h1>
        <p>모든 스테이션을 자유롭게 이동!</p>
      </div>
    </div>
  )
}

export function StationTransition({ show, stationName }) {
  return (
    <div id="station-transition" className={show ? '' : 'hidden'}>
      <div className="transition-content">
        <h1 id="transition-name">{stationName}</h1>
        <p>이동 중...</p>
      </div>
    </div>
  )
}

export function VideoPlaceholder({ show, onClose }) {
  if (!show) return null
  return (
    <div id="video-placeholder" onClick={onClose}>
      <div className="video-content" id="video-content">
        <div className="glow-orb"></div>
        <h2>레어 아이템 동영상</h2>
        <p>(클릭하여 닫기)</p>
      </div>
    </div>
  )
}