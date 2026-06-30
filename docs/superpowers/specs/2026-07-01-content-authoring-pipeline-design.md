# Content Authoring Pipeline — Design Spec

**Date:** 2026-07-01
**Status:** Approved
**Scope:** System 1 — Multilingual content authoring workflow (DE → EN + TR)

---

## Goal

A pipeline that lets the author write freely in German, guided to a complete 5-section structure, then automatically generates culturally adapted English and Turkish versions as Hugo multilingual content files — triggered by a single `/article` command in Claude Code. Supports both TECH and PHILOSOPHY use cases, with mode-aware tone, section emphasis, and language register.

---

## Architecture

### Hugo Multilingual Setup

Hugo's native i18n with `de` as the source language. All content organized under language subdirectories:

```
content/
  de/
    blog/
    podcast/
    youtube/
    sources/
    about/
  en/
    blog/
    podcast/
    youtube/
    sources/
    about/
  tr/
    blog/
    podcast/
    youtube/
    sources/
    about/
```

Language configuration in `hugo.toml`:
- `de` — German (default/source language)
- `en` — English
- `tr` — Turkish

Clean URLs per language: `/de/blog/post-slug`, `/en/blog/post-slug`, `/tr/blog/post-slug`

### File Naming Convention

```
slug.de.md   — German source (authored)
slug.en.md   — English (generated, culturally adapted)
slug.tr.md   — Turkish (generated, culturally adapted)
```

Slug is derived from the German title: lowercase, hyphens, no umlauts (ä→ae, ö→oe, ü→ue, ß→ss).

---

## The 5-Section Article Structure

Every article must contain all 5 sections before translation proceeds:

| # | Section | Purpose | Typical length |
|---|---------|---------|----------------|
| 1 | **Hook** | One striking sentence naming the phenomenon | 1–2 sentences |
| 2 | **Context** | Why this matters now, why relevant to the reader | 2–4 sentences |
| 3 | **Core argument** | The main thesis or insight | 1 paragraph |
| 4 | **Exploration** | Evidence, stories, examples, deeper thinking | 2–4 paragraphs |
| 5 | **So what** | Takeaway, call to reflection or action | 1–2 sentences |

---

## The `/article` Workflow

### Trigger
User types `/article` followed by (or followed by a paste of) their German text in Claude Code.

### Step 0 — Mode selection
Before any processing, Claude asks: **TECH oder PHILOSOPHY?**

The answer determines tone, quality criteria, and translation register throughout the entire pipeline:

| Aspect | TECH | PHILOSOPHY |
|--------|------|------------|
| Hook | Concrete problem or observation | Striking universal phenomenon |
| Core argument | Clear, falsifiable thesis | Reflective insight or reframing |
| Exploration | Data, examples, systems, tools | Stories, analogies, thinkers, lived experience |
| So what | Actionable, practical | Reflective, invites contemplation |
| EN tone | Sharp, thought-leadership, direct | Essayistic, warm, intellectual |
| TR tone | Professional, precise, modern | Narrative, philosophical, emotionally resonant |

The chosen mode is written into `mode: tech` or `mode: philosophy` in all 3 generated files — enabling Hugo's existing mode-switching filter automatically.

### Step 1 — Extract structure
Claude reads the German text and maps content to the 5 sections. Identifies which sections are present, complete, or missing/thin.

### Step 2 — Gap-filling dialogue (Quality Gate)
For each missing or thin section, Claude asks targeted questions **in German** to help the author develop it. This is a dialogue — not a form. Claude asks one question at a time, receives the answer, integrates it, and moves to the next gap.

The dialogue continues until all 5 sections are solid. Claude does not proceed to translation until the quality gate passes.

**Quality criteria per section (TECH):**
- Hook: names a concrete problem, gap, or observation in technology/work/systems
- Context: connects to a current trend, tool, or challenge readers face
- Core argument: one clear, falsifiable or actionable thesis
- Exploration: at least 2 concrete examples — real tools, systems, situations
- So what: practical — what should the reader do or think differently?

**Quality criteria per section (PHILOSOPHY):**
- Hook: specific and striking — names a universal human phenomenon
- Context: names a concrete reason this phenomenon matters in life today
- Core argument: one clear, defensible insight or reframing — not a list
- Exploration: at least 2 stories, analogies, or references to thinkers/lived experience
- So what: reflective — invites the reader to sit with something, not just act

### Step 3 — Structural confirmation
Claude presents the extracted 5 sections back to the author for a quick confirmation before generating translations:

```
✓ Hook: [extracted text]
✓ Context: [extracted text]
✓ Core argument: [extracted text]
✓ Exploration: [extracted text]
✓ So what: [extracted text]

Alles gut? Dann generiere ich jetzt EN und TR.
```

### Step 4 — Cultural adaptation and translation

**German (DE)** — the source. Stays as written (lightly copyedited for clarity).

**English (EN)** — culturally adapted:
- More conversational and reader-focused
- Punchy, thought-leadership tone
- Active voice preferred
- Hook rewritten for English-speaking audience if needed

**Turkish (TR)** — culturally adapted:
- Warm, narrative, emotionally resonant
- Flows naturally for native Turkish readers
- Philosophical depth preserved but expressed through storytelling
- Formal enough for thought leadership, not academic

### Step 5 — File creation and commit
Claude creates all 3 language files with proper frontmatter and commits:

```
content/de/blog/slug.de.md
content/en/blog/slug.en.md
content/tr/blog/slug.tr.md
```

Commit message: `content: add [title] (de/en/tr)`

---

## Frontmatter Structure

Every article file (all 3 languages) contains:

```yaml
---
title: "[Title in that language]"
date: YYYY-MM-DD
mode: tech | philosophy
series: "[Series name if applicable]"
episode: N
readtime: "X min"
pullquote: "[Key sentence from core argument, in that language]"
tags: [tag1, tag2]
slug: "[shared-slug-across-languages]"
---
```

The `slug` field is identical across all 3 files to enable language switching links.

---

## Authoring Guide (AUTHORING.md)

A guide committed to the repo root explaining:

1. Write your German text anywhere (Notes, Word, phone, wherever)
2. Open Claude Code in the project directory
3. Type `/article` and paste your German text
4. Answer: TECH or PHILOSOPHY?
5. Answer Claude's questions until all 5 sections are complete
6. Confirm the structure
7. Claude generates and commits all 3 language files
8. Push: `git push` → auto-deploys to GitHub Pages

---

## Hugo Configuration Changes

`hugo.toml` needs:
- `defaultContentLanguage = "de"`
- Language entries for `de`, `en`, `tr` with titles and locale
- `contentDir` per language pointing to `content/[lang]`

Existing content (currently in `content/`) migrated to `content/de/` as part of implementation.

---

## Constraints

- No npm, no build tools, no external dependencies — pure Hugo + Claude Code
- Existing entries (2 blog, 2 podcast, 1 youtube, 1 source) migrated to `content/de/` with `lang: de` added to frontmatter
- Translations of existing entries are optional — only new entries go through the full pipeline
- The `/article` skill lives in `~/.claude/skills/article/SKILL.md`

---

## Out of Scope (System 2 — later)

- Content enrichment: YouTube videos, podcast recommendations, book suggestions, quotes
- Author/philosopher preference lists
- Automated media companion generation
