import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import { apiService } from '../../services/api';

interface Operation {
  operationName: string;
  documentName: string;
  status: 'pending' | 'active' | 'done' | 'error';
  error?: string;
}

interface OperationsMonitorProps {
  operations: Operation[];
  onOperationComplete: (operationName: string, success: boolean) => void;
}

// Componente separato per ogni operazione per rispettare le regole degli Hooks
function OperationItem({ 
  operation, 
  onComplete 
}: { 
  operation: Operation; 
  onComplete: (operationName: string, success: boolean) => void;
}) {
  const { data } = useQuery({
    queryKey: ['operation', operation.operationName],
    queryFn: () => apiService.getOperationStatus(operation.operationName),
    refetchInterval: 3000, // Poll every 3 seconds
    enabled: Boolean(operation.operationName) && operation.status !== 'done' && operation.status !== 'error',
  });

  useEffect(() => {
    if (data) {
      if (data.done) {
        onComplete(operation.operationName, !data.error);
      } else if (data.error) {
        onComplete(operation.operationName, false);
      }
    }
  }, [data, operation.operationName, onComplete]);

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="body2">
          {operation.documentName}
        </Typography>
        <Chip
          label={operation.status === 'pending' ? 'In attesa' : 'Elaborazione'}
          color={operation.status === 'pending' ? 'default' : 'primary'}
          size="small"
        />
      </Box>
      <LinearProgress />
    </Box>
  );
}

export default function OperationsMonitor({ operations, onOperationComplete }: OperationsMonitorProps) {
  const activeOperations = operations.filter(op => op.status !== 'done' && op.status !== 'error');

  if (activeOperations.length === 0) {
    return null;
  }

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Operazioni in Corso ({activeOperations.length})
      </Typography>

      {activeOperations.map((operation) => (
        <OperationItem
          key={operation.operationName}
          operation={operation}
          onComplete={onOperationComplete}
        />
      ))}

      {operations.some(op => op.status === 'error') && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Alcune operazioni sono fallite. Riprova il caricamento.
        </Alert>
      )}
    </Paper>
  );
}
