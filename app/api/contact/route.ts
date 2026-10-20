import nodemailer from "nodemailer";

export const runtime = "nodejs";

// Where website enquiries go when CONTACT_TO is not configured.
const DEFAULT_TO = "gfuchs@fuchs-sales.ca";

const LIMITS = { name: 200, company: 200, email: 320, message: 5000 };
const MAX_BODY_BYTES = 20_000;

// Best-effort rate limit: per server instance, so it slows a flood rather than
// guaranteeing a cap. A Vercel Firewall rule on /api/contact is the hard limit.
const RATE = { max: 5, windowMs: 10 * 60 * 1000 };
const hits = new Map<string, number[]>();

function rateLimited(ip: string, now = Date.now()) {
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE.windowMs);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= RATE.windowMs)) hits.delete(key);
    }
  }
  return recent.length > RATE.max;
}

// Browsers always send Origin on a fetch POST; one from another site is refused.
function crossSite(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    return new URL(origin).host !== host;
  } catch {
    return true;
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
// Name and company go into the Subject header: no line breaks allowed there.
const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ");

export async function POST(req: Request) {
  if (crossSite(req)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim();
  if (ip && rateLimited(ip)) {
    return Response.json(
      { error: "Too many messages. Please try again later." },
      { status: 429, headers: { "Retry-After": String(RATE.windowMs / 1000) } }
    );
  }

  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) {
    return Response.json({ error: "Too large" }, { status: 413 });
  }

  let body: Record<string, unknown>;
  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) {
      return Response.json({ error: "Too large" }, { status: 413 });
    }
    body = JSON.parse(raw);
    if (!body || typeof body !== "object") throw new Error("not an object");
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  // Honeypot: the form's hidden "website" field is only ever filled by bots.
  // Answer as if it worked so they learn nothing, but send nothing.
  if (str(body.website)) return Response.json({ ok: true });

  const name = oneLine(str(body.name));
  const company = oneLine(str(body.company));
  const email = str(body.email);
  const message = str(body.message);

  if (!name || !email || !message) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return Response.json({ error: "Invalid email" }, { status: 400 });
  }
  if (
    name.length > LIMITS.name ||
    company.length > LIMITS.company ||
    email.length > LIMITS.email ||
    message.length > LIMITS.message
  ) {
    return Response.json({ error: "Too long" }, { status: 400 });
  }

  // ---- SERVER ENV VARS ----
  // CONTACT_TO / CONTACT_FROM are the names used in .env.local; SMTP_TO /
  // SMTP_FROM are still accepted for older deployments.
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.CONTACT_FROM || process.env.SMTP_FROM || user;
  const to = process.env.CONTACT_TO || process.env.SMTP_TO || DEFAULT_TO;

  const missing = Object.entries({ SMTP_HOST: host, SMTP_USER: user, SMTP_PASS: pass })
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missing.length) {
    console.error("CONTACT: email is not configured, missing", missing.join(", "));
    return Response.json(
      { error: "Email is not configured on the server." },
      { status: 500 }
    );
  }

  const who = company ? `${name} (${company})` : name;
  const subject = `Website enquiry from ${who}`;
  const header = [
    `Name: ${name}`,
    ...(company ? [`Company: ${company}`] : []),
    `Email: ${email}`,
  ].join("\n");
  const text = `${header}\n\n${message}`;
  const html = `
    <div style="font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.5">
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      ${company ? `<p><strong>Company:</strong> ${escapeHtml(company)}</p>` : ""}
      <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
      <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
    </div>
  `;

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
    await transporter.sendMail({ from, to, replyTo: email, subject, text, html });
    return Response.json({ ok: true });
  } catch (err: unknown) {
    // Details stay in the server log; the visitor gets a plain message.
    console.error("CONTACT SEND ERROR:", err);
    return Response.json({ error: "Mail send failed" }, { status: 500 });
  }
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
