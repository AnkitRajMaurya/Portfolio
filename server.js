const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const jwt = require("jsonwebtoken");
const path = require("path");
require("dotenv").config();

const { db, initDB } = require("./db");

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

const contactLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });
const adminLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50 });
app.use("/api/contact", contactLimiter);

const JWT_SECRET = process.env.JWT_SECRET || "portfolio_admin_secret_2026";

function requireAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
  try {
    jwt.verify(auth.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

// ── Email ───────────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

// ═══════════════════════════════════════════════════════════════════════
//  STATIC FILES — must come BEFORE any catch-all routes
// ═══════════════════════════════════════════════════════════════════════

// Serve admin panel static files FIRST
app.use("/admin", express.static(path.join(__dirname, "admin")));

// Serve uploaded project images
app.use("/img/projects", express.static(path.join(__dirname, "img", "projects")));

// Serve main portfolio static files
app.use(express.static(__dirname));

// ═══════════════════════════════════════════════════════════════════════
//  PUBLIC API
// ═══════════════════════════════════════════════════════════════════════

app.get("/api/projects", async (req, res) => {
  try {
    const result = await db.execute("SELECT * FROM projects WHERE visible=1 ORDER BY sort_order ASC");
    const projects = result.rows.map(p => ({
      ...p,
      tech_tags: p.tech_tags ? p.tech_tags.split(",").map(t => t.trim()).filter(Boolean) : [],
    }));
    res.json(projects);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "DB error" });
  }
});

app.get("/api/skills", async (req, res) => {
  try {
    const result = await db.execute("SELECT * FROM skills WHERE visible=1 ORDER BY category, sort_order ASC");
    const grouped = { frontend: [], backend: [], others: [] };
    for (const s of result.rows) {
      const cat = (s.category || "frontend").toLowerCase();
      if (grouped[cat]) grouped[cat].push(s);
    }
    res.json(grouped);
  } catch (e) {
    res.status(500).json({ error: "DB error" });
  }
});

app.get("/api/content", async (req, res) => {
  try {
    const result = await db.execute("SELECT key, value FROM portfolio_content");
    const content = {};
    for (const r of result.rows) content[r.key] = r.value;
    res.json(content);
  } catch (e) {
    res.status(500).json({ error: "DB error" });
  }
});

app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ error: "All fields are required" });
    await db.execute({ sql: "INSERT INTO messages (name, email, message) VALUES (?,?,?)", args: [name, email, message] });
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: "ankit5242raj1@outlook.com",
        subject: `Portfolio Contact: ${name}`,
        text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      });
    }
    res.status(200).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Contact error:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// ═══════════════════════════════════════════════════════════════════════
//  ADMIN AUTH
// ═══════════════════════════════════════════════════════════════════════

app.post("/api/admin/login", adminLimiter, (req, res) => {
  const { username, password } = req.body;
  if (username !== (process.env.ADMIN_USERNAME || "admin") || password !== (process.env.ADMIN_PASSWORD || "admin123")) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ username, role: "admin" }, JWT_SECRET, { expiresIn: "24h" });
  res.json({ token, username });
});

// ═══════════════════════════════════════════════════════════════════════
//  ADMIN — PROJECTS
// ═══════════════════════════════════════════════════════════════════════

app.get("/api/admin/projects", requireAdmin, async (req, res) => {
  const result = await db.execute("SELECT * FROM projects ORDER BY sort_order ASC");
  res.json(result.rows.map(p => ({ ...p, tech_tags: p.tech_tags ? p.tech_tags.split(",").map(t => t.trim()) : [] })));
});

