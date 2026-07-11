export interface Skill {
  name: string;
  level: number;
}

export interface SkillGroup {
  title: string;
  icon: string; // astro-icon name (fa6-solid)
  motion: 'floating' | 'floating-slow' | 'floating-reverse';
  skills: Skill[];
}

export const skillGroups: SkillGroup[] = [
  {
    title: 'BIM & Modeling',
    icon: 'fa6-solid:cube',
    motion: 'floating',
    skills: [
      { name: 'Civil 3D', level: 85 },
      { name: 'Navisworks', level: 90 },
      { name: 'Revit', level: 75 },
      { name: 'AutoCAD', level: 95 },
      { name: 'Inventor', level: 70 },
      { name: 'Dynamo', level: 90 },
      { name: 'Part Builder', level: 80 },
    ],
  },
  {
    title: 'Design & Coordination',
    icon: 'fa6-solid:diagram-project',
    motion: 'floating-reverse',
    skills: [
      { name: 'WaterGems', level: 75 },
      { name: 'SewerGems', level: 80 },
      { name: 'Autodesk Construction Cloud (ACC)', level: 95 },
      { name: 'Master Information Delivery Plan (MIDP)', level: 80 },
      { name: 'Sheet Set Manager (SSM)', level: 90 },
      { name: 'Clash Detection', level: 90 },
      { name: '4D Simulation Videos', level: 85 },
    ],
  },
  {
    title: 'Documentation & Standards',
    icon: 'fa6-solid:compass-drafting',
    motion: 'floating-slow',
    skills: [
      { name: 'ISO 19650 Compliance', level: 85 },
      { name: 'Shop Drawing Production', level: 90 },
      { name: 'Quantity Take-offs (QTO)', level: 80 },
      { name: 'BIM Execution Planning (BEP)', level: 75 },
      { name: 'Microsoft Office', level: 95 },
    ],
  },
];

export interface ProcessStep {
  title: string;
  description: string;
}

export const process: ProcessStep[] = [
  {
    title: 'Discovery & Analysis',
    description:
      'Understanding project scope and requirements, reviewing master plans, and identifying coordination challenges.',
  },
  {
    title: '3D Modeling & BIM Setup',
    description:
      'Creating detailed 3D models in Civil3D with proper standards, families, and project templates.',
  },
  {
    title: 'Coordination & Clash Detection',
    description:
      'Running clash detection reports in Navisworks and coordinating with MEP, architectural, and structural teams.',
  },
  {
    title: 'Shop Drawings & Layout Sheets',
    description:
      'Producing precise, construction-ready shop drawings and detailed layout sheets aligned with BIM models.',
  },
  {
    title: 'Documentation & Delivery',
    description:
      'Generating construction documents, schedules, and delivering coordinated BIM models for construction.',
  },
];
