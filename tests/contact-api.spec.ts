import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('nodemailer', () => {
  const sendMail = vi.fn(async () => ({ messageId: 'test' }));
  const createTransport = vi.fn(() => ({ sendMail }));
  return {
    default: { createTransport },
    createTransport,
  };
});

import nodemailer from 'nodemailer';
import { POST } from '../app/api/contact/route';

const mkReq = (body: any, headers: Record<string, string> = {}) =>
  new Request('http://localhost/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

const valid = { name: 'Jane', company: 'Acme', email: 'jane@example.com', message: 'Hello' };

const ENV_KEYS = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_SECURE', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM', 'SMTP_TO', 'CONTACT_FROM', 'CONTACT_TO'];

// The mocked transport, and the arguments of its sendMail call.
const transport = () => (nodemailer as any).createTransport.mock.results[0]?.value;
const sent = () => transport().sendMail.mock.calls[0][0];

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  for (const k of ENV_KEYS) delete process.env[k];
  // Mirrors the Vercel production variables: iCloud login, sent to and from it.
  process.env.SMTP_HOST = 'smtp.example.com';
  process.env.SMTP_PORT = '587';
  process.env.SMTP_USER = 'sender@example.com';
  process.env.SMTP_PASS = 'test-password';
  process.env.SMTP_FROM = 'Fuchs Sales and Consulting <sender@example.com>';
  process.env.SMTP_TO = 'fuchsgreg@icloud.com';
});

