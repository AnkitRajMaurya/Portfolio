import { NextResponse } from 'next/server';
import { ensureDbInitialized } from '@/lib/db/turso';
import { authenticateRequest } from '@/lib/auth/jwt';

export async function GET(request: Request) {
  const auth = authenticateRequest(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const db = await ensureDbInitialized();

    const projectsRes = await db.execute('SELECT id, title, created_at FROM projects ORDER BY created_at DESC LIMIT 10');
    const projects = projectsRes.rows.map((p: any) => ({
      type: 'project',
      title: 'Project Updated',
      description: `Project "${p.title}" saved to database.`,
      time: p.created_at,
    }));

    const messagesRes = await db.execute('SELECT id, name, created_at FROM messages ORDER BY created_at DESC LIMIT 10');
    const messages = messagesRes.rows.map((m: any) => ({
      type: 'message',
      title: 'New Contact Inquiry',
      description: `Inquiry received from ${m.name}.`,
      time: m.created_at,
    }));

    const visitorsRes = await db.execute('SELECT id, city, country, page_path, created_at FROM visitor_logs ORDER BY created_at DESC LIMIT 10');
    const visitors = visitorsRes.rows.map((v: any) => ({
      type: 'visitor',
      title: 'Visitor Session',
      description: `Visit logged on "${v.page_path}" from ${v.city}, ${v.country}.`,
      time: v.created_at,
    }));

    const merged = [...projects, ...messages, ...visitors];
    merged.sort((a, b) => {
      const aTime = a.time ? new Date(a.time).getTime() : 0;
      const bTime = b.time ? new Date(b.time).getTime() : 0;
      return bTime - aTime;
    });

    return NextResponse.json(merged.slice(0, 15));
  } catch (error: any) {
    console.error('Admin activity fetch error:', error);
    return NextResponse.json({ error: 'Failed to compile recent activity list' }, { status: 500 });
  }
}
