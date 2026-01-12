import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import type { FC } from 'react';
import html2canvas from 'html2canvas';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Panel,
  BackgroundVariant,
  Handle,
  Position,
  useReactFlow,
  ReactFlowProvider,
  BaseEdge,
  getSmoothStepPath,
  type EdgeProps,
} from '@xyflow/react';
import type { Node, Edge, NodeTypes, EdgeTypes } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import {
  Box,
  Typography,
  Chip,
  Stack,
  Paper,
  IconButton,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
  Slider,
  Modal,
  Fade,
  Divider,
  Tabs,
  Tab,
  Button,
} from '@mui/material';
import {
  AccountBalance as BankIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  AccountTree as TreeIcon,
  Timeline as TimelineIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  SkipNext as NextIcon,
  SkipPrevious as PrevIcon,
  Replay as ReplayIcon,
  Help as DecisionIcon,
  CheckCircle as SuccessIcon,
  Cancel as FailureIcon,
  Info as InfoIcon,
  Code as CodeIcon,
  ContentCopy as CopyIcon,
  Keyboard as KeyboardIcon,
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  CenterFocusStrong as AutoZoomIcon,
} from '@mui/icons-material';
import type { Step as StepType, PossibleError, Character } from '../../hooks/useRealWorldExamples';
import type { MessageDefinition } from '../../hooks/useMessageDefinitions';

