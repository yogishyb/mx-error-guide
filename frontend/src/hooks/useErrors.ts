import { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';
import type { PaymentError, ErrorsData, FilterState } from '../types/error';
import { expandQueryWithSynonyms } from '../utils/synonyms';

export function useErrors() {
  const [errors, setErrors] = useState<PaymentError[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Use Vite's BASE_URL to ensure correct path with base path config
    // Ensure trailing slash for proper path concatenation
    const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/');
    fetch(`${baseUrl}data/errors.json`)
      .then((res) => res.json())
      .then((data: ErrorsData) => {
        setErrors(data.errors);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load error data');
        setLoading(false);
        console.error(err);
      });
  }, []);

  return { errors, loading, error };
}

export function useErrorSearch(errors: PaymentError[]) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({ category: '', severity: '' });

  const fuse = useMemo(
    () =>
      new Fuse(errors, {
        keys: [
          { name: 'code', weight: 2 },
          { name: 'name', weight: 1.5 },
          { name: 'description.short', weight: 1 },
          { name: 'description.detailed', weight: 0.8 },
        ],
        threshold: 0.35,
        includeScore: true,
      }),
    [errors]
  );

  const results = useMemo(() => {
    let filtered = errors;

    // Search with synonym expansion
    if (query.trim()) {
      const searchResults = fuse.search(query);

      // If few results, expand with synonyms
      if (searchResults.length < 5) {
        const expandedQuery = expandQueryWithSynonyms(query);
        if (expandedQuery !== query.toLowerCase()) {
          const synonymResults = fuse.search(expandedQuery);
          const seenCodes = new Set(searchResults.map((r) => r.item.code));

          synonymResults.forEach((r) => {
            if (!seenCodes.has(r.item.code)) {
              searchResults.push(r);
              seenCodes.add(r.item.code);
            }
          });
        }
      }

      filtered = searchResults.map((r) => r.item);
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter((e) => e.category === filters.category);
    }

    // Apply severity filter
    if (filters.severity) {
      filtered = filtered.filter((e) => e.severity === filters.severity);
    }

    return filtered;
  }, [query, filters, errors, fuse]);

  return {
    query,
    setQuery,
    filters,
    setFilters,
    results,
    totalCount: errors.length,
  };
}

export function useUrlHash(errors: PaymentError[], onErrorSelect: (error: PaymentError) => void) {
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.slice(1);
      if (hash && errors.length > 0) {
        const error = errors.find((e) => e.code.toUpperCase() === hash.toUpperCase());
        if (error) {
          onErrorSelect(error);
        }
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [errors, onErrorSelect]);
}

export function setUrlHash(code: string | null) {
  if (code) {
    history.pushState(null, '', `#${code}`);
  } else {
    history.pushState(null, '', window.location.pathname);
  }
}
