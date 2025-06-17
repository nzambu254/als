<template>
  <div class="progress-container">
    <h2>My Progress</h2>
    
    <div class="progress-overview">
      <div class="progress-card">
        <h3>Completed Tutorials</h3>
        <div class="progress-value">{{ completedTutorials }}</div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: tutorialProgress + '%' }"></div>
        </div>
        <div class="progress-percent">{{ tutorialProgress }}%</div>
      </div>
      
      <div class="progress-card">
        <h3>Practice Exercises</h3>
        <div class="progress-value">{{ completedExercises }}</div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: exerciseProgress + '%' }"></div>
        </div>
        <div class="progress-percent">{{ exerciseProgress }}%</div>
      </div>
      
      <div class="progress-card">
        <h3>Quizzes Taken</h3>
        <div class="progress-value">{{ completedQuizzes }}</div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: quizProgress + '%' }"></div>
        </div>
        <div class="progress-percent">{{ quizProgress }}%</div>
      </div>
    </div>
    
    <div class="progress-details">
      <div class="recent-activity">
        <h3>Recent Activity</h3>
        <ul>
          <li v-for="activity in recentActivities" :key="activity.id">
            <span class="activity-type">{{ activity.type }}</span>
            <span class="activity-title">{{ activity.title }}</span>
            <span class="activity-date">{{ formatDate(activity.date) }}</span>
            <span class="activity-score" v-if="activity.score !== undefined">
              Score: {{ activity.score }}%
            </span>
          </li>
        </ul>
      </div>
      
      <div class="performance-chart">
        <h3>Performance Over Time</h3>
        <canvas ref="chartCanvas"></canvas>
      </div>
    </div>
    
    <div v-if="loading" class="loading">Loading progress data...</div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script>
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/firebase';
import Chart from 'chart.js/auto';

export default {
  name: 'StudentProgress',
  data() {
    return {
      completedTutorials: 0,
      completedExercises: 0,
      completedQuizzes: 0,
      tutorialProgress: 0,
      exerciseProgress: 0,
      quizProgress: 0,
      recentActivities: [],
      loading: false,
      error: '',
      chart: null
    }
  },
  async created() {
    await this.fetchProgressData();
  },
  mounted() {
    this.renderChart();
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy();
    }
  },
  methods: {
    async fetchProgressData() {
      this.loading = true;
      this.error = '';
      
      try {
        if (!auth.currentUser) {
          throw new Error('User not authenticated');
        }
        
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          this.completedTutorials = userData.completedTutorials?.length || 0;
          this.completedExercises = userData.completedExercises?.length || 0;
          this.completedQuizzes = Object.keys(userData.quizAttempts || {}).length;
          
          // Calculate progress percentages (assuming total counts are available)
          const totalTutorials = 50; // This should come from your database
          const totalExercises = 100;
          const totalQuizzes = 20;
          
          this.tutorialProgress = Math.round((this.completedTutorials / totalTutorials) * 100);
          this.exerciseProgress = Math.round((this.completedExercises / totalExercises) * 100);
          this.quizProgress = Math.round((this.completedQuizzes / totalQuizzes) * 100);
          
          // Prepare recent activities
          this.recentActivities = [
            ...(userData.completedTutorials?.slice(-3).map(t => ({
              ...t,
              type: 'Tutorial',
              date: t.completedAt
            })) || []),
            ...(userData.completedExercises?.slice(-3).map(e => ({
              ...e,
              type: 'Exercise',
              date: e.completedAt
            })) || []),
            ...(Object.entries(userData.quizAttempts || {})
              .slice(-3)
              .map(([quizId, attempt]) => ({
                id: quizId,
                type: 'Quiz',
                title: attempt.quizTitle,
                date: attempt.lastAttempt,
                score: attempt.score
              })) || [])
          ].sort((a, b) => new Date(b.date) - new Date(a.date))
           .slice(0, 5);
        }
      } catch (err) {
        this.error = 'Failed to load progress data. Please try again later.';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    },
    renderChart() {
      if (!this.$refs.chartCanvas) return;
      
      const ctx = this.$refs.chartCanvas.getContext('2d');
      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [
            {
              label: 'Quiz Scores',
              data: [65, 72, 80, 76, 85, 88],
              borderColor: '#42b983',
              backgroundColor: 'rgba(66, 185, 131, 0.1)',
              tension: 0.3,
              fill: true
            },
            {
              label: 'Exercise Completion',
              data: [30, 45, 60, 65, 75, 82],
              borderColor: '#3498db',
              backgroundColor: 'rgba(52, 152, 219, 0.1)',
              tension: 0.3,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100
            }
          }
        }
      });
    }
  }
}
</script>

<style scoped>
.progress-container {
  padding: 20px;
}
.progress-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}
.progress-card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  text-align: center;
}
.progress-card h3 {
  margin-top: 0;
  color: #555;
}
.progress-value {
  font-size: 2.5em;
  font-weight: bold;
  margin: 10px 0;
  color: #2c3e50;
}
.progress-bar {
  height: 10px;
  background-color: #f0f0f0;
  border-radius: 5px;
  margin: 15px 0;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background-color: #42b983;
  transition: width 0.5s ease;
}
.progress-percent {
  font-size: 1.2em;
  color: #42b983;
  font-weight: bold;
}
.progress-details {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 30px;
}
.recent-activity {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.recent-activity h3 {
  margin-top: 0;
}
.recent-activity ul {
  list-style: none;
  padding: 0;
}
.recent-activity li {
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  display: grid;
  grid-template-columns: 80px 1fr 100px auto;
  gap: 10px;
  align-items: center;
}
.recent-activity li:last-child {
  border-bottom: none;
}
.activity-type {
  font-weight: bold;
  color: #42b983;
}
.activity-date {
  color: #777;
  font-size: 0.9em;
}
.activity-score {
  font-weight: bold;
  color: #2c3e50;
}
.performance-chart {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.performance-chart h3 {
  margin-top: 0;
}
.loading, .error {
  text-align: center;
  padding: 20px;
}
.error {
  color: #ff4444;
}
</style>