import { memo, useState } from 'react';
import type { FC } from 'react';
import {
  Box,
  Typography,
  Chip,
  Stack,
  Divider,
  IconButton,
  Tabs,
  Tab,
  Tooltip,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Code as TechnicalIcon,
  Person as SimpleIcon,
  Link as LinkIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import type { GlossaryTerm } from '../hooks/useGlossary';

interface GlossaryPopoverProps {
  term: GlossaryTerm;
  onClose?: () => void;
  onTermClick?: (termId: string) => void;
}

// Linear Aesthetic spring animation config
const springConfig = {
  type: 'spring' as const,
  stiffness: 260,
  damping: 20,
};

// Tab panel for each explanation type
interface TabPanelProps {
  children: React.ReactNode;
  value: number;
  index: number;
}

const TabPanel: FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ pt: 1.5 }}>{children}</Box>}
  </div>
);

export const GlossaryPopover: FC<GlossaryPopoverProps> = memo(
  ({ term, onClose, onTermClick }) => {
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
      setTabValue(newValue);
    };

    const handleRelatedTermClick = (termId: string) => {
      if (onTermClick) {
        onTermClick(termId);
      }
    };

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.98 }}
          transition={springConfig}
        >
          <Box
            sx={{
              width: { xs: 320, sm: 380 },
              maxHeight: 420,
              overflow: 'auto',
              bgcolor: 'background.paper',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? '0 8px 32px rgba(0, 0, 0, 0.4)'
                  : '0 8px 32px rgba(0, 0, 0, 0.08)',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                p: 2,
                pb: 1,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 1,
              }}
            >
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    fontSize: '1rem',
                    letterSpacing: '-0.01em',
                    color: 'text.primary',
                  }}
                >
                  {term.display_name}
                </Typography>
                {term.aliases.length > 0 && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      display: 'block',
                      mt: 0.25,
                    }}
                  >
                    Also: {term.aliases.slice(0, 3).join(', ')}
                  </Typography>
                )}
              </Box>
              {onClose && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  sx={{ mt: -0.5, mr: -0.5 }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              )}
            </Box>

            {/* Category Badge */}
            <Box sx={{ px: 2, pb: 1 }}>
              <Chip
                label={term.category}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: '0.7rem',
                  height: 20,
                  textTransform: 'capitalize',
                }}
              />
            </Box>

            <Divider />

            {/* Tabs for explanation types */}
            <Box sx={{ px: 2, pt: 1 }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{
                  minHeight: 36,
                  '& .MuiTab-root': {
                    minHeight: 36,
                    py: 0.5,
                    px: 1,
                    fontSize: '0.75rem',
                    textTransform: 'none',
                  },
                  '& .MuiTabs-indicator': {
                    height: 2,
                  },
                }}
              >
                <Tab
                  icon={<SimpleIcon sx={{ fontSize: 14 }} />}
                  iconPosition="start"
                  label="Simple"
                  sx={{ gap: 0.5 }}
                />
                <Tab
                  icon={<BusinessIcon sx={{ fontSize: 14 }} />}
                  iconPosition="start"
                  label="Business"
                  sx={{ gap: 0.5 }}
                />
                <Tab
                  icon={<TechnicalIcon sx={{ fontSize: 14 }} />}
                  iconPosition="start"
                  label="Technical"
                  sx={{ gap: 0.5 }}
                />
              </Tabs>
            </Box>

            {/* Tab Content */}
            <Box sx={{ px: 2, pb: 2 }}>
              <TabPanel value={tabValue} index={0}>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.primary',
                    lineHeight: 1.6,
                    fontSize: '0.8125rem',
                  }}
                >
                  {term.explanations.simple}
                </Typography>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.primary',
                    lineHeight: 1.6,
                    fontSize: '0.8125rem',
                  }}
                >
                  {term.explanations.business}
                </Typography>
              </TabPanel>

              <TabPanel value={tabValue} index={2}>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.primary',
                    lineHeight: 1.6,
                    fontSize: '0.8125rem',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {term.explanations.technical}
                </Typography>
              </TabPanel>
            </Box>

            {/* Also Known As Section */}
            {term.also_known_as && Object.keys(term.also_known_as).length > 0 && (
              <>
                <Divider />
                <Box sx={{ p: 2, pt: 1.5 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      display: 'block',
                      mb: 1,
                    }}
                  >
                    Also Known As
                  </Typography>
                  <Stack spacing={0.5}>
                    {Object.entries(term.also_known_as).map(([market, name]) => (
                      <Box
                        key={market}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.secondary',
                            fontSize: '0.7rem',
                          }}
                        >
                          {market}:
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.primary',
                            fontSize: '0.7rem',
                            fontWeight: 500,
                          }}
                        >
                          {name}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </>
            )}

            {/* Related Terms */}
            {term.related_terms && term.related_terms.length > 0 && (
              <>
                <Divider />
                <Box sx={{ p: 2, pt: 1.5 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      display: 'block',
                      mb: 1,
                    }}
                  >
                    Related Terms
                  </Typography>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                    {term.related_terms.slice(0, 5).map((relatedTerm) => (
                      <Tooltip key={relatedTerm} title="Click to view">
                        <Chip
                          label={relatedTerm.replace(/_/g, ' ')}
                          size="small"
                          variant="outlined"
                          clickable
                          onClick={() => handleRelatedTermClick(relatedTerm)}
                          icon={<LinkIcon sx={{ fontSize: 12 }} />}
                          sx={{
                            fontSize: '0.65rem',
                            height: 22,
                            textTransform: 'capitalize',
                            '& .MuiChip-icon': {
                              ml: 0.5,
                            },
                          }}
                        />
                      </Tooltip>
                    ))}
                  </Stack>
                </Box>
              </>
            )}

            {/* Appears In Section */}
            {term.appears_in && term.appears_in.length > 0 && (
              <>
                <Divider />
                <Box sx={{ p: 2, pt: 1.5 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      display: 'block',
                      mb: 1,
                    }}
                  >
                    Appears In
                  </Typography>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                    {term.appears_in.map((messageType) => (
                      <Chip
                        key={messageType}
                        label={messageType}
                        size="small"
                        sx={{
                          fontSize: '0.65rem',
                          height: 20,
                          fontFamily: 'var(--font-mono)',
                          bgcolor: 'action.hover',
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              </>
            )}
          </Box>
        </motion.div>
      </AnimatePresence>
    );
  }
);

GlossaryPopover.displayName = 'GlossaryPopover';
