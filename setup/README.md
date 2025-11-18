# Setup e Installazione

Questa cartella contiene tutti i file necessari per configurare e avviare il sistema.

## File di Setup

### Installazione Iniziale
- **`setup.bat`** - Script installazione automatica (Windows)
- **`setup.sh`** - Script installazione automatica (Linux/Mac)
- **`setup.py`** - Script Python per creazione vector store

### Avvio Server
- **`start.bat`** - Avvia server development (Windows)
- **`start.sh`** - Avvia server development (Linux/Mac)
- **`start-production.bat`** - Avvia server production con Waitress (Windows)
- **`start-production.sh`** - Avvia server production con Gunicorn (Linux)

### Deployment Produzione
- **`install-service.ps1`** - Installa come servizio Windows con NSSM

## Guide

- **`INSTALL.md`** - Guida installazione dettagliata passo-passo
- **`CHECKLIST.md`** - Checklist setup completo
- **`SETUP_COMPLETATO.md`** - Conferma setup completato con successo

## Quick Start

### Windows
```bash
# 1. Installazione
.\setup\setup.bat

# 2. Avvio server
.\setup\start.bat
```

### Linux/Mac
```bash
# 1. Installazione
chmod +x setup/setup.sh
./setup/setup.sh

# 2. Avvio server
chmod +x setup/start.sh
./setup/start.sh
```

### Production (Windows)
```powershell
# Avvio manuale con Waitress
.\setup\start-production.bat

# Installazione come servizio Windows
.\setup\install-service.ps1
```

### Production (Linux)
```bash
# Avvio manuale con Gunicorn
chmod +x setup/start-production.sh
./setup/start-production.sh

# Installazione come servizio systemd
# Vedi docs/DEPLOYMENT.md
```

## 📚 Documentazione Completa

Per deployment in produzione, backup, monitoraggio e altro:
- **[../docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md)** - Guida completa deployment Windows/Linux

## Prerequisiti

- Python 3.8+
- Google Gemini API Key
- File Search Store Name

Vedi `../README.md` per maggiori dettagli.
