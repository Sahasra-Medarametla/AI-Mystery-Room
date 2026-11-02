import { summarizeError } from '../utils/safeErrorLog.js';

export function notFound(_req, _res, next) { const error = new Error('The requested endpoint was not found.'); error.status = 404; error.code = 'NOT_FOUND'; next(error); }
export function errorHandler(error, _req, res, _next) {
  const status = error.status || 500;
  if (status >= 500) console.error('[API] Request failed:', JSON.stringify(summarizeError(error)));
  res.status(status).json({ success: false, message: status >= 500 ? (error.expose ? error.message : 'Unable to process the request right now.') : error.message, errorCode: error.code || (status >= 500 ? 'REQUEST_FAILED' : 'INVALID_REQUEST') });
}
