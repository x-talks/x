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
