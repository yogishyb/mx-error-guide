import { useState, useMemo } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  Stack,
  TextField,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Skeleton,
  Alert,
  Chip,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import CategoryIcon from '@mui/icons-material/Category';
import CodeIcon from '@mui/icons-material/Code';
import SortIcon from '@mui/icons-material/Sort';
import {
  useRealWorldExamples,
  useExamplesSearch,
} from '../hooks/useRealWorldExamples';
import { useMessageDefinitions } from '../hooks/useMessageDefinitions';
import { RealWorldExample } from '../components/RealWorldExample';
import { useSEO } from '../hooks/useSEO';

// Linear Aesthetic animation config
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 260,
      damping: 20,
    },
  },
};

// Category display names
const categoryNames: Record<string, string> = {
  'cross-border-payments': 'Cross-Border Payments',
  'domestic-payments': 'Domestic Payments',
  'account-reporting': 'Account Reporting',
  'payment-returns': 'Payment Returns',
  'payment-operations': 'Payment Operations',
  'instant-payments': 'Instant Payments',
  'direct-debit': 'Direct Debit',
  'trade-finance': 'Trade Finance',
  'compliance': 'Compliance',
  'account-management': 'Account Management',
  'administration': 'Administration',
  'cash-management': 'Cash Management',
  'collateral': 'Collateral',
  'foreign-exchange': 'Foreign Exchange',
  'payments-clearing': 'Payments Clearing',
  'payment-initiation': 'Payment Initiation',
  'securities': 'Securities',
  'treasury': 'Treasury',
  'payments-initiation': 'Payment Initiation', // Normalization fallback
};

// Difficulty descriptions
const difficultyDescriptions: Record<string, string> = {
  beginner: 'Start here - Simple everyday scenarios',
  intermediate: 'More complex business scenarios',
  advanced: 'Complex enterprise scenarios',
};

