import { useState } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Stack,
  Collapse,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CategoryIcon from '@mui/icons-material/Category';
import MessageIcon from '@mui/icons-material/Message';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { ERROR_TYPES } from '../data/errorTypes';
import { MESSAGE_TYPES, type MessageType } from '../data/messageTypes';
import { MessageGuideModal } from '../components/MessageGuideModal';
import { useSEO } from '../hooks/useSEO';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

export const ReferencePage: FC = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [expandedType, setExpandedType] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<MessageType | null>(null);

  useSEO({
    title: 'Reference Guide - Error Types & Message Types | MX Error Guide',
    description: 'Complete reference for ISO 20022 error categories and message types. Browse AC, AM, BE, RC errors and pacs.008, camt.053 message definitions.',
  });

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pt: 2, pb: 8 }}>
      <Container maxWidth="lg">
        {/* Back Button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ mb: 2 }}
        >
          Back to Error Lookup
        </Button>

        {/* Title */}
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          Reference Guide
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Browse error categories and message type definitions
        </Typography>

        {/* Tabs */}
        <Paper sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
          >
            <Tab
              icon={<CategoryIcon />}
              iconPosition="start"
              label="Error Types"
              sx={{ textTransform: 'none' }}
            />
            <Tab
              icon={<MessageIcon />}
              iconPosition="start"
              label="Message Types"
              sx={{ textTransform: 'none' }}
            />
          </Tabs>

          {/* Error Types Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ px: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {ERROR_TYPES.length} error categories with common codes and resolution tips
              </Typography>
              <Grid container spacing={2}>
                {ERROR_TYPES.map((errorType) => (
                  <Grid key={errorType.id} size={{ xs: 12, md: 6 }}>
                    <Card
                      sx={{
                        bgcolor: 'background.default',
                        border: 1,
                        borderColor: expandedType === errorType.id ? 'primary.main' : 'divider',
                      }}
                    >
                      <CardActionArea
                        onClick={() => setExpandedType(
                          expandedType === errorType.id ? null : errorType.id
                        )}
                      >
                        <CardContent>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Box>
                              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                <Typography variant="h6" component="h3">
                                  {errorType.name}
                                </Typography>
                                <Chip
                                  label={errorType.prefix.join(', ')}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                              </Stack>
                              <Typography variant="body2" color="text.secondary">
                                {errorType.description.substring(0, 120)}...
                              </Typography>
                            </Box>
                            <IconButton size="small">
                              {expandedType === errorType.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                          </Stack>
                        </CardContent>
                      </CardActionArea>
                      <Collapse in={expandedType === errorType.id}>
                        <CardContent sx={{ pt: 0, borderTop: 1, borderColor: 'divider' }}>
                          <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Common Codes:
                          </Typography>
                          <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mb: 2 }}>
                            {errorType.commonCodes.slice(0, 5).map((codeObj) => (
                              <Chip
                                key={codeObj.code}
                                label={codeObj.code}
                                size="small"
                                clickable
                                onClick={(e: React.MouseEvent) => {
                                  e.stopPropagation();
                                  navigate(`/error/${codeObj.code}`);
                                }}
                                sx={{ fontSize: '0.75rem' }}
                              />
                            ))}
                          </Stack>
                          <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Resolution:
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {errorType.resolutionApproach}
                          </Typography>
                        </CardContent>
                      </Collapse>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </TabPanel>

          {/* Message Types Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ px: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {MESSAGE_TYPES.length} ISO 20022 message types - Click to view full guide
              </Typography>
              <Grid container spacing={2}>
                {MESSAGE_TYPES.map((msgType) => (
                  <Grid key={msgType.id} size={{ xs: 12, md: 6 }}>
                    <Card
                      sx={{
                        bgcolor: 'background.default',
                        border: 1,
                        borderColor: 'divider',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: 'action.hover',
                        },
                      }}
                    >
                      <CardActionArea onClick={() => setSelectedMessage(msgType)}>
                        <CardContent>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Box>
                              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                <Typography
                                  variant="h6"
                                  component="h3"
                                  sx={{ fontFamily: 'monospace' }}
                                >
                                  {msgType.name}
                                </Typography>
                                <Chip
                                  label={msgType.category.includes('Payment') ? 'Payment' : 'Cash Mgmt'}
                                  size="small"
                                  color={msgType.category.includes('Payment') ? 'primary' : 'secondary'}
                                  variant="outlined"
                                />
                              </Stack>
                              <Typography variant="body2" fontWeight={500}>
                                {msgType.fullName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {msgType.description.substring(0, 100)}...
                              </Typography>
                            </Box>
                            <IconButton size="small" color="primary">
                              <OpenInNewIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                          <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 2 }}>
                            {msgType.commonErrors.slice(0, 4).map((code) => (
                              <Chip
                                key={code}
                                label={code}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem' }}
                              />
                            ))}
                            {msgType.commonErrors.length > 4 && (
                              <Chip
                                label={`+${msgType.commonErrors.length - 4} more`}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem' }}
                              />
                            )}
                          </Stack>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </TabPanel>
        </Paper>

        {/* Message Guide Modal */}
        <MessageGuideModal
          messageType={selectedMessage}
          onClose={() => setSelectedMessage(null)}
        />
      </Container>
    </Box>
  );
};

export default ReferencePage;
