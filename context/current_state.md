# MX Error Guide - Current State

> Live development status for the open source error lookup tool.

**Last Updated**: 2025-12-24

---

## Project Status

| Metric | Value |
|--------|-------|
| **Current Phase** | Phase 1 Complete |
| **Next Phase** | Phase 2 (Validator UI) |
| **Live Site** | https://mx-error-guide.pages.dev |
| **Error Codes** | 376+ documented |
| **Tech Stack** | React 19 + TypeScript + MUI v7 |

---

## Phase Summary

### Phase 0: Static Lookup MVP
Status: **COMPLETE** ✅

Deliverables achieved:
- Static error lookup site
- Fuzzy search with Fuse.js
- Category/severity filters
- Mobile responsive design
- 50+ error codes

### Phase 1: Enriched Knowledge Base
Status: **COMPLETE** ✅

Deliverables achieved:
- Migrated to React + TypeScript
- Material UI (MUI) v7 integration
- 376+ error codes with detailed explanations
- Dual explanations (Operations + Developers)
- Message type guides (pacs.008, pacs.009, camt.053)
- SEO-optimized individual error pages (/error/AC04)
- Newsletter signup integration
- Playwright E2E test suite
- Deployed to Cloudflare Pages

### Phase 2: Validator UI
Status: **NOT STARTED** ⏳

Planned features:
- Monaco Editor integration
- XML paste/upload
- Real-time syntax checking
- Error highlighting
- Fix instructions panel
- Validation report export
- 100% client-side validation

---

## Technical Architecture

```
mx-error-guide/ (PUBLIC REPO - MIT License)
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── hooks/            # Custom hooks (useErrors, useSEO)
│   │   ├── pages/            # HomePage, ErrorPage
│   │   ├── theme/            # MUI dark theme
│   │   └── utils/            # Utilities (synonyms, explanations)
│   ├── public/
│   │   └── data/
│   │       └── errors.json   # Error database (376 codes)
│   └── e2e/                  # Playwright tests
│
├── scraper/                  # Python data scraper
│   ├── scrape_iso20022.py
│   ├── data_manager_kb.py
│   └── data/
│       └── error_knowledge_base.json
│
└── context/                  # Project documentation
    ├── vision.md
    └── current_state.md
```

---

## Key Features

### Error Lookup
- 376+ ISO 20022 error codes
- Fuzzy search with Fuse.js
- Synonym expansion (e.g., "closed account" finds AC04)
- Category filters (Account, Beneficiary, etc.)
- Severity filters (fatal, warning, info)

### Individual Error Pages
- SEO-optimized URLs (/error/AC04)
- Shareable links
- Structured data for Google
- Dynamic meta tags
- Automatic sitemap generation

### Message Guides
- pacs.008 (Customer Credit Transfer)
- pacs.009 (Financial Institution Credit Transfer)
- camt.053 (Bank-to-Customer Statement)
- Interactive modal with key fields

### UX Features
- Dark theme (Material UI)
- Mobile responsive
- Fast search (<50ms)
- Keyboard navigation
- Newsletter signup
- "Support Us" section

---

## Testing

### E2E Tests (Playwright)
- Error page navigation
- Search functionality
- Message guides drawer
- Newsletter signup flow
- SEO meta tags
- Screenshot regression tests

All tests passing ✅

---

## Deployment

**Hosting**: Cloudflare Pages
**Build Command**: `cd frontend && npm install && npm run build`
**Build Output**: `frontend/dist`
**Live URL**: https://mx-error-guide.pages.dev

**Auto-deploy**: Pushes to `main` branch trigger automatic deployment.

---

## Data Pipeline

```
ISO 20022 Sources
      ↓
Python Scraper (scraper/)
      ↓
error_knowledge_base.json
      ↓
Copy to frontend/public/data/errors.json
      ↓
React app loads at runtime
```

**Update Process**:
```bash
cd scraper
python scrape_iso20022.py
cp data/error_knowledge_base.json ../frontend/public/data/errors.json
cd ../frontend
npm run build
# Push to trigger deploy
```

---

## Open Source Boundaries

This public repo contains:
- ✅ Error database and lookup UI
- ✅ Search and filter functionality
- ✅ Message type guides
- ✅ Scraper scripts
- ✅ E2E tests

This public repo does NOT contain:
- ❌ WASM validation engine (future proprietary)
- ❌ Market practice rules (future proprietary)
- ❌ Enterprise features (future proprietary)
- ❌ Licensing system (future proprietary)

---

## Activity Log

| Date | Agent | Task | Files Changed |
|------|-------|------|---------------|
| 2025-12-24 | Architect | Cleanup legacy code | Removed `_legacy_vanilla_js/` |
| 2025-12-24 | Architect | Updated agents | Updated `developer.md` for React |
| 2025-12-23 | Developer | Phase 1 complete | Full React migration |
| 2025-12-22 | Scraper | Data update | Added 376+ error codes |

---

## Next Steps

1. **Phase 2 Planning**
   - Design validator UI mockups
   - Evaluate Monaco Editor integration
   - Plan XML parsing strategy

2. **Content Enhancement**
   - Add more message type guides
   - Improve error fix instructions
   - Add real-world examples

3. **Community Growth**
   - SEO optimization
   - Share on LinkedIn/Twitter
   - Gather user feedback

---

## Blockers

None currently. Ready for Phase 2 planning.

---

## Metrics to Track

- Monthly visitors
- Most searched errors
- Newsletter signups
- GitHub stars
- Feedback submissions
