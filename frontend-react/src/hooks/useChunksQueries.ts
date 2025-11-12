import { useMutation } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { useChunksStore } from '../stores';
import type { ChunkQueryRequest } from '../types';

// Query Keys
export const chunkKeys = {
  all: ['chunks'] as const,
  queries: () => [...chunkKeys.all, 'query'] as const,
  query: (query: string, resultsCount: number) => 
    [...chunkKeys.queries(), { query, resultsCount }] as const,
  documentChunks: (documentName: string, query: string) =>
    [...chunkKeys.all, 'document', documentName, query] as const,
};

/**
 * Hook for querying chunks across all documents
 * This uses mutation instead of query because we want manual control over when to search
 */
export function useQueryChunks() {
  const setChunks = useChunksStore((state) => state.setChunks);
  const setIsSearching = useChunksStore((state) => state.setIsSearching);

  return useMutation({
    mutationFn: async (data: ChunkQueryRequest) => {
      setIsSearching(true);
      const response = await apiService.queryChatChunks({
        query: data.query,
        results_count: data.results_count,
      });
      return response;
    },
    onSuccess: (response) => {
      if (response.success && response.relevant_chunks) {
        setChunks(response.relevant_chunks);
      }
      setIsSearching(false);
    },
    onError: (error) => {
      console.error('Chunk query error:', error);
      setIsSearching(false);
      setChunks([]);
    },
  });
}

/**
 * Hook for querying chunks from a specific document
 */
export function useQueryDocumentChunks() {
  return useMutation({
    mutationFn: async ({
      documentName,
      query,
      results_count,
    }: {
      documentName: string;
      query: string;
      results_count?: number;
    }) => {
      const response = await apiService.queryDocumentChunks(documentName, {
        query,
        results_count,
      });
      return response;
    },
    onError: (error) => {
      console.error('Document chunk query error:', error);
    },
  });
}

/**
 * Hook to get cached chunks data without refetching
 */
export function useCachedChunks() {
  const chunks = useChunksStore((state) => state.chunks);
  const isSearching = useChunksStore((state) => state.isSearching);
  const getChunkCount = useChunksStore((state) => state.getChunkCount);

  return {
    chunks,
    isSearching,
    count: getChunkCount(),
  };
}
