# Copilot Coding Agent Instructions

## Project Overview

**Catto Migration Planner** (`cattogo`) is a static Next.js web app that helps Thai users analyze and plan international migration. It compares 16 countries across visa costs, salaries, cost of living, and quality-of-life metrics. The UI is primarily in Thai language.

Key features:
- AI-powered chat interface (Typhoon API / typhoon-v2-70b-instruct) that gathers user profile and recommends countries
- Country matching and ranking based on user goals, occupation, income, age, and family status
- Australia-focused points calculator (189/190/491 skilled visas) and budget simulator
- Visa explorer with detailed costs for 16 countries
- Tools page with job search and additional utilities

## Tech Stack

- **Framework**: Next.js 15 (App Router) with static export (`output: 'export'`)
- **Language**: TypeScript (strict mode)
- **UI**: React 19, Tailwind CSS 4 (via `@tailwindcss/postcss`)
- **Fonts**: Poppins + Kanit (Google Fonts, loaded in `layout.tsx`)
- **AI**: Typhoon API client in `src/lib/typhoon.ts` (typhoon-v2-70b-instruct model)
- **Proxy**: Cloudflare Worker in `proxy-worker/` for secure API key handling
- **Deployment**: GitHub Pages via GitHub Actions (`deploy.yml`)
- **Package manager**: npm (lockfile: `package-lock.json`)

## Repository Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout (fonts, GA, metadata)
│   ├── page.tsx            # Home page — renders ChatSimulator
│   ├── globals.css         # Tailwind + custom theme colors and animations
│   ├── sim/page.tsx        # Australia life simulator page
│   ├── tools/page.tsx      # Tools page (job search, utilities)
│   └── visa/page.tsx       # Visa explorer page
├── components/
│   ├── ChatSimulator.tsx   # Main chat interface (largest component, ~1700 lines)
│   ├── VisaExplorer.tsx    # Visa comparison for 16 countries (~1470 lines)
│   ├── AuLifeSim.tsx       # Australia lifestyle cost simulator
│   ├── Header.tsx          # App header
│   ├── Footer.tsx          # App footer
│   ├── JobSearch.tsx       # Job search component
│   ├── ShareButtons.tsx    # Social sharing
│   ├── StepWizard.tsx      # Step wizard for Australia analysis
│   ├── ToolsPage.tsx       # Tools page layout
│   └── steps/              # Step wizard sub-components
│       ├── ProfileStep.tsx
│       ├── FeasibilityStep.tsx
│       ├── BudgetStep.tsx
│       ├── LifestyleStep.tsx
│       ├── MotivationStep.tsx
│       ├── JobMarketStep.tsx
│       └── SummaryStep.tsx
├── data/
│   ├── country-data.ts          # 16 countries: scores, matching criteria
│   ├── country-detailed-data.ts # Detailed visa costs, salaries, cost of living
│   ├── occupations.ts           # Occupation list with ANZSCO codes, demand, salaries
│   └── simulator-data.ts        # Australia-Thailand comparison data
├── hooks/
│   └── useExchangeRate.ts  # Live AUD/THB exchange rate hook
└── lib/
    ├── types.ts            # TypeScript interfaces (FormData, VisaOption, etc.)
    ├── calculations.ts     # Points calculator, budget, parity calculations
    └── typhoon.ts          # Typhoon API client (chat, analysis, country ranking)

proxy-worker/               # Cloudflare Worker for Typhoon API proxy
├── worker.js               # Worker source (CORS, rate limiting, key injection)
└── wrangler.toml           # Wrangler config

