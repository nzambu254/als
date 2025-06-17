<template>
  <div class="announcements-container">
    <h2>Announcements</h2>
    
    <div class="announcement-list">
      <div v-for="announcement in announcements" :key="announcement.id" 
           class="announcement-card" :class="{ unread: !announcement.read }">
        <div class="announcement-header">
          <h3>{{ announcement.title }}</h3>
          <span class="date">{{ formatDate(announcement.date) }}</span>
        </div>
        <p class="announcement-content">{{ announcement.content }}</p>
        <div class="announcement-footer">
          <span class="sender">From: {{ announcement.sender }}</span>
          <button v-if="!announcement.read" @click="markAsRead(announcement.id)">
            Mark as Read
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="loading" class="loading">Loading announcements...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="announcements.length === 0 && !loading" class="empty-state">
      No announcements available at this time.
    </div>
  </div>
</template>

<script>
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/firebase';

export default {
  name: 'StudentAnnouncements',
  data() {
    return {
      announcements: [],
      loading: false,
      error: ''
    }
  },
  async created() {
    await this.fetchAnnouncements();
  },
  methods: {
    async fetchAnnouncements() {
      this.loading = true;
      this.error = '';
      
      try {
        // Get all announcements
        const announcementsQuery = await getDocs(collection(db, 'announcements'));
        const allAnnouncements = announcementsQuery.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Filter for student announcements
        this.announcements = allAnnouncements.filter(ann => 
          ann.audience === 'students' || ann.audience === 'all'
        );
        
        // Mark announcements as read if they're new
        if (auth.currentUser) {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          const readAnnouncements = userDoc.exists() ? 
            (userDoc.data().readAnnouncements || []) : [];
          
          this.announcements.forEach(ann => {
            ann.read = readAnnouncements.includes(ann.id);
          });
        }
      } catch (err) {
        this.error = 'Failed to load announcements. Please try again later.';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    async markAsRead(announcementId) {
      if (!auth.currentUser) return;
      
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        let readAnnouncements = [];
        if (userDoc.exists()) {
          readAnnouncements = userDoc.data().readAnnouncements || [];
        }
        
        if (!readAnnouncements.includes(announcementId)) {
          readAnnouncements.push(announcementId);
          await updateDoc(userRef, {
            readAnnouncements
          });
          
          // Update local state
          const announcement = this.announcements.find(a => a.id === announcementId);
          if (announcement) {
            announcement.read = true;
          }
        }
      } catch (err) {
        console.error('Error marking announcement as read:', err);
      }
    },
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    }
  }
}
</script>

<style scoped>
.announcements-container {
  padding: 20px;
}
.announcement-list {
  display: grid;
  gap: 20px;
}
.announcement-card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border-left: 4px solid #42b983;
}
.announcement-card.unread {
  border-left: 4px solid #ff9800;
  background-color: #fff8e1;
}
.announcement-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.announcement-header h3 {
  margin: 0;
  color: #2c3e50;
}
.date {
  color: #777;
  font-size: 0.9em;
}
.announcement-content {
  margin: 15px 0;
  line-height: 1.6;
}
.announcement-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9em;
}
.sender {
  color: #666;
}
button {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
}
.loading, .error, .empty-state {
  text-align: center;
  padding: 20px;
}
.error {
  color: #ff4444;
}
.empty-state {
  color: #777;
}
</style>