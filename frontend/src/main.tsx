import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Protection disabled temporarily - was causing issues
// import './utils/protection';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
