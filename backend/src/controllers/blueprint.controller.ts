import { Request, Response } from 'express';
import { blueprintService } from '../services/blueprint.service.js';

export const getBlueprints = async (req: Request, res: Response) => {
    try {
        const blueprints = await blueprintService.getAll();
        res.json(blueprints);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch blueprints' });
    }
};

export const getBlueprint = async (req: Request, res: Response) => {
    try {
        const blueprint = await blueprintService.getById(req.params.id);
        if (!blueprint) {
            return res.status(404).json({ error: 'Blueprint not found' });
        }
        res.json(blueprint);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch blueprint' });
    }
};

export const createBlueprint = async (req: Request, res: Response) => {
    try {
        const blueprint = await blueprintService.create(req.body);
        res.status(201).json(blueprint);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create blueprint' });
    }
};

export const updateBlueprint = async (req: Request, res: Response) => {
    try {
        const blueprint = await blueprintService.update(req.params.id, req.body);
        res.json(blueprint);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update blueprint' });
    }
};

export const deleteBlueprint = async (req: Request, res: Response) => {
    try {
        await blueprintService.delete(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete blueprint' });
    }
};

export const addProperty = async (req: Request, res: Response) => {
    try {
        const property = await blueprintService.addProperty(req.params.id, req.body);
        res.status(201).json(property);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add property' });
    }
};

export const deleteProperty = async (req: Request, res: Response) => {
    try {
        await blueprintService.deleteProperty(req.params.propertyId);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete property' });
    }
};
