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
          <input v-model="uploadData.title" required />
        </div>

        <div class="form-group">
          <label>Description</label>
          <textarea v-model="uploadData.description" required></textarea>
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

        <div class="form-group">
          <label>File (Optional)</label>
          <input type="file" ref="fileInput" @change="handleFileChange" />
        </div>

        <button type="submit" :disabled="uploading">
          {{ uploading ? 'Uploading...' : 'Upload Content' }}
        </button>
      </form>
    </div>

    <div v-if="uploadSuccess" class="success-message">
      Content uploaded successfully!
    </div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script>
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { db, storage } from '@/firebase';
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
        file: null,
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
        file: null,
        type: ''
      };
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = '';
      }
      this.uploadSuccess = false;
      this.error = '';
    },
    handleFileChange(event) {
      this.uploadData.file = event.target.files[0];
    },
    async handleUpload() {
      this.uploading = true;
      this.error = '';
      this.uploadSuccess = false;

      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
      const authInstance = getAuth();

      try {
        let fileUrl = null;
        if (this.uploadData.file) {
          const filePath = `artifacts/${appId}/public/content_files/${Date.now()}_${this.uploadData.file.name}`;
          const fileRef = storageRef(storage, filePath);
          await uploadBytes(fileRef, this.uploadData.file);
          fileUrl = await getDownloadURL(fileRef);
        }

        const docData = {
          title: this.uploadData.title,
          description: this.uploadData.description,
          fileUrl: fileUrl,
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
  padding: 30px;
  font-family: 'Inter', sans-serif;
  background-color: #f8f9fa;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
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
}

.upload-form-card {
  background-color: white;
  padding: 35px;
  border-radius: 12px;
  width: 95%;
  max-width: 650px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  margin-top: 30px;
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
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 12px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1.05em;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}

.form-group textarea {
  min-height: 120px;
  resize: vertical;
}

button[type="submit"] {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 15px 25px;
  border-radius: 8px;
  cursor: pointer;
  width: 100%;
  margin-top: 20px;
  font-size: 1.2em;
  font-weight: bold;
  transition: background-color 0.3s ease, transform 0.2s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

button[type="submit"]:hover {
  background-color: #36a374;
  transform: translateY(-2px);
}

button[type="submit"]:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.success-message {
  color: #28a745;
  margin-top: 30px;
  padding: 15px;
  background-color: #d4edda;
  border-radius: 8px;
  text-align: center;
  font-size: 1.1em;
  font-weight: 600;
  border: 1px solid #c3e6cb;
  width: 100%;
  max-width: 650px;
}

.error {
  color: #dc3545;
  margin-top: 30px;
  padding: 15px;
  background-color: #f8d7da;
  border-radius: 8px;
  text-align: center;
  font-size: 1.1em;
  font-weight: 600;
  border: 1px solid #f5c6cb;
  width: 100%;
  max-width: 650px;
}

@media (max-width: 768px) {
  h2 {
    font-size: 2em;
  }
  .upload-form-card {
    padding: 25px;
  }
  .form-group input,
  .form-group textarea,
  .form-group select {
    padding: 10px;
  }
  button[type="submit"] {
    padding: 12px 20px;
    font-size: 1.1em;
  }
}

@media (max-width: 480px) {
  .upload-content-container {
    padding: 20px 15px;
  }
  h2 {
    font-size: 1.8em;
  }
  .upload-form-card {
    padding: 20px;
  }
}
</style>
