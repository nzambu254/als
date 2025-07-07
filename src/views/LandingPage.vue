<template>
  <div class="landing-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-background">
        <div class="gradient-orb orb-1"></div>
        <div class="gradient-orb orb-2"></div>
        <div class="gradient-orb orb-3"></div>
      </div>
      
      <div class="hero-content">
        <div class="hero-badge">
          <span class="badge-icon">✨</span>
          <span>Revolutionary Learning Platform</span>
        </div>
        
        <h1 class="hero-title">
          Advanced Loci
          <span class="title-highlight">Learning System</span>
        </h1>
        
        <p class="hero-subtitle">
          Transform your memory with spatial learning techniques that have been proven to increase retention by up to 300%
        </p>
        
        <div class="cta-container">
          <router-link to="/login" class="cta-btn cta-primary">
            <span class="btn-icon">🚀</span>
            Get Started Free
          </router-link>
          <router-link to="/login" class="cta-btn cta-secondary">
            <span class="btn-icon">👤</span>
            Login
          </router-link>
        </div>
        
        <div class="hero-stats">
          <div class="stat-item">
            <div class="stat-number">10K+</div>
            <div class="stat-label">Active Learners</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">95%</div>
            <div class="stat-label">Success Rate</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">300%</div>
            <div class="stat-label">Memory Boost</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Why Choose Our Platform?</h2>
          <p class="section-subtitle">Experience the future of learning with cutting-edge memory enhancement technology</p>
        </div>
        
        <div class="features-grid">
          <div class="feature-card" v-for="feature in features" :key="feature.id">
            <div class="feature-header">
              <div class="feature-icon">{{ feature.icon }}</div>
              <h3>{{ feature.title }}</h3>
            </div>
            <p>{{ feature.description }}</p>
            <div class="feature-benefits">
              <span v-for="benefit in feature.benefits" :key="benefit" class="benefit-tag">
                {{ benefit }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section class="about-section">
      <div class="container">
        <div class="about-grid">
          <div class="about-content">
            <h2 class="about-title">Revolutionize Your Learning</h2>
            <p class="about-text">
              The Advanced Loci Learning System combines ancient memory techniques with modern neuroscience. 
              Our platform uses the Method of Loci - a proven spatial memory technique that transforms 
              abstract information into vivid, memorable experiences.
            </p>
            <p class="about-text">
              Join thousands of students, professionals, and lifelong learners who've discovered 
              the power of spatial memory to achieve extraordinary results.
            </p>
            
            <div class="about-features">
              <div class="about-feature">
                <span class="feature-check">✓</span>
                <span>Scientifically proven methods</span>
              </div>
              <div class="about-feature">
                <span class="feature-check">✓</span>
                <span>Personalized learning paths</span>
              </div>
              <div class="about-feature">
                <span class="feature-check">✓</span>
                <span>Real-time progress tracking</span>
              </div>
            </div>
          </div>
          
          <div class="about-visual">
            <div class="visual-card">
              <div class="brain-icon">🧠</div>
              <div class="neural-network">
                <div class="neural-dot"></div>
                <div class="neural-dot"></div>
                <div class="neural-dot"></div>
                <div class="neural-dot"></div>
                <div class="neural-connection"></div>
                <div class="neural-connection"></div>
                <div class="neural-connection"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-brand">
            <h3>Advanced Loci Learning System</h3>
            <p>Empowering minds through spatial memory mastery</p>
          </div>
          <div class="footer-links">
            <a href="#" class="footer-link">Privacy Policy</a>
            <a href="#" class="footer-link">Terms of Service</a>
            <a href="#" class="footer-link">Contact Us</a>
          </div>
        </div>
        <div class="footer-bottom">
          <p>© 2025 Advanced Loci Learning System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'LandingPage',
  data() {
    return {
      features: [
        {
          id: 1,
          icon: '🧠',
          title: 'Memory Enhancement',
          description: 'Harness the power of spatial memory with techniques used by memory champions worldwide.',
          benefits: ['300% Retention', 'Faster Recall', 'Long-term Memory']
        },
        {
          id: 2,
          icon: '📚',
          title: 'Interactive Learning',
          description: 'Engage with gamified lessons that adapt to your learning style and progress.',
          benefits: ['Personalized', 'Gamified', 'Adaptive']
        },
        {
          id: 3,
          icon: '📊',
          title: 'Progress Analytics',
          description: 'Track your improvement with detailed insights and performance metrics.',
          benefits: ['Real-time Data', 'Performance Insights', 'Goal Tracking']
        }
      ]
    }
  },
  mounted() {
    this.initializeAnimations();
  },
  methods: {
    initializeAnimations() {
      // Intersection Observer for scroll animations
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      });

      // Observe elements
      document.querySelectorAll('.feature-card, .about-content, .about-visual').forEach(el => {
        observer.observe(el);
      });

      // Animate stats on scroll
      const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const statNumbers = entry.target.querySelectorAll('.stat-number');
            statNumbers.forEach(stat => {
              stat.classList.add('count-up');
            });
          }
        });
      }, { threshold: 0.5 });

      const statsSection = document.querySelector('.hero-stats');
      if (statsSection) {
        statsObserver.observe(statsSection);
      }
    }
  }
}
</script>

