# WebSocket Proxy Documentation

## Overview

The Mindcraft FastAPI Gateway includes a comprehensive WebSocket proxy that enables real-time communication between frontend clients and the Node.js Agent Core service.

## Architecture

```
Frontend (React) → FastAPI Gateway (Port 8000) → Node.js Core (Port 8081)
     ↓                     ↓                           ↓
  Socket.IO Client    WebSocket Proxy           Socket.IO Server
                     (External + Internal)
```

## Connection Flow

### 1. External Client Connection
- **Endpoint**: `ws://localhost:8000/socket.io`
- **Transports**: WebSocket and HTTP polling (fallback)
- **CORS**: Configured for frontend origins (localhost:5173)

### 2. Authentication
```javascript
// Client-side authentication
socket.emit('authenticate', {
  token: 'jwt_token_here'
});

// Response
socket.on('authenticated', (data) => {
  console.log('Authenticated:', data.success);
});

socket.on('authentication_error', (error) => {
  console.error('Auth failed:', error.message);
});
```

### 3. Event Types

#### Agent State Events
- `agent:state:update` - Real-time agent state updates
- `agent:action:executed` - Action execution notifications
- `agent:message:sent` - Chat message broadcasts
- `agent:connected/disconnected` - Agent lifecycle events
- `agent:status/boot/stop/restart` - Agent status changes

#### Control Events
- `create-agent` - Create new agent
- `start-agent` - Start existing agent
- `stop-agent` - Stop running agent
- `destroy-agent` - Destroy agent
- `restart-agent` - Restart agent
- `get_agent_list` - List all agents
- `get-profiles` - List available profiles
- `get-profile` - Get specific profile
- `save-profile` - Save profile data
- `delete-profile` - Delete profile
- `create-agent-from-profile` - Create agent from profile

#### System Events
- `system:status` - System status updates
- `agents-status` - Agents list updates
- `connection_lost` - Connection failure notifications

## Event Schemas

### Agent State Update
```json
{
  "agentId": "string",
  "timestamp": "number",
  "worldContext": {
    "position": {"x": "number", "y": "number", "z": "number"},
    "health": "number",
    "inventory": "array"
  },
  "personality": "string",
  "goals": "string", 
  "mandate": "string",
  "conversation": {
    "message": "string",
    "sender": "string"
  },
  "lastAction": "string",
  "response": "string"
}
```

### Agent Action Executed
```json
{
  "agentId": "string",
  "action": "string",
  "response": "string",
  "timestamp": "number"
}
```

### Agent Message Sent
```json
{
  "agentId": "string",
  "message": "string",
  "target": "string|null",
  "timestamp": "number"
}
```

### Control Event (Create Agent)
```json
{
  "agentName": "string",
  "profileName": "string",
  "target_sid": "string"
}
```

## Error Handling

### Error Response Format
```json
{
  "message": "string",
  "code": "string",
  "event": "string",
  "details": "string|null"
}
```

### Common Error Codes
- `AUTHENTICATION_REQUIRED` - Client must authenticate first
- `INVALID_EVENT_DATA` - Event data validation failed
- `SANITIZATION_ERROR` - Data sanitization failed
- `INTERNAL_ERROR` - Server-side error
- `CONNECTION_LIMIT_EXCEEDED` - Maximum connections reached
- `CLIENT_NOT_FOUND` - Client session not found
- `MISSING_TOKEN` - No authentication token provided
- `TOKEN_EXPIRED` - JWT token has expired
- `INVALID_TOKEN` - JWT token is invalid

## Security Features

### JWT Authentication
- Uses HS256 algorithm with configurable secret
- Token expiration validation
- User ID extraction and tracking

### Data Sanitization
- Field validation for all event types
- String length limits (message: 1000 chars, general: 500 chars)
- Script tag removal
- Nested object depth limits
- List size limits (50 items max)

### Connection Limits
- Maximum concurrent connections: 100 (configurable)
- Connection utilization monitoring
- Automatic cleanup of disconnected clients

