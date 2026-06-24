# Hugo Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the Master Blog from a monolithic `index.html` to a Hugo static site, preserving the editorial theme exactly, with automatic GitHub Actions deployment and RSS feed support for podcasts.

**Architecture:** Hugo reads Markdown content files with YAML frontmatter and renders them through Go HTML templates that replicate the current editorial theme. GitHub Actions installs Hugo and builds the site on every push to `main`, deploying the generated `public/` folder to GitHub Pages. All work happens on a `hugo-migration` branch until verified, then merged to `main`.

**Tech Stack:** Hugo (latest binary via peaceiris/actions-hugo), GitHub Actions, GitHub Pages, vanilla CSS/JS (no changes to styling logic)

---

## File Map

### Created
- `hugo.toml` — Hugo site configuration
- `layouts/_default/baseof.html` — base shell (header, nav, intro overlay, footer)
- `layouts/index.html` — homepage template (all sections combined)
- `layouts/_default/list.html` — section index pages (/blog/, /podcast/, etc.)
- `layouts/_default/single.html` — individual post page
- `layouts/partials/entry-blog.html` — blog entry partial
- `layouts/partials/entry-podcast.html` — podcast entry partial
- `layouts/partials/entry-youtube.html` — youtube entry partial
- `layouts/partials/entry-source.html` — source/reference entry partial
- `static/css/style.css` — extracted from inline styles in index.html
- `static/js/script.js` — extracted from inline scripts in index.html
- `content/blog/on-the-nature-of-daily-phenomena.md`
- `content/blog/the-architecture-of-the-everyday.md`
- `content/podcast/escaping-the-productivity-trap.md`
- `content/podcast/conversations-at-the-edge-of-the-map.md`
- `content/youtube/60-seconds-on-stillness.md`
- `content/sources/systems-dont-think-people-do.md`
- `content/about/_index.md`
- `.github/workflows/static.yml` — replaced with Hugo build+deploy workflow

### Deleted after merge
- `index.html` — replaced by Hugo templates + content
- `css/style.css` — legacy, already superseded
- `js/script.js` — legacy, already superseded

### Preserved as-is (copied to static/)
- `resource/image/logo.png` → `static/resource/image/logo.png`
- `resource/image/profile.png` → `static/resource/image/profile.png`
- `resource/image/intro-thumb.webp` → `static/resource/image/intro-thumb.webp`
- `resource/video/intro.mp4` → `static/resource/video/intro.mp4`

---

## Task 1: Create branch and Hugo skeleton

**Files:**
- Create: `hugo.toml`

- [ ] **Step 1: Create the migration branch**

```bash
git checkout -b hugo-migration
```

- [ ] **Step 2: Create Hugo configuration file**

Create `hugo.toml` at the project root:

```toml
baseURL = "https://x-talks.github.io/x/"
languageCode = "en-us"
title = "Master Blog"

[outputs]
  home = ["HTML"]
  section = ["HTML", "RSS"]

[taxonomies]
  tag = "tags"

[params]
  description = "Master Blog — daily observations, podcast, video"
```

- [ ] **Step 3: Create required Hugo directory structure**

```bash
mkdir -p layouts/_default layouts/partials static/css static/js static/resource/image static/resource/video content/blog content/podcast content/youtube content/sources content/about
```

- [ ] **Step 4: Commit skeleton**

```bash
git add hugo.toml layouts/ static/ content/
git commit -m "Add Hugo skeleton: config, directory structure"
```

---

## Task 2: Copy assets to static/

**Files:**
- Copy: `resource/image/` → `static/resource/image/`
- Copy: `resource/video/` → `static/resource/video/`

- [ ] **Step 1: Copy all image and video assets**

```bash
cp resource/image/logo.png static/resource/image/logo.png
cp resource/image/profile.png static/resource/image/profile.png
cp resource/image/intro-thumb.webp static/resource/image/intro-thumb.webp
cp resource/video/intro.mp4 static/resource/video/intro.mp4
```

