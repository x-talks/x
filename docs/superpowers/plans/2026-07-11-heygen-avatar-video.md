# HeyGen Avatar Video Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate language-aware AI avatar videos into the blog — a multilingual homepage intro and per-article teasers rendered differently per theme.

**Architecture:** JS resolves video paths dynamically using `<html lang="">` with de→en→tr fallback. Hugo partials conditionally render teaser UI when `video_teaser: true` in front matter. A shell script automates HeyGen API calls for video generation.

**Tech Stack:** Hugo (templates, front matter), Vanilla JS, Bash, HeyGen REST API, Claude API (translation)

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `static/js/script.js` | Modify | Language-aware intro video, teaser playback JS |
| `static/css/style.css` | Modify | Teaser UI styles (all 3 themes + dark mode) |
| `layouts/_default/baseof.html` | Modify | Add `data-lang-badge` element to intro overlay |
| `layouts/partials/entry-blog.html` | Modify | Add teaser HTML block when `video_teaser: true` |
| `layouts/_default/single.html` | Modify | Add above-text teaser strip for article pages |
| `scripts/generate-teaser.sh` | Create | HeyGen API automation script |
| `.env.example` | Create | Document required env vars |
| `.gitignore` | Modify | Ensure `.env` is gitignored |

---

## Task 1: Language-Aware Intro Video

**Files:**
- Modify: `static/js/script.js` (intro video section, lines 57–101)
- Modify: `layouts/_default/baseof.html` (intro-container div)

### Steps

- [ ] **1.1 Add lang badge element to baseof.html**

In `layouts/_default/baseof.html`, inside `#intro-container`, add a badge element after `#play-btn`:

```html
<!-- INTRO -->
<div id="intro-container">
  <img id="intro-bg"        src="/x/resource/image/intro-thumb.webp" alt="" aria-hidden="true" />
  <img id="intro-thumbnail" src="/x/resource/image/intro-thumb.webp" alt="Intro Thumbnail" />
  <div id="play-btn">
    <svg viewBox="0 0 100 100" role="button" tabindex="0" aria-label="Play intro video" id="play-icon">
      <circle cx="50" cy="50" r="48" fill="rgba(0,0,0,0.55)" stroke="rgba(255,255,255,0.9)" stroke-width="3"/>
      <polygon points="38,28 38,72 74,50" fill="rgba(255,255,255,0.95)"/>
    </svg>
    <span id="intro-lang-badge" style="display:none;font-family:monospace;font-size:0.55rem;letter-spacing:0.15em;color:rgba(255,255,255,0.5);border:1px solid rgba(255,255,255,0.2);padding:0.15rem 0.5rem;text-transform:uppercase;"></span>
  </div>
  <button id="skip-intro">Skip</button>
</div>
```

- [ ] **1.2 Replace hard-coded video path in script.js with language-aware resolver**

Replace the `loadAndPlay` function in `static/js/script.js` (currently lines 78–96) with:

```js
/* ── Intro video ── */
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("intro-container");
  const skip      = document.getElementById("skip-intro");
  const thumbnail = document.getElementById("intro-thumbnail");
  const introBg   = document.getElementById("intro-bg");
  const playBtn   = document.getElementById("play-icon");
  const langBadge = document.getElementById("intro-lang-badge");
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
    closeNav();
  }

  function resolveVideoPath(name, preferredLang, callback) {
    const langs = [preferredLang, 'de', 'en', 'tr'].filter((v, i, a) => v && a.indexOf(v) === i);
    let i = 0;
    function tryNext() {
      if (i >= langs.length) { callback(null, null); return; }
      const lang = langs[i++];
      const path = "resource/video/" + name + "-" + lang + ".mp4";
      fetch(path, { method: 'HEAD' })
        .then(r => r.ok ? callback(path, lang) : tryNext())
        .catch(() => tryNext());
    }
    tryNext();
  }

  function loadAndPlay() {
    if (video) return;
    const pageLang = (document.documentElement.lang || 'de').split('-')[0];
    resolveVideoPath('intro', pageLang, (path, resolvedLang) => {
      if (!path) return; // no intro video found — silently skip
      if (resolvedLang !== pageLang && langBadge) {
        langBadge.textContent = resolvedLang.toUpperCase();
        langBadge.style.display = 'inline-block';
      }
      video = document.createElement("video");
      video.src         = path;
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
    });
  }

  playBtn.addEventListener("click", loadAndPlay);
  playBtn.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); loadAndPlay(); } });
  skip.addEventListener("click", hideIntro);
});
```

