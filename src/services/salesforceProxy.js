/**
 * salesforceProxy.js
 * --------------------------------------------------------
 * Purpose:
 *  - Forward requests from Render to Salesforce Apex REST endpoints
 *  - Use TARGET_SF_URL environment variable as base path
 *  - Map external routes (e.g., /onboarding) to Apex REST paths (e.g., /newpartner)
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

    // === Map incoming paths to Salesforce endpoints ===
    const routeMap = {
      '/onboarding': '/newpartner',
      '/verifyWebsite': '/verifyWebsite'
    };

    // Determine which Apex REST path to hit
    const sfSubPath = routeMap[path] || path;

    // === Join base + subpath safely ===
    let base = baseUrl.replace(/\/+$/, '');
    let tail = sfSubPath.replace(/^\/+/, '');
    const targetUrl = `${base}/${tail}`;

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

    // Optional: log top-level keys from SF response
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
