export interface ProjectImage {
  src: string;
  alt: string;
}

export interface ProjectEntry {
  slug: string;
  title: string;
  description: string;
  technologies: string[];
  learnings: string;
  sourceCodeHref?: string;
  images: ProjectImage[];
  reverseOnDesktop?: boolean;
}

export const projectsIntro = {
  title: 'Web Development',
  description:
    'Here is a selection of recent side projects in web development, all built from scratch with the purpose of learning new technologies.',
};

export const projectEntries: ProjectEntry[] = [
  {
    slug: 'just-show-up',
    title: 'Just Show Up',
    description: 'A personalized event scraping application using Agentic AI via ControlFlow.',
    technologies: ['Django', 'Docker', 'Celery', 'Agentic AI', 'ControlFlow'],
    learnings: 'How to run Agentic AI tasks with Controlflow, Django and Celery.',
    sourceCodeHref: 'https://github.com/jsnyde0/just-show-up/',
    images: [{ src: '/img/just_show_up.png', alt: 'Just Show Up Screenshot 1' }],
    reverseOnDesktop: true,
  },
  {
    slug: 'ebayes',
    title: 'eBayes',
    description:
      'My favourite pet project - a Bayesian Marketing Mix Modelling app for eCommerce implemented with Django and PyMC-Marketing, fusing data science with web development. Work-in-progress.',
    technologies: ['Django', 'PyMC', 'PyMC-Marketing', 'HTMX', 'TailwindCSS', 'Chart.js', 'django-cotton'],
    learnings:
      'Implementing Bayesian marketing mix models, processing and validating CSV uploads, creating dynamic data visualizations, combining data science with web development',
    sourceCodeHref: 'https://github.com/jsnyde0/ebayes/',
    images: [
      { src: '/img/ebayes-1.png', alt: 'eBayes App Screenshot 1' },
      { src: '/img/ebayes-2.png', alt: 'eBayes App Screenshot 2' },
      { src: '/img/ebayes-3.png', alt: 'eBayes App Screenshot 3' },
      { src: '/img/ebayes-4.png', alt: 'eBayes App Screenshot 4' },
    ],
  },
  {
    slug: 'async-data-pipeline',
    title: 'Async Data Pipeline',
    description:
      'An async data pipeline with a client consuming an open API with retry mechanism, data validation with pydantic, LLM integration and async mongodb via motor.',
    technologies: ['Asyncio', 'HTTPX', 'MongoDB', 'Motor', 'OpenAI', 'Pydantic', 'Tenacity'],
    learnings: 'Working with async, NoSQL, LLMs, retrying API consumption and data validation.',
    images: [{ src: '/img/async-data-pipeline.png', alt: 'Async Data Pipeline technology stack' }],
    reverseOnDesktop: true,
  },
  {
    slug: 'object-detection-api',
    title: 'Object Detection API',
    description: 'A simple Object Detection API using YOLO and FastAPI, deployed with Docker.',
    technologies: ['Docker', 'FastAPI', 'YOLO'],
    learnings: 'Building API with FastAPI and YOLO object detection.',
    sourceCodeHref: 'https://github.com/jsnyde0/yolo_api/',
    images: [{ src: '/img/yolo-api-apples-and-oranges.jpg', alt: 'Detection of apples and oranges' }],
  },
  {
    slug: 'topbottombabes',
    title: 'TopBottomBabes',
    description:
      'A naughty e-commerce store, with complex cart management and multi-step checkout process built from scratch. Uses Stripe for payments.',
    technologies: ['Django', 'HTMX', 'TailwindCSS', 'SQLite', 'django-widget-tweaks', 'Stripe', 'django-allauth'],
    learnings:
      'Managing cart and checkout state between anonymous and authenticated users, Stripe payments, custom user models, signals, session handling, test-driven development',
    sourceCodeHref: 'https://github.com/jsnyde0/topbottombabes/',
    images: [
      { src: '/img/topbottombabes-1.png', alt: 'TopBottomBabes Screenshot 1' },
      { src: '/img/topbottombabes-2.png', alt: 'TopBottomBabes Screenshot 2' },
      { src: '/img/topbottombabes-3.png', alt: 'TopBottomBabes Screenshot 3' },
      { src: '/img/topbottombabes-4.png', alt: 'TopBottomBabes Screenshot 4' },
      { src: '/img/topbottombabes-5.png', alt: 'TopBottomBabes Screenshot 5' },
    ],
    reverseOnDesktop: true,
  },
  {
    slug: 'getting-tasks-done',
    title: 'Getting Tasks Done',
    description:
      "A 'Getting Things Done' task manager with a dynamic HTMX UI, PostgreSQL/SQLite support, and allauth authentication. Includes admin honeypot, environment-based configs, and production-ready settings for secure, scalable deployment.",
    technologies: ['Django', 'HTMX', 'TailwindCSS', 'PostgreSQL', 'python-environ', 'django-allauth', 'Whitenoise'],
    learnings:
      'Full-stack development, HTMX, TailwindCSS, security practices (CSRF, honeypot, env management), user auth, deployment config',
    sourceCodeHref: 'https://github.com/jsnyde0/get-todos-done/',
    images: [
      { src: '/img/getting_tasks_done-home.png', alt: 'Todo App Screenshot 1' },
      { src: '/img/getting_tasks_done-subtask.png', alt: 'Todo App Screenshot 2' },
    ],
  },
];