## Monitoring & Metrics

### REST API Endpoints
- `GET /api/websocket/metrics` - Detailed metrics
- `GET /api/websocket/health` - Health check
- `GET /api/websocket/status` - Basic status

### Metrics Available
- Total connections
- Active connections
- Authenticated connections
- Messages relayed
- Connection errors
- Connection utilization percentage
- Individual client details

## Configuration

### Environment Variables
```bash
# WebSocket Configuration
WEBSOCKET_PING_TIMEOUT=60
WEBSOCKET_PING_INTERVAL=25
WEBSOCKET_MAX_BUFFER_SIZE=1000000
WEBSOCKET_MAX_CONNECTIONS=100

# Node.js Core Connection
NODE_CORE_HOST=localhost
NODE_CORE_PORT=8081
SOCKET_RECONNECT_ATTEMPTS=5
SOCKET_RECONNECT_DELAY=2000

# JWT Authentication
JWT_SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256

# CORS Configuration
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

## Usage Examples

### Basic Connection
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:8000', {
  transports: ['websocket', 'polling']
});

socket.on('connect', () => {
  console.log('Connected to WebSocket proxy');
});

// Authenticate
socket.emit('authenticate', {
  token: 'your_jwt_token'
});

// Listen for agent updates
socket.on('agent:state:update', (data) => {
  console.log('Agent state updated:', data);
});

// Create an agent
socket.emit('create-agent', {
  agentName: 'TestBot',
  profileName: 'Warrior'
});
```

### React Integration
```javascript
// useWebSocket hook
import { useEffect, useState } from 'react';
import { initializeSocket } from '../services/socketService';

export const useAgentWebSocket = (token) => {
  const [socket, setSocket] = useState(null);
  const [agentStates, setAgentStates] = useState({});

  useEffect(() => {
    const socketService = initializeSocket({
      url: 'http://localhost:8000',
      options: { transports: ['websocket', 'polling'] }
    });

    socketService.on('connect', () => {
      socketService.emit('authenticate', { token });
    });

    socketService.on('agent:state:update', (data) => {
      setAgentStates(prev => ({
        ...prev,
        [data.agentId]: data
      }));
    });

    socketService.connect();
    setSocket(socketService);

    return () => {
      socketService.disconnect();
    };
  }, [token]);

  const createAgent = (agentName, profileName) => {
    socket?.emit('create-agent', { agentName, profileName });
  };

  return { agentStates, createAgent };
};
```

## Performance Considerations

### Optimization Features
- Connection pooling and reuse
- Message batching for high-frequency events
- Automatic reconnection with exponential backoff
- Client activity tracking and cleanup
- Metrics-driven performance monitoring

### Scaling Guidelines
- Monitor connection utilization (>90% triggers warnings)
- Track error rates (>10% triggers alerts)
- Use WebSocket transport for better performance
- Implement client-side reconnection logic
- Consider horizontal scaling for high loads

## Troubleshooting

### Common Issues

#### Connection Failed
- Check if FastAPI gateway is running on port 8000
- Verify CORS configuration allows your origin
- Check network connectivity and firewall settings

#### Authentication Failed
- Verify JWT token is valid and not expired
- Check JWT_SECRET_KEY matches between services
- Ensure token contains required user_id claim

#### Message Not Received
- Check if client is authenticated
- Verify event name matches expected format
- Check server logs for validation errors

#### Performance Issues
- Monitor connection limits and utilization
- Check for high error rates in metrics
- Consider reducing message frequency
- Verify WebSocket transport is being used

### Debug Logging
Enable debug logging by setting:
```bash
DEBUG=true
LOG_LEVEL=DEBUG
```

## Testing

### Unit Tests
- Event validation functions
- Data sanitization methods
- Authentication logic
- Connection management

### Integration Tests
- End-to-end message flow
- Reconnection scenarios
- Error handling
- Performance benchmarks

### Load Testing
- Connection limit validation
- Message throughput testing
- Memory usage monitoring
- Error rate validation