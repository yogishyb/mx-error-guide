# Agent Team Guide

> How to work with your AI agent team for MX Error Guide development.

---

## Your Agent Team

| Agent | Role | Model | Best For |
|-------|------|-------|----------|
| **project-architect** | Technical lead | sonnet | Architecture, state sync, phase planning |
| **support** | Quick helper | haiku | Fast questions, doc updates |
| **developer** | Senior full-stack dev | sonnet | UI/UX, features, optimization, security |
| **visual-tester** | QA tester | sonnet | Test in Chrome, verify features |
| **scraper** | Data engineer | sonnet | Error codes, data collection |
| **github-devops-pro** | DevOps | sonnet | Git, deployment, CI/CD |
| **growth-strategist** | Marketing | sonnet | Ads, analytics, promotion |
| **security-tester** | Security QA | sonnet | Zero-trust testing, pen testing (Phase 3+) |

---

## How to Use Agents

### Method 1: Direct Call
```
@developer "add a dark mode toggle"
@scraper "run the scraper and add more codes"
@support "what's left in Phase 0?"
```

### Method 2: Let Claude Choose
```
"I need to add a new feature" → Routes to developer
"How many error codes do we have?" → Routes to support
"Deploy to production" → Routes to github-devops-pro
```

### Method 3: Orchestrated Workflow
```
You: "Let's complete Phase 0"

1. @support "what's pending in Phase 0?"
2. @developer "implement feedback form"
3. @growth-strategist "set up analytics"
4. @project-architect "sync state and confirm completion"
```

---

## When to Ask Which Agent

| You Want To... | Ask This Agent |
|----------------|----------------|
| Know project status | **support** (fast) or **project-architect** (detailed) |
| Understand architecture | **project-architect** |
| Add/fix frontend features | **developer** |
| Add more error codes | **scraper** |
| Deploy or push code | **github-devops-pro** |
| Set up analytics | **growth-strategist** |
| Plan marketing | **growth-strategist** |
| Quick doc update | **support** |
| Phase planning | **project-architect** |

---

## Agent Collaboration Flow

```
                         YOU (Orchestrator)
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
   ┌─────────┐          ┌─────────┐          ┌─────────┐
   │ SUPPORT │◄────────►│ARCHITECT│◄────────►│ DEVOPS  │
   │ (fast)  │          │ (state) │          │ (deploy)│
   └─────────┘          └────┬────┘          └─────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │DEVELOPER │  │ SCRAPER  │  │ GROWTH   │
        │ (code)   │  │ (data)   │  │(marketing)│
        └──────────┘  └──────────┘  └──────────┘
```

### How They Work Together

1. **Architect** maintains the master state in `context/` files
2. **Developer** and **Scraper** read from context, do work, update state
3. **Support** answers quick questions from context (no code reading)
4. **DevOps** deploys what Developer/Scraper produce
5. **Growth** markets what gets deployed

---

## Why Agent Team > Single Agent

| Aspect | Single Agent | Agent Team |
|--------|--------------|------------|
| **Context** | Gets confused with too much | Each agent has focused scope |
| **Cost** | Reads everything every time | Reads only what's needed |
| **Speed** | Slow (processes everything) | Fast (specialized responses) |
| **Quality** | Jack of all trades | Expert in each domain |
| **State** | Forgets between sessions | State persisted in `context/` |
| **Scaling** | One bottleneck | Parallel work possible |

### Cost Comparison Example

| Task | Single Agent | Agent Team |
|------|--------------|------------|
| "What's project status?" | Reads all files (~10K tokens) | Support reads context only (~2K tokens) |
| "Add a button" | Reads everything (~15K tokens) | Developer reads public/ only (~5K tokens) |
| "Run scraper" | Outputs all code (~8K tokens) | Scraper runs command (~200 tokens) |

**Savings**: 50-80% token reduction per task

---

## Agent Rules Summary

### All Agents Must:
1. Read `context/vision.md` first (source of truth)
2. Update `context/current_state.md` after changes
3. Keep responses short and actionable
4. Not read code unless explicitly asked

### Agent-Specific Rules:

| Agent | Key Rule |
|-------|----------|
| **project-architect** | Read context docs, NOT source code |
| **support** | Use haiku model, be fast |
| **developer** | Follow existing code patterns |
| **scraper** | RUN scripts, don't output code |
| **github-devops-pro** | Always verify before destructive ops |
| **growth-strategist** | Recommend based on current phase |

---

## Session Resumption (Next Day Protocol)

**Every agent can resume work without reading the codebase.**

When starting a new session:

1. **All agents read context docs FIRST** - not source code
2. Context docs contain everything needed to know project state
3. No need to scan `public/`, `scraper/`, or other code directories

### How It Works

```
Session End (Today)           Session Start (Tomorrow)
─────────────────────         ──────────────────────────
Agent completes work    →     Agent reads context/
Agent updates context/  →     Knows exactly where we left off
Context is saved        →     Continues without code scan
```

### Why This Works

| Problem | Solution |
|---------|----------|
| "What did we do yesterday?" | Read `current_state.md` Activity Log |
| "What's done?" | Read `current_state.md` Completed section |
| "What's pending?" | Read `phased_development.md` NOT STARTED tasks |
| "Any issues?" | Read `current_state.md` Blockers section |
| "Was it tested?" | Read `test_results.md` |

**No code scanning needed.** All state is in context docs.

---

## Context Files (Shared Memory)

All agents read/write to these files:

