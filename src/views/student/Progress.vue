<template>
  <div class="progress-container">
    <h2>My Progress</h2>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner-small"></div>
      <p>Loading progress data...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p class="error-message">{{ error }}</p>
      <p>Please ensure you are logged in and your profile exists. Try refreshing the page.</p>
    </div>

    <div v-else class="progress-content">
      <div class="report-actions">
        <button @click="generatePDF" class="download-btn">
          <span class="btn-icon">📄</span>
          Download Progress Report
        </button>
      </div>

      <div class="progress-overview">
        <div class="progress-card notes-card">
          <h3>Completed Notes</h3>
          <div class="progress-value">{{ completedNotes }}</div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: notesProgress + '%' }"></div>
          </div>
          <div class="progress-percent">{{ notesProgress }}%</div>
        </div>

        <div class="progress-card exercises-card">
          <h3>Completed Exercises</h3>
          <div class="progress-value">{{ completedExercises }}</div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: exerciseProgress + '%' }"></div>
          </div>
          <div class="progress-percent">{{ exerciseProgress }}%</div>
        </div>

        <div class="progress-card quizzes-card">
          <h3>Quizzes Taken</h3>
          <div class="progress-value">{{ completedQuizzes }}</div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: quizProgress + '%' }"></div>
          </div>
          <div class="progress-percent">{{ quizProgress }}%</div>
        </div>

        <div class="progress-card tutorials-card">
          <h3>Completed Tutorials</h3>
          <div class="progress-value">{{ completedTutorials }}</div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: tutorialProgress + '%' }"></div>
          </div>
          <div class="progress-percent">{{ tutorialProgress }}%</div>
        </div>
      </div>

      <div class="progress-details">
        <div class="recent-activity">
          <h3>Recent Activity</h3>
          <ul v-if="recentActivities.length > 0">
            <li v-for="activity in recentActivities" :key="activity.id">
              <span class="activity-type">{{ activity.type }}</span>
              <span class="activity-title">{{ truncateText(activity.title, 30) }}</span>
              <span class="activity-date">{{ formatDate(activity.date) }}</span>
              <span class="activity-score" v-if="activity.score !== undefined">
                Score: {{ activity.score }}%
              </span>
            </li>
          </ul>
          <p v-else class="no-activity">No recent activity found.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default {
  name: 'StudentProgress',
  data() {
    return {
      completedNotes: 0,
      completedExercises: 0,
      completedTutorials: 0,
      completedQuizzes: 0,

      totalNotes: 1,
      totalExercises: 1,
      totalTutorials: 1,
      totalQuizzes: 1,

      notesProgress: 0,
      exerciseProgress: 0,
      tutorialProgress: 0,
      quizProgress: 0,

      recentActivities: [],
      loading: true,
      error: '',
      authStateListener: null,
      userProfile: null,
      currentDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
  },
  async mounted() {
    const auth = getAuth();
    this.authStateListener = onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.userProfile = {
          name: user.displayName || 'Student',
          email: user.email
        };
        await this.fetchProgressData(user.uid);
      } else {
        this.loading = false;
        this.error = 'You must be logged in to view your progress.';
        if (this.$router && this.$router.currentRoute.path !== '/login') {
          this.$router.push('/login');
        }
      }
    });
  },
  beforeUnmount() {
    if (this.authStateListener) {
      this.authStateListener();
    }
  },
  methods: {
    async fetchProgressData(uid) {
      this.loading = true;
      this.error = '';

      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

      try {
        const [
          notesTotalSnapshot,
          exercisesTotalSnapshot_artifacts,
          exercisesTotalSnapshot_root,
          tutorialsTotalSnapshot,
          quizzesTotalSnapshot
        ] = await Promise.all([
          getDocs(collection(db, `artifacts/${appId}/public/data/notes`)),
          getDocs(collection(db, `artifacts/${appId}/public/data/exercises`)),
          getDocs(collection(db, 'exercises')),
          getDocs(collection(db, 'tutorials')),
          getDocs(collection(db, 'quizzes'))
        ]);

        this.totalNotes = notesTotalSnapshot.size > 0 ? notesTotalSnapshot.size : 1;

        const combinedExercises = new Set();
        exercisesTotalSnapshot_artifacts.docs.forEach(doc => combinedExercises.add(doc.id));
        exercisesTotalSnapshot_root.docs.forEach(doc => combinedExercises.add(doc.id));
        this.totalExercises = combinedExercises.size > 0 ? combinedExercises.size : 1;

        this.totalTutorials = tutorialsTotalSnapshot.size > 0 ? tutorialsTotalSnapshot.size : 1;
        this.totalQuizzes = quizzesTotalSnapshot.size > 0 ? quizzesTotalSnapshot.size : 1;

        const userDoc = await getDoc(doc(db, 'users', uid));
        const quizSubmissionsQuery = query(collection(db, 'submissions'), where('studentId', '==', uid));
        const quizSubmissionsSnapshot = await getDocs(quizSubmissionsQuery);
        const userQuizSubmissions = quizSubmissionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (userDoc.exists()) {
          const userData = userDoc.data();

          this.completedNotes = userData.completedNotes?.length || 0;
          this.completedExercises = userData.completedExercises?.length || 0;
          this.completedTutorials = userData.completedTutorials?.length || 0;

          const uniqueCompletedQuizzes = new Set(userQuizSubmissions.map(submission => submission.quizId));
          this.completedQuizzes = uniqueCompletedQuizzes.size;

          this.notesProgress = Math.round((this.completedNotes / this.totalNotes) * 100);
          this.exerciseProgress = Math.round((this.completedExercises / this.totalExercises) * 100);
          this.tutorialProgress = Math.round((this.completedTutorials / this.totalTutorials) * 100);
          this.quizProgress = Math.round((this.completedQuizzes / this.totalQuizzes) * 100);

          let activities = [];

          (userData.completedNotes || []).forEach(n => {
            activities.push({
              id: n.id,
              type: 'Note',
              title: n.title,
              date: n.completedAt,
            });
          });

          (userData.completedExercises || []).forEach(e => {
            activities.push({
              id: e.id,
              type: 'Exercise',
              title: e.title,
              date: e.completedAt,
            });
          });

          (userData.completedTutorials || []).forEach(t => {
            activities.push({
              id: t.id,
              type: 'Tutorial',
              title: t.title,
              date: t.completedAt,
            });
          });

          userQuizSubmissions.forEach(submission => {
            activities.push({
              id: submission.id,
              type: 'Quiz',
              title: submission.quizTitle,
              date: submission.submittedAt,
              score: Math.round((submission.score / submission.total) * 100)
            });
          });

          this.recentActivities = activities
            .sort((a, b) => new Date(b.date?.toDate ? b.date.toDate() : b.date) - new Date(a.date?.toDate ? a.date.toDate() : a.date))
            .slice(0, 5);

        } else {
          this.error = 'User profile data not found.';
          console.warn('User document not found for UID:', uid);
        }
      } catch (err) {
        this.error = 'Failed to load progress data. Please try again later.';
        console.error('Error in fetchProgressData:', err);
      } finally {
        this.loading = false;
      }
    },
    formatDate(timestamp) {
      if (!timestamp) return 'N/A';
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return date.toLocaleDateString(undefined, options);
    },
    truncateText(text, maxLength) {
      if (!text) return 'N/A';
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    },
    generatePDF() {
      // Create a new PDF document
      const pdf = new jsPDF();
      
      // Add logo or header
      pdf.setFontSize(20);
      pdf.setTextColor(40);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Learning Progress Report', 105, 20, null, null, 'center');
      
      // Add student info
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Student: ${this.userProfile.name}`, 15, 35);
      pdf.text(`Email: ${this.userProfile.email}`, 15, 45);
      pdf.text(`Report Date: ${this.currentDate}`, 15, 55);
      
      // Add progress overview section
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Progress Overview', 15, 70);
      
      // Add progress cards as a table
      autoTable(pdf, {
        startY: 75,
        head: [['Category', 'Completed', 'Total', 'Progress']],
        body: [
          ['Notes', this.completedNotes, this.totalNotes, `${this.notesProgress}%`],
          ['Exercises', this.completedExercises, this.totalExercises, `${this.exerciseProgress}%`],
          ['Tutorials', this.completedTutorials, this.totalTutorials, `${this.tutorialProgress}%`],
          ['Quizzes', this.completedQuizzes, this.totalQuizzes, `${this.quizProgress}%`]
        ],
        theme: 'grid',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        margin: { top: 10 }
      });
      
      // Add recent activity section
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Recent Activities', 15, pdf.lastAutoTable.finalY + 20);
      
      // Prepare activity data for table
      const activityData = this.recentActivities.map(activity => [
        activity.type,
        activity.title,
        this.formatDate(activity.date),
        activity.score ? `${activity.score}%` : 'N/A'
      ]);
      
      autoTable(pdf, {
        startY: pdf.lastAutoTable.finalY + 25,
        head: [['Type', 'Title', 'Date', 'Score']],
        body: activityData,
        theme: 'grid',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 70 },
          2: { cellWidth: 40 },
          3: { cellWidth: 20 }
        },
        styles: {
          fontSize: 10,
          cellPadding: 3,
          overflow: 'linebreak'
        }
      });
      
      // Add footer
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setTextColor(150);
        pdf.text(
          `Page ${i} of ${pageCount}`,
          pdf.internal.pageSize.width - 30,
          pdf.internal.pageSize.height - 10
        );
      }
      
      // Save the PDF
      pdf.save(`Progress_Report_${this.userProfile.name.replace(' ', '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
    }
  }
}
</script>

<style scoped>
.progress-container {
  padding: 20px;
  font-family: 'Inter', sans-serif;
  background-color: #f4f7fa;
  min-height: calc(100vh - 60px);
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
  margin-left: auto;
  margin-right: auto;
}

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  width: 100%;
  text-align: center;
  color: #555;
  font-size: 1.1em;
  padding: 50px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.loading-spinner-small {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(66, 185, 131, 0.3);
  border-radius: 50%;
  border-top-color: #42b983;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-state .error-message {
  color: #dc3545;
  font-weight: bold;
  margin-bottom: 10px;
}

.progress-content {
  width: 100%;
  max-width: 1200px;
  background-color: #ffffff;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.report-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.download-btn {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.download-btn:hover {
  background-color: #3aa876;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.download-btn:active {
  transform: translateY(0);
}

.btn-icon {
  font-size: 1.2em;
}

.progress-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
}

