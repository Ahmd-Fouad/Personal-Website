import type Lenis from 'lenis';

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// --- Shared scroll scheduler ------------------------------------------------
// All scroll-driven visual updates (navbar background state, reading-progress
// bar, back-to-top visibility) register here so the page uses a single passive
// scroll listener and coalesces every reaction into one requestAnimationFrame
// per frame — instead of one listener + one rAF loop per feature.
type ScrollCallback = () => void;
const scrollCallbacks = new Set<ScrollCallback>();
let scrollTicking = false;
let scrollListenerAttached = false;

const flushScrollCallbacks = () => {
  scrollTicking = false;
  scrollCallbacks.forEach((cb) => cb());
};

const onSharedScroll = () => {
  if (scrollTicking) return;
  scrollTicking = true;
  window.requestAnimationFrame(flushScrollCallbacks);
};

/**
 * Register a scroll-driven visual update. It runs once immediately, then at
 * most once per animation frame while scrolling, sharing one passive listener.
 */
function onScroll(callback: ScrollCallback): void {
  scrollCallbacks.add(callback);
  if (!scrollListenerAttached) {
    window.addEventListener('scroll', onSharedScroll, { passive: true });
    scrollListenerAttached = true;
  }
  callback();
}

/**
 * Pause nonessential ambient CSS animation while the tab is hidden (a `[data-
 * doc-hidden]` attribute drives `animation-play-state: paused` in the CSS).
 */
export function initVisibilityAnimationPause(): void {
  const root = document.documentElement;
  const sync = () => {
    if (document.hidden) root.setAttribute('data-doc-hidden', '');
    else root.removeAttribute('data-doc-hidden');
  };
  document.addEventListener('visibilitychange', sync);
  sync();
}

/** Navbar background on scroll, scrollspy, and smooth anchor navigation. */
export function initNavbar(lenis: Lenis | null): void {
  const navbar = document.getElementById('navbar');
  const navLinks = Array.from(
    document.querySelectorAll<HTMLAnchorElement>('.nav-link, .nav-cta-link'),
  );
  const mobileNavLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('.mobile-nav-link'));
  const desktopNav = document.getElementById('desktop-nav');
  const navIndicator = document.getElementById('nav-active-indicator');
  const indicatorLinks = desktopNav
    ? Array.from(desktopNav.querySelectorAll<HTMLAnchorElement>('.nav-link'))
    : [];
  const sections = Array.from(document.querySelectorAll<HTMLElement>('section[id]'));
  let activeId = '';

  const hideActiveIndicator = () => {
    navIndicator?.classList.remove('is-ready');
  };

  const moveActiveIndicator = (activeLink: HTMLAnchorElement | undefined) => {
    if (!desktopNav || !navIndicator || !activeLink) {
      hideActiveIndicator();
      return;
    }

    const navRect = desktopNav.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();
    navIndicator.style.setProperty('--nav-indicator-x', `${linkRect.left - navRect.left}px`);
    navIndicator.style.setProperty('--nav-indicator-w', `${linkRect.width}px`);
    navIndicator.classList.add('is-ready');
  };

  const setActiveLink = (currentId: string) => {
    if (!currentId) {
      activeId = '';
      [...navLinks, ...mobileNavLinks].forEach((link) => {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      });
      hideActiveIndicator();
      return;
    }

    const activeHref = `#${currentId}`;
    const activeIndicatorLink = indicatorLinks.find((link) => link.getAttribute('href') === activeHref);

    if (currentId === activeId) {
      moveActiveIndicator(activeIndicatorLink);
      return;
    }

    activeId = currentId;
    [...navLinks, ...mobileNavLinks].forEach((link) => {
      const isActive = link.getAttribute('href') === activeHref;
      link.classList.toggle('active', isActive);
      if (isActive) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    moveActiveIndicator(activeIndicatorLink);
  };

  // Navbar background state shares the page-wide scroll scheduler. This is a
  // single `scrollY` read with no layout — the expensive per-frame section
  // geometry reads have moved to the IntersectionObserver scrollspy below.
  onScroll(() => {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 100);
  });

  // Scrollspy via IntersectionObserver: a section becomes active when it
  // crosses an activation band in the upper third of the viewport, so we never
  // read every section's `getBoundingClientRect()` on every scroll frame.
  const sectionVisible = new Map<string, boolean>();
  const refreshActiveSection = () => {
    let current = '';
    for (const section of sections) {
      if (sectionVisible.get(section.id)) current = section.id;
    }
    // Keep the last active section while briefly between bands (e.g. over a
    // section divider) so the indicator doesn't flicker off.
    if (current) setActiveLink(current);
  };

  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          sectionVisible.set((entry.target as HTMLElement).id, entry.isIntersecting);
        });
        refreshActiveSection();
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 },
    );
    sections.forEach((section) => spy.observe(section));
  }

  window.addEventListener(
    'resize',
    () => {
      if (!activeId) return;
      window.requestAnimationFrame(() =>
        moveActiveIndicator(indicatorLinks.find((link) => link.getAttribute('href') === `#${activeId}`)),
      );
    },
    { passive: true },
  );
  document.fonts?.ready.then(() => {
    if (activeId) {
      moveActiveIndicator(indicatorLinks.find((link) => link.getAttribute('href') === `#${activeId}`));
    }
  });

  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector<HTMLElement>(href);
      if (!target) return;

      e.preventDefault();
      closeMobileMenu();
      if (lenis) {
        lenis.scrollTo(target, { offset: -70 });
      } else {
        target.scrollIntoView({
          behavior: prefersReducedMotion() ? 'auto' : 'smooth',
          block: 'start',
        });
      }
      // Move focus to the destination (e.g. the skip link's #main target).
      // `preventScroll` avoids fighting the smooth scroll above; on targets
      // without `tabindex`, this is a harmless no-op per the DOM spec.
      target.focus({ preventScroll: true });
    });
  });
}

