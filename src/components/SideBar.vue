<template>
  <aside class="sidebar">
    <!-- User Profile Section -->
    <div class="sidebar-profile">
      <div class="profile-avatar">
        <span>{{ role.charAt(0).toUpperCase() }}</span>
      </div>
      <div class="profile-info">
        <h4>{{ role.charAt(0).toUpperCase() + role.slice(1) }}</h4>
        <span class="profile-status">Online</span>
      </div>
    </div>
    
    <!-- Navigation Menu -->
    <nav class="sidebar-nav">
      <ul class="sidebar-menu">
        <li v-for="item in links" :key="item.name" class="menu-item">
          <router-link :to="item.route" class="menu-link" active-class="active-link">
            <span class="menu-icon">{{ getIcon(item.name) }}</span>
            <span class="menu-text">{{ item.name }}</span>
          </router-link>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script>
export default {
  name: 'Sidebar',
  props: ['role'],
  computed: {
    links() {
      const baseLinks = [
        { name: 'Dashboard', route: `/${this.role}` }
      ];

      if (this.role === 'admin') {
        return [
          ...baseLinks,
          { name: 'User Management', route: '/admin/user-management' },
          { name: 'Content Oversight', route: '/admin/content-oversight' },
          { name: 'System Maintenance', route: '/admin/system-maintenance' }
        ];
      } else if (this.role === 'teacher') {
        return [
          ...baseLinks,
          { name: 'Manage Students', route: '/teacher/manage-students' },
          { name: 'Upload Content', route: '/teacher/upload-content' },
          { name: 'Create Exercises', route: '/teacher/create-exercises' }
        ];
      } else if (this.role === 'student') {
        return [
          ...baseLinks,
          { name: 'View Content', route: '/student/view-content' },
          { name: 'Quizzes', route: '/student/practice-quizzes' },
          { name: 'Progress', route: '/student/progress' }
        ];
      }
      return baseLinks;
    }
  },
  methods: {
    getIcon(name) {
      const icons = {
        'Dashboard': '📊',
        'User Management': '👥',
        'Content Oversight': '📋',
        'System Maintenance': '⚙️',
        'Manage Students': '👨‍🎓',
        'Upload Content': '📤',
        'Create Exercises': '✏️',
        'View Content': '📚',
        'Practice & Quizzes': '🧠',
        'Progress': '📈'
      };
      return icons[name] || '📄';
    }
  }
}
</script>

<style scoped>
.sidebar {
  width: 250px;
  background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.15);
  overflow-y: auto;
}

.sidebar-profile {
  padding: 2rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.profile-avatar {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
}

.profile-info h4 {
  margin: 0;
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
}

.profile-status {
  color: #27ae60;
  font-size: 0.8rem;
  font-weight: 500;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
  overflow-y: auto;
}

.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-item {
  margin: 0.25rem 0;
}

.menu-link {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 0.95rem;
  font-weight: 500;
  border-radius: 0;
}

.menu-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  transform: translateX(5px);
}

.menu-icon {
  margin-right: 1rem;
  font-size: 1.1rem;
  width: 20px;
  text-align: center;
}

.menu-text {
  flex: 1;
}

.active-link {
  background: linear-gradient(90deg, rgba(52, 152, 219, 0.2) 0%, rgba(52, 152, 219, 0.1) 100%);
  color: white !important;
  border-right: 4px solid #3498db;
  font-weight: 600;
}

.active-link:hover {
  transform: none;
}

/* Scrollbar styling */
.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* Responsive design */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  .sidebar.mobile-open {
    transform: translateX(0);
  }
}
</style>