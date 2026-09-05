import type { ProjectDestination } from './project-details';
import { decodePathSegment, toProjectSlug } from '@/lib/slug';
import { database } from '@/db';

export type Project = {
  id: number; slug: string; title: string; category: string; summary: string;
  body: string; contentJson: string | null; tech: string; year: string; imageUrl: string | null;
  projectUrl: string | null; githubUrl: string | null; featured: number; destination: ProjectDestination;
  published: number; showOnProjects: number; detailJson: string | null; displayOrder: number;
};
export type Post = {
  id: number; slug: string; title: string; excerpt: string; body: string;
  contentJson: string | null; category: string; imageUrl: string | null; featured: number;
  publishedAt: string; published: number;
};
export type ResumeSettings = {
  resumeUrl: string;
  fileName: string;
  buttonLabel: string;
  updatedAt: string;
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
  await database.prepare(`INSERT INTO resume_settings (id,resume_url,file_name,button_label)
    VALUES (1,'/resume-amit-kumar.pdf','resume-amit-kumar.pdf','Download résumé')
    ON CONFLICT (id) DO NOTHING`).run();
  const projectCount = await database.prepare('SELECT COUNT(*)::int AS count FROM projects').first<{ count: number }>();
  if (!projectCount?.count) {
    await database.batch(seedProjects.map((p, index) => database.prepare(
      'INSERT INTO projects (slug,title,category,summary,body,tech,year,project_url,featured,display_order) VALUES (?,?,?,?,?,?,?,?,?,?) ON CONFLICT (slug) DO NOTHING',
    ).bind(...p, index)));
  }
  const postCount = await database.prepare('SELECT COUNT(*)::int AS count FROM posts').first<{ count: number }>();
  if (!postCount?.count) {
    await database.batch(seedPosts.map((p) => database.prepare(
      'INSERT INTO posts (slug,title,excerpt,body,category,published_at,featured,published) VALUES (?,?,?,?,?,?,?,1) ON CONFLICT (slug) DO NOTHING',
    ).bind(...p)));
  }
  await database.batch([
    database.prepare("UPDATE posts SET category='Blockchain & Product', featured=1 WHERE slug='designing-trust-in-blockchain-products' AND category='Engineering'"),
    database.prepare("UPDATE posts SET category='Engineering Practice' WHERE slug='research-to-reliable-product' AND category='Engineering'"),
  ]);
}

const projectSelect = 'SELECT id,slug,title,category,summary,body,content_json AS "contentJson",tech,year,image_url AS "imageUrl",project_url AS "projectUrl",github_url AS "githubUrl",featured,destination,published,show_on_projects AS "showOnProjects",detail_json AS "detailJson",display_order AS "displayOrder" FROM projects';

export async function getProjects(featuredOnly = false): Promise<Project[]> {
  await ensureContentTables();
  const query = featuredOnly
    ? `${projectSelect} WHERE published=1 AND featured=1 ORDER BY display_order,id`
    : `${projectSelect} WHERE published=1 AND show_on_projects=1 ORDER BY display_order,id`;
  return (await database.prepare(query).all<Project>()).results;
}
export async function getAdminProjects(): Promise<Project[]> {
  await ensureContentTables();
  return (await database.prepare(`${projectSelect} ORDER BY display_order,id`).all<Project>()).results;
}
export async function getProject(slug: string, adminPreview = false): Promise<Project | null> {
  await ensureContentTables();
  const decodedSlug = decodePathSegment(slug);
  const visibility = adminPreview ? '' : " AND published=1 AND destination='case_study'";
  const exact = await database.prepare(`${projectSelect} WHERE (slug = ? OR slug = ?)${visibility} LIMIT 1`).bind(slug, decodedSlug).first<Project>();
  if (exact) return exact;

  // Older admin records may contain a title or spaces instead of a URL-safe slug.
  // Keep those links working while all newly saved records use canonical slugs.
  const requestedCanonical = toProjectSlug(decodedSlug);
  if (!requestedCanonical) return null;
  const projects = (await database.prepare(`${projectSelect}${adminPreview ? '' : " WHERE published=1 AND destination='case_study'"}`).all<Project>()).results;
  return projects.find((project) =>
    toProjectSlug(project.slug) === requestedCanonical
    || toProjectSlug(project.title) === requestedCanonical,
  ) || null;
}
export async function getProjectCount(): Promise<number> {
  await ensureContentTables();
  const row = await database.prepare('SELECT COUNT(*)::int AS count FROM projects WHERE published=1').first<{ count: number }>();
  return Number(row?.count || 0);
}
export async function getResumeSettings(): Promise<ResumeSettings> {
  await ensureContentTables();
  const row = await database.prepare(`SELECT resume_url AS "resumeUrl",file_name AS "fileName",
    button_label AS "buttonLabel",updated_at AS "updatedAt" FROM resume_settings WHERE id=1`).first<ResumeSettings>();
  return row || {
    resumeUrl: '/resume-amit-kumar.pdf',
    fileName: 'resume-amit-kumar.pdf',
    buttonLabel: 'Download résumé',
    updatedAt: '',
  };
}
export async function getPosts(includeDrafts = false): Promise<Post[]> {
  await ensureContentTables();
  const where = includeDrafts ? '' : 'WHERE published = 1';
  return (await database.prepare('SELECT id,slug,title,excerpt,body,content_json AS "contentJson",category,image_url AS "imageUrl",featured,published_at AS "publishedAt",published FROM posts ' + where + ' ORDER BY featured DESC,published_at DESC,id DESC').all<Post>()).results;
}
export async function getPost(slug: string): Promise<Post | null> {
  await ensureContentTables();
  return database.prepare('SELECT id,slug,title,excerpt,body,content_json AS "contentJson",category,image_url AS "imageUrl",featured,published_at AS "publishedAt",published FROM posts WHERE slug = ? AND published = 1').bind(slug).first<Post>();
}
