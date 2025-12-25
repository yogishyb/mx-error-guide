import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { Fab, Zoom, Box, Tooltip, alpha, useTheme as useMuiTheme } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import FeedbackIcon from '@mui/icons-material/Feedback';
import { useTheme } from '../context/ThemeContext';

export const FloatingActions: FC = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const { mode } = useTheme();
  const muiTheme = useMuiTheme();

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const feedbackEmail = 'yogishayb2@gmail.com';
  const feedbackSubject = 'MX Error Guide Feedback';
  const feedbackBody = 'Thank you for your feedback!\n\nPlease share your thoughts:\n';
  const feedbackUrl = `mailto:${feedbackEmail}?subject=${encodeURIComponent(feedbackSubject)}&body=${encodeURIComponent(feedbackBody)}`;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 56, // Above privacy footer
        right: { xs: 16, md: 24 },
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        zIndex: 1000,
      }}
    >
      {/* Back to Top */}
      <Zoom in={showBackToTop}>
        <Tooltip title="Back to top" placement="left">
          <Fab
            size="small"
            onClick={scrollToTop}
            aria-label="back to top"
            sx={{
              bgcolor: alpha(muiTheme.palette.background.paper, 0.9),
              backdropFilter: 'blur(8px)',
              border: `1px solid ${alpha(muiTheme.palette.divider, 0.5)}`,
              color: 'text.primary',
              '&:hover': {
                bgcolor: alpha(muiTheme.palette.background.paper, 1),
                borderColor: muiTheme.palette.primary.main,
                transform: 'translateY(-2px)',
                boxShadow: mode === 'dark'
                  ? `0 8px 16px ${alpha(muiTheme.palette.primary.main, 0.2)}`
                  : `0 8px 16px ${alpha(muiTheme.palette.primary.main, 0.15)}`,
              },
            }}
          >
            <KeyboardArrowUpIcon />
          </Fab>
        </Tooltip>
      </Zoom>

      {/* Feedback */}
      <Tooltip title="Send Feedback" placement="left">
        <Fab
          color="primary"
          href={feedbackUrl}
          component="a"
          aria-label="send feedback"
          sx={{
            bgcolor: muiTheme.palette.primary.main,
            backdropFilter: 'blur(8px)',
            boxShadow: mode === 'dark'
              ? `0 4px 12px ${alpha(muiTheme.palette.primary.main, 0.3)}`
              : `0 4px 12px ${alpha(muiTheme.palette.primary.main, 0.25)}`,
            '&:hover': {
              bgcolor: muiTheme.palette.primary.dark,
              transform: 'translateY(-2px) scale(1.05)',
              boxShadow: mode === 'dark'
                ? `0 8px 20px ${alpha(muiTheme.palette.primary.main, 0.4)}`
                : `0 8px 20px ${alpha(muiTheme.palette.primary.main, 0.35)}`,
            },
          }}
        >
          <FeedbackIcon />
        </Fab>
      </Tooltip>
    </Box>
  );
};
