#!/bin/bash

echo "Starting Mindcraft with 3-Tier Architecture..."
echo "============================================"

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "Port $port is already in use. Please stop the process using this port."
        return 1
    fi
    return 0
}

# Function to wait for a service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    echo "Waiting for $service_name to be ready..."
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            echo "$service_name is ready!"
            return 0
        fi
        echo "Attempt $attempt/$max_attempts: $service_name not ready yet..."
        sleep 2
        ((attempt++))
    done
    
    echo "ERROR: $service_name failed to start within expected time"
    return 1
}

# Check if required ports are available
echo "Checking port availability..."
check_port 8081 || exit 1  # Node.js Agent Core
check_port 8000 || exit 1  # FastAPI Gateway
check_port 5173 || exit 1  # Frontend

# Start Node.js Agent Core (Internal Port 8081)
echo "Starting Node.js Agent Core on port 8081..."
cd backend/node-core
node main.js --profiles "./profiles/SlaveOne.json" "./profiles/SlaveTwo.json" "./profiles/SlaveThree.json" "./profiles/Loner.json" "./profiles/MasterChief.json" &
NODE_CORE_PID=$!
cd ../..

echo "Node.js Agent Core started with PID: $NODE_CORE_PID"

# Wait for Node.js Agent Core to initialize
sleep 5

# Start FastAPI Gateway (Port 8000)
echo "Starting FastAPI Gateway on port 8000..."
cd backend/fastapi-gateway

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
fi

# Activate virtual environment and start FastAPI
echo "Activating virtual environment and installing dependencies..."
source .venv/bin/activate
pip install -r requirements.txt >/dev/null 2>&1

# Start FastAPI in background while keeping the virtual environment active
echo "Starting FastAPI Gateway..."
python main.py &
FASTAPI_PID=$!

# Keep the virtual environment active for the FastAPI process
cd ../..

echo "FastAPI Gateway started with PID: $FASTAPI_PID"

# Wait for FastAPI Gateway to be ready
wait_for_service "http://localhost:8000/health" "FastAPI Gateway"

# Start Frontend Development Server (Port 5173)
echo "Starting Frontend Development Server on port 5173..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "Frontend started with PID: $FRONTEND_PID"

# Wait for Frontend to be ready
wait_for_service "http://localhost:5173" "Frontend"

echo ""
echo "============================================"
echo "🚀 Mindcraft 3-Tier Architecture is running!"
echo "============================================"
echo ""
echo "Services:"
echo "  • Node.js Agent Core: http://localhost:8081 (Internal)"
echo "  • FastAPI Gateway:    http://localhost:8000"
echo "  • Frontend Dashboard: http://localhost:5173"
echo ""
echo "API Documentation: http://localhost:8000/docs"
echo "WebSocket Status:   http://localhost:8000/api/websocket/status"
echo ""
echo "Process IDs:"
echo "  • Node.js Core: $NODE_CORE_PID"
echo "  • FastAPI:      $FASTAPI_PID"
echo "  • Frontend:     $FRONTEND_PID"
echo ""
echo "To stop all services, press Ctrl+C or run:"
echo "  kill $NODE_CORE_PID $FASTAPI_PID $FRONTEND_PID"
echo ""

# Wait for user interrupt
trap 'echo ""; echo "Stopping all services..."; kill $NODE_CORE_PID $FASTAPI_PID $FRONTEND_PID 2>/dev/null; echo "All services stopped."; exit 0' INT

echo "Press Ctrl+C to stop all services..."
wait