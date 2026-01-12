import { useState, useCallback, useRef } from 'react';
import type { FC } from 'react';
import html2canvas from 'html2canvas';
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
  Popover,
  Button,
  Tabs,
  Tab,
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
  Warning as WarningIcon,
  ContentCopy as CopyIcon,
  Link as LinkIcon,
  Schedule as TimingIcon,
  Download as DownloadIcon,
  Code as CodeIcon,
  CheckCircle as RequiredIcon,
  Quiz as QuizIcon,
} from '@mui/icons-material';

// Category legend data
const CATEGORY_LEGEND = [
  { prefix: 'pain', label: 'Payment Initiation', color: 'primary' as const },
  { prefix: 'pacs', label: 'Clearing & Settlement', color: 'success' as const },
  { prefix: 'camt', label: 'Cash Management', color: 'warning' as const },
  { prefix: 'acmt', label: 'Account Management', color: 'info' as const },
];

// Entity type legend data
const ENTITY_TYPE_LEGEND = [
  { type: 'Individual', color: 'inherit' as const, icon: 'person' },
  { type: 'Bank', color: 'primary' as const, icon: 'bank' },
  { type: 'Corporate', color: 'secondary' as const, icon: 'business' },
  { type: 'Custodian', color: 'info' as const, icon: 'bank' },
  { type: 'Clearing', color: 'warning' as const, icon: 'bank' },
];
import { motion, AnimatePresence } from 'framer-motion';
import { TermWithHelp } from './HelpIcon';
import { ReactFlowGraph } from './flow/ReactFlowGraph';
import { QuizMode } from './flow/QuizMode';
import type { RealWorldExample as RealWorldExampleType, Step as StepType, PossibleError, Character } from '../hooks/useRealWorldExamples';
import type { MessageDefinition } from '../hooks/useMessageDefinitions';

// Category colors for message types
const getCategoryColor = (messageType: string): 'primary' | 'success' | 'warning' | 'info' | 'secondary' => {
  if (messageType.startsWith('pain')) return 'primary';     // Customer messages - blue
  if (messageType.startsWith('pacs')) return 'success';     // Interbank messages - green
  if (messageType.startsWith('camt')) return 'warning';     // Cash management - orange
  if (messageType.startsWith('acmt')) return 'info';        // Account management - cyan
  return 'secondary';                                        // Other - purple
};

// Timing estimates based on message type
const getTimingEstimate = (messageType: string): string => {
  if (messageType.startsWith('pain.001')) return 'T+0';
  if (messageType.startsWith('pain.002')) return 'T+0 to T+1';
  if (messageType.startsWith('pacs.008')) return 'T+0';
  if (messageType.startsWith('pacs.002')) return 'T+0';
  if (messageType.startsWith('pacs.004')) return 'T+1 to T+3';
  if (messageType.startsWith('camt.053')) return 'T+1 (EOD)';
  if (messageType.startsWith('camt.054')) return 'Real-time';
  if (messageType.startsWith('camt.056')) return 'T+0';
  return 'Varies';
};

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

// Entity type detection with icon and label
interface ActorInfo {
  icon: React.ReactNode;
  type: string;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error' | 'inherit';
}

const getActorInfo = (name: string, role?: string): ActorInfo => {
  const lowerName = name.toLowerCase();
  const lowerRole = role?.toLowerCase() || '';

  // Central banks & clearing systems
  if (
    lowerName.includes('fed') ||
    lowerName.includes('target') ||
    lowerName.includes('clearing') ||
    lowerName.includes('central') ||
    lowerName.includes('reserve') ||
    lowerRole.includes('clearing') ||
    lowerRole.includes('central')
  ) {
    return { icon: <BankIcon fontSize="small" />, type: 'Clearing', color: 'warning' };
  }

  // Custodians & CSDs
  if (
    lowerName.includes('csd') ||
    lowerName.includes('custod') ||
    lowerName.includes('depository') ||
    lowerName.includes('euroclear') ||
    lowerName.includes('dtcc') ||
    lowerRole.includes('custod') ||
    lowerRole.includes('depository')
  ) {
    return { icon: <BankIcon fontSize="small" />, type: 'Custodian', color: 'info' };
  }

  // Financial institutions (banks)
  if (
    lowerName.includes('bank') ||
    lowerName.includes('swift') ||
    lowerName.includes('chase') ||
    lowerName.includes('hsbc') ||
    lowerName.includes('barclays') ||
    lowerName.includes('deutsche') ||
    lowerName.includes('citi') ||
    lowerName.includes('wells') ||
    lowerName.includes('morgan') ||
    lowerName.includes('goldman') ||
    lowerRole.includes('bank') ||
    lowerRole.includes('agent') ||
    lowerRole.includes('servicer') ||
    lowerRole.includes('financial')
  ) {
    return { icon: <BankIcon fontSize="small" />, type: 'Bank', color: 'primary' };
  }

  // Corporations & businesses
  if (
    lowerName.includes('corp') ||
    lowerName.includes('ltd') ||
    lowerName.includes('inc') ||
    lowerName.includes('plc') ||
    lowerName.includes('gmbh') ||
    lowerName.includes('company') ||
    lowerRole.includes('corporate') ||
    lowerRole.includes('business') ||
    lowerRole.includes('supplier') ||
    lowerRole.includes('vendor')
  ) {
    return { icon: <BusinessIcon fontSize="small" />, type: 'Corporate', color: 'secondary' };
  }

  // Default: Individual/Person
  return { icon: <PersonIcon fontSize="small" />, type: 'Individual', color: 'inherit' };
};

