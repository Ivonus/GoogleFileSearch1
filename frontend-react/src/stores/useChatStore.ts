import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Chunk } from '../types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  sources?: Chunk[];
}

export interface ChatSettings {
  model: string;
  topK: number;
  minRelevanceScore: number;
  maxChunks: number;
  includeChunkText: boolean;
  streamResponse: boolean;
  showSources: boolean;
  resultsCount: number;
}

interface ChatState {
  // State
  messages: ChatMessage[];
  settings: ChatSettings;
  isStreaming: boolean;
  currentStreamingMessage: string;

  // Actions
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  updateSettings: (settings: Partial<ChatSettings>) => void;
  setIsStreaming: (isStreaming: boolean) => void;
  setCurrentStreamingMessage: (message: string) => void;
  appendToStreamingMessage: (chunk: string) => void;
  finalizeStreamingMessage: (sources?: ChatMessage['sources']) => void;
  
  // Computed
  getMessageCount: () => number;
  getLastUserMessage: () => ChatMessage | undefined;
}

const DEFAULT_SETTINGS: ChatSettings = {
  model: 'gemini-2.5-pro',
  topK: 25,
  minRelevanceScore: 0.3,
  maxChunks: 15,
  includeChunkText: true,
  streamResponse: true,
  showSources: true,
  resultsCount: 25,
};

export const useChatStore = create<ChatState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        messages: [],
        settings: DEFAULT_SETTINGS,
        isStreaming: false,
        currentStreamingMessage: '',

        // Actions
        addMessage: (message) => {
          const newMessage: ChatMessage = {
            ...message,
            id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
          };
          set((state) => ({
            messages: [...state.messages, newMessage],
          }));
        },

        clearMessages: () => set({ messages: [], currentStreamingMessage: '', isStreaming: false }),

        updateSettings: (newSettings) =>
          set((state) => ({
            settings: { ...state.settings, ...newSettings },
          })),

        setIsStreaming: (isStreaming) => set({ isStreaming }),

        setCurrentStreamingMessage: (message) =>
          set({ currentStreamingMessage: message }),

        appendToStreamingMessage: (chunk) =>
          set((state) => ({
            currentStreamingMessage: state.currentStreamingMessage + chunk,
          })),

        finalizeStreamingMessage: (sources) => {
          const { currentStreamingMessage } = get();
          if (currentStreamingMessage) {
            get().addMessage({
              role: 'assistant',
              content: currentStreamingMessage,
              sources,
            });
            set({ currentStreamingMessage: '', isStreaming: false });
          }
        },

        // Computed values
        getMessageCount: () => get().messages.length,

        getLastUserMessage: () => {
          const messages = get().messages;
          return messages.filter((msg) => msg.role === 'user').pop();
        },
      }),
      {
        name: 'chat-storage',
        partialize: (state) => ({
          // Persist messages and settings, but not streaming state
          messages: state.messages,
          settings: state.settings,
        }),
      }
    ),
    { name: 'ChatStore' }
  )
);
