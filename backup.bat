@echo off
REM ========================================
REM Script Backup Automatico
REM Google File Search Application
REM ========================================

setlocal enabledelayedexpansion

REM Configurazione
set BACKUP_DIR=C:\Backups\GoogleFileSearch
set PROJECT_DIR=%~dp0..
set DATE=%date:~-4%%date:~3,2%%date:~0,2%
set TIME_STAMP=%time:~0,2%%time:~3,2%%time:~6,2%
set TIME_STAMP=%TIME_STAMP: =0%

REM Crea directory backup se non esiste
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

echo.
echo ====================================
echo  BACKUP GOOGLE FILE SEARCH
echo ====================================
echo.
echo [%date% %time%] Avvio backup...
echo.

REM Vai alla directory del progetto
cd /d "%PROJECT_DIR%"

REM Nome file backup
set BACKUP_FILE=%BACKUP_DIR%\backup-%DATE%_%TIME_STAMP%.tar.gz

echo Directory progetto: %CD%
echo File backup: %BACKUP_FILE%
echo.

REM Verifica se tar è disponibile (Windows 10+)
where tar >nul 2>nul
if errorlevel 1 (
    echo ERRORE: tar non trovato. Disponibile solo su Windows 10 1903+
    echo Alternativa: Usa 7-Zip o WinRAR manualmente
    pause
    exit /b 1
)

REM Crea backup (configurazione, documenti, logs)
echo Creazione archivio...
tar -czf "%BACKUP_FILE%" .env documents_storage logs 2>nul

if errorlevel 1 (
    echo ERRORE: Backup fallito!
    pause
    exit /b 1
)

REM Verifica dimensione backup
for %%A in ("%BACKUP_FILE%") do set BACKUP_SIZE=%%~zA
set /a BACKUP_SIZE_MB=%BACKUP_SIZE% / 1048576

echo.
echo [%date% %time%] Backup completato!
echo File: %BACKUP_FILE%
echo Dimensione: %BACKUP_SIZE_MB% MB
echo.

REM Pulizia backup vecchi (mantieni ultimi 7 giorni)
echo Pulizia backup vecchi...
forfiles /p "%BACKUP_DIR%" /m backup-*.tar.gz /d -7 /c "cmd /c del @path" 2>nul

echo.
echo Backup disponibili:
dir /b "%BACKUP_DIR%\backup-*.tar.gz" 2>nul
echo.

pause