.progress-card {
  background-color: #f8fcfb;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  text-align: center;
  border: 1px solid #e0ffe0;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.progress-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
}

.progress-card h3 {
  margin-top: 0;
  color: #555;
  font-size: 1.3em;
  margin-bottom: 15px;
}

.progress-value {
  font-size: 3em;
  font-weight: 800;
  margin: 10px 0;
  color: #42b983;
  line-height: 1;
}

.progress-bar {
  height: 12px;
  background-color: #e0e0e0;
  border-radius: 6px;
  margin: 15px 0;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #42b983;
  transition: width 0.8s ease-out;
  border-radius: 6px;
}

.progress-percent {
  font-size: 1.3em;
  color: #2c3e50;
  font-weight: bold;
}

.notes-card .progress-value, .notes-card .progress-percent { color: #5a7dcb; }
.notes-card .progress-fill { background-color: #5a7dcb; }
.notes-card { border-color: #eaf1ff; }

.exercises-card .progress-value, .exercises-card .progress-percent { color: #e09b3d; }
.exercises-card .progress-fill { background-color: #e09b3d; }
.exercises-card { border-color: #fff4e0; }

.quizzes-card .progress-value, .quizzes-card .progress-percent { color: #8e44ad; }
.quizzes-card .progress-fill { background-color: #8e44ad; }
.quizzes-card { border-color: #f7e9ff; }

.tutorials-card .progress-value, .tutorials-card .progress-percent { color: #3498db; }
.tutorials-card .progress-fill { background-color: #3498db; }
.tutorials-card { border-color: #e0f2f7; }

.progress-details {
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;
}

.recent-activity {
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  border: 1px solid #eee;
}
.recent-activity h3 {
  margin-top: 0;
  font-size: 1.5em;
  color: #333;
  margin-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 10px;
}
.recent-activity ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.recent-activity li {
  padding: 12px 0;
  border-bottom: 1px solid #f9f9f9;
  display: grid;
  grid-template-columns: 90px 1fr 100px auto;
  gap: 10px;
  align-items: center;
  font-size: 0.95em;
  color: #444;
}
.recent-activity li:last-child {
  border-bottom: none;
}
.activity-type {
  font-weight: 700;
  color: #42b983;
  text-transform: uppercase;
  font-size: 0.85em;
}
.activity-title {
  color: #2c3e50;
  font-weight: 500;
}
.activity-date {
  color: #777;
  font-size: 0.85em;
}
.activity-score {
  font-weight: bold;
  color: #3498db;
}
.no-activity {
  text-align: center;
  color: #777;
  padding: 20px;
  font-style: italic;
}

@media (max-width: 1024px) {
  .progress-overview {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }
}

@media (max-width: 768px) {
  .progress-container {
    padding: 15px;
  }
  h2 {
    font-size: 2em;
    margin-bottom: 25px;
  }
  .progress-content {
    padding: 25px;
  }
  .progress-overview {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .progress-card {
    padding: 20px;
  }
  .progress-value {
    font-size: 2.5em;
  }
  .progress-percent {
    font-size: 1.1em;
  }
  .recent-activity h3 {
    font-size: 1.3em;
  }
  .recent-activity li {
    grid-template-columns: auto 1fr;
    gap: 5px;
    font-size: 0.9em;
    flex-wrap: wrap;
  }
  .activity-type {
    width: 100%;
    text-align: left;
  }
  .activity-date, .activity-score {
    flex-basis: 48%;
    text-align: right;
  }
}

@media (max-width: 480px) {
  .progress-container {
    padding: 10px;
  }
  h2 {
    font-size: 1.8em;
  }
  .progress-content {
    padding: 15px;
  }
  .progress-card h3 {
    font-size: 1.1em;
  }
  .progress-value {
    font-size: 2.2em;
  }
  .progress-percent {
    font-size: 1em;
  }
  .recent-activity li {
    font-size: 0.8em;
  }
  .download-btn {
    padding: 10px 15px;
    font-size: 0.9em;
  }
}
</style>