/**
 * salesforceProxy.js
 * --------------------------------------------------------
 * Purpose:
 *  - Forward requests from Render to Salesforce Named Credential
 *  - Log which service is being called, how long it took, and status
 * --------------------------------------------------------
 */

const axios = require('axios');

async function forwardToSalesforce(req, res) {
  const start = Date.now();
  const mode = process.env.MODE || 'unknown';
  const path = req.originalUrl || req.url;
  const method = req.method;
  const namedCredential = process.env.SF_NAMED_CRED || 'PartnerOnboardingAPI';

  try {
    // Log entry
    console.log(`[${mode}] [${method} ${path}] → Forwarding to Salesforce...`);

    // Build Salesforce request
    const targetUrl = `${process.env.SALESFORCE_BASE_URL || ''}${path}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(req.headers.authorization ? { Authorization: req.headers.authorization } : {}),
    };

    // Make callout to Salesforce
    const sfResponse = await axios({
      method,
      url: targetUrl,
      headers,
      data: req.body,
      timeout: 20000,
    });

    const duration = ((Date.now() - start) / 1000).toFixed(2);

    // Log details
    console.log(
      `[${mode}] [${method} ${path}] → Forwarded to Salesforce: ${targetUrl} (${duration}s) → Status ${sfResponse.status}`
    );

    // Optionally log payload summary
    if (req.body && Object.keys(req.body).length > 0) {
      console.log(
        `[${mode}] [${method} ${path}] Payload keys: ${Object.keys(req.body).join(', ')}`
      );
    }

    return res.status(sfResponse.status).json(sfResponse.data);
  } catch (error) {
    const duration = ((Date.now() - start) / 1000).toFixed(2);
    const status = error.response ? error.response.status : 'ERR';
    console.error(
      `[${mode}] [${method} ${path}] ❌ Forward to Salesforce failed (${duration}s) → ${status} :: ${error.message}`
    );

    return res.status(status === 'ERR' ? 500 : status).json({
      error: true,
      message: error.message,
      details: error.response?.data || null,
    });
  }
}

module.exports = { forwardToSalesforce };
