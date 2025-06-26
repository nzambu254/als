<template>
  <div class="login-wrapper">
    <!-- Loading overlay for initial auth check -->
    <div v-if="initialLoading" class="loading-overlay">
      <div class="loading-container">
        <div class="loading-spinner-large"></div>
        <p class="loading-text">Loading...</p>
      </div>
    </div>
    
    <div v-else class="login-container">
      <!-- Header Section -->
      <div class="login-header">
        <div class="logo-section">
          <div class="logo-icon">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="12" fill="url(#gradient)"/>
              <path d="M20 8L28 16L20 24L12 16L20 8Z" fill="white"/>
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1>{{ isLoginMode ? 'Welcome Back' : 'Create Account' }}</h1>
          <p>{{ isLoginMode ? 'Sign in to your account' : 'Join our platform today' }}</p>
        </div>
      </div>

      <!-- Mode Toggle -->
      <div class="mode-toggle">
        <button 
          @click="toggleMode" 
          class="toggle-btn"
          :class="{ 'active': isLoginMode }"
        >
          Sign In
        </button>
        <button 
          @click="toggleMode" 
          class="toggle-btn"
          :class="{ 'active': !isLoginMode }"
        >
          Sign Up
        </button>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="alert alert-error">
        <svg class="alert-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        {{ error }}
      </div>

      <!-- Success Message -->
      <div v-if="successMessage" class="alert alert-success">
        <svg class="alert-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        {{ successMessage }}
      </div>

      <!-- Login Form -->
      <form v-if="isLoginMode" @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label for="loginEmail" class="form-label">
            <svg class="label-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            Email Address
          </label>
          <div class="input-wrapper">
            <input 
              type="email" 
              id="loginEmail" 
              v-model="loginData.email" 
              required
              class="form-input"
              placeholder="Enter your email"
              :class="{ 'input-error': error && !loginData.email }"
            >
          </div>
        </div>

        <div class="form-group">
          <label for="loginPassword" class="form-label">
            <svg class="label-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
            </svg>
            Password
          </label>
          <div class="input-wrapper">
            <input 
              :type="showPassword ? 'text' : 'password'" 
              id="loginPassword" 
              v-model="loginData.password" 
              required
              class="form-input"
              placeholder="Enter your password"
              :class="{ 'input-error': error && !loginData.password }"
            >
            <button 
              type="button" 
              class="password-toggle"
              @click="showPassword = !showPassword"
            >
              <svg v-if="!showPassword" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd" />
                <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
              </svg>
            </button>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" :disabled="loading" class="btn-primary">
            <span v-if="loading" class="loading-spinner"></span>
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
          
          <div class="forgot-password">
            <a href="#" @click.prevent="resetPassword" class="forgot-link">
              Forgot your password?
            </a>
          </div>
        </div>
      </form>

      <!-- Register Form -->
      <form v-else @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label for="registerName" class="form-label">
            <svg class="label-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
            </svg>
            Full Name
          </label>
          <div class="input-wrapper">
            <input 
              type="text" 
              id="registerName" 
              v-model="registerData.name" 
              required
              class="form-input"
              placeholder="Enter your full name"
              :class="{ 'input-error': error && !registerData.name }"
            >
          </div>
        </div>

        <div class="form-group">
          <label for="registerEmail" class="form-label">
            <svg class="label-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            Email Address
          </label>
          <div class="input-wrapper">
            <input 
              type="email" 
              id="registerEmail" 
              v-model="registerData.email" 
              required
              class="form-input"
              placeholder="Enter your email"
              :class="{ 'input-error': error && !registerData.email }"
            >
          </div>
        </div>

        <div class="form-group">
          <label for="role" class="form-label">
            <svg class="label-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
              <path d="M6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
            </svg>
            Role
          </label>
          <div class="input-wrapper">
            <select 
              id="role" 
              v-model="registerData.role" 
              required
              class="form-input form-select"
              :class="{ 'input-error': error && !registerData.role }"
            >
              <option value="">Select your role</option>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="registerPassword" class="form-label">
            <svg class="label-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
            </svg>
            Password
          </label>
          <div class="input-wrapper">
            <input 
              :type="showPassword ? 'text' : 'password'" 
              id="registerPassword" 
              v-model="registerData.password" 
              required
              minlength="6"
              class="form-input"
              placeholder="Enter your password"
              :class="{ 'input-error': error && !registerData.password }"
            >
            <button 
              type="button" 
              class="password-toggle"
              @click="showPassword = !showPassword"
            >
              <svg v-if="!showPassword" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd" />
                <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
              </svg>
            </button>
          </div>
        </div>

        <div class="form-group">
          <label for="confirmPassword" class="form-label">
            <svg class="label-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
            </svg>
            Confirm Password
          </label>
          <div class="input-wrapper">
            <input 
              :type="showConfirmPassword ? 'text' : 'password'" 
              id="confirmPassword" 
              v-model="registerData.confirmPassword" 
              required
              class="form-input"
              placeholder="Confirm your password"
              :class="{ 'input-error': error && !registerData.confirmPassword }"
            >
            <button 
              type="button" 
              class="password-toggle"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <svg v-if="!showConfirmPassword" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd" />
                <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
              </svg>
            </button>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" :disabled="loading" class="btn-primary">
            <span v-if="loading" class="loading-spinner"></span>
            {{ loading ? 'Creating Account...' : 'Create Account' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Background decoration -->
    <div class="bg-decoration">
      <div class="bg-circle bg-circle-1"></div>
      <div class="bg-circle bg-circle-2"></div>
      <div class="bg-circle bg-circle-3"></div>
    </div>
  </div>
</template>

<script>
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase';

export default {
  name: 'LoginView',
  data() {
    return {
      initialLoading: true,
      isLoginMode: true,
      loading: false,
      error: '',
      successMessage: '',
      showPassword: false,
      showConfirmPassword: false,
      loginData: {
        email: '',
        password: ''
      },
      registerData: {
        name: '',
        email: '',
        role: '',
        password: '',
        confirmPassword: ''
      },
      authStateListener: null
    }
  },
  async mounted() {
    // Check if user is already authenticated
    this.authStateListener = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // User is authenticated, get their role and redirect
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            this.redirectUserByRole(userData.role);
            return;
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
      // No user or error occurred, show login form
      this.initialLoading = false;
    });
  },
  beforeUnmount() {
    this.loading = false;
    if (this.authStateListener) {
      this.authStateListener();
    }
  },
  methods: {
    toggleMode() {
      this.isLoginMode = !this.isLoginMode;
      this.clearMessages();
      this.resetForms();
    },

    clearMessages() {
      this.error = '';
      this.successMessage = '';
    },

    resetForms() {
      this.loginData = {
        email: '',
        password: ''
      };
      this.registerData = {
        name: '',
        email: '',
        role: '',
        password: '',
        confirmPassword: ''
      };
      this.showPassword = false;
      this.showConfirmPassword = false;
    },

    async handleLogin() {
      this.loading = true;
      this.clearMessages();

      try {
        // Authenticate with Firebase
        const userCredential = await signInWithEmailAndPassword(
          auth, 
          this.loginData.email, 
          this.loginData.password
        );
        
        const user = userCredential.user;
        
        // Get user role from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (!userDoc.exists()) {
          throw new Error('User profile not found. Please contact support.');
        }
        
        const userData = userDoc.data();
        const userRole = userData.role;
        
        // Redirect based on role - the auth state listener will handle this
        // But we can also redirect immediately to avoid any delay
        this.redirectUserByRole(userRole);
        
      } catch (err) {
        console.error('Login error:', err);
        this.error = this.getErrorMessage(err.code || err.message || 'auth/unknown');
        this.loading = false;
      }
      // Note: loading state will be maintained until redirect happens
    },

    async handleRegister() {
      this.loading = true;
      this.clearMessages();

      try {
        // Validate form data
        this.validateRegistrationData();
        
        // Create user account
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          this.registerData.email,
          this.registerData.password
        );
        
        const user = userCredential.user;
        
        // Save user data to Firestore
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          name: this.registerData.name.trim(),
          email: this.registerData.email.toLowerCase(),
          role: this.registerData.role,
          createdAt: new Date().toISOString(),
          isActive: true
        });
        
        this.successMessage = 'Account created successfully! Please sign in to continue.';
        
        // Auto-switch to login mode after 2 seconds
        setTimeout(() => {
          this.isLoginMode = true;
          this.clearMessages();
          this.resetForms();
          // Pre-fill email for convenience
          this.loginData.email = this.registerData.email;
        }, 2000);
        
      } catch (err) {
        console.error('Registration error:', err);
        this.error = this.getErrorMessage(err.code || err.message || 'auth/unknown');
      } finally {
        this.loading = false;
      }
    },

    validateRegistrationData() {
      const { name, email, role, password, confirmPassword } = this.registerData;
      
      if (!name.trim()) {
        throw new Error('Please enter your full name');
      }
      
      if (name.trim().length < 2) {
        throw new Error('Name must be at least 2 characters long');
      }
      
      if (!email.trim()) {
        throw new Error('Please enter your email address');
      }
      
      if (!role) {
        throw new Error('Please select your role');
      }
      
      if (!password) {
        throw new Error('Please enter a password');
      }
      
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
    },

    async resetPassword() {
      if (!this.loginData.email) {
        this.error = 'Please enter your email address first';
        return;
      }
      
      try {
        await sendPasswordResetEmail(auth, this.loginData.email);
        this.successMessage = 'Password reset email sent. Please check your inbox.';
        this.error = '';
      } catch (err) {
        console.error('Password reset error:', err);
        this.error = this.getErrorMessage(err.code);
      }
    },

    redirectUserByRole(role) {
      const roleRoutes = {
        admin: '/admin',
        teacher: '/teacher',
        student: '/student'
      };
      
      const route = roleRoutes[role] || '/student'; // Default to student if role not found
      
      // Use replace instead of push to avoid going back to login
      this.$router.replace(route);
    },

    getErrorMessage(code) {
      const errorMessages = {
        'auth/user-not-found': 'No user found with this email address',
        'auth/wrong-password': 'Incorrect password',
        'auth/invalid-email': 'Invalid email address',
        'auth/user-disabled': 'This user account has been disabled',
        'auth/too-many-requests': 'Too many failed attempts. Please try again later',
        'auth/network-request-failed': 'Network error. Please check your connection',
        'auth/invalid-credential': 'Invalid email or password',
        'auth/missing-password': 'Please enter your password',
        'auth/weak-password': 'Password should be at least 6 characters',
        'auth/email-already-in-use': 'Email is already registered',
        'auth/operation-not-allowed': 'Email/password accounts are not enabled',
        'auth/unknown': 'An unexpected error occurred. Please try again'
      };
      
      return errorMessages[code] || code || 'An error occurred. Please try again';
    }
  }
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.loading-spinner-large {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

.loading-text {
  color: white;
  font-size: 18px;
  font-weight: 500;
  margin: 0;
}

.login-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 40px;
  width: 100%;
  max-width: 480px;
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 10;
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 24px;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.login-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  letter-spacing: -0.025em;
}

