import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useState } from 'react';

interface ChatSettingsProps {
  model: string;
  onModelChange: (model: string) => void;
  resultsCount: number;
  onResultsCountChange: (count: number) => void;
  showSources: boolean;
  onShowSourcesChange: (show: boolean) => void;
  useStreaming: boolean;
  onUseStreamingChange: (use: boolean) => void;
}

const AVAILABLE_MODELS = [
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Veloce)' },
  { value: 'gemini-1.5-flash-latest', label: 'Gemini 1.5 Flash' },
  { value: 'gemini-1.5-pro-latest', label: 'Gemini 1.5 Pro' },
  { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (Migliore)' },
];

export default function ChatSettings({
  model,
  onModelChange,
  resultsCount,
  onResultsCountChange,
  showSources,
  onShowSourcesChange,
  useStreaming,
  onUseStreamingChange,
}: ChatSettingsProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Paper elevation={2} sx={{ mb: 2 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          cursor: 'pointer',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Typography variant="h6">Impostazioni Chat</Typography>
        <IconButton size="small">
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ p: 2, pt: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Modello AI</InputLabel>
            <Select
              value={model}
              onChange={(e) => onModelChange(e.target.value)}
              label="Modello AI"
            >
              {AVAILABLE_MODELS.map((m) => (
                <MenuItem key={m.value} value={m.value}>
                  {m.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            size="small"
            type="number"
            label="Numero Chunks da Recuperare"
            value={resultsCount}
            onChange={(e) => onResultsCountChange(parseInt(e.target.value, 10))}
            inputProps={{ min: 5, max: 50 }}
            helperText="Numero di chunks da recuperare nella fase di retrieval (5-50)"
          />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={showSources}
                  onChange={(e) => onShowSourcesChange(e.target.checked)}
                />
              }
              label="Mostra documenti fonte"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={useStreaming}
                  onChange={(e) => onUseStreamingChange(e.target.checked)}
                />
              }
              label="Abilita streaming risposta (SSE)"
            />
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
}
