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
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
