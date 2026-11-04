import { createClient, Client } from '@libsql/client';

let dbClient: Client | null = null;

export function getDb(): Client {
  if (!dbClient) {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url) {
      console.warn('⚠️ TURSO_DATABASE_URL is missing. Using in-memory fallback.');
      dbClient = createClient({ url: 'file:local.db' });
    } else {
      dbClient = createClient({
        url,
        authToken: authToken || undefined,
      });
    }
  }
  return dbClient;
}

export interface ProjectRecord {
  id: number;
  title: string;
  description: string;
  image_url: string;
  demo_url: string;
  github_url: string;
  tech_tags: string | string[];
  badge: string;
  sort_order: number;
  visible: number;
  created_at?: string;
}

export interface SkillRecord {
  id: number;
  name: string;
  icon_class: string;
  icon_url: string;
  category: string;
  sort_order: number;
  visible: number;
}
