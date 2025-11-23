const express = require('express');
const axios = require('axios');
const { analyzeMedicationSafety, checkDrugInteractions } = require('../services/aiService');

const router = express.Router();

const DORRA_API_BASE_URL = process.env.DORRA_API_BASE_URL || 'https://hackathon-api.aheadafrica.org';
const DORRA_API_TOKEN = process.env.DORRA_API_TOKEN;

const dorraClient = axios.create({
  baseURL: DORRA_API_BASE_URL,
  headers: {
    Authorization: `Token ${DORRA_API_TOKEN}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Check medication safety for a patient
router.post('/check/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;

    // Fetch patient data
    const patientResponse = await dorraClient.get(`/v1/patients/${patientId}`);
    const patient = patientResponse.data;

    // Fetch patient medications
    const medsResponse = await dorraClient.get(`/v1/patients/${patientId}/medications`);
    const medications = medsResponse.data.results || [];

    // Perform AI-powered safety analysis
    const safetyAnalysis = await analyzeMedicationSafety(patient, medications);

    res.json({
      status: 'success',
      patient: {
        id: patient.id,
        name: `${patient.first_name} ${patient.last_name}`,
        age: patient.age,
        gender: patient.gender
      },
      medicationCount: medications.length,
      ...safetyAnalysis
    });
  } catch (error) {
    console.error('Safety check error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      status: 'error',
      error: 'Failed to perform safety check',
      details: error.response?.data || error.message
    });
  }
});

// Check drug interactions
router.post('/interactions', async (req, res) => {
  try {
    const { medications } = req.body;

    if (!medications || !Array.isArray(medications) || medications.length === 0) {
      return res.status(400).json({
        status: 'error',
        error: 'Please provide an array of medications'
      });
    }

    const interactionCheck = await checkDrugInteractions(medications);

    res.json({
      status: 'success',
      medicationCount: medications.length,
      ...interactionCheck
    });
  } catch (error) {
    console.error('Interaction check error:', error.message);
    res.status(500).json({
      status: 'error',
      error: 'Failed to check interactions',
      details: error.message
    });
  }
});

// Get safety alerts summary for all patients
router.get('/alerts', async (req, res) => {
  try {
    // Fetch all patients
    const patientsResponse = await dorraClient.get('/v1/patients');
    const patients = patientsResponse.data.results || [];

    // Count high-risk patients (those with many medications or allergies)
    const highRiskPatients = patients.filter(p =>
      (p.allergies && p.allergies.length > 0)
    );

    res.json({
      status: 'success',
      summary: {
        totalPatients: patients.length,
        highRiskPatients: highRiskPatients.length,
        patientsWithAllergies: highRiskPatients.length,
        recentAlerts: []
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Alerts fetch error:', error.message);
    res.status(500).json({
      status: 'error',
      error: 'Failed to fetch alerts',
      details: error.message
    });
  }
});

module.exports = router;