- [ ] **Step 2: Verify files copied**

```bash
ls static/resource/image/ static/resource/video/
```

Expected output:
```
static/resource/image/:
intro-thumb.webp  logo.png  profile.png

static/resource/video/:
intro.mp4
```

- [ ] **Step 3: Commit**

```bash
git add static/resource/
git commit -m "Copy assets to static/resource/"
```

---

## Task 3: Extract CSS and JS to static files

**Files:**
- Create: `static/css/style.css`
- Create: `static/js/script.js`

- [ ] **Step 1: Create static/css/style.css**

Extract everything between `<style>` and `</style>` from `index.html` (lines 9–346) into `static/css/style.css`. The full content:

```css
/* ── Reset ── */
*, *::before, *::after { box-sizing: border-box; }

body {
  font-family: Georgia, serif;
  background: #fff;
  color: #000;
  margin: 0;
  padding: 0;
  line-height: 1.6;
}

/* ── Dark mode ── */
body.dark { background: #0d0d0d; color: #e8e8e8; }
body.dark header { border-color: #333; }
body.dark section h2 { border-color: #333; }
body.dark .entry-tag { border-color: #e8e8e8; }
body.dark .entry-aside { border-color: #e8e8e8; }
body.dark .entry-divider { background: #333; }
body.dark article p { color: #bbb; }
body.dark .logo-placeholder { filter: invert(1); }
body.dark #dark-btn { color: #e8e8e8; border-color: #555; }
body.dark nav a { color: #e8e8e8; }
body.dark .format-badge { border-color: #555; color: #aaa; }

/* ── Header ── */
header {
  border-bottom: 3px solid #000;
  padding: clamp(1rem, 3vw, 1.5rem) clamp(1rem, 5vw, 2rem);
  display: flex;
  align-items: center;
  gap: clamp(0.75rem, 2vw, 1.5rem);
  flex-wrap: wrap;
}

.logo-placeholder {
  width: clamp(40px, 8vw, 70px);
  height: auto;
  display: block;
  transition: filter 0.3s ease;
}

header h1 {
  font-family: monospace;
  font-size: clamp(1.4rem, 4vw, 2.2rem);
  letter-spacing: -0.02em;
  font-weight: bold;
  line-height: 1;
}

/* ── Nav ── */
nav { margin-left: auto; display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; justify-content: flex-end; }

nav a {
  font-family: monospace;
  font-size: clamp(0.7rem, 1.8vw, 0.8rem);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  text-decoration: none;
  color: #000;
  padding: 0.2rem 0;
  border-bottom: 2px solid transparent;
  transition: border-color 0.15s;
}
nav a:hover { border-color: #000; }
body.dark nav a:hover { border-color: #e8e8e8; }

/* Hamburger */
#nav-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.4rem;
  font-family: monospace;
  line-height: 1;
  color: inherit;
  padding: 0.25rem;
}

@media (max-width: 540px) {
  #nav-toggle { display: block; }
  #nav-list {
    display: none;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    position: absolute;
    top: calc(100% + 0.5rem);
    right: 1rem;
    background: #fff;
    border: 1px solid #ccc;
    padding: 1rem 2rem;
    z-index: 100;
    white-space: nowrap;
  }
  body.dark #nav-list { background: #0d0d0d; border-color: #333; }
  #nav-list.open { display: flex; }
  #nav-list a { margin-left: 0; }
  nav { position: relative; }
}

/* Dark mode toggle button */
#dark-btn {
  background: none;
  border: 1px solid #ccc;
  font-family: monospace;
  font-size: 0.7rem;
  cursor: pointer;
  padding: 0.2rem 0.5rem;
  color: #000;
  letter-spacing: 0.08em;
  margin-left: 0.5rem;
  transition: background 0.15s;
}
#dark-btn:hover { background: #f0f0f0; }
body.dark #dark-btn:hover { background: #1a1a1a; }

/* ── Main layout ── */
main {
  max-width: 960px;
  margin: 2rem auto;
  padding: 0 clamp(1rem, 5vw, 2rem);
}

section { margin-bottom: 3rem; }

section h2 {
  font-family: monospace;
  border-bottom: 1px solid #000;
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem;
  cursor: pointer;
  font-size: clamp(0.85rem, 3vw, 1rem);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  font-weight: normal;
}

/* ── Entry structure ── */
.entry { margin-bottom: 2.5rem; padding-bottom: 2rem; border-bottom: 1px solid #ddd; }
body.dark .entry { border-color: #222; }

.entry-tag {
  font-family: monospace;
  font-size: 0.58rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  border-bottom: 2px solid #000;
  padding-bottom: 0.2rem;
  display: inline-block;
  margin-bottom: 0.75rem;
}

.entry-title {
  font-family: Georgia, serif;
  font-size: clamp(1.2rem, 3.5vw, 1.8rem);
  line-height: 1.15;
  margin-bottom: 0.3rem;
  font-weight: normal;
}

.entry-meta {
  font-family: monospace;
  font-size: 0.6rem;
  color: #888;
  letter-spacing: 0.12em;
  margin-bottom: 0.85rem;
}

.entry-cols {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 600px) {
  .entry-cols { grid-template-columns: 1fr; }
  .entry-aside { border-left: none !important; border-top: 1px solid #ccc; padding-left: 0 !important; padding-top: 0.5rem; margin-top: 0.5rem; }
  body.dark .entry-aside { border-color: #333; }
}

.entry-body {
  font-family: Georgia, serif;
  font-size: clamp(0.82rem, 2vw, 0.92rem);
  line-height: 1.75;
}

.entry-body p { margin-bottom: 0.6rem; }

.entry-aside {
  border-left: 2px solid #000;
  padding-left: 0.85rem;
  font-size: 0.78rem;
}

.pull-quote {
  font-family: Georgia, serif;
  font-style: italic;
  font-size: clamp(0.95rem, 2.5vw, 1.15rem);
  line-height: 1.35;
  margin-bottom: 0.5rem;
}

.format-badge {
  display: inline-block;
  font-family: monospace;
  font-size: 0.55rem;
  letter-spacing: 0.15em;
  border: 1px solid #ccc;
  padding: 0.1rem 0.4rem;
  margin-left: 0.4rem;
  vertical-align: middle;
}

/* ── Media in entries ── */
.entry-image {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  filter: grayscale(1);
  margin-bottom: 0.75rem;
  display: block;
}

.entry-embed {
  width: 100%;
  aspect-ratio: 16/9;
  border: none;
  margin-bottom: 0.75rem;
  display: block;
}

.entry-audio {
  width: 100%;
  margin-bottom: 0.75rem;
  filter: grayscale(1);
  display: block;
}
body.dark .entry-audio { filter: invert(1) grayscale(1); }

.entry-link {
  font-family: monospace;
  font-size: 0.78rem;
  text-decoration: underline;
  color: inherit;
  display: inline-block;
  margin-top: 0.25rem;
}

/* ── Profile image ── */
.profile-image { width: clamp(60px, 15vw, 120px); height: auto; max-width: 100%; filter: grayscale(1); }

/* ── Intro overlay ── */
#intro-container {
  position: fixed;
  inset: 4vh 4vw;
  border-radius: clamp(8px, 1.5vw, 16px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  overflow: hidden;
  transition: opacity 0.6s ease, filter 0.6s ease, transform 0.6s ease;
  box-shadow: 0 8px 40px rgba(0,0,0,0.45);
}

body.intro-active { overflow: hidden; }

#intro-container.hide-animation {
  opacity: 0;
  filter: blur(20px);
  transform: translateX(-40%);
  pointer-events: none;
}

#intro-bg {
  position: absolute;
  inset: -10%;
  width: 120%;
  height: 120%;
  object-fit: cover;
  filter: blur(30px) brightness(0.35);
}

#intro-thumbnail {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: blur(8px);
  transition: opacity 0.5s ease;
}

#play-btn {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(0.6rem, 2vw, 1rem);
  transition: opacity 0.3s ease;
}

#play-btn svg {
  width: clamp(56px, 10vw, 96px);
  height: clamp(56px, 10vw, 96px);
  filter: drop-shadow(0 2px 8px rgba(0,0,0,0.6));
  cursor: pointer;
  transition: transform 0.15s ease;
}

#play-btn svg:hover,
#play-btn svg:focus { transform: scale(1.1); outline: none; }

#skip-intro {
  position: absolute;
  bottom: clamp(0.75rem, 3vh, 1.5rem);
  right: clamp(0.75rem, 3vw, 1.5rem);
  z-index: 20;
  padding: 0.4rem 0.9rem;
  font-size: clamp(0.7rem, 2vw, 0.875rem);
  background: rgba(255,255,255,0.85);
  border: none;
  border-radius: 5px;
  font-family: monospace;
  cursor: pointer;
  letter-spacing: 0.03em;
  opacity: 0;
  pointer-events: none;
  transition: background 0.15s ease, opacity 0.3s ease;
}

#skip-intro.visible { opacity: 1; pointer-events: auto; }
#skip-intro:hover   { background: #fff; }
```

