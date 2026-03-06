# Grindset — Complete Feature Implementation TODO

> **Project:** Grindset (formerly AlgoLens)  
> **Tagline:** "Not just grind — Grindset. Master the patterns."  
> **Goal:** Transform LeetCode practice into a structured, retention-focused system

---

## 🎯 CRITICAL FIXES (Must Do First)

These fix fundamental issues in the current implementation. Complete these before building new features.

---

### ✅ FIX-1: Implement Real SRS Algorithm (SM-2)

**Status:** 🔴 Not Started  
**Priority:** CRITICAL  
**Time Estimate:** 2-3 hours  
**Dependencies:** None

**What to do:**
- [ ] Add `easeFactor` (Float, default 2.5) and `lastInterval` (Int, days) to `Log` model in Prisma schema
- [ ] Create migration: `npx prisma migrate dev --name add_srs_fields`
- [ ] Implement SM-2 algorithm in backend:
  ```typescript
  // Simplified SM-2 formula
  easeFactor = max(1.3, easeFactor + 0.1 - (3 - grade) * (0.08 + (3 - grade) * 0.02))
  interval = lastInterval * easeFactor
  nextReviewAt = now + interval days
  ```
- [ ] Update `POST /api/log` to calculate `nextReviewAt` using SM-2 instead of fixed intervals
- [ ] Update `PATCH /api/log/[id]` (when re-reviewing) to update `easeFactor` and `lastInterval`
- [ ] Backfill existing logs: create script to calculate `easeFactor` and `lastInterval` for all existing logs
- [ ] Test with multiple review cycles to ensure intervals increase/decrease correctly

**Files to modify:**
- `backend/prisma/schema.prisma`
- `backend/app/api/log/route.ts`
- `backend/app/api/log/[id]/route.ts`
- Create: `backend/scripts/backfill-srs.ts`

**Acceptance Criteria:**
- Problem marked "Crushed it" (3) three times in a row → next review in ~30 days (not 7)
- Problem marked "Struggled" (1) again → next review in 1 day (not 3)
- Intervals adjust dynamically based on performance history

---

### ✅ FIX-2: Replace Email Password Reset with OAuth

**Status:** 🔴 Not Started  
**Priority:** HIGH  
**Time Estimate:** 4-6 hours  
**Dependencies:** None

**What to do:**
- [ ] Install NextAuth.js: `npm install next-auth @auth/prisma-adapter`
- [ ] Set up Google OAuth provider (get credentials from Google Cloud Console)
- [ ] Set up GitHub OAuth provider (get credentials from GitHub)
- [ ] Create `app/api/auth/[...nextauth]/route.ts` with Google + GitHub providers
- [ ] Update Prisma schema to use NextAuth session/user model (or keep custom User model and sync)
- [ ] Remove email password reset flow:
  - [ ] Delete `app/api/auth/forgot-password/route.ts`
  - [ ] Delete `app/api/auth/reset-password/route.ts`
  - [ ] Delete `app/(web)/forgot-password/page.tsx`
  - [ ] Delete `app/(web)/reset-password/page.tsx`
  - [ ] Remove `PasswordResetToken` model from Prisma schema
- [ ] Update login page to show "Sign in with Google" and "Sign in with GitHub" buttons
- [ ] Update extension login to redirect to web OAuth flow (or implement OAuth in extension)
- [ ] Test OAuth flow end-to-end

**Files to modify:**
- `backend/app/api/auth/route.ts` (replace with NextAuth)
- `backend/app/(web)/login/page.tsx`
- `frontend/src/components/Login.tsx`
- `backend/prisma/schema.prisma`
- Create: `backend/app/api/auth/[...nextauth]/route.ts`

**Acceptance Criteria:**
- Users can sign in with Google or GitHub
- No email infrastructure needed
- Extension can authenticate via OAuth redirect
- Existing users can migrate (or keep email/password as fallback)

---

### ✅ FIX-3: Support OpenAI + Groq (Multi-Provider)

**Status:** 🔴 Not Started  
**Priority:** HIGH  
**Time Estimate:** 2-3 hours  
**Dependencies:** None

**What to do:**
- [ ] Add `aiProvider` field to User model (enum: "groq" | "openai", default "groq")
- [ ] Update settings API to accept `aiProvider` and `openaiApiKey` (in addition to `groqApiKey`)
- [ ] Update `POST /api/chat` to:
  - [ ] Check user's `aiProvider` preference
  - [ ] Use OpenAI client if provider is "openai" and key exists
  - [ ] Fall back to Groq if OpenAI fails or no key
- [ ] Update extension settings UI to show provider dropdown:
  - [ ] "AI Provider: [Groq ▼] [OpenAI]"
  - [ ] Show API key input based on selected provider
- [ ] Update website settings page to show provider dropdown + API key inputs
- [ ] Update `POST /api/generate-notes` to support both providers
- [ ] Test with both providers

