@echo off
setlocal enabledelayedexpansion

echo Starting Mindcraft with 3-Tier Architecture...
echo ============================================

REM Function to check if a port is in use
:check_port
echo Checking port %1...
echo Parameter passed: [%1]
netstat -ano | findstr "LISTENING" | findstr ":%1 "
set check_result=%errorlevel%
echo Findstr result: %check_result%
if %check_result% equ 0 (
    echo Port %1 is already in use. Please stop the process using this port.
    exit /b 1
) else (
    echo Port %1 is available
)
exit /b 0

REM Check if required ports are available
echo Checking port availability...
call :check_port 8081
set result1=%errorlevel%
echo Port 8081 check result: %result1%
if %result1% neq 0 (
    echo Port 8081 check failed with error level %result1%
    exit /b 1
)
call :check_port 8000
set result2=%errorlevel%
echo Port 8000 check result: %result2%
if %result2% neq 0 (
    echo Port 8000 check failed with error level %result2%
    exit /b 1
)
call :check_port 5173
set result3=%errorlevel%
echo Port 5173 check result: %result3%
if %result3% neq 0 (
    echo Port 5173 check failed with error level %result3%
    exit /b 1
)

echo All ports are available. Starting services...

pause