const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  certId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Certificate name is required'],
    trim: true
  },
  issuer: {
    type: String,
    required: true
  },
  issuerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organization: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    default: Date.now
  },
  hash: {
    type: String,
    required: true
  },
  revoked: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Certificate', certificateSchema);