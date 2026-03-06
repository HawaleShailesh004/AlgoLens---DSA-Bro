# AlgoLens — LeetCode Gym

**Your DSA revision companion: AI coach on LeetCode, spaced repetition, and a review queue that keeps you interview-ready.**

---

## Title & One-liner

**AlgoLens** (branded as “LeetCode Gym” in the server) is a **Chrome extension + web app** that turns LeetCode into a structured training loop: solve on LeetCode, get AI hints (no spoilers), log workouts with confidence and notes, and revise when the system says they’re due. Built for people who want to *retain* what they practice, not just grind and forget.

---

## Description

AlgoLens sits on top of LeetCode and adds:

- **In-problem AI coach** — Chat (streaming) while you’re on a problem. The coach gives hints and asks what you’ve tried instead of handing out full solutions (“tough love” / spotter style). Optional Groq API key for your own quota; otherwise a shared daily limit applies.
- **Workout logging** — After solving, log confidence (Struggled / Okay / Crushed it), optional timer, approach notes, and code. The backend can auto-generate pattern tag, complexity, and a code snippet from the conversation.
- **Spaced repetition** — Each log gets a `nextReviewAt` (1 / 3 / 7 days by confidence). The **dashboard** shows a review queue (due today / overdue) and “all” view with search and filters.
- **Web app** — Login, dashboard, revise-by-log pages, settings (password, Groq key, preferred language, quick prompts), and “How it works.” Opening the site from the extension can pass a token so you’re **auto-logged in**.
- **Sync** — Extension and website share the same account and settings (language, Groq key, quick prompts) via a central API and DB.

So: **LeetCode = gym floor; AlgoLens = spotter, logger, and review scheduler.**

---

## Target Users

| Role | Who they are | What they care about |
|------|----------------|------------------------|
| **Prep candidate** | Someone preparing for coding interviews (DSA). | Not forgetting patterns; knowing *when* to revise; getting hints without full answers. |
| **Product manager** | Evaluating the product. | Value prop, flows (solve → log → revise), differentiation from “just LeetCode + ChatGPT.” |
| **Engineer** | Contributing or integrating. | Architecture (extension vs server), APIs, stack, env, how to run and extend. |

---

## Goals

1. **Improve retention** — Spaced repetition so harder problems come back sooner, easier ones later.
2. **Keep the user thinking** — AI gives hints and asks “what have you tried?” instead of dumping solutions.
3. **Single place for “what to do today”** — Dashboard shows due reviews; user can open in browser from extension and stay logged in.
4. **Unified experience** — Same account and settings (language, API key, quick prompts) in extension and on the website.

---

## Features

### Chrome extension (AlgoLens)

- **Context-aware chat** — Runs on LeetCode problem pages; sends problem title, difficulty, description to the chat API. Streamed replies with markdown and code blocks.
- **Quick prompts** — One-click prompts (Hint, Complexity, Edge Cases, Find Bug, Approach, Optimize, Rate Code, Visualize). List is configurable per user (stored on server); extension loads it when logged in.
- **Mermaid diagrams** — Coach can respond with `mermaid` code blocks; extension renders them in the UI.
- **Workout logger** — Log confidence (1–3), category, approach, complexity, code/solution, optional time taken and time limit. Can call “generate notes” API to fill approach/complexity/snippet from conversation.
- **Timer** — Optional stopwatch or countdown for the current problem.
- **Dashboard link** — “Open in browser” opens the web dashboard; when logged in, appends `?token=...` so the website can **auto-login**.
- **Settings (in extension)** — Groq API key (optional), preferred language, change password (when logged in). Saves to Chrome storage and syncs to server (PATCH `/api/settings`).
- **Login / logout** — Uses same auth as website (JWT). Token and user id stored in `chrome.storage.local`.

### Web app (Next.js)

- **Landing** — Home describes “LeetCode Gym,” links to health, login, dashboard, how-it-works, LeetCode.
- **Auth** — Login, forgot password, reset password (email + token). JWT stored in `localStorage`; layout reads token and shows user menu / logout.
- **Dashboard** — Review queue: due vs all, search, filters. Each item links to **Revise** (by log id). “Open in browser” from extension can pass token for auto-login.
- **Revise [id]** — View a single log: title, difficulty, confidence, next review date, approach, complexity, code/solution, “Open in LeetCode” link. Copy code, optional “Generate notes” flow.
- **How it works** — Explains: install extension → solve on LeetCode → log workout → revise when due; includes spaced-repetition intervals (e.g. Hard 1d, Medium 3d, Easy 7d).
- **Settings** — Same as extension: Groq API key (optional), preferred language, **quick prompts** (add/delete/list, “Load default prompts”), change password. All persisted via `/api/settings`.

### Backend (API)

- **Auth** — `POST /api/auth` (login), password reset flow, `PATCH /api/auth/password`. JWT (jose) with `sub` (userId) and `email`.
- **Chat** — `POST /api/chat`: body has `messages`, `problemContext`, optional `userApiKey`. Uses Groq (or env key). Rate limit: 10 msgs/day per IP if no user, per user if logged in (unless user provides own key).
- **Logs** — `POST /api/log` (create), `GET /api/log` (list with cursor), `GET /api/log/[id]` (single). Auth required for create and list/by id.
- **Generate notes** — `POST /api/generate-notes`: from conversation + problem context, returns category, approach, complexity, codeSnippet, optimalSolution (for workout logger).
- **Settings** — `GET /api/settings` (preferredLanguage, masked groqApiKey, quickPrompts), `PATCH /api/settings` (update any of these). Auth required.
- **Problem** — `GET /api/problem/[slug]` if needed for problem metadata.
- **Health** — `GET /api/health` for readiness.

