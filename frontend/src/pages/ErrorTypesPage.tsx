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
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PersonIcon from '@mui/icons-material/Person';
import RouteIcon from '@mui/icons-material/Route';
import GavelIcon from '@mui/icons-material/Gavel';
import ComputerIcon from '@mui/icons-material/Computer';
import DescriptionIcon from '@mui/icons-material/Description';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ERROR_TYPES } from '../data/errorTypes';
import type { ErrorType } from '../data/errorTypes';
import { useSEO } from '../hooks/useSEO';

const ICON_MAP: Record<string, React.ElementType> = {
  AccountBalance: AccountBalanceIcon,
  AttachMoney: AttachMoneyIcon,
  Person: PersonIcon,
  Route: RouteIcon,
  Gavel: GavelIcon,
  Computer: ComputerIcon,
  Description: DescriptionIcon,
  Schedule: ScheduleIcon,
};

const SEVERITY_COLOR = {
  fatal: 'error',
  temporary: 'warning',
  mixed: 'info',
} as const;

const ERROR_TYPES_SEO = {
  title: 'ISO 20022 Error Types Guide | Payment Error Categories',
  description:
    'Comprehensive guide to ISO 20022 error categories: Account, Amount, Party, Routing, Regulatory, System, Mandate, and Date/Time errors. Understand causes and resolution approaches.',
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'ISO 20022 Payment Error Types & Categories',
    description:
      'Complete reference guide for ISO 20022 payment error categories including Account (AC), Amount (AM), Party (BE), Routing (RC), Regulatory (RR), System (FF), Mandate (MD), and Date/Time (DT) errors.',
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

interface ErrorTypeCardProps {
  errorType: ErrorType;
  expanded: boolean;
  onToggle: () => void;
}

function ErrorTypeCard({ errorType, expanded, onToggle }: ErrorTypeCardProps) {
  const IconComponent = ICON_MAP[errorType.icon];

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
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
          <Box
            sx={{
              p: 1.5,
              bgcolor: 'primary.main',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconComponent sx={{ fontSize: 28, color: 'white' }} />
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" gutterBottom>
              {errorType.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {errorType.prefix.map((prefix) => (
                <Chip
                  key={prefix}
                  label={`${prefix}**`}
                  size="small"
                  sx={{ fontFamily: 'monospace', fontWeight: 600 }}
                />
              ))}
              <Chip
                label={errorType.severity}
                size="small"
                color={SEVERITY_COLOR[errorType.severity]}
                sx={{ textTransform: 'capitalize' }}
              />
            </Box>
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" paragraph>
          {errorType.description}
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
            {/* Common Codes */}
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Common Error Codes
            </Typography>
            <List dense sx={{ mb: 2 }}>
              {errorType.commonCodes.map((code) => (
                <ListItem key={code.code} disableGutters>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          component={Link}
                          to={`/error/${code.code}`}
                          sx={{
                            fontFamily: 'monospace',
                            fontWeight: 600,
                            color: 'primary.main',
                            textDecoration: 'none',
                            '&:hover': { textDecoration: 'underline' },
                          }}
                        >
                          {code.code}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          - {code.name}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>

            {/* Typical Causes */}
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Typical Causes
            </Typography>
            <List dense sx={{ mb: 2 }}>
              {errorType.typicalCauses.map((cause, idx) => (
                <ListItem key={idx} disableGutters>
                  <ListItemText
                    primary={
                      <Typography variant="body2" color="text.secondary">
                        • {cause}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>

            {/* Resolution Approach */}
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Resolution Approach
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {errorType.resolutionApproach}
            </Typography>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}

export const ErrorTypesPage = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useSEO(ERROR_TYPES_SEO);

  const handleToggle = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

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
              Error Types Guide
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Understanding ISO 20022 error categories
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ pt: 12, pb: 6 }}>
        {/* Introduction */}
        <Box sx={{ mb: 4, textAlign: 'center', maxWidth: 800, mx: 'auto' }}>
          <Typography variant="h4" component="h2" gutterBottom>
            ISO 20022 Error Categories
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            ISO 20022 payment errors are organized into 8 main categories based on the nature
            of the issue. Understanding these categories helps you quickly identify the root
            cause and resolve payment failures efficiently.
          </Typography>
        </Box>

        {/* Error Type Cards */}
        <Grid container spacing={3}>
          {ERROR_TYPES.map((errorType) => (
            <Grid key={errorType.id} size={{ xs: 12, md: 6 }}>
              <ErrorTypeCard
                errorType={errorType}
                expanded={expandedId === errorType.id}
                onToggle={() => handleToggle(errorType.id)}
              />
            </Grid>
          ))}
        </Grid>

        {/* Footer Info */}
        <Box sx={{ mt: 6, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Need Help With a Specific Error?
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
            to search 376+ ISO 20022 error codes with detailed explanations, causes, and
            fix steps.
          </Typography>
        </Box>
      </Container>
    </>
  );
};
