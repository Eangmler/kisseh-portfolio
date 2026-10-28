// ============================================================
// ERNEST KISSEH-ANGMLER — Portfolio JS
// Features: Ambient Video Reel (randomized start timestamps),
//           Audio Toggle on Empty Hero Space Click,
//           Fast Slide Collage, Cinema Modal (YouTube + Drive),
//           Netlify Form, Smooth Scroll & Counter Animations.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // ── REEL CATALOGUE WITH DYNAMIC RANDOM START INTERVALS ────
  const REEL_DATA = [
    {
      id: 'XrNkjvwJ24M',
      title: 'Worlasi — Wor Wor',
      role: 'Director · Editor · Colorist',
      category: 'Music Video / Direction',
      thumb: 'https://img.youtube.com/vi/XrNkjvwJ24M/maxresdefault.jpg',
      minStart: 20,
      maxStart: 130
    },
    {
      id: 'UvOsJ5HNprs',
      title: 'After the Last Wear — A Short Film',
      role: 'Director · Editor · Colorist',
      category: 'Short Film',
      thumb: 'https://img.youtube.com/vi/UvOsJ5HNprs/maxresdefault.jpg',
      minStart: 35,
      maxStart: 240
    },
    {
      id: 'LqyhAeefkEw',
      title: 'Brabo Leone — Sarah Janneh (NITE)',
      role: 'Cinematography · Composition · Lyrics',
      category: 'International Theatre / Music',
      thumb: 'https://img.youtube.com/vi/LqyhAeefkEw/maxresdefault.jpg',
      minStart: 15,
      maxStart: 95
    },
    {
      id: 'W3ebiLUz4dA',
      title: 'Senkulive — Accra We Dey (feat. Pure Akan & Aduberks)',
      role: 'Director · Editor · Colorist',
      category: 'Live Music Performance',
      thumb: 'https://img.youtube.com/vi/W3ebiLUz4dA/maxresdefault.jpg',
      minStart: 25,
      maxStart: 150
    },
    {
      id: 'MdYOPwamb-c',
      title: 'Rebirth — NiiSanku Dromor',
      role: 'Director & Editor',
      category: 'Official Music Video',
      thumb: 'https://img.youtube.com/vi/MdYOPwamb-c/maxresdefault.jpg',
      minStart: 20,
      maxStart: 110
    },
    {
      id: 'eYzMoo10ACA',
      title: 'Diagnostics & Beyond (DAB) — Dr. Owoo',
      role: 'Director · Editor · Colorist',
      category: 'Healthcare Media / Podcast',
      thumb: 'https://img.youtube.com/vi/eYzMoo10ACA/maxresdefault.jpg',
      minStart: 45,
      maxStart: 450
    },
    {
      id: 'o5gsehodHkE',
      title: 'Pure Akan — Nyame Mma Experience (2023)',
      role: 'Co-Director & Actor',
      category: 'Theatrical Concert Experience',
      thumb: 'https://img.youtube.com/vi/o5gsehodHkE/maxresdefault.jpg',
      minStart: 30,
      maxStart: 210
    }
  ];

  let currentReelIndex = 0;
  let reelTimer = null;
  let isSoundActive = false; // Starts muted to satisfy browser autoplay policy

  const heroSection = document.getElementById('hero');
  const heroIframe = document.getElementById('heroReelIframe');
  const soundPill = document.getElementById('heroSoundPill');
  const soundWave = document.getElementById('soundWaveIcon');
  const soundStatusText = document.getElementById('soundStatusText');
  const shuffleBtn = document.getElementById('shuffleCollageBtn');

  // PostMessage helper to talk directly with YouTube Player without reloading
  const postToReel = (func, args = []) => {
    if (!heroIframe || !heroIframe.contentWindow) return;
    try {
      heroIframe.contentWindow.postMessage(JSON.stringify({
        event: 'command',
        func: func,
        args: args
      }), '*');
    } catch (err) {
      // Ignore cross-origin warnings
    }
  };

  const updateSoundUI = (active) => {
    if (soundPill) {
      soundPill.classList.toggle('is-on', active);
    }
    if (soundWave) {
      soundWave.classList.toggle('muted', !active);
    }
    if (soundStatusText) {
      soundStatusText.textContent = active ? 'Sound ON · Click space to mute' : 'Sound OFF · Click space for sound';
    }
  };

  const toggleHeroSound = (forceState) => {
    if (typeof forceState === 'boolean') {
      isSoundActive = forceState;
    } else {
      isSoundActive = !isSoundActive;
    }

    if (isSoundActive) {
      postToReel('unMute');
      postToReel('setVolume', [100]);
      postToReel('playVideo');
      updateSoundUI(true);
    } else {
      postToReel('mute');
      updateSoundUI(false);
    }
  };

  // Click on any empty space around hero area toggles sound
  heroSection?.addEventListener('click', (e) => {
    // If clicked on an interactive element (button, link, form, collage card), let that handle it
    if (e.target.closest('a, button, .collage-card, input, select, textarea, [data-open-cinema]')) {
      return;
    }
    toggleHeroSound();
  });

  // Sound pill click also toggles sound
  soundPill?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleHeroSound();
  });

  const loadReelVideo = (index, userInitiated = false) => {
    if (!heroIframe) return;
    currentReelIndex = (index + REEL_DATA.length) % REEL_DATA.length;
    const item = REEL_DATA[currentReelIndex];

    // Pick a dynamic random start timestamp within the clip's golden segment
    const min = item.minStart || 20;
    const max = item.maxStart || 120;
    const randomStart = Math.floor(Math.random() * (max - min + 1)) + min;

    // Highlight active card in collage
    document.querySelectorAll('.collage-card').forEach(card => {
      card.classList.toggle('is-active', card.dataset.videoId === item.id);
    });

    const muteParam = isSoundActive ? 0 : 1;
    const embedUrl = `https://www.youtube.com/embed/${item.id}?autoplay=1&mute=${muteParam}&controls=0&loop=1&playlist=${item.id}&start=${randomStart}&playsinline=1&rel=0&showinfo=0&modestbranding=1&enablejsapi=1`;

    heroIframe.src = embedUrl;

    // If sound was previously activated by user, ensure unmuted after load
    if (isSoundActive) {
      setTimeout(() => {
        postToReel('unMute');
        postToReel('setVolume', [100]);
      }, 1000);
    }

    // Reset auto-advance timer (cycles every 16 seconds to another clip)
    if (reelTimer) clearInterval(reelTimer);
    reelTimer = setInterval(() => {
      const nextIndex = (currentReelIndex + 1) % REEL_DATA.length;
      loadReelVideo(nextIndex);
    }, 16000);
  };

  // Initialize first video after short delay
  setTimeout(() => {
    loadReelVideo(0);
  }, 350);

  // ── FAST SLIDE COLLAGE INTERACTION ────────────────────────
  const collageCards = document.querySelectorAll('.collage-card');

  collageCards.forEach((card, idx) => {
    card.addEventListener('click', (e) => {
      // If clicked on the play trigger, or if item is a drive link, launch full cinema modal
      if (e.target.closest('.collage-play-trigger') || card.dataset.driveUrl) {
        const vidId = card.dataset.videoId;
        const driveUrl = card.dataset.driveUrl;
        const title = card.querySelector('.collage-title')?.textContent || 'Film Work';
        const role = card.querySelector('.collage-role-badge')?.textContent || 'Director · Editor';
        openCinemaModal(vidId, title, role, driveUrl);
        return;
      }
      const vidId = card.dataset.videoId;
      const targetIndex = REEL_DATA.findIndex(r => r.id === vidId);
      loadReelVideo(targetIndex >= 0 ? targetIndex : idx, true);
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    });
  });

  // Shuffle button (fast random roulette transition)
  shuffleBtn?.addEventListener('click', () => {
    shuffleBtn.classList.add('shuffling');
    let count = 0;
    const interval = setInterval(() => {
      const randIdx = Math.floor(Math.random() * REEL_DATA.length);
      count++;
      if (count > 6) {
        clearInterval(interval);
        shuffleBtn.classList.remove('shuffling');
        const finalIdx = Math.floor(Math.random() * REEL_DATA.length);
        loadReelVideo(finalIdx, true);
        const targetCard = document.querySelector(`.collage-card[data-video-id="${REEL_DATA[finalIdx].id}"]`);
        targetCard?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }, 80);
  });

  // ── CINEMA LIGHTBOX MODAL (Supports YouTube + Google Drive) ─
  const modal = document.getElementById('cinemaModal');
  const modalIframe = document.getElementById('cinemaModalIframe');
  const modalClose = document.getElementById('cinemaCloseBtn');
  const modalTitle = document.getElementById('cinemaTitle');
  const modalRoles = document.getElementById('cinemaRoles');

  window.openCinemaModal = function(videoId, title, role, driveUrl) {
    if (!modal || !modalIframe) return;

    if (driveUrl) {
      // Google Drive video preview URL
      modalIframe.src = driveUrl;
    } else if (videoId) {
      // YouTube embed URL
      modalIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
    }

    if (modalTitle) modalTitle.textContent = title || 'Work by Kisseh';
    if (modalRoles) modalRoles.textContent = role || 'Creative Direction · Filmmaking';
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    // Mute ambient background reel while modal is open to avoid audio clash
    postToReel('mute');
  };

  window.closeCinemaModal = function() {
    if (!modal || !modalIframe) return;
    modal.classList.remove('is-open');
    modalIframe.src = '';
    document.body.style.overflow = '';

    // Restore hero sound state if it was active
    if (isSoundActive) {
      postToReel('unMute');
    }
  };

  modalClose?.addEventListener('click', closeCinemaModal);
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeCinemaModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.classList.contains('is-open')) {
      closeCinemaModal();
    }
  });

  // Hook all data-open-cinema trigger buttons across the site
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-open-cinema]');
    if (trigger) {
      e.preventDefault();
      const vidId = trigger.dataset.videoId;
      const driveUrl = trigger.dataset.driveUrl;
      const title = trigger.dataset.videoTitle || 'Kisseh';
      const role = trigger.dataset.videoRole || 'Director · Filmmaker';
      openCinemaModal(vidId, title, role, driveUrl);
    }
  });

  // ── NAV: scroll class ──────────────────────────────────────
  const nav = document.getElementById('nav');
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // ── MOBILE MENU ───────────────────────────────────────────
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const menuClose  = document.getElementById('menuClose');
  const menuLinks  = document.querySelectorAll('.mobile-menu a');

  hamburger?.addEventListener('click', () => mobileMenu?.classList.add('open'));
  menuClose?.addEventListener('click', () => mobileMenu?.classList.remove('open'));
  menuLinks.forEach(l => l.addEventListener('click', () => mobileMenu?.classList.remove('open')));

  // ── FADE-UP OBSERVER ──────────────────────────────────────
  const fadeEls = document.querySelectorAll('.fade-up');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
  fadeEls.forEach(el => io.observe(el));

  // ── ACTIVE NAV LINK ───────────────────────────────────────
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => sectionObserver.observe(s));

  // ── COUNTER ANIMATION ─────────────────────────────────────
  const counters = document.querySelectorAll('[data-count]');
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      const duration = 1800;
      const start = performance.now();

      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = target * eased;
        el.textContent = prefix + (Number.isInteger(target) ? Math.floor(current) : current.toFixed(1)) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      };

      requestAnimationFrame(step);
      countIO.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => countIO.observe(c));

  // ── CONTACT FORM (Netlify) ────────────────────────────────
  const form = document.getElementById('contactForm');
  const formMsg = document.getElementById('formMsg');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Sending...';

    try {
      const data = new FormData(form);
      await fetch('/', { method: 'POST', body: data, headers: { 'Accept': 'application/x-www-form-urlencoded' } });
      formMsg.textContent = "Message received. I'll be in touch.";
      formMsg.style.color = '#4ade80';
      form.reset();
    } catch {
      formMsg.textContent = 'Something went wrong. Please email directly.';
      formMsg.style.color = '#f87171';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Send Message';
    }
  });

  // ── CURSOR GLOW (desktop only) ────────────────────────────
  if (window.innerWidth > 768) {
    const glow = document.createElement('div');
    glow.style.cssText = `
      position: fixed; pointer-events: none; z-index: 9999;
      width: 320px; height: 320px; border-radius: 50%;
      background: radial-gradient(circle, rgba(200,147,58,0.06) 0%, transparent 70%);
      transform: translate(-50%, -50%);
      transition: left 0.5s ease, top 0.5s ease;
      left: -999px; top: -999px;
    `;
    document.body.appendChild(glow);
    document.addEventListener('mousemove', (e) => {
      glow.style.left = e.clientX + 'px';
      glow.style.top  = e.clientY + 'px';
    });
  }

});
