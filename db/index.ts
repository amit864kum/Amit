import 'server-only';
import { neon, type NeonQueryFunction, type NeonQueryPromise } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

let client: NeonQueryFunction<false, false> | null = null;

function connection() {
  if (client) return client;
  const url = process.env.DATABASE_URL?.trim();
  if (!url) throw new Error('DATABASE_URL is not configured. Connect a Neon database in Vercel and redeploy.');
  client = neon(url);
  return client;
}

function postgresPlaceholders(query: string) {
  let position = 0;
  return query.replace(/\?/g, () => `$${++position}`);
}

export class PreparedStatement {
  constructor(private readonly query: string, private readonly params: unknown[] = []) {}

  bind(...params: unknown[]) {
    return new PreparedStatement(this.query, params);
  }

  promise(): NeonQueryPromise<false, false, Record<string, unknown>[]> {
    return connection().query(postgresPlaceholders(this.query), this.params) as NeonQueryPromise<false, false, Record<string, unknown>[]>;
  }

  async all<T>() {
    return { results: await this.promise() as T[] };
  }

  async first<T>() {
    const rows = await this.promise() as T[];
    return rows[0] ?? null;
  }

  async run() {
    await this.promise();
    return { success: true };
  }
}

export const database = {
  prepare(query: string) {
    return new PreparedStatement(query);
  },
  async batch(statements: PreparedStatement[]) {
    return connection().transaction(statements.map((statement) => statement.promise()));
  },
};

export function getDb() {
  return drizzle(connection(), { schema });
}