/** Top reading-progress bar. */
export function initScrollProgress(): void {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;

  onScroll(() => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    bar.style.width = `${pct}%`;
  });
}

/** Back-to-top floating button. */
export function initScrollTop(lenis: Lenis | null): void {
  const btn = document.getElementById('scroll-top');
  if (!btn) return;

  const update = () => {
    const visible = window.scrollY > 300;
    btn.style.opacity = visible ? '1' : '0';
    btn.style.pointerEvents = visible ? 'auto' : 'none';
  };

  btn.addEventListener('click', () => {
    if (lenis) lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  });

  onScroll(update);
}

let closeMobileMenu = () => {};

/** Accessible mobile menu toggle. */
export function initMobileMenu(): void {
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;

  const open = () => {
    menu.classList.remove('hidden');
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Close menu');
  };

  closeMobileMenu = () => {
    menu.classList.add('hidden');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Open menu');
  };

  btn.addEventListener('click', () => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMobileMenu() : open();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') {
      closeMobileMenu();
      btn.focus();
    }
  });

  // Tapping/clicking anywhere outside the open menu dismisses it.
  document.addEventListener('click', (e) => {
    if (btn.getAttribute('aria-expanded') !== 'true') return;
    const target = e.target as Node;
    if (!menu.contains(target) && !btn.contains(target)) closeMobileMenu();
  });
}

/** Light / dark theme toggle with persistence. */
export function initThemeToggle(): void {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  const root = document.documentElement;
  const themeColorMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  const sync = () => {
    btn.setAttribute('aria-pressed', root.getAttribute('data-theme') === 'light' ? 'true' : 'false');
    // Keep the browser UI (mobile address bar) matched to the page background.
    const bg = getComputedStyle(root).getPropertyValue('--bg').trim();
    if (themeColorMeta && bg) themeColorMeta.content = bg;
  };

  sync();

  btn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try {
      localStorage.setItem('theme', next);
    } catch {
      /* ignore storage errors */
    }
    sync();
  });
}