- [ ] **Step 2: Create static/js/script.js**

Extract everything between `<script>` and `</script>` from `index.html` (lines 479–580) into `static/js/script.js`:

```js
/* ── Category filter ── */
function showCategory(category) {
  const sections = {
    blog:       document.getElementById('blog-section'),
    podcast:    document.getElementById('podcast-section'),
    youtube:    document.getElementById('youtube-section'),
    references: document.getElementById('references-section'),
    aboutme:    document.getElementById('aboutme-section')
  };
  if (category === 'all') {
    for (const key in sections) sections[key].style.display = 'block';
  } else {
    for (const key in sections)
      sections[key].style.display = key === category ? 'block' : 'none';
  }
}

function toggleSection(h) {
  h.parentElement.querySelectorAll('.entry').forEach(el => {
    el.style.display = el.style.display === 'none' ? '' : 'none';
  });
}

showCategory('all');

/* ── Hamburger nav ── */
const navToggle = document.getElementById('nav-toggle');
const navList   = document.getElementById('nav-list');

navToggle.addEventListener('click', () => {
  const open = navList.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open);
});

function closeNav() {
  navList.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
}

document.addEventListener('click', e => {
  if (!navToggle.contains(e.target) && !navList.contains(e.target)) closeNav();
});

/* ── Dark mode ── */
function toggleDark() {
  const isDark = document.body.classList.toggle('dark');
  document.getElementById('dark-btn').textContent = isDark ? '☀' : '☽';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
  document.getElementById('dark-btn').textContent = '☀';
}

/* ── Intro video ── */
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("intro-container");
  const skip      = document.getElementById("skip-intro");
  const thumbnail = document.getElementById("intro-thumbnail");
  const introBg   = document.getElementById("intro-bg");
  const playBtn   = document.getElementById("play-icon");
  let video = null;

  function hideIntro() {
    if (video) {
      video.pause();
      video.src = "";
      video.remove();
      video = null;
    }
    container.classList.add("hide-animation");
    document.body.classList.remove("intro-active");
    setTimeout(() => { container.style.display = "none"; }, 600);
  }

  function loadAndPlay() {
    if (video) return;
    video = document.createElement("video");
    video.src         = "resource/video/intro.mp4";
    video.autoplay    = true;
    video.muted       = false;
    video.playsInline = true;
    video.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:contain;z-index:5;";
    container.appendChild(video);

    video.addEventListener("ended", hideIntro);
    video.addEventListener("click", () => { video.paused ? video.play() : video.pause(); });

    thumbnail.style.opacity = "0";
    introBg.style.opacity   = "0";
    document.getElementById("play-btn").style.opacity      = "0";
    document.getElementById("play-btn").style.pointerEvents = "none";
    skip.classList.add("visible");
  }

  playBtn.addEventListener("click", loadAndPlay);
  playBtn.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); loadAndPlay(); } });
  skip.addEventListener("click", hideIntro);
});
```

