# FastAPI Gateway for Mindcraft

This directory contains the FastAPI gateway service that provides the external API layer for the Mindcraft AI agent system. It acts as a proxy between frontend clients and the internal Node.js Agent Core service.

## Architecture Overview

The FastAPI gateway is part of the hybrid 3-tier architecture:

```
┌──────────────────────────┐
│  Frontend (React/Vite)   │
│  (External Port 5173)    │
└────────────┬─────────────┘
              │ HTTP/WebSocket
┌────────────▼─────────────┐
│  API Gateway (FastAPI)   │
│  (External Port 8000)    │
├──────────────────────────┤
│ • REST API (Profiles)    │
│ • External WebSocket     │
│ • Internal Proxy/Router  │
└────────────┬─────────────┘
              │ Internal Socket/RPC
┌────────────▼─────────────┐
│  Agent Core Service      │
│  (Node.js/LangGraph)     │
│  (Internal Port 8081)    │
└──────────────────────────┘
```

## Features

- **REST API**: Profile management endpoints for agent CRUD operations
- **WebSocket Proxy**: Real-time bidirectional communication between frontend and Node.js core
- **CORS Support**: Configured for frontend on port 5173
- **Authentication**: JWT-based authentication framework (placeholder implementation)
- **Health Monitoring**: Built-in health check and status endpoints
- **Auto Documentation**: OpenAPI/Swagger documentation at `/docs`

## Quick Start

### Prerequisites

- Python 3.11+ installed
- Node.js Agent Core service running on port 8081
- Frontend application (optional) for testing

### ⚠️ CRITICAL: Virtual Environment Requirement

**Before running the FastAPI gateway, you MUST activate the virtual environment:**

```bash
# Windows
cd backend/fastapi-gateway
.venv\Scripts\activate

# Linux/Mac
cd backend/fastapi-gateway
source .venv/bin/activate
```

The virtual environment is located at `backend/fastapi-gateway/.venv/` and must be activated before starting the service.

### Installation and Setup

1. **Navigate to the FastAPI gateway directory:**
   ```bash
   cd backend/fastapi-gateway
   ```

2. **Activate the virtual environment (REQUIRED):**
   ```bash
   # Windows
   .venv\Scripts\activate
   
   # Linux/Mac
   source .venv/bin/activate
   ```

3. **Make the startup script executable (Linux/macOS):**
   ```bash
   chmod +x start.sh
   ```

4. **Run the startup script:**
   ```bash
   ./start.sh
   ```

   This script will:
   - Use the existing virtual environment at `.venv/`
   - Install required dependencies from `../requirements.txt` if needed
   - Start the FastAPI gateway service

### Manual Setup

If you prefer to set up manually:

1. **Activate the existing virtual environment (REQUIRED):**
   ```bash
   # Windows
   .venv\Scripts\activate
   
   # Linux/Mac
   source .venv/bin/activate
   ```

2. **Install dependencies (if not already installed):**
   ```bash
   pip install -r ../requirements.txt
   ```

3. **Configure environment variables:**
   - Copy `.env` file and adjust settings as needed
   - Ensure `NODE_CORE_HOST` and `NODE_CORE_PORT` match your Node.js setup

4. **Start the service:**
   ```bash
   python start.py
   ```

**Note**: The virtual environment `.venv/` should already exist. If it doesn't, create it with:
```bash
python -m venv .venv
```

## Configuration

### Environment Variables (.env)

| Variable | Default | Description |
|----------|---------|-------------|
| `FASTAPI_HOST` | `0.0.0.0` | Host address for FastAPI server |
| `FASTAPI_PORT` | `8000` | External port for API gateway |
| `DEBUG` | `false` | Enable debug mode and auto-reload |
| `NODE_CORE_HOST` | `localhost` | Host of Node.js Agent Core service |
| `NODE_CORE_PORT` | `8081` | Port of Node.js Agent Core service |
| `FRONTEND_URL` | `http://localhost:5173` | Frontend application URL |
| `CORS_ORIGINS` | `localhost:5173,127.0.0.1:5173` | Allowed CORS origins |

## API Endpoints

### REST API

- **GET `/api/profiles`** - List all agent profiles
- **GET `/api/profiles/{name}`** - Get specific agent profile
- **POST `/api/profiles`** - Create new agent profile
- **PUT `/api/profiles/{name}`** - Update existing agent profile
- **DELETE `/api/profiles/{name}`** - Delete agent profile

### System Endpoints

- **GET `/`** - Root endpoint with API information
- **GET `/health`** - Health check endpoint
- **GET `/docs`** - Swagger API documentation
- **GET `/redoc`** - ReDoc API documentation
- **GET `/websocket/info`** - WebSocket connection information

