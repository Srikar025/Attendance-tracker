
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { ToastProvider } from './components/Toast.tsx'

// Register service worker for PWA (production only to prevent dev HMR websocket conflicts)
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('SW registered:', reg.scope))
        .catch((err) => console.warn('SW registration failed:', err));
    });
  } else {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }
    });
  }
}

// Global PWA installation event capturing
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  (window as any).deferredPrompt = e;
  // Dispatch a custom event so listener components can update their state
  window.dispatchEvent(new CustomEvent('pwa-prompt-available'));
});

createRoot(document.getElementById('root')!).render(

    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
,
)
