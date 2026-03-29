<<<<<<< HEAD
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
=======
# 2026_spring_wics_asu Hackathon Project

## Quick Links
- [Hackathon Details](https://www.ohack.dev/hack/2026_spring_wics_asu)
- [DevPost Submission](https://wics-ohack-sp26-hackathon.devpost.com/)
- [Team Slack Channel](https://opportunity-hack.slack.com/app_redirect?channel=team-19-dyad)

## Team "Dyad"
- Vijaikumar Meenakshi Nandakumar
- Immanuvel Raja Nicholas Mani

## Project Overview
Brief description of your project and its goals.

## Tech Stack
- Frontend:
- Backend:
- Database:
- APIs:
<!-- Add/modify as needed -->


## Getting Started
Instructions on how to set up and run your project locally.

```bash
# Example commands
git clone https://github.com/2026-ASU-WiCS-Opportunity-Hack/19-dyad.git
cd 19-dyad
# Add your setup commands here
```


## Checklist for the final submission
### 0/Judging Criteria
- [ ] Review the [judging criteria](https://www.ohack.dev/about/judges#judging-criteria) to understand how your project will be evaluated

### 1/DevPost
- [ ] Submit a [DevPost project to this DevPost page for our hackathon](https://wics-ohack-sp26-hackathon.devpost.com/) - see our [YouTube Walkthrough](https://youtu.be/rsAAd7LXMDE) or a more general one from DevPost [here](https://www.youtube.com/watch?v=vCa7QFFthfU)
- [ ] Your DevPost final submission demo video should be 4 minutes or less
- [ ] Link your team to your DevPost project on ohack.dev in [your team dashboard](https://www.ohack.dev/hack/2026_spring_wics_asu/manageteam)
- [ ] Link your GitHub repo to your DevPost project on the DevPost submission form under "Try it out" links

### 2/GitHub
- [ ] Add everyone on your team to your GitHub repo [YouTube Walkthrough](https://youtu.be/kHs0jOewVKI)
- [ ] Make sure your repo is public
- [ ] Make sure your repo has a MIT License
- [ ] Make sure your repo has a detailed README.md (see below for details)


# What should your final README look like?
Your readme should be a one-stop-shop for the judges to understand your project. It should include:
- Team name
- Team members
- Slack channel
- Problem statement
- Tech stack
- Link to your working project on the web so judges can try it out
- Link to your DevPost project
- Link to your final demo video
- Instructions on how to run your project
- Any other relevant links (e.g. Figma, GitHub repos for any open source libraries you used, etc.)


You'll use this repo as your resume in the future, so make it shine! 🌟

# Examples
Examples of stellar readmes:
- ✨ [2019 Team 3](https://github.com/2019-Arizona-Opportunity-Hack/Team-3)
- ✨ [2019 Team 6](https://github.com/2019-Arizona-Opportunity-Hack/Team-6)
- ✨ [2020 Team 2](https://github.com/2020-opportunity-hack/Team-02)
- ✨ [2020 Team 4](https://github.com/2020-opportunity-hack/Team-04)
- ✨ [2020 Team 8](https://github.com/2020-opportunity-hack/Team-08)
- ✨ [2020 Team 12](https://github.com/2020-opportunity-hack/Team-12)

Examples of winning DevPost submissions:
- [1st place 2024](https://devpost.com/software/nature-s-edge-wildlife-and-reptile-rescue)
- [2nd place 2024](https://devpost.com/software/team13-kidcoda-steam)
- [1st place 2023](https://devpost.com/software/preservation-partners-search-engine)
- [1st place 2019](https://devpost.com/software/zuri-s-dashboard)
- [1st place 2018](https://devpost.com/software/matthews-crossing-data-manager-oj4ica)
>>>>>>> eb47716ad5df4497a764886932202fe4e88c211c
