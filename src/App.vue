<script setup>
import { ref, onMounted } from 'vue';
import { auth } from '@/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'vue-router';

const router = useRouter();
const currentUser = ref(null);

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    currentUser.value = user;
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
    <header v-if="currentUser" class="app-header">
      <div class="profile-section">
        <span class="user-email">{{ currentUser.email }}</span>
        <button @click="handleLogout" class="logout-btn">Logout</button>
      </div>
    </header>
    <router-view />
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background-color: #2c3e50;
  padding: 1rem;
  display: flex;
  justify-content: flex-end;
}

.profile-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-email {
  color: white;
  font-size: 0.9rem;
}

.logout-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.logout-btn:hover {
  background-color: #c0392b;
}
</style>