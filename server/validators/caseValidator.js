import { z } from 'zod';
import { DIFFICULTIES } from '../utils/difficulty.js';

const text = z.string().trim().min(1);
const suspectSchema = z.object({ suspectId: text, name: text, age: z.number().int().min(18).max(110), occupation: text, relationship: text, biography: text, motive: text, alibi: text, personality: text, avatarPrompt: text });
const clueSchema = z.object({ clueId: text, title: text, description: text, evidenceType: z.enum(['whatsapp', 'image', 'cctv', 'document', 'witness']), evidenceId: text, relevance: text });
const evidenceSchema = z.object({ evidenceId: text, title: text, type: z.enum(['whatsapp', 'image', 'cctv', 'document', 'witness']), description: text, content: z.record(z.unknown()), relatedSuspectIds: z.array(text), timestamp: z.string().optional().default(''), clueIds: z.array(text) });
export const generatedCaseSchema = z.object({ title: text, story: text, incidentDescription: text, suspects: z.array(suspectSchema), clues: z.array(clueSchema), evidence: z.array(evidenceSchema), hints: z.array(text), culpritId: text, solutionExplanation: text, reasoning: z.object({ motive: text, opportunity: text, evidenceConnections: z.array(text).min(2) }) });
export const createRequestSchema = z.object({ premise: z.string().trim().min(20).max(1000), difficulty: z.enum(['easy', 'medium', 'hard']) });

function unique(values) { return new Set(values).size === values.length; }
export function validateGeneratedCase(input, difficulty) {
  const parsed = generatedCaseSchema.safeParse(input);
  if (!parsed.success) return { success: false, issues: parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ') };
  const data = parsed.data; const required = DIFFICULTIES[difficulty]; const suspectIds = data.suspects.map((item) => item.suspectId); const clueIds = data.clues.map((item) => item.clueId); const evidenceIds = data.evidence.map((item) => item.evidenceId);
  const issues = [];
  if (data.suspects.length !== required.suspects) issues.push(`suspects must contain exactly ${required.suspects}`);
  if (data.clues.length !== required.clues) issues.push(`clues must contain exactly ${required.clues}`);
  if (data.hints.length !== required.hints) issues.push(`hints must contain exactly ${required.hints}`);
  if (!unique(suspectIds) || !unique(clueIds) || !unique(evidenceIds)) issues.push('all suspect, clue, and evidence IDs must be unique');
  if (!suspectIds.includes(data.culpritId)) issues.push('culpritId must refer to a generated suspect');
  const types = new Set(data.evidence.map((item) => item.type));
  for (const type of ['whatsapp', 'image', 'cctv', 'document', 'witness']) if (!types.has(type)) issues.push(`evidence must include type ${type}`);
  for (const clue of data.clues) {
    const linkedEvidence = data.evidence.find((item) => item.evidenceId === clue.evidenceId);
    if (!linkedEvidence) issues.push(`clue ${clue.clueId} references missing evidence ${clue.evidenceId}`);
    else if (linkedEvidence.type !== clue.evidenceType) issues.push(`clue ${clue.clueId} evidenceType does not match evidence`);
    else if (!linkedEvidence.clueIds.includes(clue.clueId)) issues.push(`evidence ${clue.evidenceId} must reference clue ${clue.clueId}`);
  }
  for (const evidence of data.evidence) {
    if (evidence.relatedSuspectIds.some((id) => !suspectIds.includes(id))) issues.push(`evidence ${evidence.evidenceId} references an unknown suspect`);
    if (evidence.clueIds.some((id) => !clueIds.includes(id))) issues.push(`evidence ${evidence.evidenceId} references an unknown clue`);
  }
  return issues.length ? { success: false, issues: issues.join('; ') } : { success: true, data };
}
