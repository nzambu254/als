```vue
<template>
  <div class="view-content-container">
    <h2>View Content</h2>

    <div class="filter-tabs">
      <button 
        :class="['tab-btn', { active: activeTab === 'note' }]"
        @click="setActiveTab('note')"
      >
        Notes
      </button>
      <button 
        :class="['tab-btn', { active: activeTab === 'tutorials' }]"
        @click="setActiveTab('tutorials')"
      >
        Tutorials
      </button>
      <button 
        :class="['tab-btn', { active: activeTab === 'pdf' }]"
        @click="setActiveTab('pdf')"
      >
        PDF Notes
      </button>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading content...</p>
    </div>

    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="fetchContent" class="retry-btn">Retry</button>
    </div>

    <div v-if="!loading && !error" class="content-grid">
      <div v-if="activeTab === 'note'">
        <div v-if="filteredContent.length === 0" class="no-content">
          <p>No notes available at the moment.</p>
        </div>
        
        <div 
          v-for="content in filteredContent" 
          :key="content.id" 
          class="content-card"
          @click="viewContent(content)"
        >
          <div class="content-header">
            <div class="content-type-badge" :class="content.type">
              {{ content.type === 'note' ? '📝' : '🧠' }}
              {{ content.type.charAt(0).toUpperCase() + content.type.slice(1) }}
            </div>
            <div v-if="content.type === 'exercise' && content.difficulty" class="difficulty-badge" :class="content.difficulty.toLowerCase()">
              {{ content.difficulty }}
            </div>
          </div>
          
          <h3 class="content-title">{{ content.title }}</h3>
          <p class="content-description">{{ content.description }}</p>
          
          <div class="content-footer">
            <div class="content-date">
              {{ formatDate(content.createdAt) }}
            </div>
            <div v-if="content.fileUrl" class="has-file">
              📎 File attached
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'tutorials'" class="tutorials-grid">
        <div 
          v-for="tutorial in tutorials" 
          :key="tutorial.id" 
          class="tutorial-card"
          @click="openTutorial(tutorial.url)"
        >
          <div class="tutorial-header">
            <div class="tutorial-type-badge">
              🎥 Tutorial
            </div>
          </div>
          
          <h3 class="tutorial-title">{{ tutorial.title }}</h3>
          <p class="tutorial-description">{{ tutorial.description }}</p>
          
          <div class="tutorial-footer">
            <div class="tutorial-platform">
              YouTube
            </div>
            <div class="watch-indicator">
              ▶️ Watch Now
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'pdf'" class="pdf-notes-grid">
        <div v-if="pdfNotes.length === 0" class="no-content">
          <p>No PDF notes available at the moment.</p>
        </div>
        <div 
          v-for="pdf in pdfNotes" 
          :key="pdf.id" 
          class="pdf-card"
          @click="openTutorial(pdf.url)"
        >
          <div class="pdf-header">
            <div class="pdf-type-badge">
              📄 PDF Note
            </div>
          </div>
          
          <h3 class="pdf-title">{{ pdf.title }}</h3>
          <p class="pdf-description">{{ pdf.description }}</p>
          
          <div class="pdf-footer">
            <div class="download-indicator">
              ⬇️ Download PDF
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="selectedContent" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ selectedContent.title }}</h3>
          <button class="close-btn" @click="closeModal">×</button>
        </div>
        
        <div class="modal-body">
          <div class="content-meta">
            <span class="content-type-badge" :class="selectedContent.type">
              {{ selectedContent.type === 'note' ? '📝' : '🧠' }}
              {{ selectedContent.type.charAt(0).toUpperCase() + selectedContent.type.slice(1) }}
            </span>
            <span v-if="selectedContent.type === 'exercise' && selectedContent.difficulty" 
                  class="difficulty-badge" :class="selectedContent.difficulty.toLowerCase()">
              {{ selectedContent.difficulty }}
            </span>
            <span class="date-badge">{{ formatDate(selectedContent.createdAt) }}</span>
          </div>
          
          <div class="content-description-full">
            <h4>Description:</h4>
            <p>{{ selectedContent.description }}</p>
          </div>
          
          <div v-if="selectedContent.fileUrl" class="file-section">
            <h4>Attached File:</h4>
            <a :href="selectedContent.fileUrl" target="_blank" class="file-link">
              📎 Download File
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/firebase';

export default {
  name: 'ViewContent',
  data() {
    return {
      content: [],
      loading: true,
      error: null,
      activeTab: 'note',
      selectedContent: null,
      tutorials: [
        {
          id: 1,
          title: 'Locus and its Examples',
          description: 'Explore the concept of locus in mathematics and various examples illustrating different types of loci.',
          url: 'https://www.youtube.com/watch?v=UHh7YJwws0M'
        },
        {
          id: 2,
          title: 'MATHS FORM FOUR | LOCI | TYPES OF LOCI',
          description: 'A comprehensive tutorial on loci for Form Four mathematics, covering different types of loci and their properties.',
          url: 'https://www.youtube.com/watch?v=xst6sJlU5UM'
        },
        {
          id: 3,
          title: 'Geometry Review Tutorial - Key Concepts and Formulas',
          description: 'The full version of this geometry review tutorial provides a basic introduction into common topics taught in geometry such as angles and measurement, area, perimeter, volume, surface area. It covers shapes such as circles, squares, rectangles, right triangles, isosceles triangles, scalene triangles, equilateral triangles, spheres, cones, right circular cylinders, cubes, rectangular prism, rhombus, quadrilaterals, and more. The full version of this video contains the equations and formulas that you will need for your test. This tutorial is useful for students who want a quick geometry review for the sat, act, eoc, gre, gmat, fsa, cat, regents or ged exams. it\'s also useful for high school and college students who are studying for their midterm or final exams. This study guide review tutorial will help you master the most common shapes and concepts taught in a typical geometry course.',
          url: 'https://www.youtube.com/watch?v=KtZai86htng&list=PL0o_zxa4K1BVkRxCZubMPcCJ5Q5QwZdEM'
        }
      ],
      pdfNotes: [
        {
          id: 1,
          title: 'Form Four Green Math Notes',
          description: 'Comprehensive notes for Form Four mathematics, focusing on green math concepts.',
          url: '/assets/formfourgreenmath.pdf'
        },
        {
          id: 2,
          title: 'Book One Notes',
          description: 'Detailed notes from Book One curriculum.',
          url: '/assets/bookone.pdf'
        },
        {
          id: 3,
          title: 'Book Two Notes',
          description: 'Detailed notes from Book Two curriculum.',
          url: '/assets/booktwo.pdf'
        },
        {
          id: 4,
          title: 'Book Three Notes',
          description: 'Detailed notes from Book Three curriculum.',
          url: '/assets/bookthree.pdf'
        }
      ]
    };
  },
  computed: {
    filteredContent() {
      if (this.activeTab === 'note') {
        return this.content.filter(item => item.type === 'note');
      }
      return [];
    }
  },
  async mounted() {
    await this.fetchContent();
  },
  methods: {
    async fetchContent() {
      this.loading = true;
      this.error = null;
      
      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
      
      try {
        const allContent = [];
        
        // Fetch notes only
        const notesQuery = query(
          collection(db, `artifacts/${appId}/public/data/notes`),
          orderBy('createdAt', 'desc')
        );
        const notesSnapshot = await getDocs(notesQuery);
        notesSnapshot.forEach(doc => {
          allContent.push({
            id: doc.id,
            ...doc.data(),
            type: 'note'
          });
        });
        
        // Sort all content by creation date (newest first)
        this.content = allContent.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
          const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
          return dateB - dateA;
        });
        
      } catch (err) {
        console.error('Error fetching content:', err);
        this.error = 'Failed to load content. Please try again.';
      } finally {
        this.loading = false;
      }
    },
    
    setActiveTab(tab) {
      this.activeTab = tab;
    },
    
    viewContent(content) {
      this.selectedContent = content;
    },
    
    closeModal() {
      this.selectedContent = null;
    },
    
    openTutorial(url) {
      window.open(url, '_blank');
    },
    
    formatDate(date) {
      if (!date) return 'Unknown date';
      
      const dateObj = date.toDate ? date.toDate() : new Date(date);
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
};
</script>

<style scoped>
.view-content-container {
  padding: 30px;
  font-family: 'Inter', sans-serif;
  background-color: #f8f9fa;
  min-height: 100vh;
}

h2 {
  color: #333;
  margin-bottom: 30px;
  text-align: center;
  font-size: 2.5em;
  font-weight: 700;
  padding-bottom: 15px;
  border-bottom: 2px solid #eee;
}

.filter-tabs {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  justify-content: center;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 12px 24px;
  border: 2px solid #ddd;
  background-color: white;
  color: #666;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.tab-btn:hover {
  border-color: #007bff;
  color: #007bff;
  transform: translateY(-2px);
}

.tab-btn.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px;
  color: #666;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  text-align: center;
  padding: 30px;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  color: #721c24;
  margin: 20px 0;
}

.retry-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.retry-btn:hover {
  background-color: #c82333;
}

.content-grid {
  margin-top: 20px;
}

.content-grid > div {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
}

.tutorials-grid, .pdf-notes-grid { /* Added .pdf-notes-grid */
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
}

.no-content {
  grid-column: 1 / -1;
  text-align: center;
  padding: 50px;
  color: #666;
  font-size: 1.1em;
}

.content-card, .tutorial-card, .pdf-card { /* Added .pdf-card */
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid #e9ecef;
}

.content-card:hover, .tutorial-card:hover, .pdf-card:hover { /* Added .pdf-card */
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.content-header, .tutorial-header, .pdf-header { /* Added .pdf-header */
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.content-type-badge, .tutorial-type-badge, .pdf-type-badge { /* Added .pdf-type-badge */
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8em;
  font-weight: 600;
  text-transform: uppercase;
}

.content-type-badge.note {
  background-color: #e3f2fd;
  color: #1976d2;
}

.content-type-badge.exercise {
  background-color: #f3e5f5;
  color: #7b1fa2;
}

.tutorial-type-badge {
  background-color: #fff3e0;
  color: #f57c00;
}

.pdf-type-badge { /* New style for PDF badge */
  background-color: #e0f2f7;
  color: #00796b;
}

.difficulty-badge {
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 0.75em;
  font-weight: 600;
  text-transform: uppercase;
}

.difficulty-badge.beginner {
  background-color: #e8f5e8;
  color: #2e7d32;
}

.difficulty-badge.intermediate {
  background-color: #fff3e0;
  color: #f57c00;
}

.difficulty-badge.advanced {
  background-color: #ffebee;
  color: #d32f2f;
}

.content-title, .tutorial-title, .pdf-title { /* Added .pdf-title */
  font-size: 1.3em;
  font-weight: 700;
  color: #333;
  margin-bottom: 10px;
  line-height: 1.3;
}

.content-description, .tutorial-description, .pdf-description { /* Added .pdf-description */
  color: #666;
  font-size: 0.95em;
  line-height: 1.5;
  margin-bottom: 20px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.content-footer, .tutorial-footer, .pdf-footer { /* Added .pdf-footer */
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid #eee;
  font-size: 0.85em;
  color: #888;
}

.has-file {
  color: #007bff;
  font-weight: 600;
}

.tutorial-platform {
  color: #dc3545;
  font-weight: 600;
}

.watch-indicator {
  color: #28a745;
  font-weight: 600;
}

.download-indicator { /* New style for download indicator */
  color: #007bff;
  font-weight: 600;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
}

.modal-header {
  padding: 25px 30px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.4em;
  font-weight: 700;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2em;
  cursor: pointer;
  color: #999;
  line-height: 1;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 30px;
}

.content-meta {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.date-badge {
  padding: 6px 12px;
  background-color: #f8f9fa;
  color: #666;
  border-radius: 20px;
  font-size: 0.8em;
  font-weight: 600;
}

.content-description-full h4 {
  color: #333;
  margin-bottom: 10px;
  font-size: 1.1em;
}

.content-description-full p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
}

.file-section h4 {
  color: #333;
  margin-bottom: 10px;
  font-size: 1.1em;
}

.file-link {
  display: inline-block;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.file-link:hover {
  background-color: #0056b3;
}

@media (max-width: 768px) {
  .view-content-container {
    padding: 20px 15px;
  }
  
  h2 {
    font-size: 2em;
  }
  
  .content-grid > div, .tutorials-grid, .pdf-notes-grid { /* Added .pdf-notes-grid */
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .content-card, .tutorial-card, .pdf-card { /* Added .pdf-card */
    padding: 20px;
  }
  
  .modal-content {
    margin: 20px;
    max-width: none;
  }
  
  .modal-header,
  .modal-body {
    padding: 20px;
  }
  
  .filter-tabs {
    justify-content: stretch;
  }
  
  .tab-btn {
    flex: 1;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .view-content-container {
    padding: 10px;
  }
  h2 {
    font-size: 1.8em;
  }
  .content-card h3, .tutorial-card h3, .pdf-card h3 { /* Added .pdf-card h3 */
    font-size: 1.1em;
  }
  .content-description, .tutorial-description, .pdf-description { /* Added .pdf-description */
    font-size: 0.9em;
  }
  .content-footer, .tutorial-footer, .pdf-footer { /* Added .pdf-footer */
    font-size: 0.8em;
  }
  .modal-header h3 {
    font-size: 1.2em;
  }
  .content-description-full p {
    font-size: 0.9em;
  }
}
</style>
```