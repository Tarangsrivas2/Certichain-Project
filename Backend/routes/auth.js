const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, organization } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      // Return special flag so frontend can redirect to login with email pre-filled
      return res.status(400).json({
        message: 'Email already registered',
        emailExists: true,
        email
      });
    }

    const user = await User.create({
      name, email, password,
      role: role || 'user',
      organization: organization || ''
    });

    const token = signToken(user._id);
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, organization: user.organization }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken(user._id);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, organization: user.organization }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      organization: req.user.organization
    }
  });
});

// PATCH /api/auth/upgrade — upgrade logged-in user → admin (requires password confirmation)
router.patch('/upgrade', protect, async (req, res) => {
  try {
    const { organization, password } = req.body;

    const user = await User.findById(req.user._id);

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'You are already an admin.' });
    }

    if (!organization || organization.trim() === '') {
      return res.status(400).json({ message: 'Organization name is required to become an admin.' });
    }

    // Confirm password before granting upgrade
    const passwordOk = await user.comparePassword(password);
    if (!passwordOk) {
      return res.status(401).json({ message: 'Incorrect password. Upgrade denied.' });
    }

    user.role = 'admin';
    user.organization = organization.trim();
    await user.save();

    // Issue a fresh token with updated role
    const newToken = signToken(user._id);
    res.json({
      message: 'Account upgraded to Admin!',
      token: newToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, organization: user.organization }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;