- [ ] **1.3 Rename existing intro.mp4 to intro-de.mp4**

```bash
mv static/resource/video/intro.mp4 static/resource/video/intro-de.mp4
```

- [ ] **1.4 Build and verify manually**

```bash
hugo server
```

Open http://localhost:1313 in German (default). Click play — should load `intro-de.mp4`. Switch to `/en/` — should also load `intro-de.mp4` with a `DE` badge below the play button.

- [ ] **1.5 Commit**

```bash
git add static/js/script.js layouts/_default/baseof.html static/resource/video/
git commit -m "feat: language-aware intro video with fallback and lang badge"
```

---

## Task 2: Article Teaser HTML (Hugo Templates)

**Files:**
- Modify: `layouts/partials/entry-blog.html`
- Modify: `layouts/_default/single.html`

### Steps

- [ ] **2.1 Add teaser block to entry-blog.html**

In `layouts/partials/entry-blog.html`, modify the entry div opening tag to include `data-video-slug` when `video_teaser` is true, and add teaser HTML inside `.entry-cols` `.entry-aside`:

```html
<div class="entry" data-mode="{{ .Params.mode }}"{{ if .Params.video_teaser }} data-video-slug="{{ .Params.slug }}"{{ end }}>
  <div class="entry-tag">{{ .Params.series }}{{ if .Params.episode }} · Episode {{ .Params.episode }}{{ end }}</div>
  <div class="entry-title">{{ .Title }}</div>
  <div class="entry-meta">{{ .Date.Format "January 2, 2006" }}{{ if .Params.readtime }} · {{ .Params.readtime }} read{{ end }}</div>

  {{/* Top images */}}
  {{ range .Params.images }}{{ if eq .position "top" }}
  <figure class="entry-figure">
    <img class="entry-image" src="/x/{{ .src }}" alt="{{ .caption }}" />
    {{ if .caption }}<figcaption class="entry-caption">{{ .caption }}</figcaption>{{ end }}
  </figure>
  {{ end }}{{ end }}

  {{/* Inline-left images */}}
  {{ range .Params.images }}{{ if eq .position "inline-left" }}
  <figure class="entry-figure entry-figure--left">
    <img class="entry-image-inline" src="/x/{{ .src }}" alt="{{ .caption }}" />
    {{ if .caption }}<figcaption class="entry-caption">{{ .caption }}</figcaption>{{ end }}
  </figure>
  {{ end }}{{ end }}

  {{/* Inline-right images */}}
  {{ range .Params.images }}{{ if eq .position "inline-right" }}
  <figure class="entry-figure entry-figure--right">
    <img class="entry-image-inline" src="/x/{{ .src }}" alt="{{ .caption }}" />
    {{ if .caption }}<figcaption class="entry-caption">{{ .caption }}</figcaption>{{ end }}
  </figure>
  {{ end }}{{ end }}

  <div class="entry-cols">
    <div class="entry-body">{{ .Content }}<div class="entry-clearfix"></div></div>
    <div class="entry-aside">
      {{ if .Params.pullquote }}
      <div class="pull-quote">"{{ .Params.pullquote }}"</div>
      {{ if .Params.readtime }}<div style="font-size:0.62rem;color:#888;margin-top:0.5rem;font-family:monospace">{{ .Params.readtime }} read <span class="format-badge">TEXT</span></div>{{ end }}
      {{ end }}
      {{ if .Params.video_teaser }}
      <div class="entry-teaser-thumb" aria-label="Play avatar teaser">
        <svg viewBox="0 0 100 100" width="24" height="24">
          <circle cx="50" cy="50" r="48" fill="rgba(0,0,0,0.55)" stroke="rgba(255,255,255,0.9)" stroke-width="3"/>
          <polygon points="38,28 38,72 74,50" fill="rgba(255,255,255,0.95)"/>
        </svg>
        {{ if .Params.teaser_duration }}<span class="entry-teaser-duration">{{ .Params.teaser_duration }}</span>{{ end }}
      </div>
      <div class="entry-teaser-label">&#9654; TEASER</div>
      {{ end }}
    </div>
  </div>

  {{/* Magazine text button — outside cols, only renders when video_teaser true */}}
  {{ if .Params.video_teaser }}
  <div class="entry-teaser-text-btn">
    &#9654; WATCH TEASER{{ if .Params.teaser_duration }} &middot; {{ .Params.teaser_duration }}{{ end }}
  </div>
  {{ end }}

  {{/* Bottom images */}}
  {{ range .Params.images }}{{ if eq .position "bottom" }}
  <figure class="entry-figure">
    <img class="entry-image" src="/x/{{ .src }}" alt="{{ .caption }}" />
    {{ if .caption }}<figcaption class="entry-caption">{{ .caption }}</figcaption>{{ end }}
  </figure>
  {{ end }}{{ end }}

</div>
```

