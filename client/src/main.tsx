import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then((registration) => {
    console.log('ServiceWorker registration successful');

    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'activated' && navigator.serviceWorker.controller) {
            window.dispatchEvent(new CustomEvent('sw-update-available'));
          }
        });
      }
    });

    setInterval(() => {
      registration.update();
    }, 30 * 60 * 1000);
  }).catch(registrationError => {
    console.log('SW registration failed: ', registrationError);
  });
}

