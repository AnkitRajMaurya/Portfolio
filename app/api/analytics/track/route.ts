import { NextResponse } from 'next/server';
import { ensureDbInitialized } from '@/lib/db/turso';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const page_path = body.page_path || '/';
    const referer = body.referer || 'Direct';

    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    let country = request.headers.get('x-vercel-ip-country') || 'Unknown';
    let city = request.headers.get('x-vercel-ip-city') || 'Unknown';
    let lat = 0.0;
    let lon = 0.0;

    const isLocalIP = ip === '::1' || ip === '127.0.0.1' || ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('172.');
    if (isLocalIP) {
      country = 'India';
      city = 'Muzaffarpur (Local Dev)';
      lat = 26.2201;
      lon = 85.3837;
    }

    const db = await ensureDbInitialized();
    await db.execute({
      sql: 'INSERT INTO visitor_logs (ip_address, user_agent, country, city, lat, lon, page_path, referer) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      args: [ip, userAgent, country, city, lat, lon, page_path, referer],
    });

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Analytics track error:', error);
    return NextResponse.json({ error: 'Failed to log analytics' }, { status: 500 });
  }
}
