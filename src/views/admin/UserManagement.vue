<template>
  <div class="user-management-container">
    <h2>User Management</h2>
    
    <div class="user-controls">
      <div class="search-filter">
        <input v-model="searchQuery" placeholder="Search users...">
        <select v-model="selectedRole">
          <option value="">All Roles</option>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>
        <button @click="showCreateModal" class="add-user-btn">Add User</button>
      </div>
    </div>
    
    <div class="user-list">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Last Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id">
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>
              <span class="role-badge" :class="user.role">{{ user.role }}</span>
            </td>
            <td>
              <span class="status-badge" :class="{ active: user.isActive }">
                {{ user.isActive ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td>{{ formatDate(user.lastActive) }}</td>
            <td>
              <button @click="editUser(user)" class="edit-btn">Edit</button>
              <button @click="confirmDeleteUser(user.id)" class="delete-btn">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div v-if="loading" class="loading">Loading users...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="filteredUsers.length === 0 && !loading" class="empty-state">
      No users found matching your criteria.
    </div>
    
    <!-- User Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <button class="close-modal" @click="closeModal">×</button>
        
        <h3>{{ isEditing ? 'Edit User' : 'Add New User' }}</h3>
        
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>Full Name</label>
            <input v-model="formData.name" required>
          </div>
          
          <div class="form-group">
            <label>Email</label>
            <input v-model="formData.email" type="email" required :disabled="isEditing">
          </div>
          
          <div class="form-group">
            <label>Role</label>
            <select v-model="formData.role" required>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <div v-if="!isEditing" class="form-group">
            <label>Password</label>
            <input v-model="formData.password" type="password" required>
            <small>Minimum 6 characters</small>
          </div>
          
          <div class="form-group">
            <label>Status</label>
            <select v-model="formData.isActive">
              <option :value="true">Active</option>
              <option :value="false">Inactive</option>
            </select>
          </div>
          
          <div v-if="formData.role === 'student'" class="form-group">
            <label>Class</label>
            <select v-model="formData.class">
              <option value="">Select Class</option>
              <option v-for="classItem in classes" :key="classItem" :value="classItem">
                {{ classItem }}
              </option>
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
    
    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-content delete-modal">
        <h3>Confirm Deletion</h3>
        <p>Are you sure you want to delete this user? This action cannot be undone.</p>
        <div class="delete-actions">
          <button @click="showDeleteModal = false" class="cancel-btn">Cancel</button>
          <button @click="deleteUser" class="confirm-delete-btn">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export default {
  name: 'UserManagement',
  data() {
    return {
      users: [],
      searchQuery: '',
      selectedRole: '',
      showModal: false,
      showDeleteModal: false,
      isEditing: false,
      processing: false,
      loading: false,
      error: '',
      userIdToDelete: null,
      formData: {
        id: '',
        name: '',
        email: '',
        role: 'student',
        isActive: true,
        class: '',
        password: ''
      },
      classes: ['Class A', 'Class B', 'Class C', 'Class D']
    }
  },
  computed: {
    filteredUsers() {
      return this.users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(this.searchQuery.toLowerCase());
        const matchesRole = !this.selectedRole || user.role === this.selectedRole;
        return matchesSearch && matchesRole;
      });
    }
  },
  async created() {
    await this.fetchUsers();
  },
  methods: {
    async fetchUsers() {
      this.loading = true;
      this.error = '';
      
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        this.users = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (err) {
        this.error = 'Failed to load users. Please try again later.';
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
    editUser(user) {
      this.formData = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        class: user.class || '',
        password: ''
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
        name: '',
        email: '',
        role: 'student',
        isActive: true,
        class: '',
        password: ''
      };
    },
    confirmDeleteUser(userId) {
      this.userIdToDelete = userId;
      this.showDeleteModal = true;
    },
    async deleteUser() {
      try {
        await deleteDoc(doc(db, 'users', this.userIdToDelete));
        this.users = this.users.filter(user => user.id !== this.userIdToDelete);
        this.showDeleteModal = false;
      } catch (err) {
        this.error = 'Failed to delete user. Please try again.';
        console.error(err);
      }
    },
    async handleSubmit() {
      this.processing = true;
      this.error = '';
      
      try {
        const userData = {
          name: this.formData.name,
          email: this.formData.email,
          role: this.formData.role,
          isActive: this.formData.isActive,
          lastActive: new Date()
        };
        
        if (this.formData.role === 'student' && this.formData.class) {
          userData.class = this.formData.class;
        }
        
        if (this.isEditing) {
          // Update existing user
          await setDoc(doc(db, 'users', this.formData.id), userData, { merge: true });
        } else {
          // Create new user with auth and firestore
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            this.formData.email,
            this.formData.password
          );
          
          await setDoc(doc(db, 'users', userCredential.user.uid), userData);
        }
        
        await this.fetchUsers();
        this.closeModal();
      } catch (err) {
        this.error = this.isEditing ? 
          'Failed to update user. Please try again.' : 
          'Failed to create user. Please try again.';
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
.user-management-container {
  padding: 20px;
}
.user-controls {
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
.add-user-btn {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
}
.user-list {
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
.role-badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: bold;
}
.role-badge.student {
  background-color: #3498db;
  color: white;
}
.role-badge.teacher {
  background-color: #9b59b6;
  color: white;
}
.role-badge.admin {
  background-color: #2ecc71;
  color: white;
}
.status-badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: bold;
  background-color: #e0e0e0;
  color: #666;
}
.status-badge.active {
  background-color: #00C851;
  color: white;
}
.edit-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 5px;
}
.delete-btn {
  background-color: #ff4444;
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
.delete-modal {
  text-align: center;
  max-width: 400px;
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
.form-group select {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.form-group small {
  color: #666;
  font-size: 0.8em;
}
.form-actions, .delete-actions {
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
.confirm-delete-btn {
  background-color: #ff4444;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
}
</style>