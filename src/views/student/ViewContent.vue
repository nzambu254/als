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
        <!-- Topic 1: Introduction to Loci (already exists) -->
        <div class="topic-section">
          <h3 class="topic-title">LOCI</h3>
          
          <div class="subtopic">
            <h4 class="subtopic-title">INTRODUCTION TO LOCI</h4>
            <div class="subtopic-content">
              <h5>Specific Objectives</h5>
              <p>By the end of the topic the learner should be able to:</p>
              <ul>
                <li>Define Locus</li>
                <li>Describe common types of Loci</li>
                <li>Construct:
                  <ul>
                    <li>Loci involving inequalities</li>
                    <li>Loci involving chords</li>
                    <li>Loci involving points under given conditions</li>
                    <li>Intersecting loci</li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>

          <div class="subtopic">
            <h4 class="subtopic-title">Introduction</h4>
            <div class="subtopic-content">
              <p>Locus is defined as the path, area or volume traced out by a point, line or region as it moves according to some given laws.</p>
              <p>In construction the opening between the pencil and the point of the compass is a fixed distance, the length of the radius of a circle. The point on the compass determines a fixed point. If the length of the radius remains the same or unchanged, all of the point in the plane that can be drawn by the compass from a circle and any points that cannot be drawn by the compass do not lie on the circle. Thus, the circle is the set of all points at a fixed distance from a fixed point. This set is called a locus.</p>
            </div>
          </div>

          <div class="subtopic">
            <h4 class="subtopic-title">Common Types of Loci</h4>
            <div class="subtopic-content">
              <h5>1. Fixed Distance from a Point</h5>
              <p>The locus of points at a fixed distance from a single point is a circle. The fixed point is the center of the circle, and the fixed distance is the radius.</p>
              
              <h5>2. Equidistant from Two Points</h5>
              <p>The locus of points equidistant from two fixed points is the perpendicular bisector of the line segment joining the two points.</p>
              
              <h5>3. Fixed Distance from a Line</h5>
              <p>The locus of points at a fixed distance from a line consists of two lines parallel to the given line, one on each side, at the specified distance.</p>
              
              <h5>4. Equidistant from Two Intersecting Lines</h5>
              <p>The locus of points equidistant from two intersecting lines is the pair of angle bisectors of the angles formed by the two lines.</p>
            </div>
          </div>

          <div class="exercises-section">
            <h4 class="exercises-title">Practice Exercises</h4>
            <div class="exercise">
              <h5>Exercise 1: Basic Loci</h5>
              <ol>
                <li>Construct the locus of points 4cm from a fixed point P.</li>
                <li>Points A and B are 6cm apart. Construct the locus of points equidistant from both A and B.</li>
                <li>Draw a line XY and construct the locus of points 3cm from XY.</li>
              </ol>
            </div>

            <div class="exercise">
              <h5>Exercise 2: Combined Loci</h5>
              <ol>
                <li>Points P and Q are 5cm apart. Construct:
                  <ul>
                    <li>The locus of points 4cm from P</li>
                    <li>The locus of points 3cm from Q</li>
                    <li>Mark the points that are both 4cm from P and 3cm from Q</li>
                  </ul>
                </li>
                <li>Construct two lines that intersect at 60°. Then construct the locus of points equidistant from both lines.</li>
              </ol>
            </div>

            <div class="exercise">
              <h5>Exercise 3: Challenging Problems</h5>
              <ol>
                <li>A point P moves so that it is always twice as far from point A as it is from point B. Construct the locus of P.</li>
                <li>Construct the locus of points that are:
                  <ul>
                    <li>3cm from line AB</li>
                    <li>And less than 5cm from point C</li>
                  </ul>
                </li>
                <li>A goat is tied with a 4m rope to the corner of a 5m × 3m rectangular shed. Construct the area the goat can graze.</li>
              </ol>
            </div>
          </div>
        </div>

        <!-- Topic 2: Perpendicular Bisector Locus -->
        <div class="topic-section">
          <h3 class="topic-title">Perpendicular Bisector Locus</h3>
          
          <div class="subtopic">
            <h4 class="subtopic-title">Definition and Construction</h4>
            <div class="subtopic-content">
              <p>The locus of a point which is equidistant from two fixed points is the perpendicular bisector of the straight line joining the two fixed points. This locus is called the perpendicular bisector locus.</p>
              <p>To find the point equidistant from two fixed points you simply find the perpendicular bisector of the two points.</p>
              <p>Q is the mid-point of M and N.</p>
            </div>
          </div>

          <div class="subtopic">
            <h4 class="subtopic-title">In Three Dimensions</h4>
            <div class="subtopic-content">
              <p>In three dimensions, the perpendicular bisector locus is a plane at right angles to the line and bisecting the line into two equal parts. The point P can lie anywhere in the line provided it's in the middle.</p>
            </div>
          </div>

          <div class="subtopic">
            <h4 class="subtopic-title">The Locus of Points at a Given Distance from a Given Straight Line</h4>
            <div class="subtopic-content">
              <h5>In Two Dimensions</h5>
              <p>In the figure below each of the lines from the middle line is marked 'a' centimeters on either side of the given line MN. The 'a' centimeters on either sides from the middle line implies the perpendicular distance.</p>
              <p>The two parallel lines describe the locus of points at a fixed distance from a given straight line.</p>
              
              <h5>In Three Dimensions</h5>
              <p>In three dimensions the locus of point 'a' centimeters from a line MN is a cylindrical shell of radius 'a' cm, with MN as the axis of rotation.</p>
            </div>
          </div>

          <div class="exercises-section">
            <h4 class="exercises-title">Practice Exercises</h4>
            <div class="exercise">
              <h5>Exercise 1: Perpendicular Bisector</h5>
              <ol>
                <li>Points A and B are 8cm apart. Construct the perpendicular bisector locus.</li>
                <li>Given points X(2,3) and Y(6,7) on a Cartesian plane, find the equation of the perpendicular bisector locus.</li>
                <li>Construct triangle ABC with AB = 7cm, BC = 6cm, and AC = 5cm. Then construct the perpendicular bisector of each side.</li>
              </ol>
            </div>

            <div class="exercise">
              <h5>Exercise 2: Distance from a Line</h5>
              <ol>
                <li>Draw line segment PQ of length 10cm. Construct the locus of points 2.5cm from PQ.</li>
                <li>On a Cartesian plane, line L has equation y = 2x + 3. Find the equations of the loci of points 4 units from L.</li>
                <li>Construct a rectangle ABCD with AB = 8cm and BC = 5cm. Then construct the locus of points 1cm from each side.</li>
              </ol>
            </div>
          </div>
        </div>

        <!-- Topic 3: Locus of Points at a Given Distance from a Fixed Point -->
        <div class="topic-section">
          <h3 class="topic-title">Locus of Points at a Given Distance from a Fixed Point</h3>
          
          <div class="subtopic">
            <h4 class="subtopic-title">In Two Dimensions</h4>
            <div class="subtopic-content">
              <p>If O is a fixed point and P a variable point 'd' cm from O, the locus of P is the circle with center O and radius 'd' cm.</p>
              <p>All points on a circle describe a locus of a point at constant distance from a fixed point.</p>
            </div>
          </div>

          <div class="subtopic">
            <h4 class="subtopic-title">In Three Dimensions</h4>
            <div class="subtopic-content">
              <p>In three dimensions the locus of a point 'd' centimeters from a point is a spherical shell with center O and radius d cm.</p>
            </div>
          </div>

          <div class="subtopic">
            <h4 class="subtopic-title">Angle Bisector Locus</h4>
            <div class="subtopic-content">
              <p>The locus of points which are equidistant from two given intersecting straight lines is the pair of perpendicular lines which bisect the angles between the given lines.</p>
              <p>Conversely, a point which lies on a bisector of given angle is equidistant from the lines including that angle.</p>
              <p>Line PB bisects angle ABC into two equal parts.</p>
            </div>
          </div>

          <div class="subtopic">
            <h4 class="subtopic-title">Example</h4>
            <div class="subtopic-content">
              <p>Construct triangle PQR such that PQ = 7 cm, QR = 5 cm and angle PQR = 30°. Construct the locus L of points equidistant from RP and RQ.</p>
              <p>Solution: L is the bisector of Angle PRQ.</p>
            </div>
          </div>

          <div class="subtopic">
            <h4 class="subtopic-title">Constant Angle Loci</h4>
            <div class="subtopic-content">
              <p>A line PQ is 5 cm long. Construct the locus of points at which PQ subtends an angle of 70°.</p>
              <p>Solution:</p>
              <ol>
                <li>Draw PQ = 5 cm</li>
                <li>Construct TP at P such that angle QPT = 70°</li>
                <li>Draw a perpendicular to TP at P (radius is perpendicular to tangent)</li>
                <li>Construct the perpendicular bisector of PQ to meet the perpendicular in (iii) at O</li>
                <li>Using O as the centre and either OP or OQ as radius, draw the locus</li>
                <li>Transfer the centre on the side of PQ and complete the locus</li>
                <li>Transfer the centre on the opposite sides of PQ and complete the locus</li>
              </ol>
              <p>Points to note:</p>
              <ul>
                <li>To O1 are of the same radius</li>
                <li>Angle subtended by the same chord on the circumference are equal</li>
                <li>This is called the constant angle locus</li>
              </ul>
            </div>
          </div>

          <div class="exercises-section">
            <h4 class="exercises-title">Practice Exercises</h4>
            <div class="exercise">
              <h5>Exercise 1: Fixed Distance from Point</h5>
              <ol>
                <li>Construct the locus of points 3.5cm from point K.</li>
                <li>Given point A(0,0) on a Cartesian plane, write the equation of the locus of points 5 units from A.</li>
                <li>Construct two points M and N 6cm apart. Then construct:
                  <ul>
                    <li>The locus of points 4cm from M</li>
                    <li>The locus of points 4cm from N</li>
                    <li>Mark the points that are 4cm from both M and N</li>
                  </ul>
                </li>
              </ol>
            </div>

            <div class="exercise">
              <h5>Exercise 2: Angle Bisectors</h5>
              <ol>
                <li>Construct angle XYZ measuring 80°. Then construct the locus of points equidistant from YX and YZ.</li>
                <li>Construct triangle DEF with DE = 6cm, DF = 7cm, and angle EDF = 45°. Construct the locus of points equidistant from DE and DF.</li>
                <li>Two lines intersect at 50°. Construct the locus of points equidistant from both lines.</li>
              </ol>
            </div>

            <div class="exercise">
              <h5>Exercise 3: Constant Angle Loci</h5>
              <ol>
                <li>Line AB is 6cm long. Construct the locus of points at which AB subtends an angle of 60°.</li>
                <li>Line segment CD is 4cm. Construct the locus of points at which CD subtends an angle of 90°.</li>
                <li>Explain why the constant angle locus for a 90° angle is a semicircle.</li>
              </ol>
            </div>
          </div>
        </div>

        <!-- Topic 4: Intersecting Loci -->
        <div class="topic-section">
          <h3 class="topic-title">Intersecting Loci</h3>
          
          <div class="subtopic">
            <h4 class="subtopic-title">Example</h4>
            <div class="subtopic-content">
              <p>Construct triangle PQR such that PQ = 7 cm, QR = 5 cm and angle PQR = 30°.</p>
              <p>Construct the locus L1 of points equidistant from P and Q to meet the locus L2 of points equidistant from Q and R at M. Measure PM.</p>
              <p>Solution:</p>
              <ol>
                <li>L1 is the perpendicular bisector of PQ</li>
                <li>L2 is the perpendicular bisector of QR</li>
                <li>By measurement, PM is equal to 3.7 cm</li>
              </ol>
            </div>
          </div>

          <div class="exercises-section">
            <h4 class="exercises-title">Practice Exercises</h4>
            <div class="exercise">
              <h5>Exercise 1: Intersecting Loci</h5>
              <ol>
                <li>Construct triangle ABC with AB = 8cm, BC = 7cm, and AC = 6cm. Then:
                  <ul>
                    <li>Construct the locus of points equidistant from A and B</li>
                    <li>Construct the locus of points equidistant from B and C</li>
                    <li>Mark the point where these two loci intersect</li>
                  </ul>
                </li>
                <li>Points X and Y are 10cm apart, points Y and Z are 8cm apart. Construct:
                  <ul>
                    <li>The locus of points 6cm from X</li>
                    <li>The locus of points 5cm from Z</li>
                    <li>Mark any points that satisfy both conditions</li>
                  </ul>
                </li>
              </ol>
            </div>
          </div>
        </div>

        <!-- Topic 5: Loci of Inequalities -->
        <div class="topic-section">
          <h3 class="topic-title">Loci of Inequalities</h3>
          
          <div class="subtopic">
            <h4 class="subtopic-title">Introduction</h4>
            <div class="subtopic-content">
              <p>An inequality is represented graphically by showing all the points that satisfy it. The intersection of two or more regions of inequalities gives the intersection of their loci.</p>
              <p>Remember we shade the unwanted region.</p>
            </div>
          </div>

          <div class="subtopic">
            <h4 class="subtopic-title">Example</h4>
            <div class="subtopic-content">
              <p>Draw the locus of point (x, y) such that x + y < 3, y - x ≤ 4 and y > 2.</p>
              <p>Solution:</p>
              <p>Draw the graphs of x + y = 3, y - x = 4 and y = 2 as shown below. The unwanted regions are usually shaded. The unshaded region marked R is the locus of points (x, y), such that x + y < 3, y - x ≤ 4 and y > 2.</p>
              <p>The lines of greater or equal to and less or equal to (≤, ≥) are always solid while the lines of greater or less (<, >) are always broken.</p>
            </div>
          </div>

          <div class="subtopic">
            <h4 class="subtopic-title">Example</h4>
            <div class="subtopic-content">
              <p>P is a point inside rectangle ABCD such that AP ≤ PB and Angle DAP ≥ Angle BAP. Show the region on which P lies.</p>
              <p>Solution:</p>
              <p>Draw a perpendicular bisector of AP = PB and shade the unwanted region. Bisect ∠DAB (∠DAP = ∠BAP) and shade the unwanted region. P lies in the unshaded region.</p>
            </div>
          </div>

          <div class="subtopic">
            <h4 class="subtopic-title">Example</h4>
            <div class="subtopic-content">
              <p>Draw the locus of a point P which moves such that AP ≤ 3 cm.</p>
              <p>Solution:</p>
              <ol>
                <li>Draw a circle, center A and radius 3 cm</li>
                <li>Shade the unwanted region (the area outside the circle)</li>
              </ol>
            </div>
          </div>

          <div class="exercises-section">
            <h4 class="exercises-title">Practice Exercises</h4>
            <div class="exercise">
              <h5>Exercise 1: Inequality Loci</h5>
              <ol>
                <li>Draw the locus of points P such that:
                  <ul>
                    <li>Distance from point A is less than 4cm</li>
                    <li>Distance from line BC is greater than 2cm</li>
                  </ul>
                </li>
                <li>On graph paper, draw the loci satisfying:
                  <ul>
                    <li>y ≤ 2x + 1</li>
                    <li>y > -x + 3</li>
                    <li>x < 5</li>
                  </ul>
                </li>
                <li>Construct triangle XYZ with XY = 7cm, YZ = 6cm, and XZ = 5cm. Then show the region where:
                  <ul>
                    <li>Points are closer to X than to Y</li>
                    <li>Points are closer to YZ than to XY</li>
                  </ul>
                </li>
              </ol>
            </div>
          </div>
        </div>

        <!-- Topic 6: Locus Involving Chords -->
        <div class="topic-section">
          <h3 class="topic-title">Locus Involving Chords</h3>
          
          <div class="subtopic">
            <h4 class="subtopic-title">Properties of Chords</h4>
            <div class="subtopic-content">
              <p>The following properties of chords of a circle are used in construction of loci:</p>
              <ol>
                <li>Perpendicular bisector of any chord passes through the center of the circle.</li>
                <li>The perpendicular drawn from a center of a circle bisects the chord.</li>
                <li>If chords of a circle are equal, they are equidistant from the center of the circle and vice-versa.</li>
                <li>In the figure below, if chord AB intersects chord CD at O, AO = x, BO = y, CO = m and DO = n then m × n = x × y</li>
              </ol>
            </div>
          </div>

          <div class="exercises-section">
            <h4 class="exercises-title">Practice Exercises</h4>
            <div class="exercise">
              <h5>Exercise 1: Chord Properties</h5>
              <ol>
                <li>Draw a circle with radius 5cm and center O. Draw chord AB of length 6cm. Construct the perpendicular bisector of AB and verify it passes through O.</li>
                <li>In a circle with radius 5cm, two chords are 3cm and 4cm from the center. Calculate their lengths.</li>
                <li>Two chords AB and CD intersect at point P inside a circle. Given that AP = 3cm, PB = 4cm, and CP = 6cm, find the length of PD.</li>
              </ol>
            </div>

            <div class="exercise">
              <h5>Exercise 2: Loci with Chords</h5>
              <ol>
                <li>Construct a circle with radius 4cm. Draw chord PQ of length 5cm. Construct the locus of points equidistant from P and Q.</li>
                <li>Draw two concentric circles with radii 3cm and 5cm. Construct the locus of midpoints of all chords of the larger circle that are tangent to the smaller circle.</li>
                <li>Construct a circle with diameter AB of length 10cm. Construct the locus of points P such that angle APB is 90°.</li>
              </ol>
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
      loading: false,
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