- [ ] **2.2 Add teaser strip to single.html**

Replace `layouts/_default/single.html` with:

```html
{{ define "main" }}
<article>
  {{ if eq .Section "blog" }}{{ partial "entry-blog-single.html" . }}{{ end }}
  {{ if eq .Section "podcast" }}{{ partial "entry-podcast.html" . }}{{ end }}
  {{ if eq .Section "youtube" }}{{ partial "entry-youtube.html" . }}{{ end }}
  {{ if eq .Section "sources" }}{{ partial "entry-source.html" . }}{{ end }}
</article>
{{ end }}
```

- [ ] **2.3 Create layouts/partials/entry-blog-single.html**

This is the article page version — same as entry-blog.html but with the teaser strip inserted between metadata and body:

```html
<div class="entry" data-mode="{{ .Params.mode }}"{{ if .Params.video_teaser }} data-video-slug="{{ .Params.slug }}"{{ end }}>
  <div class="entry-tag">{{ .Params.series }}{{ if .Params.episode }} · Episode {{ .Params.episode }}{{ end }}</div>
  <div class="entry-title">{{ .Title }}</div>
  <div class="entry-meta">{{ .Date.Format "January 2, 2006" }}{{ if .Params.readtime }} · {{ .Params.readtime }} read{{ end }}</div>

  {{ if .Params.video_teaser }}
  <div class="article-teaser" data-video-slug="{{ .Params.slug }}">
    <div class="article-teaser-thumb" aria-label="Play avatar intro">
      <svg viewBox="0 0 100 100" width="20" height="20">
        <circle cx="50" cy="50" r="48" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.9)" stroke-width="3"/>
        <polygon points="38,28 38,72 74,50" fill="rgba(255,255,255,0.95)"/>
      </svg>
    </div>
    <div class="article-teaser-info">
      <span class="article-teaser-label">Avatar intro</span>{{ if .Params.teaser_duration }}<span class="article-teaser-duration"> · {{ .Params.teaser_duration }}</span>{{ end }}
      <span class="article-teaser-desc">Watch a short intro to this article before reading.</span>
    </div>
  </div>
  {{ end }}

  {{/* Top images */}}
  {{ range .Params.images }}{{ if eq .position "top" }}
  <figure class="entry-figure">
    <img class="entry-image" src="/x/{{ .src }}" alt="{{ .caption }}" />
    {{ if .caption }}<figcaption class="entry-caption">{{ .caption }}</figcaption>{{ end }}
  </figure>
  {{ end }}{{ end }}

  {{/* Inline-left images */}}
  {{ range .Params.images }}{{ if eq .position "inline-left" }}
  <figure class="entry-figure entry-figure--left">
    <img class="entry-image-inline" src="/x/{{ .src }}" alt="{{ .caption }}" />
    {{ if .caption }}<figcaption class="entry-caption">{{ .caption }}</figcaption>{{ end }}
  </figure>
  {{ end }}{{ end }}

  {{/* Inline-right images */}}
  {{ range .Params.images }}{{ if eq .position "inline-right" }}
  <figure class="entry-figure entry-figure--right">
    <img class="entry-image-inline" src="/x/{{ .src }}" alt="{{ .caption }}" />
    {{ if .caption }}<figcaption class="entry-caption">{{ .caption }}</figcaption>{{ end }}
  </figure>
  {{ end }}{{ end }}

  <div class="entry-cols">
    <div class="entry-body">{{ .Content }}<div class="entry-clearfix"></div></div>
    {{ if .Params.pullquote }}
    <div class="entry-aside">
      <div class="pull-quote">"{{ .Params.pullquote }}"</div>
      {{ if .Params.readtime }}<div style="font-size:0.62rem;color:#888;margin-top:0.5rem;font-family:monospace">{{ .Params.readtime }} read <span class="format-badge">TEXT</span></div>{{ end }}
    </div>
    {{ end }}
  </div>

  {{/* Bottom images */}}
  {{ range .Params.images }}{{ if eq .position "bottom" }}
  <figure class="entry-figure">
    <img class="entry-image" src="/x/{{ .src }}" alt="{{ .caption }}" />
    {{ if .caption }}<figcaption class="entry-caption">{{ .caption }}</figcaption>{{ end }}
  </figure>
  {{ end }}{{ end }}

</div>
```

