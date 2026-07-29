/**
 * GET /api/_envset?k=<cloudflare api token>&b=<brevo key>   *** TEMPORARY ***
 *
 * Third and final one-shot setter: writes BREVO_API_KEY (encrypted) for the
 * PREVIEW environment only, so email sign-in is testable on the branch URL.
 * Production keeps its own key, untouched. Same guards as before: preview
 * hostnames only, useless without a token Cloudflare accepts, echoes key
 * NAMES only. Delete after the single run.
 */

const API = 'https://api.cloudflare.com/client/v4';
const PROJECT = 'savemygig-site';
const ACCOUNT = 'f80138b56435014894e1381c3244953b';

const json = (data, status = 200) =>
  new Response(JSON.stringify(data, null, 2), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });

export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  if (!url.hostname.endsWith('.pages.dev')) return json({ ok: false, error: 'preview_only' }, 403);
  const token = url.searchParams.get('k') || '';
  const brevo = url.searchParams.get('b') || '';
  if (!token || !brevo) return json({ ok: false, error: 'missing_params' }, 400);

  const res = await fetch(`${API}/accounts/${ACCOUNT}/pages/projects/${PROJECT}`, {
    method: 'PATCH',
    headers: { authorization: 'Bearer ' + token, 'content-type': 'application/json' },
    body: JSON.stringify({
      deployment_configs: {
        preview: { env_vars: { BREVO_API_KEY: { type: 'secret_text', value: brevo } } },
      },
    }),
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
