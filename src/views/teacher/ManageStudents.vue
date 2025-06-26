<template>
  <div class="manage-students-container">
    <h2 class="section-title">Manage Students</h2>

    <div class="student-controls">
      <div class="search-filter-group">
        <input v-model="searchQuery" placeholder="Search by name or email..." class="search-input" />
        <!-- Removed Class filter select -->
        <button @click="fetchStudents" class="refresh-btn">
          <span class="icon">↻</span> Refresh
        </button>
      </div>
    </div>

    <div class="student-list-card">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <!-- Removed Class column header -->
            <!-- Removed Progress column header -->
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="loading-row">
            <td colspan="3" class="text-center">Loading student data...</td>
          </tr>
          <tr v-else-if="error">
            <td colspan="3" class="text-center error-message">{{ error }}</td>
          </tr>
          <tr v-else-if="filteredStudents.length === 0">
            <td colspan="3" class="text-center empty-state-message">
              No students found matching your criteria.
            </td>
          </tr>
          <tr v-for="student in filteredStudents" :key="student.id">
            <td>{{ student.name }}</td>
            <td>{{ student.email }}</td>
            <!-- Removed Class data cell -->
            <!-- Removed Progress data cell -->
            <td>
              <button @click="editStudent(student)" class="action-btn edit-btn">Edit</button>
              <button @click="confirmDeleteStudent(student.id)" class="action-btn delete-btn">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-content delete-modal">
        <h3>Confirm Deletion</h3>
        <p>Are you sure you want to delete this student? This action cannot be undone.</p>
        <div class="delete-actions">
          <button @click="showDeleteModal = false" class="cancel-btn">Cancel</button>
          <button @click="deleteStudent" class="confirm-delete-btn">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  collection,
  doc,
  getDocs,
  deleteDoc, // Added deleteDoc
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '@/firebase'; // Assuming '@/firebase' exports db

export default {
  name: 'ManageStudents',
  data() {
    return {
      students: [],
      searchQuery: '',
      // Removed selectedClass
      // Removed classes array
      loading: false,
      error: '',
      showDeleteModal: false, // New: for delete confirmation modal
      studentIdToDelete: null, // New: stores ID of student to be deleted
    }
  },
  computed: {
    filteredStudents() {
      if (!this.students || this.students.length === 0) {
        return [];
      }
      
      return this.students.filter(student => {
        // Only filter by search query, as class filter is removed
        const matchesSearch = 
          student.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          student.email.toLowerCase().includes(this.searchQuery.toLowerCase());
        
        return matchesSearch;
      });
    }
  },
  async created() {
    await this.fetchStudents();
  },
  methods: {
    async fetchStudents() {
      this.loading = true;
      this.error = '';
      try {
        const q = query(
          collection(db, 'users'),
          where('role', '==', 'student'),
          orderBy('name')
        );
        const querySnapshot = await getDocs(q);

        const studentPromises = querySnapshot.docs.map(async docSnap => {
          const studentData = docSnap.data();
          
          // Removed fetching progress data
          
          return {
            id: docSnap.id,
            name: studentData.name || studentData.email.split('@')[0],
            email: studentData.email,
            // Removed class from the returned object
            // Removed progress from the returned object
          };
        });

        this.students = await Promise.all(studentPromises);
      } catch (err) {
        this.error = 'Failed to load student data. Please try again later.';
        console.error('Error fetching students:', err);
      } finally {
        this.loading = false;
      }
    },
    editStudent(student) {
      console.log('Editing student:', student.id, student.name);
      // Implement navigation to an edit form or open an edit modal here
      // For example, using Vue Router: this.$router.push(`/teacher/students/edit/${student.id}`);
    },
    confirmDeleteStudent(studentId) {
      this.studentIdToDelete = studentId;
      this.showDeleteModal = true;
    },
    async deleteStudent() {
      this.error = ''; // Clear any previous errors
      try {
        if (this.studentIdToDelete) {
          await deleteDoc(doc(db, 'users', this.studentIdToDelete));
          console.log('Student deleted successfully:', this.studentIdToDelete);
          // Remove the student from the local array to update the UI immediately
          this.students = this.students.filter(s => s.id !== this.studentIdToDelete);
          this.showDeleteModal = false; // Close the modal
          this.studentIdToDelete = null; // Reset for next deletion
        }
      } catch (err) {
        this.error = 'Failed to delete student. Please try again.';
        console.error('Error deleting student:', err);
      }
    }
  }
};
</script>

<style scoped>
/* Base container styling */
.manage-students-container {
  padding: 30px;
  font-family: 'Inter', sans-serif;
  background-color: #f8f9fa; /* Light background for the overall section */
  min-height: calc(100vh - var(--sidebar-height, 0px)); /* Adjust for sidebar if needed */
}

