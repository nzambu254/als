<template>
  <div class="upload-content-container">
    <h2>Upload Content</h2>

    <div class="upload-form-card">
      <form @submit.prevent="handleUpload">
        <div class="form-group">
          <label>Content Type</label>
          <select v-model="uploadData.type" required>
            <option value="">Select Type</option>
            <option value="note">Notes</option>
            <option value="exercise">Exercise</option>
          </select>
        </div>

        <div class="form-group">
          <label>Title</label>
          <input v-model="uploadData.title" placeholder="Enter content title" required />
        </div>

        <div class="form-group">
          <label>Description</label>
          <textarea v-model="uploadData.description" placeholder="Enter detailed description" required></textarea>
        </div>

        <div v-if="uploadData.type === 'exercise'" class="form-group">
          <label>Difficulty Level</label>
          <select v-model="uploadData.difficulty" required>
            <option value="">Select Difficulty</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        <button type="submit" :disabled="uploading" class="submit-button">
          {{ uploading ? 'Uploading...' : 'Upload Content' }}
          <span v-if="uploading" class="spinner"></span>
        </button>
      </form>
    </div>

    <transition name="fade">
      <div v-if="uploadSuccess" class="toast-success">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        Content uploaded successfully!
      </div>
    </transition>

    <transition name="fade">
      <div v-if="error" class="toast-error">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        {{ error }}
      </div>
    </transition>
  </div>
</template>

<script>
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { getAuth } from 'firebase/auth';

export default {
  name: 'UploadContent',
  data() {
    return {
      uploading: false,
      uploadSuccess: false,
      error: '',
      uploadData: {
        title: '',
        description: '',
        difficulty: '',
        type: ''
      }
    };
  },
  methods: {
    resetUploadData() {
      this.uploadData = {
        title: '',
        description: '',
        difficulty: '',
        type: ''
      };
      this.error = '';
    },
    async handleUpload() {
      this.uploading = true;
      this.error = '';
      this.uploadSuccess = false;

      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
      const authInstance = getAuth();

      try {
        const docData = {
          title: this.uploadData.title,
          description: this.uploadData.description,
          createdAt: new Date(),
          createdBy: authInstance.currentUser ? authInstance.currentUser.uid : 'anonymous',
          type: this.uploadData.type
        };

        if (this.uploadData.type === 'exercise') {
          docData.difficulty = this.uploadData.difficulty;
        }

        await addDoc(collection(db, `artifacts/${appId}/public/data/${this.uploadData.type}s`), docData);

        this.uploadSuccess = true;
        this.resetUploadData();
        setTimeout(() => {
          this.uploadSuccess = false;
        }, 3000);
      } catch (err) {
        this.error = 'Upload failed. Please try again.';
        console.error('Upload error:', err);
      } finally {
        this.uploading = false;
      }
    }
  }
};
</script>

<style scoped>
.upload-content-container {
  padding: 40px 20px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: #f8f9fa;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

h2 {
  color: #2c3e50;
  margin-bottom: 30px;
  text-align: center;
  font-size: 2.2rem;
  font-weight: 600;
  width: 100%;
  max-width: 800px;
}

.upload-form-card {
  background-color: white;
  padding: 40px;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  margin-top: 20px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 10px;
  font-weight: 500;
  color: #4a5568;
  font-size: 0.95rem;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 14px 16px;
  box-sizing: border-box;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background-color: #f8fafc;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  border-color: #4299e1;
  outline: none;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
  background-color: white;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: #a0aec0;
}

.form-group textarea {
  min-height: 140px;
  resize: vertical;
  line-height: 1.5;
}

.submit-button {
  background-color: #4299e1;
  color: white;
  border: none;
  padding: 16px 24px;
  border-radius: 10px;
  cursor: pointer;
  width: 100%;
  margin-top: 10px;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.submit-button:hover {
  background-color: #3182ce;
  transform: translateY(-1px);
}

.submit-button:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
  transform: none;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.toast-success,
.toast-error {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  padding: 16px 24px;
  border-radius: 10px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.toast-success {
  background-color: #48bb78;
  color: white;
}

.toast-error {
  background-color: #f56565;
  color: white;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

@media (max-width: 768px) {
  .upload-form-card {
    padding: 30px;
  }
  
  h2 {
    font-size: 1.8rem;
  }
}

@media (max-width: 480px) {
  .upload-content-container {
    padding: 30px 15px;
  }
  
  .upload-form-card {
    padding: 25px 20px;
  }
  
  .form-group input,
  .form-group textarea,
  .form-group select {
    padding: 12px 14px;
  }
  
  .submit-button {
    padding: 14px 20px;
  }
}
</style>