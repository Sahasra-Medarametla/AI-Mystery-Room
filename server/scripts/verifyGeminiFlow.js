import 'dotenv/config';
import mongoose from 'mongoose';
import Case from '../models/Case.js';
import { connectDatabase } from '../config/db.js';

const baseUrl = (process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5000}/api`).replace(/\/$/, '');
const report = [];
async function request(path, { method = 'GET', token, body } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: { ...(body ? { 'content-type': 'application/json' } : {}), ...(token ? { 'x-case-token': token } : {}) },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(180_000)
  });
  const payload = await response.json().catch(() => ({}));
  return { response, payload };
}
function assert(condition, message) { if (!condition) throw new Error(message); }
async function expectStatus(path, status, options) {
  const result = await request(path, options);
  assert(result.response.status === status, `Expected ${status} from ${path}, received ${result.response.status}: ${result.payload.message || 'no message'}`);
  return result.payload;
}

try {
  assert(process.env.GEMINI_API_KEY, 'GEMINI_API_KEY is missing.');
  assert(process.env.MONGODB_URI, 'MONGODB_URI is missing.');
  await connectDatabase();
  const health = await request('/health');
  assert(health.response.ok && health.payload.status === 'ok', 'API health check failed.');
  report.push('API health endpoint: passed');

  const created = await request('/cases', { method: 'POST', body: {
    premise: 'During a storm-bound museum gala, a rare compass disappears from a locked display while five guests remain in the gallery.',
    difficulty: 'easy'
  } });
  assert(created.response.status === 201, `Case generation failed (${created.response.status}): ${created.payload.message || 'no message'}`);
  const { caseId, accessToken, case: activeCase } = created.payload;
  assert(caseId && accessToken && activeCase, 'Creation response omitted case credentials or public case data.');
  assert(activeCase.suspects.length === 3 && activeCase.clueCount === 5 && activeCase.hintsRemaining === 2, 'Generated Easy case has incorrect difficulty counts.');
  const activeJson = JSON.stringify(activeCase);
  assert(!activeJson.includes('culpritId') && !activeJson.includes('solutionExplanation') && !activeJson.includes('reasoning'), 'Active case response exposed solution fields.');
  report.push('Gemini generation, schema validation, exact Easy counts, and active-case secrecy: passed');

  const casePath = `/cases/${caseId}`;
  const retrieved = await expectStatus(casePath, 200, { token: accessToken });
  assert(retrieved.case.clueCount === 5, 'Retrieved active case did not preserve clue count.');
  const linkedEvidence = retrieved.case.evidence.find((item) => item.clueIds?.length);
  assert(linkedEvidence, 'Generated case contains no evidence linked to a clue.');
  const clueId = linkedEvidence.clueIds[0];
  const discovered = await expectStatus(`${casePath}/clues/${clueId}/discover`, 200, { method: 'POST', token: accessToken, body: {} });
  const duplicate = await expectStatus(`${casePath}/clues/${clueId}/discover`, 200, { method: 'POST', token: accessToken, body: {} });
  assert(discovered.progress.discoveredClueIds.length === 1 && duplicate.progress.discoveredClueIds.length === 1, 'Duplicate clue discovery changed the clue count.');
  report.push('Active case retrieval and idempotent clue discovery: passed');

  const firstHint = await expectStatus(`${casePath}/hints`, 200, { method: 'POST', token: accessToken, body: {} });
  const secondHint = await expectStatus(`${casePath}/hints`, 200, { method: 'POST', token: accessToken, body: {} });
  assert(firstHint.hintsRemaining === 1 && secondHint.hintsRemaining === 0, 'Hint count did not decrement correctly.');
  await expectStatus(`${casePath}/hints`, 409, { method: 'POST', token: accessToken, body: {} });
  report.push('Hint usage and hint limit: passed');

  const storedBeforeAccusation = await Case.findById(caseId).select('+culpritId');
  assert(storedBeforeAccusation && storedBeforeAccusation.discoveredClueIds.length === 1 && storedBeforeAccusation.hintsUsed === 2, 'Generated case progress was not persisted in MongoDB.');
  const correctSuspectId = storedBeforeAccusation.culpritId;
  const accusation = await expectStatus(`${casePath}/accuse`, 200, { method: 'POST', token: accessToken, body: { suspectId: correctSuspectId } });
  assert(accusation.result.correct && accusation.result.score === 85, 'Backend scoring did not apply the correct Easy-case formula.');
  await expectStatus(`${casePath}/accuse`, 409, { method: 'POST', token: accessToken, body: { suspectId: correctSuspectId } });
  const result = await expectStatus(`${casePath}/result`, 200, { token: accessToken });
  assert(result.result.correct && result.result.score === 85, 'Completed result retrieval did not return the saved result.');
  await expectStatus(casePath, 409, { token: accessToken });
  const storedCompleted = await Case.findById(caseId).select('+culpritId');
  assert(storedCompleted.status === 'Completed' && storedCompleted.score === 85, 'Completed result was not saved to MongoDB.');
  report.push('Accusation, backend scoring, duplicate protection, completed-result retrieval, and MongoDB persistence: passed');

  console.log(report.join('\n'));
  console.log(`Case saved in MongoDB: ${caseId}`);
} catch (error) {
  console.error(`Integration check failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect().catch(() => {});
}
