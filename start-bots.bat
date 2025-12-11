@echo off
echo Starting Mindcraft with Backend and Frontend...

echo Starting Backend Server...
start "Mindcraft Backend" cmd /k "node main.js --profiles "./profiles/MasterChief.json" "./profiles/SlaveOne.json" "./profiles/Loner.json""

echo Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

echo Starting Frontend Development Server...
cd frontend
start "Mindcraft Frontend" cmd /k "npm run dev"
cd ..

echo.
echo Mindcraft is launching...
echo Backend: http://localhost:3000
echo Frontend Dashboard: http://localhost:5173
echo.
echo Press any key to close this window (servers will continue running)...
pause