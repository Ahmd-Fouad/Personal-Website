// Global site metadata, navigation, and contact details.
// Single source of truth for anything that appears in more than one place.

export const site = {
  name: 'Ahmed Osman Fouad',
  shortName: 'A.FOUAD',
  role: 'Infrastructure BIM Engineer',
  title: 'Ahmed Fouad | Infrastructure BIM Engineer',
  url: 'https://ahmed-fouad.netlify.app',
  description:
    'Infrastructure Design and BIM Engineer with GCC experience in utility network design, road works, clash detection, and BIM workflows. Skilled in Civil 3D, Revit, Dynamo, and ISO 19650 compliance.',
  keywords:
    'Ahmed Fouad, Civil Engineer, BIM, Wet Utilities, Water Treatment, Sewage Treatment, Dynamo Scripts, Civil 3D, Revit, Infrastructure Design, ACC, AutoCAD, UAE, GCC Projects, BIM Roads, BIM Infrastructure',
  author: 'Ahmed Fouad',
  googleSiteVerification: 'NCm2X4ABNu66XOHAQMHYevCKYvW5QCOu0kex3LxWbGw',
  cvPath: '/cv.pdf',
  cvDownloadName: 'Ahmed-Fouad_Infrastructure-Engineer_CV.pdf',
} as const;

export const contact = {
  email: 'Ahmd.O.Fouad@gmail.com',
  phone: '+971562959168',
  location: 'Abu Dhabi, UAE',
} as const;

export interface NavLink {
  label: string;
  href: string;
}

export const navLinks: NavLink[] = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Experience', href: '#experience' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'Education', href: '#education' },
  { label: 'Contact', href: '#contact' },
];

export interface SocialLink {
  label: string;
  href: string;
  icon: string; // astro-icon name
}

export const socials: SocialLink[] = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/ahmd-osman', icon: 'fa6-brands:linkedin-in' },
  { label: 'GitHub', href: 'https://github.com/Ahmd-Fouad', icon: 'fa6-brands:github' },
  { label: 'X (Twitter)', href: 'https://x.com/Ahmd_0sman', icon: 'fa6-brands:x-twitter' },
  { label: 'Facebook', href: 'https://www.facebook.com/Ahmd0sman/', icon: 'fa6-brands:facebook-f' },
  { label: 'Instagram', href: 'https://www.instagram.com/ahmd0sman/', icon: 'fa6-brands:instagram' },
];

export const hero = {
  greeting: site.name,
  headline: site.role,
  headlines: [site.role, 'Infrastructure BIM Coordinator'],
  tagline:
    'Designing, Modeling, Coordinating, and Shop Drawing Production for wet and dry utilities and road works to deliver accurate, clash-free BIM solutions.',
} as const;

export const about = {
  paragraphs: [
    "I’m an Infrastructure Design & BIM Engineer with over 4 years of experience delivering precise, data-driven solutions for major GCC infrastructure projects. I specialize in the design, 3D modeling, coordination, and shop drawing production of wet and dry utility networks and road works, ensuring accurate, clash-free BIM deliverables that connect design to construction.",
    'Working with both consultants and contractors has given me a comprehensive understanding of all project stages, from concept and detailed design to coordination and documentation. I have a solid understanding of BIM Execution Plans (BEP), creating Master Information Delivery Plans (MIDP), and using Sheet Set Manager workflows, while applying ISO 19650 standards to support consistent and efficient project outputs.',
    'I leverage my expertise in Civil 3D, Navisworks, Dynamo, Inventor, AutoCAD, and Revit, using advanced BIM methodologies to transform complex infrastructure concepts into coordinated, accurate, and buildable models.',
  ],
  highlights: [
    { value: '10+', label: 'Projects Delivered' },
    { value: '4+', label: 'Years Experience' },
  ],
} as const;

export const footer = {
  // Year is resolved at build time so the notice never goes stale.
  copyright: `© ${new Date().getFullYear()} Ahmed Fouad. All rights reserved.`,
  tagline: 'Built with passion for BIM & Design Infrastructure',
} as const;
