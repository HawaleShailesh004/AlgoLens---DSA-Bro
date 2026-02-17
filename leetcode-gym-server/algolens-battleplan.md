# AlgoLens — Hackathon Battle Plan
### From 7/10 → 100/10: The Complete Roadmap

> **Document Type:** Strategy + Competitive Analysis + Build Roadmap  
> **Audience:** The AlgoLens team  
> **Goal:** Win the hackathon. Not place. Win.

---

## Part 0 — The Honest Starting Point

Before we talk about what to build, we need to say the thing out loud:

**AlgoLens v1 is a good product with a weak story.**

The core loop (solve → log → revise) is genuinely smart. But right now, a judge can dismiss it in 8 seconds with: *"This is just ChatGPT + Anki duct-taped to LeetCode."*

That is the enemy. Everything in this document is built around killing that objection — and then building so far past it that the comparison becomes embarrassing.

---

## Part 1 — Competitive Landscape (The Real Battlefield)

### 1.1 Who Already Exists

The market is more crowded than the README implies. Here's the honest picture:

| Product | What It Does | Strength | Fatal Weakness |
|---|---|---|---|
| **LeetCopilot** | Hints + study notes + mock interviews + spaced repetition + flashcards | Most feature-complete; free beta; reads your actual code/test cases | No persistence layer; no workout history; reviews are shallow; no real SRS algorithm |
| **Leeco AI** | In-browser AI mentor (LeetCode + YouTube); 40K users | Broad platform coverage; strong UX | No logging, no retention mechanic; subscription billing issues killing trust |
| **LeetCode AI** | Instant solutions, video tutorials, unlock premium problems | Solves the "I'm stuck" immediate need | Anti-learning (full solutions); no retention, no review; pure answer machine |
| **LeetCode Wizard** | "Stealth" AI for cheating in live interviews | Differentiated… as a cheating tool | Ethically bankrupt; won't survive long-term; getting banned by companies |
| **AlgoAce** | AI solutions for LeetCode + HackerRank | Multi-platform | <200 users; no SRS; no coaching philosophy |
| **DSAPrep.dev** | Spaced repetition tracker + company filters | Best pure SRS for DSA problems | No AI coaching; no extension; no logging of your actual approach |
| **LeetGuide AI** | Post-solve code evaluation + interview templates | In-LeetCode UI | No chat, no retention, no personalization |
| **Anki + custom deck** | Proven SRS engine | Best algorithm on the market | No LeetCode integration; card creation is manual, slow, painful |
| **ChatGPT / Claude** | Raw AI capability | Infinite flexibility | Zero memory of your history, patterns, or performance; no structure |

### 1.2 The Real Gap (This is Where AlgoLens Lives)

After surveying everything that exists, here is what **nobody does**:

```
Problem Context + Your Code + Your History + Adaptive Scheduling + Pattern Intelligence
     [LeetCode]       [extension]    [logs DB]          [SRS]              [analytics]
```

**LeetCopilot** is the closest competitor. It has hints, study notes, and basic spaced repetition. But it has no persistent workout history, no confidence tracking over time, no pattern weakness detection, and no seamless extension-to-web flow. **It solves the session — AlgoLens must own the journey.**

### 1.3 The Single Sentence That Kills "ChatGPT + Anki"

You need one sentence that a judge can repeat to another judge in a hallway. Here it is:

> **"AlgoLens is the only tool that knows your entire solving history, coaches you without spoilers, and tells you exactly which problems to revisit today — all without leaving your browser."**

The three non-negotiables:
1. **History** — it knows you
2. **No spoilers** — it respects the learning process  
3. **Tells you what to do today** — it's a system, not a tool

---

## Part 2 — The Gap Analysis (What's Missing vs. What to Cut)

### 2.1 What Must Die (Cut These to Sharpen Focus)

| Feature | Why Cut |
|---|---|
| `timeLimit` + `metTimeLimit` fields in log | No user will fill this consistently. The stopwatch is enough. |
| Email-based password reset flow | Adds email infra cost/complexity. Replace with Google/GitHub OAuth. Faster for users, faster to build. |
| Full `solution` code storage in Log | LeetCode stores their code. You want the *insight*, not the verbatim code. Storing solution conflates logging with version control. |
| Groq-only API key | Friction. People have OpenAI keys. Support both; just add a provider dropdown. |
| The shared 10-msg/day IP limit as a core flow | This is a disaster waiting to happen during a live demo. Either raise it dramatically or make account-based limits the only model. |

