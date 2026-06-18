const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Certificate = require('../models/Certificate');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

// Generate a unique cert ID
function generateCertId() {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `CERT-${rand}`;
}

// Generate a hash from cert data
function generateHash(certId, name, issuer, organization, date) {
  const raw = `${certId}|${name}|${issuer}|${organization}|${date}`;
  return crypto.createHash('sha256').update(raw).digest('hex');
}

// Helper: generate one cert object (without saving)
async function buildCert(name, issuer, issuerId, organization) {
  let certId;
  let unique = false;
  while (!unique) {
    certId = generateCertId();
    const existing = await Certificate.findOne({ certId });
    if (!existing) unique = true;
  }
  const date = new Date().toISOString();
  const hash = generateHash(certId, name, issuer, organization, date);
  return { certId, name, issuer, issuerId, organization, date, hash };
}

// POST /api/certs/generate  — single certificate (admin only)
router.post('/generate', protect, adminOnly, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Certificate name is required' });

    const issuer = req.user.name;
    const organization = req.user.organization || 'N/A';

    const certData = await buildCert(name, issuer, req.user._id, organization);
    const cert = await Certificate.create(certData);
    await User.findByIdAndUpdate(req.user._id, { $push: { certs: cert._id } });

    res.status(201).json({ cert });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/certs/generate-bulk  — multiple certificates (admin only)
// Body: { title: string, recipients: string[] }
// recipients = array of names, one cert is issued per name
router.post('/generate-bulk', protect, adminOnly, async (req, res) => {
  try {
    const { title, recipients } = req.body;

    if (!title) return res.status(400).json({ message: 'Certificate title is required' });
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ message: 'At least one recipient name is required' });
    }
    if (recipients.length > 500) {
      return res.status(400).json({ message: 'Maximum 500 certificates per batch' });
    }

    const issuer = req.user.name;
    const organization = req.user.organization || 'N/A';
    const certs = [];

    for (const recipientName of recipients) {
      const name = recipientName.trim();
      if (!name) continue;
      // For bulk: embed recipient name into cert name field
      const certName = `${title} — ${name}`;
      const certData = await buildCert(certName, issuer, req.user._id, organization);
      const cert = await Certificate.create(certData);
      await User.findByIdAndUpdate(req.user._id, { $push: { certs: cert._id } });
      certs.push(cert);
    }

    res.status(201).json({ certs, count: certs.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/certs/verify/:certId  (any authenticated user)
router.get('/verify/:certId', protect, async (req, res) => {
  try {
    const cert = await Certificate.findOne({ certId: req.params.certId });
    if (!cert) return res.status(404).json({ valid: false, message: 'Certificate not found' });

    if (cert.revoked) {
      return res.json({ valid: false, message: 'Certificate has been revoked', revoked: true });
    }

    const recalculated = generateHash(
      cert.certId, cert.name, cert.issuer,
      cert.organization, cert.date.toISOString()
    );

    if (recalculated !== cert.hash) {
      return res.json({ valid: false, message: 'Certificate has been tampered with!', tampered: true });
    }

    res.json({
      valid: true,
      cert: {
        certId: cert.certId, name: cert.name, issuer: cert.issuer,
        organization: cert.organization, date: cert.date, hash: cert.hash
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/certs/my  (admin only)
router.get('/my', protect, adminOnly, async (req, res) => {
  try {
    const certs = await Certificate.find({ issuerId: req.user._id }).sort({ createdAt: -1 });
    res.json({ certs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/certs/revoke/:certId (admin only)
router.patch('/revoke/:certId', protect, adminOnly, async (req, res) => {
  try {
    const cert = await Certificate.findOneAndUpdate(
      { certId: req.params.certId, issuerId: req.user._id },
      { revoked: true },
      { new: true }
    );
    if (!cert) return res.status(404).json({ message: 'Certificate not found or not yours' });
    res.json({ message: 'Certificate revoked', cert });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;