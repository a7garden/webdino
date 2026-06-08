import { useGame } from '../hooks/useGame'

export default function Crosshair() {
  return <div id="crosshair">+</div>
}

export function InteractionPrompt({ show, text = '[E] 공룡과 대화하기' }) {
  return (
    <div id="interaction-prompt" className={show ? '' : 'hidden'}>
      <span>{text}</span>
    </div>
  )
}