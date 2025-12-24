import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { MESSAGE_TYPES } from '../data/messageTypes';
import type { MessageType } from '../data/messageTypes';
import { useSEO } from '../hooks/useSEO';

const MESSAGE_TYPES_SEO = {
  title: 'ISO 20022 Message Types Guide | pacs.008, pacs.004, pacs.002, camt.053, camt.054',
  description:
    'Complete guide to free ISO 20022 message types: pacs.008 (Customer Credit Transfer), pacs.004 (Payment Return), pacs.002 (Status Report), camt.053 (Statement), camt.054 (Notification).',
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'ISO 20022 Message Types Reference',
    description:
      'Detailed reference for ISO 20022 payment message types including pacs.008, pacs.004, pacs.002, camt.053, and camt.054 with key fields, use cases, and related error codes.',
    author: {
      '@type': 'Organization',
      name: 'MX Error Guide',
    },
    publisher: {
      '@type': 'Organization',
      name: 'MX Error Guide',
    },
  },
};

const CATEGORY_COLORS: Record<string, string> = {
  'Payments Clearing and Settlement': 'primary',
  'Cash Management': 'secondary',
};

interface MessageTypeCardProps {
  messageType: MessageType;
  expanded: boolean;
  onToggle: () => void;
}

function MessageTypeCard({ messageType, expanded, onToggle }: MessageTypeCardProps) {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography
              variant="h5"
              component="h3"
              sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main', mb: 0.5 }}
            >
              {messageType.name}
            </Typography>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              {messageType.fullName}
            </Typography>
          </Box>
          <Chip
            label={messageType.category}
            size="small"
            color={CATEGORY_COLORS[messageType.category] as any || 'default'}
            sx={{ mt: 0.5 }}
          />
        </Box>

        <Typography variant="body2" color="text.secondary" paragraph>
          {messageType.description}
        </Typography>

        <Button
          onClick={onToggle}
          endIcon={
            <ExpandMoreIcon
              sx={{
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
              }}
            />
          }
          sx={{ mb: 1 }}
        >
          {expanded ? 'Show Less' : 'Show Details'}
        </Button>

        <Collapse in={expanded}>
          <Box sx={{ mt: 2 }}>
            {/* Use Cases */}
            <Typography variant="subtitle2" color="primary" gutterBottom>
              When It's Used
            </Typography>
            <List dense sx={{ mb: 2 }}>
              {messageType.useCases.map((useCase, idx) => (
                <ListItem key={idx} disableGutters>
                  <ListItemText
                    primary={
                      <Typography variant="body2" color="text.secondary">
                        • {useCase}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>

            <Divider sx={{ my: 2 }} />

            {/* Key Fields */}
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Key Fields ({messageType.keyFields.length} total)
            </Typography>
            <List dense sx={{ mb: 2 }}>
              {messageType.keyFields.slice(0, 8).map((field, idx) => (
                <ListItem key={idx} disableGutters>
                  <ListItemText
                    primary={
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {field.name}
                          {field.required && (
                            <Chip label="Required" size="small" sx={{ ml: 1, height: 18, fontSize: '0.65rem' }} />
                          )}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          {field.description}
                        </Typography>
                        {field.commonErrors && field.commonErrors.length > 0 && (
                          <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 0.5 }}>
                            Common errors: {field.commonErrors.join(', ')}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
              {messageType.keyFields.length > 8 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  ... and {messageType.keyFields.length - 8} more fields
                </Typography>
              )}
            </List>

            <Divider sx={{ my: 2 }} />

            {/* Common Errors */}
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Related Error Codes
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {messageType.commonErrors.map((error, idx) => {
                const code = error.split(' - ')[0];
                return (
                  <Chip
                    key={idx}
                    label={error}
                    size="small"
                    component={Link}
                    to={`/error/${code}`}
                    clickable
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      '&:hover': { bgcolor: 'primary.dark' },
                    }}
                  />
                );
              })}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Related Messages */}
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Related Message Types
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {messageType.relatedMessages.map((relatedMsg) => (
                <Chip
                  key={relatedMsg}
                  label={relatedMsg}
                  size="small"
                  variant="outlined"
                  sx={{ fontFamily: 'monospace' }}
                />
              ))}
            </Box>

            {/* Example XPath */}
            <Box sx={{ mt: 2, p: 1.5, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Example XPath:
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'success.main', mt: 0.5 }}
              >
                {messageType.exampleXPath}
              </Typography>
            </Box>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}

export const MessageTypesPage = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useSEO(MESSAGE_TYPES_SEO);

  const handleToggle = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Separate message types by category
  const paymentMessages = MESSAGE_TYPES.filter(
    (mt) => mt.category === 'Payments Clearing and Settlement'
  );
  const cashManagementMessages = MESSAGE_TYPES.filter((mt) => mt.category === 'Cash Management');

  return (
    <>
      {/* Header */}
      <AppBar
        position="fixed"
        sx={{
          bgcolor: 'rgba(10, 10, 15, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          <IconButton
            component={Link}
            to="/"
            edge="start"
            sx={{ mr: 2 }}
            aria-label="back to home"
          >
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h6" component="h1">
              Message Types Guide
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ISO 20022 payment and cash management messages
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ pt: 12, pb: 6 }}>
        {/* Introduction */}
        <Box sx={{ mb: 4, textAlign: 'center', maxWidth: 800, mx: 'auto' }}>
          <Typography variant="h4" component="h2" gutterBottom>
            ISO 20022 Message Types
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            ISO 20022 messages are standardized XML messages used for payment processing, cash
            management, and financial reporting. Each message type has a specific purpose and
            structure. Here are the 5 most commonly used message types.
          </Typography>
        </Box>

        {/* Payment Messages */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
            Payment Messages (pacs)
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Used for interbank payment clearing and settlement
          </Typography>
          <Grid container spacing={3}>
            {paymentMessages.map((messageType) => (
              <Grid key={messageType.id} size={{ xs: 12 }}>
                <MessageTypeCard
                  messageType={messageType}
                  expanded={expandedId === messageType.id}
                  onToggle={() => handleToggle(messageType.id)}
                />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Cash Management Messages */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
            Cash Management Messages (camt)
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Used for account reporting and transaction notifications
          </Typography>
          <Grid container spacing={3}>
            {cashManagementMessages.map((messageType) => (
              <Grid key={messageType.id} size={{ xs: 12 }}>
                <MessageTypeCard
                  messageType={messageType}
                  expanded={expandedId === messageType.id}
                  onToggle={() => handleToggle(messageType.id)}
                />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Footer Info */}
        <Box sx={{ mt: 6, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Troubleshooting Message Errors?
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Use our{' '}
            <Typography
              component={Link}
              to="/"
              sx={{ color: 'primary.main', textDecoration: 'none' }}
            >
              error code lookup tool
            </Typography>{' '}
            to find detailed explanations and fix steps for any error code returned in these
            messages. Or check the{' '}
            <Typography
              component={Link}
              to="/error-types"
              sx={{ color: 'primary.main', textDecoration: 'none' }}
            >
              error categories guide
            </Typography>{' '}
            to understand error types.
          </Typography>
        </Box>
      </Container>
    </>
  );
};
