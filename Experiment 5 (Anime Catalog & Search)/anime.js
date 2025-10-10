const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

// Search anime by title
router.get('/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ message: 'Query is required' });

  try {
    const response = await fetch(`https://api.jikan.moe/v4/anime?q=${query}&limit=10`);
    const data = await response.json();
    res.json(data.data); // send only the anime array
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get anime by ID
router.get('/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const response = await fetch(`https://api.jikan.moe/v4/anime/${id}`);
    const data = await response.json();
    res.json(data.data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

