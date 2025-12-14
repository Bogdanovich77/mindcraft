# Internal Socket.IO Communication Implementation

## Overview

This document describes the implementation of internal Socket.IO communication between the FastAPI Gateway (port 8000) and the Node.js Agent Core (port 8081) as part of the Mindcraft hybrid 3-tier architecture migration.

## Architecture

```
┌─────────────────┐    HTTP/WebSocket    ┌─────────────────┐    Internal Socket.IO    ┌─────────────────┐
│   Frontend      │ ◄──────────────────► │  FastAPI Gateway│ ◄──────────────────────► │  Node.js Core   │
│   (Port 5173)   │                     │   (Port 8000)   │                         │   (Port 8081)   │
└─────────────────┘                     └─────────────────┘                         └─────────────────┘
```

### Components

1. **FastAPI Gateway** (`backend/fastapi-gateway/`)
   - External WebSocket server for frontend clients
   - Internal Socket.IO client for Node.js core communication
   - Message relay and validation logic

2. **Node.js Agent Core** (`backend/node-core/`)
   - Internal Socket.IO server (port 8081)
   - Agent lifecycle management
   - Real-time state updates and event emission

3. **WebSocket Proxy** (`websocket.py`)
   - Bidirectional message relay
   - Connection management and reconnection
   - Message filtering and validation

## Implementation Details

### 1. WebSocket Proxy Class (`websocket.py`)

#### Key Features:
- **Dual Socket.IO Instances**: External server + Internal client
- **Connection Management**: Automatic reconnection with configurable attempts
- **Message Validation**: Filtering for valid agent and control events
- **Authentication**: Client authentication before message relay
- **Error Handling**: Comprehensive logging and error recovery

#### Configuration:
```python
# Environment variables
NODE_CORE_HOST=localhost          # Node.js core host
NODE_CORE_PORT=8081              # Node.js core port
SOCKET_RECONNECT_ATTEMPTS=5      # Reconnection attempts
SOCKET_RECONNECT_DELAY=2000      # Delay between attempts (ms)
```

#### Event Handling:

**External Events (Frontend → FastAPI → Node.js):**
- `create-agent` - Create new agent
- `stop-agent` - Stop running agent
- `start-agent` - Start stopped agent
- `destroy-agent` - Destroy agent
- `restart-agent` - Restart agent
- `get-settings` - Get agent settings
- `set-agent-settings` - Update agent settings
- `get_agent_list` - List all agents
- `get-profiles` - List available profiles
- `get-profile` - Get specific profile
- `save-profile` - Save/update profile
- `delete-profile` - Delete profile
- `create-agent-from-profile` - Create agent from profile

**Internal Events (Node.js → FastAPI → Frontend):**
- `agent:state:update` - Agent state changes
- `agent:action:executed` - Action completion
- `agent:message:sent` - Chat messages
- `system:status` - System status updates
- `agents-status` - Agent list updates
- `profile_response` - Profile management responses
- `agent_control_response` - Agent control responses

### 2. Message Validation

#### Agent Events Validation:
```python
def _validate_agent_event(self, event: str, data: Any) -> bool:
    # Validates required fields for each event type
    # agent:state:update → agentId, timestamp
    # agent:action:executed → agentId, action, timestamp
    # agent:message:sent → agentId, message, timestamp
```

#### Control Events Validation:
```python
def _validate_control_event(self, event: str, data: Any) -> bool:
    # Validates event type and data presence
    # Ensures only valid control events are forwarded
```

### 3. Connection Management

#### Reconnection Logic:
```python
async def _reconnect_internal(self):
    # Attempts reconnection with exponential backoff
    # Notifies external clients of connection status
    # Handles graceful degradation when Node.js core unavailable
```

#### Client Tracking:
```python
self.external_clients: Dict[str, Dict[str, Any]] = {
    "sid": {
        "connected_at": timestamp,
        "authenticated": bool,
        "auth_token": str
    }
}
```

### 4. FastAPI Integration (`main.py`)

#### Startup/Shutdown Events:
```python
@app.on_event("startup")
async def startup_event():
    await websocket_proxy.start()

@app.on_event("shutdown")
async def shutdown_event():
    await websocket_proxy.stop()
```

#### WebSocket Mounting:
```python
app.mount("/socket.io", websocket_proxy.get_app())
```

## Event Flow Examples

