import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { registerPWA } from './services/pwa';

// Register PWA service worker
registerPWA(() => {
  console.log('PWA update available');
  // You can show a snackbar here to notify users
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