app.post("/api/admin/projects", requireAdmin, async (req, res) => {
  try {
    const { title, description, image_url, demo_url, github_url, tech_tags, badge, sort_order, visible } = req.body;
    const tags = Array.isArray(tech_tags) ? tech_tags.join(",") : (tech_tags || "");
    const result = await db.execute({
      sql: "INSERT INTO projects (title,description,image_url,demo_url,github_url,tech_tags,badge,sort_order,visible) VALUES (?,?,?,?,?,?,?,?,?)",
      args: [title, description||"", image_url||"", demo_url||"", github_url||"", tags, badge||"Live", sort_order||0, visible!==false?1:0],
    });
    res.json({ id: Number(result.lastInsertRowid), message: "Created" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put("/api/admin/projects/:id", requireAdmin, async (req, res) => {
  try {
    const { title, description, image_url, demo_url, github_url, tech_tags, badge, sort_order, visible } = req.body;
    const tags = Array.isArray(tech_tags) ? tech_tags.join(",") : (tech_tags || "");
    await db.execute({
      sql: "UPDATE projects SET title=?,description=?,image_url=?,demo_url=?,github_url=?,tech_tags=?,badge=?,sort_order=?,visible=? WHERE id=?",
      args: [title, description||"", image_url||"", demo_url||"", github_url||"", tags, badge||"Live", sort_order||0, visible!==false?1:0, req.params.id],
    });
    res.json({ message: "Updated" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete("/api/admin/projects/:id", requireAdmin, async (req, res) => {
  await db.execute({ sql: "DELETE FROM projects WHERE id=?", args: [req.params.id] });
  res.json({ message: "Deleted" });
});

// ═══════════════════════════════════════════════════════════════════════
//  ADMIN — SKILLS
// ═══════════════════════════════════════════════════════════════════════

app.get("/api/admin/skills", requireAdmin, async (req, res) => {
  const result = await db.execute("SELECT * FROM skills ORDER BY category, sort_order ASC");
  res.json(result.rows);
});

app.post("/api/admin/skills", requireAdmin, async (req, res) => {
  try {
    const { name, icon_class, icon_url, category, sort_order } = req.body;
    const result = await db.execute({
      sql: "INSERT INTO skills (name,icon_class,icon_url,category,sort_order,visible) VALUES (?,?,?,?,?,1)",
      args: [name, icon_class||"", icon_url||"", category||"frontend", sort_order||0],
    });
    res.json({ id: Number(result.lastInsertRowid), message: "Created" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put("/api/admin/skills/:id", requireAdmin, async (req, res) => {
  try {
    const { name, icon_class, icon_url, category, sort_order, visible } = req.body;
    await db.execute({
      sql: "UPDATE skills SET name=?,icon_class=?,icon_url=?,category=?,sort_order=?,visible=? WHERE id=?",
      args: [name, icon_class||"", icon_url||"", category||"frontend", sort_order||0, visible!==false?1:0, req.params.id],
    });
    res.json({ message: "Updated" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete("/api/admin/skills/:id", requireAdmin, async (req, res) => {
  await db.execute({ sql: "DELETE FROM skills WHERE id=?", args: [req.params.id] });
  res.json({ message: "Deleted" });
});

// ═══════════════════════════════════════════════════════════════════════
//  ADMIN — MESSAGES
// ═══════════════════════════════════════════════════════════════════════

app.get("/api/admin/messages", requireAdmin, async (req, res) => {
  const result = await db.execute("SELECT * FROM messages ORDER BY created_at DESC");
  res.json(result.rows);
});

app.put("/api/admin/messages/:id/read", requireAdmin, async (req, res) => {
  await db.execute({ sql: "UPDATE messages SET read=1 WHERE id=?", args: [req.params.id] });
  res.json({ message: "Marked as read" });
});

app.delete("/api/admin/messages/:id", requireAdmin, async (req, res) => {
  await db.execute({ sql: "DELETE FROM messages WHERE id=?", args: [req.params.id] });
  res.json({ message: "Deleted" });
});

// ═══════════════════════════════════════════════════════════════════════
//  ADMIN — CONTENT
// ═══════════════════════════════════════════════════════════════════════

app.get("/api/admin/content", requireAdmin, async (req, res) => {
  const result = await db.execute("SELECT key, value FROM portfolio_content");
  const content = {};
  for (const r of result.rows) content[r.key] = r.value;
  res.json(content);
});

app.put("/api/admin/content", requireAdmin, async (req, res) => {
  try {
    for (const [key, value] of Object.entries(req.body)) {
      await db.execute({
        sql: "INSERT INTO portfolio_content (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
        args: [key, value],
      });
    }
    res.json({ message: "Updated" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ═══════════════════════════════════════════════════════════════════════
//  PUBLIC — CERTIFICATES
// ═══════════════════════════════════════════════════════════════════════

app.get("/api/certificates", async (req, res) => {
  try {
    const result = await db.execute("SELECT * FROM certificates WHERE visible=1 ORDER BY sort_order ASC, created_at DESC");
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: "DB error" }); }
});

// ═══════════════════════════════════════════════════════════════════════
//  ADMIN — CERTIFICATES
// ═══════════════════════════════════════════════════════════════════════

app.get("/api/admin/certificates", requireAdmin, async (req, res) => {
  const result = await db.execute("SELECT * FROM certificates ORDER BY sort_order ASC, created_at DESC");
  res.json(result.rows);
});

app.post("/api/admin/certificates", requireAdmin, async (req, res) => {
  try {
    const { title, issuer, issue_date, credential_url, image_url, type, sort_order } = req.body;
    const result = await db.execute({
      sql: "INSERT INTO certificates (title,issuer,issue_date,credential_url,image_url,type,sort_order,visible) VALUES (?,?,?,?,?,?,?,1)",
      args: [title, issuer||"", issue_date||"", credential_url||"", image_url||"", type||"certificate", sort_order||0],
    });
    res.json({ id: Number(result.lastInsertRowid), message: "Created" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put("/api/admin/certificates/:id", requireAdmin, async (req, res) => {
  try {
    const { title, issuer, issue_date, credential_url, image_url, type, sort_order, visible } = req.body;
    await db.execute({
      sql: "UPDATE certificates SET title=?,issuer=?,issue_date=?,credential_url=?,image_url=?,type=?,sort_order=?,visible=? WHERE id=?",
      args: [title, issuer||"", issue_date||"", credential_url||"", image_url||"", type||"certificate", sort_order||0, visible!==false?1:0, req.params.id],
    });
    res.json({ message: "Updated" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete("/api/admin/certificates/:id", requireAdmin, async (req, res) => {
  await db.execute({ sql: "DELETE FROM certificates WHERE id=?", args: [req.params.id] });
  res.json({ message: "Deleted" });
});

// ── Admin page route ─────────────────────────────────────────────────────────
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin", "index.html"));
});

// 404
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "404.html"));
});

const PORT = process.env.PORT || 3000;
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Portfolio: http://localhost:${PORT}`);
    console.log(`🔐 Admin:     http://localhost:${PORT}/admin`);
  });
}).catch(err => { console.error("DB init failed:", err); process.exit(1); });
