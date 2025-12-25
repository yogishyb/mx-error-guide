import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography } from '@mui/material';
import { Header, ErrorList, FloatingActions } from '../components';
import { useErrors, useErrorSearch } from '../hooks/useErrors';
import { useSEO, generateFAQJsonLd } from '../hooks/useSEO';

const HOME_FAQ = [
  {
    question: 'What is AC04 error code in ISO 20022?',
    answer: 'AC04 is a Closed Account Number error. It occurs when a payment is sent to a bank account that has been closed. To fix this, verify the account status with the recipient and obtain updated account details.',
  },
  {
    question: 'How do I fix ISO 20022 payment errors?',
    answer: 'To fix ISO 20022 payment errors: 1) Identify the specific error code (e.g., AC04, AM05, RC01), 2) Review the error description and common causes, 3) Follow the fix steps provided for that code, 4) Implement prevention measures to avoid future occurrences.',
  },
  {
    question: 'What does SWIFT error RC01 mean?',
    answer: 'RC01 means Bank Identifier Incorrect. This error occurs when the BIC/SWIFT code in the payment message is invalid or does not match the actual bank. Verify the correct BIC code and resubmit the payment.',
  },
  {
    question: 'What is the difference between pacs.008 and pacs.009 messages?',
    answer: 'pacs.008 is a FICustomerCreditTransfer message used for customer credit transfers between financial institutions. pacs.009 is a FinancialInstitutionCreditTransfer used for credit transfers between financial institutions themselves. Both can return various error codes.',
  },
  {
    question: 'How many ISO 20022 error codes are there?',
    answer: 'There are 376+ ISO 20022 error codes covering SWIFT, SEPA, FedNow, and CBPR+ payment systems. These include Account (AC), Amount (AM), Bank (BE), and Regulatory (RC) error categories among others.',
  },
];

const HOME_SEO = {
  title: 'MX Error Guide - ISO 20022 Payment Error Reference | SWIFT, SEPA, FedNow',
  description:
    'Free ISO 20022 error code lookup. Find fixes for AC04, AM05, RC01 and 370+ payment errors. Covers SWIFT gpi, SEPA, FedNow, CBPR+. Search by code or keyword.',
  ogImage: 'https://mx-error-guide.pages.dev/og-image.png',
  ogUrl: 'https://mx-error-guide.pages.dev',
  canonical: 'https://mx-error-guide.pages.dev',
  jsonLd: [
    {
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
    generateFAQJsonLd(HOME_FAQ),
  ],
};

export const HomePage = () => {
  const navigate = useNavigate();
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
      </Container>

      {/* Floating Actions */}
      <FloatingActions />
    </>
  );
};
