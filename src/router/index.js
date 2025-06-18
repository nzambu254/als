import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '@/firebase'
import { onAuthStateChanged } from 'firebase/auth'

// Import components
import LandingPage from '../views/LandingPage.vue'
import Login from '../views/auth/Login.vue'

// Student
import StudentDashboard from '../views/student/StudentDashboard.vue'
import Tutorials from '../views/student/Tutorials.vue'
import Practice from '../views/student/Practice.vue'
import Quizzes from '../views/student/Quizzes.vue'
import Progress from '../views/student/Progress.vue'
import AnnouncementsStudent from '../views/student/Announcements.vue'

// Teacher
import TeacherDashboard from '../views/teacher/TeacherDashboard.vue'
import ManageStudents from '../views/teacher/ManageStudents.vue'
import UploadContent from '../views/teacher/UploadContent.vue'
import CreateExercises from '../views/teacher/CreateExercises.vue'
import Announcements from '../views/teacher/Announcements.vue'

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

  // Student Routes
  {
    path: '/student',
    name: 'StudentDashboard',
    component: StudentDashboard,
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/student/tutorials',
    name: 'StudentTutorials',
    component: Tutorials,
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/student/practice',
    name: 'StudentPractice',
    component: Practice,
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/student/quizzes',
    name: 'StudentQuizzes',
    component: Quizzes,
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/student/progress',
    name: 'StudentProgress',
    component: Progress,
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/student/announcements',
    name: 'StudentAnnouncements',
    component: AnnouncementsStudent,
    meta: { requiresAuth: true, role: 'student' }
  },

  // Teacher Routes
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
  {
    path: '/teacher/announcements',
    name: 'TeacherAnnouncements',
    component: Announcements,
    meta: { requiresAuth: true, role: 'teacher' }
  },

  // Admin Routes
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
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Get current user function
const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      unsubscribe();
      resolve(user);
    }, reject);
  });
};

// Get user role function
const getUserRole = (user) => {
  if (!user) return null;
  if (user.email === 'tabithalomuke@gmail.com') {
    return 'admin';
  } else if (user.email.includes('@teacher.')) {
    return 'teacher';
  } else {
    return 'student';
  }
};

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest);
  const requiredRole = to.meta.role;
  
  try {
    const currentUser = await getCurrentUser();
    
    if (requiresAuth && !currentUser) {
      // Redirect to login if authentication is required but user is not logged in
      next('/login');
    } else if (requiresGuest && currentUser) {
      // Redirect to appropriate dashboard if user is logged in but trying to access guest pages
      const userRole = getUserRole(currentUser);
      next(`/${userRole}`);
    } else if (requiresAuth && requiredRole) {
      // Check if user has the required role
      const userRole = getUserRole(currentUser);
      if (userRole === requiredRole) {
        next();
      } else {
        // Redirect to user's appropriate dashboard
        next(`/${userRole}`);
      }
    } else {
      next();
    }
  } catch (error) {
    console.error('Router guard error:', error);
    next('/login');
  }
});

export default router