/** Netlify contact form: async submit with accessible status feedback. */
export function initContactForm(): void {
  const form = document.getElementById('contact-form') as HTMLFormElement | null;
  const btn = form?.querySelector<HTMLButtonElement>('button[type="submit"]');
  if (!form || !btn) return;

  const status = document.getElementById('contact-form-status');
  const originalLabel = btn.innerHTML;
  const REQUEST_TIMEOUT_MS = 15000;

  const setStatus = (message: string, tone: 'polite' | 'assertive') => {
    if (!status) return;
    status.setAttribute('role', tone === 'assertive' ? 'alert' : 'status');
    status.setAttribute('aria-live', tone);
    status.textContent = message;
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    btn.innerHTML = 'Sending...';
    btn.disabled = true;
    btn.setAttribute('aria-busy', 'true');
    setStatus('Sending your message…', 'polite');

    const body = new URLSearchParams(new FormData(form) as unknown as Record<string, string>).toString();
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    fetch(form.action || window.location.href, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error('Netlify submission failed.');
        form.reset();
        btn.innerHTML = 'Message Sent';
        btn.removeAttribute('aria-busy');
        btn.style.backgroundColor = '#22c55e';
        setStatus('Your message was sent successfully. Thank you — I will get back to you soon.', 'polite');
      })
      .catch((err) => {
        console.error('Submission Error:', err);
        btn.innerHTML = 'Submission Failed';
        btn.removeAttribute('aria-busy');
        btn.style.backgroundColor = '#ef4444';
        const timedOut = err instanceof DOMException && err.name === 'AbortError';
        setStatus(
          timedOut
            ? 'The request timed out. Please check your connection and try again, or email me directly using the address above.'
            : 'Something went wrong sending your message. Please try again, or email me directly using the address above.',
          'assertive',
        );
      })
      .finally(() => {
        window.clearTimeout(timeoutId);
        window.setTimeout(() => {
          btn.innerHTML = originalLabel;
          btn.disabled = false;
          btn.removeAttribute('aria-busy');
          btn.style.backgroundColor = '';
        }, 3000);
      });
  });
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * The pointer never leaves a trigger while its modal is open, so the browser
 * keeps :hover on it and the card looks "stuck" highlighted after closing.
 * Disable pointer events on the trigger's card until the pointer actually
 * moves off it once (or the user interacts anywhere else).
 */
function muteHoverUntilPointerLeaves(el: HTMLElement): void {
  el.classList.add('hover-muted');

  const release = () => {
    el.classList.remove('hover-muted');
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerdown', release);
  };
  const onPointerMove = (e: PointerEvent) => {
    const rect = el.getBoundingClientRect();
    const inside =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom;
    if (!inside) release();
  };

  document.addEventListener('pointermove', onPointerMove, { passive: true });
  document.addEventListener('pointerdown', release, { passive: true });
}

