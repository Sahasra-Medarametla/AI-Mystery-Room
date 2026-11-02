import { Router } from 'express';
import { accuse, createCase, discoverClue, getCase, getResult, requestHint } from '../controllers/caseController.js';
import { requireCaseAccess } from '../middleware/caseAccess.js';

const router = Router();
router.post('/', createCase);
router.get('/:id', requireCaseAccess, getCase);
router.get('/:id/result', requireCaseAccess, getResult);
router.post('/:id/clues/:clueId/discover', requireCaseAccess, discoverClue);
router.post('/:id/hints', requireCaseAccess, requestHint);
router.post('/:id/accuse', requireCaseAccess, accuse);
export default router;
