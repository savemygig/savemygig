/**
 * POST /api/auth/email   { email }
 *
 * Typed-email sign-in, step 1 of 2: we email a single-use link that signs
 * this address in wherever it is opened. No password exists to type, ever
 * (Antonio's ruling). The link is valid for 15 minutes and dies on first
 * use; only its SHA-256 hash touches the database.
 *
 * The link targets the ORIGIN THAT ASKED (preview deployments included), so
 * the whole flow is testable on a branch URL before anything merges. The
 * token is only honored by whichever D1 the deployment is bound to, so a
 * preview link cannot mint a production session on a different database.
 *
 * EMAIL COPY IS v1, flagged for Antonio's review (his ruling 7).
 */

import { json, sha256hex, b64urlEncode, EMAIL_RE } from '../_auth.js';

const SENDER = { name: 'Save My Gig', email: 'savemygig@gmail.com' };
const LINK_MINUTES = 15;

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ ok: false, error: 'not_configured' }, 500);
  if (!env.BREVO_API_KEY) return json({ ok: false, error: 'not_configured' }, 500);

  let email = '';
  try {
    const b = await request.json();
    email = String(b.email || '').trim().toLowerCase();
  } catch (e) {
    return json({ ok: false, error: 'bad_request' }, 400);
  }
  if (!email || !EMAIL_RE.test(email)) return json({ ok: false, error: 'invalid_email' }, 400);

  const now = Date.now();
  // Opportunistic sweep, then a soft rate limit: three live links per
  // address is plenty, and it caps what a stranger can trigger at someone
  // else's inbox from this form.
  await env.DB.prepare('DELETE FROM login_tokens WHERE expires < ?1').bind(now).run();
  const live = await env.DB.prepare('SELECT COUNT(*) AS n FROM login_tokens WHERE email = ?1 AND used = 0')
    .bind(email).first();
  if (live && live.n >= 3) return json({ ok: false, error: 'too_many' }, 429);

  const raw = new Uint8Array(32);
  crypto.getRandomValues(raw);
  const token = b64urlEncode(raw);
  await env.DB.prepare('INSERT INTO login_tokens (token_hash, email, expires, used) VALUES (?1, ?2, ?3, 0)')
    .bind(await sha256hex(token), email, now + LINK_MINUTES * 60 * 1000).run();

  const origin = new URL(request.url).origin;
  const link = `${origin}/api/auth/link?t=${encodeURIComponent(token)}`;

  const subject = 'Your sign-in link, Save My Gig';
  const text =
    'Tap the link and this device is signed in. No password exists, so there is nothing to remember and nothing to leak.\n\n' +
    'Sign in:\n' + link + '\n\n' +
    `The link works once, for ${LINK_MINUTES} minutes, on the device where you open it.\n` +
    'Did not ask for this? Ignore this email and nothing happens.\n\n' +
    'Save My Gig';

  const html = `<!doctype html><html><body style="margin:0;padding:0;background:#0a0a0b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0b;"><tr><td align="center" style="padding:32px 16px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#151413;border:1px solid #2a2723;border-radius:2px;">
      <tr><td style="padding:34px 30px 8px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#ff4d2e;">Save My Gig</td></tr>
      <tr><td style="padding:0 30px;font-family:'Arial Black',Arial,sans-serif;font-size:30px;line-height:1.05;font-weight:900;text-transform:uppercase;color:#f3f1ec;">One tap, <span style="color:#ff4d2e;">signed in.</span></td></tr>
      <tr><td style="padding:18px 30px 4px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#9a978f;">Tap the button and this device is signed in. No password exists, so there is nothing to remember and nothing to leak.</td></tr>
      <tr><td style="padding:24px 30px 8px;"><a href="${link}" style="display:inline-block;background:#ff4d2e;color:#0a0a0b;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:800;letter-spacing:0.02em;text-transform:uppercase;text-decoration:none;padding:15px 26px;border-radius:2px;">Sign me in</a></td></tr>
      <tr><td style="padding:14px 30px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#9a978f;">The link works once, for ${LINK_MINUTES} minutes, on the device where you open it.</td></tr>
      <tr><td style="padding:14px 30px 30px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#6a665f;">Did not ask for this? Ignore this email and nothing happens. Button not working? Paste this into your browser:<br /><a href="${link}" style="color:#9a978f;word-break:break-all;">${link}</a></td></tr>
    </table>
  </td></tr></table></body></html>`;

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': env.BREVO_API_KEY, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ sender: SENDER, to: [{ email }], subject, htmlContent: html, textContent: text, tags: ['account-signin'] }),
  });

  if (res.ok) return json({ ok: true });
  let detail = '';
  try { detail = JSON.stringify(await res.json()); } catch (e) { /* ignore */ }
  console.log('auth/email: brevo smtp/email failed', res.status, detail);
  return json({ ok: false, error: 'provider_error' }, 502);
}

export async function onRequest({ request }) {
  if (request.method === 'POST') return;
  return json({ ok: false, error: 'method_not_allowed' }, 405);
}