- [ ] **Step 3: Commit**

```bash
git add static/css/style.css static/js/script.js
git commit -m "Extract inline CSS and JS to static files"
```

---

## Task 4: Create base Hugo template (baseof.html)

**Files:**
- Create: `layouts/_default/baseof.html`

- [ ] **Step 1: Create layouts/_default/baseof.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<title>{{ if .IsHome }}{{ .Site.Title }}{{ else }}{{ .Title }} — {{ .Site.Title }}{{ end }}</title>
<link rel="icon" href="/x/resource/image/logo.png">
<link rel="stylesheet" href="/x/css/style.css">
</head>

<body class="intro-active">

<!-- INTRO -->
<div id="intro-container">
  <img id="intro-bg"        src="/x/resource/image/intro-thumb.webp" alt="" aria-hidden="true" />
  <img id="intro-thumbnail" src="/x/resource/image/intro-thumb.webp" alt="Intro Thumbnail" />
  <div id="play-btn">
    <svg viewBox="0 0 100 100" role="button" tabindex="0" aria-label="Play intro video" id="play-icon">
      <circle cx="50" cy="50" r="48" fill="rgba(0,0,0,0.55)" stroke="rgba(255,255,255,0.9)" stroke-width="3"/>
      <polygon points="38,28 38,72 74,50" fill="rgba(255,255,255,0.95)"/>
    </svg>
  </div>
  <button id="skip-intro">Skip</button>