- [ ] **2.4 Build and check for template errors**

```bash
hugo server 2>&1 | head -30
```

Expected: no ERROR lines. Site builds and serves at http://localhost:1313.

- [ ] **2.5 Commit**

```bash
git add layouts/
git commit -m "feat: add video_teaser Hugo template blocks (list + article page)"
```

---

## Task 3: Teaser CSS (all themes + dark mode)

**Files:**
- Modify: `static/css/style.css` (append to end)

### Steps

- [ ] **3.1 Add teaser styles to style.css**

Append to the end of `static/css/style.css`:

```css
/* ═══════════════════════════════════════════
   AVATAR TEASER — list view
═══════════════════════════════════════════ */

/* Editorial: portrait thumbnail in aside */
.entry-teaser-thumb {
  position: relative;
  background: #111;
  width: 70px;
  aspect-ratio: 9 / 16;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-bottom: 0.3rem;
}
.entry-teaser-thumb:hover { opacity: 0.85; }
.entry-teaser-duration {
  position: absolute;
  bottom: 4px;
  right: 4px;
  font-family: monospace;
  font-size: 0.45rem;
  color: rgba(255,255,255,0.6);
  letter-spacing: 0.05em;
}
.entry-teaser-label {
  font-family: monospace;
  font-size: 0.5rem;
  letter-spacing: 0.1em;
  color: #888;
}

/* Magazine: text button — shown only in magazine theme */
.entry-teaser-text-btn {
  display: none;
  font-family: monospace;
  font-size: 0.6rem;
  letter-spacing: 0.1em;
  border: 1px solid #000;
  padding: 0.25rem 0.7rem;
  cursor: pointer;
  margin-top: 0.5rem;
  display: inline-block;
}
body.dark .entry-teaser-text-btn { border-color: #e8e8e8; }

/* Swiss: compact pill — hide default aside thumb */
body.theme-swiss .entry-teaser-thumb {
  width: 52px;
  height: 72px;
  aspect-ratio: unset;
  border-radius: 3px;
  float: right;
  margin: 0 0 0.5rem 0.75rem;
}
body.theme-swiss .entry-teaser-label { display: none; }
body.theme-swiss .entry-teaser-text-btn { display: none; }

/* Magazine: hide thumb, show text button */
body.theme-magazine .entry-teaser-thumb { display: none; }
body.theme-magazine .entry-teaser-label { display: none; }
body.theme-magazine .entry-teaser-text-btn { display: inline-block; }
body.dark .entry-teaser-text-btn { border-color: #e8e8e8; color: #e8e8e8; }

/* ═══════════════════════════════════════════
   AVATAR TEASER — article page strip
═══════════════════════════════════════════ */

.article-teaser {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border: 1px solid #ddd;
  background: #f9f9f9;
  padding: 0.6rem 0.75rem;
  margin-bottom: 1rem;
  cursor: pointer;
}
.article-teaser:hover { background: #f0f0f0; }
body.dark .article-teaser { background: #1a1a1a; border-color: #333; }
body.dark .article-teaser:hover { background: #222; }

.article-teaser-thumb {
  background: #111;
  width: 48px;
  min-width: 48px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  flex-shrink: 0;
}

.article-teaser-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.article-teaser-label {
  font-family: monospace;
  font-size: 0.58rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #555;
}
body.dark .article-teaser-label { color: #aaa; }
.article-teaser-duration {
  font-family: monospace;
  font-size: 0.58rem;
  color: #888;
}
.article-teaser-desc {
  font-family: monospace;
  font-size: 0.68rem;
  color: #444;
  line-height: 1.4;
}
body.dark .article-teaser-desc { color: #bbb; }
```