### 1. Agent State Update
```
Node.js Core → emit('agent:state:update', data)
         ↓
FastAPI Internal Client → receives event
         ↓
WebSocket Proxy → validates event
         ↓
FastAPI External Server → broadcast to authenticated clients
         ↓
Frontend → receives real-time state update
```

### 2. Agent Control
```
Frontend → emit('create-agent', data)
         ↓
FastAPI External Server → receives event
         ↓
WebSocket Proxy → validates authentication + data
         ↓
FastAPI Internal Client → forward to Node.js core
         ↓
Node.js Core → processes agent creation
         ↓
Node.js Core → emit response back through same path
```

## Testing

### Test Script (`test_internal_communication.py`)

#### Test Coverage:
1. **Availability Tests**
   - Node.js core accessibility (port 8081)
   - FastAPI gateway accessibility (port 8000)

2. **WebSocket Tests**
   - Connection establishment
   - Authentication flow
   - Event reception

3. **Event Tests**
   - Agent state updates
   - Agent control events
   - Profile management events

#### Running Tests:
```bash
# Install dependencies
pip install -r requirements.txt

# Start Node.js core (in separate terminal)
cd backend/node-core
node src/mindcraft/mindserver.js

# Run communication test
cd backend
python test_internal_communication.py

# Or use the helper script
python start_test_environment.py
```

## Error Handling

### Connection Errors:
- **Node.js Core Unavailable**: Graceful degradation, client notification
- **Reconnection Failure**: Exponential backoff, status broadcasting
- **Client Disconnection**: Cleanup, connection state management

### Message Errors:
- **Invalid Events**: Filtering, error responses
- **Malformed Data**: Validation, error logging
- **Authentication Failures**: Rejection, error events

### Logging Levels:
```python
logging.basicConfig(level=logging.INFO)
logger.info()  # Connection events, successful operations
logger.warning()  # Reconnection attempts, missing data
logger.error()  # Connection failures, validation errors
```

## Performance Considerations

### Connection Pooling:
- Single internal client connection shared by all external clients
- Efficient resource utilization

### Message Filtering:
- Client-side validation before forwarding
- Reduces unnecessary internal traffic

### Reconnection Strategy:
- Configurable retry limits and delays
- Prevents connection storm

## Security Considerations

### Authentication:
- Token-based authentication for external clients
- Internal connections trusted (localhost)

### Event Validation:
- Whitelist of allowed events
- Data structure validation

### CORS Configuration:
- Restricted to allowed origins
- Proper headers handling

## Troubleshooting

### Common Issues:

1. **Connection Refused (Port 8081)**
   - Ensure Node.js core is running
   - Check port configuration in `.env`

2. **Authentication Failures**
   - Verify token format in frontend
   - Check authentication logic

3. **Event Not Received**
   - Check event name spelling
   - Verify event validation rules
   - Check client authentication status

4. **Reconnection Loop**
   - Check Node.js core stability
   - Verify network connectivity
   - Review reconnection configuration

### Debug Commands:
```bash
# Check Node.js core status
curl http://localhost:8081

# Check FastAPI health
curl http://localhost:8000/health

# Monitor logs
tail -f backend/fastapi-gateway/logs/app.log
```

## Future Enhancements

### Planned Improvements:
1. **JWT Authentication**: Proper token validation
2. **Message Queuing**: Handle temporary disconnections
3. **Load Balancing**: Multiple Node.js core instances
4. **Metrics Collection**: Performance monitoring
5. **Dynamic Configuration**: Runtime setting updates

### Scalability Considerations:
- Horizontal scaling of FastAPI gateways
- Redis for shared state management
- Database-backed configuration

## Conclusion

The internal Socket.IO communication implementation provides a robust, scalable foundation for the Mindcraft hybrid 3-tier architecture. It ensures reliable real-time communication between the FastAPI Gateway and Node.js Agent Core while maintaining backward compatibility and providing comprehensive error handling.

The implementation successfully addresses all requirements from the FastAPI Migration Design:
- ✅ Internal Socket.IO client connection to Node.js core
- ✅ Bidirectional message relay for all key events
- ✅ Connection management with reconnection logic
- ✅ Message filtering and validation
- ✅ Comprehensive error handling and logging
- ✅ Test coverage for validation

This completes the internal communication layer for the FastAPI Gateway migration.