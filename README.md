# Master Blog

Live at **https://x-talks.github.io/x/**

Built with Hugo. Push to `main` → site rebuilds and deploys automatically (~11 seconds).

---

## Adding new content

Create a Markdown file in the right folder, fill in the frontmatter, write your content below the `---`, then push.

```bash
git add content/
git commit -m "Add: your title here"
git push https://github.com/x-talks/x.git main
```

---

### Blog article → `content/blog/<slug>.md`

```markdown
---
title: "Your Article Title"
date: 2026-06-24
series: "Daily"
episode: 2
readtime: "3 min"
pullquote: "Optional pull quote."
tags: [philosophy, observation]
---

Article body text here.
```

---

### Podcast episode → `content/podcast/<slug>.md`

```markdown
---
title: "Episode Title"
date: 2026-06-24
series: "Detrapped"
episode: 2
duration: "35 min"
audio_url: "https://spotify-cdn-url/episode.mp3"
tags: [productivity]
---

Episode description here.
```

Upload the audio file to **Spotify for Podcasters** first, then paste the audio URL here.

---

### YouTube entry → `content/youtube/<slug>.md`

```markdown
---
title: "Video Title"
date: 2026-06-24
series: "Shorts"
episode: 2
youtube_id: "YOUTUBE_VIDEO_ID"
duration: "90 sec"
tags: [video]
---

Video description here.
```

`youtube_id` = the part after `v=` in the YouTube URL (e.g. `youtube.com/watch?v=`**`dQw4w9WgXcQ`**`)

---

### Source / external link → `content/sources/<slug>.md`

```markdown
---
title: "Article or Book Title"
date: 2026-06-24
series: "Axioms"
url: "https://example.com/the-article"
tags: [systems]
---

Short description of what this source is about.
```

---

### About Me → edit `content/about/_index.md`

```markdown
---
title: "About Me"
profile_image: "resource/image/profile.png"
---

Your bio here.
```

---

## Frontmatter reference

| Field | Used in | Required | Notes |
|---|---|---|---|
| `title` | all | ✅ | Displayed as entry heading |
| `date` | all | ✅ | Format: `YYYY-MM-DD` |
| `series` | all | ✅ | e.g. "Daily", "Detrapped", "Shorts" |
| `episode` | blog, podcast, youtube | — | Episode or issue number |
| `tags` | all | — | Array: `[tag1, tag2]` |
| `readtime` | blog | — | e.g. "5 min" |
| `pullquote` | blog | — | Italic quote shown in sidebar |
| `image` | blog | — | Path: `resource/image/photo.jpg` |
| `audio_url` | podcast | — | Full URL to hosted audio file |
| `duration` | podcast, youtube | — | e.g. "42 min", "60 sec" |
| `youtube_id` | youtube | — | Video ID from YouTube URL |
| `url` | sources | — | Full URL to external source |

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
  css/style.css  # Editorial theme
  js/script.js   # Dark mode, nav, intro video
  resource/
    image/       # logo.png, profile.png, intro-thumb.webp
    video/       # intro.mp4
layouts/         # Hugo templates (edit to change site structure)
hugo.toml        # Site config (title, baseURL, RSS)
```
