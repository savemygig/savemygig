/**
 * POST /api/subscribe
 *
 * Double opt-in flow:
 *   1. visitor submits email here
 *   2. Brevo sends a confirmation email (DOI template)
 *   3. visitor clicks confirm, Brevo adds them to the list
 *   4. Brevo redirects them to /card-ready where the PDF lives
 *
 * The Brevo API key is NEVER in the site code. It lives as an encrypted
 * environment variable on Cloudflare Pages (BREVO_API_KEY) and is only
 * read here, server side.
 *
 * Env vars:
 *   BREVO_API_KEY      required, secret
 *   BREVO_DOI_TEMPLATE optional, numeric id of the double opt-in template.
 *                      When absent we fall back to single opt-in so the form
 *                      never breaks while the template is being set up.
 */

const LIST_ID = 3; // "Emergency Card subscribers"
const REDIRECT_URL = 'https://www.savemygig.com/card-ready';

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

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return json({ ok: false, error: 'invalid_email' }, 400);
  }
  if (!env.BREVO_API_KEY) {
    return json({ ok: false, error: 'not_configured' }, 500);
  }

  const headers = {
    'api-key': env.BREVO_API_KEY,
    'content-type': 'application/json',
    accept: 'application/json',
  };

  const templateId = parseInt(env.BREVO_DOI_TEMPLATE || '', 10);

  // Preferred path: double opt-in.
  if (templateId) {
    const res = await fetch('https://api.brevo.com/v3/contacts/doubleOptinConfirmation', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email,
        includeListIds: [LIST_ID],
        templateId,
        redirectionUrl: REDIRECT_URL,
        attributes: { SOURCE: source },
      }),
    });

    if (res.ok) return json({ ok: true, doi: true });

    let detail = {};
    try { detail = await res.json(); } catch (e) { /* ignore */ }

    // Already confirmed and on the list: treat as success, tell the UI.
    if (detail && detail.code === 'duplicate_parameter') {
      return json({ ok: true, doi: true, already: true });
    }
    return json({ ok: false, error: 'provider_error' }, 502);
  }

  // Fallback: single opt-in, so the form still works before the DOI template exists.
  const res = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      email,
      listIds: [LIST_ID],
      updateEnabled: true,
      attributes: { SOURCE: source },
    }),
  });

  if (res.ok) return json({ ok: true, doi: false });

  let detail = {};
  try { detail = await res.json(); } catch (e) { /* ignore */ }
  if (detail && detail.code === 'duplicate_parameter') {
    return json({ ok: true, doi: false, already: true });
  }
  return json({ ok: false, error: 'provider_error' }, 502);
}

export async function onRequest({ request }) {
  if (request.method === 'POST') return;
  return json({ ok: false, error: 'method_not_allowed' }, 405);
}
