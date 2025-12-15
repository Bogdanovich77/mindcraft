@echo off
setlocal enabledelayedexpansion

echo Starting Mindcraft with 3-Tier Architecture...
echo ============================================

REM Check if required ports are available
echo Checking port availability...

REM Check port 8081
netstat -ano | findstr ":8081 " | findstr "LISTENING" >nul
if %errorlevel% equ 0 (
    echo Port 8081 is already in use. Please stop the process using this port.
    exit /b 1
)

REM Check port 8000
netstat -ano | findstr ":8000 " | findstr "LISTENING" >nul
if %errorlevel% equ 0 (
    echo Port 8000 is already in use. Please stop the process using this port.
    exit /b 1
)

REM Check port 5173
netstat -ano | findstr ":5173 " | findstr "LISTENING" >nul
if %errorlevel% equ 0 (
    echo Port 5173 is already in use. Please stop the process using this port.
    exit /b 1
)

REM Start Node.js Agent Core (Internal Port 8081)
echo Starting Node.js Agent Core on port 8081...
start "Node.js Agent Core" cmd /k "cd backend/node-core && node main.js --profiles "./profiles/SlaveOne.json" --profiles "./profiles/SlaveTwo.json" --profiles "./profiles/SlaveThree.json" --profiles "./profiles/Loner.json" --profiles "./profiles/MasterChief.json""

echo Waiting for Node.js Agent Core to initialize...
timeout /t 5 /nobreak > nul 2>&1

REM Start FastAPI Gateway (Port 8000)
echo Starting FastAPI Gateway on port 8000...
start "FastAPI Gateway" cmd /k "cd backend/fastapi-gateway && .venv\Scripts\activate.bat && python main.py"

echo Waiting for FastAPI Gateway to initialize...
timeout /t 10 /nobreak > nul 2>&1

REM Start Frontend Development Server (Port 5173)
echo Starting Frontend Development Server on port 5173...
start "Frontend Dashboard" cmd /k "cd frontend && npm run dev"

echo Waiting for Frontend to initialize...
timeout /t 10 /nobreak > nul 2>&1

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