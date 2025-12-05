import { getAuthHeader } from '@/utils/auth';
import { Blueprint, BlueprintsResponse, BlueprintResponse } from '@/types/blueprint';

const API_BASE = '/api';

export const blueprintApi = {
    async getAll(): Promise<Blueprint[]> {
        const response = await fetch(`${API_BASE}/blueprints`, {
            headers: getAuthHeader(),
        });
        if (!response.ok) throw new Error('Failed to fetch blueprints');
        const data: BlueprintsResponse = await response.json();
        return data.blueprints;
    },

    async getById(id: string): Promise<Blueprint> {
        const response = await fetch(`${API_BASE}/blueprints/${id}`, {
            headers: getAuthHeader(),
        });
        if (!response.ok) throw new Error('Failed to fetch blueprint');
        const data: BlueprintResponse = await response.json();
        return data.blueprint;
    },

    async create(blueprint: Partial<Blueprint>): Promise<Blueprint> {
        const response = await fetch(`${API_BASE}/blueprints`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader(),
            },
            body: JSON.stringify(blueprint),
        });
        if (!response.ok) throw new Error('Failed to create blueprint');
        const data: BlueprintResponse = await response.json();
        return data.blueprint;
    },

    async update(id: string, blueprint: Partial<Blueprint>): Promise<Blueprint> {

        const response = await fetch(`${API_BASE}/blueprints/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader(),
            },
            body: JSON.stringify(blueprint),
        });
        if (!response.ok) throw new Error('Failed to update blueprint');
        const data: BlueprintResponse = await response.json();
        return data.blueprint;
    },

    async delete(id: string): Promise<void> {
        console.log('[blueprintApi] Deleting blueprint with identifier:', id);
        const response = await fetch(`${API_BASE}/blueprints/${id}`, {
            method: 'DELETE',
            headers: getAuthHeader(),
        });
        console.log('[blueprintApi] Delete response status:', response.status);
        if (!response.ok) {
            const errorText = await response.text();
            console.error('[blueprintApi] Delete failed:', errorText);
            throw new Error('Failed to delete blueprint');
        }
    }
};
