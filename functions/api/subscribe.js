/**
 * POST /api/subscribe
 * Adds an email to the Brevo list and triggers the Emergency Card delivery.
 *
 * The Brevo API key is NEVER in the site code. It lives as an encrypted
 * environment variable on Cloudflare Pages (BREVO_API_KEY) and is only
 * read here, server side.
 */

const LIST_ID = 3; // "Emergency Card subscribers"

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

export async function onRequestPost({ request, env }) {
  let email = '';
  let source = 'unknown';

  try {
    const ct = request.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      const body = await request.json();
      email = (body.email || '').trim();
      source = (body.source || 'unknown').trim();
    } else {
      const form = await request.formData();
      email = String(form.get('email') || '').trim();
      source = String(form.get('source') || 'unknown').trim();
    }
  } catch (err) {
    return json({ ok: false, error: 'bad_request' }, 400);
  }

  // basic sanity check, the real validation is Brevo's
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return json({ ok: false, error: 'invalid_email' }, 400);
  }

  if (!env.BREVO_API_KEY) {
    return json({ ok: false, error: 'not_configured' }, 500);
  }

  const res = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'api-key': env.BREVO_API_KEY,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      email,
      listIds: [LIST_ID],
      updateEnabled: true,
      attributes: { SOURCE: source },
    }),
  });

  // 201 created, 204 updated. Brevo returns 400 duplicate_parameter when the
  // contact already exists, which for us is a success from the user's point of view.
  if (res.ok) return json({ ok: true });

  let detail = {};
  try { detail = await res.json(); } catch (e) { /* ignore */ }

  if (detail && detail.code === 'duplicate_parameter') {
    return json({ ok: true, already: true });
  }

  return json({ ok: false, error: 'provider_error' }, 502);
}

// Anything other than POST gets a clear answer instead of a crash.
export async function onRequest({ request }) {
  if (request.method === 'POST') return; // handled above
  return json({ ok: false, error: 'method_not_allowed' }, 405);
}
