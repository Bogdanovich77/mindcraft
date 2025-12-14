@echo off
echo Testing port availability...

echo Checking port 8081...
netstat -ano | findstr ":8081"
if %errorlevel% equ 0 (
    echo Port 8081 is in use
) else (
    echo Port 8081 is available
)

echo Checking port 8000...
netstat -ano | findstr ":8000"
if %errorlevel% equ 0 (
    echo Port 8000 is in use
) else (
    echo Port 8000 is available
)

echo Checking port 5173...
netstat -ano | findstr ":5173"
if %errorlevel% equ 0 (
    echo Port 5173 is in use
) else (
    echo Port 5173 is available
)

pause