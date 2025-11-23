const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Auto-seed realistic data on startup
const { seedData } = require('./seed-on-startup');
seedData();

// Middleware
app.use(cors());
app.use(express.json());

// Auth middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  // For hackathon - simple mock auth
  // In production, verify JWT properly
  try {
    req.user = { id: '1', email: 'doctor@hospital.com', role: 'doctor' };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Routes
const patientsRouter = require('./routes/patients');
const encountersRouter = require('./routes/encounters');
const medicationsRouter = require('./routes/medications');
const appointmentsRouter = require('./routes/appointments');
const safetyRouter = require('./routes/safety');
const adrRouter = require('./routes/adr');
const authRouter = require('./routes/auth');
const aiRouter = require('./routes/ai');
const translateRouter = require('./routes/translate');
const pharmacyRouter = require('./routes/pharmacy');

app.use('/api/auth', authRouter);
app.use('/api/patients', authMiddleware, patientsRouter);
app.use('/api/encounters', authMiddleware, encountersRouter);
app.use('/api/medications', authMiddleware, medicationsRouter);
app.use('/api/appointments', authMiddleware, appointmentsRouter);
app.use('/api/safety', authMiddleware, safetyRouter);
app.use('/api/adr', authMiddleware, adrRouter);
app.use('/api/ai', authMiddleware, aiRouter);
app.use('/api/translate', authMiddleware, translateRouter);
// Pharmacy routes - generate/revoke tokens require auth, but prescription view is public
app.use('/api/pharmacy', pharmacyRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'MedSight AI API running' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 MedSight AI API running on port ${PORT}`);
});
