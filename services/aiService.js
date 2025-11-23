// backend/services/aiService.js
const axios = require('axios');

/* ------------------------------------------------------------------ */
/*  OLLAMA CLOUD + OPTIONAL OPENAI-STYLE CLOUD FALLBACK                */
/* ------------------------------------------------------------------ */

const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'https://api.ollama.com/v1';
const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY || '';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:latest';

// Ollama Cloud client (OpenAI-compatible)
const ollamaClient = axios.create({
  baseURL: OLLAMA_API_URL,
  headers: {
    'Content-Type': 'application/json',
    ...(OLLAMA_API_KEY ? { Authorization: `Bearer ${OLLAMA_API_KEY}` } : {}),
  },
  timeout: 60000,
});

// Optional generic cloud AI (OpenAI / Together / etc) for extra fallback
const AI_API_URL = process.env.AI_API_URL || '';
const AI_API_KEY = process.env.AI_API_KEY || '';
const AI_MODEL = process.env.AI_MODEL || 'gpt-4o-mini';

let aiClient = null;
if (AI_API_URL && AI_API_KEY) {
  aiClient = axios.create({
    baseURL: AI_API_URL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AI_API_KEY}`,
    },
    timeout: 30000,
  });
}

/* ------------------------------------------------------------------ */
/*  TRANSLATION – NIGERIAN LANGUAGES                                   */
/* ------------------------------------------------------------------ */

// Common medical phrases in Nigerian languages
const PHRASE_BOOK = {
  yoruba: {
    'Good morning': 'Ẹ káàárọ̀',
    'How are you feeling?': 'Báwo ni ìrílárá rẹ?',
    'Take this medicine': 'Mu oògùn yìí',
    'Do you have pain?': 'Ṣé ó ń rọ́ ọ?',
    'Come back tomorrow': 'Padà wá lọ́la',
    headache: 'orí fífọ́',
    'stomach pain': 'ikùn rírun',
    fever: 'ibà',
    cough: 'ikọ̀',
  },
  igbo: {
    'Good morning': 'Ụtụtụ ọma',
    'How are you feeling?': 'Kedụ ka ị na-adị?',
    'Take this medicine': 'Ṅụọ ọgwụ a',
    'Do you have pain?': 'Ị na-enwe mgbu?',
    'Come back tomorrow': 'Lọghachi echi',
    headache: 'isi mgbu',
    'stomach pain': 'afọ mgbu',
    fever: 'ahụ ọkụ',
    cough: 'ụkwara',
  },
  hausa: {
    'Good morning': 'Ina kwana',
    'How are you feeling?': 'Yaya jikinka?',
    'Take this medicine': 'Sha wannan magani',
    'Do you have pain?': 'Kana jin zafi?',
    'Come back tomorrow': 'Koma gobe',
    headache: 'ciwon kai',
    'stomach pain': 'ciwon ciki',
    fever: 'zazzabi',
    cough: 'tari',
  },
  pidgin: {
    'Good morning': 'Good morning',
    'How are you feeling?': 'How your body dey?',
    'Take this medicine': 'Take dis medicine',
    'Do you have pain?': 'Body dey pain you?',
    'Come back tomorrow': 'Come back tomorrow',
    headache: 'head dey pain',
    'stomach pain': 'belle dey pain',
    fever: 'hot body',
    cough: 'cough',
  },
};

const LANGUAGE_NAMES = {
  yoruba: 'Yoruba',
  igbo: 'Igbo',
  hausa: 'Hausa',
  pidgin: 'Nigerian Pidgin English',
};

/**
 * Translate text to Nigerian language.
 * Uses phrasebook first, then Ollama Cloud for harder text.
 */
async function translateText(text, targetLanguage = 'yoruba') {
  // Phrasebook shortcut
  if (PHRASE_BOOK[targetLanguage] && PHRASE_BOOK[targetLanguage][text]) {
    return {
      success: true,
      original: text,
      translated: PHRASE_BOOK[targetLanguage][text],
      language: targetLanguage,
      source: 'phrasebook',
    };
  }

  const langName = LANGUAGE_NAMES[targetLanguage] || targetLanguage;

  const prompt = `Translate this medical instruction from English to ${langName}:

English: "${text}"

${langName}:`;

  // Try Ollama cloud (OpenAI-compatible format)
  try {
    if (!OLLAMA_API_KEY) {
      throw new Error('Missing OLLAMA_API_KEY for cloud translation');
    }

    const response = await ollamaClient.post('/chat/completions', {
      model: OLLAMA_MODEL,
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
    });

    return {
      success: true,
      original: text,
      translated: (response.data.choices[0].message.content || '').trim(),
      language: targetLanguage,
      source: 'ollama',
    };
  } catch (error) {
    console.error(
      'Translation error:',
      error.response?.status,
      error.response?.data || error.message
    );

    return {
      success: false,
      original: text,
      translated: text,
      language: targetLanguage,
      error: 'Translation unavailable',
    };
  }
}

function getSupportedLanguages() {
  return [
    { code: 'yoruba', name: 'Yoruba', flag: '🇳🇬' },
    { code: 'igbo', name: 'Igbo', flag: '🇳🇬' },
    { code: 'hausa', name: 'Hausa', flag: '🇳🇬' },
    { code: 'pidgin', name: 'Nigerian Pidgin', flag: '🇳🇬' },
    { code: 'english', name: 'English', flag: '🇬🇧' },
  ];
}

function getPhrasebook(language) {
  return PHRASE_BOOK[language] || {};
}

/* ------------------------------------------------------------------ */
/*  RULE-BASED MEDICATION SAFETY (FALLBACK)                            */
/* ------------------------------------------------------------------ */

function performRuleBasedSafetyCheck(patientData, medications) {
  const alerts = [];
  let riskScore = 'Low';

  if (medications.length >= 5) {
    alerts.push(
      '⚠️ Polypharmacy detected (5+ medications). Increased risk of interactions.'
    );
    riskScore = 'Medium';
  }

  if (patientData.allergies && patientData.allergies.length > 0) {
    alerts.push(
      `⚠️ Patient has documented allergies: ${patientData.allergies.join(', ')}`
    );
  }

  const age = parseInt(patientData.age, 10);
  if (!Number.isNaN(age)) {
    if (age >= 65) {
      alerts.push(
        '⚠️ Elderly patient - review dosages for age-appropriate adjustments.'
      );
      riskScore = 'Medium';
    }
    if (age < 18) {
      alerts.push(
        '⚠️ Pediatric patient - ensure pediatric dosing guidelines followed.'
      );
      riskScore = 'Medium';
    }
  }

  return {
    success: true,
    riskScore,
    analysis: alerts.join('\n'),
    source: 'rule-based',
    recommendations: [
      'Review all medication dosages',
      'Check for drug-drug interactions',
      'Monitor for adverse effects',
    ],
    timestamp: new Date().toISOString(),
  };
}

/* ------------------------------------------------------------------ */
/*  OLLAMA MEDICATION SAFETY / INTERACTIONS                            */
/* ------------------------------------------------------------------ */

async function analyzeMedicationSafety(patientData, medications) {
  const prompt = `You are a clinical pharmacist AI assistant. Analyze medication safety for this patient:

Patient Profile:
- Age: ${patientData.age || 'Unknown'}
- Gender: ${patientData.gender || 'Unknown'}
- Allergies: ${
    patientData.allergies?.length > 0
      ? patientData.allergies.join(', ')
      : 'None documented'
  }

Current Medications:
${medications
  .map(m => `- ${m.name} ${m.dosage || ''} ${m.frequency || ''}`)
  .join('\n')}

Provide a JSON object with fields: riskScore, interactions, allergyConcerns, dosageConcerns, recommendations.`;

  try {
    if (!OLLAMA_API_KEY) {
      throw new Error('Missing OLLAMA_API_KEY for medication safety check');
    }

    const response = await ollamaClient.post('/chat/completions', {
      model: OLLAMA_MODEL,
      messages: [
        { role: 'system', content: 'You are a clinical pharmacist AI assistant specialized in medication safety.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const aiResponse = response.data.choices[0].message.content;

    return {
      success: true,
      analysis: aiResponse,
      source: 'ollama',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(
      'Ollama API error (analyzeMedicationSafety):',
      error.response?.status,
      error.response?.data || error.message
    );
    return performRuleBasedSafetyCheck(patientData, medications);
  }
}

async function checkDrugInteractions(medications) {
  const drugNames = medications.map(m => m.name).join(', ');

  const prompt = `As a clinical pharmacist, identify potential drug-drug interactions between these medications:

Medications: ${drugNames}

Provide:
1. Severity (Mild/Moderate/Severe)
2. Specific interaction pairs
3. Clinical significance
4. Recommendations

Keep response concise and clinical.`;

  try {
    if (!OLLAMA_API_KEY) {
      throw new Error('Missing OLLAMA_API_KEY for interaction check');
    }

    const response = await ollamaClient.post('/chat/completions', {
      model: OLLAMA_MODEL,
      messages: [
        { role: 'system', content: 'You are a clinical pharmacist specializing in drug-drug interactions.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 600,
    });

    return {
      success: true,
      interactions: response.data.choices[0].message.content,
      source: 'ollama',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(
      'Drug interaction check error:',
      error.response?.status,
      error.response?.data || error.message
    );
    return {
      success: false,
      error: 'AI service unavailable',
      interactions: 'Unable to check interactions at this time',
      source: 'error',
    };
  }
}

/* ------------------------------------------------------------------ */
/*  PATIENT SUMMARY (OLLAMA → CLOUD → RULE-BASED)                      */
/* ------------------------------------------------------------------ */

function generateIntelligentSummary(patient, encounters, medications) {
  const summary = [];
  const age = parseInt(patient.age, 10) || 0;
  const recentEncounter = encounters[0];

  if (recentEncounter) {
    const diagnosis = (recentEncounter.diagnosis || '').toLowerCase();

    if (diagnosis.includes('malaria')) {
      summary.push(
        '🦟 Active malaria diagnosis - ensure completing full Coartem course, monitor for complications.'
      );
    } else if (diagnosis.includes('typhoid')) {
      summary.push(
        '🌡️ Typhoid fever - monitor temperature, ensure adequate hydration, complete antibiotic course.'
      );
    } else if (diagnosis.includes('hiv') || diagnosis.includes('aids')) {
      summary.push(
        '💊 HIV/AIDS patient - check ART adherence, and monitor CD4 count and viral load regularly.'
      );
    }

    if (diagnosis.includes('hypertension')) {
      summary.push(
        '🩺 Hypertension - monitor BP regularly, enforce lifestyle modifications, ensure medication adherence.'
      );
    }
    if (diagnosis.includes('diabetes')) {
      summary.push(
        '🩸 Diabetes - monitor blood sugar, screen for complications (kidney, eye, foot), and provide diet counseling.'
      );
    }
    if (diagnosis.includes('asthma')) {
      summary.push(
        '💨 Asthma - review inhaler technique, avoid triggers, ensure patient has a rescue inhaler.'
      );
    }
  }

  if (medications.length >= 5) {
    summary.push(
      `⚠️ Polypharmacy alert: ${medications.length} active medications – review for interactions and necessity.`
    );
  }

  if (age >= 65) {
    summary.push(
      '👴 Elderly patient – adjust doses for renal function, monitor for falls risk and side effects.'
    );
  } else if (age > 0 && age < 18) {
    summary.push(
      '👶 Pediatric patient – ensure age-appropriate dosing, growth monitoring, and immunization status.'
    );
  }

  if (
    patient.allergies &&
    (Array.isArray(patient.allergies)
      ? patient.allergies.length > 0
      : patient.allergies)
  ) {
    const allergyList = Array.isArray(patient.allergies)
      ? patient.allergies.join(', ')
      : patient.allergies;
    summary.push(
      `⚠️ ALLERGY ALERT: ${allergyList} – verify all prescriptions before dispensing.`
    );
  }

  if (encounters.length > 3) {
    summary.push(
      `📊 Frequent visits (${encounters.length} encounters) – consider underlying chronic disease or adherence issues.`
    );
  }

  if (summary.length === 0) {
    summary.push('✓ No immediate red flags identified.');
    summary.push(
      `Active medications: ${medications.length} – review for adherence and effectiveness.`
    );
    if (recentEncounter?.diagnosis) {
      summary.push(
        `Recent diagnosis: ${recentEncounter.diagnosis} – monitor progress and schedule follow-up.`
      );
    }
  }

  return {
    success: true,
    summary: summary.join('\n\n'),
    source: 'rule-based',
    timestamp: new Date().toISOString(),
  };
}

async function generatePatientSummary(patient, encounters, medications) {
  const encounterDetails = encounters
    .slice(0, 3)
    .map(
      e =>
        `  • ${e.diagnosis || 'General consultation'}${
          e.symptoms ? ` (${e.symptoms})` : ''
        }`
    )
    .join('\n');

  const medDetails = medications
    .slice(0, 5)
    .map(m => `  • ${m.name} ${m.dosage || ''} ${m.frequency || ''}`)
    .join('\n');

  const prompt = `You are a clinical AI assistant supporting doctors in a Nigerian hospital. Provide a clear, actionable summary for ward rounds.

PATIENT: ${patient.first_name} ${patient.last_name}, ${
    patient.age || 'age unknown'
  } years, ${patient.gender}
ALLERGIES: ${
    patient.allergies?.length > 0 ? patient.allergies.join(', ') : 'None documented'
  }

RECENT ENCOUNTERS (${encounters.length} total):
${encounterDetails || '  No recent visits'}

CURRENT MEDICATIONS (${medications.length} total):
${medDetails || '  No active medications'}

Provide a 3–5 bullet point clinical summary focusing on:
- Active medical issues
- Medication safety concerns (interactions, allergies, dosing)
- Priority actions for today
- Any red flags or urgent issues.

Use clear, practical language for busy ward rounds in Nigeria.`;

  // 1) Ollama cloud
  try {
    if (!OLLAMA_API_KEY) {
      throw new Error('Missing OLLAMA_API_KEY for patient summary');
    }

    const response = await ollamaClient.post('/chat/completions', {
      model: OLLAMA_MODEL,
      messages: [
        { role: 'system', content: 'You are a clinical AI assistant supporting doctors in Nigerian hospitals. Provide clear, actionable summaries for ward rounds.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 600,
    });

    return {
      success: true,
      summary: response.data.choices[0].message.content,
      source: 'ollama',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.log(
      'Ollama summary unavailable:',
      error.response?.status,
      error.response?.data || error.message
    );
  }

  // 2) Optional OpenAI-style cloud fallback
  if (aiClient) {
    try {
      const response = await aiClient.post('/chat/completions', {
        model: AI_MODEL,
        messages: [
          {
            role: 'system',
            content:
              'You are a clinical AI assistant for Nigerian hospitals. Provide concise, actionable summaries.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      return {
        success: true,
        summary: response.data.choices[0].message.content,
        source: 'cloud-ai',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.log(
        'Cloud AI unavailable:',
        error.response?.status,
        error.response?.data || error.message
      );
    }
  }

  // 3) Rule-based fallback
  console.log('Using intelligent rule-based summary');
  return generateIntelligentSummary(patient, encounters, medications);
}

/* ------------------------------------------------------------------ */
/*  CHAT COPILOT                                                       */
/* ------------------------------------------------------------------ */

function generateRuleBasedResponse(message, context) {
  const msgLower = message.toLowerCase();

  if (
    msgLower.includes('translate') ||
    msgLower.includes('yoruba') ||
    msgLower.includes('igbo') ||
    msgLower.includes('hausa')
  ) {
    return {
      success: true,
      response: `I can help translate medical terms.

Examples:

**Yoruba**
- "Orí fífọ́" = Headache
- "Ikùn rírun" = Stomach pain
- "Ibà" = Fever

**Igbo**
- "Isi mgbu" = Headache
- "Afọ mgbu" = Stomach pain
- "Ahụ ọkụ" = Fever

**Hausa**
- "Ciwon kai" = Headache
- "Ciwon ciki" = Stomach pain
- "Zazzabi" = Fever

**Pidgin**
- "Head dey pain" = Headache
- "Belle dey pain" = Stomach pain
- "Hot body" = Fever

What specific term do you need translated?`,
      source: 'rule-based',
    };
  }

  if (msgLower.includes('malaria')) {
    return {
      success: true,
      response: `**Malaria management (Nigeria context)**

- First-line: Artemether-Lumefantrine (Coartem)
- Monitor for severe anemia, cerebral malaria, persistent high fever
- Counsel patient to complete full course and use bed nets.

Need dosing or interaction advice?`,
      source: 'rule-based',
    };
  }

  return {
    success: true,
    response: `I'm here to help with:
- 💊 Medication questions (dosing, interactions, side effects)
- 🌍 Nigerian disease management (malaria, typhoid, HIV, hypertension, diabetes)
- 🗣️ Translations (Yoruba, Igbo, Hausa, Pidgin)
- 📋 Practical clinical guidance and safety alerts.

How can I assist you today?`,
    source: 'rule-based',
  };
}

async function chatWithCopilot(message, context = {}) {
  const contextPrompt = context.patient
    ? `\n\nCurrent Patient Context:\n- Name: ${context.patient.first_name} ${context.patient.last_name}\n- Age: ${context.patient.age} years\n- Gender: ${context.patient.gender}\n- Allergies: ${context.patient.allergies?.join(', ') || 'None documented'}`
    : '';

  const systemMessage = `You are MedSight AI, an expert clinical decision support assistant designed specifically for Nigerian healthcare providers and doctors.

Your expertise includes:

🩺 **Clinical Decision Support**
- Differential diagnosis assistance
- Evidence-based treatment recommendations
- Clinical guideline interpretation (WHO, Nigerian medical protocols)
- Ward round preparation and patient management

💊 **Medication Management**
- Drug interactions and contraindications
- Dosage calculations and adjustments
- Alternative medications when drugs are unavailable
- Cost-effective prescribing for resource-limited settings

🌍 **Nigerian Healthcare Context**
- Common tropical diseases: malaria, typhoid, cholera, Lassa fever
- Endemic conditions: HIV/AIDS, tuberculosis, sickle cell disease
- Hypertension, diabetes, and chronic disease management
- Resource-constrained clinical decision-making

🗣️ **Language & Communication**
- Medical term translations (Yoruba, Igbo, Hausa, Nigerian Pidgin)
- Patient education material in local languages
- Cultural sensitivity in healthcare delivery

⚠️ **Safety & Quality**
- Adverse drug reaction identification
- Patient safety alerts
- Clinical risk assessment
- Infection control guidance

**Response Guidelines:**
1. Be concise and actionable - doctors are busy
2. Provide evidence-based recommendations
3. Consider resource limitations in Nigerian hospitals
4. Flag urgent/critical findings clearly
5. Use bullet points for clarity
6. Include dosing information when relevant
7. Suggest cost-effective alternatives when possible

${contextPrompt}`;

  // 1) Ollama cloud chat
  try {
    if (!OLLAMA_API_KEY) {
      throw new Error('Missing OLLAMA_API_KEY for copilot chat');
    }

    const response = await ollamaClient.post('/chat/completions', {
      model: OLLAMA_MODEL,
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: message }
      ],
      temperature: 0.8,
      max_tokens: 1000,
    });

    return {
      success: true,
      response: response.data.choices[0].message.content.trim(),
      source: 'ollama',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(
      'Ollama chat error:',
      error.response?.status,
      error.response?.data || error.message
    );
  }

  // 2) Optional OpenAI-style fallback
  if (aiClient) {
    try {
      const response = await aiClient.post('/chat/completions', {
        model: AI_MODEL,
        messages: [
          {
            role: 'system',
            content:
              'You are MedSight AI, a clinical decision support assistant for Nigerian healthcare providers.',
          },
          { role: 'user', content: message },
        ],
        max_tokens: 800,
        temperature: 0.7,
      });

      return {
        success: true,
        response: response.data.choices[0].message.content,
        source: 'cloud-ai',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(
        'Cloud AI error:',
        error.response?.status,
        error.response?.data || error.message
      );
    }
  }

  // 3) Rule-based
  return generateRuleBasedResponse(message, context);
}

/* ------------------------------------------------------------------ */
/*  EXPORTS                                                            */
/* ------------------------------------------------------------------ */

module.exports = {
  translateText,
  getSupportedLanguages,
  getPhrasebook,
  analyzeMedicationSafety,
  checkDrugInteractions,
  generatePatientSummary,
  chatWithCopilot,
  performRuleBasedSafetyCheck,
};
