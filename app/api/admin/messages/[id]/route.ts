import { NextResponse } from 'next/server';
import { ensureDbInitialized } from '@/lib/db/turso';
import { authenticateRequest } from '@/lib/auth/jwt';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = authenticateRequest(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const db = await ensureDbInitialized();
    await db.execute({ sql: 'DELETE FROM messages WHERE id=?', args: [id] });
    return NextResponse.json({ message: 'Deleted' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
