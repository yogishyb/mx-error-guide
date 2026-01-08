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
  IconButton,
  Popover,
  Stack,
  Button,
  useMediaQuery,
  useTheme as useMuiTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CodeIcon from '@mui/icons-material/Code';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
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

// Compact header height constant (used for spacer calculation)
export const HEADER_HEIGHT = 56;

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
  const isSmall = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const [filterAnchor, setFilterAnchor] = useState<HTMLButtonElement | null>(null);

  const hasActiveFilters = filters.category !== '' || filters.severity !== '';
  const filterOpen = Boolean(filterAnchor);

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterAnchor(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchor(null);
  };

  const clearFilters = () => {
    onFiltersChange({ category: '', severity: '' });
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        height: HEADER_HEIGHT,
        justifyContent: 'center',
      }}
    >
      <Toolbar
        sx={{
          minHeight: `${HEADER_HEIGHT}px !important`,
          height: HEADER_HEIGHT,
          px: { xs: 1.5, sm: 2 },
          gap: { xs: 1, sm: 2 },
        }}
      >
        {/* Left: Logo/Title */}
        <Box
          component={Link}
          to="/"
          sx={{
            textDecoration: 'none',
            color: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            flexShrink: 0,
          }}
        >
          <Typography
            variant="h6"
            component="span"
            sx={{
              fontSize: { xs: '0.9rem', sm: '1rem' },
              fontWeight: 700,
              color: 'text.primary',
              letterSpacing: '-0.02em',
              whiteSpace: 'nowrap',
            }}
          >
            {isSmall ? 'MX' : 'MX Error Guide'}
          </Typography>
        </Box>

        {/* Center: Search */}
        <TextField
          size="small"
          placeholder={isSmall ? 'Search...' : 'Search errors by code or keyword...'}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          sx={{
            flex: 1,
            maxWidth: { xs: 'none', md: 480 },
            '& .MuiOutlinedInput-root': {
              height: 36,
              fontSize: '0.8125rem',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(0, 0, 0, 0.03)',
              '& fieldset': {
                borderColor: 'transparent',
              },
              '&:hover fieldset': {
                borderColor: 'divider',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'primary.main',
                borderWidth: 1,
              },
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                </InputAdornment>
              ),
            },
          }}
        />

        {/* Right: Actions */}
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexShrink: 0 }}>
          {/* Result Count Chip - desktop only */}
          {!isMobile && (
            <Chip
              label={`${resultCount}/${totalCount}`}
              size="small"
              variant="outlined"
              sx={{
                height: 24,
                fontSize: '0.7rem',
                borderColor: 'divider',
                '& .MuiChip-label': { px: 1 },
              }}
            />
          )}

          {/* Filter Button */}
          <IconButton
            size="small"
            onClick={handleFilterClick}
            sx={{
              color: hasActiveFilters ? 'primary.main' : 'text.secondary',
              bgcolor: hasActiveFilters
                ? (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(94, 106, 210, 0.15)'
                      : 'rgba(94, 106, 210, 0.1)'
                : 'transparent',
              '&:hover': {
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(0, 0, 0, 0.06)',
              },
            }}
          >
            <TuneIcon sx={{ fontSize: 20 }} />
          </IconButton>

          {/* Nav Links - desktop only */}
          {!isMobile && (
            <>
              <IconButton
                component={Link}
                to="/reference"
                size="small"
                sx={{ color: 'text.secondary' }}
                title="Reference Guide"
              >
                <MenuBookIcon sx={{ fontSize: 20 }} />
              </IconButton>
              <IconButton
                component={Link}
                to="/messages"
                size="small"
                sx={{ color: 'text.secondary' }}
                title="Message Definitions"
              >
                <CodeIcon sx={{ fontSize: 20 }} />
              </IconButton>
              <IconButton
                component={Link}
                to="/glossary"
                size="small"
                sx={{ color: 'text.secondary' }}
                title="Financial Glossary"
              >
                <AutoStoriesIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </>
          )}

          {/* Theme Toggle */}
          <AnimatedThemeToggle size="small" variant="minimal" />
        </Stack>
      </Toolbar>

      {/* Filter Popover */}
      <Popover
        open={filterOpen}
        anchorEl={filterAnchor}
        onClose={handleFilterClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              p: 2,
              minWidth: 240,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            },
          },
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ mb: 1.5, fontWeight: 600, color: 'text.primary' }}
        >
          Filters
        </Typography>

        <Stack spacing={1.5}>
          <FormControl size="small" fullWidth>
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

          <FormControl size="small" fullWidth>
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

          {hasActiveFilters && (
            <Button
              size="small"
              onClick={clearFilters}
              sx={{ alignSelf: 'flex-start', fontSize: '0.75rem' }}
            >
              Clear filters
            </Button>
          )}

          {/* Mobile nav links */}
          {isMobile && (
            <>
              <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 1.5, mt: 0.5 }}>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', fontWeight: 600, mb: 1, display: 'block' }}
                >
                  Navigation
                </Typography>
                <Stack spacing={0.5}>
                  <Button
                    component={Link}
                    to="/reference"
                    size="small"
                    startIcon={<MenuBookIcon sx={{ fontSize: 16 }} />}
                    sx={{ justifyContent: 'flex-start', color: 'text.primary' }}
                    onClick={handleFilterClose}
                  >
                    Reference Guide
                  </Button>
                  <Button
                    component={Link}
                    to="/messages"
                    size="small"
                    startIcon={<CodeIcon sx={{ fontSize: 16 }} />}
                    sx={{ justifyContent: 'flex-start', color: 'text.primary' }}
                    onClick={handleFilterClose}
                  >
                    Messages
                  </Button>
                  <Button
                    component={Link}
                    to="/glossary"
                    size="small"
                    startIcon={<AutoStoriesIcon sx={{ fontSize: 16 }} />}
                    sx={{ justifyContent: 'flex-start', color: 'text.primary' }}
                    onClick={handleFilterClose}
                  >
                    Glossary
                  </Button>
                </Stack>
              </Box>

              {/* Result count for mobile */}
              <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 1.5, mt: 0.5 }}>
                <Chip
                  label={`Showing ${resultCount} of ${totalCount} errors`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
              </Box>
            </>
          )}
        </Stack>
      </Popover>
    </AppBar>
  );
};
