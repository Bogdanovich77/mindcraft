# Mindcraft Backend Migration: FastAPI Gateway Design

## 1. Purpose and Scope

This document outlines the architectural design and implementation plan for migrating the Mindcraft backend from a monolithic Node.js/Express server (port 8080) to a modern, high-performance **FastAPI API Gateway** (Python) while retaining the core Node.js Agent Management and LangGraph logic.

The primary goal is to:
1.  Eliminate the deprecated Node.js UI server on port 8080.
2.  Consolidate all external control and observation through the new React frontend (port 5173).
3.  Introduce a robust, scalable, and type-safe Python layer (FastAPI) for all API and WebSocket communication.
4.  Establish a clear separation of concerns between the API layer and the Agent Core logic.

## 2. Current Architecture Review (Pre-Migration)

The current system operates with two main components:
-   **Frontend (Port 5173)**: React/Vite application.
-   **Backend (Port 8080)**: Node.js/Express server (`src/mindcraft/mindserver.js`) handling:
    -   Deprecated UI static file serving.
    -   REST API for Profile Management (`/api/profiles`).
    -   Socket.IO server for real-time agent status and control.
    -   Direct communication with the Node.js Agent Core (Mineflayer/LangGraph).

## 3. Target Architecture: Hybrid 3-Tier System

The new architecture will be a 3-tier system, leveraging the strengths of both Node.js (for I/O-heavy Mineflayer integration) and Python/FastAPI (for high-performance API serving).

### Tiers:
1.  **Frontend (React/Vite)**: Runs on port 5173. Communicates exclusively with the FastAPI Gateway.
2.  **API Gateway (FastAPI)**: Runs on a new external port (e.g., 8000). Handles all external HTTP/WebSocket traffic.
3.  **Agent Core Service (Node.js)**: Runs internally (e.g., port 8081). Dedicated to running Mineflayer bots and the LangGraph cognitive loop.

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
├──────────────────────────┤
│ • Mineflayer Integration │
│ • LangGraph Logic        │
│ • Agent Lifecycle Mgmt   │
└──────────────────────────┘
```

## 4. Migration Strategy: Hybrid Approach

We will adopt a **Hybrid Migration Strategy** to minimize risk and leverage the existing, stable Node.js agent core.

### Step 1: Backend Restructuring
-   Create a new top-level directory: `backend/`.
-   Move all existing Node.js backend files (`src/`, `main.js`, `settings.js`, etc.) into `backend/node-core/`.
-   Create `backend/fastapi-gateway/` for the new Python code.

### Step 2: Node.js Agent Core Refactor
-   Refactor the Node.js server (`mindserver.js`) to remove Express/static file serving.
-   It will become a dedicated Socket.IO server running on an internal port (e.g., 8081), only accepting connections from the FastAPI Gateway.
-   The Node.js process will retain all agent management logic (`registerAgent`, `createAgent`, `stopAgent`, etc.) and the real-time agent state emission.

### Step 3: FastAPI Gateway Implementation
-   Implement the FastAPI application in `backend/fastapi-gateway/`.
-   **REST API**: Recreate all Profile Management endpoints (`/api/profiles`, `/api/profiles/{name}`) using FastAPI's routing. These endpoints will communicate with the Node.js Agent Core via internal Socket.IO or a simple HTTP bridge to manage profile files.
-   **WebSocket**: Implement a WebSocket endpoint in FastAPI. This endpoint will act as a proxy, relaying messages between the external React frontend (port 5173) and the internal Node.js Agent Core (port 8081).

### Step 4: Frontend Update
-   Update the frontend's `VITE_API_URL` and `VITE_SOCKET_URL` environment variables to point to the new FastAPI port (e.g., `http://localhost:8000`).
-   No major code changes are expected in the React application, as the API contract (REST endpoints and Socket.IO events) will be maintained by the FastAPI proxy layer.

## 5. New Directory Structure

The existing project structure will be modified as follows:

| Old Path | New Path | Purpose |
| :--- | :--- | :--- |
| `main.js` | `backend/node-core/main.js` | Entry point for the Agent Core Service |
| `src/` | `backend/node-core/src/` | Node.js/TypeScript Agent Core logic |
| `settings.js` | `backend/node-core/settings.js` | Node.js configuration |
| `frontend/` | `frontend/` | Unchanged React UI |
| **(New)** | `backend/fastapi-gateway/` | FastAPI application, API routing, WebSocket proxy |
| **(New)** | `backend/requirements.txt` | Python dependencies (FastAPI, uvicorn, python-socketio) |

## 6. API and Communication Migration Plan

### REST API (Profile Management)
| Endpoint | Old Handler (Node.js) | New Handler (FastAPI) | Communication |
| :--- | :--- | :--- | :--- |
| `GET /api/profiles` | `setupProfileRoutes` | FastAPI route | Internal Socket.IO/RPC to Node.js Core |
| `POST /api/profiles` | `setupProfileRoutes` | FastAPI route | Internal Socket.IO/RPC to Node.js Core |
| `PUT /api/profiles/:name` | `setupProfileRoutes` | FastAPI route | Internal Socket.IO/RPC to Node.js Core |
| `DELETE /api/profiles/:name` | `setupProfileRoutes` | FastAPI route | Internal Socket.IO/RPC to Node.js Core |

### Real-time Communication (Socket.IO)

The FastAPI Gateway will use a Python Socket.IO library (e.g., `python-socketio`) to manage external connections and an internal client to connect to the Node.js Agent Core.

| Flow | Protocol | Source | Destination |
| :--- | :--- | :--- | :--- |
| **Control** (Frontend → Agent) | External WS → Internal WS | Frontend (5173) → FastAPI (8000) → Node.js Core (8081) |
| **Observation** (Agent → Frontend) | Internal WS → External WS | Node.js Core (8081) → FastAPI (8000) → Frontend (5173) |

**Key Change**: The Node.js Agent Core will continue to emit simplified events (`agent:state:update`, `agent:action:executed`, etc.). FastAPI will simply receive these events internally and broadcast them externally to the React frontend.

## 7. Technical Stack

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **API Gateway** | Python 3.11+, FastAPI, Uvicorn | High-performance REST API and WebSocket proxy |
| **Agent Core** | Node.js, TypeScript, Mineflayer, LangGraph | Agent lifecycle management and game interaction |
| **Frontend** | React, Vite, Socket.IO Client | User interface and control |
| **Internal Comms** | Socket.IO (Node.js Server + Python Client) | Reliable, real-time communication between Gateway and Core |

## 8. Next Steps and Validation

| # | Task | Status |
| :--- | :--- | :--- |
| 1 | **Refactor Node.js Core**: Move files to `backend/node-core/` and modify `mindserver.js` to run as an internal Socket.IO server only (no Express/static files). | Pending |
| 2 | **Setup FastAPI Environment**: Create `backend/fastapi-gateway/` and `requirements.txt`. | Pending |
| 3 | **Implement Internal Comms**: Establish Socket.IO connection between FastAPI (client) and Node.js Core (server). | Pending |
| 4 | **Implement WebSocket Proxy**: Create FastAPI WebSocket endpoint to relay agent state updates to the frontend. | Pending |
| 5 | **Migrate REST Endpoints**: Implement Profile Management routes in FastAPI, communicating with Node.js Core for file operations. | Pending |
| 6 | **Update Frontend**: Change connection URLs in `frontend/src/App.tsx` and `frontend/vite.config.ts` to point to the new FastAPI port (8000). | Pending |
| 7 | **Validation**: Run comprehensive integration tests to ensure real-time state updates and agent control function correctly through the new gateway. | Pending |