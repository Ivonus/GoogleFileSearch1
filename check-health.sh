#!/bin/bash
# ========================================
# Script Health Check
# Google File Search Application - Linux
# ========================================

# Configurazione
HEALTH_URL="${HEALTH_URL:-http://localhost:5000/api/config}"
TIMEOUT="${TIMEOUT:-10}"
AUTO_RESTART="${AUTO_RESTART:-false}"
SERVICE_NAME="google-filesearch"

echo ""
echo "===================================="
echo " HEALTH CHECK"
echo "===================================="
echo ""

timestamp=$(date '+%Y-%m-%d %H:%M:%S')
echo "[$timestamp] Verifica stato servizio..."

# Test connessione HTTP
if response=$(curl -sf --max-time "$TIMEOUT" "$HEALTH_URL" 2>&1); then
    echo "✓ Servizio OK"
    
    # Parse JSON response se jq disponibile
    if command -v jq &> /dev/null; then
        echo "  Model: $(echo "$response" | jq -r '.default_model')"
        echo "  Results Count: $(echo "$response" | jq -r '.results_count')"
    fi
    
    exit 0
else
    echo "✗ Servizio DOWN"
    echo "  Errore: $response"
    
    # Auto-restart se richiesto
    if [ "$AUTO_RESTART" = "true" ]; then
        echo ""
        echo "Tentativo di riavvio servizio..."
        
        if sudo systemctl restart "$SERVICE_NAME" 2>/dev/null; then
            echo "Servizio riavviato"
            
            # Attendi avvio
            sleep 5
            
            # Re-test
            if curl -sf --max-time "$TIMEOUT" "$HEALTH_URL" > /dev/null 2>&1; then
                echo "✓ Servizio ripristinato con successo"
                exit 0
            else
                echo "ERRORE: Servizio non risponde dopo il riavvio"
                exit 2
            fi
        else
            echo "ERRORE: Impossibile riavviare il servizio"
            exit 2
        fi
    fi
    
    exit 1
fi