<style scoped>
/* Reset and Base Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.landing-page {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #1a1a1a;
  background: #ffffff;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Hero Section */
.hero-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  animation: float 6s ease-in-out infinite;
}

.orb-1 {
  width: 300px;
  height: 300px;
  background: rgba(255, 107, 107, 0.3);
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.orb-2 {
  width: 200px;
  height: 200px;
  background: rgba(74, 108, 247, 0.3);
  top: 60%;
  right: 10%;
  animation-delay: 2s;
}

.orb-3 {
  width: 150px;
  height: 150px;
  background: rgba(238, 90, 36, 0.3);
  bottom: 10%;
  left: 60%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}

.hero-content {
  text-align: center;
  z-index: 1;
  max-width: 800px;
  padding: 2rem;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  padding: 0.5rem 1rem;
  border-radius: 50px;
  color: white;
  font-size: 0.9rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.badge-icon {
  font-size: 1.2rem;
}

.hero-title {
  font-size: clamp(3rem, 8vw, 5rem);
  font-weight: 900;
  margin-bottom: 1.5rem;
  color: white;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  line-height: 1.1;
}

.title-highlight {
  display: block;
  background: linear-gradient(45deg, #ff6b6b, #ffd93d);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: none;
}

.hero-subtitle {
  font-size: clamp(1.1rem, 2.5vw, 1.4rem);
  margin-bottom: 3rem;
  color: rgba(255, 255, 255, 0.9);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

.cta-container {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 4rem;
}

.cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  min-width: 180px;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.cta-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.6s ease;
}

.cta-btn:hover::before {
  left: 100%;
}

.cta-primary {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  box-shadow: 0 10px 30px rgba(255, 107, 107, 0.4);
}

.cta-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 40px rgba(255, 107, 107, 0.6);
}

.cta-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.cta-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 3rem;
  flex-wrap: wrap;
}

.stat-item {
  text-align: center;
  color: white;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 900;
  margin-bottom: 0.5rem;
  background: linear-gradient(45deg, #ffd93d, #ff6b6b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.8;
}

/* Features Section */
.features-section {
  padding: 6rem 0;
  background: #f8fafc;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-title {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 800;
  color: #1a202c;
  margin-bottom: 1rem;
}

.section-subtitle {
  font-size: 1.2rem;
  color: #718096;
  max-width: 600px;
  margin: 0 auto;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: white;
  padding: 2.5rem;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
  opacity: 0;
  transform: translateY(30px);
}

.feature-card.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.feature-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.feature-icon {
  font-size: 2.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  height: 60px;
}

.feature-card h3 {
  font-size: 1.4rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

.feature-card p {
  color: #718096;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.feature-benefits {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.benefit-tag {
  background: #e6fffa;
  color: #234e52;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid #b2f5ea;
}

/* About Section */
.about-section {
  padding: 6rem 0;
  background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
  color: white;
}

.about-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.about-content {
  opacity: 0;
  transform: translateX(-30px);
}

.about-content.animate-in {
  opacity: 1;
  transform: translateX(0);
  transition: all 0.8s ease;
}

.about-title {
  font-size: clamp(2rem, 4vw, 2.5rem);
  font-weight: 800;
  margin-bottom: 2rem;
  color: #f7fafc;
}

.about-text {
  font-size: 1.1rem;
  line-height: 1.8;
  margin-bottom: 1.5rem;
  color: #e2e8f0;
}

.about-features {
  margin-top: 2rem;
}

.about-feature {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.feature-check {
  background: #48bb78;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
}

.about-visual {
  display: flex;
  justify-content: center;
  opacity: 0;
  transform: translateX(30px);
}

.about-visual.animate-in {
  opacity: 1;
  transform: translateX(0);
  transition: all 0.8s ease 0.2s;
}

.visual-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  padding: 3rem;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-align: center;
  position: relative;
  overflow: hidden;
}

.brain-icon {
  font-size: 4rem;
  margin-bottom: 2rem;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.neural-network {
  position: relative;
  height: 150px;
  width: 200px;
  margin: 0 auto;
}

.neural-dot {
  position: absolute;
  width: 12px;
  height: 12px;
  background: #4fd1c7;
  border-radius: 50%;
  animation: glow 2s ease-in-out infinite;
}

.neural-dot:nth-child(1) { top: 20px; left: 20px; animation-delay: 0s; }
.neural-dot:nth-child(2) { top: 20px; right: 20px; animation-delay: 0.5s; }
.neural-dot:nth-child(3) { bottom: 20px; left: 20px; animation-delay: 1s; }
.neural-dot:nth-child(4) { bottom: 20px; right: 20px; animation-delay: 1.5s; }

@keyframes glow {
  0%, 100% { box-shadow: 0 0 5px #4fd1c7; }
  50% { box-shadow: 0 0 20px #4fd1c7, 0 0 30px #4fd1c7; }
}

.neural-connection {
  position: absolute;
  height: 2px;
  background: linear-gradient(90deg, #4fd1c7, #667eea);
  opacity: 0.6;
  animation: pulse-line 2s ease-in-out infinite;
}

.neural-connection:nth-child(5) {
  top: 25px;
  left: 32px;
  width: 136px;
  animation-delay: 0.25s;
}

.neural-connection:nth-child(6) {
  bottom: 25px;
  left: 32px;
  width: 136px;
  animation-delay: 0.75s;
}

.neural-connection:nth-child(7) {
  top: 32px;
  left: 25px;
  width: 2px;
  height: 86px;
  animation-delay: 1.25s;
}

@keyframes pulse-line {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

/* Footer */
.footer {
  background: #0d1117;
  color: #8b949e;
  padding: 3rem 0 1rem;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 2rem;
}

.footer-brand h3 {
  color: #f0f6fc;
  margin-bottom: 0.5rem;
}

.footer-links {
  display: flex;
  gap: 2rem;
}

.footer-link {
  color: #8b949e;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: #58a6ff;
}

.footer-bottom {
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid #21262d;
  font-size: 0.9rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .about-grid {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
  
  .hero-stats {
    gap: 2rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .footer-content {
    flex-direction: column;
    text-align: center;
  }
  
  .footer-links {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .cta-container {
    flex-direction: column;
    align-items: center;
  }
  
  .cta-btn {
    width: 100%;
    max-width: 300px;
  }
}
</style>