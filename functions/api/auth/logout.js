/**
 * POST /api/auth/logout
 *
 * Clears the session cookie. Nothing else: the device keeps its list and
 * its registration (localStorage is the DJ's own device, Antonio's rule),
 * sign-out only stops the syncing identity.
 */

import { json, clearSessionCookie } from '../_auth.js';

export async function onRequestPost() {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'set-cookie': clearSessionCookie(),
    },
  });
}

export async function onRequest({ request }) {
  if (request.method === 'POST') return;
  return json({ ok: false, error: 'method_not_allowed' }, 405);
}
