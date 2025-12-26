# Cloudflare Worker Setup for toolgalaxy.in/iso20022

This guide explains how to deploy MX Error Guide under the `toolgalaxy.in/iso20022` path using Cloudflare Workers, and why this approach maintains (and even improves) SEO.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         toolgalaxy.in                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   User Request                                                  │
│        │                                                        │
│        ▼                                                        │
│   ┌─────────────────────┐                                       │
│   │  Cloudflare Worker  │                                       │
│   │  (iso20022-router)  │                                       │
│   └─────────────────────┘                                       │
│        │                                                        │
│        ├── /iso20022/*  ──────►  MX Error Guide                 │
│        │                         (mx-error-guide.pages.dev)     │
│        │                                                        │
│        └── /*  ───────────────►  DevToolkit                     │
│                                  (devtoolkit.pages.dev)         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key Points:**
- Single domain (`toolgalaxy.in`) serves both apps
- Cloudflare Worker routes requests based on path
- Each app remains independent (separate repos, builds, deployments)
- Users see seamless navigation between tools

---

## Step-by-Step Setup

### Prerequisites

- Cloudflare account with `toolgalaxy.in` domain
- Two Cloudflare Pages projects deployed:
  - `devtoolkit` → DevToolkit app
  - `mx-error-guide` → MX Error Guide app

### Step 1: Create the Worker

1. Go to **Cloudflare Dashboard** → **Workers & Pages**
2. Click **Create Worker**
3. Name it `iso20022-router`
4. Replace the default code with:

```javascript
/**
 * ISO 20022 Router Worker
 * Routes /iso20022/* to MX Error Guide, everything else to DevToolkit
 */

