# Navitas Partner Onboarding Proxy (Production)

This Render-hosted Node.js proxy forwards partner onboarding requests to Salesforce's production Apex REST endpoint.

---

## 🧱 Service Overview

**Render Service Name:** `navitas-partner-onboarding-prod`  
**Endpoint:** `https://navitas-partner-onboarding-prod.onrender.com/onboarding`  
**Salesforce Target:**  
`https://navitascredit.my.salesforce-sites.com/onboarding/services/apexrest/newpartner`

---

## ⚙️ Environment Variables

| Key | Value |
|------|--------|
| `TARGET_SF_URL` | `https://navitascredit.my.salesforce-sites.com/onboarding/services/apexrest/newpartner` |
| `MODE` | `partner-onboarding-prod` |

---

## 🧪 Test Example

```bash
curl -X POST https://navitas-partner-onboarding-prod.onrender.com/onboarding \
     -H "Content-Type: application/json" \
     -d '{"partnerName":"Test Partner","contactEmail":"partner@example.com"}'
