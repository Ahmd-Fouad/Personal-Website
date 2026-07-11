import {
  initNavbar,
  initScrollProgress,
  initScrollTop,
  initMobileMenu,
  initThemeToggle,
  initContactForm,
  initModals,
  initSliders,
} from './ui';
import {
  initSmoothScroll,
  initHeroAnimation,
  initTypewriterTitle,
  initScrollReveals,
  initSkillBars,
} from './animations';

function boot() {
  // Content is visible by default (see .reveal in global.css), so a failure
  // here can't hide the page — this only guards against a partial init from
  // breaking interactivity and surfaces the error for diagnosis.
  try {
    // Smooth scroll first so nav / scroll-top / modals can share the instance.
    const lenis = initSmoothScroll();

    // UI interactions
    initNavbar(lenis);
    initScrollProgress();
    initScrollTop(lenis);
    initMobileMenu();
    initThemeToggle();
    initContactForm();
    initModals(lenis);
    initSliders();

    // Animations
    initHeroAnimation();
    initTypewriterTitle();
    initScrollReveals();
    initSkillBars();
  } catch (err) {
    console.error('Failed to initialize page scripts', err);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
