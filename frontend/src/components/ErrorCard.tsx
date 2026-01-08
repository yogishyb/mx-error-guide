import { memo } from 'react';
import type { FC } from 'react';
import { Card, CardContent, Typography, Chip, Box, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import type { PaymentError } from '../types/error';

interface ErrorCardProps {
  error: PaymentError;
  onClick: (error: PaymentError) => void;
}

// Linear Aesthetic spring animation config
const springConfig = {
  type: 'spring' as const,
  stiffness: 260,
  damping: 20,
};

const getSeverityColor = (severity: string) => {
  return severity === 'fatal' ? 'error' : 'warning';
};

// Motion-wrapped Card for animations
const MotionCard = motion.create(Card);

export const ErrorCard: FC<ErrorCardProps> = memo(({ error, onClick }) => {
  return (
    <MotionCard
      onClick={() => onClick(error)}
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={springConfig}
      sx={{
        cursor: 'pointer',
        // Linear Aesthetic: 1px precision border
        border: '1px solid',
        borderColor: (theme) =>
          theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.08)'
            : 'rgba(0, 0, 0, 0.06)',
        // Top-lit edge effect
        boxShadow: (theme) =>
          theme.palette.mode === 'dark'
            ? 'inset 0 1px 0 rgba(255, 255, 255, 0.06)'
            : 'inset 0 1px 0 rgba(255, 255, 255, 0.8)',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? 'inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 4px 12px rgba(94, 106, 210, 0.15)'
              : 'inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 4px 12px rgba(94, 106, 210, 0.08)',
        },
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        {/* Header Row */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 1,
          }}
        >
          <Typography
            variant="h6"
            component="div"
            sx={{
              // Geist Mono for code elements (Linear Aesthetic)
              fontFamily: 'var(--font-mono, "Geist Mono", ui-monospace, monospace)',
              fontWeight: 600,
              fontSize: '0.95rem',
              color: 'primary.main',
              letterSpacing: '-0.01em',
            }}
          >
            {error.code}
          </Typography>
          <Chip
            label={error.severity}
            size="small"
            color={getSeverityColor(error.severity)}
            sx={{
              textTransform: 'capitalize',
              fontWeight: 500,
              fontSize: '0.7rem',
              height: 20,
            }}
          />
        </Box>

        {/* Error Name */}
        <Typography
          variant="body1"
          sx={{
            fontWeight: 500,
            mb: 0.5,
            color: 'text.primary',
            fontSize: '0.875rem',
          }}
        >
          {error.name}
        </Typography>

        {/* Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            mb: 1.5,
            fontSize: '0.8rem',
            lineHeight: 1.5,
          }}
        >
          {error.description.short}
        </Typography>

        {/* Tags - Linear Aesthetic: high-density metadata */}
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
          <Chip
            label={error.category}
            size="small"
            sx={{
              fontSize: '0.65rem',
              height: 20,
              fontWeight: 500,
              bgcolor: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.06)'
                  : 'rgba(0, 0, 0, 0.04)',
              border: 'none',
              '& .MuiChip-label': { px: 1 },
            }}
          />
          {error.message_types.slice(0, 2).map((type) => (
            <Chip
              key={type}
              label={type}
              size="small"
              sx={{
                fontSize: '0.65rem',
                height: 20,
                fontFamily: 'var(--font-mono)',
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.04)'
                    : 'rgba(0, 0, 0, 0.02)',
                border: 'none',
                color: 'text.secondary',
                '& .MuiChip-label': { px: 1 },
              }}
            />
          ))}
          {error.message_types.length > 2 && (
            <Chip
              label={`+${error.message_types.length - 2}`}
              size="small"
              sx={{
                fontSize: '0.65rem',
                height: 20,
                bgcolor: 'transparent',
                border: 'none',
                color: 'text.disabled',
                '& .MuiChip-label': { px: 0.5 },
              }}
            />
          )}
        </Stack>
      </CardContent>
    </MotionCard>
  );
});

ErrorCard.displayName = 'ErrorCard';