</div>

<header>
  <img src="/x/resource/image/logo.png" alt="Master Logo" class="logo-placeholder">
  <h1>Master Blog</h1>

  <nav aria-label="Main navigation">
    <button id="nav-toggle" aria-expanded="false" aria-controls="nav-list">&#9776;</button>
    <ul id="nav-list" style="list-style:none;padding:0;margin:0;display:flex;flex-wrap:wrap;gap:0.5rem 1.5rem;align-items:center;">
      <li><a href="/x/blog/">Blog</a></li>
      <li><a href="/x/podcast/">Podcast</a></li>
      <li><a href="/x/youtube/">YouTube</a></li>
      <li><a href="/x/sources/">Sources</a></li>
      <li><a href="/x/about/">About Me</a></li>
      <li><a href="/x/">All</a></li>
    </ul>
    <button id="dark-btn" aria-label="Toggle dark mode" onclick="toggleDark()">☽</button>
  </nav>
</header>

<main>
  {{ block "main" . }}{{ end }}
</main>

<script src="/x/js/script.js"></script>
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add layouts/_default/baseof.html
git commit -m "Add Hugo base template (baseof.html)"
```

---

## Task 5: Create entry partials

**Files:**
- Create: `layouts/partials/entry-blog.html`
- Create: `layouts/partials/entry-podcast.html`
- Create: `layouts/partials/entry-youtube.html`
- Create: `layouts/partials/entry-source.html`

- [ ] **Step 1: Create layouts/partials/entry-blog.html**

```html
<div class="entry">
  <div class="entry-tag">{{ .Params.series }}{{ if .Params.episode }} · Episode {{ .Params.episode }}{{ end }}</div>
  <div class="entry-title">{{ .Title }}</div>
  <div class="entry-meta">{{ .Date.Format "January 2, 2006" }}{{ if .Params.readtime }} · {{ .Params.readtime }} read{{ end }}</div>
  {{ if .Params.image }}<img class="entry-image" src="/x/{{ .Params.image }}" alt="{{ .Title }}" />{{ end }}
  <div class="entry-cols">
    <div class="entry-body">{{ .Content }}</div>
    {{ if .Params.pullquote }}
    <div class="entry-aside">
      <div class="pull-quote">"{{ .Params.pullquote }}"</div>
      {{ if .Params.readtime }}<div style="font-size:0.62rem;color:#888;margin-top:0.5rem;font-family:monospace">{{ .Params.readtime }} read <span class="format-badge">TEXT</span></div>{{ end }}
    </div>
    {{ end }}
  </div>
