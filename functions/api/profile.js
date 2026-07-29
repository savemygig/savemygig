/**
 * POST /api/profile   { artist, instagram }
 *
 * The account completion step (Antonio's ruling, 2026-07-29): the account
 * asks exactly what the registration gate asks — artist name required,
 * Instagram optional with the follow-back promise — right after the FIRST
 * sign-in, because Google's button cannot carry custom fields. Saves to the
 * users row, mirrors to the Brevo contact attributes (same ARTIST /
 * INSTAGRAM / SOURCE fields the gate writes), and sends Antonio the same
 * follow-back notification the registration form sends, once, on first
 * completion.
 */

import { json, readVerifiedSession } from './_auth.js';

const SENDER = { name: 'Save My Gig', email: 'savemygig@gmail.com' };

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ ok: false, error: 'not_configured' }, 500);
  const session = await readVerifiedSession(request, env);
  if (!session) return json({ ok: false, error: 'signed_out' }, 401);

  let artist = '';
  let instagram = '';
  try {
    const b = await request.json();
    artist = String(b.artist || '').trim().slice(0, 80);
    instagram = String(b.instagram || '').trim().slice(0, 80);
  } catch (e) {
    return json({ ok: false, error: 'bad_request' }, 400);
  }
  if (!artist) return json({ ok: false, error: 'artist_required' }, 400);

  const prev = await env.DB.prepare('SELECT artist FROM users WHERE id = ?1').bind(session.uid).first();
  // Instagram only overwrites when actually provided; an empty resubmit can
  // never erase a stored handle (same rule subscribe.js follows in Brevo).
  await env.DB.prepare(
    "UPDATE users SET artist = ?1, instagram = COALESCE(NULLIF(?2, ''), instagram) WHERE id = ?3"
  ).bind(artist, instagram, session.uid).run();

  // Mirror to the Brevo contact (best effort, never blocks the save).
  if (env.BREVO_API_KEY) {
    try {
      await fetch('https://api.brevo.com/v3/contacts', {
        method: 'POST',
        headers: { 'api-key': env.BREVO_API_KEY, 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({
          email: session.email,
          updateEnabled: true,
          attributes: Object.assign(
            { SOURCE: 'account', ARTIST: artist },
            instagram ? { INSTAGRAM: instagram } : {}
          ),
        }),
      });
    } catch (err) {
      console.log('profile: brevo write failed', String(err));
    }
  }

  // The follow-back notification, once, when the account first gets a name.
  if (env.BREVO_API_KEY && (!prev || !prev.artist)) {
    try {
      const igLine = instagram
        ? `Instagram: ${instagram} - https://instagram.com/${encodeURIComponent(instagram.replace(/^@/, ''))}`
        : 'Instagram: (not given)';
      await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'api-key': env.BREVO_API_KEY, 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({
          sender: SENDER,
          to: [{ email: 'savemygig@gmail.com', name: 'Save My Gig' }],
          subject: `New account: ${artist}${instagram ? ' (' + instagram + ')' : ''}`,
          textContent:
            `New Save My Gig account completed\n\n` +
            `Email: ${session.email}\nArtist: ${artist}\n${igLine}\nSource: account\n\n` +
            `Promise on the form: every DJ who registers gets a follow.`,
        }),
      });
    } catch (err) {
      console.log('profile: owner notification failed', String(err));
    }
  }

  return json({ ok: true, artist });
}

export async function onRequest({ request }) {
  if (request.method === 'POST') return;
  return json({ ok: false, error: 'method_not_allowed' }, 405);
}
