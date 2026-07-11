import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Lenis smooth scrolling, synced with GSAP's ticker and ScrollTrigger.
 * Disabled entirely when the user prefers reduced motion.
 */
export function initSmoothScroll(): Lenis | null {
  if (prefersReducedMotion) return null;

  const lenis = new Lenis({
    lerp: 0.1,
    wheelMultiplier: 1,
    smoothWheel: true,
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  return lenis;
}

/**
 * Hero entrance timeline, played once on load.
 *
 * The hero portrait (`.hero-img`) and the name heading (`.hero-name`) are the
 * likely LCP elements, so they are deliberately excluded from this animation:
 * they paint in the first frame at full opacity with no blur/transform and no
 * dependency on JavaScript. Only the secondary copy (job-title, tagline, and
 * action buttons) gets the staggered fade-in, preserving the entrance polish.
 */
export function initHeroAnimation(): void {
  const copyEls = gsap.utils.toArray<HTMLElement>('.hero-el:not(.hero-img):not(.hero-name)');
  if (!copyEls.length) return;

  if (prefersReducedMotion) {
    gsap.set(copyEls, { opacity: 1, y: 0 });
    return;
  }

  const timeline = gsap.timeline({ delay: 0.04, defaults: { ease: 'power3.out' } });

  timeline.from(copyEls, {
    autoAlpha: 0,
    y: 28,
    filter: 'blur(7px)',
    duration: 0.66,
    stagger: 0.06,
    clearProps: 'filter',
  });
}

/** Lightweight looping hero job-title typewriter with a reduced-motion fallback. */
export function initTypewriterTitle(): void {
  const shell = document.querySelector<HTMLElement>('[data-typewriter]');
  const textEl = shell?.querySelector<HTMLElement>('[data-typewriter-text]');
  if (!shell || !textEl || shell.dataset.typewriterStarted === 'true') return;

  const texts = (shell.dataset.texts ?? '')
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean);
  const fallbackText = shell.dataset.text?.trim() || textEl.textContent?.trim() || '';
  if (!texts.length && fallbackText) texts.push(fallbackText);
  if (!texts.length) return;

  shell.dataset.typewriterStarted = 'true';

  if (prefersReducedMotion) {
    textEl.textContent = texts[0];
    shell.classList.add('is-complete');
    return;
  }

  const startDelay = 420;
  const typeSpeed = 36;
  const deleteSpeed = 22;
  const holdDelay = 1450;
  const loopDelay = 320;
  let isActive = true;
  let textIndex = 0;

  const wait = (ms: number) =>
    new Promise<void>((resolve) => {
      window.setTimeout(resolve, ms);
    });

  const getTypingDelay = (text: string, index: number) => {
    const current = text[index - 1] ?? '';
    return current === ' ' ? typeSpeed * 0.6 : typeSpeed + (index % 4) * 4;
  };

  const runLoop = async () => {
    await wait(startDelay);

    while (isActive) {
      const text = texts[textIndex % texts.length];

      shell.classList.add('is-typing');
      shell.classList.remove('is-deleting', 'is-complete');
      for (let i = 1; i <= text.length && isActive; i += 1) {
        textEl.textContent = text.slice(0, i);
        await wait(getTypingDelay(text, i));
      }

      shell.classList.remove('is-typing');
      shell.classList.add('is-complete');
      await wait(holdDelay);

      shell.classList.add('is-deleting');
      shell.classList.remove('is-complete');
      for (let i = text.length - 1; i >= 0 && isActive; i -= 1) {
        textEl.textContent = text.slice(0, i);
        await wait(text[i] === ' ' ? deleteSpeed * 0.65 : deleteSpeed);
      }

      shell.classList.remove('is-deleting');
      textIndex += 1;
      await wait(loopDelay);
    }
  };

  textEl.textContent = '';
  window.addEventListener('pagehide', () => {
    isActive = false;
  });
  void runLoop();
}

/** Scroll-triggered reveals with a soft stagger per viewport batch. */
export function initScrollReveals(): void {
  const reveals = gsap.utils.toArray<HTMLElement>('.reveal');
  if (!reveals.length) return;

  if (prefersReducedMotion) {
    gsap.set(reveals, { opacity: 1, y: 0, scale: 1 });
    return;
  }

  // Content is visible by default (progressive enhancement — see the
  // `.reveal` rule in global.css); only hide it for the scroll-in animation
  // once GSAP/ScrollTrigger have actually initialized successfully.
  document.documentElement.classList.add('js-reveal-ready');
  gsap.set(reveals, { opacity: 0, y: 32, scale: 0.985 });

  ScrollTrigger.batch('.reveal', {
    start: 'top 88%',
    once: true,
    interval: 0.08,
    batchMax: 8,
    onEnter: (batch) =>
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.72,
        ease: 'power3.out',
        stagger: 0.09,
        overwrite: true,
      }),
  });
}

/** Animate skill meters to their data-width when scrolled into view. */
export function initSkillBars(): void {
  const bars = gsap.utils.toArray<HTMLElement>('.skill-fill');
  bars.forEach((bar) => {
    const width = bar.getAttribute('data-width') ?? '0';
    if (prefersReducedMotion) {
      bar.style.width = `${width}%`;
      return;
    }
    ScrollTrigger.create({
      trigger: bar,
      start: 'top 92%',
      once: true,
      onEnter: () => {
        bar.style.width = `${width}%`;
      },
    });
  });
}