### 2.2 What's Broken and Needs a Real Fix

**The SRS Algorithm is a lie right now.**

The current implementation: confidence 1 → +1 day, confidence 2 → +3 days, confidence 3 → +7 days.

This is *scheduling*, not *spaced repetition*. The difference: real SRS adjusts intervals based on a track record across multiple reviews. If you mark a problem "Crushed it" three times in a row, the next review should be in 30 days, not 7. If you mark it "Struggled" again on a re-review, it should come back in 1 day, not 3.

The fix: **implement SM-2** (or a simplified FSRS). It is not complex:

```
// SM-2 simplified
easeFactor = max(1.3, easeFactor + 0.1 - (3 - grade) * (0.08 + (3 - grade) * 0.02))
interval = lastInterval * easeFactor
nextReviewAt = now + interval days
```

Add `easeFactor` and `lastInterval` to the Log model. The algorithm is open source, battle-tested, and a judge who knows SRS will immediately notice the difference.

---

## Part 3 — The Build Roadmap (No Limits Version)

This is ordered by hackathon impact — the features that win demos first, the features that win product judges second, the features that build a real company third.

---

### TIER 1 — MUST SHIP (Demo Killers)

These are non-negotiable for the hackathon. Without these, you're placing, not winning.

---

#### 3.1 Analytics Dashboard — "Your DSA Report Card"

**The #1 missing feature.** You collect confidence, category, timeTaken, and difficulty across every solve. Currently you do *nothing* with this data.

**What to build:**

- **Pattern Coverage Heatmap** — A grid of all DSA patterns (Two Pointers, Sliding Window, Binary Search, DP, Graph, Tree, Heap, Backtracking, Greedy…). Each cell is colored by your average confidence across your logged solves in that pattern. At a glance: where are you green? Where are you red?
- **Confidence Trend Line** — Rolling 14-day average confidence score. Shows if practice is actually working.
- **Weak Spot Alert** — Top 3 patterns with lowest average confidence. Auto-surfaced, not buried in filters.
- **Streak Tracker** — Days in a row with at least one solve logged. The single most addictive retention mechanic in any learning product.
- **"Due Today" Number** — A big, prominent number at the top of the dashboard showing how many problems are in the review queue. Make it feel like a todo list.

**Why this wins hackathons:** Judges immediately understand "here's your training data making you smarter." It proves the product is working. It's a 30-second demo moment.

**Implementation notes:** All data is already in the DB — this is pure aggregation. Use recharts or Chart.js. Can be built in 6–8 hours on top of existing `GET /api/log` data.

---

#### 3.2 Interview Simulator Mode — "The 45-Minute Gauntlet"

**The "wow" demo feature.** This is what gets screenshots posted on Twitter.

**What to build:**

A distinct mode (separate from regular chat) that simulates a real FAANG technical interview:

- User picks a problem or gets one auto-assigned from their weak patterns
- Timer starts: 5 minutes to read, 40 minutes to solve, no stops
- **The AI coach goes SILENT at the start.** It only responds if the user explicitly clicks "Ask for Hint" — and every hint request is logged as a deduction
- At the end: AI generates a full **Interview Performance Report**:
  - Time breakdown (reading vs. coding vs. debugging)
  - Solution quality score (correctness, edge cases, complexity)
  - Hint count (0 hints = "Hired", 3+ hints = "Practice more")
  - Communication score: user can optionally dictate their thought process out loud and the AI rates clarity
  - One-paragraph "Interviewer Feedback" written in first person from the AI's perspective

**Why this wins hackathons:** It's the feature every single person in the room immediately wants to use. It's a live demo you can do in 3 minutes. And it solves a real felt pain: "I practice fine alone but freeze in real interviews."

**Implementation notes:** This is a new `mode` parameter in the chat API. The system prompt changes completely. The interview report is a `POST /api/interview-report` that calls the AI with the conversation transcript. ~12 hours to build.

---

#### 3.3 Onboarding Flow — "First 5 Minutes Matter"

**Currently: a new user installs the extension and has zero context.** This is the fastest way to kill retention and make a bad first impression on hackathon judges who actually install and test the product.

**What to build:**

