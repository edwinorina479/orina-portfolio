const express = require("express");
const rateLimit = require("express-rate-limit");
const { readJson, writeJson } = require("../utils/store");
const { sendContactEmail } = require("../utils/mailer");

const router = express.Router();

// ---- GET /api/projects ----------------------------------------------
router.get("/projects", (req, res) => {
  const projects = readJson("data/projects.json", []);
  res.json({ projects });
});

// ---- GET /api/projects/:id -------------------------------------------
router.get("/projects/:id", (req, res) => {
  const projects = readJson("data/projects.json", []);
  const project = projects.find((p) => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: "Project not found" });
  res.json({ project });
});

// ---- GET /api/skills ---------------------------------------------------
router.get("/skills", (req, res) => {
  const skills = readJson("data/skills.json", { groups: [] });
  res.json(skills);
});

// ---- POST /api/contact -------------------------------------------------
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many messages sent. Please try again later." },
});

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

router.post("/contact", contactLimiter, async (req, res) => {
  const { name, email, message, company } = req.body || {};

  // Honeypot field — real users never fill this in.
  if (company) {
    return res.status(200).json({ ok: true });
  }

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return res.status(400).json({ error: "Please enter your name." });
  }
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ error: "Please enter a valid email." });
  }
  if (!message || typeof message !== "string" || message.trim().length < 10) {
    return res.status(400).json({ error: "Message should be at least 10 characters." });
  }
  if (message.length > 5000) {
    return res.status(400).json({ error: "Message is too long." });
  }

  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    name: name.trim(),
    email: email.trim(),
    message: message.trim(),
    receivedAt: new Date().toISOString(),
    ip: req.ip,
  };

  try {
    const messages = readJson("data/messages.json", []);
    messages.push(entry);
    writeJson("data/messages.json", messages);
  } catch (err) {
    console.error("Failed to persist contact message:", err.message);
  }

  let mailResult = { sent: false };
  try {
    mailResult = await sendContactEmail(entry);
  } catch (err) {
    console.error("Failed to send contact email:", err.message);
  }

  res.status(201).json({
    ok: true,
    message: "Thanks — your message has been received.",
    emailed: mailResult.sent,
  });
});

module.exports = router;
