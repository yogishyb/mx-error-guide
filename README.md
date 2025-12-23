# MX Error Guide

Instant clarity on ISO 20022 / SWIFT MX payment errors.

**Live**: https://mx-error-guide.pages.dev

---

## Features

- 376+ ISO 20022 error codes with explanations
- Fuzzy search with synonym expansion
- Dual explanations: Operations + Developers
- Message type guides (pacs.008, pacs.009, camt.053)
- SEO-optimized individual error pages
- 100% client-side (zero data leaves browser)
- Shareable URLs (`/error/AC04`)
- Mobile responsive dark theme

---

## Quick Start

```bash
git clone https://github.com/yogishyb/mx-error-guide.git
cd mx-error-guide/frontend
npm install
npm run dev
```

Opens at http://localhost:5173

---

## What's Included

- 376+ ISO 20022 error codes with detailed explanations
- Dual explanations (Operations + Developers)
- Fuzzy search with synonym expansion
- Category/severity filters
- Message type guides (pacs.008, pacs.009, camt.053)
- SEO-optimized individual error pages
- Shareable URLs with deep linking
- Mobile responsive dark theme
- Playwright E2E test suite

---

## Open Source

This project is fully open source under the MIT License:

- Error database (376+ codes)
- Lookup UI with search & filters
- Message type guides
- Scraper scripts
- E2E tests

**Free forever**: Error lookup and reference features

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + TypeScript + MUI v7 |
| Build | Vite 7 |
| Search | Fuse.js (client-side) |
| Testing | Playwright E2E |
| Scraper | Python |
| Hosting | Cloudflare Pages |

---

## Project Structure

```
mx-error-guide/
├── frontend/                 # React application (MIT)
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── hooks/            # Custom hooks
│   │   ├── pages/            # Route pages
│   │   ├── theme/            # MUI theme
│   │   ├── types/            # TypeScript types
│   │   └── utils/            # Utilities
│   ├── public/
│   │   └── data/errors.json  # Error database (376 codes)
│   ├── e2e/                  # Playwright tests
│   └── dist/                 # Production build output
│
├── scraper/                  # Python scraper (MIT)
│   ├── scrape_iso20022.py
│   ├── data_manager.py
│   ├── requirements.txt
│   └── data/
│
└── _legacy_vanilla_js/       # Archived old vanilla JS code
```

---

## Development

### Prerequisites
- Node.js 18+
- npm
- Python 3.9+ (for scraper only)

### Frontend Commands

```bash
cd frontend
npm install          # Install dependencies
npm run dev          # Start dev server (localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Run Tests

```bash
cd frontend
npm run test              # Headless tests
npm run test:headed       # Visual browser tests
npm run test:ui           # Playwright UI mode
```

### Update Error Data (Scraper)

```bash
cd scraper
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python scrape_iso20022.py
cp data/error_knowledge_base.json ../frontend/public/data/errors.json
```

---

## Deployment

### Auto-Deploy (Recommended)
Push to `main` branch - Cloudflare auto-deploys.

**Cloudflare Pages Settings**:
| Setting | Value |
|---------|-------|
| Build command | `cd frontend && npm install && npm run build` |
| Build output | `frontend/dist` |
| Root directory | `/` |

### Manual Deploy (CLI)

```bash
npm install -g wrangler
wrangler login
cd frontend && npm run build
wrangler pages deploy dist --project-name=mx-error-guide
```

---

## Error Data Schema

```json
{
  "code": "AC04",
  "name": "ClosedAccountNumber",
  "category": "Account",
  "severity": "fatal",
  "description": {
    "short": "Account has been closed",
    "detailed": "Full explanation..."
  },
  "common_causes": ["..."],
  "how_to_fix": {
    "steps": ["..."],
    "prevention": "..."
  },
  "related_codes": ["AC01", "AC03"],
  "message_types": ["pacs.008", "pacs.004"],
  "xpath_locations": ["/path/to/element"],
  "resources": [{"title": "...", "url": "..."}]
}
```

---

## Contributing

We welcome contributions to the error database and open source components!

### Ways to Contribute
- Fix inaccurate error descriptions
- Add missing error codes
- Improve fix steps and common causes
- Report bugs
- Improve documentation

### Submit a PR

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Edit files (e.g., `frontend/public/data/errors.json`)
4. Run tests: `cd frontend && npm test`
5. Submit PR with clear description

### Commit Message Format
```
<type>: <short description>

Types: feat, fix, docs, style, refactor, test, chore
```

---

## Data Sources

- [ISO 20022 External Code Sets](https://www.iso20022.org/catalogue-messages/additional-content-messages/external-code-sets)
- [Nium Failure Codes](https://docs.nium.com/docs/failure-codes)
- [SWIFT CBPR+ Guidelines](https://www.swift.com/standards/iso-20022/iso-20022-programme)
- [J.P. Morgan ISO 20022](https://www.jpmorgan.com/payments/iso-20022)

---

## Environment URLs

| Environment | URL |
|-------------|-----|
| Development | http://localhost:5173 |
| Production | https://mx-error-guide.pages.dev |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port in use | `npx kill-port 5173` |
| Build fails | Check TypeScript errors: `npm run lint` |
| Data not loading | Verify `frontend/public/data/errors.json` exists |
| Scraper fails | Activate venv: `source scraper/venv/bin/activate` |

---

## Support the Project

- [Star on GitHub](https://github.com/yogishyb/mx-error-guide)
- [Buy Me a Coffee](https://buymeacoffee.com/yogishaybk)
- [GitHub Sponsors](https://github.com/sponsors/mxerrorguide)

---

## License

MIT License - See [LICENSE](./LICENSE)

---

Built with care for the ISO 20022 community.
