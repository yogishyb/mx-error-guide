import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, useMediaQuery, useTheme } from '@mui/material';
import { Header, ErrorList, FloatingActions } from '../components';
import { SidebarAd, BannerAd, MobileBannerAd } from '../components/AdSense';
import { useErrors, useErrorSearch } from '../hooks/useErrors';
import { useSEO } from '../hooks/useSEO';
import { AD_SLOTS, AD_CONFIG } from '../config/adSlots';

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
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { errors, loading, error: loadError } = useErrors();
  const { query, setQuery, filters, setFilters, results, totalCount } = useErrorSearch(errors);

  useSEO(HOME_SEO);

  const handleErrorClick = useCallback(
    (error: { code: string }) => {
      navigate(`/error/${error.code}`);
    },
    [navigate]
  );

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
        {/* Mobile top banner ad */}
        {AD_CONFIG.ENABLE_MOBILE_BANNER && (
          <MobileBannerAd slot={AD_SLOTS.MOBILE_BANNER} />
        )}

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

        {/* Content with optional sidebar */}
        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Main Error List */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Error List - clicking navigates to SEO page */}
            <ErrorList errors={results} onErrorClick={handleErrorClick} />

            {/* Bottom banner ad - below error list */}
            {AD_CONFIG.ENABLE_BOTTOM_BANNER && (
              <BannerAd slot={AD_SLOTS.BOTTOM_BANNER} hideOnMobile />
            )}
          </Box>

          {/* Desktop Sidebar Ad */}
          {isDesktop && AD_CONFIG.ENABLE_SIDEBAR && (
            <SidebarAd slot={AD_SLOTS.SIDEBAR} />
          )}
        </Box>
      </Container>

      {/* Floating Actions */}
      <FloatingActions />
    </>
  );
};
