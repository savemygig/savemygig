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

import { json, readVerifiedSession, saveProfile } from './_auth.js';

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

  // Shared with the gate's Google path: DB update, Brevo attribute mirror,
  // one-time follow-back notification. No list membership from here (the
  // completion step carries no mailing consent line).
  await saveProfile(env, session.uid, session.email, artist, instagram, {
    notify: true, source: 'account',
  });

  return json({ ok: true, artist });
}

export async function onRequest({ request }) {
  if (request.method === 'POST') return;
  return json({ ok: false, error: 'method_not_allowed' }, 405);
}
