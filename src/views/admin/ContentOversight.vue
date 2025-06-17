<template>
  <div class="content-oversight-container">
    <h2>Content Oversight</h2>
    
    <div class="content-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab" 
        @click="activeTab = tab"
        :class="{ active: activeTab === tab }"
      >
        {{ tab }}
      </button>
    </div>
    
    <div class="content-controls">
      <div class="search-filter">
        <input v-model="searchQuery" placeholder="Search content...">
        <select v-model="selectedStatus">
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>
    </div>
    
    <div class="content-list">
      <table v-if="activeTab === 'Tutorials'">
        <thead>
          <tr>
            <th>Title</th>
            <th>Subject</th>
            <th>Creator</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredTutorials" :key="item.id">
            <td>{{ item.title }}</td>
            <td>{{ item.subject }}</td>
            <td>{{ item.creatorName }}</td>
            <td>
              <span class="status-badge" :class="item.status">{{ item.status }}</span>
            </td>
            <td>{{ formatDate(item.createdAt) }}</td>
            <td>
              <button @click="viewContent(item.id, 'tutorial')" class="view-btn">View</button>
              <button @click="editContentStatus(item)" class="edit-btn">Edit Status</button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <table v-else-if="activeTab === 'Exercises'">
        <thead>
          <tr>
            <th>Title</th>
            <th>Subject</th>
            <th>Difficulty</th>
            <th>Creator</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredExercises" :key="item.id">
            <td>{{ item.title }}</td>
            <td>{{ item.subject }}</td>
            <td>{{ item.difficulty }}</td>
            <td>{{ item.creatorName }}</td>
            <td>
              <span class="status-badge" :class="item.status">{{ item.status }}</span>
            </td>
            <td>{{ formatDate(item.createdAt) }}</td>
            <td>
              <button @click="viewContent(item.id, 'exercise')" class="view-btn">View</button>
              <button @click="editContentStatus(item)" class="edit-btn">Edit Status</button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <table v-else-if="activeTab === 'Quizzes'">
        <thead>
          <tr>
            <th>Title</th>
            <th>Subject</th>
            <th>Duration</th>
            <th>Creator</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredQuizzes" :key="item.id">
            <td>{{ item.title }}</td>
            <td>{{ item.subject }}</td>
            <td>{{ item.duration }} min</td>
            <td>{{ item.creatorName }}</td>
            <td>
              <span class="status-badge" :class="item.status">{{ item.status }}</span>
            </td>
            <td>{{ formatDate(item.createdAt) }}</td>
            <td>
              <button @click="viewContent(item.id, 'quiz')" class="view-btn">View</button>
              <button @click="editContentStatus(item)" class="edit-btn">Edit Status</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div v-if="loading" class="loading">Loading content...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="activeTab === 'Tutorials' && filteredTutorials.length === 0 && !loading" class="empty-state">
      No tutorials found matching your criteria.
    </div>
    <div v-else-if="activeTab === 'Exercises' && filteredExercises.length === 0 && !loading" class="empty-state">
      No exercises found matching your criteria.
    </div>
    <div v-else-if="activeTab === 'Quizzes' && filteredQuizzes.length === 0 && !loading" class="empty-state">
      No quizzes found matching your criteria.
    </div>
    
    <!-- Status Edit Modal -->
    <div v-if="showStatusModal" class="modal-overlay">
      <div class="modal-content">
        <button class="close-modal" @click="closeStatusModal">×</button>
        
        <h3>Edit Content Status</h3>
        
        <div class="content-info">
          <h4>{{ currentContent.title }}</h4>
          <p>Type: {{ currentContent.type }}</p>
          <p>Created by: {{ currentContent.creatorName }}</p>
        </div>
        
        <form @submit.prevent="updateContentStatus">
          <div class="form-group">
            <label>Status</label>
            <select v-model="currentContent.status" required>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Notes (optional)</label>
            <textarea v-model="currentContent.notes" placeholder="Add any notes about this status change"></textarea>
          </div>
          
          <div class="form-actions">
            <button type="button" @click="closeStatusModal" class="cancel-btn">Cancel</button>
            <button type="submit" :disabled="processing" class="submit-btn">
              {{ processing ? 'Updating...' : 'Update Status' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';

export default {
  name: 'ContentOversight',
  data() {
    return {
      tabs: ['Tutorials', 'Exercises', 'Quizzes'],
      activeTab: 'Tutorials',
      tutorials: [],
      exercises: [],
      quizzes: [],
      searchQuery: '',
      selectedStatus: '',
      showStatusModal: false,
      currentContent: {
        id: '',
        type: '',
        title: '',
        creatorName: '',
        status: '',
        notes: ''
      },
      processing: false,
      loading: false,
      error: ''
    }
  },
  computed: {
    filteredTutorials() {
      return this.tutorials.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          item.subject.toLowerCase().includes(this.searchQuery.toLowerCase());
        const matchesStatus = !this.selectedStatus || item.status === this.selectedStatus;
        return matchesSearch && matchesStatus;
      });
    },
    filteredExercises() {
      return this.exercises.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          item.subject.toLowerCase().includes(this.searchQuery.toLowerCase());
        const matchesStatus = !this.selectedStatus || item.status === this.selectedStatus;
        return matchesSearch && matchesStatus;
      });
    },
    filteredQuizzes() {
      return this.quizzes.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          item.subject.toLowerCase().includes(this.searchQuery.toLowerCase());
        const matchesStatus = !this.selectedStatus || item.status === this.selectedStatus;
        return matchesSearch && matchesStatus;
      });
    }
  },
  async created() {
    await this.fetchAllContent();
  },
  methods: {
    async fetchAllContent() {
      this.loading = true;
      this.error = '';
      
      try {
        // Fetch all content in parallel
        const [tutorialsSnapshot, exercisesSnapshot, quizzesSnapshot] = await Promise.all([
          getDocs(collection(db, 'tutorials')),
          getDocs(collection(db, 'exercises')),
          getDocs(collection(db, 'quizzes'))
        ]);
        
        // Process tutorials
        this.tutorials = await Promise.all(
          tutorialsSnapshot.docs.map(async doc => {
            const data = doc.data();
            const creatorName = await this.getCreatorName(data.createdBy);
            return {
              id: doc.id,
              ...data,
              creatorName,
              type: 'tutorial'
            };
          })
        );
        
        // Process exercises
        this.exercises = await Promise.all(
          exercisesSnapshot.docs.map(async doc => {
            const data = doc.data();
            const creatorName = await this.getCreatorName(data.createdBy);
            return {
              id: doc.id,
              ...data,
              creatorName,
              type: 'exercise'
            };
          })
        );
        
        // Process quizzes
        this.quizzes = await Promise.all(
          quizzesSnapshot.docs.map(async doc => {
            const data = doc.data();
            const creatorName = await this.getCreatorName(data.createdBy);
            return {
              id: doc.id,
              ...data,
              creatorName,
              type: 'quiz'
            };
          })
        );
      } catch (err) {
        this.error = 'Failed to load content. Please try again later.';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    async getCreatorName(userId) {
      if (!userId) return 'Unknown';
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        return userDoc.exists() ? userDoc.data().name : 'Unknown';
      } catch (err) {
        console.error('Error fetching creator name:', err);
        return 'Unknown';
      }
    },
    viewContent(id, type) {
      // This would navigate to a detail view in a real app
      console.log(`View ${type} with ID: ${id}`);
    },
    editContentStatus(item) {
      this.currentContent = {
        id: item.id,
        type: item.type,
        title: item.title,
        creatorName: item.creatorName,
        status: item.status,
        notes: ''
      };
      this.showStatusModal = true;
    },
    closeStatusModal() {
      this.showStatusModal = false;
    },
    async updateContentStatus() {
      this.processing = true;
      this.error = '';
      
      try {
        const updateData = {
          status: this.currentContent.status,
          updatedAt: new Date(),
          updatedBy: this.$store.state.user.uid
        };
        
        if (this.currentContent.notes) {
          updateData.notes = this.currentContent.notes;
        }
        
        await updateDoc(
          doc(db, `${this.currentContent.type}s`, this.currentContent.id),
          updateData
        );
        
        // Update local state
        const collectionName = `${this.currentContent.type}s`;
        const index = this[collectionName].findIndex(item => item.id === this.currentContent.id);
        if (index !== -1) {
          this[collectionName][index].status = this.currentContent.status;
        }
        
        this.closeStatusModal();
      } catch (err) {
        this.error = 'Failed to update content status. Please try again.';
        console.error(err);
      } finally {
        this.processing = false;
      }
    },
    formatDate(timestamp) {
      if (!timestamp) return 'N/A';
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString();
    }
  }
}
</script>

