import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Document } from '../types';

interface DocumentsState {
  // State
  documents: Document[];
  selectedDocuments: string[];
  searchQuery: string;
  
  // Actions
  setDocuments: (documents: Document[]) => void;
  addDocument: (document: Document) => void;
  removeDocument: (documentName: string) => void;
  toggleDocumentSelection: (documentName: string) => void;
  selectAllDocuments: () => void;
  clearSelection: () => void;
  setSearchQuery: (query: string) => void;
  
  // Computed
  getFilteredDocuments: () => Document[];
  getSelectedCount: () => number;
}

export const useDocumentsStore = create<DocumentsState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        documents: [],
        selectedDocuments: [],
        searchQuery: '',

        // Actions
        setDocuments: (documents) => set({ documents }),

        addDocument: (document) =>
          set((state) => ({
            documents: [document, ...state.documents],
          })),

        removeDocument: (documentName) =>
          set((state) => ({
            documents: state.documents.filter((doc) => doc.name !== documentName),
            selectedDocuments: state.selectedDocuments.filter(
              (name) => name !== documentName
            ),
          })),

        toggleDocumentSelection: (documentName) =>
          set((state) => ({
            selectedDocuments: state.selectedDocuments.includes(documentName)
              ? state.selectedDocuments.filter((name) => name !== documentName)
              : [...state.selectedDocuments, documentName],
          })),

        selectAllDocuments: () =>
          set((state) => ({
            selectedDocuments: state.documents.map((doc) => doc.name),
          })),

        clearSelection: () => set({ selectedDocuments: [] }),

        setSearchQuery: (query) => set({ searchQuery: query }),

        // Computed values
        getFilteredDocuments: () => {
          const { documents, searchQuery } = get();
          if (!searchQuery) return documents;

          const query = searchQuery.toLowerCase();
          return documents.filter(
            (doc) =>
              doc.displayName?.toLowerCase().includes(query) ||
              doc.name.toLowerCase().includes(query) ||
              doc.mimeType?.toLowerCase().includes(query)
          );
        },

        getSelectedCount: () => get().selectedDocuments.length,
      }),
      {
        name: 'documents-storage',
        partialize: (state) => ({
          // Only persist selectedDocuments and searchQuery
          selectedDocuments: state.selectedDocuments,
          searchQuery: state.searchQuery,
        }),
      }
    ),
    { name: 'DocumentsStore' }
  )
);
