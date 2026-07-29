/**
 * POST /api/auth/google   { credential: <Google ID token> }
 *
 * The Google Identity Services button / One Tap hands the page a signed ID
 * token (a JWT). We verify it SERVER-SIDE against Google's published keys:
 * signature, issuer, audience (our client id), expiry, and email_verified.
 * Only then does a session exist. No Google SDK on the server, Web Crypto
 * only, same as everything else in functions/.
 *
 * GOOGLE_CLIENT_ID lives as a Pages env var (one place; the page asks
 * /api/auth/me for it, so client and server can never disagree).
 */

import { json, b64urlDecode, makeSessionToken, sessionCookie, getOrCreateUser, ensureBrevoContact, saveProfile } from '../_auth.js';

// Same list confirm.js adds confirmed registrants to. A gate registration
// via Google is address-verified by Google and consented on the form, so it
// joins directly, no double opt-in email needed.
const LIST_ID = 3;

const CERTS_URL = 'https://www.googleapis.com/oauth2/v3/certs';

function decodePart(part) {
  return JSON.parse(new TextDecoder().decode(b64urlDecode(part)));
}

export async function onRequestPost({ request, env }) {
  if (!env.SESSION_SECRET || !env.DB) return json({ ok: false, error: 'not_configured' }, 500);
  if (!env.GOOGLE_CLIENT_ID) return json({ ok: false, error: 'google_not_configured' }, 500);

  let credential = '';
  let artist = '';
  let instagram = '';
  let register = false;
  try {
    const b = await request.json();
    credential = String(b.credential || '');
    // The GATE path (Antonio's ruling): registering via Google carries the
    // form's artist name (required there) and optional Instagram, and joins
    // the mailing list like a confirmed email registration would.
    artist = String(b.artist || '').trim().slice(0, 80);
    instagram = String(b.instagram || '').trim().slice(0, 80);
    register = b.register === true;
  } catch (e) {
    return json({ ok: false, error: 'bad_request' }, 400);
  }

  const parts = credential.split('.');
  if (parts.length !== 3) return json({ ok: false, error: 'bad_token' }, 400);

  let header, payload;
  try {
    header = decodePart(parts[0]);
    payload = decodePart(parts[1]);
  } catch (e) {
    return json({ ok: false, error: 'bad_token' }, 400);
  }
  if (header.alg !== 'RS256' || !header.kid) return json({ ok: false, error: 'bad_token' }, 400);

  // Google's signing keys rotate; fetch the current set and pick by kid.
  let jwk = null;
  try {
    const res = await fetch(CERTS_URL, { cf: { cacheTtl: 3600, cacheEverything: true } });
    const certs = await res.json();
    jwk = (certs.keys || []).find((k) => k.kid === header.kid) || null;
  } catch (e) { /* fall through */ }
  if (!jwk) return json({ ok: false, error: 'keys_unavailable' }, 502);

  let valid = false;
  try {
    const key = await crypto.subtle.importKey(
      'jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']
    );
    const data = new TextEncoder().encode(parts[0] + '.' + parts[1]);
    valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64urlDecode(parts[2]), data);
  } catch (e) { valid = false; }
  if (!valid) return json({ ok: false, error: 'bad_signature' }, 401);

  const now = Math.floor(Date.now() / 1000);
  const issOk = payload.iss === 'https://accounts.google.com' || payload.iss === 'accounts.google.com';
  if (!issOk || payload.aud !== env.GOOGLE_CLIENT_ID || !payload.exp || now > payload.exp + 60) {
    return json({ ok: false, error: 'bad_claims' }, 401);
  }
  if (!payload.email || payload.email_verified !== true) {
    return json({ ok: false, error: 'email_unverified' }, 401);
  }

  const user = await getOrCreateUser(env.DB, payload.email, payload.sub || null);
  let artistOut = user.artist || null;
  if (register && artist) {
    // Gate registration: name + optional IG saved, contact joins the list,
    // Antonio gets the follow-back notification (once per account).
    await saveProfile(env, user.id, user.email, artist, instagram, {
      notify: true, listId: LIST_ID, source: 'checklist-google',
    });
    artistOut = artist; // just saved; a re-register simply updates the name
  } else if (user.created) {
    await ensureBrevoContact(env, user.email);
  }
  const token = await makeSessionToken(user.id, user.email, env.SESSION_SECRET);

  return new Response(JSON.stringify({ ok: true, email: user.email, artist: artistOut }), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'set-cookie': sessionCookie(token),
    },
  });
}

export async function onRequest({ request }) {
  if (request.method === 'POST') return;
  return json({ ok: false, error: 'method_not_allowed' }, 405);
}
