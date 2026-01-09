import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Modal,
  IconButton,
  Button,
  Divider,
  Grid,
  InputAdornment,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CodeIcon from '@mui/icons-material/Code';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ArticleIcon from '@mui/icons-material/Article';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PublicIcon from '@mui/icons-material/Public';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import SpeedIcon from '@mui/icons-material/Speed';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { motion, AnimatePresence } from 'framer-motion';
import { useSEO } from '../hooks/useSEO';
import { AnimatedThemeToggle } from '../components/AnimatedThemeToggle';
import { TermWithHelp } from '../components/HelpIcon';
import {
  useMessageDefinitions,
  useMessageSearch,
  type MessageDefinition,
  type SampleFlow,
  type PaymentSystem,
  type MtMapping,
} from '../hooks/useMessageDefinitions';

// Map of terms to their glossary IDs for contextual help
const termToGlossaryId: Record<string, string> = {
  'Ordering Bank': 'ordering_bank',
  'Ordering Customer': 'debtor',
  'Debtor': 'debtor',
  'Debtor Bank': 'ordering_bank',
  'Debtor Agent': 'ordering_bank',
  'Beneficiary Bank': 'beneficiary_bank',
  'Beneficiary': 'creditor',
  'Creditor': 'creditor',
  'Creditor Bank': 'beneficiary_bank',
  'Creditor Agent': 'beneficiary_bank',
  'Correspondent': 'correspondent_bank',
  'Correspondent Bank': 'correspondent_bank',
  'Intermediary': 'correspondent_bank',
  'Intermediary Bank': 'correspondent_bank',
  'Settlement': 'settlement',
  'Clearing': 'clearing',
  'pacs.008': 'pacs_008',
  'pacs.002': 'pacs_002',
  'pacs.004': 'pacs_004',
  'pain.001': 'pain_001',
  'camt.053': 'camt_053',
  'camt.054': 'camt_054',
  'camt.056': 'camt_056',
  'SWIFT': 'swift',
  'SEPA': 'sepa',
  'FedNow': 'fednow',
  'TARGET2': 'target2',
  'CHIPS': 'chips',
  'UETR': 'uetr',
  'BIC': 'bic',
  'IBAN': 'iban',
};

// Helper to wrap a term with help icon if it exists in glossary
function renderTermWithHelp(term: string | undefined): React.ReactNode {
  if (!term) return null;
  const glossaryId = termToGlossaryId[term];
  if (glossaryId) {
    return <TermWithHelp term={glossaryId}>{term}</TermWithHelp>;
  }
  return term;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.03, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 260, damping: 20 },
  },
};

// Business area color mapping
const areaColors: Record<string, string> = {
  // Payments
  pacs: '#5e6ad2', // Indigo - Payments Clearing & Settlement
  pain: '#4da567', // Green - Payments Initiation
  camt: '#d29922', // Amber - Cash Management
  remt: '#f97316', // Orange - Remittance
  // Securities
  sese: '#0ea5e9', // Sky - Securities Settlement
  setr: '#06b6d4', // Cyan - Securities Trade
  semt: '#8b5cf6', // Violet - Securities Management
  seev: '#a855f7', // Purple - Securities Events
  // Account & Reference
  acmt: '#e5534b', // Red - Account Management
  reda: '#14b8a6', // Teal - Reference Data
  auth: '#ec4899', // Pink - Authorities/Regulatory
  // Treasury & Collateral
  colr: '#84cc16', // Lime - Collateral Management
  fxtr: '#22c55e', // Emerald - Foreign Exchange
  // System
  head: '#64748b', // Slate - Business Header
  admi: '#6b7280', // Gray - Administration
};

