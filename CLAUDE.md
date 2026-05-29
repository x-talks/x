# Master Blog — Project Conventions

## Project Overview
Static personal blog/media site. Pure HTML/CSS/JS — no build tools, no frameworks, no npm.
Deployed automatically to GitHub Pages on every push to `main` via `.github/workflows/static.yml`.

## File Structure
```
index.html          # Single-page app — all markup and inline styles/scripts live here
css/style.css       # Global styles (legacy, mostly superseded by inline styles in index.html)
js/script.js        # Legacy JS (mostly superseded by inline script in index.html)
resource/
  image/            # logo.png, profile.png, intro-thumb.webp
  video/            # intro.mp4
.claude/
  settings.json     # Project-scoped plugin config (committed)
```

## Code Conventions

### HTML
- All active styles and scripts are inline in `index.html` — do not split to external files
- Use `clamp()` for font sizes and spacing to ensure responsiveness
- Always include `viewport-fit=cover` in the viewport meta tag
- Use `env(safe-area-inset-*)` for elements that must cover notch/home-bar areas on iOS
- `object-fit: cover` for all full-screen media (thumbnail, video)

### CSS
- Monospace font everywhere (`font-family: monospace`)
- Black and white palette (`#000`, `#fff`, `#ccc`)
- No external CSS frameworks
- Mobile-first: use `clamp()` and `flex-wrap` over fixed breakpoints where possible

### JavaScript
- Vanilla JS only — no libraries, no bundlers
- Intro video is lazy-loaded on play click (not on page load)
- When video plays: pause + `video.src = ""` + `video.remove()` to fully stop audio
- `DOMContentLoaded` for all DOM manipulation

### Responsive / Mobile
- `viewport-fit=cover` + `env(safe-area-inset-*)` for iOS notch support
- All full-screen overlays use `position:fixed; top:0; left:0; width:100%; height:100%`
- Images and logos scale with `clamp()` or `max-width: 100%`

## Git Workflow
- Single branch: `main`
- Push to `main` = auto-deploy to GitHub Pages
- Always check `git log --oneline origin/main..HEAD` before pushing to confirm unpushed commits
- Commit messages: short imperative summary + bullet details in body

## Security
- `security-guidance` plugin is active at project scope — it will flag vulnerabilities automatically
- Never use `innerHTML` with user-controlled data
- No user input fields currently exist — if added, validate and sanitize at the boundary

## What NOT to do
- Do not install npm or introduce a build step
- Do not add external JS/CSS libraries unless explicitly requested
- Do not create new files unless absolutely necessary — prefer editing existing ones
- Do not add comments unless logic is non-obvious
- Do not add features beyond what is asked
