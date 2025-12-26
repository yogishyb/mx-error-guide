# Cloudflare Pages Middleware Setup for toolgalaxy.in/iso20022

This guide explains how MX Error Guide is deployed under `toolgalaxy.in/iso20022` using Cloudflare Pages Functions (middleware), and why this approach maintains SEO.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         toolgalaxy.in                           │
│                    (DevToolkit Pages Project)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   User Request                                                  │
│        │                                                        │
│        ▼                                                        │
│   ┌─────────────────────┐                                       │
│   │  Pages Middleware   │                                       │
│   │  (functions/_middleware.js)                                 │
│   └─────────────────────┘                                       │
│        │                                                        │
│        ├── /iso20022/*  ──────►  Proxy to MX Error Guide        │
│        │                         (mx-error-guide.pages.dev)     │
│        │                                                        │
│        └── /*  ───────────────►  DevToolkit Static Files        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key Points:**
- Single domain (`toolgalaxy.in`) serves both apps
- Cloudflare Pages middleware routes `/iso20022/*` requests
- Each app remains independent (separate repos, builds, deployments)
- Users see seamless navigation between tools

---

## Implementation Details

### Middleware Location (DevToolkit repo)

File: `functions/_middleware.js`

```javascript
/**
 * Cloudflare Pages Middleware
 * Intercepts all requests and routes /iso20022/* to MX Error Guide
 */

export async function onRequest(context) {
  const url = new URL(context.request.url);

  // Only handle /iso20022 routes
  if (url.pathname === '/iso20022' || url.pathname.startsWith('/iso20022/')) {
    // Always fetch with trailing slash to get content (avoids 308 redirect)
    let targetPath = url.pathname;
    if (targetPath === '/iso20022') {
      targetPath = '/iso20022/';
    }

    const targetUrl = 'https://mx-error-guide.pages.dev' + targetPath + url.search;

    const response = await fetch(targetUrl, {
      method: context.request.method,
      headers: context.request.headers,
      body: context.request.body,
      redirect: 'follow',
    });

    // Clone headers but remove problematic ones
    const headers = new Headers(response.headers);
    headers.delete('content-encoding');
    headers.delete('location');

    // Always return 200 for HTML pages (not redirects)
    const status = response.headers.get('content-type')?.includes('text/html')
      ? 200
      : response.status;

    return new Response(response.body, {
      status: status,
      headers: headers,
    });
  }

  // For all other routes, continue to the next handler (DevToolkit)
  return context.next();
}
```

### MX Error Guide Configuration

#### Vite Config (`vite.config.ts`)

```typescript
export default defineConfig({
  base: '/iso20022',  // No trailing slash!
  build: {
    outDir: 'dist/iso20022',
  },
  // ...
});
```

#### React Router (`App.tsx`)

```tsx
<BrowserRouter basename="/iso20022">
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/error/:code" element={<ErrorPage />} />
    <Route path="/reference" element={<ReferencePage />} />
  </Routes>
</BrowserRouter>
```

#### Data Fetching (`useErrors.ts`, `ErrorPage.tsx`)

```typescript
// Use Vite's BASE_URL to ensure correct path
const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/');
fetch(`${baseUrl}data/errors.json`)
```

#### SPA Routing (`public/_redirects`)

```
# Redirect root to /iso20022
/    /iso20022   302

# Handle /iso20022 base path (without trailing slash)
/iso20022   /iso20022/index.html   200

