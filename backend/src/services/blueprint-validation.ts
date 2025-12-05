import { z } from 'zod';

/**
 * Blueprint Schema Validation Service
 * Validates blueprint schemas according to Port.io API specifications
 */

// Property identifier pattern: ^[A-Za-z0-9@_=\\-]+$ (max 100 chars)
const propertyIdentifierSchema = z.string()
    .max(100, 'Property identifier must be at most 100 characters')
    .regex(/^[A-Za-z0-9@_=\\-]+$/, 'Property identifier must match pattern: ^[A-Za-z0-9@_=\\-]+$');

// Blueprint identifier pattern (same as property)
const blueprintIdentifierSchema = z.string()
    .max(100, 'Blueprint identifier must be at most 100 characters')
    .regex(/^[A-Za-z0-9@_=\\-]+$/, 'Blueprint identifier must match pattern: ^[A-Za-z0-9@_=\\-]+$');

// Property types
const propertyTypeSchema = z.enum(['string', 'number', 'boolean', 'object', 'array'], {
    errorMap: () => ({ message: 'Type must be one of: string, number, boolean, object, array' })
});

// String formats
const stringFormatSchema = z.enum([
    'date-time', 'url', 'email', 'idn-email', 'ipv4', 'ipv6',
    'markdown', 'yaml', 'user', 'blueprints', 'team', 'timer', 'proto'
]);

// Spec types
const specTypeSchema = z.enum(['open-api', 'embedded-url', 'async-api']);

// Spec authentication (required when spec is embedded-url)
const specAuthenticationSchema = z.object({
    clientId: z.string({ required_error: 'clientId is required' }),
    authorizationUrl: z.string().url('authorizationUrl must be a valid URL'),
    tokenUrl: z.string().url('tokenUrl must be a valid URL'),
    authorizationScope: z.array(z.string()).default(['openid'])
});

// Property definition schema
const propertyDefinitionSchema = z.object({
    type: propertyTypeSchema,
    title: z.string().max(100, 'Property title must be at most 100 characters').optional(),
    description: z.string().optional(),
    icon: z.string().optional(),
    format: stringFormatSchema.optional(),
    spec: specTypeSchema.optional(),
    specAuthentication: specAuthenticationSchema.optional(),
    default: z.any().optional(),
    enum: z.array(z.any()).optional(),
    enumColors: z.record(z.string(), z.string()).optional(),
    // String-specific fields
    minLength: z.number().int().min(0).optional(),
    maxLength: z.number().int().min(0).optional(),
    pattern: z.string().optional(),
    // Number-specific fields
    minimum: z.number().optional(),
    maximum: z.number().optional(),
    // Array-specific fields
    items: z.object({
        type: z.string(),
        format: z.string().optional(),
        enum: z.array(z.any()).optional(),
        enumColors: z.record(z.string(), z.string()).optional()
    }).passthrough().optional()
}).passthrough().refine((data) => {
    // If spec is embedded-url, specAuthentication is required
    if (data.spec === 'embedded-url' && !data.specAuthentication) {
        return false;
    }
    return true;
}, {
    message: 'specAuthentication is required when spec is "embedded-url"',
    path: ['specAuthentication']
});

// Blueprint schema validation
const blueprintSchemaSchema = z.object({
    properties: z.record(z.string(), propertyDefinitionSchema).default({}),
    required: z.array(z.string()).default([])
}).refine((data) => {
    // Validate property identifiers match the pattern
    const propertyKeys = Object.keys(data.properties);
    for (const key of propertyKeys) {
        const result = propertyIdentifierSchema.safeParse(key);
        if (!result.success) {
            return false;
        }
    }
    return true;
}, {
    message: 'All property identifiers must match pattern: ^[A-Za-z0-9@_=\\-]+$ and be at most 100 characters'
}).refine((data) => {
    // All required fields must exist in properties
    const propertyKeys = Object.keys(data.properties);
    const invalidRequired = data.required.filter(key => !propertyKeys.includes(key));
    if (invalidRequired.length > 0) {
        return false;
    }
    return true;
}, {
    message: 'All required fields must exist in properties'
});

// Relation schema
const relationSchema = z.object({
    title: z.string(),
    target: z.string(),
    required: z.boolean(),
    many: z.boolean()
});

// Full blueprint validation schema
export const blueprintValidationSchema = z.object({
    identifier: blueprintIdentifierSchema,
    title: z.string().min(1, 'Title is required').max(100, 'Title must be at most 100 characters'),
    icon: z.string().optional(),
    description: z.string().max(200, 'Description must be at most 200 characters').optional(),
    schema: blueprintSchemaSchema.optional().default({ properties: {}, required: [] }),
    relations: z.record(z.string(), relationSchema).optional(),
    mirrorProperties: z.any().optional(),
    calculationProperties: z.any().optional(),
    aggregationProperties: z.any().optional(),
    changelogDestination: z.any().optional()
});

// Validation function
export interface ValidationResult {
    success: boolean;
    errors?: Array<{
        path: string;
        message: string;
    }>;
    data?: any;
}

export function validateBlueprintSchema(data: any): ValidationResult {
    const result = blueprintValidationSchema.safeParse(data);

    if (!result.success) {
        const errors = result.error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
        }));

        return {
            success: false,
            errors
        };
    }

    return {
        success: true,
        data: result.data
    };
}

// Validate only the schema portion (for updates)
export function validateSchemaOnly(schema: any): ValidationResult {
    const result = blueprintSchemaSchema.safeParse(schema);

    if (!result.success) {
        const errors = result.error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
        }));

        return {
            success: false,
            errors
        };
    }

    return {
        success: true,
        data: result.data
    };
}
