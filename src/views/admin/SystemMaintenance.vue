<template>
  <div class="system-maintenance-container">
    <h2>System Maintenance</h2>
    
    <div class="maintenance-sections">
      <div class="maintenance-card">
        <h3>Database Backup</h3>
        <p>Create a backup of the current database state</p>
        <button @click="createBackup" :disabled="backupInProgress">
          {{ backupInProgress ? 'Backup in Progress...' : 'Create Backup' }}
        </button>
        <div v-if="backupMessage" class="message" :class="{ success: backupSuccess, error: !backupSuccess }">
          {{ backupMessage }}
        </div>
      </div>
      
      <div class="maintenance-card">
        <h3>System Logs</h3>
        <p>View and manage system logs</p>
        <button @click="viewLogs">View Logs</button>
        <div class="log-actions">
          <button @click="downloadLogs" class="secondary-btn">Download Logs</button>
          <button @click="clearLogs" class="secondary-btn">Clear Logs</button>
        </div>
      </div>
      
      <div class="maintenance-card">
        <h3>User Activity Report</h3>
        <p>Generate reports on user activity</p>
        <div class="report-controls">
          <div class="form-group">
            <label>Start Date</label>
            <input type="date" v-model="reportStartDate">
          </div>
          <div class="form-group">
            <label>End Date</label>
            <input type="date" v-model="reportEndDate">
          </div>
          <button @click="generateReport" :disabled="reportInProgress">
            {{ reportInProgress ? 'Generating...' : 'Generate Report' }}
          </button>
        </div>
        <div v-if="reportMessage" class="message" :class="{ success: reportSuccess, error: !reportSuccess }">
          {{ reportMessage }}
        </div>
      </div>
      
      <div class="maintenance-card">
        <h3>System Settings</h3>
        <p>Update system configuration</p>
        <div class="settings-form">
          <div class="form-group">
            <label>Maintenance Mode</label>
            <div class="toggle-switch">
              <input type="checkbox" id="maintenance-mode" v-model="maintenanceMode">
              <label for="maintenance-mode" class="toggle-label"></label>
              <span>{{ maintenanceMode ? 'ON' : 'OFF' }}</span>
            </div>
          </div>
          <div class="form-group">
            <label>Session Timeout (minutes)</label>
            <input type="number" v-model="sessionTimeout" min="1">
          </div>
          <button @click="saveSettings" :disabled="savingSettings">
            {{ savingSettings ? 'Saving...' : 'Save Settings' }}
          </button>
        </div>
        <div v-if="settingsMessage" class="message" :class="{ success: settingsSuccess, error: !settingsSuccess }">
          {{ settingsMessage }}
        </div>
      </div>
    </div>
    
    <div v-if="showLogsModal" class="modal-overlay">
      <div class="modal-content logs-modal">
        <button class="close-modal" @click="showLogsModal = false">×</button>
        <h3>System Logs</h3>
        <div class="logs-content">
          <pre>{{ logsContent }}</pre>
        </div>
        <div class="modal-actions">
          <button @click="downloadLogs" class="secondary-btn">Download</button>
          <button @click="showLogsModal = false" class="primary-btn">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';

