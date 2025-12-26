import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Chip,
  Stack,
  Button,
  CircularProgress,
  Breadcrumbs,
  Divider,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import LinkIcon from '@mui/icons-material/Link';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import type { PaymentError } from '../types/error';
import { useSEO, generateErrorJsonLd, generateBreadcrumbJsonLd } from '../hooks/useSEO';

const BASE_URL = 'https://mx-error-guide.pages.dev';

// Linear Aesthetic animation config
const sectionVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 260,
      damping: 20,
    },
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

export const ErrorPage = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<PaymentError | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    const shareUrl = `${BASE_URL}/error/${code}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only navigate back if clicking the backdrop itself, not its children
    if (e.target === e.currentTarget) {
      navigate(-1); // Go back to previous page (could be Reference or Home)
    }
  };

  useEffect(() => {
    const fetchError = async () => {
      try {
        // Use Vite's BASE_URL to ensure correct path with base path config
        // Ensure trailing slash for proper path concatenation
        const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/');
        const response = await fetch(`${baseUrl}data/errors.json`);
        const json = await response.json();
        const errors: PaymentError[] = json.errors || json;
        const found = errors.find(
          (e) => e.code.toLowerCase() === code?.toLowerCase()
        );
        if (found) {
          setError(found);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchError();
  }, [code]);

  // SEO for found error
  useSEO(
    error
      ? {
          title: `${error.code} - ${error.name} | ISO 20022 Error Guide`,
          description: `Learn how to fix ${error.code} (${error.name}) ISO 20022 payment error. ${error.description.short}`,
          canonical: `${BASE_URL}/error/${error.code}`,
          ogImage: `${BASE_URL}/og-image.png`,
          ogUrl: `${BASE_URL}/error/${error.code}`,
          ogType: 'article',
          articleAuthor: 'MX Error Guide',
          articleModifiedTime: new Date().toISOString(),
          jsonLd: [
            generateErrorJsonLd({
              code: error.code,
              name: error.name,
              description: error.description.short,
              category: error.category,
            }),
            generateBreadcrumbJsonLd(error.code),
          ],
        }
      : {
          title: notFound
            ? 'Error Not Found | MX Error Guide'
            : 'Loading... | MX Error Guide',
          description: 'ISO 20022 payment error reference guide.',
        }
  );

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (notFound || !error) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="warning" sx={{ mb: 4 }}>
          Error code "{code}" not found in our database.
        </Alert>
        <Button
          component={Link}
          to="/"
          startIcon={<HomeIcon />}
          variant="contained"
        >
          Search All Errors
        </Button>
      </Container>
    );
  }

  const severityColor = error.severity === 'fatal' ? 'error' : 'warning';

  return (
    <Box
      onClick={handleBackdropClick}
      sx={{
        minHeight: '100vh',
        bgcolor: 'rgba(0, 0, 0, 0.5)',
        cursor: 'pointer',
      }}
    >
      <Container
        maxWidth="md"
        sx={{ py: 4, cursor: 'default' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close and Copy buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Breadcrumbs>
            <Link
              to="/"
              style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <HomeIcon fontSize="small" />
              Home
            </Link>
            <Typography color="text.primary">{error.code}</Typography>
          </Breadcrumbs>
          <Stack direction="row" spacing={1}>
            <Tooltip title={copied ? 'Copied!' : 'Copy link'}>
              <IconButton
                onClick={handleCopyLink}
                size="small"
                color={copied ? 'success' : 'default'}
                sx={{ bgcolor: 'background.paper' }}
              >
                {copied ? <CheckIcon /> : <LinkIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Close">
              <IconButton
                onClick={() => navigate(-1)}
                size="small"
                sx={{ bgcolor: 'background.paper' }}
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {/* Main Content */}
        <Paper sx={{ p: 4 }}>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Header */}
            <motion.div variants={sectionVariants}>
              <Box sx={{ mb: 4 }}>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <Chip label={error.category} color="primary" size="small" />
              <Chip
                label={error.severity}
                color={severityColor}
                size="small"
                sx={{ textTransform: 'capitalize' }}
              />
            </Stack>

            <Typography
              variant="h3"
              component="h1"
              sx={{ fontFamily: 'var(--font-mono, "Geist Mono", ui-monospace, monospace)', fontWeight: 700, mb: 1 }}
            >
              {error.code} - {error.name}
            </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            ISO 20022 Payment Error
          </Typography>
              </Box>
            </motion.div>

            <Divider sx={{ my: 3 }} />

            {/* Description */}
            <motion.div variants={sectionVariants}>
              <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <InfoIcon color="primary" /> What This Error Means
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 2 }}>
            {error.description.short}
          </Typography>
          {error.description.detailed && (
            <Alert severity="info" sx={{ '& .MuiAlert-message': { width: '100%' } }}>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {error.description.detailed}
              </Typography>
            </Alert>
          )}
              </Box>
            </motion.div>

            {/* Common Causes */}
            {error.common_causes && error.common_causes.length > 0 && (
              <motion.div variants={sectionVariants}>
                <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <ErrorOutlineIcon color="error" /> Common Causes
            </Typography>
            <Box component="ul" sx={{ pl: 3, m: 0 }}>
              {error.common_causes.map((cause, i) => (
                <Typography component="li" key={i} sx={{ mb: 1, lineHeight: 1.6 }}>
                  {cause}
                </Typography>
              ))}
            </Box>
                </Box>
              </motion.div>
            )}

            {/* Fix Steps */}
            {error.how_to_fix && error.how_to_fix.steps.length > 0 && (
              <motion.div variants={sectionVariants}>
                <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <CheckCircleIcon color="success" /> How to Fix
            </Typography>
            <Box component="ol" sx={{ pl: 3, m: 0 }}>
              {error.how_to_fix.steps.map((step: string, i: number) => (
                <Typography component="li" key={i} sx={{ mb: 1, lineHeight: 1.6 }}>
                  {step}
                </Typography>
              ))}
            </Box>
            {error.how_to_fix.prevention && (
              <Alert severity="success" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Prevention:</strong> {error.how_to_fix.prevention}
                </Typography>
              </Alert>
            )}
                </Box>
              </motion.div>
            )}

            {/* XPath Locations */}
            {error.xpath_locations && error.xpath_locations.length > 0 && (
              <motion.div variants={sectionVariants}>
                <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              XPath Locations
            </Typography>
            <Box
              sx={{
                fontFamily: 'var(--font-mono, "Geist Mono", ui-monospace, monospace)',
                fontSize: '0.8rem',
                bgcolor: 'background.default',
                p: 2,
                borderRadius: 1,
                overflow: 'auto',
              }}
            >
              {error.xpath_locations.map((path, i) => (
                <Typography key={i} variant="body2" sx={{ fontFamily: 'var(--font-mono, "Geist Mono", ui-monospace, monospace)' }}>
                  {path}
                </Typography>
              ))}
            </Box>
                </Box>
              </motion.div>
            )}

            {/* Message Types */}
            {error.message_types && error.message_types.length > 0 && (
              <motion.div variants={sectionVariants}>
                <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Applicable Message Types
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {error.message_types.map((type, i) => (
                <Chip
                  key={i}
                  label={type}
                  size="small"
                  sx={{ fontFamily: 'var(--font-mono, "Geist Mono", ui-monospace, monospace)', fontSize: '0.75rem' }}
                />
              ))}
            </Stack>
                </Box>
              </motion.div>
            )}

            {/* Resources */}
            {error.resources && error.resources.length > 0 && (
              <motion.div variants={sectionVariants}>
                <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Resources
            </Typography>
            <Stack spacing={1}>
              {error.resources.map((resource, i) => (
                <Button
                  key={i}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<LinkIcon />}
                  size="small"
                  sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                >
                  {resource.title} ({resource.type})
                </Button>
              ))}
            </Stack>
                </Box>
              </motion.div>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Back Button */}
            <motion.div variants={sectionVariants}>
              <Button
                onClick={() => navigate(-1)}
                startIcon={<ArrowBackIcon />}
                variant="outlined"
              >
                Back
              </Button>
            </motion.div>
          </motion.div>
        </Paper>
    </Container>
    </Box>
  );
};
