// Translation service for Nigerian languages
const axios = require('axios');

const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'https://ollama.com';

const ollamaClient = axios.create({
  baseURL: OLLAMA_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000
});

// Common medical phrases in Nigerian languages
const PHRASE_BOOK = {
  yoruba: {
    'Good morning': 'Ẹ káàárọ̀',
    'How are you feeling?': 'Báwo ni ìrílárá rẹ?',
    'Take this medicine': 'Mu oògùn yìí',
    'Do you have pain?': 'Ṣé ó ń rọ́ ọ?',
    'Come back tomorrow': 'Padà wá lọ́la',
    'headache': 'orí fífọ́',
    'stomach pain': 'ikùn rírun',
    'fever': 'ibà',
    'cough': 'ikọ̀'
  },
  igbo: {
    'Good morning': 'Ụtụtụ ọma',
    'How are you feeling?': 'Kedụ ka ị na-adị?',
    'Take this medicine': 'Ṅụọ ọgwụ a',
    'Do you have pain?': 'Ị na-enwe mgbu?',
    'Come back tomorrow': 'Lọghachi echi',
    'headache': 'isi mgbu',
    'stomach pain': 'afọ mgbu',
    'fever': 'ahụ ọkụ',
    'cough': 'ụkwara'
  },
  hausa: {
    'Good morning': 'Ina kwana',
    'How are you feeling?': 'Yaya jikinka?',
    'Take this medicine': 'Sha wannan magani',
    'Do you have pain?': 'Kana jin zafi?',
    'Come back tomorrow': 'Koma gobe',
    'headache': 'ciwon kai',
    'stomach pain': 'ciwon ciki',
    'fever': 'zazzabi',
    'cough': 'tari'
  },
  pidgin: {
    'Good morning': 'Good morning',
    'How are you feeling?': 'How your body dey?',
    'Take this medicine': 'Take dis medicine',
    'Do you have pain?': 'Body dey pain you?',
    'Come back tomorrow': 'Come back tomorrow',
    'headache': 'head dey pain',
    'stomach pain': 'belle dey pain',
    'fever': 'hot body',
    'cough': 'cough'
  }
};

/**
 * Translate text to Nigerian language using AI
 */
async function translateText(text, targetLanguage = 'yoruba') {
  // Check phrasebook first for common phrases
  if (PHRASE_BOOK[targetLanguage] && PHRASE_BOOK[targetLanguage][text]) {
    return {
      success: true,
      original: text,
      translated: PHRASE_BOOK[targetLanguage][text],
      language: targetLanguage,
      source: 'phrasebook'
    };
  }

  // Use AI for complex translations
  const languageNames = {
    yoruba: 'Yoruba',
    igbo: 'Igbo',
    hausa: 'Hausa',
    pidgin: 'Nigerian Pidgin English'
  };

  const prompt = `Translate this medical instruction from English to ${languageNames[targetLanguage] || targetLanguage}:

English: "${text}"

${languageNames[targetLanguage]}:`;

  try {
    const response = await ollamaClient.post('/api/generate', {
      model: 'llama2',
      prompt: prompt,
      stream: false
    });

    return {
      success: true,
      original: text,
      translated: response.data.response.trim(),
      language: targetLanguage,
      source: 'ai'
    };
  } catch (error) {
    console.error('Translation error:', error.message);

    // Fallback to phrasebook approximation or return original
    return {
      success: false,
      original: text,
      translated: text,
      language: targetLanguage,
      error: 'Translation unavailable'
    };
  }
}

/**
 * Get all supported languages
 */
function getSupportedLanguages() {
  return [
    { code: 'yoruba', name: 'Yoruba', flag: '🇳🇬' },
    { code: 'igbo', name: 'Igbo', flag: '🇳🇬' },
    { code: 'hausa', name: 'Hausa', flag: '🇳🇬' },
    { code: 'pidgin', name: 'Nigerian Pidgin', flag: '🇳🇬' },
    { code: 'english', name: 'English', flag: '🇬🇧' }
  ];
}

/**
 * Get phrasebook for a language
 */
function getPhrasebook(language) {
  return PHRASE_BOOK[language] || {};
}

module.exports = {
  translateText,
  getSupportedLanguages,
  getPhrasebook
};
