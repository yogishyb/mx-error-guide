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
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  LightbulbOutlined as LightbulbIcon,
  PersonOutline as PersonIcon,
  SendOutlined as SendIcon,
  ErrorOutline as ErrorIcon,
  TipsAndUpdates as TipsIcon,
  AccountTree as AccountTreeIcon,
  List as ListIcon,
  ArrowDownward as ArrowDownwardIcon,
  InfoOutlined as InfoIcon,
  AccountBalance as BankIcon,
  Business as BusinessIcon,
  Schema as GraphIcon,
  ViewTimeline as SequenceIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { TermWithHelp } from './HelpIcon';
import type { RealWorldExample as RealWorldExampleType, Step as StepType } from '../hooks/useRealWorldExamples';
import type { MessageDefinition } from '../hooks/useMessageDefinitions';

interface RealWorldExampleProps {
  example: RealWorldExampleType;
  defaultExpanded?: boolean;
  messageMap?: Map<string, MessageDefinition>;
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

const getActorIcon = (name: string, role?: string) => {
  const lowerName = name.toLowerCase();
  const lowerRole = role?.toLowerCase() || '';
  
  if (
    lowerName.includes('bank') || 
    lowerName.includes('clearing') || 
    lowerName.includes('fed') || 
    lowerName.includes('target') || 
    lowerName.includes('swift') || 
    lowerName.includes('csd') || 
    lowerName.includes('fund') || 
    lowerRole.includes('bank') || 
    lowerRole.includes('agent') || 
    lowerRole.includes('servicer')
  ) {
    return <BankIcon fontSize="small" color="primary" />;
  }
  
  if (
    lowerName.includes('corp') || 
    lowerName.includes('ltd') || 
    lowerName.includes('inc') || 
    lowerRole.includes('corporate')
  ) {
    return <BusinessIcon fontSize="small" color="secondary" />;
  }

  return <PersonIcon fontSize="small" color="action" />;
};

const TreeViewStep: FC<{ step: StepType; isLast: boolean; messageMap?: Map<string, MessageDefinition> }> = ({ step, isLast, messageMap }) => {
  const msgDef = messageMap?.get(step.message_type);

  return (
  <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
    {/* Connection Line */}
    {!isLast && (
      <Box
        sx={{
          position: 'absolute',
          top: '100%',
          left: '50%',
          width: 2,
          height: 24,
          bgcolor: 'primary.light',
          transform: 'translateX(-50%)',
          zIndex: 0,
        }}
      />
    )}

    {/* Step Card */}
    <Paper
      elevation={2}
      sx={{
        p: 2,
        width: '100%',
        maxWidth: 500,
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        position: 'relative',
        zIndex: 1,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
        <Chip
          label={`Step ${step.step}`}
          size="small"
          color="primary"
          sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }}
        />
        <Typography variant="subtitle2" fontWeight={600}>
          {step.action}
        </Typography>
      </Stack>

      {/* Flow Visualization */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2, px: 2, py: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
        <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 80 }}>
           <Box sx={{ mb: 0.5, p: 0.5, bgcolor: 'background.paper', borderRadius: '50%', border: 1, borderColor: 'divider' }}>
             {getActorIcon(step.actor)}
           </Box>
           <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>{step.actor}</Typography>
        </Box>
        
        <Box sx={{ flexGrow: 1, mx: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
           <Stack direction="row" alignItems="center" spacing={0.5}>
             <Typography variant="caption" sx={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'primary.main', fontWeight: 600 }}>
               {step.message_type}
             </Typography>
             {msgDef && (
               <Tooltip title={`${msgDef.name}: ${msgDef.purpose}`} arrow>
                 <InfoIcon sx={{ fontSize: 12, color: 'primary.main', cursor: 'help' }} />
               </Tooltip>
             )}
           </Stack>
           {msgDef && (
             <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary', display: 'block', mb: 0.5, textAlign: 'center', lineHeight: 1 }}>
               {msgDef.name}
             </Typography>
           )}
           {!msgDef && <Box sx={{ mb: 0.5 }} />}
           
           <Box sx={{ width: '100%', height: 1, bgcolor: 'primary.main', position: 'relative' }}>
             <Box sx={{ position: 'absolute', right: 0, top: -4, borderTop: '4px solid transparent', borderBottom: '4px solid transparent', borderLeft: '6px solid', borderLeftColor: 'primary.main' }} />
           </Box>
        </Box>

        <Box sx={{ textAlign: 'center', minWidth: 80 }}>
           <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 0.5 }}>Action</Typography>
           <Chip label="Processing" size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
        </Box>
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.85rem' }}>
        {step.description}
      </Typography>

