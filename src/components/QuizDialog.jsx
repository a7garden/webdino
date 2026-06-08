import { useGame } from '../hooks/useGame'
import { useState } from 'react'

export default function QuizDialog({ dino, onClose }) {
  const { handleQuizAnswer } = useGame()
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0)
  const [showFeedback, setShowFeedback] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [isCorrect, setIsCorrect] = useState(false)

  if (!dino) return null

  const currentQuiz = dino.quizzes[currentQuizIndex]

  const handleAnswer = (index) => {
    const correct = index === currentQuiz.c
    setSelectedAnswer(index)
    setIsCorrect(correct)
    setShowFeedback(true)

    setTimeout(() => {
      if (currentQuizIndex < dino.quizzes.length - 1) {
        setCurrentQuizIndex(prev => prev + 1)
        setShowFeedback(false)
        setSelectedAnswer(null)
      } else {
        handleQuizAnswer(correct)
        onClose()
      }
    }, 1500)
  }

  return (
    <div id="quiz-dialog">
      <div className="quiz-header">
        <span>🦖 {dino.name}</span>
      </div>
      <div className="quiz-question">{currentQuiz.q}</div>
      <div className="quiz-answers">
        {currentQuiz.a.map((answer, i) => (
          <button
            key={i}
            className="quiz-answer"
            onClick={() => handleAnswer(i)}
            disabled={showFeedback}
            style={{
              background: showFeedback
                ? i === currentQuiz.c
                  ? '#00ff00'
                  : i === selectedAnswer
                    ? '#ff0000'
                    : undefined
                : undefined
            }}
          >
            {i + 1}. {answer}
          </button>
        ))}
      </div>
      <div className={`quiz-feedback ${showFeedback ? '' : 'hidden'}`} style={{ color: isCorrect ? '#00ff00' : '#ff0000' }}>
        {showFeedback && (isCorrect ? '🎉 정답!' : '❌ 오답')}
      </div>
    </div>
  )
}