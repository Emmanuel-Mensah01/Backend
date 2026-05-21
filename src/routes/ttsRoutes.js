const express = require('express');
const https   = require('https');
const router  = express.Router();

// GET /api/tts?text=Hello world&lang=fr
router.get('/', (req, res) => {
  const { text, lang = 'en' } = req.query;
  if (!text) return res.status(400).json({ error: 'text is required' });

  const url = `https://translate.google.com/translate_tts` +
    `?ie=UTF-8&client=tw-ob&tl=${lang}` +
    `&q=${encodeURIComponent(text)}&ttsspeed=0.9`;

  https.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Referer':    'https://translate.google.com/',
    },
  }, (response) => {
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // cache 24hrs
    response.pipe(res);
  }).on('error', () => {
    res.status(500).json({ error: 'TTS fetch failed' });
  });
});

module.exports = router;