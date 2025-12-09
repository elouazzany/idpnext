// Port.io compatible entity types

export interface Entity {
    id: string;
    identifier: string;
    blueprintId: string;
    title?: string;
    description?: string;
    properties: Record<string, any>;
    relations: Record<string, any>;
    team?: string;
    icon?: string;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;
    organizationId?: string;
    tenantId?: string;
}

export interface EntityHistory {
    id: string;
    entityId: string;
    blueprintId: string;
    entityIdentifier: string;
    propertyName?: string;
    oldValue?: any;
    newValue?: any;
    changeType: 'CREATE' | 'UPDATE' | 'DELETE' | 'PROPERTY_UPDATE';
    changedAt: string;
    changedBy?: string;
    snapshot: any;
    organizationId?: string;
    tenantId?: string;
}

export interface CreateEntityData {
    identifier: string;
    title?: string;
    description?: string;
    properties?: Record<string, any>;
    relations?: Record<string, any>;
    team?: string;
    icon?: string;
}

export interface UpdateEntityData {
    title?: string;
    description?: string;
    properties?: Record<string, any>;
    relations?: Record<string, any>;
    team?: string;
    icon?: string;
}

export interface SearchRule {
    property: string;
    operator: 'eq' | 'neq' | 'in' | 'contains' | 'gt' | 'gte' | 'lt' | 'lte' | 'between';
    value: any;
}

export interface SearchQuery {
    rules?: SearchRule[];
    combinator?: 'and' | 'or';
    limit?: number;
    offset?: number;
}

export interface AggregateQuery {
    blueprintId: string;
    function: 'count' | 'sum' | 'avg' | 'min' | 'max';
    property?: string;
    groupBy?: string[];
    rules?: SearchRule[];
}

export interface EntityHistoryQuery {
    blueprintId: string;
    identifier: string;
    properties?: string[];
    startDate?: string;
    endDate?: string;
}

export interface BulkCreateResult {
    success: boolean;
    entity?: Entity;
    error?: string;
    identifier: string;
}

export interface BulkDeleteResult {
    success: boolean;
    identifier: string;
    error?: string;
}

// API Response types
export interface EntitiesResponse {
    ok: boolean;
    entities: Entity[];
    total: number;
}

export interface EntityResponse {
    ok: boolean;
    entity: Entity;
}

export interface EntityCountResponse {
    ok: boolean;
    count: number;
}

export interface BulkCreateResponse {
    ok: boolean;
    results: BulkCreateResult[];
}

export interface BulkDeleteResponse {
    ok: boolean;
    message: string;
    results: BulkDeleteResult[];
}

export interface SearchResponse {
    ok: boolean;
    entities: Entity[];
    total: number;
}

export interface AggregateResponse {
    ok: boolean;
    result: {
        function: string;
        property?: string;
        value: any;
    };
}

export interface HistoryResponse {
    ok: boolean;
    history: EntityHistory[];
}
