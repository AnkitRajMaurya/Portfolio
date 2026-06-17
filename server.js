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

const compression = require("compression");
app.use(compression());

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());


const contactLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });
const adminLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50 });
app.use("/api/contact", contactLimiter);

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is missing.");
}

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
const staticOptions = {
  maxAge: "1y",
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === ".html" || ext === ".json" || ext === ".xml") {
      res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
    } else {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    }
  }
};

app.use("/admin", express.static(path.join(__dirname, "admin"), staticOptions));

// Serve uploaded project images
app.use("/img/projects", express.static(path.join(__dirname, "img", "projects"), staticOptions));

// Serve main portfolio static files
app.use(express.static(__dirname, staticOptions));

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

app.post("/api/analytics/track", async (req, res) => {
  try {
    const { page_path, referer } = req.body;
    
    // Get visitor IP
    let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
    if (ip.includes(",")) {
      ip = ip.split(",")[0].trim();
    }
    
    const userAgent = req.headers["user-agent"] || "Unknown";
    
    // Check Vercel geolocational headers
    let country = req.headers["x-vercel-ip-country"] || "Unknown";
    let city = req.headers["x-vercel-ip-city"] || "Unknown";
    let lat = req.headers["x-vercel-ip-latitude"] ? parseFloat(req.headers["x-vercel-ip-latitude"]) : null;
    let lon = req.headers["x-vercel-ip-longitude"] ? parseFloat(req.headers["x-vercel-ip-longitude"]) : null;
    
    // If local environment (localhost, private network, loopback, or missing coordinates)
    const isLocalIP = ip === "::1" || ip === "127.0.0.1" || ip.startsWith("10.") || ip.startsWith("192.168.") || ip.startsWith("172.");
    
    if (isLocalIP) {
      // Mock coordinates for Muzaffarpur, Bihar, India (or New Delhi) for visual confirmation
      country = "India";
      city = "Muzaffarpur (Local Dev)";
      lat = 26.2201;
      lon = 85.3837;
    } else if (!lat || !lon) {
      // If deployed but Vercel headers are missing, fallback to standard geolocation lookup using node-fetch equivalent
      try {
        const geoResponse = await fetch(`http://ip-api.com/json/${ip}`).then(r => r.json());
        if (geoResponse && geoResponse.status === "success") {
          country = geoResponse.country || country;
          city = geoResponse.city || city;
          lat = geoResponse.lat || lat;
          lon = geoResponse.lon || lon;
        }
      } catch (geoErr) {
        console.error("External geolocation failed:", geoErr);
      }
    }
    
    await db.execute({
      sql: "INSERT INTO visitor_logs (ip_address, user_agent, country, city, lat, lon, page_path, referer) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      args: [ip, userAgent, country, city, lat || 0.0, lon || 0.0, page_path || "/", referer || "Direct"]
    });
    
    res.status(200).json({ status: "success" });
  } catch (error) {
    console.error("Analytics tracking error:", error);
    res.status(500).json({ error: "Failed to track visit" });
  }
});

// ═══════════════════════════════════════════════════════════════════════
//  ADMIN AUTH
// ═══════════════════════════════════════════════════════════════════════

app.post("/api/admin/login", adminLimiter, async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  try {
    const result = await db.execute({
      sql: "SELECT * FROM admin_users WHERE username = ?",
      args: [username]
    });

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];
    const bcrypt = require("bcryptjs");
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ username, role: "admin" }, JWT_SECRET, { expiresIn: "24h" });
    res.json({ token, username });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Authentication system failure." });
  }
});