// Legacy function for backward compatibility
const getActorIcon = (name: string, role?: string) => {
  return getActorInfo(name, role).icon;
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

// Advanced Network Topology View - Now using ReactFlowGraph from ./flow/ReactFlowGraph.tsx
// The code below is kept for reference but not used (replaced by React Flow library)
interface AdvancedGraphViewProps {
  steps: StepType[];
  messageMap?: Map<string, MessageDefinition>;
  possibleErrors?: PossibleError[];
}

// @ts-expect-error - Kept for reference but replaced by React Flow library
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _AdvancedGraphView: FC<AdvancedGraphViewProps> = ({ steps, messageMap, possibleErrors = [] }) => {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract unique actors and build node positions
  const actors = Array.from(new Set(steps.flatMap(s => [s.actor, s.target].filter(Boolean) as string[])));

  // Position nodes in a circular/spatial layout - increased canvas size
  const getNodePositions = () => {
    const width = 900;
    const height = 600;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.36;

    const positions: Record<string, { x: number; y: number }> = {};
    actors.forEach((actor, index) => {
      const angle = (index * 2 * Math.PI) / actors.length - Math.PI / 2;
      positions[actor] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });
    return positions;
  };

  const nodePositions = getNodePositions();

  // Generate curved path between two points
  const getCurvedPath = (from: { x: number; y: number }, to: { x: number; y: number }, curveOffset: number = 0) => {
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Perpendicular offset for curve
    const perpX = -dy / dist * (50 + curveOffset * 20);
    const perpY = dx / dist * (50 + curveOffset * 20);

    const ctrlX = midX + perpX;
    const ctrlY = midY + perpY;

    return `M ${from.x} ${from.y} Q ${ctrlX} ${ctrlY} ${to.x} ${to.y}`;
  };

  // Get edge color based on message type
  const getEdgeColor = (messageType: string) => {
    if (messageType.startsWith('pain')) return '#60a5fa'; // blue
    if (messageType.startsWith('pacs')) return '#34d399'; // green
    if (messageType.startsWith('camt')) return '#fbbf24'; // amber
    if (messageType.startsWith('acmt')) return '#22d3ee'; // cyan
    if (messageType.startsWith('sese') || messageType.startsWith('semt')) return '#a78bfa'; // purple
    if (messageType.startsWith('seev')) return '#f472b6'; // pink
    return '#94a3b8'; // slate
  };

  // Find errors for message type
  const getErrorsForMessage = (messageType: string) =>
    possibleErrors.filter(e => e.message_type === messageType);

  // Group steps by edge (from-to pair) to handle multiple messages
  const edgeGroups = new Map<string, { steps: StepType[]; from: string; to: string }>();
  steps.forEach(step => {
    const to = step.target || actors[(actors.indexOf(step.actor) + 1) % actors.length];
    const key = `${step.actor}->${to}`;
    if (!edgeGroups.has(key)) {
      edgeGroups.set(key, { steps: [], from: step.actor, to });
    }
    edgeGroups.get(key)!.steps.push(step);
  });

  // SVG Icons as paths
  const BankIconPath = "M12 2L2 7v2h20V7L12 2zm0 2.5l6.5 3.5h-13L12 4.5zM4 10v7h2v-7H4zm4 0v7h2v-7H8zm4 0v7h2v-7h-2zm4 0v7h2v-7h-2zm-12 8v2h20v-2H2z";
  const PersonIconPath = "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z";
  const BusinessIconPath = "M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z";

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        minHeight: 600,
        bgcolor: '#0f172a', // slate-900
        borderRadius: 2,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* CSS Animations */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 0.8; }
          }
          @keyframes dash {
            to { stroke-dashoffset: -20; }
          }
          .node-pulse {
            animation: pulse 2s ease-in-out infinite;
          }
          .edge-flow {
            animation: dash 1s linear infinite;
          }
        `}
      </style>

      <svg
        viewBox="0 0 900 600"
        style={{
          width: '100%',
          height: '100%',
          minHeight: 600,
        }}
      >
        <defs>
          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Strong glow for highlighted */}
          <filter id="glowStrong" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Node shadow */}
          <filter id="nodeShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000" floodOpacity="0.5"/>
          </filter>
          {/* Gradient definitions for nodes */}
          <radialGradient id="nodeGradientBlue" cx="30%" cy="30%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#1e40af" stopOpacity="0.1"/>
          </radialGradient>
          <radialGradient id="nodeGradientGreen" cx="30%" cy="30%">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#15803d" stopOpacity="0.1"/>
          </radialGradient>
          <radialGradient id="nodeGradientPurple" cx="30%" cy="30%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#6d28d9" stopOpacity="0.1"/>
          </radialGradient>
          <radialGradient id="nodeGradientAmber" cx="30%" cy="30%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#d97706" stopOpacity="0.1"/>
          </radialGradient>
          <radialGradient id="nodeGradientCyan" cx="30%" cy="30%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#0891b2" stopOpacity="0.1"/>
          </radialGradient>
          <radialGradient id="nodeGradientSlate" cx="30%" cy="30%">
            <stop offset="0%" stopColor="#64748b" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#475569" stopOpacity="0.1"/>
          </radialGradient>
          {/* Arrow markers for each color */}
          {['#60a5fa', '#34d399', '#fbbf24', '#22d3ee', '#a78bfa', '#f472b6', '#94a3b8'].map(color => (
            <marker
              key={color}
              id={`arrow-${color.replace('#', '')}`}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="8"
              markerHeight="8"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
            </marker>
          ))}
        </defs>

        {/* Grid background with subtle gradient */}
        <rect width="100%" height="100%" fill="#0f172a" />
        <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#1e293b" strokeWidth="0.5" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid)" opacity="0.5" />

        {/* Center decoration */}
        <circle cx="450" cy="300" r="180" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="4,8" opacity="0.3" />
        <circle cx="450" cy="300" r="120" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="4,8" opacity="0.2" />

        {/* Edges */}
        {Array.from(edgeGroups.entries()).map(([key, { steps: edgeSteps, from, to }]) => {
          const fromPos = nodePositions[from];
          const toPos = nodePositions[to];
          if (!fromPos || !toPos) return null;

          return edgeSteps.map((step, edgeIndex) => {
            const color = getEdgeColor(step.message_type);
            const isHovered = hoveredStep === step.step;
            const isSelected = selectedStep === step.step;
            const isActive = isHovered || isSelected;
            const hasErrors = getErrorsForMessage(step.message_type).length > 0;

            // Calculate path with offset for multiple edges
            const path = getCurvedPath(fromPos, toPos, edgeIndex);

            // Calculate label position along path (quadratic bezier at t=0.5)
            const dx = toPos.x - fromPos.x;
            const dy = toPos.y - fromPos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const perpX = -dy / dist * (50 + edgeIndex * 20);
            const perpY = dx / dist * (50 + edgeIndex * 20);
            const ctrlX = (fromPos.x + toPos.x) / 2 + perpX;
            const ctrlY = (fromPos.y + toPos.y) / 2 + perpY;
            const t = 0.5;
            const midX = (1-t)*(1-t)*fromPos.x + 2*(1-t)*t*ctrlX + t*t*toPos.x;
            const midY = (1-t)*(1-t)*fromPos.y + 2*(1-t)*t*ctrlY + t*t*toPos.y;

            return (
              <g key={`${key}-${step.step}`}>
                {/* Edge glow background */}
                {isActive && (
                  <path
                    d={path}
                    fill="none"
                    stroke={color}
                    strokeWidth={8}
                    strokeOpacity={0.3}
                    filter="url(#glow)"
                  />
                )}
                {/* Edge path */}
                <path
                  d={path}
                  fill="none"
                  stroke={color}
                  strokeWidth={isActive ? 3 : 2}
                  strokeOpacity={isActive ? 1 : 0.7}
                  strokeDasharray={step.message_type.startsWith('camt') || step.message_type.includes('002') ? '8,4' : 'none'}
                  markerEnd={`url(#arrow-${color.replace('#', '')})`}
                  filter={isActive ? 'url(#glowStrong)' : 'url(#glow)'}
                  style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                  onMouseEnter={() => setHoveredStep(step.step)}
                  onMouseLeave={() => setHoveredStep(null)}
                  onClick={() => setSelectedStep(selectedStep === step.step ? null : step.step)}
                />

                {/* Step number badge */}
                <g
                  transform={`translate(${midX}, ${midY})`}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredStep(step.step)}
                  onMouseLeave={() => setHoveredStep(null)}
                  onClick={() => setSelectedStep(selectedStep === step.step ? null : step.step)}
                >
                  {/* Badge glow */}
                  <circle
                    r={isActive ? 20 : 16}
                    fill={color}
                    fillOpacity={0.2}
                    filter="url(#glow)"
                  />
                  <circle
                    r={isActive ? 16 : 13}
                    fill="#0f172a"
                    stroke={color}
                    strokeWidth={isActive ? 2.5 : 2}
                    filter={isActive ? 'url(#glowStrong)' : undefined}
                  />
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={color}
                    fontSize={isActive ? 13 : 11}
                    fontWeight="bold"
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    {step.step}
                  </text>
                  {hasErrors && (
                    <g transform="translate(12, -12)">
                      <circle r="7" fill="#0f172a" />
                      <circle r="5" fill="#ef4444" />
                    </g>
                  )}
                </g>

                {/* Message type label on hover */}
                {isActive && (
                  <g transform={`translate(${midX}, ${midY + 30})`}>
                    <rect
                      x={-60}
                      y={-12}
                      width={120}
                      height={24}
                      rx={6}
                      fill="#0f172a"
                      stroke={color}
                      strokeWidth={1.5}
                      filter="url(#nodeShadow)"
                    />
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={color}
                      fontSize={11}
                      fontFamily="var(--font-mono)"
                      fontWeight="600"
                    >
                      {step.message_type}
                    </text>
                  </g>
                )}
              </g>
            );
          });
        })}

        {/* Nodes */}
        {actors.map((actor) => {
          const pos = nodePositions[actor];
          if (!pos) return null;

          const actorInfo = getActorInfo(actor);
          const nodeColor = actorInfo.color === 'primary' ? '#3b82f6' :
                            actorInfo.color === 'secondary' ? '#8b5cf6' :
                            actorInfo.color === 'success' ? '#22c55e' :
                            actorInfo.color === 'warning' ? '#f59e0b' :
                            actorInfo.color === 'info' ? '#06b6d4' :
                            '#64748b';
          const gradientId = actorInfo.color === 'primary' ? 'nodeGradientBlue' :
                             actorInfo.color === 'secondary' ? 'nodeGradientPurple' :
                             actorInfo.color === 'success' ? 'nodeGradientGreen' :
                             actorInfo.color === 'warning' ? 'nodeGradientAmber' :
                             actorInfo.color === 'info' ? 'nodeGradientCyan' :
                             'nodeGradientSlate';

          // Check if any hovered/selected step involves this actor
          const isNodeActive = hoveredNode === actor || steps.some(s =>
            (hoveredStep === s.step || selectedStep === s.step) &&
            (s.actor === actor || s.target === actor)
          );

          // Get icon path based on entity type
          const iconPath = actorInfo.type === 'Bank' || actorInfo.type === 'Clearing' || actorInfo.type === 'Custodian'
            ? BankIconPath
            : actorInfo.type === 'Corporate'
              ? BusinessIconPath
              : PersonIconPath;

          // Format name for display
          const displayName = actor.length > 14 ? actor.substring(0, 12) + '...' : actor;

          return (
            <g
              key={actor}
              transform={`translate(${pos.x}, ${pos.y})`}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredNode(actor)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              {/* Outer glow ring */}
              <circle
                r={isNodeActive ? 58 : 50}
                fill="none"
                stroke={nodeColor}
                strokeWidth={1}
                strokeOpacity={0.3}
                className={isNodeActive ? 'node-pulse' : ''}
              />

              {/* Node background glow */}
              <circle
                r={isNodeActive ? 52 : 45}
                fill={`url(#${gradientId})`}
                filter="url(#glow)"
                style={{ transition: 'all 0.3s ease' }}
              />

              {/* Main node circle */}
              <circle
                r={isNodeActive ? 44 : 38}
                fill="#0f172a"
                stroke={nodeColor}
                strokeWidth={isNodeActive ? 3 : 2}
                filter={isNodeActive ? 'url(#glowStrong)' : 'url(#nodeShadow)'}
                style={{ transition: 'all 0.3s ease' }}
              />

              {/* Inner gradient fill */}
              <circle
                r={isNodeActive ? 42 : 36}
                fill={`url(#${gradientId})`}
                opacity={0.5}
              />

              {/* Actor icon */}
              <g transform="translate(-12, -18) scale(1)">
                <path
                  d={iconPath}
                  fill={nodeColor}
                  opacity={0.9}
                />
              </g>

              {/* Actor name */}
              <text
                textAnchor="middle"
                dominantBaseline="central"
                y={14}
                fontSize={10}
                fontWeight="700"
                fill="#f1f5f9"
                fontFamily="system-ui, -apple-system, sans-serif"
                style={{ letterSpacing: '0.3px' }}
              >
                {displayName.toUpperCase()}
              </text>

              {/* Entity type badge */}
              <g transform="translate(0, 32)">
                <rect
                  x={-28}
                  y={-8}
                  width={56}
                  height={16}
                  rx={4}
                  fill={nodeColor}
                  fillOpacity={0.25}
                  stroke={nodeColor}
                  strokeWidth={0.5}
                  strokeOpacity={0.5}
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={9}
                  fill={nodeColor}
                  fontWeight="600"
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {actorInfo.type}
                </text>
              </g>
            </g>
          );
        })}
      </svg>

      {/* Step details panel */}
      {selectedStep && (() => {
        const step = steps.find(s => s.step === selectedStep);
        if (!step) return null;
        const msgDef = messageMap?.get(step.message_type);
        const errors = getErrorsForMessage(step.message_type);
        const edgeColor = getEdgeColor(step.message_type);

        return (
          <Paper
            elevation={12}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              width: 300,
              p: 2.5,
              bgcolor: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(10px)',
              border: 2,
              borderColor: edgeColor,
              borderRadius: 3,
              boxShadow: `0 0 30px ${edgeColor}40`,
            }}
          >
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Chip
                  label={`Step ${step.step}`}
                  size="small"
                  sx={{
                    bgcolor: edgeColor,
                    color: '#0f172a',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                  }}
                />
                <IconButton
                  size="small"
                  onClick={() => setSelectedStep(null)}
                  sx={{
                    color: '#94a3b8',
                    '&:hover': { color: '#f1f5f9', bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  <Typography sx={{ fontSize: 18, fontWeight: 300 }}>×</Typography>
                </IconButton>
              </Stack>

              <Typography variant="body2" fontWeight={600} sx={{ color: '#f1f5f9', fontSize: '0.95rem' }}>
                {step.action}
              </Typography>

              <Box sx={{ bgcolor: 'rgba(0,0,0,0.3)', p: 1.5, borderRadius: 2, border: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 1, fontSize: '0.75rem' }}>
                  {step.actor} → {step.target || 'Next'}
                </Typography>
                <Chip
                  label={step.message_type}
                  size="small"
                  sx={{
                    fontFamily: 'var(--font-mono)',
                    bgcolor: `${edgeColor}20`,
                    color: edgeColor,
                    border: 1,
                    borderColor: edgeColor,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                />
                {msgDef && (
                  <Typography variant="caption" sx={{ color: '#cbd5e1', display: 'block', mt: 1, fontSize: '0.75rem' }}>
                    {msgDef.name}
                  </Typography>
                )}
              </Box>

              <Typography variant="caption" sx={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '0.8rem' }}>
                {step.description}
              </Typography>

              {errors.length > 0 && (
                <Alert
                  severity="error"
                  sx={{
                    py: 0.5,
                    bgcolor: 'rgba(239,68,68,0.15)',
                    border: 1,
                    borderColor: 'rgba(239,68,68,0.3)',
                    '& .MuiAlert-message': { fontSize: '0.75rem' }
                  }}
                >
                  {errors.length} possible error{errors.length > 1 ? 's' : ''}: {errors.map(e => e.error_code).join(', ')}
                </Alert>
              )}
            </Stack>
          </Paper>
        );
      })()}

      {/* Legend */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          bgcolor: 'rgba(15,23,42,0.95)',
          backdropFilter: 'blur(10px)',
          p: 2,
          borderRadius: 2,
          border: 1,
          borderColor: 'rgba(51,65,85,0.5)',
        }}
      >
        <Typography variant="caption" sx={{ color: '#e2e8f0', fontWeight: 700, mb: 1.5, display: 'block', fontSize: '0.7rem', letterSpacing: '0.5px' }}>
          MESSAGE TYPES
        </Typography>
        <Stack spacing={0.75}>
          {[
            { prefix: 'pain', label: 'Payment Initiation', color: '#60a5fa' },
            { prefix: 'pacs', label: 'Clearing & Settlement', color: '#34d399' },
            { prefix: 'camt', label: 'Cash Management', color: '#fbbf24' },
            { prefix: 'sese', label: 'Securities Settlement', color: '#a78bfa' },
          ].filter(cat => steps.some(s => s.message_type.startsWith(cat.prefix))).map(cat => (
            <Stack key={cat.prefix} direction="row" alignItems="center" spacing={1.5}>
              <Box sx={{ width: 24, height: 3, bgcolor: cat.color, borderRadius: 1, boxShadow: `0 0 6px ${cat.color}` }} />
              <Typography variant="caption" sx={{ color: '#cbd5e1', fontSize: '0.7rem' }}>
                <span style={{ color: cat.color, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{cat.prefix}.*</span> {cat.label}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Box>

      {/* Stats */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          bgcolor: 'rgba(15,23,42,0.95)',
          backdropFilter: 'blur(10px)',
          p: 2,
          borderRadius: 2,
          border: 1,
          borderColor: 'rgba(51,65,85,0.5)',
        }}
      >
        <Stack direction="row" spacing={3}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ color: '#60a5fa', fontWeight: 800, fontSize: '1.5rem', lineHeight: 1, textShadow: '0 0 10px rgba(96,165,250,0.5)' }}>
              {actors.length}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.65rem', letterSpacing: '0.5px' }}>
              ENTITIES
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ color: '#34d399', fontWeight: 800, fontSize: '1.5rem', lineHeight: 1, textShadow: '0 0 10px rgba(52,211,153,0.5)' }}>
              {steps.length}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.65rem', letterSpacing: '0.5px' }}>
              STEPS
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ color: '#fbbf24', fontWeight: 800, fontSize: '1.5rem', lineHeight: 1, textShadow: '0 0 10px rgba(251,191,36,0.5)' }}>
              {new Set(steps.map(s => s.message_type)).size}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.65rem', letterSpacing: '0.5px' }}>
              MSG TYPES
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Title indicator */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          bgcolor: 'rgba(15,23,42,0.95)',
          backdropFilter: 'blur(10px)',
          px: 2,
          py: 1,
          borderRadius: 2,
          border: 1,
          borderColor: 'rgba(51,65,85,0.5)',
        }}
      >
        <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.65rem', letterSpacing: '1px' }}>
          NETWORK TOPOLOGY
        </Typography>
      </Box>
    </Box>
  );
};

