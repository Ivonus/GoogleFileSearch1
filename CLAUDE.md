# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **RAG (Retrieval-Augmented Generation) system** built with Google's Gemini File Search API and Gemini AI. The system enables document management with semantic search and AI-powered question answering based on uploaded documents.

**Key Technologies:**
- Backend: Flask 3.0, Python 3.8+
- Frontend: React 19 + TypeScript + Material-UI (migrated from Vanilla JS)
- AI: Google Gemini API (File Search + Generation)
- Architecture: Two-phase RAG (Retrieval → Generation)
- State Management: TanStack Query + Zustand
- Build Tool: Vite 7

## Development Commands

### Backend (Flask)

```bash
# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Start Flask server (from backend directory)
cd backend
python app.py
```

Server runs on `http://localhost:5000`

### Frontend (React)

```bash
# Navigate to React frontend
cd frontend-react

# Install dependencies (first time only)
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

React dev server runs on `http://localhost:5173` (proxied to Flask backend)

### Testing Utilities

```bash
cd backend

# Test API connectivity and configuration
python test_api.py

# Test document upload flow
python test_upload.py

# Test chunk retrieval with scores
python test_chunks.py

# Test query with relevance scores
python test_query_scores.py

# Test chat endpoints
python test_chat_endpoint.py

# List all documents in store
python test_list_documents.py

# Create a new File Search Store
python create_store.py

# Run pytest test suite
cd tests
pytest test_rag.py -v
```

### Configuration

Copy `.env.example` to `.env` and configure:
- `GEMINI_API_KEY`: Required - Get from https://makersuite.google.com/app/apikey
- `FILE_SEARCH_STORE_NAME`: Required - Format: `fileSearchStores/store-id`
- RAG parameters: `RESULTS_COUNT`, `MIN_RELEVANCE_SCORE`, `MAX_CHUNKS_FOR_GENERATION`
- Chunking: `CHUNK_SIZE` (1-512 tokens), `CHUNK_OVERLAP_PERCENT` (0-50%)

## Architecture

### RAG Pipeline (Two-Phase)

The system implements an optimized two-phase RAG approach:

**Phase 1: Retrieval** (`/api/chat/query`)
- Semantic search via Google File Search API
- Retrieves `RESULTS_COUNT` chunks (default: 25)
- Returns chunks with `chunkRelevanceScore` (0.0-1.0)

**Phase 2: Generation** (`/api/chat/generate` or `/api/chat/generate-stream`)
- Filters chunks by `MIN_RELEVANCE_SCORE` (default: 0.3)
- Selects top `MAX_CHUNKS_FOR_GENERATION` chunks (default: 15)
- Sends filtered context to Gemini for answer synthesis
- Streaming endpoint uses Server-Sent Events (SSE)

**Key Insight:** The filtering logic reduces noise by only using high-relevance chunks, improving answer quality and reducing token usage.

### Backend Structure (`backend/app.py`)

The Flask backend is ~1400 lines and contains:

**Core Components:**
1. **CircuitBreaker class** (lines ~60-102): Handles Gemini API rate limiting (429 errors)
   - States: CLOSED, OPEN, HALF_OPEN
   - Auto-recovery after timeout
   - Prevents cascading failures

2. **QueryCache class** (lines ~67-99): In-memory cache for query results
   - TTL-based expiration (default: 5 minutes)
   - Reduces duplicate API calls
   - Methods: `get()`, `set()`, `clear()`, `size()`

3. **Validation Functions** (lines ~110-183):
   - `validate_query_text()`: XSS prevention, length checks (max 2000 chars)
   - `validate_mime_type()`: File type validation against whitelist
   - `validate_metadata()`: Custom metadata validation (max 50 pairs)

4. **Document Management API**:
   - Upload: `/api/documents/upload` (Long-Running Operation with polling)
   - List: `/api/documents` (paginated, max 20 per page)
   - Delete: `/api/documents/{name}` (with `force=true` to delete chunks)
   - Chunks: `/api/documents/{name}/chunks` (semantic search within document)

