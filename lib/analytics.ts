import { env } from 'cloudflare:workers';

export type AnalyticsEventInput = {
  eventKey: string;
  visitorId: string;
  sessionId: string;
  eventType: 'page_view' | 'section_view' | 'project_intent' | 'contact_intent' | 'contact_submitted';
  path: string;
  section?: string;
  referrer?: string;
  source?: string;
  medium?: string;
  campaign?: string;
  reason?: string;
  device?: string;
};

export type AnalyticsOverview = {
  totals: { visitors: number; views: number; sessions: number; sectionViews: number; contactIntents: number };
  consent: { accepted: number; rejected: number; rate: number };
  daily: Array<{ day: string; visitors: number; views: number }>;
  pages: Array<{ label: string; value: number }>;
  sections: Array<{ label: string; value: number }>;
  sources: Array<{ label: string; value: number }>;
  reasons: Array<{ label: string; value: number }>;
  devices: Array<{ label: string; value: number }>;
  recentVisitors: Array<{ visitorId: string; lastSeen: string; views: number; pages: string; reason: string | null; device: string | null }>;
};

let analyticsInitialization: Promise<void> | null = null;
export function ensureAnalyticsTables() {
  if (!analyticsInitialization) analyticsInitialization = initializeAnalyticsTables().catch((error) => {
    analyticsInitialization = null;
    throw error;
  });
  return analyticsInitialization;
}

async function initializeAnalyticsTables() {
  const db = env.DB;
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS analytics_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT, event_key TEXT NOT NULL UNIQUE,
      visitor_id TEXT NOT NULL, session_id TEXT NOT NULL, event_type TEXT NOT NULL,
      path TEXT NOT NULL, section TEXT, referrer TEXT, source TEXT, medium TEXT,
      campaign TEXT, reason TEXT, device TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS consent_daily (
      day TEXT PRIMARY KEY, accepted INTEGER NOT NULL DEFAULT 0,
      rejected INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at)'),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_analytics_events_visitor ON analytics_events(visitor_id,created_at)'),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_analytics_events_path ON analytics_events(event_type,path)'),
  ]);
  await db.prepare('PRAGMA optimize').run();
}

function clean(value: unknown, max: number) {
  return String(value || '').trim().slice(0, max);
}