- [ ] **3.2 Build and visually check all three themes**

```bash
hugo server
```

Open http://localhost:1313. Add `video_teaser: true` and `teaser_duration: "0:32"` to a test article's front matter temporarily. Check:
- Editorial: portrait thumbnail appears in aside column
- Swiss (click "E — Swiss" in theme bar): compact pill floats right of title
- Magazine (click "H — Magazine"): text button `▶ WATCH TEASER · 0:32` appears below excerpt

- [ ] **3.3 Commit**

```bash
git add static/css/style.css
git commit -m "feat: avatar teaser CSS — all three themes and dark mode"
```

---

## Task 4: Teaser Playback JS

**Files:**
- Modify: `static/js/script.js` (append after existing code)

### Steps

- [ ] **4.1 Add resolveVideoPath helper and teaser playback to script.js**

The `resolveVideoPath` function was already added in Task 1 inside the DOMContentLoaded block for the intro. Extract it as a module-level function so it can be reused. Replace the inner `resolveVideoPath` definition inside the intro DOMContentLoaded with a call to the top-level one.

Append to the end of `static/js/script.js`:

```js
/* ── Shared video resolver ── */
function resolveVideoPath(name, preferredLang, callback) {
  const langs = [preferredLang, 'de', 'en', 'tr'].filter((v, i, a) => v && a.indexOf(v) === i);
  let i = 0;
  function tryNext() {
    if (i >= langs.length) { callback(null, null); return; }
    const lang = langs[i++];
    const path = "resource/video/" + name + "-" + lang + ".mp4";
    fetch(path, { method: 'HEAD' })
      .then(r => r.ok ? callback(path, lang) : tryNext())
      .catch(() => tryNext());
  }
  tryNext();
}

/* ── Article teaser playback ── */
document.addEventListener('DOMContentLoaded', () => {
  const pageLang = (document.documentElement.lang || 'de').split('-')[0];

  // List view teasers (entry-teaser-thumb and entry-teaser-text-btn)
  document.querySelectorAll('[data-video-slug]').forEach(entry => {
    const slug = entry.dataset.videoSlug;
    const thumb = entry.querySelector('.entry-teaser-thumb');
    const textBtn = entry.querySelector('.entry-teaser-text-btn');
    const trigger = thumb || textBtn;
    if (!trigger || !slug) return;

    trigger.addEventListener('click', e => {
      e.stopPropagation();
      resolveVideoPath(slug, pageLang, (path) => {
        if (!path) return;
        const vid = document.createElement('video');
        vid.src = path;
        vid.autoplay = true;
        vid.playsInline = true;
        vid.controls = true;
        vid.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;object-fit:contain;background:#000;z-index:9998;';
        document.body.appendChild(vid);
        function closeVid() { vid.pause(); vid.src = ''; vid.remove(); document.removeEventListener('keydown', onKey); }
        function onKey(e) { if (e.key === 'Escape') closeVid(); }
        vid.addEventListener('ended', closeVid);
        vid.addEventListener('click', () => { vid.paused ? vid.play() : vid.pause(); });
        document.addEventListener('keydown', onKey);
      });
    });
  });

  // Article page teaser strip (.article-teaser)
  document.querySelectorAll('.article-teaser[data-video-slug]').forEach(strip => {
    const slug = strip.dataset.videoSlug;
    strip.addEventListener('click', () => {
      resolveVideoPath(slug, pageLang, (path) => {
        if (!path) return;
        const vid = document.createElement('video');
        vid.src = path;
        vid.autoplay = true;
        vid.playsInline = true;
        vid.controls = true;
        vid.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;object-fit:contain;background:#000;z-index:9998;';
        document.body.appendChild(vid);
        function closeVid() { vid.pause(); vid.src = ''; vid.remove(); document.removeEventListener('keydown', onKey); }
        function onKey(e) { if (e.key === 'Escape') closeVid(); }
        vid.addEventListener('ended', closeVid);
        document.addEventListener('keydown', onKey);
      });
    });
  });
});
```

