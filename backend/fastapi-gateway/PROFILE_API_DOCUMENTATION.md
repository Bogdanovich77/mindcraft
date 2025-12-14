# FastAPI Profile Management API Documentation

## Overview

The FastAPI Profile Management API provides REST endpoints for managing agent profiles in the Mindcraft system. This API acts as a gateway between external clients and the internal Node.js Agent Core service, using Socket.IO for communication.

## Architecture

```
Frontend (React/Vite:5173) → FastAPI Gateway (Port 8000) → Node.js Core (Port 8081)
```

- **FastAPI Gateway**: Handles HTTP requests and validates data
- **Socket.IO Client**: Communicates with Node.js Core for profile operations
- **Node.js Core**: Manages profile files and agent lifecycle

## Base URL

```
http://localhost:8000/api
```

## Authentication

Currently, no authentication is required for profile management endpoints. JWT authentication is implemented for WebSocket connections but not for REST API endpoints.

## Response Format

All endpoints return a standardized response format:

```json
{
    "success": boolean,
    "data": any,
    "error": string | null,
    "meta": {
        "message": string,
        "count": number,
        ...additional metadata
    }
}
```

## Endpoints

### 1. List All Profiles

**GET** `/profiles`

Retrieve a list of all available agent profiles.

#### Response

```json
{
    "success": true,
    "data": [
        {
            "name": "AlphaSurvivor",
            "model": "ollama/hf.co/unsloth/Qwen3-30B-A3B-Instruct-2507-20000-GGUF:Q4_K_XL",
            "agentType": "langgraph_simplified",
            "compatibilityMode": "simplified_only",
            "personality": "creative and disciplined personality",
            "goals": "strong survival instinct, also enjoys building",
            "mandate": "",
            "createdAt": "2025-12-14T16:33:39.580Z"
        }
    ],
    "meta": {"count": 1}
}
```

#### Error Responses

- `503`: Node.js core service unavailable

---

### 2. Get Specific Profile

**GET** `/profiles/{name}`

Retrieve a complete profile by name.

#### Parameters

- `name` (path): Profile name

#### Response

```json
{
    "success": true,
    "data": {
        "name": "AlphaSurvivor",
        "model": "ollama/hf.co/unsloth/Qwen3-30B-A3B-Instruct-2507-20000-GGUF:Q4_K_XL",
        "embedding": "ollama/nomic-embed-text:latest",
        "agentType": "langgraph_simplified",
        "profileVersion": "3.0.0",
        "compatibilityMode": "simplified_only",
        "migratedAt": "2025-12-14T16:33:39.580Z",
        "originalFile": "AlphaSurvivor.json",
        "agentState": {
            "worldContext": {...},
            "personality": "creative and disciplined personality",
            "goals": "strong survival instinct, also enjoys building",
            "mandate": "",
            "conversation": {...},
            "lastAction": "",
            "response": ""
        },
        "legacyPrompts": {...},
        "migrationMetadata": {...}
    }
}
```

#### Error Responses

- `404`: Profile not found
- `503`: Node.js core service unavailable

---

### 3. Create Profile

**POST** `/profiles`

Create a new agent profile.

#### Request Body

```json
{
    "name": "BuilderBot",
    "personality": "creative, meticulous, enjoys construction",
    "goals": "build impressive structures, gather resources",
    "mandate": "construct a medieval castle",
    "model": "ollama/hf.co/unsloth/Qwen3-30B-A3B-Instruct-2507-20000-GGUF:Q4_K_XL",
    "embedding": "ollama/nomic-embed-text:latest"
}
```

#### Field Validation

- `name`: Required, 1-50 characters, no path separators
- `personality`: Required, minimum 1 character
- `goals`: Required, minimum 1 character
- `mandate`: Optional, defaults to empty string
- `model`: Optional, defaults to Qwen3-30B model
- `embedding`: Optional, defaults to nomic-embed-text

#### Response

```json
{
    "success": true,
    "data": {
        "name": "BuilderBot",
        "model": "ollama/hf.co/unsloth/Qwen3-30B-A3B-Instruct-2507-20000-GGUF:Q4_K_XL",
        "agentState": {
            "personality": "creative, meticulous, enjoys construction",
            "goals": "build impressive structures, gather resources",
            "mandate": "construct a medieval castle"
        },
        ...
    },
    "meta": {"message": "Profile 'BuilderBot' created successfully"}
}
```

#### Error Responses

- `400`: Invalid profile data or validation error
- `409`: Profile already exists
- `503`: Node.js core service unavailable

---

### 4. Update Profile

**PUT** `/profiles/{name}`

Update an existing agent profile.

#### Parameters

- `name` (path): Profile name

#### Request Body

```json
{
    "personality": "updated personality description",
    "goals": "new goals for the agent",
    "mandate": "new mandate",
    "model": "new AI model",
    "embedding": "new embedding model"
}
```

All fields are optional. Only provided fields will be updated.

#### Response

```json
{
    "success": true,
    "data": {
        "name": "BuilderBot",
        "agentState": {
            "personality": "updated personality description",
            "goals": "new goals for the agent",
            "mandate": "new mandate"
        },
        "updatedAt": "2025-12-14T19:10:00.000Z",
        ...
    },
    "meta": {"message": "Profile 'BuilderBot' updated successfully"}
}
```

