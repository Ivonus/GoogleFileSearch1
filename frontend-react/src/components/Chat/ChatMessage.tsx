import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ReactMarkdown from 'react-markdown';
import type { ChatMessage as ChatMessageType } from '../../types';

interface ChatMessageProps {
  message: ChatMessageType;
  showSources?: boolean;
}

export default function ChatMessage({ message, showSources = true }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        mb: 2,
      }}
    >
      <Box sx={{ display: 'flex', maxWidth: '80%', gap: 1.5 }}>
        {!isUser && (
          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
            <SmartToyIcon fontSize="small" />
          </Avatar>
        )}

        <Box sx={{ flex: 1 }}>
          <Paper
            elevation={isUser ? 1 : 2}
            sx={{
              p: 2,
              bgcolor: isUser ? 'primary.light' : 'background.paper',
              color: isUser ? 'primary.contrastText' : 'text.primary',
            }}
          >
            {isUser ? (
              <Typography variant="body1">{message.content}</Typography>
            ) : (
              <Box
                sx={{
                  '& p': { mt: 0, mb: 1 },
                  '& p:last-child': { mb: 0 },
                  '& code': {
                    bgcolor: 'grey.100',
                    p: 0.5,
                    borderRadius: 1,
                    fontFamily: 'monospace',
                  },
                  '& pre': {
                    bgcolor: 'grey.100',
                    p: 2,
                    borderRadius: 1,
                    overflow: 'auto',
                  },
                }}
              >
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </Box>
            )}

            <Typography
              variant="caption"
              sx={{
                display: 'block',
                mt: 1,
                opacity: 0.7,
              }}
            >
              {new Date(message.timestamp).toLocaleTimeString('it-IT')}
            </Typography>
          </Paper>

          {/* Source Documents */}
          {!isUser && showSources && message.sources && message.sources.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                Fonti ({(() => {
                  const uniqueDocs = new Set(message.sources.map(c => c.source_document));
                  return `${uniqueDocs.size} documento${uniqueDocs.size !== 1 ? 'i' : ''}, ${message.sources.length} sezione${message.sources.length !== 1 ? 'i' : ''}`;
                })()} usate):
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {/* Raggruppa chunks per documento e mostra score più alto */}
                {Array.from(
                  message.sources.reduce((map, chunk) => {
                    const docName = chunk.source_document || 'Unknown';
                    const existing = map.get(docName);
                    const currentScore = chunk.chunkRelevanceScore || 0;
                    
                    if (!existing || currentScore > existing.score) {
                      map.set(docName, {
                        name: docName,
                        score: currentScore,
                        count: existing ? existing.count + 1 : 1,
                      });
                    } else {
                      existing.count += 1;
                    }
                    
                    return map;
                  }, new Map<string, { name: string; score: number; count: number }>()).values()
                ).map((source, index) => (
                  <Chip
                    key={index}
                    label={`${source.name.split('/').pop()} (${(source.score * 100).toFixed(0)}%) ${source.count > 1 ? `×${source.count}` : ''}`}
                    size="small"
                    variant="outlined"
                    sx={{ cursor: 'default' }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>

        {isUser && (
          <Avatar sx={{ bgcolor: 'grey.500', width: 32, height: 32 }}>
            <PersonIcon fontSize="small" />
          </Avatar>
        )}
      </Box>
    </Box>
  );
}
