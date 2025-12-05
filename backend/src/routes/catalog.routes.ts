import { Router } from 'express';
import { catalogController } from '../controllers/catalog.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(requireAuth);

// Folder routes
router.get('/folders', (req, res) => catalogController.getAllFolders(req, res));
router.get('/folders/tree', (req, res) => catalogController.getFolderTree(req, res));
router.get('/folders/:id', (req, res) => catalogController.getFolder(req, res));
router.post('/folders', (req, res) => catalogController.createFolder(req, res));
router.patch('/folders/:id', (req, res) => catalogController.updateFolder(req, res));
router.delete('/folders/:id', (req, res) => catalogController.deleteFolder(req, res));

// Page routes
router.get('/pages', (req, res) => catalogController.getAllPages(req, res));
router.get('/pages/:id', (req, res) => catalogController.getPage(req, res));
router.post('/pages', (req, res) => catalogController.createPage(req, res));
router.patch('/pages/:id', (req, res) => catalogController.updatePage(req, res));
router.delete('/pages/:id', (req, res) => catalogController.deletePage(req, res));

// Reorder route
router.post('/reorder', (req, res) => catalogController.reorderItems(req, res));

export default router;
