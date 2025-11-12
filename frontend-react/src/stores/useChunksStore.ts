import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Chunk } from '../types';

interface ChunksState {
  // State
  chunks: Chunk[];
  searchQuery: string;
  resultsCount: number;
  isSearching: boolean;

  // Actions
  setChunks: (chunks: Chunk[]) => void;
  clearChunks: () => void;
  setSearchQuery: (query: string) => void;
  setResultsCount: (count: number) => void;
  setIsSearching: (isSearching: boolean) => void;

  // Computed
  getChunkCount: () => number;
  getFilteredChunks: (minScore?: number) => Chunk[];
}

export const useChunksStore = create<ChunksState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        chunks: [],
        searchQuery: '',
        resultsCount: 25,
        isSearching: false,

        // Actions
        setChunks: (chunks) => set({ chunks }),

        clearChunks: () => set({ chunks: [] }),

        setSearchQuery: (query) => set({ searchQuery: query }),

        setResultsCount: (count) => set({ resultsCount: count }),

        setIsSearching: (isSearching) => set({ isSearching }),

        // Computed values
        getChunkCount: () => get().chunks.length,

        getFilteredChunks: (minScore = 0) => {
          const { chunks } = get();
          return chunks.filter(
            (chunk) => (chunk.chunkRelevanceScore ?? 0) >= minScore
          );
        },
      }),
      {
        name: 'chunks-storage',
        partialize: (state) => ({
          // Persist search settings
          searchQuery: state.searchQuery,
          resultsCount: state.resultsCount,
        }),
      }
    ),
    { name: 'ChunksStore' }
  )
);
