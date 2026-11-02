import { GoogleGenAI } from '@google/genai';
import { mysteryPrompt } from '../utils/promptTemplates.js';
import { DIFFICULTIES } from '../utils/difficulty.js';
import { validateGeneratedCase } from '../validators/caseValidator.js';
import { redactLogValue, summarizeError } from '../utils/safeErrorLog.js';

function extractJson(responseText) {
  const text = responseText.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  try { return JSON.parse(text); } catch {
    const start = text.indexOf('{'); const end = text.lastIndexOf('}');
    if (start >= 0 && end > start) return JSON.parse(text.slice(start, end + 1));
    throw new Error('Gemini returned invalid JSON.');
  }
}

const responseSchema = {
  type: 'object',
  properties: {
    title: { type: 'string' }, story: { type: 'string' }, incidentDescription: { type: 'string' },
    suspects: { type: 'array', items: { type: 'object', properties: {
      suspectId: { type: 'string' }, name: { type: 'string' }, age: { type: 'integer' }, occupation: { type: 'string' }, relationship: { type: 'string' }, biography: { type: 'string' }, motive: { type: 'string' }, alibi: { type: 'string' }, personality: { type: 'string' }, avatarPrompt: { type: 'string' }
    }, required: ['suspectId', 'name', 'age', 'occupation', 'relationship', 'biography', 'motive', 'alibi', 'personality', 'avatarPrompt'] } },
    clues: { type: 'array', items: { type: 'object', properties: {
      clueId: { type: 'string' }, title: { type: 'string' }, description: { type: 'string' }, evidenceType: { type: 'string', enum: ['whatsapp', 'image', 'cctv', 'document', 'witness'] }, evidenceId: { type: 'string' }, relevance: { type: 'string' }
    }, required: ['clueId', 'title', 'description', 'evidenceType', 'evidenceId', 'relevance'] } },
    evidence: { type: 'array', items: { type: 'object', properties: {
      evidenceId: { type: 'string' }, title: { type: 'string' }, type: { type: 'string', enum: ['whatsapp', 'image', 'cctv', 'document', 'witness'] }, description: { type: 'string' }, content: { type: 'object' }, relatedSuspectIds: { type: 'array', items: { type: 'string' } }, timestamp: { type: 'string' }, clueIds: { type: 'array', items: { type: 'string' } }
    }, required: ['evidenceId', 'title', 'type', 'description', 'content', 'relatedSuspectIds', 'timestamp', 'clueIds'] } },
    hints: { type: 'array', items: { type: 'string' } }, culpritId: { type: 'string' }, solutionExplanation: { type: 'string' },
    reasoning: { type: 'object', properties: { motive: { type: 'string' }, opportunity: { type: 'string' }, evidenceConnections: { type: 'array', items: { type: 'string' } } }, required: ['motive', 'opportunity', 'evidenceConnections'] }
  },
  required: ['title', 'story', 'incidentDescription', 'suspects', 'clues', 'evidence', 'hints', 'culpritId', 'solutionExplanation', 'reasoning']
};

export async function generateMystery({ premise, difficulty }) {
  if (!process.env.GEMINI_API_KEY) throw new Error('Mystery generation is not configured. Add GEMINI_API_KEY to server/.env.');
  // Pin the current Interactions API revision so a deployment cannot negotiate
  // the retired response/output schema through an intermediary or stale default.
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: { headers: { 'Api-Revision': '2026-05-20' } }
  });
  const requirements = DIFFICULTIES[difficulty]; let correction = '';
  for (let attempt = 0; attempt < 3; attempt += 1) {
    let response;
    try {
      response = await ai.interactions.create({
        model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
        input: mysteryPrompt({ premise, difficulty, requirements, correction }),
        response_format: { type: 'text', mime_type: 'application/json', schema: responseSchema }
      });
    } catch (error) {
      const providerResponse = error.error?.error || error.error?.data?.error || error.error?.response?.data?.error;
      const providerCode = providerResponse?.code || error.error?.code || error.code || '';
      const rateLimited = Number(error.status) === 429 || providerCode === 'too_many_requests' || /rate limit|too many requests/i.test(error.message || '');
      const responseDetails = providerResponse ? redactLogValue({
        code: providerResponse.code,
        status: providerResponse.status,
        message: providerResponse.message,
        details: providerResponse.details
      }) : undefined;
      console.error('[Gemini] Interactions request failed:', JSON.stringify({
        model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
        attempt: attempt + 1,
        ...summarizeError(error),
        rateLimited,
        apiResponse: responseDetails
      }));
      const transient = !rateLimited && [500, 502, 503, 504].includes(Number(error.status));
      if (!transient || attempt === 2) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
      continue;
    }
    let raw;
    // SDK v2 returns the new Interactions `steps` schema and exposes the final
    // text through output_text. Keep JSON parsing and Zod validation server-side.
    const outputText = response.output_text;
    if (typeof outputText !== 'string' || outputText.trim().length === 0) {
      correction = 'The Interactions response did not contain output_text.';
      console.warn(`[Gemini] Empty structured response on attempt ${attempt + 1}; available output_text type: ${typeof outputText}.`);
      continue;
    }
    try { raw = extractJson(outputText); } catch (error) {
      correction = error.message;
      console.warn(`[Gemini] JSON parsing failed on attempt ${attempt + 1}: ${error.message}; output length: ${outputText.length}.`);
      continue;
    }
    const validated = validateGeneratedCase(raw, difficulty);
    if (validated.success) return validated.data;
    correction = validated.issues;
    console.warn(`[Gemini] Generated case failed application validation on attempt ${attempt + 1}: ${validated.issues}`);
  }
  throw new Error('The case generator could not produce a consistent case after three attempts. Please try again.');
}