---

## Use Cases

1. **Daily practice** — User opens LeetCode, picks a problem, opens AlgoLens. Uses quick prompts or free-form chat for hints, logs the workout with confidence and notes. Later, dashboard shows “due today”; user revises from the web or goes back to LeetCode with context.
2. **Interview prep** — Focus on weak areas; spaced repetition surfaces hard problems more often. Revise page shows approach and code before re-attempting.
3. **Managing prompts** — User goes to website Settings, adds/removes quick prompts; extension fetches the list when loaded so both stay in sync.
4. **Using own AI quota** — User adds Groq API key in extension or website Settings; chat uses that key and avoids the shared 10-msg/day limit.
5. **Seamless extension → web** — User clicks “Open in browser” in extension; lands on dashboard already logged in (token in URL consumed and stored, then URL cleaned).

---

## Tech Stack

| Layer | Technologies |
|-------|----------------|
| **Extension** | React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, react-markdown, Mermaid, Lucide icons. Chrome Manifest V3, `chrome.storage`, content script on `leetcode.com/problems/*`. |
| **Web app** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Lucide icons. Client-side auth (localStorage + token-in-URL for auto-login). |
| **Backend** | Next.js API routes (same app), Prisma, PostgreSQL. Auth: jose (JWT), bcrypt for passwords. Rate limiting: Upstash Redis. AI: OpenAI-compatible client (Groq). Validation: Zod. |

### Repo layout

```
Leetcode AI/
├── README.md                 # This file
├── frontend/                 # Chrome extension (React + Vite)
│   ├── public/
│   │   ├── manifest.json
│   │   └── ...
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/       # Header, Dashboard, QuickPrompts, WorkoutLogger, Timer, Login, etc.
│   │   └── hooks/            # useChatStream, useProblemContext
│   └── package.json
└── backend/                  # Next.js app (web + API)
    ├── app/
    │   ├── (web)/            # login, dashboard, revise/[id], settings, how-it-works
    │   ├── api/              # auth, chat, log, settings, generate-notes, problem, health
    │   ├── layout.tsx
    │   └── page.tsx          # Landing
    ├── prisma/
    │   └── schema.prisma     # User, Log, PasswordResetToken
    ├── lib/                  # auth, prisma, validation
    └── package.json
```

---

## Data Model (high level)

- **User** — id, email, password, preferredLanguage, groqApiKey (optional), quickPrompts (JSON array of `{ label, text }`).
- **Log** — userId, slug, title, difficulty, confidence (1–3), reviewedAt, nextReviewAt, category, approach, complexity, codeSnippet, solution, timeTaken, timeLimit, metTimeLimit, language.
- **PasswordResetToken** — email, token, expiresAt.

Spaced intervals: confidence 1 → +1 day, 2 → +3 days, 3 → +7 days.

---

## Getting Started

### Prerequisites

- Node.js (e.g. 20+)
- PostgreSQL (for backend)
- Upstash Redis (for chat rate limiting)
- (Optional) Groq API key for AI

### 1. Backend + Web

```bash
cd leetcode-gym-server
cp .env.example .env   # if present; otherwise create .env
# Set: DATABASE_URL, JWT_SECRET, UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN,
#      GROQ_API_KEY, GROQ_BASE_URL, AI_MODEL (e.g. llama-3.1-70b-versatile)
npm install
npx prisma migrate dev
npm run dev
```

- Web app: http://localhost:3000  
- Login, dashboard, settings, how-it-works, revise/[id] all live here.

### 2. Extension

```bash
cd frontend
npm install
# Set VITE_API_URL to your server (e.g. http://localhost:3000/api)
npm run build
```

- In Chrome: `chrome://extensions` → Load unpacked → select `frontend/dist` (or the folder that contains `manifest.json` after build).
- Ensure extension’s `host_permissions` / API base matches your server (and CORS if needed).

### 3. Auto-login from extension

- In the extension, when logged in, “Open in browser” uses `{appUrl}/dashboard?token={jwt}`.
- The web layout reads `?token=`, decodes the JWT for `sub` and `email`, stores token and user in localStorage, then replaces the URL so the token is removed from the address bar.

---

## Environment (server)

| Variable | Purpose |
|---------|--------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for signing/verifying JWTs |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Redis for chat rate limits |
| `GROQ_API_KEY` | Default Groq key (used when user doesn’t provide one) |
| `GROQ_BASE_URL` | Groq API base URL |
| `AI_MODEL` | Model name (e.g. for chat and generate-notes) |

---

## Summary for PM / Engineer / User

- **Product:** AlgoLens = LeetCode + in-problem AI coach + workout logging + spaced repetition + web dashboard and revise flow. Same account and settings on extension and web; optional auto-login when opening the site from the extension.
- **User:** Someone prepping for interviews who wants to remember what they practice and get hints without full solutions.
- **Features:** Chat (with optional Groq key), quick prompts (editable in settings), workout logger, timer, dashboard, revise pages, settings (password, API key, language, quick prompts).
- **Tech:** Chrome extension (React/Vite) + Next.js (web + API), Prisma/PostgreSQL, Redis, JWT, Groq.
- **Use cases:** Daily practice, interview prep, managing prompts and API key, seamless extension-to-web login.

This README is the single place where a product manager, engineer, or targeted user can understand what AlgoLens is, who it’s for, what it does, and how it’s built.
