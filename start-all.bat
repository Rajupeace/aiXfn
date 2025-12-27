@echo off
title Friendly Notebook Launcher

echo ===================================================
echo 🚀 LAUNCHING FRIENDLY NOTEBOOK ECOSYSTEM
echo ===================================================

echo 🛑 Stopping any existing processes...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im python.exe >nul 2>&1

echo.
echo 1. Starting Node.js Backend (Port 5000)...
start "Friendly - Node Backend" cmd /k "cd backend && npm start"

echo.
echo 2. Starting Python AI Agent (Port 8000)...
start "Friendly - AI Agent" cmd /k "cd backend\ai_agent && call venv\Scripts\activate && uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

echo.
echo 3. Starting React Frontend (Port 3000)...
echo    (This will open your default browser)
start "Friendly - Frontend" cmd /k "npm start"

echo.
echo ===================================================
echo ✅ All services are launching in separate windows!
echo.
echo    - Frontend: http://localhost:3000
echo    - Node Backend: http://localhost:5000
echo    - AI Agent: http://localhost:8000/docs
echo.
echo    [!] Keep this window open or close it, services run independently.
echo ===================================================
pause
