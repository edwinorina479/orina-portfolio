const fs = require("fs");
const path = require("path");

/**
 * Minimal file-backed JSON store. Good enough for a portfolio site's
 * read-mostly data (projects, skills) and light write traffic (messages).
 * Swap this out for a real database if traffic/data needs grow.
 */
function readJson(filePath, fallback) {
  try {
    const full = path.join(__dirname, "..", filePath);
    const raw = fs.readFileSync(full, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    return fallback;
  }
}

function writeJson(filePath, data) {
  const full = path.join(__dirname, "..", filePath);
  fs.writeFileSync(full, JSON.stringify(data, null, 2), "utf-8");
}

module.exports = { readJson, writeJson };