**Files to modify:**
- `backend/prisma/schema.prisma`
- `backend/app/api/settings/route.ts`
- `backend/app/api/chat/route.ts`
- `backend/app/api/generate-notes/route.ts`
- `frontend/src/App.tsx` (settings drawer)
- `backend/app/(web)/settings/page.tsx`

**Acceptance Criteria:**
- Users can choose Groq or OpenAI
- API keys are stored per provider
- Chat and generate-notes work with both providers
- Fallback logic handles missing keys gracefully

---

### ✅ FIX-4: Raise/Eliminate 10-msg/day Shared Limit

**Status:** 🔴 Not Started  
**Priority:** MEDIUM  
**Time Estimate:** 1 hour  
**Dependencies:** None

**What to do:**
- [ ] Update `POST /api/chat` rate limiting logic:
  - [ ] If user has own API key → no limit
  - [ ] If logged-in user (no key) → 50 msgs/day (or unlimited)
  - [ ] If anonymous (no key) → 10 msgs/day (keep low to encourage signup)
- [ ] Update Redis key structure: `usage:user:{userId}` for logged-in users
- [ ] Update QuotaCard component to show correct limits
- [ ] Test rate limiting for all three scenarios

**Files to modify:**
- `backend/app/api/chat/route.ts`
- `frontend/src/components/QuotaCard.tsx`

**Acceptance Criteria:**
- Logged-in users without API key get 50 msgs/day (or unlimited)
- Users with own API key get unlimited
- Anonymous users still limited to 10/day (to encourage signup)

---

### ✅ FIX-5: Clean Up timeLimit/metTimeLimit Fields

**Status:** 🔴 Not Started  
**Priority:** LOW  
**Time Estimate:** 1 hour  
**Dependencies:** None

**What to do:**
- [ ] Remove `timeLimit` and `metTimeLimit` from WorkoutLogger form UI
- [ ] Keep fields in DB (for backward compatibility) but make them nullable/optional
- [ ] Update `POST /api/log` to not require these fields
- [ ] Keep `timeTaken` (stopwatch) as the only time tracking

**Files to modify:**
- `frontend/src/components/WorkoutLogger.tsx`
- `backend/app/api/log/route.ts`

**Acceptance Criteria:**
- WorkoutLogger only shows stopwatch (timeTaken)
- No timeLimit/metTimeLimit inputs in UI
- API accepts logs without these fields

---

## 🚀 TIER 1 — MUST SHIP (Demo Killers)

These features are non-negotiable for hackathon success. Build these first after fixes.

---

### ✅ TIER1-1: Analytics Dashboard — "Your DSA Report Card"

**Status:** 🔴 Not Started  
**Priority:** CRITICAL  
**Time Estimate:** 6-8 hours  
**Dependencies:** FIX-1 (SRS), existing Log data

**What to build:**

#### 1. Pattern Coverage Heatmap
- [ ] Create `/api/analytics/pattern-coverage` endpoint:
  - [ ] Aggregate logs by `category` (pattern)
  - [ ] Calculate average `confidence` per pattern
  - [ ] Return: `{ pattern: string, avgConfidence: number, count: number }[]`
- [ ] Define standard pattern list: Two Pointers, Sliding Window, Binary Search, DP, Graph, Tree, Heap, Backtracking, Greedy, Arrays, Hashing, String, Math, Bit Manipulation, Stack, Queue, Linked List, Trie, Union Find, Topological Sort
- [ ] Create heatmap component (use `recharts` or `react-heatmap-grid`):
  - [ ] Grid of patterns (rows/columns or single row with scroll)
  - [ ] Color coding: red (low confidence 1-1.5), yellow (medium 1.5-2.5), green (high 2.5-3)
  - [ ] Tooltip shows: pattern name, avg confidence, total solves
- [ ] Add to dashboard page (new section or separate `/analytics` page)

#### 2. Confidence Trend Line
- [ ] Create `/api/analytics/confidence-trend` endpoint:
  - [ ] Group logs by date (last 14 days)
  - [ ] Calculate rolling average confidence per day
  - [ ] Return: `{ date: string, avgConfidence: number, count: number }[]`
- [ ] Create line chart component (use `recharts`):
  - [ ] X-axis: dates (last 14 days)
  - [ ] Y-axis: confidence (1-3)
  - [ ] Show trend line with dots for each day
- [ ] Add to dashboard/analytics page

#### 3. Weak Spot Alert
- [ ] Create `/api/analytics/weak-spots` endpoint:
  - [ ] Calculate average confidence per pattern
  - [ ] Sort by lowest confidence
  - [ ] Return top 3 patterns
- [ ] Create alert card component:
  - [ ] "Your Weak Spots" header
  - [ ] List top 3 patterns with confidence bars
  - [ ] "Drill these patterns" CTA button
- [ ] Add prominently to dashboard (top section)

#### 4. Streak Tracker
- [ ] Create `/api/analytics/streak` endpoint:
  - [ ] Query logs ordered by `reviewedAt`
  - [ ] Count consecutive days with at least one log
  - [ ] Return: `{ currentStreak: number, longestStreak: number, lastLogDate: string }`
