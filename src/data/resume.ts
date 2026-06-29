export interface ResumeIntro {
  paragraphs: string[];
  headlineBadges: string[];
  skillBadges: { label: string; tooltip?: string }[];
}

export interface ResumeItem {
  title: string;
  role: string;
  badgeColor: 'primary' | 'accent' | 'secondary' | 'info';
  company: string;
  location: string;
  dateRange: string;
  imageUrl: string;
  imageAlt: string;
  body: string;
  links?: { label: string; href: string }[];
}

export interface SkillNode {
  name: string;
  children?: SkillNode[];
}

export const resumeIntro: ResumeIntro = {
  paragraphs: [
    "I'm from Belgium, lived in Venezuela and Nigeria, and moving to Berlin in November 2024.",
    "I want to launch startups that make a social impact—climate change, inequality, that sort of thing. I ran a 5-person non-profit for 4-5 years and loved it, but we didn’t scale before I burned out.",
    "I chase skills that excite me. Took a marketing job with zero experience just to learn. Following what gives me energy, not rigid plans. Right now, that’s data engineering and web development.",
    "With years of programming and data science behind me, learning web dev has been a blast.",
    "I work late so I can take a long lunch for my workout.",
    "Transparency is my top value.",
  ],
  headlineBadges: ['Web Developer', 'Data Scientist', 'Ex-Founder', 'Growth Engineer'],
  skillBadges: [
    { label: 'Python' },
    { label: 'Django' },
    { label: 'SQL' },
    { label: 'Fashion Icon', tooltip: "You've seen the crocs. You know it." },
  ],
};

export const skillsTree: SkillNode = {
  name: 'Role',
  children: [
    {
      name: 'Web Developer',
      children: [
        { name: 'Back-End', children: [{ name: 'Django' }, { name: 'PostgreSQL' }, { name: 'MongoDB' }, { name: 'Async' }, { name: 'RESTful API' }] },
        { name: 'Front-end', children: [{ name: 'HTML, CSS' }, { name: 'HTMX, Tailwind' }, { name: 'Chart.js, D3.js' }, { name: 'JavaScript' }] },
        { name: 'Analytics', children: [{ name: 'Posthog, GA4' }, { name: 'Looker Studio' }, { name: 'Server-side Tracking' }] },
        { name: 'Deployment', children: [{ name: 'DigitalOcean' }, { name: 'Docker' }, { name: 'CI/CD' }] },
        { name: 'Data Pipelines', children: [{ name: 'BigQuery' }, { name: 'Dataform' }] },
      ],
    },
    {
      name: 'Data Scientist',
      children: [{ name: 'Python, C++' }, { name: 'Algorithm development' }, { name: 'Machine Learning' }, { name: 'Bayesian Modelling' }, { name: 'Computer vision' }, { name: 'Dashboarding' }],
    },
    {
      name: 'Growth Engineer',
      children: [{ name: 'PPC' }, { name: 'Data-driven' }, { name: 'SEO' }, { name: 'CRO' }, { name: 'Automation' }],
    },
    {
      name: 'Ex-Founder',
      children: [{ name: 'Vision & Strategy' }, { name: 'HR & Team (Holacracy)' }, { name: 'Finance' }, { name: 'Sales' }, { name: 'Project Management' }, { name: 'Learning from failures' }],
    },
  ],
};

export const achievements: ResumeItem[] = [
  {
    title: 'Launched 3 Web Apps Within 3 Months of Learning',
    role: 'Web Developer',
    badgeColor: 'primary',
    company: 'Autodidact',
    location: 'Antwerp, Belgium',
    dateRange: 'Q2 2024',
    imageUrl: '/img/django-logo.png',
    imageAlt: 'Django Logo',
    body: 'Built an ecommerce platform and marketing mix modeling app in just 3 months of self-study, accelerated by my programming and data science experience.',
  },
  {
    title: 'Created MeshMonk - a medical image processing library',
    role: 'Data Scientist',
    badgeColor: 'accent',
    company: 'KULeuven',
    location: 'Leuven, Belgium',
    dateRange: '2017',
    imageUrl: '/img/meshmonk-logo-white.png',
    imageAlt: 'MeshMonk Logo',
    body: 'Developed and open-sourced MeshMonk in C++, a high-performance medical image processing library used or cited in 140+ research projects.',
    links: [{ label: 'MeshMonk', href: 'https://github.com/TheWebMonks/meshmonk' }],
  },
  {
    title: 'Scaled international impact-first business to support 30 people',
    role: 'Ex-Founder',
    badgeColor: 'secondary',
    company: 'Humainly',
    location: 'Hasselt, Belgium',
    dateRange: '2015 - 2020',
    imageUrl: '/img/humainly-logo-green.png',
    imageAlt: 'Humainly Logo',
    body: 'Scaled Humainly - a non-profit yet self-sustainable business - to support 30 people in Venezuela and Nigeria, providing living wages and professional training through local NGO partnerships.',
    links: [{ label: 'Humainly', href: 'https://humainly.com/' }],
  },
  {
    title: 'Data engineering and Bayesian modelling at eComm startup',
    role: 'Growth Engineer',
    badgeColor: 'info',
    company: 'Moonbird',
    location: 'Antwerp, Belgium',
    dateRange: '2020 - 2024',
    imageUrl: '/img/moonbird_logo_blue.png',
    imageAlt: 'Moonbird icon',
    body: 'Drove data-driven decision-making at eComm startup with a bespoke ELT pipeline, advanced server-side tracking, and self-developed Bayesian Marketing Mix Model.',
  },
];

