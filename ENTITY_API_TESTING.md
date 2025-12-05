# Entity API Testing Guide

## Prerequisites

1. Backend server running on `http://localhost:8080`
2. Valid authentication token (JWT)
3. At least one blueprint created
4. Organization and tenant setup

## Authentication

All entity endpoints require authentication. Include the JWT token in the Authorization header:

```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

## API Endpoints

### 1. Create an Entity

**Endpoint:** `POST /api/v1/blueprints/:blueprint_identifier/entities`

**Example Request:**
```bash
curl -X POST http://localhost:8080/api/v1/blueprints/microservice/entities \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "identifier": "payment-service",
    "title": "Payment Service",
    "properties": {
      "language": "TypeScript",
      "version": "1.0.0",
      "status": "active",
      "team": "backend"
    },
    "relations": {
      "database": ["postgres-db"],
      "dependsOn": ["auth-service"]
    },
    "team": "Platform Team",
    "icon": "💳"
  }'
```

**Response (201):**
```json
{
  "ok": true,
  "entity": {
    "id": "clxxx...",
    "identifier": "payment-service",
    "blueprintId": "microservice",
    "title": "Payment Service",
    "properties": { ... },
    "relations": { ... },
    "createdAt": "2025-12-03T20:00:00.000Z",
    "updatedAt": "2025-12-03T20:00:00.000Z"
  }
}
```

### 2. Get All Entities

**Endpoint:** `GET /api/v1/blueprints/:blueprint_identifier/entities`

**Query Parameters:**
- `limit` (optional): Number of results (default: all)
- `offset` (optional): Pagination offset (default: 0)

**Example Request:**
```bash
curl -X GET "http://localhost:8080/api/v1/blueprints/microservice/entities?limit=20&offset=0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
{
  "ok": true,
  "entities": [
    {
      "id": "clxxx...",
      "identifier": "payment-service",
      "blueprintId": "microservice",
      "title": "Payment Service",
      "properties": { ... },
      "relations": { ... }
    }
  ],
  "total": 15
}
```

### 3. Get Single Entity

**Endpoint:** `GET /api/v1/blueprints/:blueprint_identifier/entities/:entity_identifier`

**Example Request:**
```bash
curl -X GET http://localhost:8080/api/v1/blueprints/microservice/entities/payment-service \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
{
  "ok": true,
  "entity": {
    "id": "clxxx...",
    "identifier": "payment-service",
    "blueprintId": "microservice",
    "title": "Payment Service",
    "properties": { ... }
  }
}
```

### 4. Get Entity Count

**Endpoint:** `GET /api/v1/blueprints/:blueprint_identifier/entities-count`

**Example Request:**
```bash
curl -X GET http://localhost:8080/api/v1/blueprints/microservice/entities-count \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
{
  "ok": true,
  "count": 15
}
```

### 5. Update Entity (Partial)

**Endpoint:** `PATCH /api/v1/blueprints/:blueprint_identifier/entities/:entity_identifier`

**Example Request:**
```bash
curl -X PATCH http://localhost:8080/api/v1/blueprints/microservice/entities/payment-service \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "properties": {
      "version": "1.1.0",
      "status": "updated"
    }
  }'
```

**Response (200):**
```json
{
  "ok": true,
  "entity": {
    "id": "clxxx...",
    "identifier": "payment-service",
    "properties": {
      "language": "TypeScript",
      "version": "1.1.0",
      "status": "updated"
    }
  }
}
```

### 6. Replace Entity (Full)

**Endpoint:** `PUT /api/v1/blueprints/:blueprint_identifier/entities/:entity_identifier`

**Example Request:**
```bash
curl -X PUT http://localhost:8080/api/v1/blueprints/microservice/entities/payment-service \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Payment Service v2",
    "properties": {
      "language": "Go",
      "version": "2.0.0"
    },
    "relations": {}
  }'
