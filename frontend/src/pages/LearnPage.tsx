import { useState } from 'react';
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
} from '@mui/material';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import CategoryIcon from '@mui/icons-material/Category';
import {
  useRealWorldExamples,
  useExamplesSearch,
} from '../hooks/useRealWorldExamples';
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
  const {
    query,
    setQuery,
    selectedCategory,
    setSelectedCategory,
    selectedDifficulty,
    setSelectedDifficulty,
    results,
    totalCount,
  } = useExamplesSearch(examples);

  const [viewMode, setViewMode] = useState<'difficulty' | 'category'>('difficulty');

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
    newMode: 'difficulty' | 'category' | null
  ) => {
    if (newMode) {
      setViewMode(newMode);
      setSelectedCategory('');
      setSelectedDifficulty('');
    }
  };

  // Group examples by difficulty
  const examplesByDifficulty = results.reduce((acc, example) => {
    if (!acc[example.difficulty]) {
      acc[example.difficulty] = [];
    }
    acc[example.difficulty].push(example);
    return acc;
  }, {} as Record<string, typeof results>);

  // Group examples by category
  const examplesByCategory = results.reduce((acc, example) => {
    if (!acc[example.category]) {
      acc[example.category] = [];
    }
    acc[example.category].push(example);
    return acc;
  }, {} as Record<string, typeof results>);

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
        </Paper>

        {/* Results Count */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Showing {results.length} of {totalCount} examples
          {selectedDifficulty && ` • ${selectedDifficulty} level`}
          {selectedCategory && ` • ${categoryNames[selectedCategory] || selectedCategory}`}
        </Typography>

        {/* Examples Grid */}
        {viewMode === 'difficulty' ? (
          // Grouped by Difficulty
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            key={`difficulty-${selectedDifficulty}-${query}`}
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
                        <RealWorldExample example={example} />
                      </motion.div>
                    ))}
                  </Stack>
                </Box>
              ))}
          </motion.div>
        ) : (
          // Grouped by Category
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            key={`category-${selectedCategory}-${query}`}
          >
            {Object.entries(examplesByCategory)
              .sort(([a], [b]) => a.localeCompare(b))
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
                        <RealWorldExample example={example} />
                      </motion.div>
                    ))}
                  </Stack>
                </Box>
              ))}
          </motion.div>
        )}

        {/* Empty State */}
        {results.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No examples found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Try a different search term or filter
            </Typography>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default LearnPage;
