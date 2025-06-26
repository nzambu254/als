import { createRouter, createWebHistory } from 'vue-router'
import { auth, db } from '@/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

// Import components
import LandingPage from '../views/LandingPage.vue'
import Login from '../views/auth/Login.vue'

// Student
import StudentDashboard from '../views/student/StudentDashboard.vue'
import ViewContent from '../views/student/ViewContent.vue'
import PracticeQuizzes from '../views/student/PracticeQuizzes.vue'
import Progress from '../views/student/Progress.vue'

// Teacher
import TeacherDashboard from '../views/teacher/TeacherDashboard.vue'
import ManageStudents from '../views/teacher/ManageStudents.vue'
import UploadContent from '../views/teacher/UploadContent.vue'
import CreateExercises from '../views/teacher/CreateExercises.vue'

// Admin
import AdminDashboard from '../views/admin/AdminDashboard.vue'
import UserManagement from '../views/admin/UserManagement.vue'
import ContentOversight from '../views/admin/ContentOversight.vue'
import SystemMaintenance from '../views/admin/SystemMaintenance.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: LandingPage,
    meta: { hideSidebar: true, requiresGuest: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { hideSidebar: true, requiresGuest: true }
  },

  // Student Routes - Matching sidebar exactly
  {
    path: '/student',
    name: 'StudentDashboard',
    component: StudentDashboard,
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/student/view-content',
    name: 'StudentViewContent',
    component: ViewContent,
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/student/practice-quizzes',
    name: 'StudentPracticeQuizzes',
    component: PracticeQuizzes,
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/student/progress',
    name: 'StudentProgress',
    component: Progress,
    meta: { requiresAuth: true, role: 'student' }
  },

  // Teacher Routes - Matching sidebar exactly
  {
    path: '/teacher',
    name: 'TeacherDashboard',
    component: TeacherDashboard,
    meta: { requiresAuth: true, role: 'teacher' }
  },
  {
    path: '/teacher/manage-students',
    name: 'ManageStudents',
    component: ManageStudents,
    meta: { requiresAuth: true, role: 'teacher' }
  },
  {
    path: '/teacher/upload-content',
    name: 'UploadContent',
    component: UploadContent,
    meta: { requiresAuth: true, role: 'teacher' }
  },
  {
    path: '/teacher/create-exercises',
    name: 'CreateExercises',
    component: CreateExercises,
    meta: { requiresAuth: true, role: 'teacher' }
  },

  // Admin Routes - Matching sidebar exactly
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/user-management',
    name: 'UserManagement',
    component: UserManagement,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/content-oversight',
    name: 'ContentOversight',
    component: ContentOversight,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/system-maintenance',
    name: 'SystemMaintenance',
    component: SystemMaintenance,
    meta: { requiresAuth: true, role: 'admin' }
  },

  // Catch-all route for 404 errors
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Get current user with authentication state
const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      unsubscribe();
      resolve(user);
    }, reject);
  });
};

// Get user role from Firestore
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

// Enhanced navigation guard with strict role checking
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest);
  const requiredRole = to.meta.role;
  
  try {
    const currentUser = await getCurrentUser();
    
    // Handle guest-only pages (landing page, login)
    if (requiresGuest && currentUser) {
      console.log('User already logged in, redirecting to dashboard');
      const userRole = await getUserRole(currentUser);
      
      if (userRole) {
        next(`/${userRole}`);
      } else {
        console.warn('User role not found, logging out');
        await auth.signOut();
        next('/login');
      }
      return;
    }
    
    // Handle pages that require authentication
    if (requiresAuth && !currentUser) {
      console.log('Authentication required, redirecting to login');
      next('/login');
      return;
    }
    
    // Handle role-based access control
    if (requiresAuth && requiredRole) {
      const userRole = await getUserRole(currentUser);
      
      if (!userRole) {
        console.warn('User role not found, logging out');
        await auth.signOut();
        next('/login');
        return;
      }
      
      // Strict role checking - users can ONLY access their own role's routes
      if (userRole !== requiredRole) {
        console.log(`Access denied. Required: ${requiredRole}, User has: ${userRole}. Redirecting to user's dashboard.`);
        next(`/${userRole}`);
        return;
      }
      
      // Additional path validation to ensure users stay within their role boundaries
      const pathRole = to.path.split('/')[1]; // Extract role from path like /student/view-content
      if (pathRole && pathRole !== userRole && ['student', 'teacher', 'admin'].includes(pathRole)) {
        console.log(`Path role mismatch. User role: ${userRole}, Path role: ${pathRole}. Redirecting to user's dashboard.`);
        next(`/${userRole}`);
        return;
      }
    }
    
    // Allow access if all checks pass
    next();
    
  } catch (error) {
    console.error('Router navigation guard error:', error);
    // On error, redirect to login for safety
    next('/login');
  }
});

// Handle router errors
router.onError((error) => {
  console.error('Router error:', error);
});

// Add navigation failure handling
router.afterEach((to, from, failure) => {
  if (failure) {
    console.error('Navigation failed:', failure);
  }
});

export default router