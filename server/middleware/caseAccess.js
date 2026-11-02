import crypto from 'node:crypto';
import Case from '../models/Case.js';

export const tokenHash = (token) => crypto.createHash('sha256').update(token).digest('hex');
export async function requireCaseAccess(req, res, next) {
  try {
    if (!/^[a-f\d]{24}$/i.test(req.params.id)) return res.status(404).json({ success: false, message: 'Case not found.', errorCode: 'CASE_NOT_FOUND' });
    const token = req.get('x-case-token');
    if (!token || token.length < 32 || token.length > 256) return res.status(404).json({ success: false, message: 'Case not found.', errorCode: 'CASE_NOT_FOUND' });
    const doc = await Case.findOne({ _id: req.params.id, accessTokenHash: tokenHash(token) }).select('+culpritId +solutionExplanation +reasoning +accessTokenHash');
    if (!doc) return res.status(404).json({ success: false, message: 'Case not found.', errorCode: 'CASE_NOT_FOUND' });
    req.caseDocument = doc; next();
  } catch (error) { next(error); }
}
