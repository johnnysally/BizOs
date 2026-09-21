require('dotenv/config');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 5000;

app.get('/', (_req, res) => {
  res.json({
    ok: true,
    service: 'bizos-api',
    message: 'BizOS API — running',
    version: '0.1.0',
  });
});

app.get('/api', (_req, res) => {
  res.json({
    ok: true,
    service: 'bizos-api',
    message: 'API root — see /api/public, /api/admin, /api/client',
  });
});

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`[bizos-api] listening on :${PORT}`);
});