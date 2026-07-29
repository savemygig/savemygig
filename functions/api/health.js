/**
 * GET /api/health
 *
 * Deployment self-check, booleans only, no data: is the D1 binding present,
 * did the schema apply, are the secrets in this environment. Exists because
 * the build session cannot curl these endpoints directly (egress rules) but
 * CAN fetch a GET; it is also the first thing to check when sync misbehaves
 * in production. Safe to leave deployed: it reveals configuration shape,
 * never contents.
 */

import { json } from './_auth.js';

export async function onRequestGet({ env }) {
  let tables = [];
  if (env.DB) {
    try {
      const rows = await env.DB.prepare(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('users', 'checklists', 'login_tokens') ORDER BY name"
      ).all();
      tables = (rows.results || []).map((r) => r.name);
    } catch (e) {
      tables = ['query_failed'];
    }
  }
  return json({
    ok: true,
    d1: !!env.DB,
    tables,
    sessionSecret: !!env.SESSION_SECRET,
    googleClient: !!env.GOOGLE_CLIENT_ID,
    brevo: !!env.BREVO_API_KEY,
  });
}

export async function onRequest({ request }) {
  if (request.method === 'GET') return;
  return json({ ok: false, error: 'method_not_allowed' }, 405);
}
