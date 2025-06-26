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
            <!-- Removed Last Active Column -->
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
            <!-- Removed Last Active Data Cell -->
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
          
          <!-- Removed Password field for new user creation -->
          
          <div class="form-group">
            <label>Status</label>
            <select v-model="formData.isActive">
              <option :value="true">Active</option>
              <option :value="false">Inactive</option>
            </select>
          </div>
          
          <!-- Removed Class selection section -->
          
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
import { createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'; // Added sendPasswordResetEmail

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
        // Removed class from formData
      },
      // Removed classes array
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
        console.error("Fetch users error:", err);
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
        // Removed class from formData for editing
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
        // Removed class from reset
      };
    },
    confirmDeleteUser(userId) {
      this.userIdToDelete = userId;
      this.showDeleteModal = true;
    },
    async deleteUser() {
      this.error = '';
      try {
        await deleteDoc(doc(db, 'users', this.userIdToDelete));
        this.users = this.users.filter(user => user.id !== this.userIdToDelete);
        this.showDeleteModal = false;
      } catch (err) {
        this.error = 'Failed to delete user. Please try again.';
        console.error("Delete user error:", err);
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
          // Removed lastActive from userData
        };
        
        // Removed class assignment for student role
        
        if (this.isEditing) {
          // Update existing user in Firestore
          await setDoc(doc(db, 'users', this.formData.id), userData, { merge: true });
        } else {
          // Create new user: first in Firebase Auth with a temporary password, then send reset email, then save to Firestore
          
          // Generate a secure, random temporary password that the admin will never see.
          // This is necessary because createUserWithEmailAndPassword requires a password.
          const tempPassword = Math.random().toString(36).slice(2, 10); 
          
          try {
            // Create user with temporary password in Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(
              auth,
              this.formData.email,
              tempPassword
            );
            
            // Send password reset email to the newly created user's email.
            // This allows the user to set their own strong password.
            await sendPasswordResetEmail(auth, this.formData.email);
            console.log("Password reset email sent to:", this.formData.email);
            
            // Save user data to Firestore using the newly created Auth UID
            await setDoc(doc(db, 'users', userCredential.user.uid), userData);

          } catch (authError) {
            // Handle Firebase Authentication specific errors
            if (authError.code === 'auth/email-already-in-use') {
              this.error = 'This email is already registered. If you want to send a reset link to an existing user, please ensure they are already registered in the system.';
            } else if (authError.code === 'auth/invalid-email') {
              this.error = 'The email address is not valid.';
            } else {
              this.error = `Failed to create user account: ${authError.message}`;
            }
            console.error("Firebase Auth Error:", authError);
            this.processing = false; // Stop processing on auth error
            return; // Exit function if auth creation fails
          }
        }
        
        await this.fetchUsers(); // Refresh the user list
        this.closeModal(); // Close the modal on success
      } catch (firestoreError) {
        // Handle Firestore errors
        this.error = this.isEditing ? 
          'Failed to update user. Please try again.' : 
          'Failed to save user data. Please try again.';
        console.error("Firestore Error:", firestoreError);
      } finally {
        this.processing = false; // Always set processing to false
      }
    },
    // Removed formatDate method as 'Last Active' column is removed
  }
}
</script>

<style scoped>
.user-management-container {
  padding: 20px;
  font-family: 'Inter', sans-serif; /* Added Inter font */
}
h2 {
  color: #333;
  margin-bottom: 25px;
  text-align: center;
}
.user-controls {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}
.search-filter {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap; /* Allow wrapping on small screens */
}
.search-filter input,
.search-filter select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px; /* Rounded corners */
  flex-grow: 1;
  min-width: 150px; /* Ensure inputs don't get too small */
}
.add-user-btn {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px; /* Rounded corners */
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.add-user-btn:hover {
  background-color: #36a374;
}
.user-list {
  overflow-x: auto;
  border-radius: 8px; /* Rounded corners */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
}
th, td {
  padding: 15px 20px;
  text-align: left;
  border-bottom: 1px solid #eee;
}
th {
  background-color: #f8f9fa;
  font-weight: bold;
  color: #555;
  text-transform: uppercase;
  font-size: 0.9em;
}
tr:last-child td {
  border-bottom: none;
}
.role-badge {
  display: inline-block;
  padding: 5px 12px;
  border-radius: 20px; /* More rounded */
  font-size: 0.85em;
  font-weight: bold;
  text-transform: capitalize;
}
.role-badge.student {
  background-color: #e0f7fa; /* Light cyan */
  color: #007bb6; /* Darker blue */
}
.role-badge.teacher {
  background-color: #f3e5f5; /* Light purple */
  color: #8e24aa; /* Darker purple */
}
.role-badge.admin {
  background-color: #e8f5e9; /* Light green */
  color: #388e3c; /* Darker green */
}
.status-badge {
  display: inline-block;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.85em;
  font-weight: bold;
  background-color: #f5f5f5;
  color: #777;
}
.status-badge.active {
  background-color: #e8f5e9; /* Light green */
  color: #28a745; /* Bootstrap green */
}
.edit-btn, .delete-btn {
  border: none;
  padding: 8px 15px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s ease;
}
.edit-btn {
  background-color: #007bff; /* Bootstrap blue */
  color: white;
  margin-right: 8px;
}
.edit-btn:hover {
  background-color: #0056b3;
}
.delete-btn {
  background-color: #dc3545; /* Bootstrap red */
  color: white;
}
.delete-btn:hover {
  background-color: #c82333;
}
.loading, .error, .empty-state {
  text-align: center;
  padding: 20px;
  font-size: 1.1em;
  color: #666;
}
.error {
  color: #dc3545;
  font-weight: bold;
}
.empty-state {
  color: #888;
}

/* Modal Styling */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
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
  max-width: 550px;
  position: relative;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.3s ease-out;
}
.delete-modal {
  text-align: center;
  max-width: 400px;
}
.close-modal {
  position: absolute;
  top: 15px;
  right: 15px;
  font-size: 1.8em;
  background: none;
  border: none;
  cursor: pointer;
  color: #777;
  transition: color 0.2s ease;
}
.close-modal:hover {
  color: #333;
}
h3 {
  text-align: center;
  margin-bottom: 25px;
  color: #333;
}
.form-group {
  margin-bottom: 20px;
}
.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #555;
}
.form-group input,
.form-group select {
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1em;
}
.form-group input:focus,
.form-group select:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}
.form-group small {
  color: #888;
  font-size: 0.9em;
  margin-top: 5px;
  display: block;
}
.form-actions, .delete-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
}
.cancel-btn, .submit-btn, .confirm-delete-btn {
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
.submit-btn {
  background-color: #28a745; /* Bootstrap green */
  color: white;
  border: none;
}
.submit-btn:hover {
  background-color: #218838;
}
.submit-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  opacity: 0.8;
}
.confirm-delete-btn {
  background-color: #dc3545; /* Bootstrap red */
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

/* Responsive adjustments */
@media (max-width: 768px) {
  .user-management-container {
    padding: 15px;
  }
  .search-filter {
    flex-direction: column;
    align-items: stretch;
  }
  .search-filter input,
  .search-filter select,
  .add-user-btn {
    width: 100%;
    margin-bottom: 10px;
  }
  .search-filter button {
    margin-bottom: 0; /* Remove extra margin for the last button */
  }
  th, td {
    padding: 10px 12px;
  }
  .form-actions, .delete-actions {
    flex-direction: column;
    gap: 10px;
  }
  .cancel-btn, .submit-btn, .confirm-delete-btn {
    width: 100%;
  }
}
</style>