- [ ] Create streak card component:
  - [ ] Big number showing current streak
  - [ ] "🔥 X day streak" text
  - [ ] "Longest: Y days" subtitle
- [ ] Add to dashboard (prominent position)

#### 5. "Due Today" Number
- [ ] Update existing dashboard to show big number:
  - [ ] Count logs where `nextReviewAt <= today`
  - [ ] Display as: "📋 X problems due today"
  - [ ] Make it clickable → filters to "due" view
- [ ] Add visual emphasis (large font, color highlight)

**Files to create:**
- `backend/app/api/analytics/pattern-coverage/route.ts`
- `backend/app/api/analytics/confidence-trend/route.ts`
- `backend/app/api/analytics/weak-spots/route.ts`
- `backend/app/api/analytics/streak/route.ts`
- `backend/app/(web)/analytics/page.tsx` (or add to dashboard)
- `backend/app/(web)/components/PatternHeatmap.tsx`
- `backend/app/(web)/components/ConfidenceTrend.tsx`
- `backend/app/(web)/components/WeakSpotAlert.tsx`
- `backend/app/(web)/components/StreakTracker.tsx`

**Files to modify:**
- `backend/app/(web)/dashboard/page.tsx` (add analytics section)
- Install: `npm install recharts` (or `chart.js`)

**Acceptance Criteria:**
- Heatmap shows all patterns with color-coded confidence
- Trend line shows 14-day rolling average
- Weak spots alert shows top 3 patterns
- Streak tracker shows current and longest streak
- "Due Today" number is prominent and accurate

---

### ✅ TIER1-2: Interview Simulator Mode — "The 45-Minute Gauntlet"

**Status:** 🔴 Not Started  
**Priority:** CRITICAL  
**Time Estimate:** 12-16 hours  
**Dependencies:** Chat API, Timer component

**What to build:**

#### 1. Interview Mode UI (Extension)
- [ ] Add "Interview Mode" button/toggle in extension header
- [ ] Create InterviewSimulator component:
  - [ ] Problem selector (pick from weak patterns or random)
  - [ ] "Start Interview" button
  - [ ] Timer display: "Reading: 5:00" → "Solving: 40:00"
  - [ ] "Ask for Hint" button (disabled until timer starts)
  - [ ] Hint counter badge (shows deductions)
  - [ ] "End Interview" button
- [ ] State management:
  - [ ] `interviewMode: boolean`
  - [ ] `interviewPhase: "idle" | "reading" | "solving" | "ended"`
  - [ ] `hintCount: number`
  - [ ] `startTime: Date`
  - [ ] `phaseStartTime: Date`

#### 2. Interview Mode Chat API
- [ ] Update `POST /api/chat` to accept `mode: "interview"` parameter
- [ ] Create interview system prompt:
  ```
  You are a FAANG technical interviewer. You are SILENT unless the candidate explicitly asks for a hint.
  
  Rules:
  - Do NOT provide hints unless asked
  - If asked, give minimal hints (not full solutions)
  - Be professional but firm
  - After 40 minutes, provide feedback on their approach
  ```
- [ ] Track hint requests: increment counter in response
- [ ] Return `{ message: string, hintCount: number }`

#### 3. Interview Performance Report
- [ ] Create `POST /api/interview-report` endpoint:
  - [ ] Accept: `{ conversationHistory: Message[], problemContext: ProblemContext, timeTaken: number, hintCount: number }`
  - [ ] Call AI with prompt:
    ```
    Analyze this interview transcript and generate a performance report:
    - Time breakdown (reading vs coding vs debugging)
    - Solution quality score (correctness, edge cases, complexity)
    - Hint count assessment (0 hints = "Hired", 3+ hints = "Practice more")
    - Communication score (if thought process was explained)
    - One-paragraph "Interviewer Feedback" in first person
    ```
  - [ ] Return structured report:
    ```typescript
    {
      timeBreakdown: { reading: number, coding: number, debugging: number },
      solutionQuality: { correctness: number, edgeCases: number, complexity: number, overall: number },
      hintCount: number,
      hintAssessment: string,
      communicationScore?: number,
      interviewerFeedback: string
    }
    ```
- [ ] Create InterviewReport component to display report:
  - [ ] Score cards for each metric
  - [ ] Time breakdown pie chart
  - [ ] Interviewer feedback paragraph
  - [ ] "Save to Log" button (creates log entry)

#### 4. Timer Integration
- [ ] Extend Timer component to support interview mode:
  - [ ] Two-phase timer: 5min reading + 40min solving
  - [ ] Auto-transition between phases
  - [ ] Show current phase clearly
  - [ ] Track time per phase

#### 5. Optional: Voice Communication Score
- [ ] Add microphone button in interview mode
- [ ] Use Web Speech API to capture user's thought process
- [ ] Send transcript to interview report API
- [ ] AI rates communication clarity

**Files to create:**
- `frontend/src/components/InterviewSimulator.tsx`
- `frontend/src/components/InterviewReport.tsx`
- `backend/app/api/interview-report/route.ts`

