# Master Blog

Live at **https://x-talks.github.io/x/**

Built with Hugo. Push to `main` → site rebuilds and deploys automatically (~11 seconds).

---

## Adding new content

The easiest way is the interactive script:

```bash
./new-post.sh
```

It asks you questions, generates the Markdown file, and pushes automatically.

Or create the file manually and push:

```bash
git add content/
git commit -m "Add: your title here"
git push https://github.com/x-talks/x.git main
```

---

## Content templates

### Blog article → `content/blog/<slug>.md`

**Description template (what each field means):**
```markdown
---
title: ""           # The article headline shown on the page
date:               # Publication date — format: YYYY-MM-DD
series: ""          # Series/category this belongs to — your own naming
                    # e.g. "Daily", "Phenomenons", "Essays"
episode:            # Number within the series — e.g. 1, 2, 3
readtime: ""        # Estimated reading time shown in meta — e.g. "5 min"
pullquote: ""       # One standout sentence shown in the right sidebar
                    # Leave empty or omit if not needed
tags: []            # Topics for filtering — e.g. [philosophy, daily, focus]
images:             # List of images or GIFs to include — omit if none
  - src: ""         # Path relative to static/ folder
                    # e.g. "resource/image/photo.jpg"
    caption: ""     # Text shown below the image — optional, can be empty
    position: ""    # Where image appears in the entry:
                    #   top          → full-width above all text
                    #   bottom       → full-width below all text
                    #   inline-left  → floats left, text wraps right
                    #   inline-right → floats right, text wraps left
---

Your article body text here. Full Markdown is supported:

> Inline blockquote — cite a source or emphasize a passage mid-text.

**Bold**, *italic*, [link text](https://example.com)

- bullet list item
- another item

## Subheading inside article
```

**Example with real values:**
```markdown
---
title: "The quiet cost of constant notifications"
date: 2026-06-24
series: "Daily"
episode: 3
readtime: "4 min"
pullquote: "Every interruption is a small death of thought."
tags: [focus, technology, daily]
images:
  - src: "resource/image/desk.jpg"
    caption: "My desk at 6am before the phone turns on."
    position: "top"
  - src: "resource/image/attention.gif"
    caption: "Attention recovery time after a single notification."
    position: "inline-right"
---

There is a specific kind of exhaustion that comes not from doing too much,
but from being interrupted too often.

> "The cost of an interruption is not the interruption itself —
> it is the 23 minutes it takes to return to deep focus." — Gloria Mark

We have optimised our tools for reach and ignored the cost to the receiver.
```

---

### Podcast episode → `content/podcast/<slug>.md`

**Description template:**
```markdown
---
title: ""        # Episode title shown on the page
date:            # Publication date — format: YYYY-MM-DD
series: ""       # Podcast show name — e.g. "Detrapped", "X-Talks"
episode:         # Episode number within the series — e.g. 1, 2, 3
duration: ""     # Total runtime shown in meta — e.g. "42 min"
audio_url: ""    # Full URL to the hosted audio file
                 # Upload to Spotify for Podcasters first, then paste URL here
tags: []         # Topics — e.g. [productivity, work, mindset]
---

Episode description. What is this episode about?
What will the listener learn or experience? 2-3 sentences.
```

**Example with real values:**
```markdown
---
title: "Why rest is not the opposite of work"
date: 2026-06-24
series: "Detrapped"
episode: 2
duration: "38 min"
audio_url: "https://anchor.fm/s/abc123/podcast/play/episode2.mp3"
tags: [rest, productivity, burnout]
---

We talk about rest as recovery — something you earn after output.
But what if rest is where the actual thinking happens?
This episode explores the neuroscience of doing nothing.
```

---

### YouTube entry → `content/youtube/<slug>.md`

**Description template:**
```markdown
---
title: ""          # Video title shown on the page
date:              # Publication date — format: YYYY-MM-DD
series: ""         # Series name — e.g. "Shorts", "Essays", "Vlogs"
episode:           # Number within the series — e.g. 1, 2, 3
duration: ""       # Video length shown in meta — e.g. "60 sec", "12 min"
youtube_id: ""     # The video ID from the YouTube URL
                   # youtube.com/watch?v=dQw4w9WgXcQ → youtube_id: dQw4w9WgXcQ
tags: []           # Topics — e.g. [video, stillness, nature, urban]
---

Short description of the video.
What will the viewer see or experience?
```

