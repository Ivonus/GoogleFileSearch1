@echo off
REM ========================================
REM Script di Avvio per PRODUZIONE
REM Google File Search Application - Windows
REM ========================================

echo.
echo ====================================
echo  AVVIO SERVER PRODUZIONE
echo ====================================
echo.

REM Vai alla root del progetto (cartella padre di setup/)
cd /d "%~dp0\.."

REM Verifica ambiente virtuale
if not exist "venv\" (
    echo ERRORE: Ambiente virtuale non trovato!
    echo Esegui prima setup\setup.bat
    pause
    exit /b 1
)

REM Verifica file .env
if not exist ".env" (
    echo ERRORE: File .env non trovato!
    pause
    exit /b 1
)

REM Attiva ambiente virtuale
call venv\Scripts\activate.bat

REM Verifica Waitress
python -c "import waitress" 2>nul
if errorlevel 1 (
    echo Waitress non trovato. Installazione...
    pip install waitress
)

REM Configurazione server
set HOST=0.0.0.0
set PORT=5000
set THREADS=4
set TIMEOUT=300

echo Configurazione:
echo - Host: %HOST%
echo - Port: %PORT%
echo - Threads: %THREADS%
echo - Timeout: %TIMEOUT%s
echo.
echo Applicazione disponibile su:
echo - http://localhost:%PORT%
echo - http://%COMPUTERNAME%:%PORT%
echo.
echo Premi Ctrl+C per fermare il server
echo.

REM Avvia con Waitress
cd backend
waitress-serve --host=%HOST% --port=%PORT% --threads=%THREADS% --channel-timeout=%TIMEOUT% --connection-limit=1000 app:app
