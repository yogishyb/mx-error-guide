import type { FC } from 'react';
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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { SupportUs } from './SupportUs';
import type { FilterState, ErrorCategory, ErrorSeverity } from '../types/error';

interface HeaderProps {
  query: string;
  onQueryChange: (query: string) => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  resultCount: number;
  totalCount: number;
  onGuidesClick: () => void;
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
  onGuidesClick,
}) => {
  return (
    <AppBar
      position="fixed"
      sx={{
        bgcolor: 'rgba(10, 10, 15, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Toolbar sx={{ flexDirection: 'column', py: 2, gap: 1.5 }}>
        {/* Title */}
        <Box sx={{ textAlign: 'center', mb: 1 }}>
          <Typography variant="h1" component="h1" sx={{ fontSize: '1.5rem' }}>
            MX Error Guide
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Instant clarity on ISO 20022 payment errors
          </Typography>
        </Box>

        {/* Search Box */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search by code (AC04) or keyword (frozen account, swift error)..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ maxWidth: 600 }}
        />

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={filters.category}
              onChange={(e) =>
                onFiltersChange({ ...filters, category: e.target.value as ErrorCategory | '' })
              }
              displayEmpty
            >
              <MenuItem value="">All Categories</MenuItem>
              {CATEGORIES.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 130 }}>
            <Select
              value={filters.severity}
              onChange={(e) =>
                onFiltersChange({ ...filters, severity: e.target.value as ErrorSeverity | '' })
              }
              displayEmpty
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
            label={`${resultCount} of ${totalCount} errors`}
            size="small"
            variant="outlined"
            sx={{ borderColor: 'primary.main' }}
          />

          <Button
            variant="outlined"
            size="small"
            startIcon={<MenuBookIcon />}
            onClick={onGuidesClick}
            sx={{ ml: 1 }}
          >
            Guides
          </Button>

          <SupportUs variant="button" />
        </Box>
      </Toolbar>
    </AppBar>
  );
};
