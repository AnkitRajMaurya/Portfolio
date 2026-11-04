import { NextResponse } from 'next/server';
import { ensureDbInitialized } from '@/lib/db/turso';
import { authenticateRequest } from '@/lib/auth/jwt';

export async function GET(request: Request) {
  const auth = authenticateRequest(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const db = await ensureDbInitialized();
    const result = await db.execute('SELECT * FROM skills ORDER BY category, sort_order ASC, id ASC');
    return NextResponse.json(result.rows);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = authenticateRequest(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { name, icon_class, icon_url, category, sort_order } = body;

    const db = await ensureDbInitialized();
    const result = await db.execute({
      sql: 'INSERT INTO skills (name, icon_class, icon_url, category, sort_order, visible) VALUES (?,?,?,?,?,1)',
      args: [name, icon_class || '', icon_url || '', category || 'frontend', sort_order || 0],
    });

    return NextResponse.json({ id: Number(result.lastInsertRowid), message: 'Created' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
