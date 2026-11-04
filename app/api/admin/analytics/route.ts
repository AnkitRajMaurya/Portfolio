import { NextResponse } from 'next/server';
import { ensureDbInitialized } from '@/lib/db/turso';
import { authenticateRequest } from '@/lib/auth/jwt';

export async function GET(request: Request) {
  const auth = authenticateRequest(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const db = await ensureDbInitialized();
    const totalViewsRes = await db.execute('SELECT COUNT(*) as count FROM visitor_logs');
    const totalViews = Number(totalViewsRes.rows[0]?.count || 0);

    const uniqueVisitorsRes = await db.execute('SELECT COUNT(DISTINCT ip_address) as count FROM visitor_logs');
    const uniqueVisitors = Number(uniqueVisitorsRes.rows[0]?.count || 0);

    const recentLogsRes = await db.execute('SELECT * FROM visitor_logs ORDER BY created_at DESC LIMIT 100');

    return NextResponse.json({
      totalViews,
      uniqueVisitors,
      recentLogs: recentLogsRes.rows,
    });
  } catch (error: any) {
    console.error('Admin analytics error:', error);
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 });
  }
}
