const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;
const ADMIN_KEY = process.env.ADMIN_KEY || "change-this-admin-key";

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public"))); // serve frontend

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", // replace with your MySQL password
  database: "portfolio_db"
});

db.connect(err => {
  if (err) return console.error("DB connection error:", err);
  console.log("Connected to MySQL database.");
});

// Simple admin auth middleware using header x-admin-key
function requireAdmin(req, res, next) {
  const key = req.headers["x-admin-key"];
  if (!key || key !== ADMIN_KEY) return res.status(401).json({ message: "Unauthorized" });
  next();
}

// Profile APIs
// Get profile (first name, last name, title, avatar)
app.get("/api/profile", (req, res) => {
  db.query("SELECT first_name, last_name, title, avatar_url FROM profile LIMIT 1", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ error: "Profile not found" });
    res.json(results[0]);
  });
});

// Upsert profile (admin)
app.put("/api/profile", requireAdmin, (req, res) => {
  const { first_name, last_name, title, avatar_url } = req.body;
  if (!first_name || !last_name) return res.status(400).json({ message: "first_name and last_name required" });
  const payload = [first_name, last_name, title || null, avatar_url || null];
  db.query(
    "INSERT INTO profile (id, first_name, last_name, title, avatar_url) VALUES (1, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE first_name = VALUES(first_name), last_name = VALUES(last_name), title = VALUES(title), avatar_url = VALUES(avatar_url)",
    payload,
    (err) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json({ message: "Profile saved" });
    }
  );
});

// Get portfolio section
app.get("/api/content/:section", (req, res) => {
  const section = req.params.section;
  db.query(
    "SELECT content FROM portfolio_content WHERE section = ?",
    [section],
    (err, results) => {
      if (err) return res.status(500).json({ error: err });
      if (results.length === 0) return res.status(404).json({ error: "Section not found" });
      res.json(results[0].content);
    }
  );
});

// Create or update a section (admin)
app.put("/api/content/:section", requireAdmin, (req, res) => {
  const section = req.params.section;
  const content = req.body.content;
  if (typeof content === "undefined") return res.status(400).json({ message: "content required" });
  db.query(
    "INSERT INTO portfolio_content (section, content) VALUES (?, ?) ON DUPLICATE KEY UPDATE content = VALUES(content)",
    [section, JSON.stringify(content)],
    (err) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json({ message: "Section saved" });
    }
  );
});

// Delete a section (admin)
app.delete("/api/content/:section", requireAdmin, (req, res) => {
  const section = req.params.section;
  db.query("DELETE FROM portfolio_content WHERE section = ?", [section], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Section not found" });
    res.json({ message: "Section deleted" });
  });
});

// Submit contact form
app.post("/submit", (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ message: "All fields required" });

  db.query(
    "INSERT INTO contact_submissions (name, email, message) VALUES (?, ?, ?)",
    [name, email, message],
    (err) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json({ message: "Thank you! Your message has been saved." });
    }
  );
});

// Admin view submissions with times
app.get("/api/submissions", requireAdmin, (req, res) => {
  db.query(
    "SELECT id, name, email, message, created_at FROM contact_submissions ORDER BY created_at DESC",
    (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json(results);
    }
  );
});

// Admin delete a submission
app.delete("/api/submissions/:id", requireAdmin, (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM contact_submissions WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Submission not found" });
    res.json({ message: "Submission deleted" });
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
