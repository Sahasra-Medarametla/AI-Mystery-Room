import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { connectDatabase } from './config/db.js';
import caseRoutes from './routes/caseRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

const app = express();
app.disable('x-powered-by');
app.use(helmet());
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((origin) => origin.trim());
app.use(cors({ origin(origin, callback) { if (!origin || allowedOrigins.includes(origin)) return callback(null, true); return callback(new Error('Origin is not allowed by CORS.')); }, methods: ['GET', 'POST'], allowedHeaders: ['Content-Type', 'x-case-token'] }));
app.use(express.json({ limit: '20kb' }));
app.get('/api/health', (_req, res) => res.json({ success: true, status: 'ok' }));
app.use('/api/cases', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-7', legacyHeaders: false }));
app.use('/api/cases', caseRoutes);
app.use(notFound);
app.use(errorHandler);

const port = Number(process.env.PORT) || 5000;
let serverInstance;
let startupPromise;

function listenOnce() {
  return new Promise((resolve, reject) => {
    const server = app.listen(port);
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
