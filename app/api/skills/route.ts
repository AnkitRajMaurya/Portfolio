import { NextResponse } from 'next/server';
import { ensureDbInitialized } from '@/lib/db/turso';

export async function GET() {
  try {
    const db = await ensureDbInitialized();
    const result = await db.execute('SELECT * FROM skills WHERE visible=1 ORDER BY category, sort_order ASC, id ASC');
    const grouped: Record<string, any[]> = { frontend: [], backend: [], databases: [], languages: [], mobile: [], tools: [] };
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
        { name: 'HTML5 & CSS3', level: 'Semantic / Modern', icon_class: 'fa-brands fa-html5' },
        { name: 'JavaScript (ESNext)', level: 'Advanced', icon_class: 'fa-brands fa-js' },
        { name: 'React.js', level: 'Component Architecture', icon_class: 'fa-brands fa-react' },
        { name: 'Next.js', level: 'App Router / SSR', icon_class: 'fa-solid fa-n' },
        { name: 'SCSS / Sass', level: 'Modular Design Tokens', icon_class: 'fa-brands fa-sass' },
      ],
      backend: [
        { name: 'Node.js', level: 'Server Runtime', icon_class: 'fa-brands fa-node-js' },
        { name: 'Express.js', level: 'REST APIs & Middleware', icon_class: 'fa-solid fa-server' },
        { name: 'REST APIs', level: 'Design & Architecture', icon_class: 'fa-solid fa-plug' },
      ],
      databases: [
        { name: 'MongoDB', level: 'NoSQL Schemas', icon_class: 'fa-solid fa-database' },
        { name: 'Turso / LibSQL', level: 'Edge SQLite', icon_class: 'fa-solid fa-database' },
        { name: 'SQLite', level: 'Embedded Databases', icon_class: 'fa-solid fa-database' },
      ],
      languages: [
        { name: 'Java', level: 'Core & OOP & DSA', icon_class: 'fa-brands fa-java' },
        { name: 'C Language', level: 'Systems & Memory Fundamentals', icon_class: 'fa-solid fa-code' },
        { name: 'Python', level: 'Scripting & Automation', icon_class: 'fa-brands fa-python' },
      ],
      mobile: [
        { name: 'Flutter', level: 'Cross-platform UI', icon_class: 'fa-solid fa-mobile-screen' },
      ],
      tools: [
        { name: 'Git & GitHub', level: 'Version Control & Workflows', icon_class: 'fa-brands fa-github' },
        { name: 'Figma', level: 'Interface Prototyping', icon_class: 'fa-brands fa-figma' },
        { name: 'Docker', level: 'Containerization', icon_class: 'fa-brands fa-docker' },
        { name: 'Vercel', level: 'Continuous Deployment', icon_class: 'fa-solid fa-triangle-exclamation' },
      ],
    });
  }
}
