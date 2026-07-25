# Orina — Portfolio Website

A full-stack portfolio site: an Express backend serving a REST API (projects, skills,
contact form) plus a static, dependency-free frontend (plain HTML/CSS/JS — no build step).

Built for **orina.com**, but works under any domain.

## Stack

- **Backend:** Node.js + Express, `helmet` + `express-rate-limit` for basic hardening,
  file-backed JSON storage (swap for a real DB if you outgrow it), optional email via
  `nodemailer`.
- **Frontend:** Static HTML/CSS/JS served from `/public`, fetches data from the API at
  runtime. No React/build tooling required — open `index.html`'s source and edit directly.

## Project structure

```
orina-portfolio/
├── server.js              # Express app entry point
├── routes/api.js           # /api/projects, /api/skills, /api/contact
├── utils/store.js          # tiny JSON read/write helper
├── utils/mailer.js         # optional SMTP email for contact form
├── data/
│   ├── projects.json       # edit this to change your project cards
│   ├── skills.json         # edit this to change your toolkit section
│   └── messages.json       # contact form submissions land here
├── public/
│   ├── index.html
│   ├── css/styles.css
│   ├── js/main.js
│   └── assets/              # project thumbnails (SVG placeholders — swap for your own)
├── .env.example
└── package.json
```

## Run locally

```bash
npm install
cp .env.example .env
npm run dev        # nodemon, auto-restarts on change
# or
npm start           # plain node
```

Visit `http://localhost:3000`.

## Customize your content

- **Projects:** edit `data/projects.json`. Each entry needs `title`, `year`, `tag`,
  `summary`, `stack`, `link`, `repo`, `image`. Drop your own thumbnails into
  `public/assets/` and point `image` at them.
- **Skills:** edit `data/skills.json`.
- **Copy/name:** edit `public/index.html` directly — hero headline, about text, résumé
  link, social links in the footer.
- **Résumé download:** add your PDF at `public/assets/orina-resume.pdf` (the link in the
  About section already points there).
- **Colors/fonts:** all design tokens are CSS variables at the top of
  `public/css/styles.css` under `:root`.

## Contact form email delivery

By default, messages are only saved to `data/messages.json`. To also send yourself an
email, fill in the SMTP settings in `.env`:

```
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_USER=you@yourdomain.com
SMTP_PASS=your-password-or-app-key
CONTACT_TO_EMAIL=hello@orina.com
```

Any standard SMTP provider works (Gmail app password, SendGrid, Postmark, Mailgun, etc).
Leave these blank and the form still works — messages just won't be emailed.

## Deploying

This is a standard Node/Express app, so it deploys anywhere that runs Node 18+.

### Option A — Render / Railway / Fly.io (recommended, simplest)
1. Push this repo to GitHub.
2. Create a new **Web Service** from the repo.
3. Build command: `npm install` · Start command: `npm start`.
4. Set environment variables from `.env.example` in the host's dashboard.
5. Point `orina.com`'s DNS (A/CNAME record, per the host's instructions) at the service.

### Option B — A VPS (DigitalOcean, Linode, EC2, etc.)
```bash
git clone <your-repo-url>
cd orina-portfolio
npm install --production
cp .env.example .env   # fill in real values
npm install -g pm2
pm2 start server.js --name orina
pm2 save
```
Put Nginx or Caddy in front for TLS termination and to proxy port 80/443 → 3000.
Example Caddyfile:
```
orina.com {
  reverse_proxy localhost:3000
}
```

### Option C — Vercel
Vercel's Node runtime expects a serverless function rather than a long-running `app.listen`.
`server.js` already exports the Express `app`, so add a `vercel.json`:
```json
{
  "version": 2,
  "builds": [{ "src": "server.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "server.js" }]
}
```
Note: on Vercel the filesystem is read-only at runtime, so `data/messages.json` writes
won't persist between requests — configure SMTP so messages are emailed instead, or swap
the contact route to a hosted DB (e.g. Postgres via Neon, or a form service).

## Health check

`GET /health` returns `{ "status": "ok", "uptime": <seconds> }` — useful for your host's
uptime monitor.

## Security notes already included

- `helmet` sets sane security headers and a content security policy.
- The contact endpoint is rate-limited (8 requests / 15 min per IP) and has a hidden
  honeypot field against basic bots.
- Input is validated server-side (name/email/message length and format) regardless of
  what the frontend already checks.

## License

MIT — do whatever you'd like with this.
