# Profile Management API Documentation

## Overview

The Mindcraft Profile Management API provides comprehensive CRUD operations for agent profiles, supporting both REST endpoints and Socket.IO events. This API is designed to work with the simplified 4-node LangGraph architecture and includes robust validation, error handling, and security features.

## Features

- **REST API**: Standard HTTP endpoints for profile management
- **Socket.IO Events**: Real-time profile operations
- **Comprehensive Validation**: Profile structure and content validation
- **Error Handling**: Detailed error responses and logging
- **Security**: Path validation and safe file operations
- **Backup Support**: Profile backup and recovery functionality
- **Migration Support**: Validation for profile migration

## Base URL

- **Development**: `http://localhost:8080`
- **API Base**: `http://localhost:8080/api`

## Authentication

Currently, the API uses basic authentication hooks. In production, implement proper JWT-based authentication:

```http
Authorization: Bearer <jwt_token>
```

## Response Format

All API responses follow this standard format:

```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "meta": {
    "timestamp": "2025-01-01T00:00:00.000Z",
    "message": "Operation completed successfully"
  }
}
```

Error responses:

```json
{
  "success": false,
  "data": null,
  "error": "Detailed error message",
  "meta": {
    "timestamp": "2025-01-01T00:00:00.000Z"
  }
}
```

---

## REST API Endpoints

### GET /api/profiles

List all available profiles.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "AlphaSurvivor",
      "displayName": "AlphaSurvivor",
      "model": "ollama/hf.co/unsloth/Qwen3-30B-A3B-Instruct-2507-20000-GGUF:Q4_K_XL",
      "agentType": "langgraph_simplified",
      "profileVersion": "3.0.0",
      "compatibilityMode": "simplified_only",
      "fileName": "Loner.json"
    }
  ],
  "meta": {
    "timestamp": "2025-01-01T00:00:00.000Z",
    "count": 1
  }
}
```

**Status Codes:**
- `200 OK`: Success
- `500 Internal Server Error`: Server error

---

### GET /api/profiles/:name

Get a specific profile by name.

**Parameters:**
- `name` (path): Profile name

**Response:**
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
    "agentState": {
      "worldContext": { ... },
      "personality": "creative and disciplined personality...",
      "goals": "strong survival instinct...",
      "mandate": "",
      "conversation": { ... },
      "lastAction": "",
      "response": ""
    },
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  "meta": {
    "timestamp": "2025-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**
- `200 OK`: Success
- `404 Not Found`: Profile not found
- `500 Internal Server Error`: Server error

---

### POST /api/profiles

Create a new profile.

**Request Body:**
```json
{
  "name": "NewTestBot",
  "model": "ollama/test-model",
  "embedding": "ollama/test-embedding",
  "agentType": "langgraph_simplified",
  "personality": "friendly and helpful personality",
  "goals": "testing and exploration"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "NewTestBot",
    "model": "ollama/test-model",
    "embedding": "ollama/test-embedding",
    "agentType": "langgraph_simplified",
    "profileVersion": "3.0.0",
    "compatibilityMode": "simplified_only",
    "agentState": {
      "worldContext": { ... },
      "personality": "friendly and helpful personality",
      "goals": "testing and exploration",
      "mandate": "",
      "conversation": { ... },
      "lastAction": "",
      "response": ""
    },
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  "meta": {
    "timestamp": "2025-01-01T00:00:00.000Z",
    "message": "Profile 'NewTestBot' created successfully"
  }
}
```

**Status Codes:**
- `201 Created`: Profile created successfully
- `400 Bad Request`: Invalid profile data
- `409 Conflict`: Profile already exists
- `500 Internal Server Error`: Server error

---

### PUT /api/profiles/:name

Update an existing profile.

**Parameters:**
- `name` (path): Profile name

**Request Body:**
```json
{
  "personality": "updated personality traits",
  "goals": "updated goals description",
  "model": "ollama/updated-model"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "NewTestBot",
    "personality": "updated personality traits",
    "goals": "updated goals description",
    "model": "ollama/updated-model",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  "meta": {
    "timestamp": "2025-01-01T00:00:00.000Z",
    "message": "Profile 'NewTestBot' updated successfully"
  }
}
```

**Status Codes:**
- `200 OK`: Profile updated successfully
- `400 Bad Request`: Invalid profile data
- `404 Not Found`: Profile not found
- `500 Internal Server Error`: Server error

---

### DELETE /api/profiles/:name

Delete a profile.

**Parameters:**
- `name` (path): Profile name

**Response:**
```json
{
  "success": true,
  "data": null,
  "meta": {
    "timestamp": "2025-01-01T00:00:00.000Z",
    "message": "Profile 'NewTestBot' deleted successfully"
  }
}
```

**Status Codes:**
- `200 OK`: Profile deleted successfully
- `404 Not Found`: Profile not found
- `500 Internal Server Error`: Server error

---

## Socket.IO Events

### Connection

Connect to the Socket.IO server:

```javascript
import { create } from 'socket.io-client';

