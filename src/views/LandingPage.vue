<template>
  <div class="landing-page">
    <header class="hero-section">
      <div class="hero-content">
        <h1>Advanced Loci Learning System</h1>
        <p class="subtitle">Enhancing learning through spatial memory techniques</p>
        <div class="cta-buttons">
          <router-link to="/login" class="cta-btn primary">Login</router-link>
          <router-link to="/login" class="cta-btn secondary">Get Started</router-link>
        </div>
      </div>
    </header>

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

    <section class="about-section">
      <div class="about-content">
        <h2>About Our System</h2>
        <p>The Advanced Loci Learning System (ALLS) combines modern educational technology with the ancient Method of Loci, a powerful memory technique used by memory champions worldwide.</p>
        <p>Our system helps students, professionals, and lifelong learners to store and recall information more effectively by associating it with spatial memory.</p>
      </div>
    </section>

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
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #2c3e50;
}

.hero-section {
  background: linear-gradient(135deg, #3498db, #2c3e50);
  color: white;
  padding: 4rem 1rem;
  text-align: center;
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-section h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.subtitle {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.cta-btn {
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  transition: all 0.3s ease;
}

.cta-btn.primary {
  background-color: #fff;
  color: #2c3e50;
}

.cta-btn.primary:hover {
  background-color: #f1f1f1;
}

.cta-btn.secondary {
  background-color: transparent;
  color: white;
  border: 2px solid white;
}

.cta-btn.secondary:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.features-section {
  padding: 4rem 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.features-section h2 {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 3rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}

.about-section {
  background-color: #f8f9fa;
  padding: 4rem 1rem;
}

.about-content {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.about-section h2 {
  font-size: 2rem;
  margin-bottom: 2rem;
}

.about-section p {
  margin-bottom: 1rem;
  line-height: 1.6;
}

.page-footer {
  background-color: #2c3e50;
  color: white;
  text-align: center;
  padding: 1.5rem;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .hero-section h1 {
    font-size: 2.2rem;
  }
  
  .subtitle {
    font-size: 1.2rem;
  }
  
  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .cta-btn {
    width: 80%;
  }
}
</style>