- [ ] **4.2 Remove the inline resolveVideoPath from Task 1**

In the intro DOMContentLoaded block (Task 1), remove the local `resolveVideoPath` function definition — it now calls the top-level one. The `loadAndPlay` function body stays the same, just the local function definition is removed.

- [ ] **4.3 Build and test teaser click**

```bash
hugo server
```

With `video_teaser: true` on a test article and a video file at `static/resource/video/{slug}-de.mp4`:
- Click the teaser thumb/button in list view → fullscreen video overlay appears
- Press Escape → overlay closes
- Click the article-page strip → same overlay

- [ ] **4.4 Commit**

```bash
git add static/js/script.js
git commit -m "feat: teaser video playback — fullscreen overlay, Escape to close"
```

---

## Task 5: HeyGen Generation Script

**Files:**
- Create: `scripts/generate-teaser.sh`
- Create: `.env.example`
- Modify: `.gitignore`

### Steps

- [ ] **5.1 Ensure .env is in .gitignore**

```bash
grep -q '^\.env$' .gitignore || echo '.env' >> .gitignore
```

- [ ] **5.2 Create .env.example**

```bash
cat > .env.example << 'EOF'
HEYGEN_API_KEY=your_heygen_api_key_here
HEYGEN_AVATAR_ID=your_avatar_id_here
HEYGEN_VOICE_ID_DE=your_german_voice_id
HEYGEN_VOICE_ID_EN=your_english_voice_id
HEYGEN_VOICE_ID_TR=your_turkish_voice_id
ANTHROPIC_API_KEY=your_claude_api_key_here
EOF
```

- [ ] **5.3 Create scripts/generate-teaser.sh**

```bash
mkdir -p scripts
```