const socket = create('http://localhost:8080');
```

---

### get-profiles

Get list of all available profiles.

**Event:**
```javascript
socket.emit('get-profiles', (response) => {
  console.log(response);
});
```

**Response:**
```javascript
{
  "success": true,
  "data": [
    {
      "name": "AlphaSurvivor",
      "displayName": "AlphaSurvivor",
      "model": "ollama/hf.co/unsloth/Qwen3-30B-A3B-Instruct-2507-20000-GGUF:Q4_K_XL",
      "agentType": "langgraph_simplified",
      "profileVersion": "3.0.0",
      "compatibilityMode": "simplified_only",
      "fileName": "Loner.json"
    }
  ]
}
```

---

### get-profile

Get a specific profile by name.

**Event:**
```javascript
socket.emit('get-profile', 'AlphaSurvivor', (response) => {
  console.log(response);
});
```

**Response:**
```javascript
{
  "success": true,
  "data": {
    "name": "AlphaSurvivor",
    "model": "ollama/hf.co/unsloth/Qwen3-30B-A3B-Instruct-2507-20000-GGUF:Q4_K_XL",
    "agentState": { ... }
  }
}
```

---

### save-profile

Save or update a profile.

**Event:**
```javascript
const profileData = {
  name: 'TestBot',
  personality: 'updated personality',
  goals: 'updated goals'
};

socket.emit('save-profile', 'TestBot', profileData, (response) => {
  console.log(response);
});
```

**Response:**
```javascript
{
  "success": true,
  "data": {
    "name": "TestBot",
    "personality": "updated personality",
    "goals": "updated goals",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  "message": "Profile 'TestBot' saved successfully"
}
```

---

### create-agent-from-profile

Create and start an agent using a specific profile.

**Event:**
```javascript
const settings = {
  // Additional agent settings
  host: 'localhost',
  port: 25565
};

socket.emit('create-agent-from-profile', 'AlphaSurvivor', settings, (response) => {
  console.log(response);
});
```

**Response:**
```javascript
{
  "success": true,
  "data": {
    "agentName": "AlphaSurvivor",
    "profile": { ... }
  },
  "message": "Agent 'AlphaSurvivor' created from profile successfully"
}
```

---

### delete-profile

Delete a profile.

**Event:**
```javascript
socket.emit('delete-profile', 'TestBot', (response) => {
  console.log(response);
});
```

**Response:**
```javascript
{
  "success": true,
  "message": "Profile 'TestBot' deleted successfully"
}
```

---

## Profile Structure

### Required Fields

```json
{
  "name": "string (3-50 chars, alphanumeric + underscore + hyphen)",
  "model": "string (model identifier with provider prefix)",
  "agentType": "string (langgraph_simplified | langgraph_v2 | legacy)"
}
```

### Optional Fields

```json
{
  "embedding": "string (embedding model identifier)",
  "profileVersion": "string (default: '3.0.0')",
  "compatibilityMode": "string (simplified_only | hybrid | legacy_only)",
  "agentState": { ... },
  "createdAt": "string (ISO timestamp)",
  "updatedAt": "string (ISO timestamp)"
}
```

### Agent State Structure

```json
{
  "agentState": {
    "worldContext": {
      "position": { "x": 0, "y": 64, "z": 0 },
      "health": 20,
      "food": 20,
      "experience": 0,
      "inventory": {
        "items": [],
        "slots": 36,
        "usedSlots": 0,
        "length": 0
      },
      "equipment": {},
      "nearbyEntities": [],
      "timeOfDay": 0,
      "weather": "clear",
      "dimension": "overworld",
      "biome": "plains",
      "lightLevel": 15
    },
    "personality": "string (personality description)",
    "goals": "string (goals description)",
    "mandate": "string (player orders)",
    "conversation": {
      "message": "",
      "sender": "",
      "isRequestForHelp": false,
      "isOfferOfAssistance": false,
      "targetBot": "",
      "timestamp": 0
    },
    "lastAction": "string",
    "response": "string"
  }
}
```

---

## Validation

### Profile Validation Rules

1. **Name Validation**
   - Required field
   - 3-50 characters
   - Only alphanumeric characters, underscores, and hyphens
   - Must be unique

2. **Model Validation**
   - Required field
   - Should include provider prefix (e.g., "ollama/model-name")
   - Provider should be from supported list

3. **Agent Type Validation**
   - Required field
   - Must be one of: `langgraph_simplified`, `langgraph_v2`, `legacy`

4. **Agent State Validation**
   - All 7 core fields required if agentState is present
   - World context structure validation
   - Numeric range validation for health, food, etc.

### Validation Response

```json
{
  "isValid": true,
  "errors": [],
  "warnings": [
    "Personality description is very long (>500 characters)"
  ]
}
```

---

## Error Handling

### Common Error Codes

- `400 Bad Request`: Invalid data, validation failed
- `404 Not Found`: Profile not found
- `409 Conflict`: Profile already exists
- `500 Internal Server Error`: Server error

### Error Response Format

```json
{
  "success": false,
  "error": "Profile validation failed: Missing required field: name",
  "meta": {
    "timestamp": "2025-01-01T00:00:00.000Z"
  }
}
```

---

## Security Features

1. **Path Validation**: Ensures file operations are within profiles directory
2. **Input Sanitization**: Removes deprecated fields and normalizes data
3. **Name Validation**: Prevents directory traversal and injection attacks
4. **File Extension Validation**: Only allows .json files
5. **Size Limits**: Prevents excessively large profile files

---

## Testing

### Running Tests

```bash
# Run all tests
node run_profile_tests.js

# Run individual test files
node tests/test_profile_validation.js
node tests/test_profile_api.js
node tests/test_profile_integration.js
```

### Test Coverage

1. **Validation Tests**: Profile structure and content validation
2. **API Tests**: REST endpoint functionality
3. **Integration Tests**: Complete workflow testing
4. **Error Handling Tests**: Edge cases and error scenarios
5. **Concurrent Operations**: Multiple simultaneous operations

---

## Examples

### Create a New Profile

```javascript
// Using REST API
const newProfile = {
  name: 'HelperBot',
  model: 'ollama/llama2',
  personality: 'friendly, helpful, and patient',
  goals: 'assist players and build structures'
};

const response = await fetch('http://localhost:8080/api/profiles', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(newProfile)
});

