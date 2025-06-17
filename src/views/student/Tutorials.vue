<template>
  <div class="tutorials-container">
    <h2>Tutorials</h2>
    <div class="search-filter">
      <input v-model="searchQuery" placeholder="Search tutorials...">
      <select v-model="selectedCategory">
        <option value="">All Categories</option>
        <option v-for="category in categories" :key="category" :value="category">
          {{ category }}
        </option>
      </select>
    </div>
    <div class="tutorial-list">
      <div v-for="tutorial in filteredTutorials" :key="tutorial.id" class="tutorial-card">
        <h3>{{ tutorial.title }}</h3>
        <p>{{ tutorial.description }}</p>
        <div class="meta">
          <span class="category">{{ tutorial.category }}</span>
          <span class="duration">{{ tutorial.duration }} min</span>
        </div>
        <button @click="startTutorial(tutorial.id)">Start Learning</button>
      </div>
    </div>
    <div v-if="loading" class="loading">Loading tutorials...</div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script>
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';

export default {
  name: 'StudentTutorials',
  data() {
    return {
      tutorials: [],
      searchQuery: '',
      selectedCategory: '',
      categories: ['Math', 'Science', 'Language', 'History', 'Programming'],
      loading: false,
      error: ''
    }
  },
  computed: {
    filteredTutorials() {
      return this.tutorials.filter(tutorial => {
        const matchesSearch = tutorial.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          tutorial.description.toLowerCase().includes(this.searchQuery.toLowerCase());
        const matchesCategory = !this.selectedCategory || tutorial.category === this.selectedCategory;
        return matchesSearch && matchesCategory;
      });
    }
  },
  async created() {
    await this.fetchTutorials();
  },
  methods: {
    async fetchTutorials() {
      this.loading = true;
      this.error = '';
      try {
        const querySnapshot = await getDocs(collection(db, 'tutorials'));
        this.tutorials = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (err) {
        this.error = 'Failed to load tutorials. Please try again later.';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    startTutorial(tutorialId) {
      this.$router.push(`/student/tutorials/${tutorialId}`);
    }
  }
}
</script>

<style scoped>
.tutorials-container {
  padding: 20px;
}
.search-filter {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}
.search-filter input {
  flex: 2;
  padding: 8px;
}
.search-filter select {
  flex: 1;
  padding: 8px;
}
.tutorial-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}
.tutorial-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  transition: transform 0.2s;
}
.tutorial-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}
.tutorial-card h3 {
  margin-top: 0;
  color: #2c3e50;
}
.meta {
  display: flex;
  justify-content: space-between;
  margin: 10px 0;
  font-size: 0.9em;
  color: #666;
}
button {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
}
.loading, .error {
  text-align: center;
  padding: 20px;
}
.error {
  color: #ff4444;
}
</style>