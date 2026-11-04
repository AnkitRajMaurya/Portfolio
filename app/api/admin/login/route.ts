import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { ensureDbInitialized } from '@/lib/db/turso';
import { signToken } from '@/lib/auth/jwt';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json().catch(() => ({}));

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required.' }, { status: 400 });
    }

    const db = await ensureDbInitialized();
    const result = await db.execute({
      sql: 'SELECT * FROM admin_users WHERE username = ?',
      args: [username],
    });

    if (result.rows.length === 0) {
      // Fallback check against environment variable
      const envUser = process.env.ADMIN_USERNAME || 'admin';
      const envPass = process.env.ADMIN_PASSWORD || 'admin123';
      if (username === envUser && password === envPass) {
        const token = signToken({ username, role: 'admin' });
        return NextResponse.json({ token, username });
      }
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const user: any = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = signToken({ username, role: 'admin' });
    return NextResponse.json({ token, username });
  } catch (error: any) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Authentication failed.' }, { status: 500 });
  }
}
