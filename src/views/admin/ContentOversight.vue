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
        <button @click="downloadReport" class="download-btn">
          Download Report (PDF)
        </button>
      </div>
    </div>

    <div class="content-list">
      <template v-if="activeTab === 'Notes'">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Creator</th>
              <th>Status</th>
              <th>File</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredNotes" :key="item.id">
              <td>{{ item.title }}</td>
              <td>{{ truncateText(item.description, 50) }}</td>
              <td>{{ item.creatorName }}</td>
              <td>
                <span class="status-badge" :class="item.status || 'draft'">{{ item.status || 'draft' }}</span>
              </td>
              <td>
                <a v-if="item.fileUrl" :href="item.fileUrl" target="_blank" class="file-link">View File</a>
                <span v-else class="no-file">No File</span>
              </td>
              <td>
                <!-- Ensure createdAt exists before calling toDate() -->
                {{ item.createdAt && formatDate(item.createdAt) }}
              </td>
              <td class="action-buttons-cell">
                <button @click="viewContent(item.id, 'note')" class="view-btn">View</button>
                <button @click="editContentStatus(item)" class="edit-btn">Edit Status</button>
              </td>
            </tr>
          </tbody>
        </table>
      </template>

      <template v-else-if="activeTab === 'Exercises'">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Difficulty</th>
              <th>Creator</th>
              <th>Status</th>
              <th>File</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredExercises" :key="item.id">
              <td>{{ item.title }}</td>
              <td>{{ truncateText(item.description, 50) }}</td>
              <td>{{ item.difficulty || 'N/A' }}</td>
              <td>{{ item.creatorName }}</td>
              <td>
                <span class="status-badge" :class="item.status || 'draft'">{{ item.status || 'draft' }}</span>
              </td>
              <td>
                <a v-if="item.fileUrl" :href="item.fileUrl" target="_blank" class="file-link">View File</a>
                <span v-else class="no-file">No File</span>
              </td>
              <td>
                <!-- Ensure createdAt exists before calling toDate() -->
                {{ item.createdAt && formatDate(item.createdAt) }}
              </td>
              <td class="action-buttons-cell">
                <button @click="viewContent(item.id, 'exercise')" class="view-btn">View</button>
                <button @click="editContentStatus(item)" class="edit-btn">Edit Status</button>
              </td>
            </tr>
          </tbody>
        </table>
      </template>
    </div>

    <div v-if="loading" class="loading">Loading content...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="activeTab === 'Notes' && filteredNotes.length === 0 && !loading" class="empty-state">
      No notes found matching your criteria.
    </div>
    <div v-else-if="activeTab === 'Exercises' && filteredExercises.length === 0 && !loading" class="empty-state">
      No exercises found matching your criteria.
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
          <p v-if="currentContent.description">Description: {{ truncateText(currentContent.description, 100) }}</p>
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

    <!-- Content Detail Modal -->
    <div v-if="showDetailModal" class="modal-overlay">
      <div class="modal-content detail-modal">
        <button class="close-modal" @click="closeDetailModal">×</button>

        <h3>{{ selectedContent.title }}</h3>

        <div class="content-detail">
          <div class="detail-section">
            <strong>Type:</strong> {{ selectedContent.type }}
          </div>
          <div class="detail-section">
            <strong>Creator:</strong> {{ selectedContent.creatorName }}
          </div>
          <div class="detail-section">
            <strong>Status:</strong>
            <span class="status-badge" :class="selectedContent.status || 'draft'">
              {{ selectedContent.status || 'draft' }}
            </span>
          </div>
          <div class="detail-section">
            <strong>Created:</strong> {{ formatDate(selectedContent.createdAt) }}
          </div>
          <div v-if="selectedContent.difficulty" class="detail-section">
            <strong>Difficulty:</strong> {{ selectedContent.difficulty }}
          </div>
          <div v-if="selectedContent.description" class="detail-section">
            <strong>Description:</strong>
            <p class="description-text">{{ selectedContent.description }}</p>
          </div>
          <div v-if="selectedContent.fileUrl" class="detail-section">
            <strong>Attached File:</strong>
            <a :href="selectedContent.fileUrl" target="_blank" class="file-link-detail">
              View/Download File
            </a>
          </div>
        </div>

        <div class="modal-actions">
          <button @click="editContentStatus(selectedContent)" class="edit-status-btn">
            Edit Status
          </button>
          <button @click="closeDetailModal" class="close-btn">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { getAuth } from 'firebase/auth';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default {
  name: 'ContentOversight',
  data() {
    return {
      tabs: ['Notes', 'Exercises'],
      activeTab: 'Notes',
      notes: [],
      exercises: [],
      searchQuery: '',
      selectedStatus: '',
      showStatusModal: false,
      showDetailModal: false,
      selectedContent: {},
      currentContent: {
        id: '',
        type: '',
        title: '',
        creatorName: '',
        status: '',
        notes: '',
        description: ''
      },
      processing: false,
      loading: false,
      error: '',
      generatingReport: false
    }
  },
  computed: {
    filteredNotes() {
      return this.notes.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(this.searchQuery.toLowerCase());
        const matchesStatus = !this.selectedStatus || (item.status || 'draft') === this.selectedStatus;
        return matchesSearch && matchesStatus;
      });
    },
    filteredExercises() {
      return this.exercises.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(this.searchQuery.toLowerCase());
        const matchesStatus = !this.selectedStatus || (item.status || 'draft') === this.selectedStatus;
        return matchesSearch && matchesStatus;
      });
    },
    currentFilteredItems() {
      return this.activeTab === 'Notes' ? this.filteredNotes : this.filteredExercises;
    }
  },
  async created() {
    await this.fetchAllContent();
  },
  methods: {
    async fetchAllContent() {
      this.loading = true;
      this.error = '';

      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

      try {
        // Fetch notes from the artifacts path (as they are created by the UploadContent component)
        const notesSnapshot = await getDocs(collection(db, `artifacts/${appId}/public/data/notes`));
        // Fetch exercises from the root 'exercises' collection (as they are created by CreateLociExercise component)
        const exercisesSnapshot = await getDocs(collection(db, 'exercises'));

        // Process notes
        this.notes = await Promise.all(
          notesSnapshot.docs.map(async doc => {
            const data = doc.data();
            const creatorName = await this.getCreatorName(data.createdBy);
            return {
              id: doc.id,
              ...data,
              creatorName,
              type: 'note',
              status: data.status || 'draft'
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
              type: 'exercise',
              status: data.status || 'draft'
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
      if (!userId || userId === 'anonymous') return 'Anonymous';
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        return userDoc.exists() ? userDoc.data().name : 'Unknown';
      } catch (err) {
        console.error('Error fetching creator name:', err);
        return 'Unknown';
      }
    },
    viewContent(id, type) {
      let content = null;
      switch(type) {
        case 'note':
          content = this.notes.find(item => item.id === id);
          break;
        case 'exercise':
          content = this.exercises.find(item => item.id === id);
          break;
        default:
          console.warn(`Attempted to view unsupported content type: ${type}`);
          return;
      }

      if (content) {
        this.selectedContent = { ...content };
        this.showDetailModal = true;
      } else {
        console.error(`Content with ID ${id} and type ${type} not found.`);
      }
    },
    editContentStatus(item) {
      this.currentContent = {
        id: item.id,
        type: item.type,
        title: item.title,
        creatorName: item.creatorName,
        status: item.status || 'draft',
        notes: '',
        description: item.description || ''
      };
      this.showStatusModal = true;
      this.showDetailModal = false;
    },
    closeStatusModal() {
      this.showStatusModal = false;
    },
    closeDetailModal() {
      this.showDetailModal = false;
    },
    async updateContentStatus() {
      this.processing = true;
      this.error = '';

      try {
        const auth = getAuth();

        const updateData = {
          status: this.currentContent.status,
          updatedAt: new Date(),
          updatedBy: auth.currentUser ? auth.currentUser.uid : 'admin'
        };

        if (this.currentContent.notes) {
          updateData.moderatorNotes = this.currentContent.notes;
        }

        let collectionPath;
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

        if (this.currentContent.type === 'note') {
          collectionPath = `artifacts/${appId}/public/data/notes`;
        } else if (this.currentContent.type === 'exercise') {
          collectionPath = 'exercises';
        } else {
            console.error('Unknown content type for update:', this.currentContent.type);
            this.error = 'Unknown content type.';
            this.processing = false;
            return;
        }

        await updateDoc(
          doc(db, collectionPath, this.currentContent.id),
          updateData
        );

        const targetCollection = this[this.currentContent.type + 's'];
        const index = targetCollection.findIndex(item => item.id === this.currentContent.id);
        if (index !== -1) {
          targetCollection[index].status = this.currentContent.status;
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
    },
    truncateText(text, maxLength) {
      if (!text) return 'N/A';
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    },
    async downloadReport() {
      this.generatingReport = true;
      try {
        // Create a new PDF document
        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(18);
        doc.text(`Content Oversight Report - ${this.activeTab}`, 14, 20);
        
        // Add filters information
        doc.setFontSize(12);
        doc.text(`Filters Applied:`, 14, 30);
        doc.text(`- Search: ${this.searchQuery || 'None'}`, 14, 36);
        doc.text(`- Status: ${this.selectedStatus || 'All'}`, 14, 42);
        doc.text(`- Date Generated: ${new Date().toLocaleString()}`, 14, 48);
        
        // Prepare table data
        const headers = this.activeTab === 'Notes' 
          ? ['Title', 'Description', 'Creator', 'Status', 'Created']
          : ['Title', 'Description', 'Difficulty', 'Creator', 'Status', 'Created'];
        
        const data = this.currentFilteredItems.map(item => {
          const baseData = [
            item.title,
            this.truncateText(item.description, 60),
            item.creatorName,
            item.status || 'draft',
            this.formatDate(item.createdAt)
          ];
          
          if (this.activeTab === 'Exercises') {
            baseData.splice(2, 0, item.difficulty || 'N/A');
          }
          
          return baseData;
        });
        
        // Add table using autoTable
        autoTable(doc, {
          startY: 60,
          head: [headers],
          body: data,
          styles: {
            fontSize: 9,
            cellPadding: 3,
            valign: 'middle'
          },
          headStyles: {
            fillColor: [66, 185, 131],
            textColor: 255,
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [240, 240, 240]
          },
          columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 'auto' },
            3: { cellWidth: 'auto' },
            4: { cellWidth: 'auto' },
            5: { cellWidth: 'auto' }
          }
        });
        
        // Add summary statistics
        const finalY = doc.lastAutoTable.finalY || 70;
        doc.setFontSize(12);
        doc.text(`Summary Statistics`, 14, finalY + 15);
        doc.text(`- Total Items: ${this.currentFilteredItems.length}`, 14, finalY + 21);
        
        // Status counts
        const statusCounts = {};
        this.currentFilteredItems.forEach(item => {
          const status = item.status || 'draft';
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        
        let statusY = finalY + 27;
        Object.entries(statusCounts).forEach(([status, count]) => {
          doc.text(`- ${status.charAt(0).toUpperCase() + status.slice(1)}: ${count}`, 14, statusY);
          statusY += 6;
        });
        
        // Save the PDF
        doc.save(`content_report_${this.activeTab.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.pdf`);
        
      } catch (err) {
        this.error = 'Failed to generate report. Please try again.';
        console.error('Error generating PDF:', err);
      } finally {
        this.generatingReport = false;
      }
    }
  }
}
</script>

<style scoped>
.content-oversight-container {
  padding: 20px;
  font-family: 'Inter', sans-serif;
}
h2 {
  color: #333;
  margin-bottom: 30px;
  text-align: center;
  font-size: 2.5em;
  font-weight: 700;
  padding-bottom: 15px;
  border-bottom: 2px solid #eee;
  width: 100%;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
}
.content-tabs {
  display: flex;
  justify-content: center;
  border-bottom: 1px solid #ddd;
  margin-bottom: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  padding: 5px;
}
.content-tabs button {
  padding: 12px 25px;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-weight: bold;
  color: #666;
  transition: all 0.3s ease;
  border-radius: 6px;
  font-size: 1.05em;
}
.content-tabs button.active {
  border-bottom-color: #42b983;
  color: #2c3e50;
  background-color: #e0ffe0;
  box-shadow: 0 2px 8px rgba(66, 185, 131, 0.2);
}
.content-tabs button:hover:not(.active) {
  background-color: #f0f0f0;
}
.content-controls {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}
.search-filter {
  display: flex;
  gap: 10px;
  background-color: white;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  width: 100%;
  max-width: 700px;
}
.search-filter input,
.search-filter select {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1em;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.search-filter input:focus,
.search-filter select:focus {
  border-color: #42b983;
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.2);
}
.download-btn {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s ease, transform 0.2s ease;
  white-space: nowrap;
}
.download-btn:hover {
  background-color: #5a6268;
  transform: translateY(-1px);
}
.content-list {
  overflow-x: auto;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  padding: 15px;
}
table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}
th, td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}
th {
  background-color: #f8f8f8;
  font-weight: 600;
  color: #444;
  position: sticky;
  top: 0;
  z-index: 1;
}
th:first-child { border-top-left-radius: 8px; }
th:last-child { border-top-right-radius: 8px; }
tbody tr:last-child td {
  border-bottom: none;
}
.status-badge {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 18px;
  font-size: 0.85em;
  font-weight: 700;
  text-transform: capitalize;
}
.status-badge.published {
  background-color: #e6ffed;
  color: #1a7d3c;
  border: 1px solid #b3e6c3;
}
.status-badge.draft {
  background-color: #fff3e0;
  color: #e08e00;
  border: 1px solid #ffe0b3;
}
.status-badge.archived {
  background-color: #e0e0e0;
  color: #5a5a5a;
  border: 1px solid #c0c0c0;
}
.action-buttons-cell {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
}
.view-btn, .edit-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  font-weight: 500;
  width: auto;
  text-align: center;
}
.edit-btn {
  background-color: #42b983;
}
.view-btn:hover { background-color: #2980b9; transform: translateY(-1px); }
.edit-btn:hover { background-color: #36a374; transform: translateY(-1px); }
.file-link {
  color: #3498db;
  text-decoration: none;
  font-weight: bold;
  transition: color 0.2s ease;
}
.file-link:hover {
  text-decoration: underline;
  color: #2980b9;
}
.no-file {
  color: #999;
  font-style: italic;
  font-size: 0.9em;
}
.loading, .error, .empty-state {
  text-align: center;
  padding: 30px;
  font-size: 1.2em;
  color: #555;
  background-color: white;
  border-radius: 8px;
  margin-top: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
}
.error {
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
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
  background-color: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}
.modal-content {
  background-color: white;
  padding: 30px;
  border-radius: 12px;
  width: 95%;
  max-width: 550px;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 15px 30px rgba(0,0,0,0.25);
  animation: modalFadeIn 0.3s ease-out;
}
.detail-modal {
  max-width: 750px;
}
.close-modal {
  position: absolute;
  top: 15px;
  right: 15px;
  font-size: 2em;
  background: none;
  border: none;
  cursor: pointer;
  color: #777;
  transition: color 0.2s ease;
}
.close-modal:hover {
  color: #333;
  transform: rotate(90deg);
}
.modal-content h3 {
  font-size: 1.8em;
  margin-bottom: 20px;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}
.content-info {
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}
.content-info h4 {
  margin: 0 0 12px 0;
  font-size: 1.3em;
  color: #444;
}
.content-info p {
  margin: 8px 0;
  color: #666;
  font-size: 1em;
}
.content-detail {
  margin-bottom: 25px;
}
.detail-section {
  margin-bottom: 18px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f5f5f5;
}
.detail-section:last-child {
  border-bottom: none;
}
.detail-section strong {
  display: block;
  margin-bottom: 6px;
  color: #333;
  font-size: 1.1em;
}
.description-text {
  margin: 10px 0 0;
  line-height: 1.7;
  color: #555;
  background-color: #f9f9f9;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #eee;
}
.file-link-detail {
  display: inline-block;
  background-color: #3498db;
  color: white;
  padding: 10px 20px;
  text-decoration: none;
  border-radius: 6px;
  margin-top: 10px;
  font-weight: 500;
  transition: background-color 0.2s ease;
}
.file-link-detail:hover {
  background-color: #2980b9;
}
.form-group {
  margin-bottom: 20px;
}
.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #555;
  font-size: 1.05em;
}
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1em;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.form-group select:focus,
.form-group textarea:focus {
  border-color: #42b983;
  outline: none;
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.2);
}
.form-group textarea {
  min-height: 120px;
  resize: vertical;
}
.form-actions, .modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
}
.cancel-btn, .close-btn {
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}
.cancel-btn:hover, .close-btn:hover {
  background-color: #e0e0e0;
  border-color: #ccc;
}
.submit-btn, .edit-status-btn {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s ease, transform 0.2s ease;
  box-shadow: 0 4px 8px rgba(66, 185, 131, 0.2);
}
.submit-btn:hover, .edit-status-btn:hover {
  background-color: #36a374;
  transform: translateY(-1px);
}
.submit-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

@keyframes modalFadeIn {
  from { opacity: 0; transform: translateY(-20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@media (max-width: 768px) {
  .content-tabs {
    flex-wrap: wrap;
    justify-content: center;
  }
  .content-tabs button {
    flex-grow: 1;
    margin: 5px;
  }
  .search-filter {
    flex-direction: column;
    align-items: stretch;
  }
  .search-filter input,
  .search-filter select {
    flex: none;
    width: 100%;
  }
  .download-btn {
    width: 100%;
    white-space: normal;
  }
  th, td {
    padding: 10px;
    font-size: 0.9em;
  }
  .action-buttons-cell {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 5px;
  }
  .view-btn, .edit-btn {
    padding: 6px 10px;
    font-size: 0.85em;
    flex-grow: 1;
  }
  .modal-content {
    padding: 20px;
  }
  .modal-content h3 {
    font-size: 1.5em;
  }
  .form-actions, .modal-actions {
    flex-direction: column;
    gap: 10px;
  }
  .cancel-btn, .close-btn, .submit-btn, .edit-status-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .content-oversight-container {
    padding: 15px;
  }
  h2 {
    font-size: 2em;
    margin-bottom: 20px;
  }
  .content-tabs button {
    padding: 10px 15px;
    font-size: 0.9em;
  }
  .search-filter {
    padding: 8px;
  }
  .modal-content {
    padding: 15px;
  }
  .close-modal {
    font-size: 1.8em;
    top: 8px;
    right: 8px;
  }
}
</style>