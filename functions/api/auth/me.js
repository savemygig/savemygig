/**
 * GET /api/auth/me
 *
 * The page's single source of session truth, asked once per load. Returns
 * who is signed in (or not), plus the Google client id when configured, so
 * the client never hardcodes it: one Pages env var feeds both the server
 * check and the button in the page. 200 either way; "signed out" is a
 * normal state, not an error.
 */

import { json, readVerifiedSession } from '../_auth.js';

export async function onRequestGet({ request, env }) {
  // Verified against the users table: a device whose account was deleted
  // elsewhere reads as signed out, immediately.
  const session = await readVerifiedSession(request, env);
  let artist = null;
  if (session && env.DB) {
    const row = await env.DB.prepare('SELECT artist FROM users WHERE id = ?1').bind(session.uid).first();
    artist = row && row.artist ? row.artist : null;
  }
  return json({
    ok: true,
    email: session ? session.email : null,
    // The page shows the completion step (artist + Instagram, the same
    // fields as the registration gate) until artist exists.
    artist,
    google: env.GOOGLE_CLIENT_ID || null,
  });
}

export async function onRequest({ request }) {
  if (request.method === 'GET') return;
  return json({ ok: false, error: 'method_not_allowed' }, 405);
}
