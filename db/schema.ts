import { index, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

const createdAt = timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow();
const updatedAt = timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow();

export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
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
  createdAt,
  updatedAt,
}, (table) => [
  index('idx_projects_featured').on(table.featured),
  index('idx_projects_display_order').on(table.displayOrder),
  index('idx_projects_public_order').on(table.published, table.showOnProjects, table.displayOrder),
]);

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
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
  createdAt,
  updatedAt,
}, (table) => [
  index('idx_posts_published_date').on(table.published, table.publishedAt),
  index('idx_posts_category').on(table.category),
]);

export const contactMessages = pgTable('contact_messages', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  contactDetails: text('contact_details').notNull().default(''),
  service: text('service').notNull(),
  budget: text('budget'),
  message: text('message').notNull(),
  status: text('status').notNull().default('new'),
  createdAt,
}, (table) => [index('idx_messages_status_date').on(table.status, table.createdAt)]);

export const resumeSettings = pgTable('resume_settings', {
  id: integer('id').primaryKey(),
  resumeUrl: text('resume_url').notNull().default('/resume-amit-kumar.pdf'),
  fileName: text('file_name').notNull().default('resume-amit-kumar.pdf'),
  buttonLabel: text('button_label').notNull().default('Download résumé'),
  updatedAt,
});

export const adminSecurity = pgTable('admin_security', {
  username: text('username').primaryKey(),
  passwordHash: text('password_hash').notNull(),
  updatedAt,
});

export const passwordResetCodes = pgTable('password_reset_codes', {
  id: serial('id').primaryKey(),
  username: text('username').notNull(),
  email: text('email').notNull(),
  codeHash: text('code_hash').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'string' }).notNull(),
  attempts: integer('attempts').notNull().default(0),
  consumedAt: timestamp('consumed_at', { withTimezone: true, mode: 'string' }),
  requestedAt: timestamp('requested_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
}, (table) => [index('idx_password_resets_user_time').on(table.username, table.requestedAt)]);

export const rateLimits = pgTable('rate_limits', {
  key: text('key').primaryKey(),
  windowStart: integer('window_start').notNull(),
  count: integer('count').notNull().default(0),
  updatedAt,
}, (table) => [index('idx_rate_limits_updated').on(table.updatedAt)]);
