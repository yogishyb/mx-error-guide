import { memo } from 'react';
import type { FC } from 'react';
import { Card, CardContent, Typography, Chip, Box, Stack } from '@mui/material';
import type { PaymentError } from '../types/error';

interface ErrorCardProps {
  error: PaymentError;
  onClick: (error: PaymentError) => void;
}

const getSeverityColor = (severity: string) => {
  return severity === 'fatal' ? 'error' : 'warning';
};

export const ErrorCard: FC<ErrorCardProps> = memo(({ error, onClick }) => {
  return (
    <Card
      onClick={() => onClick(error)}
      sx={{
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontFamily: 'monospace',
              fontWeight: 600,
              color: 'primary.main',
            }}
          >
            {error.code}
          </Typography>
          <Chip
            label={error.severity}
            size="small"
            color={getSeverityColor(error.severity)}
            sx={{ textTransform: 'capitalize' }}
          />
        </Box>

        <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
          {error.name}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            mb: 1.5,
          }}
        >
          {error.description.short}
        </Typography>

        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
          <Chip label={error.category} size="small" variant="outlined" />
          {error.message_types.slice(0, 2).map((type) => (
            <Chip key={type} label={type} size="small" variant="outlined" sx={{ opacity: 0.7 }} />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
});

ErrorCard.displayName = 'ErrorCard';
