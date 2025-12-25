import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { Box, Grid, Pagination, Button, Typography, Stack, alpha, useTheme } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import { ErrorCard } from './ErrorCard';
import type { PaymentError } from '../types/error';

// Linear Aesthetic animation config
// Note: staggerChildren is set dynamically based on item count
const getContainerVariants = (itemCount: number) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      // Reduce stagger for large lists to prevent long animation times
      // 12 items = 0.04s stagger, 903 items = ~0.002s stagger (max 2s total)
      staggerChildren: itemCount > 50 ? Math.min(0.04, 2 / itemCount) : 0.04,
      delayChildren: itemCount > 50 ? 0.05 : 0.1,
    },
  },
});

const itemVariants = {
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

interface ErrorListProps {
  errors: PaymentError[];
  onErrorClick: (error: PaymentError) => void;
}

const ITEMS_PER_PAGE = 12;

export const ErrorList: FC<ErrorListProps> = ({ errors, onErrorClick }) => {
  const [page, setPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const theme = useTheme();

  const totalPages = Math.ceil(errors.length / ITEMS_PER_PAGE);

  // Reset to page 1 when filters change (errors array changes)
  useEffect(() => {
    setPage(1);
  }, [errors.length]);

  // Ensure page is always valid
  const validPage = totalPages > 0 ? Math.min(page, totalPages) : 1;

  const displayedErrors = showAll
    ? errors
    : errors.slice((validPage - 1) * ITEMS_PER_PAGE, validPage * ITEMS_PER_PAGE);

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
          px: 2,
        }}
      >
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            mb: 3,
          }}
        >
          <Typography variant="h2" sx={{ opacity: 0.6 }}>
            🔍
          </Typography>
        </Box>
        <Typography
          variant="h5"
          sx={{
            mb: 1,
            fontWeight: 600,
            color: 'primary.main',
          }}
        >
          No errors found
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Try a different search term or filter
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <AnimatePresence mode="wait">
        <motion.div
          key={`page-${validPage}-${showAll}`}
          variants={getContainerVariants(displayedErrors.length)}
          initial="hidden"
          animate="visible"
        >
          <Grid container spacing={3}>
            {displayedErrors.map((error) => (
              <Grid key={error.code} size={{ xs: 12, sm: 6, md: 4 }}>
                <motion.div variants={itemVariants}>
                  <ErrorCard error={error} onClick={onErrorClick} />
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </AnimatePresence>

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
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: 2,
                  fontWeight: 500,
                  transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                  },
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    boxShadow:
                      theme.palette.mode === 'dark'
                        ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
                        : `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`,
                  },
                },
              }}
            />
          )}
          <Button
            variant="outlined"
            size="small"
            startIcon={showAll ? <ViewModuleIcon /> : <ViewListIcon />}
            onClick={() => {
              const newShowAll = !showAll;
              setShowAll(newShowAll);
              if (!newShowAll) setPage(1);
              // Always scroll to top when toggling Show All
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            sx={{
              borderRadius: 2,
              px: 2,
            }}
          >
            {showAll ? 'Paginate' : 'Show All'}
          </Button>
        </Stack>
      )}
    </Box>
  );
};
