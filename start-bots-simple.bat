@echo off
setlocal enabledelayedexpansion

echo Starting Mindcraft with 3-Tier Architecture...
echo ============================================

REM Simple port check - just try to start services and handle errors
echo Starting services...

REM Start Node.js Agent Core (Internal Port 8081)
echo Starting Node.js Agent Core on port 8081...
start "Node.js Agent Core" cmd /k "cd backend/node-core && node main.js --profiles "./profiles/SlaveOne.json" "./profiles/SlaveTwo.json" "./profiles/SlaveThree.json" "./profiles/Loner.json" "./profiles/MasterChief.json""

echo Waiting for Node.js Agent Core to initialize...
timeout /t 5 /nobreak >nul

REM Start FastAPI Gateway (Port 8000)
echo Starting FastAPI Gateway on port 8000...
start "FastAPI Gateway" cmd /k "cd backend/fastapi-gateway && if not exist .venv (python -m venv .venv) && .venv\Scripts\activate && pip install -r requirements.txt && python main.py"

echo Waiting for FastAPI Gateway to initialize...
timeout /t 10 /nobreak >nul

REM Start Frontend Development Server (Port 5173)
echo Starting Frontend Development Server on port 5173...
start "Frontend Dashboard" cmd /k "cd frontend && npm run dev"

echo Waiting for Frontend to initialize...
timeout /t 10 /nobreak >nul

echo.
echo ============================================
echo 🚀 Mindcraft 3-Tier Architecture is running!
echo ============================================
echo.
echo Services:
echo   • Node.js Agent Core: http://localhost:8081 (Internal)
echo   • FastAPI Gateway:    http://localhost:8000
echo   • Frontend Dashboard: http://localhost:5173
echo.
echo API Documentation: http://localhost:8000/docs
echo WebSocket Status:   http://localhost:8000/api/websocket/status
echo.
echo All services are starting in separate windows.
echo Close those windows to stop the services.
echo.

echo Press any key to close this window (servers will continue running)...
pause