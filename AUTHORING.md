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
