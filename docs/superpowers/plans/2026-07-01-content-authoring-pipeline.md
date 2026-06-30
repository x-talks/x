# Content Authoring Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up Hugo multilingual content structure (DE/EN/TR) and create the `/article` Claude Code skill that guides the author from a raw German draft to committed multilingual files.

**Architecture:** Hugo's native i18n with `de` as the default language. Existing content migrates to `content/de/`. The `/article` skill lives in `~/.claude/skills/article/SKILL.md` and drives the full authoring pipeline: mode selection → structure extraction → gap-filling dialogue → cultural adaptation → file creation → commit.

**Tech Stack:** Hugo static site, TOML config, Markdown content, Claude Code skills (SKILL.md)

---

## File Map

| File | Action |
|------|--------|
| `hugo.toml` | Modify — add multilingual config |
| `layouts/index.html` | Modify — use `.Site.RegularPages` scoped to current language |
| `layouts/_default/baseof.html` | Modify — add language switcher nav links |
| `content/de/blog/*.de.md` | Create — migrate 2 existing blog posts |
| `content/de/podcast/*.de.md` | Create — migrate 2 existing podcast entries |
| `content/de/youtube/*.de.md` | Create — migrate 1 existing youtube entry |
| `content/de/sources/*.de.md` | Create — migrate 1 existing source entry |
| `content/de/about/_index.de.md` | Create — migrate about page |
| `content/en/.gitkeep`, `content/tr/.gitkeep` | Create — placeholder dirs |
| `AUTHORING.md` | Create — step-by-step authoring guide |
| `~/.claude/skills/article/SKILL.md` | Create — the /article skill |

---

## Task 1: Configure Hugo multilingual support

**Files:**
- Modify: `hugo.toml`

- [ ] **Step 1: Read current hugo.toml**

```bash
cat hugo.toml
```

Expected output:
```toml
baseURL = "https://x-talks.github.io/x/"
locale = "en-US"
title = "Master Blog"
...
```

- [ ] **Step 2: Replace hugo.toml with multilingual config**

```toml
baseURL = "https://x-talks.github.io/x/"
title = "Master Blog"

defaultContentLanguage = "de"
defaultContentLanguageInSubdir = false

[languages]
  [languages.de]
    languageName = "Deutsch"
    languageCode = "de-DE"
    title = "Master Blog"
    weight = 1
    contentDir = "content/de"

  [languages.en]
    languageName = "English"
    languageCode = "en-US"
    title = "Master Blog"
    weight = 2
    contentDir = "content/en"

  [languages.tr]
    languageName = "Türkçe"
    languageCode = "tr-TR"
    title = "Master Blog"
    weight = 3
    contentDir = "content/tr"

[outputs]
  home = ["HTML"]
  section = ["HTML", "RSS"]

[taxonomies]
  tag = "tags"

[params]
  description = "Master Blog — daily observations, podcast, video"
```

- [ ] **Step 3: Verify Hugo builds without errors**

```bash
hugo --buildDrafts 2>&1 | tail -5
```

Expected: no ERROR lines, build completes.

- [ ] **Step 4: Commit**

```bash
git add hugo.toml
git commit -m "config: add Hugo multilingual support (de/en/tr)"
```

---

## Task 2: Migrate existing content to content/de/

**Files:**
- Create: `content/de/blog/on-the-nature-of-daily-phenomena.de.md`
- Create: `content/de/blog/the-architecture-of-the-everyday.de.md`
- Create: `content/de/podcast/conversations-at-the-edge-of-the-map.de.md`
- Create: `content/de/podcast/escaping-the-productivity-trap.de.md`
- Create: `content/de/youtube/60-seconds-on-stillness.de.md`
- Create: `content/de/sources/systems-dont-think-people-do.de.md`
- Create: `content/de/about/_index.de.md`
- Create: `content/en/.gitkeep`
- Create: `content/tr/.gitkeep`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p content/de/blog content/de/podcast content/de/youtube content/de/sources content/de/about
mkdir -p content/en content/tr
touch content/en/.gitkeep content/tr/.gitkeep
```

- [ ] **Step 2: Create content/de/blog/on-the-nature-of-daily-phenomena.de.md**

```markdown
---
title: "On the nature of daily phenomena"
date: 2026-06-12
mode: philosophy
series: "Daily"
episode: 1
readtime: "5 min"
pullquote: "Attention is the beginning of devotion."
tags: [philosophy, daily]
slug: "on-the-nature-of-daily-phenomena"
---

