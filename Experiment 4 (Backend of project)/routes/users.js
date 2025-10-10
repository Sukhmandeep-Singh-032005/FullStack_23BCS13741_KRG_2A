const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// Get user profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

// Update profile
router.put('/me', authMiddleware, async (req, res) => {
  const { name, bio, avatar } = req.body;
  try {
    const user = await User.findByIdAndUpdate(req.user.id, { name, bio, avatar }, { new: true }).select('-password');
    res.json(user);
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
