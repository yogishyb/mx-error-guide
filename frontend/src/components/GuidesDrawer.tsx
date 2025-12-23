import { useState } from 'react';
import type { FC } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Grid,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { MESSAGE_TYPES } from '../data/messageTypes';
import type { MessageType } from '../data/messageTypes';
import { MessageGuideCard } from './MessageGuideCard';
import { MessageGuideModal } from './MessageGuideModal';

interface GuidesDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const GuidesDrawer: FC<GuidesDrawerProps> = ({ open, onClose }) => {
  const [selectedGuide, setSelectedGuide] = useState<MessageType | null>(null);

  const handleGuideClick = (messageType: MessageType) => {
    setSelectedGuide(messageType);
  };

  const handleGuideClose = () => {
    setSelectedGuide(null);
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 500, md: 600 },
            bgcolor: 'background.default',
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box>
              <Typography variant="h5" fontWeight={600}>
                Message Type Guides
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Learn about common ISO 20022 message types
              </Typography>
            </Box>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Guide Cards */}
          <Grid container spacing={2}>
            {MESSAGE_TYPES.map((messageType) => (
              <Grid key={messageType.id} size={{ xs: 12 }}>
                <MessageGuideCard messageType={messageType} onClick={handleGuideClick} />
              </Grid>
            ))}
          </Grid>

          {/* Coming Soon */}
          <Box sx={{ mt: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Coming Soon
            </Typography>
            <Typography variant="body2" color="text.secondary">
              More message type guides: pacs.002 (Status Report), pacs.004 (Return),
              camt.052 (Intraday Report), camt.054 (Debit Credit Notification),
              pain.001 (Customer Credit Transfer Initiation)
            </Typography>
          </Box>
        </Box>
      </Drawer>

      {/* Guide Detail Modal */}
      <MessageGuideModal messageType={selectedGuide} onClose={handleGuideClose} />
    </>
  );
};
