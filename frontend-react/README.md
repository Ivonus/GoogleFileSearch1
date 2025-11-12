# 📄 Document Search & RAG Chat - Frontend React

Applicazione React moderna per la gestione documenti e chat AI con Retrieval-Augmented Generation (RAG).

## 🚀 Stack Tecnologico

- **React 19** - UI Library
- **TypeScript** - Type Safety
- **Vite** - Build Tool & Dev Server
- **Material-UI (MUI)** - Component Library
- **Zustand** - State Management
- **TanStack Query (React Query)** - Data Fetching & Caching
- **React Router** - Routing
- **Vite PWA** - Progressive Web App

## 🏗️ Architettura

L'applicazione segue i modern patterns di React:

- **State Management**: Zustand per UI state globale
- **Data Fetching**: React Query per server state con cache intelligente
- **Routing**: React Router con lazy loading
- **Styling**: Material-UI con tema personalizzabile
- **Code Splitting**: Lazy loading automatico delle pagine

### Struttura Directory

```
src/
├── stores/          # Zustand stores per UI state
├── hooks/           # Custom React Query hooks
├── pages/           # Pagine dell'applicazione
├── components/      # Componenti riutilizzabili
├── services/        # API service layer
├── types/           # TypeScript types
└── theme/           # MUI theme configuration
```

## 📦 Setup

### Prerequisiti

- Node.js 18+ 
- npm o yarn

### Installazione

```bash
# Installare dipendenze
npm install

# Avviare dev server
npm run dev

# Build production
npm run build

# Preview build
npm run preview
```

## 🎯 Features Principali

### 1. Gestione Documenti
- Upload documenti (PDF, TXT, DOCX, etc.)
- Lista con ricerca e filtri
- Delete singolo o batch
- Monitoraggio operazioni real-time

### 2. Chat AI con RAG
- Query su documenti caricati
- Streaming responses
- Cronologia messaggi persistente
- Impostazioni configurabili (modello, top-k, etc.)
- Visualizzazione fonti

### 3. Visualizzazione Chunks
- Ricerca chunks per documento
- Filtri per relevance score
- Anteprima contenuto

## 🔧 Scripts Disponibili

```bash
npm run dev      # Dev server (http://localhost:5173)
npm run build    # Build production
npm run preview  # Preview build locale
npm run lint     # Run ESLint
```

## 📚 Documentazione Aggiuntiva

- [Miglioramenti Frontend](../docs/FRONTEND_IMPROVEMENTS.md) - Panoramica architetturale
- [Migration Summary](../docs/MIGRATION_SUMMARY.md) - Dettagli implementazione
- [Developer Guide](../docs/DEVELOPER_GUIDE.md) - Guida per sviluppatori

## 🎨 Customizzazione

### Tema
Modifica `src/theme/theme.ts` per personalizzare colori e stili.

### API Base URL
Il proxy Vite è configurato in `vite.config.ts` per reindirizzare `/api/*` al backend.

## 🚀 Deployment

### Build Production

```bash
npm run build
```

Output in `../backend/static/dist/` - pronto per servire con Flask backend.

### Ambiente

Nessuna variabile d'ambiente richiesta - il proxy Vite gestisce le API calls in dev.

## 🧪 Testing (Future)

Setup pronto per:
- Vitest per unit tests
- Testing Library per component tests
- Playwright/Cypress per E2E tests

## 📝 Note Tecniche

- **Hot Module Replacement (HMR)**: Attivo in development
- **Code Splitting**: Automatico per route
- **Tree Shaking**: Ottimizzazione production
- **PWA**: Service worker generato automaticamente
- **TypeScript**: Strict mode abilitato

## 🤝 Contributing

1. Segui i pattern esistenti in `src/stores/` e `src/hooks/`
2. Usa TypeScript strict
3. Commenta codice complesso
4. Testa le modifiche con `npm run build`

---

**Versione:** 2.0.0  
**Ultimo aggiornamento:** 12 Novembre 2025