```

### 7. Delete Entity

**Endpoint:** `DELETE /api/v1/blueprints/:blueprint_identifier/entities/:entity_identifier`

**Example Request:**
```bash
curl -X DELETE http://localhost:8080/api/v1/blueprints/microservice/entities/payment-service \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
{
  "ok": true,
  "message": "Entities deleted successfully"
}
```

### 8. Create Multiple Entities (Bulk)

**Endpoint:** `POST /api/v1/blueprints/:blueprint_identifier/entities/bulk`

**Limits:** Maximum 20 entities per request

**Example Request:**
```bash
curl -X POST http://localhost:8080/api/v1/blueprints/microservice/entities/bulk \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "entities": [
      {
        "identifier": "auth-service",
        "title": "Auth Service",
        "properties": { "language": "Go" }
      },
      {
        "identifier": "notification-service",
        "title": "Notification Service",
        "properties": { "language": "Python" }
      }
    ]
  }'
```

**Response (200 or 207):**
```json
{
  "ok": true,
  "results": [
    {
      "success": true,
      "entity": { ... },
      "identifier": "auth-service"
    },
    {
      "success": false,
      "error": "Validation failed",
      "identifier": "notification-service"
    }
  ]
}
```

### 9. Delete Multiple Entities

**Endpoint:** `POST /api/v1/blueprints/:blueprint_identifier/bulk/entities/delete`

**Limits:** Maximum 100 entities per request

**Example Request:**
```bash
curl -X POST http://localhost:8080/api/v1/blueprints/microservice/bulk/entities/delete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "identifiers": ["auth-service", "notification-service"],
    "delete_dependents": false
  }'
```

**Response (200):**
```json
{
  "ok": true,
  "message": "Entities deleted successfully",
  "results": [
    { "success": true, "identifier": "auth-service" },
    { "success": true, "identifier": "notification-service" }
  ]
}
```

### 10. Delete All Entities

**Endpoint:** `DELETE /api/v1/blueprints/:blueprint_identifier/all-entities`

**Example Request:**
```bash
curl -X DELETE http://localhost:8080/api/v1/blueprints/microservice/all-entities \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
{
  "ok": true,
  "message": "Entities deleted successfully"
}
```

### 11. Search Entities

**Endpoint:** `POST /api/v1/entities/search`

**Search Operators:**
- `eq` - Equals
- `neq` - Not equals
- `in` - In array
- `contains` - Contains substring
- `gt` - Greater than
- `gte` - Greater than or equal
- `lt` - Less than
- `lte` - Less than or equal

**Example Request:**
```bash
curl -X POST http://localhost:8080/api/v1/entities/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "rules": [
      {
        "property": "status",
        "operator": "eq",
        "value": "active"
      },
      {
        "property": "version",
        "operator": "gte",
        "value": "1.0.0"
      }
    ],
    "combinator": "and",
    "limit": 20,
    "offset": 0
  }'
```

**Response (200):**
```json
{
  "ok": true,
  "entities": [
    { ... }
  ],
  "total": 5
}
```

### 12. Search Within Blueprint

**Endpoint:** `POST /api/v1/blueprints/:blueprint_identifier/entities/search`

**Example Request:**
```bash
curl -X POST http://localhost:8080/api/v1/blueprints/microservice/entities/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "rules": [
      {
        "property": "language",
        "operator": "eq",
        "value": "TypeScript"
      }
    ],
    "combinator": "and"
  }'
```

### 13. Aggregate Entities

**Endpoint:** `POST /api/v1/entities/aggregate`

**Aggregation Functions:**
- `count` - Count entities
- `sum` - Sum numeric property
- `avg` - Average numeric property
- `min` - Minimum value
- `max` - Maximum value

**Example Request:**
```bash
curl -X POST http://localhost:8080/api/v1/entities/aggregate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "blueprintId": "microservice",
    "function": "count",
    "groupBy": ["properties.language"]
  }'
