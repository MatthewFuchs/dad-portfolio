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

const mkReq = (body: any) =>
  new Request('http://localhost/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

beforeEach(() => {
  vi.clearAllMocks();
  process.env.CONTACT_TO = 'gfuchs@fuchs-sales.ca';
  process.env.SMTP_USER = 'sender@example.com';
});

describe('contact POST', () => {
  it('sends to work email and respects replyTo', async () => {
    const res = await POST(mkReq({ name: 'Jane', company: 'Acme', email: 'jane@example.com', message: 'Hello' }));
    const json: any = await (res as any).json();
    expect(json.ok).toBe(true);

    const createTransportMock: any = (nodemailer as any).createTransport;
    expect(createTransportMock).toHaveBeenCalledTimes(1);

    const transport = createTransportMock.mock.results[0].value;
    expect(transport.sendMail).toHaveBeenCalledTimes(1);

    const args = transport.sendMail.mock.calls[0][0];
    expect(args.to).toContain('gfuchs@fuchs-sales.ca');
    expect(args.replyTo).toBe('jane@example.com');
  });
});