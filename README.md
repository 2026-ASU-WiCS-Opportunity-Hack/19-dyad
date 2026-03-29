🌍 Overview

WIAL is a global nonprofit with chapters across multiple countries. Their challenge is not building a new LMS—it’s maintaining a consistent global presence while enabling local chapters to operate independently.

We built a governed chapter platform that allows WIAL to:

maintain global brand consistency
empower local chapters to create and publish content
enable multilingual coach discovery
support chapter-level operations like dues and payments

This project directly aligns with the official WIAL website/platform brief.

🎯 Problem

As WIAL scales globally:

chapters create fragmented websites
branding and content become inconsistent
coaches are difficult to discover across regions and languages
operational workflows like dues collection lack structure

The core challenge is balancing:

global governance with local flexibility

💡 Solution

We built a governed multi-chapter platform that combines:

🌐 Public-facing WIAL website
🏢 Chapter creation with controlled publishing workflows
🔎 Global + chapter-level coach directory
🌎 Cross-lingual AI-powered coach discovery
✍️ AI-generated, culturally adapted chapter content
💳 Chapter dues and payment workflows
♿ Accessibility support (multilingual + text-to-speech)
🧠 Key Features
🌐 Public Website
Home
About
Certification Information
Coach Directory
Chapters
Events
Resources & Library
Contact
🏢 Chapter Governance Platform
Chapter creation with template inheritance
Global design system with locked structure
Editable local content zones
Workflow: Draft → Review → Approve → Publish
Live chapter pages at /chapters/[slug]
🔎 Coach Directory
Global and chapter-level views
Searchable and filterable profiles
Certification, location, and specialization awareness
Structured, high-quality demo data
🤖 AI Features
AI-1: Cross-Lingual Coach Search
Search in one language, find results in another
Embeddings-based semantic retrieval
AI explains why coaches match the query
AI-2: Chapter-in-a-Box Content Generation
Generate structured chapter content from minimal input
Culturally adapted (not just translated)
Requires human review before publishing
AI-3: Smart Coach Matching
Natural language “Find a Coach” experience
Extracts intent, geography, and domain needs
Returns ranked recommendations with reasoning
AI-4: Certification Fit Assistant
Paste resume or background
AI suggests likely certification path and next steps
Advisory only (not official evaluation)
🌎 Accessibility & Multilingual Support
Translation support across content
Lightweight, low-bandwidth UI
ElevenLabs text-to-speech integration
Designed for global accessibility
💳 Dues & Payments
Chapter invoice and dues workflow
Card entry and receipt states
Stripe and PayPal handoff support
Works in demo mode without live credentials
🛠 Tech Stack

Next.js, React, TypeScript, OpenAI (GPT-4o, text-embedding-3-small), ElevenLabs, PropelAuth, Stripe, PayPal

🏗 Architecture Notes
Full-stack Next.js app with server-side API routes
OpenAI used for reasoning + embeddings-based retrieval
PropelAuth handles authentication and role-based access
Environment variables used for secure key management
Modular data layer with curated demo datasets
📊 Data Sources
data/wial_coaches.csv — raw coach data
src/lib/data/imported-coaches.json — processed records
src/lib/data/chapters.json — chapter scaffolding
src/lib/data/showcase-overrides.json — curated demo enhancements
⚙️ Setup Instructions
git clone https://github.com/2026-ASU-WiCS-Opportunity-Hack/19-dyad.git
cd 19-dyad

npm install
npm run import:coaches
npm run dev
🔐 Environment Variables

Create a .env.local file:

OPENAI_API_KEY=
OPENAI_MODEL=gpt-5-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
🔑 Workspace Access

Visit:

/access?redirect=/admin

Available roles:

Global Admin
Chapter Lead
🎬 Recommended Demo Flow
Start on homepage (platform overview)
Sign into workspace
Create a chapter
Generate AI chapter content
Approve and publish
Open live chapter page
Search coach directory in another language
Use “Find a Coach”
Open dues portal → simulate payment → show receipt
Toggle translation or text-to-speech
🧪 Key Design Decisions
❌ Did NOT rebuild LMS (out of scope per WIAL brief)
✅ Focused on governance, discovery, and operations
✅ AI used selectively where it adds real value
✅ Human review required for AI-generated content
✅ Designed for low-bandwidth global usage
⚠️ Known Limitations
Payment integrations may run in demo mode without live credentials
AI performance depends on API availability and input quality
Demo data is curated for clarity and presentation
🚀 Future Improvements
Full production Stripe/PayPal integration
Enhanced analytics and reporting
Expanded multilingual coverage
Deeper coach filtering and recommendation tuning
Admin dashboards for global oversight
🏆 Hackathon Context

Built for:
WiCS x Opportunity Hack Spring 2026

👥 Team Dyad
Vijaikumar Meenakshi Nandakumar
Immanuvel Raja Nicholas Mani
🔗 Links
Devpost: https://devpost.com/submit-to/29203-women-in-computer-science-x-opportunity-hack-spring-2026-hackathon/manage/submissions/983291-wial-dyad/project_details/edit

🧭 Positioning

We built a governed global chapter platform that helps WIAL launch consistent chapter sites, enables multilingual coach discovery, and provides AI-assisted publishing and dues workflows in one unified system.
