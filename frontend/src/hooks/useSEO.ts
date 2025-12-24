import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogUrl?: string;
  jsonLd?: object | object[];
}

export const useSEO = ({ title, description, canonical, ogImage, ogUrl, jsonLd }: SEOProps) => {
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
    if (ogUrl) {
      updateMeta('og:url', ogUrl, true);
    }
    if (ogImage) {
      updateMeta('og:image', ogImage, true);
      updateMeta('og:image:alt', title, true);
    }

    // Twitter Card tags
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);
    if (ogImage) {
      updateMeta('twitter:image', ogImage);
      updateMeta('twitter:image:alt', title);
    }

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
      // Remove existing dynamic JSON-LD scripts (keep static ones from index.html)
      const existingScripts = document.querySelectorAll('script[type="application/ld+json"][data-dynamic="true"]');
      existingScripts.forEach(script => script.remove());

      // Add new JSON-LD (support both single object and array)
      const schemas = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      schemas.forEach(schema => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-dynamic', 'true');
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
      });
    }

    // Cleanup on unmount
    return () => {
      // Reset to default title
      document.title = 'MX Error Guide - ISO 20022 Payment Error Reference';
    };
  }, [title, description, canonical, ogImage, ogUrl, jsonLd]);
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

export const generateBreadcrumbJsonLd = (code: string) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://mx-error-guide.pages.dev',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: `Error ${code}`,
      item: `https://mx-error-guide.pages.dev/error/${code}`,
    },
  ],
});
