<template>
  <div class="practice-container">
    <h2>Practice Exercises</h2>
    <div class="controls">
      <select v-model="selectedSubject">
        <option value="">All Subjects</option>
        <option v-for="subject in subjects" :key="subject" :value="subject">
          {{ subject }}
        </option>
      </select>
      <select v-model="selectedDifficulty">
        <option value="">All Difficulty Levels</option>
        <option v-for="level in difficultyLevels" :key="level" :value="level">
          {{ level }}
        </option>
      </select>
    </div>
    
    <div class="exercise-list">
      <div v-for="exercise in filteredExercises" :key="exercise.id" class="exercise-card">
        <div class="exercise-header">
          <h3>{{ exercise.title }}</h3>
          <span class="difficulty" :class="exercise.difficulty.toLowerCase()">
            {{ exercise.difficulty }}
          </span>
        </div>
        <p>{{ exercise.description }}</p>
        <div class="exercise-footer">
          <span class="subject">{{ exercise.subject }}</span>
          <button @click="startExercise(exercise.id)">Start Practice</button>
        </div>
      </div>
    </div>
    
    <div v-if="loading" class="loading">Loading exercises...</div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script>
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';

export default {
  name: 'StudentPractice',
  data() {
    return {
      exercises: [],
      selectedSubject: '',
      selectedDifficulty: '',
      subjects: ['Math', 'Science', 'Language Arts', 'History', 'Computer Science'],
      difficultyLevels: ['Beginner', 'Intermediate', 'Advanced'],
      loading: false,
      error: ''
    }
  },
  computed: {
    filteredExercises() {
      return this.exercises.filter(exercise => {
        const matchesSubject = !this.selectedSubject || exercise.subject === this.selectedSubject;
        const matchesDifficulty = !this.selectedDifficulty || exercise.difficulty === this.selectedDifficulty;
        return matchesSubject && matchesDifficulty;
      });
    }
  },
  async created() {
    await this.fetchExercises();
  },
  methods: {
    async fetchExercises() {
      this.loading = true;
      this.error = '';
      try {
        const querySnapshot = await getDocs(collection(db, 'exercises'));
        this.exercises = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (err) {
        this.error = 'Failed to load exercises. Please try again later.';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    startExercise(exerciseId) {
      this.$router.push(`/student/practice/${exerciseId}`);
    }
  }
}
</script>

<style scoped>
.practice-container {
  padding: 20px;
}
.controls {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}
.controls select {
  flex: 1;
  padding: 8px;
}
.exercise-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}
.exercise-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  transition: transform 0.2s;
}
.exercise-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}
.exercise-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.exercise-header h3 {
  margin: 0;
}
.difficulty {
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: bold;
}
.difficulty.beginner {
  background-color: #4CAF50;
  color: white;
}
.difficulty.intermediate {
  background-color: #FFC107;
  color: black;
}
.difficulty.advanced {
  background-color: #F44336;
  color: white;
}
.exercise-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
}
.subject {
  font-size: 0.9em;
  color: #666;
}
button {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}
.loading, .error {
  text-align: center;
  padding: 20px;
}
.error {
  color: #ff4444;
}
</style>