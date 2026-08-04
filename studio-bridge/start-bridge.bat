@echo off
REM Blue Don Studio Bridge - double-click to start on the Studio B PC.
REM Leave this window open for the whole broadcast. Closing it takes the bridge
REM offline, and the studio console shows DISCONNECTED within about 20 seconds.

cd /d "%~dp0"

if not exist ".env" (
  echo.
  echo   No .env file found in this folder.
  echo   Copy .env.example to .env and fill it in first.
  echo   Instructions: docs\STUDIO_BRIDGE_SETUP.md
  echo.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Installing the bridge for the first time...
  call npm install
  if errorlevel 1 (
    echo.
    echo   npm install failed. Check that Node.js 20 or newer is installed.
    echo.
    pause
    exit /b 1
  )
)

echo Starting the Blue Don Studio Bridge. Press Ctrl+C to stop.
node index.js

echo.
echo The bridge stopped.
pause
