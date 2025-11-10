// chunks.js - Gestisce la visualizzazione dei chunks

let currentDocumentName = '';
let allChunks = [];
let nextPageToken = '';

// Inizializzazione al caricamento della pagina
document.addEventListener('DOMContentLoaded', async () => {
    await loadDocuments();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    const documentSelect = document.getElementById('document-select');
    const loadChunksBtn = document.getElementById('load-chunks-btn');
    const expandAllBtn = document.getElementById('expand-all-btn');
    const collapseAllBtn = document.getElementById('collapse-all-btn');
    const searchInput = document.getElementById('search-input');
    const loadMoreBtn = document.getElementById('load-more-btn');

    documentSelect.addEventListener('change', (e) => {
        currentDocumentName = e.target.value;
        loadChunksBtn.disabled = !currentDocumentName;
    });

    loadChunksBtn.addEventListener('click', () => loadChunks(true));
    expandAllBtn.addEventListener('click', expandAll);
    collapseAllBtn.addEventListener('click', collapseAll);
    searchInput.addEventListener('input', (e) => filterChunks(e.target.value));
    loadMoreBtn.addEventListener('click', () => loadChunks(false));
}

// Carica la lista dei documenti
async function loadDocuments() {
    try {
        const response = await fetch('/api/documents');
        const data = await response.json();

        if (data.success && data.documents) {
            const select = document.getElementById('document-select');
            select.innerHTML = '<option value="">-- Seleziona un documento --</option>';

            data.documents.forEach(doc => {
                const option = document.createElement('option');
                option.value = doc.name;
                option.textContent = doc.displayName || doc.name;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Errore caricamento documenti:', error);
        showError('Impossibile caricare la lista dei documenti');
    }
}

// Carica i chunks del documento selezionato
async function loadChunks(reset = true) {
    if (!currentDocumentName) return;

    if (reset) {
        allChunks = [];
        document.getElementById('chunks-list').innerHTML = '';
    }

    showLoading(true);
    hideError();

    try {
        const url = `/api/documents/${currentDocumentName}/chunks`;
        
        // Ottieni la query dall'input (usa "*" se vuoto)
        const queryInput = document.getElementById('query-input').value.trim();
        const searchQuery = queryInput || '*';
        
        // Usa POST con query per recuperare chunks
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: searchQuery,
                resultsCount: 100
            })
        });
        
        const data = await response.json();

        showLoading(false);

        if (data.success) {
            allChunks = data.chunks;

            if (reset) {
                updateDocumentInfo();
            }

            renderChunks(data.chunks);

            // Nascondi paginazione (API query limita a 100 risultati)
            document.getElementById('pagination').classList.add('hidden');

            // Mostra container chunks
            document.getElementById('chunks-container').classList.remove('hidden');
            document.getElementById('document-info').classList.remove('hidden');
            
            // Mostra nota se presente
            if (data.note) {
                console.info('ℹ️', data.note);
            }
        } else {
            showError(data.error || 'Errore nel caricamento dei chunks');
        }
    } catch (error) {
        console.error('Errore:', error);
        showError('Errore nel caricamento dei chunks: ' + error.message);
        showLoading(false);
    }
}

// Aggiorna le informazioni del documento
function updateDocumentInfo() {
    const select = document.getElementById('document-select');
    const selectedOption = select.options[select.selectedIndex];
    
    document.getElementById('doc-name').textContent = selectedOption.textContent;
    document.getElementById('chunks-count').textContent = allChunks.length;
    
    // Determina lo stato generale
    const hasActive = allChunks.some(c => c.state === 'STATE_ACTIVE');
    const hasPending = allChunks.some(c => c.state === 'STATE_PENDING');
    const hasFailed = allChunks.some(c => c.state === 'STATE_FAILED');
    
    let stateText = '✅ Attivo';
    if (hasFailed) stateText = '❌ Errori presenti';
    else if (hasPending) stateText = '⏳ In elaborazione';
    
    document.getElementById('doc-state').textContent = stateText;
}

// Renderizza i chunks
function renderChunks(chunks) {
    const chunksList = document.getElementById('chunks-list');

    chunks.forEach((chunk, idx) => {
        const chunkElement = createChunkElement(chunk, allChunks.length - chunks.length + idx);
        chunksList.appendChild(chunkElement);
    });
}

