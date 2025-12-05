import { Router } from 'express';
import { entityController } from '../controllers/entity.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(requireAuth);

// Entity routes for specific blueprint
router.get('/blueprints/:blueprint_identifier/entities', (req, res) =>
    entityController.getAll(req, res)
);
router.get('/blueprints/:blueprint_identifier/entities/:entity_identifier', (req, res) =>
    entityController.getOne(req, res)
);
router.get('/blueprints/:blueprint_identifier/entities-count', (req, res) =>
    entityController.getCount(req, res)
);
router.post('/blueprints/:blueprint_identifier/entities', (req, res) =>
    entityController.create(req, res)
);
router.post('/blueprints/:blueprint_identifier/entities/bulk', (req, res) =>
    entityController.createMany(req, res)
);
router.patch('/blueprints/:blueprint_identifier/entities/:entity_identifier', (req, res) =>
    entityController.update(req, res)
);
router.put('/blueprints/:blueprint_identifier/entities/:entity_identifier', (req, res) =>
    entityController.replace(req, res)
);
router.delete('/blueprints/:blueprint_identifier/entities/:entity_identifier', (req, res) =>
    entityController.delete(req, res)
);
router.delete('/blueprints/:blueprint_identifier/all-entities', (req, res) =>
    entityController.deleteAll(req, res)
);
router.post('/blueprints/:blueprint_identifier/bulk/entities/delete', (req, res) =>
    entityController.deleteMany(req, res)
);
router.post('/blueprints/:blueprint_identifier/entities/search', (req, res) =>
    entityController.searchInBlueprint(req, res)
);

// Global entity routes
router.post('/entities/search', (req, res) =>
    entityController.search(req, res)
);
router.post('/entities/aggregate', (req, res) =>
    entityController.aggregate(req, res)
);
router.post('/entities/properties-history', (req, res) =>
    entityController.getHistory(req, res)
);

export default router;
