import { NextResponse } from 'next/server';
import { getDb, ProjectRecord } from '@/lib/db/turso';

export async function GET() {
  try {
    const db = getDb();
    const result = await db.execute('SELECT * FROM projects WHERE visible=1 ORDER BY sort_order ASC');
    const projects = result.rows.map((row: any) => ({
      ...row,
      tech_tags: typeof row.tech_tags === 'string'
        ? row.tech_tags.split(',').map((t: string) => t.trim()).filter(Boolean)
        : (row.tech_tags || []),
    }));
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Projects API error:', error);
    // Return verified fallback projects if DB is not reachable
    return NextResponse.json([
      {
        id: 1,
        title: 'Codex Monarch',
        description: 'A premier student-led technical community platform for national hackathons and collaborative engineering projects.',
        image_url: '/img/projects/codex-monarch.png',
        demo_url: 'https://www.codexmonarch.me/',
        github_url: '',
        tech_tags: ['Node.js', 'MongoDB', 'JavaScript', 'Community Engine'],
        badge: 'Lead & Core Team',
        sort_order: 1,
      },
      {
        id: 2,
        title: 'ReadyToGo',
        description: 'Comprehensive programming and placement preparation ecosystem featuring DSA sheet tracking, topic guides, and practice tests.',
        image_url: '/img/projects/readytogo.png',
        demo_url: 'https://readytogo.codexmonarch.me/',
        github_url: '',
        tech_tags: ['Full-Stack', 'Next.js', 'DSA Prep', 'Algorithms'],
        badge: 'Flagship Platform',
        sort_order: 2,
      },
      {
        id: 3,
        title: 'Orbit UI',
        description: 'Minimalist accessible component library and interaction design showcase engineered with vanilla JavaScript.',
        image_url: '/img/projects/orbit-ui.png',
        demo_url: 'https://orbitui-eta.vercel.app/',
        github_url: 'https://github.com/AnkitRajMaurya/ORBITUI',
        tech_tags: ['Vanilla JS', 'Design System', 'Accessibility'],
        badge: 'UI System',
        sort_order: 3,
      },
      {
        id: 4,
        title: 'Weather Application',
        description: 'High-precision meteorological dashboard leveraging OpenWeather APIs with dynamic condition animations.',
        image_url: '/img/projects/weather-app.png',
        demo_url: 'https://weather-project-lovat-five.vercel.app/',
        github_url: 'https://github.com/AnkitRajMaurya/weather-project',
        tech_tags: ['React', 'OpenWeather API', 'CSS Modules'],
        badge: 'Utility App',
        sort_order: 4,
      },
    ]);
  }
}