**Files to modify:**
- `frontend/src/App.tsx` (add interview mode toggle)
- `frontend/src/components/Timer.tsx` (support two-phase timer)
- `backend/app/api/chat/route.ts` (add interview mode)
- `frontend/src/hooks/useChatStream.ts` (handle interview mode)

**Acceptance Criteria:**
- User can start interview mode with problem selection
- Timer shows 5min reading → 40min solving
- AI is silent unless "Ask for Hint" is clicked
- Hint count is tracked and displayed
- Performance report is generated after interview ends
- Report shows time breakdown, scores, and feedback

---

### ✅ TIER1-3: Onboarding Flow — "First 5 Minutes Matter"

**Status:** 🔴 Not Started  
**Priority:** HIGH  
**Time Estimate:** 4-6 hours  
**Dependencies:** Extension storage, Auth

**What to build:**

#### 1. Extension First-Run Wizard
- [ ] Check `chrome.storage.local.get("hasSeenOnboarding")` on extension load
- [ ] Create OnboardingWizard component (3 steps):
  - [ ] **Step 1:** Welcome screen
    - [ ] "Welcome to Grindset — your LeetCode training partner"
    - [ ] 15-second animation showing: solve → log → revise loop
    - [ ] "Next" button
  - [ ] **Step 2:** API Key setup (optional)
    - [ ] "Optional: Add your Groq or OpenAI API key for unlimited AI coaching"
    - [ ] Provider dropdown (Groq/OpenAI)
    - [ ] API key input
    - [ ] "Skip" and "Save" buttons
  - [ ] **Step 3:** Ready to go
    - [ ] "Open any LeetCode problem and click the Grindset icon. Let's go!"
    - [ ] "Get Started" button (closes wizard, sets `hasSeenOnboarding: true`)
- [ ] Show wizard as modal overlay on first run
- [ ] Store `hasSeenOnboarding: true` in chrome.storage.local after completion

#### 2. Pre-seeded Review Queue
- [ ] Create seed script: `scripts/seed-starter-problems.ts`
- [ ] On user signup (after OAuth or email signup):
  - [ ] Create 3 starter logs:
    - [ ] Two Sum (Arrays, confidence 2, nextReviewAt +3 days)
    - [ ] Valid Parentheses (Stack, confidence 2, nextReviewAt +3 days)
    - [ ] Binary Search (Binary Search, confidence 2, nextReviewAt +3 days)
  - [ ] Mark with `isStarter: true` flag (or use category "Starter")
- [ ] Update dashboard to show "Try these first" section for starter problems
- [ ] After user logs their first real workout, hide starter section

#### 3. First Solve Celebration
- [ ] Track `firstSolveLogged` in chrome.storage.local
- [ ] In WorkoutLogger, after successful log:
  - [ ] Check if this is user's first log (query API or check storage)
  - [ ] If first log:
    - [ ] Show confetti animation (use `canvas-confetti` or `framer-motion`)
    - [ ] Show message: "🎉 First solve logged! It's in your queue. See you in 3 days."
    - [ ] Set `firstSolveLogged: true` in storage
- [ ] Make celebration memorable but not intrusive

**Files to create:**
- `frontend/src/components/OnboardingWizard.tsx`
- `backend/scripts/seed-starter-problems.ts`

**Files to modify:**
- `frontend/src/App.tsx` (check onboarding state, show wizard)
- `frontend/src/components/WorkoutLogger.tsx` (first solve celebration)
- `backend/app/api/auth/route.ts` (seed starter problems on signup)
- `backend/app/(web)/dashboard/page.tsx` (show starter section)
- Install: `npm install canvas-confetti` (or use framer-motion)

**Acceptance Criteria:**
- New users see 3-step wizard on first extension open
- Wizard cannot be skipped (must complete or close)
- Starter problems appear in dashboard for new users
- First solve triggers celebration animation
- Onboarding state persists across sessions

---

## 🎨 TIER 2 — HIGH IMPACT (Post-Hackathon v2)

These features win product judges and investors. Build after hackathon.

---

### ✅ TIER2-1: AI Pattern Recognition on Logging — "What You Actually Learned"

**Status:** 🔴 Not Started  
**Priority:** HIGH  
**Time Estimate:** 6-8 hours  
**Dependencies:** Chat API, Generate Notes API

**What to build:**

#### 1. Enhanced Generate Notes API
- [ ] Update `POST /api/generate-notes` to extract:
  - [ ] `keyInsight`: The one non-obvious thing that cracked the problem
  - [ ] `mnemonic`: One-line memory aid for next time
- [ ] Update AI prompt:
  ```
  Extract from this conversation:
  1. Core algorithmic pattern (e.g., "Sliding Window with character frequency map")
  2. Key Insight: The one non-obvious trick that made the solution work
  3. Mnemonic: One memorable line to remember this pattern (e.g., "Think: 'valid window = expand aggressively, shrink lazily'")
  ```
- [ ] Return: `{ category, approach, complexity, codeSnippet, optimalSolution, keyInsight, mnemonic }`