```
context/
├── vision.md              # Product vision (READ FIRST)
├── current_state.md       # Live state (UPDATE OFTEN)
├── phased_development.md  # Tasks by phase
├── decisions_board.md     # Why we chose things
├── PROJECT_STRUCTURE.md   # Technical structure
├── test_results.md        # Visual-Tester's test records
└── scraper_log.md         # Scraper's activity log (sources, stats)
```

### Who Updates What

| File | Primary Owner | Others Can |
|------|---------------|------------|
| vision.md | Human | Read only |
| current_state.md | All agents | Read + Update |
| phased_development.md | Architect | Read + Update status |
| decisions_board.md | Architect | Add decisions |
| PROJECT_STRUCTURE.md | Developer | Update structure |
| test_results.md | Visual-Tester | Developer adds pending tests |
| scraper_log.md | Scraper | Others read only |

---

## Common Workflows

### 1. Start of Day
```
@support "what's the current state?"
# Get quick overview

@project-architect "what should we work on today?"
# Get prioritized task list
```

### 2. Implement a Feature
```
@developer "implement [feature name]"
# Developer reads context, codes, updates state
```

### 3. Add More Data
```
@scraper "run scraper and report stats"
# Scraper runs Python, reports counts only
```

### 4. Deploy Changes
```
@github-devops-pro "commit and push all changes"
# Commits with proper message, pushes
```

### 5. Plan Marketing
```
@growth-strategist "how should we launch?"
# Get channel recommendations, content ideas
```

### 6. End of Day
```
@project-architect "sync state"
# Verify all docs are updated
```

---

## Developer → Tester Handoff (Automated)

**No user explanation needed between agents!**

When Developer completes a feature:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. DEVELOPER completes work                                 │
│    └─► Adds entry to test_results.md "Pending Tests"        │
│        - What to test (checklist)                           │
│        - How to test (commands)                             │
│        - Files changed                                      │
├─────────────────────────────────────────────────────────────┤
│ 2. USER invokes @visual-tester                              │
│    └─► Just say: "@visual-tester run pending tests"         │
│        NO need to explain what to test!                     │
├─────────────────────────────────────────────────────────────┤
│ 3. VISUAL-TESTER reads test_results.md                      │
│    └─► Finds pending tests automatically                    │
│    └─► Runs all tests per instructions                      │
│    └─► Updates status: ✅ PASS or ❌ FAIL                   │
└─────────────────────────────────────────────────────────────┘
```

### Example Flow

```bash
# 1. You ask developer to add pagination
@developer "add pagination to error list"

# 2. Developer implements and logs to test_results.md
# (automatic - you don't need to do anything)

# 3. You trigger tester (just this command!)
@visual-tester "run pending tests"

# 4. Tester picks up from test_results.md automatically
# Reports: ✅ PASS or ❌ FAIL
```

**All state is in `context/test_results.md`** - agents communicate through this file.

---

## Troubleshooting

### Agent gives wrong answer
```
# Be more specific
❌ "fix it"
✅ "fix the search not working when query is empty"
```

### Agent reads too much code
```
# Remind it to use context
"Answer from context docs only, don't read source code"
```

### Agent outputs too much
```
# Ask for summary
"Just give me the summary, not the full output"
```

### Wrong agent responds
```
# Explicitly call the right one
@developer "this is a frontend task"
```

---

## Best Practices

### Do:
- ✅ Use **support** for quick questions (cheapest)
- ✅ Use **architect** for state sync
- ✅ Be specific in requests
- ✅ Let agents update context docs
- ✅ Review agent outputs

### Don't:
- ❌ Ask scraper to output full JSON
- ❌ Ask architect to read all source code
- ❌ Use sonnet agents for simple questions
- ❌ Forget to sync state at end of session

---

## Quick Reference Card

```
┌────────────────────────────────────────────────────┐
│                 AGENT QUICK REFERENCE              │
├────────────────────────────────────────────────────┤
│                                                    │
│  @support       → Quick questions, doc updates    │
│  @developer     → Frontend code, UI, features     │
│  @scraper       → Run scraper, add error codes    │
│  @visual-tester → Test in Chrome, verify features │
│  @project-architect → State sync, architecture    │
│  @github-devops-pro → Git, deploy, CI/CD          │
│  @growth-strategist → Marketing, analytics        │
│  @security-tester → Zero-trust testing (Phase 3+) │
│                                                    │
├────────────────────────────────────────────────────┤
│                                                    │
│  Fast question?     → @support (haiku = cheap)    │
│  Need code?         → @developer                  │
│  Need data?         → @scraper                    │
│  Need testing?      → @visual-tester              │
│  Need to deploy?    → @github-devops-pro          │
│  Need to plan?      → @project-architect          │
│  Need to grow?      → @growth-strategist          │
│  Need security?     → @security-tester (Phase 3+) │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## Summary

Your agent team is like a small startup:

| Role | Agent | Human Equivalent |
|------|-------|------------------|
| CTO | project-architect | Technical decisions |
| Assistant | support | Quick help |
| Senior Full-Stack Dev | developer | Builds & optimizes the product |
| QA Tester | visual-tester | Verifies features work |
| Data Engineer | scraper | Manages data pipeline |
| DevOps | github-devops-pro | Deploys and maintains |
| Growth Lead | growth-strategist | Gets users |
| Security Lead | security-tester | Protects the product (Phase 3+) |
| CEO | **YOU** | Orchestrates everything |

You're the CEO. Direct your team, review their work, make final calls.
