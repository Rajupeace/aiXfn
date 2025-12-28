@echo off
echo ===================================================
echo   VU AI AGENT + FRIENDLY NOTEBOOK - UNIFIED START
echo ===================================================

cd /d "%~dp0"

echo [1/3] Starting AI Agent Backend (Python)...
:: Check if venv exists, if so use it, otherwise use global python
if exist "backend\ai_agent\venv\Scripts\activate.bat" (
    start "Vu AI Agent Backend" cmd /k "cd backend\ai_agent && venv\Scripts\activate && pip install -r requirements.txt && python main.py"
) else (
    start "Vu AI Agent Backend" cmd /k "cd backend\ai_agent && pip install -r requirements.txt && python main.py"
)

echo [2/3] Starting Notebook Backend (Node.js)...
start "Friendly Notebook Backend" cmd /k "cd backend && npm install && node index.js"

echo [3/3] Starting Frontend (React)...
:: Install concurrently if you want truly one window, but separate windows are safer for debugging.
:: We are fixing the paths here as requested.
start "Friendly Notebook Frontend" cmd /k "npm install && npm start"

echo.
echo All services are starting in separate windows...
echo - AI Agent: http://localhost:8000
echo - API Backend: http://localhost:5000
echo - Frontend: http://localhost:3000
echo.
pause
