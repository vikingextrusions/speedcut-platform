@echo off
echo.
echo ========================================
echo  Speedcut Geometry Service v0.2.0
echo ========================================
echo.

REM Check venv exists
if not exist "venv\Scripts\activate.bat" (
    echo ERROR: Virtual environment not found.
    echo Run setup.bat first!
    pause
    exit /b 1
)

REM Activate venv
call venv\Scripts\activate.bat

REM Set env vars for Supabase (edit these or set in system env)
REM If not set, the service still runs but won't persist results to Supabase
if not defined SUPABASE_URL (
    echo [INFO] SUPABASE_URL not set - results won't persist to database
)

echo Starting geometry analysis service on http://localhost:8100
echo Press Ctrl+C to stop
echo.

python -m uvicorn main:app --reload --port 8100 --host 0.0.0.0