#### 2. Update Log Model
- [ ] Add `keyInsight` (String?) and `mnemonic` (String?) to Log model
- [ ] Create migration
- [ ] Update validation schema

#### 3. Update WorkoutLogger
- [ ] Show `keyInsight` and `mnemonic` fields in form (auto-filled from generate notes)
- [ ] Allow manual editing
- [ ] Display prominently (before code snippet)

#### 4. Update Revise Page
- [ ] Show `keyInsight` and `mnemonic` FIRST (before approach/code)
- [ ] Format as flashcard-style:
  - [ ] "💡 Key Insight: [insight text]"
  - [ ] "🧠 Remember: [mnemonic text]"
- [ ] Make these the focus of revision (user reads insight/mnemonic before seeing code)

**Files to modify:**
- `backend/app/api/generate-notes/route.ts`
- `backend/prisma/schema.prisma`
- `frontend/src/components/WorkoutLogger.tsx`
- `backend/app/(web)/revise/[id]/page.tsx`

**Acceptance Criteria:**
- Generate notes extracts key insight and mnemonic from conversation
- WorkoutLogger shows and saves insight/mnemonic
- Revise page shows insight/mnemonic prominently before code
- Users can edit insight/mnemonic manually

---

### ✅ TIER2-2: Study Plan Generator — "Interview in N Weeks"

**Status:** 🔴 Not Started  
**Priority:** HIGH  
**Time Estimate:** 8-12 hours  
**Dependencies:** Analytics API, Log API

**What to build:**

#### 1. Study Plan Form
- [ ] Create StudyPlanGenerator component on dashboard:
  - [ ] "I have [N weeks] until my interview" (number input)
  - [ ] "Company tier: [FAANG ▼] [Mid-tier] [Startup]" (dropdown)
  - [ ] "My current level: [Beginner ▼] [Intermediate] [Advanced]" (dropdown)
  - [ ] "Generate Plan" button
- [ ] Show form as modal or dashboard section

#### 2. Study Plan API
- [ ] Create `POST /api/study-plan` endpoint:
  - [ ] Accept: `{ weeks: number, companyTier: string, currentLevel: string }`
  - [ ] Query user's existing logs to identify weak patterns
  - [ ] Call AI with prompt:
    ```
    Generate a personalized study plan:
    - User has {weeks} weeks until {companyTier} interview
    - Current level: {currentLevel}
    - Weak patterns: [list from analytics]
    - Generate week-by-week plan:
      Week 1: [Patterns] - [X problems/day]
      Week 2: [Patterns] - [X problems/day]
      ...
    - Prioritize weak patterns
    - Include specific problem recommendations from LeetCode
    ```
  - [ ] Return structured plan:
    ```typescript
    {
      weeks: [
        {
          week: number,
          patterns: string[],
          problemsPerDay: number,
          problems: { slug: string, title: string, difficulty: string }[]
        }
      ],
      totalProblems: number,
      estimatedHours: number
    }
    ```

#### 3. Study Plan Display
- [ ] Create StudyPlanView component:
  - [ ] Week-by-week breakdown
  - [ ] Each week shows: patterns, problems per day, problem list
  - [ ] "Add to Queue" button per week (adds problems to review queue)
  - [ ] Progress tracking: "Week 1: 3/7 days completed"

#### 4. Integration with Review Queue
- [ ] "Add to Queue" creates log entries for each problem:
  - [ ] `slug`, `title`, `difficulty` from plan
  - [ ] `category` from week's patterns
  - [ ] `nextReviewAt` based on week number (e.g., Week 1 problems due immediately)
  - [ ] `isFromStudyPlan: true` flag

**Files to create:**
- `backend/app/api/study-plan/route.ts`
- `backend/app/(web)/components/StudyPlanGenerator.tsx`
- `backend/app/(web)/components/StudyPlanView.tsx`

**Files to modify:**
- `backend/app/(web)/dashboard/page.tsx` (add study plan section)
- `backend/app/api/log/route.ts` (handle study plan logs)

**Acceptance Criteria:**
- User can generate personalized study plan
- Plan is week-by-week with patterns and problems
- Problems can be added to review queue
- Progress is tracked per week
- Plan prioritizes weak patterns

---

### ✅ TIER2-3: Pattern-Based Review Mode — "Drill Your Weak Spot"

**Status:** 🔴 Not Started  
**Priority:** MEDIUM  
**Time Estimate:** 4-6 hours  
**Dependencies:** Analytics API, Revise page

**What to build:**

#### 1. Pattern Drill Mode UI
- [ ] Add "Pattern Drill" toggle/filter on dashboard
- [ ] Pattern selector dropdown (shows all patterns user has logged)
- [ ] "Start Drill" button
- [ ] Filter view to show only selected pattern's problems

#### 2. Pattern Drill Logic
- [ ] Update dashboard filter:
  - [ ] When "Pattern Drill" mode is active:
    - [ ] Filter logs by selected pattern (category)
    - [ ] Sort by confidence (lowest first)
    - [ ] Show pattern name prominently
    - [ ] Show "X problems in this pattern" count
