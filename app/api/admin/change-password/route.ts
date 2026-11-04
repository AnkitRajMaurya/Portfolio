import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { ensureDbInitialized } from '@/lib/db/turso';
import { authenticateRequest } from '@/lib/auth/jwt';

export async function POST(request: Request) {
  const auth = authenticateRequest(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = await request.json().catch(() => ({}));
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current and new passwords are required.' }, { status: 400 });
    }

    const db = await ensureDbInitialized();
    const result = await db.execute({
      sql: 'SELECT * FROM admin_users WHERE username = ?',
      args: [auth.username],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user: any = result.rows[0];
    const match = await bcrypt.compare(currentPassword, user.password_hash);
    if (!match) {
      return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await db.execute({
      sql: 'UPDATE admin_users SET password_hash = ? WHERE username = ?',
      args: [newHash, auth.username],
    });

    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
