<template>
  <div class="create-exercises-container">
    <h2>Create Exercises</h2>
    
    <div class="exercise-form">
      <div class="form-section">
        <div class="form-group">
          <label>Exercise Title</label>
          <input v-model="exercise.title" placeholder="Enter exercise title" required>
        </div>
        
        <div class="form-group">
          <label>Subject</label>
          <select v-model="exercise.subject" required>
            <option value="">Select Subject</option>
            <option v-for="subject in subjects" :key="subject" :value="subject">
              {{ subject }}
            </option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Difficulty Level</label>
          <select v-model="exercise.difficulty" required>
            <option value="">Select Difficulty</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Instructions</label>
          <textarea v-model="exercise.instructions" placeholder="Enter instructions for students" required></textarea>
        </div>
      </div>
      
      <div class="questions-section">
        <h3>Questions</h3>
        
        <div v-for="(question, index) in exercise.questions" :key="index" class="question-card">
          <div class="question-header">
            <h4>Question {{ index + 1 }}</h4>
            <button @click="removeQuestion(index)" class="remove-btn">Remove</button>
          </div>
          
          <div class="form-group">
            <label>Question Text</label>
            <textarea v-model="question.text" required></textarea>
          </div>
          
          <div class="form-group">
            <label>Question Type</label>
            <select v-model="question.type" @change="resetQuestionOptions(question)">
              <option value="multiple-choice">Multiple Choice</option>
              <option value="true-false">True/False</option>
              <option value="short-answer">Short Answer</option>
            </select>
          </div>
          
          <div v-if="question.type === 'multiple-choice'" class="options-group">
            <label>Options (mark the correct one)</label>
            <div v-for="(option, optIndex) in question.options" :key="optIndex" class="option-item">
              <input type="radio" :name="'q'+index" v-model="question.correctOption" :value="optIndex">
              <input type="text" v-model="question.options[optIndex]" placeholder="Option text" required>
              <button @click="removeOption(index, optIndex)" class="remove-option-btn">×</button>
            </div>
            <button @click="addOption(index)" class="add-option-btn">Add Option</button>
          </div>
          
          <div v-if="question.type === 'true-false'" class="form-group">
            <label>Correct Answer</label>
            <select v-model="question.correctAnswer">
              <option value="true">True</option>
              <option value="false">False</option>
            </select>
          </div>
          
          <div v-if="question.type === 'short-answer'" class="form-group">
            <label>Expected Answer</label>
            <input v-model="question.expectedAnswer" required>
          </div>
          
          <div class="form-group">
            <label>Points</label>
            <input type="number" v-model="question.points" min="1" required>
          </div>
        </div>
        
        <button @click="addQuestion" class="add-question-btn">Add Question</button>
      </div>
      
      <div class="form-actions">
        <button @click="saveDraft" class="save-draft-btn">Save Draft</button>
        <button @click="publishExercise" class="publish-btn">Publish Exercise</button>
      </div>
    </div>
    
    <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script>
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/firebase';

export default {
  name: 'CreateExercises',
  data() {
    return {
      exercise: {
        title: '',
        subject: '',
        difficulty: '',
        instructions: '',
        questions: []
      },
      subjects: ['Math', 'Science', 'Language Arts', 'History', 'Computer Science'],
      successMessage: '',
      error: ''
    }
  },
  methods: {
    addQuestion() {
      this.exercise.questions.push({
        text: '',
        type: 'multiple-choice',
        options: ['', ''],
        correctOption: 0,
        correctAnswer: 'true',
        expectedAnswer: '',
        points: 1
      });
    },
    removeQuestion(index) {
      this.exercise.questions.splice(index, 1);
    },
    addOption(questionIndex) {
      this.exercise.questions[questionIndex].options.push('');
    },
    removeOption(questionIndex, optionIndex) {
      this.exercise.questions[questionIndex].options.splice(optionIndex, 1);
      // Adjust correct option if needed
      if (this.exercise.questions[questionIndex].correctOption >= optionIndex) {
        this.exercise.questions[questionIndex].correctOption = Math.max(
          0, 
          this.exercise.questions[questionIndex].correctOption - 1
        );
      }
    },
    resetQuestionOptions(question) {
      if (question.type === 'multiple-choice') {
        question.options = ['', ''];
        question.correctOption = 0;
      } else if (question.type === 'true-false') {
        question.correctAnswer = 'true';
      } else {
        question.expectedAnswer = '';
      }
    },
    validateExercise() {
      if (!this.exercise.title || !this.exercise.subject || !this.exercise.difficulty || !this.exercise.instructions) {
        this.error = 'Please fill in all exercise details';
        return false;
      }
      
      if (this.exercise.questions.length === 0) {
        this.error = 'Please add at least one question';
        return false;
      }
      
      for (const question of this.exercise.questions) {
        if (!question.text || question.points < 1) {
          this.error = 'Please fill in all question details';
          return false;
        }
        
        if (question.type === 'multiple-choice' && 
            (question.options.length < 2 || question.options.some(opt => !opt.trim()))) {
          this.error = 'Multiple choice questions need at least 2 valid options';
          return false;
        }
        
        if (question.type === 'short-answer' && !question.expectedAnswer.trim()) {
          this.error = 'Please provide an expected answer for short answer questions';
          return false;
        }
      }
      
      return true;
    },
    async saveDraft() {
      if (!this.validateExercise()) return;
      
      try {
        await this.saveExercise(true);
        this.successMessage = 'Draft saved successfully!';
        this.error = '';
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      } catch (err) {
        this.error = 'Failed to save draft. Please try again.';
        console.error(err);
      }
    },
    async publishExercise() {
      if (!this.validateExercise()) return;
      
      try {
        await this.saveExercise(false);
        this.successMessage = 'Exercise published successfully!';
        this.error = '';
        this.resetForm();
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      } catch (err) {
        this.error = 'Failed to publish exercise. Please try again.';
        console.error(err);
      }
    },
    async saveExercise(isDraft) {
      const exerciseData = {
        ...this.exercise,
        isDraft,
        createdAt: new Date(),
        createdBy: this.$store.state.user.uid,
        status: isDraft ? 'draft' : 'published'
      };
      
      await addDoc(collection(db, 'exercises'), exerciseData);
    },
    resetForm() {
      this.exercise = {
        title: '',
        subject: '',
        difficulty: '',
        instructions: '',
        questions: []
      };
    }
  },
  created() {
    this.addQuestion(); // Start with one question
  }
}
</script>

<style scoped>
.create-exercises-container {
  padding: 20px;
}
.exercise-form {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 30px;
}
.form-section {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
}
.form-group {
  margin-bottom: 20px;
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
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}
.form-group textarea {
  min-height: 100px;
}
.questions-section {
  padding: 10px;
}
.question-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}
.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}
.remove-btn {
  background-color: #ff4444;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}
.options-group {
  margin-bottom: 15px;
}
.option-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.option-item input[type="radio"] {
  margin-right: 10px;
}
.option-item input[type="text"] {
  flex: 1;
  padding: 6px;
}
.remove-option-btn {
  background: none;
  border: none;
  color: #ff4444;
  font-size: 1.2em;
  cursor: pointer;
  margin-left: 10px;
}
.add-option-btn,
.add-question-btn {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}
.form-actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 20px;
}
.save-draft-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}
.publish-btn {
  background-color: #00C851;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
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