</div>
```

- [ ] **Step 2: Create layouts/partials/entry-podcast.html**

```html
<div class="entry">
  <div class="entry-tag">{{ .Params.series }}{{ if .Params.episode }} · Episode {{ .Params.episode }}{{ end }}</div>
  <div class="entry-title">{{ .Title }}</div>
  <div class="entry-meta">{{ .Date.Format "January 2, 2006" }}{{ if .Params.duration }} · {{ .Params.duration }}{{ end }}</div>
  {{ if .Params.audio_url }}
  <audio class="entry-audio" controls><source src="{{ .Params.audio_url }}" type="audio/mpeg"/></audio>
  {{ end }}
  <div class="entry-body">{{ .Content }}</div>
</div>
```

- [ ] **Step 3: Create layouts/partials/entry-youtube.html**

```html
<div class="entry">
  <div class="entry-tag">{{ .Params.series }}{{ if .Params.episode }} · #{{ .Params.episode }}{{ end }}</div>
  <div class="entry-title">{{ .Title }}</div>
  <div class="entry-meta">{{ .Date.Format "January 2, 2006" }}{{ if .Params.duration }} · {{ .Params.duration }}{{ end }}</div>
  {{ if .Params.youtube_id }}
  <iframe class="entry-embed" src="https://www.youtube.com/embed/{{ .Params.youtube_id }}" allowfullscreen title="{{ .Title }}"></iframe>
  {{ end }}
  <div class="entry-body">{{ .Content }}</div>
</div>
```

- [ ] **Step 4: Create layouts/partials/entry-source.html**

```html
<div class="entry">
  <div class="entry-tag">{{ .Params.series }}{{ if .Params.episode }} · #{{ .Params.episode }}{{ end }}</div>
  <div class="entry-title">{{ .Title }}</div>
  <div class="entry-meta">{{ .Date.Format "January 2, 2006" }} · External link</div>
  <div class="entry-body">{{ .Content }}</div>
  {{ if .Params.url }}<a class="entry-link" href="{{ .Params.url }}">→ Read the original source</a>{{ end }}
  <span class="format-badge">LINK</span>
</div>
```

- [ ] **Step 5: Commit**

```bash
git add layouts/partials/
git commit -m "Add entry partials for blog, podcast, youtube, source"
```

---

## Task 6: Create homepage template

**Files:**
- Create: `layouts/index.html`

- [ ] **Step 1: Create layouts/index.html**

```html
{{ define "main" }}

<!-- BLOG -->
<section id="blog-section" class="category">
  <h2 onclick="toggleSection(this)">Blog</h2>
  {{ range where .Site.RegularPages "Section" "blog" }}
    {{ partial "entry-blog.html" . }}
  {{ end }}
</section>

<!-- PODCAST -->
<section id="podcast-section" class="category">
  <h2 onclick="toggleSection(this)">Podcast</h2>
  {{ range where .Site.RegularPages "Section" "podcast" }}
    {{ partial "entry-podcast.html" . }}
  {{ end }}
</section>

<!-- YOUTUBE -->
<section id="youtube-section" class="category">
  <h2 onclick="toggleSection(this)">YouTube</h2>
  {{ range where .Site.RegularPages "Section" "youtube" }}
    {{ partial "entry-youtube.html" . }}
  {{ end }}
</section>

<!-- REFERENCES -->
<section id="references-section" class="category">
  <h2 onclick="toggleSection(this)">Sources</h2>
  {{ range where .Site.RegularPages "Section" "sources" }}
    {{ partial "entry-source.html" . }}
  {{ end }}
</section>

