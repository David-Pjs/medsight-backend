const express = require('express');
const router = express.Router();

// In-memory storage for ADR reports (for MVP)
// In production, this would be in a database
let adrReports = [];
let adrIdCounter = 1;

// GET all ADR reports
router.get('/', async (req, res) => {
  try {
    // Sort by creation date, newest first
    const sortedReports = [...adrReports].sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json({
      status: 'success',
      count: adrReports.length,
      reports: sortedReports
    });
  } catch (error) {
    console.error('Error fetching ADR reports:', error.message);
    res.status(500).json({
      status: 'error',
      error: 'Failed to fetch ADR reports'
    });
  }
});

// GET single ADR report
router.get('/:id', async (req, res) => {
  try {
    const report = adrReports.find(r => r.id === parseInt(req.params.id));

    if (!report) {
      return res.status(404).json({
        status: 'error',
        error: 'ADR report not found'
      });
    }

    res.json({
      status: 'success',
      report
    });
  } catch (error) {
    console.error('Error fetching ADR report:', error.message);
    res.status(500).json({
      status: 'error',
      error: 'Failed to fetch ADR report'
    });
  }
});

// POST create new ADR report
router.post('/', async (req, res) => {
  try {
    const {
      patientId,
      patientName,
      suspectedDrug,
      reaction,
      onset,
      severity,
      outcome,
      seriousness,
      notes,
      reportedBy
    } = req.body;

    // Validation
    if (!patientId || !suspectedDrug || !reaction) {
      return res.status(400).json({
        status: 'error',
        error: 'Required fields: patientId, suspectedDrug, reaction'
      });
    }

    const newReport = {
      id: adrIdCounter++,
      patientId,
      patientName: patientName || `Patient ${patientId}`,
      suspectedDrug,
      reaction,
      onset: onset || null,
      severity: severity || 'Unknown',
      outcome: outcome || 'Unknown',
      seriousness: seriousness || 'Non-serious',
      notes: notes || '',
      reportedBy: reportedBy || 'Unknown Doctor',
      status: 'Submitted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    adrReports.push(newReport);

    res.status(201).json({
      status: 'success',
      message: 'ADR report created successfully',
      report: newReport
    });
  } catch (error) {
    console.error('Error creating ADR report:', error.message);
    res.status(500).json({
      status: 'error',
      error: 'Failed to create ADR report',
      details: error.message
    });
  }
});

// PATCH update ADR report
router.patch('/:id', async (req, res) => {
  try {
    const reportIndex = adrReports.findIndex(r => r.id === parseInt(req.params.id));

    if (reportIndex === -1) {
      return res.status(404).json({
        status: 'error',
        error: 'ADR report not found'
      });
    }

    // Update report
    adrReports[reportIndex] = {
      ...adrReports[reportIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    res.json({
      status: 'success',
      message: 'ADR report updated successfully',
      report: adrReports[reportIndex]
    });
  } catch (error) {
    console.error('Error updating ADR report:', error.message);
    res.status(500).json({
      status: 'error',
      error: 'Failed to update ADR report'
    });
  }
});

// DELETE ADR report
router.delete('/:id', async (req, res) => {
  try {
    const reportIndex = adrReports.findIndex(r => r.id === parseInt(req.params.id));

    if (reportIndex === -1) {
      return res.status(404).json({
        status: 'error',
        error: 'ADR report not found'
      });
    }

    adrReports.splice(reportIndex, 1);

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting ADR report:', error.message);
    res.status(500).json({
      status: 'error',
      error: 'Failed to delete ADR report'
    });
  }
});

// GET ADR statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const totalReports = adrReports.length;
    const seriousReports = adrReports.filter(r => r.seriousness === 'Serious').length;
    const recentReports = adrReports.filter(r => {
      const reportDate = new Date(r.createdAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return reportDate >= thirtyDaysAgo;
    }).length;

    // Count by severity
    const bySeverity = adrReports.reduce((acc, report) => {
      acc[report.severity] = (acc[report.severity] || 0) + 1;
      return acc;
    }, {});

    res.json({
      status: 'success',
      statistics: {
        totalReports,
        seriousReports,
        recentReports,
        bySeverity
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching ADR statistics:', error.message);
    res.status(500).json({
      status: 'error',
      error: 'Failed to fetch statistics'
    });
  }
});

module.exports = router;
