const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { authMiddleware } = require('./middleware');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const ALLOWED_DOMAIN = process.env.ALLOWED_DOMAIN || 'mits.ac.in';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role, department });
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department, hasSignature: !!user.signatureImage }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload/update signature
router.post('/signature', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    const jwt2 = require('jsonwebtoken');
    const decoded = jwt2.verify(token, JWT_SECRET);
    const { signatureImage } = req.body; // base64 PNG
    if (!signatureImage) return res.status(400).json({ error: 'No signature provided' });

    await User.findByIdAndUpdate(decoded.id, { signatureImage, signatureUploadedAt: new Date() });
    res.json({ message: 'Signature saved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current user profile
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    const jwt2 = require('jsonwebtoken');
    const decoded = jwt2.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Get VC user info (for signature display)
router.get('/vc-info', authMiddleware, async (req, res) => {
  try {
    const User = require('../models/User');
    const vc = await User.findOne({ role: 'vc' }).select('name signatureImage');
    res.json(vc || { name: 'Vice Chancellor', signatureImage: null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Google OAuth Login ──────────────────────────────────────────
// POST /api/auth/google
// Body: { credential: <Google id_token> }
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'No Google credential provided' });
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'PASTE_YOUR_GOOGLE_CLIENT_ID_HERE') {
      return res.status(503).json({ error: 'Google OAuth not configured yet. Please add GOOGLE_CLIENT_ID to .env' });
    }

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    // Enforce institute domain
    if (!email.endsWith('@' + ALLOWED_DOMAIN)) {
      return res.status(403).json({
        error: `Only @${ALLOWED_DOMAIN} accounts are allowed. Please use your institute email.`
      });
    }

    // Find existing user by email, or create new one
    let user = await User.findOne({ email });
    if (!user) {
      // New user — auto-register as faculty, admin can change role later
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        password: await bcrypt.hash(googleId + JWT_SECRET, 10), // unusable password
        role: 'faculty',
        department: '',
        googleId,
        profilePhoto: picture || '',
        status: 'active',
      });
    } else {
      // Link Google ID to existing account if not already set
      if (!user.googleId) {
        await User.findByIdAndUpdate(user._id, { googleId, profilePhoto: picture || user.profilePhoto || '' });
      }
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        hasSignature: !!user.signatureImage,
        profilePhoto: picture || user.profilePhoto || '',
      }
    });
  } catch (err) {
    console.error('[Google Auth Error]', err.message);
    res.status(401).json({ error: 'Google authentication failed: ' + err.message });
  }
});

// Update own profile (used by ProfileCompletion wizard)
router.patch('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    const jwt2 = require('jsonwebtoken');
    const decoded = jwt2.verify(token, JWT_SECRET);
    const allowed = ['phone','gender','bio','employeeId','designation',
                     'qualification','experience','cabin','profilePhoto','signatureImage'];
    const update = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }
    const user = await User.findByIdAndUpdate(decoded.id, update, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

