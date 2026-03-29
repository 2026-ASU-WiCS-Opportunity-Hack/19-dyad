# WIAL Global Chapter Hub

A governed global website and chapter platform for the World Institute for Action Learning (WIAL).
**One global platform. Local chapters. Smarter coach discovery.**

## Overview

WIAL operates across multiple countries with independent chapters, but lacks a unified system to manage global consistency alongside local flexibility. Most organizations at this scale face fragmentation—separate sites, inconsistent branding, and poor cross-region visibility.

We built a governed platform that solves this directly: a system where WIAL can maintain a single global identity while enabling chapters to create, publish, and operate within structured boundaries.

## What We Built

* Public WIAL website (About, Certification, Coaches, Chapters, Events, Resources, Contact)
* Chapter platform with draft → review → approve → publish workflow
* Global design system with controlled local content editing
* Coach directory with global + chapter-level discovery
* Cross-lingual AI-powered coach search
* AI-generated, culturally adapted chapter content (with human review)
* Smart coach matching based on natural language needs
* Certification fit assistant using resume/background input
* Dues and payment workflow (Stripe/PayPal ready)
* Multilingual support and ElevenLabs text-to-speech

## Tech Stack

Next.js, React, TypeScript, OpenAI (GPT-4o, text-embedding-3-small), ElevenLabs, PropelAuth, Stripe, PayPal

## Setup

```bash
git clone https://github.com/2026-ASU-WiCS-Opportunity-Hack/19-dyad.git
cd 19-dyad
npm install
npm run import:coaches
npm run dev
```

```

## Demo Flow

1. Open homepage
2. Sign into workspace
3. Create a chapter
4. Generate AI chapter content
5. Approve and publish
6. View live chapter page
7. Search coaches in another language
8. Use “Find a Coach”
9. Open dues portal and simulate payment
10. Try translation or text-to-speech

## Notes

* LMS is intentionally excluded (aligned with WIAL requirements)
* AI is used selectively to improve discovery and reduce content friction
* Chapter publishing is governed to preserve global consistency
* Payment flows support provider handoff when configured

## Team

Team Dyad
Vijaikumar Meenakshi Nandakumar
Immanuvel Raja Nicholas Mani

## Positioning

We built a governed global chapter platform that enables WIAL to scale across regions without fragmentation—combining multilingual coach discovery, structured chapter publishing, and operational workflows in one unified system.