export const LearnPage: FC = () => {
  const navigate = useNavigate();
  const { examples, categories, difficulties, loading, error } = useRealWorldExamples();
  const { messages: messageDefinitions } = useMessageDefinitions(); // Fetch definitions
  const {
    query,
    setQuery,
    selectedCategory,
    setSelectedCategory,
    selectedDifficulty,
    setSelectedDifficulty,
    selectedMessage,
    setSelectedMessage,
    results,
    page,
    setPage,
    totalPages,
    filteredCount,
  } = useExamplesSearch(examples, 5);

  const [viewMode, setViewMode] = useState<'difficulty' | 'category' | 'message'>('difficulty');
  const [sortOption, setSortOption] = useState<string>('title-asc');

  // Sort options
  const sortOptions = [
    { value: 'title-asc', label: 'Title (A-Z)' },
    { value: 'title-desc', label: 'Title (Z-A)' },
    { value: 'steps-desc', label: 'Steps (Most first)' },
    { value: 'steps-asc', label: 'Steps (Least first)' },
    { value: 'difficulty-asc', label: 'Difficulty (Easy first)' },
    { value: 'difficulty-desc', label: 'Difficulty (Hard first)' },
  ];

  const handleSortChange = (event: SelectChangeEvent) => {
    setSortOption(event.target.value);
  };

  // Sort the results
  const sortedResults = useMemo(() => {
    const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
    return [...results].sort((a, b) => {
      switch (sortOption) {
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'steps-desc':
          return b.steps.length - a.steps.length;
        case 'steps-asc':
          return a.steps.length - b.steps.length;
        case 'difficulty-asc':
          return (difficultyOrder[a.difficulty] || 0) - (difficultyOrder[b.difficulty] || 0);
        case 'difficulty-desc':
          return (difficultyOrder[b.difficulty] || 0) - (difficultyOrder[a.difficulty] || 0);
        default:
          return 0;
      }
    });
  }, [results, sortOption]);

  // Paginate sorted results
  const sortedPaginatedResults = useMemo(() => {
    const startIndex = (page - 1) * 5;
    return sortedResults.slice(startIndex, startIndex + 5);
  }, [sortedResults, page]);

  useSEO({
    title: 'Learn ISO 20022 with Real-World Examples | MX Error Guide',
    description:
      'Understand ISO 20022 payment messages through relatable scenarios: sending money abroad, receiving salary, payment returns, and more. Step-by-step guides for beginners.',
    canonical: 'https://toolgalaxy.in/iso20022/learn',
    ogUrl: 'https://toolgalaxy.in/iso20022/learn',
    ogImage: 'https://toolgalaxy.in/iso20022/og-image.png',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'LearningResource',
      name: 'ISO 20022 Real-World Examples',
      description:
        'Learn ISO 20022 payment messaging through real-world scenarios and step-by-step examples.',
      url: 'https://toolgalaxy.in/iso20022/learn',
      educationalLevel: 'Beginner to Intermediate',
      learningResourceType: 'Interactive Tutorial',
      publisher: {
        '@type': 'Organization',
        name: 'MX Error Guide',
        url: 'https://toolgalaxy.in/iso20022',
      },
    },
  });

  const handleViewModeChange = (
    _: React.MouseEvent<HTMLElement>,
    newMode: 'difficulty' | 'category' | 'message' | null
  ) => {
    if (newMode) {
      setViewMode(newMode);
      setSelectedCategory('');
      setSelectedDifficulty('');
      setSelectedMessage('');
    }
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Create message definition lookup map
  const messageDefMap = useMemo(() => {
    const map = new Map();
    messageDefinitions.forEach(msg => {
      // Key by short ID like "pacs.008"
      const shortId = msg.id; 
      map.set(shortId, msg);
    });
    return map;
  }, [messageDefinitions]);

  // Group examples by difficulty (using sortedPaginatedResults)
  const examplesByDifficulty = sortedPaginatedResults.reduce((acc, example) => {
    if (!acc[example.difficulty]) {
      acc[example.difficulty] = [];
    }
    acc[example.difficulty].push(example);
    return acc;
  }, {} as Record<string, typeof sortedPaginatedResults>);

  // Group examples by category (using sortedPaginatedResults)
  const examplesByCategory = sortedPaginatedResults.reduce((acc, example) => {
    if (!acc[example.category]) {
      acc[example.category] = [];
    }
    acc[example.category].push(example);
    return acc;
  }, {} as Record<string, typeof sortedPaginatedResults>);

  // Get all unique message types from sortedResults
  const allMessageTypes = Array.from(
    new Set(sortedResults.flatMap((e) => e.related_messages))
  ).sort();

  // Group examples by message type (using sortedPaginatedResults)
  const examplesByMessage = allMessageTypes.reduce((acc, msgType) => {
    acc[msgType] = sortedPaginatedResults.filter((e) => e.related_messages.includes(msgType));
    return acc;
  }, {} as Record<string, typeof sortedPaginatedResults>);


  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pt: 2, pb: 8 }}>
        <Container maxWidth="lg">
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')} sx={{ mb: 2 }}>
            Back to Error Lookup
          </Button>
          <Skeleton variant="text" width={400} height={48} />
          <Skeleton variant="text" width={500} height={24} sx={{ mb: 3 }} />
          <Grid container spacing={2}>
            {[1, 2, 3].map((i) => (
              <Grid key={i} size={{ xs: 12 }}>
                <Skeleton variant="rounded" height={200} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pt: 2, pb: 8 }}>
        <Container maxWidth="lg">
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')} sx={{ mb: 2 }}>
            Back to Error Lookup
          </Button>
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pt: 2, pb: 8 }}>
      <Container maxWidth="lg">
        {/* Back Button */}
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')} sx={{ mb: 2 }}>
          Back to Error Lookup
        </Button>

        {/* Title */}
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
          <SchoolOutlinedIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" fontWeight={600}>
            Learn with Real-World Examples
          </Typography>
        </Stack>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Understand ISO 20022 payment messages through relatable, everyday scenarios
        </Typography>

        {/* Search & Controls */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.paper' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
            <TextField
              placeholder="Search examples..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              size="small"
              sx={{ flexGrow: 1, maxWidth: { sm: 300 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            {/* Sort Dropdown */}
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel id="sort-label">
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <SortIcon fontSize="small" />
                  <span>Sort by</span>
                </Stack>
              </InputLabel>
              <Select
                labelId="sort-label"
                value={sortOption}
                label="Sort by"
                onChange={handleSortChange}
              >
                {sortOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              size="small"
            >
              <ToggleButton value="difficulty">
                <SignalCellularAltIcon fontSize="small" sx={{ mr: 0.5 }} />
                Difficulty
              </ToggleButton>
              <ToggleButton value="category">
                <CategoryIcon fontSize="small" sx={{ mr: 0.5 }} />
                Category
              </ToggleButton>
              <ToggleButton value="message">
                <CodeIcon fontSize="small" sx={{ mr: 0.5 }} />
                Message
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          {/* Filter Chips */}
          {viewMode === 'difficulty' && (
            <Stack direction="row" spacing={0.75} sx={{ mt: 2, flexWrap: 'wrap' }} useFlexGap>
              <Chip
                label="All Levels"
                size="small"
                color={selectedDifficulty === '' ? 'primary' : 'default'}
                onClick={() => setSelectedDifficulty('')}
                sx={{ fontWeight: selectedDifficulty === '' ? 600 : 400 }}
              />
              {difficulties.map((diff) => (
                <Chip
                  key={diff}
                  label={diff}
                  size="small"
                  color={selectedDifficulty === diff ? 'primary' : 'default'}
                  onClick={() => setSelectedDifficulty(diff)}
                  sx={{
                    fontWeight: selectedDifficulty === diff ? 600 : 400,
                    textTransform: 'capitalize',
                  }}
                />
              ))}
            </Stack>
          )}

          {viewMode === 'category' && (
            <Stack direction="row" spacing={0.75} sx={{ mt: 2, flexWrap: 'wrap' }} useFlexGap>
              <Chip
                label="All Categories"
                size="small"
                color={selectedCategory === '' ? 'primary' : 'default'}
                onClick={() => setSelectedCategory('')}
                sx={{ fontWeight: selectedCategory === '' ? 600 : 400 }}
              />
              {categories.map((cat) => (
                <Chip
                  key={cat}
                  label={categoryNames[cat] || cat}
                  size="small"
                  color={selectedCategory === cat ? 'primary' : 'default'}
                  onClick={() => setSelectedCategory(cat)}
                  sx={{ fontWeight: selectedCategory === cat ? 600 : 400 }}
                />
              ))}
            </Stack>
          )}

          {viewMode === 'message' && (
            <Stack direction="row" spacing={0.75} sx={{ mt: 2, flexWrap: 'wrap' }} useFlexGap>
              <Chip
                label="All Messages"
                size="small"
                color={selectedMessage === '' ? 'primary' : 'default'}
                onClick={() => setSelectedMessage('')}
                sx={{ fontWeight: selectedMessage === '' ? 600 : 400 }}
              />
              {allMessageTypes.map((msg) => (
                <Chip
                  key={msg}
                  label={msg}
                  size="small"
                  color={selectedMessage === msg ? 'primary' : 'default'}
                  onClick={() => setSelectedMessage(msg)}
                  sx={{ fontWeight: selectedMessage === msg ? 600 : 400 }}
                />
              ))}
            </Stack>
          )}
        </Paper>

        {/* Results Count */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {(page - 1) * 5 + 1}-{Math.min(page * 5, filteredCount)} of {filteredCount} examples
          {selectedDifficulty && ` • ${selectedDifficulty} level`}
          {selectedCategory && ` • ${categoryNames[selectedCategory] || selectedCategory}`}
          {selectedMessage && ` • ${selectedMessage}`}
        </Typography>

        {/* Examples Grid */}
        {/* When custom sort is applied (not default title-asc), show flat sorted list */}
        {sortOption !== 'title-asc' ? (
          // Flat sorted list - no grouping
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            key={`sorted-${sortOption}-${query}-${page}`}
          >
            <Stack spacing={2}>
              {sortedPaginatedResults.map((example) => (
                <motion.div key={example.id} variants={itemVariants}>
                  <RealWorldExample example={example} messageMap={messageDefMap} />
                </motion.div>
              ))}
            </Stack>
          </motion.div>
        ) : viewMode === 'difficulty' ? (
          // Grouped by Difficulty
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            key={`difficulty-${selectedDifficulty}-${query}-${page}`}
          >
            {(['beginner', 'intermediate', 'advanced'] as const)
              .filter((diff) => examplesByDifficulty[diff]?.length > 0)
              .map((difficulty) => (
                <Box key={difficulty} sx={{ mb: 4 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                    <Typography
                      variant="h5"
                      component="h2"
                      sx={{
                        fontWeight: 700,
                        textTransform: 'capitalize',
                      }}
                    >
                      {difficulty}
                    </Typography>
                    <Chip
                      label={examplesByDifficulty[difficulty].length}
                      size="small"
                      color="primary"
                    />
                  </Stack>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2, fontSize: '0.875rem' }}
                  >
                    {difficultyDescriptions[difficulty]}
                  </Typography>

                  <Stack spacing={2}>
                    {examplesByDifficulty[difficulty].map((example) => (
                      <motion.div key={example.id} variants={itemVariants}>
                        <RealWorldExample example={example} messageMap={messageDefMap} />
                      </motion.div>
                    ))}
                  </Stack>
                </Box>
              ))}
          </motion.div>
        ) : viewMode === 'category' ? (
          // Grouped by Category
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            key={`category-${selectedCategory}-${query}-${page}`}
          >
            {Object.entries(examplesByCategory)
              .sort(([a], [b]) => a.localeCompare(b))
              .filter(([_, categoryExamples]) => categoryExamples.length > 0)
              .map(([category, categoryExamples]) => (
                <Box key={category} sx={{ mb: 4 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
                      {categoryNames[category] || category}
                    </Typography>
                    <Chip label={categoryExamples.length} size="small" color="primary" />
                  </Stack>

                  <Stack spacing={2}>
                    {categoryExamples.map((example) => (
                      <motion.div key={example.id} variants={itemVariants}>
                        <RealWorldExample example={example} messageMap={messageDefMap} />
                      </motion.div>
                    ))}
                  </Stack>
                </Box>
              ))}
          </motion.div>
        ) : (
          // Grouped by Message Type
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            key={`message-${selectedMessage}-${query}-${page}`}
          >
            {selectedMessage ? (
              // Single message selected - show flat list
              <Stack spacing={2}>
                <Box sx={{ mb: 2 }}>
                   {/* Enhanced Header for Single Message Selection */}
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                     <CodeIcon color="primary" fontSize="large" />
                     <Typography variant="h4" component="h2" sx={{ fontWeight: 700 }}>
                        {selectedMessage}
                        {messageDefMap.get(selectedMessage) && ` - ${messageDefMap.get(selectedMessage).name}`}
                     </Typography>
                  </Stack>
                   {messageDefMap.get(selectedMessage) && (
                      <Typography variant="body1" color="text.secondary">
                        {messageDefMap.get(selectedMessage).purpose}
                      </Typography>
                   )}
                </Box>
                {sortedPaginatedResults.map((example) => (
                  <motion.div key={example.id} variants={itemVariants}>
                    <RealWorldExample example={example} messageMap={messageDefMap} />
                  </motion.div>
                ))}
              </Stack>
            ) : (
              // All messages - show grouped
              Object.entries(examplesByMessage)
                .sort(([a], [b]) => a.localeCompare(b))
                .filter(([_, messageExamples]) => messageExamples.length > 0)
                .map(([msgType, messageExamples]) => {
                  const msgDef = messageDefMap.get(msgType);
                  return (
                  <Box key={msgType} sx={{ mb: 4 }}>
                    <Stack direction="column" spacing={0.5} sx={{ mb: 2 }}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <CodeIcon color="action" />
                          <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
                            {msgType}
                            {msgDef && <Typography component="span" variant="h5" color="text.secondary" sx={{ fontWeight: 400, ml: 1 }}>- {msgDef.name}</Typography>}
                          </Typography>
                          <Chip label={messageExamples.length} size="small" color="primary" />
                        </Stack>
                        {msgDef && (
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 5 }}>
                                {msgDef.purpose}
                            </Typography>
                        )}
                    </Stack>

                    <Stack spacing={2}>
                      {messageExamples.map((example) => (
                        <motion.div key={`${msgType}-${example.id}`} variants={itemVariants}>
                          <RealWorldExample example={example} messageMap={messageDefMap} />
                        </motion.div>
                      ))}
                    </Stack>
                  </Box>
                )})
            )}
          </motion.div>
        )}

        {/* Empty State */}
        {filteredCount === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No examples found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Try a different search term or filter
            </Typography>
          </Paper>
        )}

        {/* Pagination */}
        {filteredCount > 0 && (
          <Stack spacing={2} alignItems="center" sx={{ mt: 6 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
            />
          </Stack>
        )}
      </Container>
    </Box>
  );
};

export default LearnPage;