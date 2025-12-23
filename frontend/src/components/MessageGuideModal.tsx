import { useState } from 'react';
import type { FC } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Chip,
  Stack,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import LinkIcon from '@mui/icons-material/Link';
import CodeIcon from '@mui/icons-material/Code';
import type { MessageType } from '../data/messageTypes';

interface MessageGuideModalProps {
  messageType: MessageType | null;
  onClose: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

const TabPanel: FC<TabPanelProps> = ({ children, value, index }) => (
  <Box role="tabpanel" hidden={value !== index} sx={{ pt: 2 }}>
    {value === index && children}
  </Box>
);

export const MessageGuideModal: FC<MessageGuideModalProps> = ({ messageType, onClose }) => {
  const [tabValue, setTabValue] = useState(0);

  if (!messageType) return null;

  return (
    <Dialog
      open={!!messageType}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'background.paper',
          backgroundImage: 'none',
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, pb: 1 }}>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h5"
            component="div"
            sx={{ fontFamily: 'monospace', fontWeight: 600, color: 'primary.main' }}
          >
            {messageType.name}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {messageType.fullName}
          </Typography>
        </Box>
        <Chip label={messageType.category} color="primary" size="small" />
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Description */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
            {messageType.description}
          </Typography>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
            <Tab label="Use Cases" />
            <Tab label={`Key Fields (${messageType.keyFields.length})`} />
            <Tab label={`Common Errors (${messageType.commonErrors.length})`} />
            <Tab label="Related" />
          </Tabs>
        </Box>

        {/* Use Cases Tab */}
        <TabPanel value={tabValue} index={0}>
          <List>
            {messageType.useCases.map((useCase, i) => (
              <ListItem key={i} sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CheckCircleIcon color="success" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={useCase} />
              </ListItem>
            ))}
          </List>
        </TabPanel>

        {/* Key Fields Tab */}
        <TabPanel value={tabValue} index={1}>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Field</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>XPath</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Required</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Common Errors</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {messageType.keyFields.map((field, i) => (
                  <TableRow key={i} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {field.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {field.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: '0.7rem',
                          wordBreak: 'break-all',
                        }}
                      >
                        {field.path}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {field.required ? (
                        <Chip label="Required" size="small" color="error" variant="outlined" />
                      ) : (
                        <Chip label="Optional" size="small" variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell>
                      {field.commonErrors?.map((err, j) => (
                        <Chip
                          key={j}
                          label={err}
                          size="small"
                          color="warning"
                          variant="outlined"
                          sx={{ mr: 0.5, mb: 0.5, fontSize: '0.7rem' }}
                        />
                      ))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Example XPath */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CodeIcon fontSize="small" /> Example XPath
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'monospace',
                bgcolor: 'background.default',
                p: 1.5,
                borderRadius: 1,
                fontSize: '0.8rem',
              }}
            >
              {messageType.exampleXPath}
            </Typography>
          </Box>
        </TabPanel>

        {/* Common Errors Tab */}
        <TabPanel value={tabValue} index={2}>
          <List>
            {messageType.commonErrors.map((error, i) => (
              <ListItem key={i} sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <ErrorIcon color="error" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: 'monospace' }}
                    >
                      {error}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Search these error codes in the main lookup to see detailed explanations and fix steps.
          </Typography>
        </TabPanel>

        {/* Related Messages Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Messages commonly used together with {messageType.name}:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {messageType.relatedMessages.map((msg) => (
              <Chip
                key={msg}
                label={msg}
                icon={<LinkIcon />}
                sx={{ fontFamily: 'monospace' }}
              />
            ))}
          </Stack>
        </TabPanel>
      </DialogContent>
    </Dialog>
  );
};
