const express = require('express');
const router = express.Router();
const { translateText, getSupportedLanguages, getPhrasebook } = require('../services/translationService');

// Get supported languages
router.get('/languages', (req, res) => {
  res.json({
    success: true,
    languages: getSupportedLanguages()
  });
});

// Get phrasebook for a language
router.get('/phrasebook/:language', (req, res) => {
  const { language } = req.params;
  const phrasebook = getPhrasebook(language);

  if (Object.keys(phrasebook).length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Language not found or no phrasebook available'
    });
  }

  res.json({
    success: true,
    language: language,
    phrases: phrasebook
  });
});

// Translate text
router.post('/translate', async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({
        success: false,
        error: 'Text and targetLanguage are required'
      });
    }

    const result = await translateText(text, targetLanguage);
    res.json(result);
  } catch (error) {
    console.error('Translation endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Translation failed',
      message: error.message
    });
  }
});

module.exports = router;
