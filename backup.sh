#!/bin/bash
# ========================================
# Script Backup Automatico
# Google File Search Application - Linux
# ========================================

# Configurazione
BACKUP_DIR="/backup/google-filesearch"
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
DATE=$(date +%Y%m%d_%H%M%S)
HOSTNAME=$(hostname)

# Crea directory backup se non esiste
mkdir -p "$BACKUP_DIR"

echo ""
echo "===================================="
echo " BACKUP GOOGLE FILE SEARCH"
echo "===================================="
echo ""
echo "[$(date)] Avvio backup..."
echo ""

# Nome file backup
BACKUP_FILE="$BACKUP_DIR/backup-$HOSTNAME-$DATE.tar.gz"

echo "Host: $HOSTNAME"
echo "Directory progetto: $PROJECT_DIR"
echo "File backup: $BACKUP_FILE"
echo ""

# Crea backup (configurazione, documenti, logs)
echo "Creazione archivio..."
cd "$PROJECT_DIR"

tar -czf "$BACKUP_FILE" \
    --exclude='venv' \
    --exclude='__pycache__' \
    --exclude='*.pyc' \
    --exclude='node_modules' \
    .env documents_storage logs 2>/dev/null

if [ $? -ne 0 ]; then
    echo ""
    echo "ERRORE: Backup fallito!"
    exit 1
fi

# Verifica dimensione backup
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)

echo ""
echo "[$(date)] Backup completato!"
echo "File: $BACKUP_FILE"
echo "Dimensione: $BACKUP_SIZE"
echo ""

# Pulizia backup vecchi (mantieni ultimi 7 giorni)
echo "Pulizia backup vecchi (>7 giorni)..."
find "$BACKUP_DIR" -name "backup-*.tar.gz" -mtime +7 -delete

# Lista backup disponibili
echo ""
echo "Backup disponibili:"
ls -lh "$BACKUP_DIR"/backup-*.tar.gz 2>/dev/null | awk '{print $9, $5}'
echo ""

# Log
echo "[$(date)] Backup completato: $BACKUP_FILE" >> "$BACKUP_DIR/backup.log"
