<template>
  <div class="quizzes-container">
    <h2>Quizzes</h2>
    <div class="quiz-filters">
      <select v-model="selectedSubject">
        <option value="">All Subjects</option>
        <option v-for="subject in subjects" :key="subject" :value="subject">
          {{ subject }}
        </option>
      </select>
      <button @click="showAvailableOnly = !showAvailableOnly" 
              :class="{ active: showAvailableOnly }">
        {{ showAvailableOnly ? 'Showing Available Only' : 'Show All' }}
      </button>
    </div>
    
    <div class="quiz-list">
      <div v-for="quiz in filteredQuizzes" :key="quiz.id" class="quiz-card">
        <div class="quiz-info">
          <h3>{{ quiz.title }}</h3>
          <p>{{ quiz.description }}</p>
          <div class="quiz-meta">
            <span class="subject">{{ quiz.subject }}</span>
            <span class="questions">{{ quiz.questionCount }} questions</span>
            <span class="duration">{{ quiz.duration }} minutes</span>
          </div>
        </div>
        <div class="quiz-actions">
          <div v-if="quizAttempts[quiz.id]" class="quiz-result">
            <span>Best Score: {{ quizAttempts[quiz.id].score }}%</span>
            <span>Attempts: {{ quizAttempts[quiz.id].attempts }}</span>
          </div>
          <button @click="startQuiz(quiz.id)" :disabled="!quiz.isAvailable">
            {{ quiz.isAvailable ? 'Start Quiz' : 'Coming Soon' }}
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="loading" class="loading">Loading quizzes...</div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script>
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/firebase';

export default {
  name: 'StudentQuizzes',
  data() {
    return {
      quizzes: [],
      quizAttempts: {},
      selectedSubject: '',
      subjects: ['Math', 'Science', 'Language Arts', 'History', 'Computer Science'],
      showAvailableOnly: false,
      loading: false,
      error: ''
    }
  },
  computed: {
    filteredQuizzes() {
      return this.quizzes.filter(quiz => {
        const matchesSubject = !this.selectedSubject || quiz.subject === this.selectedSubject;
        const matchesAvailability = !this.showAvailableOnly || quiz.isAvailable;
        return matchesSubject && matchesAvailability;
      });
    }
  },
  async created() {
    await this.fetchQuizzes();
    if (auth.currentUser) {
      await this.fetchQuizAttempts();
    }
  },
  methods: {
    async fetchQuizzes() {
      this.loading = true;
      this.error = '';
      try {
        const querySnapshot = await getDocs(collection(db, 'quizzes'));
        this.quizzes = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (err) {
        this.error = 'Failed to load quizzes. Please try again later.';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    async fetchQuizAttempts() {
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          this.quizAttempts = userDoc.data().quizAttempts || {};
        }
      } catch (err) {
        console.error('Error fetching quiz attempts:', err);
      }
    },
    startQuiz(quizId) {
      this.$router.push(`/student/quizzes/${quizId}`);
    }
  }
}
</script>

<style scoped>
.quizzes-container {
  padding: 20px;
}
.quiz-filters {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}
.quiz-filters select {
  flex: 1;
  padding: 8px;
}
.quiz-filters button {
  padding: 8px 15px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}
.quiz-filters button.active {
  background-color: #42b983;
  color: white;
  border-color: #42b983;
}
.quiz-list {
  display: grid;
  gap: 20px;
}
.quiz-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  transition: transform 0.2s;
}
.quiz-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}
.quiz-info {
  flex: 2;
}
.quiz-info h3 {
  margin-top: 0;
  margin-bottom: 10px;
}
.quiz-meta {
  display: flex;
  gap: 15px;
  margin-top: 10px;
  font-size: 0.9em;
  color: #666;
}
.quiz-actions {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
}
.quiz-result {
  text-align: right;
  font-size: 0.9em;
  margin-bottom: 10px;
}
.quiz-result span {
  display: block;
}
button {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  min-width: 120px;
}
button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
.loading, .error {
  text-align: center;
  padding: 20px;
}
.error {
  color: #ff4444;
}
</style>