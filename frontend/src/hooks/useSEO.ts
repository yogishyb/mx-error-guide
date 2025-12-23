import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  jsonLd?: object;
}

export const useSEO = ({ title, description, canonical, ogImage, jsonLd }: SEOProps) => {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta tags
    const updateMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Standard meta tags
    updateMeta('description', description);

    // Open Graph tags
    updateMeta('og:title', title, true);
    updateMeta('og:description', description, true);
    updateMeta('og:type', 'website', true);
    if (ogImage) {
      updateMeta('og:image', ogImage, true);
    }

    // Twitter Card tags
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);

    // Canonical URL
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = canonical;
    }

    // JSON-LD structured data
    if (jsonLd) {
      let script = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(jsonLd);
    }

    // Cleanup on unmount
    return () => {
      // Reset to default title
      document.title = 'MX Error Guide - ISO 20022 Payment Error Reference';
    };
  }, [title, description, canonical, ogImage, jsonLd]);
};

export const generateErrorJsonLd = (error: {
  code: string;
  name: string;
  description: string;
  category: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  name: `${error.code} - ${error.name}`,
  description: error.description,
  about: {
    '@type': 'Thing',
    name: 'ISO 20022 Payment Error',
  },
  articleSection: error.category,
  publisher: {
    '@type': 'Organization',
    name: 'MX Error Guide',
    url: 'https://mx-error-guide.pages.dev',
  },
});
