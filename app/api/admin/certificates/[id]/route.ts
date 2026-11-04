import { NextResponse } from 'next/server';
import { ensureDbInitialized } from '@/lib/db/turso';
import { authenticateRequest } from '@/lib/auth/jwt';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = authenticateRequest(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const { title, issuer, issue_date, credential_url, image_url, type, sort_order, visible } = body;

    const db = await ensureDbInitialized();
    await db.execute({
      sql: 'UPDATE certificates SET title=?, issuer=?, issue_date=?, credential_url=?, image_url=?, type=?, sort_order=?, visible=? WHERE id=?',
      args: [title, issuer || '', issue_date || '', credential_url || '', image_url || '', type || 'certificate', sort_order || 0, visible !== false ? 1 : 0, id],
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
    await db.execute({ sql: 'DELETE FROM certificates WHERE id=?', args: [id] });
    return NextResponse.json({ message: 'Deleted' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
