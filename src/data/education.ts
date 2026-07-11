export const education = {
  academic: {
    icon: 'fa6-solid:graduation-cap',
    title: 'Academic Education',
    degree: 'Bachelor of Civil Engineering',
    meta: 'University Of Zagazig | 2017 - 2022',
    grade: 'Grade: Very Good With Honor (84%)',
    description:
      'Specialized in wet utility design and sanitary infrastructure projects, including water and wastewater treatment plants.',
  },
  certifications: {
    icon: 'fa6-solid:certificate',
    title: 'Certifications',
    items: [
      'Autodesk Certified Professional: Civil3D',
      'Autodesk Certified Professional: Navisworks',
      'Autodesk Certified Professional: ACC',
      'Dynamo for Civil3D Advanced',
      'FrontEnd Developer from Route Academy',
    ],
  },
  graduation: {
    icon: 'fa6-solid:graduation-cap',
    title: 'Graduation Project',
    subject: 'Sanitary Engineering',
    grade: 'Grade: Excellent With Honor (94%)',
    points: [
      'Designed a complete water cycle system covering collection, purification, distribution, and sewage treatment processes.',
      'Developed water and wastewater networks to transport treated water from the source to consumers and collect sewage for treatment.',
      'Integrated Water Treatment Plant (WTP) and Wastewater Treatment Plant (WWTP) designs to ensure sustainable reuse and safe disposal.',
      'Utilized AutoCAD, Civil 3D, SewerGEMS, WaterCAD, and ArcGIS for modeling, analysis, and hydraulic design.',
    ],
  },
} as const;

export interface VideoSlide {
  src: string;
  label: string;
}

// Showreel videos (hosted on Supabase, as in the original site).
export const videoSlides: VideoSlide[] = [
  {
    src: 'https://oqqysohprgrosthyejeg.supabase.co/storage/v1/object/public/my%20website%20videos/Sadiyaat%20lagoon.mp4',
    label: 'Saadiyat Lagoons walkthrough',
  },
  {
    src: 'https://oqqysohprgrosthyejeg.supabase.co/storage/v1/object/public/my%20website%20videos/PDA%2001.mp4',
    label: 'Project design animation 01',
  },
  {
    src: 'https://oqqysohprgrosthyejeg.supabase.co/storage/v1/object/public/my%20website%20videos/PDA%2002.mp4',
    label: 'Project design animation 02',
  },
  {
    src: 'https://oqqysohprgrosthyejeg.supabase.co/storage/v1/object/public/my%20website%20videos/Freelace.mp4',
    label: 'Freelance project reel',
  },
];
