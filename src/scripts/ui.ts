import type Lenis from 'lenis';

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
      navLinks.forEach((link) => link.classList.remove('active'));
      mobileNavLinks.forEach((link) => link.classList.remove('active'));
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
    navLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === activeHref);
    });
    mobileNavLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === activeHref);
    });
    moveActiveIndicator(activeIndicatorLink);
  };

  const getActiveSectionId = () => {
    if (!sections.length) return '';

    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const navHeight = navbar?.getBoundingClientRect().height ?? 0;
    const activationLine = Math.min(viewportHeight * 0.52, navHeight + viewportHeight * 0.34);
    const pageBottom = window.scrollY + viewportHeight >= document.documentElement.scrollHeight - 2;

    if (pageBottom) return sections[sections.length - 1]?.id ?? '';

    let currentId = '';
    let bestDistance = Number.POSITIVE_INFINITY;
    let bestOffsetTop = Number.NEGATIVE_INFINITY;

    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      const visibleTop = Math.max(rect.top, navHeight);
      const visibleBottom = Math.min(rect.bottom, viewportHeight);
      if (visibleBottom <= visibleTop) continue;

      const distance =
        rect.top <= activationLine && rect.bottom >= activationLine
          ? 0
          : Math.min(Math.abs(rect.top - activationLine), Math.abs(rect.bottom - activationLine));

      if (
        distance < bestDistance - 1 ||
        (Math.abs(distance - bestDistance) <= 1 && section.offsetTop > bestOffsetTop)
      ) {
        currentId = section.id;
        bestDistance = distance;
        bestOffsetTop = section.offsetTop;
      }
    }

    return currentId;
  };

  const onScroll = () => {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 100);
    setActiveLink(getActiveSectionId());
  };

  // Coalesce scroll events (fired every frame under smooth scrolling) into at
  // most one layout read per animation frame.
  let scrollFrame = 0;
  const onScrollThrottled = () => {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(() => {
      scrollFrame = 0;
      onScroll();
    });
  };

  window.addEventListener('scroll', onScrollThrottled, { passive: true });
  window.addEventListener('resize', () => {
    if (!activeId) return;
    window.requestAnimationFrame(() =>
      moveActiveIndicator(indicatorLinks.find((link) => link.getAttribute('href') === `#${activeId}`)),
    );
  });
  document.fonts?.ready.then(() => {
    if (activeId) {
      moveActiveIndicator(indicatorLinks.find((link) => link.getAttribute('href') === `#${activeId}`));
    }
  });
  onScroll();

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
    });
  });
}

/** Top reading-progress bar. */
export function initScrollProgress(): void {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;

  const update = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    bar.style.width = `${pct}%`;
  };

  let frame = 0;
  window.addEventListener(
    'scroll',
    () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    },
    { passive: true },
  );
  update();
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

  let frame = 0;
  window.addEventListener(
    'scroll',
    () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    },
    { passive: true },
  );
  update();
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

/** Netlify contact form: async submit with button state feedback. */
export function initContactForm(): void {
  const form = document.getElementById('contact-form') as HTMLFormElement | null;
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (!btn) return;

    const original = btn.innerHTML;
    btn.innerHTML = 'Sending...';
    btn.disabled = true;

    const body = new URLSearchParams(new FormData(form) as unknown as Record<string, string>).toString();

    fetch(form.action || window.location.href, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })
      .then((res) => {
        if (!res.ok) throw new Error('Netlify submission failed.');
        form.reset();
        btn.innerHTML = 'Message Sent Successfully';
        btn.style.backgroundColor = '#22c55e';
      })
      .catch((err) => {
        console.error('Submission Error:', err);
        btn.innerHTML = 'Submission Failed';
        btn.style.backgroundColor = '#ef4444';
      })
      .finally(() => {
        setTimeout(() => {
          btn.innerHTML = original;
          btn.disabled = false;
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

  const lockScroll = () => {
    document.body.style.overflow = 'hidden';
    lenis?.stop();
  };

  const unlockScroll = () => {
    document.body.style.overflow = '';
    lenis?.start();
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

  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextSlide();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
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

/** Horizontal scroll-snap sliders for gallery lightbox and video showreel. */
export function initSliders(): void {
  const gallery = createLoopedSlider('gallery-track', 'gallery-prev', 'gallery-next', 'gallery-counter');
  const video = createLoopedSlider('video-track', 'video-prev', 'video-next');

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

  if (!video) return;

  const videoTrack = document.getElementById('video-track');
  if (!videoTrack || !('IntersectionObserver' in window)) return;

  const videos = Array.from(videoTrack.querySelectorAll('video'));
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const videoEl = entry.target as HTMLVideoElement;
        if (entry.isIntersecting) {
          videoEl.play().catch(() => {
            /* autoplay may be blocked */
          });
        } else {
          videoEl.pause();
        }
      });
    },
    { root: videoTrack, threshold: 0.55 },
  );

  videos.forEach((videoEl) => observer.observe(videoEl));
}
