export default function StartScreen({ onStart }) {
  return (
    <div id="start-screen">
      <div className="start-content">
        <h1>🦕 Dino Quiz Adventure 🦖</h1>
        <p>공룡 퀴즈를 풀고 아이템을 모으자!</p>
        <button id="start-button" onClick={onStart}>게임 시작</button>
        <div className="game-info">
          <h3>게임 방법</h3>
          <ul>
            <li>WASD로 이동, 마우스로 시점 전환</li>
            <li>공룡에게 가까이 가고 [E]키를 누르세요</li>
            <li>퀴즈를 맞추면 아이템을 얻습니다</li>
            <li>아이템 10개 → 합성 → 레어 아이템</li>
            <li>레어 5개 → 포탈 아이템</li>
            <li>포탈 3개 → 천사 변신!</li>
          </ul>
        </div>
      </div>
    </div>
  )
}