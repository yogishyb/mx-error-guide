import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  Stack,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface NewsletterSignupProps {
  variant?: 'inline' | 'card';
}

export const NewsletterSignup: FC<NewsletterSignupProps> = ({ variant = 'card' }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    setStatus('loading');

    // For now, open mailto link (can be replaced with actual API)
    // Options for integration:
    // 1. Buttondown: https://buttondown.email/api/emails/embed-subscribe/YOUR_USERNAME
    // 2. Mailchimp: Use their embedded form action URL
    // 3. ConvertKit: Use their form action URL
    // 4. Custom backend endpoint

    try {
      // Simulate success for demo (replace with actual API call)
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Track with Plausible
      if (typeof window !== 'undefined' && (window as unknown as { plausible?: (event: string) => void }).plausible) {
        (window as unknown as { plausible: (event: string) => void }).plausible('Newsletter Signup');
      }

      setStatus('success');
      setMessage('Thanks for subscribing! Check your email to confirm.');
      setEmail('');
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <CheckCircleIcon color="success" sx={{ fontSize: 48, mb: 1 }} />
        <Typography variant="body1" color="success.main">
          {message}
        </Typography>
      </Box>
    );
  }

  if (variant === 'inline') {
    return (
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <TextField
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          size="small"
          sx={{ minWidth: 200, flex: 1 }}
          disabled={status === 'loading'}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={status === 'loading'}
          startIcon={<EmailIcon />}
        >
          {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
        </Button>
        {status === 'error' && (
          <Alert severity="error" sx={{ width: '100%', mt: 1 }}>
            {message}
          </Alert>
        )}
      </Box>
    );
  }

  return (
    <Paper
      sx={{
        p: 3,
        textAlign: 'center',
        bgcolor: 'background.paper',
        borderRadius: 2,
      }}
    >
      <EmailIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
      <Typography variant="h6" gutterBottom>
        Stay Updated on ISO 20022
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Get notified about new error codes, message guides, and validation tips.
        No spam, unsubscribe anytime.
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            size="small"
            fullWidth
            disabled={status === 'loading'}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={status === 'loading'}
            startIcon={<EmailIcon />}
          >
            {status === 'loading' ? 'Subscribing...' : 'Subscribe to Updates'}
          </Button>
        </Stack>

        {status === 'error' && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {message}
          </Alert>
        )}
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
        Join 0+ payment professionals (we just launched!)
      </Typography>
    </Paper>
  );
};
