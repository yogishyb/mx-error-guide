# MX Error Guide - Getting Started

> Single guide for running, building, and deploying the project.

---

## Quick Links

| Resource | URL |
|----------|-----|
| Live Site | https://mx-error-guide.pages.dev |
| Analytics | https://plausible.io/mx-error-guide.pages.dev |
| GitHub | https://github.com/yogishyb/mx-error-guide |

---

## Prerequisites

- **Node.js 18+** (for frontend)
- **Python 3.9+** (for scraper only)
- **npm** or **yarn**

---

## 1. Clone & Install

```bash
git clone https://github.com/yogishyb/mx-error-guide.git
cd mx-error-guide

# Install frontend dependencies
cd frontend
npm install
```

---

## 2. Run Development Server

```bash
cd frontend
npm run dev
```

Opens at **http://localhost:5173**

---

## 3. Build for Production

```bash
cd frontend
npm run build
```

Output: `frontend/dist/`

---

## 4. Preview Production Build

```bash
cd frontend
npm run preview
```

---

## 5. Update Error Data (Scraper)

```bash
# Setup (first time only)
cd scraper
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run scraper
python scrape_iso20022.py

# Copy to frontend
cp data/error_knowledge_base.json ../frontend/public/data/errors.json
```

---

## 6. Deploy to Cloudflare Pages

### Option A: Auto-Deploy (Recommended)

Push to `main` branch - Cloudflare auto-deploys.

**Cloudflare Pages Settings**:
| Setting | Value |
|---------|-------|
| Build command | `cd frontend && npm install && npm run build` |
| Build output | `frontend/dist` |
| Root directory | `/` |

### Option B: Manual Deploy (CLI)

```bash
# Install Wrangler
npm install -g wrangler

# Login
wrangler login

# Deploy
cd frontend
npm run build
wrangler pages deploy dist --project-name=mx-error-guide
```

---

## Project Structure

```
mx-error-guide/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── hooks/            # Custom hooks
│   │   ├── theme/            # MUI theme
│   │   ├── types/            # TypeScript types
│   │   ├── utils/            # Utilities
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   │   └── data/errors.json  # Error database (376 codes)
│   ├── dist/                 # Production build output
│   └── package.json
│
├── scraper/                  # Python scraper (data collection only)
│   ├── scrape_iso20022.py
│   ├── data_manager.py
│   ├── requirements.txt
│   └── data/
│       └── error_knowledge_base.json
│
├── context/                  # Project documentation
│   ├── vision.md
│   ├── current_state.md
│   ├── phased_development.md
│   └── ...
│
├── _legacy_vanilla_js/       # Archived old vanilla JS code
│
└── GETTING_STARTED.md        # This file
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite 7 |
| UI | Material UI (MUI) v7 |
| Search | Fuse.js (client-side fuzzy search) |
| Scraper | Python (data collection only) |
| Hosting | Cloudflare Pages |
| Backend (future) | Spring Boot + PostgreSQL |

---

## All Commands Reference

### Frontend

```bash
cd frontend
npm install          # Install dependencies
npm run dev          # Start dev server (localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Scraper

```bash
cd scraper
source venv/bin/activate
python scrape_iso20022.py                    # Run scraper
python data_manager.py stats                 # Show data stats
python data_manager.py split                 # Split into chunks
python data_manager.py combine               # Combine chunks
python data_manager.py validate              # Validate JSON
```

### Deployment

```bash
# Cloudflare CLI
wrangler login
wrangler pages deploy frontend/dist --project-name=mx-error-guide
```

### Utility

```bash
# Kill port
npx kill-port 5173

# Check what's using a port
lsof -ti:5173
```

---

## Environment URLs

| Environment | URL |
|-------------|-----|
| Development | http://localhost:5173 |
| Production | https://mx-error-guide.pages.dev |
| Preview | https://<commit>.mx-error-guide.pages.dev |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port in use | `npx kill-port 5173` |
| Build fails | Check TypeScript errors: `npm run lint` |
| Data not loading | Verify `frontend/public/data/errors.json` exists |
| Scraper fails | Activate venv: `source scraper/venv/bin/activate` |

---

## Data Sources

- [ISO 20022 External Code Sets](https://www.iso20022.org/catalogue-messages/additional-content-messages/external-code-sets)
- [Nium Failure Codes](https://docs.nium.com/docs/failure-codes)
- [SWIFT CBPR+ Guidelines](https://www.swift.com/standards/iso-20022/iso-20022-programme)
- [J.P. Morgan ISO 20022](https://www.jpmorgan.com/payments/iso-20022)

---

## Agent Commands (Claude Code)

```
@.claude/agents/project-architect.md   # Project planning
@.claude/agents/react-developer.md     # Frontend development
@.claude/agents/scraper.md             # Data scraping
@.claude/agents/visual-tester.md       # QA testing
@.claude/agents/github-devops-pro.md   # Git/deployment
```

---

## License

MIT
