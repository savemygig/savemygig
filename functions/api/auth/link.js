/**
 * GET /api/auth/link?t=<token>   Typed-email sign-in, step 2 of 2.
 *
 * The DJ opened the link we emailed. Hash the token, find it unused and
 * unexpired, burn it, mint the session, land on /checklist. A dead or
 * reused link goes back to /checklist with a flag the page turns into one
 * calm line and a reopened sign-in card; never an error page.
 *
 * Signing in also registers this device (Antonio's ruling 3: the account is
 * the layer on top of the same identity), which the page handles when it
 * sees ?signedin=1.
 */

import { json, sha256hex, makeSessionToken, sessionCookie, getOrCreateUser, ensureBrevoContact } from '../_auth.js';

const redirect = (url, cookie) => {
  const headers = { location: url };
  if (cookie) headers['set-cookie'] = cookie;
  return new Response(null, { status: 302, headers });
};

export async function onRequestGet({ request, env }) {
  const origin = new URL(request.url).origin;
  if (!env.DB || !env.SESSION_SECRET) return redirect(`${origin}/checklist?signin=config`);

  const t = new URL(request.url).searchParams.get('t') || '';
  if (!t || t.length > 200) return redirect(`${origin}/checklist?signin=expired`);

  const hash = await sha256hex(t);
  const now = Date.now();
  const row = await env.DB.prepare('SELECT email, expires, used FROM login_tokens WHERE token_hash = ?1')
    .bind(hash).first();
  if (!row || row.used || now > row.expires) {
    return redirect(`${origin}/checklist?signin=expired`);
  }
  await env.DB.prepare('UPDATE login_tokens SET used = 1 WHERE token_hash = ?1').bind(hash).run();

  const user = await getOrCreateUser(env.DB, row.email, null);
  if (user.created) await ensureBrevoContact(env, user.email);
  const token = await makeSessionToken(user.id, user.email, env.SESSION_SECRET);
  return redirect(`${origin}/checklist?signedin=1`, sessionCookie(token));
}

export async function onRequest({ request }) {
  if (request.method === 'GET') return;
  return json({ ok: false, error: 'method_not_allowed' }, 405);
}
