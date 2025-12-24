import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { Fab, Zoom, Box, Tooltip } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import FeedbackIcon from '@mui/icons-material/Feedback';

export const FloatingActions: FC = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);

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
        right: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        zIndex: 1000,
      }}
    >
      {/* Back to Top */}
      <Zoom in={showBackToTop}>
        <Tooltip title="Back to top" placement="left">
          <Fab size="small" color="default" onClick={scrollToTop} aria-label="back to top">
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
            '&:hover': {
              transform: 'scale(1.05)',
            },
          }}
        >
          <FeedbackIcon />
        </Fab>
      </Tooltip>
    </Box>
  );
};
