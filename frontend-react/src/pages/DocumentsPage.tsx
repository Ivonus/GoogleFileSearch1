import { useState } from 'react';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import CircularProgress from '@mui/material/CircularProgress';
import AppLayout from '../components/Layout/AppLayout';
import UploadForm from '../components/Documents/UploadForm';
import DocumentsList from '../components/Documents/DocumentsList';
import OperationsMonitor from '../components/Documents/OperationsMonitor';
import { useDocuments, useUploadDocument, useDeleteDocument } from '../hooks';
import type { UploadRequest } from '../types';

interface Operation {
  operationName: string;
  documentName: string;
  status: 'pending' | 'active' | 'done' | 'error';
  error?: string;
}

export default function DocumentsPage() {
  const [operations, setOperations] = useState<Operation[]>([]);
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
  const {
    data: documentsData,
    isLoading,
    error,
    refetch,
  } = useDocuments();

  const uploadMutation = useUploadDocument();
  const deleteMutation = useDeleteDocument();

  const handleUpload = (data: UploadRequest) => {
    uploadMutation.mutate(data, {
      onSuccess: (response) => {
        // Add operation to monitoring
        setOperations((prev) => [
          ...prev,
          {
            operationName: response.operationName,
            documentName: response.displayName || 'Documento',
            status: 'pending',
          },
        ]);

        setNotification({
          open: true,
          message: 'Upload avviato! Monitora il progresso nella sezione operazioni.',
          severity: 'success',
        });
      },
      onError: (error: any) => {
        setNotification({
          open: true,
          message: error.response?.data?.error || 'Errore durante il caricamento del documento',
          severity: 'error',
        });
      },
    });
  };

  const handleDelete = (documentName: string) => {
    deleteMutation.mutate(
      { documentName, force: true },
      {
        onSuccess: () => {
          setNotification({
            open: true,
            message: 'Documento eliminato con successo',
            severity: 'success',
          });
        },
        onError: (error: any) => {
          setNotification({
            open: true,
            message: error.response?.data?.error || "Errore durante l'eliminazione del documento",
            severity: 'error',
          });
        },
      }
    );
  };

  const handleOperationComplete = (operationName: string, success: boolean) => {
    setOperations((prev) =>
      prev.map((op) =>
        op.operationName === operationName
          ? { ...op, status: success ? 'done' : 'error' }
          : op
      )
    );

    if (success) {
      // Refetch documents when operation completes
      refetch();
      setNotification({
        open: true,
        message: 'Documento caricato e indicizzato con successo!',
        severity: 'success',
      });
    } else {
      setNotification({
        open: true,
        message: 'Errore durante l\'elaborazione del documento',
        severity: 'error',
      });
    }

    // Remove completed/failed operations after 5 seconds
    setTimeout(() => {
      setOperations((prev) => prev.filter((op) => op.operationName !== operationName));
    }, 5000);
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  return (
    <AppLayout title="Gestione Documenti">
      <Box>
        <UploadForm onSubmit={handleUpload} isLoading={uploadMutation.isPending} />

        <OperationsMonitor operations={operations} onOperationComplete={handleOperationComplete} />

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Errore nel caricamento dei documenti:{' '}
            {(error as any).response?.data?.error || (error as Error).message}
          </Alert>
        )}

        {documentsData && (
          <DocumentsList
            documents={documentsData.documents}
            onDelete={handleDelete}
            isDeleting={deleteMutation.isPending}
          />
        )}
      </Box>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
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
