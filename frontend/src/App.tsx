import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, CircularProgress, Typography } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { darkTheme } from './theme/theme';

// Lazy load page components for code splitting
const HomePage = lazy(() => import('./pages/HomePage').then(module => ({ default: module.HomePage })));
const ErrorPage = lazy(() => import('./pages/ErrorPage').then(module => ({ default: module.ErrorPage })));
const ReferencePage = lazy(() => import('./pages/ReferencePage'));

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
            <Route path="/reference" element={<ReferencePage />} />
            {/* Redirects for old routes */}
            <Route path="/error-types" element={<Navigate to="/reference" replace />} />
            <Route path="/message-types" element={<Navigate to="/reference" replace />} />
          </Routes>
        </Suspense>

        {/* Privacy Footer */}
        <Box
          component="footer"
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: 'background.paper',
            borderTop: '1px solid',
            borderColor: 'divider',
            py: 1,
            px: 2,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 1,
            zIndex: 1000,
          }}
        >
          <LockIcon sx={{ fontSize: 16, color: 'success.main' }} />
          <Typography variant="caption" color="text.secondary">
            Your data never leaves your browser
          </Typography>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