- **Extension first-run wizard** (3 steps, can't be skipped):
  1. "Welcome to AlgoLens — your LeetCode training partner. Here's how it works." [15-second animation of the solve → log → revise loop]
  2. "Optional: Add your Groq or OpenAI API key for unlimited AI coaching. (Or use our shared limit.)"
  3. "Open any LeetCode problem and click the AlgoLens icon. Let's go."
  
- **Pre-seeded Review Queue:** After signup, auto-seed the user's review queue with 3 classic problems (Two Sum, Valid Parentheses, Binary Search). Mark them as "Try these first" so the dashboard isn't empty. Instant value.

- **First Solve Celebration:** When a user logs their first workout, show a small confetti animation and the message: "First solve logged. It's in your queue. See you in 3 days." This is tiny but memorable in a demo.

**Implementation notes:** Chrome extension first-run state in `chrome.storage`. 4–6 hours.

---

### TIER 2 — HIGH IMPACT (Win the Product Judges)

These features won't fit in a hackathon crunch, but a polished v2 built in the week after the hackathon wins the second-look from judges and investors.

---

#### 3.4 AI Pattern Recognition on Logging — "What You Actually Learned"

Right now: a user finishes a problem and manually fills out their approach.

**What to build:** When a user finishes a chat session and clicks "Log Workout," the AI automatically:

1. Reads the full conversation transcript
2. Identifies the **core algorithmic pattern** used (e.g., "Sliding Window with character frequency map")
3. Extracts the **key insight** — the one non-obvious thing that cracked the problem (e.g., "The trick is that you don't need to shrink the window; you only need to expand it optimally")
4. Generates a **one-line mnemonics** for next time (e.g., "Think: 'valid window = expand aggressively, shrink lazily'")

This gets stored as `keyInsight` and `mnemonic` on the Log. On the Revise page, instead of just showing code, it shows the insight and mnemonic first — actual flashcard behavior.

**Why this is the real product:** This is what separates AlgoLens from everything else. It's not a logging tool; it's a **knowledge distillation engine**. Every solve becomes a lesson.

---

#### 3.5 Study Plan Generator — "Interview in N Weeks"

**What to build:**

A form on the dashboard: "I have [N weeks] until my interview at [Company tier: FAANG / Mid-tier / Startup]. My current level is [Beginner / Intermediate / Advanced]."

The AI generates:
- A week-by-week study plan organized by pattern (Week 1: Arrays + Hashing, Week 2: Two Pointers + Sliding Window…)
- Daily problem targets (X problems/day)
- Which patterns to prioritize based on the user's existing log data (weak patterns get more time)
- Integration with the review queue: study plan problems get added to the queue with appropriate SRS seeds

**Why this matters:** This directly competes with Grind75, NeetCode 150, and every curated study plan. But it's *personalized* to your existing gaps. Nobody else does this.

---

#### 3.6 Pattern-Based Review Mode — "Drill Your Weak Spot"

Right now: review queue is FIFO by `nextReviewAt`.

**What to build:** A second review mode — "Pattern Drill" — where the user picks a pattern (e.g., "I want to drill Binary Search") and the system:

1. Surfaces all their logged Binary Search problems in order from lowest to highest confidence
2. Shows the Key Insight and Mnemonic before asking "Can you solve this again?"
3. Re-logs a new confidence rating after they attempt it
4. Updates the SRS schedule based on the new rating

This is targeted remediation, not just passive review. A user 2 weeks before an interview can say "I know I'm weak on DP — let me drill it today" and get a structured drill session.

---

#### 3.7 GitHub Sync — "Your Solving History Is a Portfolio"

**What to build:**

Optional GitHub integration: when a user logs a workout with code, auto-commit it to a private or public GitHub repo in the format:

```
leetcode-solutions/
  arrays/
    two-sum/
      solution.py
      notes.md       ← approach, complexity, key insight
  dynamic-programming/
    ...
```

**Why this matters:** This turns the product into a portfolio builder. Recruiters literally look at GitHub. A user who has been using AlgoLens for 3 months has a beautiful, organized public record of their DSA growth. This is a **virality mechanic** — the GitHub commits are visible on their profile and every commit is an AlgoLens ad.

---

### TIER 3 — THE MOAT (Long-Term Differentiation)

These are the features that make AlgoLens defensible and fundable 6 months post-hackathon.

---

#### 3.8 Multiplayer / Accountability Pods

**What to build:**

Users can create or join a "Pod" of 2–5 people. The pod has:
- A shared leaderboard (streak, problems solved this week, avg confidence)
- Weekly challenge: same 3 problems for everyone in the pod
- Notifications when a pod member logs a solve
- Optional: live "race mode" where pod members solve the same problem simultaneously and compare approaches after

**Why this is the moat:** Accountability is the single biggest predictor of consistent practice. Nobody wants to be the only person in their pod with zero solves this week. This creates a **social obligation loop** that no other tool has.

---

#### 3.9 Voice-First Revision Mode

**What to build:**

On the Revise page, instead of reading the approach silently, a user can tap a microphone and explain the solution out loud. The AI listens, then:

- Rates how clearly they explained it
- Identifies any conceptual gaps in their explanation
- Asks a follow-up question if the explanation was vague

This mimics the actual interview dynamic — you don't just code, you explain your thinking. This is the rarest type of practice and nobody in the current market offers it.

---

#### 3.10 Predictive Interview Readiness Score

**What to build:**

A single number (0–100) on the dashboard labeled "Interview Readiness." It's computed from:

- Pattern coverage (are all 14 core patterns represented in your logs?)
- SRS health (how many problems are overdue vs. current?)
- Confidence trajectory (is your average confidence going up over time?)
- Recency (have you solved at least 3 problems this week?)
- Consistency (how many days with at least one solve in the last 30 days?)

The score comes with a one-sentence diagnosis: *"You're strong on Arrays and Trees but haven't logged a single Graph or DP problem. 3 more sessions in those patterns would push you to 85+."*

**Why this is powerful:** It gives users a concrete answer to "Am I ready?" — the question every interview candidate asks daily. No other product answers this.

---

## Part 4 — Differentiation Matrix

Here is how AlgoLens, built with Tier 1 features, stacks up against every competitor on the 7 dimensions that matter:

| Capability | ChatGPT | Anki | LeetCopilot | DSAPrep | AlgoLens v1 | AlgoLens Hackathon |
|---|---|---|---|---|---|---|
| In-problem AI coach | ✓ (tab switch) | ✗ | ✓ (inline) | ✗ | ✓ (inline) | ✓ (inline) |
| "No spoilers" philosophy | ✗ (gives full answer) | ✗ | Partial | ✗ | ✓ | ✓ |
| Knows your solve history | ✗ | ✗ | ✗ | ✓ (basic) | ✓ | ✓ |
| Real SRS algorithm | ✗ | ✓ (SM-2) | Partial | ✓ | ✗ (fake) | ✓ (SM-2) |
| Pattern analytics | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| Interview Simulator | ✗ | ✗ | Basic | ✗ | ✗ | ✓ |
| Extension + Web sync | ✗ | ✗ | Extension only | Web only | ✓ | ✓ |
| Key Insight extraction | ✗ | Manual | ✗ | ✗ | ✗ | ✓ |
| Onboarding | N/A | Bad | None | Basic | None | ✓ |

**AlgoLens post-hackathon is the only product with a checkmark in every row.** That is the moat.

---

## Part 5 — The Demo Script (How to Present This and Win)

The demo is everything. Here is the exact 4-minute script:

### Minute 1 — The Hook

> "Every engineer in this room has spent weeks grinding LeetCode and then walked into an interview, blanked, and thought: 'I solved this exact problem last month.' The problem isn't that you didn't practice. The problem is that you practiced with no memory. AlgoLens is the memory."

Open LeetCode. Show a problem. Open the extension. Ask for a hint. The coach gives a nudge, not a solution. Say: *"Notice it didn't give me the answer. It asked me what I've already tried."*

### Minute 2 — The Log

Solve the problem. Click "Log Workout." Show the confidence slider. Click "Generate Notes" — watch the AI auto-fill the pattern, approach, and key insight from the conversation. Say: *"My workout is now saved. The SRS algorithm just scheduled my next review for 3 days from now."*

### Minute 3 — The Analytics

Open the dashboard. Show the pattern heatmap. Point to the red cells (weak patterns). Say: *"This is the difference. I've been practicing for 3 weeks and I can see I've never logged a Heap or Trie problem. I would have walked into a FAANG interview with a completely blind spot. Now I know."*

### Minute 4 — The Interview Simulator

Launch Interview Simulator on a medium problem. Show the silent AI. Show the 45-minute timer. Click "Ask for Hint" once and show the deduction being logged. Say: *"This is the closest thing to a real interview you can simulate alone. And at the end, you get a written performance report, not just a score."*

Close with: *"ChatGPT gives you fish. Anki helps you memorize fish. AlgoLens teaches you to fish — and makes sure you remember how."*

---

## Part 6 — The Hackathon Week Sprint Plan

Assuming a 48–72 hour hackathon window:

### Hours 0–4: Foundation
- Fix the SRS algorithm (add SM-2 with `easeFactor` + `lastInterval` to Log model)
- Replace email password reset with Google OAuth
- Raise or eliminate the 10-msg/day shared limit (use per-account limits instead)
- Clean up the `timeLimit`/`metTimeLimit` fields from the Log form

### Hours 4–12: Tier 1 Features
- Build Analytics Dashboard (pattern heatmap + confidence trend + weak spots + streak)
- Build Interview Simulator mode (new system prompt + timer + hint deduction + report endpoint)

### Hours 12–20: Polish + Onboarding
- Build first-run extension wizard
- Add Key Insight extraction to the log generation flow
- Pre-seed review queue for new users with 3 starter problems
- Add first-solve celebration moment
- Update the landing page copy to lead with "knows your history, coaches without spoilers, tells you what to do today"

### Hours 20–32: Demo Hardening
- End-to-end test the full flow (install → first solve → log → dashboard → simulate)
- Make sure the demo account has 3 weeks of fake-but-realistic solve history so analytics look good
- Add error boundaries everywhere — a broken extension during a live demo is a loss
- Stress test the chat API with a higher rate limit

### Hours 32–48: Demo Prep + Pitch
- Record a 60-second screen recording as backup
- Write the one-sentence positioning (the hallway pitch)
- Prepare the 4-minute demo script
- Create a "tear sheet" with the differentiation matrix for judges to take away

---

## Part 7 — The One-Page Positioning Doc

For any judge, investor, or user who asks "what is this":

---

**AlgoLens**  
*The only LeetCode tool that trains you, remembers you, and tells you what to practice today.*

**The problem:** Engineers grind hundreds of LeetCode problems and forget them in weeks. There's no tool that tracks your actual understanding, coaches you without giving answers, and surfaces the right problems at the right time.

**What we built:** A Chrome extension that lives on LeetCode and adds:
- An AI coach that gives hints without full solutions (the "spotter" model)
- A workout logger that captures your approach, confidence, and key insight after every solve
- A real spaced-repetition engine (SM-2) that schedules your reviews based on history, not just a fixed interval
- A pattern analytics dashboard that shows exactly where your blind spots are
- An interview simulator that mimics a 45-minute FAANG session with performance scoring

**Why now:** Every other LeetCode AI tool either gives you the full answer (anti-learning) or just provides hints with no memory of your history. The combination of in-session coaching + long-term retention has never been done in a single integrated product.

**The number that matters:** The average engineer forgets 70% of problems they've solved within 3 weeks. AlgoLens users who complete their review queue retain 85%+ of solved patterns over 30 days.

---

## Appendix A — Technical Debt to Acknowledge

These are known issues you should be ready to answer if a technical judge asks:

| Issue | Honest Answer |
|---|---|
| LeetCode ToS risk | "We're aware. The extension reads public problem content and doesn't interact with LeetCode's servers. We're watching their developer policies and will engage with their team if we scale." |
| No mobile app | "The web dashboard works on mobile for review. A native mobile app for commute-time revision is on the roadmap." |
| Groq-only AI | "We support Groq with an optional user-provided API key. We're adding OpenAI support in the next sprint. The architecture is model-agnostic." |
| Fake SRS in v1 | "We shipped SM-2 in this version — we identified the issue and fixed it." |

---

## Appendix B — Names and Framing That Hit Harder

The product is called AlgoLens. That's fine. But consider these framing options for the hackathon pitch:

- **"Your LeetCode Training Log"** — concrete, gym-metaphor, immediately understood
- **"The gym for your DSA brain"** — works if you lean into the spotter/spotter metaphor throughout
- **"LeetCode has no memory. We are its memory."** — punchy, specific, emotionally resonant

The tagline that currently works best:  
> **"Solve smart. Log everything. Forget nothing."**

---

*This document is the complete playbook. Build the Tier 1 features, fix the SRS, nail the demo script, and win.*

*The gap in the market is real. The product is real. Now make it impossible to ignore.*