// Custom entity node component
const EntityNode: FC<{ data: EntityNodeData }> = ({ data }) => {
  const { label, type, color, isActive, onClick, character } = data;

  const IconComponent = type === 'Bank' || type === 'Clearing' || type === 'Custodian'
    ? BankIcon
    : type === 'Corporate'
      ? BusinessIcon
      : PersonIcon;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) onClick({ label, type, color, character });
  };

  return (
    <Box
      onClick={handleClick}
      sx={{
        bgcolor: isActive ? `${color}15` : '#1e293b',
        border: 2,
        borderColor: isActive ? color : `${color}60`,
        borderRadius: 2,
        p: 1.5,
        minWidth: 100,
        textAlign: 'center',
        boxShadow: isActive ? `0 0 25px ${color}80` : `0 4px 12px rgba(0,0,0,0.4)`,
        transition: 'all 0.3s ease',
        transform: isActive ? 'scale(1.05)' : 'scale(1)',
        cursor: 'pointer',
        '&:hover': { borderColor: color, boxShadow: `0 0 20px ${color}60` },
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: color, width: 8, height: 8, border: 'none' }} />
      <Handle type="source" position={Position.Bottom} style={{ background: color, width: 8, height: 8, border: 'none' }} />
      <Handle type="target" position={Position.Left} id="left" style={{ background: color, width: 8, height: 8, border: 'none' }} />
      <Handle type="source" position={Position.Right} id="right" style={{ background: color, width: 8, height: 8, border: 'none' }} />

      <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: `${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 0.5 }}>
        <IconComponent sx={{ color, fontSize: 18 }} />
      </Box>
      <Typography variant="caption" sx={{ color: '#f1f5f9', fontWeight: 700, fontSize: '0.65rem', display: 'block', lineHeight: 1.2 }}>
        {label.length > 12 ? label.substring(0, 10) + '...' : label}
      </Typography>
      <Chip label={type} size="small" sx={{ mt: 0.25, height: 14, fontSize: '0.5rem', bgcolor: `${color}30`, color }} />
      {character && (
        <InfoIcon sx={{ position: 'absolute', top: 4, right: 4, fontSize: 12, color: `${color}80` }} />
      )}
    </Box>
  );
};

// Decision node (diamond shape)
const DecisionNode: FC<{ data: DecisionNodeData }> = ({ data }) => {
  const { question, isActive } = data;

  return (
    <Box
      sx={{
        width: 120,
        height: 120,
        transform: 'rotate(45deg)',
        bgcolor: isActive ? '#fbbf2430' : '#1e293b',
        border: 2,
        borderColor: isActive ? '#fbbf24' : '#f59e0b80',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: isActive ? '0 0 30px #fbbf2480' : '0 4px 12px rgba(0,0,0,0.4)',
        transition: 'all 0.3s ease',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: '#fbbf24', width: 10, height: 10, border: 'none', transform: 'rotate(-45deg)', top: -5, left: '50%' }} />
      <Handle type="source" position={Position.Bottom} id="success" style={{ background: '#22c55e', width: 10, height: 10, border: 'none', transform: 'rotate(-45deg)', bottom: -5, left: '50%' }} />
      <Handle type="source" position={Position.Right} id="failure" style={{ background: '#ef4444', width: 10, height: 10, border: 'none', transform: 'rotate(-45deg)', right: -5, top: '50%' }} />

      <Box sx={{ transform: 'rotate(-45deg)', textAlign: 'center', p: 1 }}>
        <DecisionIcon sx={{ color: '#fbbf24', fontSize: 20, mb: 0.5 }} />
        <Typography variant="caption" sx={{ color: '#fbbf24', fontSize: '0.55rem', fontWeight: 600, display: 'block', lineHeight: 1.2 }}>
          {question || 'Decision'}
        </Typography>
      </Box>
    </Box>
  );
};

// Step node (message step)
const StepNode: FC<{ data: StepNodeData }> = ({ data }) => {
  const { step, messageType, action, branchType, isActive, color, onClick, stepData, msgDef } = data;

  const bgColor = branchType === 'success' ? '#22c55e' : branchType === 'failure' ? '#ef4444' : color;
  const BranchIcon = branchType === 'success' ? SuccessIcon : branchType === 'failure' ? FailureIcon : null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick && stepData) onClick({ step: stepData, msgDef });
  };

  return (
    <Box
      onClick={handleClick}
      sx={{
        bgcolor: isActive ? `${bgColor}20` : '#1e293b',
        border: 2,
        borderColor: isActive ? bgColor : `${bgColor}60`,
        borderRadius: 1,
        p: 1,
        minWidth: 140,
        boxShadow: isActive ? `0 0 25px ${bgColor}60` : '0 4px 12px rgba(0,0,0,0.4)',
        transition: 'all 0.3s ease',
        transform: isActive ? 'scale(1.05)' : 'scale(1)',
        borderLeft: branchType ? `4px solid ${bgColor}` : undefined,
        cursor: 'pointer',
        '&:hover': { borderColor: bgColor, boxShadow: `0 0 20px ${bgColor}50` },
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: bgColor, width: 8, height: 8, border: 'none' }} />
      <Handle type="source" position={Position.Bottom} style={{ background: bgColor, width: 8, height: 8, border: 'none' }} />
      <Handle type="target" position={Position.Left} id="left" style={{ background: bgColor, width: 8, height: 8, border: 'none' }} />
      <Handle type="source" position={Position.Right} id="right" style={{ background: bgColor, width: 8, height: 8, border: 'none' }} />

      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
        <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: bgColor, color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700 }}>
          {step}
        </Box>
        <Chip label={messageType} size="small" sx={{ height: 16, fontSize: '0.55rem', fontFamily: 'var(--font-mono)', bgcolor: `${bgColor}30`, color: bgColor, fontWeight: 600 }} />
        {BranchIcon && <BranchIcon sx={{ fontSize: 14, color: bgColor }} />}
      </Stack>
      <Typography variant="caption" sx={{ color: '#e2e8f0', fontSize: '0.6rem', display: 'block', lineHeight: 1.3 }}>
        {action.length > 35 ? action.substring(0, 32) + '...' : action}
      </Typography>
      {msgDef && (
        <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.5rem', display: 'block', mt: 0.25 }}>
          {msgDef.name}
        </Typography>
      )}
    </Box>
  );
};

interface EntityNodeData {
  label: string;
  type: string;
  color: string;
  isActive: boolean;
  stepCount: number;
  onClick?: (data: { label: string; type: string; color: string; character?: Character }) => void;
  character?: Character;
}
interface DecisionNodeData { question: string; isActive: boolean; }
interface StepNodeData {
  step: number;
  messageType: string;
  action: string;
  branchType?: string;
  isActive: boolean;
  color: string;
  onClick?: (data: { step: StepType; msgDef?: MessageDefinition }) => void;
  stepData?: StepType;
  msgDef?: MessageDefinition;
}

// Animated edge with traveling dot
interface AnimatedEdgeData {
  isCurrentStep?: boolean;
  isPlaying?: boolean;
  color?: string;
  playSpeed?: number;
}

const AnimatedEdge: FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  label,
  labelStyle,
  labelBgStyle,
  labelBgPadding,
  labelBgBorderRadius,
  data,
}) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 10,
  });

  const edgeData = data as AnimatedEdgeData | undefined;
  const isActive = edgeData?.isCurrentStep && edgeData?.isPlaying;
  const edgeColor = edgeData?.color || (style?.stroke as string) || '#60a5fa';
  const duration = ((edgeData?.playSpeed || 1500) / 1000) * 0.6; // 60% of step duration

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={style}
      />
      {/* Label */}
      {label && (
        <g transform={`translate(${labelX}, ${labelY})`}>
          <rect
            x={-((labelBgPadding as [number, number])?.[0] ?? 4) - String(label).length * 3}
            y={-((labelBgPadding as [number, number])?.[1] ?? 4) - 6}
            width={String(label).length * 6 + ((labelBgPadding as [number, number])?.[0] ?? 4) * 2}
            height={16 + ((labelBgPadding as [number, number])?.[1] ?? 4)}
            rx={labelBgBorderRadius || 4}
            fill={(labelBgStyle as React.CSSProperties)?.fill || '#0f172a'}
            fillOpacity={(labelBgStyle as React.CSSProperties)?.fillOpacity || 0.9}
          />
          <text
            style={{
              fontSize: 10,
              fontWeight: 600,
              ...(labelStyle as React.CSSProperties),
            }}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {label as string}
          </text>
        </g>
      )}
      {/* Animated traveling dot */}
      {isActive && (
        <g>
          <animateMotion
            dur={`${duration}s`}
            repeatCount="indefinite"
            path={edgePath}
          />
          {/* Glowing trail effect */}
          <circle r={6} fill={`${edgeColor}30`} />
          {/* Main dot */}
          <circle r={4} fill={edgeColor} />
          {/* Bright center */}
          <circle r={2} fill="#ffffff" />
        </g>
      )}
    </>
  );
};

const nodeTypes: NodeTypes = {
  entity: EntityNode,
  decision: DecisionNode,
  stepNode: StepNode,
};

const edgeTypes: EdgeTypes = {
  animated: AnimatedEdge,
};

// Layout with dagre
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction: 'TB' | 'LR' = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction, nodesep: 80, ranksep: 100, marginx: 50, marginy: 50 });

  nodes.forEach((node) => {
    const width = node.type === 'decision' ? 120 : node.type === 'stepNode' ? 160 : 120;
    const height = node.type === 'decision' ? 120 : node.type === 'stepNode' ? 70 : 90;
    dagreGraph.setNode(node.id, { width, height });
  });

  edges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target));
  dagre.layout(dagreGraph);

  return {
    nodes: nodes.map((node) => {
      const pos = dagreGraph.node(node.id);
      const width = node.type === 'decision' ? 120 : node.type === 'stepNode' ? 160 : 120;
      const height = node.type === 'decision' ? 120 : node.type === 'stepNode' ? 70 : 90;
      return { ...node, position: { x: pos.x - width / 2, y: pos.y - height / 2 } };
    }),
    edges,
  };
};

const getEdgeColor = (messageType: string): string => {
  if (messageType.startsWith('pain')) return '#60a5fa';
  if (messageType.startsWith('pacs')) return '#34d399';
  if (messageType.startsWith('camt')) return '#fbbf24';
  if (messageType.startsWith('acmt')) return '#22d3ee';
  if (messageType.startsWith('sese') || messageType.startsWith('semt')) return '#a78bfa';
  return '#94a3b8';
};

const getActorInfo = (name: string): { type: string; color: string } => {
  const lower = name.toLowerCase();
  if (lower.includes('fed') || lower.includes('clearing') || lower.includes('reserve') || lower.includes('chips')) return { type: 'Clearing', color: '#f59e0b' };
  if (lower.includes('csd') || lower.includes('custod') || lower.includes('dtcc') || lower.includes('euroclear')) return { type: 'Custodian', color: '#06b6d4' };
  if (lower.includes('bank') || lower.includes('chase') || lower.includes('hsbc') || lower.includes('barclays') || lower.includes('wells') || lower.includes('morgan') || lower.includes('goldman')) return { type: 'Bank', color: '#3b82f6' };
  if (lower.includes('corp') || lower.includes('ltd') || lower.includes('inc') || lower.includes('gmbh') || lower.includes('global')) return { type: 'Corporate', color: '#8b5cf6' };
  return { type: 'Individual', color: '#64748b' };
};

interface ReactFlowGraphProps {
  steps: StepType[];
  messageMap?: Map<string, MessageDefinition>;
  possibleErrors?: PossibleError[];
  characters?: Record<string, Character>;
  exampleId?: string;
}

// Inner component that uses useReactFlow (must be inside ReactFlowProvider)
const ReactFlowGraphInner: FC<ReactFlowGraphProps> = ({ steps, messageMap, characters = {}, exampleId }) => {
  const [layout, setLayout] = useState<'TB' | 'LR'>('TB');
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1500);
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [autoZoom, setAutoZoom] = useState(true);

  // Get React Flow instance for auto-zoom
  const reactFlowInstance = useReactFlow();

  // Modal states for clickable nodes
  const [entityModalOpen, setEntityModalOpen] = useState(false);
  const [entityModalData, setEntityModalData] = useState<{ label: string; type: string; color: string; character?: Character } | null>(null);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageModalData, setMessageModalData] = useState<{ step: StepType; msgDef?: MessageDefinition } | null>(null);
  const [messageModalTab, setMessageModalTab] = useState(0);

  // Click handlers for nodes
  const handleEntityClick = useCallback((data: { label: string; type: string; color: string; character?: Character }) => {
    setEntityModalData(data);
    setEntityModalOpen(true);
  }, []);

  const handleStepClick = useCallback((data: { step: StepType; msgDef?: MessageDefinition }) => {
    setMessageModalData(data);
    setMessageModalTab(0);
    setMessageModalOpen(true);
  }, []);

  // Check if flow has branches
  const hasBranches = steps.some(s => s.decision_point || s.branch_type);

  // Build nodes and edges
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const actorSet = new Set<string>();

    // Collect actors
    steps.forEach(s => {
      actorSet.add(s.actor);
      if (s.target) actorSet.add(s.target);
    });

    // If has branches, create step-based flow
    if (hasBranches) {
      // Create step nodes
      steps.forEach((step, index) => {
        const color = getEdgeColor(step.message_type);

        if (step.decision_point) {
          // Decision node
          nodes.push({
            id: `step-${step.step}`,
            type: 'decision',
            position: { x: 0, y: 0 },
            data: { question: step.decision_question || 'Decision?', isActive: currentStep === index },
          });
        } else {
          // Regular step node
          const msgDef = messageMap?.get(step.message_type);
          nodes.push({
            id: `step-${step.step}`,
            type: 'stepNode',
            position: { x: 0, y: 0 },
            data: {
              step: step.step,
              messageType: step.message_type,
              action: step.action,
              branchType: step.branch_type,
              isActive: currentStep === index,
              color,
              onClick: handleStepClick,
              stepData: step,
              msgDef,
            },
          });
        }

        // Create edges
        if (step.decision_point && step.branches) {
          // Success branch edge
          edges.push({
            id: `edge-${step.step}-success`,
            source: `step-${step.step}`,
            target: `step-${step.branches.success.next_step}`,
            sourceHandle: 'success',
            type: 'animated',
            style: { stroke: '#22c55e', strokeWidth: 2 },
            label: step.branches.success.condition,
            labelStyle: { fill: '#22c55e', fontSize: 9, fontWeight: 600 },
            labelBgStyle: { fill: '#0f172a', fillOpacity: 0.9 },
            labelBgPadding: [4, 6] as [number, number],
            labelBgBorderRadius: 4,
            markerEnd: { type: MarkerType.ArrowClosed, color: '#22c55e' },
            data: { isCurrentStep: currentStep === index, isPlaying, color: '#22c55e', playSpeed },
          });
          // Failure branch edge
          edges.push({
            id: `edge-${step.step}-failure`,
            source: `step-${step.step}`,
            target: `step-${step.branches.failure.next_step}`,
            sourceHandle: 'failure',
            type: 'animated',
            style: { stroke: '#ef4444', strokeWidth: 2 },
            label: step.branches.failure.condition,
            labelStyle: { fill: '#ef4444', fontSize: 9, fontWeight: 600 },
            labelBgStyle: { fill: '#0f172a', fillOpacity: 0.9 },
            labelBgPadding: [4, 6] as [number, number],
            labelBgBorderRadius: 4,
            markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' },
            data: { isCurrentStep: currentStep === index, isPlaying, color: '#ef4444', playSpeed },
          });
        } else if (index < steps.length - 1) {
          // Find next step in same branch
          const nextStep = steps[index + 1];
          const isSameBranch = !step.branch_type || step.branch_type === nextStep.branch_type;
          const isEndOfBranch = step.branch_label?.includes('End');

          if (isSameBranch && !isEndOfBranch && !nextStep.decision_point) {
            const edgeColor = step.branch_type === 'success' ? '#22c55e' : step.branch_type === 'failure' ? '#ef4444' : color;
            edges.push({
              id: `edge-${step.step}-${nextStep.step}`,
              source: `step-${step.step}`,
              target: `step-${nextStep.step}`,
              type: 'animated',
              style: { stroke: edgeColor, strokeWidth: 2 },
              markerEnd: { type: MarkerType.ArrowClosed, color: edgeColor },
              data: { isCurrentStep: currentStep === index, isPlaying, color: edgeColor, playSpeed },
            });
          }
        }
      });
    } else {
      // Simple entity-based flow (original logic)
      const actors = Array.from(actorSet);
      actors.forEach(actor => {
        const info = getActorInfo(actor);
        const isActive = steps[currentStep]?.actor === actor || steps[currentStep]?.target === actor;
        // Find character data if available
        const character = Object.values(characters).find(c => c.name === actor);
        nodes.push({
          id: actor,
          type: 'entity',
          position: { x: 0, y: 0 },
          data: {
            label: actor,
            type: info.type,
            color: info.color,
            isActive,
            stepCount: steps.filter(s => s.actor === actor).length,
            onClick: handleEntityClick,
            character,
          },
        });
      });

      steps.forEach((step, index) => {
        const target = step.target || actors[(actors.indexOf(step.actor) + 1) % actors.length];
        const color = getEdgeColor(step.message_type);
        const msgDef = messageMap?.get(step.message_type);
        const isCurrentEdge = currentStep === index;
        edges.push({
          id: `edge-${step.step}`,
          source: step.actor,
          target,
          type: 'animated',
          style: { stroke: color, strokeWidth: isCurrentEdge ? 3 : 2, opacity: isCurrentEdge ? 1 : 0.6 },
          markerEnd: { type: MarkerType.ArrowClosed, color, width: 20, height: 20 },
          label: `${step.step}: ${step.message_type}`,
          labelStyle: { fill: color, fontWeight: 600, fontSize: 10 },
          labelBgStyle: { fill: '#0f172a', fillOpacity: 0.9 },
          labelBgPadding: [4, 8] as [number, number],
          labelBgBorderRadius: 4,
          data: { step, color, msgDef, isCurrentStep: isCurrentEdge, isPlaying, playSpeed },
        });
      });
    }

    return { initialNodes: nodes, initialEdges: edges };
  }, [steps, currentStep, hasBranches, characters, handleEntityClick, handleStepClick, messageMap, isPlaying, playSpeed]);

  // Apply layout
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    return getLayoutedElements(initialNodes, initialEdges, layout);
  }, [initialNodes, initialEdges, layout]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  useEffect(() => {
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [layoutedNodes, layoutedEdges, setNodes, setEdges]);

  // Playback controls
  const play = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
      playIntervalRef.current = null;
    }
  }, []);

  const nextStepHandler = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  }, [steps.length]);

  const prevStepHandler = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  const reset = useCallback(() => {
    pause();
    setCurrentStep(0);
  }, [pause]);

  // Auto-play effect
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playSpeed);
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, playSpeed, steps.length]);

  // Auto-zoom to current step during playback
  useEffect(() => {
    if (!autoZoom || !reactFlowInstance) return;

    // Find the node ID for the current step
    const hasBranches = steps.some(s => s.decision_point || s.branch_type);
    const currentStepObj = steps[currentStep];
    if (!currentStepObj) return;

    let targetNodeId: string;

    if (hasBranches) {
      // In branching mode, nodes are named step-{stepNumber}
      targetNodeId = `step-${currentStepObj.step}`;
    } else {
      // In simple mode, active node is the actor of current step
      targetNodeId = currentStepObj.actor;
    }

    // Small delay to ensure nodes are rendered
    const timer = setTimeout(() => {
      const targetNode = reactFlowInstance.getNode(targetNodeId);
      if (targetNode && targetNode.position) {
        // Calculate center of the node
        const nodeWidth = targetNode.measured?.width || targetNode.width || 100;
        const nodeHeight = targetNode.measured?.height || targetNode.height || 50;
        const x = targetNode.position.x + nodeWidth / 2;
        const y = targetNode.position.y + nodeHeight / 2;

        // For large graphs (many steps), zoom out a bit to show context
        const currentZoom = reactFlowInstance.getZoom();
        const targetZoom = steps.length > 50 ? Math.max(0.5, Math.min(currentZoom, 0.8)) : currentZoom;

        reactFlowInstance.setCenter(x, y, {
          duration: 350,
          zoom: targetZoom,
        });
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [currentStep, autoZoom, reactFlowInstance, steps]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      // Ignore if modals are open
      if (entityModalOpen || messageModalOpen) return;

      switch (e.key) {
        case 'ArrowRight':
        case 'l': // vim-style
          e.preventDefault();
          nextStepHandler();
          break;
        case 'ArrowLeft':
        case 'h': // vim-style
          e.preventDefault();
          prevStepHandler();
          break;
        case ' ': // Space for play/pause
          e.preventDefault();
          if (isPlaying) pause();
          else play();
          break;
        case 'r': // Reset
        case 'Home':
          e.preventDefault();
          reset();
          break;
        case 'End':
          e.preventDefault();
          setCurrentStep(steps.length - 1);
          break;
        case '1': case '2': case '3': case '4': case '5':
        case '6': case '7': case '8': case '9':
          e.preventDefault();
          const stepNum = parseInt(e.key) - 1;
          if (stepNum < steps.length) setCurrentStep(stepNum);
          break;
        case 'Escape':
          e.preventDefault();
          pause();
          setEntityModalOpen(false);
          setMessageModalOpen(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, play, pause, nextStepHandler, prevStepHandler, reset, steps.length, entityModalOpen, messageModalOpen]);

  // Export as PNG
  const exportAsPng = useCallback(async () => {
    if (!containerRef.current) return;
    try {
      // Hide panels temporarily for cleaner export
      const panels = containerRef.current.querySelectorAll('.react-flow__panel');
      panels.forEach(p => (p as HTMLElement).style.display = 'none');

      const canvas = await html2canvas(containerRef.current, {
        backgroundColor: '#0f172a',
        scale: 2, // Higher quality
        logging: false,
      });

      // Restore panels
      panels.forEach(p => (p as HTMLElement).style.display = '');

      const link = document.createElement('a');
      link.download = `payment-flow-${exampleId || 'export'}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
    }
  }, [exampleId]);

  // Export as PDF
  const exportAsPdf = useCallback(async () => {
    if (!containerRef.current) return;
    try {
      // Hide panels temporarily for cleaner export
      const panels = containerRef.current.querySelectorAll('.react-flow__panel');
      panels.forEach(p => (p as HTMLElement).style.display = 'none');

      const canvas = await html2canvas(containerRef.current, {
        backgroundColor: '#0f172a',
        scale: 2,
        logging: false,
      });

      // Restore panels
      panels.forEach(p => (p as HTMLElement).style.display = '');

      const imgData = canvas.toDataURL('image/png');
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`payment-flow-${exampleId || 'export'}-${Date.now()}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
    }
  }, [exampleId]);

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    const step = edge.data?.step as StepType | undefined;
    const msgDef = edge.data?.msgDef as MessageDefinition | undefined;
    if (step) {
      setMessageModalData({ step, msgDef });
      setMessageModalTab(0);
      setMessageModalOpen(true);
    }
  }, []);

  const currentStepData = steps[currentStep];

  return (
    <Box ref={containerRef} sx={{ width: '100%', height: 650, bgcolor: '#0f172a', borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onEdgeClick={onEdgeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.1}
        maxZoom={2}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#334155" />
        <Controls style={{ background: '#1e293b', border: '1px solid #334155' }} />
        <MiniMap nodeColor={(node) => {
          if (node.type === 'decision') return '#fbbf24';
          const data = node.data as unknown as StepNodeData | EntityNodeData;
          return 'color' in data ? data.color : '#64748b';
        }} maskColor="rgba(15,23,42,0.8)" style={{ background: '#1e293b', border: '1px solid #334155' }} />

        {/* Layout Toggle */}
        <Panel position="top-left">
          <Paper sx={{ bgcolor: 'rgba(30,41,59,0.95)', p: 1, borderRadius: 1, border: 1, borderColor: '#334155' }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.6rem' }}>Layout:</Typography>
              <ToggleButtonGroup value={layout} exclusive onChange={(_, v) => v && setLayout(v)} size="small" sx={{ '.MuiToggleButton-root': { color: '#94a3b8', borderColor: '#334155', px: 0.75, py: 0.25, '&.Mui-selected': { bgcolor: '#334155', color: '#f1f5f9' } } }}>
                <ToggleButton value="TB"><Tooltip title="Top-Down"><TreeIcon sx={{ fontSize: 14 }} /></Tooltip></ToggleButton>
                <ToggleButton value="LR"><Tooltip title="Left-Right"><TimelineIcon sx={{ fontSize: 14 }} /></Tooltip></ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          </Paper>
        </Panel>

        {/* Playback Controls */}
        <Panel position="bottom-center">
          <Paper sx={{ bgcolor: 'rgba(30,41,59,0.98)', p: 1.5, borderRadius: 2, border: 1, borderColor: '#334155', minWidth: 400 }}>
            <Stack spacing={1}>
              {/* Progress bar */}
              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.6rem', minWidth: 50 }}>
                  Step {currentStep + 1}/{steps.length}
                </Typography>
                <Slider
                  value={currentStep}
                  min={0}
                  max={steps.length - 1}
                  onChange={(_, v) => setCurrentStep(v as number)}
                  sx={{ color: '#60a5fa', '& .MuiSlider-thumb': { width: 12, height: 12 }, '& .MuiSlider-track': { height: 4 }, '& .MuiSlider-rail': { height: 4, bgcolor: '#334155' } }}
                />
              </Stack>

              {/* Controls */}
              <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
                <Tooltip title="Reset"><IconButton size="small" onClick={reset} sx={{ color: '#94a3b8' }}><ReplayIcon fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Previous"><IconButton size="small" onClick={prevStepHandler} disabled={currentStep === 0} sx={{ color: '#94a3b8' }}><PrevIcon fontSize="small" /></IconButton></Tooltip>
                <Tooltip title={isPlaying ? 'Pause' : 'Play'}>
                  <IconButton onClick={isPlaying ? pause : play} sx={{ bgcolor: '#3b82f6', color: '#fff', '&:hover': { bgcolor: '#2563eb' }, width: 40, height: 40 }}>
                    {isPlaying ? <PauseIcon /> : <PlayIcon />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Next"><IconButton size="small" onClick={nextStepHandler} disabled={currentStep === steps.length - 1} sx={{ color: '#94a3b8' }}><NextIcon fontSize="small" /></IconButton></Tooltip>
                <Box sx={{ ml: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.55rem' }}>Speed:</Typography>
                  <ToggleButtonGroup value={playSpeed} exclusive onChange={(_, v) => v && setPlaySpeed(v)} size="small" sx={{ '.MuiToggleButton-root': { color: '#94a3b8', borderColor: '#334155', px: 0.5, py: 0, fontSize: '0.55rem', '&.Mui-selected': { bgcolor: '#334155', color: '#f1f5f9' } } }}>
                    <ToggleButton value={2500}>0.5x</ToggleButton>
                    <ToggleButton value={1500}>1x</ToggleButton>
                    <ToggleButton value={800}>2x</ToggleButton>
                  </ToggleButtonGroup>
                </Box>
                <Divider orientation="vertical" flexItem sx={{ borderColor: '#334155', mx: 1 }} />
                <Tooltip title={autoZoom ? 'Auto-zoom ON (follows current step)' : 'Auto-zoom OFF'}>
                  <IconButton
                    size="small"
                    onClick={() => setAutoZoom(!autoZoom)}
                    sx={{ color: autoZoom ? '#60a5fa' : '#64748b' }}
                  >
                    <AutoZoomIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title={
                  <Stack spacing={0.5} sx={{ p: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>Keyboard Shortcuts</Typography>
                    <Typography variant="caption">← → or H L: Prev/Next step</Typography>
                    <Typography variant="caption">Space: Play/Pause</Typography>
                    <Typography variant="caption">1-9: Jump to step</Typography>
                    <Typography variant="caption">R or Home: Reset</Typography>
                    <Typography variant="caption">End: Jump to last</Typography>
                    <Typography variant="caption">Esc: Close modals</Typography>
                  </Stack>
                }>
                  <IconButton size="small" sx={{ color: '#64748b' }}>
                    <KeyboardIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Export as PNG">
                  <IconButton size="small" onClick={exportAsPng} sx={{ color: '#64748b' }}>
                    <DownloadIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Export as PDF">
                  <IconButton size="small" onClick={exportAsPdf} sx={{ color: '#64748b' }}>
                    <PdfIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </Stack>

              {/* Current step info */}
              {currentStepData && (
                <Box sx={{ bgcolor: 'rgba(0,0,0,0.3)', p: 1, borderRadius: 1, mt: 0.5 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Chip label={currentStepData.message_type} size="small" sx={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', bgcolor: `${getEdgeColor(currentStepData.message_type)}30`, color: getEdgeColor(currentStepData.message_type), fontWeight: 600 }} />
                    {currentStepData.branch_type && (
                      <Chip
                        icon={currentStepData.branch_type === 'success' ? <SuccessIcon sx={{ fontSize: 12 }} /> : <FailureIcon sx={{ fontSize: 12 }} />}
                        label={currentStepData.branch_type === 'success' ? 'Success Path' : 'Failure Path'}
                        size="small"
                        sx={{ fontSize: '0.55rem', bgcolor: currentStepData.branch_type === 'success' ? '#22c55e30' : '#ef444430', color: currentStepData.branch_type === 'success' ? '#22c55e' : '#ef4444' }}
                      />
                    )}
                    <Typography variant="caption" sx={{ color: '#e2e8f0', fontSize: '0.7rem', flex: 1 }}>
                      {currentStepData.action}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.6rem', display: 'block', mt: 0.5 }}>
                    {currentStepData.actor} → {currentStepData.target || 'Next'}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Paper>
        </Panel>

        {/* Stats */}
        <Panel position="top-right">
          <Paper sx={{ bgcolor: 'rgba(30,41,59,0.95)', p: 1.5, borderRadius: 1, border: 1, borderColor: '#334155' }}>
            <Stack direction="row" spacing={2}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ color: '#60a5fa', fontWeight: 700, fontSize: '1.25rem', lineHeight: 1 }}>{new Set(steps.flatMap(s => [s.actor, s.target].filter(Boolean))).size}</Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.55rem' }}>Entities</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ color: '#34d399', fontWeight: 700, fontSize: '1.25rem', lineHeight: 1 }}>{steps.length}</Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.55rem' }}>Steps</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ color: '#fbbf24', fontWeight: 700, fontSize: '1.25rem', lineHeight: 1 }}>{new Set(steps.map(s => s.message_type)).size}</Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.55rem' }}>Msg Types</Typography>
              </Box>
            </Stack>
          </Paper>
        </Panel>

        {/* Branch Legend (if has branches) */}
        {hasBranches && (
          <Panel position="bottom-left">
            <Paper sx={{ bgcolor: 'rgba(30,41,59,0.95)', p: 1.5, borderRadius: 1, border: 1, borderColor: '#334155' }}>
              <Typography variant="caption" sx={{ color: '#e2e8f0', fontWeight: 700, mb: 1, display: 'block', fontSize: '0.6rem' }}>FLOW PATHS</Typography>
              <Stack spacing={0.5}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{ width: 20, height: 3, bgcolor: '#22c55e', borderRadius: 1 }} />
                  <SuccessIcon sx={{ fontSize: 12, color: '#22c55e' }} />
                  <Typography variant="caption" sx={{ color: '#22c55e', fontSize: '0.55rem' }}>Success Path</Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{ width: 20, height: 3, bgcolor: '#ef4444', borderRadius: 1 }} />
                  <FailureIcon sx={{ fontSize: 12, color: '#ef4444' }} />
                  <Typography variant="caption" sx={{ color: '#ef4444', fontSize: '0.55rem' }}>Failure Path</Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <DecisionIcon sx={{ fontSize: 14, color: '#fbbf24' }} />
                  <Typography variant="caption" sx={{ color: '#fbbf24', fontSize: '0.55rem' }}>Decision Point</Typography>
                </Stack>
              </Stack>
            </Paper>
          </Panel>
        )}
      </ReactFlow>

      {/* Entity Details Modal */}
      <Modal
        open={entityModalOpen}
        onClose={() => setEntityModalOpen(false)}
        closeAfterTransition
      >
        <Fade in={entityModalOpen}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: '#1e293b',
            border: '2px solid',
            borderColor: entityModalData?.color || '#64748b',
            borderRadius: 3,
            boxShadow: `0 0 40px ${entityModalData?.color}40`,
            p: 3,
          }}>
            {entityModalData && (
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{
                      width: 48, height: 48, borderRadius: '50%',
                      bgcolor: `${entityModalData.color}20`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: 2, borderColor: entityModalData.color
                    }}>
                      {entityModalData.type === 'Bank' || entityModalData.type === 'Clearing' || entityModalData.type === 'Custodian'
                        ? <BankIcon sx={{ color: entityModalData.color, fontSize: 24 }} />
                        : entityModalData.type === 'Corporate'
                          ? <BusinessIcon sx={{ color: entityModalData.color, fontSize: 24 }} />
                          : <PersonIcon sx={{ color: entityModalData.color, fontSize: 24 }} />
                      }
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.1rem' }}>
                        {entityModalData.label}
                      </Typography>
                      <Chip
                        label={entityModalData.type}
                        size="small"
                        sx={{ bgcolor: `${entityModalData.color}30`, color: entityModalData.color, fontWeight: 600, fontSize: '0.7rem' }}
                      />
                    </Box>
                  </Stack>
                  <IconButton onClick={() => setEntityModalOpen(false)} sx={{ color: '#94a3b8' }}>
                    <CloseIcon />
                  </IconButton>
                </Stack>

                <Divider sx={{ borderColor: '#334155' }} />

                {entityModalData.character ? (
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Role</Typography>
                      <Typography variant="body2" sx={{ color: '#e2e8f0' }}>{entityModalData.character.role}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Country</Typography>
                      <Typography variant="body2" sx={{ color: '#e2e8f0' }}>{entityModalData.character.country}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Bank</Typography>
                      <Typography variant="body2" sx={{ color: '#e2e8f0' }}>{entityModalData.character.bank}</Typography>
                    </Box>
                  </Stack>
                ) : (
                  <Typography variant="body2" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>
                    No additional character details available.
                  </Typography>
                )}
              </Stack>
            )}
          </Box>
        </Fade>
      </Modal>

      {/* Message Details Modal */}
      <Modal
        open={messageModalOpen}
        onClose={() => setMessageModalOpen(false)}
        closeAfterTransition
      >
        <Fade in={messageModalOpen}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 520,
            maxHeight: '80vh',
            bgcolor: '#1e293b',
            border: '2px solid',
            borderColor: messageModalData ? getEdgeColor(messageModalData.step.message_type) : '#64748b',
            borderRadius: 3,
            boxShadow: `0 0 40px ${messageModalData ? getEdgeColor(messageModalData.step.message_type) : '#64748b'}40`,
            overflow: 'hidden',
          }}>
            {messageModalData && (
              <>
                {/* Header */}
                <Box sx={{ p: 2, bgcolor: '#0f172a', borderBottom: 1, borderColor: '#334155' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                        <Chip
                          label={`Step ${messageModalData.step.step}`}
                          size="small"
                          sx={{
                            bgcolor: getEdgeColor(messageModalData.step.message_type),
                            color: '#0f172a',
                            fontWeight: 700
                          }}
                        />
                        <Chip
                          label={messageModalData.step.message_type}
                          size="small"
                          sx={{
                            fontFamily: 'var(--font-mono)',
                            bgcolor: `${getEdgeColor(messageModalData.step.message_type)}30`,
                            color: getEdgeColor(messageModalData.step.message_type),
                            fontWeight: 600
                          }}
                        />
                      </Stack>
                      {messageModalData.msgDef && (
                        <Typography variant="body1" sx={{ color: '#f1f5f9', fontWeight: 600 }}>
                          {messageModalData.msgDef.name}
                        </Typography>
                      )}
                    </Box>
                    <IconButton onClick={() => setMessageModalOpen(false)} sx={{ color: '#94a3b8' }}>
                      <CloseIcon />
                    </IconButton>
                  </Stack>
                </Box>

                {/* Tabs */}
                <Tabs
                  value={messageModalTab}
                  onChange={(_, v) => setMessageModalTab(v)}
                  sx={{
                    bgcolor: '#0f172a',
                    borderBottom: 1,
                    borderColor: '#334155',
                    '& .MuiTab-root': { color: '#94a3b8', minHeight: 40 },
                    '& .Mui-selected': { color: getEdgeColor(messageModalData.step.message_type) },
                    '& .MuiTabs-indicator': { bgcolor: getEdgeColor(messageModalData.step.message_type) },
                  }}
                >
                  <Tab label="Overview" sx={{ fontSize: '0.75rem' }} />
                  <Tab label="Fields" sx={{ fontSize: '0.75rem' }} />
                  <Tab icon={<CodeIcon sx={{ fontSize: 16 }} />} label="XML" sx={{ fontSize: '0.75rem' }} />
                </Tabs>

                {/* Tab Content */}
                <Box sx={{ p: 2, maxHeight: 350, overflow: 'auto' }}>
                  {/* Overview Tab */}
                  {messageModalTab === 0 && (
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Action</Typography>
                        <Typography variant="body2" sx={{ color: '#e2e8f0' }}>{messageModalData.step.action}</Typography>
                      </Box>
                      <Box sx={{ bgcolor: '#0f172a', p: 1.5, borderRadius: 1 }}>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 0.5 }}>Flow</Typography>
                        <Typography variant="body2" sx={{ color: '#e2e8f0' }}>
                          {messageModalData.step.actor} → {messageModalData.step.target || 'Next'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Description</Typography>
                        <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>{messageModalData.step.description}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Technical Details</Typography>
                        <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>{messageModalData.step.technical}</Typography>
                      </Box>
                      {messageModalData.msgDef?.purpose && (
                        <Box>
                          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Message Purpose</Typography>
                          <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>{messageModalData.msgDef.purpose}</Typography>
                        </Box>
                      )}
                      {messageModalData.msgDef?.when_used && (
                        <Box>
                          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>When Used</Typography>
                          <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>{messageModalData.msgDef.when_used}</Typography>
                        </Box>
                      )}
                    </Stack>
                  )}

                  {/* Fields Tab */}
                  {messageModalTab === 1 && (
                    <Stack spacing={1.5}>
                      {messageModalData.step.key_fields.length > 0 && (
                        <>
                          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Key Fields in This Step</Typography>
                          <Stack spacing={0.5}>
                            {messageModalData.step.key_fields.map((field, i) => (
                              <Chip key={i} label={field} size="small" variant="outlined" sx={{ justifyContent: 'flex-start', color: '#e2e8f0', borderColor: '#334155', fontSize: '0.7rem' }} />
                            ))}
                          </Stack>
                        </>
                      )}
                      {messageModalData.msgDef?.key_elements && Object.keys(messageModalData.msgDef.key_elements).length > 0 && (
                        <>
                          <Divider sx={{ borderColor: '#334155', my: 1 }} />
                          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Message Key Elements</Typography>
                          <Stack spacing={1}>
                            {Object.entries(messageModalData.msgDef.key_elements).map(([field, desc]) => (
                              <Paper key={field} sx={{ p: 1, bgcolor: '#0f172a', border: 1, borderColor: '#334155' }}>
                                <Typography variant="caption" sx={{ color: getEdgeColor(messageModalData.step.message_type), fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                                  {field}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', fontSize: '0.7rem' }}>
                                  {desc}
                                </Typography>
                              </Paper>
                            ))}
                          </Stack>
                        </>
                      )}
                    </Stack>
                  )}

                  {/* XML Tab */}
                  {messageModalTab === 2 && (
                    <Box>
                      {messageModalData.msgDef?.sample_xml ? (
                        <>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                            <Typography variant="caption" sx={{ color: '#64748b' }}>Sample XML</Typography>
                            <IconButton
                              size="small"
                              onClick={() => navigator.clipboard.writeText(messageModalData.msgDef?.sample_xml || '')}
                              sx={{ color: '#94a3b8' }}
                            >
                              <CopyIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Stack>
                          <Box
                            component="pre"
                            sx={{
                              p: 1.5,
                              bgcolor: '#0f172a',
                              borderRadius: 1,
                              fontSize: '0.65rem',
                              fontFamily: 'var(--font-mono)',
                              color: '#e2e8f0',
                              overflow: 'auto',
                              maxHeight: 250,
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-all',
                              border: 1,
                              borderColor: '#334155',
                            }}
                          >
                            {messageModalData.msgDef.sample_xml}
                          </Box>
                        </>
                      ) : (
                        <Typography variant="body2" sx={{ color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', py: 4 }}>
                          XML sample not available for this message type.
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>

                {/* Footer */}
                <Box sx={{ p: 1.5, bgcolor: '#0f172a', borderTop: 1, borderColor: '#334155' }}>
                  <Button
                    size="small"
                    fullWidth
                    href={`/iso20022/messages#${messageModalData.step.message_type}`}
                    sx={{ color: getEdgeColor(messageModalData.step.message_type) }}
                  >
                    View Full Message Definition →
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

// Wrapper component that provides ReactFlowProvider
export const ReactFlowGraph: FC<ReactFlowGraphProps> = (props) => {
  return (
    <ReactFlowProvider>
      <ReactFlowGraphInner {...props} />
    </ReactFlowProvider>
  );
};

export default ReactFlowGraph;
