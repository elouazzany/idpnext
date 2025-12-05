// Port.io compatible types
export interface BlueprintPropertyDefinition {
    type: string;
    title: string;
    description?: string;
    icon?: string;
    default?: any;
    enum?: string[];
    format?: string;
    items?: {
        type: string;
    };
}

export interface BlueprintSchema {
    properties: Record<string, BlueprintPropertyDefinition>;
    required: string[];
}

export interface BlueprintRelation {
    title: string;
    target: string;
    required: boolean;
    many: boolean;
}

export interface Blueprint {
    identifier: string;
    title: string;
    icon: string;
    description?: string;
    schema: {
        properties: Record<string, BlueprintPropertyDefinition>;
        required: string[];
    };
    mirrorProperties?: Record<string, any>;
    calculationProperties?: Record<string, any>;
    aggregationProperties?: Record<string, any>;
    relations?: Record<string, BlueprintRelation>;
    changelogDestination?: any;
    createdAt?: string;
    updatedAt?: string;
}

export interface BlueprintsResponse {
    ok: boolean;
    blueprints: Blueprint[];
}

export interface BlueprintResponse {
    ok: boolean;
    blueprint: Blueprint;
}
