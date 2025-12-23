# MX Error Guide - Internal Code Flow

> **Purpose**: Complete technical documentation of how the project works internally
> **Last Updated**: 2025-12-23

---

## Table of Contents

1. [High-Level Architecture](#high-level-architecture)
2. [Data Flow Pipeline](#data-flow-pipeline)
3. [Scraper System](#scraper-system)
4. [Data Management](#data-management)
5. [Frontend Application (React)](#frontend-application-react)
6. [Search & Filter Logic](#search--filter-logic)
7. [Deployment Flow](#deployment-flow)
8. [Agent Workflows](#agent-workflows)

---

## High-Level Architecture

```
+---------------------------------------------------------------------------+
|                           MX ERROR GUIDE                                   |
+---------------------------------------------------------------------------+
|                                                                            |
|  +-------------+     +-------------+     +---------------------------+    |
|  |   SCRAPER   |---->|  DATA MGR   |---->|   FRONTEND (React + TS)   |    |
|  |  (Python)   |     |  (Python)   |     |   (Vite + MUI)            |    |
|  +-------------+     +-------------+     +---------------------------+    |
|        |                   |                        |                      |
|        v                   v                        v                      |
|  +-------------+     +-------------+     +---------------------------+    |
|  | Knowledge   |     |   Chunks    |     |     Browser (User)        |    |
|  | Base JSON   |     |  (20 each)  |     |   - Search/Filter         |    |
|  | (376 codes) |     +-------------+     |   - View Details          |    |
|  +-------------+                         +---------------------------+    |
|                                                                            |
+---------------------------------------------------------------------------+
```

### Key Principles

1. **100% Client-Side**: No server processing, all search/filter in browser
2. **Zero Data Leaves Browser**: Privacy-first, no backend API calls
3. **Static Hosting**: Deploy to any static host (Cloudflare, GitHub Pages, Vercel)
4. **React + TypeScript**: Type-safe, maintainable, scalable codebase
5. **Material UI**: Professional dark theme, responsive design

---

## Data Flow Pipeline

```
+---------------------------------------------------------------------------+
|                         DATA FLOW PIPELINE                                 |
+---------------------------------------------------------------------------+

STEP 1: SCRAPING (One-time or periodic)
---------------------------------------
+-------------+    +-------------+    +-------------+    +-------------+
|  ISO 20022  |    |    Nium     |    | SWIFT CBPR+ |    |  J.P.Morgan |
| JSON Schema |    |    Docs     |    |  (Built-in) |    |  (Built-in) |
+------+------+    +------+------+    +------+------+    +------+------+
       |                  |                  |                  |
       +------------------+------------------+------------------+
                                    |
                                    v
                    +-------------------------------+
                    |    scrape_iso20022.py         |
                    |    - Parses ISO JSON Schema   |
                    |    - Extracts 376+ codes      |
                    |    - Deduplicates entries     |
                    |    - Validates structure      |
                    +---------------+---------------+
                                    |
                                    v
                    +-------------------------------+
                    |  scraper/data/                |
                    |  error_knowledge_base.json    |
                    |  (376 errors)                 |
                    +-------------------------------+

STEP 2: COPY TO FRONTEND
------------------------
                    +-------------------------------+
                    |  cp scraper/data/             |
                    |  error_knowledge_base.json    |
                    |  frontend/public/data/        |
                    |  errors.json                  |
                    +-------------------------------+

STEP 3: FRONTEND LOADS DATA
---------------------------
                    +-------------------------------+
                    |      Browser loads React app  |
                    +---------------+---------------+
                                    |
                                    v
                    +-------------------------------+
                    |  useErrors hook fetches       |
                    |  /data/errors.json            |
                    +---------------+---------------+
                                    |
                                    v
                    +-------------------------------+
                    |   Initialize Fuse.js index    |
                    |   with synonym expansion      |
                    +---------------+---------------+
                                    |
                                    v
                    +-------------------------------+
                    |   Render ErrorCards with MUI  |
                    |   User can search/filter      |
                    +-------------------------------+
```

---

## Scraper System

### Location
```
scraper/
+-- scrape_iso20022.py      # Main scraper script
+-- data_manager_kb.py      # Knowledge base chunker
+-- requirements.txt        # Python dependencies
+-- venv/                   # Virtual environment
+-- data/
    +-- error_knowledge_base.json  # Combined output (376 codes)
    +-- iso20022_external_codes.json  # ISO source data
    +-- raw/                       # Raw scraped data
    +-- chunks/                    # Split files (max 20)
```

### ISO 20022 JSON Schema Parsing

The scraper now parses the official ISO 20022 JSON Schema format:

```python
def parse_iso20022_status_codes():
    """Parse ISO 20022 external code sets JSON Schema"""
    with open('data/iso20022_external_codes.json') as f:
        schema = json.load(f)

    # Navigate to definitions.ExternalStatusReason1Code
    code_sets = [
        'ExternalStatusReason1Code',
        'ExternalPaymentTransactionStatus1Code',
        # ... 5 code sets total
    ]

    errors = []
    for code_set in code_sets:
        definition = schema['definitions'][code_set]
        for enum_value in definition['enum']:
            # Parse description from 'title' field
            errors.append({
                'code': enum_value,
                'name': extract_name(definition['title']),
                # ...
            })

    return errors  # 376 unique codes
```

### Error Schema

```json
{
  "errors": [
    {
      "code": "AC04",
      "name": "ClosedAccountNumber",
      "category": "Account",
      "severity": "fatal",
      "description": {
        "short": "Brief description for card view",
        "detailed": "Full explanation for modal view"
      },
      "common_causes": [
        "Account was closed by customer",
        "Account dormant for extended period"
      ],
      "how_to_fix": {
        "steps": [
          "Verify account status with beneficiary",
          "Request updated account details"
        ],
        "prevention": "Validate accounts before sending"
      },
      "message_types": ["pacs.008", "pacs.004"],
      "xpath_locations": ["/Document/FIToFICstmrCdtTrf/..."],
      "market_practices": ["CBPR+", "SEPA"],
      "resources": [
        {
          "title": "ISO 20022 External Code Sets",
          "url": "https://www.iso20022.org/...",
          "type": "official"
        }
      ],
      "sources": ["ISO 20022"]
    }
  ]
}
```

### Running the Scraper

```bash
# Setup (first time)
cd scraper
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run scraper
python scrape_iso20022.py

# Output
# Extracted 376 unique error codes from 5 code sets

# Copy to frontend
cp data/error_knowledge_base.json ../frontend/public/data/errors.json
```

---

## Frontend Application (React)

### Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite 7** - Build tool
- **Material UI v7** - Component library
- **Fuse.js** - Fuzzy search

### File Structure

```
frontend/
+-- public/
|   +-- data/
|   |   +-- errors.json    # Error database (376+ codes)
|   +-- favicon.svg
+-- src/
|   +-- components/
|   |   +-- Header.tsx         # AppBar with search and filters
|   |   +-- ErrorCard.tsx      # Individual error card
|   |   +-- ErrorList.tsx      # Grid layout with pagination
|   |   +-- ErrorModal.tsx     # Detail dialog with Ops/Dev tabs
|   |   +-- FloatingActions.tsx # Back-to-top, feedback buttons
|   |   +-- index.ts           # Barrel export
|   +-- hooks/
|   |   +-- useErrors.ts       # Data fetching, search, URL hash
|   +-- theme/
|   |   +-- theme.ts           # MUI dark theme configuration
|   +-- types/
|   |   +-- error.ts           # TypeScript interfaces
|   +-- utils/
|   |   +-- synonyms.ts        # 50+ search synonym mappings
|   |   +-- explanations.ts    # Template-based Ops/Dev explanations
|   +-- App.tsx                # Main application component
|   +-- main.tsx               # Entry point
+-- package.json
+-- tsconfig.json
+-- vite.config.ts
```

### Component Architecture

```
App.tsx
  |
  +-- Header.tsx
  |     - Search input (TextField)
  |     - Category filter (Select)
  |     - Severity filter (Select)
  |     - Result count (Chip)
  |
  +-- ErrorList.tsx
  |     +-- ErrorCard.tsx (x12 per page)
  |     |     - Code, Name, Description
  |     |     - Severity chip, Category chip
  |     +-- Pagination
  |     +-- Show All toggle
  |
  +-- ErrorModal.tsx (on card click)
  |     - Dialog with full details
  |     - Tabs: For Operations / For Developers
  |     - Common Causes, How to Fix
  |     - Share button (copy URL)
  |
  +-- FloatingActions.tsx
        - Back to top FAB
        - Feedback FAB
```

### useErrors Hook

```typescript
// hooks/useErrors.ts

export function useErrors() {
  const [errors, setErrors] = useState<PaymentError[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data on mount
  useEffect(() => {
    fetch('/data/errors.json')
      .then(res => res.json())
      .then(data => {
        setErrors(data.errors);
        setLoading(false);
      });
  }, []);

  return { errors, loading };
}

export function useSearch(errors: PaymentError[], query: string, filters: FilterState) {
  const [results, setResults] = useState<PaymentError[]>([]);

  useEffect(() => {
    // Expand query with synonyms
    const expandedQuery = expandWithSynonyms(query);

    // Fuzzy search with Fuse.js
    const fuse = new Fuse(errors, fuseOptions);
    let filtered = query ? fuse.search(expandedQuery).map(r => r.item) : errors;

    // Apply filters
    if (filters.category) filtered = filtered.filter(e => e.category === filters.category);
    if (filters.severity) filtered = filtered.filter(e => e.severity === filters.severity);

    setResults(filtered);
  }, [errors, query, filters]);

  return results;
}

export function useUrlHash() {
  // Handle URL hash for shareable links (#AC04)
  // Opens modal automatically on page load if hash present
}
```

### Theme Configuration

```typescript
// theme/theme.ts
import { createTheme } from '@mui/material';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#00d4ff' },     // Cyan accent
    secondary: { main: '#8b5cf6' },   // Purple
    error: { main: '#ff6b6b' },       // Red for fatal
    warning: { main: '#fbbf24' },     // Amber for temporary
    background: {
      default: '#0a0a0f',             // Near-black
      paper: '#1a1a2e',               // Dark card
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
  },
});
```

---

## Search & Filter Logic

### Synonym Expansion

```typescript
// utils/synonyms.ts

const SYNONYMS: Record<string, string[]> = {
  // Account terms
  'closed': ['closed', 'terminated', 'inactive', 'dormant'],
  'blocked': ['blocked', 'frozen', 'suspended', 'locked'],

  // Amount terms
  'limit': ['limit', 'exceeded', 'threshold', 'maximum'],
  'currency': ['currency', 'fx', 'exchange', 'conversion'],

  // Technical terms
  'timeout': ['timeout', 'timed out', 'expired', 'deadline'],
  'iban': ['iban', 'international bank account', 'bic'],

  // ... 50+ mappings
};

export function expandWithSynonyms(query: string): string {
  const words = query.toLowerCase().split(/\s+/);
  const expanded = new Set<string>();

  for (const word of words) {
    expanded.add(word);
    for (const [key, synonyms] of Object.entries(SYNONYMS)) {
      if (synonyms.includes(word)) {
        synonyms.forEach(s => expanded.add(s));
      }
    }
  }

  return Array.from(expanded).join(' ');
}
```

### Fuse.js Configuration

```typescript
const fuseOptions = {
  keys: [
    { name: 'code', weight: 2 },           // "AC04" matches strongly
    { name: 'name', weight: 1.5 },         // "ClosedAccount"
    { name: 'description.short', weight: 1 },
    { name: 'description.detailed', weight: 0.8 },
    { name: 'common_causes', weight: 0.6 },
  ],
  threshold: 0.35,    // 0 = exact, 1 = match anything
  includeScore: true,
};
```

### Template-Based Explanations

```typescript
// utils/explanations.ts

const TEMPLATES = {
  Account: {
    fatal: {
      ops: "This account-related error requires customer action...",
      dev: "// Account validation failed at payment initiation..."
    },
    temporary: {
      ops: "This account issue may be temporary...",
      dev: "// Implement retry logic with exponential backoff..."
    }
  },
  Amount: { /* ... */ },
  // 11 categories x 2 severities x 2 audiences = 44 templates
};

export function generateExplanations(error: PaymentError) {
  const template = TEMPLATES[error.category]?.[error.severity];
  return {
    forOps: interpolate(template.ops, error),
    forDevs: interpolate(template.dev, error),
  };
}
```

---

## Deployment Flow

```
+---------------------------------------------------------------------------+
|                       DEPLOYMENT FLOW                                      |
+---------------------------------------------------------------------------+

LOCAL DEVELOPMENT
-----------------
   Developer Machine
   +---------------------------------------------+
   |  cd frontend                                |
   |  npm install                                |
   |  npm run dev                                |
   |  # Opens http://localhost:5173              |
   +---------------------------------------------+
                        |
                        v
BUILD PRODUCTION
----------------
   +---------------------------------------------+
   |  npm run build                              |
   |  # Outputs to frontend/dist/                |
   |  # TypeScript check + Vite bundle           |
   +---------------------------------------------+
                        |
                        v
GIT COMMIT & PUSH
-----------------
   +---------------------------------------------+
   |  git add -A                                 |
   |  git commit -m "Add feature X"              |
   |  git push origin main                       |
   +---------------------------------------------+
                        |
                        v
STATIC HOSTING (Auto-Deploy)
----------------------------
   +---------------------------------------------+
   |  Cloudflare Pages / Vercel / GitHub Pages   |
   |  1. Detects push to main                    |
   |  2. Runs: npm run build                     |
   |  3. Deploys frontend/dist/ to CDN           |
   +---------------------------------------------+
                        |
                        v
LIVE SITE
---------
   +---------------------------------------------+
   |  https://mx-error-guide.pages.dev           |
   |  - Global CDN                               |
   |  - HTTPS enabled                            |
   +---------------------------------------------+
```

### Hosting Configuration

| Platform | Build Command | Output Directory |
|----------|---------------|------------------|
| Cloudflare Pages | `npm run build` | `frontend/dist` |
| Vercel | `npm run build` | `frontend/dist` |
| GitHub Pages | `npm run build` | `frontend/dist` |

---

## Agent Workflows

### Agent Team

```
+---------------------------------------------------------------------------+
|                        AGENT TEAM                                          |
+---------------------------------------------------------------------------+
|                                                                            |
|  +--------------+                                                          |
|  |  ARCHITECT   |<--- Orchestrates all agents, maintains vision            |
|  +------+-------+                                                          |
|         |                                                                  |
|    +----+----+------------+------------+------------+                      |
|    v         v            v            v            v                      |
| +------+ +------+    +--------+  +---------+  +---------+                  |
| | REACT| |SCRAPR|    | TESTER |  | GROWTH  |  | DEVOPS  |                  |
| | DEV  | |      |    |        |  |         |  |         |                  |
| +------+ +------+    +--------+  +---------+  +---------+                  |
|    |         |            |            |            |                      |
|    v         v            v            v            v                      |
| Frontend  Data         QA Tests    Marketing    Git/Deploy                 |
| React/TS  Scraping     Visual      Analytics    CI/CD                      |
|                                                                            |
+---------------------------------------------------------------------------+
```

### React Developer Responsibilities

1. **Component Development** - Build reusable React components with TypeScript
2. **State Management** - Implement hooks for data fetching, search, filters
3. **UI/UX** - Material UI theming, responsive design, accessibility
4. **Performance** - Memoization, lazy loading, bundle optimization
5. **Testing** - Component tests, integration tests

---

## Quick Reference

```bash
# Frontend Development
cd frontend
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Scraper
cd scraper
source venv/bin/activate
python scrape_iso20022.py

# Copy data to frontend
cp scraper/data/error_knowledge_base.json frontend/public/data/errors.json

# Git workflow
git add -A
git commit -m "message"
git push
```

---

## Legacy Code

The original vanilla JavaScript implementation has been archived to `_legacy_vanilla_js/` for reference. This includes:
- `app.js` - Original application logic
- `styles.css` - Original styling
- `index.html` - Original HTML

The React implementation provides the same features with improved maintainability and scalability.
