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

document.addEventListener('DOMContentLoaded', () => showCategory('all'));

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
      if (!path) return;
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

/* ── Magazine: split hero title into solid/outline spans ── */
function applyMagazineTitles() {
  document.querySelectorAll('.entry:first-of-type .entry-title').forEach(el => {
    if (el.dataset.magSplit) return;
    el.dataset.magSplit = '1';
    const words = el.textContent.trim().split(/\s+/);
    const mid   = Math.ceil(words.length / 2);
    const line1 = words.slice(0, mid).join(' ');
    const line2 = words.slice(mid).join(' ');
    el.textContent = '';
    const s1 = document.createElement('span');
    s1.className = 'mag-solid';
    s1.textContent = line1;
    el.appendChild(s1);
    if (line2) {
      const s2 = document.createElement('span');
      s2.className = 'mag-outline';
      s2.textContent = line2;
      el.appendChild(s2);
    }
  });
}

/* ── Mode toggle ── */
function switchMode(mode) {
  // Update toggle labels
  document.getElementById('mode-tech').classList.toggle('active', mode === 'tech');
  document.getElementById('mode-philosophy').classList.toggle('active', mode === 'philosophy');

  // Always reset to "all" view first so nav filter state doesn't bleed in
  showCategory('all');

  // Show/hide entries by data-mode attribute
  document.querySelectorAll('.entry[data-mode]').forEach(entry => {
    entry.style.display = entry.dataset.mode === mode ? '' : 'none';
  });

  // Hide sections that have no visible entries
  ['blog-section', 'podcast-section', 'youtube-section', 'references-section', 'aboutme-section'].forEach(id => {
    const section = document.getElementById(id);
    if (!section) return;
    const entries = section.querySelectorAll('.entry[data-mode]');
    if (entries.length === 0) return; // no mode-tagged entries (e.g. aboutme) — leave visible
    const hasVisible = Array.from(entries).some(e => e.style.display !== 'none');
    section.style.display = hasVisible ? '' : 'none';
  });

  localStorage.setItem('mode', mode);
}

// Init on load
(function () {
  const saved = localStorage.getItem('mode') || 'tech';
  switchMode(saved);
})();
