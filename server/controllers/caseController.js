import crypto from 'node:crypto';
import Case from '../models/Case.js';
import { generateMystery } from '../services/mysteryGenerator.js';
import { calculateResult } from '../services/scoringService.js';
import { createRequestSchema } from '../validators/caseValidator.js';
import { tokenHash } from '../middleware/caseAccess.js';
import { redactLogValue } from '../utils/safeErrorLog.js';

const fail = (res, status, message, errorCode) => res.status(status).json({ success: false, message, errorCode });
function publicCase(doc) {
  const discovered = new Set(doc.discoveredClueIds);
  return { title: doc.title, story: doc.story, incidentDescription: doc.incidentDescription, premise: doc.premise, difficulty: doc.difficulty, suspects: doc.suspects, clueCount: doc.clues.length, discoveredClues: doc.clues.filter((clue) => discovered.has(clue.clueId)), evidence: doc.evidence, hintsRemaining: Math.max(0, doc.hints.length - doc.hintsUsed), hintsUsed: doc.hintsUsed, usedHints: doc.usedHints, discoveredClueIds: doc.discoveredClueIds, status: doc.status, createdAt: doc.createdAt };
}
function fullResult(doc) { return doc.result || calculateResult(doc, doc.accusation); }

export async function createCase(req, res, next) {
  try {
    const input = createRequestSchema.safeParse(req.body);
    if (!input.success) return fail(res, 400, 'Enter a premise of 20–1,000 characters and choose a supported difficulty.', 'INVALID_CASE_INPUT');
    const generated = await generateMystery(input.data);
    const accessToken = crypto.randomBytes(32).toString('base64url');
    const doc = await Case.create({ ...generated, premise: input.data.premise, difficulty: input.data.difficulty, accessTokenHash: tokenHash(accessToken) });
    res.status(201).json({ success: true, caseId: doc.id, accessToken, message: 'Mystery generated successfully', case: publicCase(doc) });
  } catch (error) {
    if (error.message?.includes('not configured')) {
      error.status = 503; error.code = 'GENERATION_NOT_CONFIGURED'; error.expose = true;
    } else if (error.message?.includes('could not produce')) {
      error.status = 502; error.code = 'GENERATION_INVALID'; error.expose = true;
    } else if (Number(error.status) === 429 || error.error?.error?.code === 'too_many_requests' || /rate limit|too many requests/i.test(error.message || '')) {
      error.status = 429; error.code = 'GEMINI_RATE_LIMITED'; error.message = 'Gemini has reached the request quota for the configured model. Check your Gemini API quota or retry after its reset.'; error.expose = true;
    } else if ([500, 502, 503, 504].includes(Number(error.status))) {
      error.status = 503; error.code = 'GEMINI_TEMPORARILY_UNAVAILABLE'; error.message = 'Gemini is temporarily unavailable. Please try again shortly.'; error.expose = true;
    } else if (Number(error.status) === 400) {
      error.status = 502; error.code = 'GEMINI_REQUEST_REJECTED'; error.message = 'Gemini rejected the generation request. Check the configured model and structured output schema.'; error.expose = true;
    }
    if (error.status >= 500 || error.status === 429) {
      console.error('[Case generation] Failed:', JSON.stringify(redactLogValue({ type: error.name, status: error.status, code: error.code, message: error.message })));
    }
    next(error);
  }
}
export async function getCase(req, res) {
  if (req.caseDocument.status === 'Completed') return fail(res, 409, 'This case is complete. Retrieve its result to review the solution.', 'CASE_COMPLETED');
  return res.json({ success: true, case: publicCase(req.caseDocument) });
}
export async function discoverClue(req, res) {
  const doc = req.caseDocument;
  if (doc.status !== 'Active') return fail(res, 409, 'Completed cases cannot be changed.', 'CASE_COMPLETED');
  if (!doc.clues.some((clue) => clue.clueId === req.params.clueId)) return fail(res, 404, 'Clue not found.', 'CLUE_NOT_FOUND');
  if (!doc.discoveredClueIds.includes(req.params.clueId)) { doc.discoveredClueIds.push(req.params.clueId); await doc.save(); }
  return res.json({ success: true, progress: { discoveredClueIds: doc.discoveredClueIds, status: doc.status } });
}
export async function requestHint(req, res) {
  const doc = req.caseDocument;
  if (doc.status !== 'Active') return fail(res, 409, 'Completed cases cannot be changed.', 'CASE_COMPLETED');
  if (doc.hintsUsed >= doc.hints.length) return fail(res, 409, 'No hints remain for this case.', 'HINT_LIMIT_REACHED');
  const hint = doc.hints[doc.hintsUsed]; doc.hintsUsed += 1; doc.usedHints.push(hint); await doc.save();
  return res.json({ success: true, hint, hintsUsed: doc.hintsUsed, hintsRemaining: doc.hints.length - doc.hintsUsed, usedHints: doc.usedHints });
}
export async function accuse(req, res) {
  const doc = req.caseDocument;
  if (doc.status !== 'Active') return fail(res, 409, 'A final accusation has already been submitted.', 'ACCUSATION_ALREADY_SUBMITTED');
  const { suspectId } = req.body || {};
  if (typeof suspectId !== 'string' || !doc.suspects.some((suspect) => suspect.suspectId === suspectId)) return fail(res, 400, 'Select a valid suspect before submitting.', 'INVALID_SUSPECT');
  doc.accusation = suspectId; doc.result = calculateResult(doc, suspectId); doc.score = doc.result.score; doc.status = 'Completed'; doc.completedAt = new Date(); await doc.save();
  return res.json({ success: true, result: doc.result });
}
export async function getResult(req, res) {
  if (req.caseDocument.status !== 'Completed') return fail(res, 409, 'The solution remains sealed until you submit an accusation.', 'CASE_ACTIVE');
  return res.json({ success: true, result: fullResult(req.caseDocument) });
}
