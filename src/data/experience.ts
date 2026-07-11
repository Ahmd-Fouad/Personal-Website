export interface Experience {
  company: string;
  role: string;
  period: string;
  location: string;
  points: string[];
  keyProjects?: string[];
}

// Content sourced from the CV (Ahmed Osman Fouad_CV.pdf).
export const experience: Experience[] = [
  {
    company: 'Innovo Group',
    role: 'Infrastructure BIM Coordinator',
    period: '08/2025 - Present',
    location: 'Abu Dhabi, UAE',
    points: [
      'Led infrastructure BIM coordination for major Abu Dhabi developments, covering roads, grading, wet and dry utilities, and architectural and MEP interfaces.',
      'Prepared BIM Execution Plans (BEP) and Master Information Delivery Plans (MIDP) in accordance with Aldar EIR v3.0 and ISO 19650 requirements.',
      'Coordinated federated models across 5 disciplines and resolved 500+ clashes before client submission, improving model quality and reducing coordination comments.',
      'Developed roadworks and rough grading models, including cut/fill quantity extraction and design coordination with utility networks.',
      'Managed model review workflows in Navisworks and ACC, ensuring compliance with client digital delivery standards.',
    ],
    keyProjects: ['Qasr Al-Jurf (Phase 3B)', 'Al-Sader', 'Bloom'],
  },
  {
    company: 'SSH International Consultant',
    role: 'Infrastructure Design & BIM Engineer',
    period: '09/2024 - 08/2025',
    location: 'Cairo, Egypt',
    points: [
      'Designed wet utility networks (Sewer, Storm, Water, Irrigation) using SewerGEMS / WaterGEMS, ensuring compliance with project standards.',
      'Developed detailed 3D utility models for wet and dry utilities and coordinated reviews in Navisworks for effective clash detection.',
      'Delivered 300+ shop drawings across wet and dry utilities and roadworks, improving design coordination and reducing potential RFIs.',
      'Developed 15+ advanced Dynamo scripts for utility network generation, cutting manual utility modeling time by ~35% per project.',
      'Authored the Master Information Delivery Plan (MIDP) to standardize drawing production in line with ISO 19650.',
    ],
    keyProjects: ['Montage Wadi Safar', 'S5 Development', 'Mina Al Arab Development'],
  },
  {
    company: 'Trojan Construction Group',
    role: 'BIM Infrastructure Engineer',
    period: '11/2022 - 09/2024',
    location: 'Cairo, Egypt',
    points: [
      'Prepared detailed 2D shop drawings for wet and dry utilities, ensuring accuracy and compliance.',
      'Modeled and delivered comprehensive wet and dry utility networks in Civil 3D, achieving LOD 450 standards.',
      'Wrote Dynamo scripts to automate repetitive Civil 3D tasks, reducing production time by 30% and enhancing efficiency by ~25%.',
      'Delivered a clash-free federated Navisworks model and a 4D Navisworks simulation video.',
    ],
    keyProjects: ['Baniyas West', 'BalGhaiylam', 'Saadiyat Lagoons', 'Reem Hills'],
  },
];
