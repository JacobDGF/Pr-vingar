import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { startAnalytics } from './lib/analytics';

// Före första renderingen, med flit: mätningen ska vara kopplad till samtycket
// innan något kan mätas. Har användaren inte sagt ja laddas ingenting — se
// lib/consent.ts.
startAnalytics();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
