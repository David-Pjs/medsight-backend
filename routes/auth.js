const express = require('express');

const router = express.Router();

// Mock login endpoint for hackathon/demo purposes
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Simple mock authentication - accept any credentials
  if (email && password) {
    res.json({
      status: true,
      message: 'Login successful',
      token: 'mock-token-for-hackathon',
      user: {
        id: '1',
        email: email,
        role: 'doctor',
        name: 'Dr. Sola Adeyemi'
      }
    });
  } else {
    res.status(400).json({
      status: false,
      message: 'Email and password are required'
    });
  }
});

// Mock logout endpoint
router.post('/logout', async (req, res) => {
  res.json({
    status: true,
    message: 'Logout successful'
  });
});

// Get current user
router.get('/me', async (req, res) => {
  res.json({
    id: '1',
    email: 'doctor@hospital.com',
    role: 'doctor',
    name: 'Dr. Sola Adeyemi'
  });
});

module.exports = router;
