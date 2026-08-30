import { env } from 'cloudflare:workers';

export type Project = {
  id: number; slug: string; title: string; category: string; summary: string;
  body: string; contentJson: string | null; tech: string; year: string; imageUrl: string | null;
  projectUrl: string | null; githubUrl: string | null; featured: number; displayOrder: number;
};
export type Post = {
  id: number; slug: string; title: string; excerpt: string; body: string;
  contentJson: string | null; category: string; imageUrl: string | null; featured: number;
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
  ['designing-trust-in-blockchain-products', 'Designing trust into blockchain products', 'Why good blockchain UX begins with clarity, not technical vocabulary.', '## Trust starts with visibility\nTrust is not created by putting a ledger behind an interface. It comes from making ownership, status, and consequences legible to the people using the system.\n\n## Design the workflow, not the technology\nPeople should understand what happened, who approved it, and what comes next without learning the vocabulary of distributed ledgers. The interface must translate technical guarantees into clear actions.\n\n## Make verification useful\nTraceability matters when it helps someone resolve a real question. Good blockchain products surface proof at the moment it is needed and keep everything else quiet.', 'Blockchain & Product', '2026-08-12', 1],
  ['research-to-reliable-product', 'From research prototype to reliable product', 'A practical framework for turning experimental systems into software people can use.', '## Protect the original insight\nResearch rewards novelty; products demand reliability. The first step is identifying the idea that must survive the transition.\n\n## Reduce operational uncertainty\nA useful product needs observable states, predictable failure handling, and interfaces that explain what the system is doing.\n\n## Build the feedback loop\nReliable software improves through measurement. Instrument the workflow, learn from real users, and refine without losing the research advantage.', 'Engineering Practice', '2026-07-28', 0],
];

let initialization: Promise<void> | null = null;
export function ensureContentTables() {
  if (!initialization) initialization = initializeContentTables().catch((error) => {
    initialization = null;
    throw error;
  });
  return initialization;
}
async function initializeContentTables() {
  const db = env.DB;
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT NOT NULL UNIQUE, title TEXT NOT NULL,
      category TEXT NOT NULL, summary TEXT NOT NULL, body TEXT NOT NULL, content_json TEXT, tech TEXT NOT NULL,
      year TEXT NOT NULL, image_url TEXT, project_url TEXT, github_url TEXT,
      featured INTEGER NOT NULL DEFAULT 0, display_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT NOT NULL UNIQUE, title TEXT NOT NULL,
      excerpt TEXT NOT NULL, body TEXT NOT NULL, content_json TEXT, category TEXT NOT NULL DEFAULT 'Engineering',
      image_url TEXT, featured INTEGER NOT NULL DEFAULT 0, published_at TEXT NOT NULL,
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
  const postColumnResult = await db.prepare('PRAGMA table_info(posts)').all<{ name: string }>();
  const postColumns = new Set(postColumnResult.results.map((column) => column.name));
  const postMigrations: D1PreparedStatement[] = [];
  if (!postColumns.has('category')) postMigrations.push(db.prepare("ALTER TABLE posts ADD COLUMN category TEXT NOT NULL DEFAULT 'Engineering'"));
  if (!postColumns.has('image_url')) postMigrations.push(db.prepare('ALTER TABLE posts ADD COLUMN image_url TEXT'));
  if (!postColumns.has('featured')) postMigrations.push(db.prepare('ALTER TABLE posts ADD COLUMN featured INTEGER NOT NULL DEFAULT 0'));
  if (!postColumns.has('content_json')) postMigrations.push(db.prepare('ALTER TABLE posts ADD COLUMN content_json TEXT'));
  if (postMigrations.length) await db.batch(postMigrations);
  await db.prepare('CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category)').run();
  const projectColumnResult = await db.prepare('PRAGMA table_info(projects)').all<{ name: string }>();
  const projectColumns = new Set(projectColumnResult.results.map((column) => column.name));
  if (!projectColumns.has('content_json')) {
    await db.prepare('ALTER TABLE projects ADD COLUMN content_json TEXT').run();
  }
  if (!projectColumns.has('display_order')) {
    await db.prepare('ALTER TABLE projects ADD COLUMN display_order INTEGER NOT NULL DEFAULT 0').run();
    await db.prepare(`UPDATE projects SET display_order = (
      SELECT COUNT(*) FROM projects AS candidate
      WHERE candidate.featured > projects.featured
        OR (candidate.featured = projects.featured AND candidate.year > projects.year)
        OR (candidate.featured = projects.featured AND candidate.year = projects.year AND candidate.id < projects.id)
    )`).run();
  }
  await db.prepare('CREATE INDEX IF NOT EXISTS idx_projects_display_order ON projects(display_order)').run();
  const projectCount = await db.prepare('SELECT COUNT(*) AS count FROM projects').first<{ count: number }>();
  if (!projectCount?.count) {
    await db.batch(seedProjects.map((p, index) => db.prepare(
      'INSERT INTO projects (slug,title,category,summary,body,tech,year,project_url,featured,display_order) VALUES (?,?,?,?,?,?,?,?,?,?)',
    ).bind(...p, index)));
  }
  const postCount = await db.prepare('SELECT COUNT(*) AS count FROM posts').first<{ count: number }>();
  if (!postCount?.count) {
    await db.batch(seedPosts.map((p) => db.prepare(
      'INSERT INTO posts (slug,title,excerpt,body,category,published_at,featured,published) VALUES (?,?,?,?,?,?,?,1)',
    ).bind(...p)));
  }
  await db.batch([
    db.prepare("UPDATE posts SET category='Blockchain & Product', featured=1 WHERE slug='designing-trust-in-blockchain-products' AND category='Engineering'"),
    db.prepare("UPDATE posts SET category='Engineering Practice' WHERE slug='research-to-reliable-product' AND category='Engineering'"),
  ]);
  await db.prepare('PRAGMA optimize').run();
}

