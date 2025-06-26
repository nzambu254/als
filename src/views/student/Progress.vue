<template>
  <div class="progress-container">
    <h2>My Progress</h2>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner-small"></div>
      <p>Loading progress data...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p class="error-message">{{ error }}</p>
      <p>Please ensure you are logged in and your profile exists. Try refreshing the page.</p>
    </div>

    <div v-else class="progress-content">
      <div class="progress-overview">
        <div class="progress-card notes-card">
          <h3>Completed Notes</h3>
          <div class="progress-value">{{ completedNotes }}</div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: notesProgress + '%' }"></div>
          </div>
          <div class="progress-percent">{{ notesProgress }}%</div>
        </div>

        <div class="progress-card exercises-card">
          <h3>Completed Exercises</h3>
          <div class="progress-value">{{ completedExercises }}</div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: exerciseProgress + '%' }"></div>
          </div>
          <div class="progress-percent">{{ exerciseProgress }}%</div>
        </div>

        <div class="progress-card quizzes-card">
          <h3>Quizzes Taken</h3>
          <div class="progress-value">{{ completedQuizzes }}</div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: quizProgress + '%' }"></div>
          </div>
          <div class="progress-percent">{{ quizProgress }}%</div>
        </div>

        <div class="progress-card tutorials-card">
          <h3>Completed Tutorials</h3>
          <div class="progress-value">{{ completedTutorials }}</div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: tutorialProgress + '%' }"></div>
          </div>
          <div class="progress-percent">{{ tutorialProgress }}%</div>
        </div>
      </div>

      <div class="progress-details">
        <div class="recent-activity">
          <h3>Recent Activity</h3>
          <ul v-if="recentActivities.length > 0">
            <li v-for="activity in recentActivities" :key="activity.id">
              <span class="activity-type">{{ activity.type }}</span>
              <span class="activity-title">{{ truncateText(activity.title, 30) }}</span>
              <span class="activity-date">{{ formatDate(activity.date) }}</span>
              <span class="activity-score" v-if="activity.score !== undefined">
                Score: {{ activity.score }}%
              </span>
            </li>
          </ul>
          <p v-else class="no-activity">No recent activity found.</p>
        </div>

        <div class="performance-chart">
          <h3>Performance Over Time (Last 6 Attempts)</h3>
          <canvas ref="chartCanvas"></canvas>
          <p v-if="chartError" class="chart-error-message">{{ chartError }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase'; // Your Firestore instance
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Firebase Auth
import Chart from 'chart.js/auto'; // Chart.js library

export default {
  name: 'StudentProgress',
  data() {
    return {
      completedNotes: 0,
      completedExercises: 0,
      completedTutorials: 0,
      completedQuizzes: 0,

      totalNotes: 1, // Default to 1 to avoid division by zero if no notes exist
      totalExercises: 1,
      totalTutorials: 1,
      totalQuizzes: 1,

      notesProgress: 0,
      exerciseProgress: 0,
      tutorialProgress: 0,
      quizProgress: 0,

      recentActivities: [],
      loading: true,
      error: '',
      chart: null,
      chartError: '',
      authStateListener: null, // Listener for Firebase Auth state changes
    }
  },
  async mounted() {
    // Listen for auth state changes before fetching data
    const auth = getAuth();
    this.authStateListener = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await this.fetchProgressData(user.uid);
      } else {
        this.loading = false;
        this.error = 'You must be logged in to view your progress.';
        // Optionally redirect to login page if user is not authenticated
        if (this.$router && this.$router.currentRoute.path !== '/login') {
           this.$router.push('/login');
        }
      }
    });
  },
  beforeUnmount() {
    // Clean up the Chart.js instance to prevent memory leaks
    if (this.chart) {
      this.chart.destroy();
    }
    // Unsubscribe from the auth state listener
    if (this.authStateListener) {
      this.authStateListener();
    }
  },
  methods: {
    async fetchProgressData(uid) {
      this.loading = true;
      this.error = '';
      this.chartError = '';

      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

      try {
        // --- Fetch Total Counts of Available Content ---
        const [
          notesTotalSnapshot,
          exercisesTotalSnapshot_artifacts,
          exercisesTotalSnapshot_root, // From CreateLociExercise component
          tutorialsTotalSnapshot,
          quizzesTotalSnapshot
        ] = await Promise.all([
          getDocs(collection(db, `artifacts/${appId}/public/data/notes`)),
          getDocs(collection(db, `artifacts/${appId}/public/data/exercises`)),
          getDocs(collection(db, 'exercises')), // Main 'exercises' collection
          getDocs(collection(db, 'tutorials')),
          getDocs(collection(db, 'quizzes'))
        ]);

        this.totalNotes = notesTotalSnapshot.size > 0 ? notesTotalSnapshot.size : 1;

        // Combine exercises from both sources, ensuring uniqueness if they represent the same items
        const combinedExercises = new Set();
        exercisesTotalSnapshot_artifacts.docs.forEach(doc => combinedExercises.add(doc.id));
        exercisesTotalSnapshot_root.docs.forEach(doc => combinedExercises.add(doc.id));
        this.totalExercises = combinedExercises.size > 0 ? combinedExercises.size : 1;

        this.totalTutorials = tutorialsTotalSnapshot.size > 0 ? tutorialsTotalSnapshot.size : 1;
        this.totalQuizzes = quizzesTotalSnapshot.size > 0 ? quizzesTotalSnapshot.size : 1;


        // --- Fetch User's Completed Content and Submissions ---
        const userDoc = await getDoc(doc(db, 'users', uid));

        // Fetch quiz submissions for the current user
        const quizSubmissionsQuery = query(collection(db, 'submissions'), where('studentId', '==', uid));
        const quizSubmissionsSnapshot = await getDocs(quizSubmissionsQuery);
        const userQuizSubmissions = quizSubmissionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (userDoc.exists()) {
          const userData = userDoc.data();

          // Completed counts from user document
          this.completedNotes = userData.completedNotes?.length || 0;
          this.completedExercises = userData.completedExercises?.length || 0;
          this.completedTutorials = userData.completedTutorials?.length || 0;

          // Completed quizzes based on unique quiz IDs in submissions
          const uniqueCompletedQuizzes = new Set(userQuizSubmissions.map(submission => submission.quizId));
          this.completedQuizzes = uniqueCompletedQuizzes.size;

          // Calculate progress percentages
          this.notesProgress = Math.round((this.completedNotes / this.totalNotes) * 100);
          this.exerciseProgress = Math.round((this.completedExercises / this.totalExercises) * 100);
          this.tutorialProgress = Math.round((this.completedTutorials / this.totalTutorials) * 100);
          this.quizProgress = Math.round((this.completedQuizzes / this.totalQuizzes) * 100);

          // Prepare recent activities (last 5, sorted by date)
          let activities = [];

          // Add notes activities from user data
          (userData.completedNotes || []).forEach(n => {
            activities.push({
              id: n.id,
              type: 'Note',
              title: n.title,
              date: n.completedAt,
            });
          });

          // Add exercises activities from user data
          (userData.completedExercises || []).forEach(e => {
            activities.push({
              id: e.id,
              type: 'Exercise',
              title: e.title,
              date: e.completedAt,
            });
          });

          // Add tutorials activities from user data
          (userData.completedTutorials || []).forEach(t => {
            activities.push({
              id: t.id,
              type: 'Tutorial',
              title: t.title,
              date: t.completedAt,
            });
          });

          // Add quiz activities from user submissions
          userQuizSubmissions.forEach(submission => {
            activities.push({
              id: submission.id, // submission ID
              type: 'Quiz',
              title: submission.quizTitle,
              date: submission.submittedAt,
              score: Math.round((submission.score / submission.total) * 100) // Calculate percentage score
            });
          });

          // Sort activities by date (most recent first) and take the top 5
          this.recentActivities = activities
            .sort((a, b) => new Date(b.date?.toDate ? b.date.toDate() : b.date) - new Date(a.date?.toDate ? a.date.toDate() : a.date))
            .slice(0, 5);

          // Render chart after data is loaded
          this.$nextTick(() => {
            // Pass raw submissions and completed exercises for chart data
            this.renderChart(userQuizSubmissions, userData.completedExercises);
          });

        } else {
          this.error = 'User profile data not found.';
          console.warn('User document not found for UID:', uid);
        }
      } catch (err) {
        this.error = 'Failed to load progress data. Please try again later.';
        console.error('Error in fetchProgressData:', err);
      } finally {
        this.loading = false;
      }
    },
    formatDate(timestamp) {
      if (!timestamp) return 'N/A';
      // Firebase Timestamps have a .toDate() method, otherwise assume it's already a Date object or string
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return date.toLocaleDateString(undefined, options);
    },
    truncateText(text, maxLength) {
      if (!text) return 'N/A';
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    },
    renderChart(userQuizSubmissions, completedExercises) {
      if (!this.$refs.chartCanvas) {
        this.chartError = 'Chart canvas not found.';
        return;
      }

      // Destroy existing chart if it exists
      if (this.chart) {
        this.chart.destroy();
      }

      // Prepare data for the chart
      const quizLabels = [];
      const quizScores = [];
      const exerciseCompletionData = [];

      // Get last 6 quiz submissions, sorted by date
      const sortedQuizSubmissions = userQuizSubmissions
        .sort((a, b) => new Date(a.submittedAt?.toDate ? a.submittedAt.toDate() : a.submittedAt) - new Date(b.submittedAt?.toDate ? b.submittedAt.toDate() : b.submittedAt))
        .slice(-6);

      sortedQuizSubmissions.forEach(submission => {
        const date = submission.submittedAt?.toDate ? submission.submittedAt.toDate() : new Date(submission.submittedAt);
        quizLabels.push(this.formatDate(date));
        quizScores.push(Math.round((submission.score / submission.total) * 100)); // Calculate percentage score
      });

      // For exercise completion, let's use the completion status of the last 6 completed exercises
      // We'll create a parallel set of labels for exercises if quiz labels aren't sufficient
      const sortedCompletedExercises = (completedExercises || [])
        .sort((a, b) => new Date(a.completedAt?.toDate ? a.completedAt.toDate() : a.completedAt) - new Date(b.completedAt?.toDate ? b.completedAt.toDate() : b.completedAt))
        .slice(-6);

      sortedCompletedExercises.forEach(ex => {
          // Assuming 'completed' means 100% for this chart's purpose
          exerciseCompletionData.push(100);
      });

      // Determine labels for the chart. Prioritize quiz dates if available, otherwise use exercise titles.
      let labels = quizLabels;
      if (quizLabels.length === 0 && sortedCompletedExercises.length > 0) {
          labels = sortedCompletedExercises.map(ex => this.truncateText(ex.title, 15));
      } else if (quizLabels.length === 0 && sortedCompletedExercises.length === 0) {
          labels = ['No Data'];
      }


      if (labels[0] === 'No Data' && quizScores.length === 0 && exerciseCompletionData.length === 0) {
         this.chartError = 'Not enough data to render performance chart.';
         return;
      } else {
        this.chartError = ''; // Clear error if data becomes available
      }

      const ctx = this.$refs.chartCanvas.getContext('2d');
      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Quiz Scores (%)',
              data: quizScores,
              borderColor: '#8e44ad', // Quizzes color
              backgroundColor: 'rgba(142, 68, 173, 0.1)',
              tension: 0.3,
              fill: true,
              hidden: quizScores.length === 0 // Hide if no data
            },
            {
              label: 'Exercise Completion (%)',
              data: exerciseCompletionData,
              borderColor: '#e09b3d', // Exercises color
              backgroundColor: 'rgba(224, 155, 61, 0.1)',
              tension: 0.3,
              fill: true,
              hidden: exerciseCompletionData.length === 0 // Hide if no data
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              display: quizScores.length > 0 || exerciseCompletionData.length > 0
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  if (context.parsed.y !== null) {
                    label += context.parsed.y + '%';
                  }
                  return label;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              title: {
                display: true,
                text: 'Percentage'
              },
              ticks: {
                  callback: function(value) {
                      return value + '%';
                  }
              }
            },
            x: {
              title: {
                display: true,
                text: 'Recent Attempts'
              }
            }
          }
        }
      });
      if (quizScores.length === 0 && exerciseCompletionData.length === 0) {
        this.chartError = 'Not enough data to render performance chart. Complete quizzes and exercises to see your progress here.';
      }
    }
  }
}
</script>

