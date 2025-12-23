# MX Error Guide - Project Structure

## Overview

MX Error Guide is a client-side ISO 20022 payment error reference tool. Zero backend, 100% static, deploys to GitHub Pages.

```
mx-error-guide/
├── README.md                    # Project documentation
├── .gitignore                   # Git ignore rules
├── context/                     # Project context & documentation
│   └── PROJECT_STRUCTURE.md     # This file
├── scraper/                     # Data collection & building
│   ├── scrape_iso20022.py       # Main scraper (v2.0)
│   ├── requirements.txt         # Python dependencies
│   ├── venv/                    # Python virtual environment
│   └── data/
│       ├── error_knowledge_base.json  # Built output
│       └── raw/
│           └── iso20022/        # Downloaded ISO 20022 files
└── public/                      # Frontend (deploy this folder)
    ├── index.html               # Main HTML
    ├── app.js                   # Client-side logic + Fuse.js search
    ├── styles.css               # Styling (dark theme)
    └── data/
        └── errors.json          # Production error database
```

---

## Data Flow

```
[ISO 20022 Official] ─┐
[Nium Docs]          ─┤
[SWIFT CBPR+ Docs]   ─┼──▶ scraper/scrape_iso20022.py ──▶ error_knowledge_base.json
[J.P. Morgan Docs]   ─┘                                          │
                                                                  ▼
                                                    Copy to: public/data/errors.json
                                                                  │
                                                                  ▼
                                                         [Browser / Fuse.js]
```

---

## Key Files

### `/scraper/scrape_iso20022.py`

**Purpose:** Collects, paraphrases, and enriches error codes from multiple sources.

**Key Functions:**
| Function | Description |
|----------|-------------|
| `paraphrase_description()` | Rewrites descriptions in original words |
| `get_common_causes()` | Returns common causes for error code |
| `get_fix_steps()` | Returns resolution steps |
| `get_prevention()` | Returns prevention advice by category |
| `parse_iso20022_status_codes()` | Parses official ISO 20022 JSON |
| `scrape_nium()` | Scrapes Nium failure codes page |
| `get_swift_cbpr_codes()` | Built-in SWIFT CBPR+ error data |
| `get_jpmorgan_codes()` | Built-in J.P. Morgan error data |
| `build_knowledge_base()` | Combines, deduplicates, enriches all codes |

**Run:**
```bash
cd scraper
source venv/bin/activate  # or: python -m venv venv && pip install -r requirements.txt
python scrape_iso20022.py
```

---

### `/public/data/errors.json`

**Schema (per error):**
```json
{
  "id": "err_001",
  "code": "AC01",
  "name": "IncorrectAccountNumber",
  "category": "Account",
  "severity": "fatal",
  "message_types": ["pacs.008", "pacs.004"],
  "description": {
    "short": "The account number is wrong or does not exist...",
    "detailed": "Full paraphrased description with context."
  },
  "common_causes": [
    "Typo in account number",
    "Outdated account details"
  ],
  "how_to_fix": {
    "steps": ["Verify account number", "Request updated details"],
    "prevention": "Always validate account details before payment."
  },
  "xpath_locations": [
    "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAcct/Id/IBAN"
  ],
  "related_codes": ["AC02", "AC03"],
  "market_practices": ["CBPR+", "SEPA", "FedNow"],
  "resources": [
    {
      "title": "Nium Implementation Guide",
      "url": "https://docs.nium.com/docs/failure-codes",
      "type": "implementation_guide"
    },
    {
      "title": "ISO 20022 External Code Sets",
      "url": "https://www.iso20022.org/...",
      "type": "official"
    }
  ],
  "metadata": {
    "added_date": "2025-12-23",
    "last_verified": "2025-12-23",
    "contributor": "scraper_v2",
    "confidence": "verified"
  }
}
```

---

### `/public/app.js`

**Search Configuration:**
```javascript
fuse = new Fuse(errors, {
    keys: [
        { name: 'code', weight: 2 },
        { name: 'name', weight: 1.5 },
        { name: 'description.short', weight: 1 },
        { name: 'description.detailed', weight: 0.8 }
    ],
    threshold: 0.35
});
```

---

## Categories

| ID | Name | Prefix | Description |
|----|------|--------|-------------|
| Account | Account Errors | AC | Debtor/creditor account issues |
| Amount | Amount Errors | AM | Payment amount/currency issues |
| Party | Party Information | BE, MM | Party identification issues |
| Routing | Routing Errors | RC, AGNT | Payment routing issues |
| Regulatory | Regulatory Errors | AG, RR, LEGL | Compliance rejections |
| System | System Errors | FF, AB, TECH | Technical failures |
| Cancellation | Cancellation | FOCR | Payment cancellation |
| Duplicate | Duplicate | DUPL | Duplicate detection |
| Narrative | Narrative | NARR | Reference field issues |

---

## Data Sources

| Source | URL | Type |
|--------|-----|------|
| ISO 20022 | https://www.iso20022.org/catalogue-messages/additional-content-messages/external-code-sets | Official standard |
| Nium | https://docs.nium.com/docs/failure-codes | Implementation guide |
| SWIFT CBPR+ | https://www.swift.com/standards/iso-20022/iso-20022-programme | Market practice |
| J.P. Morgan | https://www.jpmorgan.com/payments/iso-20022 | Implementation guide |

---

## Legal/Ethical Notes

**Safe to use:**
- Error codes, names, and definitions are **factual data** (not copyrightable)
- All sources are **public documentation**
- Proper **attribution** provided via `resources[]` array

**Best practices followed:**
- Descriptions are **paraphrased** (not verbatim copied)
- Source URLs are **linked** for verification
- Original value added via categorization, XPaths, fix steps

---

## Deployment

```bash
# Build
cd scraper && python scrape_iso20022.py

# Copy to public
cp data/error_knowledge_base.json ../public/data/errors.json

# Deploy (GitHub Pages)
# Push public/ folder or use gh-pages branch
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-23 | Initial release with Nium scraping |
| 2.0.0 | 2025-12-23 | Added paraphrasing, SWIFT/JPM sources, enrichment |
