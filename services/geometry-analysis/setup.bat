@echo off
echo.
echo ========================================
echo  Speedcut Geometry Service - Setup
echo ========================================
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not found. Install Python 3.10+ first.
    pause
    exit /b 1
)
echo [OK] Python found

REM Create virtual environment if not exists
if not exist "venv" (
    echo.
    echo Creating virtual environment...
    python -m venv venv
    echo [OK] Virtual environment created
) else (
    echo [OK] Virtual environment exists
)

REM Activate and install dependencies
echo.
echo Installing dependencies (this may take a few minutes first time)...
call venv\Scripts\activate.bat

pip install --upgrade pip >nul 2>&1

REM Install CadQuery - this pulls in OCP (OpenCASCADE) automatically on Windows
pip install cadquery 2>&1 | findstr /V "already satisfied"

REM Install remaining deps
pip install fastapi "uvicorn[standard]" python-multipart trimesh numpy httpx 2>&1 | findstr /V "already satisfied"

echo.
echo ========================================
echo  Setup complete! Run 'run.bat' to start
echo ========================================
echo.
pause
