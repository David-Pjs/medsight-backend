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

// GET all appointments - /v1/appointments
router.get('/', async (req, res) => {
  try {
    const { ordering, page, search } = req.query;
    const params = {};
    if (ordering) params.ordering = ordering;
    if (page) params.page = page;
    if (search) params.search = search;

    const response = await dorraClient.get('/v1/appointments', { params });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching appointments:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch appointments',
      details: error.response?.data || error.message,
    });
  }
});

// GET single appointment by ID - /v1/appointments/{id}
router.get('/:id', async (req, res) => {
  try {
    const response = await dorraClient.get(`/v1/appointments/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching appointment:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch appointment',
      details: error.response?.data || error.message,
    });
  }
});

// PATCH update appointment - /v1/appointments/{id}
router.patch('/:id', async (req, res) => {
  try {
    const response = await dorraClient.patch(`/v1/appointments/${req.params.id}`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error('Error updating appointment:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to update appointment',
      details: error.response?.data || error.message,
    });
  }
});

// DELETE appointment - /v1/appointments/{id}
router.delete('/:id', async (req, res) => {
  try {
    await dorraClient.delete(`/v1/appointments/${req.params.id}`);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting appointment:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to delete appointment',
      details: error.response?.data || error.message,
    });
  }
});

module.exports = router;
