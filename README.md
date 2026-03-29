# WIAL Global Chapter Hub

A governed website and chapter platform for the World Institute for Action Learning.

This build focuses on the actual WIAL website/platform brief:
- public-facing WIAL website
- governed chapter creation and publishing
- global + chapter coach directory
- multilingual discovery and reading support
- chapter dues workflow with provider handoff paths
- AI-supported chapter publishing and coach matching

## Product thesis

**WIAL Global Chapter Hub is a governed chapter-network platform that combines multilingual coach discovery, culturally adapted chapter publishing, and chapter dues operations in one calm, low-bandwidth experience.**

## What is included

### Public site
- Home
- About WIAL
- Certification information
- Coach directory
- Chapter network pages
- Events
- Resources and library
- Contact

### Governance workspace
- Workspace sign-in
- Chapter creation with template inheritance
- Chapter dues and invoice workflow
- AI-assisted chapter publishing workflow

### AI features
- **AI-1:** cross-lingual coach directory search using OpenAI query parsing + embeddings-backed retrieval when API credentials are present
- **AI-2:** chapter-in-a-box content generation with cultural adaptation and human review before publish
- **AI-3:** smart coach matching for prospective clients using the same retrieval backbone as AI-1
- translation support for chapter and resource reading flows, with client-side caching

## Key implementation notes

- The public site is intentionally calm, professional, and low-bandwidth aware.
- The LMS is not rebuilt here; this project stays aligned to the WIAL website/platform brief.
- Chapter publishing is reviewed before it becomes live.
- Payment flows can hand off to Stripe or PayPal when credentials are configured. Without live provider credentials, the workflow still records a payment state and generates a believable receipt.
- Coach data is intentionally conservative. A showcase layer is included to improve the demo quality for selected coaches and chapters.

## Data sources

- `data/wial_coaches.csv` contains the imported public coach source
- `src/lib/data/imported-coaches.json` contains the processed coach records
- `src/lib/data/chapters.json` contains chapter scaffolding
- `src/lib/data/showcase-overrides.json` contains curated chapter and coach enhancements used for the demo experience

## Environment variables

Create `.env.local` in the project root:

```bash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
```

## Scripts

```bash
npm install
npm run import:coaches
npm run dev
npm run typecheck
npm run build
```

## Workspace access

Use `/access?redirect=/admin` to create a workspace session for:
- Global Admin
- Chapter Lead

## Recommended demo path

1. Home page and platform story
2. Workspace sign-in
3. Create a chapter site
4. Generate culturally adapted chapter content
5. Approve and publish the chapter
6. Open the live chapter route
7. Search the coach directory in Portuguese or French
8. Use the Find a Coach widget
9. Open the dues portal, submit card details, and show the receipt/status change
10. Toggle translated reading on a chapter or resource page

## Positioning line

**“We built a governed multi-chapter platform that helps WIAL launch consistent chapter sites, lets organizations find the right coach across languages, and gives chapter leads culturally adapted content plus a complete dues workflow.”**
