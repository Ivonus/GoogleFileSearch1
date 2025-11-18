# ========================================
# Script Health Check
# Google File Search Application - Windows
# ========================================

param(
    [string]$Url = "http://localhost:5000/api/config",
    [int]$TimeoutSec = 10,
    [switch]$AutoRestart
)

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host " HEALTH CHECK" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Write-Host "[$timestamp] Verifica stato servizio..." -ForegroundColor Gray

try {
    # Test connessione HTTP
    $response = Invoke-WebRequest -Uri $Url -TimeoutSec $TimeoutSec -UseBasicParsing -ErrorAction Stop
    
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ Servizio OK" -ForegroundColor Green
        Write-Host "  Status Code: $($response.StatusCode)" -ForegroundColor Gray
        Write-Host "  Response Time: $($response.Headers['Date'])" -ForegroundColor Gray
        
        # Parse JSON response se disponibile
        try {
            $config = $response.Content | ConvertFrom-Json
            Write-Host "  Model: $($config.default_model)" -ForegroundColor Gray
            Write-Host "  Results Count: $($config.results_count)" -ForegroundColor Gray
        } catch {
            # Ignore JSON parse errors
        }
        
        exit 0
    } else {
        Write-Host "✗ Servizio DEGRADED" -ForegroundColor Yellow
        Write-Host "  Status Code: $($response.StatusCode)" -ForegroundColor Gray
        exit 1
    }
    
} catch {
    Write-Host "✗ Servizio DOWN" -ForegroundColor Red
    Write-Host "  Errore: $($_.Exception.Message)" -ForegroundColor Gray
    
    # Auto-restart se richiesto
    if ($AutoRestart) {
        Write-Host ""
        Write-Host "Tentativo di riavvio servizio..." -ForegroundColor Yellow
        
        try {
            # Prova con NSSM
            $nssmPath = Get-Command nssm -ErrorAction SilentlyContinue
            if ($nssmPath) {
                nssm restart GoogleFileSearch
                Write-Host "Servizio riavviato con NSSM" -ForegroundColor Green
            } else {
                # Prova con servizio Windows standard
                Restart-Service -Name "GoogleFileSearch" -ErrorAction Stop
                Write-Host "Servizio riavviato" -ForegroundColor Green
            }
            
            # Attendi avvio
            Start-Sleep -Seconds 5
            
            # Re-test
            $retest = Invoke-WebRequest -Uri $Url -TimeoutSec $TimeoutSec -UseBasicParsing -ErrorAction SilentlyContinue
            if ($retest.StatusCode -eq 200) {
                Write-Host "✓ Servizio ripristinato con successo" -ForegroundColor Green
                exit 0
            }
            
        } catch {
            Write-Host "ERRORE: Impossibile riavviare il servizio" -ForegroundColor Red
            Write-Host "  $($_.Exception.Message)" -ForegroundColor Gray
        }
    }
    
    exit 2
}
