import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Paper from '@mui/material/Paper';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { keyframes } from '@mui/material/styles';

// Animazione per i puntini che "saltano"
const bounce = keyframes`
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-8px);
  }
`;

export default function TypingIndicator() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-start',
        mb: 2,
      }}
    >
      <Box sx={{ display: 'flex', maxWidth: '80%', gap: 1.5 }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
          <SmartToyIcon fontSize="small" />
        </Avatar>

        <Paper
          elevation={2}
          sx={{
            p: 2,
            bgcolor: 'background.paper',
            minWidth: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            {[0, 1, 2].map((index) => (
              <Box
                key={index}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: 'text.secondary',
                  animation: `${bounce} 1.4s infinite ease-in-out`,
                  animationDelay: `${index * 0.2}s`,
                }}
              />
            ))}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
