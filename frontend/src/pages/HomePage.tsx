import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography } from '@mui/material';
import { Header, ErrorList, ErrorModal, FloatingActions, NewsletterSignup } from '../components';
import { useErrors, useErrorSearch, useUrlHash, setUrlHash } from '../hooks/useErrors';
import { useSEO } from '../hooks/useSEO';
import type { PaymentError } from '../types/error';

const HOME_SEO = {
  title: 'MX Error Guide - ISO 20022 Payment Error Reference | SWIFT, SEPA, FedNow',
  description:
    'Free ISO 20022 error code lookup. Find fixes for AC04, AM05, RC01 and 370+ payment errors. Covers SWIFT gpi, SEPA, FedNow, CBPR+. Search by code or keyword.',
  ogImage: 'https://mx-error-guide.pages.dev/og-image.png',
  ogUrl: 'https://mx-error-guide.pages.dev',
  canonical: 'https://mx-error-guide.pages.dev',
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'MX Error Guide',
    alternateName: ['ISO 20022 Error Guide', 'SWIFT Error Codes', 'Payment Error Reference'],
    url: 'https://mx-error-guide.pages.dev',
    description:
      'Comprehensive reference for ISO 20022 payment error codes. Lookup AC04, AM05, RC01 and hundreds more with causes and fix steps.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://mx-error-guide.pages.dev/?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: 'MX Error Guide',
    },
    keywords: [
      'ISO 20022 errors',
      'SWIFT error codes',
      'payment error lookup',
      'AC04 closed account',
      'AM05 duplicate',
      'RC01 invalid BIC',
      'pacs.008 errors',
      'SEPA rejection codes',
      'FedNow errors',
      'CBPR+ error codes',
      'MX payment errors',
      'cross-border payment errors',
    ],
  },
};

export const HomePage = () => {
  const navigate = useNavigate();
  const { errors, loading, error: loadError } = useErrors();
  const { query, setQuery, filters, setFilters, results, totalCount } = useErrorSearch(errors);
  const [selectedError, setSelectedError] = useState<PaymentError | null>(null);

  useSEO(HOME_SEO);

  const handleErrorSelect = useCallback((error: PaymentError) => {
    setSelectedError(error);
    setUrlHash(error.code);
  }, []);

  const handleErrorClick = useCallback(
    (error: PaymentError) => {
      // Navigate to individual page for SEO
      navigate(`/error/${error.code}`);
    },
    [navigate]
  );

  const handleModalClose = useCallback(() => {
    setSelectedError(null);
  }, []);

  // Handle URL hash for backward compatibility
  useUrlHash(errors, handleErrorSelect);

  if (loading) {
    return null; // Layout handles loading state
  }

  if (loadError) {
    return null; // Layout handles error state
  }

  return (
    <>
      {/* Header with Search and Filters */}
      <Header
        query={query}
        onQueryChange={setQuery}
        filters={filters}
        onFiltersChange={setFilters}
        resultCount={results.length}
        totalCount={totalCount}
      />

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ pt: 26, pb: 10 }}>
        {/* SEO-rich intro text */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: 'center', mb: 2, maxWidth: 600, mx: 'auto' }}
        >
          Search <strong>376+ ISO 20022 error codes</strong> from SWIFT, SEPA, FedNow, and CBPR+.
          Find causes and fixes for payment rejections.
        </Typography>

        {/* Search hint */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: 'center', mb: 3 }}
        >
          Try: AC04, frozen account, swift error, recipient rejected, compliance
        </Typography>

        {/* Error List - clicking navigates to SEO page */}
        <ErrorList errors={results} onErrorClick={handleErrorClick} />

        {/* Newsletter Signup */}
        <Container maxWidth="sm" sx={{ mt: 6 }}>
          <NewsletterSignup />
        </Container>
      </Container>



      {/* Error Detail Modal (for backward compatibility with hash links) */}
      <ErrorModal error={selectedError} onClose={handleModalClose} />

      {/* Floating Actions */}
      <FloatingActions />
    </>
  );
};