// Enhanced graph view with all features
interface GraphViewProps {
  steps: StepType[];
  messageMap?: Map<string, MessageDefinition>;
  possibleErrors?: PossibleError[];
  exampleId?: string;
  characters?: Record<string, Character>;
}

const GraphView: FC<GraphViewProps> = ({ steps, messageMap, possibleErrors = [], exampleId, characters = {} }) => {
  const [highlightedStep, setHighlightedStep] = useState<number | null>(null);
  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null);
  const [popoverStep, setPopoverStep] = useState<StepType | null>(null);
  const [popoverTab, setPopoverTab] = useState(0);
  const [isAdvancedView, setIsAdvancedView] = useState(false);
  const graphRef = useRef<HTMLDivElement>(null);

  // Build actor order to detect return flows
  const actorOrder = new Map<string, number>();
  steps.forEach((step) => {
    if (!actorOrder.has(step.actor)) actorOrder.set(step.actor, actorOrder.size);
    if (step.target && !actorOrder.has(step.target)) actorOrder.set(step.target, actorOrder.size);
  });

  // Find errors for a message type
  const getErrorsForMessage = (messageType: string) =>
    possibleErrors.filter(e => e.message_type === messageType);

  // Handle click on message chip
  const handleMessageClick = (event: React.MouseEvent<HTMLElement>, step: StepType) => {
    setPopoverAnchor(event.currentTarget);
    setPopoverStep(step);
  };

  // Copy flow as ASCII
  const copyAsText = useCallback(() => {
    const text = steps.map(step => {
      const target = step.target || 'Next';
      return `${step.step}. ${step.actor} → ${step.message_type} → ${target}\n   ${step.action}`;
    }).join('\n\n');
    navigator.clipboard.writeText(text);
  }, [steps]);

  // Get direct link
  const copyLink = useCallback(() => {
    const url = `${window.location.origin}${window.location.pathname}#${exampleId || ''}`;
    navigator.clipboard.writeText(url);
  }, [exampleId]);

  // Export as PNG
  const exportAsPng = useCallback(async () => {
    if (!graphRef.current) return;
    try {
      const canvas = await html2canvas(graphRef.current, { backgroundColor: '#ffffff' });
      const link = document.createElement('a');
      link.download = `payment-flow-${exampleId || 'export'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
    }
  }, [exampleId]);

  // Get categories used in this flow
  const usedCategories = CATEGORY_LEGEND.filter(cat =>
    steps.some(step => step.message_type.startsWith(cat.prefix))
  );

  // If advanced view is selected, render AdvancedGraphView
  if (isAdvancedView) {
    return (
      <Box sx={{ width: '100%', py: 2 }}>
        {/* Toolbar for Advanced View */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <ToggleButtonGroup
            value={isAdvancedView ? 'advanced' : 'basic'}
            exclusive
            onChange={(_, value) => value && setIsAdvancedView(value === 'advanced')}
            size="small"
          >
            <ToggleButton value="basic">
              <Tooltip title="Basic View">
                <ListIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="advanced">
              <Tooltip title="Network Topology">
                <GraphIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>

          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Copy as text">
              <IconButton size="small" onClick={copyAsText}>
                <CopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export as PNG">
              <IconButton size="small" onClick={exportAsPng}>
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Copy link">
              <IconButton size="small" onClick={copyLink}>
                <LinkIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        <ReactFlowGraph steps={steps} messageMap={messageMap} possibleErrors={possibleErrors} characters={characters} exampleId={exampleId} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', py: 2 }}>
      {/* Toolbar */}
      <Stack spacing={1} sx={{ mb: 2 }}>
        {/* Top row: View Toggle, Legends and Actions */}
        <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="flex-start" flexWrap="wrap">
          {/* View Toggle + Legends */}
          <Stack spacing={0.5}>
            {/* View Toggle */}
            <ToggleButtonGroup
              value={isAdvancedView ? 'advanced' : 'basic'}
              exclusive
              onChange={(_, value) => value && setIsAdvancedView(value === 'advanced')}
              size="small"
              sx={{ mb: 0.5 }}
            >
              <ToggleButton value="basic">
                <Tooltip title="Basic View">
                  <ListIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="advanced">
                <Tooltip title="Network Topology">
                  <GraphIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>

            {/* Message Category Legend */}
            <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
              <Typography variant="caption" sx={{ fontSize: '0.55rem', color: 'text.secondary', mr: 0.5 }}>Messages:</Typography>
              {usedCategories.map(cat => (
                <Chip
                  key={cat.prefix}
                  label={`${cat.prefix} = ${cat.label}`}
                  size="small"
                  color={cat.color}
                  variant="outlined"
                  sx={{ height: 18, fontSize: '0.55rem' }}
                />
              ))}
            </Stack>
            {/* Entity Type Legend */}
            <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
              <Typography variant="caption" sx={{ fontSize: '0.55rem', color: 'text.secondary', mr: 0.5 }}>Entities:</Typography>
              {ENTITY_TYPE_LEGEND.map(entity => (
                <Chip
                  key={entity.type}
                  label={entity.type}
                  size="small"
                  color={entity.color === 'inherit' ? 'default' : entity.color}
                  variant="outlined"
                  sx={{ height: 18, fontSize: '0.55rem' }}
                />
              ))}
            </Stack>
          </Stack>

          {/* Action Buttons */}
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Copy as text">
              <IconButton size="small" onClick={copyAsText}>
                <CopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export as PNG">
              <IconButton size="small" onClick={exportAsPng}>
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Copy link">
              <IconButton size="small" onClick={copyLink}>
                <LinkIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Stack>

      <Box ref={graphRef}>

      <Stack spacing={2}>
        {steps.map((step) => {
          const msgDef = messageMap?.get(step.message_type);
          const actorIdx = actorOrder.get(step.actor) ?? 0;
          const targetIdx = step.target ? (actorOrder.get(step.target) ?? actorIdx + 1) : actorIdx + 1;
          const isReturn = step.target && targetIdx < actorIdx;
          const targetName = step.target || 'Next';
          const categoryColor = getCategoryColor(step.message_type);
          const timing = getTimingEstimate(step.message_type);
          const stepErrors = getErrorsForMessage(step.message_type);
          const isHighlighted = highlightedStep === step.step;
          const isDimmed = highlightedStep !== null && highlightedStep !== step.step;

          return (
            <Box
              key={step.step}
              component={motion.div}
              initial={{ opacity: 1 }}
              animate={{ opacity: isDimmed ? 0.4 : 1 }}
              onClick={() => setHighlightedStep(isHighlighted ? null : step.step)}
              sx={{
                cursor: 'pointer',
                p: 1.5,
                borderRadius: 1,
                border: isHighlighted ? 2 : 1,
                borderColor: isHighlighted ? `${categoryColor}.main` : 'transparent',
                bgcolor: isHighlighted ? `${categoryColor}.50` : 'transparent',
                transition: 'all 0.2s',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              {/* Action text */}
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', mb: 0.5, display: 'block' }}>
                {step.action}
              </Typography>

              {/* Step Row */}
              <Stack direction="row" alignItems="center" spacing={1}>
                {/* Step number with error indicator */}
                <Box sx={{ position: 'relative' }}>
                  <Chip
                    label={step.step}
                    size="small"
                    color={categoryColor}
                    sx={{ minWidth: 28, height: 24, fontWeight: 700 }}
                  />
                  {stepErrors.length > 0 && (
                    <Tooltip title={`${stepErrors.length} possible error(s)`}>
                      <WarningIcon
                        sx={{
                          position: 'absolute',
                          top: -6,
                          right: -6,
                          fontSize: 14,
                          color: 'error.main',
                          bgcolor: 'background.paper',
                          borderRadius: '50%',
                        }}
                      />
                    </Tooltip>
                  )}
                </Box>

                {/* Sender */}
                {(() => {
                  const senderInfo = getActorInfo(step.actor);
                  return (
                    <Paper elevation={1} sx={{ px: 1.5, py: 0.5, minWidth: 100 }}>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Box sx={{ color: `${senderInfo.color}.main` }}>{senderInfo.icon}</Box>
                        <Box>
                          <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.75rem', display: 'block', lineHeight: 1.2 }}>
                            {step.actor}
                          </Typography>
                          <Typography variant="caption" sx={{ fontSize: '0.55rem', color: `${senderInfo.color}.main`, fontWeight: 500 }}>
                            {senderInfo.type}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  );
                })()}

                {/* Arrow with category color */}
                <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 150 }}>
                  <Box sx={{ width: 20, height: 2, bgcolor: `${categoryColor}.main` }} />
                  <Box sx={{ flex: 1, height: 2, bgcolor: `${categoryColor}.main` }} />
                  <Box
                    sx={{
                      width: 0,
                      height: 0,
                      borderTop: '6px solid transparent',
                      borderBottom: '6px solid transparent',
                      borderLeft: '10px solid',
                      borderLeftColor: `${categoryColor}.main`,
                    }}
                  />
                </Box>

                {/* Receiver */}
                {(() => {
                  const receiverInfo = getActorInfo(targetName);
                  return (
                    <Paper elevation={1} sx={{ px: 1.5, py: 0.5, minWidth: 100, bgcolor: isReturn ? 'action.selected' : 'background.paper' }}>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Box sx={{ color: `${receiverInfo.color}.main` }}>{receiverInfo.icon}</Box>
                        <Box>
                          <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.75rem', display: 'block', lineHeight: 1.2 }}>
                            {targetName}
                          </Typography>
                          <Typography variant="caption" sx={{ fontSize: '0.55rem', color: `${receiverInfo.color}.main`, fontWeight: 500 }}>
                            {receiverInfo.type}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  );
                })()}
              </Stack>

              {/* Message info below arrow */}
              <Box sx={{ ml: 5, mt: 1, pl: 4 }}>
                <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                  <Chip
                    label={step.message_type}
                    size="small"
                    color={categoryColor}
                    onClick={(e) => { e.stopPropagation(); handleMessageClick(e, step); }}
                    sx={{ height: 22, fontSize: '0.65rem', fontFamily: 'var(--font-mono)', fontWeight: 600, cursor: 'pointer' }}
                  />
                  {msgDef && (
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      {msgDef.name}
                    </Typography>
                  )}
                  {isReturn && (
                    <Chip label="← response" size="small" variant="outlined" color="secondary" sx={{ height: 16, fontSize: '0.55rem' }} />
                  )}
                  <Tooltip title="Expected timing">
                    <Chip
                      icon={<TimingIcon sx={{ fontSize: 12 }} />}
                      label={timing}
                      size="small"
                      variant="outlined"
                      sx={{ height: 18, fontSize: '0.55rem' }}
                    />
                  </Tooltip>
                </Stack>

                {/* Key fields (show first 3) */}
                {step.key_fields.length > 0 && (
                  <Box sx={{ mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                      Key: {step.key_fields.slice(0, 3).join(' • ')}
                      {step.key_fields.length > 3 && ` +${step.key_fields.length - 3} more`}
                    </Typography>
                  </Box>
                )}

                {/* Error indicators */}
                {stepErrors.length > 0 && (
                  <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                    {stepErrors.slice(0, 2).map((err, i) => (
                      <Chip
                        key={i}
                        label={err.error_code}
                        size="small"
                        color="error"
                        variant="outlined"
                        component="a"
                        href={`/iso20022/error/${err.error_code}`}
                        clickable
                        sx={{ height: 16, fontSize: '0.55rem' }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ))}
                    {stepErrors.length > 2 && (
                      <Typography variant="caption" color="error" sx={{ fontSize: '0.55rem' }}>
                        +{stepErrors.length - 2} more
                      </Typography>
                    )}
                  </Stack>
                )}
              </Box>
            </Box>
          );
        })}
      </Stack>
      </Box>

      {/* Message Details Popover */}
      <Popover
        open={Boolean(popoverAnchor)}
        anchorEl={popoverAnchor}
        onClose={() => { setPopoverAnchor(null); setPopoverStep(null); setPopoverTab(0); }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        {popoverStep && (() => {
          const msgDef = messageMap?.get(popoverStep.message_type);
          return (
            <Box sx={{ width: 480, maxHeight: 500 }}>
              {/* Header */}
              <Box sx={{ p: 2, pb: 1, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  {popoverStep.message_type}
                </Typography>
                {msgDef && (
                  <Typography variant="body2" color="primary">
                    {msgDef.name}
                  </Typography>
                )}
              </Box>

              {/* Tabs */}
              <Tabs value={popoverTab} onChange={(_, v) => setPopoverTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', minHeight: 36 }}>
                <Tab label="Overview" sx={{ minHeight: 36, py: 0 }} />
                <Tab label="Fields" sx={{ minHeight: 36, py: 0 }} />
                <Tab label="XML" icon={<CodeIcon sx={{ fontSize: 14 }} />} iconPosition="start" sx={{ minHeight: 36, py: 0 }} />
              </Tabs>

              {/* Tab Content */}
              <Box sx={{ p: 2, maxHeight: 320, overflow: 'auto' }}>
                {/* Overview Tab */}
                {popoverTab === 0 && (
                  <Stack spacing={1.5}>
                    {msgDef?.purpose && (
                      <Box>
                        <Typography variant="caption" fontWeight={600} color="text.secondary">Purpose</Typography>
                        <Typography variant="body2">{msgDef.purpose}</Typography>
                      </Box>
                    )}
                    <Box>
                      <Typography variant="caption" fontWeight={600} color="text.secondary">Step Action</Typography>
                      <Typography variant="body2">{popoverStep.action}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" fontWeight={600} color="text.secondary">Technical Details</Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{popoverStep.technical}</Typography>
                    </Box>
                    {msgDef?.when_used && (
                      <Box>
                        <Typography variant="caption" fontWeight={600} color="text.secondary">When Used</Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{msgDef.when_used}</Typography>
                      </Box>
                    )}
                  </Stack>
                )}

                {/* Fields Tab */}
                {popoverTab === 1 && (
                  <Stack spacing={1}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                      Key elements in this message:
                    </Typography>
                    {msgDef?.key_elements && Object.entries(msgDef.key_elements).map(([field, desc]) => (
                      <Paper key={field} variant="outlined" sx={{ p: 1 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <RequiredIcon sx={{ fontSize: 14, color: 'success.main' }} />
                          <Typography variant="caption" fontFamily="var(--font-mono)" fontWeight={600} color="primary">
                            {field}
                          </Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary" sx={{ pl: 3, display: 'block' }}>
                          {desc}
                        </Typography>
                      </Paper>
                    ))}
                    {popoverStep.key_fields.length > 0 && (
                      <>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="caption" color="text.secondary">
                          Fields used in this step:
                        </Typography>
                        {popoverStep.key_fields.map((f, i) => (
                          <Chip key={i} label={f} size="small" variant="outlined" sx={{ mr: 0.5, mb: 0.5, fontSize: '0.65rem' }} />
                        ))}
                      </>
                    )}
                  </Stack>
                )}

                {/* XML Tab */}
                {popoverTab === 2 && (
                  <Box>
                    {msgDef?.sample_xml ? (
                      <>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                          <Typography variant="caption" color="text.secondary">Sample XML</Typography>
                          <IconButton
                            size="small"
                            onClick={() => navigator.clipboard.writeText(msgDef.sample_xml || '')}
                          >
                            <CopyIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Stack>
                        <Box
                          component="pre"
                          sx={{
                            p: 1.5,
                            bgcolor: 'grey.900',
                            color: 'grey.100',
                            borderRadius: 1,
                            fontSize: '0.65rem',
                            fontFamily: 'var(--font-mono)',
                            overflow: 'auto',
                            maxHeight: 250,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-all',
                            '& .xml-tag': { color: '#7dd3fc' },
                            '& .xml-attr': { color: '#fde68a' },
                            '& .xml-value': { color: '#86efac' },
                          }}
                        >
                          {msgDef.sample_xml}
                        </Box>
                      </>
                    ) : (
                      <Alert severity="info" sx={{ fontSize: '0.75rem' }}>
                        XML sample not available for this message type.
                      </Alert>
                    )}
                  </Box>
                )}
              </Box>

              {/* Footer */}
              <Box sx={{ p: 1.5, borderTop: 1, borderColor: 'divider', bgcolor: 'action.hover' }}>
                <Button
                  size="small"
                  href={`/iso20022/messages#${popoverStep.message_type}`}
                  fullWidth
                >
                  View Full Definition →
                </Button>
              </Box>
            </Box>
          );
        })()}
      </Popover>
    </Box>
  );
};

