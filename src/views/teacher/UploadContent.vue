<template>
  <div class="upload-content-container">
    <h2>Upload Content</h2>
    
    <div class="upload-options">
      <div class="upload-card" @click="showUploadModal('tutorial')">
        <div class="upload-icon">📚</div>
        <h3>Tutorial</h3>
        <p>Upload learning materials and resources</p>
      </div>
      
      <div class="upload-card" @click="showUploadModal('exercise')">
        <div class="upload-icon">✍️</div>
        <h3>Exercise</h3>
        <p>Create practice exercises</p>
      </div>
      
      <div class="upload-card" @click="showUploadModal('quiz')">
        <div class="upload-icon">📝</div>
        <h3>Quiz</h3>
        <p>Create assessments</p>
      </div>
    </div>
    
    <!-- Upload Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <button class="close-modal" @click="closeModal">×</button>
        
        <h3>{{ modalTitle }}</h3>
        
        <form @submit.prevent="handleUpload">
          <div class="form-group">
            <label>Title</label>
            <input v-model="uploadData.title" required>
          </div>
          
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="uploadData.description" required></textarea>
          </div>
          
          <div class="form-group">
            <label>Subject</label>
            <select v-model="uploadData.subject" required>
              <option value="">Select Subject</option>
              <option v-for="subject in subjects" :key="subject" :value="subject">
                {{ subject }}
              </option>
            </select>
          </div>
          
          <div v-if="currentUploadType === 'exercise'" class="form-group">
            <label>Difficulty Level</label>
            <select v-model="uploadData.difficulty" required>
              <option value="">Select Difficulty</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          
          <div v-if="currentUploadType === 'quiz'" class="form-group">
            <label>Duration (minutes)</label>
            <input type="number" v-model="uploadData.duration" min="1" required>
          </div>
          
          <div class="form-group">
            <label>File</label>
            <input type="file" ref="fileInput" @change="handleFileChange" required>
          </div>
          
          <div class="form-group">
            <label>Target Class</label>
            <select v-model="uploadData.targetClass" required>
              <option value="all">All Classes</option>
              <option v-for="classItem in classes" :key="classItem" :value="classItem">
                {{ classItem }}
              </option>
            </select>
          </div>
          
          <button type="submit" :disabled="uploading">
            {{ uploading ? 'Uploading...' : 'Upload' }}
          </button>
        </form>
      </div>
    </div>
    
    <div v-if="uploadSuccess" class="success-message">
      Content uploaded successfully!
    </div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script>
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { db, storage } from '@/firebase';

export default {
  name: 'UploadContent',
  data() {
    return {
      showModal: false,
      currentUploadType: '',
      uploading: false,
      uploadSuccess: false,
      error: '',
      uploadData: {
        title: '',
        description: '',
        subject: '',
        difficulty: '',
        duration: 30,
        targetClass: 'all',
        file: null
      },
      subjects: ['Math', 'Science', 'Language Arts', 'History', 'Computer Science'],
      classes: ['Class A', 'Class B', 'Class C', 'Class D']
    }
  },
  computed: {
    modalTitle() {
      return `Upload ${this.currentUploadType.charAt(0).toUpperCase() + this.currentUploadType.slice(1)}`;
    }
  },
  methods: {
    showUploadModal(type) {
      this.currentUploadType = type;
      this.resetUploadData();
      this.showModal = true;
      this.uploadSuccess = false;
      this.error = '';
    },
    closeModal() {
      this.showModal = false;
    },
    resetUploadData() {
      this.uploadData = {
        title: '',
        description: '',
        subject: '',
        difficulty: '',
        duration: 30,
        targetClass: 'all',
        file: null
      };
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = '';
      }
    },
    handleFileChange(event) {
      this.uploadData.file = event.target.files[0];
    },
    async handleUpload() {
      this.uploading = true;
      this.error = '';
      
      try {
        // 1. Upload file to storage
        const fileRef = ref(storage, `${this.currentUploadType}s/${Date.now()}_${this.uploadData.file.name}`);
        await uploadBytes(fileRef, this.uploadData.file);
        const fileUrl = await getDownloadURL(fileRef);
        
        // 2. Create document in Firestore
        const docData = {
          title: this.uploadData.title,
          description: this.uploadData.description,
          subject: this.uploadData.subject,
          targetClass: this.uploadData.targetClass,
          fileUrl,
          createdAt: new Date(),
          createdBy: this.$store.state.user.uid
        };
        
        if (this.currentUploadType === 'exercise') {
          docData.difficulty = this.uploadData.difficulty;
        }
        
        if (this.currentUploadType === 'quiz') {
          docData.duration = this.uploadData.duration;
          docData.questions = []; // Will be added later
        }
        
        await addDoc(collection(db, `${this.currentUploadType}s`), docData);
        
        this.uploadSuccess = true;
        this.closeModal();
        setTimeout(() => {
          this.uploadSuccess = false;
        }, 3000);
      } catch (err) {
        this.error = 'Upload failed. Please try again.';
        console.error(err);
      } finally {
        this.uploading = false;
      }
    }
  }
}
</script>

<style scoped>
.upload-content-container {
  padding: 20px;
}
.upload-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 30px;
}
.upload-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.upload-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}
.upload-icon {
  font-size: 2.5em;
  margin-bottom: 10px;
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
  max-height: 90vh;
  overflow-y: auto;
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
  min-height: 100px;
}
button[type="submit"] {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
  margin-top: 10px;
}
button[type="submit"]:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
.success-message {
  color: #00C851;
  margin-top: 20px;
  padding: 10px;
  background-color: #e8f5e9;
  border-radius: 4px;
  text-align: center;
}
.error {
  color: #ff4444;
  margin-top: 20px;
  padding: 10px;
  background-color: #ffebee;
  border-radius: 4px;
  text-align: center;
}
</style>