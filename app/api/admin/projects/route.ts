import { NextResponse } from 'next/server';
import { ensureDbInitialized } from '@/lib/db/turso';
import { authenticateRequest } from '@/lib/auth/jwt';

export async function GET(request: Request) {
  const auth = authenticateRequest(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const db = await ensureDbInitialized();
    const result = await db.execute('SELECT * FROM projects ORDER BY sort_order ASC, id ASC');
    const projects = result.rows.map((p: any) => ({
      ...p,
      tech_tags: p.tech_tags ? (typeof p.tech_tags === 'string' ? p.tech_tags.split(',').map((t: string) => t.trim()) : p.tech_tags) : [],
    }));
    return NextResponse.json(projects);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = authenticateRequest(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { title, description, image_url, demo_url, github_url, tech_tags, badge, sort_order, visible } = body;
    const tags = Array.isArray(tech_tags) ? tech_tags.join(',') : (tech_tags || '');

    const db = await ensureDbInitialized();
    const result = await db.execute({
      sql: 'INSERT INTO projects (title, description, image_url, demo_url, github_url, tech_tags, badge, sort_order, visible) VALUES (?,?,?,?,?,?,?,?,?)',
      args: [title, description || '', image_url || '', demo_url || '', github_url || '', tags, badge || 'Live', sort_order || 0, visible !== false ? 1 : 0],
    });

    return NextResponse.json({ id: Number(result.lastInsertRowid), message: 'Created' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
