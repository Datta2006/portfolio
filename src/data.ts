// Central content source for the portfolio.

export const profile = {
  name: "Datta L",
  firstName: "Datta",
  lastName: "L",
  role: "Software Engineer",
  tagline:
    "I build scalable software systems and AI-powered applications with a focus on backend engineering, distributed systems, and LLMs.",
  email: "ldatta01.dl@gmail.com",
  phone: "+91 8431468861",
  location: "Bengaluru, India",
  availability: "Open to opportunities",
};

export const socials = [
  {
    label: "GitHub",
    href: "https://github.com/Datta2006",
    icon: "github",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/datta-l",
    icon: "linkedin",
  },
  {
    label: "Email",
    href: "mailto:ldatta01.dl@gmail.com",
    icon: "mail",
  },
] as const;

export type Project = {
  title: string;
  description: string;
  tags: string[];
  repo: string;
  demo: string | null;
};

export const projects: Project[] = [
  {
    title: "Distributed URL Shortener",
    description:
      "A scalable URL shortening service with Redis caching, MySQL persistence, SHA-256 based deduplication, and token-bucket rate limiting.",
    tags: ["Node.js", "Redis", "MySQL", "Docker"],
    repo: "https://github.com/Datta2006/URL-shortner",
    demo: null,
  },
  {
    title: "Collaborative Document Editor",
    description:
      "A real-time collaborative editor with multi-user editing, live cursors, document permissions, version history, REST APIs, and JWT-based authentication.",
    tags: ["JavaScript", "Express.js", "Socket.IO", "MySQL"],
    repo: "https://github.com/Datta2006/Collaborative-Document-Editor",
    demo: null,
  },
  {
    title: "Metro Ticket Booking System",
    description:
      "A full-stack metro booking platform with JWT authentication, train search, PDF ticket generation, MetaMask payments, and an admin operations dashboard.",
    tags: ["React", "Express.js", "MySQL", "MetaMask"],
    repo: "https://github.com/Datta2006/Metro-management",
    demo: null,
  },
];

export const experience = {
  company: "Flipkart",
  title: "Software Development Engineer Intern",
  period: "May 2026 - Jul 2026",
  bullets: [
    "Built a configurable ETL platform that unified structured and unstructured data from e-commerce and social platforms into a centralized knowledge base.",
    "Designed a multithreaded scraping framework with parallel domain execution and pluggable pipelines, allowing new data sources to be added without modifying the core system.",
    "Implemented a MySQL-backed distributed task queue for fault-tolerant batch transformation across worker servers.",
    "Built a RAG-based QA system combining vector search and LLMs to ground seller insights in aggregated trend data.",
  ],
};

export type SkillGroup = {
  label: string;
  icon:
  | "atom"
  | "plugs"
  | "database"
  | "cube"
  | "robot"
  | "crosshair"
  | "code"
  | "cpu";
  items: string[];
  span: 1 | 2;
};

export const skills: SkillGroup[] = [
  {
    label: "Agentic AI",
    icon: "atom",
    items: [
      "AI Agents",
      "RAG",
      "LLM Integration",
      "Prompt Engineering",
    ],
    span: 2,
  },

  {
    label: "Programming",
    icon: "code",
    items: [
      "C++",
      "C",
      "Python",
      "JavaScript",
      "TypeScript",
    ],
    span: 1,
  },

  {
    label: "Backend",
    icon: "plugs",
    items: [
      "Node.js",
      "Express.js",
      "REST APIs",
    ],
    span: 1,
  },

  {
    label: "Databases",
    icon: "database",
    items: [
      "MySQL",
      "SQL",
      "Database Design",
    ],
    span: 1,
  },

  {
    label: "AI & LLM",
    icon: "robot",
    items: [
      "Gemini",
      "GPT",
      "RAG",
      "LLM Applications",
    ],
    span: 1,
  },

  {
    label: "Core CS",
    icon: "cpu",
    items: [
      "Data Structures & Algorithms",
      "OOP",
      "DBMS",
      "Operating Systems",
    ],
    span: 1,
  },

  {
    label: "Tools & DevOps",
    icon: "cube",
    items: [
      "Git",
      "GitHub",
      "Docker",
      "Linux",
    ],
    span: 2,
  },
];

export const education = [
  {
    school: "National Institute of Technology Karnataka",
    degree: "B.Tech, Computer Science and Engineering",
    metric: "CGPA 7.7 / 10",
    period: "2023 - 2027",
  },
  {
    school: "Rashtrotthana Vidya Kendra (TAPAS)",
    degree: "Higher Secondary, PCMCs",
    metric: "90%",
    period: "2021 - 2023",
  },
];