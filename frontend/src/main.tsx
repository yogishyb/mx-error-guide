import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './utils/protection'; // Initialize runtime protection
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
