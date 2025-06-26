<template>
  <div class="practice-quizzes">
    <!-- Header Section -->
    <div class="page-header">
      <h1 class="page-title">Practice & Quizzes</h1>
      <p class="page-subtitle">Test your knowledge and improve your skills</p>
    </div>

    <!-- Statistics Cards -->
    <div class="stats-container">
      <div class="stat-card">
        <div class="stat-icon">🎯</div>
        <div class="stat-info">
          <h3>{{ totalQuizzesTaken }}</h3>
          <p>Quizzes Taken</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⭐</div>
        <div class="stat-info">
          <h3>{{ averageScore }}%</h3>
          <p>Average Score</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🏆</div>
        <div class="stat-info">
          <h3>{{ streak }}</h3>
          <p>Current Streak</p>
        </div>
      </div>
    </div>

    <!-- Quiz Categories -->
    <div class="quiz-categories">
      <h2 class="section-title">Choose Your Challenge</h2>
      <div class="categories-grid">
        <div 
          v-for="category in quizCategories" 
          :key="category.id"
          class="category-card"
          @click="selectCategory(category)"
        >
          <div class="category-icon">{{ category.icon }}</div>
          <h3 class="category-title">{{ category.name }}</h3>
          <p class="category-description">{{ category.description }}</p>
          <div class="category-stats">
            <span class="quiz-count">{{ category.quizCount }} quizzes</span>
            <span class="difficulty" :class="category.difficulty.toLowerCase()">
              {{ category.difficulty }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Practice Mode -->
    <div class="practice-mode" v-if="selectedCategory && !quizStarted">
      <h2 class="section-title">{{ selectedCategory.name }} - Practice Mode</h2>
      <div class="practice-options">
        <div class="mode-selector">
          <label>Select Practice Mode:</label>
          <select v-model="selectedMode" class="mode-select">
            <option value="quick">Quick Practice (5 questions)</option>
            <option value="standard">Standard Quiz (10 questions)</option>
            <option value="comprehensive">Comprehensive Test (20 questions)</option>
          </select>
        </div>
        <div class="difficulty-selector">
          <label>Difficulty Level:</label>
          <div class="difficulty-buttons">
            <button 
              v-for="level in difficultyLevels" 
              :key="level"
              @click="selectedDifficulty = level"
              :class="['difficulty-btn', level.toLowerCase(), { active: selectedDifficulty === level }]"
            >
              {{ level }}
            </button>
          </div>
        </div>
        <button @click="startQuiz" class="start-quiz-btn">
          Start Quiz 🚀
        </button>
      </div>
    </div>

    <!-- Quiz Interface -->
    <div class="quiz-interface" v-if="quizStarted">
      <div class="quiz-header">
        <div class="quiz-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
          </div>
          <span class="progress-text">{{ currentQuestionIndex + 1 }} / {{ totalQuestions }}</span>
        </div>
        <div class="quiz-timer" v-if="timeRemaining > 0">
          <span class="timer-icon">⏱️</span>
          <span class="timer-text">{{ formatTime(timeRemaining) }}</span>
        </div>
      </div>

      <div class="question-container">
        <h3 class="question-title">{{ currentQuestion.question }}</h3>
        <div class="answers-container">
          <div 
            v-for="(answer, index) in currentQuestion.answers" 
            :key="index"
            class="answer-option"
            :class="{ 
              selected: selectedAnswer === index,
              correct: showResult && index === currentQuestion.correctAnswer,
              incorrect: showResult && selectedAnswer === index && index !== currentQuestion.correctAnswer
            }"
            @click="selectAnswer(index)"
          >
            <span class="answer-letter">{{ String.fromCharCode(65 + index) }}</span>
            <span class="answer-text">{{ answer }}</span>
          </div>
        </div>

        <div class="question-actions">
          <button 
            @click="submitAnswer" 
            :disabled="selectedAnswer === null || showResult"
            class="submit-btn"
          >
            {{ showResult ? 'Next Question' : 'Submit Answer' }}
          </button>
          <button @click="skipQuestion" class="skip-btn" v-if="!showResult">
            Skip Question
          </button>
        </div>

        <div class="result-feedback" v-if="showResult">
          <div class="feedback-content" :class="{ correct: isCorrect, incorrect: !isCorrect }">
            <div class="feedback-icon">{{ isCorrect ? '✅' : '❌' }}</div>
            <div class="feedback-text">
              <h4>{{ isCorrect ? 'Correct!' : 'Incorrect' }}</h4>
              <p>{{ currentQuestion.explanation }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quiz Results -->
    <div class="quiz-results" v-if="quizCompleted">
      <div class="results-container">
        <h2 class="results-title">Quiz Completed! 🎉</h2>
        <div class="score-display">
          <div class="score-circle" :class="getScoreClass(finalScore)">
            <span class="score-percentage">{{ finalScore }}%</span>
          </div>
        </div>
        <div class="results-details">
          <div class="detail-item">
            <span class="detail-label">Correct Answers:</span>
            <span class="detail-value">{{ correctAnswers }} / {{ totalQuestions }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Time Taken:</span>
            <span class="detail-value">{{ formatTime(timeTaken) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Category:</span>
            <span class="detail-value">{{ selectedCategory.name }}</span>
          </div>
        </div>
        <div class="results-actions">
          <button @click="retakeQuiz" class="retake-btn">Retake Quiz</button>
          <button @click="selectNewCategory" class="new-category-btn">Try Another Category</button>
          <button @click="viewProgress" class="progress-btn">View Progress</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PracticeQuizzes',
  data() {
    return {
      // Statistics
      totalQuizzesTaken: 15,
      averageScore: 78,
      streak: 5,
      
      // Quiz Categories
      quizCategories: [
        {
          id: 1,
          name: 'Mathematics',
          icon: '🔢',
          description: 'Test your math skills with algebra, geometry, and calculus',
          quizCount: 25,
          difficulty: 'Medium'
        },
        {
          id: 2,
          name: 'Science',
          icon: '🔬',
          description: 'Explore physics, chemistry, and biology concepts',
          quizCount: 30,
          difficulty: 'Hard'
        },
        {
          id: 3,
          name: 'History',
          icon: '📚',
          description: 'Journey through world history and important events',
          quizCount: 20,
          difficulty: 'Easy'
        },
        {
          id: 4,
          name: 'Literature',
          icon: '📖',
          description: 'Test your knowledge of classic and modern literature',
          quizCount: 18,
          difficulty: 'Medium'
        },
        {
          id: 5,
          name: 'Geography',
          icon: '🌍',
          description: 'Explore countries, capitals, and geographical features',
          quizCount: 22,
          difficulty: 'Easy'
        },
        {
          id: 6,
          name: 'Computer Science',
          icon: '💻',
          description: 'Programming concepts, algorithms, and data structures',
          quizCount: 28,
          difficulty: 'Hard'
        }
      ],
      
      // Quiz State
      selectedCategory: null,
      selectedMode: 'standard',
      selectedDifficulty: 'Medium',
      difficultyLevels: ['Easy', 'Medium', 'Hard'],
      quizStarted: false,
      quizCompleted: false,
      
      // Current Quiz
      currentQuestionIndex: 0,
      selectedAnswer: null,
      showResult: false,
      isCorrect: false,
      correctAnswers: 0,
      totalQuestions: 10,
      timeRemaining: 600, // 10 minutes
      timeTaken: 0,
      finalScore: 0,
      timer: null,
      
      // Sample Questions
      questions: [
        {
          question: "What is the result of 2 + 2 × 3?",
          answers: ["8", "10", "12", "6"],
          correctAnswer: 0,
          explanation: "Following the order of operations (PEMDAS), multiplication comes before addition: 2 + (2 × 3) = 2 + 6 = 8"
        },
        {
          question: "Which planet is known as the Red Planet?",
          answers: ["Venus", "Mars", "Jupiter", "Saturn"],
          correctAnswer: 1,
          explanation: "Mars is called the Red Planet because of its reddish appearance, which comes from iron oxide (rust) on its surface."
        },
        {
          question: "What is the capital of France?",
          answers: ["London", "Berlin", "Paris", "Madrid"],
          correctAnswer: 2,
          explanation: "Paris is the capital and most populous city of France, known for landmarks like the Eiffel Tower and Louvre Museum."
        },
        {
          question: "Which programming language is known for its use in web development?",
          answers: ["Python", "JavaScript", "C++", "Java"],
          correctAnswer: 1,
          explanation: "JavaScript is primarily used for web development, enabling interactive elements on websites and web applications."
        },
        {
          question: "What is the largest ocean on Earth?",
          answers: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
          correctAnswer: 3,
          explanation: "The Pacific Ocean is the largest and deepest ocean on Earth, covering about one-third of the planet's surface."
        }
      ]
    }
  },
  computed: {
    currentQuestion() {
      return this.questions[this.currentQuestionIndex % this.questions.length] || {};
    },
    progressPercentage() {
      return ((this.currentQuestionIndex + 1) / this.totalQuestions) * 100;
    }
  },
  methods: {
    selectCategory(category) {
      this.selectedCategory = category;
      this.quizStarted = false;
      this.quizCompleted = false;
    },
    
    startQuiz() {
      this.quizStarted = true;
      this.currentQuestionIndex = 0;
      this.selectedAnswer = null;
      this.showResult = false;
      this.correctAnswers = 0;
      this.timeRemaining = this.selectedMode === 'quick' ? 300 : this.selectedMode === 'standard' ? 600 : 1200;
      this.totalQuestions = this.selectedMode === 'quick' ? 5 : this.selectedMode === 'standard' ? 10 : 20;
      this.startTimer();
    },
    
    selectAnswer(index) {
      if (!this.showResult) {
        this.selectedAnswer = index;
      }
    },
    
    submitAnswer() {
      if (this.showResult) {
        this.nextQuestion();
      } else {
        this.showResult = true;
        this.isCorrect = this.selectedAnswer === this.currentQuestion.correctAnswer;
        if (this.isCorrect) {
          this.correctAnswers++;
        }
        setTimeout(() => {
          this.nextQuestion();
        }, 3000);
      }
    },
    
    skipQuestion() {
      this.nextQuestion();
    },
    
    nextQuestion() {
      if (this.currentQuestionIndex + 1 < this.totalQuestions) {
        this.currentQuestionIndex++;
        this.selectedAnswer = null;
        this.showResult = false;
      } else {
        this.completeQuiz();
      }
    },
    
    completeQuiz() {
      this.quizStarted = false;
      this.quizCompleted = true;
      this.finalScore = Math.round((this.correctAnswers / this.totalQuestions) * 100);
      this.timeTaken = this.selectedMode === 'quick' ? 300 - this.timeRemaining : 
                      this.selectedMode === 'standard' ? 600 - this.timeRemaining : 1200 - this.timeRemaining;
      this.clearTimer();
    },
    
    retakeQuiz() {
      this.quizCompleted = false;
      this.startQuiz();
    },
    
    selectNewCategory() {
      this.selectedCategory = null;
      this.quizCompleted = false;
    },
    
    viewProgress() {
      // This would typically navigate to a progress page
      console.log('Navigating to progress page...');
    },
    
    startTimer() {
      this.clearTimer();
      this.timer = setInterval(() => {
        this.timeRemaining--;
        if (this.timeRemaining <= 0) {
          this.completeQuiz();
        }
      }, 1000);
    },
    
    clearTimer() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    },
    
    formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    },
    
    getScoreClass(score) {
      if (score >= 90) return 'excellent';
      if (score >= 80) return 'good';
      if (score >= 70) return 'average';
      return 'needs-improvement';
    }
  },
  
  beforeUnmount() {
    this.clearTimer();
  }
}
</script>

<style scoped>
.practice-quizzes {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  margin-left: 270px;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #7f8c8d;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  font-size: 3rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-info h3 {
  font-size: 2rem;
  color: #2c3e50;
  margin: 0;
}

.stat-info p {
  color: #7f8c8d;
  margin: 0;
  font-size: 0.9rem;
}

.section-title {
  font-size: 1.8rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  text-align: center;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.category-card {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.category-card:hover {
  transform: translateY(-5px);
  border-color: #667eea;
}

.category-icon {
  font-size: 3rem;
  text-align: center;
  margin-bottom: 1rem;
}

.category-title {
  font-size: 1.4rem;
  color: #2c3e50;
  text-align: center;
  margin-bottom: 1rem;
}

.category-description {
  color: #7f8c8d;
  text-align: center;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.category-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quiz-count {
  color: #5a6c7d;
  font-size: 0.9rem;
}

.difficulty {
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.difficulty.easy {
  background: #d4edda;
  color: #155724;
}

.difficulty.medium {
  background: #fff3cd;
  color: #856404;
}

.difficulty.hard {
  background: #f8d7da;
  color: #721c24;
}

.practice-mode {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.practice-options {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.mode-selector label,
.difficulty-selector label {
  display: block;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.mode-select {
  width: 100%;
  padding: 0.8rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
}

.difficulty-buttons {
  display: flex;
  gap: 1rem;
}

.difficulty-btn {
  padding: 0.8rem 1.5rem;
  border: 2px solid #e9ecef;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.difficulty-btn.active,
.difficulty-btn:hover {
  border-color: #667eea;
  background: #667eea;
  color: white;
}

.start-quiz-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s ease;
  align-self: flex-start;
}

.start-quiz-btn:hover {
  transform: translateY(-2px);
}

.quiz-interface {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.quiz-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.progress-bar {
  width: 300px;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.progress-text {
  margin-left: 1rem;
  font-weight: 600;
  color: #2c3e50;
}

.quiz-timer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #e74c3c;
}

.question-title {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 2rem;
  line-height: 1.4;
}

.answers-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.answer-option {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.answer-option:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.answer-option.selected {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.2);
}

.answer-option.correct {
  border-color: #27ae60;
  background: rgba(39, 174, 96, 0.1);
}

.answer-option.incorrect {
  border-color: #e74c3c;
  background: rgba(231, 76, 60, 0.1);
}

.answer-letter {
  background: #667eea;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 1rem;
}

.question-actions {
  display: flex;
  gap: 1rem;
}

.submit-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.skip-btn {
  background: transparent;
  color: #7f8c8d;
  padding: 0.8rem 1.5rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.skip-btn:hover {
  border-color: #7f8c8d;
  color: #2c3e50;
}

.result-feedback {
  margin-top: 2rem;
  padding: 1.5rem;
  border-radius: 10px;
  background: #f8f9fa;
}

.feedback-content {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.feedback-content.correct {
  background: rgba(39, 174, 96, 0.1);
  border-left: 4px solid #27ae60;
}

.feedback-content.incorrect {
  background: rgba(231, 76, 60, 0.1);
  border-left: 4px solid #e74c3c;
}

.feedback-icon {
  font-size: 1.5rem;
}

.feedback-text h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.feedback-text p {
  margin: 0;
  color: #5a6c7d;
  line-height: 1.5;
}

.quiz-results {
  background: white;
  padding: 3rem;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.results-title {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 2rem;
}

.score-display {
  margin-bottom: 2rem;
}

.score-circle {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  font-size: 2rem;
  font-weight: bold;
  color: white;
}

.score-circle.excellent {
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
}

.score-circle.good {
  background: linear-gradient(135deg, #3498db 0%, #5dade2 100%);
}

.score-circle.average {
  background: linear-gradient(135deg, #f39c12 0%, #f7dc6f 100%);
}

.score-circle.needs-improvement {
  background: linear-gradient(135deg, #e74c3c 0%, #ec7063 100%);
}

.results-details {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-label {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.detail-value {
  color: #2c3e50;
  font-weight: 600;
  font-size: 1.1rem;
}

.results-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.retake-btn, .new-category-btn, .progress-btn {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.retake-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.new-category-btn {
  background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
  color: white;
}

.progress-btn {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
  color: white;
}

.retake-btn:hover, .new-category-btn:hover, .progress-btn:hover {
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .practice-quizzes {
    margin-left: 0;
    padding: 1rem;
  }
  
  .stats-container {
    grid-template-columns: 1fr;
  }
  
  .categories-grid {
    grid-template-columns: 1fr;
  }
  
  .quiz-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .progress-bar {
    width: 100%;
  }
  
  .difficulty-buttons {
    flex-wrap: wrap;
  }
  
  .results-details {
    flex-direction: column;
    gap: 1rem;
  }
  
  .results-actions {
    flex-direction: column;
  }
}
</style>