describe('contact POST', () => {
  it('sends to SMTP_TO and respects replyTo', async () => {
    const res = await POST(mkReq(valid));
    const json: any = await (res as any).json();
    expect(json.ok).toBe(true);

    const createTransportMock: any = (nodemailer as any).createTransport;
    expect(createTransportMock).toHaveBeenCalledTimes(1);
    expect(transport().sendMail).toHaveBeenCalledTimes(1);

    const args = sent();
    expect(args.to).toBe('fuchsgreg@icloud.com');
    expect(args.replyTo).toBe('jane@example.com');
  });

  it('sends from SMTP_FROM, authenticated as SMTP_USER', async () => {
    await POST(mkReq(valid));
    expect(sent().from).toBe('Fuchs Sales and Consulting <sender@example.com>');
    const opts = (nodemailer as any).createTransport.mock.calls[0][0];
    expect(opts).toMatchObject({
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      auth: { user: 'sender@example.com', pass: 'test-password' },
    });
  });

  it("defaults to Greg's iCloud inbox when SMTP_TO is not set", async () => {
    delete process.env.SMTP_TO;
    await POST(mkReq(valid));
    expect(sent().to).toBe('fuchsgreg@icloud.com');
  });

  it('prefers SMTP_TO / SMTP_FROM over the older CONTACT_* names', async () => {
    process.env.CONTACT_TO = 'gfuchs@fuchs-sales.ca';
    process.env.CONTACT_FROM = 'Other <other@example.com>';
    await POST(mkReq(valid));
    expect(sent().to).toBe('fuchsgreg@icloud.com');
    expect(sent().from).toBe('Fuchs Sales and Consulting <sender@example.com>');
  });

  it('falls back to CONTACT_TO, then the SMTP user as sender, when SMTP_* are unset', async () => {
    delete process.env.SMTP_TO;
    delete process.env.SMTP_FROM;
    process.env.CONTACT_TO = 'someone@example.com';
    await POST(mkReq(valid));
    expect(sent().to).toBe('someone@example.com');
    expect(sent().from).toBe('sender@example.com');
  });

  it('includes name, company, email and message in the email', async () => {
    await POST(mkReq(valid));
    const { subject, text, html } = sent();
    expect(subject).toBe('Website enquiry from Jane (Acme)');
    expect(text).toBe('Name: Jane\nCompany: Acme\nEmail: jane@example.com\n\nHello');
    expect(html).toContain('Acme');
  });

  it('leaves company out when it is not given', async () => {
    await POST(mkReq({ ...valid, company: '' }));
    expect(sent().subject).toBe('Website enquiry from Jane');
    expect(sent().text).not.toContain('Company:');
  });

  it('escapes HTML and keeps line breaks out of the subject', async () => {
    await POST(mkReq({ ...valid, name: 'Eve\r\nBcc: x@evil.com', message: '<script>alert(1)</script>' }));
    expect(sent().subject).not.toMatch(/[\r\n]/);
    expect(sent().html).not.toContain('<script>');
    expect(sent().html).toContain('&lt;script&gt;');
  });

  it('rejects missing fields, a bad email, oversized input and bad JSON with 400', async () => {
    for (const body of [
      { ...valid, name: '' },
      { ...valid, email: '' },
      { ...valid, message: '   ' },
      { ...valid, email: 'not-an-email' },
      { ...valid, message: 'x'.repeat(5001) },
      'not json',
    ]) {
      const res = await POST(mkReq(body));
      expect(res.status, JSON.stringify(body).slice(0, 40)).toBe(400);
    }
    expect((nodemailer as any).createTransport).not.toHaveBeenCalled();
  });

  it('quietly drops bot submissions that fill the hidden website field', async () => {
    const res = await POST(mkReq({ ...valid, website: 'http://spam.example' }));
    expect(((await res.json()) as any).ok).toBe(true);
    expect((nodemailer as any).createTransport).not.toHaveBeenCalled();
  });

  it('returns 500 without sending when SMTP is not configured', async () => {
    delete process.env.SMTP_PASS;
    const res = await POST(mkReq(valid));
    expect(res.status).toBe(500);
    expect((nodemailer as any).createTransport).not.toHaveBeenCalled();
  });

  it('returns 500 with a plain message when the mail server fails', async () => {
    (nodemailer as any).createTransport.mockReturnValueOnce({
      sendMail: vi.fn(async () => {
        throw new Error('535 auth failed: secret detail');
      }),
    });
    const res = await POST(mkReq(valid));
    expect(res.status).toBe(500);
    const json: any = await res.json();
    expect(json.error).toBe('Mail send failed');
    expect(JSON.stringify(json)).not.toContain('secret detail');
  });

  it('logs the SMTP error code so a rejected password is obvious in Vercel logs', async () => {
    (nodemailer as any).createTransport.mockReturnValueOnce({
      sendMail: vi.fn(async () => {
        throw Object.assign(new Error('Invalid login'), { code: 'EAUTH', responseCode: 535 });
      }),
    });
    await POST(mkReq(valid));
    expect((console.error as any).mock.calls[0][0]).toBe('CONTACT SEND ERROR: EAUTH 535');
  });

  it('accepts same-site requests and refuses ones from another site', async () => {
    const same = await POST(mkReq(valid, { origin: 'https://www.fuchs-sales.ca', 'x-forwarded-host': 'www.fuchs-sales.ca' }));
    expect(same.status).toBe(200);
    const other = await POST(mkReq(valid, { origin: 'https://evil.example', 'x-forwarded-host': 'www.fuchs-sales.ca' }));
    expect(other.status).toBe(403);
    expect(transport().sendMail).toHaveBeenCalledTimes(1);
  });

  it('refuses bodies over 20 KB with 413 before parsing them', async () => {
    const res = await POST(mkReq({ ...valid, message: 'x'.repeat(25_000) }));
    expect(res.status).toBe(413);
    expect((nodemailer as any).createTransport).not.toHaveBeenCalled();
  });

  it('limits each IP address to 5 messages per 10 minutes', async () => {
    const ip = { 'x-forwarded-for': '203.0.113.9, 10.0.0.1' };
    for (let i = 0; i < 5; i++) {
      expect((await POST(mkReq(valid, ip))).status).toBe(200);
    }
    const blocked = await POST(mkReq(valid, ip));
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get('retry-after')).toBe('600');
    // A different address is unaffected.
    expect((await POST(mkReq(valid, { 'x-forwarded-for': '203.0.113.10' }))).status).toBe(200);
  });
});
