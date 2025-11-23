// routes/pharmacy.js
const express = require('express');
const router = express.Router();

// In-memory storage for tokens (in production, use database with TTL)
const tokens = new Map();
const revokedTokens = new Set();
const prescriptionData = new Map(); // Store prescription details

// Pre-seed demo tokens for easy demo access
function seedDemoTokens() {
  const demoTokens = [
    {
      token: 'DEMO-001',
      patientId: 'demo-patient-1',
      prescription: {
        patientInitials: 'A.O.',
        patientAge: '45',
        patientGender: 'Male',
        allergies: ['Penicillin'],
        medications: [],
        prescriptionText: `1. Amlodipine 5mg - Once daily in the morning - 30 days
   Take with or without food. Monitor blood pressure regularly.

2. Metformin 500mg - Twice daily with meals - 30 days
   Take with food to reduce GI side effects. Monitor blood sugar.

3. Atorvastatin 20mg - Once daily at bedtime - 30 days
   For cholesterol management.`,
        diagnosis: 'Hypertension and Type 2 Diabetes',
        safetyWarnings: ['Patient allergic to Penicillin - avoid all penicillin-based antibiotics'],
        encounterDate: new Date().toLocaleDateString(),
        doctorName: 'Dr. Adebayo Oluwaseun, MBBS',
        notes: 'Patient advised on lifestyle modifications: low-salt diet, regular exercise, weight management.',
      }
    },
    {
      token: 'DEMO-002',
      patientId: 'demo-patient-2',
      prescription: {
        patientInitials: 'C.N.',
        patientAge: '28',
        patientGender: 'Female',
        allergies: ['Sulfa drugs'],
        medications: [],
        prescriptionText: `1. Artemether-Lumefantrine (Coartem) 80/480mg - Twice daily - 3 days
   Complete full course. Take with fatty food for better absorption.

2. Paracetamol 1000mg - Three times daily as needed - 5 days
   For fever and body aches. Do not exceed 4g per day.`,
        diagnosis: 'Malaria (confirmed by rapid diagnostic test)',
        safetyWarnings: ['Patient allergic to Sulfa drugs', 'Ensure adequate hydration'],
        encounterDate: new Date().toLocaleDateString(),
        doctorName: 'Dr. David Uhumagho, MBBS',
        notes: 'Patient to return if fever persists after 48 hours. Advised bed rest and plenty of fluids.',
      }
    },
    {
      token: 'DEMO-003',
      patientId: 'demo-patient-3',
      prescription: {
        patientInitials: 'E.M.',
        patientAge: '65',
        patientGender: 'Female',
        allergies: [],
        medications: [],
        prescriptionText: `1. Lisinopril 10mg - Once daily - 30 days
   May cause dry cough. Report if persistent. Monitor blood pressure.

2. Aspirin 75mg - Once daily after breakfast - 30 days
   For cardiovascular protection. Take with food.

3. Omeprazole 20mg - Once daily before breakfast - 14 days
   Take 30 minutes before meals for gastric protection.`,
        diagnosis: 'Hypertension with history of gastritis',
        safetyWarnings: ['Elderly patient - monitor for orthostatic hypotension'],
        encounterDate: new Date().toLocaleDateString(),
        doctorName: 'Dr. Adebayo Oluwaseun, MBBS',
        notes: 'Patient counseled on medication compliance and lifestyle changes. Follow-up in 2 weeks.',
      }
    }
  ];

  demoTokens.forEach(demo => {
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year expiry for demo
    tokens.set(demo.token, {
      patientId: demo.patientId,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
    });
    prescriptionData.set(demo.token, demo.prescription);
  });

  console.log('✅ Demo tokens seeded:', demoTokens.map(d => d.token).join(', '));
}

// Seed demo tokens on startup
seedDemoTokens();

// Simple auth middleware for token generation/revocation
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  req.user = { id: '1', role: 'doctor' };
  next();
};

// POST /api/pharmacy/generate-token (requires auth)
router.post('/generate-token', authMiddleware, async (req, res) => {
  try {
    const { patientId, prescriptionDetails } = req.body;

    if (!patientId) {
      return res.status(400).json({
        status: 'error',
        error: 'Patient ID is required',
      });
    }

    // Generate simple token
    const token = `MS-RX-P${patientId}${Date.now().toString(36).toUpperCase()}`;
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

    // Store token
    tokens.set(token, {
      patientId,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
    });

    // Store prescription details if provided
    if (prescriptionDetails) {
      prescriptionData.set(token, {
        ...prescriptionDetails,
        createdAt: new Date().toISOString(),
      });
    }

    res.json({
      status: 'success',
      token,
      expiresAt: expiresAt.toISOString(),
      qrCodeUrl: `http://localhost:5173/pharmacy/${token}`, // Frontend URL
    });
  } catch (error) {
    console.error('Token generation error:', error.message);
    res.status(500).json({
      status: 'error',
      error: 'Failed to generate token',
      details: error.message,
    });
  }
});

