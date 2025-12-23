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

## Quick Start

```bash
cd frontend
npm install
npm run dev
```

Opens at http://localhost:5173

---

## Free vs Pro

### Free (Forever)

Everything you need to look up and understand ISO 20022 errors:

| Feature | Included |
|---------|----------|
| Error database (376+ codes) | Unlimited |
| Search & filters | Unlimited |
| Error explanations (Ops + Dev) | Unlimited |
| Message type guides | Unlimited |
| Individual error pages | Unlimited |
| Shareable URLs | Unlimited |

**Limitations:**
- Basic XML syntax checking only
- No schema validation
- No market practice rules
- No offline support

### Pro (Coming Soon)

For teams who need production-grade validation:

| Feature | Benefit |
|---------|---------|
| Full XSD validation | Catch schema errors before submission |
| Schematron rules | Business rule validation |
| Market practice rules | CBPR+, SEPA, FedNow, CHAPS |
| Offline PWA | Works without internet |
| Unlimited validations | No daily limits |
| Priority updates | Get new rules first |

**Why Pro?**
- **Save hours** debugging rejected payments
- **Reduce costs** from failed transactions
- **Zero trust** - XML never leaves your browser
- **No compliance review** needed (no data sent to servers)

---

## Business Model: Open Core

MX Error Guide follows the **Open Core** model:

| Open Source (MIT) | Proprietary (Pro) |
|-------------------|-------------------|
| Error database | WASM validation engine |
| Lookup UI | Market rule sets |
| Search & filters | Offline PWA |
| Message guides | Team features |
| Scraper scripts | Enterprise features |

**Free forever**: Error lookup and reference features

See [BUSINESS_MODEL.md](./BUSINESS_MODEL.md) for details.

---

## Contributing

We welcome contributions to the error database and open source components!

- Fix error descriptions
- Add missing error codes
- Report bugs
- Improve documentation

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## Support the Project

- [Star on GitHub](https://github.com/yogishyb/mx-error-guide)
- [Buy Me a Coffee](https://buymeacoffee.com/mxerrorguide)
- [GitHub Sponsors](https://github.com/sponsors/mxerrorguide)

## Full Documentation

See **[GETTING_STARTED.md](./GETTING_STARTED.md)** for:
- Building and deploying
- Scraper setup
- Cloudflare configuration
- All commands reference

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + TypeScript + MUI v7 |
| Search | Fuse.js |
| Testing | Playwright |
| Scraper | Python |
| Hosting | Cloudflare Pages |

## Project Structure

```
mx-error-guide/
├── frontend/           # React SPA (MIT)
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── data/       # Error database
│   │   ├── pages/      # Route pages
│   │   └── hooks/      # Custom hooks
│   └── e2e/            # Playwright tests
├── scraper/            # Data collection (MIT)
├── context/            # Project docs
└── .claude/            # AI agent configs
```

## License

**Open Source Components**: MIT License

See [LICENSE](./LICENSE) for details. Some future components (validation engine, enterprise features) will be proprietary.

---

Built with care for the ISO 20022 community.
