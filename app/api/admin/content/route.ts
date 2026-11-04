import { NextResponse } from 'next/server';
import { ensureDbInitialized } from '@/lib/db/turso';
import { authenticateRequest } from '@/lib/auth/jwt';

export async function GET(request: Request) {
  const auth = authenticateRequest(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const db = await ensureDbInitialized();
    const result = await db.execute('SELECT key, value FROM portfolio_content');
    const content: Record<string, any> = {};
    for (const r of result.rows) {
      content[(r as any).key] = (r as any).value;
    }
    return NextResponse.json(content);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const auth = authenticateRequest(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const db = await ensureDbInitialized();
    for (const [key, value] of Object.entries(body)) {
      await db.execute({
        sql: 'INSERT INTO portfolio_content (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',
        args: [key, String(value || '')],
      });
    }
    return NextResponse.json({ message: 'Updated' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
