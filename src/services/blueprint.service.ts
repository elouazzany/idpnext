import { getAuthHeader } from '@/utils/auth';
import { Blueprint, BlueprintProperty } from '@/types/blueprint';

const API_BASE = '/api';

export const blueprintApi = {
    async getAll(): Promise<Blueprint[]> {
        const response = await fetch(`${API_BASE}/blueprints`, {
            headers: getAuthHeader(),
        });
        if (!response.ok) throw new Error('Failed to fetch blueprints');
        return response.json();
    },

    async getById(id: string): Promise<Blueprint> {
        const response = await fetch(`${API_BASE}/blueprints/${id}`, {
            headers: getAuthHeader(),
        });
        if (!response.ok) throw new Error('Failed to fetch blueprint');
        return response.json();
    },

    async create(data: { title: string; identifier: string; icon: string; description?: string }): Promise<Blueprint> {
        const response = await fetch(`${API_BASE}/blueprints`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader(),
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create blueprint');
        return response.json();
    },

    async update(id: string, data: Partial<Blueprint>): Promise<Blueprint> {
        const response = await fetch(`${API_BASE}/blueprints/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader(),
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update blueprint');
        return response.json();
    },

    async delete(id: string): Promise<void> {
        const response = await fetch(`${API_BASE}/blueprints/${id}`, {
            method: 'DELETE',
            headers: getAuthHeader(),
        });
        if (!response.ok) throw new Error('Failed to delete blueprint');
    },

    async addProperty(blueprintId: string, data: Omit<BlueprintProperty, 'id' | 'blueprintId' | 'createdAt' | 'updatedAt'>): Promise<BlueprintProperty> {
        const response = await fetch(`${API_BASE}/blueprints/${blueprintId}/properties`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader(),
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to add property');
        return response.json();
    },

    async deleteProperty(propertyId: string): Promise<void> {
        const response = await fetch(`${API_BASE}/blueprints/properties/${propertyId}`, {
            method: 'DELETE',
            headers: getAuthHeader(),
        });
        if (!response.ok) throw new Error('Failed to delete property');
    }
};
