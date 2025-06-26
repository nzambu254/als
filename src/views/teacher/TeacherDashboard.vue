<template>
  <div class="layout">
    <SideBar role="teacher" />
    <div class="content">
      <h1 v-if="currentUser">Welcome, {{ currentUser.displayName || currentUser.email }}!</h1>
      <h1 v-else>Welcome to Teacher Dashboard</h1>

      <div class="stats-section">
        <h2>Student Statistics</h2>
        <div v-if="loadingStats" class="loading-stats">Loading student statistics...</div>
        <div v-else-if="statsError" class="error-stats">{{ statsError }}</div>
        <div v-else class="stat-cards">
          <div class="stat-card">
            <h3>Total Students</h3>
            <p>{{ studentStats.totalStudents }}</p>
          </div>
          <!-- Add more student stats here if needed, e.g., active, inactive -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SideBar from '../../components/SideBar.vue';
import { db, auth } from '@/firebase'; // Assuming '@/firebase' exports db and auth
import { collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default {
  name: 'TeacherDashboard',
  components: { SideBar },
  data() {
    return {
      currentUser: null,
      studentStats: {
        totalStudents: 0,
      },
      loadingStats: false,
      statsError: '',
    };
  },
  async created() {
    // Listen for auth state changes to get the current user
    onAuthStateChanged(auth, async (user) => {
      this.currentUser = user;
      if (user) {
        // If a user is logged in, fetch student statistics
        await this.fetchStudentStats();
      } else {
        // Clear stats if no user is logged in
        this.studentStats.totalStudents = 0;
      }
    });
  },
  methods: {
    async fetchStudentStats() {
      this.loadingStats = true;
      this.statsError = '';
      try {
        // Query the 'users' collection for documents where 'role' is 'student'
        const studentsQuery = query(collection(db, 'users'), where('role', '==', 'student'));
        const querySnapshot = await getDocs(studentsQuery);
        this.studentStats.totalStudents = querySnapshot.size; // Get the count of student documents
      } catch (err) {
        this.statsError = 'Failed to load student statistics. Please try again.';
        console.error('Error fetching student stats:', err);
      } finally {
        this.loadingStats = false;
      }
    },
  },
};
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh; /* Ensure it takes full viewport height */
  font-family: 'Inter', sans-serif; /* Consistent font */
}
.content {
  flex: 1;
  padding: 30px;
  background-color: #f8f9fa; /* Light background */
  overflow-y: auto; /* Allow scrolling if content is long */
}
h1 {
  color: #333;
  margin-bottom: 30px;
  text-align: center;
  font-size: 2.5em;
  font-weight: 700;
  border-bottom: 2px solid #eee;
  padding-bottom: 15px;
}

.stats-section {
  margin-top: 40px;
  background-color: #ffffff;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
}

.stats-section h2 {
  color: #555;
  margin-bottom: 25px;
  text-align: center;
  font-size: 1.8em;
  font-weight: 600;
}

.loading-stats, .error-stats {
  text-align: center;
  padding: 20px;
  font-size: 1.1em;
  color: #666;
}

.error-stats {
  color: #dc3545;
  font-weight: bold;
}

.stat-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

.stat-card {
  background-color: #e0f7fa; /* Light blue background for cards */
  color: #007bb6; /* Darker blue text */
  padding: 25px 30px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  flex: 1;
  min-width: 200px; /* Minimum width for cards */
  max-width: 300px; /* Maximum width for cards */
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.stat-card h3 {
  font-size: 1.4em;
  margin-bottom: 10px;
  color: #0056b3; /* Slightly darker blue for titles */
}

.stat-card p {
  font-size: 2.8em;
  font-weight: bold;
  line-height: 1;
  color: #007bff; /* Primary blue for numbers */
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .layout {
    flex-direction: column;
  }
  .content {
    padding: 20px 15px;
  }
  h1 {
    font-size: 2em;
    margin-bottom: 20px;
  }
  .stats-section {
    padding: 20px;
  }
  .stats-section h2 {
    font-size: 1.5em;
    margin-bottom: 20px;
  }
  .stat-card {
    min-width: 150px;
    padding: 20px;
  }
  .stat-card p {
    font-size: 2.2em;
  }
}

@media (max-width: 480px) {
  h1 {
    font-size: 1.8em;
  }
  .stat-cards {
    flex-direction: column;
    align-items: center;
  }
  .stat-card {
    width: 90%;
    max-width: none;
  }
}
</style>
