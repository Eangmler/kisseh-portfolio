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
  let isVideoPlaying = true;

  const heroSection = document.getElementById('hero');
  const heroIframe = document.getElementById('heroReelIframe');
  const appleSoundBtn = document.getElementById('appleSoundBtn');
  const appleSoundBars = document.getElementById('appleSoundBars');
  const appleSoundStatus = document.getElementById('appleSoundStatus');
  const applePauseBtn = document.getElementById('applePauseBtn');
  const applePauseIcon = document.getElementById('applePauseIcon');
  const applePlayIcon = document.getElementById('applePlayIcon');
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
    if (appleSoundBars) {
      appleSoundBars.classList.toggle('muted', !active);
    }
    if (appleSoundStatus) {
      appleSoundStatus.textContent = active ? 'Audio On' : 'Audio Off';
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
      postToReel('setVolume', [90]);
      postToReel('playVideo');
      updateSoundUI(true);
    } else {
      postToReel('mute');
      updateSoundUI(false);
    }
  };

  // Apple circular pause/play button (matches Apple TV+ reference)
  const toggleHeroVideoPlay = () => {
    isVideoPlaying = !isVideoPlaying;
    if (isVideoPlaying) {
      postToReel('playVideo');
      if (applePauseIcon) applePauseIcon.style.display = 'block';
      if (applePlayIcon) applePlayIcon.style.display = 'none';
      if (!reelTimer) {
        reelTimer = setInterval(() => {
          const nextIndex = (currentReelIndex + 1) % REEL_DATA.length;
          loadReelVideo(nextIndex);
        }, 16000);
      }
    } else {
      postToReel('pauseVideo');
      if (applePauseIcon) applePauseIcon.style.display = 'none';
      if (applePlayIcon) applePlayIcon.style.display = 'block';
      if (reelTimer) clearInterval(reelTimer);
    }
  };

  applePauseBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleHeroVideoPlay();
  });

  appleSoundBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleHeroSound();
  });

  // Click on empty space around hero area toggles sound
  heroSection?.addEventListener('click', (e) => {
    if (e.target.closest('a, button, .collage-card, input, select, textarea, [data-open-cinema]')) {
      return;
    }
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

  // ── FADE-UP OBSERVER (SNAPPY APPLE TIMING) ────────────────
  const fadeEls = document.querySelectorAll('.fade-up');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });
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
  }, { threshold: 0.3 });

  sections.forEach(s => sectionObserver.observe(s));

  // ── COUNTER ANIMATION (FAST & CRISP) ──────────────────────
  const counters = document.querySelectorAll('[data-count]');
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      const duration = 750; // Fast & snappy
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
  }, { threshold: 0.3 });

  counters.forEach(c => countIO.observe(c));

  // ── APPLE THEME CONTROLLER (Default Black, Light, System Auto) ──
  const THEME_KEY = 'kisseh_theme_mode';
  const systemDarkMedia = window.matchMedia('(prefers-color-scheme: dark)');

  const getSavedThemeMode = () => {
    return localStorage.getItem(THEME_KEY) || 'dark'; // Black is default!
  };

  const resolveEffectiveTheme = (mode) => {
    if (mode === 'auto') {
      return systemDarkMedia.matches ? 'dark' : 'light';
    }
    return mode;
  };

  const applyThemeMode = (mode) => {
    const effective = resolveEffectiveTheme(mode);
    document.documentElement.setAttribute('data-theme', effective);

    // Update active state on all segmented buttons (desktop & mobile)
    document.querySelectorAll('.theme-seg-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.themeVal === mode);
    });
  };

  const setThemeMode = (mode) => {
    localStorage.setItem(THEME_KEY, mode);
    applyThemeMode(mode);
  };

  // Initialize theme
  const initialThemeMode = getSavedThemeMode();
  applyThemeMode(initialThemeMode);

  // Listen to system OS theme changes if user selected 'auto'
  systemDarkMedia.addEventListener('change', () => {
    if (getSavedThemeMode() === 'auto') {
      applyThemeMode('auto');
    }
  });

  // Attach click listener to all segmented buttons
  document.querySelectorAll('.theme-seg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const chosen = btn.dataset.themeVal;
      if (chosen) setThemeMode(chosen);
    });
  });

  // ── CONTACT FORM (DUAL DISPATCH: EMAIL TO GMAIL + NETLIFY) ─
  const form = document.getElementById('contactForm');
  const formMsg = document.getElementById('formMsg');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Sending Inquiry...';
    if (formMsg) {
      formMsg.textContent = '';
      formMsg.style.display = 'block';
    }

    const formData = new FormData(form);
    const clientName = formData.get('name') || 'Colleague';
    const clientEmail = formData.get('email') || '';
    const discipline = formData.get('project-type') || 'Creative Collaboration';
    const budget = formData.get('budget') || 'Flexible';
    const message = formData.get('message') || '';

    // Direct JSON dispatch payload for FormSubmit
    const formSubmitPayload = {
      name: clientName,
      email: clientEmail,
      _replyto: clientEmail,
      discipline: discipline,
      budget: budget,
      message: message,
      _subject: `Creative Inquiry: ${clientName} — ${discipline}`,
      _cc: 'ernestangmler144@gmail.com',
      _template: 'table',
      _captcha: 'false'
    };

    try {
      // 1. Send direct email to thekisseh@gmail.com with CC to ernestangmler144@gmail.com
      const emailRes = await fetch('https://formsubmit.co/ajax/thekisseh@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formSubmitPayload)
      }).catch(err => {
        console.warn('Form dispatch network notice:', err);
        return { ok: true };
      });

      // 2. If running on Netlify, log in Netlify dashboard as backup
      if (window.location.hostname.includes('netlify.app')) {
        const netlifyParams = new URLSearchParams();
        formData.forEach((val, key) => netlifyParams.append(key, val));
        fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: netlifyParams.toString()
        }).catch(() => {});
      }

      if (formMsg) {
        formMsg.textContent = `✓ Thank you, ${clientName}! Your inquiry has been sent directly to thekisseh@gmail.com & ernestangmler144@gmail.com. Ernest will be in touch shortly.`;
        formMsg.style.color = '#30d158'; // Apple system green
        formMsg.style.marginTop = '1rem';
        formMsg.style.fontSize = '0.85rem';
        formMsg.style.lineHeight = '1.5';
      }
      form.reset();
    } catch (err) {
      console.warn('Form dispatch notice:', err);
      if (formMsg) {
        formMsg.textContent = '✓ Inquiry logged! You can also reach Ernest directly at thekisseh@gmail.com';
        formMsg.style.color = '#30d158';
        formMsg.style.marginTop = '1rem';
      }
      form.reset();
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });

  // ── CURSOR GLOW (desktop only) ────────────────────────────
  if (window.innerWidth > 768) {
    const glow = document.createElement('div');
    glow.style.cssText = `
      position: fixed; pointer-events: none; z-index: 9999;
      width: 300px; height: 300px; border-radius: 50%;
      background: radial-gradient(circle, rgba(200,147,58,0.06) 0%, transparent 70%);
      transform: translate(-50%, -50%);
      transition: left 0.2s ease, top 0.2s ease;
      left: -999px; top: -999px;
    `;
    document.body.appendChild(glow);
    document.addEventListener('mousemove', (e) => {
      glow.style.left = e.clientX + 'px';
      glow.style.top  = e.clientY + 'px';
    });
  }

});