Create `scripts/generate-teaser.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/generate-teaser.sh <article-slug> [--force]
# Generates de/en/tr HeyGen avatar teaser videos for an article.
# Skips languages where the video already exists (unless --force).
# Requires .env with HEYGEN_API_KEY, HEYGEN_AVATAR_ID, HEYGEN_VOICE_ID_{DE,EN,TR}, ANTHROPIC_API_KEY

SLUG="${1:-}"
FORCE=false
[ "${2:-}" = "--force" ] && FORCE=true

if [ -z "$SLUG" ]; then
  echo "Usage: $0 <article-slug> [--force]" >&2
  exit 1
fi

# Load env
ENV_FILE="$(dirname "$0")/../.env"
if [ -f "$ENV_FILE" ]; then
  set -a; source "$ENV_FILE"; set +a
fi

# Validate required vars
for var in HEYGEN_API_KEY HEYGEN_AVATAR_ID HEYGEN_VOICE_ID_DE HEYGEN_VOICE_ID_EN HEYGEN_VOICE_ID_TR ANTHROPIC_API_KEY; do
  if [ -z "${!var:-}" ]; then
    echo "Error: $var is not set. Copy .env.example to .env and fill in values." >&2
    exit 1
  fi
done

VIDEO_DIR="static/resource/video"
CONTENT_FILE="content/de/blog/${SLUG}.de.md"

if [ ! -f "$CONTENT_FILE" ]; then
  echo "Error: Content file not found: $CONTENT_FILE" >&2
  exit 1
fi

# Extract teaser_script from front matter, or use first paragraph of body
extract_script() {
  # Try front matter field teaser_script first
  local script
  script=$(awk '/^---/{p++} p==1{print} p==2{exit}' "$CONTENT_FILE" | grep '^teaser_script:' | sed 's/^teaser_script: *//' | tr -d '"')
  if [ -n "$script" ]; then
    echo "$script"
    return
  fi
  # Fall back to first non-empty paragraph after front matter
  awk 'BEGIN{fm=0;body=0} /^---/{fm++; next} fm>=2 && /^[^[:space:]]/{print; exit}' "$CONTENT_FILE"
}

translate_script() {
  local text="$1"
  local target_lang="$2"
  curl -s https://api.anthropic.com/v1/messages \
    -H "x-api-key: $ANTHROPIC_API_KEY" \
    -H "anthropic-version: 2023-06-01" \
    -H "content-type: application/json" \
    -d "$(jq -n \
      --arg model "claude-haiku-4-5-20251001" \
      --arg text "$text" \
      --arg lang "$target_lang" \
      '{model:$model,max_tokens:512,messages:[{role:"user",content:"Translate the following text to \($lang). Return only the translated text, no explanation.\n\n\($text)"}]}')" \
  | jq -r '.content[0].text'
}

submit_heygen_video() {
  local script="$1"
  local voice_id="$2"
  curl -s -X POST https://api.heygen.com/v2/video/generate \
    -H "X-Api-Key: $HEYGEN_API_KEY" \
    -H "Content-Type: application/json" \
    -d "$(jq -n \
      --arg avatar_id "$HEYGEN_AVATAR_ID" \
      --arg voice_id "$voice_id" \
      --arg script "$script" \
      '{
        video_inputs: [{
          character: {type:"avatar", avatar_id:$avatar_id, avatar_style:"normal"},
          voice: {type:"text", input_text:$script, voice_id:$voice_id},
          background: {type:"color", value:"#000000"}
        }],
        dimension: {width:720, height:1280},
        aspect_ratio: null
      }')" \
  | jq -r '.data.video_id'
}

poll_heygen_video() {
  local video_id="$1"
  local max_attempts=60
  local attempt=0
  echo "  Polling for video_id=$video_id ..."
  while [ $attempt -lt $max_attempts ]; do
    local status
    status=$(curl -s "https://api.heygen.com/v1/video_status.get?video_id=${video_id}" \
      -H "X-Api-Key: $HEYGEN_API_KEY" | jq -r '.data.status')
    if [ "$status" = "completed" ]; then
      curl -s "https://api.heygen.com/v1/video_status.get?video_id=${video_id}" \
        -H "X-Api-Key: $HEYGEN_API_KEY" | jq -r '.data.video_url'
      return 0
    elif [ "$status" = "failed" ]; then
      echo "  Error: HeyGen video generation failed." >&2
      return 1
    fi
    sleep 10
    attempt=$((attempt + 1))
  done
  echo "  Error: Timed out waiting for HeyGen video." >&2
  return 1
}

# Extract base script (German)
SCRIPT_DE=$(extract_script)
if [ -z "$SCRIPT_DE" ]; then
  echo "Error: Could not extract teaser script from $CONTENT_FILE" >&2
  exit 1
fi
echo "Script (DE): $SCRIPT_DE"

declare -A SCRIPTS VOICE_IDS
SCRIPTS[de]="$SCRIPT_DE"
VOICE_IDS[de]="$HEYGEN_VOICE_ID_DE"
VOICE_IDS[en]="$HEYGEN_VOICE_ID_EN"
VOICE_IDS[tr]="$HEYGEN_VOICE_ID_TR"

# Translate to EN and TR
echo "Translating to EN..."
SCRIPTS[en]=$(translate_script "$SCRIPT_DE" "English")
echo "Translating to TR..."
SCRIPTS[tr]=$(translate_script "$SCRIPT_DE" "Turkish")

# Generate videos per language
for lang in de en tr; do
  OUT_FILE="$VIDEO_DIR/${SLUG}-${lang}.mp4"
  if [ -f "$OUT_FILE" ] && [ "$FORCE" = false ]; then
    echo "[$lang] Skipping — $OUT_FILE already exists (use --force to regenerate)"
    continue
  fi
  echo "[$lang] Submitting to HeyGen..."
  VIDEO_ID=$(submit_heygen_video "${SCRIPTS[$lang]}" "${VOICE_IDS[$lang]}")
  if [ -z "$VIDEO_ID" ] || [ "$VIDEO_ID" = "null" ]; then
    echo "[$lang] Error: HeyGen submission failed." >&2
    continue
  fi
  echo "[$lang] Waiting for video (id=$VIDEO_ID)..."
  VIDEO_URL=$(poll_heygen_video "$VIDEO_ID")
  echo "[$lang] Downloading from $VIDEO_URL ..."
  curl -sL "$VIDEO_URL" -o "$OUT_FILE"
  echo "[$lang] Saved to $OUT_FILE"
done

echo "Done. Set video_teaser: true in $CONTENT_FILE front matter."
```

- [ ] **5.4 Make script executable**

