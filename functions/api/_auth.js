/**
 * Shared auth plumbing for the accounts/sync build.
 *
 * Session = an HMAC-signed cookie, same crypto shape as _token.js but with a
 * DEDICATED secret (env.SESSION_SECRET, an encrypted Pages secret generated
 * server-side at setup; the Brevo key stays a mail credential, not an auth
 * root). Payload: { u: userId, e: email, x: expiryMs }. 90 days: with no
 * passwords, re-login is one tap, so a stolen old cookie is the only risk
 * worth bounding.
 *
 * There are NO passwords anywhere in this system (Antonio's ruling). Proof of
 * address ownership comes from Google's signed ID token or from a single-use
 * emailed link.
 */

const enc = new TextEncoder();
const dec = new TextDecoder();
export const SESSION_DAYS = 90;
const SESSION_MS = SESSION_DAYS * 24 * 60 * 60 * 1000;
const COOKIE = 'smg_s';

export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

export function b64urlEncode(bytes) {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function b64urlDecode(str) {
  let s = String(str).replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const bin = atob(s);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function hmacKey(secret) {
  return crypto.subtle.importKey(
    'raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign', 'verify']
  );
}

export async function sha256hex(text) {
  const digest = await crypto.subtle.digest('SHA-256', enc.encode(text));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function makeSessionToken(userId, email, secret) {
  const payload = { u: userId, e: email, x: Date.now() + SESSION_MS };
  const payloadBytes = enc.encode(JSON.stringify(payload));
  const key = await hmacKey(secret);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, payloadBytes));
  return `${b64urlEncode(payloadBytes)}.${b64urlEncode(sig)}`;
}

async function verifySessionToken(token, secret) {
  if (!token || token.indexOf('.') === -1) return null;
  const parts = token.split('.');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  let payloadBytes, sigBytes;
  try {
    payloadBytes = b64urlDecode(parts[0]);
    sigBytes = b64urlDecode(parts[1]);
  } catch (err) { return null; }
  const key = await hmacKey(secret);
  const ok = await crypto.subtle.verify('HMAC', key, sigBytes, payloadBytes);
  if (!ok) return null;
  let payload;
  try { payload = JSON.parse(dec.decode(payloadBytes)); } catch (err) { return null; }
  if (!payload || !payload.u || !payload.e || !payload.x) return null;
  if (Date.now() > payload.x) return null;
  return { uid: payload.u, email: payload.e };
}

/** Set-Cookie value for a fresh session. */
export function sessionCookie(token) {
  return `${COOKIE}=${token}; Max-Age=${SESSION_MS / 1000}; Path=/; HttpOnly; Secure; SameSite=Lax`;
}

/** Set-Cookie value that clears the session. */
export function clearSessionCookie() {
  return `${COOKIE}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax`;
}

/** Read and verify the session cookie. Returns {uid, email} or null. */
export async function readSession(request, env) {
  if (!env.SESSION_SECRET) return null;
  const cookies = request.headers.get('cookie') || '';
  const m = cookies.match(new RegExp('(?:^|;\\s*)' + COOKIE + '=([^;]+)'));
  if (!m) return null;
  return verifySessionToken(m[1], env.SESSION_SECRET);
}

/**
 * Find or create the user for a proven email. Also stamps last_login, and
 * records the Google sub the first time Google vouches for this address.
 * Returns the row plus `created` so callers know a FIRST sign-in happened
 * (that is when the Brevo contact gets made and the page asks who they are).
 */
export async function getOrCreateUser(db, email, googleSub) {
  const now = Date.now();
  const lower = String(email).toLowerCase();
  let created = false;
  let user = await db.prepare('SELECT id, email, google_sub, artist, instagram FROM users WHERE email = ?1').bind(lower).first();
  if (!user) {
    await db.prepare('INSERT INTO users (email, google_sub, created_at, last_login) VALUES (?1, ?2, ?3, ?3)')
      .bind(lower, googleSub || null, now).run();
    user = await db.prepare('SELECT id, email, google_sub, artist, instagram FROM users WHERE email = ?1').bind(lower).first();
    created = true;
  } else {
    await db.prepare('UPDATE users SET last_login = ?1, google_sub = COALESCE(google_sub, ?2) WHERE id = ?3')
      .bind(now, googleSub || null, user.id).run();
  }
  return { ...user, created };
}

/**
 * Best-effort Brevo contact on FIRST account sign-in (Antonio's ruling 3:
 * the account reuses the same contact record; SOURCE=account, NO list ids,
 * so no marketing list membership and no duplicate opt-in emails). Never
 * blocks a sign-in.
 */
export async function ensureBrevoContact(env, email) {
  if (!env.BREVO_API_KEY) return;
  try {
    await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: { 'api-key': env.BREVO_API_KEY, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ email, updateEnabled: true, attributes: { SOURCE: 'account' } }),
    });
  } catch (err) {
    console.log('ensureBrevoContact failed', String(err));
  }
}

/**
 * readSession + proof the user still EXISTS. A valid cookie on a second
 * device must die the moment the account is deleted, or sync would quietly
 * recreate rows for a dead user id. One indexed SELECT per request.
 */
export async function readVerifiedSession(request, env) {
  const session = await readSession(request, env);
  if (!session || !env.DB) return null;
  const user = await env.DB.prepare('SELECT id FROM users WHERE id = ?1').bind(session.uid).first();
  return user ? session : null;
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
