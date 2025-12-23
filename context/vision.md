# MX Error Guide - Product Vision

## What We're Building

A comprehensive ISO 20022 error code reference and learning platform.

```
MX Error Guide helps payment professionals:

1. Look up ISO 20022 error codes instantly
2. Understand what went wrong in plain English
3. Learn how to fix payment errors
4. Access message type guides
5. Search with fuzzy matching and synonyms
```


## Core Principles

- **Free Error Lookup**: Error database is open source and free forever
- **Community Driven**: Contributions welcome to improve accuracy
- **Privacy First**: No data collection, works offline
- **Mobile Friendly**: Responsive design for all devices

## Target Audience

| Audience | What They Get |
|----------|---------------|
| **Payment Ops** | Quick error lookup, fix steps |
| **Developers** | XPath locations, code examples |
| **Beginners** | Message type guides, learning resources |

## Current Features (Phase 0-1)

- 376+ ISO 20022 error codes
- Fuzzy search with synonym expansion
- Category and severity filters
- Individual error pages with SEO
- Message type guides (pacs.008, pacs.009, camt.053)
- Newsletter signup
- Mobile responsive dark theme

## Data Schema

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
  "resources": [{"title": "...", "url": "..."}]
}
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + TypeScript + MUI v7 |
| Search | Fuse.js (client-side) |
| Testing | Playwright E2E |
| Hosting | Cloudflare Pages |
| Data | Static JSON |

## Roadmap

| Phase | Name | Status |
|-------|------|--------|
| 0 | Static Lookup MVP | Complete |
| 1 | Enriched Knowledge Base | Complete |
| 2 | Validator UI | Planned |

## Success Metrics

- Monthly visitors
- Search queries
- Newsletter signups
- Community contributions

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for how to help improve the error database.

## License

MIT License - See [LICENSE](../LICENSE)