// POST /api/pharmacy/revoke-token (requires auth)
router.post('/revoke-token', authMiddleware, async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        status: 'error',
        error: 'Token is required',
      });
    }

    // Add to revoked set
    revokedTokens.add(token);

    // Remove from active tokens
    tokens.delete(token);

    res.json({
      status: 'success',
      message: 'Token revoked successfully',
    });
  } catch (error) {
    console.error('Token revocation error:', error.message);
    res.status(500).json({
      status: 'error',
      error: 'Failed to revoke token',
      details: error.message,
    });
  }
});

// GET /api/pharmacy/demo-tokens - Get list of demo tokens for easy testing
router.get('/demo-tokens', async (req, res) => {
  try {
    const demoTokensList = [];

    for (const [token, tokenData] of tokens.entries()) {
      if (token.startsWith('DEMO-')) {
        const prescription = prescriptionData.get(token);
        demoTokensList.push({
          token,
          url: `http://localhost:5173/pharmacy/${token}`,
          patient: prescription ? prescription.patientInitials : 'Unknown',
          diagnosis: prescription ? prescription.diagnosis : 'N/A',
          expiresAt: tokenData.expiresAt
        });
      }
    }

    res.json({
      status: 'success',
      count: demoTokensList.length,
      demo_tokens: demoTokensList
    });
  } catch (error) {
    console.error('Demo tokens list error:', error.message);
    res.status(500).json({
      status: 'error',
      error: 'Failed to fetch demo tokens',
    });
  }
});

// GET /api/pharmacy/prescription/:token (public - no auth required)
router.get('/prescription/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Check if token is revoked
    if (revokedTokens.has(token)) {
      return res.status(410).json({
        status: 'error',
        error: 'Token has been revoked',
      });
    }

    // Check if token exists
    const tokenData = tokens.get(token);
    if (!tokenData) {
      return res.status(404).json({
        status: 'error',
        error: 'Invalid or expired token',
      });
    }

    // Check if token is expired
    if (new Date() > new Date(tokenData.expiresAt)) {
      tokens.delete(token);
      return res.status(404).json({
        status: 'error',
        error: 'Token has expired',
      });
    }

    // Fetch patient data from DORRA (using mock data for demo)
    // In production, fetch from DORRA API using tokenData.patientId

    // Get stored prescription data if available
    const storedPrescription = prescriptionData.get(token);

    let prescription;

    if (storedPrescription) {
      // Use stored prescription data
      prescription = {
        patient: {
          initials: storedPrescription.patientInitials || 'N/A',
          age: storedPrescription.patientAge || 'N/A',
          gender: storedPrescription.patientGender || 'N/A',
          allergies: storedPrescription.allergies || [],
        },
        medications: storedPrescription.medications || [],
        prescriptionText: storedPrescription.prescriptionText || '',
        diagnosis: storedPrescription.diagnosis || '',
        safetyWarnings: storedPrescription.safetyWarnings || [],
        encounterDate: storedPrescription.encounterDate || new Date().toLocaleDateString(),
        prescribedBy: storedPrescription.doctorName || 'Dr. Unknown',
        tokenExpiry: tokenData.expiresAt,
        notes: storedPrescription.notes || '',
      };
    } else {
      // Fallback: Mock prescription data
      prescription = {
        patient: {
          initials: 'G.O.',
          age: '35',
          gender: 'Female',
          allergies: ['Sulfa drugs', 'Penicillin'],
        },
        medications: [
          {
            name: 'Amoxicillin',
            dosage: '500mg',
            frequency: 'Three times daily',
            duration: '7 days',
          },
          {
            name: 'Ibuprofen',
            dosage: '400mg',
            frequency: 'As needed for pain',
            duration: '5 days',
          },
        ],
        safetyWarnings: [
          'Patient is allergic to Penicillin - verify medication compatibility',
          'Check for drug interactions before dispensing',
        ],
        encounterDate: new Date().toLocaleDateString(),
        prescribedBy: 'Dr. Adebayo Oluwaseun, MBBS',
        tokenExpiry: tokenData.expiresAt,
      };
    }

    res.json(prescription);
  } catch (error) {
    console.error('Prescription fetch error:', error.message);
    res.status(500).json({
      status: 'error',
      error: 'Failed to fetch prescription',
      details: error.message,
    });
  }
});

module.exports = router;
