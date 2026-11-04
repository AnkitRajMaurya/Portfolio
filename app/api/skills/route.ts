import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/turso';

export async function GET() {
  try {
    const db = getDb();
    const result = await db.execute('SELECT * FROM skills WHERE visible=1 ORDER BY category, sort_order ASC');
    const grouped: Record<string, any[]> = { frontend: [], backend: [], languages: [], tools: [] };
    for (const s of result.rows) {
      const cat = ((s as any).category || 'frontend').toLowerCase();
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(s);
    }
    return NextResponse.json(grouped);
  } catch (error) {
    console.error('Skills API error:', error);
    return NextResponse.json({
      frontend: [
        { name: 'HTML5 & CSS3', level: 'Semantic / Modern' },
        { name: 'JavaScript (ESNext)', level: 'Advanced' },
        { name: 'React.js', level: 'Component Architecture' },
        { name: 'Next.js', level: 'App Router / SSR' },
        { name: 'SCSS / Sass', level: 'Modular Design Tokens' },
      ],
      backend: [
        { name: 'Node.js', level: 'Server Runtime' },
        { name: 'Express.js', level: 'REST APIs & Middleware' },
        { name: 'REST APIs', level: 'Design & Architecture' },
      ],
      databases: [
        { name: 'MongoDB', level: 'NoSQL Schemas' },
        { name: 'Turso / LibSQL', level: 'Edge SQLite' },
        { name: 'SQLite', level: 'Embedded Databases' },
      ],
      languages: [
        { name: 'Java', level: 'Core & OOP & DSA' },
        { name: 'C Language', level: 'Systems & Memory Fundamentals' },
      ],
      mobile: [
        { name: 'Flutter', level: 'Cross-platform UI' },
      ],
      tools: [
        { name: 'Git & GitHub', level: 'Version Control & Workflows' },
        { name: 'Figma', level: 'Interface Prototyping' },
        { name: 'Vercel', level: 'Continuous Deployment' },
      ],
    });
  }
}
