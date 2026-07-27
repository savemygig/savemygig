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

/**
 * The confirmation email has to match what the person actually asked for.
 * Someone who just unlocked the checklist was being sent an email titled
 * "Confirm your email to get the DJ Emergency Card", which reads as a
 * bait-and-switch. Copy is now chosen from the source.
 */
function copyFor(source) {
  if (String(source).startsWith('checklist')) {
    return {
      subject: 'Confirm your email, Save My Gig',
      h1a: 'You are in.',
      h1b: 'One tap to confirm.',
      lead: 'Pro and Custom mode are already unlocked on your device. Confirm this address and we will also send you the printable Emergency Card, plus the occasional note that saves gigs.',
      cta: 'Confirm my email',
      plain: 'Pro and Custom mode are already unlocked on your device.\nConfirm this address and we will also send you the printable Emergency Card.',
    };
  }
  return {
    subject: 'Confirm your email to get the DJ Emergency Card',
    h1a: 'One tap and the',
    h1b: 'card is yours.',
    lead: 'Confirm this address and we will hand you the printable Emergency Card: the exact first moves for when a player refuses your USB mid-gig.',
    cta: 'Confirm and get the card',
    plain: 'One tap and the printable DJ Emergency Card is yours.',
  };
}

function confirmEmail(confirmUrl, source) {
  const c = copyFor(source);
  const subject = c.subject;

  const text =
    c.plain + '\n\n' +
    'Confirm your email:\n' + confirmUrl + '\n\n' +
    'Keep this email. New phone or laptop? Open it there and tap the same ' +
    'link: that device gets registered too.\n\n' +
    // The follow-back ask lives HERE, not on the registration form: the form
    // gives (we follow every DJ who registers), the email may ask, because by
    // now value has been delivered first (Antonio + strategy call).
    'We follow every DJ who registers. If you like what we are building, a ' +
    'follow back at instagram.com/savemygig always helps.\n\n' +
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
              <td style="padding:0 30px;font-family:'Arial Black',Arial,sans-serif;font-size:30px;line-height:1.05;font-weight:900;text-transform:uppercase;color:#f3f1ec;">${c.h1a} <span style="color:#ff4d2e;">${c.h1b}</span></td>
            </tr>
            <tr>
              <td style="padding:18px 30px 4px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#9a978f;">${c.lead}</td>
            </tr>
            <tr>
              <td style="padding:24px 30px 8px;">
                <a href="${confirmUrl}" style="display:inline-block;background:#ff4d2e;color:#0a0a0b;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:800;letter-spacing:0.02em;text-transform:uppercase;text-decoration:none;padding:15px 26px;border-radius:2px;">${c.cta}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 30px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#9a978f;"><strong style="color:#f3f1ec;">Keep this email.</strong> New phone or laptop? Open it there and tap the same button: that device gets registered too.</td>
            </tr>
            <tr>
              <td style="padding:14px 30px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#9a978f;">We follow every DJ who registers. If you like what we are building, a follow back at <a href="https://instagram.com/savemygig" style="color:#f3f1ec;">@savemygig</a> always helps.</td>
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
  let artist = '';
  let instagram = '';

  try {
    const ct = request.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      const body = await request.json();
      email = (body.email || '').trim();
      source = (body.source || 'unknown').trim();
      artist = String(body.artist || '').trim().slice(0, 80);
      instagram = String(body.instagram || '').trim().slice(0, 80);
    } else {
      const form = await request.formData();
      email = String(form.get('email') || '').trim();
      source = String(form.get('source') || 'unknown').trim();
      artist = String(form.get('artist') || '').trim().slice(0, 80);
      instagram = String(form.get('instagram') || '').trim().slice(0, 80);
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
  const { subject, html, text } = confirmEmail(confirmUrl, source);

  // Capture the lead NOW, but deliberately with no listIds.
  //
  // Previously nothing at all was stored until the confirm link was clicked,
  // so every person who unlocked the checklist and ignored the email was lost
  // entirely. Creating the contact with no list membership means it is visible
  // and countable in Brevo, while remaining OUT of every marketing list, so no
  // campaign can reach an unconfirmed address. confirm.js is what adds them to
  // the list. Best effort: a failure here must never block the confirm email.
  try {
    const res2 = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': env.BREVO_API_KEY,
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        email,
        updateEnabled: true,
        // Conditional on purpose: updateEnabled means a later registration
        // from a surface without these fields (EmailCapture sends only the
        // email) would OVERWRITE a stored artist name and Instagram with
        // empty strings, destroying the follow-back data. Absent key = field
        // untouched.
        attributes: Object.assign(
          { SOURCE: source },
          artist ? { ARTIST: artist } : {},
          instagram ? { INSTAGRAM: instagram } : {}
        ),
      }),
    });
    if (!res2 || !res2.ok) {
      let d = '';
      try { d = JSON.stringify(await res2.json()); } catch (e) { /* ignore */ }
      console.log('subscribe: pending contact write status', res2 && res2.status, d);
    }
  } catch (err) {
    console.log('subscribe: pending contact write failed', String(err));
  }

  // Tell Antonio someone registered, so he can follow their artist Instagram
  // back. The follow-back is a promise printed on the form, which makes this
  // email part of keeping a promise, not a nice-to-have. Still best effort:
  // it must never block the visitor's confirmation email, and it sends even
  // without an Instagram handle so he sees every registration in one place.
  try {
    // Plain-text email, so no HTML escaping needed; the handle is clamped to
    // 80 chars at the top and URL-encoded in the link.
    const igLine = instagram
      ? `Instagram: ${instagram} - https://instagram.com/${encodeURIComponent(instagram.replace(/^@/, ''))}`
      : 'Instagram: (not given)';
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': env.BREVO_API_KEY, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        sender: SENDER,
        to: [{ email: 'savemygig@gmail.com', name: 'Save My Gig' }],
        subject: `New registration${artist ? ': ' + artist : ''}${instagram ? ' (' + instagram + ')' : ''}`,
        textContent:
          `New Save My Gig registration\n\n` +
          `Email: ${email}\nArtist: ${artist || '(not given)'}\n${igLine}\nSource: ${source}\n\n` +
          `Promise on the form: every DJ who registers gets a follow.`,
      }),
    });
  } catch (err) {
    console.log('subscribe: owner notification failed', String(err));
  }

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
