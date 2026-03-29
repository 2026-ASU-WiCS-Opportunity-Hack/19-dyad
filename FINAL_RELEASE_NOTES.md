# WIAL Final Release Notes

This package is the final WIAL website/chapter-platform build for the hackathon.

## What is included

- Public WIAL site with About, Certification, Coaches, Chapters, Events, Resources, and Contact
- Governed chapter provisioning workflow with global template inheritance and local publishing controls
- Workspace access flow for Global Admin and Chapter Lead roles
- Chapter dues portal with card entry, PayPal handoff, manual remittance, receipts, and invoice summaries
- AI-1 cross-lingual coach search using OpenAI-backed query parsing plus embeddings retrieval when configured
- AI-2 chapter content generation with review, approval, and publish states
- AI-3 smart coach matching built on the same retrieval backbone as AI-1
- AI-assisted reading translation with caching on chapter and resource surfaces
- Curated showcase data for key chapters and coaches
- Uploaded WIAL logo integrated into the header, footer, and loader

## Required environment variables

Create `.env.local` in the repo root:

```bash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
```

## Important setup

After adding the OpenAI key, run the import once so curated coach embeddings can be persisted:

```bash
npm install
npm run import:coaches
npm run dev
```

This writes `src/lib/data/coach-embeddings.json` when `OPENAI_API_KEY` is available.

## Best demo flow

1. Home page
2. Workspace sign-in
3. Chapter administration
4. Create chapter site
5. Generate chapter content and publish it
6. Open the live chapter route
7. Search for coaches in Portuguese
8. Use Find a Coach on the home page
9. Open the dues portal and complete a card payment
10. Show translated reading on a chapter or resource page

## Honest implementation notes

- PayPal is a handoff flow, not a fully wired live provider integration.
- Stripe can hand off when credentials are present; otherwise recorded payment state is used.
- Embeddings retrieval is OpenAI-backed when configured and falls back safely if the API path is unavailable.
- Workspace access is lightweight and demo-suitable; it is not a full production IAM deployment.
- This package was prepared in a container where full dependency installation/build verification was not completed.