const MX_ORIGIN = 'https://mx-error-guide.pages.dev';
const DEVTOOLKIT_ORIGIN = 'https://devtoolkit.pages.dev';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Route /iso20022/* to MX Error Guide
    if (url.pathname.startsWith('/iso20022')) {
      return proxyToOrigin(request, url, MX_ORIGIN);
    }

    // Everything else goes to DevToolkit
    return proxyToOrigin(request, url, DEVTOOLKIT_ORIGIN);
  }
};

async function proxyToOrigin(request, url, origin) {
  const targetUrl = new URL(url.pathname + url.search, origin);

  const response = await fetch(targetUrl.toString(), {
    method: request.method,
    headers: request.headers,
    body: request.body,
    redirect: 'manual'
  });

  // Clone response with cache headers for static assets
  const newHeaders = new Headers(response.headers);

  if (isStaticAsset(url.pathname)) {
    newHeaders.set('Cache-Control', 'public, max-age=31536000, immutable');
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}

function isStaticAsset(pathname) {
  const staticExtensions = [
    '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg',
    '.ico', '.woff', '.woff2', '.ttf', '.eot', '.json', '.webp'
  ];
  return staticExtensions.some(ext => pathname.endsWith(ext));
}
```

5. Click **Save and Deploy**

### Step 2: Add Worker Route

1. Go to **Cloudflare Dashboard** → **toolgalaxy.in** → **Workers Routes**
2. Click **Add Route**
3. Configure:
   - **Route:** `toolgalaxy.in/*`
   - **Worker:** `iso20022-router`
   - **Environment:** Production
4. Click **Save**

### Step 3: Verify Deployment

Test these URLs:

| URL | Expected Result |
|-----|-----------------|
| `toolgalaxy.in` | DevToolkit home page |
| `toolgalaxy.in/dev` | DevToolkit developer tools |
| `toolgalaxy.in/iso20022` | MX Error Guide home |
| `toolgalaxy.in/iso20022/error/AC04` | AC04 error detail page |

---

## SEO Configuration (Already Done)

The following SEO optimizations are already configured in the codebase:

### 1. Canonical URLs

All pages point to the production URL:

```html
<!-- frontend/index.html -->
<link rel="canonical" href="https://toolgalaxy.in/iso20022" />
```

### 2. Open Graph & Twitter Cards

```html
<meta property="og:url" content="https://toolgalaxy.in/iso20022" />
<meta property="og:image" content="https://toolgalaxy.in/iso20022/og-image.png" />
```

### 3. Structured Data (JSON-LD)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "MX Error Guide",
  "url": "https://toolgalaxy.in/iso20022",
  "applicationCategory": "DeveloperApplication"
}
</script>
```

### 4. Sitemap

All 896+ error pages are indexed with production URLs:

```xml
<!-- frontend/public/sitemap.xml -->
<url>
  <loc>https://toolgalaxy.in/iso20022</loc>
  <priority>1.0</priority>
</url>
<url>
  <loc>https://toolgalaxy.in/iso20022/error/AC04</loc>
  <priority>0.7</priority>
</url>
<!-- ... 896+ error pages -->
```

### 5. Robots.txt

```txt
User-agent: *
Allow: /

Sitemap: https://toolgalaxy.in/iso20022/sitemap.xml
```

### 6. Block .pages.dev from Indexing

```txt
<!-- frontend/public/_headers -->
https://mx-error-guide.pages.dev/*
  X-Robots-Tag: noindex, nofollow
```

---

## Why This Setup Does NOT Hurt SEO

### Common Concern: "Doesn't proxying hurt SEO?"

**No.** Here's why:

### 1. Content is Served Directly (Not Redirected)

```
❌ BAD (Redirect):
User → toolgalaxy.in/iso20022 → 301 → mx-error-guide.pages.dev
(Google sees redirect, may index wrong URL)

✅ GOOD (Proxy - What We Do):
User → toolgalaxy.in/iso20022 → Worker fetches content → Returns HTML
(Google sees content at toolgalaxy.in/iso20022, indexes correct URL)
```

The Worker **fetches and returns** the content. It doesn't redirect. Google's crawler receives the full HTML at the canonical URL.

### 2. Canonical URLs Are Correct

Every page explicitly declares its canonical URL:

```html
<link rel="canonical" href="https://toolgalaxy.in/iso20022/error/AC04" />
```

Google respects canonical tags. Even if it somehow discovered the `.pages.dev` URL, it would consolidate signals to the canonical.

### 3. .pages.dev is Blocked

The `_headers` file sends `X-Robots-Tag: noindex` for all `.pages.dev` requests:

```
https://mx-error-guide.pages.dev/*
  X-Robots-Tag: noindex, nofollow
```

Search engines won't index the origin URL.

### 4. Sitemap Points to Production URLs

The sitemap only contains `toolgalaxy.in` URLs. Search engines discover pages through the sitemap, not by crawling the origin.

### 5. Single Domain = Consolidated Authority

**Before (Two Domains):**
```
toolgalaxy.in        → Domain Authority: 20
mx-error-guide.com   → Domain Authority: 5 (new domain)
```

**After (Single Domain):**
```
toolgalaxy.in        → Domain Authority: 20
toolgalaxy.in/iso20022 → Inherits Authority: 20
```

Subdirectories inherit the parent domain's authority. New domains start from zero.

### 6. Google Handles Workers/Proxies Fine

Cloudflare Workers are used by millions of sites. Google's crawler:
- Executes JavaScript
- Follows the response chain
- Respects canonical tags
- Indexes the URL it was given

Major sites using similar patterns:
- Vercel (edge functions)
- Netlify (redirects/rewrites)
- Next.js (ISR/SSR)

---

## SEO Benefits of This Setup

| Benefit | Explanation |
|---------|-------------|
| **Domain Authority** | `/iso20022` inherits `toolgalaxy.in` authority instead of starting at zero |
| **Link Equity** | Backlinks to either section benefit the whole domain |
| **Crawl Budget** | Single domain = efficient crawling |
| **Brand Recognition** | One domain to remember, share, and build |
| **Cost Savings** | No annual domain renewal fee |
| **Analytics** | Unified Plausible/GA tracking across both apps |

---

## Verification Checklist

After setup, verify:

- [ ] `toolgalaxy.in/iso20022` loads MX Error Guide
- [ ] `toolgalaxy.in/iso20022/error/AC04` loads error detail
- [ ] View source shows `<link rel="canonical" href="https://toolgalaxy.in/iso20022..."`
- [ ] `mx-error-guide.pages.dev` returns `X-Robots-Tag: noindex` header
- [ ] Google Search Console shows `toolgalaxy.in` (submit sitemap)
- [ ] No 301/302 redirects in network tab (should be 200 OK)

---

## Troubleshooting

### Pages not loading under /iso20022

**Cause:** Worker route not configured correctly.

**Fix:** Ensure route is `toolgalaxy.in/*` (with wildcard), not `toolgalaxy.in/iso20022/*`.

### 404 errors for assets (CSS, JS)

**Cause:** Vite base path not set.

**Fix:** Verify `vite.config.ts` has:
```typescript
export default defineConfig({
  base: '/iso20022/',
  // ...
});
```

### React Router shows blank page

**Cause:** Router basename not set.

**Fix:** Verify `App.tsx` has:
```tsx
<BrowserRouter basename="/iso20022">
```

### Google indexing .pages.dev URLs

**Cause:** `_headers` file not deployed or misconfigured.

**Fix:**
1. Verify `frontend/public/_headers` exists
2. Check deployed site headers: `curl -I https://mx-error-guide.pages.dev`
3. Should show: `X-Robots-Tag: noindex, nofollow`

---

## File References

| File | Purpose |
|------|---------|
| `frontend/vite.config.ts` | Base path `/iso20022/` |
| `frontend/src/App.tsx` | Router basename `/iso20022` |
| `frontend/index.html` | Canonical URLs, OG tags, structured data |
| `frontend/public/sitemap.xml` | 896+ URLs with production domain |
| `frontend/public/robots.txt` | Sitemap reference |
| `frontend/public/_headers` | Block .pages.dev indexing |

---

## Summary

This Cloudflare Worker setup:

1. ✅ Routes `/iso20022/*` to MX Error Guide seamlessly
2. ✅ Maintains full SEO with correct canonical URLs
3. ✅ Blocks origin `.pages.dev` from indexing
4. ✅ Inherits domain authority from `toolgalaxy.in`
5. ✅ Saves domain registration costs
6. ✅ Provides unified analytics and branding

The setup follows industry best practices used by Vercel, Netlify, and major SaaS platforms.
