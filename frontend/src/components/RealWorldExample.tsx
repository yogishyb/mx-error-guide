import { useState } from 'react';
import type { FC } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Collapse,
  IconButton,
  Divider,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  LightbulbOutlined as LightbulbIcon,
  PersonOutline as PersonIcon,
  SendOutlined as SendIcon,
  ErrorOutline as ErrorIcon,
  TipsAndUpdates as TipsIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { TermWithHelp } from './HelpIcon';
import type { RealWorldExample as RealWorldExampleType } from '../hooks/useRealWorldExamples';

interface RealWorldExampleProps {
  example: RealWorldExampleType;
  defaultExpanded?: boolean;
}

// Difficulty color mapping
const difficultyColors = {
  beginner: 'success' as const,
  intermediate: 'warning' as const,
  advanced: 'error' as const,
};

// Category display names
const categoryNames: Record<string, string> = {
  'cross-border-payments': 'Cross-Border Payments',
  'domestic-payments': 'Domestic Payments',
  'account-reporting': 'Account Reporting',
  'payment-returns': 'Payment Returns',
};

export const RealWorldExample: FC<RealWorldExampleProps> = ({
  example,
  defaultExpanded = false
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Card
      component={motion.div}
      layout
      sx={{
        bgcolor: 'background.paper',
        border: 1,
        borderColor: expanded ? 'primary.main' : 'divider',
        transition: 'border-color 0.2s ease',
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        {/* Header */}
        <Stack direction="row" alignItems="flex-start" spacing={1.5}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: 1,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              flexShrink: 0,
              mt: 0.25,
            }}
          >
            <LightbulbIcon sx={{ fontSize: 18 }} />
          </Box>

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 600, mb: 0.5 }}>
              {example.title}
            </Typography>

            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
              <Chip
                label={example.difficulty}
                size="small"
                color={difficultyColors[example.difficulty]}
                sx={{ fontSize: '0.7rem', height: 20, textTransform: 'capitalize' }}
              />
              <Chip
                label={categoryNames[example.category] || example.category}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem', height: 20 }}
              />
              <Chip
                label={`${example.steps.length} steps`}
                size="small"
                sx={{ fontSize: '0.7rem', height: 20, bgcolor: 'action.hover' }}
              />
            </Stack>

            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
              {example.scenario}
            </Typography>
          </Box>

          <IconButton
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
            size="small"
            sx={{
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
              flexShrink: 0,
            }}
          >
            <ExpandMoreIcon />
          </IconButton>
        </Stack>

        {/* Expanded Content */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              <Collapse in={expanded} timeout="auto">
                <Box sx={{ mt: 2 }}>
                  {/* Characters */}
                  <Box sx={{ mb: 3 }}>
                    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 1.5 }}>
                      <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                        Characters
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                      {Object.entries(example.characters).map(([key, character]) => (
                        <Paper
                          key={key}
                          sx={{
                            p: 1.5,
                            bgcolor: 'action.hover',
                            border: 1,
                            borderColor: 'divider',
                            borderRadius: 1,
                            minWidth: 180,
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.25 }}>
                            {character.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {character.role} • {character.country}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Bank: {character.bank}
                          </Typography>
                        </Paper>
                      ))}
                    </Stack>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Steps */}
                  <Box sx={{ mb: 3 }}>
                    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 1.5 }}>
                      <SendIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                        Payment Flow
                      </Typography>
                    </Stack>

                    <Stepper orientation="vertical" sx={{ pl: 0 }}>
                      {example.steps.map((step, index) => (
                        <Step key={step.step} active expanded>
                          <StepLabel
                            sx={{
                              '& .MuiStepLabel-label': {
                                fontWeight: 600,
                                fontSize: '0.875rem',
                              },
                            }}
                          >
                            {step.actor}: {step.action}
                          </StepLabel>
                          <StepContent
                            sx={{
                              borderLeft: index === example.steps.length - 1 ? 'none' : undefined,
                            }}
                          >
                            <Box sx={{ pb: 2 }}>
                              <Typography variant="body2" sx={{ mb: 1, fontSize: '0.8125rem' }}>
                                {step.description}
                              </Typography>

                              <Alert
                                severity="info"
                                icon={false}
                                sx={{
                                  py: 0.75,
                                  px: 1.5,
                                  fontSize: '0.75rem',
                                  bgcolor: 'action.hover',
                                  '& .MuiAlert-message': { py: 0 },
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontWeight: 600,
                                    display: 'block',
                                    mb: 0.5,
                                    fontSize: '0.7rem',
                                  }}
                                >
                                  Technical Details
                                </Typography>
                                <Typography variant="caption" sx={{ fontSize: '0.7rem', lineHeight: 1.5 }}>
                                  {step.technical}
                                </Typography>
                              </Alert>

                              <Box sx={{ mt: 1 }}>
                                <Chip
                                  label={step.message_type}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                  sx={{
                                    fontSize: '0.7rem',
                                    height: 20,
                                    fontFamily: 'var(--font-mono)',
                                  }}
                                />
                              </Box>

                              {step.key_fields.length > 0 && (
                                <Box sx={{ mt: 1.5 }}>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontWeight: 600,
                                      display: 'block',
                                      mb: 0.5,
                                      fontSize: '0.7rem',
                                    }}
                                  >
                                    Key Fields:
                                  </Typography>
                                  <Box
                                    component="ul"
                                    sx={{
                                      m: 0,
                                      pl: 2.5,
                                      '& li': {
                                        fontSize: '0.7rem',
                                        lineHeight: 1.6,
                                        color: 'text.secondary',
                                        mb: 0.25,
                                      },
                                    }}
                                  >
                                    {step.key_fields.map((field, idx) => (
                                      <li key={idx}>{field}</li>
                                    ))}
                                  </Box>
                                </Box>
                              )}
                            </Box>
                          </StepContent>
                        </Step>
                      ))}
                    </Stepper>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Possible Errors */}
                  {example.possible_errors.length > 0 && (
                    <>
                      <Box sx={{ mb: 3 }}>
                        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 1.5 }}>
                          <ErrorIcon sx={{ fontSize: 16, color: 'error.main' }} />
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 600, fontSize: '0.875rem' }}
                          >
                            Common Errors in This Scenario
                          </Typography>
                        </Stack>

                        <Stack spacing={1}>
                          {example.possible_errors.map((err, idx) => (
                            <Alert
                              key={idx}
                              severity="error"
                              icon={false}
                              sx={{
                                py: 1,
                                px: 1.5,
                                fontSize: '0.75rem',
                                '& .MuiAlert-message': { py: 0 },
                              }}
                            >
                              <Stack direction="row" spacing={1} alignItems="flex-start">
                                <Chip
                                  label={err.error_code}
                                  size="small"
                                  color="error"
                                  sx={{
                                    fontSize: '0.65rem',
                                    height: 18,
                                    fontFamily: 'var(--font-mono)',
                                    fontWeight: 600,
                                  }}
                                />
                                <Box sx={{ flexGrow: 1 }}>
                                  <Typography
                                    variant="caption"
                                    sx={{ fontWeight: 600, display: 'block', mb: 0.25 }}
                                  >
                                    {err.scenario}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {err.result}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Alert>
                          ))}
                        </Stack>
                      </Box>

                      <Divider sx={{ my: 2 }} />
                    </>
                  )}

                  {/* Key Takeaways */}
                  <Box sx={{ mb: 2 }}>
                    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 1.5 }}>
                      <TipsIcon sx={{ fontSize: 16, color: 'success.main' }} />
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600, fontSize: '0.875rem' }}
                      >
                        Key Takeaways
                      </Typography>
                    </Stack>

                    <Box
                      component="ul"
                      sx={{
                        m: 0,
                        pl: 2.5,
                        '& li': {
                          fontSize: '0.8125rem',
                          lineHeight: 1.6,
                          color: 'text.secondary',
                          mb: 0.5,
                        },
                      }}
                    >
                      {example.key_takeaways.map((takeaway, idx) => (
                        <li key={idx}>{takeaway}</li>
                      ))}
                    </Box>
                  </Box>

                  {/* Related Messages & Terms */}
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 600, display: 'block', mb: 1, fontSize: '0.7rem' }}
                    >
                      Related Messages:
                    </Typography>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                      {example.related_messages.map((msg) => (
                        <Chip
                          key={msg}
                          label={msg}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontSize: '0.65rem',
                            height: 20,
                            fontFamily: 'var(--font-mono)',
                          }}
                        />
                      ))}
                    </Stack>

                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 600, display: 'block', mb: 1, fontSize: '0.7rem' }}
                    >
                      Learn More:
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {example.related_terms.map((term) => (
                        <TermWithHelp key={term} term={term}>
                          <Typography
                            variant="caption"
                            sx={{
                              fontSize: '0.7rem',
                              color: 'primary.main',
                              textDecoration: 'underline',
                              textDecorationStyle: 'dotted',
                              textUnderlineOffset: 2,
                              cursor: 'help',
                            }}
                          >
                            {term.replace(/_/g, ' ')}
                          </Typography>
                        </TermWithHelp>
                      ))}
                    </Stack>
                  </Box>
                </Box>
              </Collapse>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default RealWorldExample;
