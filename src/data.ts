// Central content source for the portfolio.
// Links marked PLACEHOLDER need real URLs.

export const profile = {
  name: "Datta L",
  firstName: "Datta",
  lastName: "L",
  role: "Full Stack Developer",
  tagline:
    "I build distributed systems, real-time apps, and LLM-powered tooling that hold up under real traffic.",
  email: "ldatta01.dl@gmail.com",
  phone: "+91 8431468861",
  location: "Bengaluru, India",
  availability: "Open to opportunities",
};

// PLACEHOLDER urls - replace with real profiles
export const socials = [
  { label: "GitHub", href: "https://github.com/dattal", icon: "github" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/datta-l",
    icon: "linkedin",
  },
  { label: "Email", href: "mailto:ldatta01.dl@gmail.com", icon: "mail" },
] as const;

export type Project = {
  title: string;
  description: string;
  tags: string[];
  repo: string;
  demo: string | null;
};

// PLACEHOLDER repo/demo urls
export const projects: Project[] = [
  {
    title: "Distributed URL Shortener",
    description:
      "Block-based ID allocation keeps URL creation to a single database round-trip. Redis cache-aside reads, SHA-256 deduplication, and token-bucket rate limiting round out the service.",
    tags: ["Node.js", "Redis", "MySQL", "Docker"],
    repo: "https://github.com/dattal/url-shortener",
    demo: null,
  },
  {
    title: "Collaborative Document Editor",
    description:
      "Real-time multi-user editing over Socket.IO with live cursors, document permissions, and version history, backed by a REST API and JWT access control.",
    tags: ["JavaScript", "Express.js", "Socket.IO", "MySQL"],
    repo: "https://github.com/dattal/collab-editor",
    demo: null,
  },
  {
    title: "Metro Ticket Booking System",
    description:
      "End-to-end booking flow with JWT auth, live train search, PDF ticket generation, and MetaMask payment, plus an admin dashboard for the full operations surface.",
    tags: ["React", "Express.js", "MySQL", "MetaMask"],
    repo: "https://github.com/dattal/metro-booking",
    demo: null,
  },
];

export const experience = {
  company: "Flipkart",
  title: "Software Development Engineer Intern",
  period: "May 2026 - Jul 2026",
  bullets: [
    "Built a configurable ETL platform that unifies structured and unstructured data from e-commerce and social platforms into one knowledge base.",
    "Designed a multithreaded scraping framework with parallel domain execution and pluggable pipelines; new sources plug in without core changes.",
    "Implemented a MySQL-backed distributed task queue for fault-tolerant batch transformation across worker servers.",
    "Shipped a RAG-based QA system pairing vector search with LLMs to ground seller insights in aggregated trend data.",
  ],
};

export type SkillGroup = {
  label: string;
  icon: "atom" | "plugs" | "database" | "cube" | "robot" | "crosshair";
  items: string[];
  span: 1 | 2;
};

export const skills: SkillGroup[] = [
  {
    label: "Frontend",
    icon: "atom",
    items: ["React.js", "TypeScript", "JavaScript", "HTML", "CSS"],
    span: 2,
  },
  {
    label: "Backend",
    icon: "plugs",
    items: ["Node.js", "Express.js", "Python", "REST APIs"],
    span: 1,
  },
  {
    label: "Databases",
    icon: "database",
    items: ["MySQL", "Redis", "Schema design"],
    span: 1,
  },
  {
    label: "AI & LLM",
    icon: "robot",
    items: ["RAG", "Gemini", "GPT integration"],
    span: 1,
  },
  {
    label: "Web Scraping",
    icon: "crosshair",
    items: ["Structured and unstructured extraction"],
    span: 1,
  },
  {
    label: "DevOps",
    icon: "cube",
    items: ["Docker", "Docker Compose", "Git/GitHub"],
    span: 2,
  },
];

export const education = [
  {
    school: "National Institute of Technology Karnataka",
    degree: "B.Tech, Computer Science and Engineering",
    metric: "CGPA 7.7 / 10",
    period: "2022 - 2026", // ASSUMED: verify years
  },
  {
    school: "Rashtrotthana Vidya Kendra (TAPAS)",
    degree: "Higher Secondary, PCMCs",
    metric: "90%",
    period: "2020 - 2022", // ASSUMED: verify years
  },
];

export const marqueeRowA = [
  "React",
  "TypeScript",
  "Node.js",
  "Redis",
  "MySQL",
  "Socket.IO",
];

export const marqueeRowB = [
  "Docker",
  "Python",
  "Express",
  "RAG",
  "Gemini",
  "GPT",
];
