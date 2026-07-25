require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const apiRoutes = require("./routes/api");

const app = express();
const PORT = process.env.PORT || 3000;

// ---- Middleware ---------------------------------------------------------
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
      },
    },
  })
);
app.use(cors());
app.use(express.json({ limit: "100kb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ---- API ------------------------------------------------------------
app.use("/api", apiRoutes);

// ---- Health check (useful for hosting platforms) ---------------------
app.get("/health", (req, res) => res.json({ status: "ok", uptime: process.uptime() }));

// ---- Static frontend ---------------------------------------------------
app.use(express.static(path.join(__dirname, "public"), { extensions: ["html"] }));

// Fallback to index.html for any non-API route (simple SPA-friendly routing)
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ---- Error handling ---------------------------------------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong on our end." });
});

app.listen(PORT, () => {
  console.log(`Orina portfolio server running on port ${PORT}`);
});

module.exports = app;
