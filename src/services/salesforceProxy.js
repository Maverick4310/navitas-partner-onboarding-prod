/**
 * salesforceProxy.js
 * --------------------------------------------------------
 * Purpose:
 *  - Forward requests from Render to Salesforce Apex REST endpoints
 *  - Use TARGET_SF_URL environment variable for destination base path
 *  - Provide detailed logging of which service was called, duration, and status
 * --------------------------------------------------------
 */

const axios = require('axios');

async function forwardToSalesforce(req, res) {
  const start = Date.now();
  const mode = process.env.MODE || 'unknown';
  const method = req.method;
  const path = req.originalUrl || req.url;
  const baseUrl = process.env.TARGET_SF_URL;

  try {
    // === Validate target environment variable ===
    if (!baseUrl) {
      console.error(`[${mode}] ❌ TARGET_SF_URL not configured.`);
      return res.status(500).json({ error: true, message: 'Missing TARGET_SF_URL environment variable.' });
    }

    // === Build target Salesforce URL safely ===
    const targetUrl = `${baseUrl.replace(/\/$/, '')}${path.startsWith('/') ? '' : '/'}${path.replace(/^\/+/, '')}`;

    console.log(`[${mode}] [${method} ${path}] → Forwarding to Salesforce: ${targetUrl}`);

    // === Perform the HTTP request ===
    const sfResponse = await axios({
      method,
      url: targetUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      data: req.body,
      timeout: 20000,
    });

    const duration = ((Date.now() - start) / 1000).toFixed(2);
    console.log(`[${mode}] [${method} ${path}] ✅ Success (${duration}s) → Status ${sfResponse.status}`);

    // Optional: log response keys for traceability
    if (sfResponse.data && typeof sfResponse.data === 'object') {
      const keys = Object.keys(sfResponse.data);
      console.log(`[${mode}] [${method} ${path}] Salesforce response keys: ${keys.join(', ')}`);
    }

    return res.status(sfResponse.status).json(sfResponse.data);

  } catch (error) {
    const duration = ((Date.now() - start) / 1000).toFixed(2);
    const status = error.response ? error.response.status : 'ERR';
    console.error(
      `[${mode}] [${method} ${path}] ❌ Forward failed (${duration}s) → ${status} :: ${error.message}`
    );

    return res.status(status === 'ERR' ? 500 : status).json({
      error: true,
      message: error.message,
      details: error.response?.data || null,
    });
  }
}

module.exports = { forwardToSalesforce };
