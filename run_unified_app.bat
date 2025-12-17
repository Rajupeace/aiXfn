@echo off
echo ===================================================
echo   VU AI AGENT + FRIENDLY NOTEBOOK - UNIFIED START
echo ===================================================

cd /d "%~dp0"

echo [1/3] Starting AI Agent Backend (Python)...
start "Vu AI Agent Backend" cmd /k "cd Friendly-NoteBook-main\Friendly-NoteBook-main\backend\ai_agent && pip install -r requirements.txt && python main.py"


echo [2/3] Starting Notebook Backend (Node.js)...
start "Friendly Notebook Backend" cmd /k "cd Friendly-NoteBook-main\Friendly-NoteBook-main\backend && npm install && node index.js"

echo [3/3] Starting Frontend (React)...
cd Friendly-NoteBook-main\Friendly-NoteBook-main
start "Friendly Notebook Frontend" cmd /k "npm start"

echo.
echo All services are starting...
echo - AI Agent: http://localhost:8000
echo - API Backend: http://localhost:5000
echo - Frontend: http://localhost:3000
echo.
pause
