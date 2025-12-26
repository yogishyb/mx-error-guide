/**
 * Post-build script for Cloudflare Pages deployment
 *
 * Since we build to dist/iso20022/, Cloudflare-specific files
 * (_redirects, _headers) need to be at dist/ root.
 *
 * This script moves them after the Vite build.
 */

import { existsSync, copyFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distRoot = join(__dirname, '../dist');
const distIso = join(distRoot, 'iso20022');

// Files that need to be at dist/ root for Cloudflare Pages
const cloudflareFiles = ['_redirects', '_headers'];

console.log('📦 Post-build: Moving Cloudflare files to dist/ root...');

// Ensure dist/ root exists
if (!existsSync(distRoot)) {
  mkdirSync(distRoot, { recursive: true });
}

for (const file of cloudflareFiles) {
  const src = join(distIso, file);
  const dest = join(distRoot, file);

  if (existsSync(src)) {
    copyFileSync(src, dest);
    console.log(`  ✓ Moved ${file} to dist/`);
  } else {
    console.log(`  ⚠ ${file} not found in dist/iso20022/`);
  }
}

console.log('✅ Post-build complete!\n');
console.log('Deployment structure:');
console.log('  dist/');
console.log('  ├── _redirects');
console.log('  ├── _headers');
console.log('  └── iso20022/');
console.log('      ├── index.html');
console.log('      ├── assets/');
console.log('      └── data/');
