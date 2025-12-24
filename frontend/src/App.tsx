import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, CircularProgress, Typography, Chip, Tooltip } from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
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
            py: 0.75,
            px: 2,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2,
            zIndex: 1000,
          }}
        >
          <Tooltip
            title="All processing happens locally in your browser. No data is transmitted to any server."
            arrow
            placement="top"
          >
            <Chip
              icon={<SecurityIcon sx={{ fontSize: 16 }} />}
              label="Zero-Trust Architecture"
              size="small"
              variant="outlined"
              sx={{
                borderColor: 'success.main',
                color: 'success.main',
                fontSize: '0.7rem',
                height: 24,
                '& .MuiChip-icon': { color: 'success.main' },
              }}
            />
          </Tooltip>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <VerifiedUserIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              Client-side only · No server transmission · GDPR compliant
            </Typography>
          </Box>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