/** Project and portfolio modals: open/close, focus trap, ESC, scroll lock. */
export function initModals(lenis: Lenis | null): void {
  const modals = Array.from(document.querySelectorAll<HTMLElement>('.project-modal'));
  if (!modals.length) return;

  let activeModal: HTMLElement | null = null;
  let lastFocused: HTMLElement | null = null;
  let restoreFocusOnClose = false;
  let closeTimer: number | undefined;
  let savedScrollY = 0;

  // Scroll lock lives on <html>: overflow:hidden there blocks wheel, keyboard,
  // and scrollbar dragging while preserving the scroll offset, and the measured
  // scrollbar width is fed to CSS (--scrollbar-comp pads <body> and the fixed
  // navbar) so nothing shifts horizontally when the scrollbar disappears.
  const lockScroll = () => {
    const root = document.documentElement;
    if (root.classList.contains('scroll-locked')) return;
    savedScrollY = window.scrollY;
    const scrollbarWidth = window.innerWidth - root.clientWidth;
    root.style.setProperty('--scrollbar-comp', `${scrollbarWidth}px`);
    root.classList.add('scroll-locked');
    lenis?.stop();
  };

  const unlockScroll = () => {
    const root = document.documentElement;
    root.classList.remove('scroll-locked');
    root.style.removeProperty('--scrollbar-comp');
    if (lenis) {
      // Re-sync Lenis's internal position before resuming so the first wheel
      // tick after closing can't jump back to a stale offset.
      lenis.scrollTo(savedScrollY, { immediate: true, force: true });
      lenis.start();
    } else if (Math.abs(window.scrollY - savedScrollY) > 1) {
      window.scrollTo({ top: savedScrollY, left: 0, behavior: 'instant' });
    }
  };

  // `click` events fired by Enter/Space on a focused control have detail === 0,
  // which is how we tell keyboard activation apart from pointer clicks.
  const openModal = (modal: HTMLElement, trigger: HTMLElement, viaKeyboard: boolean) => {
    if (closeTimer) window.clearTimeout(closeTimer);

    lastFocused = trigger;
    restoreFocusOnClose = viaKeyboard;
    activeModal = modal;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    lockScroll();

    window.requestAnimationFrame(() => {
      modal.classList.add('is-open');
      const first = modal.querySelector<HTMLElement>(FOCUSABLE);
      first?.focus();
    });
  };

  const closeModal = () => {
    if (!activeModal) return;

    const modal = activeModal;
    activeModal = null;
    modal.classList.remove('is-open');
    unlockScroll();

    if (restoreFocusOnClose) {
      // Keyboard users keep their place in the tab order (and the focus ring).
      lastFocused?.focus();
    } else {
      // Pointer users: leave the trigger with no lingering focus ring or
      // stuck :hover overlay/lift.
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      if (lastFocused) {
        muteHoverUntilPointerLeaves(lastFocused.closest<HTMLElement>('.neu-card') ?? lastFocused);
      }
    }

    closeTimer = window.setTimeout(
      () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      },
      prefersReducedMotion() ? 0 : 220,
    );
  };

  document.querySelectorAll<HTMLElement>('[data-modal-target]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const id = btn.getAttribute('data-modal-target');
      const modal = document.getElementById(`project-modal-${id}`);
      if (modal) openModal(modal, btn, e.detail === 0);
    });
  });

  const portfolioModal = document.getElementById('portfolio-modal');
  if (portfolioModal) {
    document.querySelectorAll<HTMLElement>('[data-gallery-open]').forEach((btn) => {
      btn.addEventListener('click', (e) => openModal(portfolioModal, btn, e.detail === 0));
    });
  }

  modals.forEach((modal) => {
    modal.querySelectorAll('.modal-close').forEach((close) =>
      close.addEventListener('click', closeModal),
    );

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    // iOS Safari ignores overflow:hidden for touch scrolling, so swipes on the
    // open modal that start outside a designated scroll region must not reach
    // the page. Regions marked data-modal-scroll keep their own (contained)
    // touch scrolling.
    modal.addEventListener(
      'touchmove',
      (e) => {
        const target = e.target instanceof Element ? e.target : null;
        if (!target?.closest('[data-modal-scroll]')) e.preventDefault();
      },
      { passive: false },
    );
  });

  document.addEventListener('keydown', (e) => {
    if (!activeModal) return;

    if (e.key === 'Escape') {
      closeModal();
      return;
    }

    if (e.key !== 'Tab') return;

    const items = Array.from(activeModal.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => el.offsetParent !== null,
    );
    if (!items.length) return;

    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
}

interface SliderController {
  goTo: (index: number, behavior?: ScrollBehavior) => void;
  next: () => void;
  prev: () => void;
}

function createLoopedSlider(
  trackId: string,
  prevId: string,
  nextId: string,
  counterId?: string,
): SliderController | null {
  const track = document.getElementById(trackId);
  const prev = document.getElementById(prevId);
  const next = document.getElementById(nextId);
  const counter = counterId ? document.getElementById(counterId) : null;
  if (!track || !prev || !next) return null;

  const slides = Array.from(track.children) as HTMLElement[];
  if (!slides.length) return null;

  let currentIndex = 0;
  let frame = 0;
  let restoreScrollBehaviorFrame = 0;

  const normalize = (index: number) => (index + slides.length) % slides.length;

  const updateCounter = () => {
    if (counter) counter.textContent = `${currentIndex + 1} / ${slides.length}`;
  };

  const syncFromScroll = () => {
    const center = track.scrollLeft + track.clientWidth / 2;
    let nearest = currentIndex;
    let nearestDistance = Number.POSITIVE_INFINITY;

    slides.forEach((slide, index) => {
      const slideCenter = slide.offsetLeft + slide.clientWidth / 2;
      const distance = Math.abs(center - slideCenter);
      if (distance < nearestDistance) {
        nearest = index;
        nearestDistance = distance;
      }
    });

    currentIndex = nearest;
    updateCounter();
  };

  const goTo = (index: number, behavior: ScrollBehavior = 'smooth') => {
    currentIndex = normalize(index);
    const slide = slides[currentIndex];
    if (prefersReducedMotion() || behavior === 'auto') {
      const previousScrollBehavior = track.style.scrollBehavior;
      if (restoreScrollBehaviorFrame) {
        window.cancelAnimationFrame(restoreScrollBehaviorFrame);
      }

      track.style.scrollBehavior = 'auto';
      track.scrollLeft = slide.offsetLeft;
      updateCounter();
      restoreScrollBehaviorFrame = window.requestAnimationFrame(() => {
        track.style.scrollBehavior = previousScrollBehavior;
        restoreScrollBehaviorFrame = 0;
        syncFromScroll();
      });
      return;
    }

    track.scrollTo({ left: slide.offsetLeft, behavior });
    updateCounter();
  };

  const nextSlide = () => goTo(currentIndex + 1, currentIndex === slides.length - 1 ? 'auto' : 'smooth');
  const prevSlide = () => goTo(currentIndex - 1, currentIndex === 0 ? 'auto' : 'smooth');

  prev.addEventListener('click', prevSlide);
  next.addEventListener('click', nextSlide);

  track.addEventListener(
    'scroll',
    () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        syncFromScroll();
      });
    },
    { passive: true },
  );

  // Stop propagation so this key press isn't *also* handled by the
  // document-level ArrowLeft/ArrowRight listener in `initSliders` below —
  // without this, focusing the track and pressing an arrow key moved two
  // slides per press instead of one.
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      e.stopPropagation();
      nextSlide();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      e.stopPropagation();
      prevSlide();
    }
  });

  updateCounter();

  return {
    goTo,
    next: nextSlide,
    prev: prevSlide,
  };
}