.topic-section {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.topic-title {
  color: #2c3e50;
  font-size: 1.8em;
  margin-bottom: 25px;
  padding-bottom: 10px;
  border-bottom: 2px solid #eee;
}

.subtopic {
  margin-bottom: 30px;
}

.subtopic-title {
  color: #3498db;
  font-size: 1.4em;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 1px dashed #ddd;
}

.subtopic-content {
  padding-left: 20px;
}

.subtopic-content h5 {
  color: #2c3e50;
  font-size: 1.2em;
  margin: 15px 0 10px 0;
}

.subtopic-content p, .subtopic-content li {
  color: #555;
  line-height: 1.6;
  margin-bottom: 10px;
}

.subtopic-content ul, .subtopic-content ol {
  padding-left: 25px;
  margin-bottom: 15px;
}

.exercises-section {
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 25px;
  margin-top: 40px;
  border-left: 4px solid #3498db;
}

.exercises-title {
  color: #e74c3c;
  font-size: 1.5em;
  margin-bottom: 20px;
}

.exercise {
  margin-bottom: 25px;
}

.exercise h5 {
  color: #2c3e50;
  font-size: 1.2em;
  margin-bottom: 15px;
}

.exercise ol {
  padding-left: 30px;
}

.exercise li {
  margin-bottom: 10px;
  line-height: 1.5;
}

.tutorials-grid, .pdf-notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
  margin-top: 20px;
}