<!-- ABOUT ME -->
<section id="aboutme-section" class="category">
  <h2 onclick="toggleSection(this)">About Me</h2>
  {{ range where .Site.RegularPages "Section" "about" }}
  <div class="entry">
    <div class="entry-tag">CV</div>
    <div class="entry-title">Who I am</div>
    <div class="entry-cols">
      <div class="entry-body">{{ .Content }}</div>
      <div class="entry-aside">
        <img src="/x/resource/image/profile.png" alt="Master Profile" class="profile-image">
      </div>
    </div>
  </div>
  {{ end }}
</section>

{{ end }}
```

- [ ] **Step 2: Commit**

```bash
git add layouts/index.html
git commit -m "Add Hugo homepage template"
```

---

## Task 7: Create section list and single templates

**Files:**
- Create: `layouts/_default/list.html`
- Create: `layouts/_default/single.html`

- [ ] **Step 1: Create layouts/_default/list.html**

```html
{{ define "main" }}
<section>
  <h2>{{ .Title }}</h2>
  {{ range .Pages }}
    {{ if eq .Section "blog" }}{{ partial "entry-blog.html" . }}{{ end }}
    {{ if eq .Section "podcast" }}{{ partial "entry-podcast.html" . }}{{ end }}
    {{ if eq .Section "youtube" }}{{ partial "entry-youtube.html" . }}{{ end }}
    {{ if eq .Section "sources" }}{{ partial "entry-source.html" . }}{{ end }}
  {{ end }}
</section>
{{ end }}
```

- [ ] **Step 2: Create layouts/_default/single.html**

```html
{{ define "main" }}
<article>
  {{ if eq .Section "blog" }}{{ partial "entry-blog.html" . }}{{ end }}
  {{ if eq .Section "podcast" }}{{ partial "entry-podcast.html" . }}{{ end }}
  {{ if eq .Section "youtube" }}{{ partial "entry-youtube.html" . }}{{ end }}
  {{ if eq .Section "sources" }}{{ partial "entry-source.html" . }}{{ end }}
</article>
{{ end }}
```

- [ ] **Step 3: Commit**

```bash
git add layouts/_default/list.html layouts/_default/single.html
git commit -m "Add Hugo list and single templates"
```

---

## Task 8: Create content files

**Files:**
- Create: all files under `content/`

- [ ] **Step 1: Create content/blog/on-the-nature-of-daily-phenomena.md**

```markdown
---
title: "On the nature of daily phenomena"
date: 2026-06-12
series: "Daily"
episode: 1
readtime: "5 min"
pullquote: "Attention is the beginning of devotion."
tags: [philosophy, daily]
---

There is something quietly radical about paying attention. Not the performative attention of social media, but the slow, committed kind — the kind that transforms observation into understanding over time.

Every day carries a phenomenon worth naming.
```

- [ ] **Step 2: Create content/blog/the-architecture-of-the-everyday.md**

```markdown
---
title: "The architecture of the everyday"
date: 2026-05-28
series: "Phenomenons"
episode: 1
image: "resource/image/profile.png"
tags: [photography, observation]
---

Structures we pass without seeing. Patterns that only appear when you stop moving.
```

- [ ] **Step 3: Create content/podcast/escaping-the-productivity-trap.md**

```markdown
---
title: "Escaping the productivity trap"
date: 2026-06-05
series: "Detrapped"
episode: 1
duration: "42 min"
audio_url: "#"
tags: [productivity, work]
---

Why optimizing for output often destroys the conditions that make good work possible.
```

- [ ] **Step 4: Create content/podcast/conversations-at-the-edge-of-the-map.md**

```markdown
---
title: "Conversations at the edge of the map"
date: 2026-05-15
series: "X-Talks"
episode: 1
duration: "58 min"
audio_url: "#"
tags: [travel, conversation]
---

What happens when you talk to people who have left the known world behind.
```

- [ ] **Step 5: Create content/youtube/60-seconds-on-stillness.md**

```markdown
---
title: "60 seconds on stillness"
date: 2026-05-20
series: "Shorts"
episode: 1
youtube_id: "dQw4w9WgXcQ"
duration: "60 sec"
tags: [video, stillness]
---

