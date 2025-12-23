# Contributing to MX Error Guide

Thank you for your interest in contributing to MX Error Guide! This project uses an [Open Core model](./BUSINESS_MODEL.md) - the error database and lookup UI are open source, while advanced validation features are proprietary.

## Ways to Contribute

### 1. Improve the Error Database

The most valuable contribution is improving our ISO 20022 error code database.

**What we need:**
- Fix inaccurate error descriptions
- Add missing error codes
- Improve fix steps and common causes
- Add XPath locations for errors
- Verify information against official sources

**Error Database Location:** `frontend/src/data/errors.json`

**Error Schema:**
```json
{
  "code": "AC04",
  "name": "Closed Account Number",
  "category": "Account",
  "severity": "fatal",
  "description": {
    "short": "Brief explanation",
    "detailed": "Full explanation with context"
  },
  "common_causes": ["Cause 1", "Cause 2"],
  "how_to_fix": {
    "steps": ["Step 1", "Step 2"],
    "prevention": "How to prevent this error"
  },
  "related_codes": ["AC01", "AC03"],
  "message_types": ["pacs.008", "pacs.004"],
  "xpath_locations": ["/path/to/element"],
  "resources": [
    {
      "title": "Source name",
      "url": "https://...",
      "type": "official"
    }
  ]
}
```

### 2. Report Issues

Found a bug or inaccuracy? [Open an issue](https://github.com/yogishyb/mx-error-guide/issues) with:
- Clear description of the problem
- Steps to reproduce (for bugs)
- Source/evidence (for data corrections)
- Suggested fix (if you have one)

### 3. Submit Pull Requests

**For error database changes:**
1. Fork the repository
2. Edit `frontend/src/data/errors.json`
3. Run tests: `cd frontend && npm test`
4. Submit PR with clear description

**For code changes:**
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make changes following existing code style
4. Run tests: `cd frontend && npm test`
5. Submit PR with description of changes

### 4. Improve Documentation

- Fix typos or unclear explanations
- Add examples
- Improve message type guides
- Translate (future)

### 5. Share and Spread the Word

- Star the repository
- Share in fintech/payments communities
- Write about ISO 20022 and link to us
- Mention in relevant discussions

---

## Development Setup

### Prerequisites
- Node.js 20+
- npm 10+
- Python 3.9+ (for scraper)

### Frontend Development
```bash
cd frontend
npm install
npm run dev          # Start dev server
npm run test         # Run Playwright tests
npm run build        # Production build
```

### Running Tests
```bash
cd frontend
npm run test              # Headless tests
npm run test:headed       # Visual browser tests
npm run test:ui           # Playwright UI mode
```

---

## Code Style

### TypeScript/React
- Use functional components with hooks
- Type all props and state
- Follow existing patterns in codebase
- Use MUI components consistently

### Commit Messages
```
<type>: <short description>

<optional body>

<optional footer>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Example:
```
fix: correct AC04 error description

Updated description to match ISO 20022 external code sets v2024.
Added missing XPath location.

Fixes #123
```

---

## Pull Request Process

1. **Ensure tests pass** - All PRs must pass existing tests
2. **Update documentation** - If changing behavior, update relevant docs
3. **One concern per PR** - Keep PRs focused and reviewable
4. **Describe your changes** - Explain what and why in PR description
5. **Link related issues** - Reference any issues being fixed

### PR Template
```markdown
## Description
What does this PR do?

## Type of Change
- [ ] Bug fix
- [ ] New error code(s)
- [ ] Error data correction
- [ ] Documentation update
- [ ] Code improvement

## Testing
How was this tested?

## Checklist
- [ ] Tests pass
- [ ] Documentation updated (if needed)
- [ ] Code follows project style
```

---

## What's NOT Open for Contribution

The following will be proprietary (closed source):
- WASM validation engine
- Market practice rule sets
- Enterprise features
- Licensing system

These are part of our business model. See [BUSINESS_MODEL.md](./BUSINESS_MODEL.md).

---

## Recognition

Contributors who submit accepted PRs will be:
- Listed in our contributors section
- Mentioned in release notes
- Given early access to premium features (when available)

---

## Code of Conduct

- Be respectful and constructive
- Focus on the work, not the person
- Welcome newcomers
- Assume good intent

---

## Questions?

- Open a [GitHub Discussion](https://github.com/yogishyb/mx-error-guide/discussions)
- Check existing issues
- Read the [BUSINESS_MODEL.md](./BUSINESS_MODEL.md) for project direction

Thank you for helping make ISO 20022 more accessible!
