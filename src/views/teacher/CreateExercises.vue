<template>
  <div class="create-exercises-container">
    <h2>Create Loci Questions</h2>
    
    <div class="exercise-form">
      <div class="form-section">
        <div class="form-group">
          <label>Exercise Title</label>
          <input v-model="exercise.title" required>
        </div>

        <div class="form-group">
          <label>Subject</label>
          <input v-model="exercise.subject" required>
        </div>

        <div class="form-group">
          <label>Difficulty</label>
          <select v-model="exercise.difficulty" required>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        <div class="form-group">
          <label>Instructions</label>
          <textarea v-model="exercise.instructions" required></textarea>
        </div>
      </div>
      
      <div class="form-actions">
        <button @click="publishExercise" class="publish-btn">Publish Exercise</button>
      </div>
    </div>

    <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script>
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/firebase';

export default {
  name: 'CreateLociExercise',
  data() {
    return {
      successMessage: '',
      error: '',
      exercise: {
        title: 'Loci Questions Set 1',
        subject: 'Math',
        difficulty: 'Intermediate',
        instructions: 'Answer the following questions related to loci.',
        questions: [],
        isDraft: false,
        status: 'published'
      }
    }
  },
  methods: {
    async publishExercise() {
      try {
        const fullExercise = {
          ...this.exercise,
          createdAt: new Date(),
          createdBy: this.$store?.state?.user?.uid || 'anonymous'
        };

        await addDoc(collection(db, 'exercises'), fullExercise);
        this.successMessage = 'Exercise published successfully!';
        this.error = '';
        setTimeout(() => (this.successMessage = ''), 3000);
      } catch (err) {
        this.error = 'Failed to publish exercise.';
        console.error(err);
      }
    },
    loadQuestions() {
      this.exercise.questions = [
        {
          text: 'The locus of points 3 cm from a fixed point A is:',
          type: 'multiple-choice',
          options: ['A line', 'A triangle', 'A circle', 'A square'],
          correctOption: 2,
          points: 1
        },
        {
          text: 'The locus of points equidistant from two points A and B is:',
          type: 'multiple-choice',
          options: ['A circle', 'A parallel line', 'The perpendicular bisector of AB', 'A diagonal'],
          correctOption: 2,
          points: 1
        },
        {
          text: 'The locus of points equidistant from two intersecting lines is:',
          type: 'multiple-choice',
          options: ['A square', 'The angle bisectors', 'A rectangle', 'A circle'],
          correctOption: 1,
          points: 1
        },
        {
          text: 'The locus of points 2 cm away from a line is:',
          type: 'multiple-choice',
          options: ['Two circles', 'One line only', 'Two parallel lines', 'A parabola'],
          correctOption: 2,
          points: 1
        },
        {
          text: 'The locus of points inside a circle and 3 cm from the center is:',
          type: 'multiple-choice',
          options: ['A triangle', 'A circle', 'A chord', 'A radius'],
          correctOption: 1,
          points: 1
        },
        {
          text: 'A point moves such that it is always closer to line L than to point A. Its locus lies:',
          type: 'multiple-choice',
          options: ['On a circle', 'On a line closer to L', 'At the midpoint between A and L', 'On the perpendicular bisector of A and L'],
          correctOption: 1,
          points: 1
        },
        {
          text: 'The locus of a point equidistant from a fixed point and a line is:',
          type: 'multiple-choice',
          options: ['A straight line', 'A circle', 'A parabola', 'A square'],
          correctOption: 2,
          points: 1
        },
        {
          text: 'A goat is tied to a post with a 4 m rope. The area it can graze is:',
          type: 'multiple-choice',
          options: ['A square', 'A triangle', 'A circle with radius 4 m', 'A semicircle'],
          correctOption: 2,
          points: 1
        },
        {
          text: 'The locus of points that are no more than 2 cm from a line segment is:',
          type: 'multiple-choice',
          options: ['A rectangle', 'A circle', 'A strip around the segment plus semicircles at ends', 'A triangle'],
          correctOption: 2,
          points: 1
        },
        {
          text: 'You are placing lights equidistant from two paths that meet at an angle. Where should they go?',
          type: 'multiple-choice',
          options: ['Midway between both ends', 'On the angle bisector', 'On the outer edge of the angle', 'Anywhere on either path'],
          correctOption: 1,
          points: 1
        },
        {
          text: 'Loci problems involve finding sets of points that meet a specific condition.',
          type: 'true-false',
          correctAnswer: 'true',
          points: 1
        },
        {
          text: 'A circle is the locus of points equidistant from a line.',
          type: 'true-false',
          correctAnswer: 'false',
          points: 1
        },
        {
          text: 'The perpendicular bisector of a segment is the set of points equidistant from its ends.',
          type: 'true-false',
          correctAnswer: 'true',
          points: 1
        },
        {
          text: 'A point that is always 3 cm from a line traces a pair of parallel lines.',
          type: 'true-false',
          correctAnswer: 'true',
          points: 1
        },
        {
          text: 'If a person is walking such that they remain the same distance from two buildings, they walk along the angle bisector between them.',
          type: 'true-false',
          correctAnswer: 'true',
          points: 1
        },
        {
          text: 'The locus of points equidistant from two parallel lines is one of the lines.',
          type: 'true-false',
          correctAnswer: 'false',
          points: 1
        },
        {
          text: 'A parabola is the locus of points equidistant from a point (focus) and a line (directrix).',
          type: 'true-false',
          correctAnswer: 'true',
          points: 1
        },
        {
          text: 'A person standing 4 m from a circular pond is on the pond’s circumference.',
          type: 'true-false',
          correctAnswer: 'false',
          points: 1
        },
        {
          text: 'A goat tied to a post near a wall will have a semicircular grazing area.',
          type: 'true-false',
          correctAnswer: 'true',
          points: 1
        },
        {
          text: 'A triangle is a common shape for loci.',
          type: 'true-false',
          correctAnswer: 'false',
          points: 1
        }
      ];
    }
  },
  created() {
    this.loadQuestions(); // Load all 20 questions on mount
  }
}
</script>

<style scoped>
.create-exercises-container {
  padding: 20px;
}
.form-group {
  margin-bottom: 20px;
}
.form-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}
.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
}
.form-actions {
  margin-top: 20px;
}
.publish-btn {
  background: #42b983;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
}
.success-message,
.error {
  margin-top: 20px;
  padding: 10px;
  border-radius: 4px;
  text-align: center;
  font-weight: bold;
}
.success-message {
  color: green;
  background-color: #e6ffe6;
}
.error {
  color: red;
  background-color: #ffe6e6;
}
</style>
