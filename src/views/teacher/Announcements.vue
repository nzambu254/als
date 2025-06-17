<template>
  <div class="announcements-container">
    <h2>Announcements</h2>
    
    <div class="announcement-controls">
      <button @click="showCreateModal" class="create-btn">Create Announcement</button>
    </div>
    
    <div class="announcement-list">
      <div v-for="announcement in announcements" :key="announcement.id" class="announcement-card">
        <div class="announcement-header">
          <h3>{{ announcement.title }}</h3>
          <div class="announcement-actions">
            <button @click="editAnnouncement(announcement)" class="edit-btn">Edit</button>
            <button @click="deleteAnnouncement(announcement.id)" class="delete-btn">Delete</button>
          </div>
        </div>
        <p class="announcement-content">{{ announcement.content }}</p>
        <div class="announcement-meta">
          <span class="date">Posted: {{ formatDate(announcement.createdAt) }}</span>
          <span class="target">Target: {{ announcement.targetClass === 'all' ? 'All Classes' : announcement.targetClass }}</span>
          <span class="status" :class="announcement.status">{{ announcement.status }}</span>
        </div>
      </div>
    </div>
    
    <div v-if="loading" class="loading">Loading announcements...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="announcements.length === 0 && !loading" class="empty-state">
      No announcements created yet.
    </div>
    
    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <button class="close-modal" @click="closeModal">×</button>
        
        <h3>{{ isEditing ? 'Edit Announcement' : 'Create Announcement' }}</h3>
        
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>Title</label>
            <input v-model="formData.title" required>
          </div>
          
          <div class="form-group">
            <label>Content</label>
            <textarea v-model="formData.content" required></textarea>
          </div>
          
          <div class="form-group">
            <label>Target Class</label>
            <select v-model="formData.targetClass" required>
              <option value="all">All Classes</option>
              <option v-for="classItem in classes" :key="classItem" :value="classItem">
                {{ classItem }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Status</label>
            <select v-model="formData.status" required>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          
          <div class="form-actions">
            <button type="button" @click="closeModal" class="cancel-btn">Cancel</button>
            <button type="submit" :disabled="processing" class="submit-btn">
              {{ processing ? 'Processing...' : isEditing ? 'Update' : 'Create' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase';

export default {
  name: 'TeacherAnnouncements',
  data() {
    return {
      announcements: [],
      showModal: false,
      isEditing: false,
      processing: false,
      loading: false,
      error: '',
      formData: {
        id: '',
        title: '',
        content: '',
        targetClass: 'all',
        status: 'published'
      },
      classes: ['Class A', 'Class B', 'Class C', 'Class D']
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
        // In a real app, you might filter announcements created by this teacher
        const querySnapshot = await getDocs(collection(db, 'announcements'));
        this.announcements = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .sort((a, b) => b.createdAt - a.createdAt);
      } catch (err) {
        this.error = 'Failed to load announcements. Please try again later.';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    showCreateModal() {
      this.resetForm();
      this.isEditing = false;
      this.showModal = true;
    },
    editAnnouncement(announcement) {
      this.formData = {
        id: announcement.id,
        title: announcement.title,
        content: announcement.content,
        targetClass: announcement.targetClass,
        status: announcement.status
      };
      this.isEditing = true;
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    resetForm() {
      this.formData = {
        id: '',
        title: '',
        content: '',
        targetClass: 'all',
        status: 'published'
      };
    },
    async handleSubmit() {
      this.processing = true;
      this.error = '';
      
      try {
        const announcementData = {
          title: this.formData.title,
          content: this.formData.content,
          targetClass: this.formData.targetClass,
          status: this.formData.status,
          audience: this.formData.targetClass === 'all' ? 'all' : 'students',
          createdAt: this.isEditing ? this.formData.createdAt : new Date(),
          updatedAt: new Date(),
          createdBy: this.$store.state.user.uid
        };
        
        if (this.isEditing) {
          await updateDoc(doc(db, 'announcements', this.formData.id), announcementData);
        } else {
          await addDoc(collection(db, 'announcements'), announcementData);
        }
        
        await this.fetchAnnouncements();
        this.closeModal();
      } catch (err) {
        this.error = this.isEditing ? 
          'Failed to update announcement. Please try again.' : 
          'Failed to create announcement. Please try again.';
        console.error(err);
      } finally {
        this.processing = false;
      }
    },
    async deleteAnnouncement(id) {
      if (!confirm('Are you sure you want to delete this announcement?')) return;
      
      try {
        await deleteDoc(doc(db, 'announcements', id));
        this.announcements = this.announcements.filter(a => a.id !== id);
      } catch (err) {
        this.error = 'Failed to delete announcement. Please try again.';
        console.error(err);
      }
    },
    formatDate(timestamp) {
      if (!timestamp) return 'N/A';
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleString();
    }
  }
}
</script>

<style scoped>
.announcements-container {
  padding: 20px;
}
.announcement-controls {
  margin-bottom: 20px;
}
.create-btn {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
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
.announcement-actions {
  display: flex;
  gap: 10px;
}
.edit-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}
.delete-btn {
  background-color: #ff4444;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}
.announcement-content {
  margin: 15px 0;
  line-height: 1.6;
}
.announcement-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.9em;
  color: #666;
}
.status {
  font-weight: bold;
}
.status.published {
  color: #00C851;
}
.status.draft {
  color: #FF9800;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background-color: white;
  padding: 25px;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  position: relative;
}
.close-modal {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 1.5em;
  background: none;
  border: none;
  cursor: pointer;
}
.form-group {
  margin-bottom: 15px;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}
.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.form-group textarea {
  min-height: 150px;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
.cancel-btn {
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
}
.submit-btn {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
}
.submit-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
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