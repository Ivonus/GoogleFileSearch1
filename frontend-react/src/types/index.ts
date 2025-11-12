// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  error?: string;
  message?: string;
  data?: T;
}

// Document Types
export interface Document {
  name: string;
  displayName?: string;
  mimeType?: string;
  sizeBytes?: string;
  createTime?: string;
  updateTime?: string;
  state?: string;
  metadata?: Record<string, string>;
}

export interface DocumentsResponse {
  success: boolean;
  documents: Document[];
  nextPageToken?: string;
}

// Upload Types
export interface UploadRequest {
  file: File;
  displayName?: string;
  mimeType?: string;
  chunkSize?: number;
  documentLocation?: string;
  metadataKeys?: string[];
  metadataValues?: string[];
}

export interface UploadResponse {
  success: boolean;
  operationName: string;
  displayName?: string;
  operation?: any;
  message?: string;
}

// Operation Types
export interface Operation {
  name: string;
  done: boolean;
  state: string;
  error?: {
    code: number;
    message: string;
    details?: any[];
  };
  response?: any;
  metadata?: any;
}

export interface OperationResponse {
  success: boolean;
  done: boolean;
  state: string;
  error?: {
    code: number;
    message: string;
  };
}

// Chunk Types
export interface Chunk {
  chunk?: {
    name?: string;
    data?: {
      stringValue?: string;
    };
    state?: string;
    createTime?: string;
    updateTime?: string;
  };
  chunkRelevanceScore?: number;
  source_document?: string;
  document?: {
    name?: string;
    displayName?: string;
    customMetadata?: Array<{
      key: string;
      stringValue?: string;
    }>;
  };
}

export interface ChunkQueryRequest {
  query: string;
  results_count?: number;
}

export interface ChunkQueryResponse {
  success: boolean;
  chunks: Chunk[];
}

// Chat Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  sources?: Chunk[];
}

export interface ChatQueryRequest {
  query: string;
  document_name?: string;
  results_count?: number;
}

export interface ChatQueryResponse {
  success: boolean;
  relevant_chunks: Chunk[];
  query: string;
}

export interface ChatGenerateRequest {
  query: string;
  relevant_chunks: Chunk[];
  model?: string;
  chat_history?: Array<{ role: string; text: string }>;
}

export interface ChatGenerateResponse {
  success: boolean;
  response: string;
  chunks_used: number;
  chunks_filtered: Chunk[];
}

// Config Types
export interface Config {
  chunk_size: number;
  model: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  top_k?: number;
}

export interface ConfigResponse {
  success: boolean;
  config: Config;
}

// Theme Types
export type ThemeMode = 'light' | 'dark';

// Notification Types
export interface Notification {
  id: string;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
  autoHideDuration?: number;
}

// Pagination Types
export interface PaginationParams {
  pageSize?: number;
  pageToken?: string;
}
