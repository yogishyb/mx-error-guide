# Development Phases

> **Last Updated**: 2025-12-24

## Phase Overview

| Phase | Name | Status |
|-------|------|--------|
| 0 | Static Lookup MVP | **Complete** |
| 1 | Enriched Knowledge Base | **Complete** |
| 2 | Validator UI | Planned |

---

## Phase 0: Static Lookup MVP (Complete)

**Goal**: Validate demand with basic error lookup.

### Completed
- Project setup and repo structure
- Error code scraper (ISO 20022, Nium, SWIFT CBPR+, J.P. Morgan)
- React + TypeScript + MUI frontend
- Fuse.js fuzzy search with synonym expansion
- Category/severity filters
- Error detail modal with Ops/Dev tabs
- Mobile responsive dark theme
- Cloudflare Pages deployment
- Feedback form integration
- Plausible analytics (privacy-first)
- 376+ documented error codes

---

## Phase 1: Enriched Knowledge Base (Complete)

**Goal**: Become the authoritative reference for ISO 20022 errors.

### Completed
- Expanded to 376+ error codes with detailed explanations
- Template-based dual explanations (Operations + Developers)
- Message type guides:
  - pacs.008 (Customer Credit Transfer)
  - pacs.009 (Financial Institution Credit Transfer)
  - camt.053 (Bank to Customer Statement)
- SEO-optimized individual error pages (`/error/AC04`)
- Newsletter signup component
- Shareable URLs with deep linking
- Playwright E2E test suite
- React Router integration
- Pagination for large result sets

### In Progress
- Human-verified badge feature (trust indicators)

---

## Phase 2: Validator UI (Planned)

**Goal**: Let users paste XML and see errors highlighted in real-time.

### Planned Features
- Monaco Editor integration for XML editing
- XML paste/upload functionality
- Real-time syntax checking
- Error highlighting on exact line numbers
- Click error → jump to line
- Side panel with fix instructions
- Export validation report (PDF/JSON)
- Web Worker for non-blocking parsing

### Validation Layers
1. Well-formed XML check
2. Basic structure validation
3. Required fields presence
4. Format validation (IBAN, BIC, dates)
5. Code list validation (currency, country)

---

## Future: Premium Features

Advanced features planned for premium tiers:

| Feature | Description |
|---------|-------------|
| Full XSD Validation | Complete schema validation against ISO 20022 XSDs |
| Schematron Rules | Business rule validation |
| Market Practice Rules | CBPR+, SEPA, FedNow, CHAPS rule sets |
| Offline Support | PWA with cached schemas |
| Team Features | Shared configs, branded exports |
| Enterprise | Custom rules, on-premise deployment |

See [BUSINESS_MODEL.md](../BUSINESS_MODEL.md) for details.

---

## Contributing

Want to help? See [CONTRIBUTING.md](../CONTRIBUTING.md).

### Areas for Contribution
- Error code fixes and improvements
- New error codes with documentation
- Bug reports and feature requests
- Documentation improvements
- Message type guide enhancements

### Not Open for Contribution
- WASM validation engine (proprietary)
- Market practice rule sets (proprietary)
- Enterprise features (proprietary)
