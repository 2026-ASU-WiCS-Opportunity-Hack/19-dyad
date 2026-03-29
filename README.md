# WIAL Global Chapter Hub

**One global platform. Local chapters. Smarter coach discovery.**

A governed website and chapter platform for the World Institute for Action Learning (WIAL), designed to help global organizations scale without losing structure, visibility, or consistency.

## Problem

WIAL operates across multiple countries, but chapter websites, content, and coach visibility are fragmented. This makes it difficult to maintain a unified brand, discover coaches across regions, and manage chapter operations effectively.

## Solution

We built a governed platform where:

* WIAL maintains global control over structure and branding
* Chapters can create and publish localized content within clear boundaries
* Coaches are discoverable across languages and regions
* Operational workflows like dues and payments are centralized

## Features

* Public WIAL site (About, Certification, Coaches, Chapters, Events, Resources, Contact)
* Chapter creation with draft → review → approve → publish workflow
* Global template with controlled local content editing
* Cross-lingual AI-powered coach search
* AI-generated, culturally adapted chapter content
* Smart coach matching
* Certification fit assistant
* Dues and payment workflow (Stripe/PayPal ready)
* Multilingual support + ElevenLabs text-to-speech

## Tech Stack

Next.js, React, TypeScript, OpenAI (GPT-4o, text-embedding-3-small), ElevenLabs, PropelAuth, Stripe, PayPal

## Setup

```bash id="o8q1zl"
git clone https://github.com/2026-ASU-WiCS-Opportunity-Hack/19-dyad.git
cd 19-dyad
npm install
npm run import:coaches
npm run dev
```

```

## Demo Flow

Homepage → Workspace → Create Chapter → Generate AI Content → Publish → View Live Page → Search Coaches (multi-language) → Match Coach → Dues Flow → Accessibility

Demo link: https://youtu.be/ouEWZ2uYJwQ

## Notes

* LMS intentionally excluded (aligned with WIAL brief)
* AI used where it meaningfully improves discovery and content creation
* Chapter publishing is governed to preserve global consistency

## Team

Team Dyad
Vijaikumar Meenakshi Nandakumar
Immanuvel Raja Nicholas Mani
