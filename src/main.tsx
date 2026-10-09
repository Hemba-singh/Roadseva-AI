import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      // Graceful fallback for environments where service workers are restricted
      console.warn('ServiceWorker registration skipped:', err);
    });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
