Let's enhance your admin dashboard\! To display a welcome message with the user's name and user statistics, we'll need to:

1.  **Fetch the current user's information**: Get their display name or email.
2.  **Fetch user roles statistics**: Query Firestore to count users by their `role` field (admin, teacher, student).

Here's the adjusted `Dashboard.vue` code:

-----

```vue
<template>
  <div class="layout">
    <SideBar role="admin" />
    <div class="content">
      <div v-if="currentUser" class="welcome-section">
        <h1>Welcome, {{ currentUserDisplayName }}!</h1>
        <p class="dashboard-intro">Here's a quick overview of user statistics in the system.</p>
      </div>

      <div class="stats-cards">
        <div class="stat-card">
          <h3>Total Users</h3>
          <p class="stat-number">{{ totalUsers }}</p>
        </div>
        <div class="stat-card">
          <h3>Admins</h3>
          <p class="stat-number">{{ adminCount }}</p>
        </div>
        <div class="stat-card">
          <h3>Teachers</h3>
          <p class="stat-number">{{ teacherCount }}</p>
        </div>
        <div class="stat-card">
          <h3>Students</h3>
          <p class="stat-number">{{ studentCount }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SideBar from '../../components/SideBar.vue';
import { ref, onMounted, computed } from 'vue';
import { auth, db } from '@/firebase'; // Assuming your firebase config is in '@/firebase'
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';

export default {
  components: { SideBar },
  setup() {
    const currentUser = ref(null);
    const adminCount = ref(0);
    const teacherCount = ref(0);
    const studentCount = ref(0);
    const totalUsers = ref(0);

    // Computed property for display name
    const currentUserDisplayName = computed(() => {
      if (currentUser.value) {
        return currentUser.value.displayName || currentUser.value.email;
      }
      return 'Guest';
    });

    // Function to fetch user statistics
    const fetchUserStats = async () => {
      try {
        const usersCollectionRef = collection(db, 'users');
        const querySnapshot = await getDocs(usersCollectionRef);

        let admin = 0;
        let teacher = 0;
        let student = 0;

        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          if (userData.role === 'admin') {
            admin++;
          } else if (userData.role === 'teacher') {
            teacher++;
          } else if (userData.role === 'student') {
            student++;
          }
        });

        adminCount.value = admin;
        teacherCount.value = teacher;
        studentCount.value = student;
        totalUsers.value = querySnapshot.size;

      } catch (error) {
        console.error('Error fetching user statistics:', error);
      }
    };

    onMounted(() => {
      onAuthStateChanged(auth, (user) => {
        currentUser.value = user;
      });
      fetchUserStats(); // Fetch stats when component mounts
    });

    return {
      currentUser,
      currentUserDisplayName,
      adminCount,
      teacherCount,
      studentCount,
      totalUsers,
    };
  },
};
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh; /* Ensure layout takes full viewport height */
}

.content {
  flex: 1;
  padding: 20px 40px; /* Increased padding for better spacing */
  background-color: #f8f9fa; /* Light background for content area */
}

.welcome-section {
  margin-bottom: 30px;
  background-color: #e9f7ef; /* Light green background for welcome */
  padding: 25px 30px;
  border-radius: 10px;
  border: 1px solid #d4edda;
  color: #155724;
}

.welcome-section h1 {
  color: #2c3e50; /* Darker heading for welcome */
  margin-bottom: 10px;
  font-size: 2.2em; /* Slightly larger welcome heading */
}

.dashboard-intro {
  font-size: 1.1em;
  color: #333;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); /* Responsive grid for cards */
  gap: 25px; /* Spacing between cards */
  margin-bottom: 40px;
}

.stat-card {
  background-color: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); /* Softer shadow */
  text-align: center;
  transition: transform 0.2s ease-in-out;
  border: 1px solid #e0e0e0;
}

.stat-card:hover {
  transform: translateY(-5px); /* Lift effect on hover */
}

.stat-card h3 {
  color: #34495e;
  margin-bottom: 15px;
  font-size: 1.3em;
}

.stat-number {
  font-size: 2.8em; /* Larger numbers for stats */
  font-weight: bold;
  color: #007bff; /* Blue color for numbers */
}

.stat-card:nth-child(2) .stat-number { color: #28a745; /* Green for Admins */ }
.stat-card:nth-child(3) .stat-number { color: #ffc107; /* Yellow for Teachers */ }
.stat-card:nth-child(4) .stat-number { color: #17a2b8; /* Cyan for Students */ }


.dashboard-widgets {
  background-color: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
}

.dashboard-widgets h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.8em;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

.widget {
  margin-top: 25px;
  background-color: #fcfcfc;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.widget h3 {
  color: #34495e;
  margin-bottom: 15px;
  font-size: 1.4em;
}

.widget ul {
  list-style: none;
  padding: 0;
}

.widget li {
  padding: 8px 0;
  border-bottom: 1px dashed #eee;
  color: #555;
}

.widget li:last-child {
  border-bottom: none;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .content {
    padding: 20px;
  }
  .stats-cards {
    grid-template-columns: 1fr; /* Stack cards on small screens */
  }
  .welcome-section h1 {
    font-size: 1.8em;
  }
}
</style>
```