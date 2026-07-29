-- Save My Gig accounts/sync schema (Cloudflare D1, free tier).
-- Applied once by the one-off setup call; kept here as the record and for
-- local development (wrangler d1 execute / pages dev --d1).
-- Rules baked in (Antonio's rulings 2026-07-29):
--   no passwords anywhere, Google sub or email magic link only;
--   localStorage stays source of truth, the blob is a synced copy;
--   named checklists ship in this build (cap enforced in code, not schema).

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  google_sub TEXT UNIQUE,
  -- Antonio's ruling mid-build 2026-07-29: the account must know the artist
  -- (required, the personal touch + follow-back) and their Instagram
  -- (optional, the follow-back promise). Collected right after first
  -- sign-in, because Google's button cannot carry custom fields.
  artist TEXT,
  instagram TEXT,
  created_at INTEGER NOT NULL,
  last_login INTEGER
);

-- One row per named checklist. id is a client-generated slug ("main" for the
-- migrated first list). Composite key: ids only need to be unique per DJ.
-- blob = JSON string of the full list state (ticks, custom, removed, renames,
-- order, sections, hiddenGroups, notes). MODE and OPEN are device-local by
-- design and never stored here.
CREATE TABLE IF NOT EXISTS checklists (
  user_id INTEGER NOT NULL,
  id TEXT NOT NULL,
  name TEXT NOT NULL,
  blob TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, id)
);

-- Single-use magic-link login tokens. We store only the SHA-256 hash, so a
-- database read can never yield a working sign-in link. 15-minute expiry;
-- expired rows are swept opportunistically on each new request.
CREATE TABLE IF NOT EXISTS login_tokens (
  token_hash TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  expires INTEGER NOT NULL,
  used INTEGER NOT NULL DEFAULT 0
);
