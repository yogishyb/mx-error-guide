import { useState, useEffect, useMemo, useCallback } from 'react';
import Fuse from 'fuse.js';

export interface GlossaryTerm {
  id: string;
  display_name: string;
  aliases: string[];
  category: string;
  explanations: {
    business: string;
    technical: string;
    simple: string;
  };
  also_known_as?: Record<string, string>;
  related_terms: string[];
  appears_in: string[];
}

interface GlossaryMetadata {
  version: string;
  last_updated: string;
  term_count: number;
  categories: string[];
}

interface GlossaryData {
  metadata: GlossaryMetadata;
  terms: GlossaryTerm[];
}

export function useGlossary() {
  const [data, setData] = useState<GlossaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/');
    fetch(`${baseUrl}data/glossary_terms.json`)
      .then((res) => res.json())
      .then((data: GlossaryData) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load glossary terms');
        setLoading(false);
        console.error(err);
      });
  }, []);

  // Create a lookup map for quick term access by ID
  const termMap = useMemo(() => {
    const map = new Map<string, GlossaryTerm>();
    data?.terms.forEach((term) => {
      map.set(term.id, term);
      // Also map by display name (lowercase) for convenience
      map.set(term.display_name.toLowerCase(), term);
    });
    return map;
  }, [data?.terms]);

  // Get term by ID or display name
  const getTerm = useCallback(
    (idOrName: string): GlossaryTerm | undefined => {
      return termMap.get(idOrName) || termMap.get(idOrName.toLowerCase());
    },
    [termMap]
  );

  // Get all unique categories
  const categories = useMemo(() => {
    return data?.metadata.categories ?? [];
  }, [data?.metadata.categories]);

  return {
    terms: data?.terms ?? [],
    metadata: data?.metadata ?? null,
    categories,
    getTerm,
    loading,
    error,
  };
}

export function useGlossarySearch(terms: GlossaryTerm[]) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const fuse = useMemo(
    () =>
      new Fuse(terms, {
        keys: [
          { name: 'display_name', weight: 2 },
          { name: 'aliases', weight: 1.5 },
          { name: 'explanations.simple', weight: 1 },
          { name: 'explanations.business', weight: 0.8 },
          { name: 'category', weight: 0.5 },
        ],
        threshold: 0.35,
        includeScore: true,
      }),
    [terms]
  );

  const results = useMemo(() => {
    let filtered = terms;

    // Search
    if (query.trim()) {
      const searchResults = fuse.search(query);
      filtered = searchResults.map((r) => r.item);
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((t) => t.category === selectedCategory);
    }

    // Sort alphabetically by default
    return filtered.sort((a, b) =>
      a.display_name.localeCompare(b.display_name)
    );
  }, [query, selectedCategory, terms, fuse]);

  return {
    query,
    setQuery,
    selectedCategory,
    setSelectedCategory,
    results,
    totalCount: terms.length,
  };
}

// Export a simplified hook for components that just need to look up terms
export function useGlossaryLookup() {
  const { getTerm, loading } = useGlossary();
  return { getTerm, loading };
}
