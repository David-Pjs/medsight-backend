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

// GET all patients - /v1/patients
router.get('/', async (req, res) => {
  try {
    const { ordering, page, search } = req.query;
    const params = {};
    if (ordering) params.ordering = ordering;
    if (page) params.page = page;
    if (search) params.search = search;

    const response = await dorraClient.get('/v1/patients', { params });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching patients:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch patients',
      details: error.response?.data || error.message,
    });
  }
});

// GET single patient by ID - /v1/patients/{id}
router.get('/:id', async (req, res) => {
  try {
    const response = await dorraClient.get(`/v1/patients/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching patient:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch patient',
      details: error.response?.data || error.message,
    });
  }
});

// POST create new patient - /v1/patients/create
router.post('/create', async (req, res) => {
  try {
    const response = await dorraClient.post('/v1/patients/create', req.body);
    res.status(201).json(response.data);
  } catch (error) {
    console.error('Error creating patient:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to create patient',
      details: error.response?.data || error.message,
    });
  }
});

// PATCH update patient - /v1/patients/{id}
router.patch('/:id', async (req, res) => {
  try {
    const response = await dorraClient.patch(`/v1/patients/${req.params.id}`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error('Error updating patient:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to update patient',
      details: error.response?.data || error.message,
    });
  }
});

// DELETE patient - /v1/patients/{id}
router.delete('/:id', async (req, res) => {
  try {
    const response = await dorraClient.delete(`/v1/patients/${req.params.id}`);
    res.status(204).json(response.data);
  } catch (error) {
    console.error('Error deleting patient:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to delete patient',
      details: error.response?.data || error.message,
    });
  }
});

// GET patient encounters - /v1/patients/{id}/encounters (combines DORRA + local)
router.get('/:id/encounters', async (req, res) => {
  try {
    const { ordering, page, search } = req.query;
    const params = {};
    if (ordering) params.ordering = ordering;
    if (page) params.page = page;
    if (search) params.search = search;

    // Get local encounters
    const localEncounters = localData.getEncountersByPatient(req.params.id);

    // Try to get DORRA encounters
    let dorraEncounters = [];
    try {
      const response = await dorraClient.get(`/v1/patients/${req.params.id}/encounters`, { params });
      dorraEncounters = response.data.results || [];
    } catch (err) {
      console.log('DORRA patient encounters unavailable, using local only');
    }

    const allEncounters = [...localEncounters, ...dorraEncounters];

    res.json({
      count: allEncounters.length,
      results: allEncounters
    });
  } catch (error) {
    console.error('Error fetching patient encounters:', error.message);
    res.status(500).json({
      error: 'Failed to fetch patient encounters',
      details: error.message,
    });
  }
});

// GET patient medications - /v1/patients/{id}/medications (combines DORRA + local)
router.get('/:id/medications', async (req, res) => {
  try {
    const { ordering, page, search, created_at__date, patient } = req.query;
    const params = {};
    if (ordering) params.ordering = ordering;
    if (page) params.page = page;
    if (search) params.search = search;
    if (created_at__date) params.created_at__date = created_at__date;
    if (patient) params.patient = patient;

    // Get local medications
    const localMeds = localData.getMedicationsByPatient(req.params.id);

    // Try to get DORRA medications
    let dorraMeds = [];
    try {
      const response = await dorraClient.get(`/v1/patients/${req.params.id}/medications`, { params });
      dorraMeds = response.data.results || [];
    } catch (err) {
      console.log('DORRA patient medications unavailable, using local only');
    }

    const allMedications = [...localMeds, ...dorraMeds];

    res.json({
      count: allMedications.length,
      results: allMedications
    });
  } catch (error) {
    console.error('Error fetching patient medications:', error.message);
    res.status(500).json({
      error: 'Failed to fetch patient medications',
      details: error.message,
    });
  }
});

// GET patient appointments - /v1/patients/{id}/appointments
router.get('/:id/appointments', async (req, res) => {
  try {
    const { ordering, page, search } = req.query;
    const params = {};
    if (ordering) params.ordering = ordering;
    if (page) params.page = page;
    if (search) params.search = search;

    const response = await dorraClient.get(`/v1/patients/${req.params.id}/appointments`, { params });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching patient appointments:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch patient appointments',
      details: error.response?.data || error.message,
    });
  }
});

// GET patient tests - /v1/patients/{id}/tests
router.get('/:id/tests', async (req, res) => {
  try {
    const { ordering, page, search, created_at__date, patient } = req.query;
    const params = {};
    if (ordering) params.ordering = ordering;
    if (page) params.page = page;
    if (search) params.search = search;
    if (created_at__date) params.created_at__date = created_at__date;
    if (patient) params.patient = patient;

    const response = await dorraClient.get(`/v1/patients/${req.params.id}/tests`, { params });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching patient tests:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch patient tests',
      details: error.response?.data || error.message,
    });
  }
});

module.exports = router;
