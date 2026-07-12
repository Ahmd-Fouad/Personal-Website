// Progressive media loading for the project modals and the portfolio
// gallery: instant previews reused from already-cached card/thumbnail
// images, prioritized final loads on activation, and intent-based
// preloading of likely-next images. Nothing here fetches anything on the
// initial page load — every request starts from user proximity or intent.

type PriorityImage = HTMLImageElement & { fetchPriority?: string };

/** Start (or re-prioritize) a lazily-declared image's fetch. Idempotent:
 *  re-invoking never creates a duplicate request for the same candidate. */
function requestImage(img: HTMLImageElement, priority: 'high' | 'low' | 'auto'): void {
  if ('fetchPriority' in img) (img as PriorityImage).fetchPriority = priority;
  if (img.loading === 'lazy') img.loading = 'eager';
}

const imageReady = (img: HTMLImageElement) => img.complete && img.naturalWidth > 0;

/**
 * Fade a wrapper's final image in once it has loaded AND decoded, so the
 * preview→final swap never paints a half-decoded frame. Listeners are bound
 * once per image (guarded via dataset) no matter how often the owning modal
 * is reopened. On failure the wrapper keeps its preview: `is-ready` is never
 * added, which leaves the final image transparent.
 */
function upgradeWhenReady(wrapper: HTMLElement, finalImg: HTMLImageElement): void {
  const markReady = () => {
    const settle = () => wrapper.classList.add('is-ready');
    // decode() can reject even when the image is renderable; either way the
    // data has arrived, so reveal it.
    finalImg.decode().then(settle, settle);
  };

  if (imageReady(finalImg)) {
    markReady();
    return;
  }

  if (finalImg.dataset.upgradeBound === 'true') return;
  finalImg.dataset.upgradeBound = 'true';
  finalImg.addEventListener('load', markReady);
  finalImg.addEventListener('error', () => wrapper.classList.add('is-error'));
}

/** Paint a cached source into the preview slot and mark the wrapper as
 *  upgrading (final image transparent until `is-ready`). */
function showPreview(wrapper: HTMLElement, preview: HTMLImageElement, src: string): void {
  preview.src = src;
  preview.hidden = false;
  wrapper.classList.add('is-upgrading');
}

/**
 * Project detail modals: the trigger card's already-loaded image becomes the
 * instant preview while the modal-sized candidate loads underneath. Card
 * hover/focus warms the modal image early (low priority); opening bumps it
 * to high priority and later warms only the previous/next projects' images.
 */
export function initProjectModalMedia(): void {
  const triggers = Array.from(document.querySelectorAll<HTMLElement>('[data-modal-target]'));
  if (!triggers.length) return;

  const modalIds = Array.from(
    document.querySelectorAll<HTMLElement>('.project-modal[id^="project-modal-"]'),
  ).map((modal) => modal.id.slice('project-modal-'.length));

  const partsFor = (id: string) => {
    const media = document
      .getElementById(`project-modal-${id}`)
      ?.querySelector<HTMLElement>('[data-modal-media]');
    return {
      media: media ?? null,
      final: media?.querySelector<HTMLImageElement>('[data-modal-final]') ?? null,
      preview: media?.querySelector<HTMLImageElement>('[data-modal-preview]') ?? null,
    };
  };

  const warm = (id: string | undefined, priority: 'high' | 'low') => {
    if (!id) return;
    const { final } = partsFor(id);
    if (final) requestImage(final, priority);
  };

  let activeId = '';
  let adjacentTimer = 0;

  // Warm only the neighbouring projects once the active image has had time
  // to land; skipped (and re-scheduled) if the user has moved on.
  const scheduleAdjacent = (id: string) => {
    window.clearTimeout(adjacentTimer);
    const { final } = partsFor(id);
    const delay = final && imageReady(final) ? 250 : 1800;
    adjacentTimer = window.setTimeout(() => {
      if (activeId !== id) return;
      const index = modalIds.indexOf(id);
      if (index === -1) return;
      warm(modalIds[(index + 1) % modalIds.length], 'low');
      warm(modalIds[(index - 1 + modalIds.length) % modalIds.length], 'low');
    }, delay);
  };

  triggers.forEach((btn) => {
    const id = btn.getAttribute('data-modal-target') ?? '';
    if (!id) return;
    const card = btn.closest<HTMLElement>('article') ?? btn;

    // Clear intent (hover / keyboard focus) starts the modal-sized image at
    // low priority so opening feels instant without competing with anything
    // the page is currently doing.
    const warmLow = () => warm(id, 'low');
    card.addEventListener('pointerenter', warmLow, { once: true, passive: true });
    btn.addEventListener('focus', warmLow, { once: true });

    btn.addEventListener('click', () => {
      const { media, final, preview } = partsFor(id);
      if (!media || !final) return;

      activeId = id;
      requestImage(final, 'high');

      if (!imageReady(final) && preview) {
        const cardImg = card.querySelector('img');
        if (cardImg && imageReady(cardImg) && cardImg.currentSrc) {
          showPreview(media, preview, cardImg.currentSrc);
        }
      }

      upgradeWhenReady(media, final);
      scheduleAdjacent(id);
    });
  });
}