// Crea elemento HTML per un chunk
function createChunkElement(chunk, globalIndex) {
    const div = document.createElement('div');
    div.className = 'chunk-item';
    div.dataset.chunkId = chunk.name;

    const preview = chunk.stringValue.substring(0, 100).replace(/\n/g, ' ');
    const stateClass = getStateClass(chunk.state);
    const stateLabel = getStateLabel(chunk.state);

    div.innerHTML = `
        <div class="chunk-header">
            <div class="chunk-title">
                <span class="chunk-index">Chunk #${globalIndex + 1}</span>
                <span class="chunk-preview">${escapeHtml(preview)}...</span>
            </div>
            <div class="chunk-meta">
                <span class="chunk-state ${stateClass}">${stateLabel}</span>
                <button class="chunk-toggle">▼</button>
            </div>
        </div>
        <div class="chunk-content">
            <div class="chunk-body">
                <div class="chunk-text">${escapeHtml(chunk.stringValue)}</div>
                <div class="chunk-details">
                    <div class="detail-item">
                        <span class="detail-label">ID Chunk</span>
                        <span class="detail-value">${chunk.name.split('/').pop()}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Stato</span>
                        <span class="detail-value">${chunk.state}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Creato</span>
                        <span class="detail-value">${formatDate(chunk.createTime)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Aggiornato</span>
                        <span class="detail-value">${formatDate(chunk.updateTime)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Lunghezza</span>
                        <span class="detail-value">${chunk.stringValue.length} caratteri</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Parole</span>
                        <span class="detail-value">~${chunk.stringValue.split(/\s+/).length} parole</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Toggle chunk expansion
    const header = div.querySelector('.chunk-header');
    header.addEventListener('click', () => {
        div.classList.toggle('expanded');
    });

    return div;
}

// Espandi tutti i chunks
function expandAll() {
    document.querySelectorAll('.chunk-item').forEach(item => {
        item.classList.add('expanded');
    });
}

// Riduci tutti i chunks
function collapseAll() {
    document.querySelectorAll('.chunk-item').forEach(item => {
        item.classList.remove('expanded');
    });
}

// Filtra i chunks in base alla ricerca
function filterChunks(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    const chunkItems = document.querySelectorAll('.chunk-item');

    chunkItems.forEach(item => {
        const chunkText = item.querySelector('.chunk-text').textContent.toLowerCase();
        const preview = item.querySelector('.chunk-preview').textContent.toLowerCase();

        if (term === '' || chunkText.includes(term) || preview.includes(term)) {
            item.style.display = '';
            
            // Evidenzia il termine cercato
            if (term !== '') {
                highlightText(item.querySelector('.chunk-text'), term);
            } else {
                // Rimuovi evidenziazione
                const textElement = item.querySelector('.chunk-text');
                textElement.innerHTML = escapeHtml(textElement.textContent);
            }
        } else {
            item.style.display = 'none';
        }
    });
}

// Evidenzia il testo cercato
function highlightText(element, searchTerm) {
    const originalText = element.textContent;
    const regex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi');
    const highlightedText = escapeHtml(originalText).replace(
        regex,
        '<mark>$1</mark>'
    );
    element.innerHTML = highlightedText;
}

// Utility functions
function getStateClass(state) {
    const stateMap = {
        'STATE_ACTIVE': 'active',
        'STATE_PENDING': 'pending',
        'STATE_FAILED': 'failed'
    };
    return stateMap[state] || 'active';
}

function getStateLabel(state) {
    const labelMap = {
        'STATE_ACTIVE': '✅ Attivo',
        'STATE_PENDING': '⏳ In elaborazione',
        'STATE_FAILED': '❌ Errore'
    };
    return labelMap[state] || state;
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleString('it-IT', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return dateString;
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function showLoading(show) {
    const loading = document.getElementById('loading');
    if (show) {
        loading.classList.remove('hidden');
    } else {
        loading.classList.add('hidden');
    }
}

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = '❌ ' + message;
    errorDiv.classList.remove('hidden');
}

function hideError() {
    document.getElementById('error-message').classList.add('hidden');
}