A one-minute observation. No narration. Just presence.
```

- [ ] **Step 6: Create content/sources/systems-dont-think-people-do.md**

```markdown
---
title: "Systems don't think — people do"
date: 2026-05-15
series: "Axioms"
url: "#"
tags: [systems, thinking]
---

Complex systems produce outcomes that no individual intended or foresaw. Understanding this changes how you assign blame and credit.
```

- [ ] **Step 7: Create content/about/_index.md**

```markdown
---
title: "About Me"
profile_image: "resource/image/profile.png"
---

Content coming soon.
```

- [ ] **Step 8: Commit**

```bash
git add content/
git commit -m "Add placeholder content as Markdown files"
```

---

## Task 9: Verify locally with hugo server

- [ ] **Step 1: Install Hugo if not already installed**

macOS (one-time):
```bash
brew install hugo
```

Verify:
```bash
hugo version
```

Expected: `hugo v0.1xx.x ...`

- [ ] **Step 2: Start Hugo dev server**

```bash
hugo server --baseURL="http://localhost:1313/x/" --appendPort=false
```

Open `http://localhost:1313/x/` in a browser.

- [ ] **Step 3: Verify against live site**

Check each of these visually against `https://x-talks.github.io/x/`:
- [ ] Homepage shows all 5 sections (Blog, Podcast, YouTube, Sources, About Me)
- [ ] Editorial theme matches (Georgia serif, monospace nav, black/white palette)
- [ ] Dark mode toggle works and persists
- [ ] Logo inverts in dark mode (no framing)
- [ ] Intro overlay appears on load with play + skip buttons
- [ ] Hamburger nav works on narrow viewport
- [ ] Audio player renders in Podcast section
- [ ] YouTube embed renders in YouTube section
- [ ] About Me shows profile image

- [ ] **Step 4: Fix any visual discrepancies before continuing**

---

## Task 10: Update GitHub Actions workflow

**Files:**
- Modify: `.github/workflows/static.yml`

- [ ] **Step 1: Replace .github/workflows/static.yml**

```yaml
name: Deploy Hugo site

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: write
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: peaceiris/actions-hugo@v3
        with:
          hugo-version: 'latest'

      - run: hugo --minify --baseURL="https://x-talks.github.io/x/"

      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./public
          publish_branch: gh-pages
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/static.yml
git commit -m "Update GitHub Actions to build and deploy Hugo site"
```

---

## Task 11: Merge to main and verify deployment

- [ ] **Step 1: Push hugo-migration branch**

```bash
git push https://github.com/x-talks/x.git hugo-migration
```

- [ ] **Step 2: Open a PR on GitHub**

Go to `https://github.com/x-talks/x/compare/hugo-migration` and open a PR to `main`. Review the diff — confirm no accidental deletions of assets.

- [ ] **Step 3: Merge PR to main**

Merge the PR. GitHub Actions will trigger automatically.

- [ ] **Step 4: Watch the Actions run**

Go to `https://github.com/x-talks/x/actions` — confirm the workflow completes successfully (green checkmark).

- [ ] **Step 5: Verify live site**

Open `https://x-talks.github.io/x/` and confirm:
- [ ] Site loads correctly
- [ ] All 5 sections visible
- [ ] Editorial theme intact
- [ ] Dark mode works
- [ ] Intro overlay appears

- [ ] **Step 6: Update GitHub Pages source (if needed)**

If the site shows a 404, go to `https://github.com/x-talks/x/settings/pages` and set Source to `gh-pages` branch, `/ (root)`.

- [ ] **Step 7: Delete old index.html and legacy files**

Once live site is confirmed working:

```bash
git checkout main
git rm index.html css/style.css js/script.js
git commit -m "Remove legacy index.html and superseded css/js files"
git push https://github.com/x-talks/x.git main
```
