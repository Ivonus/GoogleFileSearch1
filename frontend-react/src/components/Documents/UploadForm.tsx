import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/material/styles';
import type { UploadRequest } from '../../types';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const uploadSchema = z.object({
  file: z.instanceof(File, { message: 'Seleziona un file' }),
  displayName: z.string().optional(),
  chunkSize: z.number().min(1).max(512),
  documentLocation: z.string().url().optional().or(z.literal('')),
});

type UploadFormData = z.infer<typeof uploadSchema>;

interface UploadFormProps {
  onSubmit: (data: UploadRequest) => void;
  isLoading: boolean;
}

export default function UploadForm({ onSubmit, isLoading }: UploadFormProps) {
  const [fileName, setFileName] = useState<string>('');
  const [metadata, setMetadata] = useState<Array<{ key: string; value: string }>>([]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      chunkSize: 512,
      displayName: '',
      documentLocation: '',
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setValue('file', file);
      setFileName(file.name);
      if (!control._formValues.displayName) {
        setValue('displayName', file.name);
      }
    }
  };

  const handleAddMetadata = () => {
    setMetadata([...metadata, { key: '', value: '' }]);
  };

  const handleRemoveMetadata = (index: number) => {
    setMetadata(metadata.filter((_, i) => i !== index));
  };

  const handleMetadataChange = (index: number, field: 'key' | 'value', value: string) => {
    const newMetadata = [...metadata];
    newMetadata[index][field] = value;
    setMetadata(newMetadata);
  };

  const handleFormSubmit = (data: UploadFormData) => {
    // Filter out empty metadata entries
    const validMetadata = metadata.filter(m => m.key.trim() !== '' && m.value.trim() !== '');
    
    const uploadData: UploadRequest = {
      file: data.file,
      displayName: data.displayName,
      chunkSize: data.chunkSize,
      documentLocation: data.documentLocation || undefined,
      mimeType: data.file.type,
      metadataKeys: validMetadata.map(m => m.key),
      metadataValues: validMetadata.map(m => m.value),
    };

    onSubmit(uploadData);
    reset();
    setFileName('');
    setMetadata([]);
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Carica Nuovo Documento
      </Typography>

      <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
        <Box sx={{ mb: 2 }}>
          <Controller
            name="file"
            control={control}
            render={({ field: { onChange, value, ...field } }) => (
              <Button
                component="label"
                variant="contained"
                startIcon={<CloudUploadIcon />}
                fullWidth
                disabled={isLoading}
              >
                {fileName || 'Seleziona File'}
                <VisuallyHiddenInput
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.txt,.doc,.docx,.xls,.xlsx,.csv,.json,.html,.md"
                  {...field}
                />
              </Button>
            )}
          />
          {errors.file && (
            <FormHelperText error>{errors.file.message}</FormHelperText>
          )}
        </Box>

        <Controller
          name="displayName"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Nome Documento (opzionale)"
              fullWidth
              margin="normal"
              error={!!errors.displayName}
              helperText={errors.displayName?.message}
              disabled={isLoading}
            />
          )}
        />

        <Controller
          name="chunkSize"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth margin="normal" error={!!errors.chunkSize}>
              <InputLabel>Dimensione Chunk (token)</InputLabel>
              <Select
                {...field}
                label="Dimensione Chunk (token)"
                disabled={isLoading}
              >
                <MenuItem value={128}>128 token</MenuItem>
                <MenuItem value={256}>256 token</MenuItem>
                <MenuItem value={512}>512 token (Raccomandato)</MenuItem>
              </Select>
              {errors.chunkSize && (
                <FormHelperText>{errors.chunkSize.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />

        <Controller
          name="documentLocation"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="URL Documento Originale (opzionale)"
              fullWidth
              margin="normal"
              placeholder="https://..."
              error={!!errors.documentLocation}
              helperText={errors.documentLocation?.message || 'Link al documento originale'}
              disabled={isLoading}
            />
          )}
        />

        {/* Metadata Section */}
        <Box sx={{ mt: 3, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Metadati Custom (opzionale)
            </Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={handleAddMetadata}
              disabled={isLoading}
            >
              Aggiungi Metadato
            </Button>
          </Box>

          {metadata.map((meta, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                label="Chiave"
                value={meta.key}
                onChange={(e) => handleMetadataChange(index, 'key', e.target.value)}
                disabled={isLoading}
                size="small"
                sx={{ flex: 1 }}
              />
              <TextField
                label="Valore"
                value={meta.value}
                onChange={(e) => handleMetadataChange(index, 'value', e.target.value)}
                disabled={isLoading}
                size="small"
                sx={{ flex: 1 }}
              />
              <IconButton
                onClick={() => handleRemoveMetadata(index)}
                disabled={isLoading}
                color="error"
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
        </Box>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={isLoading || !fileName}
          sx={{ mt: 2 }}
        >
          {isLoading ? 'Caricamento...' : 'Carica Documento'}
        </Button>
      </Box>
    </Paper>
  );
}