- [ ] Each problem card shows:
  - [ ] Key Insight and Mnemonic (if available)
  - [ ] "Can you solve this again?" prompt
  - [ ] "Attempt" button → opens LeetCode problem

#### 3. Re-attempt Flow
- [ ] After user attempts problem:
  - [ ] Show "How did it go?" prompt
  - [ ] Confidence slider (1-3)
  - [ ] "Log Re-attempt" button
- [ ] On log:
  - [ ] Create new log entry (or update existing?)
  - [ ] Update SRS schedule based on new confidence
  - [ ] Show improvement message if confidence increased

#### 4. Drill Session Summary
- [ ] After drilling pattern:
  - [ ] Show summary: "You drilled [Pattern]: X problems attempted, Y improved"
  - [ ] Show confidence change: "Average confidence: 1.5 → 2.3"

**Files to modify:**
- `backend/app/(web)/dashboard/page.tsx` (add pattern drill filter)
- `backend/app/(web)/revise/[id]/page.tsx` (add re-attempt flow)
- `backend/app/api/log/route.ts` (handle re-attempts)

**Acceptance Criteria:**
- User can select pattern and drill it
- Problems sorted by confidence (lowest first)
- Key insight/mnemonic shown before re-attempt
- Re-attempts update SRS schedule
- Drill session shows summary and progress

---

### ✅ TIER2-4: GitHub Sync — "Your Solving History Is a Portfolio"

**Status:** 🔴 Not Started  
**Priority:** MEDIUM  
**Time Estimate:** 8-12 hours  
**Dependencies:** GitHub OAuth, GitHub API

**What to build:**

#### 1. GitHub OAuth Integration
- [ ] Add GitHub OAuth to NextAuth (if not already done)
- [ ] Request `repo` scope for write access
- [ ] Store GitHub access token in User model (encrypted)

#### 2. GitHub Sync Settings
- [ ] Add to settings page:
  - [ ] "Connect GitHub" button (if not connected)
  - [ ] "Sync my solutions to GitHub" toggle
  - [ ] Repository name input (default: "leetcode-solutions")
  - [ ] Privacy toggle (public/private)
  - [ ] "Test Sync" button

#### 3. GitHub Sync API
- [ ] Create `POST /api/github/sync` endpoint:
  - [ ] Accept: `{ logId: string }` or `{ syncAll: boolean }`
  - [ ] Get user's GitHub token
  - [ ] Create/update repo if needed
  - [ ] For each log:
    - [ ] Create directory structure: `{category}/{slug}/`
    - [ ] Create `solution.{ext}` file (based on language)
    - [ ] Create `notes.md` file (approach, complexity, key insight, mnemonic)
    - [ ] Commit with message: "Solve: {title} ({difficulty})"
  - [ ] Return: `{ synced: number, repoUrl: string }`

#### 4. Auto-Sync Option
- [ ] Add "Auto-sync on log" toggle in settings
- [ ] On `POST /api/log`, if auto-sync enabled:
  - [ ] Trigger GitHub sync in background
  - [ ] Show sync status badge

#### 5. GitHub Repo Structure
```
leetcode-solutions/
  arrays/
    two-sum/
      solution.py
      notes.md
  dynamic-programming/
    coin-change/
      solution.js
      notes.md
```

**Files to create:**
- `backend/app/api/github/sync/route.ts`
- `backend/lib/github.ts` (GitHub API client)

**Files to modify:**
- `backend/app/(web)/settings/page.tsx` (add GitHub section)
- `backend/app/api/log/route.ts` (trigger sync if enabled)
- `backend/prisma/schema.prisma` (add githubToken, githubRepo fields)

**Acceptance Criteria:**
- User can connect GitHub account
- Solutions sync to organized repo structure
- Auto-sync option works
- Repo is public/private based on user choice
- Each problem has solution file + notes.md

---

## 🏆 TIER 3 — THE MOAT (Long-Term Differentiation)

These features make Grindset defensible and fundable. Build after v2.

---

### ✅ TIER3-1: Multiplayer / Accountability Pods

**Status:** 🔴 Not Started  
**Priority:** LOW (Post-MVP)  
**Time Estimate:** 16-24 hours  
**Dependencies:** User model, Notifications

**What to build:**

#### 1. Pod Model
- [ ] Create Pod model in Prisma:
  ```prisma
  model Pod {
    id          String   @id @default(cuid())
    name        String
    code        String   @unique  // Invite code
    createdAt   DateTime @default(now())
    members     PodMember[]
    challenges  Challenge[]
  }
  
  model PodMember {
    id        String   @id @default(cuid())
    podId     String
    userId    String
    joinedAt  DateTime @default(now())
    pod       Pod      @relation(...)
    user      User     @relation(...)
  }
  
  model Challenge {
    id          String   @id @default(cuid())
    podId       String
    week        Int      // Week number
    problems    String[] // Problem slugs
    startDate   DateTime
    endDate     DateTime
    pod         Pod      @relation(...)
  }
  ```

