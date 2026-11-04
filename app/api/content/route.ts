import { NextResponse } from 'next/server';
import { ensureDbInitialized } from '@/lib/db/turso';

export async function GET() {
  try {
    const db = await ensureDbInitialized();
    const result = await db.execute('SELECT key, value FROM portfolio_content');
    const content: Record<string, any> = {};
    for (const r of result.rows) {
      content[(r as any).key] = (r as any).value;
    }
    return NextResponse.json(content);
  } catch (error) {
    return NextResponse.json({
      hero_greeting: "Hello, I'm",
      hero_name: 'Ankit Raj Maurya',
      hero_tagline: 'From Problem to Production-Ready.',
      hero_description: 'A results-driven Full-Stack Developer and Co-founder at Codex Monarch specializing in high-performance web and mobile solutions.',
      about_slogan: 'Building Digital Ecosystems',
      about_description: 'Hello! I\'m Ankit, a dedicated Full-Stack Developer and Co-founder at Codex Monarch based in Muzaffarpur, Bihar. I build highly scalable, production-ready applications.',
      location: 'Muzaffarpur, Bihar, India',
      email: 'ankit5242raj1@outlook.com',
      resume_url: 'https://drive.google.com/file/d/1359Lhc3l75iBDmdHSWJDFBz4O8sG33MJ/view?usp=drivesdk',
    });
  }
}
