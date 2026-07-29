/**
 * DELETE /api/account
 *
 * Real account deletion, shipped with the accounts build as promised
 * (Antonio's ruling): the D1 rows go, the Brevo contact goes (that is where
 * the email lives), the session cookie dies. What stays is the device's own
 * localStorage, because the DJ's list on the DJ's device is the DJ's
 * (the page clears its own registration keys client-side after this call).
 *
 * Brevo deletion is best-effort but REPORTED honestly: if it fails we say
 * so in the response instead of pretending the whole erase succeeded.
 */

import { json, readVerifiedSession, clearSessionCookie } from './_auth.js';

export async function onRequestDelete({ request, env }) {
  if (!env.DB) return json({ ok: false, error: 'not_configured' }, 500);
  const session = await readVerifiedSession(request, env);
  if (!session) return json({ ok: false, error: 'signed_out' }, 401);

  await env.DB.prepare('DELETE FROM checklists WHERE user_id = ?1').bind(session.uid).run();
  await env.DB.prepare('DELETE FROM login_tokens WHERE email = ?1').bind(session.email).run();
  await env.DB.prepare('DELETE FROM users WHERE id = ?1').bind(session.uid).run();

  let brevoDeleted = false;
  if (env.BREVO_API_KEY) {
    try {
      const res = await fetch('https://api.brevo.com/v3/contacts/' + encodeURIComponent(session.email), {
        method: 'DELETE',
        headers: { 'api-key': env.BREVO_API_KEY, accept: 'application/json' },
      });
      // 404 = no contact existed, which is the same end state as deleted.
      brevoDeleted = res.ok || res.status === 404;
      if (!brevoDeleted) console.log('account: brevo delete status', res.status);
    } catch (err) {
      console.log('account: brevo delete threw', String(err));
    }
  }

  return new Response(JSON.stringify({ ok: true, emailRemoved: brevoDeleted }), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'set-cookie': clearSessionCookie(),
    },
  });
}

export async function onRequest({ request }) {
  if (request.method === 'DELETE') return;
  return json({ ok: false, error: 'method_not_allowed' }, 405);
}