/**
 * Portfolio grid thumbnails: begin fetching one viewport ahead of the user
 * so tiles are already painted on arrival, while genuinely distant tiles
 * stay lazy and cost nothing.
 */
export function initPortfolioThumbs(): void {
  const thumbs = Array.from(
    document.querySelectorAll<HTMLImageElement>('#portfolio .gallery-thumb img'),
  );
  if (!thumbs.length || !('IntersectionObserver' in window)) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        requestImage(entry.target as HTMLImageElement, 'auto');
        io.unobserve(entry.target);
      });
    },
    { rootMargin: '100% 0px' },
  );

  thumbs.forEach((img) => {
    if (!imageReady(img)) io.observe(img);
  });
}

/**
 * Portfolio lightbox: opening a tile paints its cached thumbnail instantly
 * while the enlarged candidate loads; the active slide always carries high
 * priority and only its immediate neighbours are pre-warmed (low priority),
 * re-targeted on every navigation. Slides own their elements, so a stale or
 * failed load can never appear on another slide.
 */
export function initGalleryMedia(): void {
  const track = document.getElementById('gallery-track');
  if (!track) return;

  const medias = Array.from(track.querySelectorAll<HTMLElement>('[data-gallery-media]'));
  const finals = medias.map((m) => m.querySelector<HTMLImageElement>('[data-gallery-final]'));
  const previews = medias.map((m) => m.querySelector<HTMLImageElement>('[data-gallery-preview]'));
  const count = medias.length;
  if (!count) return;

  let activeIndex = -1;
  let adjacentTimer = 0;
  let settleTimer = 0;

  const warm = (index: number, priority: 'high' | 'low') => {
    const final = finals[((index % count) + count) % count];
    if (final) requestImage(final, priority);
  };

  const activate = (index: number) => {
    index = ((index % count) + count) % count;
    if (index === activeIndex) return;
    activeIndex = index;

    const media = medias[index];
    const final = finals[index];
    if (!media || !final) return;

    media.classList.add('is-activating');
    requestImage(final, 'high');
    upgradeWhenReady(media, final);

    // Neighbour warming waits for the active image (or a grace period) and
    // is dropped if the user has already navigated elsewhere.
    window.clearTimeout(adjacentTimer);
    const delay = imageReady(final) ? 250 : 1500;
    adjacentTimer = window.setTimeout(() => {
      if (activeIndex !== index) return;
      warm(index + 1, 'low');
      warm(index - 1, 'low');
    }, delay);
  };

  document.querySelectorAll<HTMLElement>('[data-gallery-open]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const parsed = Number(trigger.dataset.galleryOpen ?? 0);
      const index = Number.isFinite(parsed) ? ((parsed % count) + count) % count : 0;

      const media = medias[index];
      const final = finals[index];
      const preview = previews[index];
      const thumb = trigger.querySelector('img');
      if (media && final && preview && !imageReady(final) && thumb && imageReady(thumb) && thumb.currentSrc) {
        showPreview(media, preview, thumb.currentSrc);
      }

      activate(index);
    });
  });

  // Keyboard arrows and prev/next buttons all move the track; following the
  // settled scroll position keeps this in lockstep with the slider without
  // duplicating its controls.
  const nearestIndex = () => {
    const center = track.scrollLeft + track.clientWidth / 2;
    let nearest = 0;
    let bestDistance = Number.POSITIVE_INFINITY;
    medias.forEach((media, index) => {
      const slide = media.parentElement ?? media;
      const slideCenter = slide.offsetLeft + slide.clientWidth / 2;
      const distance = Math.abs(center - slideCenter);
      if (distance < bestDistance) {
        bestDistance = distance;
        nearest = index;
      }
    });
    return nearest;
  };

  track.addEventListener(
    'scroll',
    () => {
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => activate(nearestIndex()), 140);
    },
    { passive: true },
  );
}
