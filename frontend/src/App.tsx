import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, CircularProgress } from '@mui/material';
import { darkTheme } from './theme/theme';

// Lazy load page components for code splitting
const HomePage = lazy(() => import('./pages/HomePage').then(module => ({ default: module.HomePage })));
const ErrorPage = lazy(() => import('./pages/ErrorPage').then(module => ({ default: module.ErrorPage })));
const ErrorTypesPage = lazy(() => import('./pages/ErrorTypesPage').then(module => ({ default: module.ErrorTypesPage })));
const MessageTypesPage = lazy(() => import('./pages/MessageTypesPage').then(module => ({ default: module.MessageTypesPage })));

// Loading fallback component
function LoadingFallback() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}
    >
      <CircularProgress />
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/error/:code" element={<ErrorPage />} />
            <Route path="/error-types" element={<ErrorTypesPage />} />
            <Route path="/message-types" element={<MessageTypesPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
