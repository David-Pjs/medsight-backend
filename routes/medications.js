const express = require('express');
const axios = require('axios');

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

// Note: Based on the DORRA API spec, medications are accessed via /v1/patients/{id}/medications
// This route is primarily a placeholder for future direct medication endpoints if they become available

router.get('/', async (req, res) => {
  res.status(200).json({
    message: 'To access medications, use /api/patients/{patientId}/medications',
    note: 'Medications are scoped to patients in the DORRA API'
  });
});

module.exports = router;
