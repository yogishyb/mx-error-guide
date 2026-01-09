import { useState, useEffect, useMemo, useCallback } from 'react';
import Fuse from 'fuse.js';

export interface Character {
  name: string;
  role: string;
  country: string;
  bank: string;
}

export interface Step {
  step: number;
  actor: string;
  target?: string;
  action: string;
  description: string;
  technical: string;
  message_type: string;
  key_fields: string[];
}

export interface PossibleError {
  error_code: string;
  scenario: string;
  result: string;
  message_type: string;
}

export interface RealWorldExample {
  id: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  characters: Record<string, Character>;
  scenario: string;
  steps: Step[];
  possible_errors: PossibleError[];
  related_messages: string[];
  related_terms: string[];
  key_takeaways: string[];
}

interface ExamplesMetadata {
  version: string;
  last_updated: string;
  example_count: number;
  categories: string[];
  difficulties: string[];
}

interface ExamplesData {
  metadata: ExamplesMetadata;
  examples: RealWorldExample[];
}

export function useRealWorldExamples() {
  const [data, setData] = useState<ExamplesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/');
    fetch(`${baseUrl}data/real_world_examples.json`)
      .then((res) => res.json())
      .then((data: ExamplesData) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load real-world examples');
        setLoading(false);
        console.error(err);
      });
  }, []);

  // Create a lookup map for quick example access by ID
  const exampleMap = useMemo(() => {
    const map = new Map<string, RealWorldExample>();
    data?.examples.forEach((example) => {
      map.set(example.id, example);
    });
    return map;
  }, [data?.examples]);

  // Get example by ID
  const getExample = useCallback(
    (id: string): RealWorldExample | undefined => {
      return exampleMap.get(id);
    },
    [exampleMap]
  );

  // Get all unique categories
  const categories = useMemo(() => {
    return data?.metadata.categories ?? [];
  }, [data?.metadata.categories]);

  // Get all unique difficulties
  const difficulties = useMemo(() => {
    return data?.metadata.difficulties ?? [];
  }, [data?.metadata.difficulties]);

  return {
    examples: data?.examples ?? [],
    metadata: data?.metadata ?? null,
    categories,
    difficulties,
    getExample,
    loading,
    error,
  };
}

export function useExamplesSearch(examples: RealWorldExample[], pageSize = 5) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [selectedMessage, setSelectedMessage] = useState<string>('');
  const [page, setPage] = useState(1);

  const fuse = useMemo(
    () =>
      new Fuse(examples, {
        keys: [
          { name: 'title', weight: 2 },
          { name: 'scenario', weight: 1.5 },
          { name: 'category', weight: 1 },
          { name: 'key_takeaways', weight: 0.8 },
          { name: 'related_messages', weight: 0.5 },
        ],
        threshold: 0.35,
        includeScore: true,
      }),
    [examples]
  );

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [query, selectedCategory, selectedDifficulty, selectedMessage]);

  const results = useMemo(() => {
    let filtered = examples;

    // Search
    if (query.trim()) {
      const searchResults = fuse.search(query);
      filtered = searchResults.map((r) => r.item);
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((e) => e.category === selectedCategory);
    }

    // Filter by difficulty
    if (selectedDifficulty) {
      filtered = filtered.filter((e) => e.difficulty === selectedDifficulty);
    }

    // Filter by message type
    if (selectedMessage) {
      filtered = filtered.filter((e) => 
        e.related_messages.some(m => m.toLowerCase() === selectedMessage.toLowerCase()) ||
        e.steps.some(s => s.message_type.toLowerCase() === selectedMessage.toLowerCase())
      );
    }

    return filtered;
  }, [query, selectedCategory, selectedDifficulty, selectedMessage, examples, fuse]);

  const paginatedResults = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return results.slice(startIndex, startIndex + pageSize);
  }, [results, page, pageSize]);

  const totalPages = Math.ceil(results.length / pageSize);

  return {
    query,
    setQuery,
    selectedCategory,
    setSelectedCategory,
    selectedDifficulty,
    setSelectedDifficulty,
    selectedMessage,
    setSelectedMessage,
    results, // Full filtered results
    paginatedResults, // Current page results
    page,
    setPage,
    totalPages,
    totalCount: examples.length,
    filteredCount: results.length,
  };
}