function MessageCard({
  message,
  onClick,
}: {
  message: MessageDefinition;
  onClick: () => void;
}) {
  const color = areaColors[message.business_area] || '#6b7280';

  return (
    <motion.div variants={itemVariants}>
      <Card
        sx={{
          height: '100%',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          transition: 'all 0.15s ease',
          '&:hover': {
            borderColor: color,
            transform: 'translateY(-2px)',
            boxShadow: `0 4px 12px ${color}20`,
          },
        }}
      >
        <CardActionArea onClick={onClick} sx={{ height: '100%' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Chip
                label={message.business_area.toUpperCase()}
                size="small"
                sx={{
                  bgcolor: `${color}20`,
                  color: color,
                  fontWeight: 600,
                  fontSize: '0.7rem',
                }}
              />
              <Typography
                variant="h6"
                sx={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}
              >
                {message.id}
              </Typography>
            </Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1, fontWeight: 500 }}
            >
              {message.name}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                mb: message.mt_equivalent?.length ? 1 : 0,
              }}
            >
              {message.purpose}
            </Typography>
            {message.mt_equivalent && message.mt_equivalent.length > 0 && (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                {message.mt_equivalent.slice(0, 2).map((mt) => (
                  <Chip
                    key={mt}
                    label={mt}
                    size="small"
                    icon={<SwapHorizIcon sx={{ fontSize: 14 }} />}
                    sx={{
                      height: 20,
                      fontSize: '0.65rem',
                      bgcolor: 'action.hover',
                      '& .MuiChip-icon': { fontSize: 12 },
                    }}
                  />
                ))}
                {message.mt_equivalent.length > 2 && (
                  <Chip
                    label={`+${message.mt_equivalent.length - 2}`}
                    size="small"
                    sx={{ height: 20, fontSize: '0.65rem', bgcolor: 'action.hover' }}
                  />
                )}
              </Box>
            )}
          </CardContent>
        </CardActionArea>
      </Card>
    </motion.div>
  );
}

