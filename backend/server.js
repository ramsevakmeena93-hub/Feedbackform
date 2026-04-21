require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/submissions', require('./routes/submissions'));
app.use('/api/process', require('./routes/process'));
app.use('/api/logs', require('./routes/logs'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/faculty_feedback';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');

    // Preload AI model in background so it's ready for first request
    try {
      const { testGeminiConnection } = require('./services/aiAnalyzer');
      testGeminiConnection().then(r => {
        if (r.ok) console.log('[AI] Model ready:', r.engine);
        else console.warn('[AI] Model not ready:', r.error);
      }).catch(() => {});
    } catch {}

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
