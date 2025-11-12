# Documentazione API - Riferimenti

Questo documento contiene tutti i link alla documentazione ufficiale delle API utilizzate nel progetto.

## Gemini API - Documentazione Principale

### Overview e Guide
- **Gemini API Homepage**: https://ai.google.dev/gemini-api
- **Documentazione Gemini API**: https://ai.google.dev/gemini-api/docs
- **API Reference Overview**: https://ai.google.dev/api
- **Versioni API**: https://ai.google.dev/gemini-api/docs/api-versions
- **Get API Key**: https://aistudio.google.com/apikey

## File Search (RAG) - Documentazione Specifica

### File Search Store API
- **File Search Guide**: https://ai.google.dev/gemini-api/docs/file-search
- **File Search Stores API Reference**: https://ai.google.dev/api/file-search/file-search-stores
- **Documents API Reference**: https://ai.google.dev/api/file-search/documents

### Metodi Principali File Search Store
- **uploadToFileSearchStore**: https://ai.google.dev/api/file-search/file-search-stores#method:-media.uploadtofilesearchstore
- **importFile**: https://ai.google.dev/api/file-search/file-search-stores#method:-filesearchstores.importfile
- **fileSearchStores.create**: https://ai.google.dev/api/file-search/file-search-stores#method:-filesearchstores.create
- **fileSearchStores.list**: https://ai.google.dev/api/file-search/file-search-stores#method:-filesearchstores.list
- **fileSearchStores.get**: https://ai.google.dev/api/file-search/file-search-stores#method:-filesearchstores.get
- **fileSearchStores.delete**: https://ai.google.dev/api/file-search/file-search-stores#method:-filesearchstores.delete

### Documents API
- **documents.list**: https://ai.google.dev/api/file-search/documents#method:-filesearchstores.documents.list
- **documents.get**: https://ai.google.dev/api/file-search/documents#method:-filesearchstores.documents.get
- **documents.delete**: https://ai.google.dev/api/file-search/documents#method:-filesearchstores.documents.delete
- **documents.query**: https://ai.google.dev/api/file-search/documents#method:-filesearchstores.documents.query

## File API Standard (NON File Search Store)

### File Management
- **Files API**: https://ai.google.dev/api/files
- **media.upload**: https://ai.google.dev/api/files#method:-media.upload
- **files.get**: https://ai.google.dev/api/files#method:-files.get
- **files.list**: https://ai.google.dev/api/files#method:-files.list
- **files.delete**: https://ai.google.dev/api/files#method:-files.delete
- **Prompting with Media**: https://ai.google.dev/gemini-api/docs/prompting_with_media

## Models e Content Generation

### Generating Content
- **Generate Content API**: https://ai.google.dev/api/generate-content
- **Models API**: https://ai.google.dev/api/models
- **Streaming**: https://ai.google.dev/gemini-api/docs/streaming
- **System Instructions**: https://ai.google.dev/gemini-api/docs/system-instructions

### Live API
- **Live API**: https://ai.google.dev/api/live
- **Live Music API**: https://ai.google.dev/api/live_music

## Embeddings e Tokens

- **Embeddings API**: https://ai.google.dev/api/embeddings
- **Embeddings Guide**: https://ai.google.dev/gemini-api/docs/embeddings
- **Tokens API**: https://ai.google.dev/api/tokens
- **Token Counting**: https://ai.google.dev/gemini-api/docs/tokens

## Caching e Batch

- **Caching API**: https://ai.google.dev/api/caching
- **Context Caching Guide**: https://ai.google.dev/gemini-api/docs/caching
- **Batch API**: https://ai.google.dev/api/batch-api

## Pricing e Limiti

- **Pricing**: https://ai.google.dev/gemini-api/docs/pricing
- **Rate Limits**: https://ai.google.dev/gemini-api/docs/rate-limits
- **Quota**: https://ai.google.dev/gemini-api/docs/quota

## SDK e Librerie Client

### Python SDK
- **Python SDK Documentation**: https://googleapis.github.io/python-genai/
- **GitHub - Python SDK**: https://github.com/googleapis/python-genai

### Altri SDK
- **Go SDK**: https://pkg.go.dev/google.golang.org/genai
- **TypeScript SDK**: https://googleapis.github.io/js-genai/
- **Java SDK**: https://googleapis.github.io/java-genai/javadoc/
- **C# SDK**: https://googleapis.github.io/dotnet-genai/

## Cookbook e Community

- **Cookbook (Examples)**: https://github.com/google-gemini/cookbook
- **API Examples Repository**: https://github.com/google-gemini/api-examples
- **Community Forum**: https://discuss.ai.google.dev/c/gemini-api/

## Filtri e Metadata

- **Metadata Filtering Syntax**: https://google.aip.dev/160
- **List Filter Guide**: https://google.aip.dev/160

## Formati File Supportati

### File Search Store - Tipi Supportati
Secondo la documentazione, File Search supporta i seguenti tipi di file:

#### Application Files
- PDF: `application/pdf`
- Microsoft Word: `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- Microsoft Excel: `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- JSON: `application/json`

#### Text Files
- Plain Text: `text/plain`
- HTML: `text/html`
- Markdown: `text/markdown`
- CSV: `text/csv`

### Limiti File Search Store
- **Dimensione massima file**: 100 MB per documento
- **Storage totale progetto**:
  - Free tier: 1 GB
  - Tier 1: 10 GB
  - Tier 2: 100 GB
  - Tier 3: 1 TB
- **Raccomandazione**: Limitare ogni File Search Store a 20 GB per latenze ottimali

### Note Importanti
⚠️ **File Search Store NON supporta immagini** - Le immagini (PNG, JPEG, etc.) sono supportate tramite il File API standard per l'uso in prompt/chat, ma NON per la ricerca semantica nel File Search Store.

## API Methods Reference

- **All Methods**: https://ai.google.dev/api/all-methods

## Policies e Legal

- **Terms of Service**: https://policies.google.com/terms
- **Privacy Policy**: https://policies.google.com/privacy
- **Google Developers Site Policies**: https://developers.google.com/site-policies

## Date di Aggiornamento

- File Search Documentation: Last updated 2025-11-11 UTC
- Files API Documentation: Last updated 2025-11-06 UTC

---

**Ultimo aggiornamento di questo documento**: 2025-11-12
