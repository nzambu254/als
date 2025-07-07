<template>
  <div class="practice-quiz-container">
    <h2>Practice Quiz: {{ quiz?.title }}</h2>

    <div v-if="loading">Loading questions...</div>
    <div v-else-if="!quiz">Quiz not found.</div>
    <div v-else>
      <div v-for="(question, index) in quiz.questions" :key="index" class="question-block">
        <h4>Question {{ index + 1 }}</h4>
        <p>{{ question.text }}</p>

        <div v-if="question.type === 'multiple-choice'">
          <div v-for="(option, optIndex) in question.options" :key="optIndex">
            <label :class="getAnswerClass(index, optIndex)">
              <input
                type="radio"
                :name="'q' + index"
                :value="optIndex"
                v-model="studentAnswers[index]"
                :disabled="submitted"
              />
              {{ option }}
            </label>
          </div>
        </div>

        <div v-if="question.type === 'true-false'">
          <label :class="getAnswerClass(index, 'true')">
            <input
              type="radio"
              :name="'q' + index"
              value="true"
              v-model="studentAnswers[index]"
              :disabled="submitted"
            />
            True
          </label>
          <label :class="getAnswerClass(index, 'false')">
            <input
              type="radio"
              :name="'q' + index"
              value="false"
              v-model="studentAnswers[index]"
              :disabled="submitted"
            />
            False
          </label>
        </div>

        <div v-if="submitted" class="answer-feedback">
          <span :class="isCorrect(index) ? 'correct' : 'incorrect'">
            {{ isCorrect(index) ? 'Correct' : 'Incorrect' }}
          </span>
          <span class="correct-answer">Correct Answer:
            <strong>
              {{ question.type === 'multiple-choice' ? question.options[question.correctOption] : (question.correctAnswer === 'true' ? 'True' : 'False') }}
            </strong>
          </span>
        </div>
      </div>

      <div class="action-buttons">
        <button @click="submitAnswers" :disabled="submitted">Submit Answers</button>
        <button v-if="submitted" @click="generatePDF" class="download-btn">
          Download Report
        </button>
      </div>

      <div v-if="submitted" class="results">
        <h3>Your Score: {{ score }}/{{ quiz.questions.length }}</h3>
        <p>Performance saved successfully.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '@/firebase';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default {
  name: 'PracticeQuizzes',
  data() {
    return {
      quiz: null,
      studentAnswers: [],
      submitted: false,
      score: 0,
      loading: true
    };
  },
  async mounted() {
    try {
      const q = query(collection(db, 'exercises'), where('title', '==', 'Loci Questions Set 1'));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        this.quiz = doc.data();
        this.quiz.id = doc.id;
        this.studentAnswers = new Array(this.quiz.questions.length).fill(null);
      }
    } catch (err) {
      console.error('Failed to load quiz:', err);
    } finally {
      this.loading = false;
    }
  },
  methods: {
    isCorrect(index) {
      const q = this.quiz.questions[index];
      const ans = this.studentAnswers[index];
      if (q.type === 'multiple-choice') {
        return parseInt(ans) === q.correctOption;
      } else if (q.type === 'true-false') {
        return ans === q.correctAnswer;
      }
      return false;
    },
    getAnswerClass(index, optionValue) {
      if (!this.submitted) return '';
      const q = this.quiz.questions[index];
      const correct = q.type === 'multiple-choice'
        ? q.correctOption === parseInt(optionValue)
        : q.correctAnswer === optionValue;

      return correct ? 'highlight-correct' : '';
    },
    async submitAnswers() {
      if (this.submitted) return;

      let score = 0;
      this.quiz.questions.forEach((q, index) => {
        const ans = this.studentAnswers[index];
        if (q.type === 'multiple-choice' && parseInt(ans) === q.correctOption) {
          score++;
        } else if (q.type === 'true-false' && ans === q.correctAnswer) {
          score++;
        }
      });

      this.score = score;
      this.submitted = true;

      try {
        const auth = getAuth();
        const user = auth.currentUser;
        await addDoc(collection(db, 'submissions'), {
          quizId: this.quiz.id,
          quizTitle: this.quiz.title,
          studentId: user ? user.uid : 'anonymous',
          score,
          total: this.quiz.questions.length,
          submittedAt: new Date(),
          answers: this.studentAnswers
        });
      } catch (err) {
        console.error('Failed to save submission:', err);
      }
    },
    async generatePDF() {
      try {
        // Create a temporary element to generate the PDF content
        const element = document.createElement('div');
        element.style.width = '800px';
        element.style.padding = '20px';
        element.style.backgroundColor = 'white';
        
        // Add title and score
        const title = document.createElement('h2');
        title.textContent = `Quiz Report: ${this.quiz.title}`;
        element.appendChild(title);
        
        const score = document.createElement('h3');
        score.textContent = `Score: ${this.score}/${this.quiz.questions.length}`;
        element.appendChild(score);
        
        // Add each question and its details
        this.quiz.questions.forEach((question, index) => {
          const questionBlock = document.createElement('div');
          questionBlock.style.marginBottom = '20px';
          questionBlock.style.borderBottom = '1px solid #eee';
          questionBlock.style.paddingBottom = '15px';
          
          const questionTitle = document.createElement('h4');
          questionTitle.textContent = `Question ${index + 1}`;
          questionBlock.appendChild(questionTitle);
          
          const questionText = document.createElement('p');
          questionText.textContent = question.text;
          questionText.style.fontWeight = 'bold';
          questionBlock.appendChild(questionText);
          
          // Add student answer and correctness
          const studentAnswer = document.createElement('p');
          const ans = this.studentAnswers[index];
          let studentAnswerText = 'Not answered';
          
          if (question.type === 'multiple-choice' && ans !== null) {
            studentAnswerText = `Your answer: ${question.options[ans]}`;
          } else if (question.type === 'true-false' && ans !== null) {
            studentAnswerText = `Your answer: ${ans}`;
          }
          
          studentAnswer.textContent = studentAnswerText;
          studentAnswer.style.color = this.isCorrect(index) ? 'green' : 'red';
          questionBlock.appendChild(studentAnswer);
          
          // Add correct answer
          const correctAnswer = document.createElement('p');
          let correctAnswerText = '';
          if (question.type === 'multiple-choice') {
            correctAnswerText = `Correct answer: ${question.options[question.correctOption]}`;
          } else {
            correctAnswerText = `Correct answer: ${question.correctAnswer === 'true' ? 'True' : 'False'}`;
          }
          correctAnswer.textContent = correctAnswerText;
          correctAnswer.style.color = 'green';
          questionBlock.appendChild(correctAnswer);
          
          element.appendChild(questionBlock);
        });
        
        // Add date
        const date = document.createElement('p');
        date.textContent = `Report generated on: ${new Date().toLocaleString()}`;
        date.style.marginTop = '20px';
        date.style.fontStyle = 'italic';
        element.appendChild(date);
        
        // Append to body (temporarily)
        document.body.appendChild(element);
        
        // Generate PDF
        const canvas = await html2canvas(element);
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 295; // A4 height in mm
        const imgHeight = canvas.height * imgWidth / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`quiz-report-${this.quiz.title}-${new Date().toISOString().slice(0,10)}.pdf`);
        
        // Clean up
        document.body.removeChild(element);
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Failed to generate PDF. Please try again.');
      }
    }
  }
};
</script>

<style scoped>
.practice-quiz-container {
  padding: 20px;
  max-width: 800px;
  margin: auto;
}
.question-block {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}
h4 {
  margin-bottom: 10px;
}
.action-buttons {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}
button {
  padding: 10px 20px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1em;
  cursor: pointer;
}
button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
.download-btn {
  background-color: #2c3e50;
}
.results {
  margin-top: 20px;
  background-color: #d4edda;
  color: #155724;
  padding: 15px;
  border-radius: 5px;
  font-weight: bold;
}
.answer-feedback {
  margin-top: 10px;
  font-weight: 600;
}
.correct {
  color: green;
}
.incorrect {
  color: red;
}
.correct-answer {
  display: block;
  margin-top: 5px;
  color: #555;
}
.highlight-correct {
  background-color: #e6ffe6;
  padding: 2px 6px;
  border-radius: 4px;
}
</style>