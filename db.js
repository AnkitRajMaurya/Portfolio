const { createClient } = require("@libsql/client");
require("dotenv").config();

let db;
function getClient() {
  if (!db) {
    try {
      const url = process.env.TURSO_DATABASE_URL;
      const authToken = process.env.TURSO_AUTH_TOKEN;
      if (url && (url.startsWith("libsql://") || url.startsWith("https://"))) {
        db = createClient({ url, authToken });
      } else {
        db = createClient({ url: "file:local.db" });
      }
    } catch {
      db = createClient({ url: "file:local.db" });
    }
  }
  return db;
}

db = getClient();

async function initDB() {
  try {
    await runInit(db);
  } catch (err) {
    console.warn("⚠️ Remote Turso init failed, falling back to local SQLite:", err.message);
    db = createClient({ url: "file:local.db" });
    await runInit(db);
  }
  console.log("✅ Database initialized successfully");
}

async function runInit(database) {
  await database.executeMultiple(`
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

  // Alter statements for safety
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
    try { await database.execute(sql); } catch (e) { /* ignore */ }
  }

  // Seed projects
  const proj = await database.execute("SELECT COUNT(*) as c FROM projects");
  if (Number(proj.rows[0].c) === 0) {
    await database.executeMultiple(`
      INSERT INTO projects (title, description, image_url, demo_url, github_url, tech_tags, badge, sort_order) VALUES
        ('Codex Monarch', 'A premier student-led technical community platform for national-level hackathons and collaborative engineering projects.', '/img/projects/codex-monarch.png', 'https://www.codexmonarch.me/', '', 'Node.js,MongoDB,JavaScript', 'Lead & Co-Founder', 1),
        ('ReadyToGo', 'Career-readiness and placement preparation platform that helps students prepare and get hired.', '/img/projects/readytogo.png', 'https://readytogo.codexmonarch.me/', '', 'HTML5,CSS3,JavaScript', 'Career Platform', 2),
        ('Orbit UI', 'A modern component library and UI showcase built with vanilla JavaScript. Clean, accessible, and lightweight design system ready for production use.', '/img/projects/orbit-ui.png', 'https://orbitui-eta.vercel.app/', 'https://github.com/AnkitRajMaurya/ORBITUI', 'HTML5,CSS3,JavaScript', 'UI System', 3),
        ('Weather Application', 'A full-featured weather application providing real-time weather data using the OpenWeather API, including current conditions and forecasts.', '/img/projects/weather-app.png', 'https://weather-project-lovat-five.vercel.app/', 'https://github.com/AnkitRajMaurya/weather-project', 'React,OpenWeather,CSS Modules', 'Utility App', 4);
    `);
  }

  // Seed skills
  const skills = await database.execute("SELECT COUNT(*) as c FROM skills");
  if (Number(skills.rows[0].c) === 0) {
    await database.executeMultiple(`
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
        ('Git', 'fa-brands fa-git-alt', 'tools', 1),
        ('GitHub', 'fa-brands fa-github', 'tools', 2),
        ('Docker', 'fa-brands fa-docker', 'tools', 3),
        ('Figma', 'fa-brands fa-figma', 'tools', 4),
        ('Flutter', 'fa-solid fa-mobile-screen', 'mobile', 1),
        ('Android SDK', 'fa-brands fa-android', 'mobile', 2),
        ('Java', 'fa-brands fa-java', 'languages', 1),
        ('Python', 'fa-brands fa-python', 'languages', 2);
    `);
  }

  // Seed certificates including Prompt War
  const certs = await database.execute("SELECT COUNT(*) as c FROM certificates");
  if (Number(certs.rows[0].c) === 0) {
    await database.executeMultiple(`
      INSERT INTO certificates (title, issuer, issue_date, credential_url, image_url, type, sort_order, visible) VALUES
        ('AI Prompt War – Runner-Up', 'Oriental Group of Institutes', 'Apr 2026', 'https://res.cloudinary.com/duhw4pa8k/image/upload/v1778675301/WhatsApp_Image_2026-05-13_at_17.56.14_pvgthh.jpg', 'https://res.cloudinary.com/duhw4pa8k/image/upload/v1778675301/WhatsApp_Image_2026-05-13_at_17.56.14_pvgthh.jpg', 'certificate', 1, 1);
    `);
  }

  // Seed content
  const content = await database.execute("SELECT COUNT(*) as c FROM portfolio_content");
  if (Number(content.rows[0].c) === 0) {
    await database.executeMultiple(`
      INSERT INTO portfolio_content (key, value) VALUES
        ('hero_greeting', 'Hello, I''m'),
        ('hero_name', 'Ankit Raj Maurya'),
        ('hero_tagline', 'From Problem to Production-Ready.'),
        ('hero_description', 'A results-driven Full-Stack Developer and Co-founder at Codex Monarch specializing in high-performance web and mobile solutions.'),
        ('status_pill', 'Available for new opportunities'),
        ('about_slogan', 'Building Digital Ecosystems'),
        ('about_description', 'Hello! I''m Ankit, a dedicated Full-Stack Developer and Co-founder at Codex Monarch based in Muzaffarpur, Bihar. I specialize in building highly scalable, production-ready applications.'),
        ('location', 'Muzaffarpur, Bihar, India'),
        ('email', 'ankit5242raj1@outlook.com'),
        ('resume_url', 'https://drive.google.com/file/d/1359Lhc3l75iBDmdHSWJDFBz4O8sG33MJ/view?usp=drivesdk');
    `);
  }

  // Seed admin user
  const users = await database.execute("SELECT COUNT(*) as c FROM admin_users");
  if (Number(users.rows[0].c) === 0) {
    const bcrypt = require("bcryptjs");
    const u = process.env.ADMIN_USERNAME || "admin";
    const p = process.env.ADMIN_PASSWORD || "admin123";
    const hash = await bcrypt.hash(p, 10);
    await database.execute({
      sql: "INSERT INTO admin_users (username, password_hash) VALUES (?, ?)",
      args: [u, hash]
    });
  }
}

module.exports = {
  get db() { return db; },
  initDB
};