5. **RAG Endpoints**:
   - Query: `/api/chat/query` (retrieval phase)
   - Generate: `/api/chat/generate` (generation phase, synchronous)
   - Generate-stream: `/api/chat/generate-stream` (generation with SSE)

6. **Configuration**:
   - Config: `/api/config` (returns all RAG parameters and chunking settings)

7. **Frontend Routes** (serve HTML templates):
   - `/` - Admin panel (document management)
   - `/chat` - Chatbot interface
   - `/chunks` - Document chunks viewer

### Frontend Structure (React)

**Directory Layout:**
```
frontend-react/
├── src/
│   ├── pages/              # Page components
│   │   ├── DocumentsPage.tsx   # Admin panel for documents
│   │   ├── ChatPage.tsx        # Chat interface
│   │   ├── ChunksPage.tsx      # Chunk viewer
│   │   └── NotFoundPage.tsx
│   ├── components/         # Reusable UI components
│   │   ├── Documents/
│   │   │   ├── UploadForm.tsx
│   │   │   ├── DocumentsList.tsx
│   │   │   └── OperationsMonitor.tsx
│   │   ├── Chat/
│   │   │   ├── ChatMessage.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   ├── ChatSettings.tsx
│   │   │   └── TypingIndicator.tsx
│   │   ├── Chunks/
│   │   │   ├── ChunksList.tsx
│   │   │   └── ChunksSearch.tsx
│   │   └── Layout/
│   │       └── AppLayout.tsx
│   ├── services/           # API service layer
│   │   ├── api.ts          # Axios instance + API functions
│   │   └── pwa.ts          # PWA registration
│   ├── hooks/              # Custom React hooks
│   │   ├── useDocumentsQueries.ts
│   │   ├── useChunksQueries.ts
│   │   ├── useChatQueries.ts
│   │   └── index.ts
│   ├── stores/             # Zustand state stores
│   │   ├── useDocumentsStore.ts
│   │   ├── useChatStore.ts
│   │   ├── useChunksStore.ts
│   │   └── index.ts
│   ├── types/              # TypeScript definitions
│   │   └── index.ts
│   ├── theme/              # MUI theme configuration
│   │   └── theme.ts
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Entry point
├── public/                 # Static assets
├── vite.config.ts          # Vite configuration
└── tsconfig.json           # TypeScript configuration
```

**Key Frontend Patterns:**

1. **TanStack Query for Server State:**
   - All API calls wrapped in `useQuery` or `useMutation` hooks
   - Automatic caching, refetching, and error handling
   - Custom hooks: `useDocumentsQueries`, `useChatQueries`, `useChunksQueries`
   - Query keys follow pattern: `['documents']`, `['chat', queryId]`, etc.

2. **Zustand for UI State:**
   - Lightweight stores for component-specific state
   - `useDocumentsStore`: Upload state, operations monitoring
   - `useChatStore`: Conversation history, streaming state
   - `useChunksStore`: Search filters, expand/collapse state

3. **Form Validation:**
   - React Hook Form + Zod schema validation
   - Example in `UploadForm.tsx`: file upload with metadata

4. **Material-UI Components:**
   - Consistent design system with MUI v7
   - Custom theme in `theme/theme.ts`
   - Responsive layout with `AppLayout`

5. **Code Splitting:**
   - Lazy-loaded pages with `React.lazy()` and `Suspense`
   - Optimized bundle size

### Key Implementation Details

**Document Upload Flow:**
1. File validated (MIME type, size) in frontend and backend
2. Backend saves temporarily to disk (not memory - important for large files)
3. Multipart upload to Google API with metadata
4. Returns Long-Running Operation (LRO)
5. Frontend polls `/api/operations/{name}` every 3s using TanStack Query
6. Auto-updates document list when `done: true`

