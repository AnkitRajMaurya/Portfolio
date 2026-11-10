import { createClient, Client } from '@libsql/client';
import bcrypt from 'bcryptjs';

let dbClient: Client | null = null;
let isInitialized = false;

export function getDb(): Client {
  if (!dbClient) {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    // In local dev or environments without direct Turso access, fallback to local file
    try {
      if (url && (url.startsWith('libsql://') || url.startsWith('https://'))) {
        dbClient = createClient({
          url,
          authToken: authToken || undefined,
        });
      } else {
        dbClient = createClient({ url: 'file:local.db' });
      }
    } catch {
      dbClient = createClient({ url: 'file:local.db' });
    }
  }
  return dbClient;
}

export async function ensureDbInitialized(): Promise<Client> {
  let client = getDb();

  if (isInitialized) return client;

  try {
    await runMigrations(client);
    isInitialized = true;
    return client;
  } catch (err: any) {
    console.warn('⚠️ Remote Turso init failed, switching to resilient local SQLite database:', err?.message || err);
    // Fallback to local SQLite if remote Turso fails (e.g. offline, DNS ENOTFOUND)
    client = createClient({ url: 'file:local.db' });
    dbClient = client;
    await runMigrations(client);
    isInitialized = true;
    return client;
  }
}

async function runMigrations(db: Client) {
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      demo_url TEXT,
      github_url TEXT,
      tech_tags TEXT,
      badge TEXT DEFAULT 'Live',
      sort_order INTEGER DEFAULT 0,
      visible INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon_class TEXT,
      icon_url TEXT,
      category TEXT NOT NULL DEFAULT 'frontend',
      sort_order INTEGER DEFAULT 0,
      visible INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT,
      message TEXT,
      read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS portfolio_content (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS certificates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      issuer TEXT,
      issue_date TEXT,
      credential_url TEXT,
      image_url TEXT,
      type TEXT DEFAULT 'certificate',
      sort_order INTEGER DEFAULT 0,
      visible INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      username TEXT PRIMARY KEY,
      password_hash TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS visitor_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ip_address TEXT,
      user_agent TEXT,
      country TEXT,
      city TEXT,
      lat REAL,
      lon REAL,
      page_path TEXT,
      referer TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Seed Admin user if empty
  const usersRes = await db.execute('SELECT COUNT(*) as c FROM admin_users');
  const userCount = Number(usersRes.rows[0]?.c || 0);
  if (userCount === 0) {
    const defaultUser = process.env.ADMIN_USERNAME || 'admin';
    const defaultPass = process.env.ADMIN_PASSWORD || 'admin123';
    const hash = await bcrypt.hash(defaultPass, 10);
    await db.execute({
      sql: 'INSERT INTO admin_users (username, password_hash) VALUES (?, ?)',
      args: [defaultUser, hash],
    });
  }

  // Seed Projects if empty
  const projRes = await db.execute('SELECT COUNT(*) as c FROM projects');
  if (Number(projRes.rows[0]?.c || 0) === 0) {
    await db.executeMultiple(`
      INSERT INTO projects (title, description, image_url, demo_url, github_url, tech_tags, badge, sort_order) VALUES
        ('Codex Monarch', 'A premier student-led technical community platform for national-level hackathons and collaborative engineering projects. Features time-gated coding arenas and a LeetCode-style IDE.', '/img/projects/codex-monarch.png', 'https://www.codexmonarch.me/', '', 'Node.js,MongoDB,JavaScript,Community Engine', 'Team Lead', 1),
        ('ReadyToGo', 'Comprehensive programming and placement preparation ecosystem featuring DSA sheet tracking, topic guides, and practice tests.', '/img/projects/readytogo.png', 'https://readytogo.codexmonarch.me/', '', 'Full-Stack,Next.js,DSA Prep,Algorithms', 'Career Platform', 2),
        ('Orbit UI', 'A lightweight, zero-dependency component library and UI showcase engineered with vanilla JavaScript. Clean, accessible, and lightweight design system ready for production use.', '/img/projects/orbit-ui.png', 'https://orbitui-eta.vercel.app/', 'https://github.com/AnkitRajMaurya/ORBITUI', 'HTML5,CSS3,JavaScript,Design System', 'UI System', 3),
        ('Weather Application', 'A full-featured meteorological dashboard providing real-time weather data using the OpenWeather API, including dynamic condition animations and forecasts.', '/img/projects/weather-app.png', 'https://weather-project-lovat-five.vercel.app/', 'https://github.com/AnkitRajMaurya/weather-project', 'React,OpenWeather,CSS Modules', 'Live', 4);
    `);
  }

  // Seed Skills if empty
  const skillsRes = await db.execute('SELECT COUNT(*) as c FROM skills');
  if (Number(skillsRes.rows[0]?.c || 0) === 0) {
    await db.executeMultiple(`
      INSERT INTO skills (name, icon_class, category, sort_order) VALUES
        ('JavaScript (ESNext)', 'fa-brands fa-js', 'frontend', 1),
        ('React.js', 'fa-brands fa-react', 'frontend', 2),
        ('Next.js', 'fa-solid fa-n', 'frontend', 3),
        ('HTML5 & CSS3', 'fa-brands fa-html5', 'frontend', 4),
        ('SCSS / Sass', 'fa-brands fa-sass', 'frontend', 5),
        ('TypeScript', 'fa-brands fa-js', 'frontend', 6),
        ('Tailwind CSS', 'fa-solid fa-wind', 'frontend', 7),
        ('Node.js', 'fa-brands fa-node-js', 'backend', 1),
        ('Express.js', 'fa-solid fa-server', 'backend', 2),
        ('REST APIs', 'fa-solid fa-plug', 'backend', 3),
        ('PHP', 'fa-brands fa-php', 'backend', 4),
        ('MongoDB', 'fa-solid fa-database', 'databases', 1),
        ('Turso / LibSQL', 'fa-solid fa-database', 'databases', 2),
        ('SQLite', 'fa-solid fa-database', 'databases', 3),
        ('Firebase', 'fa-solid fa-fire', 'databases', 4),
        ('MySQL', 'fa-solid fa-database', 'databases', 5),
        ('Java', 'fa-brands fa-java', 'languages', 1),
        ('C Language', 'fa-solid fa-code', 'languages', 2),
        ('Python', 'fa-brands fa-python', 'languages', 3),
        ('Flutter', 'fa-solid fa-mobile-screen', 'mobile', 1),
        ('Android SDK', 'fa-brands fa-android', 'mobile', 2),
        ('Git & GitHub', 'fa-brands fa-github', 'tools', 1),
        ('Figma', 'fa-brands fa-figma', 'tools', 2),
        ('Docker', 'fa-brands fa-docker', 'tools', 3),
        ('Vercel', 'fa-solid fa-triangle-exclamation', 'tools', 4);
    `);
  }

  // Seed Certificates if empty (Including Prompt War Runner-Up!)
  const certRes = await db.execute('SELECT COUNT(*) as c FROM certificates');
  if (Number(certRes.rows[0]?.c || 0) === 0) {
    await db.executeMultiple(`
      INSERT INTO certificates (title, issuer, issue_date, credential_url, image_url, type, sort_order, visible) VALUES
        ('AI Prompt War – Runner-Up', 'Oriental Group of Institutes', 'Apr 2026', 'https://res.cloudinary.com/duhw4pa8k/image/upload/v1778675301/WhatsApp_Image_2026-05-13_at_17.56.14_pvgthh.jpg', 'https://res.cloudinary.com/duhw4pa8k/image/upload/v1778675301/WhatsApp_Image_2026-05-13_at_17.56.14_pvgthh.jpg', 'certificate', 1, 1);
    `);
  }

  // Seed Portfolio Content if empty
  const contentRes = await db.execute('SELECT COUNT(*) as c FROM portfolio_content');
  if (Number(contentRes.rows[0]?.c || 0) === 0) {
    await db.executeMultiple(`
      INSERT INTO portfolio_content (key, value) VALUES
        ('hero_greeting', 'Hello, I''m'),
        ('hero_name', 'Ankit Raj Maurya'),
        ('hero_tagline', 'From Problem to Production-Ready.'),
        ('hero_description', 'A results-driven Full-Stack Developer and Team Lead at Codex Monarch specializing in high-performance web and mobile solutions. I transform complex problems into seamless production-ready applications.'),
        ('status_pill', 'Available for new opportunities'),
        ('about_slogan', 'Building Digital Ecosystems'),
        ('about_description', 'Hello! I''m Ankit, a dedicated Full-Stack Developer and Team Lead at Codex Monarch based in Muzaffarpur, Bihar. I build highly scalable, production-ready applications that merge technical efficiency with elegant user experiences.'),
        ('location', 'Muzaffarpur, Bihar, India'),
        ('email', 'ankit5242raj1@outlook.com'),
        ('resume_url', 'https://drive.google.com/file/d/1359Lhc3l75iBDmdHSWJDFBz4O8sG33MJ/view?usp=drivesdk');
    `);
  }
}

export interface ProjectRecord {
  id: number;
  title: string;
  description: string;
  image_url: string;
  demo_url: string;
  github_url: string;
  tech_tags: string | string[];
  badge: string;
  sort_order: number;
  visible: number;
  created_at?: string;
}

export interface SkillRecord {
  id: number;
  name: string;
  icon_class: string;
  icon_url: string;
  category: string;
  sort_order: number;
  visible: number;
}

export interface CertificateRecord {
  id: number;
  title: string;
  issuer: string;
  issue_date: string;
  credential_url: string;
  image_url: string;
  type: string;
  sort_order: number;
  visible: number;
  created_at?: string;
}
