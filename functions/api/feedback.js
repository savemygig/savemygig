/**
 * POST /api/feedback
 *
 * Sends site feedback (suggestion / bug / other) to savemygig@gmail.com via
 * Brevo's transactional endpoint. Same key as the rest of the site (Cloudflare
 * Pages secret BREVO_API_KEY). All user text is escaped. If the sender left an
 * email, it is set as reply-to so we can answer them.
 *
 * Body: { type, message, name, email, instagram, page }
 */

const SENDER = { name: 'Save My Gig Feedback', email: 'savemygig@gmail.com' };
const INBOX = 'savemygig@gmail.com';

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

// Normalize whatever the DJ typed (@name, name, a full instagram.com URL) into a
// clickable profile link so Antonio can tap it and follow. Returns null if it is
// not a valid handle.
function igProfile(raw) {
  let s = String(raw == null ? '' : raw).trim();
  if (!s) return null;
  s = s.replace(/^(https?:\/\/)?(www\.)?instagram\.com\//i, '').replace(/^@/, '');
  s = s.split(/[/?#]/)[0].trim();
  if (!/^[A-Za-z0-9._]{1,30}$/.test(s)) return null;
  return { handle: s, url: 'https://www.instagram.com/' + s + '/' };
}

export async function onRequestPost({ request, env }) {
  let type = 'Other';
  let message = '';
  let name = '';
  let email = '';
  let instagram = '';
  let page = '';
  try {
    const b = await request.json();
    type = (b.type || 'Other').toString().slice(0, 40);
    message = (b.message || '').toString().slice(0, 4000).trim();
    name = (b.name || '').toString().slice(0, 120).trim();
    email = (b.email || '').toString().slice(0, 200).trim();
    instagram = (b.instagram || '').toString().slice(0, 120).trim();
    page = (b.page || '').toString().slice(0, 200);
  } catch (e) {
    return json({ ok: false, error: 'bad_request' }, 400);
  }

  if (!message) return json({ ok: false, error: 'empty' }, 400);
  if (!env.BREVO_API_KEY) return json({ ok: false, error: 'not_configured' }, 500);

  const ig = igProfile(instagram);
  const rows = [
    ['Type', type],
    ['Message', message],
    ['Name', name || '(none)'],
    ['Email', email || '(none)'],
    ['Instagram', ig ? '@' + ig.handle : (instagram || '(none)')],
    ['Page', page || '(none)'],
  ];
  const html =
    `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#111;">` +
    `<h2 style="margin:0 0 12px;">New Save My Gig feedback</h2>` +
    rows.map(([k, v]) => {
      if (k === 'Instagram' && ig) {
        return `<p style="margin:0 0 8px;"><strong>Instagram:</strong><br />` +
          `<a href="${esc(ig.url)}" style="color:#ff4d2e;font-weight:700;text-decoration:none;">@${esc(ig.handle)}</a>` +
          ` &nbsp;&middot;&nbsp; <a href="${esc(ig.url)}" style="color:#ff4d2e;">Open profile to follow &rarr;</a></p>`;
      }
      return `<p style="margin:0 0 8px;"><strong>${esc(k)}:</strong><br />${esc(v).replace(/\n/g, '<br />')}</p>`;
    }).join('') +
    `</div>`;
  const text = rows.map(([k, v]) => {
    if (k === 'Instagram' && ig) return `Instagram: @${ig.handle}\n${ig.url}`;
    return `${k}: ${v}`;
  }).join('\n\n');

  const payload = {
    sender: SENDER,
    to: [{ email: INBOX }],
    subject: `[Feedback: ${type}] Save My Gig`,
    htmlContent: html,
    textContent: text,
    tags: ['site-feedback'],
  };
  if (email && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    payload.replyTo = { email, name: name || email };
  }

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': env.BREVO_API_KEY, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(payload),
  });

  if (res.ok) return json({ ok: true });
  let detail = '';
  try { detail = JSON.stringify(await res.json()); } catch (e) { /* ignore */ }
  console.log('feedback: brevo smtp/email failed', res.status, detail);
  return json({ ok: false, error: 'provider_error' }, 502);
}

export async function onRequest({ request }) {
  if (request.method === 'POST') return;
  return json({ ok: false, error: 'method_not_allowed' }, 405);
}