**Chunking Configuration:**
- API limit: 1-512 tokens per chunk
- Overlap calculated: `chunk_size * CHUNK_OVERLAP_PERCENT / 100`
- Max overlap: 100 tokens (API constraint)
- Config sent in `chunkingConfig.whiteSpaceConfig`

**Circuit Breaker Pattern:**
- Prevents cascading failures on 429 errors
- Global instance: `gemini_circuit_breaker`
- Call `record_success()` or `record_failure()` after API calls
- Check `call_allowed()` before requests

**Metadata Handling:**
- Custom metadata: key-value pairs (max 50)
- Reserved key: `document_location` (for file path linking)
- Frontend displays "Apri Documento" button if `document_location` exists

**Security Validations:**
- XSS prevention in query text (checks for `<script`, `javascript:`, etc.)
- MIME type whitelist enforcement
- Metadata key/value sanitization
- Secure filename handling with `werkzeug.utils.secure_filename`

**Chat Streaming (SSE):**
- Backend uses Flask `stream_with_context()` and `Response` with `text/event-stream`
- Frontend uses `EventSource` API (wrapped in `useChatQueries.ts`)
- Supports stop functionality via `AbortController`
- Conversation history persisted in `localStorage` via Zustand

## Important Patterns

### Backend Patterns

**Error Handling:**
Always use try-except with detailed logging:
```python
try:
    # API call
    response = requests.get(url, headers=headers)
    response.raise_for_status()
except requests.exceptions.RequestException as e:
    logger.error(f"Detailed error: {str(e)}")
    return jsonify({'success': False, 'error': 'User-friendly message'}), 500
```

**API Headers:**
Use `get_headers()` function for all API requests:
```python
def get_headers():
    return {'x-goog-api-key': GEMINI_API_KEY}
```

**Logging Format:**
Use structured logging with context:
```python
logger.info(f"Chunk stats - Retrieved: {total}, Score >= {threshold}: {filtered}, Used: {final}")
```

### Frontend Patterns

**API Service Layer:**
All API calls go through `services/api.ts`:
```typescript
import { apiService } from '../services/api';

// Example usage
const response = await apiService.documents.list({ pageSize: 20 });
if (response.success) {
  // Handle data
}
```

**TanStack Query Usage:**
```typescript
// In custom hook (e.g., useDocumentsQueries.ts)
const { data, isLoading, error } = useQuery({
  queryKey: ['documents', pageToken],
  queryFn: () => apiService.documents.list({ pageToken, pageSize: 20 }),
  refetchInterval: 10000, // Auto-refresh every 10s
});
```

**Zustand Store Pattern:**
```typescript
// In store file (e.g., useDocumentsStore.ts)
interface DocumentsState {
  selectedDocument: Document | null;
  setSelectedDocument: (doc: Document | null) => void;
}

export const useDocumentsStore = create<DocumentsState>((set) => ({
  selectedDocument: null,
  setSelectedDocument: (doc) => set({ selectedDocument: doc }),
}));

// In component
const { selectedDocument, setSelectedDocument } = useDocumentsStore();
```

**Form Validation with Zod:**
```typescript
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

const schema = z.object({
  file: z.instanceof(File).nullable(),
  displayName: z.string().optional(),
});

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
});
```

## Common Workflows

### Adding a New RAG Configuration Parameter

1. Add to `.env.example` with documentation
2. Load in `backend/app.py` with `os.getenv()` and default
3. Add to `/api/config` endpoint return value
4. Update frontend types in `types/index.ts` (`ConfigResponse` interface)
5. Fetch in frontend component using `apiService.config.get()`
6. Document in README.md parameter table

### Modifying Chunk Filtering Logic

The filtering happens in `/api/chat/generate` (around line ~629-639):
1. Filter by `MIN_RELEVANCE_SCORE`
2. Take top `MAX_CHUNKS_FOR_GENERATION`
3. Log statistics for debugging
4. Use filtered chunks for context building

### Adding a New Frontend Page

