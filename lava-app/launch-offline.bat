@echo off
echo Starting LAVA Office Manual (offline)...

:: Start PDF server serving K:\6_MANUALS_TEST on port 4000
start "PDF Server" cmd /c "npx http-server "K:\6_MANUALS_TEST" -p 4000 --cors -c-1 -s"

:: Wait a moment for the server to start
timeout /t 2 /nobreak >nul

:: Start app server serving dist-offline on port 3000 and open browser
start "App Server" cmd /c "npx http-server "%~dp0dist-offline" -p 3000 -c-1 -s"

timeout /t 2 /nobreak >nul

:: Open the app in the default browser
start http://localhost:3000