<style scoped>
.progress-container {
  padding: 20px;
  font-family: 'Inter', sans-serif;
  background-color: #f4f7fa;
  min-height: calc(100vh - 60px); /* Adjust based on your header/footer height */
  display: flex;
  flex-direction: column;
  align-items: center;
}

h2 {
  color: #333;
  margin-bottom: 30px;
  text-align: center;
  font-size: 2.5em;
  font-weight: 700;
  padding-bottom: 15px;
  border-bottom: 2px solid #eee;
  width: 100%;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
}

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh; /* Occupy a good portion of the screen */
  width: 100%;
  text-align: center;
  color: #555;
  font-size: 1.1em;
  padding: 50px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.loading-spinner-small {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(66, 185, 131, 0.3);
  border-radius: 50%;
  border-top-color: #42b983;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-state .error-message {
  color: #dc3545;
  font-weight: bold;
  margin-bottom: 10px;
}

.progress-content {
  width: 100%;
  max-width: 1200px; /* Wider content area */
  background-color: #ffffff;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.progress-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); /* More cards, smaller min width */
  gap: 25px; /* Slightly increased gap */
  margin-bottom: 40px; /* More space below overview */
}

.progress-card {
  background-color: #f8fcfb; /* Lighter background */
  border-radius: 12px;
  padding: 25px; /* More padding */
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  text-align: center;
  border: 1px solid #e0ffe0; /* Light green border */
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.progress-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
}

