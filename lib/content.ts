import { env } from 'cloudflare:workers';

export type Project = {
  id: number; slug: string; title: string; category: string; summary: string;
  body: string; tech: string; year: string; imageUrl: string | null;
  projectUrl: string | null; githubUrl: string | null; featured: number;
};
export type Post = {
  id: number; slug: string; title: string; excerpt: string; body: string;
  publishedAt: string; published: number;
};

const seedProjects = [
  ['sugarcane-supply-chain', 'Sugarcane Supply Chain', 'Blockchain / Research', 'A secure multi-organization agricultural supply chain with procurement, logistics, payment automation, IoT monitoring, and QR traceability.', 'Research project developed with IIT Patna to make agricultural movement transparent from field to payment. The system combines permissioned blockchain workflows with verifiable records and practical interfaces for every participant.', 'Hyperledger Fabric, Go, CouchDB, IPFS, Docker, JWT', '2026', 'https://github.com/amit864kum/Sugarcane-Supply-Chain-Management', 1],
  ['photo-finder', 'PhotoFinder', 'AI / Full-stack platform', 'An AI-powered event photo distribution platform designed for secure, high-volume facial-recognition workflows.', 'PhotoFinder helps event participants discover their photographs quickly while giving organizers a practical, secure distribution workflow. The product was shaped around high-volume image processing and a mobile-first discovery experience.', 'Next.js, Node.js, TypeScript, AI vision', '2025', 'https://photofinders.moviesindiagroup.com/', 1],
  ['fedchain', 'FedChain', 'Distributed systems / Research', 'A blockchain-enabled federated-learning framework for private and Byzantine-resilient voice recognition.', 'Built during a research internship at IIT Patna, FedChain combines federated averaging, peer-to-peer coordination, and blockchain-backed accountability to improve privacy and resilience in distributed machine learning.', 'PyTorch, FedAvg, P2P networking, Blockchain', '2025', 'https://github.com/amit864kum/Byzantine-Resilient-Federated-Learning', 1],
  ['land-registry', 'Blockchain Land Registry', 'Blockchain / Civic technology', 'A tamper-resistant land registry and automated mutation workflow for secure ownership management.', 'The platform translates complex land-transfer processes into traceable smart-contract workflows, combining a modern web application with permissioned blockchain infrastructure.', 'React, Node.js, PostgreSQL, Hyperledger Fabric', '2026', 'https://github.com/amit864kum/Blockchain-Based-Land-Registry-Automated-Mutation-System-for-Bihar-using-Hyperledger-Fabric', 0],
  ['iit-patna-research-portal', 'Wireless Research Portal', 'Web development / IIT Patna', 'An academic portal centralizing 5G/6G publications, people, and laboratory infrastructure.', 'Designed and deployed for Prof. Preetam Kumar at IIT Patna, the portal makes technical research easier to navigate through a clear, responsive information architecture.', 'Next.js, Responsive UI, Deployment', '2025', 'https://www.iitp.ac.in/~pkumar/', 0],
  ['museiac', 'Museiac', 'Full-stack music platform', 'A scalable music product with responsive interfaces and optimized backend APIs.', 'Museiac brings product design and engineering together in a performance-focused music platform built with a typed full-stack architecture.', 'Next.js, Node.js, TypeScript, PostgreSQL', '2026', 'https://www.museiac.com/', 0],
];
const seedPosts = [
  ['designing-trust-in-blockchain-products', 'Designing trust into blockchain products', 'Why good blockchain UX begins with clarity, not technical vocabulary.', 'Trust is not created by putting a ledger behind an interface. It comes from making ownership, status, and consequences legible to the people using the system. In this note, I share the product principles that guide my work on civic and supply-chain applications.', '2026-08-12'],
  ['research-to-reliable-product', 'From research prototype to reliable product', 'A practical framework for turning experimental systems into software people can use.', 'Research rewards novelty; products demand reliability. Moving between those worlds means protecting the original insight while reducing friction, uncertainty, and operational risk. These are the decisions I use to bridge that gap.', '2026-07-28'],
];

let initialized = false;
export async function ensureContentTables() {
  if (initialized) return;
  const db = env.DB;
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT NOT NULL UNIQUE, title TEXT NOT NULL,
      category TEXT NOT NULL, summary TEXT NOT NULL, body TEXT NOT NULL, tech TEXT NOT NULL,
      year TEXT NOT NULL, image_url TEXT, project_url TEXT, github_url TEXT,
      featured INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT NOT NULL UNIQUE, title TEXT NOT NULL,
      excerpt TEXT NOT NULL, body TEXT NOT NULL, published_at TEXT NOT NULL,
      published INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL,
      service TEXT NOT NULL, budget TEXT, message TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, status TEXT NOT NULL DEFAULT 'new'
    )`),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured)'),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_posts_published_date ON posts(published, published_at)'),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_messages_status_date ON contact_messages(status, created_at)'),
  ]);
  const projectCount = await db.prepare('SELECT COUNT(*) AS count FROM projects').first<{ count: number }>();
  if (!projectCount?.count) {
    await db.batch(seedProjects.map((p) => db.prepare(
      'INSERT INTO projects (slug,title,category,summary,body,tech,year,project_url,featured) VALUES (?,?,?,?,?,?,?,?,?)',
    ).bind(...p)));
  }
  const postCount = await db.prepare('SELECT COUNT(*) AS count FROM posts').first<{ count: number }>();
  if (!postCount?.count) {
    await db.batch(seedPosts.map((p) => db.prepare(
      'INSERT INTO posts (slug,title,excerpt,body,published_at,published) VALUES (?,?,?,?,?,1)',
    ).bind(...p)));
  }
  await db.prepare('PRAGMA optimize').run();
  initialized = true;
}

export async function getProjects(featuredOnly = false): Promise<Project[]> {
  await ensureContentTables();
  const query = featuredOnly
    ? 'SELECT id,slug,title,category,summary,body,tech,year,image_url AS imageUrl,project_url AS projectUrl,github_url AS githubUrl,featured FROM projects WHERE featured = 1 ORDER BY year DESC,id'
    : 'SELECT id,slug,title,category,summary,body,tech,year,image_url AS imageUrl,project_url AS projectUrl,github_url AS githubUrl,featured FROM projects ORDER BY featured DESC,year DESC,id';
  return (await env.DB.prepare(query).all<Project>()).results;
}
export async function getProject(slug: string): Promise<Project | null> {
  await ensureContentTables();
  return env.DB.prepare('SELECT id,slug,title,category,summary,body,tech,year,image_url AS imageUrl,project_url AS projectUrl,github_url AS githubUrl,featured FROM projects WHERE slug = ?').bind(slug).first<Project>();
}
export async function getPosts(includeDrafts = false): Promise<Post[]> {
  await ensureContentTables();
  const where = includeDrafts ? '' : 'WHERE published = 1';
  return (await env.DB.prepare('SELECT id,slug,title,excerpt,body,published_at AS publishedAt,published FROM posts ' + where + ' ORDER BY published_at DESC,id DESC').all<Post>()).results;
}
export async function getPost(slug: string): Promise<Post | null> {
  await ensureContentTables();
  return env.DB.prepare('SELECT id,slug,title,excerpt,body,published_at AS publishedAt,published FROM posts WHERE slug = ? AND published = 1').bind(slug).first<Post>();
}