app.post("/api/admin/change-password", requireAdmin, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Current and new passwords are required." });
  }

  try {
    const auth = req.headers.authorization;
    const decoded = jwt.verify(auth.slice(7), JWT_SECRET);
    const username = decoded.username;

    const result = await db.execute({
      sql: "SELECT * FROM admin_users WHERE username = ?",
      args: [username]
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.rows[0];
    const bcrypt = require("bcryptjs");
    const match = await bcrypt.compare(currentPassword, user.password_hash);

    if (!match) {
      return res.status(400).json({ error: "Incorrect current password" });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await db.execute({
      sql: "UPDATE admin_users SET password_hash = ? WHERE username = ?",
      args: [newHash, username]
    });

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
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
      args: [title, description || "", image_url || "", demo_url || "", github_url || "", tags, badge || "Live", sort_order || 0, visible !== false ? 1 : 0],
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
      args: [title, description || "", image_url || "", demo_url || "", github_url || "", tags, badge || "Live", sort_order || 0, visible !== false ? 1 : 0, req.params.id],
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
      args: [name, icon_class || "", icon_url || "", category || "frontend", sort_order || 0],
    });
    res.json({ id: Number(result.lastInsertRowid), message: "Created" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put("/api/admin/skills/:id", requireAdmin, async (req, res) => {
  try {
    const { name, icon_class, icon_url, category, sort_order, visible } = req.body;
    await db.execute({
      sql: "UPDATE skills SET name=?,icon_class=?,icon_url=?,category=?,sort_order=?,visible=? WHERE id=?",
      args: [name, icon_class || "", icon_url || "", category || "frontend", sort_order || 0, visible !== false ? 1 : 0, req.params.id],
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
//  ADMIN — ANALYTICS & ACTIVITY
// ═══════════════════════════════════════════════════════════════════════

app.get("/api/admin/analytics", requireAdmin, async (req, res) => {
  try {
    // Get total views count
    const totalViewsRes = await db.execute("SELECT COUNT(*) as count FROM visitor_logs");
    const totalViews = totalViewsRes.rows[0].count;
    
    // Get unique visitors count (by IP address)
    const uniqueVisitorsRes = await db.execute("SELECT COUNT(DISTINCT ip_address) as count FROM visitor_logs");
    const uniqueVisitors = uniqueVisitorsRes.rows[0].count;
    
    // Get last 100 visitor logs to plot on Leaflet
    const recentLogsRes = await db.execute("SELECT * FROM visitor_logs ORDER BY created_at DESC LIMIT 100");
    
    res.json({
      totalViews,
      uniqueVisitors,
      recentLogs: recentLogsRes.rows
    });
  } catch (error) {
    console.error("Admin analytics fetch error:", error);
    res.status(500).json({ error: "Failed to load analytics details" });
  }
});

app.get("/api/admin/recent-activity", requireAdmin, async (req, res) => {
  try {
    // 1. Get latest projects (latest 10)
    const projectsRes = await db.execute("SELECT id, title, created_at FROM projects ORDER BY created_at DESC LIMIT 10");
    const projects = projectsRes.rows.map(p => ({
      type: "project",
      title: `Project Payload Deployed`,
      description: `New project "${p.title}" successfully compiled and committed to database core.`,
      time: p.created_at
    }));

    // 2. Get latest messages (latest 10)
    const messagesRes = await db.execute("SELECT id, name, created_at FROM messages ORDER BY created_at DESC LIMIT 10");
    const messages = messagesRes.rows.map(m => ({
      type: "message",
      title: `Transmission Intercepted`,
      description: `New incoming signal intercepted from operator "${m.name}". Secure logs committed to index.`,
      time: m.created_at
    }));

    // 3. Get latest visitors (latest 10)
    const visitorsRes = await db.execute("SELECT id, city, country, page_path, created_at FROM visitor_logs ORDER BY created_at DESC LIMIT 10");
    const visitors = visitorsRes.rows.map(v => ({
      type: "visitor",
      title: `Remote Session Logged`,
      description: `Connection tracked at page "${v.page_path}" originating from location: ${v.city}, ${v.country}.`,
      time: v.created_at
    }));

    // Chronologically merge them
    const merged = [...projects, ...messages, ...visitors];
    // Sort descending by time
    merged.sort((a, b) => {
      const aTime = a.time ? new Date(a.time).getTime() : 0;
      const bTime = b.time ? new Date(b.time).getTime() : 0;
      return bTime - aTime;
    });

    res.json(merged.slice(0, 15)); // return latest 15 activities
  } catch (error) {
    console.error("Admin activity fetch error:", error);
    res.status(500).json({ error: "Failed to compile recent activity list" });
  }
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
      args: [title, issuer || "", issue_date || "", credential_url || "", image_url || "", type || "certificate", sort_order || 0],
    });
    res.json({ id: Number(result.lastInsertRowid), message: "Created" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put("/api/admin/certificates/:id", requireAdmin, async (req, res) => {
  try {
    const { title, issuer, issue_date, credential_url, image_url, type, sort_order, visible } = req.body;
    await db.execute({
      sql: "UPDATE certificates SET title=?,issuer=?,issue_date=?,credential_url=?,image_url=?,type=?,sort_order=?,visible=? WHERE id=?",
      args: [title, issuer || "", issue_date || "", credential_url || "", image_url || "", type || "certificate", sort_order || 0, visible !== false ? 1 : 0, req.params.id],
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

// Export the Express app for Vercel
module.exports = app;

// Only listen if not running on Vercel
if (process.env.VERCEL !== "1") {
  initDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Portfolio: http://localhost:${PORT}`);
      console.log(`🔐 Admin:     http://localhost:${PORT}/admin`);
    });
  }).catch(err => { console.error("DB init failed:", err); process.exit(1); });
} else {
  // Initialize DB asynchronously for Vercel (creates tables/data if they don't exist)
  initDB().catch(err => console.error("DB init failed:", err));
}
