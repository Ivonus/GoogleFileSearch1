import { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import type { Chunk } from '../../types';

interface ChunksListProps {
  chunks: Chunk[];
}

export default function ChunksList({ chunks }: ChunksListProps) {
  const [expandedChunks, setExpandedChunks] = useState<Set<string>>(new Set());

  const toggleExpand = (chunkName: string) => {
    setExpandedChunks((prev) => {
      const next = new Set(prev);
      if (next.has(chunkName)) {
        next.delete(chunkName);
      } else {
        next.add(chunkName);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedChunks(new Set(chunks.map((c, idx) => {
      // Supporta sia il formato nuovo che quello vecchio
      return c.chunk?.name || (c as any).name || `chunk-${idx}`;
    })));
  };

  const collapseAll = () => {
    setExpandedChunks(new Set());
  };

  const getChunkText = (chunk: Chunk | any): string => {
    // Supporta sia il formato nuovo che quello vecchio
    return chunk.chunk?.data?.stringValue || chunk.stringValue || 'Nessun testo disponibile';
  };

  const getStateColor = (state?: string) => {
    switch (state) {
      case 'STATE_ACTIVE':
        return 'success';
      case 'STATE_PENDING':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (chunks.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">
          Nessun chunk trovato. Modifica i criteri di ricerca.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          {chunks.length} Chunks trovati
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            label="Espandi tutti"
            size="small"
            onClick={expandAll}
            clickable
          />
          <Chip
            label="Riduci tutti"
            size="small"
            onClick={collapseAll}
            clickable
          />
        </Box>
      </Box>

      {chunks.map((chunk: any, index) => {
        // Supporta sia il formato nuovo che quello vecchio
        const chunkName = chunk.chunk?.name || chunk.name || `chunk-${index}`;
        const isExpanded = expandedChunks.has(chunkName);
        const text = getChunkText(chunk);
        const previewText = text.length > 200 ? text.substring(0, 200) + '...' : text;

        return (
          <Paper key={chunkName} elevation={2} sx={{ mb: 2 }}>
            <Box
              sx={{
                p: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                cursor: 'pointer',
              }}
              onClick={() => toggleExpand(chunkName)}
            >
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="body2" fontWeight="bold">
                    Chunk #{index + 1}
                  </Typography>
                  <Chip
                    label={`Score: ${((chunk.chunkRelevanceScore || chunk.relevanceScore || 0) * 100).toFixed(1)}%`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  {(chunk.chunk?.state || chunk.state) && (
                    <Chip
                      label={chunk.chunk?.state || chunk.state}
                      size="small"
                      color={getStateColor(chunk.chunk?.state || chunk.state)}
                    />
                  )}
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  {chunk.document?.displayName || chunk.source_document || chunk.name?.split('/documents/')[1]?.split('/chunks/')[0] || 'Documento sconosciuto'}
                </Typography>

                {/* Metadati del documento */}
                {chunk.document?.customMetadata && chunk.document.customMetadata.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                    {chunk.document.customMetadata.map((meta: { key: string; stringValue?: string }, idx: number) => (
                      <Chip
                        key={idx}
                        label={`${meta.key}: ${meta.stringValue || ''}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    ))}
                  </Box>
                )}

                <Collapse in={!isExpanded} collapsedSize={60}>
                  <Typography
                    variant="body2"
                    sx={{
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {previewText}
                  </Typography>
                </Collapse>

                <Collapse in={isExpanded}>
                  <Box
                    sx={{
                      mt: 1,
                      p: 2,
                      bgcolor: 'grey.50',
                      borderRadius: 1,
                      maxHeight: 400,
                      overflow: 'auto',
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                      }}
                    >
                      {text}
                    </Typography>
                  </Box>
                </Collapse>
              </Box>

              <IconButton size="small" sx={{ ml: 1 }}>
                {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
          </Paper>
        );
      })}
    </Box>
  );
}
