#!/usr/bin/env node

/**
 * Generates sitemap.xml from errors.json
 * Run: node scripts/generate-sitemap.js
 */

import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'https://toolgalaxy.in/iso20022';

// Read errors.json
const errorsPath = join(__dirname, '../public/data/errors.json');
const data = JSON.parse(readFileSync(errorsPath, 'utf-8'));
const errors = data.errors || data; // Handle both wrapped and array format

// Generate sitemap
const today = new Date().toISOString().split('T')[0];

const urls = [
  // Home page - highest priority
  {
    loc: BASE_URL,
    lastmod: today,
    changefreq: 'daily',
    priority: '1.0',
  },
  // Error Types page
  {
    loc: `${BASE_URL}/error-types`,
    lastmod: today,
    changefreq: 'weekly',
    priority: '0.9',
  },
  // Message Types page
  {
    loc: `${BASE_URL}/message-types`,
    lastmod: today,
    changefreq: 'weekly',
    priority: '0.9',
  },
  // Message guide pages
  {
    loc: `${BASE_URL}/#guides`,
    lastmod: today,
    changefreq: 'weekly',
    priority: '0.8',
  },
  // Individual error pages
  ...errors.map((error) => ({
    loc: `${BASE_URL}/error/${error.code}`,
    lastmod: today,
    changefreq: 'weekly',
    priority: '0.7',
  })),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

// Write to public and dist folders
const publicPath = join(__dirname, '../public/sitemap.xml');
const distPath = join(__dirname, '../dist/iso20022/sitemap.xml');

writeFileSync(publicPath, sitemap);
console.log(`✅ Generated sitemap.xml with ${urls.length} URLs`);

// Try to write to dist if it exists
try {
  writeFileSync(distPath, sitemap);
  console.log('✅ Copied to dist/sitemap.xml');
} catch {
  console.log('ℹ️  dist/ folder not found (run after build)');
}
