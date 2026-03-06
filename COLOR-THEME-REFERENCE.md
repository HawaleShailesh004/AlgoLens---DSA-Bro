# Grindset — Design System Reference

**Terminal aesthetic · Code-native · Single accent (green) · Zero blur**

This doc reflects the **Grindset** design system used in both the **extension** and **website**.

---

## 1. Color Palette

### Base (Neutrals)

| Token       | Hex        | Usage                          |
|------------|------------|--------------------------------|
| `--bg`     | `#09090b`  | Page/app background            |
| `--surface`| `#111113`  | Elevated panels, cards, inputs |
| `--card`   | `#16161a`  | Nested cards, hover states     |
| `--border` | `#222228`  | Default borders, dividers     |
| `--border-2` | `#2e2e38` | Focused/hover borders        |
| `--border-3` | `#3a3a48` | Active/selected borders       |

### Text

| Token     | Hex        | Usage                          |
|-----------|------------|--------------------------------|
| `--text`  | `#e4e4e7`  | Primary text, headings        |
| `--text-2`| `#a1a1aa`  | Secondary text, labels        |
| `--muted` | `#52525b`  | Tertiary text, placeholders   |
| `--muted-2` | `#71717a` | Disabled, very low contrast  |

### Brand / Accent (Green only)

| Token         | Value                          | Usage                    |
|---------------|---------------------------------|--------------------------|
| `--green`     | `#22c55e`                       | Primary action, success, links, focus, “Due today” |
| `--green-hover` | `#2dd46f`                    | Button hover             |
| `--green-dim` | `rgba(34, 197, 94, 0.12)`       | Soft green fills, pills  |
| `--border-green` | `rgba(34, 197, 94, 0.3)`     | Green-tinted borders     |
| `--shadow-green` | `0 0 0 1px var(--green), 0 0 24px rgba(34,197,94,0.3)` | Focus ring, primary button |

### Semantic (Difficulty / Status)

| Token        | Hex        | Usage                    |
|--------------|------------|--------------------------|
| `--cyan`     | `#06b6d4`  | Info, secondary actions  |
| `--cyan-dim` | rgba(...)  | Info banner bg           |
| `--amber`    | `#f59e0b`  | Medium difficulty, warnings |
| `--amber-dim`| rgba(...)  | Warning banner bg        |
| `--red`      | `#ef4444`  | Hard, errors, danger     |
| `--red-dim`  | rgba(...)  | Error banner, danger hover |
| `--purple`   | `#a855f7`  | Optional: tags           |
| `--purple-dim` | rgba(...) | Tag bg                   |

### Code syntax

| Token            | Hex        |
|------------------|------------|
| `--code-bg`      | `#0d0d12`  |
| `--code-text`    | `#abb2bf`  |
| `--code-keyword` | `#c678dd`  |
| `--code-function`| `#61afef`  |
| `--code-string`  | `#98c379`  |
| `--code-number`  | `#d19a66`  |
| `--code-comment` | `#5c6370`  |
| `--code-variable`| `#e06c75`  |
| `--code-operator`| `#56b6c2`  |

---

## 2. Typography

- **Primary font:** `--mono` = `"JetBrains Mono", "Fira Code", "Consolas", monospace` — used for all UI (body, headings, buttons, inputs).
- **Sizes:** `--text-xs` (10px) through `--text-4xl` (40px). Body/UI default: `--text-base` (13px).
- **Weights:** `--weight-normal` (300) to `--weight-black` (800).
- **Letter spacing:** `--tracking-tight` to `--tracking-widest`.
- **Line heights:** `--leading-tight` (1.25), `--leading-normal` (1.5), `--leading-relaxed` (1.75).

---

## 3. Spacing, Shadows, Radius

- **Spacing:** 4px base — `--space-1` (4px) through `--space-16` (64px).
- **Shadows:** Hard only (no blur): `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-green`, `--shadow-red`.
- **Radius:** Minimal — `--radius-none`, `--radius-sm` (2px), `--radius-md` (4px), `--radius-lg` (6px), `--radius-full`.

---

## 4. Where Used

### Extension (`frontend/src`)

- **App.css:** Defines all `:root` variables; body uses `--bg`, `--text`, `--mono`; scrollbar uses `--surface`, `--border-2`; Mermaid uses `--card`, `--green`.
- **Header:** `--bg`, `--border`, gradient line `--green`, `--green-dim`, `--border-green`, difficulty pills `--green`/`--amber`/`--red` + *-dim, actions `--text-2`, `--red`, `--red-dim`, `--card`.
- **MessageBubble:** User bubble `--green`, text `#000000`; assistant `--card`, `--border-2`, `--text`; error `--red`, `--red-dim`; tables `--surface`, `--border`, `--text`; code `--code-bg`, `--code-text`, `--border`.
- **Login, QuotaCard, WorkoutLogger, QuickPrompts, Timer, Dashboard, ManualContext:** Buttons/inputs use `--green`, `--green-hover`, `--shadow-green`, `--surface`, `--card`, `--border`, `--text`, `--text-2`, `--muted`; difficulty/confidence use `--green`/`--amber`/`--red` and *-dim.
- **CodeBlock:** Syntax uses all `--code-*`; container `--code-bg`, `--border`; copy state `--green`.
- **ThemeToggle:** `--card`, `--border`, hover `--green`; icons `--text-2` (inactive), `--green` (active in light mode).
- **Mermaid:** themeVariables use Grindset greens and neutrals; font `JetBrains Mono`.

### Website (`backend/app`)

- **globals.css:** Same `:root` variables; body `--bg`, `--text`, `--mono`, `--text-base`, `--leading-normal`.
- **Root layout:** Title “Grindset Gym”; font link for JetBrains Mono.
- **(web)/layout.tsx:** Shell uses `--bg`, `--text`, `--surface`, `--border`, `--card`, `--green`, `--green-dim`, `--border-green`, `--shadow-*`, `--muted`, `--red`, `--red-dim`; no backdrop-blur; brand “Grindset”.

Other website pages (dashboard, settings, revise, StudyPlanGenerator, PatternDrill) still use a mix of Tailwind classes; they can be migrated to these variables over time.

---

## 5. Gradients

- **Extension header:** `linear-gradient(to right, transparent, var(--green), transparent)` (top accent line).
- **Extension horizontal scroll:** `linear-gradient(to right, black 90%, transparent 100%)` (mask-fade).
- No other gradients in the design system.

---

## 6. Before/After (AlgoLens → Grindset)

| Aspect        | AlgoLens              | Grindset                    |
|---------------|------------------------|-----------------------------|
| Primary font  | Inter + mono for code  | JetBrains Mono everywhere   |
| Background    | `#000000`              | `#09090b`                   |
| Primary color | Cyan `#00d9ff`         | Green `#22c55e`             |
| Accent        | Yellow `#ffd60a`       | Removed (green only)        |
| Shadows       | Soft blur              | Hard pixel-offset only      |
| Border radius | 8px / 6px              | 4px / 2px                   |
| Light mode    | Supported              | Dark-only for v1            |
