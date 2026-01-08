import { useState, type FC } from 'react';
import { Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  TextField,
  Select,
  MenuItem,
  Box,
  InputAdornment,
  FormControl,
  Chip,
  Button,
  Collapse,
  useMediaQuery,
  useTheme as useMuiTheme,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CodeIcon from '@mui/icons-material/Code';
import TuneIcon from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';
import { SupportUs } from './SupportUs';
import { AnimatedThemeToggle } from './AnimatedThemeToggle';
import type { FilterState, ErrorCategory, ErrorSeverity } from '../types/error';

interface HeaderProps {
  query: string;
  onQueryChange: (query: string) => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  resultCount: number;
  totalCount: number;
}

const CATEGORIES: ErrorCategory[] = [
  'Account',
  'Amount',
  'Party',
  'Routing',
  'Regulatory',
  'System',
  'Mandate',
  'Duplicate',
  'Cancellation',
  'Narrative',
  'Other',
];

const SEVERITIES: ErrorSeverity[] = ['fatal', 'temporary'];

export const Header: FC<HeaderProps> = ({
  query,
  onQueryChange,
  filters,
  onFiltersChange,
  resultCount,
  totalCount,
}) => {
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const [showFilters, setShowFilters] = useState(false);

  return (
    <AppBar position="fixed" elevation={0}>
      <Toolbar
        sx={{
          flexDirection: 'column',
          py: { xs: 1.5, md: 2 },
          gap: 1.5,
          minHeight: 'auto',
        }}
      >
        {/* Top Row: Title + Theme Toggle */}
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box>
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontSize: { xs: '1.125rem', md: '1.25rem' },
                fontWeight: 600,
                color: 'text.primary',
                letterSpacing: '-0.02em',
              }}
            >
              MX Error Guide
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: { xs: '0.7rem', md: '0.8rem' } }}
            >
              ISO 20022 payment error reference
            </Typography>
          </Box>

          {/* Theme Toggle */}
          <AnimatedThemeToggle size="small" variant="minimal" />
        </Box>

        {/* Command Bar Search */}
        <Box sx={{ width: '100%', maxWidth: 640, mx: 'auto' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search errors by code or keyword..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: '0.875rem',
              },
            }}
          />
        </Box>

        {/* Filters Row */}
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            alignItems: 'center',
            flexWrap: 'wrap',
            width: '100%',
            justifyContent: 'center',
          }}
        >
          {/* Mobile Filter Toggle */}
          {isMobile && (
            <IconButton
              onClick={() => setShowFilters(!showFilters)}
              size="small"
              sx={{
                color: showFilters ? 'primary.main' : 'text.secondary',
              }}
            >
              {showFilters ? <CloseIcon fontSize="small" /> : <TuneIcon fontSize="small" />}
            </IconButton>
          )}

          {/* Desktop Filters or Mobile Collapsed */}
          {(!isMobile || showFilters) && (
            <Collapse in={!isMobile || showFilters} sx={{ width: isMobile ? '100%' : 'auto' }}>
              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <FormControl size="small" sx={{ minWidth: 130 }}>
                  <Select
                    value={filters.category}
                    onChange={(e) =>
                      onFiltersChange({ ...filters, category: e.target.value as ErrorCategory | '' })
                    }
                    displayEmpty
                    sx={{ fontSize: '0.8125rem' }}
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {CATEGORIES.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select
                    value={filters.severity}
                    onChange={(e) =>
                      onFiltersChange({ ...filters, severity: e.target.value as ErrorSeverity | '' })
                    }
                    displayEmpty
                    sx={{ fontSize: '0.8125rem' }}
                  >
                    <MenuItem value="">All Severities</MenuItem>
                    {SEVERITIES.map((sev) => (
                      <MenuItem key={sev} value={sev} sx={{ textTransform: 'capitalize' }}>
                        {sev}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Chip
                  label={`${resultCount}/${totalCount}`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
                />

                <Button
                  component={Link}
                  to="/reference"
                  variant="text"
                  size="small"
                  startIcon={<MenuBookIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    fontSize: '0.8125rem',
                    color: 'text.primary',
                    fontWeight: 500,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1.5,
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.06)'
                        : 'rgba(0, 0, 0, 0.04)',
                    '&:hover': {
                      bgcolor: (theme) =>
                        theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.1)'
                          : 'rgba(0, 0, 0, 0.08)',
                    },
                  }}
                >
                  Reference
                </Button>

                <Button
                  component={Link}
                  to="/messages"
                  variant="text"
                  size="small"
                  startIcon={<CodeIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    fontSize: '0.8125rem',
                    color: 'text.primary',
                    fontWeight: 500,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1.5,
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.06)'
                        : 'rgba(0, 0, 0, 0.04)',
                    '&:hover': {
                      bgcolor: (theme) =>
                        theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.1)'
                          : 'rgba(0, 0, 0, 0.08)',
                    },
                  }}
                >
                  Messages
                </Button>

                <SupportUs variant="button" />
              </Box>
            </Collapse>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};
