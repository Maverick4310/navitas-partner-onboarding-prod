/**
 * index.js
 * --------------------------------------------------------
 * Navitas Partner Onboarding Proxy (Sandbox/Production)
 * --------------------------------------------------------
 * Forwards onboarding JSON payloads from partners to the
 * Salesforce Apex REST endpoint defined in Render env vars.
 * --------------------------------------------------------
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { forwardToSalesforce } = require('./src/services/salesforceProxy');

const app = express();

// === Middleware ===
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));

// === Health Check ===
app.get('/ping', (req, res) => {
  res.status(200).send(`Partner Onboarding Proxy is live in ${process.env.MODE || 'unknown'} mode`);
});

// === Partner Onboarding Endpoint ===
app.post('/onboarding', forwardToSalesforce);

// === Start Server ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Navitas Partner Onboarding Proxy (${process.env.MODE}) running on port ${PORT}`);
});