#### Error Responses

- `400`: No valid fields to update
- `404`: Profile not found
- `503`: Node.js core service unavailable

---

### 5. Delete Profile

**DELETE** `/profiles/{name}`

Delete an agent profile.

#### Parameters

- `name` (path): Profile name

#### Response

```json
{
    "success": true,
    "data": {"deleted": true, "profile": "BuilderBot"},
    "meta": {"message": "Profile 'BuilderBot' deleted successfully"}
}
```

#### Error Responses

- `404`: Profile not found
- `503`: Node.js core service unavailable

## Data Models

### ProfileCreate

```typescript
interface ProfileCreate {
    name: string;              // Required, 1-50 chars
    personality: string;        // Required
    goals: string;             // Required
    mandate?: string;          // Optional
    model?: string;            // Optional
    embedding?: string;        // Optional
}
```

### ProfileUpdate

```typescript
interface ProfileUpdate {
    personality?: string;      // Optional
    goals?: string;           // Optional
    mandate?: string;         // Optional
    model?: string;           // Optional
    embedding?: string;       // Optional
}
```

### AgentState

```typescript
interface AgentState {
    worldContext: WorldContext;
    personality: string;
    goals: string;
    mandate: string;
    conversation: ConversationState;
    lastAction: string;
    response: string;
}
```

## Error Handling

The API uses standard HTTP status codes:

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `404`: Not Found
- `409`: Conflict (duplicate)
- `422`: Unprocessable Entity (validation error)
- `500`: Internal Server Error
- `503`: Service Unavailable
- `504`: Gateway Timeout

Error responses include detailed error messages:

```json
{
    "success": false,
    "error": "Profile 'TestBot' already exists",
    "detail": "Profile 'TestBot' already exists"
}
```

## Rate Limiting

Currently, no rate limiting is implemented for profile management endpoints.

## WebSocket Integration

Profile management operations are also available via WebSocket events:

- `get-profiles`: List all profiles
- `get-profile`: Get specific profile
- `save-profile`: Create/update profile
- `delete-profile`: Delete profile

WebSocket events require authentication and use request/response correlation with unique request IDs.

## Testing

A comprehensive test suite is available in `test_profiles_api.py`:

```bash
cd backend/fastapi-gateway
python test_profiles_api.py
```

The test suite validates:
- Health check endpoint
- All CRUD operations
- Data validation
- Error handling
- Socket.IO communication

## Examples

### Create a Simple Profile

```bash
curl -X POST "http://localhost:8000/api/profiles" \
     -H "Content-Type: application/json" \
     -d '{
         "name": "MinerBot",
         "personality": "hardworking, focused on resource gathering",
         "goals": "mine valuable resources, explore caves"
     }'
```

### List All Profiles

```bash
curl "http://localhost:8000/api/profiles"
```

### Update Profile Goals

```bash
curl -X PUT "http://localhost:8000/api/profiles/MinerBot" \
     -H "Content-Type: application/json" \
     -d '{
         "goals": "mine diamonds, build underground base"
     }'
```

### Delete Profile

```bash
curl -X DELETE "http://localhost:8000/api/profiles/MinerBot"
```

## Environment Variables

Key environment variables for the API:

```bash
# Node.js Core Connection
NODE_CORE_HOST=localhost
NODE_CORE_PORT=8081
PROFILE_REQUEST_TIMEOUT=30

# FastAPI Server
FASTAPI_HOST=0.0.0.0
FASTAPI_PORT=8000
DEBUG=false

# WebSocket Configuration
WEBSOCKET_PING_TIMEOUT=60
WEBSOCKET_PING_INTERVAL=25
WEBSOCKET_MAX_BUFFER_SIZE=1000000
WEBSOCKET_MAX_CONNECTIONS=100
```

## Dependencies

The API requires the following Python packages:

```
fastapi>=0.104.0
uvicorn[standard]>=0.24.0
python-socketio>=5.9.0
python-multipart>=0.0.6
pydantic>=2.4.0
httpx>=0.25.0
python-dotenv>=1.0.0
PyJWT>=2.8.0
```

## Integration with Frontend

The frontend should update its API configuration:

```typescript
// frontend/.env.development
VITE_API_URL=http://localhost:8000/api
VITE_SOCKET_URL=http://localhost:8000
```

The API maintains full compatibility with the existing frontend interface, requiring only URL changes.

## Monitoring and Health

Health check endpoint: `GET /health`

WebSocket metrics: `GET /api/websocket/metrics`

WebSocket health: `GET /api/websocket/health`

## Security Considerations

- Input validation on all profile data
- Sanitization of string fields to prevent script injection
- Connection limits for WebSocket clients
- Error message sanitization in production mode
- CORS configuration for allowed origins

## Performance

- Socket.IO communication provides low-latency profile operations
- Asynchronous request handling with timeouts
- Connection pooling and reuse
- Efficient JSON serialization/deserialization

Target response times:
- Profile list: <200ms
- Profile CRUD operations: <500ms
- Error responses: <100ms