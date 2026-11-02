import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { connectDatabase } from './config/db.js';
import caseRoutes from './routes/caseRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

const app = express();
const serverDirectory = dirname(fileURLToPath(import.meta.url));
const clientDistDirectory = resolve(serverDirectory, '../client/dist');
app.disable('x-powered-by');
app.use(helmet());
const allowedOrigins = (process.env.CLIENT_URL || '').split(',').map((origin) => origin.trim()).filter(Boolean);
const crossOriginCors = cors({ origin(origin, callback) { if (!origin || allowedOrigins.includes(origin)) return callback(null, true); return callback(new Error('Origin is not allowed by CORS.')); }, methods: ['GET', 'POST'], allowedHeaders: ['Content-Type', 'x-case-token'] });
// Production uses same-origin requests. Apply CORS only for explicitly configured external origins.
app.use((req, res, next) => {
  const origin = req.get('origin');
  if (!origin) return next();
  try {
    if (new URL(origin).host === req.get('host')) return next();
  } catch {
    return next(new Error('Origin is not allowed by CORS.'));
  }
  return crossOriginCors(req, res, next);
});
app.use(express.json({ limit: '20kb' }));
app.get('/api/health', (_req, res) => res.json({ success: true, status: 'ok' }));
app.use('/api/cases', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-7', legacyHeaders: false }));
app.use('/api/cases', caseRoutes);
// Keep unknown API requests in the JSON API error path instead of serving the SPA.
app.use('/api', notFound);
app.use(express.static(clientDistDirectory));
// BrowserRouter routes (for example /case/:id/results) need the app shell on refresh.
app.get('*', (_req, res, next) => {
  res.sendFile(resolve(clientDistDirectory, 'index.html'), (error) => {
    if (error) next(error);
  });
});
app.use(notFound);
app.use(errorHandler);

const port = Number(process.env.PORT) || 5000;
let serverInstance;
let startupPromise;

function listenOnce() {
  return new Promise((resolve, reject) => {
    // Render supplies PORT and expects web services to bind on all interfaces.
    const server = app.listen(port, '0.0.0.0');
    server.once('listening', () => resolve(server));
    server.once('error', reject);
  });
}

export function startServer() {
  if (serverInstance) return Promise.resolve(serverInstance);
  if (startupPromise) return startupPromise;

  startupPromise = (async () => {
    await connectDatabase();
    try {
      serverInstance = await listenOnce();
      console.info(`Case server listening on port ${port}.`);
      return serverInstance;
    } catch (error) {
      if (error.code === 'EADDRINUSE') {
        console.error(`Startup failed: port ${port} is already in use. Stop the process listening on that port, or set PORT to a different value before starting this server.`);
      } else {
        console.error(`HTTP server startup failed: ${error.message}`);
      }
      await mongoose.disconnect().catch(() => {});
      process.exitCode = 1;
      return null;
    }
  })().catch(async (error) => {
    console.error(`Database startup failed: ${error.message}`);
    await mongoose.disconnect().catch(() => {});
    process.exitCode = 1;
    return null;
  }).finally(() => {
    startupPromise = null;
  });

  return startupPromise;
}

startServer();