**Example with real values:**
```markdown
---
title: "One minute in a market at dawn"
date: 2026-06-24
series: "Shorts"
episode: 2
duration: "60 sec"
youtube_id: "xvFZjo5PgG0"
tags: [video, observation, urban]
---

No narration. No music. Just the sounds and movement of a market
waking up before the city does.
```

---

### Source / external link → `content/sources/<slug>.md`

**Description template:**
```markdown
---
title: ""      # Title of the article, book, paper or resource
date:          # Date you added it — format: YYYY-MM-DD
               # (not the original publication date)
series: ""     # Your own grouping — e.g. "Axioms", "Books", "Research", "Tools"
url: ""        # Full URL to the external source
tags: []       # Topics — e.g. [systems, philosophy, science, design]
---

Why does this source matter?
What is the key insight or idea?
What made you save it? 2-4 sentences.
```

**Example with real values:**
```markdown
---
title: "The Paradox of Choice — Barry Schwartz"
date: 2026-06-24
series: "Books"
url: "https://www.ted.com/talks/barry_schwartz_the_paradox_of_choice"
tags: [psychology, decision-making, freedom]
---

More options do not make us freer — they make us more anxious and less satisfied.
Schwartz argues that the abundance of choice in modern life is a primary source
of unhappiness. Essential reading for anyone designing products or systems.
```

---

### About Me → edit `content/about/_index.md`

**Description template:**
```markdown
---
title: ""              # Page title — e.g. "About Me"
profile_image: ""      # Path to your profile photo
                       # e.g. "resource/image/profile.png"
---

Your bio. No rules — any length, any style.
Full Markdown supported: bold, italic, links, lists, blockquotes, headings.
```

**Example with real values:**
```markdown
---
title: "About Me"
profile_image: "resource/image/profile.png"
---

I'm a writer, podcaster and occasional filmmaker based in Berlin.

I make things about **attention, systems and the texture of everyday life** —
the kind of observations that feel obvious once named, and invisible until then.

- **Master Blog** — daily writing and photo essays
- **Detrapped** — a podcast about escaping bad mental models
- **X-Talks** — long conversations with people at the edge of the map

[Say hello →](mailto:you@yourdomain.com)
```

---

## Frontmatter reference

| Field | Used in | Required | Notes |
|---|---|---|---|
| `title` | all | ✅ | Displayed as entry heading |
| `date` | all | ✅ | Format: `YYYY-MM-DD` |
| `series` | all | ✅ | Your own series/category name |
| `episode` | blog, podcast, youtube | — | Number within the series |
| `tags` | all | — | Array: `[tag1, tag2]` |
| `readtime` | blog | — | e.g. `"5 min"` |
| `pullquote` | blog | — | Hero quote in right sidebar |
| `images` | blog | — | Array of image objects (see below) |
| `images[].src` | blog | — | Path from `static/`: `"resource/image/photo.jpg"` |
| `images[].caption` | blog | — | Text below image, can be empty |
| `images[].position` | blog | — | `top` / `bottom` / `inline-left` / `inline-right` |
| `audio_url` | podcast | — | Full URL to hosted audio file |
| `duration` | podcast, youtube | — | e.g. `"42 min"`, `"60 sec"` |
| `youtube_id` | youtube | — | Video ID from YouTube URL |
| `url` | sources | — | Full URL to external source |
| `profile_image` | about | — | Path to profile photo |

---

## Project structure

```
content/
  blog/          # Text articles and photo essays
  podcast/       # Podcast episodes
  youtube/       # YouTube video entries
  sources/       # External reference links
  about/         # About Me page (_index.md)
static/
  css/style.css  # Editorial theme — edit to change fonts, colors, layout
  js/script.js   # Dark mode, nav, intro video
  resource/
    image/       # logo.png, profile.png, intro-thumb.webp + your images
    video/       # intro.mp4
layouts/         # Hugo templates — edit to change site structure
hugo.toml        # Site config (title, baseURL, RSS settings)
new-post.sh      # Interactive script to create new posts
```
