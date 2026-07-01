import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

function b64(s: string) { return btoa(s); }

async function smtpSend(host: string, port: number, user: string, pass: string, from: string, to: string, subject: string, text: string) {
  const conn = await Deno.connectTls({ hostname: host, port });
  const writer = conn.writable.getWriter();
  const reader = conn.readable.getReader();
  const enc = new TextEncoder();
  let buf = '';

  async function rd(timeout = 10000): Promise<string> {
    const start = Date.now();
    while (true) {
      if (buf.includes('\r\n')) {
        const idx = buf.indexOf('\r\n');
        const line = buf.slice(0, idx);
        buf = buf.slice(idx + 2);
        return line;
      }
      const remaining = timeout - (Date.now() - start);
      if (remaining <= 0) throw new Error('SMTP read timeout');
      const result = await Promise.race([
        reader.read(),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('SMTP read timeout')), remaining)),
      ]);
      const { value, done } = result;
      if (done) break;
      buf += new TextDecoder().decode(value);
    }
    const r = buf; buf = '';
    return r;
  }

  async function wr(s: string) {
    await writer.write(enc.encode(s + '\r\n'));
  }

  try {
    await rd(); // greeting

    await wr('EHLO localhost');
    while (true) {
      const l = await rd();
      if (!l.startsWith('250-')) break;
    }

    await wr('AUTH LOGIN'); await rd(); // 334 for user
    await wr(b64(user)); await rd(); // 334 for pass
    const authResp = await wr(b64(pass)) || await rd();
    if (!authResp.startsWith('235')) {
      throw new Error('SMTP auth failed: ' + authResp);
    }

    await wr(`MAIL FROM:<${from}>`); await rd();
    await wr(`RCPT TO:<${to}>`); await rd();
    await wr('DATA'); await rd();

    const msg = [
      `From: ${from}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/plain; charset=UTF-8',
      '',
      text,
      '.',
    ].join('\r\n');
    await wr(msg);
    await rd();

    await wr('QUIT');
  } finally {
    try { reader.releaseLock(); } catch {}
    try { writer.releaseLock(); } catch {}
    try { conn.close(); } catch {}
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-retry-count',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('Received body', JSON.stringify(body));
    const { name, email, phone, type, message } = body;

    const host = Deno.env.get('SMTP_HOST')!;
    const port = parseInt(Deno.env.get('SMTP_PORT') || '465');
    const user = Deno.env.get('SMTP_USER')!;
    const pass = Deno.env.get('SMTP_PASS')!;
    const from = Deno.env.get('SMTP_FROM')!;
    const notifyEmail = Deno.env.get('NOTIFY_EMAIL')!;

    await smtpSend(host, port, user, pass, from, notifyEmail,
      `New ${type === 'Domain' ? 'Domain Registration' : 'Booking'} from ${name}`,
      type === 'Domain'
        ? `New domain registration request:\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || '—'}\nDomain: ${message}\n\n---\nSent from Innoveta booking system.`
        : `New project booking received:\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || '—'}\nCategory: ${type || '—'}\nTemplate: ${message}\n\n---\nSent from Innoveta booking system.`,
    );

    await smtpSend(host, port, user, pass, from, email,
      type === 'Domain'
        ? `We received your domain request, ${name}!`
        : `We received your booking, ${name}!`,
      type === 'Domain'
        ? `Hi ${name},\n\nThank you for your domain registration request with Innoveta!\n\nWe've received your request and will process it within 24 hours.\n\nHere's a summary:\n- Domain: ${message}\n\nTo complete your order, please make payment to:\n\nBank Transfer:\n  Bank: Bank of Kigali\n  Account Name: Innoveta Design Studio\n  Account: 0001-2345678-01\n\nMobile Money:\n  MTN Rwanda: +250 788 000 000\n  Name: Innoveta Design Studio\n\nAfter payment, submit your proof here:\nhttps://innoveta.com/payment/[your-booking-id]\n\nIf you have any urgent questions, feel free to reply to this email.\n\nBest regards,\nInnoveta Design Team`
        : `Hi ${name},\n\nThank you for booking with Innoveta!\n\nWe've received your project request and will get back to you within 24 hours.\n\nHere's a summary:\n${type ? `- Category: ${type}` : ''}\n${message ? `- Template: ${message}` : ''}\n\nIf you have any urgent questions, feel free to reply to this email.\n\nBest regards,\nInnoveta Design Team`,
    );

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
});
