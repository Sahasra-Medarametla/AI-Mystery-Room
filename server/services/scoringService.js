import { DIFFICULTIES } from '../utils/difficulty.js';

export function calculateResult(caseDocument, suspectId) {
  const correct = suspectId === caseDocument.culpritId;
  const culprit = caseDocument.suspects.find((suspect) => suspect.suspectId === caseDocument.culpritId);
  const accused = caseDocument.suspects.find((suspect) => suspect.suspectId === suspectId);
  const baseScore = DIFFICULTIES[caseDocument.difficulty].baseScore;
  const discoveredClues = caseDocument.discoveredClueIds.length;
  const cluePoints = discoveredClues * 5;
  const hintPenalty = caseDocument.hintsUsed * 10;
  const score = correct ? Math.max(0, baseScore + cluePoints - hintPenalty) : 0;
  return { correct, accusedSuspectId: suspectId, accusedName: accused?.name, culpritId: caseDocument.culpritId, culpritName: culprit?.name, difficulty: caseDocument.difficulty, score, baseScore: correct ? baseScore : 0, discoveredClues, cluePoints: correct ? cluePoints : 0, hintsUsed: caseDocument.hintsUsed, hintPenalty: correct ? hintPenalty : 0, explanation: caseDocument.solutionExplanation, reasoning: caseDocument.reasoning, keyClues: caseDocument.reasoning?.evidenceConnections || [] };
}