#### 2. Pod Creation/Joining
- [ ] Create pod page: `/pods`
  - [ ] "Create Pod" button → generates invite code
  - [ ] "Join Pod" form (enter invite code)
  - [ ] Pod list (pods user is member of)
- [ ] Pod API:
  - [ ] `POST /api/pods` (create)
  - [ ] `POST /api/pods/join` (join by code)
  - [ ] `GET /api/pods` (list user's pods)

#### 3. Leaderboard
- [ ] Create leaderboard component:
  - [ ] Shows pod members sorted by:
    - [ ] Current streak
    - [ ] Problems solved this week
    - [ ] Average confidence
  - [ ] Updates in real-time (or on refresh)

#### 4. Weekly Challenges
- [ ] Auto-generate weekly challenge:
  - [ ] 3 problems per week (mix of difficulties)
  - [ ] Same problems for all pod members
  - [ ] Challenge runs Mon-Sun
- [ ] Challenge progress tracking:
  - [ ] Show who completed which problems
  - [ ] Completion percentage per member

#### 5. Notifications
- [ ] When pod member logs solve:
  - [ ] Send notification to other members (in-app or email)
  - [ ] "John just solved Two Sum! 🔥"

#### 6. Race Mode (Optional)
- [ ] "Race" feature:
  - [ ] Pod members solve same problem simultaneously
  - [ ] Compare approaches after
  - [ ] Show who finished first (optional)

**Files to create:**
- `backend/app/api/pods/route.ts`
- `backend/app/api/pods/[id]/route.ts`
- `backend/app/(web)/pods/page.tsx`
- `backend/app/(web)/components/PodLeaderboard.tsx`
- `backend/app/(web)/components/WeeklyChallenge.tsx`

**Files to modify:**
- `backend/prisma/schema.prisma` (add Pod models)
- `backend/app/api/log/route.ts` (notify pod members)

**Acceptance Criteria:**
- Users can create/join pods
- Leaderboard shows member rankings
- Weekly challenges auto-generate
- Notifications sent on member activity
- Race mode works (optional)

---

### ✅ TIER3-2: Voice-First Revision Mode

**Status:** 🔴 Not Started  
**Priority:** LOW (Post-MVP)  
**Time Estimate:** 8-12 hours  
**Dependencies:** Revise page, Web Speech API

**What to build:**

#### 1. Voice Input UI
- [ ] Add microphone button to Revise page
- [ ] "Explain this solution out loud" prompt
- [ ] Recording indicator (waveform animation)
- [ ] "Stop Recording" button

#### 2. Speech-to-Text
- [ ] Use Web Speech API (`webkitSpeechRecognition` or `SpeechRecognition`)
- [ ] Convert speech to text
- [ ] Show transcript in real-time
- [ ] Handle errors gracefully

#### 3. Explanation Analysis API
- [ ] Create `POST /api/voice-analysis` endpoint:
  - [ ] Accept: `{ transcript: string, problemContext: ProblemContext, solution: string }`
  - [ ] Call AI with prompt:
    ```
    Analyze this verbal explanation of a coding solution:
    - Rate clarity (1-10)
    - Identify conceptual gaps
    - Ask a follow-up question if explanation was vague
    - Provide feedback on communication
    ```
  - [ ] Return:
    ```typescript
    {
      clarityScore: number,
      gaps: string[],
      followUpQuestion?: string,
      feedback: string
    }
    ```

#### 4. Feedback Display
- [ ] Show analysis results:
  - [ ] Clarity score (1-10) with visual indicator
  - [ ] Identified gaps list
  - [ ] Follow-up question (if any)
  - [ ] Feedback paragraph
- [ ] "Try Again" button to re-record

**Files to create:**
- `backend/app/api/voice-analysis/route.ts`
- `backend/app/(web)/components/VoiceRecorder.tsx`

**Files to modify:**
- `backend/app/(web)/revise/[id]/page.tsx` (add voice mode)

**Acceptance Criteria:**
- User can record voice explanation
- Speech converted to text accurately
- AI analyzes explanation clarity
- Gaps and feedback shown
- Follow-up questions generated if needed

---

### ✅ TIER3-3: Predictive Interview Readiness Score

**Status:** 🔴 Not Started  
**Priority:** LOW (Post-MVP)  
**Time Estimate:** 6-8 hours  
**Dependencies:** Analytics API, Log data

**What to build:**

#### 1. Readiness Score Algorithm
- [ ] Create `GET /api/analytics/readiness-score` endpoint:
  - [ ] Calculate score (0-100) from:
    - [ ] **Pattern Coverage (30 points):** Are all 14 core patterns represented? (2 points per pattern)
    - [ ] **SRS Health (25 points):** How many problems are overdue vs. current? (fewer overdue = higher score)
    - [ ] **Confidence Trajectory (25 points):** Is average confidence increasing over time? (trend analysis)
    - [ ] **Recency (10 points):** Solved at least 3 problems this week? (10 points if yes, 0 if no)
    - [ ] **Consistency (10 points):** Days with at least one solve in last 30 days (10 points if 20+ days, scaled down)
  - [ ] Return:
    ```typescript
    {
      score: number, // 0-100
      breakdown: {
        patternCoverage: number,
        srsHealth: number,
        confidenceTrajectory: number,
        recency: number,
        consistency: number
      },
      diagnosis: string // One-sentence feedback
    }
    ```

#### 2. Diagnosis Generation
- [ ] AI generates one-sentence diagnosis:
  - [ ] "You're strong on Arrays and Trees but haven't logged a single Graph or DP problem. 3 more sessions in those patterns would push you to 85+."
  - [ ] Based on score breakdown and weak spots

#### 3. Readiness Score Widget
- [ ] Create ReadinessScore component:
  - [ ] Big number (0-100) with color coding (red/yellow/green)
  - [ ] Progress bar showing score
  - [ ] Breakdown cards (hover to see details)
  - [ ] Diagnosis text prominently displayed
  - [ ] "Improve Score" CTA → links to weak spots or study plan

#### 4. Dashboard Integration
- [ ] Add readiness score to dashboard (top section)
- [ ] Update score in real-time as user logs solves
- [ ] Show trend (score over time)

**Files to create:**
- `backend/app/api/analytics/readiness-score/route.ts`
- `backend/app/(web)/components/ReadinessScore.tsx`

**Files to modify:**
- `backend/app/(web)/dashboard/page.tsx` (add score widget)

**Acceptance Criteria:**
- Score calculated from 5 factors (0-100)
- Breakdown shows contribution of each factor
- Diagnosis provides actionable feedback
- Score updates as user practices
- Trend shows score over time

---

## 🎨 REBRANDING: AlgoLens → Grindset

**Status:** 🔴 Not Started  
**Priority:** HIGH  
**Time Estimate:** 2-3 hours  
**Dependencies:** None

**What to do:**

- [ ] Update all copy:
  - [ ] Extension manifest: `name: "Grindset"`
  - [ ] README.md: Replace "AlgoLens" with "Grindset"
  - [ ] Landing page (`app/page.tsx`): Update branding
  - [ ] All UI text: "AlgoLens" → "Grindset"
  - [ ] API responses: Update product name
- [ ] Update taglines:
  - [ ] Primary: "Not just grind — Grindset. Master the patterns."
  - [ ] Alternatives:
    - "Turn your grind into a system."
    - "Every pattern. Logged. Reviewed. Owned."
    - "The grind has a structure now."
- [ ] Update domain references:
  - [ ] `grindset.dev` (register first)
  - [ ] `grindset.app` (backup)
  - [ ] `mygrindset.io` (fallback)
- [ ] Update logo/branding assets (if any)
- [ ] Update package.json names
- [ ] Update GitHub repo name/description

**Files to modify:**
- `frontend/public/manifest.json`
- `README.md`
- `backend/app/page.tsx`
- All component files with "AlgoLens" text
- `backend/package.json`
- `frontend/package.json`

**Acceptance Criteria:**
- No "AlgoLens" references remain
- All taglines updated
- Branding consistent across extension and web
- Domain strategy documented

---

## 📊 Implementation Priority Summary

### Week 1 (Hackathon Sprint)
1. ✅ FIX-1: SM-2 SRS Algorithm (2-3h)
2. ✅ FIX-2: OAuth (4-6h)
3. ✅ FIX-3: Multi-Provider AI (2-3h)
4. ✅ FIX-4: Rate Limits (1h)
5. ✅ TIER1-1: Analytics Dashboard (6-8h)
6. ✅ TIER1-2: Interview Simulator (12-16h)
7. ✅ TIER1-3: Onboarding Flow (4-6h)
8. ✅ REBRAND: AlgoLens → Grindset (2-3h)

**Total: ~35-46 hours** (fits in focused 48-72h hackathon)

### Week 2 (v2 Post-Hackathon)
1. ✅ TIER2-1: Pattern Recognition (6-8h)
2. ✅ TIER2-2: Study Plan Generator (8-12h)
3. ✅ TIER2-3: Pattern Drill Mode (4-6h)
4. ✅ TIER2-4: GitHub Sync (8-12h)

**Total: ~26-38 hours**

### Month 2+ (Moat Features)
1. ✅ TIER3-1: Accountability Pods (16-24h)
2. ✅ TIER3-2: Voice Revision (8-12h)
3. ✅ TIER3-3: Readiness Score (6-8h)

**Total: ~30-44 hours**

---

## 📝 Notes

- **Time estimates are conservative** — actual time may vary based on complexity and edge cases
- **Dependencies matter** — build fixes first, then Tier 1, then Tier 2, then Tier 3
- **Test thoroughly** — especially SRS algorithm and interview simulator (demo-critical features)
- **Document as you go** — update README and API docs as features are added
- **Get feedback early** — test Tier 1 features with real users before building Tier 2

---

**Last Updated:** [Current Date]  
**Status:** Ready to implement 🚀
