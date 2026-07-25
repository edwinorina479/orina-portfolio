const nodemailer = require("nodemailer");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null; // Not configured — caller falls back to storing only.
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  return transporter;
}

async function sendContactEmail({ name, email, message }) {
  const t = getTransporter();
  if (!t) return { sent: false, reason: "SMTP not configured" };

  const to = process.env.CONTACT_TO_EMAIL || SMTP_USER;
  const from = process.env.SMTP_FROM || `"Orina Portfolio" <${process.env.SMTP_USER}>`;

  await t.sendMail({
    from,
    to,
    replyTo: email,
    subject: `New message from ${name} via orina.com`,
    text: message,
    html: `<p><strong>From:</strong> ${name} (${email})</p><p>${message.replace(/\n/g, "<br>")}</p>`,
  });

  return { sent: true };
}

module.exports = { sendContactEmail };
