import { memo } from 'react';
import type { FC } from 'react';
import { Card, CardContent, Typography, Chip, Box, Stack } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import type { MessageType } from '../data/messageTypes';

interface MessageGuideCardProps {
  messageType: MessageType;
  onClick: (messageType: MessageType) => void;
}

export const MessageGuideCard: FC<MessageGuideCardProps> = memo(({ messageType, onClick }) => {
  return (
    <Card
      onClick={() => onClick(messageType)}
      sx={{
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        height: '100%',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <DescriptionIcon color="primary" />
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontFamily: 'monospace',
              fontWeight: 600,
              color: 'primary.main',
            }}
          >
            {messageType.name}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {messageType.fullName}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            mb: 2,
            lineHeight: 1.5,
          }}
        >
          {messageType.description}
        </Typography>

        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
          <Chip label={messageType.category} size="small" color="primary" variant="outlined" />
          <Chip
            label={`${messageType.keyFields.length} fields`}
            size="small"
            variant="outlined"
            sx={{ opacity: 0.7 }}
          />
          <Chip
            label={`${messageType.commonErrors.length} errors`}
            size="small"
            variant="outlined"
            sx={{ opacity: 0.7 }}
          />
        </Stack>
      </CardContent>
    </Card>
  );
});

MessageGuideCard.displayName = 'MessageGuideCard';