1. Create page component in `src/pages/NewPage.tsx`
2. Add route in `src/App.tsx` with lazy loading
3. Add navigation link in `src/components/Layout/AppLayout.tsx`
4. Create necessary API service functions in `src/services/api.ts`
5. Create custom hooks in `src/hooks/useNewPageQueries.ts`
6. (Optional) Create Zustand store in `src/stores/useNewPageStore.ts`

### Adding New Document Metadata

**Backend:**
1. Add validation in `validate_metadata()` function
2. Pass to API in `customMetadata` array format:
   ```python
   {'key': 'metadata_name', 'stringValue': 'value'}
   ```

**Frontend:**
1. Update types in `types/index.ts` (`UploadRequest` interface)
2. Add input fields in `components/Documents/UploadForm.tsx`
3. Update Zod schema for validation
4. Collect in FormData on submit

### Testing a New Feature

**Backend:**
1. Write test script in `backend/test_*.py` format
2. Use `load_dotenv('../.env')` to load config
3. Make direct API calls with error handling
4. Print clear success/failure messages with emojis (✅/❌)

**Frontend:**
1. Write tests using Vitest (config in `vite.config.ts`)
2. Use `@testing-library/react` for component tests
3. Mock API calls with axios mocks
4. Run: `npm run test`

## API Constraints & Limits

- **Chunk size**: 1-512 tokens (API enforced)
- **Chunk overlap**: Max 100 tokens
- **Documents per page**: Max 20 (Google API limit)
- **Max file size**: 100MB (configurable in `app.config`)
- **Custom metadata**: Max 50 key-value pairs
- **Query length**: Max 2000 characters (app validation)
- **Rate limits**: Handled by CircuitBreaker

## Troubleshooting

**429 Rate Limit Errors:**
- Circuit breaker automatically handles with retries
- Switch to `gemini-2.5-flash` (faster model)
- Reduce `MAX_CHUNKS_FOR_GENERATION`

**503 Model Overloaded:**
- Transient error, circuit breaker manages recovery
- Check Gemini API status page

**Upload stays in PROCESSING:**
- Normal for large files (can take minutes)
- Check operation status with `/api/operations/{name}`
- Google API processes embeddings asynchronously

**Store not found (500 on /api/documents):**
- Verify `FILE_SEARCH_STORE_NAME` in `.env`
- Run `python backend/create_store.py` to create new store

**React dev server CORS issues:**
- Ensure Vite proxy is configured in `vite.config.ts`
- Backend must have `CORS(app)` enabled (already configured)

**Frontend build errors:**
- Check TypeScript errors: `npm run build`
- Ensure all dependencies are installed: `npm install`
- Clear build cache: `rm -rf dist node_modules/.vite`

## Migration Notes (Vanilla JS → React)

The project has been migrated from Vanilla JavaScript to React + TypeScript. Both frontends are maintained:

**Legacy Frontend** (`frontend/`):
- HTML templates in `templates/`
- Vanilla JS in `static/js/`
- Served directly by Flask

**React Frontend** (`frontend-react/`):
- Modern React SPA with TypeScript
- Material-UI components
- TanStack Query for data management
- Vite for build tooling
- PWA support with service workers

To use React frontend:
1. Build: `cd frontend-react && npm run build`
2. Update Flask to serve React build (or use separate deployment)
3. React dev server proxies API calls to `http://localhost:5000`

See `docs/MIGRAZIONE_REACT.md` for detailed migration documentation.

## Additional Documentation

- `README.md` - Full user documentation with setup guide
- `docs/LOGICA_FILTRAGGIO_CHUNKS.md` - Detailed RAG filtering explanation
- `docs/IMPROVEMENTS_LOG.md` - Changelog of optimizations
- `docs/TROUBLESHOOTING.md` - Extended troubleshooting guide
- `docs/MIGRAZIONE_REACT.md` - React migration details
- `docs/DEVELOPER_GUIDE.md` - Developer best practices
- `backend/tests/README.md` - Test suite documentation
