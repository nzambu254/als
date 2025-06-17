<template>
  <div class="manage-students-container">
    <h2>Manage Students</h2>
    
    <div class="student-controls">
      <div class="search-bar">
        <input v-model="searchQuery" placeholder="Search students...">
        <button @click="refreshStudents">
          <i class="refresh-icon">↻</i> Refresh
        </button>
      </div>
      <div class="filter-controls">
        <select v-model="selectedClass">
          <option value="">All Classes</option>
          <option v-for="classItem in classes" :key="classItem" :value="classItem">
            {{ classItem }}
          </option>
        </select>
      </div>
    </div>
    
    <div class="student-list">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Class</th>
            <th>Progress</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="student in filteredStudents" :key="student.id">
            <td>{{ student.name }}</td>
            <td>{{ student.email }}</td>
            <td>{{ student.class || 'N/A' }}</td>
            <td>
              <div class="progress-cell">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: student.progress + '%' }"></div>
                </div>
                <span>{{ student.progress }}%</span>
              </div>
            </td>
            <td>
              <button @click="viewStudent(student.id)" class="view-btn">View</button>
              <button @click="messageStudent(student.id)" class="message-btn">Message</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div v-if="loading" class="loading">Loading student data...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="filteredStudents.length === 0 && !loading" class="empty-state">
      No students found matching your criteria.
    </div>
  </div>
</template>

<script>
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';

export default {
  name: 'ManageStudents',
  data() {
    return {
      students: [],
      searchQuery: '',
      selectedClass: '',
      classes: ['Class A', 'Class B', 'Class C', 'Class D'],
      loading: false,
      error: ''
    }
  },
  computed: {
    filteredStudents() {
      return this.students.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          student.email.toLowerCase().includes(this.searchQuery.toLowerCase());
        const matchesClass = !this.selectedClass || student.class === this.selectedClass;
        return matchesSearch && matchesClass;
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
        // In a real app, you would query only students assigned to this teacher
        const querySnapshot = await getDocs(collection(db, 'users'));
        const studentPromises = querySnapshot.docs
          .filter(doc => doc.data().role === 'student')
          .map(async doc => {
            const studentData = doc.data();
            // Get progress data
            const progressDoc = await getDoc(doc(db, 'progress', doc.id));
            const progressData = progressDoc.exists() ? progressDoc.data() : {};
            
            return {
              id: doc.id,
              name: studentData.name || studentData.email.split('@')[0],
              email: studentData.email,
              class: studentData.class || '',
              progress: progressData.overallProgress || 0
            };
          });
        
        this.students = await Promise.all(studentPromises);
      } catch (err) {
        this.error = 'Failed to load student data. Please try again later.';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    refreshStudents() {
      this.fetchStudents();
    },
    viewStudent(studentId) {
      this.$router.push(`/teacher/students/${studentId}`);
    },
    messageStudent(studentId) {
      // Implement messaging functionality
      console.log('Message student:', studentId);
    }
  }
}
</script>

<style scoped>
.manage-students-container {
  padding: 20px;
}
.student-controls {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}
.search-bar {
  display: flex;
  gap: 10px;
}
.search-bar input {
  flex: 1;
  padding: 8px;
}
.filter-controls select {
  padding: 8px;
  min-width: 200px;
}
button {
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.refresh-icon {
  margin-right: 5px;
}
.student-list {
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
.progress-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}
.progress-bar {
  flex: 1;
  height: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background-color: #42b983;
}
.view-btn {
  background-color: #3498db;
  color: white;
  margin-right: 5px;
}
.message-btn {
  background-color: #9b59b6;
  color: white;
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