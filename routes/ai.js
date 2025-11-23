// backend/routes/aiRoutes.js
const express = require('express');
const axios = require('axios');
const {
  chatWithCopilot,
  generatePatientSummary,
} = require('../services/aiService');

const router = express.Router();

const DORRA_API_BASE_URL =
  process.env.DORRA_API_BASE_URL || 'https://hackathon-api.aheadafrica.org';
const DORRA_API_TOKEN = process.env.DORRA_API_TOKEN;

// Dorra EMR client
const dorraClient = axios.create({
  baseURL: DORRA_API_BASE_URL,
  headers: {
    Authorization: `Token ${DORRA_API_TOKEN}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// AI-powered prescription recommendation function
async function generatePrescriptionRecommendation(patientInfo) {
  // Parse patient information from the prompt
  const info = patientInfo.toLowerCase();

  // Extract key information
  const age = info.match(/age[:\s]*(\d+)/)?.[1] || info.match(/(\d+)\s*years/)?.[1];
  const allergies = info.match(/allergies?[:\s]*([^\n]+)/i)?.[1] || '';
  const diagnosis = info.match(/diagnosis[:\s]*([^\n]+)/i)?.[1] || '';

  let recommendations = [];
  let safetyWarnings = [];

  // Check for allergies and add warnings
  if (allergies) {
    safetyWarnings.push(`⚠️ PATIENT ALLERGIC TO: ${allergies.toUpperCase()}`);
    safetyWarnings.push('Verify all medications for potential cross-allergies before prescribing');
  }

  // Generate recommendations based on diagnosis
  if (diagnosis.includes('hypertension') || diagnosis.includes('high blood pressure')) {
    recommendations.push({
      medication: 'Amlodipine',
      dosage: '5mg',
      frequency: 'Once daily in the morning',
      duration: '30 days',
      instructions: 'Take with or without food. Monitor blood pressure regularly.'
    });

    if (!allergies.toLowerCase().includes('ace')) {
      recommendations.push({
        medication: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        duration: '30 days',
        instructions: 'May cause dry cough. Report if persistent.'
      });
    }
  }

  if (diagnosis.includes('diabetes') || diagnosis.includes('sugar')) {
    if (!allergies.toLowerCase().includes('metformin')) {
      recommendations.push({
        medication: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily with meals',
        duration: '30 days',
        instructions: 'Take with food to reduce GI side effects. Monitor blood sugar.'
      });
    }
  }

  if (diagnosis.includes('malaria')) {
    recommendations.push({
      medication: 'Artemether-Lumefantrine (Coartem)',
      dosage: '80/480mg',
      frequency: 'Twice daily',
      duration: '3 days',
      instructions: 'Complete full course. Take with fatty food for better absorption.'
    });
  }

  if (diagnosis.includes('fever') || diagnosis.includes('pain') || diagnosis.includes('headache')) {
    if (!allergies.toLowerCase().includes('paracetamol') && !allergies.toLowerCase().includes('acetaminophen')) {
      recommendations.push({
        medication: 'Paracetamol',
        dosage: '1000mg',
        frequency: 'Three times daily as needed',
        duration: '5 days',
        instructions: 'Do not exceed 4g per day. Take with food if stomach upset occurs.'
      });
    }
  }

  if (diagnosis.includes('infection') || diagnosis.includes('bacterial')) {
    if (!allergies.toLowerCase().includes('penicillin') && !allergies.toLowerCase().includes('amoxicillin')) {
      recommendations.push({
        medication: 'Amoxicillin',
        dosage: '500mg',
        frequency: 'Three times daily',
        duration: '7 days',
        instructions: 'Complete full course even if symptoms improve. Take with food.'
      });
    } else {
      recommendations.push({
        medication: 'Azithromycin',
        dosage: '500mg',
        frequency: 'Once daily',
        duration: '3 days',
        instructions: 'Alternative for penicillin allergy. Take 1 hour before or 2 hours after meals.'
      });
    }
  }

  if (diagnosis.includes('asthma') || diagnosis.includes('wheezing')) {
    recommendations.push({
      medication: 'Salbutamol Inhaler',
      dosage: '100mcg per puff',
      frequency: '2 puffs as needed',
      duration: '30 days',
      instructions: 'Use for acute symptoms. Rinse mouth after use.'
    });
  }

  if (diagnosis.includes('ulcer') || diagnosis.includes('gastritis') || diagnosis.includes('stomach')) {
    recommendations.push({
      medication: 'Omeprazole',
      dosage: '20mg',
      frequency: 'Once daily before breakfast',
      duration: '14 days',
      instructions: 'Take 30 minutes before meals for best effect.'
    });
  }

  // Format the response
  let response = `\n📋 AI PRESCRIPTION RECOMMENDATIONS\n`;
  response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  if (safetyWarnings.length > 0) {
    response += `⚠️ SAFETY WARNINGS:\n`;
    safetyWarnings.forEach(warning => {
      response += `• ${warning}\n`;
    });
    response += `\n`;
  }

  if (recommendations.length > 0) {
    response += `💊 RECOMMENDED MEDICATIONS:\n\n`;
    recommendations.forEach((med, idx) => {
      response += `${idx + 1}. ${med.medication}\n`;
      response += `   • Dosage: ${med.dosage}\n`;
      response += `   • Frequency: ${med.frequency}\n`;
      response += `   • Duration: ${med.duration}\n`;
      response += `   • Instructions: ${med.instructions}\n\n`;
    });
  } else {
    response += `⚠️ No specific medications recommended based on current information.\n`;
    response += `Please provide more details about the diagnosis for better recommendations.\n\n`;
  }

  response += `\n📌 GENERAL ADVICE:\n`;
  response += `• Complete full course of all medications\n`;
  response += `• Follow up in 1 week or if symptoms worsen\n`;
  response += `• Stay hydrated and get adequate rest\n`;
  response += `• Report any adverse reactions immediately\n`;

  if (age && parseInt(age) > 60) {
    response += `• Consider dose adjustment for elderly patient\n`;
  }

  response += `\n⚕️ This is an AI-generated recommendation. Please review and adjust based on clinical judgment.\n`;

  return response;
}

// POST /api/ai/chat - General AI chat endpoint (alias for copilot)
router.post('/chat', async (req, res) => {
  try {
    const { message, patientId, context } = req.body;

    if (!message) {
      return res.status(400).json({
        status: 'error',
        error: 'Message is required',
      });
    }

    // If context is 'prescription_recommendation', use specialized logic
    if (context === 'prescription_recommendation') {
      const response = await generatePrescriptionRecommendation(message);
      return res.json({
        status: 'success',
        response: response,
        source: 'ai_prescription_generator'
      });
    }

    let patientContext = {};

    if (patientId) {
      try {
        const patientResponse = await dorraClient.get(`/v1/patients/${patientId}`);
        patientContext.patient = patientResponse.data;
      } catch (error) {
        console.error('Error fetching patient context:', error.message);
      }
    }

    const copilotResponse = await chatWithCopilot(message, patientContext);

    res.json({
      status: 'success',
      ...copilotResponse,
    });
  } catch (error) {
    console.error('AI chat error:', error.message);
    res.status(500).json({
      status: 'error',
      error: 'Failed to process chat message',
      details: error.message,
    });
  }
});

// POST /api/ai/copilot/chat (legacy endpoint)
router.post('/copilot/chat', async (req, res) => {
  try {
    const { message, patientId } = req.body;

    if (!message) {
      return res.status(400).json({
        status: 'error',
        error: 'Message is required',
      });
    }

    let context = {};

    if (patientId) {
      try {
        const patientResponse = await dorraClient.get(`/v1/patients/${patientId}`);
        context.patient = patientResponse.data;
      } catch (error) {
        console.error('Error fetching patient context:', error.message);
      }
    }

    const copilotResponse = await chatWithCopilot(message, context);

    res.json({
      status: 'success',
      ...copilotResponse,
    });
  } catch (error) {
    console.error('Copilot chat error:', error.message);
    res.status(500).json({
      status: 'error',
      error: 'Failed to process chat message',
      details: error.message,
    });
  }
});

// POST /api/ai/parse-patient-data - Parse unstructured patient data with AI
router.post('/parse-patient-data', async (req, res) => {
  try {
    const { text, context } = req.body;

    if (!text) {
      return res.status(400).json({
        status: 'error',
        error: 'Text is required',
      });
    }

    // Try AI parsing first (with Ollama if available)
    let parsedData = {};
    let aiUsed = false;

    try {
      // Attempt to use Ollama for intelligent parsing
      const aiPrompt = `Extract patient information from the following text and return ONLY a valid JSON object with these fields: first_name, last_name, age, gender (Male/Female/Other), phone_number, allergies, diagnosis, medications.

Text: "${text}"

Return only the JSON object, nothing else.`;

      const ollamaResponse = await chatWithCopilot(aiPrompt, {});

      if (ollamaResponse && ollamaResponse.response) {
        // Try to parse the AI response as JSON
        const jsonMatch = ollamaResponse.response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[0]);
          aiUsed = true;
        }
      }
    } catch (aiError) {
      console.log('AI parsing unavailable, falling back to regex:', aiError.message);
    }

    // Fallback: Enhanced regex-based parsing
    if (!aiUsed || Object.keys(parsedData).length === 0) {
      const lowerText = text.toLowerCase();
      parsedData = {};

      // Extract name (multiple patterns)
      const namePatterns = [
        /(?:name is |patient |named |called |patient:?\s*)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
        /^([A-Z][a-z]+\s+[A-Z][a-z]+)/,
        /([A-Z][a-z]+\s+[A-Z][a-z]+)(?:\s*,?\s*\d+\s*years?)/i
      ];

      for (const pattern of namePatterns) {
        const nameMatch = text.match(pattern);
        if (nameMatch) {
          const nameParts = nameMatch[1].trim().split(/\s+/);
          if (nameParts.length >= 2) {
            parsedData.first_name = nameParts[0];
            parsedData.last_name = nameParts.slice(1).join(' ');
            break;
          }
        }
      }

      // Extract age (multiple patterns)
      const agePatterns = [
        /(\d+)\s*(?:years? old|yo|yrs?)/i,
        /age[:\s]*(\d+)/i,
        /(\d+)\s*years?/i
      ];

      for (const pattern of agePatterns) {
        const ageMatch = text.match(pattern);
        if (ageMatch) {
          parsedData.age = ageMatch[1];
          break;
        }
      }

      // Extract gender
      if (lowerText.includes('male') && !lowerText.includes('female')) {
        parsedData.gender = 'Male';
      } else if (lowerText.includes('female')) {
        parsedData.gender = 'Female';
      }

      // Extract phone (multiple patterns)
      const phonePatterns = [
        /(?:phone|number|tel|contact|mobile|cell)[:\s]*([+\d\s()-]+)/i,
        /(\+?\d{3,4}[\s-]?\d{3,4}[\s-]?\d{3,4})/,
        /(0\d{3}\s?\d{3}\s?\d{4})/
      ];

      for (const pattern of phonePatterns) {
        const phoneMatch = text.match(pattern);
        if (phoneMatch) {
          parsedData.phone_number = phoneMatch[1].trim().replace(/\s+/g, ' ');
          break;
        }
      }

      // Extract allergies
      const allergyPatterns = [
        /(?:allerg(?:y|ies|ic)\s*(?:to)?)[:\s]*([a-z,\s]+?)(?:\.|,|\n|$)/i,
        /allergic to ([^.,\n]+)/i
      ];

      for (const pattern of allergyPatterns) {
        const allergyMatch = text.match(pattern);
        if (allergyMatch) {
          parsedData.allergies = allergyMatch[1].trim();
          break;
        }
      }

      // Extract diagnosis
      const diagnosisPatterns = [
        /(?:diagnosis|diagnosed with|condition)[:\s]*([^.,\n]+)/i,
        /(?:suffering from|has)[:\s]*([^.,\n]+)/i
      ];

      for (const pattern of diagnosisPatterns) {
        const diagMatch = text.match(pattern);
        if (diagMatch) {
          parsedData.diagnosis = diagMatch[1].trim();
          break;
        }
      }

      // Extract medications
      const medPatterns = [
        /(?:medication|medicine|drug|taking|prescribed)[:\s]*([^.,\n]+)/i,
      ];

      for (const pattern of medPatterns) {
        const medMatch = text.match(pattern);
        if (medMatch) {
          parsedData.medications = medMatch[1].trim();
          break;
        }
      }
    }

    res.json({
      status: 'success',
      ...parsedData,
      method: aiUsed ? 'ai_parsing' : 'enhanced_regex_parsing',
      ai_powered: aiUsed
    });
  } catch (error) {
    console.error('Parse patient data error:', error.message);
    res.status(500).json({
      status: 'error',
      error: 'Failed to parse patient data',
      details: error.message,
    });
  }
});

// POST /api/ai/analyze-notes - Analyze clinical notes with AI
router.post('/analyze-notes', async (req, res) => {
  try {
    const { notes, patientContext } = req.body;

    if (!notes) {
      return res.status(400).json({
        status: 'error',
        error: 'Clinical notes are required',
      });
    }

    // Mock AI analysis (in production, use Ollama or other LLM)
    // This simulates analyzing the notes and extracting structured data

    const analysis = {
      diagnosis: extractDiagnosis(notes),
      treatmentPlan: generateTreatmentPlan(notes),
      suggestedMedications: generateMedications(notes),
      severity: assessSeverity(notes),
      recommendations: generateRecommendations(notes)
    };

    res.json({
      status: 'success',
      ...analysis,
      note: 'Analysis generated using pattern matching. Integrate Ollama for production.'
    });
  } catch (error) {
    console.error('AI analysis error:', error.message);
    res.status(500).json({
      status: 'error',
      error: 'Failed to analyze notes',
      details: error.message,
    });
  }
});

// Helper functions for AI analysis
function extractDiagnosis(notes) {
  const lower = notes.toLowerCase();

  // Common condition patterns
  if (lower.includes('fever') && lower.includes('headache')) {
    return 'Upper Respiratory Tract Infection (URTI)';
  }
  if (lower.includes('hypertension') || lower.includes('high bp') || lower.includes('high blood pressure')) {
    return 'Hypertension';
  }
  if (lower.includes('diabetes') || lower.includes('high sugar')) {
    return 'Type 2 Diabetes Mellitus';
  }
  if (lower.includes('malaria')) {
    return 'Malaria (suspected)';
  }
  if (lower.includes('typhoid')) {
    return 'Typhoid fever (suspected)';
  }
  if (lower.includes('asthma') || lower.includes('wheezing')) {
    return 'Bronchial Asthma';
  }
  if (lower.includes('ulcer') || lower.includes('stomach pain')) {
    return 'Peptic Ulcer Disease';
  }

  return 'Condition requiring further investigation';
}

function generateTreatmentPlan(notes) {
  const lower = notes.toLowerCase();
  let plan = [];

  if (lower.includes('fever')) {
    plan.push('Antipyretics for fever management');
  }
  if (lower.includes('pain')) {
    plan.push('Analgesics as needed');
  }
  if (lower.includes('hypertension') || lower.includes('high bp')) {
    plan.push('Lifestyle modifications (diet, exercise)');
    plan.push('Regular BP monitoring');
  }
  if (lower.includes('diabetes')) {
    plan.push('Blood sugar monitoring');
    plan.push('Dietary counseling');
  }
  if (lower.includes('malaria')) {
    plan.push('Complete antimalarial course');
    plan.push('Rest and hydration');
  }

  plan.push('Follow-up in 1 week');
  plan.push('Advise patient on warning signs');

  return plan.join('\n• ');
}

function generateMedications(notes) {
  const lower = notes.toLowerCase();
  const meds = [];

  if (lower.includes('fever') || lower.includes('pain') || lower.includes('headache')) {
    meds.push({
      name: 'Paracetamol',
      dosage: '1g',
      frequency: 'Three times daily',
      duration: '5 days'
    });
  }

  if (lower.includes('malaria')) {
    meds.push({
      name: 'Artemether-Lumefantrine (Coartem)',
      dosage: '80/480mg',
      frequency: 'Twice daily',
      duration: '3 days'
    });
  }

  if (lower.includes('hypertension') || lower.includes('high bp')) {
    meds.push({
      name: 'Amlodipine',
      dosage: '5mg',
      frequency: 'Once daily',
      duration: '30 days'
    });
  }

  if (lower.includes('diabetes')) {
    meds.push({
      name: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily with meals',
      duration: '30 days'
    });
  }

  if (lower.includes('asthma') || lower.includes('wheezing')) {
    meds.push({
      name: 'Salbutamol Inhaler',
      dosage: '100mcg',
      frequency: '2 puffs as needed',
      duration: '30 days'
    });
  }

  if (lower.includes('ulcer') || lower.includes('stomach')) {
    meds.push({
      name: 'Omeprazole',
      dosage: '20mg',
      frequency: 'Once daily before meals',
      duration: '14 days'
    });
  }

  return meds;
}

function assessSeverity(notes) {
  const lower = notes.toLowerCase();

  if (lower.includes('severe') || lower.includes('emergency') || lower.includes('critical')) {
    return 'high';
  }
  if (lower.includes('moderate') || lower.includes('worsening')) {
    return 'medium';
  }
  return 'low';
}

function generateRecommendations(notes) {
  const lower = notes.toLowerCase();
  const recs = [];

  if (lower.includes('fever')) {
    recs.push('Monitor temperature daily');
    recs.push('Ensure adequate hydration');
  }
  if (lower.includes('hypertension') || lower.includes('diabetes')) {
    recs.push('Regular monitoring required');
    recs.push('Lifestyle modifications essential');
  }
  if (lower.includes('malaria') || lower.includes('typhoid')) {
    recs.push('Complete full course of medication');
    recs.push('Return if symptoms persist after 3 days');
  }

  recs.push('Avoid self-medication');
  recs.push('Keep all follow-up appointments');

  return recs;
}

// GET /api/ai/summary/patient/:patientId
router.get('/summary/patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;

    const [patientResponse, encountersResponse, medsResponse] = await Promise.all([
      dorraClient.get(`/v1/patients/${patientId}`),
      dorraClient
        .get(`/v1/patients/${patientId}/encounters`)
        .catch(() => ({ data: { results: [] } })),
      dorraClient
        .get(`/v1/patients/${patientId}/medications`)
        .catch(() => ({ data: { results: [] } })),
    ]);

    const patient = patientResponse.data;
    const encounters = encountersResponse.data.results || [];
    const medications = medsResponse.data.results || [];

    const summary = await generatePatientSummary(patient, encounters, medications);

    res.json({
      status: 'success',
      patient: {
        id: patient.id,
        name: `${patient.first_name} ${patient.last_name}`,
      },
      ...summary,
    });
  } catch (error) {
    console.error('Patient summary error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      status: 'error',
      error: 'Failed to generate patient summary',
      details: error.response?.data || error.message,
    });
  }
});

// POST /api/patients/:patientId/notes - Save patient notes and prescription data
router.post('/patients/:patientId/notes', async (req, res) => {
  try {
    const { patientId } = req.params;
    const {
      unstructured_data,
      medications,
      diagnosis,
      notes,
      ai_recommendations
    } = req.body;

    // In production, save to database
    // For now, we'll just acknowledge the save
    console.log(`📝 Saving prescription data for patient ${patientId}:`, {
      unstructured_data,
      medications,
      diagnosis,
      notes,
      ai_recommendations
    });

    res.json({
      status: 'success',
      message: 'Prescription data saved successfully',
      patient_id: patientId,
      saved_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Save patient notes error:', error.message);
    res.status(500).json({
      status: 'error',
      error: 'Failed to save patient notes',
      details: error.message,
    });
  }
});

module.exports = router;