function FlowCard({ flow }: { flow: SampleFlow }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div variants={itemVariants}>
      <Card
        sx={{
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <CardActionArea onClick={() => setExpanded(!expanded)}>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <AccountTreeIcon sx={{ color: 'primary.main', fontSize: 20 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {flow.name}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {flow.description}
            </Typography>
          </CardContent>
        </CardActionArea>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Divider />
              <Box sx={{ p: 2.5 }}>
                {flow.steps.map((step, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 2,
                      mb: idx < flow.steps.length - 1 ? 2 : 0,
                    }}
                  >
                    <Chip
                      label={step.step}
                      size="small"
                      sx={{
                        minWidth: 28,
                        height: 28,
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                      }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                        <Typography
                          variant="body2"
                          component="span"
                          sx={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}
                        >
                          {renderTermWithHelp(step.message)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" component="span">
                          {step.from && step.to ? (
                            <>
                              {renderTermWithHelp(step.from)} → {renderTermWithHelp(step.to)}
                            </>
                          ) : (
                            step.direction
                          )}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {step.description}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

// System type to color mapping
const systemTypeColors: Record<string, string> = {
  'RTGS': '#5e6ad2',
  'Instant Payment System': '#4da567',
  'ACH': '#d29922',
  'Messaging Network': '#e5534b',
  'LVPS (Large Value Payment System)': '#8b5cf6',
};

function PaymentSystemCard({ system }: { system: PaymentSystem }) {
  const color = systemTypeColors[system.type] || '#6b7280';

  return (
    <motion.div variants={itemVariants}>
      <Card
        sx={{
          height: '100%',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          transition: 'all 0.15s ease',
          '&:hover': {
            borderColor: color,
            transform: 'translateY(-2px)',
            boxShadow: `0 4px 12px ${color}20`,
          },
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PublicIcon sx={{ color: color, fontSize: 20 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {system.name}
              </Typography>
            </Box>
            <Chip
              label={system.type}
              size="small"
              sx={{
                bgcolor: `${color}20`,
                color: color,
                fontWeight: 600,
                fontSize: '0.65rem',
              }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 500 }}>
            {system.full_name}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              mb: 2,
            }}
          >
            {system.description}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LocationOnIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {system.region}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <SpeedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {system.speed}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {system.key_features.slice(0, 3).map((feature) => (
              <Chip
                key={feature}
                label={feature}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.6rem',
                  bgcolor: 'action.hover',
                }}
              />
            ))}
          </Box>
          <Box
            component="a"
            href={system.url}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              mt: 2,
              color: 'primary.main',
              textDecoration: 'none',
              fontSize: '0.75rem',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Learn more
            <OpenInNewIcon sx={{ fontSize: 12 }} />
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function MtMappingTable({ mappings }: { mappings: MtMapping[] }) {
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '100px 100px 1fr 1fr',
          gap: 0,
          bgcolor: 'action.hover',
          p: 1.5,
          fontWeight: 600,
          fontSize: '0.75rem',
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 700 }}>MT</Typography>
        <Typography variant="caption" sx={{ fontWeight: 700 }}>MX</Typography>
        <Typography variant="caption" sx={{ fontWeight: 700 }}>Name</Typography>
        <Typography variant="caption" sx={{ fontWeight: 700 }}>Notes</Typography>
      </Box>
      {mappings.map((mapping) => (
        <Box
          key={mapping.mt}
          sx={{
            display: 'grid',
            gridTemplateColumns: '100px 100px 1fr 1fr',
            gap: 0,
            p: 1.5,
            borderTop: '1px solid',
            borderColor: 'divider',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <Typography variant="caption" sx={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'warning.main' }}>
            {mapping.mt}
          </Typography>
          <Typography variant="caption" sx={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'primary.main' }}>
            {mapping.mx}
          </Typography>
          <Typography variant="caption">{mapping.name}</Typography>
          <Typography variant="caption" color="text.secondary">{mapping.notes}</Typography>
        </Box>
      ))}
    </Box>
  );
}

function MessageDetailModal({
  message,
  onClose,
}: {
  message: MessageDefinition | null;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  if (!message) return null;

  const color = areaColors[message.business_area] || '#6b7280';

  const handleCopyXml = () => {
    if (message.sample_xml) {
      navigator.clipboard.writeText(message.sample_xml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Modal open={!!message} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '95%', md: '80%' },
          maxWidth: 900,
          maxHeight: '90vh',
          bgcolor: 'background.paper',
          borderRadius: 3,
          boxShadow: 24,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 3,
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Chip
                label={message.business_area.toUpperCase()}
                size="small"
                sx={{
                  bgcolor: `${color}20`,
                  color: color,
                  fontWeight: 600,
                }}
              />
              <Typography
                variant="h5"
                sx={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}
              >
                {message.id}
              </Typography>
            </Box>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
              {message.name}
            </Typography>
            {/* MT Equivalent */}
            {message.mt_equivalent && message.mt_equivalent.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  MT Equivalent:
                </Typography>
                {message.mt_equivalent.map((mt) => (
                  <Chip
                    key={mt}
                    label={mt}
                    size="small"
                    icon={<SwapHorizIcon sx={{ fontSize: 14 }} />}
                    sx={{
                      bgcolor: 'warning.main',
                      color: 'warning.contrastText',
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      '& .MuiChip-icon': { color: 'warning.contrastText' },
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ p: 3, overflow: 'auto', flex: 1 }}>
          {/* Purpose & When Used */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
              Purpose
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {message.purpose}
            </Typography>
            {message.when_used && (
              <>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                  When Used
                </Typography>
                <Typography variant="body1">{message.when_used}</Typography>
              </>
            )}
          </Box>

          {/* Used in Payment Systems */}
          {message.used_in_systems && message.used_in_systems.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Used in Payment Systems
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {message.used_in_systems.map((system) => (
                    <Chip
                      key={system}
                      label={system}
                      size="small"
                      icon={<PublicIcon sx={{ fontSize: 14 }} />}
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        fontSize: '0.7rem',
                        '& .MuiChip-icon': { color: 'primary.contrastText' },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </>
          )}

          {/* Real-World Use Cases */}
          {message.real_world_use_cases && message.real_world_use_cases.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Real-World Use Cases
                </Typography>
                <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                  {message.real_world_use_cases.map((useCase, idx) => (
                    <Typography component="li" variant="body2" key={idx} sx={{ mb: 0.5 }}>
                      {useCase}
                    </Typography>
                  ))}
                </Box>
              </Box>
            </>
          )}

          {/* Key Elements with Explanations */}
          {message.key_elements && Object.keys(message.key_elements).length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Key XML Elements
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {Object.entries(message.key_elements).map(([xpath, desc]) => (
                    <Box
                      key={xpath}
                      sx={{
                        p: 1.5,
                        bgcolor: 'background.default',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 600,
                          color: 'primary.main',
                          mb: 0.5,
                        }}
                      >
                        {xpath}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {desc}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </>
          )}

          {/* Sample XML */}
          {message.sample_xml && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1,
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary">
                    Sample XML Message
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton size="small" onClick={handleCopyXml} title="Copy XML">
                      <ContentCopyIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                </Box>
                {copied && (
                  <Typography variant="caption" color="success.main" sx={{ mb: 1, display: 'block' }}>
                    Copied to clipboard!
                  </Typography>
                )}
                <Box
                  sx={{
                    bgcolor: 'background.default',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    p: 2,
                    overflow: 'auto',
                    maxHeight: 400,
                  }}
                >
                  <pre
                    style={{
                      margin: 0,
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      lineHeight: 1.5,
                      whiteSpace: 'pre',
                      overflowX: 'auto',
                    }}
                  >
                    {message.sample_xml}
                  </pre>
                </Box>
              </Box>
            </>
          )}

          {/* Sources */}
          {message.sources && message.sources.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Sources & References
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {message.sources.map((source, idx) => (
                    <Chip
                      key={idx}
                      component="a"
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      label={source.name}
                      size="small"
                      clickable
                      icon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                      sx={{ fontSize: '0.75rem' }}
                    />
                  ))}
                </Box>
              </Box>
            </>
          )}

          {/* Documentation Link */}
          <Box
            component="a"
            href={message.documentation_url}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              color: 'primary.main',
              textDecoration: 'none',
              fontSize: '0.875rem',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            <ArticleIcon sx={{ fontSize: 16 }} />
            View ISO 20022 Documentation
            <OpenInNewIcon sx={{ fontSize: 14 }} />
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}

export function MessageDefinitionsPage() {
  const { messages, businessAreas, sampleFlows, paymentSystems, mtMappings, loading, error } = useMessageDefinitions();
  const { query, setQuery, selectedArea, setSelectedArea, results } = useMessageSearch(messages);
  const [selectedMessage, setSelectedMessage] = useState<MessageDefinition | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  useSEO({
    title: 'ISO 20022 Message Definitions | MX Error Guide',
    description:
      'Learn ISO 20022 message types: pacs.008, pain.001, camt.053, and more. Sample XML structures and payment flows for developers.',
    canonical: 'https://toolgalaxy.in/iso20022/messages',
    ogUrl: 'https://toolgalaxy.in/iso20022/messages',
  });

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1100,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: 2,
          px: 2,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton component={Link} to="/" size="small">
                <HomeIcon />
              </IconButton>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Message Definitions
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ISO 20022 message types with sample XML
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                component={Link}
                to="/glossary"
                startIcon={<MenuBookIcon />}
                size="small"
                variant="outlined"
                sx={{ textTransform: 'none' }}
              >
                Glossary
              </Button>
              <AnimatedThemeToggle />
            </Box>
          </Box>

          {/* Search & Filter */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search messages..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              size="small"
              sx={{ flex: 1, minWidth: 200 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel>Business Area</InputLabel>
              <Select
                value={selectedArea}
                label="Business Area"
                onChange={(e) => setSelectedArea(e.target.value)}
              >
                <MenuItem value="">All Areas ({messages.length})</MenuItem>
                {businessAreas
                  .map((area) => ({
                    ...area,
                    count: messages.filter((m) => m.business_area === area.code).length,
                  }))
                  .filter((area) => area.count > 0)
                  .map((area) => (
                    <MenuItem key={area.code} value={area.code}>
                      {area.code.toUpperCase()} - {area.name} ({area.count})
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Box>
        </Container>
      </Box>

      {/* Content */}
      <Container maxWidth="lg" sx={{ py: 3, pb: 10 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            icon={<CodeIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label={`Messages (${results.length})`}
          />
          <Tab
            icon={<PublicIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label={`Payment Systems (${paymentSystems.length})`}
          />
          <Tab
            icon={<SwapHorizIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label={`MT→MX Mappings (${mtMappings.length})`}
          />
          <Tab
            icon={<AccountTreeIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label={`Payment Flows (${sampleFlows.length})`}
          />
        </Tabs>

        {activeTab === 0 && (
          <motion.div
            key={`messages-${selectedArea}-${query}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Grid container spacing={2}>
              {results.map((message) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={message.id}>
                  <MessageCard
                    message={message}
                    onClick={() => setSelectedMessage(message)}
                  />
                </Grid>
              ))}
            </Grid>
            {results.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography color="text.secondary">No messages found</Typography>
              </Box>
            )}
          </motion.div>
        )}

        {activeTab === 1 && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Global payment systems and financial networks that use ISO 20022 messaging standards.
            </Typography>
            <Grid container spacing={2}>
              {paymentSystems.map((system) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={system.id}>
                  <PaymentSystemCard system={system} />
                </Grid>
              ))}
            </Grid>
          </motion.div>
        )}

        {activeTab === 2 && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              SWIFT MT to ISO 20022 MX message mappings for the migration from legacy formats.
            </Typography>
            <MtMappingTable mappings={mtMappings} />
          </motion.div>
        )}

        {activeTab === 3 && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <Grid container spacing={2}>
              {sampleFlows.map((flow) => (
                <Grid size={{ xs: 12, md: 6 }} key={flow.name}>
                  <FlowCard flow={flow} />
                </Grid>
              ))}
            </Grid>
          </motion.div>
        )}
      </Container>

      {/* Message Detail Modal */}
      <MessageDetailModal
        message={selectedMessage}
        onClose={() => setSelectedMessage(null)}
      />
    </Box>
  );
}

export default MessageDefinitionsPage;