### WebSocket Events

#### Client to Server
- `connect` - Establish WebSocket connection
- `authenticate` - Authenticate with JWT token
- `agent_state_subscribe` - Subscribe to agent state updates
- `agent_command` - Send command to agent

#### Server to Client
- `authenticated` - Authentication success confirmation
- `authentication_error` - Authentication failure
- `agent:state:update` - Agent state update notifications
- `agent:action:executed` - Action execution notifications
- `agent:message:sent` - Agent message notifications
- `system:status` - System status updates

## Usage Examples

### Testing the API

1. **Check health status:**
   ```bash
   curl http://localhost:8000/health
   ```

2. **List all profiles:**
   ```bash
   curl http://localhost:8000/api/profiles
   ```

3. **Create a new profile:**
   ```bash
   curl -X POST http://localhost:8000/api/profiles \
     -H "Content-Type: application/json" \
     -d '{
       "name": "TestAgent",
       "personality": "Friendly and helpful",
       "goals": "Explore the world and help others",
       "model": "gpt",
       "mode": "survival"
     }'
   ```

### WebSocket Connection

```javascript
import { io } from 'socket.io-client';

// Connect to FastAPI gateway
const socket = io('http://localhost:8000');

// Authenticate
socket.emit('authenticate', { token: 'your-jwt-token' });

// Listen for agent updates
socket.on('agent:state:update', (data) => {
  console.log('Agent state updated:', data);
});

// Subscribe to specific agent
socket.emit('agent_state_subscribe', { agent_id: 'TestAgent' });
```

## Development

### Project Structure

```
backend/fastapi-gateway/
├── main.py              # FastAPI application entry point
├── websocket.py         # WebSocket proxy implementation
├── start.py            # Startup script with combined app
├── start.sh            # Shell script for easy startup
├── .env                # Environment configuration
├── requirements.txt    # Python dependencies (in parent dir)
├── routes/             # API route modules
│   ├── __init__.py
│   └── profiles.py     # Profile management endpoints
└── README.md           # This file
```

### Adding New Routes

1. Create a new route file in `routes/` directory
2. Define your FastAPI router with endpoints
3. Import and include the router in `main.py`

Example:
```python
# routes/agents.py
from fastapi import APIRouter

router = APIRouter()

@router.get("/agents")
async def list_agents():
    return {"agents": []}

# Add to main.py
from routes.agents import router as agents_router
app.include_router(agents_router, prefix="/api", tags=["agents"])
```

### Testing

Run the FastAPI application with debug mode enabled:
```bash
DEBUG=true python start.py
```

Access the interactive API documentation:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Troubleshooting

### Common Issues

1. **Virtual environment not activated:**
   - **ERROR**: `ModuleNotFoundError: No module named 'fastapi'`
   - **SOLUTION**: Always activate `.venv` before running:
     ```bash
     # Windows
     cd backend/fastapi-gateway && .venv\Scripts\activate
     
     # Linux/Mac
     cd backend/fastapi-gateway && source .venv/bin/activate
     ```

2. **Port already in use:**
   - Check if port 8000 is available: `netstat -an | grep 8000`
   - Kill existing process or change `FASTAPI_PORT` in `.env`

3. **Connection to Node.js core fails:**
   - Ensure Node.js Agent Core is running on port 8081
   - Check `NODE_CORE_HOST` and `NODE_CORE_PORT` in `.env`
   - Verify firewall settings

4. **CORS errors:**
   - Check that frontend URL is in `CORS_ORIGINS`
   - Ensure frontend is making requests to correct port (8000)

5. **WebSocket connection issues:**
   - Check browser console for connection errors
   - Verify WebSocket endpoint: `ws://localhost:8000/socket.io`
   - Ensure virtual environment is activated

### Logs

Enable debug logging for detailed information:
```bash
LOG_LEVEL=DEBUG python start.py
```

## Production Deployment

For production deployment:

1. **Use a production WSGI server:**
   ```bash
   pip install gunicorn
   gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
   ```

2. **Configure reverse proxy (nginx):**
   ```nginx
   location / {
       proxy_pass http://127.0.0.1:8000;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
   }
   
   location /socket.io {
       proxy_pass http://127.0.0.1:8000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection "upgrade";
   }
   ```

3. **Set up environment variables:**
   - Use proper JWT secret keys
   - Configure appropriate CORS origins
   - Set up proper logging and monitoring

## License

This project is part of the Mindcraft AI agent system. See the main project license for details.