<style scoped>
.content-oversight-container {
  padding: 20px;
}
.content-tabs {
  display: flex;
  border-bottom: 1px solid #ddd;
  margin-bottom: 20px;
}
.content-tabs button {
  padding: 10px 20px;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-weight: bold;
  color: #666;
}
.content-tabs button.active {
  border-bottom-color: #42b983;
  color: #2c3e50;
}
.content-controls {
  margin-bottom: 20px;
}
.search-filter {
  display: flex;
  gap: 10px;
}
.search-filter input {
  flex: 2;
  padding: 8px;
}
.search-filter select {
  flex: 1;
  padding: 8px;
}
.content-list {
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}
th {
  background-color: #f5f5f5;
  font-weight: bold;
}
.status-badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: bold;
}
.status-badge.published {
  background-color: #00C851;
  color: white;
}
.status-badge.draft {
  background-color: #FF9800;
  color: white;
}
.status-badge.archived {
  background-color: #666;
  color: white;
}
.view-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 5px;
}
.edit-btn {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
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
  max-width: 500px;
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
.content-info {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}
.content-info h4 {
  margin: 0 0 10px 0;
}
.content-info p {
  margin: 5px 0;
  color: #666;
  font-size: 0.9em;
}
.form-group {
  margin-bottom: 15px;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.form-group textarea {
  min-height: 100px;
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
</style>