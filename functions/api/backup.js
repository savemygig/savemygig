/**
 * POST /api/backup
 *
 * Emails a DJ a copy of their custom pre-gig checklist, plus a restore link
 * that reloads the list on any device. No account, no database: the list is
 * encoded into the link. Uses Brevo's transactional endpoint, same key as the
 * rest of the site (Cloudflare Pages secret BREVO_API_KEY).
 *
 * Body: { email, listByCat: {catId: [labels]}, custom: {catId:[{k,t}]}, removed: [keys] }
 * The email content is built server side (no arbitrary HTML from the client),
 * and all user text is escaped.
 */

const SITE = 'https://www.savemygig.com';
const SENDER = { name: 'Save My Gig', email: 'savemygig@gmail.com' };
// New taxonomy 2026-07-27 (Antonio's checklist redesign). Old ids kept as
// aliases so a stale client that posts the old categories still renders.
const CAT_NAMES = {
  music: 'Music', gear: 'DJ Gear', personal: 'Personal Essentials', logistics: 'Logistics',
  backups: 'Music Backups', technical: 'Technical Kit', recovery: 'Backup & Recovery', travel: 'Travel',
  basics: 'The basics', extras: 'Extras and add-ons',
};

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function b64url(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function onRequestPost({ request, env }) {
  let email = '';
  let listByCat = {};
  let custom = {};
  let removed = [];
  let renames = {};
  let order = {};
  let sections = [];
  let catNamesIn = {};
  try {
    const b = await request.json();
    email = (b.email || '').trim();
    listByCat = b.listByCat || {};
    custom = b.custom || {};
    removed = Array.isArray(b.removed) ? b.removed : [];
    renames = b.renames && typeof b.renames === 'object' ? b.renames : {};
    order = b.order && typeof b.order === 'object' ? b.order : {};
    sections = Array.isArray(b.sections) ? b.sections : [];
    catNamesIn = b.catNames && typeof b.catNames === 'object' ? b.catNames : {};
  } catch (e) {
    return json({ ok: false, error: 'bad_request' }, 400);
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return json({ ok: false, error: 'invalid_email' }, 400);
  }
  if (!env.BREVO_API_KEY) {
    return json({ ok: false, error: 'not_configured' }, 500);
  }

  // The restore link must carry the WHOLE list state. It used to encode only
  // custom items and removals, so renames and order silently vanished on the
  // second device while the email's own text showed the renamed labels.
  const restoreUrl = `${SITE}/checklist#r=${b64url(JSON.stringify({ c: custom, x: removed, r: renames, o: order, s: sections }))}`;

  // Readable list, grouped by category, escaped.
  // NOTE: named CAT_ORDER, not "order": `order` above already holds the DJ's
  // saved row order from the client, and the duplicate declaration was a
  // SyntaxError that killed EVERY Cloudflare deployment (the static build
  // passes locally, but Pages compiles functions/ at deploy time). The gate
  // now node --checks this directory so the class of bug cannot ship again.
  const CAT_ORDER = ['music', 'gear', 'personal', 'logistics', 'backups', 'technical', 'recovery', 'travel', 'basics', 'extras'];
  // User-created sections arrive as extra listByCat keys with their display
  // titles in catNames; they render after the standard categories.
  const catNames = catNamesIn;
  const allCats = CAT_ORDER.concat(Object.keys(listByCat).filter((c) => CAT_ORDER.indexOf(c) === -1));
  let sectionsHtml = '';
  let textLines = [];
  allCats.forEach((cat) => {
    const items = Array.isArray(listByCat[cat]) ? listByCat[cat] : [];
    if (!items.length) return;
    const name = catNames[cat] || CAT_NAMES[cat] || cat;
    sectionsHtml += `<tr><td style="padding:16px 30px 4px;font-family:'Arial Black',Arial,sans-serif;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:0.03em;color:#ff4d2e;">${esc(name)}</td></tr>`;
    textLines.push('', name.toUpperCase());
    items.forEach((label) => {
      sectionsHtml += `<tr><td style="padding:3px 30px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#f3f1ec;">&#9633;&nbsp;&nbsp;${esc(label)}</td></tr>`;
      textLines.push('[ ] ' + label);
    });
  });
  if (!sectionsHtml) {
    sectionsHtml = `<tr><td style="padding:16px 30px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#9a978f;">Your custom list is empty right now.</td></tr>`;
  }

  const subject = 'Your pre-gig checklist, backed up';
  const text =
    'Here is a copy of your Save My Gig pre-gig checklist.\n' +
    textLines.join('\n') +
    '\n\nLoad this list on any device:\n' + restoreUrl +
    '\n\nSave My Gig, DJ rescue and prevention. savemygig.com';

  const html = `<!doctype html><html><body style="margin:0;padding:0;background:#0a0a0b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0b;"><tr><td align="center" style="padding:32px 16px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#151413;border:1px solid #2a2723;border-radius:2px;">
      <tr><td style="padding:32px 30px 4px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#ff4d2e;">Save My Gig</td></tr>
      <tr><td style="padding:0 30px;font-family:'Arial Black',Arial,sans-serif;font-size:26px;line-height:1.05;font-weight:900;text-transform:uppercase;color:#f3f1ec;">Your <span style="color:#ff4d2e;">list</span>, backed up.</td></tr>
      <tr><td style="padding:12px 30px 4px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#9a978f;">Keep this email. To load the list on another phone or your laptop, tap the button.</td></tr>
      <tr><td style="padding:18px 30px 6px;"><a href="${esc(restoreUrl)}" style="display:inline-block;background:#ff4d2e;color:#0a0a0b;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:800;letter-spacing:0.02em;text-transform:uppercase;text-decoration:none;padding:13px 24px;border-radius:2px;">Load this list</a></td></tr>
      ${sectionsHtml}
      <tr><td style="padding:20px 30px 30px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.6;color:#6a665f;border-top:1px solid #2a2723;">Save My Gig, DJ rescue and prevention. <a href="https://www.savemygig.com" style="color:#9a978f;">savemygig.com</a></td></tr>
    </table>
  </td></tr></table></body></html>`;

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': env.BREVO_API_KEY, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ sender: SENDER, to: [{ email }], subject, htmlContent: html, textContent: text, tags: ['checklist-backup'] }),
  });

  if (res.ok) return json({ ok: true });
  let detail = '';
  try { detail = JSON.stringify(await res.json()); } catch (e) { /* ignore */ }
  console.log('backup: brevo smtp/email failed', res.status, detail);
  return json({ ok: false, error: 'provider_error' }, 502);
}

export async function onRequest({ request }) {
  if (request.method === 'POST') return;
  return json({ ok: false, error: 'method_not_allowed' }, 405);
}
