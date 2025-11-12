import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { useDocumentsStore } from '../stores';
import type { UploadRequest, PaginationParams } from '../types';

// Query Keys
export const documentKeys = {
  all: ['documents'] as const,
  lists: () => [...documentKeys.all, 'list'] as const,
  list: (params?: PaginationParams) => [...documentKeys.lists(), params] as const,
  operations: () => [...documentKeys.all, 'operations'] as const,
  operation: (operationName: string) => [...documentKeys.operations(), operationName] as const,
};

/**
 * Hook for fetching all documents
 */
export function useDocuments(params?: PaginationParams) {
  const setDocuments = useDocumentsStore((state) => state.setDocuments);

  return useQuery({
    queryKey: documentKeys.list(params),
    queryFn: async () => {
      const response = await apiService.getDocuments(params);
      if (response.success && response.documents) {
        setDocuments(response.documents);
      }
      return response;
    },
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
  });
}

/**
 * Hook for uploading a document
 */
export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UploadRequest) => apiService.uploadDocument(data),
    onSuccess: (response) => {
      // Invalidate documents list to refetch
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      
      // If operation is immediately done, we can optimistically update
      if (response.success) {
        console.log('Document upload initiated:', response.operationName);
      }
    },
    onError: (error) => {
      console.error('Upload error:', error);
    },
  });
}

/**
 * Hook for checking operation status (polling)
 */
export function useOperationStatus(operationName: string | null, enabled = true) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: documentKeys.operation(operationName || ''),
    queryFn: () => apiService.getOperationStatus(operationName!),
    enabled: enabled && !!operationName,
    refetchInterval: (query) => {
      const data = query.state.data;
      // Stop polling if operation is done or errored
      if (data?.done || data?.error) {
        // Invalidate documents list when operation completes
        queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
        return false;
      }
      // Poll every 2 seconds while operation is in progress
      return 2000;
    },
    staleTime: 0, // Always consider stale to enable polling
  });
}

/**
 * Hook for deleting a document
 */
export function useDeleteDocument() {
  const queryClient = useQueryClient();
  const removeDocument = useDocumentsStore((state) => state.removeDocument);

  return useMutation({
    mutationFn: ({ documentName, force = true }: { documentName: string; force?: boolean }) =>
      apiService.deleteDocument(documentName, force),
    onSuccess: (response, variables) => {
      if (response.success) {
        // Remove from store
        removeDocument(variables.documentName);
        
        // Invalidate and refetch documents list
        queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      }
    },
    onError: (error) => {
      console.error('Delete error:', error);
    },
  });
}

/**
 * Hook for batch deleting documents
 */
export function useBatchDeleteDocuments() {
  const queryClient = useQueryClient();
  const clearSelection = useDocumentsStore((state) => state.clearSelection);

  return useMutation({
    mutationFn: async (documentNames: string[]) => {
      // Delete all documents in parallel
      const deletePromises = documentNames.map((name) =>
        apiService.deleteDocument(name, true)
      );
      return Promise.all(deletePromises);
    },
    onSuccess: () => {
      // Clear selection
      clearSelection();
      
      // Invalidate and refetch documents list
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
    },
    onError: (error) => {
      console.error('Batch delete error:', error);
    },
  });
}
