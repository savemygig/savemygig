/**
 * GET /api/_migrate   *** TEMPORARY, DELETE AFTER USE ***
 *
 * One-shot, idempotent schema migration for the LIVE shared D1: adds the
 * artist and instagram columns to users (Antonio's mid-build ruling). Uses
 * the function's own DB binding, no external credentials. Running it twice
 * is a no-op ("duplicate column" is caught and reported as already-done).
 * Preview hostnames only.
 */

import { json } from './_auth.js';

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const h = url.hostname;
  if (!h.endsWith('.pages.dev') && h !== '127.0.0.1' && h !== 'localhost') return json({ ok: false, error: 'preview_only' }, 403);
  if (!env.DB) return json({ ok: false, error: 'no_db' }, 500);

  const results = {};
  for (const col of ['artist', 'instagram']) {
    try {
      await env.DB.prepare(`ALTER TABLE users ADD COLUMN ${col} TEXT`).run();
      results[col] = 'added';
    } catch (e) {
      results[col] = /duplicate column/i.test(String(e)) ? 'already_present' : 'error: ' + String(e);
    }
  }
  return json({ ok: true, results, note: 'Delete this file now.' });
}

export async function onRequest({ request }) {
  if (request.method === 'GET') return;
  return json({ ok: false, error: 'method_not_allowed' }, 405);
}
