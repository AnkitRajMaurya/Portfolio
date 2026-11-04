import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/turso';

export async function GET() {
  try {
    const db = getDb();
    const result = await db.execute('SELECT key, value FROM portfolio_content');
    const content: Record<string, any> = {};
    for (const r of result.rows) {
      content[(r as any).key] = (r as any).value;
    }
    return NextResponse.json(content);
  } catch (error) {
    return NextResponse.json({
      hero_name: 'Ankit Raj Maurya',
      hero_tagline: 'Engineering with Curiosity & Craft.',
      location: 'Muzaffarpur, Bihar, India',
      status: 'Open for high-impact engineering opportunities',
    });
  }
}
