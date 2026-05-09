@echo off
title AI Playbook

cd /d "%~dp0"

echo.
echo   AI Playbook
echo   -----------
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [X] Node.js not found
    echo     Install from https://nodejs.org
    pause
    exit /b 1
)

if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [X] Install failed
        pause
        exit /b 1
    )
)

echo Starting...
echo Open http://localhost:3000
echo Press Ctrl+C to stop
echo.

start http://localhost:3000
npm run dev
pause
