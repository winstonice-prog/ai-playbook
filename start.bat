@echo off
chcp 65001 >nul
title AI Playbook

echo.
echo   ╔══════════════════════════╗
echo   ║     AI Playbook         ║
echo   ╚══════════════════════════╝
echo.

cd /d "%~dp0"

:: Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [X] Node.js not found. Please install from https://nodejs.org
    pause
    exit /b 1
)

:: Install dependencies if needed
if not exist "node_modules\" (
    echo [!] Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [X] Installation failed
        pause
        exit /b 1
    )
    echo [√] Dependencies installed
    echo.
)

echo [√] Starting AI Playbook...
echo [√] Open http://localhost:3000 in your browser
echo.
echo Press Ctrl+C to stop
echo.

start http://localhost:3000
call npm run dev
pause
