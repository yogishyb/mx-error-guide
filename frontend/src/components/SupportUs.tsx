import { useState } from 'react';
import type { FC } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  Link,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import GitHubIcon from '@mui/icons-material/GitHub';
import CoffeeIcon from '@mui/icons-material/LocalCafe';
import StarIcon from '@mui/icons-material/Star';
import CodeIcon from '@mui/icons-material/Code';
import BugReportIcon from '@mui/icons-material/BugReport';
import CloseIcon from '@mui/icons-material/Close';

interface SupportUsProps {
  variant?: 'button' | 'card';
}

export const SupportUs: FC<SupportUsProps> = ({ variant = 'button' }) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Contribution options
  const contributions = [
    {
      icon: <GitHubIcon />,
      title: 'Star on GitHub',
      description: 'Show your support with a star',
      action: 'https://github.com/yogishyb/mx-error-guide',
      type: 'link',
      color: 'default' as const,
    },
    {
      icon: <CodeIcon />,
      title: 'Contribute Code',
      description: 'Submit PRs for new features or fixes',
      action: 'https://github.com/yogishyb/mx-error-guide/pulls',
      type: 'link',
      color: 'primary' as const,
    },
    {
      icon: <BugReportIcon />,
      title: 'Report Issues',
      description: 'Found a bug? Let us know!',
      action: 'https://github.com/yogishyb/mx-error-guide/issues',
      type: 'link',
      color: 'warning' as const,
    },
  ];

  // Payment/donation options
  const payments = [
    {
      icon: <CoffeeIcon />,
      title: 'Buy Me a Coffee',
      description: 'One-time support',
      action: 'https://buymeacoffee.com/yogishaybk',
      amount: '$5',
    },
    {
      icon: <FavoriteIcon />,
      title: 'GitHub Sponsors',
      description: 'Monthly support',
      action: 'https://github.com/sponsors/mxerrorguide',
      amount: '$5/mo',
    },
  ];

  if (variant === 'button') {
    return (
      <>
        <Button
          variant="outlined"
          size="small"
          startIcon={<FavoriteIcon />}
          onClick={handleOpen}
          sx={{
            borderColor: 'error.main',
            color: 'error.main',
            '&:hover': {
              borderColor: 'error.dark',
              bgcolor: 'rgba(244, 67, 54, 0.08)',
            },
          }}
        >
          Support
        </Button>

        <SupportDialog open={open} onClose={handleClose} contributions={contributions} payments={payments} />
      </>
    );
  }

  return (
    <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 2 }}>
      <FavoriteIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
      <Typography variant="h6" gutterBottom>
        Support MX Error Guide
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Help us build more features and keep error lookup free.
      </Typography>

      <Stack spacing={2}>
        {/* Quick actions */}
        <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap>
          <Button
            variant="outlined"
            size="small"
            startIcon={<GitHubIcon />}
            href="https://github.com/yogishyb/mx-error-guide"
            target="_blank"
          >
            Star
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<CoffeeIcon />}
            href="https://buymeacoffee.com/yogishaybk"
            target="_blank"
            color="warning"
          >
            Donate
          </Button>
        </Stack>

        <Button variant="text" size="small" onClick={handleOpen}>
          More ways to help
        </Button>
      </Stack>

      <SupportDialog open={open} onClose={handleClose} contributions={contributions} payments={payments} />
    </Paper>
  );
};

interface SupportDialogProps {
  open: boolean;
  onClose: () => void;
  contributions: Array<{
    icon: React.ReactNode;
    title: string;
    description: string;
    action: string;
    type: string;
    color: 'default' | 'primary' | 'warning';
  }>;
  payments: Array<{
    icon: React.ReactNode;
    title: string;
    description: string;
    action: string;
    amount: string;
  }>;
}

const SupportDialog: FC<SupportDialogProps> = ({ open, onClose, contributions, payments }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FavoriteIcon color="error" />
          Support MX Error Guide
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Contribute Section */}
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Contribute
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Help improve MX Error Guide for the community
        </Typography>

        <Stack spacing={1.5} sx={{ mb: 3 }}>
          {contributions.map((item, i) => (
            <Button
              key={i}
              variant="outlined"
              href={item.action}
              target="_blank"
              startIcon={item.icon}
              sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
              fullWidth
            >
              <Box sx={{ flex: 1, textAlign: 'left' }}>
                <Typography variant="body2" fontWeight={500}>
                  {item.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.description}
                </Typography>
              </Box>
            </Button>
          ))}
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* Donate Section */}
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Support Financially
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Help us cover hosting costs and fund new features
        </Typography>

        <Stack spacing={1.5}>
          {payments.map((item, i) => (
            <Button
              key={i}
              variant="contained"
              href={item.action}
              target="_blank"
              startIcon={item.icon}
              sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
              fullWidth
              color="warning"
            >
              <Box sx={{ flex: 1, textAlign: 'left' }}>
                <Typography variant="body2" fontWeight={500}>
                  {item.title}
                </Typography>
                <Typography variant="caption">
                  {item.description}
                </Typography>
              </Box>
              <Chip label={item.amount} size="small" sx={{ ml: 1 }} />
            </Button>
          ))}
        </Stack>

        {/* Enterprise */}
        <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <StarIcon color="primary" />
            <Box>
              <Typography variant="body2" fontWeight={500}>
                Enterprise Support
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Need custom features or priority support?{' '}
                <Link href="mailto:enterprise@mxerrorguide.com" color="primary">
                  Contact us
                </Link>
              </Typography>
            </Box>
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions>
        <Typography variant="caption" color="text.secondary" sx={{ flex: 1, px: 2 }}>
          Error lookup is free. Advanced features coming soon.
        </Typography>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