      {/* Technical Details */}
      <Alert 
        severity="info" 
        icon={false} 
        sx={{ 
          py: 0.5, 
          px: 1, 
          '& .MuiAlert-message': { padding: 0 } 
        }}
      >
        <Typography variant="caption" sx={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
          {step.technical}
        </Typography>
      </Alert>
    </Paper>
    
    {!isLast && <ArrowDownwardIcon color="primary" sx={{ position: 'absolute', top: 'calc(100% + 14px)', zIndex: 2, fontSize: 16 }} />}
  </Box>
);
};

const SequenceView: FC<{ steps: StepType[]; messageMap?: Map<string, MessageDefinition> }> = ({ steps, messageMap }) => {
  // 1. Identify Unique Actors
  const actors = Array.from(new Set(steps.map(s => s.actor)));
  
  // 2. Identify implicit targets (for self-loops or if target not specified)
  const getTarget = (step: StepType, index: number) => {
    if (step.target) return step.target;
    // Default to next actor if not last
    if (index < steps.length - 1) return steps[index + 1].actor;
    return null;
  };

  // Add missing targets to actor list (e.g. if target is mentioned but not an actor in steps)
  steps.forEach((s, i) => {
    const t = getTarget(s, i);
    if (t && !actors.includes(t)) actors.push(t);
  });

  return (
    <Box sx={{ width: '100%', overflowX: 'auto', p: 2 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${actors.length}, minmax(140px, 1fr))`, gap: 2, minWidth: actors.length * 160, position: 'relative' }}>
        
        {/* Lifelines */}
        {actors.map((_, i) => (
          <Box key={`line-${i}`} sx={{ gridColumn: i + 1, gridRow: '1 / 999', position: 'relative', height: '100%', pointerEvents: 'none' }}>
            <Box 
              sx={{ 
                position: 'absolute', 
                left: '50%', 
                top: 60, 
                bottom: 20, 
                width: 2, 
                borderLeft: '2px dashed', 
                borderColor: 'divider',
                transform: 'translateX(-1px)'
              }} 
            />
          </Box>
        ))}

        {/* Header Row */}
        {actors.map((actor, i) => (
          <Box key={`head-${i}`} sx={{ gridColumn: i + 1, gridRow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 1, 
                borderRadius: 2, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                border: 1,
                borderColor: 'primary.main',
                bgcolor: 'background.paper',
                minWidth: 120,
                justifyContent: 'center'
              }}
            >
              {getActorIcon(actor)}
              <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.8rem', textAlign: 'center' }}>{actor}</Typography>
            </Paper>
          </Box>
        ))}

        {/* Steps */}
        {steps.map((step, index) => {
          const fromIndex = actors.indexOf(step.actor);
          const targetName = getTarget(step, index);
          const toIndex = targetName ? actors.indexOf(targetName) : -1;
          
          const row = index + 2; // Start from row 2
          const msgDef = messageMap?.get(step.message_type);
          const isNotification = step.message_type.startsWith('camt') || step.message_type === 'pacs.002' || step.message_type === 'pain.002';
          
          // Determine arrow direction
          const isRight = toIndex > fromIndex;
          const isSelf = fromIndex === toIndex;
          
          return (
            <Box key={`step-${step.step}`} sx={{ gridColumn: '1 / -1', gridRow: row, position: 'relative', height: 100, mt: 2 }}>
              
              {/* Connection Arrow */}
              {toIndex !== -1 && !isSelf && (
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: `${(Math.min(fromIndex, toIndex) * (100 / actors.length)) + (50 / actors.length)}%`,
                    width: `${Math.abs(toIndex - fromIndex) * (100 / actors.length)}%`,
                    height: 40,
                    transform: 'translateY(-50%)',
                    zIndex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={0.5} sx={{ bgcolor: 'background.default', px: 0.5, borderRadius: 1, mb: 0.5, border: 1, borderColor: 'divider' }}>
                    <Typography variant="caption" sx={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'primary.main', fontWeight: 600 }}>
                      {step.message_type}
                    </Typography>
                    {msgDef && (
                      <Tooltip title={`${msgDef.name}: ${msgDef.purpose}`} arrow>
                        <InfoIcon sx={{ fontSize: 12, color: 'primary.main', cursor: 'help' }} />
                      </Tooltip>
                    )}
                  </Stack>
                  
                  <Box sx={{ width: '100%', height: 2, borderTop: isNotification ? '2px dashed' : '2px solid', borderColor: 'primary.main', position: 'relative' }}>
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        [isRight ? 'right' : 'left']: 0, 
                        top: -4, 
                        borderTop: '5px solid transparent', 
                        borderBottom: '5px solid transparent', 
                        [isRight ? 'borderLeft' : 'borderRight']: '8px solid', 
                        [isRight ? 'borderLeftColor' : 'borderRightColor']: 'primary.main' 
                      }} 
                    />
                  </Box>

                  {msgDef && (
                    <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary', mt: 0.5, maxWidth: '90%', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {msgDef.name}
                    </Typography>
                  )}
                </Box>
              )}

              {/* Action Note on the 'From' Line */}
              <Box 
                sx={{ 
                  position: 'absolute', 
                  top: '20%', 
                  left: `${(fromIndex * (100 / actors.length)) + (50 / actors.length)}%`,
                  transform: 'translateX(-50%)',
                  zIndex: 2 
                }}
              >
                <Tooltip title={step.description} arrow placement="top">
                  <Chip 
                    label={`Step ${step.step}: ${step.action}`} 
                    size="small" 
                    color='default' 
                    variant='outlined'
                    sx={{ fontSize: '0.7rem', maxWidth: 160, bgcolor: 'background.paper' }} 
                  />
                </Tooltip>
              </Box>

            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

const GraphView: FC<{ steps: StepType[]; messageMap?: Map<string, MessageDefinition> }> = ({ steps, messageMap }) => {
  return (
    <Box sx={{ width: '100%', overflowX: 'auto', py: 3, px: 1 }}>
      <Stack direction="row" spacing={0} alignItems="flex-start" sx={{ minWidth: 'fit-content', pt: 2 }}>
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const msgDef = messageMap?.get(step.message_type);
          const isNotification = step.message_type.startsWith('camt') || step.message_type === 'pacs.002';
          
          return (
            <Box key={step.step} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              {/* Node */}
              <Tooltip title={
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>{step.actor}</Typography>
                  <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>{step.action}</Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>{step.description}</Typography>
                </Box>
              }>
                <Box sx={{ position: 'relative' }}>
                  <Paper
                    elevation={3}
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 2,
                      borderColor: 'primary.main',
                      bgcolor: 'background.paper',
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'scale(1.05)' },
                      zIndex: 2,
                      position: 'relative'
                    }}
                  >
                    <Box sx={{ mb: 0.5, color: 'primary.main' }}>
                      {getActorIcon(step.actor)}
                    </Box>
                    <Typography variant="caption" align="center" fontWeight={600} sx={{ lineHeight: 1.1, px: 1 }}>
                      {step.actor}
                    </Typography>
                  </Paper>
                  {/* Step Badge */}
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      top: -10, 
                      left: '50%', 
                      transform: 'translateX(-50%)',
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      borderRadius: 10,
                      px: 1,
                      py: 0.2,
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      zIndex: 3,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Step {step.step}
                  </Box>
                </Box>
              </Tooltip>

              {/* Edge */}
              {!isLast && (
                <Box sx={{ width: 180, height: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mx: 0.5, position: 'relative' }}>
                  
                  {/* Message Label */}
                  <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5, zIndex: 1, bgcolor: 'background.default', px: 0.5, borderRadius: 4 }}>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontFamily: 'var(--font-mono)', 
                        fontSize: '0.7rem', 
                        color: 'primary.dark',
                        fontWeight: 600 
                      }}
                    >
                      {step.message_type}
                    </Typography>
                    {msgDef && (
                      <Tooltip title={`${msgDef.name}: ${msgDef.purpose}`} arrow>
                        <InfoIcon sx={{ fontSize: 14, color: 'primary.main', cursor: 'help' }} />
                      </Tooltip>
                    )}
                  </Stack>

                  {/* Arrow Line */}
                  <Box sx={{ width: '100%', position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Box 
                      sx={{ 
                        width: '100%', 
                        height: 2, 
                        borderTop: isNotification ? '2px dashed' : '2px solid',
                        borderColor: 'primary.light',
                      }} 
                    />
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        right: 0, 
                        width: 0, 
                        height: 0, 
                        borderTop: '5px solid transparent', 
                        borderBottom: '5px solid transparent', 
                        borderLeft: '8px solid', 
                        borderLeftColor: 'primary.light' 
                      }} 
                    />
                  </Box>

                  {/* Message Name */}
                  {msgDef && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontSize: '0.6rem', 
                        color: 'text.secondary', 
                        maxWidth: 160, 
                        textAlign: 'center', 
                        lineHeight: 1.1, 
                        mt: 0.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {msgDef.name}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          );
        })}
        
        {/* End Node */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', ml: 1, alignSelf: 'center' }}>
           <Paper 
             sx={{ 
               width: 40, 
               height: 40, 
               borderRadius: '50%', 
               bgcolor: 'success.light', 
               display: 'flex', 
               alignItems: 'center', 
               justifyContent: 'center',
               color: 'white',
               boxShadow: 2
             }}
           >
             <Typography variant="caption" fontWeight={700}>End</Typography>
           </Paper>
        </Box>
      </Stack>
    </Box>
  );
};

export const RealWorldExample: FC<RealWorldExampleProps> = ({
  example,
  defaultExpanded = false,
  messageMap
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [viewMode, setViewMode] = useState<'normal' | 'tree' | 'graph' | 'sequence'>('normal');

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleViewModeChange = (
    _: React.MouseEvent<HTMLElement>,
    newMode: 'normal' | 'tree' | 'graph' | 'sequence' | null
  ) => {
    if (newMode) {
      setViewMode(newMode);
    }
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
                  {/* View Toggle */}
                  <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
                    <ToggleButtonGroup
                      value={viewMode}
                      exclusive
                      onChange={handleViewModeChange}
                      size="small"
                      aria-label="view mode"
                    >
                      <ToggleButton value="normal" aria-label="list view">
                        <Tooltip title="List View">
                          <ListIcon fontSize="small" />
                        </Tooltip>
                      </ToggleButton>
                      <ToggleButton value="tree" aria-label="tree view">
                         <Tooltip title="Flow View">
                          <AccountTreeIcon fontSize="small" />
                        </Tooltip>
                      </ToggleButton>
                      <ToggleButton value="graph" aria-label="graph view">
                         <Tooltip title="Graph View">
                          <GraphIcon fontSize="small" />
                        </Tooltip>
                      </ToggleButton>
                      <ToggleButton value="sequence" aria-label="sequence view">
                         <Tooltip title="Sequence View">
                          <SequenceIcon fontSize="small" />
                        </Tooltip>
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Stack>

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

                    {viewMode === 'normal' ? (
                      <Stepper orientation="vertical" sx={{ pl: 0 }}>
                        {example.steps.map((step, index) => {
                          const msgDef = messageMap?.get(step.message_type);
                          return (
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
                                  <Stack direction="row" alignItems="center" spacing={1}>
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
                                    {msgDef && (
                                      <>
                                        <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary', fontWeight: 500 }}>
                                          {msgDef.name}
                                        </Typography>
                                        <Tooltip title={msgDef.purpose} arrow>
                                          <InfoIcon sx={{ fontSize: 14, color: 'text.secondary', cursor: 'help' }} />
                                        </Tooltip>
                                      </>
                                    )}
                                  </Stack>
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
                        )})}
                      </Stepper>
                    ) : viewMode === 'tree' ? (
                      // Tree/Flow View
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
                        {example.steps.map((step, index) => (
                          <TreeViewStep 
                            key={step.step} 
                            step={step} 
                            isLast={index === example.steps.length - 1}
                            messageMap={messageMap}
                          />
                        ))}
                      </Box>
                    ) : viewMode === 'graph' ? (
                      // Graph View
                      <GraphView steps={example.steps} messageMap={messageMap} />
                    ) : (
                      // Sequence View
                      <SequenceView steps={example.steps} messageMap={messageMap} />
                    )}
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