export const RealWorldExample: FC<RealWorldExampleProps> = ({
  example,
  defaultExpanded = false,
  messageMap
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [viewMode, setViewMode] = useState<'normal' | 'tree' | 'graph' | 'sequence' | 'quiz'>('normal');

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleViewModeChange = (
    _: React.MouseEvent<HTMLElement>,
    newMode: 'normal' | 'tree' | 'graph' | 'sequence' | 'quiz' | null
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
                      <ToggleButton value="quiz" aria-label="quiz mode">
                         <Tooltip title="Quiz Mode">
                          <QuizIcon fontSize="small" />
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
                      <GraphView steps={example.steps} messageMap={messageMap} possibleErrors={example.possible_errors} exampleId={example.id} characters={example.characters} />
                    ) : viewMode === 'sequence' ? (
                      // Sequence View
                      <SequenceView steps={example.steps} messageMap={messageMap} />
                    ) : (
                      // Quiz Mode
                      <QuizMode
                        steps={example.steps}
                        messageMap={messageMap}
                        characters={example.characters}
                        exampleTitle={example.title}
                        scenario={example.scenario}
                      />
                    )}
                  </Box>

                  {/* Flow Summary */}
                  <Paper
                    sx={{
                      mt: 2,
                      p: 1.5,
                      bgcolor: 'action.hover',
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  >
                    <Stack spacing={1}>
                      {/* Actor Flow */}
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Typography variant="caption" fontWeight={700} sx={{ minWidth: 55 }}>
                          Flow:
                        </Typography>
                        {(() => {
                          const actors: string[] = [];
                          example.steps.forEach((step) => {
                            if (!actors.includes(step.actor)) actors.push(step.actor);
                            if (step.target && !actors.includes(step.target)) actors.push(step.target);
                          });
                          return actors.map((actor, i) => (
                            <Stack key={actor} direction="row" alignItems="center" spacing={0.5}>
                              <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                                {actor}
                              </Typography>
                              {i < actors.length - 1 && (
                                <Typography variant="caption" color="text.secondary">→</Typography>
                              )}
                            </Stack>
                          ));
                        })()}
                      </Stack>

                      {/* Message Flow */}
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Typography variant="caption" fontWeight={700} sx={{ minWidth: 55 }}>
                          Messages:
                        </Typography>
                        {example.steps.map((step, i) => {
                          const msgDef = messageMap?.get(step.message_type);
                          const shortName = msgDef?.name?.split(' ')[0] || '';
                          return (
                            <Stack key={`${step.step}-${step.message_type}`} direction="row" alignItems="center" spacing={0.5}>
                              <Typography
                                variant="caption"
                                sx={{
                                  fontFamily: 'var(--font-mono)',
                                  fontSize: '0.65rem',
                                  color: 'primary.main',
                                  fontWeight: 600,
                                }}
                              >
                                {step.message_type}
                                {shortName && (
                                  <Typography component="span" variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary', ml: 0.3 }}>
                                    ({shortName})
                                  </Typography>
                                )}
                              </Typography>
                              {i < example.steps.length - 1 && (
                                <Typography variant="caption" color="text.secondary">→</Typography>
                              )}
                            </Stack>
                          );
                        })}
                      </Stack>

                      {/* Legacy MT Equivalents */}
                      {(() => {
                        const allMt = example.steps
                          .map((step) => messageMap?.get(step.message_type)?.mt_equivalent)
                          .filter((mt): mt is string[] => !!mt && mt.length > 0)
                          .flat()
                          .filter((mt) => mt.startsWith('MT')); // Only show actual MT messages
                        const uniqueMt = [...new Set(allMt)];
                        if (uniqueMt.length === 0) return null;
                        return (
                          <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
                            <Typography variant="caption" fontWeight={700} sx={{ minWidth: 55 }}>
                              Legacy:
                            </Typography>
                            {uniqueMt.map((mt) => (
                              <Chip
                                key={mt}
                                label={mt}
                                size="small"
                                variant="outlined"
                                sx={{
                                  height: 18,
                                  fontSize: '0.6rem',
                                  fontFamily: 'var(--font-mono)',
                                  bgcolor: 'background.paper',
                                }}
                              />
                            ))}
                          </Stack>
                        );
                      })()}
                    </Stack>
                  </Paper>

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