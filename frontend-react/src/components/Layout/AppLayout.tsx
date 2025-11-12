import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import DescriptionIcon from '@mui/icons-material/Description';
import ChatIcon from '@mui/icons-material/Chat';
import DataObjectIcon from '@mui/icons-material/DataObject';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function AppLayout({ children, title }: AppLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 0, mr: 4 }}>
            RAG File Search
          </Typography>

          <Stack direction="row" spacing={1} sx={{ flexGrow: 1 }}>
            <Button
              color="inherit"
              startIcon={<DescriptionIcon />}
              onClick={() => navigate('/documents')}
              variant={isActive('/documents') ? 'outlined' : 'text'}
              sx={{
                borderColor: isActive('/documents') ? 'white' : 'transparent',
                '&:hover': { borderColor: 'white' }
              }}
            >
              Documenti
            </Button>
            <Button
              color="inherit"
              startIcon={<ChatIcon />}
              onClick={() => navigate('/chat')}
              variant={isActive('/chat') ? 'outlined' : 'text'}
              sx={{
                borderColor: isActive('/chat') ? 'white' : 'transparent',
                '&:hover': { borderColor: 'white' }
              }}
            >
              Chat
            </Button>
            <Button
              color="inherit"
              startIcon={<DataObjectIcon />}
              onClick={() => navigate('/chunks')}
              variant={isActive('/chunks') ? 'outlined' : 'text'}
              sx={{
                borderColor: isActive('/chunks') ? 'white' : 'transparent',
                '&:hover': { borderColor: 'white' }
              }}
            >
              Chunks
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ flex: 1, py: 4 }}>
        {title && (
          <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
            {title}
          </Typography>
        )}
        {children}
      </Container>

      <Box
        component="footer"
        sx={{
          py: 2,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            Google RAG File Search - Sistema di gestione documenti con AI
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