There is something quietly radical about paying attention. Not the performative attention of social media, but the slow, committed kind — the kind that transforms observation into understanding over time.

Every day carries a phenomenon worth naming.
```

- [ ] **Step 3: Create content/de/blog/the-architecture-of-the-everyday.de.md**

```markdown
---
title: "The architecture of the everyday"
date: 2026-05-28
mode: philosophy
series: "Phenomenons"
episode: 1
image: "resource/image/profile.png"
tags: [photography, observation]
slug: "the-architecture-of-the-everyday"
---

Structures we pass without seeing. Patterns that only appear when you stop moving.
```

- [ ] **Step 4: Create content/de/podcast/conversations-at-the-edge-of-the-map.de.md**

```markdown
---
title: "Conversations at the edge of the map"
date: 2026-05-15
mode: philosophy
series: "X-Talks"
episode: 1
duration: "58 min"
audio_url: "#"
tags: [travel, conversation]
slug: "conversations-at-the-edge-of-the-map"
---

What happens when you talk to people who have left the known world behind.
```

- [ ] **Step 5: Create content/de/podcast/escaping-the-productivity-trap.de.md**

```markdown
---
title: "Escaping the productivity trap"
date: 2026-06-05
mode: tech
series: "Detrapped"
episode: 1
duration: "42 min"
audio_url: "#"
tags: [productivity, work]
slug: "escaping-the-productivity-trap"
---

Why optimizing for output often destroys the conditions that make good work possible.
```

- [ ] **Step 6: Create content/de/youtube/60-seconds-on-stillness.de.md**

```markdown
---
title: "60 seconds on stillness"
date: 2026-05-20
mode: philosophy
series: "Shorts"
episode: 1
youtube_id: "dQw4w9WgXcQ"
duration: "60 sec"
tags: [video, stillness]
slug: "60-seconds-on-stillness"
---

A one-minute observation. No narration. Just presence.
```

- [ ] **Step 7: Create content/de/sources/systems-dont-think-people-do.de.md**

```markdown
---
title: "Systems don't think — people do"
date: 2026-05-15
mode: tech
series: "Axioms"
url: "#"
tags: [systems, thinking]
slug: "systems-dont-think-people-do"
---

Complex systems produce outcomes that no individual intended or foresaw. Understanding this changes how you assign blame and credit.
```

- [ ] **Step 8: Create content/de/about/_index.de.md**

```markdown
---
title: "About Me"
profile_image: "resource/image/profile.png"
---

Content coming soon.
```

- [ ] **Step 9: Verify Hugo builds with new content**

```bash
hugo --buildDrafts 2>&1 | tail -5
```

Expected: no ERROR lines.

- [ ] **Step 10: Commit**

```bash
git add content/
git commit -m "content: migrate existing entries to content/de/ with slug fields"
```

---

## Task 3: Update layouts for multilingual content

**Files:**
- Modify: `layouts/index.html`
- Modify: `layouts/_default/list.html`
- Modify: `layouts/_default/baseof.html`

Hugo multilingual note: `.Site.RegularPages` returns pages for the current language when multilingual is configured. No template changes needed for filtering — Hugo handles it. However the `index.html` currently uses `where .Site.RegularPages "Section" "blog"` — this continues to work correctly.

- [ ] **Step 1: Read current layouts/index.html**

```bash
cat layouts/index.html
```

- [ ] **Step 2: Verify the existing template works — no changes needed to index.html**

The existing `where .Site.RegularPages "Section" "blog"` etc. queries work with multilingual Hugo because `.Site.RegularPages` is already scoped to the active language. No edits needed.

Run:
```bash
hugo server --buildDrafts -p 1314 &
sleep 2
curl -s http://localhost:1314/x/ | grep -c "entry"
kill %1
```

Expected: count > 0 (entries rendering).

- [ ] **Step 3: Add language switcher to baseof.html**

Read current `layouts/_default/baseof.html`, then add a language switcher after the closing `</nav>` tag and before `</header>`:

```html
  <!-- LANGUAGE SWITCHER -->
  <div id="lang-switcher" style="margin-left:auto;font-family:monospace;font-size:0.62rem;letter-spacing:0.12em;display:flex;gap:0.5rem;align-items:center;">
    {{ range .Site.Languages }}
    <a href="{{ relLangURL "" }}" style="color:{{ if eq . $.Site.Language }}#000{{ else }}#aaa{{ end }};text-decoration:none;text-transform:uppercase;border-bottom:{{ if eq . $.Site.Language }}2px solid #000{{ else }}none{{ end }};">{{ .LanguageName }}</a>
    {{ end }}
  </div>
