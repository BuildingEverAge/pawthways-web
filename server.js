// server.js - sirve ./public y resuelve /page -> /page.html if exists
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

const publicDir = path.join(__dirname, 'public');

// Rutas dinámicas para handlers JavaScript (ES modules) - deben ir antes del static
app.get('/api/admin-stats.js', async (req, res) => {
  try {
    const { default: adminStatsHandler } = await import('file://' + path.join(publicDir, 'api/admin-stats.js'));
    return adminStatsHandler(req, res);
  } catch (e) {
    console.warn('Failed to load admin-stats.js handler:', e.message);
    return res.status(500).json({ error: 'Handler load failed', details: e.message });
  }
});

app.get('/api/transparency-proofs.js', async (req, res) => {
  try {
    const { default: transparencyProofsHandler } = await import('file://' + path.join(publicDir, 'api/transparency-proofs.js'));
    return transparencyProofsHandler(req, res);
  } catch (e) {
    console.warn('Failed to load transparency-proofs.js handler:', e.message);
    return res.status(500).json({ error: 'Handler load failed', details: e.message });
  }
});

// Rutas específicas para archivos de API estáticos (JSON/CSV)
app.get('/api/admin-stats', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.sendFile(path.join(publicDir, 'api/admin-stats'));
});

app.get('/api/transparency-csv', (req, res) => {
  res.setHeader('Content-Type', 'text/csv');
  res.sendFile(path.join(publicDir, 'api/transparency-csv'));
});

app.get('/api/transparency-proofs', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.sendFile(path.join(publicDir, 'api/transparency-proofs'));
});

// Servir archivos estáticos (pero excluir los handlers .js de la API)
app.use(express.static(publicDir, {
  setHeaders: (res, path) => {
    // Prevenir que los archivos .js de la API se sirvan como estáticos
    if (path.includes('/api/') && path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// Middleware para servir archivos HTML si no tienen extensión
app.use((req, res, next) => {
  if (path.extname(req.path)) return next();
  
  const candidate = path.join(publicDir, req.path + '.html');
  if (fs.existsSync(candidate)) {
    return res.sendFile(candidate);
  }
  next();
});

app.listen(port, () => {
  console.log(`Serving ./public at http://localhost:${port}`);
});
