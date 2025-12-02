export interface BlueprintProperty {
    id: string;
    title: string;
    identifier: string;
    type: string;
    required: boolean;
    description?: string;
    icon?: string;
    defaultValue?: string;
    blueprintId?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Blueprint {
    id: string;
    title: string;
    identifier: string;
    icon: string;
    description?: string;
    properties: BlueprintProperty[];
    relations: any[];
    createdAt?: string;
    updatedAt?: string;
}
