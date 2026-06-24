# Content Templates & new-post.sh Design Spec
**Date:** 2026-06-24
**Status:** Approved

---

## 1. Goal

Two deliverables:
1. Full content template system — extended frontmatter schemas for all 5 content types, with multi-image/GIF support and inline blockquote styling for blog articles
2. `new-post.sh` — interactive CLI script that asks questions, generates the Markdown file, and auto-pushes to GitHub

---

## 2. Blog Article — Extended Schema

```markdown
---
title: ""           # The article headline shown on the page
date:               # Publication date in YYYY-MM-DD format
series: ""          # Series/category name (e.g. "Daily", "Phenomenons")
episode:            # Number within the series (1, 2, 3...)
readtime: ""        # Estimated reading time (e.g. "5 min")
pullquote: ""       # Hero quote shown in right sidebar
tags: []            # Topics for filtering (e.g. [philosophy, daily, focus])
images:             # List of images/GIFs (optional, can be omitted entirely)
  - src: ""         # Path relative to static/ folder
    caption: ""     # Caption below image (optional)
    position: ""    # top | bottom | inline-left | inline-right
---

Body text. Full Markdown supported.

> Inline blockquote — cite a source or emphasize a passage.
```

**Image positions:**
- `top` — full-width image above all body text
- `bottom` — full-width image below all body text
- `inline-left` — image floats left, text wraps right
- `inline-right` — image floats right, text wraps left

**Supported media in `images:`:** jpg, png, webp, gif — all treated identically.

**Inline blockquote:** standard Markdown `>` syntax, styled via CSS in `static/css/style.css`.

---

## 3. Podcast Episode Schema

```markdown
---
title: ""        # Episode title
date:            # YYYY-MM-DD
series: ""       # Show name (e.g. "Detrapped", "X-Talks")
episode:         # Episode number
duration: ""     # Runtime (e.g. "42 min")
audio_url: ""    # Full URL to hosted audio (from Spotify for Podcasters)
tags: []
---

Episode description. 2-3 sentences.
```

---

## 4. YouTube Entry Schema

```markdown
---
title: ""          # Video title
date:              # YYYY-MM-DD
series: ""         # Series name (e.g. "Shorts", "Essays")
episode:           # Episode number
duration: ""       # Video length (e.g. "60 sec", "12 min")
youtube_id: ""     # ID from youtube.com/watch?v=<ID>
tags: []
---

Video description.
```

---

## 5. Source / External Link Schema

```markdown
---
title: ""      # Title of the article, book or resource
date:          # YYYY-MM-DD (date you added it)
series: ""     # Your grouping (e.g. "Axioms", "Books", "Research")
url: ""        # Full URL to external source
tags: []
---

Why this source matters. Key insight. 2-4 sentences.
```

---

## 6. About Me Schema

```markdown
---
title: ""              # Page title (e.g. "About Me")
profile_image: ""      # Path to profile photo (e.g. "resource/image/profile.png")
---

Bio text. Full Markdown supported.
```

---

## 7. Template Changes Required

### layouts/partials/entry-blog.html
- Add support for `images` array with position rendering:
  - Before `.entry-cols`: render images where `position = "top"`
  - After `.entry-cols`: render images where `position = "bottom"`
  - Inside `.entry-body`: render `inline-left` and `inline-right` images via Hugo's `.Content` pipeline is not possible — instead render them as a pre-body block with float CSS classes
- Add caption rendering below each image

**Note on inline-left/inline-right:** Hugo renders Markdown body as HTML via `.Content` — we cannot inject images mid-text from frontmatter. Instead, `inline-left` and `inline-right` images are rendered as a floating block immediately before the body text, with CSS float applied. The body text wraps around them naturally.

### static/css/style.css
Add styles for:
- `.entry-image-caption` — small monospace text below image
- `.entry-image-inline-left` — float left, margin right, max-width ~40%
- `.entry-image-inline-right` — float right, margin left, max-width ~40%
- `.entry-body blockquote` — styled inline blockquote (left border, italic, indented)
- `.entry-image-wrap` — clearfix after floated images

---

## 8. new-post.sh — CLI Script

**Location:** `/Users/D069379/My_X/x/new-post.sh`
**Permissions:** executable (`chmod +x`)

### Flow

```
1. Ask: content type (blog / podcast / youtube / source / about)
2. Ask: title
   → auto-generate slug from title (lowercase, spaces→hyphens, strip special chars)
   → auto-set date = today (YYYY-MM-DD), never asked
3. Ask: series name
4. Ask: episode number
   → auto-suggest next number by counting existing files in the section folder
5. Ask: tags (comma-separated, optional — press Enter to skip)
6. Type-specific questions:
   blog     → readtime, pullquote (optional), images (loop: src, caption, position)
   podcast  → duration, audio_url
   youtube  → duration, youtube_id
   source   → url
   about    → skip (edit _index.md directly)
7. Ask: paste body text, type END on a new line when done
8. Write file to correct content/ folder
9. git add + git commit + git push
```

### Slug generation
- Lowercase entire title
- Replace spaces and special chars with hyphens
- Strip non-alphanumeric except hyphens
- Collapse multiple hyphens
- Example: "The quiet cost of — notifications!" → `the-quiet-cost-of-notifications`

### Auto-increment episode
- Count `.md` files in the target section folder
- Suggest `count + 1` as default
- User can override by typing a different number

### Image loop (blog only)
- After type-specific fields, ask: "Add an image? (y/n)"
- If yes: ask src, caption (optional), position (top/bottom/inline-left/inline-right)
- Ask: "Add another image? (y/n)" — repeat until no

### Body text input
- Print: "Paste your text below. Type END on a new line when finished:"
- Read lines until `END` is entered
- Store as body content

### Git push
- `git add content/<type>/<slug>.md`
- `git commit -m "Add <type>: <title>"`
- `git push https://github.com/x-talks/x.git main`
- Print success message with live URL

### Error handling
- If git push fails: print the file path so user can push manually
- If file already exists (same slug): warn and ask to overwrite or pick new slug

---

## 9. README Update

Replace current content templates section with the full annotated templates covering all 5 content types, with both description-only and real-value examples.
