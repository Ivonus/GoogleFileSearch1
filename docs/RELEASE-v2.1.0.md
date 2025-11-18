# Release v2.1.0 - Deployment & Production Ready

**Data rilascio:** 18 Novembre 2025  
**Tipo:** Minor Release (Feature + Documentation)

---

## 🎯 Obiettivo Release

Rendere **Google File Search RAG** production-ready con documentazione completa e script per deployment su Windows Server e Linux.

---

## ✨ Novità Principali

### 📦 Deployment Windows Server

- **Servizio Windows con NSSM**
  - Script automatico installazione: `install-service.ps1`
  - Avvio automatico all'avvio del sistema
  - Gestione service (start/stop/restart)
  - Logging automatico

- **Waitress WSGI Server**
  - Script produzione: `start-production.bat`
  - 4 workers threads
  - Connection pooling
  - Timeout configurabili

- **Configurazione IIS**
  - Reverse proxy con URL Rewrite
  - Supporto SSL/HTTPS
  - Gestione Server-Sent Events (streaming)

### 🐧 Deployment Linux Server

- **Servizio Systemd**
  - Configurazione service completa
  - Auto-restart su crash
  - Logging con journalctl
  - Avvio automatico

- **Gunicorn WSGI Server**
  - 4 workers processes
  - Timeout 120s
  - Access/error logging
  - Script già presente: `start-production.sh`

- **Nginx Reverse Proxy**
  - Configurazione completa
  - Supporto SSL con Certbot
  - Cache static files
  - SSE streaming support

### 🛠️ Script Utility

#### Backup
- `backup.bat` (Windows) - Backup automatico con tar
- `backup.sh` (Linux) - Backup con pulizia vecchi file
- Schedulazione con Task Scheduler / Crontab

#### Monitoraggio
- `check-health.ps1` (Windows) - Health check con auto-restart
- `check-health.sh` (Linux) - Health check con systemctl

### 📚 Documentazione

- **`docs/DEPLOYMENT.md`** - Guida completa (150+ righe)
  - Setup Windows Server e Linux
  - Configurazione firewall
  - Reverse proxy (IIS, Nginx)
  - SSL/HTTPS
  - Backup automatici
  - Monitoraggio e logging
  - Sicurezza best practices
  - Troubleshooting

- **Aggiornato `README.md`**
  - Sezione "Deployment su Windows Server"
  - Quick start produzione
  - Link a documentazione deployment

- **Aggiornato `setup/README.md`**
  - Riferimenti script produzione
  - Guide installazione servizi

---

## 📋 File Aggiunti/Modificati

### Nuovi File
```
docs/DEPLOYMENT.md              # Guida deployment completa
setup/start-production.bat      # Avvio produzione Windows
setup/install-service.ps1       # Installazione servizio Windows
backup.bat                      # Backup automatico Windows
backup.sh                       # Backup automatico Linux
check-health.ps1                # Health check Windows
check-health.sh                 # Health check Linux
docs/RELEASE-v2.1.0.md          # Questo file
```

### File Modificati
```
README.md                       # + sezione deployment Windows
CHANGELOG.md                    # + versione 2.1.0
setup/README.md                 # + script produzione
```

---

## 🚀 Come Usare Questa Release

### Per Nuovo Deployment Windows

```powershell
# 1. Clona/scarica progetto
git clone https://github.com/Attilio81/GoogleFileSearch.git
cd GoogleFileSearch

# 2. Setup iniziale
.\setup\setup.bat

# 3. Configura .env
notepad .env

# 4. Installa come servizio (PowerShell Amministratore)
.\setup\install-service.ps1

# 5. Apri firewall
New-NetFirewallRule -DisplayName "Google File Search" -Direction Inbound -Protocol TCP -LocalPort 5000 -Action Allow

# 6. Health check
.\check-health.ps1 -AutoRestart
```

### Per Nuovo Deployment Linux

```bash
# 1. Clona progetto
git clone https://github.com/Attilio81/GoogleFileSearch.git
cd GoogleFileSearch

# 2. Setup iniziale
chmod +x setup/setup.sh
./setup/setup.sh

# 3. Configura .env
nano .env

# 4. Crea servizio systemd
sudo nano /etc/systemd/system/google-filesearch.service
# Copia configurazione da docs/DEPLOYMENT.md

# 5. Attiva servizio
sudo systemctl enable google-filesearch
sudo systemctl start google-filesearch

# 6. Configura Nginx
sudo nano /etc/nginx/sites-available/google-filesearch
# Copia configurazione da docs/DEPLOYMENT.md

# 7. SSL con Certbot
sudo certbot --nginx -d tuodominio.com
```

### Backup Automatico

**Windows (Task Scheduler):**
```powershell
$action = New-ScheduledTaskAction -Execute "C:\GoogleFileSearch\backup.bat"
$trigger = New-ScheduledTaskTrigger -Daily -At 2am
Register-ScheduledTask -Action $action -Trigger $trigger -TaskName "GoogleFileSearch Backup"
```

**Linux (Crontab):**
```bash
crontab -e
# Aggiungi: 0 2 * * * /percorso/GoogleFileSearch/backup.sh
```

---

## 🔒 Sicurezza

### Raccomandazioni Produzione

1. **Non esporre mai** `.env` o `GEMINI_API_KEY`
2. **Usa HTTPS** in produzione (IIS SSL o Certbot)
3. **Firewall restrittivo** - Limita accesso porta 5000
4. **Rate limiting** - Già configurato in `.env`
5. **Backup regolari** - Usa script forniti
6. **Monitoring** - Health check periodici

### Rate Limiting Default

```env
RATE_LIMIT_MAX=30          # 30 richieste
RATE_LIMIT_WINDOW=60       # per minuto
```

---

## 📊 Metriche Release

- **Documentazione aggiunta:** ~1500 righe
- **Script nuovi:** 7 file
- **Piattaforme supportate:** Windows Server, Linux
- **WSGI servers:** Waitress (Windows), Gunicorn (Linux)
- **Reverse proxy:** IIS, Nginx
- **Service managers:** NSSM, Systemd

---

## 🐛 Breaking Changes

**Nessuno** - Release backward compatible.

---

## ⬆️ Aggiornamento da v2.0.0

```bash
# Backup
./backup.sh  # o backup.bat

# Update codice
git pull origin main

# Update dipendenze (se necessario)
source venv/bin/activate
pip install -r requirements.txt --upgrade

# Restart servizio
# Windows:
nssm restart GoogleFileSearch

# Linux:
sudo systemctl restart google-filesearch
```

---

## 📞 Supporto

- **Documentazione:** [docs/DEPLOYMENT.md](DEPLOYMENT.md)
- **Troubleshooting:** [docs/TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **Issues:** https://github.com/Attilio81/GoogleFileSearch/issues

---

## 👥 Contributori

**Attilio** - [@Attilio81](https://github.com/Attilio81)

---

## 📝 Prossime Release (Roadmap)

### v2.2.0 (Prevista)
- Docker support con Dockerfile e docker-compose
- Autenticazione multi-utente (OAuth/JWT)
- Dashboard metriche e analytics
- API versioning

### v3.0.0 (Futuro)
- Multi-tenancy support
- Kubernetes deployment
- Advanced caching (Redis)
- Elastic search integration

---

**Made with ❤️ for Production Deployments**

Release completa disponibile su GitHub:  
https://github.com/Attilio81/GoogleFileSearch/releases/tag/v2.1.0