```

**Response (200):**
```json
{
  "ok": true,
  "result": {
    "function": "count",
    "value": 15
  }
}
```

### 14. Get Entity History

**Endpoint:** `POST /api/v1/entities/properties-history`

**Example Request:**
```bash
curl -X POST http://localhost:8080/api/v1/entities/properties-history \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "blueprintId": "microservice",
    "identifier": "payment-service",
    "properties": ["status", "version"],
    "startDate": "2025-01-01T00:00:00Z",
    "endDate": "2025-12-31T23:59:59Z"
  }'
```

**Response (200):**
```json
{
  "ok": true,
  "history": [
    {
      "id": "clxxx...",
      "entityId": "clyyy...",
      "propertyName": "version",
      "oldValue": "1.0.0",
      "newValue": "1.1.0",
      "changeType": "PROPERTY_UPDATE",
      "changedAt": "2025-12-03T15:30:00.000Z",
      "changedBy": "user123",
      "snapshot": { ... }
    }
  ]
}
```

## Error Responses

### 401 Unauthorized
```json
{
  "ok": false,
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "ok": false,
  "error": "A resource with the provided identifier was not found"
}
```

### 413 Request Too Large
```json
{
  "ok": false,
  "error": "Request body is too large (limit is 1MiB)"
}
```

### 422 Validation Error
```json
{
  "ok": false,
  "error": "JSON does not match the route's schema"
}
```

## Testing Workflow

### Step 1: Create a Blueprint
First, ensure you have a blueprint:
```bash
curl -X POST http://localhost:8080/api/blueprints \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "identifier": "microservice",
    "title": "Microservice",
    "icon": "🚀",
    "schema": {
      "properties": {
        "language": { "type": "string", "title": "Language" },
        "version": { "type": "string", "title": "Version" },
        "status": { "type": "string", "title": "Status" }
      },
      "required": ["language"]
    }
  }'
```

### Step 2: Create Entities
```bash
# Create single entity
curl -X POST http://localhost:8080/api/v1/blueprints/microservice/entities \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "identifier": "service-1",
    "title": "Service 1",
    "properties": { "language": "TypeScript", "version": "1.0.0", "status": "active" }
  }'
```

### Step 3: Query Entities
```bash
# Get all entities
curl -X GET http://localhost:8080/api/v1/blueprints/microservice/entities \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Search entities
curl -X POST http://localhost:8080/api/v1/entities/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "rules": [{ "property": "status", "operator": "eq", "value": "active" }]
  }'
```

### Step 4: Update Entities
```bash
# Update entity
curl -X PATCH http://localhost:8080/api/v1/blueprints/microservice/entities/service-1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "properties": { "version": "1.1.0" }
  }'
```

### Step 5: View History
```bash
curl -X POST http://localhost:8080/api/v1/entities/properties-history \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "blueprintId": "microservice",
    "identifier": "service-1",
    "properties": ["version"]
  }'
```

### Step 6: Delete Entities
```bash
# Delete single entity
curl -X DELETE http://localhost:8080/api/v1/blueprints/microservice/entities/service-1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Postman Collection

Import this collection to test all endpoints:

1. Set environment variables:
   - `BASE_URL`: `http://localhost:8080`
   - `JWT_TOKEN`: Your authentication token
   - `BLUEPRINT_ID`: Your blueprint identifier

2. Use the variables in requests:
   - URL: `{{BASE_URL}}/api/v1/blueprints/{{BLUEPRINT_ID}}/entities`
   - Headers: `Authorization: Bearer {{JWT_TOKEN}}`

## Notes

- All endpoints respect multi-tenancy (organizationId and tenantId)
- History is automatically tracked for all entity changes
- Bulk operations return partial success results (207 status)
- Request body limit is 1 MiB for all operations
- Properties are stored as JSON and support any structure
- Relations are stored as JSON and can reference other entities
