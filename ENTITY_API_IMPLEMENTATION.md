# Port.io Entity API Implementation

## Overview
This document describes the complete implementation of the Port.io Entity API, including all endpoints, features, and data models.

## Implemented Features

### 1. Database Schema (Prisma)
- **Entity Model**: Stores entity data with support for multi-tenancy
  - Unique identifier per blueprint and organization/tenant
  - JSON properties and relations storage
  - Audit fields (createdBy, updatedBy, timestamps)
  - Team and icon metadata

- **EntityHistory Model**: Tracks all changes to entities
  - Property-level change tracking
  - Full entity snapshots at each change
  - Change type categorization (CREATE, UPDATE, DELETE, PROPERTY_UPDATE)
  - Time-based querying support

### 2. Backend API Endpoints

#### Entity CRUD Operations
- `GET /api/v1/blueprints/:blueprint_identifier/entities` - Get all entities
- `GET /api/v1/blueprints/:blueprint_identifier/entities/:entity_identifier` - Get single entity
- `GET /api/v1/blueprints/:blueprint_identifier/entities-count` - Get entity count
- `POST /api/v1/blueprints/:blueprint_identifier/entities` - Create entity
- `PATCH /api/v1/blueprints/:blueprint_identifier/entities/:entity_identifier` - Update entity (partial)
- `PUT /api/v1/blueprints/:blueprint_identifier/entities/:entity_identifier` - Replace entity (full)
- `DELETE /api/v1/blueprints/:blueprint_identifier/entities/:entity_identifier` - Delete entity

#### Bulk Operations
- `POST /api/v1/blueprints/:blueprint_identifier/entities/bulk` - Create multiple entities (max 20)
- `POST /api/v1/blueprints/:blueprint_identifier/bulk/entities/delete` - Delete multiple entities (max 100)
- `DELETE /api/v1/blueprints/:blueprint_identifier/all-entities` - Delete all entities of blueprint

#### Search & Query Operations
- `POST /api/v1/entities/search` - Search entities across all blueprints
- `POST /api/v1/blueprints/:blueprint_identifier/entities/search` - Search within blueprint

##### Supported Search Operators
- `eq` - Equals
- `neq` - Not equals
- `in` - In array
- `contains` - Contains substring
- `gt` - Greater than
- `gte` - Greater than or equal
- `lt` - Less than
- `lte` - Less than or equal
- `between` - Between values

##### Search Combinators
- `and` - All rules must match
- `or` - Any rule must match

#### Aggregation Operations
- `POST /api/v1/entities/aggregate` - Aggregate entities

##### Supported Aggregation Functions
- `count` - Count entities
- `sum` - Sum numeric property
- `avg` - Average numeric property
- `min` - Minimum value
- `max` - Maximum value

#### History Operations
- `POST /api/v1/entities/properties-history` - Get entity property history
  - Filter by specific properties
  - Filter by date range
  - Full snapshot at each change point

### 3. Port.io API Compliance

All endpoints follow Port.io API specifications:
- **HTTP Status Codes**:
  - `200` - Success
  - `201` - Created
  - `207` - Multi-Status (partial success in bulk operations)
  - `401` - Unauthorized
  - `404` - Not found
  - `413` - Request body too large (>1MiB)
  - `422` - JSON schema validation error

- **Request Size Limits**:
  - Maximum request body: 1 MiB
  - Bulk create: Max 20 entities per request
  - Bulk delete: Max 100 entities per request

- **Response Format**:
  - All responses include `ok` boolean
  - Error responses include descriptive error messages
  - Bulk operations return detailed per-entity results

### 4. Service Layer Features

#### EntityService (`backend/src/services/entity.service.ts`)
- Full CRUD operations
- Automatic upsert on create (update if exists)
- Multi-tenancy support
- Automatic history tracking
- Search with complex query rules
- Aggregation with grouping support
- Property-level history tracking
- Transaction safety for bulk operations

#### Key Features:
- **Automatic History**: Every change is automatically tracked
- **Multi-tenancy**: Organization and tenant isolation
- **Flexible Properties**: JSON-based property storage for dynamic schemas
- **Relations**: Support for entity relationships
- **Pagination**: Built-in limit/offset pagination
- **Error Handling**: Graceful error handling with detailed messages

### 5. Frontend Integration