.tutorial-card, .pdf-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.tutorial-card:hover, .pdf-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.tutorial-header, .pdf-header {
  padding: 15px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.tutorial-type-badge, .pdf-type-badge {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.8em;
  font-weight: 600;
}

.tutorial-type-badge {
  background-color: #ffeaa7;
  color: #d35400;
}

.pdf-type-badge {
  background-color: #a5b1c2;
  color: #2c3e50;
}

.tutorial-title, .pdf-title {
  padding: 0 15px;
  margin: 15px 0;
  color: #2c3e50;
  font-size: 1.3em;
}

.tutorial-description, .pdf-description {
  padding: 0 15px;
  margin-bottom: 20px;
  color: #666;
  line-height: 1.5;
  font-size: 0.95em;
}

.tutorial-footer, .pdf-footer {
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8f9fa;
  border-top: 1px solid #eee;
}

.tutorial-platform {
  font-size: 0.9em;
  color: #666;
}

.watch-indicator, .download-indicator {
  font-weight: 600;
  color: #3498db;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 5px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5em;
  cursor: pointer;
  color: #666;
  padding: 5px;
}

.modal-body {
  padding: 20px;
}

.content-meta {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.content-type-badge {
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.9em;
  font-weight: 600;
}

.content-type-badge.note {
  background-color: #74b9ff;
  color: white;
}

.content-type-badge.exercise {
  background-color: #55efc4;
  color: #2c3e50;
}

.difficulty-badge {
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.9em;
  font-weight: 600;
}

.difficulty-badge.easy {
  background-color: #55efc4;
  color: #2c3e50;
}

.difficulty-badge.medium {
  background-color: #ffeaa7;
  color: #d35400;
}

.difficulty-badge.hard {
  background-color: #fab1a0;
  color: #c0392b;
}

.date-badge {
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.9em;
  background-color: #dfe6e9;
  color: #636e72;
}

.content-description-full {
  margin-bottom: 25px;
}

.content-description-full h4 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.content-description-full p {
  color: #555;
  line-height: 1.6;
}

.file-section {
  margin-top: 25px;
}

.file-section h4 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.file-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
  color: #3498db;
  text-decoration: none;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.file-link:hover {
  background-color: #e8f4fd;
}

.no-content {
  text-align: center;
  padding: 50px;
  color: #666;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .view-content-container {
    padding: 15px;
  }

  h2 {
    font-size: 1.8em;
  }

  .filter-tabs {
    gap: 10px;
  }

  .tab-btn {
    padding: 8px 16px;
    font-size: 0.9em;
  }

  .tutorials-grid, .pdf-notes-grid {
    grid-template-columns: 1fr;
  }

  .topic-section {
    padding: 20px;
  }

  .modal-content {
    width: 95%;
  }
}
</style>