# Final WIAL Hackathon Changes

This package is the final WIAL website-and-chapter-platform build prepared from the uploaded `WIALVERSION2_final_patched.zip`.

## What was finalized

### 1) Real logo and calmer brand presentation
- Replaced the generated mark with the uploaded WIAL logo in the header, footer, and loader
- Kept the loader minimal, once-per-session, and compatible with reduced-motion behavior
- Kept the public visual system neutral, professional, and low-bandwidth friendly

### 2) AI-1 now presents as the primary retrieval path
- Search UI now frames the main method as **OpenAI multilingual retrieval** when the model path is active
- Fallback language is only shown when the model path is unavailable
- Import tooling can now persist coach embeddings to `src/lib/data/coach-embeddings.json`
- AI search loads persisted embeddings first, then only generates missing embeddings when needed

### 3) AI-2 now feels like real publishing, not a side experiment
- Chapter generation now follows a clearer `generated -> reviewed -> approved -> published` flow
- Published chapter content can surface on the real `/chapters/[slug]` route instead of staying trapped in a staging-only experience
- The chapter workspace now emphasizes global governance plus local editing boundaries

### 4) AI-3 reuses the same retrieval story as AI-1
- Smart coach matching remains connected to the main search backbone
- The homepage widget now reads more like a guided intake for prospective clients than a hackathon widget

### 5) Translation is more visible and more useful
- Translation support remains API-backed
- Chapter and resource reading flows are easier to use publicly
- Client-side caching improves the repeat-read experience

### 6) Payment now feels operational
- Dues and invoice copy was rewritten to feel like a real chapter payment workflow
- The payment portal includes card-entry, PayPal handoff, and manual remittance paths
- Receipt details are stronger and invoice state changes are visible in the admin flow
- Invoice summary cards now surface total due, total paid, overdue invoices, and awaiting remittance counts

### 7) Governance is more visible
- Workspace language now replaces obvious prototype wording in public and admin surfaces
- The admin page now clearly shows what is locked globally vs editable locally
- Chapter creation language is centered on creating and publishing a chapter site rather than showing a preview only

### 8) Showcase data is stronger
- Added `src/lib/data/showcase-overrides.json`
- Added `src/lib/data/showcase.ts`
- Curated showcase coaches and chapters for the strongest demo regions:
  - Brazil
  - Nigeria
  - United States
  - Malaysia
  - Kenya

## What is real right now
- Public WIAL website experience with chapters, directory, events, resources, and contact
- Workspace sign-in and chapter/admin surfaces
- Model-backed search, translation, and chapter generation when `OPENAI_API_KEY` is present
- Published chapter content reflected on the live chapter route through local workspace persistence
- Dues portal with realistic provider flow, receipt, and invoice state changes

## What still depends on environment setup
- Precomputing embeddings into `src/lib/data/coach-embeddings.json`
- Live Stripe sandbox handoff
- Live PayPal API handoff
- Any deeper production auth / RBAC backend beyond the current lightweight workspace session pattern

## Required environment variables
Create `.env.local` in the project root and set:

```bash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
```

## Recommended pre-demo steps
1. Set `OPENAI_API_KEY` in `.env.local`
2. Run `npm install`
3. Run `npm run import:coaches` to regenerate curated data and persist embeddings
4. Run `npm run dev`
5. Warm the AI search with:
   - a Portuguese query
   - a French query
   - an English enterprise query
6. Create a chapter, publish it, and confirm the live chapter route reflects the approved output
7. Open an invoice, submit a card payment, and confirm the receipt + status update path

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
