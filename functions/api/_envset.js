/**
 * GET /api/_envset?k=<cloudflare api token>   *** TEMPORARY, DELETE AFTER USE ***
 *
 * Second one-shot setter (same pattern as the deleted _setup.js): writes
 * GOOGLE_CLIENT_ID as a plain env var for BOTH environments. The client id
 * is public by design (it ships in every page that renders the Google
 * button), so hardcoding it here is fine. Optional &b=<brevo key> also sets
 * BREVO_API_KEY for the PREVIEW environment only (production already has
 * it), as an encrypted secret.
 *
 * Guards: preview hostnames only, does nothing without a token Cloudflare
 * accepts, echoes no secrets, reports env var KEYS only.
 */

const API = 'https://api.cloudflare.com/client/v4';
const PROJECT = 'savemygig-site';
const ACCOUNT = 'f80138b56435014894e1381c3244953b';
const GOOGLE_CLIENT_ID = '665404641060-0bgr80j2fgrllt9u25f61ootvjjpul9u.apps.googleusercontent.com';

const json = (data, status = 200) =>
  new Response(JSON.stringify(data, null, 2), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });

export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  if (!url.hostname.endsWith('.pages.dev')) return json({ ok: false, error: 'preview_only' }, 403);
  const token = url.searchParams.get('k') || '';
  if (!token) return json({ ok: false, error: 'no_token' }, 401);
  const brevo = url.searchParams.get('b') || '';

  const production = { env_vars: { GOOGLE_CLIENT_ID: { type: 'plain_text', value: GOOGLE_CLIENT_ID } } };
  const preview = { env_vars: { GOOGLE_CLIENT_ID: { type: 'plain_text', value: GOOGLE_CLIENT_ID } } };
  if (brevo) preview.env_vars.BREVO_API_KEY = { type: 'secret_text', value: brevo };

  const res = await fetch(`${API}/accounts/${ACCOUNT}/pages/projects/${PROJECT}`, {
    method: 'PATCH',
    headers: { authorization: 'Bearer ' + token, 'content-type': 'application/json' },
    body: JSON.stringify({ deployment_configs: { production, preview } }),
  });
  let data = null;
  try { data = await res.json(); } catch (e) { /* ignore */ }
  if (!data || !data.success) return json({ ok: false, error: 'patch_failed', detail: data && data.errors });

  const cfg = (data.result && data.result.deployment_configs) || {};
  return json({
    ok: true,
    envVars: {
      production: Object.keys((cfg.production && cfg.production.env_vars) || {}),
      preview: Object.keys((cfg.preview && cfg.preview.env_vars) || {}),
    },
    note: 'Applies from the NEXT deployment. Delete this file now.',
  });
}

export async function onRequest({ request }) {
  if (request.method === 'GET') return;
  return json({ ok: false, error: 'method_not_allowed' }, 405);
}
