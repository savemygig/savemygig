/**
 * /api/sync — the whole sync surface, both directions.
 *
 * localStorage IS the source of truth (Antonio's ruling); this endpoint
 * stores copies so another signed-in device can pick them up. Conflict
 * policy is last-write-wins per named list on updated_at, no merging:
 * simple, predictable, honest about what it does.
 *
 *   GET  -> { ok, lists: [{ id, name, updated_at, blob }] }
 *   PUT  -> body { lists: [{ id, name, updated_at, blob }], deleted: [ids] }
 *           upserts anything newer than what is stored, deletes what the
 *           client deleted, answers with the canonical index (no blobs).
 *
 * Caps: 10 named lists (Antonio's cap), 120 KB of JSON per list, which is
 * roughly 30x the heaviest real checklist we have seen. Blobs are opaque
 * strings here; the server never parses list content, so nothing a DJ types
 * can break sync or leak into anyone else's row (rows are keyed by the
 * session's user id, never by anything the client sends).
 */

import { json, readVerifiedSession } from './_auth.js';

// Antonio's cap (2026-07-29, revised on his phone review): SEVEN lists
// total. The client presents them inside a collapsed region, so the cap is
// about sanity, not layout.
const MAX_LISTS = 7;
const MAX_BLOB = 120000;
const ID_RE = /^[a-z0-9][a-z0-9-]{0,39}$/;

export async function onRequestGet({ request, env }) {
  if (!env.DB) return json({ ok: false, error: 'not_configured' }, 500);
  const session = await readVerifiedSession(request, env);
  if (!session) return json({ ok: false, error: 'signed_out' }, 401);

  const rows = await env.DB.prepare(
    'SELECT id, name, blob, updated_at FROM checklists WHERE user_id = ?1 ORDER BY updated_at DESC'
  ).bind(session.uid).all();
  return json({ ok: true, lists: (rows.results || []) });
}

export async function onRequestPut({ request, env }) {
  if (!env.DB) return json({ ok: false, error: 'not_configured' }, 500);
  const session = await readVerifiedSession(request, env);
  if (!session) return json({ ok: false, error: 'signed_out' }, 401);

  let lists = [];
  let deleted = [];
  try {
    const b = await request.json();
    lists = Array.isArray(b.lists) ? b.lists : [];
    deleted = Array.isArray(b.deleted) ? b.deleted : [];
  } catch (e) {
    return json({ ok: false, error: 'bad_request' }, 400);
  }
  if (lists.length > MAX_LISTS) return json({ ok: false, error: 'too_many_lists' }, 400);

  for (const del of deleted.slice(0, MAX_LISTS * 2)) {
    if (typeof del === 'string' && ID_RE.test(del)) {
      await env.DB.prepare('DELETE FROM checklists WHERE user_id = ?1 AND id = ?2').bind(session.uid, del).run();
    }
  }

  for (const l of lists) {
    if (!l || typeof l !== 'object') continue;
    const id = typeof l.id === 'string' ? l.id : '';
    const name = (typeof l.name === 'string' ? l.name : '').trim().slice(0, 40);
    const blob = typeof l.blob === 'string' ? l.blob : '';
    const updatedAt = Number(l.updated_at) || 0;
    if (!ID_RE.test(id) || !name || !blob || blob.length > MAX_BLOB || updatedAt <= 0) continue;
    // Last write wins, strictly newer only: an older device pushing a stale
    // copy can never roll back a fresher one.
    await env.DB.prepare(
      'INSERT INTO checklists (user_id, id, name, blob, updated_at) VALUES (?1, ?2, ?3, ?4, ?5) ' +
      'ON CONFLICT (user_id, id) DO UPDATE SET name = excluded.name, blob = excluded.blob, updated_at = excluded.updated_at ' +
      'WHERE excluded.updated_at > checklists.updated_at'
    ).bind(session.uid, id, name, blob, updatedAt).run();
  }

  // Enforce the cap server-side too: keep the freshest MAX_LISTS.
  await env.DB.prepare(
    'DELETE FROM checklists WHERE user_id = ?1 AND id NOT IN ' +
    '(SELECT id FROM checklists WHERE user_id = ?1 ORDER BY updated_at DESC LIMIT ?2)'
  ).bind(session.uid, MAX_LISTS).run();

  const rows = await env.DB.prepare(
    'SELECT id, name, updated_at FROM checklists WHERE user_id = ?1 ORDER BY updated_at DESC'
  ).bind(session.uid).all();
  return json({ ok: true, lists: (rows.results || []) });
}

export async function onRequest({ request }) {
  if (request.method === 'GET' || request.method === 'PUT') return;
  return json({ ok: false, error: 'method_not_allowed' }, 405);
}
