# Complete IBPS Test Platform - Server Integration Guide

## Backend Server (server.js)

```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
app.use(express.static('public'));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ibps-tests';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// MongoDB Models
const testSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  subject: { type: String, required: true },
  duration: { type: Number, required: true },
  questions: [{
    id: Number,
    instructions: String,
    instructionImage: String,
    instructionImageHeight: Number,
    questionEn: String,
    questionHi: String,
    options: [String],
    correctAnswer: Number,
    solution: String,
    solutionImage: String
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const resultSchema = new mongoose.Schema({
  attemptId: { type: String, required: true, unique: true },
  testId: { type: String, required: true },
  testName: String,
  userId: String,
  totalQuestions: Number,
  correct: Number,
  wrong: Number,
  skipped: Number,
  totalScore: Number,
  percentage: Number,
  totalTime: String,
  answers: mongoose.Schema.Types.Mixed,
  questionTimes: mongoose.Schema.Types.Mixed,
  resultsData: Array,
  completedAt: { type: Date, default: Date.now }
});

const Test = mongoose.model('Test', testSchema);
const Result = mongoose.model('Result', resultSchema);

// ==================== API ROUTES ====================

// Get all tests
app.get('/api/tests', async (req, res) => {
  try {
    const tests = await Test.find().sort({ createdAt: -1 });
    res.json({ success: true, tests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single test by ID
app.get('/api/tests/:id', async (req, res) => {
  try {
    const test = await Test.findOne({ id: req.params.id });
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }
    res.json({ success: true, test });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new test
app.post('/api/tests', async (req, res) => {
  try {
    const testData = req.body;
    testData.updatedAt = new Date();
    
    const test = new Test(testData);
    await test.save();
    
    res.json({ success: true, test, message: 'Test created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update test
app.put('/api/tests/:id', async (req, res) => {
  try {
    const testData = req.body;
    testData.updatedAt = new Date();
    
    const test = await Test.findOneAndUpdate(
      { id: req.params.id },
      testData,
      { new: true }
    );
    
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }
    
    res.json({ success: true, test, message: 'Test updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete test
app.delete('/api/tests/:id', async (req, res) => {
  try {
    const test = await Test.findOneAndDelete({ id: req.params.id });
    
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }
    
    // Also delete all results for this test
    await Result.deleteMany({ testId: req.params.id });
    
    res.json({ success: true, message: 'Test deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Save test result
app.post('/api/results', async (req, res) => {
  try {
    const resultData = req.body;
    resultData.attemptId = `attempt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const result = new Result(resultData);
    await result.save();
    
    res.json({ success: true, result, message: 'Result saved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get results by test ID
app.get('/api/results/test/:testId', async (req, res) => {
  try {
    const results = await Result.find({ testId: req.params.testId })
      .sort({ completedAt: -1 });
    
    // Calculate statistics
    const stats = {
      attempts: results.length,
      best: results.length > 0 ? Math.max(...results.map(r => r.percentage)) : 0,
      last: results.length > 0 ? results[0].percentage : 0,
      average: results.length > 0 
        ? (results.reduce((sum, r) => sum + r.percentage, 0) / results.length).toFixed(2)
        : 0
    };
    
    res.json({ success: true, results, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single result by attempt ID
app.get('/api/results/:attemptId', async (req, res) => {
  try {
    const result = await Result.findOne({ attemptId: req.params.attemptId });
    
    if (!result) {
      return res.status(404).json({ success: false, message: 'Result not found' });
    }
    
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all attempt history (for dashboard)
app.get('/api/results/history', async (req, res) => {
  try {
    const results = await Result.find().sort({ completedAt: -1 });
    
    // Group by testId
    const history = {};
    results.forEach(result => {
      if (!history[result.testId]) {
        history[result.testId] = {
          attempts: 0,
          best: 0,
          last: 0,
          lastAttemptId: null
        };
      }
      
      history[result.testId].attempts++;
      history[result.testId].last = result.percentage;
      history[result.testId].lastAttemptId = result.attemptId;
      
      if (result.percentage > history[result.testId].best) {
        history[result.testId].best = result.percentage;
      }
    });
    
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Initialize database with sample data
app.post('/api/init-data', async (req, res) => {
  try {
    const count = await Test.countDocuments();
    
    if (count === 0) {
      // Insert sample tests from tests-data.js
      const sampleTests = req.body.tests || [];
      
      if (sampleTests.length > 0) {
        await Test.insertMany(sampleTests);
        res.json({ 
          success: true, 
          message: `Initialized database with ${sampleTests.length} tests` 
        });
      } else {
        res.json({ 
          success: true, 
          message: 'No sample data provided' 
        });
      }
    } else {
      res.json({ 
        success: true, 
        message: `Database already contains ${count} tests` 
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Frontend: http://localhost:${PORT}`);
  console.log(`🔌 API: http://localhost:${PORT}/api`);
});
```

## package.json

```json
{
  "name": "ibps-test-platform",
  "version": "1.0.0",
  "description": "IBPS Exam Test Platform with MongoDB Integration",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "keywords": ["ibps", "test", "exam", "mongodb"],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.6.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  },
  "engines": {
    "node": ">=14.0.0"
  }
}
```

## .env Configuration

```env
# MongoDB Connection String
# For local development:
MONGODB_URI=mongodb://localhost:27017/ibps-tests

# For MongoDB Atlas (cloud):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ibps-tests?retryWrites=true&w=majority

# Server Port
PORT=3000

# Environment
NODE_ENV=production
```

## Frontend API Service (api-service.js)

Replace your `storage-service.js` with this API service:

```javascript
/**
 * API Service - Backend Integration Layer
 * Connects frontend to Node.js + MongoDB backend
 */

const API_BASE_URL = window.location.origin + '/api';
// For local development, use: const API_BASE_URL = 'http://localhost:3000/api';

export const APIService = {
  // ==================== TESTS ====================
  
  // Get all tests
  async getAllTests() {
    try {
      const response = await fetch(`${API_BASE_URL}/tests`);
      const data = await response.json();
      return data.success ? data.tests : [];
    } catch (error) {
      console.error('Error fetching tests:', error);
      return [];
    }
  },

  // Get test by ID
  async getTestById(testId) {
    try {
      const response = await fetch(`${API_BASE_URL}/tests/${testId}`);
      const data = await response.json();
      return data.success ? data.test : null;
    } catch (error) {
      console.error('Error fetching test:', error);
      return null;
    }
  },

  // Create new test
  async createTest(testData) {
    try {
      const response = await fetch(`${API_BASE_URL}/tests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating test:', error);
      return { success: false, message: error.message };
    }
  },

  // Update test
  async updateTest(testId, testData) {
    try {
      const response = await fetch(`${API_BASE_URL}/tests/${testId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating test:', error);
      return { success: false, message: error.message };
    }
  },

  // Delete test
  async deleteTest(testId) {
    try {
      const response = await fetch(`${API_BASE_URL}/tests/${testId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting test:', error);
      return { success: false, message: error.message };
    }
  },

  // ==================== RESULTS ====================
  
  // Save test result
  async saveResult(resultData) {
    try {
      const response = await fetch(`${API_BASE_URL}/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resultData)
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error saving result:', error);
      return { success: false, message: error.message };
    }
  },

  // Get results by test ID
  async getResultsByTestId(testId) {
    try {
      const response = await fetch(`${API_BASE_URL}/results/test/${testId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching results:', error);
      return { success: false, results: [], stats: {} };
    }
  },

  // Get single result by attempt ID
  async getResultById(attemptId) {
    try {
      const response = await fetch(`${API_BASE_URL}/results/${attemptId}`);
      const data = await response.json();
      return data.success ? data.result : null;
    } catch (error) {
      console.error('Error fetching result:', error);
      return null;
    }
  },

  // Get all attempt history
  async getAttemptHistory() {
    try {
      const response = await fetch(`${API_BASE_URL}/results/history`);
      const data = await response.json();
      return data.success ? data.history : {};
    } catch (error) {
      console.error('Error fetching history:', error);
      return {};
    }
  },

  // ==================== UTILITY ====================
  
  // Initialize database with sample data
  async initializeData(testsData) {
    try {
      const response = await fetch(`${API_BASE_URL}/init-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tests: testsData })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error initializing data:', error);
      return { success: false, message: error.message };
    }
  },

  // Health check
  async checkHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking health:', error);
      return { success: false, message: 'Server unreachable' };
    }
  }
};

// Make it available globally
window.APIService = APIService;
```