```

Place it inside `<header>` after the closing `</nav>` tag:

```html
  </nav>

  <!-- LANGUAGE SWITCHER -->
  <div id="lang-switcher" style="...">
    ...
  </div>
</header>
```

- [ ] **Step 4: Verify Hugo builds and language switcher renders**

```bash
hugo --buildDrafts 2>&1 | tail -5
```

Expected: no ERROR lines.

- [ ] **Step 5: Commit**

```bash
git add layouts/
git commit -m "layouts: add language switcher to header"
```

---

## Task 4: Create the /article skill

**Files:**
- Create: `~/.claude/skills/article/SKILL.md`

This skill is invoked when the user types `/article` in Claude Code. It guides the full authoring pipeline.

- [ ] **Step 1: Create skill directory**

```bash
mkdir -p ~/.claude/skills/article
```

- [ ] **Step 2: Create ~/.claude/skills/article/SKILL.md**

```markdown
---
name: article
description: Use when user types /article or pastes German text to create a new blog post. Drives the full multilingual authoring pipeline: mode selection, 5-section structure extraction, gap-filling dialogue in German, cultural adaptation, and Hugo file creation for DE/EN/TR.
---

# /article — Multilingual Content Authoring Pipeline

## Overview

When the user invokes `/article` (with or without pasted German text), run this pipeline exactly. Do not skip steps. Do not proceed to translation until the quality gate passes.

**Announce at start:** "Ich starte die Artikel-Pipeline. Gleich legen wir los."

---

## Step 0 — Mode Selection

Ask exactly this (in German):

> "Ist das ein **TECH**-Artikel (Technologie, Karriere, Systeme, Tools) oder ein **PHILOSOPHY**-Artikel (Mindset, Lebenssinn, Weltbild, Beobachtungen)?"

Wait for the answer. Store as `MODE = tech` or `MODE = philosophy`. This governs all subsequent steps.

---

## Step 1 — Receive German Text

If the user pasted text with `/article`, use that text.
If no text was pasted, ask:

> "Bitte füge deinen deutschen Text ein. Schreib frei — keine Struktur nötig."

---

## Step 2 — Extract 5-Section Structure

Read the German text and map it to these 5 sections:

| # | Section | What to look for |
|---|---------|-----------------|
| 1 | **Hook** | Opening sentence that names a phenomenon or problem |
| 2 | **Context** | Why this matters now / why relevant to the reader |
| 3 | **Core argument** | The main thesis or insight |
| 4 | **Exploration** | Examples, stories, evidence, deeper thinking |
| 5 | **So what** | Takeaway, call to reflection or action |

Mark each section as: ✓ solid / ⚠ thin / ✗ missing

---

## Step 3 — Quality Gate (Gap-Filling Dialogue)

For each section marked ⚠ or ✗, ask ONE targeted question in German. Wait for the answer. Integrate it. Then move to the next gap.

Do NOT ask multiple questions at once. Do NOT proceed to Step 4 until all 5 sections are ✓ solid.

**Quality criteria by MODE:**

### TECH
- Hook: names a concrete problem, gap, or observation in technology/work/systems
- Context: connects to a current trend, tool, or challenge readers face
- Core argument: one clear, actionable or falsifiable thesis
- Exploration: at least 2 concrete examples — real tools, systems, situations
- So what: practical — what should the reader do or think differently?

### PHILOSOPHY
- Hook: names a universal human phenomenon — specific and striking, not generic
- Context: names a concrete reason this phenomenon matters in life today
- Core argument: one clear insight or reframing — not a list
- Exploration: at least 2 stories, analogies, or references to thinkers/lived experience
- So what: reflective — invites the reader to sit with something, not just act

**Example gap-filling questions (TECH):**
- Hook thin: "Was ist das konkrete Problem, das du beobachtest? In einem Satz."
- Context missing: "Warum ist das gerade jetzt wichtig — was hat sich verändert?"
- Exploration thin: "Kannst du ein konkretes Beispiel nennen — ein Tool, ein System, eine Situation?"
- So what missing: "Was soll der Leser nach diesem Artikel anders machen oder denken?"

