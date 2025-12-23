import { useState } from 'react';
import type { FC } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Chip,
  Stack,
  Tabs,
  Tab,
  Button,
  Link,
  Snackbar,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LinkIcon from '@mui/icons-material/Link';
import CheckIcon from '@mui/icons-material/Check';
import PersonIcon from '@mui/icons-material/Person';
import CodeIcon from '@mui/icons-material/Code';
import type { PaymentError } from '../types/error';
import { generateExplanations } from '../utils/explanations';
import { setUrlHash } from '../hooks/useErrors';

interface ErrorModalProps {
  error: PaymentError | null;
  onClose: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

const TabPanel: FC<TabPanelProps> = ({ children, value, index }) => (
  <Box role="tabpanel" hidden={value !== index} sx={{ pt: 2 }}>
    {value === index && children}
  </Box>
);

export const ErrorModal: FC<ErrorModalProps> = ({ error, onClose }) => {
  const [tabValue, setTabValue] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!error) return null;

  const explanations = generateExplanations(error);
  const shareUrl = `${window.location.origin}${window.location.pathname}#${error.code}`;

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleClose = () => {
    setUrlHash(null);
    onClose();
  };

  return (
    <>
      <Dialog
        open={!!error}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            backgroundImage: 'none',
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, pb: 1 }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h5"
              component="div"
              sx={{ fontFamily: 'monospace', fontWeight: 600, color: 'primary.main' }}
            >
              {error.code}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 500, mt: 0.5 }}>
              {error.name}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            size="small"
            startIcon={copied ? <CheckIcon /> : <LinkIcon />}
            onClick={handleShare}
            color={copied ? 'success' : 'primary'}
          >
            {copied ? 'Copied!' : 'Share'}
          </Button>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {/* Description */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {error.description.detailed}
            </Typography>
          </Box>

          {/* Explanation Tabs */}
          <Box sx={{ mb: 3, bgcolor: 'background.default', borderRadius: 1, p: 2 }}>
            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 1 }}>
              <Tab icon={<PersonIcon />} iconPosition="start" label="For Operations" />
              <Tab icon={<CodeIcon />} iconPosition="start" label="For Developers" />
            </Tabs>
            <TabPanel value={tabValue} index={0}>
              <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                {explanations.forOps}
              </Typography>
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'monospace',
                  bgcolor: 'background.paper',
                  p: 2,
                  borderRadius: 1,
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.6,
                }}
              >
                {explanations.forDevs}
              </Typography>
            </TabPanel>
          </Box>

          {/* Common Causes */}
          {error.common_causes.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Common Causes
              </Typography>
              <List dense disablePadding>
                {error.common_causes.map((cause, i) => (
                  <ListItem key={i} sx={{ py: 0.5 }}>
                    <ListItemText primary={cause} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* How to Fix */}
          {error.how_to_fix.steps.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                How to Fix
              </Typography>
              <List dense disablePadding>
                {error.how_to_fix.steps.map((step, i) => (
                  <ListItem key={i} sx={{ py: 0.5 }}>
                    <ListItemText primary={`${i + 1}. ${step}`} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Prevention */}
          {error.how_to_fix.prevention && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Prevention
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {error.how_to_fix.prevention}
              </Typography>
            </Box>
          )}

          {/* XPath */}
          {error.xpath_locations.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                XPath Location
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'monospace',
                  bgcolor: 'background.default',
                  p: 1.5,
                  borderRadius: 1,
                }}
              >
                {error.xpath_locations[0]}
              </Typography>
            </Box>
          )}

          {/* Tags */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Applies To
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {error.message_types.map((type) => (
                <Chip key={type} label={type} size="small" />
              ))}
              {error.market_practices.map((practice) => (
                <Chip key={practice} label={practice} size="small" variant="outlined" />
              ))}
            </Stack>
          </Box>

          {/* Resources */}
          {error.resources.length > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Resources
              </Typography>
              <Stack spacing={1}>
                {error.resources.map((resource, i) => (
                  <Link
                    key={i}
                    href={resource.url}
                    target="_blank"
                    rel="noopener"
                    underline="hover"
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    {resource.title}
                    <Chip label={resource.type} size="small" variant="outlined" />
                  </Link>
                ))}
              </Stack>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        message="Link copied to clipboard"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
};
