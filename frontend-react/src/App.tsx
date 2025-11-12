import { useMemo, useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAppTheme, getStoredTheme } from './theme/theme';
import type { ThemeMode } from './types';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

// Lazy load pages for code splitting
const DocumentsPage = lazy(() => import('./pages/DocumentsPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const ChunksPage = lazy(() => import('./pages/ChunksPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Create QueryClient instance with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      staleTime: 30000, // 30 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes (cache time)
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// Loading fallback component
const LoadingFallback = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
    }}
  >
    <CircularProgress />
  </Box>
);

function App() {
  const [themeMode] = useState<ThemeMode>(getStoredTheme());

  const theme = useMemo(() => createAppTheme(themeMode), [themeMode]);

  // TODO: Add theme toggle button in layout/navbar
  // const toggleTheme = () => {
  //   const newMode: ThemeMode = themeMode === 'light' ? 'dark' : 'light';
  //   setThemeMode(newMode);
  //   setStoredTheme(newMode);
  // };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Navigate to="/documents" replace />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/chunks" element={<ChunksPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