export const workExperience: ResumeItem[] = [
  {
    title: 'Freelance Web Development & Data Engineering',
    role: 'Web Developer',
    badgeColor: 'primary',
    company: 'Self-employed',
    location: 'Antwerp, Belgium',
    dateRange: '2024 - ...',
    imageUrl: '/img/icons8-laptop-coding-64.png',
    imageAlt: 'Freelance Web Development & Data Engineering icon',
    body: 'Freelance Web Development & Data Engineering since mid 2024 using tools like Async, CI/CD, Django, Docker, Mongo, Postgres, Pydantic, Python, Tailwind and more.',
  },
  {
    title: 'Performance Marketing & Data Engineering at eComm startup',
    role: 'Growth Engineer',
    badgeColor: 'info',
    company: 'Moonbird',
    location: 'Antwerp, Belgium',
    dateRange: '2020 - 2024',
    imageUrl: '/img/moonbird_logo_blue.png',
    imageAlt: 'Moonbird icon',
    body: 'Engineered growth in monthly revenue from 4 to 6 figures in 3.5 years through data-driven experiments, marketing automation, custom data pipelines and server-side tracking.',
  },
  {
    title: 'Co-Founder & CEO of impact-first startup',
    role: 'Ex-Founder',
    badgeColor: 'secondary',
    company: 'Humainly',
    location: 'Hasselt, Belgium',
    dateRange: '2015 - 2020',
    imageUrl: '/img/humainly-logo-green.png',
    imageAlt: 'Humainly icon',
    body: 'Launched startup Humainly providing digital jobs and education in low-income regions alongside a Computer Vision consulting service.',
    links: [{ label: 'Humainly', href: 'https://humainly.com/' }],
  },
  {
    title: 'Computer Vision & Deep Learning Consulting',
    role: 'Data Scientist',
    badgeColor: 'accent',
    company: 'WebMonks',
    location: 'Hasselt, Belgium',
    dateRange: '2015 - 2017',
    imageUrl: '/img/webmonks_icon_light.png',
    imageAlt: 'WebMonks icon',
    body: 'Computer Vision consulting and managing research projects for clients as a service parallel to Humainly at WebMonks.',
    links: [{ label: 'WebMonks', href: 'https://webmonks.vision/' }],
  },
  {
    title: 'Research @ Medical Imaging Research Center ',
    role: 'Data Scientist',
    badgeColor: 'accent',
    company: 'KULeuven',
    location: 'Leuven, Belgium',
    dateRange: '2012 - 2014',
    imageUrl: '/img/KULeuven_old_logo.png',
    imageAlt: 'KULeuven Logo',
    body: 'Developed algorithms for medical image processing which I open-sourced as the MeshMonk library, used or cited in 140+ research projects.',
    links: [{ label: 'MeshMonk', href: 'https://github.com/TheWebMonks/meshmonk' }],
  },
];

export const education: ResumeItem[] = [
  {
    title: 'Self-taught Web Developer',
    role: 'Web Developer',
    badgeColor: 'primary',
    company: 'Autodidactic',
    location: 'Antwerp, Belgium',
    dateRange: '2022 - ...',
    imageUrl: '/img/icons8-learning-50.png',
    imageAlt: 'Self-taught learning icon',
    body: 'Built several web apps and APIs while learning Async, CI/CD, Django, Docker, Mongo, Postgres, Pydantic, Tailwind and more.',
  },
  {
    title: 'Bachelor & Master in Electrical Engineering ',
    role: 'Data Scientist',
    badgeColor: 'accent',
    company: 'KULeuven',
    location: 'Leuven, Belgium',
    dateRange: '2007 - 2012',
    imageUrl: '/img/KULeuven_old_logo.png',
    imageAlt: 'KULeuven Logo',
    body: 'Specialized in signal processing, with a focus on algorithms for medical image and 3D mesh processing.',
  },
];
