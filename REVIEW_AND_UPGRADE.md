# Review and upgrade summary

## Major issues fixed from the original prototype

### Scope
- Reframed the product around the WIAL website/chapter platform SRD.
- Moved certification away from LMS-like checkout behavior.
- Added missing public pages.
- Added a real chapter provisioning preview instead of leaving governance as static text.

### Directory
- Replaced demo-only mock directory focus with imported public coach records.
- Added explicit truth-gap handling for missing certification and biography metadata.
- Fixed chapter-level routing assumptions by normalizing chapter slugs from imported records.
- Added chapter-aware contact routing from coach cards.

### Payments
- Converted payment model into dues/invoice language:
  - enrolled learners
  - certified learners
  - status
  - reminders
  - receipts
  - chapter/global rollups
- Added optional Stripe sandbox handoff route with graceful mock fallback.

### AI
- Added all four WIAL AI features.
- Designed every AI route with:
  - deterministic fallback
  - human-review guardrails where needed
  - honest low-confidence states
  - no client-side API key exposure

### UX
- Added a calmer, professional visual system.
- Switched to system-font-first styling for low-bandwidth alignment.
- Preserved a lightweight intro loader with reduced-motion support.
- Added an admin provisioning flow so the platform story is not only brochure content.

## Remaining work for a real deployment

1. Connect coach certification data to Credly or another verified source.
2. Replace static invoices with persisted Stripe / PayPal-backed records.
3. Move imported JSON into Supabase tables.
4. Add authentication and RBAC through Supabase Auth.
5. Precompute real multilingual embeddings in pgvector.
6. Add image assets and chapter-owned contact data.
7. Add moderated chapter publishing workflows.
8. Add organization/client logo management and richer event publishing.

## What is intentionally still demo-safe

- invoice persistence is mocked in the UI
- AI generation/search fall back locally if keys are absent
- chapter provisioning is a front-end workflow preview
- certification verification is represented honestly as pending sync
- coach matching avoids overclaiming when imported profile data is sparse
