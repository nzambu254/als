<template>
  <div class="layout">
    <SideBar role="student" />
    <div class="content">
      <div v-if="loadingUser || loadingCounts" class="loading-state">
        <div class="loading-spinner-small"></div>
        <p>Loading dashboard data...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <p class="error-message">{{ error }}</p>
        <p>Please try refreshing the page or contact support.</p>
      </div>

      <div v-else class="dashboard-content">
        <h1 class="welcome-heading">Welcome, {{ userName || 'Student' }}!</h1>

        <div class="summary-cards">
          <div class="card notes-card">
            <div class="card-icon">📚</div>
            <h3 class="card-title">Available Notes</h3>
            <p class="card-count">{{ notesCount }}</p>
          </div>

          <div class="card exercises-card">
            <div class="card-icon">🧠</div>
            <h3 class="card-title">Available Exercises</h3>
            <p class="card-count">{{ exercisesCount }}</p>
          </div>
        </div>

        <div class="dashboard-info">
          <p class="info-text">Explore a wide range of learning materials tailored just for you.</p>
          <p class="info-text">Use the sidebar to navigate through notes and exercises.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SideBar from '../../components/SideBar.vue';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '@/firebase'; // Assuming '@/firebase' correctly points to your Firebase initialization
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

export default {
  name: 'StudentDashboard',
  components: { SideBar },
  data() {
    return {
      userName: null,
      notesCount: 0,
      exercisesCount: 0,
      loadingUser: true,
      loadingCounts: true,
      error: null,
      authStateListener: null, // To store the unsubscribe function
    };
  },
  async created() {
    // Initialize Auth listener
    const auth = getAuth();
    this.authStateListener = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is logged in
        await this.fetchUserData(user.uid);
        await this.fetchContentCounts();
      } else {
        // User is not logged in, or logged out
        this.userName = null;
        this.notesCount = 0;
        this.exercisesCount = 0;
        this.loadingUser = false;
        this.loadingCounts = false;
        this.error = 'Please log in to view your dashboard.';
        // Optionally redirect to login if not already there
        if (this.$router.currentRoute.path !== '/login') {
          this.$router.push('/login');
        }
      }
    });
  },
  beforeUnmount() {
    // Clean up the auth state listener when the component is destroyed
    if (this.authStateListener) {
      this.authStateListener();
    }
  },
  methods: {
    async fetchUserData(uid) {
      this.loadingUser = true;
      this.error = null;
      try {
        const userDocRef = doc(db, 'users', uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          this.userName = userDocSnap.data().name || 'User';
        } else {
          this.userName = 'User';
          console.warn('User document not found for UID:', uid);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        this.error = 'Failed to load user data.';
      } finally {
        this.loadingUser = false;
      }
    },
    async fetchContentCounts() {
      this.loadingCounts = true;
      this.error = null;
      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

      try {
        // Fetch Notes count
        const notesCollectionRef = collection(db, `artifacts/${appId}/public/data/notes`);
        const notesSnapshot = await getDocs(notesCollectionRef);
        this.notesCount = notesSnapshot.size;

        // Fetch Exercises from the 'exercises' collection
        const exercisesCollectionRef = collection(db, 'exercises');
        const exercisesSnapshot = await getDocs(exercisesCollectionRef);
        let totalExercises = exercisesSnapshot.size;

        // Fetch Exercises from the artifacts path, if they are separate
        const uploadedExercisesCollectionRef = collection(db, `artifacts/${appId}/public/data/exercises`);
        const uploadedExercisesSnapshot = await getDocs(uploadedExercisesCollectionRef);

        // Combine unique exercises from both sources.
        // It's crucial to ensure items are truly unique if merging.
        // For a simple count, we can just add them if we're certain they are distinct sets.
        // If there's potential overlap, a Set-based approach would be needed.
        // For now, assuming they might contain distinct exercises or we want a total sum:
        totalExercises += uploadedExercisesSnapshot.size; // Add count from the second source

        this.exercisesCount = totalExercises;

      } catch (err) {
        console.error('Error fetching content counts:', err);
        this.error = 'Failed to load content counts.';
      } finally {
        this.loadingCounts = false;
      }
    },
  },
};
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  background-color: #f4f7fa;
}

.content {
  flex: 1;
  padding: 30px;
  background-color: #f4f7fa;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start; /* Align content to the top */
  overflow-y: auto; /* Enable scrolling if content overflows */
}

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  text-align: center;
  color: #555;
  font-size: 1.1em;
  padding: 50px;
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

.dashboard-content {
  width: 100%;
  max-width: 900px; /* Max width for content for better readability */
  background-color: #ffffff;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.welcome-heading {
  font-size: 2.8em;
  color: #2c3e50;
  margin-bottom: 40px;
  font-weight: 700;
  letter-spacing: -0.03em;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.05);
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); /* Responsive grid */
  gap: 30px;
  margin-bottom: 40px;
}

.card {
  background-color: #f8fcfb; /* Lighter background for cards */
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #e0ffe0; /* Light green border */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.card-icon {
  font-size: 3em; /* Larger icon */
  margin-bottom: 15px;
}

.card-title {
  font-size: 1.4em;
  color: #333;
  margin-bottom: 10px;
  font-weight: 600;
}

.card-count {
  font-size: 3.5em;
  font-weight: 800;
  color: #42b983; /* Green color for counts */
  line-height: 1;
}

.notes-card .card-icon { color: #5a7dcb; /* Blueish for notes */ }
.exercises-card .card-icon { color: #e09b3d; /* Orangeish for exercises */ }

.dashboard-info {
  margin-top: 30px;
  padding: 25px;
  background-color: #eaf7ff; /* Light blue info box */
  border-left: 5px solid #3498db;
  border-radius: 8px;
  text-align: left;
}

.info-text {
  font-size: 1.1em;
  color: #444;
  line-height: 1.6;
  margin-bottom: 10px;
}

.info-text:last-child {
  margin-bottom: 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .content {
    padding: 20px;
  }
  .welcome-heading {
    font-size: 2.2em;
    margin-bottom: 30px;
  }
  .summary-cards {
    grid-template-columns: 1fr; /* Stack cards on smaller screens */
  }
  .card {
    padding: 20px;
  }
  .card-count {
    font-size: 3em;
  }
  .dashboard-content {
    padding: 25px;
  }
  .info-text {
    font-size: 1em;
  }
}

@media (max-width: 480px) {
  .content {
    padding: 15px;
  }
  .welcome-heading {
    font-size: 1.8em;
    margin-bottom: 25px;
  }
  .card-icon {
    font-size: 2.5em;
  }
  .card-title {
    font-size: 1.2em;
  }
  .card-count {
    font-size: 2.8em;
  }
  .dashboard-content {
    padding: 20px;
  }
}
</style>

