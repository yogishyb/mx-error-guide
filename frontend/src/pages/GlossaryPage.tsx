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
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Skeleton,
  Alert,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import SortByAlphaIcon from '@mui/icons-material/SortByAlpha';
import CategoryIcon from '@mui/icons-material/Category';
import { useGlossary, useGlossarySearch, type GlossaryTerm } from '../hooks/useGlossary';
import { GlossaryPopover } from '../components/GlossaryPopover';
import { useSEO } from '../hooks/useSEO';

// Linear Aesthetic animation config
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
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

// Alphabet for A-Z navigation
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const GlossaryPage: FC = () => {
  const navigate = useNavigate();
  const { terms, categories, loading, error, getTerm } = useGlossary();
  const {
    query,
    setQuery,
    selectedCategory,
    setSelectedCategory,
    results,
    totalCount,
  } = useGlossarySearch(terms);

  const [viewMode, setViewMode] = useState<'alpha' | 'category'>('alpha');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<GlossaryTerm | null>(null);

  useSEO({
    title: 'Financial Glossary - ISO 20022 Terms & Definitions | MX Error Guide',
    description:
      'Complete glossary of ISO 20022 financial terms including BIC, IBAN, UETR, pacs.008, and more. Business, technical, and simple explanations for all terminology.',
    canonical: 'https://toolgalaxy.in/iso20022/glossary',
    ogUrl: 'https://toolgalaxy.in/iso20022/glossary',
    ogImage: 'https://toolgalaxy.in/iso20022/og-image.png',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'DefinedTermSet',
      name: 'ISO 20022 Financial Glossary',
      description:
        'Complete glossary of ISO 20022 financial messaging terms with business, technical, and simple explanations.',
      url: 'https://toolgalaxy.in/iso20022/glossary',
      hasDefinedTerm: terms.slice(0, 10).map((term) => ({
        '@type': 'DefinedTerm',
        name: term.display_name,
        description: term.explanations.simple,
        inDefinedTermSet: 'https://toolgalaxy.in/iso20022/glossary',
      })),
      publisher: {
        '@type': 'Organization',
        name: 'MX Error Guide',
        url: 'https://toolgalaxy.in/iso20022',
      },
    },
  });

  // Filter results by selected letter
  const filteredResults = useMemo(() => {
    if (!selectedLetter) return results;
    return results.filter((term) =>
      term.display_name.toUpperCase().startsWith(selectedLetter)
    );
  }, [results, selectedLetter]);

  // Group terms by first letter
  const groupedByLetter = useMemo(() => {
    const groups: Record<string, GlossaryTerm[]> = {};
    filteredResults.forEach((term) => {
      const letter = term.display_name[0].toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(term);
    });
    return groups;
  }, [filteredResults]);

  // Group terms by category
  const groupedByCategory = useMemo(() => {
    const groups: Record<string, GlossaryTerm[]> = {};
    filteredResults.forEach((term) => {
      if (!groups[term.category]) groups[term.category] = [];
      groups[term.category].push(term);
    });
    return groups;
  }, [filteredResults]);

  // Count terms per letter for availability indicator
  const letterCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    results.forEach((term) => {
      const letter = term.display_name[0].toUpperCase();
      counts[letter] = (counts[letter] || 0) + 1;
    });
    return counts;
  }, [results]);

  const handleViewModeChange = (
    _: React.MouseEvent<HTMLElement>,
    newMode: 'alpha' | 'category' | null
  ) => {
    if (newMode) {
      setViewMode(newMode);
      setSelectedLetter(null);
      setSelectedCategory('');
    }
  };

  const handleTermClick = (term: GlossaryTerm) => {
    setSelectedTerm(term);
  };

  const handleRelatedTermClick = (termId: string) => {
    const foundTerm = getTerm(termId);
    if (foundTerm) {
      setSelectedTerm(foundTerm);
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pt: 2, pb: 8 }}>
        <Container maxWidth="lg">
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')} sx={{ mb: 2 }}>
            Back to Error Lookup
          </Button>
          <Skeleton variant="text" width={300} height={48} />
          <Skeleton variant="text" width={400} height={24} sx={{ mb: 3 }} />
          <Grid container spacing={2}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                <Skeleton variant="rounded" height={120} />
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
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          Financial Glossary
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {totalCount} terms with business, technical, and simple explanations
        </Typography>

        {/* Search & Controls */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.paper' }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ sm: 'center' }}
          >
            <TextField
              placeholder="Search terms..."
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
              <ToggleButton value="alpha">
                <SortByAlphaIcon fontSize="small" sx={{ mr: 0.5 }} />
                A-Z
              </ToggleButton>
              <ToggleButton value="category">
                <CategoryIcon fontSize="small" sx={{ mr: 0.5 }} />
                Category
              </ToggleButton>
            </ToggleButtonGroup>

            {viewMode === 'category' && (
              <TextField
                select
                label="Category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                size="small"
                sx={{ minWidth: 150 }}
                SelectProps={{ native: true }}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </TextField>
            )}
          </Stack>

          {/* A-Z Navigation */}
          {viewMode === 'alpha' && (
            <Stack
              direction="row"
              spacing={0.25}
              sx={{ mt: 2, flexWrap: 'wrap', gap: 0.5 }}
              useFlexGap
            >
              <Chip
                label="All"
                size="small"
                color={selectedLetter === null ? 'primary' : 'default'}
                onClick={() => setSelectedLetter(null)}
                sx={{ fontWeight: selectedLetter === null ? 600 : 400 }}
              />
              {ALPHABET.map((letter) => (
                <Chip
                  key={letter}
                  label={letter}
                  size="small"
                  color={selectedLetter === letter ? 'primary' : 'default'}
                  onClick={() => setSelectedLetter(letter)}
                  disabled={!letterCounts[letter]}
                  sx={{
                    fontWeight: selectedLetter === letter ? 600 : 400,
                    minWidth: 28,
                    opacity: letterCounts[letter] ? 1 : 0.4,
                  }}
                />
              ))}
            </Stack>
          )}
        </Paper>

        {/* Results Count */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Showing {filteredResults.length} of {totalCount} terms
          {selectedLetter && ` starting with "${selectedLetter}"`}
          {selectedCategory && ` in "${selectedCategory}"`}
        </Typography>

        {/* Terms Grid */}
        {viewMode === 'alpha' ? (
          // Alphabetical View
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            key={`alpha-${selectedLetter}-${query}`}
          >
            {Object.entries(groupedByLetter)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([letter, letterTerms]) => (
                <Box key={letter} sx={{ mb: 4 }}>
                  <Typography
                    variant="h5"
                    component="h2"
                    sx={{
                      fontWeight: 700,
                      color: 'primary.main',
                      mb: 2,
                      borderBottom: 2,
                      borderColor: 'primary.main',
                      pb: 0.5,
                      width: 'fit-content',
                    }}
                  >
                    {letter}
                  </Typography>
                  <Grid container spacing={2}>
                    {letterTerms.map((term) => (
                      <Grid key={term.id} size={{ xs: 12, sm: 6, md: 4 }}>
                        <motion.div variants={itemVariants}>
                          <TermCard term={term} onClick={handleTermClick} />
                        </motion.div>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ))}
          </motion.div>
        ) : (
          // Category View
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            key={`category-${selectedCategory}-${query}`}
          >
            {Object.entries(groupedByCategory)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([category, categoryTerms]) => (
                <Box key={category} sx={{ mb: 4 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
                      {category}
                    </Typography>
                    <Chip label={categoryTerms.length} size="small" color="primary" />
                  </Stack>
                  <Grid container spacing={2}>
                    {categoryTerms.map((term) => (
                      <Grid key={term.id} size={{ xs: 12, sm: 6, md: 4 }}>
                        <motion.div variants={itemVariants}>
                          <TermCard term={term} onClick={handleTermClick} />
                        </motion.div>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ))}
          </motion.div>
        )}

        {/* Empty State */}
        {filteredResults.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No terms found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Try a different search term or filter
            </Typography>
          </Paper>
        )}

        {/* Term Detail Popover - using a modal-like approach */}
        <AnimatePresence>
          {selectedTerm && (
            <Box
              sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1300,
                p: 2,
              }}
              onClick={() => setSelectedTerm(null)}
            >
              <Box onClick={(e) => e.stopPropagation()}>
                <GlossaryPopover
                  term={selectedTerm}
                  onClose={() => setSelectedTerm(null)}
                  onTermClick={handleRelatedTermClick}
                />
              </Box>
            </Box>
          )}
        </AnimatePresence>
      </Container>
    </Box>
  );
};

// Term Card Component
interface TermCardProps {
  term: GlossaryTerm;
  onClick: (term: GlossaryTerm) => void;
}

const TermCard: FC<TermCardProps> = ({ term, onClick }) => {
  return (
    <Card
      component={motion.div}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      sx={{
        height: '100%',
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        '&:hover': {
          borderColor: 'primary.main',
        },
      }}
    >
      <CardActionArea onClick={() => onClick(term)} sx={{ height: '100%' }}>
        <CardContent>
          <Typography
            variant="subtitle1"
            component="h3"
            sx={{
              fontWeight: 600,
              mb: 0.5,
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
                mb: 1,
              }}
            >
              ({term.aliases.slice(0, 2).join(', ')})
            </Typography>
          )}

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              fontSize: '0.8rem',
              lineHeight: 1.5,
              mb: 1.5,
            }}
          >
            {term.explanations.simple}
          </Typography>

          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            <Chip
              label={term.category}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.65rem', height: 20 }}
            />
            {term.appears_in.slice(0, 2).map((msgType) => (
              <Chip
                key={msgType}
                label={msgType}
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
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default GlossaryPage;