export default {
  name: 'SystemMaintenance',
  data() {
    return {
      backupInProgress: false,
      backupMessage: '',
      backupSuccess: false,
      showLogsModal: false,
      logsContent: 'Loading logs...',
      reportInProgress: false,
      reportMessage: '',
      reportSuccess: false,
      reportStartDate: '',
      reportEndDate: '',
      maintenanceMode: false,
      sessionTimeout: 30,
      savingSettings: false,
      settingsMessage: '',
      settingsSuccess: false
    }
  },
  async created() {
    await this.loadSettings();
  },
  methods: {
    async createBackup() {
      this.backupInProgress = true;
      this.backupMessage = '';
      
      try {
        // Simulate backup process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        this.backupMessage = 'Backup created successfully. Download link sent to admin email.';
        this.backupSuccess = true;
      } catch (err) {
        this.backupMessage = 'Backup failed. Please try again.';
        this.backupSuccess = false;
        console.error(err);
      } finally {
        this.backupInProgress = false;
      }
    },
    async viewLogs() {
      this.showLogsModal = true;
      
      try {
        // Simulate loading logs
        await new Promise(resolve => setTimeout(resolve, 500));
        this.logsContent = `System Logs - ${new Date().toLocaleString()}\n\n` +
          '1. INFO: System started\n' +
          '2. INFO: User admin logged in\n' +
          '3. WARNING: High memory usage detected\n' +
          '4. INFO: Database backup completed\n' +
          '5. ERROR: Failed to send notification\n';
      } catch (err) {
        this.logsContent = 'Failed to load logs. Please try again.';
        console.error(err);
      }
    },
    downloadLogs() {
      // Simulate download
      const blob = new Blob([this.logsContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `system-logs-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    clearLogs() {
      if (confirm('Are you sure you want to clear all system logs?')) {
        this.logsContent = 'Logs cleared successfully.';
      }
    },
    async generateReport() {
      if (!this.reportStartDate || !this.reportEndDate) {
        this.reportMessage = 'Please select both start and end dates';
        this.reportSuccess = false;
        return;
      }
      
      this.reportInProgress = true;
      this.reportMessage = '';
      
      try {
        // Simulate report generation
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        this.reportMessage = 'Report generated successfully. Check your email for the download link.';
        this.reportSuccess = true;
      } catch (err) {
        this.reportMessage = 'Failed to generate report. Please try again.';
        this.reportSuccess = false;
        console.error(err);
      } finally {
        this.reportInProgress = false;
      }
    },
    async loadSettings() {
      try {
        const settingsDoc = await getDoc(doc(db, 'system', 'settings'));
        if (settingsDoc.exists()) {
          const data = settingsDoc.data();
          this.maintenanceMode = data.maintenanceMode || false;
          this.sessionTimeout = data.sessionTimeout || 30;
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    },
    async saveSettings() {
      this.savingSettings = true;
      this.settingsMessage = '';
      
      try {
        await updateDoc(doc(db, 'system', 'settings'), {
          maintenanceMode: this.maintenanceMode,
          sessionTimeout: this.sessionTimeout,
          updatedAt: new Date(),
          updatedBy: this.$store.state.user.uid
        });
        
        this.settingsMessage = 'Settings saved successfully.';
        this.settingsSuccess = true;
      } catch (err) {
        this.settingsMessage = 'Failed to save settings. Please try again.';
        this.settingsSuccess = false;
        console.error(err);
      } finally {
        this.savingSettings = false;
      }
    }
  }
}
</script>

<style scoped>
.system-maintenance-container {
  padding: 20px;
}
.maintenance-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}
.maintenance-card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.maintenance-card h3 {
  margin-top: 0;
  color: #2c3e50;
}
.maintenance-card p {
  color: #666;
  margin: 10px 0 20px;
}
.maintenance-card button {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
}
.maintenance-card button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
.log-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}
.secondary-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  flex: 1;
}
.report-controls {
  margin-top: 15px;
}
.form-group {
  margin-bottom: 15px;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
}
.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}
.toggle-switch {
  display: flex;
  align-items: center;
  gap: 10px;
}
.toggle-switch input[type="checkbox"] {
  display: none;
}
.toggle-label {
  display: inline-block;
  width: 50px;
  height: 24px;
  background-color: #ddd;
  border-radius: 12px;
  position: relative;
  cursor: pointer;
}
.toggle-label:before {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: white;
  top: 2px;
  left: 2px;
  transition: transform 0.3s;
}
.toggle-switch input:checked + .toggle-label {
  background-color: #42b983;
}
.toggle-switch input:checked + .toggle-label:before {
  transform: translateX(26px);
}
.message {
  margin-top: 15px;
  padding: 10px;
  border-radius: 4px;
  text-align: center;
}
.message.success {
  background-color: #e8f5e9;
  color: #00C851;
}
.message.error {
  background-color: #ffebee;
  color: #ff4444;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.logs-modal {
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}
.close-modal {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 1.5em;
  background: none;
  border: none;
  cursor: pointer;
}
.logs-content {
  flex: 1;
  overflow-y: auto;
  background-color: #f5f5f5;
  padding: 15px;
  margin: 15px 0;
  border-radius: 4px;
  font-family: monospace;
  white-space: pre-wrap;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.primary-btn {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
}
</style>