**Example gap-filling questions (PHILOSOPHY):**
- Hook thin: "Welches konkrete Phänomen beschreibst du — was hast du beobachtet oder erlebt?"
- Context missing: "Warum berührt dich das — was macht es relevant für andere Menschen heute?"
- Exploration thin: "Hast du eine Geschichte oder Analogie, die das veranschaulicht?"
- So what missing: "Was soll beim Leser hängen bleiben — welches Gefühl oder welcher Gedanke?"

---

## Step 4 — Structural Confirmation

Present the complete 5 sections back to the author in German:

```
Hier ist die Struktur deines Artikels:

✓ Hook: [extracted/refined text]
✓ Context: [extracted/refined text]
✓ Core argument: [extracted/refined text]
✓ Exploration: [extracted/refined text, summarized if long]
✓ So what: [extracted/refined text]

Alles gut? Dann generiere ich jetzt die drei Sprachversionen (DE, EN, TR).
```

Wait for confirmation (ja / yes / ok / gut). If the author requests changes, update the relevant section and re-confirm.

---

## Step 5 — Generate Title and Slug

Generate:
- German title (literary, not clickbait)
- English title (adapted for EN audience)
- Turkish title (adapted for TR audience)
- Slug: from German title, lowercase, hyphens, umlauts converted (ä→ae, ö→oe, ü→ue, ß→ss)

---

## Step 6 — Generate Three Language Versions

### DE version
- Stays close to the author's voice
- Light copyediting only: clarity, flow, grammar
- Tone: direct, structured, philosophical depth preserved

### EN version (cultural adaptation)
- Rewrite for English-speaking thought-leadership audience
- More conversational and reader-focused
- Active voice preferred
- Hook may be rewritten to land for EN readers
- **TECH:** Sharp, punchy, concrete — "here's what this means for you"
- **PHILOSOPHY:** Essayistic, warm, intellectually engaging

### TR version (cultural adaptation)
- Rewrite for native Turkish readers
- Warm, narrative, emotionally resonant
- Philosophical depth expressed through storytelling
- Formal enough for thought leadership, not academic
- **TECH:** Professional, precise, modern — "işte bu sizin için ne anlama geliyor"
- **PHILOSOPHY:** Akıcı, felsefi derinlikli, duygusal bağ kuran

For each version, also generate:
- `pullquote`: one key sentence from the core argument (in that language)
- `readtime`: estimated reading time (count words / 200)

---

## Step 7 — Create Hugo Files

Create all 3 files. Ask for series name and episode number first if not clear from the text:

> "Gehört dieser Artikel zu einer Serie? Wenn ja, wie heißt sie und welche Folge ist es?"

**File paths:**
```
content/de/blog/[slug].de.md
content/en/blog/[slug].en.md
content/tr/blog/[slug].tr.md
```

**Frontmatter template (fill in for each language):**
```yaml
---
title: "[title in this language]"
date: [today's date YYYY-MM-DD]
mode: [tech|philosophy]
series: "[series name if applicable, else omit]"
episode: [N, omit if no series]
readtime: "[X min]"
pullquote: "[key sentence in this language]"
tags: [[tag1, tag2]]
slug: "[shared-slug]"
---
```

Body: the culturally adapted article text in Markdown. Use blank lines between paragraphs. No headings inside the body — the 5-section structure flows as prose.

---

## Step 8 — Commit

```bash
git add content/de/blog/[slug].de.md content/en/blog/[slug].en.md content/tr/blog/[slug].tr.md
git commit -m "content: add [german title] (de/en/tr)"
```

Announce to the user:

> "Artikel erstellt und committed ✓
> - content/de/blog/[slug].de.md
> - content/en/blog/[slug].en.md
> - content/tr/blog/[slug].tr.md
>
> Jetzt `git push` eingeben, um live zu gehen."

---

## Red Flags — Never Do These

