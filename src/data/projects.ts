import type { ImageMetadata } from 'astro';

// Cover images (optimized at build by astro:assets / Sharp)
import montage from '../assets/images/montage.jpg';
import mina from '../assets/images/Mina Al Arab.jpg';
import s5 from '../assets/images/s5.jpeg';
import baniyas from '../assets/images/Baniyas West.png';
import saadiyat from '../assets/images/Saadiyat-Lagoons.png';
import balGhaiylam from '../assets/images/Bal Ghaiylam.png';
import shura from '../assets/images/shura island.png';

interface ProjectBase {
  id: number; // maps to the original data-project id / modal
  title: string;
  modalTitle?: string; // when the modal heading differs from the card
  location: string;
  companyShort: string; // shown on the card
  company: string; // shown in the modal details
  role: string;
  year: string;
  description: string;
  contributions: string[];
}

export type Project = ProjectBase &
  (
    | {
        image: ImageMetadata;
        imageWidth?: never;
        imageHeight?: never;
      }
    | {
        image: string;
        imageWidth: number;
        imageHeight: number;
      }
  );

// New projects first; previous project order remains preserved.
export const projects: Project[] = [
  {
    id: 8,
    title: 'Al-Sadr Housing',
    image: '/assets/projects/al-sader.jpg',
    imageWidth: 1720,
    imageHeight: 914,
    location: 'Abu Dhabi, UAE',
    companyShort: 'Innovo Group',
    company: 'Innovo Group',
    role: 'BIM Coordinator',
    year: '2026',
    description:
      'Al Sader National Housing is a large-scale infrastructure development in Abu Dhabi, developed by Aldar Projects on behalf of Abu Dhabi Housing Authority (ADHA). The project supports a modern residential community across 209.41 hectares, including 840 plots and 800 residential villas. Its scope covers roads, streetscapes, sidewalks, cycle tracks, stormwater, sewerage, water, electrical, and telecom networks.',
    contributions: [
      'Coordinated BIM workflows and project information delivery.',
      'Prepared the MIDP for model deliverables and responsibilities.',
      'Developed and updated the BEP based on project BIM requirements.',
      'Created and managed Sheet Set Manager for organized drawing submissions.',
      'Prepared and assigned property sets for accurate model information.',
      'Supported multidisciplinary coordination and structured BIM delivery.',
    ],
  },
  {
    id: 9,
    title: 'Naseem Al-Jurf',
    image: '/assets/projects/al-jurf-phase-3b.jpg',
    imageWidth: 1245,
    imageHeight: 457,
    location: 'Abu Dhabi, UAE',
    companyShort: 'Innovo Group',
    company: 'Innovo Group',
    role: 'BIM Coordinator',
    year: '2025',
    description:
      'Naseem Al Jurf Phase 3B is an infrastructure development in Qasr Al Jurf, Ghantoot, Abu Dhabi. The project is part of IMKAN’s Al Jurf coastal community and covers approximately 226,547 m². It includes residential villas, apartment buildings, townhouses, retail areas, and infrastructure works supporting the wider development.',
    contributions: [
      'Coordinated BIM workflows for infrastructure project delivery.',
      'Managed model coordination for roads, utilities, and infrastructure networks.',
      'Supported shop drawings, coordination drawings, and as-built documentation.',
      'Organized BIM documentation and project deliverables.',
      'Reviewed model data and drawing outputs for consistency.',
      'Supported multidisciplinary coordination and information management.',
    ],
  },
  {
    id: 5,
    title: 'Montage Wadi Safar',
    image: montage,
    location: 'Riyadh, KSA',
    companyShort: 'SSH',
    company: 'SSH Consultant',
    role: 'BIM Modeler',
    year: '2025',
    description:
      'Montage Wadi Safar is an exclusive luxury development in the scenic Wadi Safar area of Riyadh, KSA. It blends modern elegance with natural beauty, featuring upscale villas, premium hospitality, and world-class amenities for a refined and serene lifestyle.',
    contributions: [
      'Modeled detailed 3D models for all networks and roads.',
      'Used dynamo to assign all elements property sets.',
      'Used ACC to Coordinate and deliver models and sheets.',
      'Used Navisworks to deliver clash free models.',
      'Created TIDP and SSM for smooth delivery.',
    ],
  },
  {
    id: 7,
    title: 'Mina Al-Arab',
    modalTitle: 'Mina Al-Arab Development',
    image: mina,
    location: 'Ras Al Khaimah, UAE',
    companyShort: 'SSH',
    company: 'SSH Consultant',
    role: 'BIM Modeler',
    year: '2025',
    description:
      'Mina Al Arab is a vibrant waterfront community in Ras Al Khaimah, UAE, offering a unique blend of modern living and natural beauty. Featuring scenic beaches, lush landscapes, and premium residential developments, it’s designed for a relaxed coastal lifestyle with world-class amenities.',
    contributions: [
      '2D and 3D models for wet utilities and roads.',
      'Detailed shop drawings sheets for utilities and roads.',
      'Used ACC to coordinate with other disciplines.',
      'Zero clash models using Navisworks.',
    ],
  },
  {
    id: 6,
    title: 'S5 Development',
    image: s5,
    location: 'Sabah Al-Ahmad, KW',
    companyShort: 'SSH',
    company: 'SSH Consultant',
    role: 'BIM Modeler',
    year: '2025',
    description:
      'S5 Development is a modern residential zone within Sabah Al Ahmad Residential City, Kuwait. Strategically located inland, it features organized layouts, wide roads, and essential infrastructure—offering strong potential for future growth and investment.',
    contributions: [
      '2D and 3D models for wet utilities and roads.',
      'Detailed shop drawings sheets for utilities and roads.',
      'Used ACC to coordinate with other disciplines.',
      'Zero clash models using Navisworks.',
    ],
  },
  {
    id: 2,
    title: 'Baniyas West',
    image: baniyas,
    location: 'Abu Dhabi, UAE',
    companyShort: 'Trojan',
    company: 'Trojan Company',
    role: 'BIM Modeler',
    year: '2024',
    description:
      'Baniyas West is a premier waterfront community by the Abu Dhabi Housing Authority, featuring over 4,000 villas along serene canals. Designed for UAE citizens, it offers lush parks, modern amenities, and a peaceful family lifestyle that blends contemporary living with natural beauty.',
    contributions: [
      'Created 2D models for zone 3 with no clashes.',
      'Modeled detailed wet utilities for zone 3.',
      'Installed profiles for wet utilities.',
      'Solved all clashes between (sewer, storm, IRR, PW).',
    ],
  },
  {
    id: 1,
    title: 'Saadiyat Lagoons',
    image: saadiyat,
    location: 'Abu Dhabi, UAE',
    companyShort: 'Trojan',
    company: 'Trojan Company',
    role: 'BIM Modeler',
    year: '2024',
    description:
      'Saadiyat Lagoons is a luxury residential community on Saadiyat Island, Abu Dhabi. Surrounded by mangroves and scenic lagoons, it offers modern living, sustainable design, and premium amenities in a tranquil natural setting. Designed to foster a close connection with nature.',
    contributions: [
      'Modeled wet and dry utilities for cluster 1A.',
      'Clash detection for all models.',
      'Delivered profiles with construction data.',
      'Coordinated my cluster with other package clusters.',
    ],
  },
  {
    id: 3,
    title: 'Bal Ghaiylam',
    image: balGhaiylam,
    location: 'Abu Dhabi, UAE',
    companyShort: 'Trojan',
    company: 'Trojan Company',
    role: 'BIM Modeler',
    year: '2024',
    description:
      'Balghaiylam is a premier residential development in Abu Dhabi by the Abu Dhabi Housing Authority, offering over 1,700 modern villas surrounded by green spaces and coastal views. The community is designed to provide families with a peaceful, sustainable, and high-quality lifestyle.',
    contributions: [
      'Solved all 2D clashes for all networks.',
      'Modeled detailed wet utilities and telecom.',
      'Clash detection for all cluster networks.',
      'Detailed shop drawings for wet utilities.',
      'Created 4D and 5D models and simulation video.',
    ],
  },
  {
    id: 4,
    title: 'Shura Island',
    image: shura,
    location: 'Tabuk, KSA',
    companyShort: 'Al-Dafe',
    company: 'Al-Dafe Company',
    role: 'BIM Modeler',
    year: '2023',
    description:
      'Shura Island is the centerpiece of Saudi Arabia’s Red Sea Project, designed as a world-class luxury tourism destination. The island will feature exclusive resorts, pristine beaches, and sustainable design, blending modern architecture with the natural beauty of the Red Sea.',
    contributions: [
      'Modeled wet utilities for zone (2, 4, 7, 9).',
      'Detailed 2D shop drawings for wet utilities.',
      'Coordinated with other companies using BIM360.',
      'Modeled precise excavation trenches.',
    ],
  },
];
