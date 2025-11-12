import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import SearchIcon from '@mui/icons-material/Search';
import type { Document } from '../../types';

const searchSchema = z.object({
  documentName: z.string().min(1, 'Seleziona un documento'),
  query: z.string().min(1, 'Inserisci una query'),
  resultsCount: z.number().min(1).max(100),
});

type SearchFormData = z.infer<typeof searchSchema>;

interface ChunksSearchProps {
  documents: Document[];
  onSearch: (documentName: string, query: string, resultsCount: number) => void;
  isLoading: boolean;
}

export default function ChunksSearch({ documents, onSearch, isLoading }: ChunksSearchProps) {
  const activeDocuments = documents.filter((doc) => doc.state === 'STATE_ACTIVE');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      documentName: '',
      query: '*',
      resultsCount: 25,
    },
  });

  const onSubmit = (data: SearchFormData) => {
    onSearch(data.documentName, data.query, data.resultsCount);
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Ricerca Chunks
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Controller
          name="documentName"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth margin="normal" error={!!errors.documentName}>
              <InputLabel>Documento</InputLabel>
              <Select {...field} label="Documento" disabled={isLoading}>
                {activeDocuments.length === 0 ? (
                  <MenuItem disabled>Nessun documento attivo</MenuItem>
                ) : (
                  activeDocuments.map((doc) => (
                    <MenuItem key={doc.name} value={doc.name}>
                      {doc.displayName || doc.name.split('/').pop()}
                    </MenuItem>
                  ))
                )}
              </Select>
              {errors.documentName && (
                <Typography variant="caption" color="error">
                  {errors.documentName.message}
                </Typography>
              )}
            </FormControl>
          )}
        />

        <Controller
          name="query"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Query di ricerca"
              fullWidth
              margin="normal"
              error={!!errors.query}
              helperText={
                errors.query?.message || 'Usa "*" per recuperare tutti i chunks, oppure una query specifica'
              }
              disabled={isLoading}
            />
          )}
        />

        <Controller
          name="resultsCount"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth margin="normal" error={!!errors.resultsCount}>
              <InputLabel>Numero risultati</InputLabel>
              <Select {...field} label="Numero risultati" disabled={isLoading}>
                <MenuItem value={10}>10 chunks</MenuItem>
                <MenuItem value={25}>25 chunks</MenuItem>
                <MenuItem value={50}>50 chunks</MenuItem>
                <MenuItem value={100}>100 chunks (max)</MenuItem>
              </Select>
              {errors.resultsCount && (
                <Typography variant="caption" color="error">
                  {errors.resultsCount.message}
                </Typography>
              )}
            </FormControl>
          )}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          startIcon={<SearchIcon />}
          disabled={isLoading || activeDocuments.length === 0}
          sx={{ mt: 2 }}
        >
          {isLoading ? 'Ricerca in corso...' : 'Cerca Chunks'}
        </Button>
      </Box>
    </Paper>
  );
}
