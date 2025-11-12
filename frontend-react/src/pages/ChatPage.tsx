import { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import DeleteIcon from '@mui/icons-material/Delete';
import AppLayout from '../components/Layout/AppLayout';
import ChatMessage from '../components/Chat/ChatMessage';
import ChatInput from '../components/Chat/ChatInput';
import ChatSettings from '../components/Chat/ChatSettings';
import TypingIndicator from '../components/Chat/TypingIndicator';
import { useChatQueryChunks, useChatGenerate, useChatStream, useDocuments } from '../hooks';
import { useChatStore } from '../stores';

export default function ChatPage() {
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use Zustand stores
  const { messages, settings, addMessage, updateSettings } = useChatStore();
  const clearMessages = useChatStore((state) => state.clearMessages);
  const isStreaming = useChatStore((state) => state.isStreaming);
  const currentStreamingMessage = useChatStore((state) => state.currentStreamingMessage);

  // Use React Query hooks
  const { data: documentsData } = useDocuments();
  const queryChunksMutation = useChatQueryChunks();
  const generateMutation = useChatGenerate();
  const { streamResponse } = useChatStream();

  const activeDocumentsCount = documentsData?.documents.filter(
    (doc) => doc.state === 'STATE_ACTIVE'
  ).length || 0;

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentStreamingMessage]);

  const handleSendMessage = async (text: string) => {
    if (activeDocumentsCount === 0) {
      setNotification({
        open: true,
        message: 'Nessun documento attivo. Carica almeno un documento prima di chattare.',
        severity: 'warning',
      });
      return;
    }

    // Add user message to store
    addMessage({
      role: 'user',
      content: text,
    });

    try {
      // Phase 1: Query for relevant chunks
      const queryResult = await queryChunksMutation.mutateAsync({
        query: text,
        results_count: settings.topK,
      });

      if (!queryResult.success || queryResult.relevant_chunks.length === 0) {
        throw new Error('Nessun chunk rilevante trovato');
      }

      // Prepare chat history for backend
      const chatHistory = messages.map((msg) => ({
        role: msg.role,
        text: msg.content,
      }));

      // Phase 2: Generate response
      if (settings.streamResponse) {
        // Streaming generation
        const controller = new AbortController();
        setAbortController(controller);

        await streamResponse(
          {
            query: text,
            relevant_chunks: queryResult.relevant_chunks,
            model: settings.model,
            chat_history: chatHistory,
          },
          controller.signal
        );
      } else {
        // Non-streaming generation
        await generateMutation.mutateAsync({
          query: text,
          relevant_chunks: queryResult.relevant_chunks,
          model: settings.model,
          chat_history: chatHistory,
        });
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        setNotification({
          open: true,
          message: error.response?.data?.error || error.message || 'Errore durante la generazione della risposta',
          severity: 'error',
        });

        addMessage({
          role: 'assistant',
          content: 'Mi dispiace, si è verificato un errore. Riprova.',
        });
      }
    } finally {
      setAbortController(null);
    }
  };

  const handleStopStreaming = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
  };

  const handleClearChat = () => {
    setClearDialogOpen(true);
  };

  const handleConfirmClear = () => {
    clearMessages();
    setClearDialogOpen(false);
    setNotification({
      open: true,
      message: 'Cronologia chat cancellata',
      severity: 'success',
    });
  };

  const handleCancelClear = () => {
    setClearDialogOpen(false);
  };

  const isLoading = queryChunksMutation.isPending || generateMutation.isPending || isStreaming;

  return (
    <AppLayout title="Chat AI">
      <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <ChatSettings
              model={settings.model}
              onModelChange={(model) => updateSettings({ model })}
              resultsCount={settings.resultsCount}
              onResultsCountChange={(count) => updateSettings({ resultsCount: count })}
              showSources={settings.showSources}
              onShowSourcesChange={(show) => updateSettings({ showSources: show })}
              useStreaming={settings.streamResponse}
              onUseStreamingChange={(use) => updateSettings({ streamResponse: use })}
            />
          </Box>
          {messages.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleClearChat}
              disabled={isStreaming}
              sx={{ ml: 2 }}
            >
              Pulisci Chat
            </Button>
          )}
        </Box>

        {activeDocumentsCount === 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Nessun documento attivo. Carica almeno un documento nella sezione "Documenti" per iniziare a chattare.
          </Alert>
        )}

        {/* Messages Area */}
        <Paper
          elevation={2}
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 2,
            mb: 2,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {messages.length === 0 && !isStreaming && (
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                color: 'text.secondary',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Benvenuto nella Chat AI!
              </Typography>
              <Typography variant="body2">
                Fai domande sui tuoi documenti caricati.
                <br />
                L'AI utilizzerà i contenuti per fornirti risposte accurate.
              </Typography>
            </Box>
          )}

          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} showSources={settings.showSources} />
          ))}

          {/* Streaming message */}
          {isStreaming && currentStreamingMessage && (
            <ChatMessage
              message={{
                id: `streaming-${Date.now()}`,
                role: 'assistant',
                content: currentStreamingMessage,
                timestamp: Date.now(),
              }}
              showSources={false}
            />
          )}

          {/* Loading indicator - solo se in attesa e non sta ancora facendo streaming */}
          {isLoading && !currentStreamingMessage && (
            <TypingIndicator />
          )}

          <div ref={messagesEndRef} />
        </Paper>

        {/* Input Area */}
        <ChatInput
          onSend={handleSendMessage}
          onStop={handleStopStreaming}
          disabled={isLoading || activeDocumentsCount === 0}
          isStreaming={isStreaming}
          placeholder={
            activeDocumentsCount === 0
              ? 'Carica documenti per iniziare...'
              : 'Fai una domanda sui tuoi documenti...'
          }
        />
      </Box>

      {/* Dialog conferma cancellazione */}
      <Dialog
        open={clearDialogOpen}
        onClose={handleCancelClear}
        aria-labelledby="clear-dialog-title"
        aria-describedby="clear-dialog-description"
      >
        <DialogTitle id="clear-dialog-title">
          Conferma cancellazione
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="clear-dialog-description">
            Sei sicuro di voler cancellare tutta la cronologia della chat? 
            Questa azione non può essere annullata.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelClear} color="primary">
            Annulla
          </Button>
          <Button onClick={handleConfirmClear} color="error" variant="contained" autoFocus>
            Cancella
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </AppLayout>
  );
}
