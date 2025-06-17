<template>
  <aside class="sidebar">
    <ul>
      <li v-for="item in links" :key="item.name">
        <router-link :to="item.route">{{ item.name }}</router-link>
      </li>
    </ul>
  </aside>
</template>

<script>
export default {
  props: ['role'],
  computed: {
    links() {
      if (this.role === 'admin') {
        return [
          { name: 'Dashboard', route: '/admin' },
          { name: 'User Management', route: '/admin/user-management' },
          { name: 'Content Oversight', route: '/admin/content-oversight' },
          { name: 'System Maintenance', route: '/admin/system-maintenance' }
        ]
      } else if (this.role === 'teacher') {
        return [
          { name: 'Dashboard', route: '/teacher' },
          { name: 'Manage Students', route: '/teacher/manage-students' },
          { name: 'Upload Content', route: '/teacher/upload-content' },
          { name: 'Create Exercises', route: '/teacher/create-exercises' },
          { name: 'Make Announcements', route: '/teacher/make-announcements' }
        ]
      } else if (this.role === 'student') {
        return [
          { name: 'Dashboard', route: '/student' },
          { name: 'Tutorials', route: '/student/tutorials' },
          { name: 'Practice Exercises', route: '/student/practice' },
          { name: 'Take Quizzes', route: '/student/quizzes' },
          { name: 'Track Progress', route: '/student/progress' },
          { name: 'Announcements', route: '/student/announcements' }
        ]
      }
      return []
    }
  }
}
</script>

<style scoped>
.sidebar {
  width: 200px;
  background: #f4f4f4;
  height: 100vh;
  padding: 20px;
}
</style>
