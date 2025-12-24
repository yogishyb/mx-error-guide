import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { Box, Grid, Pagination, Button, Typography, Stack } from '@mui/material';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import { ErrorCard } from './ErrorCard';
import type { PaymentError } from '../types/error';

interface ErrorListProps {
  errors: PaymentError[];
  onErrorClick: (error: PaymentError) => void;
}

const ITEMS_PER_PAGE = 12;

export const ErrorList: FC<ErrorListProps> = ({ errors, onErrorClick }) => {
  const [page, setPage] = useState(1);
  const [showAll, setShowAll] = useState(false);

  // Reset to page 1 when filters change (errors array changes)
  useEffect(() => {
    setPage(1);
  }, [errors]);

  const totalPages = Math.ceil(errors.length / ITEMS_PER_PAGE);
  const displayedErrors = showAll
    ? errors
    : errors.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

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
        <Typography variant="body2">Try a different search term or filter</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={2}>
        {displayedErrors.map((error) => (
          <Grid key={error.code} size={{ xs: 12, sm: 6, md: 4 }}>
            <ErrorCard error={error} onClick={onErrorClick} />
          </Grid>
        ))}
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
              page={page}
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
