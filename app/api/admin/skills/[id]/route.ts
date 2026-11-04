import { NextResponse } from 'next/server';
import { ensureDbInitialized } from '@/lib/db/turso';
import { authenticateRequest } from '@/lib/auth/jwt';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = authenticateRequest(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, icon_class, icon_url, category, sort_order, visible } = body;

    const db = await ensureDbInitialized();
    await db.execute({
      sql: 'UPDATE skills SET name=?, icon_class=?, icon_url=?, category=?, sort_order=?, visible=? WHERE id=?',
      args: [name, icon_class || '', icon_url || '', category || 'frontend', sort_order || 0, visible !== false ? 1 : 0, id],
    });

    return NextResponse.json({ message: 'Updated' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = authenticateRequest(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const db = await ensureDbInitialized();
    await db.execute({ sql: 'DELETE FROM skills WHERE id=?', args: [id] });
    return NextResponse.json({ message: 'Deleted' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
