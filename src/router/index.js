import { createRouter, createWebHistory } from 'vue-router'
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
    component: LandingPage 
  },
  { 
    path: '/login', 
    name: 'Login',
    component: Login 
  },

  // Student Routes
  { 
    path: '/student', 
    name: 'StudentDashboard',
    component: StudentDashboard 
  },
  { 
    path: '/student/tutorials', 
    name: 'StudentTutorials',
    component: Tutorials 
  },
  { 
    path: '/student/practice', 
    name: 'StudentPractice',
    component: Practice 
  },
  { 
    path: '/student/quizzes', 
    name: 'StudentQuizzes',
    component: Quizzes 
  },
  { 
    path: '/student/progress', 
    name: 'StudentProgress',
    component: Progress 
  },
  { 
    path: '/student/announcements', 
    name: 'StudentAnnouncements',
    component: AnnouncementsStudent 
  },

  // Teacher Routes
  { 
    path: '/teacher', 
    name: 'TeacherDashboard',
    component: TeacherDashboard 
  },
  { 
    path: '/teacher/manage-students', 
    name: 'ManageStudents',
    component: ManageStudents 
  },
  { 
    path: '/teacher/upload-content', 
    name: 'UploadContent',
    component: UploadContent 
  },
  { 
    path: '/teacher/create-exercises', 
    name: 'CreateExercises',
    component: CreateExercises 
  },
  { 
    path: '/teacher/announcements', 
    name: 'TeacherAnnouncements',
    component: Announcements 
  },

  // Admin Routes
  { 
    path: '/admin', 
    name: 'AdminDashboard',
    component: AdminDashboard 
  },
  { 
    path: '/admin/user-management', 
    name: 'UserManagement',
    component: UserManagement 
  },
  { 
    path: '/admin/content-oversight', 
    name: 'ContentOversight',
    component: ContentOversight 
  },
  { 
    path: '/admin/system-maintenance', 
    name: 'SystemMaintenance',
    component: SystemMaintenance 
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router