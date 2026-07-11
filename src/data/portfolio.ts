import type { ImageMetadata } from 'astro';

// Featured portfolio tiles (the visible 8)
import p1 from '../assets/images/portfolio/main/1-sl.png';
import p2 from '../assets/images/portfolio/main/2-bl.png';
import p3 from '../assets/images/portfolio/main/3-sl.png';
import p4 from '../assets/images/portfolio/main/4-rapk.png';
import p5 from '../assets/images/portfolio/main/5-mon.png';
import p6 from '../assets/images/portfolio/main/6-mon.png';
import p7 from '../assets/images/portfolio/main/7-dyn.png';
import p8 from '../assets/images/portfolio/main/8-fl.png';

export interface PortfolioTile {
  image: ImageMetadata;
  title: string;
  subtitle: string;
  /** Filename number (1-28) of this tile's matching photo in the full gallery. */
  galleryNumber: number;
}

export const portfolioTiles: PortfolioTile[] = [
  { image: p1, title: 'Saadiyat Lagoons', subtitle: 'Navisworks Checking', galleryNumber: 1 },
  { image: p2, title: 'BalGhaiylam', subtitle: '2D Shop drawing', galleryNumber: 10 },
  { image: p3, title: 'Saadiyat Lagoons', subtitle: 'Storm Profile', galleryNumber: 7 },
  { image: p4, title: 'Mina Al-Arab', subtitle: 'Utilities Corridor', galleryNumber: 15 },
  { image: p5, title: 'Montage Wadi Safar', subtitle: 'MIDP', galleryNumber: 14 },
  { image: p6, title: 'Montage Wadi Safar', subtitle: 'Utilities Cross Section', galleryNumber: 18 },
  { image: p7, title: 'Dynamo Script', subtitle: 'Piperun From Polylines', galleryNumber: 26 },
  { image: p8, title: 'Jeddah Development', subtitle: 'Turn Images Into 3D', galleryNumber: 25 },
];

// Full gallery (1..28) shown in the "View More" lightbox.
// Imported via glob so all 28 files are optimized without 28 import lines.
const galleryModules = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/images/portfolio/*.png',
  { eager: true },
);

const galleryEntries = Object.entries(galleryModules)
  .map(([path, mod]) => {
    const match = path.match(/\/(\d+)\.png$/);
    return { order: match ? parseInt(match[1], 10) : 0, image: mod.default };
  })
  .sort((a, b) => a.order - b.order);

export const galleryImages: ImageMetadata[] = galleryEntries.map((entry) => entry.image);

// Maps a gallery photo's filename number (1-28) to its zero-based index in
// `galleryImages`, so featured tiles can reference photos by their stable
// filename rather than a fragile array position.
const galleryIndexByNumber = new Map(galleryEntries.map((entry, index) => [entry.order, index]));

export function getGalleryIndex(galleryNumber: number): number {
  const index = galleryIndexByNumber.get(galleryNumber);
  if (index === undefined) {
    throw new Error(`Portfolio tile references gallery image #${galleryNumber}, which does not exist.`);
  }
  return index;
}
