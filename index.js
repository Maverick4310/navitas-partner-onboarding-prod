/**
 * index.js
 * --------------------------------------------------------
 * Navitas Partner Onboarding Proxy (Production)
 * --------------------------------------------------------
 * Purpose:
 *  - Route partner onboarding and verification calls
 *  - Forward selected routes to Salesforce Apex REST endpoints
 *  - Handle internal logic (e.g., /verifyWebsite) locally
 * --------------------------------------------------------
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { forwardToSalesforce } = require('./src/services/salesforceProxy');
const { verifyWebsiteHandler } = require('./src/services/websiteVerifier');
const { verifyEmailHandler } = require('./src/services/emailVerifier'); // 🆕 Add this line

const app = express();
const PORT = process.env.PORT || 3000;
const MODE = process.env.MODE || 'unknown';

// === Middleware ===
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));

// === Health check ===
app.get('/ping', (req, res) => {
  res.status(200).send(`Partner Onboarding Proxy is live in ${MODE} mode`);
});

// ----------------------------------------------------------
// 🔹 ROUTE DEFINITIONS (Future-proof, centralized mapping)
// ----------------------------------------------------------

// === 1) Partner Onboarding ===
// External caller POSTs to /onboarding
// → forwards to Salesforce Apex REST: /newpartner
app.post('/onboarding', (req, res) => {
  req.url = '/newpartner';
  forwardToSalesforce(req, res);
});

// === 2) Website Verification ===
// Salesforce calls this internally to perform fraud checks
app.post('/verifyWebsite', verifyWebsiteHandler);

// === Email Verification endpoint (EmailRep + IP2WHOIS) ===
app.post('/verifyEmail', verifyEmailHandler);

// === 3) (Example Future Endpoints) ===
// app.post('/updatePartner', (req, res) => {
//   req.url = '/updatepartner';
//   forwardToSalesforce(req, res);
// });

// app.post('/fetchDocuments', (req, res) => {
//   req.url = '/fetchdocs';
//   forwardToSalesforce(req, res);
// });

// ----------------------------------------------------------
// Start server
// ----------------------------------------------------------
app.listen(PORT, () => {
  console.log(`🚀 Navitas Partner Onboarding Proxy (${MODE}) running on port ${PORT}`);
});
