import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, Box, CircularProgress, Typography, Chip, Tooltip } from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { ThemeProvider } from './context/ThemeContext';

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
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        gap: 2,
      }}
    >
      <CircularProgress size={32} />
      <Typography variant="body2" color="text.secondary">
        Loading...
      </Typography>
    </Box>
  );
}

// Privacy Footer Component
function PrivacyFooter() {
  return (
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
          icon={<SecurityIcon sx={{ fontSize: 14 }} />}
          label="Zero-Trust"
          size="small"
          variant="outlined"
          sx={{
            borderColor: 'success.main',
            color: 'success.main',
            fontSize: '0.7rem',
            height: 22,
            '& .MuiChip-icon': { color: 'success.main' },
          }}
        />
      </Tooltip>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <VerifiedUserIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
          Client-side only · GDPR compliant
        </Typography>
      </Box>
    </Box>
  );
}

function AppContent() {
  return (
    <>
      <CssBaseline />
      <BrowserRouter basename="/iso20022">
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
        <PrivacyFooter />
      </BrowserRouter>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