/* Section title styling */
.section-title {
  color: #333;
  margin-bottom: 30px;
  text-align: center;
  font-size: 2.5em;
  font-weight: 700;
  padding-bottom: 15px;
  border-bottom: 2px solid #eee;
}

/* Student controls (search and filter) */
.student-controls {
  margin-bottom: 30px;
  display: flex;
  justify-content: center; /* Center the controls group */
}

.search-filter-group {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap; /* Allow wrapping on smaller screens */
  background-color: #ffffff;
  padding: 15px 25px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.search-input {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1em;
  flex-grow: 1; /* Allow inputs to grow */
  min-width: 180px; /* Minimum width for inputs */
  box-sizing: border-box; /* Include padding and border in the element's total width and height */
}

.search-input:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}

.refresh-btn {
  background-color: #28a745; /* Green for refresh */
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s ease, transform 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}

.refresh-btn:hover {
  background-color: #218838;
  transform: translateY(-2px);
}

.refresh-btn .icon {
  font-size: 1.2em;
  line-height: 1;
}

/* Student list table styling */
.student-list-card {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
  overflow-x: auto; /* Ensure table is scrollable on small screens */
}

.student-list-card table {
  width: 100%;
  border-collapse: collapse;
}

.student-list-card th, .student-list-card td {
  padding: 18px 25px; /* Increased padding */
  text-align: left;
  border-bottom: 1px solid #eee;
  color: #555;
}

.student-list-card th {
  background-color: #f8f9fa;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.9em;
  color: #333;
}

.student-list-card tr:hover {
  background-color: #f5f5f5; /* Light hover effect on rows */
}

.student-list-card tbody tr:last-child td {
  border-bottom: none;
}

/* Action buttons styling */
.action-btn {
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s ease, transform 0.2s ease;
  margin-right: 8px; /* Space between buttons */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.action-btn:last-child {
  margin-right: 0;
}

.edit-btn {
  background-color: #007bff; /* Blue for edit */
  color: white;
}

.edit-btn:hover {
  background-color: #0056b3;
  transform: translateY(-1px);
}

.delete-btn {
  background-color: #dc3545; /* Red for delete */
  color: white;
}

.delete-btn:hover {
  background-color: #c82333;
  transform: translateY(-1px);
}

/* Loading, Error, Empty states */
.text-center {
  text-align: center;
}

.loading-row td {
  font-style: italic;
  color: #888;
  padding: 20px;
}

.error-message {
  color: #dc3545; /* Red for errors */
  font-weight: bold;
  padding: 20px;
}

.empty-state-message {
  color: #777;
  padding: 20px;
}

/* Modal Styling (for delete confirmation) */
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
}
.modal-content {
  background-color: white;
  padding: 30px;
  border-radius: 12px;
  width: 90%;
  max-width: 450px; /* Slightly smaller for confirmation */
  position: relative;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.3s ease-out;
  text-align: center; /* Center text in modal */
}
.delete-modal h3 {
  margin-bottom: 15px;
  color: #333;
}
.delete-modal p {
  margin-bottom: 25px;
  color: #666;
}
.delete-actions {
  display: flex;
  justify-content: center; /* Center buttons */
  gap: 15px;
  margin-top: 20px;
}
.cancel-btn, .confirm-delete-btn {
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}
.cancel-btn {
  background-color: #e9ecef; /* Light gray */
  border: 1px solid #ced4da;
  color: #495057;
}
.cancel-btn:hover {
  background-color: #dee2e6;
}
.confirm-delete-btn {
  background-color: #dc3545; /* Red for confirm delete */
  color: white;
  border: none;
}
.confirm-delete-btn:hover {
  background-color: #c82333;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsive Adjustments */
@media (max-width: 992px) {
  .student-list-card th, .student-list-card td {
    padding: 15px 18px;
  }
}

@media (max-width: 768px) {
  .manage-students-container {
    padding: 20px;
  }
  .section-title {
    font-size: 2em;
    margin-bottom: 25px;
  }
  .search-filter-group {
    flex-direction: column;
    gap: 10px;
    padding: 15px;
    align-items: stretch; /* Stretch items to full width */
  }
  .search-input, .refresh-btn {
    width: 100%;
    min-width: unset;
  }
  .student-list-card table {
    font-size: 0.9em;
  }
  .student-list-card th, .student-list-card td {
    padding: 12px 15px;
  }
  .action-btn {
    padding: 8px 12px;
    font-size: 0.9em;
  }
}

@media (max-width: 480px) {
  .manage-students-container {
    padding: 15px;
  }
  .section-title {
    font-size: 1.8em;
    margin-bottom: 20px;
  }
  .student-list-card th, .student-list-card td {
    padding: 10px;
  }
  .progress-cell {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  .progress-bar {
    width: 100%;
  }
  .progress-text {
    text-align: left;
  }
}
</style>
