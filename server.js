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

// MongoDB Schemas
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
    console.error('Error fetching tests:', error);
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
    console.error('Error fetching test:', error);
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
    console.error('Error creating test:', error);
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
    console.error('Error updating test:', error);
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
    console.error('Error deleting test:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Save test result
app.post('/api/results', async (req, res) => {
  try {
    const resultData = req.body;
    
    // Generate unique attempt ID
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 11);
    resultData.attemptId = 'attempt-' + timestamp + '-' + random;
    
    const result = new Result(resultData);
    await result.save();
    
    res.json({ success: true, result, message: 'Result saved successfully' });
  } catch (error) {
    console.error('Error saving result:', error);
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
    console.error('Error fetching results:', error);
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
    console.error('Error fetching result:', error);
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
    console.error('Error fetching history:', error);
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
          message: 'Initialized database with ' + sampleTests.length + ' tests' 
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
        message: 'Database already contains ' + count + ' tests' 
      });
    }
  } catch (error) {
    console.error('Error initializing data:', error);
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

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('🚀 Server running on port ' + PORT);
  console.log('📝 Frontend: http://localhost:' + PORT);
  console.log('🔌 API: http://localhost:' + PORT + '/api');
});