public/
├── manifest.json           # PWA manifest
└── rainflow.png            # App icon
```

## Build, Lint, and Test

### Build
```bash
npm ci          # Install dependencies (use ci, not install, for reproducibility)
npm run build   # Next.js static export → outputs to out/
```

The build uses these environment variables (all optional for local dev):
- `REPO_NAME` — sets `basePath` for GitHub Pages (auto-set in CI)
- `NEXT_PUBLIC_BASE_PATH` — base path for assets
- `NEXT_PUBLIC_PROXY_URL` — Cloudflare Worker proxy URL for Typhoon API
- `NEXT_PUBLIC_TYPHOON_KEY` — Direct Typhoon API key (fallback if no proxy)
- `NEXT_PUBLIC_GA_ID` — Google Analytics ID

### Lint
```bash
npm run lint    # Runs next lint
```
**Note**: ESLint is not yet configured in this project. Running `npm run lint` will prompt for ESLint setup. The build itself includes TypeScript type checking, which serves as the primary code quality gate.

### Test
There is **no test infrastructure** in this project. No test framework (Jest, Vitest, etc.) is installed, and no test files exist.

### Dev Server
```bash
npm run dev     # Starts Next.js dev server on http://localhost:3000
```

## CI/CD Pipeline

The only workflow is `.github/workflows/deploy.yml`:
- **Trigger**: Push to `main` branch or manual dispatch
- **Steps**: `npm ci` → `npm run build` → upload `out/` → deploy to GitHub Pages
- **Secrets needed**: `NEXT_PUBLIC_PROXY_URL` and/or `NEXT_PUBLIC_TYPHOON_KEY` (configured in repo Settings → Secrets → Actions)

### Known CI Issues
- A past deployment failure (Feb 16, 2026) was caused by GitHub Pages not being enabled in the repo settings. The fix was to enable Pages at `Settings → Pages → Source: GitHub Actions`. This was resolved and subsequent deployments succeeded.

## Architecture Notes

### Data Flow
1. `ChatSimulator` uses Typhoon AI to conversationally gather user profile (goals, occupation, income, age, family)
2. Once enough data is gathered (`gathered.ready === true`), it calls `rankCountriesWithAI()` to get top 5 country matches
3. Country data comes from `src/data/country-data.ts` (scores) and `src/data/country-detailed-data.ts` (detailed costs)
4. For Australia specifically, `StepWizard` → step components use `calculations.ts` for points/budget/parity calculations

### AI Integration
- `src/lib/typhoon.ts` handles all AI communication
- Two modes: **Proxy mode** (preferred, key stays server-side via Cloudflare Worker) and **Direct mode** (key in client JS bundle)
- The proxy worker (`proxy-worker/worker.js`) enforces CORS, rate limiting (20 req/min/IP), and injects the API key server-side
- AI responses are expected as JSON; `extractJSON()` handles cases where the model wraps JSON in markdown

### Path Aliases
TypeScript path alias `@/*` maps to `./src/*` (configured in `tsconfig.json`).

### Static Export
The app uses `output: 'export'` in `next.config.ts`, meaning all pages are statically generated at build time. There are no API routes or server-side rendering. The `basePath` and `assetPrefix` are set dynamically from `REPO_NAME` env var for GitHub Pages deployment.

## Coding Conventions

- **Language in code**: Comments and UI text are in Thai. Variable names and code structure are in English.
- **Components**: Functional React components with hooks. All components use `'use client'` where browser APIs are needed.
- **Styling**: Tailwind CSS utility classes. Custom theme colors defined in `globals.css` under `@theme` (e.g., `--color-primary`, `--color-accent`).
- **No ESLint config file** exists yet — only `// eslint-disable-next-line` comments are used inline in `typhoon.ts`.
- **Data files** in `src/data/` contain hardcoded country data with source attributions in comments. When updating data, always include the source and date.
- **Currency handling**: Always use specific currency symbols (A$, C$, €, £, etc.), never bare `$`. Exchange rates to THB are defined in `country-data.ts`.

## Common Tasks

### Adding a New Country
1. Add country entry to `src/data/country-data.ts` (scores, basic info)
2. Add detailed data to `src/data/country-detailed-data.ts` (visa costs, salaries, cost of living)
3. Include official data sources and last-updated dates in comments
4. Update `DATA_SOURCES.md` with verification details

### Modifying Visa Calculations
- Australia points calculations are in `src/lib/calculations.ts`
- Points rules follow Home Affairs SkillSelect criteria — always verify against official sources
- Visa options are generated in `calculateFeasibility()` based on total points

### Updating Exchange Rates
- Static rates in `src/data/country-data.ts` (`CURRENCY_TO_THB`) and `src/lib/typhoon.ts` (`CURRENCY_TO_THB`)
- Live rate fetched in `src/hooks/useExchangeRate.ts` (AUD/THB only)
