<script setup>
import { ref, onMounted } from 'vue';
import { auth } from '@/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'vue-router';
import Sidebar from '@/components/Sidebar.vue';

const router = useRouter();
const currentUser = ref(null);
const userRole = ref('');

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    currentUser.value = user;
    if (user) {
      // Determine user role
      if (user.email === 'tabithalomuke@gmail.com') {
        userRole.value = 'admin';
      } else if (user.email.includes('@teacher.')) {
        userRole.value = 'teacher';
      } else {
        userRole.value = 'student';
      }
    }
  });
});

const handleLogout = async () => {
  try {
    await signOut(auth);
    router.push('/');
  } catch (error) {
    console.error('Logout error:', error);
  }
};
</script>

<template>
  <div class="app-container">
    <!-- Layout for authenticated users -->
    <div v-if="currentUser" class="authenticated-layout">
      <!-- Fixed Sidebar -->
      <Sidebar :role="userRole" />
      
      <!-- Main content wrapper -->
      <div class="main-wrapper">
        <!-- Header -->
        <header class="app-header">
          <div class="header-content">
            <div class="header-left">
              <!-- Page title will be updated based on route if needed -->
            </div>
            <div class="profile-section">
              <span class="user-email">{{ currentUser.email }}</span>
              <button @click="handleLogout" class="logout-btn">Logout</button>
            </div>
          </div>
        </header>
        
        <!-- Content Area -->
        <main class="content-area">
          <router-view />
        </main>
      </div>
    </div>
    
    <!-- Show just router view for non-authenticated pages -->
    <router-view v-else />
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.authenticated-layout {
  display: flex;
  min-height: 100vh;
}

.main-wrapper {
  flex: 1;
  margin-left: 250px; /* Same as sidebar width */
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  background-color: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 90;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
}

.header-left {
  flex: 1;
}

.profile-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-email {
  color: #2c3e50;
  font-size: 0.9rem;
  font-weight: 500;
  background-color: #f8f9fa;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: 1px solid #e9ecef;
}

.logout-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.logout-btn:hover {
  background-color: #c0392b;
}

.content-area {
  flex: 1;
  padding: 2rem;
  background-color: #f8f9fa;
  overflow-y: auto;
}

/* Responsive design */
@media (max-width: 768px) {
  .main-wrapper {
    margin-left: 0;
  }
  
  .header-content {
    padding: 1rem;
  }
  
  .content-area {
    padding: 1rem;
  }
}
</style>