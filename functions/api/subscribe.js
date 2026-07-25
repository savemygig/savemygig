/**
 * POST /api/subscribe   (self-hosted double opt-in, step 1 of 2)
 *
 *   1. visitor submits their email here
 *   2. we sign a short-lived token and email them a confirm link
 *   3. NOTHING is stored until they click it (see confirm.js)
 *
 * We send the confirmation through Brevo's transactional endpoint
 * (POST /v3/smtp/email), which works. We deliberately do NOT use Brevo's own
 * double opt-in endpoint, which returns "An active DOI template does not
 * exist" no matter how the template is configured.
 *
 * The Brevo API key is NEVER in client code. It lives only as an encrypted
 * Cloudflare Pages secret (BREVO_API_KEY), read here server side, and it also
 * signs the opt-in token (see _token.js).
 */

import { makeToken } from './_token.js';

const SITE = 'https://www.savemygig.com';
const SENDER = { name: 'Save My Gig', email: 'savemygig@gmail.com' };

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

function confirmEmail(confirmUrl) {
  const subject = 'Confirm your email to get the DJ Emergency Card';

  const text =
    'One tap and the printable DJ Emergency Card is yours.\n\n' +
    'Confirm your email:\n' + confirmUrl + '\n\n' +
    'If you did not ask for this, ignore this email and nothing happens.\n' +
    'This link works for 7 days.\n\n' +
    'Save My Gig';

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#0a0a0b;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0b;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#151413;border:1px solid #2a2723;border-radius:2px;">
            <tr>
              <td style="padding:34px 30px 8px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#ff4d2e;">Save My Gig</td>
            </tr>
            <tr>
              <td style="padding:0 30px;font-family:'Arial Black',Arial,sans-serif;font-size:30px;line-height:1.05;font-weight:900;text-transform:uppercase;color:#f3f1ec;">One tap and the <span style="color:#ff4d2e;">card</span> is yours.</td>
            </tr>
            <tr>
              <td style="padding:18px 30px 4px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#9a978f;">Confirm this address and we will hand you the printable Emergency Card: the exact first moves for when a player refuses your USB mid-gig.</td>
            </tr>
            <tr>
              <td style="padding:24px 30px 8px;">
                <a href="${confirmUrl}" style="display:inline-block;background:#ff4d2e;color:#0a0a0b;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:800;letter-spacing:0.02em;text-transform:uppercase;text-decoration:none;padding:15px 26px;border-radius:2px;">Confirm and get the card</a>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 30px 30px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#6a665f;">Did not ask for this? Ignore this email and nothing happens. The link works for 7 days. Button not working? Paste this into your browser:<br /><a href="${confirmUrl}" style="color:#9a978f;word-break:break-all;">${confirmUrl}</a></td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, html, text };
}

export async function onRequestPost({ request, env }) {
  let email = '';
  let source = 'unknown';

  try {
    const ct = request.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      const body = await request.json();
      email = (body.email || '').trim();
      source = (body.source || 'unknown').trim();
    } else {
      const form = await request.formData();
      email = String(form.get('email') || '').trim();
      source = String(form.get('source') || 'unknown').trim();
    }
  } catch (err) {
    return json({ ok: false, error: 'bad_request' }, 400);
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return json({ ok: false, error: 'invalid_email' }, 400);
  }
  if (!env.BREVO_API_KEY) {
    return json({ ok: false, error: 'not_configured' }, 500);
  }

  const token = await makeToken(email.toLowerCase(), source, env.BREVO_API_KEY);
  const confirmUrl = `${SITE}/api/confirm?t=${encodeURIComponent(token)}`;
  const { subject, html, text } = confirmEmail(confirmUrl);

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': env.BREVO_API_KEY,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      sender: SENDER,
      to: [{ email }],
      subject,
      htmlContent: html,
      textContent: text,
      tags: ['emergency-card-doi'],
    }),
  });

  if (res.ok) return json({ ok: true });

  let detail = '';
  try { detail = JSON.stringify(await res.json()); } catch (e) { /* ignore */ }
  console.log('subscribe: brevo smtp/email failed', res.status, detail);
  return json({ ok: false, error: 'provider_error' }, 502);
}

export async function onRequest({ request }) {
  if (request.method === 'POST') return;
  return json({ ok: false, error: 'method_not_allowed' }, 405);
}
