const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/authMiddleware');

// --- (CREATE) POST /api/users/register ---
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({ name, email, password });
    await user.save();
    
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
});

// --- (AUTH) POST /api/users/login ---
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Create JWT Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: token
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
});

// --- (READ) GET /api/users/me (Get logged in user's profile) ---
// This is a protected route
router.get('/me', protect, (req, res) => {
    // The user object is attached to the request in the 'protect' middleware
    res.json(req.user);
});


module.exports = router;