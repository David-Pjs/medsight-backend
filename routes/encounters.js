const express = require('express');
const axios = require('axios');
const localData = require('../data/localData');

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

// GET all encounters - combines DORRA + local encounters
router.get('/', async (req, res) => {
  try {
    const { ordering, page, search } = req.query;
    const params = {};
    if (ordering) params.ordering = ordering;
    if (page) params.page = page;
    if (search) params.search = search;

    // Try to get from DORRA first
    let dorraEncounters = [];
    try {
      const response = await dorraClient.get('/v1/encounters', { params });
      dorraEncounters = response.data.results || [];
    } catch (err) {
      console.log('DORRA encounters unavailable, using local only');
    }

    // Combine with local encounters
    const allEncounters = [...localData.getEncounters(), ...dorraEncounters];

    res.json({
      count: allEncounters.length,
      results: allEncounters
    });
  } catch (error) {
    console.error('Error fetching encounters:', error.message);
    res.status(500).json({
      error: 'Failed to fetch encounters',
      details: error.message,
    });
  }
});

// GET single encounter by ID
router.get('/:id', async (req, res) => {
  try {
    // Check local first
    const localEncounter = localData.getEncounterById(req.params.id);
    if (localEncounter) {
      return res.json(localEncounter);
    }

    // Try DORRA
    const response = await dorraClient.get(`/v1/encounters/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching encounter:', error.message);
    res.status(error.response?.status || 404).json({
      error: 'Failed to fetch encounter',
      details: error.message,
    });
  }
});

// CREATE encounter (local storage for demo)
router.post('/create', async (req, res) => {
  try {
    const {
      patientId,
      diagnosis,
      symptoms,
      chiefComplaint,
      visitType,
      notes,
      encounterDate,
      medications
    } = req.body;

    // Create encounter
    const encounterData = {
      patient: patientId,
      patient_id: patientId,
      diagnosis,
      symptoms,
      chief_complaint: chiefComplaint,
      visit_type: visitType,
      notes,
      encounter_date: encounterDate || new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString()
    };

    const newEncounter = localData.addEncounter(encounterData);

    // Create medications if provided
    if (medications && Array.isArray(medications)) {
      medications.forEach(med => {
        const medData = {
          patient: patientId,
          patient_id: patientId,
          encounter: newEncounter.id,
          encounter_id: newEncounter.id,
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration,
          prescribed_date: encounterDate || new Date().toISOString().split('T')[0],
          status: 'Active'
        };
        localData.addMedication(medData);
      });
    }

    res.status(201).json({
      status: 'success',
      encounter: newEncounter,
      medicationsCreated: medications?.length || 0
    });
  } catch (error) {
    console.error('Error creating encounter:', error.message);
    res.status(500).json({
      error: 'Failed to create encounter',
      message: error.message
    });
  }
});

module.exports = router;