/** Horizontal scroll-snap sliders for the gallery lightbox and video showreel. */
export function initSliders(): void {
  const gallery = createLoopedSlider('gallery-track', 'gallery-prev', 'gallery-next', 'gallery-counter');
  // Prev/next navigation for the showreel (playback is handled by initShowreel).
  createLoopedSlider('video-track', 'video-prev', 'video-next');

  if (gallery) {
    const portfolioModal = document.getElementById('portfolio-modal');

    document.querySelectorAll<HTMLElement>('[data-gallery-open]').forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const index = Number(trigger.dataset.galleryOpen ?? 0);
        const targetIndex = Number.isFinite(index) ? index : 0;
        window.requestAnimationFrame(() => gallery.goTo(targetIndex, 'auto'));
      });
    });

    document.addEventListener('keydown', (e) => {
      if (!portfolioModal?.classList.contains('is-open')) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        gallery.next();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        gallery.prev();
      }
    });
  }
}

interface ShowreelItem {
  slide: HTMLElement;
  video: HTMLVideoElement;
  source: HTMLSourceElement;
  toggle: HTMLButtonElement;
  muteBtn: HTMLButtonElement | null;
  label: string;
  playPending: boolean;
  userPaused: boolean;
}

/**
 * Poster-first showreel with intelligent autoplay. Media URLs stay in
 * `data-src` so the initial page load never fetches an MP4; one
 * IntersectionObserver warms only the active slide's video as the reel nears
 * the viewport and a second starts muted playback once the reel is
 * sufficiently visible. Playback pauses when the reel leaves the viewport,
 * the tab is hidden, or another slide is selected; a slide the user manually
 * paused never auto-resumes. Autoplay is skipped entirely under
 * prefers-reduced-motion or Save-Data, leaving the manual controls in charge.
 */
