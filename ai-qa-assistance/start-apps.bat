@echo off
echo Starting AI QA Assistance Applications...
echo.

echo Starting Backend Server (Port 3001)...
start "Backend Server" cmd /k "cd /d C:\Repos\ai-qa-assistance-backend && npm run dev"

echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo Starting Frontend Application (Port 3000)...
start "Frontend App" cmd /k "cd /d C:\Repos\ai-qa-assistance && npm run dev"

echo.
echo Applications are starting...
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit this script...
pause >nul