.progress-card h3 {
  margin-top: 0;
  color: #555;
  font-size: 1.3em;
  margin-bottom: 15px;
}

.progress-value {
  font-size: 3em; /* Larger value */
  font-weight: 800; /* Bolder value */
  margin: 10px 0;
  color: #42b983; /* Green color for values */
  line-height: 1; /* Tighter line height */
}

.progress-bar {
  height: 12px; /* Thicker bar */
  background-color: #e0e0e0; /* Neutral background */
  border-radius: 6px;
  margin: 15px 0;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #42b983; /* Green fill */
  transition: width 0.8s ease-out; /* Slower, smoother transition */
  border-radius: 6px; /* Match container */
}

.progress-percent {
  font-size: 1.3em; /* Larger percentage */
  color: #2c3e50; /* Darker color for percentage */
  font-weight: bold;
}

/* Specific colors for different cards */
.notes-card .progress-value, .notes-card .progress-percent { color: #5a7dcb; }
.notes-card .progress-fill { background-color: #5a7dcb; }
.notes-card { border-color: #eaf1ff; } /* Light blue border */

.exercises-card .progress-value, .exercises-card .progress-percent { color: #e09b3d; }
.exercises-card .progress-fill { background-color: #e09b3d; }
.exercises-card { border-color: #fff4e0; } /* Light orange border */

.quizzes-card .progress-value, .quizzes-card .progress-percent { color: #8e44ad; }
.quizzes-card .progress-fill { background-color: #8e44ad; }
.quizzes-card { border-color: #f7e9ff; } /* Light purple border */

.tutorials-card .progress-value, .tutorials-card .progress-percent { color: #3498db; }
.tutorials-card .progress-fill { background-color: #3498db; }
.tutorials-card { border-color: #e0f2f7; } /* Light blue border for tutorials */


.progress-details {
  display: grid;
  grid-template-columns: 1fr 2fr; /* Activity on left, chart on right */
  gap: 30px;
}

.recent-activity {
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  border: 1px solid #eee;
}
.recent-activity h3 {
  margin-top: 0;
  font-size: 1.5em;
  color: #333;
  margin-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 10px;
}
.recent-activity ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.recent-activity li {
  padding: 12px 0;
  border-bottom: 1px solid #f9f9f9; /* Lighter border */
  display: grid;
  grid-template-columns: 90px 1fr 100px auto; /* Adjust column widths */
  gap: 10px;
  align-items: center;
  font-size: 0.95em;
  color: #444;
}
.recent-activity li:last-child {
  border-bottom: none;
}
.activity-type {
  font-weight: 700; /* Bolder type */
  color: #42b983; /* Green for type */
  text-transform: uppercase;
  font-size: 0.85em;
}
.activity-title {
  color: #2c3e50; /* Darker title */
  font-weight: 500;
}
.activity-date {
  color: #777;
  font-size: 0.85em;
}
.activity-score {
  font-weight: bold;
  color: #3498db; /* Blue for scores */
}
.no-activity {
  text-align: center;
  color: #777;
  padding: 20px;
  font-style: italic;
}

.performance-chart {
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  border: 1px solid #eee;
  display: flex;
  flex-direction: column;
  justify-content: center; /* Center chart vertically if space allows */
}
.performance-chart h3 {
  margin-top: 0;
  font-size: 1.5em;
  color: #333;
  margin-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 10px;
}
.performance-chart canvas {
  max-height: 400px; /* Limit chart height */
  width: 100% !important; /* Override Chart.js inline styles */
  height: auto !important; /* Maintain aspect ratio */
}
.chart-error-message {
  text-align: center;
  color: #e74c3c;
  font-style: italic;
  margin-top: 20px;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .progress-overview {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }
  .progress-details {
    grid-template-columns: 1fr; /* Stack recent activity and chart */
  }
}

@media (max-width: 768px) {
  .progress-container {
    padding: 15px;
  }
  h2 {
    font-size: 2em;
    margin-bottom: 25px;
  }
  .progress-content {
    padding: 25px;
  }
  .progress-overview {
    grid-template-columns: 1fr; /* Stack cards vertically on smaller screens */
    gap: 20px;
  }
  .progress-card {
    padding: 20px;
  }
  .progress-value {
    font-size: 2.5em;
  }
  .progress-percent {
    font-size: 1.1em;
  }
  .recent-activity h3, .performance-chart h3 {
    font-size: 1.3em;
  }
  .recent-activity li {
    grid-template-columns: auto 1fr; /* Simpler layout for small screens */
    gap: 5px;
    font-size: 0.9em;
    flex-wrap: wrap;
  }
  .activity-type {
    width: 100%; /* Take full width */
    text-align: left;
  }
  .activity-date, .activity-score {
    flex-basis: 48%; /* Take half width */
    text-align: right;
  }
}

@media (max-width: 480px) {
  .progress-container {
    padding: 10px;
  }
  h2 {
    font-size: 1.8em;
  }
  .progress-content {
    padding: 15px;
  }
  .progress-card h3 {
    font-size: 1.1em;
  }
  .progress-value {
    font-size: 2.2em;
  }
  .progress-percent {
    font-size: 1em;
  }
  .recent-activity li {
    font-size: 0.8em;
  }
}
</style>
