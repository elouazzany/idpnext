import { getAuthHeader } from '../utils/auth';
import {
    Entity,
    CreateEntityData,
    UpdateEntityData,
    SearchQuery,
    AggregateQuery,
    EntityHistoryQuery,
    EntitiesResponse,
    EntityResponse,
    EntityCountResponse,
    BulkCreateResponse,
    BulkDeleteResponse,
    SearchResponse,
    AggregateResponse,
    HistoryResponse
} from '../types/entity';

const API_BASE = '/api';

/**
 * Entity Service - Port.io compatible API
 * Implements all entity operations as per Port API documentation
 */
class EntityService {
    /**
     * Get all entities of a blueprint
     * GET /api/v1/blueprints/:blueprint_identifier/entities
     */
    async getAll(
        blueprintIdentifier: string,
        limit?: number,
        offset?: number
    ): Promise<EntitiesResponse> {
        const params = new URLSearchParams();
        if (limit) params.append('limit', limit.toString());
        if (offset) params.append('offset', offset.toString());

        const queryString = params.toString();
        const url = `${API_BASE}/v1/blueprints/${blueprintIdentifier}/entities${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(url, {
            headers: getAuthHeader()
        });

        if (!response.ok) throw new Error('Failed to fetch entities');
        return response.json();
    }

    /**
     * Get a single entity
     * GET /api/v1/blueprints/:blueprint_identifier/entities/:entity_identifier
     */
    async getOne(
        blueprintIdentifier: string,
        entityIdentifier: string
    ): Promise<EntityResponse> {
        const response = await fetch(
            `${API_BASE}/v1/blueprints/${blueprintIdentifier}/entities/${entityIdentifier}`,
            { headers: getAuthHeader() }
        );

        if (!response.ok) throw new Error('Failed to fetch entity');
        return response.json();
    }

    /**
     * Get entity count for a blueprint
     * GET /api/v1/blueprints/:blueprint_identifier/entities-count
     */
    async getCount(blueprintIdentifier: string): Promise<EntityCountResponse> {
        const response = await fetch(
            `${API_BASE}/v1/blueprints/${blueprintIdentifier}/entities-count`,
            { headers: getAuthHeader() }
        );

        if (!response.ok) throw new Error('Failed to fetch entity count');
        return response.json();
    }

    /**
     * Create an entity
     * POST /api/v1/blueprints/:blueprint_identifier/entities
     */
    async create(
        blueprintIdentifier: string,
        data: CreateEntityData
    ): Promise<EntityResponse> {
        const response = await fetch(
            `${API_BASE}/v1/blueprints/${blueprintIdentifier}/entities`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify(data)
            }
        );

        if (!response.ok) throw new Error('Failed to create entity');
        return response.json();
    }

    /**
     * Create multiple entities (bulk)
     * POST /api/v1/blueprints/:blueprint_identifier/entities/bulk
     */
    async createMany(
        blueprintIdentifier: string,
        entities: CreateEntityData[]
    ): Promise<BulkCreateResponse> {
        const response = await fetch(
            `${API_BASE}/v1/blueprints/${blueprintIdentifier}/entities/bulk`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify({ entities })
            }
        );

        if (!response.ok) throw new Error('Failed to create entities');
        return response.json();
    }

    /**
     * Update an entity (partial update)
     * PATCH /api/v1/blueprints/:blueprint_identifier/entities/:entity_identifier
     */
    async update(
        blueprintIdentifier: string,
        entityIdentifier: string,
        data: UpdateEntityData
    ): Promise<EntityResponse> {
        const response = await fetch(
            `${API_BASE}/v1/blueprints/${blueprintIdentifier}/entities/${entityIdentifier}`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify(data)
            }
        );

        if (!response.ok) throw new Error('Failed to update entity');
        return response.json();
    }

    /**
     * Replace an entity (full replacement)
     * PUT /api/v1/blueprints/:blueprint_identifier/entities/:entity_identifier
     */
    async replace(
        blueprintIdentifier: string,
        entityIdentifier: string,
        data: CreateEntityData
    ): Promise<EntityResponse> {
        const response = await fetch(
            `${API_BASE}/v1/blueprints/${blueprintIdentifier}/entities/${entityIdentifier}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify(data)
            }
        );

        if (!response.ok) throw new Error('Failed to replace entity');
        return response.json();
    }

    /**
     * Delete an entity
     * DELETE /api/v1/blueprints/:blueprint_identifier/entities/:entity_identifier
     */
    async delete(
        blueprintIdentifier: string,
        entityIdentifier: string
    ): Promise<{ ok: boolean; message: string }> {
        const response = await fetch(
            `${API_BASE}/v1/blueprints/${blueprintIdentifier}/entities/${entityIdentifier}`,
            {
                method: 'DELETE',
                headers: getAuthHeader()
            }
        );

        if (!response.ok) throw new Error('Failed to delete entity');
        return response.json();
    }

    /**
     * Delete all entities of a blueprint
     * DELETE /api/v1/blueprints/:blueprint_identifier/all-entities
     */
    async deleteAll(
        blueprintIdentifier: string
    ): Promise<{ ok: boolean; message: string }> {
        const response = await fetch(
            `${API_BASE}/v1/blueprints/${blueprintIdentifier}/all-entities`,
            {
                method: 'DELETE',
                headers: getAuthHeader()
            }
        );

        if (!response.ok) throw new Error('Failed to delete all entities');
        return response.json();
    }

    /**
     * Delete multiple entities
     * POST /api/v1/blueprints/:blueprint_identifier/bulk/entities/delete
     */
    async deleteMany(
        blueprintIdentifier: string,
        identifiers: string[],
        deleteDependents: boolean = false
    ): Promise<BulkDeleteResponse> {
        const response = await fetch(
            `${API_BASE}/v1/blueprints/${blueprintIdentifier}/bulk/entities/delete`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify({
                    identifiers,
                    delete_dependents: deleteDependents
                })
            }
        );

        if (!response.ok) throw new Error('Failed to delete entities');
        return response.json();
    }

    /**
     * Search entities
     * POST /api/v1/entities/search
     */
    async search(query: SearchQuery): Promise<SearchResponse> {
        const response = await fetch(
            `${API_BASE}/v1/entities/search`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify(query)
            }
        );

        if (!response.ok) throw new Error('Failed to search entities');
        return response.json();
    }

    /**
     * Search entities within a specific blueprint
     * POST /api/v1/blueprints/:blueprint_identifier/entities/search
     */
    async searchInBlueprint(
        blueprintIdentifier: string,
        query: SearchQuery
    ): Promise<SearchResponse> {
        const response = await fetch(
            `${API_BASE}/v1/blueprints/${blueprintIdentifier}/entities/search`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify(query)
            }
        );

        if (!response.ok) throw new Error('Failed to search entities in blueprint');
        return response.json();
    }

    /**
     * Aggregate entities
     * POST /api/v1/entities/aggregate
     */
    async aggregate(query: AggregateQuery): Promise<AggregateResponse> {
        const response = await fetch(
            `${API_BASE}/v1/entities/aggregate`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify(query)
            }
        );

        if (!response.ok) throw new Error('Failed to aggregate entities');
        return response.json();
    }

    /**
     * Get entity property history
     * POST /api/v1/entities/properties-history
     */
    async getHistory(query: EntityHistoryQuery): Promise<HistoryResponse> {
        const response = await fetch(
            `${API_BASE}/v1/entities/properties-history`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify(query)
            }
        );

        if (!response.ok) throw new Error('Failed to get entity history');
        return response.json();
    }
}

export const entityService = new EntityService();
export default entityService;
