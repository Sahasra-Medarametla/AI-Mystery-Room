import mongoose from 'mongoose';

const suspectSchema = new mongoose.Schema({ suspectId: { type: String, required: true }, name: { type: String, required: true }, age: Number, occupation: String, relationship: String, biography: String, motive: String, alibi: String, personality: String, avatarPrompt: String }, { _id: false });
const clueSchema = new mongoose.Schema({ clueId: { type: String, required: true }, title: String, description: String, evidenceType: String, evidenceId: String, relevance: String }, { _id: false });
const evidenceSchema = new mongoose.Schema({ evidenceId: { type: String, required: true }, title: String, type: String, description: String, content: mongoose.Schema.Types.Mixed, relatedSuspectIds: [String], timestamp: Date, clueIds: [String] }, { _id: false });
const reasoningSchema = new mongoose.Schema({ motive: String, opportunity: String, evidenceConnections: [String] }, { _id: false });
const caseSchema = new mongoose.Schema({
  title: { type: String, required: true }, premise: { type: String, required: true }, story: { type: String, required: true }, incidentDescription: String,
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true }, suspects: [suspectSchema], clues: [clueSchema], evidence: [evidenceSchema], hints: [String],
  culpritId: { type: String, required: true, select: false }, solutionExplanation: { type: String, required: true, select: false }, reasoning: { type: reasoningSchema, select: false },
  accessTokenHash: { type: String, required: true, select: false }, discoveredClueIds: { type: [String], default: [] }, hintsUsed: { type: Number, default: 0 }, usedHints: { type: [String], default: [] },
  accusation: { type: String, default: null }, score: { type: Number, default: null }, status: { type: String, enum: ['Active', 'Completed'], default: 'Active' }, result: { type: mongoose.Schema.Types.Mixed, default: null }, completedAt: Date
}, { timestamps: { createdAt: true, updatedAt: false } });

export default mongoose.model('Case', caseSchema);