# SPA routing - serve index.html for all /iso20022/* routes
/iso20022/*    /iso20022/index.html   200
```

---

## URL Patterns

| URL | Behavior |
|-----|----------|
| `toolgalaxy.in/iso20022` | MX Error Guide home (no trailing slash) |
| `toolgalaxy.in/iso20022/` | MX Error Guide home (with trailing slash) |
| `toolgalaxy.in/iso20022/error/AC04` | Error detail page |
| `toolgalaxy.in/iso20022/reference` | Reference page |
| `toolgalaxy.in/` | DevToolkit home |
| `toolgalaxy.in/dev` | DevToolkit developer tools |

---

## SEO Configuration

### 1. Canonical URLs

All pages point to the production URL (without trailing slash):

```html
<link rel="canonical" href="https://toolgalaxy.in/iso20022" />
```

### 2. Open Graph & Twitter Cards

```html
<meta property="og:url" content="https://toolgalaxy.in/iso20022" />
<meta property="og:image" content="https://toolgalaxy.in/iso20022/og-image.png" />
```

### 3. Structured Data (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "MX Error Guide",
  "url": "https://toolgalaxy.in/iso20022"
}
```

### 4. Sitemap (900+ URLs)

```xml
<url>
  <loc>https://toolgalaxy.in/iso20022</loc>
  <priority>1.0</priority>
</url>
<url>
  <loc>https://toolgalaxy.in/iso20022/error/AC04</loc>
  <priority>0.7</priority>
</url>
```

### 5. Block .pages.dev from Indexing

```
# frontend/public/_headers
https://mx-error-guide.pages.dev/*
  X-Robots-Tag: noindex, nofollow
```

---

## Why Middleware Instead of Workers?

| Approach | Pros | Cons |
|----------|------|------|
| **Pages Middleware** (current) | Lives in repo, version controlled, no separate Worker setup | Slightly slower (extra hop) |
| **Cloudflare Worker** | Full control, can be shared across projects | Separate deployment, harder to maintain |

We use middleware because:
1. Configuration lives in the DevToolkit repo
2. Changes are version controlled
3. No need for separate Worker deployment
4. Simpler setup for contributors

---

## Build & Deploy Process

### MX Error Guide

1. Build outputs to `dist/iso20022/`
2. `_redirects` and `_headers` copied to `dist/` root
3. Push to main → Cloudflare auto-deploys

```bash
npm run build
# Output:
# dist/
# ├── _redirects
# ├── _headers
# └── iso20022/
#     ├── index.html
#     ├── assets/
#     └── data/
```

### DevToolkit

1. Build normally
2. Middleware in `functions/_middleware.js` auto-deploys
3. Push to main → Cloudflare auto-deploys

---

## Verification Checklist

- [ ] `toolgalaxy.in/iso20022` loads MX Error Guide (no trailing slash)
- [ ] `toolgalaxy.in/iso20022/error/AC04` loads error detail
- [ ] View source shows canonical: `https://toolgalaxy.in/iso20022`
- [ ] `mx-error-guide.pages.dev` returns `X-Robots-Tag: noindex`
- [ ] Data loads from `/iso20022/data/errors.json`
- [ ] Navigation between pages works (SPA routing)

---

## Troubleshooting

### Blank page at /iso20022

**Cause:** Base path mismatch or data fetch path wrong.

**Fix:**
1. Verify `vite.config.ts` has `base: '/iso20022'` (no trailing slash)
2. Verify data fetch uses `import.meta.env.BASE_URL`

### 404 for data/errors.json

**Cause:** Data fetch not using base URL.

**Fix:** Update fetch to:
```typescript
const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/');
fetch(`${baseUrl}data/errors.json`)
```

### Error pages not working (/iso20022/error/AC04)

**Cause:** SPA routing not configured.

**Fix:** Verify `public/_redirects` has:
```
/iso20022/*    /iso20022/index.html   200
```

---

## File References

| File | Purpose |
|------|---------|
| `frontend/vite.config.ts` | Base path `/iso20022` |
| `frontend/src/App.tsx` | Router basename `/iso20022` |
| `frontend/src/hooks/useErrors.ts` | Data fetch with BASE_URL |
| `frontend/src/pages/ErrorPage.tsx` | Data fetch with BASE_URL |
| `frontend/public/_redirects` | SPA routing |
| `frontend/public/_headers` | Block .pages.dev indexing |
| `frontend/index.html` | Canonical URLs, OG tags |
| `devtoolkit/functions/_middleware.js` | Proxy middleware |

---

## Summary

This setup:

1. ✅ Serves MX Error Guide at `/iso20022` (no trailing slash required)
2. ✅ Full SPA routing for all sub-pages
3. ✅ Correct data fetching with base URL
4. ✅ SEO optimized with canonical URLs
5. ✅ Blocks origin `.pages.dev` from indexing
6. ✅ Inherits domain authority from `toolgalaxy.in`
