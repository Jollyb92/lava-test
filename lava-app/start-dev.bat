@echo off
setlocal
title LAVA App (dev)
cd /d "%~dp0"

:: Folder that contains 6_MANUALS_TEST (served as /pdf-server/... by the Vite proxy)
set "PDF_ROOT=\\lava-b-stor01\LIBRARY_WORKSPACE\"
set "PDF_PORT=3000"
:: Administrative Forms folder, served as /pdf-forms/...
set "FORMS_ROOT=\\lava-b-stor01\LIBRARY\4_GENERAL OFFICE\91_BER\Administrative Forms"
set "FORMS_PORT=3001"

if not exist "%PDF_ROOT%6_MANUALS_TEST" (
  echo WARNING: %PDF_ROOT%6_MANUALS_TEST not found - is the office network reachable?
  echo The app will start, but PDFs from the file server will not load.
  echo.
)

if not exist "node_modules" (
  echo Installing dependencies, first run only...
  call npm install || goto :fail
)

:: PDF server in its own window, reachable only from this computer
start "PDF Server :%PDF_PORT%" cmd /k npx http-server "%PDF_ROOT%" -p %PDF_PORT% -a 127.0.0.1 --cors -c-1
start "Forms Server :%FORMS_PORT%" cmd /k npx http-server "%FORMS_ROOT%" -p %FORMS_PORT% -a 127.0.0.1 --cors -c-1

:: Vite dev server; opens the app in the default browser when ready
call npm run dev -- --open
goto :eof

:fail
echo.
echo npm install failed. Is Node.js installed?
pause
