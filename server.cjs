/* server.cjs - robust safe static server for development */
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));

// safe file sender helper
function safeSendFile(res, relPath, contentType) {
  try {
    const full = path.join(publicDir, relPath);
    if (!fs.existsSync(full)) return res.status(404).send('Not found');
    if (contentType) res.setHeader('Content-Type', contentType);
    return res.sendFile(full);
  } catch (err) {
    console.error('safeSendFile error', err);
    return res.status(500).send('Server error');
  }
}

// static API endpoints for files without extension
app.get('/api/admin-stats', (req, res) => safeSendFile(res, path.join('api','admin-stats'), 'application/json; charset=utf-8'));
app.get('/api/transparency-proofs', (req, res) => safeSendFile(res, path.join('api','transparency-proofs'), 'application/json; charset=utf-8'));
app.get('/api/transparency-csv', (req, res) => safeSendFile(res, path.join('api','transparency-csv'), 'text/csv; charset=utf-8'));

// Fallback middleware: serve /page -> /page.html if exists (no route patterns, safe)
app.use((req, res, next) => {
  try {
    const urlPath = decodeURIComponent(req.path || '');
    // if path has an extension (file), skip
    if (path.extname(urlPath)) return next();
    // normalize and remove leading slash
    const clean = urlPath.startsWith('/') ? urlPath.slice(1) : urlPath;
    if (!clean) return next();
    const candidate = path.join(publicDir, clean + '.html');
    if (fs.existsSync(candidate)) return res.sendFile(candidate);
  } catch (e) {
    // swallow
    console.error('fallback error', e);
  }
  return next();
});

app.listen(port, () => {
  console.log('Serving ./public at http://localhost:' + port);
});
