export class QuizSystem {
    constructor() {
        this.currentQuiz = null;
        this.questionIndex = 0;
        this.questionsPerEncounter = 3;
        this.onCorrect = null;
        this.onComplete = null;
    }

    startQuiz(dino, callbacks) {
        this.currentDino = dino;
        this.quizzes = [...dino.quizzes];
        this.questionIndex = 0;
        this.correctCount = 0;
        this.onCorrect = callbacks.onCorrect || (() => {});
        this.onComplete = callbacks.onComplete || (() => {});
        
        return this.getCurrentQuestion();
    }

    getCurrentQuestion() {
        if (this.questionIndex >= this.quizzes.length) {
            return null;
        }
        return this.quizzes[this.questionIndex];
    }

    checkAnswer(answerIndex) {
        const quiz = this.quizzes[this.questionIndex];
        const isCorrect = answerIndex === quiz.c;
        
        if (isCorrect) {
            this.correctCount++;
            this.onCorrect();
        }
        
        this.questionIndex++;
        
        if (this.questionIndex >= this.quizzes.length) {
            const allCorrect = this.correctCount === this.quizzes.length;
            this.onComplete(allCorrect);
            return { done: true, correct: isCorrect, allCorrect };
        }
        
        return { done: false, correct: isCorrect, allCorrect: false };
    }

    reset() {
        this.currentQuiz = null;
        this.questionIndex = 0;
        this.correctCount = 0;
    }
}