import axios, { AxiosError, type AxiosInstance } from 'axios';
import type {
  ApiResponse,
  DocumentsResponse,
  UploadRequest,
  UploadResponse,
  OperationResponse,
  ChunkQueryRequest,
  ChunkQueryResponse,
  ChatQueryRequest,
  ChatQueryResponse,
  ChatGenerateRequest,
  ChatGenerateResponse,
  ConfigResponse,
  PaginationParams,
} from '../types';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 60000, // 60 seconds for long operations
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth tokens here if needed
    // const token = localStorage.getItem('auth-token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error
      const status = error.response.status;
      const message = (error.response.data as any)?.error || error.message;

      console.error(`API Error ${status}:`, message);

      if (status === 401) {
        // Unauthorized - redirect to login if needed
        console.error('Unauthorized access');
      } else if (status === 403) {
        console.error('Forbidden access');
      } else if (status === 404) {
        console.error('Resource not found');
      } else if (status >= 500) {
        console.error('Server error');
      }
    } else if (error.request) {
      // Request made but no response
      console.error('No response from server:', error.message);
    } else {
      // Error in request configuration
      console.error('Request error:', error.message);
    }

    return Promise.reject(error);
  }
);

// API Service functions
export const apiService = {
  // Config
  getConfig: async (): Promise<ConfigResponse> => {
    const response = await api.get<ConfigResponse>('/config');
    return response.data;
  },

  // Documents
  getDocuments: async (params?: PaginationParams): Promise<DocumentsResponse> => {
    const response = await api.get<DocumentsResponse>('/documents', { params });
    return response.data;
  },

  uploadDocument: async (data: UploadRequest): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', data.file);
    
    if (data.displayName) formData.append('displayName', data.displayName);
    if (data.mimeType) formData.append('mimeType', data.mimeType);
    if (data.chunkSize) formData.append('chunkSize', data.chunkSize.toString());
    if (data.documentLocation) formData.append('documentLocation', data.documentLocation);
    
    if (data.metadataKeys && data.metadataValues) {
      data.metadataKeys.forEach((key) => formData.append('metadataKeys[]', key));
      data.metadataValues.forEach((value) => formData.append('metadataValues[]', value));
    }

    const response = await api.post<UploadResponse>('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getOperationStatus: async (operationName: string): Promise<OperationResponse> => {
    const response = await api.get<OperationResponse>(`/operations/${operationName}`);
    return response.data;
  },

  deleteDocument: async (documentName: string, force: boolean = true): Promise<ApiResponse> => {
    const response = await api.delete<ApiResponse>(`/documents/${documentName}`, {
      params: { force },
    });
    return response.data;
  },

  queryDocumentChunks: async (
    documentName: string,
    data: ChunkQueryRequest
  ): Promise<ChunkQueryResponse> => {
    const response = await api.post<ChunkQueryResponse>(
      `/documents/${documentName}/chunks`,
      data
    );
    return response.data;
  },

  // Chat
  queryChatChunks: async (data: ChatQueryRequest): Promise<ChatQueryResponse> => {
    const response = await api.post<ChatQueryResponse>('/chat/query', data);
    return response.data;
  },

  generateChatResponse: async (data: ChatGenerateRequest): Promise<ChatGenerateResponse> => {
    const response = await api.post<ChatGenerateResponse>('/chat/generate', data);
    return response.data;
  },

  // Streaming endpoint URL
  getChatStreamUrl: (): string => {
    return '/api/chat/generate-stream';
  },

  // Helper for streaming with fetch
  streamChatResponse: async (
    data: ChatGenerateRequest,
    onChunk: (text: string) => void,
    onDone: () => void,
    onError: (error: Error) => void,
    signal?: AbortSignal
  ): Promise<void> => {
    try {
      console.log('Fetch a /api/chat/generate-stream con:', {
        chunks: data.relevant_chunks.length,
        model: data.model,
        query_length: data.query.length
      });
      
      const response = await fetch('/api/chat/generate-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal,
      });

      console.log('Risposta fetch:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Response body is not readable');
      }

      console.log('Inizio lettura dello stream...');
      let totalChunks = 0;
      
      while (true) {
        const { done, value } = await reader.read();
        
        console.log('Reader read:', { done, valueLength: value?.length });
        
        if (done) {
          console.log('Stream completato, totale chunks ricevuti:', totalChunks);
          break;
        }

        const chunk = decoder.decode(value);
        console.log('Chunk decodificato:', chunk.substring(0, 100));
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            console.log('Parsing data:', data.substring(0, 50));
            try {
              const parsed = JSON.parse(data);
              if (parsed.done) {
                console.log('Ricevuto segnale done');
                onDone();
              } else if (parsed.text) {
                console.log('Ricevuto testo:', parsed.text.substring(0, 30));
                totalChunks++;
                onChunk(parsed.text);
              } else if (parsed.error) {
                console.error('Ricevuto errore:', parsed.error);
                throw new Error(parsed.error);
              }
            } catch (e) {
              console.warn('Errore parsing JSON:', e, 'Data:', data.substring(0, 50));
              // Skip invalid JSON
            }
          }
        }
      }
      
      // Se arriviamo qui senza aver ricevuto done, chiamalo comunque
      console.log('Fine loop, chiamata onDone');
      onDone();
    } catch (error) {
      console.error('Errore in streamChatResponse:', error);
      onError(error as Error);
    }
  },
};

export default api;
