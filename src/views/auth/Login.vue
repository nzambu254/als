<template>
  <div class="login-container">
    <h1>Login</h1>
    <div v-if="error" class="error-message">{{ error }}</div>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" v-model="email" required>
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" v-model="password" required>
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? 'Logging in...' : 'Login' }}
      </button>
      <div class="forgot-password">
        <a href="#" @click.prevent="resetPassword">Forgot password?</a>
      </div>
    </form>
    <div v-if="resetEmailSent" class="success-message">
      Password reset email sent. Please check your inbox.
    </div>
  </div>
</template>

<script>
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, sendPasswordResetEmail } from '@/firebase';

export default {
  name: 'LoginView',
  data() {
    return {
      email: '',
      password: '',
      error: '',
      loading: false,
      resetEmailSent: false
    }
  },
  methods: {
    async handleLogin() {
      this.loading = true;
      this.error = '';
      
      // Hardcoded admin credentials check
      if (this.email === 'tabithalomuke@gmail.com' && this.password === '1234567') {
        try {
          // Try to sign in with Firebase first
          await signInWithEmailAndPassword(auth, this.email, this.password);
        } catch (err) {
          // If Firebase auth fails, still allow login with hardcoded credentials
          console.log('Firebase auth failed, but proceeding with hardcoded admin credentials');
        }
        // Redirect to admin dashboard
        this.$router.push('/admin');
        return;
      }

      // Regular login flow for other users
      try {
        await signInWithEmailAndPassword(auth, this.email, this.password);
        this.$router.push(`/${this.getUserRole()}`);
      } catch (err) {
        this.error = this.getErrorMessage(err.code);
      } finally {
        this.loading = false;
      }
    },
    async resetPassword() {
      if (!this.email) {
        this.error = 'Please enter your email address first';
        return;
      }
      
      // Don't allow password reset for hardcoded admin
      if (this.email === 'tabithalomuke@gmail.com') {
        this.error = 'Please contact system administrator for password reset';
        return;
      }
      
      try {
        await sendPasswordResetEmail(auth, this.email);
        this.resetEmailSent = true;
        this.error = '';
      } catch (err) {
        this.error = this.getErrorMessage(err.code);
      }
    },
    getErrorMessage(code) {
      switch (code) {
        case 'auth/user-not-found':
          return 'No user found with this email';
        case 'auth/wrong-password':
          return 'Incorrect password';
        case 'auth/too-many-requests':
          return 'Too many attempts. Try again later';
        default:
          return 'Login failed. Please try again';
      }
    },
    getUserRole() {
      // Check hardcoded admin first
      if (this.email === 'tabithalomuke@gmail.com') return 'admin';
      
      // Then check other role patterns
      if (this.email.includes('@admin.')) return 'admin';
      if (this.email.includes('@teacher.')) return 'teacher';
      return 'student';
    }
  }
}
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}
.form-group {
  margin-bottom: 15px;
}
label {
  display: block;
  margin-bottom: 5px;
}
input {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}
button {
  padding: 10px 15px;
  background-color: #42b983;
  color: white;
  border: none;
  cursor: pointer;
  width: 100%;
  margin-top: 10px;
}
button:disabled {
  background-color: #cccccc;
}
.forgot-password {
  text-align: right;
  margin-top: 10px;
}
.forgot-password a {
  color: #666;
  text-decoration: none;
  font-size: 0.9em;
}
.forgot-password a:hover {
  text-decoration: underline;
}
.error-message {
  color: #ff4444;
  margin-bottom: 15px;
  padding: 10px;
  background-color: #ffebee;
  border-radius: 4px;
}
.success-message {
  color: #00C851;
  margin-top: 15px;
  padding: 10px;
  background-color: #e8f5e9;
  border-radius: 4px;
}
</style>