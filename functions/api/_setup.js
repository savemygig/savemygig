/**
 * GET /api/_setup?k=<cloudflare api token>   *** TEMPORARY, DELETE AFTER USE ***
 *
 * One-shot infrastructure setup for the accounts build, run FROM a preview
 * deployment because the build session's sandbox cannot reach
 * api.cloudflare.com directly. This function:
 *
 *   1. finds the account and the savemygig-site Pages project
 *   2. creates the D1 database "savemygig-db" (or finds it)
 *   3. applies db/schema.sql (idempotent CREATE TABLE IF NOT EXISTS)
 *   4. binds it as DB for BOTH production and preview environments
 *   5. generates SESSION_SECRET server-side (never transits anywhere,
 *      never echoed) and stores it as an encrypted env var in both
 *      environments, only if not already present
 *   6. reports env var KEYS per environment so we can verify BREVO_API_KEY
 *      exists where the preview needs it
 *
 * Guards: refuses to run on the production hostname; does nothing without a
 * token that Cloudflare itself accepts; stores nothing; echoes no secrets.
 * The bindings only take effect on the NEXT deployment, which is the same
 * push that deletes this file.
 */

const API = 'https://api.cloudflare.com/client/v4';
const PROJECT = 'savemygig-site';
const DB_NAME = 'savemygig-db';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  google_sub TEXT UNIQUE,
  created_at INTEGER NOT NULL,
  last_login INTEGER
);
CREATE TABLE IF NOT EXISTS checklists (
  user_id INTEGER NOT NULL,
  id TEXT NOT NULL,
  name TEXT NOT NULL,
  blob TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, id)
);
CREATE TABLE IF NOT EXISTS login_tokens (
  token_hash TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  expires INTEGER NOT NULL,
  used INTEGER NOT NULL DEFAULT 0
);
`;

const json = (data, status = 200) =>
  new Response(JSON.stringify(data, null, 2), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });

export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  if (!url.hostname.endsWith('.pages.dev')) {
    return json({ ok: false, error: 'preview_only' }, 403);
  }
  const token = url.searchParams.get('k') || '';
  if (!token) return json({ ok: false, error: 'no_token' }, 401);

  const cf = async (method, path, body) => {
    const res = await fetch(API + path, {
      method,
      headers: { authorization: 'Bearer ' + token, 'content-type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    let data = null;
    try { data = await res.json(); } catch (e) { /* ignore */ }
    return { status: res.status, data };
  };

  const report = { ok: false, steps: {} };

  // 1. Account.
  const accounts = await cf('GET', '/accounts');
  const account = accounts.data && accounts.data.result && accounts.data.result[0];
  if (!account) return json({ ...report, error: 'no_account', detail: accounts.data && accounts.data.errors });
  report.steps.account = account.name;

  // 2. D1 database: find or create.
  let dbId = null;
  let created = false;
  const listed = await cf('GET', `/accounts/${account.id}/d1/database?per_page=100`);
  const existing = (listed.data && listed.data.result || []).find((d) => d.name === DB_NAME);
  if (existing) {
    dbId = existing.uuid;
  } else {
    const made = await cf('POST', `/accounts/${account.id}/d1/database`, { name: DB_NAME });
    if (!made.data || !made.data.success) {
      return json({ ...report, error: 'd1_create_failed', detail: made.data && made.data.errors });
    }
    dbId = made.data.result.uuid;
    created = true;
  }
  report.steps.d1 = { name: DB_NAME, id: dbId, created };

  // 3. Schema (idempotent).
  const schemaRes = await cf('POST', `/accounts/${account.id}/d1/database/${dbId}/query`, { sql: SCHEMA });
  report.steps.schema = schemaRes.data && schemaRes.data.success
    ? 'applied'
    : { error: schemaRes.data && schemaRes.data.errors };

  // 4 + 5. Project config: bind DB and set SESSION_SECRET where missing.
  const proj = await cf('GET', `/accounts/${account.id}/pages/projects/${PROJECT}`);
  if (!proj.data || !proj.data.success) {
    return json({ ...report, error: 'project_not_found', detail: proj.data && proj.data.errors });
  }
  const configs = (proj.data.result && proj.data.result.deployment_configs) || {};
  const envKeys = (envName) => Object.keys((configs[envName] && configs[envName].env_vars) || {});
  report.steps.envVarsBefore = { production: envKeys('production'), preview: envKeys('preview') };

  const secretBytes = new Uint8Array(32);
  crypto.getRandomValues(secretBytes);
  const secret = Array.from(secretBytes).map((b) => b.toString(16).padStart(2, '0')).join('');

  const patchEnv = (envName) => {
    const out = { d1_databases: { DB: { id: dbId } } };
    if (envKeys(envName).indexOf('SESSION_SECRET') === -1) {
      out.env_vars = { SESSION_SECRET: { type: 'secret_text', value: secret } };
    }
    return out;
  };
  const patched = await cf('PATCH', `/accounts/${account.id}/pages/projects/${PROJECT}`, {
    deployment_configs: { production: patchEnv('production'), preview: patchEnv('preview') },
  });
  if (!patched.data || !patched.data.success) {
    return json({ ...report, error: 'project_patch_failed', detail: patched.data && patched.data.errors });
  }
  const after = (patched.data.result && patched.data.result.deployment_configs) || {};
  report.steps.after = {
    production: {
      d1: Object.keys((after.production && after.production.d1_databases) || {}),
      envVars: Object.keys((after.production && after.production.env_vars) || {}),
    },
    preview: {
      d1: Object.keys((after.preview && after.preview.d1_databases) || {}),
      envVars: Object.keys((after.preview && after.preview.env_vars) || {}),
    },
  };

  report.ok = true;
  report.note = 'Bindings apply from the NEXT deployment. Delete this file now.';
  return json(report);
}

export async function onRequest({ request }) {
  if (request.method === 'GET') return;
  return json({ ok: false, error: 'method_not_allowed' }, 405);
}
