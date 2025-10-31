@echo off
REM health_check.bat - Windows batch wrapper for SBS health checks
REM Compatible with Windows PowerShell and Command Prompt

setlocal enabledelayedexpansion

REM Colors (limited support in Windows)
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

REM Get script directory
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

REM Function to print status (simulated with goto)
goto :main

:print_status
echo %~2%~1%NC%
goto :eof

:setup_python_env
call :print_status "🐍 Setting up Python environment..." "%BLUE%"

REM Check if Python is available
python --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set "PYTHON_CMD=python"
) else (
    python3 --version >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        set "PYTHON_CMD=python3"
    ) else (
        call :print_status "❌ Error: Python not found. Please install Python 3.7+." "%RED%"
        exit /b 1
    )
)

REM Get Python version
for /f "tokens=2" %%i in ('%PYTHON_CMD% --version 2^>^&1') do set "PYTHON_VERSION=%%i"
call :print_status "✅ Found Python !PYTHON_VERSION!" "%GREEN%"

REM Check if virtual environment exists
if not exist "venv" (
    call :print_status "📦 Creating virtual environment..." "%BLUE%"
    %PYTHON_CMD% -m venv venv
)

REM Activate virtual environment
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
) else (
    call :print_status "⚠️ Warning: Could not find virtual environment activation script" "%YELLOW%"
)

REM Install requirements
if exist "requirements.txt" (
    call :print_status "📥 Installing dependencies..." "%BLUE%"
    pip install -r requirements.txt --quiet
)
goto :eof

:run_health_check
call :print_status "🔍 Running SBS n8n Ecosystem Health Check..." "%BLUE%"
%PYTHON_CMD% health_check.py %*
goto :eof

:show_usage
echo SBS n8n Ecosystem Health Check Wrapper (Windows)
echo.
echo Usage: %~nx0 [OPTIONS]
echo.
echo Options:
echo   --quick         Run basic checks only
echo   --full          Run comprehensive checks (default)
echo   --docker-only   Check Docker services only
echo   --api-only      Check APIs and webhooks only
echo   --export-json   Export results to JSON file
echo   --silent        Suppress console output
echo   --config FILE   Use custom config file
echo   --setup-only    Only setup environment, don't run checks
echo   --help          Show this help message
echo.
echo Examples:
echo   %~nx0                    # Run all checks
echo   %~nx0 --quick            # Run basic checks only
echo   %~nx0 --docker-only      # Check Docker services only
echo   %~nx0 --export-json      # Export results to JSON
echo.
goto :eof

:main
REM Parse arguments
set "SETUP_ONLY=false"
set "ARGS="

:parse_args
if "%~1"=="" goto :end_parse
if "%~1"=="--help" goto :show_help
if "%~1"=="-h" goto :show_help
if "%~1"=="--setup-only" (
    set "SETUP_ONLY=true"
) else (
    set "ARGS=!ARGS! %~1"
)
shift
goto :parse_args

:show_help
call :show_usage
exit /b 0

:end_parse
REM Setup Python environment
call :setup_python_env
if %ERRORLEVEL% NEQ 0 exit /b %ERRORLEVEL%

if "%SETUP_ONLY%"=="true" (
    call :print_status "✅ Environment setup complete. Use '%~nx0' to run health checks." "%GREEN%"
    exit /b 0
)

REM Run health checks
call :run_health_check %ARGS%
exit /b %ERRORLEVEL%