- Never generate EN/TR before the quality gate passes (all 5 sections ✓)
- Never ask multiple gap-filling questions at once
- Never skip the structural confirmation in Step 4
- Never use the same tone for TECH and PHILOSOPHY translations
- Never commit without all 3 language files
```

- [ ] **Step 3: Verify skill file exists and has correct frontmatter**

```bash
head -5 ~/.claude/skills/article/SKILL.md
```

Expected:
```
---
name: article
description: Use when user types /article ...
---
```

- [ ] **Step 4: Commit**

```bash
git add -f ~/.claude/skills/article/SKILL.md 2>/dev/null || echo "Skill file outside repo — no git add needed"
```

The skill file lives in `~/.claude/skills/` which is outside the Hugo repo. No git commit needed for this file — it is a local Claude Code skill.

---

## Task 5: Create AUTHORING.md guide

**Files:**
- Create: `AUTHORING.md`

- [ ] **Step 1: Create AUTHORING.md at repo root**

```markdown
# Authoring Guide

This guide explains how to write and publish a new article on mr.sgsz.

---

## How to write a new article

### 1. Write your text in German

Write freely — no template, no structure required. Use any tool you like:
- Apple Notes, Notion, Word
- Voice memo → transcribe
- Directly in a message to Claude

Your text can be raw thoughts, a draft, or a finished piece. The pipeline handles structuring.

### 2. Open Claude Code in this project

```bash
cd ~/My_X/x
claude
```

### 3. Trigger the article pipeline

Type `/article` and paste your German text:

```
/article

[paste your German text here]
```

### 4. Answer the mode question

Claude will ask: **TECH oder PHILOSOPHY?**

- **TECH** — technology, career, systems, tools, work
- **PHILOSOPHY** — mindset, worldview, observations, meaning

### 5. Complete the structure dialogue

Claude extracts 5 sections from your text and asks targeted questions in German for any gaps. Answer one at a time. The dialogue ends when all 5 sections are solid.

The 5 sections:
1. **Hook** — one striking sentence naming the phenomenon
2. **Context** — why this matters now
3. **Core argument** — your main thesis
4. **Exploration** — examples, stories, evidence
5. **So what** — what should the reader take away

### 6. Confirm the structure

Claude shows you the extracted structure. Say **ja** to proceed.

### 7. Claude generates and commits 3 language versions

- `content/de/blog/[slug].de.md` — German (your voice)
- `content/en/blog/[slug].en.md` — English (culturally adapted)
- `content/tr/blog/[slug].tr.md` — Turkish (culturally adapted)

### 8. Push to publish

```bash
git push
```

GitHub Actions deploys automatically. Live in ~2 minutes at https://x-talks.github.io/x/

---

## Content modes

Every article belongs to one of two modes, set via the `mode:` frontmatter field:

- `mode: tech` — appears in TECH view
- `mode: philosophy` — appears in PHILOSOPHY view

The pipeline sets this automatically based on your Step 4 answer.

---

## Content types

Articles go in `content/de/blog/`. The same pipeline applies to other content types with minor variations:
- Podcast entries → `content/de/podcast/`
- YouTube entries → `content/de/youtube/`
- Source references → `content/de/sources/`

For non-blog content, tell Claude the type when triggering: `/article podcast` or `/article source`.
```

- [ ] **Step 2: Commit**

```bash
git add AUTHORING.md
git commit -m "docs: add AUTHORING.md — step-by-step article creation guide"
```

---

## Task 6: Smoke test the full pipeline

- [ ] **Step 1: Verify Hugo builds cleanly**

```bash
hugo --buildDrafts 2>&1 | grep -E "ERROR|WARN|Built"
```

Expected: `Built in Xs` with no ERROR lines.

- [ ] **Step 2: Verify DE content renders**

```bash
hugo --buildDrafts && ls public/blog/
```

Expected: slugs for the migrated blog posts appear.

- [ ] **Step 3: Verify EN and TR sections exist in public output**

```bash
ls public/en/ && ls public/tr/
```

Expected: directories exist (may be empty — that's fine, no EN/TR content yet).

- [ ] **Step 4: Test /article skill manually**

Open Claude Code and type:
```
/article

Ich habe bemerkt, dass wir oft über Produktivität reden aber nie über die Qualität der Zeit die wir haben.
```

Expected: Claude asks TECH oder PHILOSOPHY?, then proceeds through the pipeline.

- [ ] **Step 5: Final commit if any cleanup needed**

```bash
git status
# If any uncommitted files remain:
git add [files]
git commit -m "chore: cleanup after pipeline setup"
```

- [ ] **Step 6: Push**

```bash
git push
```

Expected: GitHub Actions deploys successfully. Verify at https://x-talks.github.io/x/
