import { Router } from 'express';
import * as blueprintController from '../controllers/blueprint.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', blueprintController.getBlueprints);
router.get('/:id', blueprintController.getBlueprint);
router.post('/', blueprintController.createBlueprint);
router.put('/:id', blueprintController.updateBlueprint);
router.delete('/:id', blueprintController.deleteBlueprint);

export default router;
