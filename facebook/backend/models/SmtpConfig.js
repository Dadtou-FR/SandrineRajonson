// backend/models/SmtpConfig.js
const mongoose = require('mongoose');

const smtpSchema = new mongoose.Schema({
  host: String,
  port: Number,
  secure: Boolean,
  user: String,
  pass: String
}, {
  timestamps: true
});

module.exports = mongoose.model('SmtpConfig', smtpSchema);
