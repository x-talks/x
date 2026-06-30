# Dual-Mode Page Design

## Overview

The site serves two distinct audiences and purposes:

- **Tech** — technological thought leadership, career, and projects
- **Philosophy** — philosophical journey, mindset, and worldview

Both modes share the same page, sections, and visual themes. A toggle in the header switches between them instantly. The design is intentionally future-proof: each mode can become its own standalone page with minimal effort.

## Toggle

A slash-style toggle sits in the header, directly after the logo and site title:

```
mr.sgsz   TECH / PHILOSOPHY   [nav links]
```

- Active mode: bold + underlined
- Inactive mode: grey, clickable
- Clicking switches mode instantly (no page reload)
- Selected mode persists in `localStorage`
- Default on first visit: `tech`

## Content Model

Each content file gets a `mode` field in its frontmatter:

```yaml
---
title: "On the nature of daily phenomena"
mode: philosophy
---
```

Valid values: `tech`, `philosophy`. Every content file must have exactly one mode — content does not belong to both.

## Filtering Behaviour

When the user switches mode:

- Only entries matching the current mode are shown
- Entries not matching the current mode are hidden (`display: none`)
- Sections (Blog, Podcast, YouTube, Sources, About Me) with zero visible entries hide entirely
- The About Me section is shown in both modes (no mode tag required)
- Filtering happens client-side in JavaScript — no page reload

## Sections

The same five sections are used for both modes:

| Section | Tech examples | Philosophy examples |
|---------|--------------|---------------------|
| Blog | Engineering posts, career reflections | Essays, mindset pieces |
| Podcast | Tech conversations | Philosophical dialogues |
| YouTube | Talks, demos | Reflections, universe |
| Sources | Papers, tools, links | Books, thinkers, influences |
| About Me | Shared — shown in both modes | Shared — shown in both modes |

## Hugo Templates

Hugo renders all content at build time. Mode filtering is purely client-side:

- The `mode` frontmatter field is rendered as a `data-mode` attribute on each `.entry` element
- JavaScript reads `data-mode` and shows/hides entries on toggle
- No Hugo template changes needed for new content — just add `mode:` to frontmatter

## Implementation Scope

**In scope:**
- Add `mode` frontmatter field to all existing content files
- Render `data-mode="..."` on `.entry` elements in Hugo partials
- Add `TECH / PHILOSOPHY` toggle HTML to `baseof.html` header
- Add toggle CSS to `style.css` (slash style, matches editorial aesthetic)
- Add toggle + filtering JavaScript to `script.js`
- About Me section always visible regardless of mode

**Out of scope:**
- Separate URLs per mode
- Different visual themes per mode
- Renaming "Sources" to "Readings" for philosophy mode
- Any server-side filtering

## Future Split

When the time comes to split into two separate pages:

1. Create two Hugo sites (or two content directories)
2. Copy content tagged `mode: tech` to one, `mode: philosophy` to the other
3. Remove the toggle — each site is single-mode
4. No structural or template changes needed beyond that
