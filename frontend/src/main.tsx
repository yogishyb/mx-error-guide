import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Protection disabled temporarily - was causing issues
// import './utils/protection';

// Geist font (Linear Aesthetic)
import '@fontsource/geist-sans/400.css';
import '@fontsource/geist-sans/500.css';
import '@fontsource/geist-sans/600.css';
import '@fontsource/geist-sans/700.css';
import '@fontsource/geist-mono/400.css';
import '@fontsource/geist-mono/500.css';

import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
