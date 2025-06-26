To achieve the desired layout where the logout button appears below the user's email in the top-right corner, we can adjust the styling of the `.profile-section` and its child elements. I'll also make a few other minor UI adjustments for better spacing and alignment.

Here's the adjusted `App.vue` code:

```vue
<script setup>
import { ref, onMounted } from 'vue';
import { auth, db } from '@/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'vue-router';
import Sidebar from '@/components/Sidebar.vue';

const router = useRouter();
const currentUser = ref(null);
const userRole = ref('');

// Function to get user role from Firestore (same as in router)
const getUserRole = async (user) => {
  if (!user) return null;

  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));

    if (!userDoc.exists()) {
      console.warn('User document not found in Firestore');
      return null;
    }

    const userData = userDoc.data();
    return userData.role || null;
  } catch (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
};

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    currentUser.value = user;
    if (user) {
      // Fetch user role from Firestore
      try {
        const role = await getUserRole(user);
        if (role) {
          userRole.value = role;
        } else {
          console.warn('User role not found, logging out');
          await signOut(auth);
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching user role in App.vue:', error);
        userRole.value = 'student'; // Fallback
      }
    } else {
      userRole.value = '';
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
    <div v-if="currentUser" class="authenticated-layout">
      <Sidebar :role="userRole" />

      <div class="main-wrapper">
        <header class="app-header">
          <div class="header-content">
            <div class="header-left">
              </div>
            <div class="profile-section">
              <span class="user-email">{{ currentUser.email }}</span>
              <button @click="handleLogout" class="logout-btn">Logout</button>
            </div>
          </div>
        </header>

        <main class="content-area">
          <router-view />
        </main>
      </div>
    </div>

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
  flex-direction: column; /* Stack children vertically */
  align-items: flex-end; /* Align items to the right */
  gap: 0.5rem; /* Reduce gap between email and button */
}

.user-email {
  color: #2c3e50;
  font-size: 0.9rem;
  font-weight: 500;
  background-color: #1be209;
  padding: 0.4rem 0.8rem; /* Slightly adjust padding */
  border-radius: 20px;
  border: 1px solid #e9ecef;
  white-space: nowrap; /* Prevent email from wrapping */
}

.logout-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 0.4rem 0.8rem; /* Slightly adjust padding */
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem; /* Slightly smaller font size for button */
  font-weight: 500;
  transition: background-color 0.3s ease;
  width: fit-content; /* Ensure button width fits its content */
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

  .profile-section {
    align-items: center; /* Center items on smaller screens if preferred, or keep flex-end */
  }
}
</style>
```