# Campus FAQ Assistant 🎓

An AI-powered campus guidance assistant for new college students, built with Next.js (App Router), TypeScript, Tailwind CSS, and the Google GenAI SDK (`@google/genai`).

---

## 📌 Project Overview

The **Campus FAQ Assistant** helps undergraduate students find quick, accurate answers regarding academics, clubs, library access, events, timings, and campus facilities. It operates on a RAG (Retrieval-Augmented Generation) paradigm: retrieving curated institutional FAQs and using Google Gemini to deliver grounded answers.

This repository represents **Stage 1 of 3: Project Skeleton & Foundation**.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: `v18.18.0` or later
- **Package Manager**: `npm`

### 2. Installation
```bash
# Install dependencies
npm install
```

### 3. Environment Configuration
Copy the example environment file and set your keys:
```bash
cp .env.example .env.local
```

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Google Gemini API Key (server-side only) | `your_api_key_here` |
| `GEMINI_MODEL` | Gemini model variant | `gemini-2.5-flash` |
| `RATE_LIMIT_PER_MINUTE` | Max chat requests permitted per IP per minute | `30` |

### 4. Running Scripts
```bash
# Start local development server (http://localhost:3000)
npm run dev

# Run TypeScript typecheck
npm run typecheck

# Run ESLint
npm run lint

# Run Vitest test suite
npm run test

# Build for production
npm run build

# Start production server
npm run start

# Format code with Prettier
npm run format
```

---

## 🗂️ Folder Map

```
campus-faq-assistant/
├── .env.example                  # Environment variable blueprint
├── .prettierrc                   # Prettier code formatting rules
├── eslint.config.mjs             # Next.js ESLint configuration
├── package.json                  # Dependencies, scripts, and engine metadata
├── postcss.config.mjs            # PostCSS plugin definitions
├── tailwind.config.ts            # Tailwind CSS styling configuration
├── tsconfig.json                 # TypeScript strict compiler options & @/* path alias
├── vitest.config.ts              # Vitest test runner configuration
├── tests/
│   └── data-validation.test.ts  # Seed data schema and referential integrity tests
└── src/
    ├── types/
    │   └── index.ts              # Category, FAQ, ChatMessage, ChatRequest/Response, ApiError
    ├── data/
    │   ├── categories.json       # Seed data for 6 campus categories
    │   └── faqs.json             # Seed data with 18 realistic campus FAQs (3/category)
    ├── lib/
    │   ├── config/
    │   │   └── env.ts            # Zod-validated environment loading (fail-fast)
    │   ├── validation/
    │   │   └── schemas.ts        # Zod validation schemas for requests & seed data
    │   ├── ai/
    │   │   ├── client.ts         # Google GenAI SDK client wrapper & typed stubs
    │   │   └── prompts.ts        # Grounding system prompt & FAQ context formatter
    │   ├── retrieval/
    │   │   └── matcher.ts        # FAQ retrieval & keyword matching stub
    │   └── utils/
    │       └── index.ts          # Classname merger (cn) and typed API helpers
    ├── app/
    │   ├── globals.css           # Tailwind base styles and CSS variables
    │   ├── layout.tsx            # Root HTML layout with metadata
    │   ├── page.tsx              # Minimal placeholder homepage
    │   └── api/
    │       ├── health/route.ts   # GET -> { status: "ok" }
    │       ├── faqs/route.ts     # GET -> Returns FAQs, optional ?category= filter
    │       ├── suggestions/route.ts # GET -> Returns suggested starter questions
    │       └── chat/route.ts     # POST -> Validates payload, returns typed mock response
    ├── components/               # UI components (Stage 2)
    └── hooks/                    # Custom React hooks (Stage 2)
```

---

## 🛣️ Project Roadmap

- [x] **Stage 1 (Current)**: Project skeleton, strict TypeScript setup, seed data (18 FAQs, 6 categories), API contract stubs (`/api/chat`, `/api/faqs`, `/api/suggestions`, `/api/health`), Vitest test suite, and configuration.
- [ ] **Stage 2**: Full interactive chat interface with responsive glassmorphism/dark-mode theme, category pill filters, suggested questions, streaming chat responses, and Gemini RAG grounding integration via `@google/genai`.
- [ ] **Stage 3**: Web Speech API voice input/synthesis, search indexing & semantic hybrid retrieval (BM25 + embeddings), rate limiting middleware, analytics, and final deployment hardening.
