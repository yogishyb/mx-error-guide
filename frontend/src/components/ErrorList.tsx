import { useState, useEffect, useMemo } from 'react';
import type { FC, ReactNode } from 'react';
import { Box, Grid, Pagination, Button, Typography, Stack } from '@mui/material';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import { ErrorCard } from './ErrorCard';
import { InFeedAd } from './AdSense';
import { AD_SLOTS, AD_CONFIG } from '../config/adSlots';
import type { PaymentError } from '../types/error';

interface ErrorListProps {
  errors: PaymentError[];
  onErrorClick: (error: PaymentError) => void;
}

const ITEMS_PER_PAGE = 12;

export const ErrorList: FC<ErrorListProps> = ({ errors, onErrorClick }) => {
  const [page, setPage] = useState(1);
  const [showAll, setShowAll] = useState(false);

  const totalPages = Math.ceil(errors.length / ITEMS_PER_PAGE);

  // Reset to page 1 when filters change (errors array changes)
  // Using errors.length as additional dependency ensures reset on filter changes
  useEffect(() => {
    setPage(1);
  }, [errors.length]);

  // Ensure page is always valid (defensive fix for race conditions)
  const validPage = totalPages > 0 ? Math.min(page, totalPages) : 1;

  const displayedErrors = showAll
    ? errors
    : errors.slice((validPage - 1) * ITEMS_PER_PAGE, validPage * ITEMS_PER_PAGE);

  // Build grid items with inline ads inserted
  const gridItems = useMemo(() => {
    const items: ReactNode[] = [];
    const frequency = AD_CONFIG.IN_FEED_FREQUENCY;
    const minItems = AD_CONFIG.IN_FEED_MIN_ITEMS;
    const showInFeedAds = AD_CONFIG.ENABLE_IN_FEED && displayedErrors.length >= minItems;

    displayedErrors.forEach((error, index) => {
      // Add error card
      items.push(
        <Grid key={error.code} size={{ xs: 12, sm: 6, md: 4 }}>
          <ErrorCard error={error} onClick={onErrorClick} />
        </Grid>
      );

      // Insert ad after every N items (not at the end)
      if (showInFeedAds && (index + 1) % frequency === 0 && index < displayedErrors.length - 1) {
        items.push(
          <Grid key={`ad-${index}`} size={{ xs: 12 }}>
            <InFeedAd slot={AD_SLOTS.IN_FEED} />
          </Grid>
        );
      }
    });

    return items;
  }, [displayedErrors, onErrorClick]);

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (errors.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
          color: 'text.secondary',
        }}
      >
        <Typography variant="h4" sx={{ mb: 2, opacity: 0.5 }}>
          🔍
        </Typography>
        <Typography variant="h6">No errors found</Typography>
        <Typography variant="body2" sx={{ mb: 3 }}>Try a different search term or filter</Typography>

        {/* Ad shown during pause when no results */}
        {AD_CONFIG.ENABLE_NO_RESULTS && (
          <Box sx={{ mt: 4, maxWidth: 400, mx: 'auto' }}>
            <InFeedAd slot={AD_SLOTS.NO_RESULTS} />
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={2}>
        {gridItems}
      </Grid>

      {/* Pagination */}
      {errors.length > ITEMS_PER_PAGE && (
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={2}
          sx={{ mt: 4 }}
        >
          {!showAll && (
            <Pagination
              count={totalPages}
              page={validPage}
              onChange={handlePageChange}
              color="primary"
              shape="rounded"
            />
          )}
          <Button
            variant="outlined"
            size="small"
            startIcon={showAll ? <ViewModuleIcon /> : <ViewListIcon />}
            onClick={() => {
              setShowAll(!showAll);
              if (showAll) setPage(1);
            }}
          >
            {showAll ? 'Paginate' : 'Show All'}
          </Button>
        </Stack>
      )}
    </Box>
  );
};
