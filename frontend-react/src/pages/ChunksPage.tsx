import { useState } from 'react';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import CircularProgress from '@mui/material/CircularProgress';
import AppLayout from '../components/Layout/AppLayout';
import ChunksSearch from '../components/Chunks/ChunksSearch';
import ChunksList from '../components/Chunks/ChunksList';
import { useDocuments, useQueryDocumentChunks } from '../hooks';
import { useChunksStore } from '../stores';

export default function ChunksPage() {
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // Use custom hooks
  const { data: documentsData, isLoading: documentsLoading } = useDocuments();
  const searchMutation = useQueryDocumentChunks();
  
  // Use store
  const chunks = useChunksStore((state) => state.chunks);
  const setChunks = useChunksStore((state) => state.setChunks);

  const handleSearch = (documentName: string, query: string, resultsCount: number) => {
    searchMutation.mutate(
      { documentName, query, results_count: resultsCount },
      {
        onSuccess: (response) => {
          console.log('Chunks ricevuti:', response.chunks);
          setChunks(response.chunks);
          setSearchPerformed(true);
          setNotification({
            open: true,
            message: `Trovati ${response.chunks.length} chunks`,
            severity: 'success',
          });
        },
        onError: (error: any) => {
          setNotification({
            open: true,
            message: error.response?.data?.error || 'Errore durante la ricerca dei chunks',
            severity: 'error',
          });
          setChunks([]);
          setSearchPerformed(true);
        },
      }
    );
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  return (
    <AppLayout title="Visualizzazione Chunks">
      <Box>
        {documentsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : !documentsData?.documents || documentsData.documents.length === 0 ? (
          <Alert severity="warning" sx={{ mb: 3 }}>
            Nessun documento disponibile. Carica almeno un documento nella sezione "Documenti" per visualizzare i chunks.
          </Alert>
        ) : (
          <>
            <ChunksSearch
              documents={documentsData.documents}
              onSearch={handleSearch}
              isLoading={searchMutation.isPending}
            />

            {searchMutation.isPending && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            )}

            {searchPerformed && !searchMutation.isPending && (
              <ChunksList chunks={chunks} />
            )}
          </>
        )}
      </Box>

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </AppLayout>
  );
}