#### TypeScript Types (`src/types/entity.ts`)
Complete type definitions for:
- Entity
- EntityHistory
- CreateEntityData
- UpdateEntityData
- SearchQuery
- AggregateQuery
- All API response types

#### Entity Service (`src/services/entity.service.ts`)
Frontend service with all API operations:
- Type-safe API calls
- Async/await pattern
- Error handling
- Query parameter building

## Usage Examples

### Create an Entity
```typescript
import { entityService } from './services/entity.service';

const entity = await entityService.create('microservice', {
  identifier: 'payment-service',
  title: 'Payment Service',
  properties: {
    language: 'TypeScript',
    version: '1.0.0',
    status: 'active'
  },
  relations: {
    database: ['postgres-db']
  }
});
```

### Search Entities
```typescript
const results = await entityService.search({
  rules: [
    { property: 'status', operator: 'eq', value: 'active' },
    { property: 'version', operator: 'gte', value: '1.0.0' }
  ],
  combinator: 'and',
  limit: 20,
  offset: 0
});
```

### Bulk Create
```typescript
const result = await entityService.createMany('microservice', [
  {
    identifier: 'auth-service',
    title: 'Auth Service',
    properties: { language: 'Go' }
  },
  {
    identifier: 'notification-service',
    title: 'Notification Service',
    properties: { language: 'Python' }
  }
]);
```

### Aggregate Data
```typescript
const stats = await entityService.aggregate({
  blueprintId: 'microservice',
  function: 'count',
  groupBy: ['properties.language']
});
```

### Get Entity History
```typescript
const history = await entityService.getHistory({
  blueprintId: 'microservice',
  identifier: 'payment-service',
  properties: ['status', 'version'],
  startDate: '2025-01-01T00:00:00Z',
  endDate: '2025-12-31T23:59:59Z'
});
```

## Multi-tenancy Support

All entity operations support multi-tenancy:
- Entities are isolated by `organizationId` and `tenantId`
- Automatic filtering based on authenticated user's context
- History tracking includes tenant information

## Performance Considerations

1. **Indexing**: Database indexes on:
   - blueprintId
   - identifier
   - organizationId
   - tenantId
   - createdAt, updatedAt
   - entityId (for history)

2. **Pagination**: All list operations support limit/offset

3. **Query Optimization**:
   - Efficient WHERE clause building
   - Parallel count queries
   - JSON field querying for properties

## Security

1. **Authentication**: All routes protected by authentication middleware
2. **Multi-tenancy**: Automatic filtering prevents cross-tenant access
3. **Input Validation**: Request size limits and schema validation
4. **Audit Trail**: Complete history of all entity changes

## Future Enhancements

Potential improvements:
1. Advanced aggregation with time-series support
2. Full-text search on entity properties
3. Webhook notifications for entity changes
4. Export entities to various formats
5. Import entities from external sources
6. Entity validation against blueprint schema
7. Relationship integrity checking
8. Advanced query builders for complex searches

## Files Modified/Created

### Backend
- `backend/prisma/schema.prisma` - Added Entity and EntityHistory models
- `backend/src/services/entity.service.ts` - Entity business logic
- `backend/src/controllers/entity.controller.ts` - HTTP controllers
- `backend/src/routes/entities.routes.ts` - API routes
- `backend/src/server.ts` - Registered entity routes

### Frontend
- `src/types/entity.ts` - TypeScript type definitions
- `src/services/entity.service.ts` - Frontend API service

### Database
- Migration: `20251203201701_add_entity_models`

## Testing

To test the API:

1. **Create a blueprint** first (entities require a blueprint)
2. **Create entities** using POST `/api/v1/blueprints/:id/entities`
3. **Query entities** using GET or POST search endpoints
4. **Update entities** using PATCH or PUT
5. **View history** using POST `/api/v1/entities/properties-history`
6. **Delete entities** using DELETE endpoints

## API Documentation

For detailed Port.io API reference:
- [Create Entity](https://docs.port.io/api-reference/create-an-entity)
- [Get Entities](https://docs.port.io/api-reference/get-all-entities-of-a-blueprint)
- [Update Entity](https://docs.port.io/api-reference/update-an-entity)
- [Delete Entity](https://docs.port.io/api-reference/delete-an-entity)
- [Search Entities](https://docs.port.io/api-reference/search-entities)
- [Aggregate Entities](https://docs.port.io/api-reference/aggregate-entities)
