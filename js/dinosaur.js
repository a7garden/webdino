export class DinosaurManager {
    constructor(scene) {
        this.scene = scene;
        this.dinosaurs = [];
        this.dinoTypes = ['velociraptor', 'stegasaurus', 'pachycephalasaurus'];
        this.spawnDinosaurs();
    }

    spawnDinosaurs() {
        const spawnPoints = [
            { x: 10, y: 0, z: -15 },
            { x: -20, y: 0, z: 10 },
            { x: 15, y: 0, z: 20 },
            { x: -25, y: 0, z: -20 },
            { x: 30, y: 0, z: -5 },
            { x: -10, y: 0, z: 30 },
            { x: 5, y: 0, z: -30 },
            { x: -30, y: 0, z: 15 },
            { x: 25, y: 0, z: 25 },
            { x: -15, y: 0, z: -10 }
        ];

        spawnPoints.forEach((pos, i) => {
            const type = this.dinoTypes[i % this.dinoTypes.length];
            const dino = {
                type: type,
                name: this.getDinoName(type, i),
                position: pos,
                quizzes: this.generateQuizzes(),
                isActive: true
            };
            this.dinosaurs.push(dino);
        });
    }

    getDinoName(type, index) {
        const names = {
            velociraptor: ['래피', '스위프트', '크리프트', '론'],
            stegasaurus: ['스테고', '플레이트', '소러스', '에코'],
            pachycephalasaurus: ['패키', '헤드', '본', '스매쉬']
        };
        const typeNames = names[type] || names.velociraptor;
        return typeNames[index % typeNames.length];
    }

    generateQuizzes() {
        const allQuizzes = [
            { q: '공룡은什么时候地球上出现?', a: ['2억 3천만 년 전', '6천 6백만 년 전', '1천만 년 전', '5억 년 전'], c: 0 },
            { q: '가장 큰 공룡은?', a: ['티라노사우루스', '아르entinasaurus', '브라키오사우루스', '밀로사우루스'], c: 1 },
            { q: '공룡은なんに分類されますか?', a: ['포유류', '파충류', '조류', '양서류'], c: 1 },
            { q: '티라노사우루스의食性は?', a: ['초식', ' 육식', '잡식', ' scavenging'], c: 1 },
            { q: '공룡의末裔は?', a: ['포유류', '조류', '파충류', '양서류'], c: 1 },
            { q: '三角恐竜の名前は?', a: ['티라노사우루스', '트리케라톱스', '스테고사우루스', '파키세팔로사우루스'], c: 1 },
            { q: '翼を持つ공룡は?', a: ['티라노사우루스', '브라키오사우루스', '프테라노돈', '스테고사우루스'], c: 2 },
            { q: '공룡の全種類は?', a: ['約500種', '約1000種', '約2000種', '約10000種'], c: 1 },
            { q: '最も 스마트한 공룡은?', a: ['티라노사우루스', '스트로보사우루스', '트리오벡스', '파키세팔로사우루스'], c: 2 },
            { q: '공룡の発見者是?', a: ['ダーウィン', 'マantia', 'アンティニ', 'ダーwin'], c: 2 }
        ];

        const shuffled = [...allQuizzes].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 3);
    }

    getDinosaurs() {
        return this.dinosaurs;
    }

    getDinoAtPosition(pos, threshold = 5) {
        return this.dinosaurs.find(d => {
            if (!d.isActive) return false;
            const dx = d.position.x - pos.x;
            const dz = d.position.z - pos.z;
            return Math.sqrt(dx * dx + dz * dz) < threshold;
        });
    }

    markDinoAsCaptured(dinoName) {
        const dino = this.dinosaurs.find(d => d.name === dinoName);
        if (dino) {
            dino.isActive = false;
        }
    }

    resetDinosaurs() {
        this.dinosaurs.forEach(d => d.isActive = true);
    }
}

export class DinosaurUI {
    constructor() {
        this.dialog = document.getElementById('quiz-dialog');
        this.nameEl = document.getElementById('dino-name');
        this.questionEl = document.getElementById('quiz-question');
        this.answersEl = document.getElementById('quiz-answers');
        this.feedbackEl = document.getElementById('quiz-feedback');
        
        this.onQuizComplete = null;
    }

    showDialog(dino) {
        this.nameEl.textContent = `🦖 ${dino.name}`;
        this.showQuestion(dino.quizzes[0]);
        this.dialog.classList.remove('hidden');
    }

    showQuestion(quiz) {
        this.questionEl.textContent = quiz.q;
        this.answersEl.innerHTML = '';
        
        quiz.a.forEach((answer, i) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-answer';
            btn.textContent = `${i + 1}. ${answer}`;
            btn.onclick = () => this.checkAnswer(i, quiz.c);
            this.answersEl.appendChild(btn);
        });
        
        this.feedbackEl.classList.add('hidden');
    }

    checkAnswer(selected, correct) {
        const isCorrect = selected === correct;
        
        this.feedbackEl.textContent = isCorrect ? '🎉 정답!' : '❌ 오답';
        this.feedbackEl.classList.remove('hidden');
        this.feedbackEl.style.color = isCorrect ? '#00ff00' : '#ff0000';
        
        const buttons = this.answersEl.querySelectorAll('button');
        buttons.forEach((btn, i) => {
            btn.disabled = true;
            if (i === correct) btn.style.background = '#00ff00';
            else if (i === selected) btn.style.background = '#ff0000';
        });

        setTimeout(() => {
            this.hideDialog();
            if (this.onQuizComplete) this.onQuizComplete(isCorrect);
        }, 1500);
    }

    hideDialog() {
        this.dialog.classList.add('hidden');
    }
}