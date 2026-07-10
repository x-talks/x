# HeyGen Avatar Video Integration — Design Spec
Date: 2026-07-11

## Overview

Integrate AI-generated avatar videos (via HeyGen) into the blog in two forms:
1. **Homepage intro** — language-aware replacement/addition to the existing `intro.mp4`
2. **Article teasers** — per-article avatar clips surfaced in the list view and on the article page

---

## File Naming Convention

All videos live in `static/resource/video/` and follow the pattern:

```
{name}-{lang}.mp4
```

Examples:
```
intro-de.mp4
intro-en.mp4
intro-tr.mp4
my-article-slug-de.mp4
my-article-slug-en.mp4
my-article-slug-tr.mp4
```

### Fallback Rule

JS reads `document.documentElement.lang` (set by Hugo on `<html lang="">`), attempts `{name}-{lang}.mp4` first. If that file returns 404, it tries the other two languages in order `de → en → tr` and uses the first that exists. This means publishing a single language version automatically works for all three.

---

## 1. Homepage Intro — Language-Aware

### Current state
`baseof.html` has a fixed intro overlay. `script.js` hard-codes `resource/video/intro.mp4`.

### Change
JS resolves the intro path dynamically:
```js
const lang = document.documentElement.lang || 'de';
const candidates = [lang, 'de', 'en', 'tr'].filter((v, i, a) => a.indexOf(v) === i);
// try each: intro-de.mp4, intro-en.mp4, intro-tr.mp4
```

### Language badge (fallback indicator)
- If the resolved language differs from the page language → show a small badge below the play button: `DE` (or whichever language)
- Badge styled: `font-family:monospace; font-size:0.55rem; letter-spacing:0.15em; color:rgba(255,255,255,0.5); border:1px solid rgba(255,255,255,0.2); padding:0.15rem 0.5rem`
- Badge is hidden when the video language matches the page language

---

## 2. Article Teasers — List View (theme-aware)

Hugo partial `layouts/partials/entry-blog.html` checks for a video parameter in front matter:

```yaml
# article front matter
video_teaser: true   # signals a teaser exists; actual file resolved by JS
```

When `video_teaser: true`, a `data-video-slug` attribute is added to the entry element. JS resolves `{slug}-{lang}.mp4` using the same fallback rule.

### Per-theme treatment

**Editorial theme (default)**
Portrait thumbnail rendered inside the existing `.entry-aside` right column:
- Dark `9:16` thumbnail, max-width 70px
- White play circle overlay
- Duration label bottom-right: `0:32`
- `▶ TEASER` label below thumbnail

**Swiss theme**
Compact portrait pill beside the title in the metadata column:
- Dark `52×72px` thumbnail, border-radius 3px
- White play circle overlay
- Duration below: `0:32`

**Magazine theme**
Text-only play button below the excerpt:
- Monospace inline button: `▶ WATCH TEASER · 0:32`
- Border: `1px solid #000`
- No thumbnail

### Behavior on click
All three: lazy-load video element, play inline inside the entry. On end/click-outside → remove video, restore thumbnail state. Same pattern as existing intro video.

---

## 3. Article Teasers — Article Page

Hugo single template `layouts/_default/single.html` renders a teaser strip when `video_teaser: true`:

```html
<!-- between .entry-meta and article body -->
<div class="article-teaser" data-video-slug="{{ .Slug }}">
  <div class="article-teaser-thumb"><!-- play icon --></div>
  <div class="article-teaser-info">
    <span class="article-teaser-label">Avatar intro</span>
    <span class="article-teaser-duration"><!-- set by JS after probe --></span>
    <span class="article-teaser-desc">Watch a short intro to this article before reading.</span>
  </div>
</div>
```

Styled as a compact horizontal strip:
- Background: `#f9f9f9` (dark mode: `#1a1a1a`)
- Border: `1px solid #ddd`
- Thumbnail: `48×64px` dark block with play icon
- Clicking plays video fullscreen overlay (same fixed overlay pattern as homepage intro)

---

## 4. HeyGen Automation

### Script: `scripts/generate-teaser.sh`

```
Usage: ./scripts/generate-teaser.sh <article-slug> [--force]
```

**Behavior:**
1. Check if `static/resource/video/{slug}-de.mp4` (and en, tr) already exist → skip unless `--force`
2. Read script from `content/de/blog/{slug}.md` front matter field `teaser_script` (or auto-extract first paragraph if absent)
3. Translate script to en + tr via Claude API (or accept manual translations as separate front matter fields)
4. Call HeyGen API for each language with the avatar ID from `.env`
5. Poll for completion (HeyGen is async)
6. Download MP4s to `static/resource/video/`

**Environment variables (`.env`, gitignored):**
```
HEYGEN_API_KEY=...
HEYGEN_AVATAR_ID=...
HEYGEN_VOICE_ID_DE=...
HEYGEN_VOICE_ID_EN=...
HEYGEN_VOICE_ID_TR=...
```

### `/article` skill integration

At the end of the article creation pipeline, after files are committed:

```
Article created: content/de/blog/my-slug.md

Generate HeyGen teaser videos? (de/en/tr)
  [y] Generate now  [s] Skip  [m] Manual — videos already in resource/video/
```

- `y` → runs `scripts/generate-teaser.sh {slug}`
- `s` → skips, sets `video_teaser: false` in front matter
- `m` → sets `video_teaser: true`, assumes files are already placed

### Manual path (no script needed)
Place files directly:
```
static/resource/video/my-article-slug-de.mp4
```
Set `video_teaser: true` in front matter. Done.

---

## 5. Hugo Front Matter Fields

```yaml
---
title: "The Architecture of the Everyday"
date: 2024-03-15
video_teaser: true          # renders teaser UI; false or absent = no video UI
teaser_script: "..."        # optional: script used for HeyGen generation
teaser_duration: "0:32"     # optional: shown in UI before video loads
---
```

---

## Out of Scope

- Hosting videos on CDN (GitHub Pages serves from `static/` directly for now)
- Video analytics / play tracking
- Subtitles / captions
- Auto-generating teaser scripts via AI (manual or first-paragraph extraction only)
