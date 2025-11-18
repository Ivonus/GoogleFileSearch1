# ========================================
# Script Installazione Servizio Windows
# Google File Search Application
# ========================================

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host " INSTALLAZIONE SERVIZIO WINDOWS" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Verifica esecuzione come amministratore
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERRORE: Questo script richiede privilegi di amministratore!" -ForegroundColor Red
    Write-Host "Esegui PowerShell come Amministratore e riprova." -ForegroundColor Yellow
    pause
    exit 1
}

# Vai alla root del progetto
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = (Get-Item $scriptPath).Parent.FullName
Set-Location $projectRoot

Write-Host "Directory progetto: $projectRoot" -ForegroundColor Gray
Write-Host ""

# Verifica NSSM
$nssmPath = Get-Command nssm -ErrorAction SilentlyContinue

if (-not $nssmPath) {
    Write-Host "NSSM non trovato. Installazione..." -ForegroundColor Yellow
    
    # Verifica Chocolatey
    $chocoPath = Get-Command choco -ErrorAction SilentlyContinue
    
    if ($chocoPath) {
        Write-Host "Installazione NSSM con Chocolatey..." -ForegroundColor Gray
        choco install nssm -y
        
        # Refresh PATH
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        
    } else {
        Write-Host ""
        Write-Host "Chocolatey non trovato." -ForegroundColor Yellow
        Write-Host "Scarica NSSM manualmente da: https://nssm.cc/download" -ForegroundColor Cyan
        Write-Host "Estrai nssm.exe in C:\Windows\System32 e riesegui questo script." -ForegroundColor Cyan
        pause
        exit 1
    }
}

# Verifica ambiente virtuale
if (-not (Test-Path "venv")) {
    Write-Host "ERRORE: Ambiente virtuale non trovato!" -ForegroundColor Red
    Write-Host "Esegui prima setup\setup.bat" -ForegroundColor Yellow
    pause
    exit 1
}

# Verifica .env
if (-not (Test-Path ".env")) {
    Write-Host "ERRORE: File .env non trovato!" -ForegroundColor Red
    Write-Host "Configura prima il file .env" -ForegroundColor Yellow
    pause
    exit 1
}

# Configurazione servizio
$serviceName = "GoogleFileSearch"
$pythonExe = Join-Path $projectRoot "venv\Scripts\python.exe"
$appPath = Join-Path $projectRoot "backend\app.py"
$workDir = Join-Path $projectRoot "backend"
$logsDir = Join-Path $projectRoot "logs"

# Crea directory logs se non esiste
if (-not (Test-Path $logsDir)) {
    New-Item -ItemType Directory -Path $logsDir | Out-Null
}

$stdoutLog = Join-Path $logsDir "service-stdout.log"
$stderrLog = Join-Path $logsDir "service-stderr.log"

Write-Host "Configurazione servizio:" -ForegroundColor Cyan
Write-Host "- Nome: $serviceName" -ForegroundColor Gray
Write-Host "- Python: $pythonExe" -ForegroundColor Gray
Write-Host "- App: $appPath" -ForegroundColor Gray
Write-Host "- WorkDir: $workDir" -ForegroundColor Gray
Write-Host ""

# Verifica se servizio esiste già
$existingService = Get-Service -Name $serviceName -ErrorAction SilentlyContinue

if ($existingService) {
    Write-Host "Servizio '$serviceName' già esistente." -ForegroundColor Yellow
    $response = Read-Host "Vuoi rimuoverlo e reinstallarlo? (s/n)"
    
    if ($response -eq 's' -or $response -eq 'S') {
        Write-Host "Rimozione servizio esistente..." -ForegroundColor Gray
        nssm stop $serviceName
        nssm remove $serviceName confirm
        Start-Sleep -Seconds 2
    } else {
        Write-Host "Installazione annullata." -ForegroundColor Yellow
        pause
        exit 0
    }
}

# Installa servizio
Write-Host "Installazione servizio '$serviceName'..." -ForegroundColor Green
nssm install $serviceName "$pythonExe" "$appPath"

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRORE: Installazione servizio fallita!" -ForegroundColor Red
    pause
    exit 1
}

# Configura servizio
Write-Host "Configurazione servizio..." -ForegroundColor Gray

nssm set $serviceName AppDirectory "$workDir"
nssm set $serviceName DisplayName "Google File Search RAG"
nssm set $serviceName Description "Sistema di Gestione Documenti AI con Google File Search e Gemini"
nssm set $serviceName Start SERVICE_AUTO_START

# Log
nssm set $serviceName AppStdout "$stdoutLog"
nssm set $serviceName AppStderr "$stderrLog"
nssm set $serviceName AppStdoutCreationDisposition 4
nssm set $serviceName AppStderrCreationDisposition 4

# Variabili ambiente
nssm set $serviceName AppEnvironmentExtra "PYTHONUNBUFFERED=1"

# Azioni su fallimento
nssm set $serviceName AppExit Default Restart
nssm set $serviceName AppRestartDelay 10000

Write-Host ""
Write-Host "Servizio installato con successo!" -ForegroundColor Green
Write-Host ""

# Chiedi se avviare
$startNow = Read-Host "Vuoi avviare il servizio ora? (s/n)"

if ($startNow -eq 's' -or $startNow -eq 'S') {
    Write-Host "Avvio servizio..." -ForegroundColor Gray
    nssm start $serviceName
    
    Start-Sleep -Seconds 3
    
    # Verifica stato
    $service = Get-Service -Name $serviceName
    
    if ($service.Status -eq "Running") {
        Write-Host ""
        Write-Host "✓ Servizio avviato con successo!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Applicazione disponibile su:" -ForegroundColor Cyan
        Write-Host "- http://localhost:5000" -ForegroundColor White
        Write-Host "- http://$env:COMPUTERNAME:5000" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "ATTENZIONE: Il servizio non è in esecuzione." -ForegroundColor Yellow
        Write-Host "Controlla i log in: $logsDir" -ForegroundColor Gray
        Write-Host ""
    }
}

Write-Host "Comandi utili:" -ForegroundColor Cyan
Write-Host "- nssm start $serviceName      # Avvia servizio" -ForegroundColor Gray
Write-Host "- nssm stop $serviceName       # Ferma servizio" -ForegroundColor Gray
Write-Host "- nssm restart $serviceName    # Riavvia servizio" -ForegroundColor Gray
Write-Host "- nssm status $serviceName     # Verifica stato" -ForegroundColor Gray
Write-Host "- nssm edit $serviceName       # Modifica configurazione" -ForegroundColor Gray
Write-Host "- nssm remove $serviceName     # Rimuovi servizio" -ForegroundColor Gray
Write-Host ""

pause
