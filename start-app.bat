@echo off
echo Starting Full Stack Application...

echo Starting Backend Server...
start "Backend" cmd /k "cd /d %~dp0backend && npm start"

timeout /t 5 /nobreak >nul

echo Starting Frontend Server...
start "Frontend" cmd /k "cd /d %~dp0 && npm start"

echo.
echo ================================================
echo  Application is starting...
echo  Frontend will open in your default browser
echo.
echo  Access Points:
echo    Frontend:      http://localhost:3000
echo    Backend API:   http://localhost:5000
echo    Admin Login:   ReddyFBN@1228 / ReddyFBN
echo ================================================

start http://localhost:3000

exit
