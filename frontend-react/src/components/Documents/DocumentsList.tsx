import { useState } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import InfoIcon from '@mui/icons-material/Info';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import type { Document } from '../../types';

interface DocumentsListProps {
  documents: Document[];
  onDelete: (documentName: string) => void;
  isDeleting: boolean;
}

export default function DocumentsList({ documents, onDelete, isDeleting }: DocumentsListProps) {
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; document: Document | null }>({
    open: false,
    document: null,
  });
  const [metadataDialog, setMetadataDialog] = useState<{ open: boolean; document: Document | null }>({
    open: false,
    document: null,
  });

  const handleDeleteClick = (document: Document) => {
    setDeleteDialog({ open: true, document });
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.document) {
      onDelete(deleteDialog.document.name);
    }
    setDeleteDialog({ open: false, document: null });
  };

  const handleMetadataClick = (document: Document) => {
    setMetadataDialog({ open: true, document });
  };

  const formatBytes = (bytes?: string) => {
    if (!bytes) return 'N/A';
    const size = parseInt(bytes, 10);
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('it-IT');
  };

  const getStateColor = (state?: string) => {
    switch (state) {
      case 'STATE_ACTIVE':
        return 'success';
      case 'STATE_PENDING':
        return 'warning';
      case 'STATE_FAILED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStateLabel = (state?: string) => {
    switch (state) {
      case 'STATE_ACTIVE':
        return 'Attivo';
      case 'STATE_PENDING':
        return 'In elaborazione';
      case 'STATE_FAILED':
        return 'Errore';
      default:
        return state || 'Sconosciuto';
    }
  };

  if (documents.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">
          Nessun documento caricato. Carica il primo documento usando il form sopra.
        </Typography>
      </Paper>
    );
  }

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Dimensione</TableCell>
              <TableCell>Stato</TableCell>
              <TableCell>Data Creazione</TableCell>
              <TableCell align="center">Azioni</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.name} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {doc.displayName || doc.name.split('/').pop()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={doc.mimeType?.split('/').pop()?.toUpperCase() || 'N/A'}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{formatBytes(doc.sizeBytes)}</TableCell>
                <TableCell>
                  <Chip
                    label={getStateLabel(doc.state)}
                    color={getStateColor(doc.state)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{formatDate(doc.createTime)}</TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                    {doc.metadata?.document_location && (
                      <Tooltip title="Apri documento originale">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => window.open(doc.metadata!.document_location, '_blank')}
                        >
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Visualizza metadati">
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => handleMetadataClick(doc)}
                      >
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Elimina documento">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(doc)}
                        disabled={isDeleting}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, document: null })}>
        <DialogTitle>Conferma Eliminazione</DialogTitle>
        <DialogContent>
          <Typography>
            Sei sicuro di voler eliminare il documento{' '}
            <strong>{deleteDialog.document?.displayName || deleteDialog.document?.name}</strong>?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            Questa operazione eliminerà anche tutti i chunk associati e non può essere annullata.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, document: null })}>Annulla</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={isDeleting}>
            Elimina
          </Button>
        </DialogActions>
      </Dialog>

      {/* Metadata Dialog */}
      <Dialog
        open={metadataDialog.open}
        onClose={() => setMetadataDialog({ open: false, document: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Metadati Documento</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Nome
              </Typography>
              <Typography variant="body2">{metadataDialog.document?.displayName || 'N/A'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Nome Interno
              </Typography>
              <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                {metadataDialog.document?.name}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Tipo MIME
              </Typography>
              <Typography variant="body2">{metadataDialog.document?.mimeType || 'N/A'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Dimensione
              </Typography>
              <Typography variant="body2">{formatBytes(metadataDialog.document?.sizeBytes)}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Data Creazione
              </Typography>
              <Typography variant="body2">{formatDate(metadataDialog.document?.createTime)}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Ultimo Aggiornamento
              </Typography>
              <Typography variant="body2">{formatDate(metadataDialog.document?.updateTime)}</Typography>
            </Box>
            {metadataDialog.document?.metadata && Object.keys(metadataDialog.document.metadata).length > 0 && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Metadati Custom
                </Typography>
                <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                  {Object.entries(metadataDialog.document.metadata).map(([key, value]) => (
                    <Typography key={key} variant="body2" sx={{ fontFamily: 'monospace' }}>
                      <strong>{key}:</strong> {value}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMetadataDialog({ open: false, document: null })}>Chiudi</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