export async function getProjects(featuredOnly = false): Promise<Project[]> {
  await ensureContentTables();
  const query = featuredOnly
    ? 'SELECT id,slug,title,category,summary,body,content_json AS contentJson,tech,year,image_url AS imageUrl,project_url AS projectUrl,github_url AS githubUrl,featured,display_order AS displayOrder FROM projects WHERE featured = 1 ORDER BY display_order,id'
    : 'SELECT id,slug,title,category,summary,body,content_json AS contentJson,tech,year,image_url AS imageUrl,project_url AS projectUrl,github_url AS githubUrl,featured,display_order AS displayOrder FROM projects ORDER BY display_order,id';
  return (await env.DB.prepare(query).all<Project>()).results;
}
export async function getProject(slug: string): Promise<Project | null> {
  await ensureContentTables();
  return env.DB.prepare('SELECT id,slug,title,category,summary,body,content_json AS contentJson,tech,year,image_url AS imageUrl,project_url AS projectUrl,github_url AS githubUrl,featured,display_order AS displayOrder FROM projects WHERE slug = ?').bind(slug).first<Project>();
}
export async function getPosts(includeDrafts = false): Promise<Post[]> {
  await ensureContentTables();
  const where = includeDrafts ? '' : 'WHERE published = 1';
  return (await env.DB.prepare('SELECT id,slug,title,excerpt,body,content_json AS contentJson,category,image_url AS imageUrl,featured,published_at AS publishedAt,published FROM posts ' + where + ' ORDER BY featured DESC,published_at DESC,id DESC').all<Post>()).results;
}
export async function getPost(slug: string): Promise<Post | null> {
  await ensureContentTables();
  return env.DB.prepare('SELECT id,slug,title,excerpt,body,content_json AS contentJson,category,image_url AS imageUrl,featured,published_at AS publishedAt,published FROM posts WHERE slug = ? AND published = 1').bind(slug).first<Post>();
}
