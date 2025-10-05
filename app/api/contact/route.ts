import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const name = String(data.name || "").trim();
    const company = String(data.company || "").trim();
    const email = String(data.email || "").trim();
    const message = String(data.message || "").trim();
    const honeypot = String(data.website || ""); 

    if (honeypot) {
      return NextResponse.json({ ok: true }); 
    }

    if (!name || !email || !message) {
      return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });
    }

    // SMTP config via env vars
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true", 
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const to = process.env.CONTACT_TO || "fuchsgreg@icloud.com";
    const from = process.env.CONTACT_FROM || process.env.SMTP_USER; 

    await transporter.sendMail({
      from,
      to,
      subject: `New website inquiry from ${name}`,
      replyTo: email,
      text: `Name: ${name}
Company: ${company}
Email: ${email}

${message}`,
      html: `
        <div style="font-family:Arial,sans-serif">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Company:</strong> ${company || "—"}</p>
          <p><strong>Email:</strong> ${email}</p>
          <hr/>
          <p>${message.replace(/\n/g, "<br/>")}</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "Email failed" }, { status: 500 });
  }
}