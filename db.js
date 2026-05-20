const { createClient } = require("@libsql/client");
require("dotenv").config();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function initDB() {
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

  // Add missing columns to older tables (ignores error if column already exists)
  const alterStatements = [
    "ALTER TABLE projects ADD COLUMN description TEXT",
    "ALTER TABLE projects ADD COLUMN image_url TEXT",
    "ALTER TABLE projects ADD COLUMN demo_url TEXT",
    "ALTER TABLE projects ADD COLUMN github_url TEXT",
    "ALTER TABLE projects ADD COLUMN tech_tags TEXT",
    "ALTER TABLE projects ADD COLUMN badge TEXT DEFAULT 'Live'",
    "ALTER TABLE projects ADD COLUMN sort_order INTEGER DEFAULT 0",
    "ALTER TABLE projects ADD COLUMN visible INTEGER DEFAULT 1",
    "ALTER TABLE projects ADD COLUMN created_at TEXT DEFAULT (datetime('now'))",
    "ALTER TABLE skills ADD COLUMN icon_class TEXT",
    "ALTER TABLE skills ADD COLUMN icon_url TEXT",
    "ALTER TABLE skills ADD COLUMN sort_order INTEGER DEFAULT 0",
    "ALTER TABLE skills ADD COLUMN visible INTEGER DEFAULT 1",
    "ALTER TABLE messages ADD COLUMN read INTEGER DEFAULT 0",
  ];
  for (const sql of alterStatements) {
    try { await db.execute(sql); } catch (e) { /* column already exists, ignore */ }
  }

  // Seed default content if empty
  const proj = await db.execute("SELECT COUNT(*) as c FROM projects");
  if (proj.rows[0].c === 0) {
    await db.executeMultiple(`
      INSERT INTO projects (title, description, image_url, demo_url, github_url, tech_tags, badge, sort_order) VALUES
        ('Codex Monarch', 'A premier student-led technical community platform for national-level hackathons and collaborative engineering projects. Features time-gated coding arenas and a LeetCode-style IDE.', '', 'https://codex-monarch.vercel.app/', '', 'Node.js,MongoDB,JavaScript', 'Live', 1),
        ('Orbit UI', 'A modern component library and UI showcase built with vanilla JavaScript. Clean, accessible, and lightweight design system ready for production use.', '', 'https://orbitui-eta.vercel.app/', 'https://github.com/AnkitRajMaurya/ORBITUI', 'HTML5,CSS3,JavaScript', 'Live', 2),
        ('Weather Application', 'A full-featured weather application providing real-time weather data using the OpenWeather API, including current conditions and forecasts.', '', 'https://weather-project-lovat-five.vercel.app/', 'https://github.com/AnkitRajMaurya/weather-project', 'React,OpenWeather,CSS Modules', 'Live', 3);
    `);
  }

  const skills = await db.execute("SELECT COUNT(*) as c FROM skills");
  if (skills.rows[0].c === 0) {
    await db.executeMultiple(`
      INSERT INTO skills (name, icon_class, category, sort_order) VALUES
        ('JavaScript', 'fa-brands fa-js', 'frontend', 1),
        ('React.js', 'fa-brands fa-react', 'frontend', 2),
        ('Next.js', 'fa-solid fa-n', 'frontend', 3),
        ('HTML5', 'fa-brands fa-html5', 'frontend', 4),
        ('CSS3/SCSS', 'fa-brands fa-css3-alt', 'frontend', 5),
        ('TypeScript', 'fa-brands fa-js', 'frontend', 6),
        ('Tailwind CSS', 'fa-solid fa-wind', 'frontend', 7),
        ('Bootstrap', 'fa-brands fa-bootstrap', 'frontend', 8),
        ('Node.js', 'fa-brands fa-node-js', 'backend', 1),
        ('Express.js', 'fa-solid fa-server', 'backend', 2),
        ('MongoDB', 'fa-solid fa-database', 'backend', 3),
        ('Firebase', 'fa-solid fa-fire', 'backend', 4),
        ('MySQL', 'fa-solid fa-database', 'backend', 5),
        ('PHP', 'fa-brands fa-php', 'backend', 6),
        ('REST APIs', 'fa-solid fa-plug', 'backend', 7),
        ('Turso/SQLite', 'fa-solid fa-database', 'backend', 8),
        ('Git', 'fa-brands fa-git-alt', 'others', 1),
        ('GitHub', 'fa-brands fa-github', 'others', 2),
        ('Docker', 'fa-brands fa-docker', 'others', 3),
        ('Figma', 'fa-brands fa-figma', 'others', 4),
        ('Flutter', 'fa-solid fa-mobile-screen', 'others', 5),
        ('Android SDK', 'fa-brands fa-android', 'others', 6),
        ('Java', 'fa-brands fa-java', 'others', 7),
        ('Python', 'fa-brands fa-python', 'others', 8);
    `);
  }

  const content = await db.execute("SELECT COUNT(*) as c FROM portfolio_content");
  if (content.rows[0].c === 0) {
    await db.executeMultiple(`
      INSERT INTO portfolio_content (key, value) VALUES
        ('hero_greeting', 'Hello, I''m'),
        ('hero_name', 'Ankit Raj Maurya'),
        ('hero_tagline', 'From Problem to Production-Ready.'),
        ('hero_description', 'A results-driven Full-Stack Developer and Co-founder at Codex Monarch specializing in high-performance web and mobile solutions. I transform complex problems into seamless production-ready applications.'),
        ('status_pill', 'Available for new opportunities'),
        ('about_slogan', 'Building Digital Ecosystems'),
        ('about_description', 'Hello! I''m Ankit, a dedicated Full-Stack Developer and Co-founder at Codex Monarch based in Muzaffarpur, Bihar. I specialize in building highly scalable, production-ready applications that merge technical efficiency with elegant user experiences.'),
        ('location', 'Muzaffarpur, Bihar, India'),
        ('email', 'ankit5242raj1@outlook.com');
    `);
  }

  const users = await db.execute("SELECT COUNT(*) as c FROM admin_users");
  if (users.rows[0].c === 0 && process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) {
    const bcrypt = require("bcryptjs");
    const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
    await db.execute({
      sql: "INSERT INTO admin_users (username, password_hash) VALUES (?, ?)",
      args: [process.env.ADMIN_USERNAME, hash]
    });
    console.log("👤 Default admin user seeded");
  }

  console.log("✅ Turso DB initialized");
}

module.exports = { db, initDB };
