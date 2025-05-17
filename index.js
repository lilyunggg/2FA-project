// Basic Express server for 2FA with Twilio Verify
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const validator = require('validator');
const fs = require('fs');
const https = require('https');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: 'https://localhost:5173',
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // limit each IP to 10 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

app.use(bodyParser.json());

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

// Endpoint to start verification (send SMS)
app.post('/api/start-verification', async (req, res) => {
  let { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Invalid request.' });
  phone = validator.trim(phone);
  // Validate E.164 phone format (e.g., +1234567890)
  if (!validator.isMobilePhone(phone, 'any', { strictMode: true }) || !phone.startsWith('+')) {
    return res.status(400).json({ error: 'Invalid phone number format.' });
  }
  try {
    const verification = await client.verify.v2.services(verifyServiceSid)
      .verifications.create({ to: phone, channel: 'sms' });
    res.json({ status: verification.status });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Endpoint to check verification (verify code)
app.post('/api/check-verification', async (req, res) => {
  let { phone, code } = req.body;
  if (!phone || !code) return res.status(400).json({ error: 'Invalid request.' });
  phone = validator.trim(phone);
  code = validator.trim(code.toString());
  if (!validator.isMobilePhone(phone, 'any', { strictMode: true }) || !phone.startsWith('+')) {
    return res.status(400).json({ error: 'Invalid phone number format.' });
  }
  if (!validator.isNumeric(code) || code.length < 4 || code.length > 10) {
    return res.status(400).json({ error: 'Invalid verification code format.' });
  }
  try {
    const verificationCheck = await client.verify.v2.services(verifyServiceSid)
      .verificationChecks.create({ to: phone, code });
    res.json({ status: verificationCheck.status });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

if (require.main === module) {
  const certPath = './cert.pem';
  const keyPath = './key.pem';
  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    const options = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    };
    https.createServer(options, app).listen(port, () => {
      console.log(`2FA backend running with HTTPS on port ${port}`);
    });
  } else {
    app.listen(port, () => {
      console.log(`2FA backend running on HTTP (no certs found) on port ${port}`);
    });
  }
}

module.exports = app;