```bash
chmod +x scripts/generate-teaser.sh
```

- [ ] **5.5 Dry-run test (without real API keys)**

```bash
# Should fail fast with a clear error about missing .env vars
./scripts/generate-teaser.sh the-architecture-of-the-everyday 2>&1
```

Expected output: `Error: HEYGEN_API_KEY is not set. Copy .env.example to .env and fill in values.`

- [ ] **5.6 Commit**

```bash
git add scripts/generate-teaser.sh .env.example .gitignore
git commit -m "feat: add generate-teaser.sh — HeyGen video automation script"
```

---

## Task 6: Update /article Skill with Teaser Prompt

**Files:**
- Modify: `.superpowers/skills/article.md` (or wherever the article skill is stored — find with `ls .superpowers/`)

### Steps

- [ ] **6.1 Locate the article skill file**

```bash
find .superpowers -name "article*" -o -name "article.md" 2>/dev/null
```

- [ ] **6.2 Find the end of the article creation pipeline in the skill**

Look for where the skill commits the article files. It will be near the end of the skill instructions.

- [ ] **6.3 Append the teaser prompt block after the commit step**

Add this section at the end of the article creation pipeline instructions (after the git commit step):

```markdown
## Step: Offer HeyGen Teaser Generation

After committing the article files, present this prompt to the user:

---
Article created: `content/de/blog/{slug}.de.md`

Generate HeyGen avatar teaser videos? (de/en/tr)
- **[y] Generate now** — runs `./scripts/generate-teaser.sh {slug}`
- **[s] Skip** — sets `video_teaser: false` in front matter (no video UI shown)
- **[m] Manual** — videos already placed in `static/resource/video/` — sets `video_teaser: true`
---

**If y:** Run `./scripts/generate-teaser.sh {slug}` and wait for completion. Then set `video_teaser: true` and `teaser_duration` in the article's front matter once the script reports durations.

**If s:** Set `video_teaser: false` in front matter (or omit the field entirely).

**If m:** Set `video_teaser: true` in front matter. Optionally ask for `teaser_duration` to display in the UI.
```

- [ ] **6.4 Commit**

```bash
git add .superpowers/
git commit -m "feat: integrate HeyGen teaser prompt into /article skill"
```

---

## Task 7: Add video_teaser to Existing Test Article

**Files:**
- Modify: `content/de/blog/the-architecture-of-the-everyday.de.md`

### Steps

- [ ] **7.1 Add video_teaser field to front matter**

Edit `content/de/blog/the-architecture-of-the-everyday.de.md` front matter:

```yaml
---
title: "The architecture of the everyday"
date: 2026-05-28
mode: philosophy
series: "Phenomenons"
episode: 1
image: "resource/image/profile.png"
tags: [photography, observation]
slug: "the-architecture-of-the-everyday"
video_teaser: true
teaser_duration: "0:32"
---
```

- [ ] **7.2 Place a test video file**

Copy `static/resource/video/intro-de.mp4` as a stand-in:

```bash
cp static/resource/video/intro-de.mp4 "static/resource/video/the-architecture-of-the-everyday-de.mp4"
```

- [ ] **7.3 Build and verify end-to-end**

```bash
hugo server
```

Check:
1. Homepage list — teaser thumbnail appears in Editorial aside
2. Switch to Swiss theme — compact pill appears top-right of title
3. Switch to Magazine theme — `▶ WATCH TEASER · 0:32` text button appears
4. Click teaser → fullscreen video overlay plays, Escape closes it
5. Click into article page → teaser strip appears above article body, clicking plays video

- [ ] **7.4 Commit**

```bash
git add content/de/blog/the-architecture-of-the-everyday.de.md static/resource/video/
git commit -m "test: add video_teaser to example article for smoke testing"
```

---

## Self-Review Notes

- Task 4 step 4.2 requires removing the local `resolveVideoPath` from Task 1's intro block — both tasks modify `script.js`. When executing sequentially this is fine; when using subagent-driven development, Task 4 must run after Task 1 is committed.
- Task 6 depends on finding the article skill path — step 6.1 discovers it; step 6.3 assumes it's editable markdown.
- The test video in Task 7 uses `intro-de.mp4` as a stand-in — this is intentional for smoke testing only.
