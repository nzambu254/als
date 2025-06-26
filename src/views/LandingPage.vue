<template>
  <div class="landing-page">
    <!-- Intro Section (moved from hero) -->
    <section class="intro-section">
      <h1>Advanced Loci Learning System</h1>
      <p class="subtitle">Enhancing learning through spatial memory techniques</p>
      <div class="cta-buttons">
        <router-link to="/login" class="cta-btn primary">Login</router-link>
        <router-link to="/login" class="cta-btn secondary">Get Started</router-link>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <h2>Key Features</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">🧠</div>
          <h3>Memory Enhancement</h3>
          <p>Utilize the ancient method of loci to dramatically improve your memory retention.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📚</div>
          <h3>Interactive Learning</h3>
          <p>Engage with interactive tutorials and exercises designed for optimal learning.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📊</div>
          <h3>Progress Tracking</h3>
          <p>Monitor your learning journey with detailed analytics and progress reports.</p>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section class="about-section">
      <div class="about-content">
        <h2>About Our System</h2>
        <p>The Advanced Loci Learning System (ALLS) combines modern educational technology with the ancient Method of Loci, a powerful memory technique used by memory champions worldwide.</p>
        <p>Our system helps students, professionals, and lifelong learners to store and recall information more effectively by associating it with spatial memory.</p>
      </div>
    </section>

    <!-- Footer -->
    <footer class="page-footer">
      <p>© 2025 Advanced Loci Learning System. All rights reserved.</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'LandingPage'
}
</script>

<style scoped>
.landing-page {
  font-family: 'Segoe UI', sans-serif;
  line-height: 1.6;
  color: #2c3e50;
  background: #f9fafe;
}

/* Intro Section (replacing blue hero) */
.intro-section {
  text-align: center;
  padding: 60px 20px 40px;
  background: #ffffff;
}

.intro-section h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 1.2rem;
  margin-bottom: 30px;
  color: #555;
}

.cta-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.cta-btn {
  padding: 12px 28px;
  border-radius: 6px;
  text-decoration: none;
  font-size: 1rem;
  transition: background 0.3s ease;
}

.cta-btn.primary {
  background: #4a6cf7;
  color: white;
  border: none;
}

.cta-btn.primary:hover {
  background: #3756d8;
}

.cta-btn.secondary {
  background: white;
  color: #4a6cf7;
  border: 2px solid #4a6cf7;
}

.cta-btn.secondary:hover {
  background: #f0f4ff;
}

/* Features Section */
.features-section {
  padding: 60px 20px;
  text-align: center;
}

.features-section h2 {
  font-size: 2rem;
  margin-bottom: 40px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  max-width: 1000px;
  margin: auto;
}

.feature-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
}

.feature-icon {
  font-size: 2rem;
  margin-bottom: 10px;
}

/* About Section */
.about-section {
  background: #eef2f7;
  padding: 60px 20px;
}

.about-content {
  max-width: 900px;
  margin: auto;
  text-align: center;
}

.about-content h2 {
  font-size: 2rem;
  margin-bottom: 20px;
}

.about-content p {
  font-size: 1.1rem;
  margin-bottom: 15px;
}

/* Footer */
.page-footer {
  background: #1e2a42;
  color: #ddd;
  text-align: center;
  padding: 20px;
  font-size: 0.9rem;
}
</style>
