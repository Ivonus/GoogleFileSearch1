import { useMutation } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { useChatStore } from '../stores';
import type { ChatGenerateRequest, Chunk } from '../types';

/**
 * Hook for querying relevant chunks for chat
 */
export function useChatQueryChunks() {
  return useMutation({
    mutationFn: async ({
      query,
      results_count,
    }: {
      query: string;
      results_count?: number;
    }) => {
      const response = await apiService.queryChatChunks({
        query,
        results_count,
      });
      return response;
    },
    onError: (error) => {
      console.error('Chat query chunks error:', error);
    },
  });
}

/**
 * Hook for generating chat response (non-streaming)
 */
export function useChatGenerate() {
  const addMessage = useChatStore((state) => state.addMessage);

  return useMutation({
    mutationFn: async (data: ChatGenerateRequest) => {
      const response = await apiService.generateChatResponse(data);
      return response;
    },
    onSuccess: (response) => {
      if (response.success && response.response) {
        // Add assistant message to store
        addMessage({
          role: 'assistant',
          content: response.response,
          sources: response.chunks_filtered,
        });
      }
    },
    onError: (error) => {
      console.error('Chat generate error:', error);
    },
  });
}

/**
 * Hook for streaming chat response
 * This doesn't use React Query mutation as streaming requires special handling
 */
export function useChatStream() {
  const {
    setIsStreaming,
    setCurrentStreamingMessage,
    appendToStreamingMessage,
    finalizeStreamingMessage,
  } = useChatStore();

  const streamResponse = async (
    data: ChatGenerateRequest,
    signal?: AbortSignal
  ): Promise<void> => {
    try {
      setIsStreaming(true);
      setCurrentStreamingMessage('');

      // Store sources from the request data BEFORE streaming
      const sources: Chunk[] = data.relevant_chunks;

      await apiService.streamChatResponse(
        data,
        // onChunk
        (text: string) => {
          appendToStreamingMessage(text);
        },
        // onDone
        () => {
          finalizeStreamingMessage(sources);
        },
        // onError
        (error: Error) => {
          console.error('Streaming error:', error);
          setIsStreaming(false);
          setCurrentStreamingMessage('');
          throw error;
        },
        signal
      );
    } catch (error) {
      setIsStreaming(false);
      setCurrentStreamingMessage('');
      throw error;
    }
  };

  return {
    streamResponse,
    isStreaming: useChatStore((state) => state.isStreaming),
    currentMessage: useChatStore((state) => state.currentStreamingMessage),
  };
}

/**
 * Hook for getting chat messages and settings from store
 */
export function useChatMessages() {
  const messages = useChatStore((state) => state.messages);
  const settings = useChatStore((state) => state.settings);
  const clearMessages = useChatStore((state) => state.clearMessages);
  const addMessage = useChatStore((state) => state.addMessage);
  const updateSettings = useChatStore((state) => state.updateSettings);

  return {
    messages,
    settings,
    clearMessages,
    addMessage,
    updateSettings,
  };
}