.login-header p {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
  font-weight: 400;
}

.mode-toggle {
  display: flex;
  background-color: #f3f4f6;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 24px;
}

.toggle-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: transparent;
  color: #6b7280;
}

.toggle-btn.active {
  background: white;
  color: #1f2937;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.alert {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 24px;
  font-size: 14px;
  font-weight: 500;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.alert-error {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
}

.alert-success {
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #16a34a;
}

.alert-icon {
  flex-shrink: 0;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.label-icon {
  color: #6b7280;
}

.input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 400;
  color: #1f2937;
  background-color: #ffffff;
  transition: all 0.3s ease;
  outline: none;
}

.form-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.form-input::placeholder {
  color: #9ca3af;
}

.input-error {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
}

.password-toggle {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.password-toggle:hover {
  color: #374151;
  background-color: #f3f4f6;
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 8px;
}

.btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.forgot-password {
  text-align: center;
}

.forgot-link {
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s ease;
}

.forgot-link:hover {
  color: #5a67d8;
  text-decoration: underline;
}

.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 1;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.bg-circle-1 {
  width: 300px;
  height: 300px;
  top: -150px;
  right: -150px;
  animation-delay: 0s;
}

.bg-circle-2 {
  width: 200px;
  height: 200px;
  bottom: -100px;
  left: -100px;
  animation-delay: 2s;
}

.bg-circle-3 {
  width: 150px;
  height: 150px;
  top: 50%;
  left: -75px;
  animation-delay: 4s;
}

/* Responsive Design */
@media (max-width: 480px) {
  .login-container {
    padding: 24px;
    margin: 10px;
    border-radius: 16px;
  }
  
  .login-header h1 {
    font-size: 24px;
  }
  
  .form-input {
    padding: 14px;
    font-size: 16px; /* Prevent zoom on iOS */
  }
  
  .btn-primary {
    padding: 14px;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .login-container {
    background: rgba(17, 24, 39, 0.95);
    border: 1px solid rgba(75, 85, 99, 0.3);
  }
  
  .login-header h1 {
    color: #f9fafb;
  }
  
  .login-header p {
    color: #d1d5db;
  }
  
  .form-label {
    color: #f3f4f6;
  }
  
  .form-input {
    background-color: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }
  
  .form-input:focus {
    border-color: #667eea;
  }
}
</style>