export function initShowreel(): void {
  const track = document.getElementById('video-track');
  if (!track) return;

  const slides = Array.from(track.querySelectorAll<HTMLElement>('[data-video-slide]'));
  const items = slides
    .map((slide): ShowreelItem | null => {
      const video = slide.querySelector<HTMLVideoElement>('video');
      const source = video?.querySelector<HTMLSourceElement>('source');
      const toggle = slide.querySelector<HTMLButtonElement>('[data-video-toggle]');
      if (!video || !source || !toggle) return null;
      return {
        slide,
        video,
        source,
        toggle,
        muteBtn: slide.querySelector<HTMLButtonElement>('[data-video-mute]'),
        label: video.getAttribute('aria-label') ?? 'showreel video',
        playPending: false,
        userPaused: false,
      };
    })
    .filter((item): item is ShowreelItem => item !== null);

  if (!items.length) return;

  const saveData =
    (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
  const autoplayEligible = () => !prefersReducedMotion() && !saveData;

  // True while the reel is "sufficiently visible" (≥40% in the viewport).
  let sectionVisible = false;

  const syncControl = (item: ShowreelItem) => {
    const playing = !item.video.paused && !item.video.ended;
    item.slide.classList.toggle('is-playing', playing);
    item.toggle.setAttribute('aria-label', `${playing ? 'Pause' : 'Play'} ${item.label}`);
    item.toggle.setAttribute('aria-pressed', String(playing));
  };

  const syncMute = (item: ShowreelItem) => {
    if (!item.muteBtn) return;
    const muted = item.video.muted;
    item.slide.classList.toggle('is-muted', muted);
    item.muteBtn.setAttribute('aria-label', `${muted ? 'Unmute' : 'Mute'} ${item.label}`);
  };

  const pauseAll = (except?: ShowreelItem) => {
    items.forEach((item) => {
      if (item !== except && !item.video.paused) item.video.pause();
    });
  };

  /** Attach the real media URL and start buffering; safe to call repeatedly. */
  const prepareItem = (item: ShowreelItem) => {
    if (item.source.src) return;
    const mediaUrl = item.source.dataset.src;
    if (!mediaUrl) return;
    item.source.src = mediaUrl;
    item.video.preload = 'auto';
    item.video.load();
  };

  const playItem = async (item: ShowreelItem, viaAutoplay: boolean) => {
    if (item.playPending || !item.video.paused) return;

    if (!item.source.dataset.src) {
      item.toggle.setAttribute('aria-label', `Play unavailable: ${item.label}`);
      return;
    }

    pauseAll(item);
    item.playPending = true;
    item.toggle.setAttribute('aria-busy', 'true');

    if (viaAutoplay) {
      // Autoplay must begin muted; the attribute also covers the window
      // between load() and the play() promise settling.
      item.video.muted = true;
      item.video.autoplay = true;
      syncMute(item);
    }
    prepareItem(item);

    try {
      await item.video.play();
    } catch {
      // Autoplay rejection or a network failure: clear the autoplay intent and
      // leave the poster with a usable, retryable Play control.
      item.video.autoplay = false;
      syncControl(item);
    } finally {
      item.playPending = false;
      item.toggle.removeAttribute('aria-busy');
    }
  };

  items.forEach((item) => {
    item.video.addEventListener('play', () => syncControl(item));
    item.video.addEventListener('pause', () => {
      // Any pause cancels pending autoplay intent so buffered data arriving
      // later cannot restart a video the user (or viewport exit) stopped.
      item.video.autoplay = false;
      syncControl(item);
    });
    item.video.addEventListener('error', () => syncControl(item));
    item.video.addEventListener('volumechange', () => syncMute(item));
    item.toggle.addEventListener('click', () => {
      if (item.video.paused) {
        item.userPaused = false;
        void playItem(item, false);
      } else {
        item.userPaused = true;
        item.video.pause();
      }
    });
    item.muteBtn?.addEventListener('click', () => {
      item.video.muted = !item.video.muted;
    });
    syncMute(item);
  });

  // The slide nearest the track's horizontal centre is the "active" one.
  const activeItem = (): ShowreelItem => {
    const center = track.scrollLeft + track.clientWidth / 2;
    let nearest = items[0];
    let bestDistance = Number.POSITIVE_INFINITY;
    items.forEach((item) => {
      const slideCenter = item.slide.offsetLeft + item.slide.clientWidth / 2;
      const distance = Math.abs(center - slideCenter);
      if (distance < bestDistance) {
        bestDistance = distance;
        nearest = item;
      }
    });
    return nearest;
  };

  /** Start muted playback of the active slide when every gate allows it. */
  const maybeAutoplay = () => {
    if (!sectionVisible || document.hidden || !autoplayEligible()) return;
    const active = activeItem();
    if (active.userPaused) return;
    void playItem(active, true);
  };

  if ('IntersectionObserver' in window) {
    // Warm the active video slightly before the reel scrolls into view so
    // autoplay can start without a buffering stall. Inactive slides stay cold.
    if (autoplayEligible()) {
      const warm = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) prepareItem(activeItem());
          });
        },
        { rootMargin: '25% 0px' },
      );
      warm.observe(track);
    }

    const player = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          sectionVisible = entry.isIntersecting && entry.intersectionRatio >= 0.4;
          if (sectionVisible) maybeAutoplay();
          // Only a full exit pauses — between 0–40% visibility playback
          // continues, so there is no flicker at the threshold edge.
          else if (!entry.isIntersecting) pauseAll();
        });
      },
      { threshold: [0, 0.4] },
    );
    player.observe(track);
  }

  // Hidden tab pauses playback; returning resumes only slides that were
  // auto-paused (a manual pause is remembered via userPaused).
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pauseAll();
    else maybeAutoplay();
  });

  // Swiping to another slide pauses the rest immediately, then the newly
  // centred slide may autoplay (muted) once the scroll settles.
  let scrollFrame = 0;
  let settleTimer: number | undefined;
  track.addEventListener(
    'scroll',
    () => {
      if (settleTimer) window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(maybeAutoplay, 180);
      if (scrollFrame) return;
      scrollFrame = window.requestAnimationFrame(() => {
        scrollFrame = 0;
        const active = activeItem();
        pauseAll(active);
      });
    },
    { passive: true },
  );
}
