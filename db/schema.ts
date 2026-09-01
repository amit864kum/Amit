import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const projects = sqliteTable('projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  summary: text('summary').notNull(),
  body: text('body').notNull(),
  contentJson: text('content_json'),
  tech: text('tech').notNull(),
  year: text('year').notNull(),
  imageUrl: text('image_url'),
  projectUrl: text('project_url'),
  githubUrl: text('github_url'),
  featured: integer('featured').notNull().default(0),
  destination: text('destination').notNull().default('case_study'),
  published: integer('published').notNull().default(1),
  showOnProjects: integer('show_on_projects').notNull().default(1),
  detailJson: text('detail_json'),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index('idx_projects_featured').on(table.featured),
  index('idx_projects_display_order').on(table.displayOrder),
  index('idx_projects_public_order').on(table.published, table.showOnProjects, table.displayOrder),
]);
export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  excerpt: text('excerpt').notNull(),
  body: text('body').notNull(),
  contentJson: text('content_json'),
  category: text('category').notNull().default('Engineering'),
  imageUrl: text('image_url'),
  featured: integer('featured').notNull().default(0),
  publishedAt: text('published_at').notNull(),
  published: integer('published').notNull().default(1),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index('idx_posts_published_date').on(table.published, table.publishedAt),
  index('idx_posts_category').on(table.category),
]);
export const contactMessages = sqliteTable('contact_messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  service: text('service').notNull(),
  budget: text('budget'),
  message: text('message').notNull(),
  status: text('status').notNull().default('new'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index('idx_messages_status_date').on(table.status, table.createdAt)]);

export const analyticsEvents = sqliteTable('analytics_events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  eventKey: text('event_key').notNull().unique(),
  visitorId: text('visitor_id').notNull(),
  sessionId: text('session_id').notNull(),
  eventType: text('event_type').notNull(),
  path: text('path').notNull(),
  section: text('section'),
  referrer: text('referrer'),
  source: text('source'),
  medium: text('medium'),
  campaign: text('campaign'),
  reason: text('reason'),
  device: text('device'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index('idx_analytics_events_created').on(table.createdAt),
  index('idx_analytics_events_visitor').on(table.visitorId, table.createdAt),
  index('idx_analytics_events_path').on(table.eventType, table.path),
]);

export const consentDaily = sqliteTable('consent_daily', {
  day: text('day').primaryKey(),
  accepted: integer('accepted').notNull().default(0),
  rejected: integer('rejected').notNull().default(0),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const resumeSettings = sqliteTable('resume_settings', {
  id: integer('id').primaryKey(),
  resumeUrl: text('resume_url').notNull().default('/resume-amit-kumar.pdf'),
  fileName: text('file_name').notNull().default('resume-amit-kumar.pdf'),
  buttonLabel: text('button_label').notNull().default('Download résumé'),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const adminSecurity = sqliteTable('admin_security', {
  username: text('username').primaryKey(),
  passwordHash: text('password_hash').notNull(),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const passwordResetCodes = sqliteTable('password_reset_codes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull(),
  email: text('email').notNull(),
  codeHash: text('code_hash').notNull(),
  expiresAt: text('expires_at').notNull(),
  attempts: integer('attempts').notNull().default(0),
  consumedAt: text('consumed_at'),
  requestedAt: text('requested_at').notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index('idx_password_resets_user_time').on(table.username, table.requestedAt)]);
