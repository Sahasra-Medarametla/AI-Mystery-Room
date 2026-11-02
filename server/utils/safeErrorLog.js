const SENSITIVE_KEY = /api.?key|authorization|access.?token|secret|credential/i;
const API_KEY_VALUE = /AIza[0-9A-Za-z_-]{20,}/g;
const AUTH_VALUE = /(api.?key|authorization|x-goog-api-key)(\s*[:=]\s*)[^\s,;]+/gi;

export function redactLogValue(value, depth = 0) {
  if (depth > 5) return '[truncated]';
  if (typeof value === 'string') return value.replace(API_KEY_VALUE, '[REDACTED]').replace(AUTH_VALUE, '$1$2[REDACTED]').slice(0, 2000);
  if (Array.isArray(value)) return value.slice(0, 20).map((item) => redactLogValue(item, depth + 1));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).slice(0, 40).map(([key, item]) => [key, SENSITIVE_KEY.test(key) ? '[REDACTED]' : redactLogValue(item, depth + 1)]));
  }
  return value;
}

export function summarizeError(error) {
  return redactLogValue({
    type: error?.name || 'Error',
    status: Number(error?.status) || undefined,
    code: error?.code,
    message: error?.message || 'Unknown error'
  });
}
