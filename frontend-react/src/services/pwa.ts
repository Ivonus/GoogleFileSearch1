import { Workbox } from 'workbox-window';

let wb: Workbox | null = null;

export const registerPWA = (onUpdate?: () => void): void => {
  // Skip service worker registration in development
  if (import.meta.env.DEV) {
    console.log('Service worker registration skipped in development mode');
    return;
  }

  if ('serviceWorker' in navigator) {
    wb = new Workbox('/sw.js');

    wb.addEventListener('installed', (event) => {
      if (event.isUpdate) {
        console.log('New service worker installed, update available');
        if (onUpdate) {
          onUpdate();
        }
      } else {
        console.log('Service worker installed for the first time');
      }
    });

    wb.addEventListener('activated', (event) => {
      if (event.isUpdate) {
        console.log('Service worker updated and activated');
        window.location.reload();
      }
    });

    wb.register();
  }
};

export const updatePWA = (): void => {
  if (wb) {
    wb.messageSkipWaiting();
  }
};