export async function recordAnalyticsEvent(input: AnalyticsEventInput) {
  await ensureAnalyticsTables();
  await env.DB.prepare(`INSERT OR IGNORE INTO analytics_events
    (event_key,visitor_id,session_id,event_type,path,section,referrer,source,medium,campaign,reason,device,created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(
    clean(input.eventKey, 80), clean(input.visitorId, 80), clean(input.sessionId, 80),
    clean(input.eventType, 40), clean(input.path, 220), clean(input.section, 120) || null,
    clean(input.referrer, 300) || null, clean(input.source, 100) || null,
    clean(input.medium, 100) || null, clean(input.campaign, 120) || null,
    clean(input.reason, 80) || null, clean(input.device, 40) || null, new Date().toISOString(),
  ).run();
}

export async function recordConsent(choice: 'accepted' | 'rejected') {
  await ensureAnalyticsTables();
  const field = choice === 'accepted' ? 'accepted' : 'rejected';
  await env.DB.prepare(`INSERT INTO consent_daily (day,${field},updated_at) VALUES (date('now'),1,CURRENT_TIMESTAMP)
    ON CONFLICT(day) DO UPDATE SET ${field}=${field}+1,updated_at=CURRENT_TIMESTAMP`).run();
}

async function grouped(query: string, days: number) {
  const result = await env.DB.prepare(query).bind(`-${days} days`).all<{ label: string; value: number }>();
  return result.results.map((item) => ({ label: item.label || 'Unknown', value: Number(item.value || 0) }));
}

export async function getAnalyticsOverview(days = 30): Promise<AnalyticsOverview> {
  await ensureAnalyticsTables();
  const db = env.DB;
  const windowDays = Math.min(90, Math.max(7, days));
  const [totals, consent, daily, pages, sections, sources, reasons, devices, recent] = await Promise.all([
    db.prepare(`SELECT COUNT(DISTINCT visitor_id) AS visitors,
      SUM(CASE WHEN event_type='page_view' THEN 1 ELSE 0 END) AS views,
      COUNT(DISTINCT session_id) AS sessions,
      SUM(CASE WHEN event_type='section_view' THEN 1 ELSE 0 END) AS sectionViews,
      SUM(CASE WHEN event_type IN ('contact_intent','contact_submitted') THEN 1 ELSE 0 END) AS contactIntents
      FROM analytics_events WHERE datetime(created_at)>=datetime('now',?)`).bind(`-${windowDays} days`).first<{ visitors: number; views: number; sessions: number; sectionViews: number; contactIntents: number }>(),
    db.prepare(`SELECT COALESCE(SUM(accepted),0) AS accepted,COALESCE(SUM(rejected),0) AS rejected FROM consent_daily WHERE date(day)>=date('now',?)`).bind(`-${windowDays} days`).first<{ accepted: number; rejected: number }>(),
    db.prepare(`SELECT substr(created_at,1,10) AS day,COUNT(DISTINCT visitor_id) AS visitors,SUM(CASE WHEN event_type='page_view' THEN 1 ELSE 0 END) AS views FROM analytics_events WHERE datetime(created_at)>=datetime('now',?) GROUP BY substr(created_at,1,10) ORDER BY day`).bind(`-${windowDays} days`).all<{ day: string; visitors: number; views: number }>(),
    grouped(`SELECT path AS label,COUNT(*) AS value FROM analytics_events WHERE event_type='page_view' AND datetime(created_at)>=datetime('now',?) GROUP BY path ORDER BY value DESC LIMIT 8`, windowDays),
    grouped(`SELECT COALESCE(section,'Unknown') AS label,COUNT(*) AS value FROM analytics_events WHERE event_type='section_view' AND datetime(created_at)>=datetime('now',?) GROUP BY section ORDER BY value DESC LIMIT 8`, windowDays),
    grouped(`SELECT COALESCE(source,'Direct') AS label,COUNT(DISTINCT session_id) AS value FROM analytics_events WHERE event_type='page_view' AND datetime(created_at)>=datetime('now',?) GROUP BY source ORDER BY value DESC LIMIT 8`, windowDays),
    grouped(`SELECT COALESCE(reason,'Not provided') AS label,COUNT(DISTINCT visitor_id) AS value FROM analytics_events WHERE event_type='page_view' AND datetime(created_at)>=datetime('now',?) GROUP BY reason ORDER BY value DESC LIMIT 8`, windowDays),
    grouped(`SELECT COALESCE(device,'Unknown') AS label,COUNT(DISTINCT visitor_id) AS value FROM analytics_events WHERE event_type='page_view' AND datetime(created_at)>=datetime('now',?) GROUP BY device ORDER BY value DESC LIMIT 8`, windowDays),
    db.prepare(`SELECT visitor_id AS visitorId,MAX(created_at) AS lastSeen,
      SUM(CASE WHEN event_type='page_view' THEN 1 ELSE 0 END) AS views,
      GROUP_CONCAT(DISTINCT CASE WHEN event_type='page_view' THEN path END) AS pages,
      MAX(reason) AS reason,MAX(device) AS device FROM analytics_events
      WHERE datetime(created_at)>=datetime('now',?) GROUP BY visitor_id ORDER BY lastSeen DESC LIMIT 12`).bind(`-${windowDays} days`).all<{ visitorId: string; lastSeen: string; views: number; pages: string; reason: string | null; device: string | null }>(),
  ]);
  const accepted = Number(consent?.accepted || 0);
  const rejected = Number(consent?.rejected || 0);
  return {
    totals: {
      visitors: Number(totals?.visitors || 0), views: Number(totals?.views || 0), sessions: Number(totals?.sessions || 0),
      sectionViews: Number(totals?.sectionViews || 0), contactIntents: Number(totals?.contactIntents || 0),
    },
    consent: { accepted, rejected, rate: accepted + rejected ? Math.round(accepted / (accepted + rejected) * 100) : 0 },
    daily: daily.results.map((item) => ({ day: item.day, visitors: Number(item.visitors || 0), views: Number(item.views || 0) })),
    pages, sections, sources, reasons, devices,
    recentVisitors: recent.results.map((item) => ({ ...item, views: Number(item.views || 0) })),
  };
}