const result = await response.json();
console.log(result);
```

```javascript
// Using Socket.IO
socket.emit('save-profile', 'HelperBot', newProfile, (response) => {
  console.log(response);
});
```

### Update Profile Personality

```javascript
const updateData = {
  personality: 'updated personality: more assertive and proactive',
  goals: 'leadership and team coordination'
};

const response = await fetch('http://localhost:8080/api/profiles/HelperBot', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(updateData)
});
```

### Create Agent from Profile

```javascript
socket.emit('create-agent-from-profile', 'HelperBot', {
  host: 'localhost',
  port: 25565,
  username: 'HelperBot'
}, (response) => {
  if (response.success) {
    console.log('Agent created successfully:', response.data.agentName);
  }
});
```

---

## Migration Support

### Validate for Migration

```javascript
// Check if profile can be migrated to simplified format
const migrationValidation = await profileManager.validateForMigration('OldProfile');

console.log(migrationValidation);
// {
//   "canMigrate": true,
//   "migrationType": "simplified",
//   "issues": ["Hierarchical goals will be flattened"],
//   "recommendations": ["Agent type will be changed to langgraph_simplified"]
// }
```

---

## Performance Considerations

1. **File System Operations**: Optimized for SSD storage
2. **Memory Usage**: Profiles loaded on-demand, not cached
3. **Concurrent Access**: Thread-safe file operations
4. **Network Optimization**: Minimal data transfer, compressed responses
5. **Validation Speed**: Optimized validation algorithms

---

## Troubleshooting

### Common Issues

1. **Profile Not Found**
   - Check profile name spelling
   - Verify file exists in profiles directory
   - Check file permissions

2. **Validation Failed**
   - Review validation error messages
   - Check required fields are present
   - Verify field formats and constraints

3. **Server Connection Issues**
   - Ensure server is running on port 8080
   - Check firewall settings
   - Verify network connectivity

4. **File System Errors**
   - Check disk space availability
   - Verify directory permissions
   - Check for file locks

### Debug Mode

Enable debug logging by setting environment variable:

```bash
DEBUG=profile:* node src/mindcraft/mindserver.js
```

---

## API Versioning

Current version: **v1.0.0**

Version history:
- v1.0.0: Initial release with simplified profile support
- Future versions will maintain backward compatibility

---

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review test files for usage examples
3. Check server logs for detailed error information
4. Consult the Memory Bank documentation for architectural context