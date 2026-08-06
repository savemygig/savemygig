/*
 * THE CHECKLIST'S ACCOUNT AND SYNC LAYER, loaded on demand.
 *
 * WHY IT IS NOT IN THE PAGE ANY MORE (2026-08-06, perf batch 8). /checklist
 * shipped one 57.5 KB module to every visitor, and roughly 25 KB of it was
 * this: named lists, the pill row with its own drag, rename and delete modes,
 * Google Identity Services, the magic-link sign-in form, the profile form,
 * sign out, delete account, and the push/pull sync protocol. The large
 * majority of DJs who open the checklist tick a few boxes and leave. They were
 * paying for all of it, and paying again for the /api/auth/me request the old
 * init fired on every single page load whether or not an account existed.
 *
 * WHAT STAYED IN THE PAGE, and this is the line that must not move: everything
 * a DJ can do without an account. Ticking, the readiness meter, group expand
 * and collapse, drag reordering, renames, notes, custom items and sections,
 * local persistence, Reset, the printable list and THE DOWNLOAD EMAIL GATE.
 * The gate is a deliberate business decision, so it stays entirely in the
 * page's own bundle: it opens on the tap, from markup that is already in the
 * document, with no fetch and no dynamic import in front of it. Nothing here
 * can make it slower, weaker or bypassable, because nothing here is involved
 * in it at all.
 *
 * HOW IT ARRIVES. checklist.astro imports this file dynamically on the first
 * real approach to the account UI: tapping the Sync chip, tapping a locked
 * Advanced or Custom button, landing back from a sign-in redirect
 * (?signedin=1 or ?signin=expired), or, for a device that could already be
 * signed in, an /api/auth/me probe issued after the page has finished loading.
 * The card itself is plain hidden markup that the page reveals on the same tap,
 * so the visible response is immediate and this file lands behind it.
 *
 * THE PROBE IS GATED ON THE DEVICE, NOT ON A NEW FLAG. A device that has ever
 * registered has SMG_UNLOCKED, and signing in always sets it (markSignedIn
 * calls setUnlocked below), so every account holder is asked and nobody else
 * is. That keeps a signed-in DJ's behaviour byte for byte what it was: the
 * chip goes green on load, the server pull still happens on load, and an edit
 * made and abandoned still pushes. No migration, no new key to get wrong. The
 * one gap it closes explicitly: a browser with localStorage blocked cannot be
 * asked, so the page probes there too rather than silently dropping sync.
 *
 * THE SEAM. This file owns no state the page needs and reads nothing out of
 * the page by name. Everything shared arrives on the `core` object below:
 * the live storage keys, the loaders, the mutable `acct` identity, and getters
 * for the page's mutable `mode`, `pendingMode` and `pendingWant` rather than
 * copies of them, which is what stops this file ever acting on a stale value.
 * In the other direction the page holds exactly one reference into here, the
 * object returned by initAccounts(): bumpActive() stamps the registry itself
 * and calls schedulePush(), which does nothing until somebody is signed in.
 * A tick therefore costs the same whether this file has loaded or not.
 */

/** The active list IS the live keys; the registry is the index over them. */
export type RegList = { id: string; n: string; u: number };
export type Registry = { active: string; lists: RegList[] };

/** Everything this layer is allowed to know about the page that loaded it. */
export type ChecklistCore = {
  keys: {
    STORE_KEY: string; CUSTOM_KEY: string; REMOVED_KEY: string; RENAME_KEY: string;
    ORDER_KEY: string; SECTIONS_KEY: string; HIDDENG_KEY: string; NOTES_KEY: string;
    EMAIL_KEY: string; REG_KEY: string; DELETED_KEY: string; LIST_DATA_PREFIX: string;
    UNLOCK_KEY: string;
  };
  /** Mutated here, read by the page's bumpActive to decide whether to push. */
  acct: { email: string | null; google: string | null; artist: string | null };
  loadReg: () => Registry;
  saveReg: (r: Registry) => void;
  load: () => Record<string, boolean>;
  loadCustom: () => Record<string, { k: string; t: string }[]>;
  loadRemoved: () => string[];
  loadRenames: () => Record<string, string>;
  loadOrder: () => Record<string, string[]>;
  loadSections: () => { id: string; t: string }[];
  loadHiddenGroups: () => string[];
  loadNotes: () => Record<string, string>;
  getEmail: () => string;
  setEmail: (v: string) => void;
  setUnlocked: () => void;
  syncLockedState: () => void;
  setMode: (m: string) => void;
  /** Getters, not values: the page's own state keeps moving after this loads. */
  getMode: () => string;
  pendingMode: () => string;
  pendingWant: () => string;
  readPendingMode: () => string | null;
  clearPendingMode: () => void;
  printCurrentList: () => boolean;
  sendBackup: (email: string) => void;
  clearAcctGateHead: () => void;
  attachExplainer: (el: HTMLElement | null, textFn: () => string) => void;
  isInfoLit: () => boolean;
  modeBtns: HTMLButtonElement[];
};

/** What the page holds on to. Both calls are safe before anyone signs in. */
export type AccountLayer = {
  /** Called by the page's bumpActive after it has stamped the registry. */
  schedulePush: () => void;
  /** The Lists row follows the mode, and only exists while signed in. */
  updateListSwitch: () => void;
};

/**
 * `me` is the already-fetched /api/auth/me body when the page probed for a
 * signed-in device, and undefined on every interaction-triggered load, where
 * this layer asks for itself (it needs the Google client id from the same
 * response to render the Google button for a signed-OUT visitor).
 */
export function initAccounts(core: ChecklistCore, me?: any): AccountLayer {
  // ======================= ACCOUNTS / SYNC =======================
  // localStorage stays the source of truth (Antonio's ruling); the server
  // holds copies so another signed-in device can pick them up. Conflict
  // policy is last-write-wins per named list, no merging. MODE and OPEN are
  // device-local on purpose: what you keep collapsed on your phone is not a
  // property of the list.

  // The debounce handle for the outgoing push. It was declared at the top of
  // the page's script only because bumpActive() lived there; nothing outside
  // this file has ever touched it.
  let pushTimer: ReturnType<typeof setTimeout> | undefined;

  const backupMsg = document.getElementById('backupMsg');
  // THE DOWNLOAD GATE'S OWN CARD AND STATUS LINE. Read-only from here: the gate
  // is opened, filled in and closed entirely by the page, and this file touches
  // these two ONLY on the Google-from-the-gate path, to hide the card and write
  // one message once a Google sign-in has already succeeded. Both used to be
  // consts belonging to the page's script; they are elements, not page state, so
  // they are looked up here rather than handed across the seam.
  const unlockEl = document.getElementById('unlock');
  const unlockMsg = document.getElementById('unlockMsg');
  const acctLine = document.getElementById('acctLine');
  const acctCard = document.getElementById('acctCard');
  const acctOut = document.getElementById('acctOut');
  const acctIn = document.getElementById('acctIn');
  const acctEmailEl = document.getElementById('acctEmail');
  const acctForm = document.getElementById('acctForm') as HTMLFormElement | null;
  const acctMsg = document.getElementById('acctMsg');
  const acctMsg2 = document.getElementById('acctMsg2');
  // Round 9 (Antonio): "Saved." used to sit there forever, which once got in
  // the way of a real tap on Delete account right after. Auto-clear it after
  // a couple seconds -- but only if it is still the same "ok" confirmation
  // when the timer fires, so it never wipes a later error or "Deleting...".
  let acctMsg2ClearTimer: ReturnType<typeof setTimeout> | undefined;
  const listSwitch = document.getElementById('listSwitch');
  const lsPills = document.getElementById('lsPills');
  const lsNewBtn = document.getElementById('lsNewBtn');
  const lsNewForm = document.getElementById('lsNewForm') as HTMLFormElement | null;
  const lsNewName = document.getElementById('lsNewName') as HTMLInputElement | null;
  const lsMsg = document.getElementById('lsMsg');
  // Antonio's cap, revised on his phone review: seven lists total. The row
  // stays tidy at any count because the pills live inside the collapsed
  // "Lists" region (his harmonica), so the cap is about sanity, not layout.
  const MAX_LISTS = 7;

  // RegList and Registry are declared and exported at module scope above: the
  // page needs the same shape for its own loadReg/saveReg and imports the type.

  // loadReg and saveReg live in the page. Its bumpActive() has to stamp the
  // active list on every edit whether or not this file was ever loaded, or an
  // edit made before a later sign-in would look older than it is and lose to a
  // stale server copy. So the registry's reader and writer belong with the page;
  // this file reaches them through core.loadReg / core.saveReg.

  function loadDeleted(): string[] {
    try { const raw = localStorage.getItem(core.keys.DELETED_KEY); return raw ? JSON.parse(raw) : []; } catch (e) { return []; }
  }
  function saveDeleted(a: string[]) { try { localStorage.setItem(core.keys.DELETED_KEY, JSON.stringify(a)); } catch (e) { /* blocked */ } }

  // The active list IS the live keys; a snapshot is just reading them all.
  function snapshotLive() {
    return {
      ticks: core.load(), custom: core.loadCustom(), removed: core.loadRemoved(),
      renames: core.loadRenames(), order: core.loadOrder(), sections: core.loadSections(),
      hiddenGroups: core.loadHiddenGroups(), notes: core.loadNotes(),
    };
  }
  function liveHasContent(): boolean {
    const s = snapshotLive();
    return Object.keys(s.ticks).length > 0 || Object.keys(s.custom).length > 0 ||
      s.removed.length > 0 || Object.keys(s.renames).length > 0 ||
      Object.keys(s.order).length > 0 || s.sections.length > 0 ||
      s.hiddenGroups.length > 0 || Object.keys(s.notes).length > 0;
  }
  // Writes RAW (not through the save* helpers) so applying a pulled or
  // parked blob never re-marks the list as freshly edited.
  function applyBlobStr(str: string) {
    let b: any = {};
    try { b = JSON.parse(str) || {}; } catch (e) { b = {}; }
    try {
      localStorage.setItem(core.keys.STORE_KEY, JSON.stringify(b.ticks || {}));
      localStorage.setItem(core.keys.CUSTOM_KEY, JSON.stringify(b.custom || {}));
      localStorage.setItem(core.keys.REMOVED_KEY, JSON.stringify(b.removed || []));
      localStorage.setItem(core.keys.RENAME_KEY, JSON.stringify(b.renames || {}));
      localStorage.setItem(core.keys.ORDER_KEY, JSON.stringify(b.order || {}));
      localStorage.setItem(core.keys.SECTIONS_KEY, JSON.stringify(b.sections || []));
      localStorage.setItem(core.keys.HIDDENG_KEY, JSON.stringify(b.hiddenGroups || []));
      localStorage.setItem(core.keys.NOTES_KEY, JSON.stringify(b.notes || {}));
    } catch (e) { /* blocked */ }
  }
  function getParked(id: string): string {
    try { return localStorage.getItem(core.keys.LIST_DATA_PREFIX + id) || ''; } catch (e) { return ''; }
  }
  function setParked(id: string, blobStr: string) {
    try { localStorage.setItem(core.keys.LIST_DATA_PREFIX + id, blobStr); } catch (e) { /* blocked */ }
  }
  function dropParked(id: string) { try { localStorage.removeItem(core.keys.LIST_DATA_PREFIX + id); } catch (e) { /* blocked */ } }

  // THE PUSH HALF OF THE OLD bumpActive(). Every list-mutating save* helper in
  // the page still calls bumpActive(), which still stamps the active list as
  // just-edited; the page keeps that half, because the stamp has to happen
  // whether or not this file has ever loaded. What the page cannot do is push,
  // so it calls this, and this does nothing at all until somebody is signed in,
  // exactly as the whole function used to.
  function schedulePush() {
    if (!core.acct.email) return;
    if (pushTimer) clearTimeout(pushTimer);
    pushTimer = setTimeout(() => { pushAll(false); }, 2500);
  }

  function payloadLists() {
    const reg = core.loadReg();
    return reg.lists
      .filter((l) => (l.u || 0) > 0)
      .map((l) => ({
        id: l.id, name: l.n, updated_at: l.u,
        blob: l.id === reg.active ? JSON.stringify(snapshotLive()) : (getParked(l.id) || JSON.stringify({})),
      }))
      .filter((l) => l.blob && l.blob !== '{}');
  }
  async function pushAll(keepalive: boolean) {
    if (!core.acct.email) return;
    const lists = payloadLists();
    const deleted = loadDeleted();
    if (!lists.length && !deleted.length) return;
    try {
      const res = await fetch('/api/sync', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ lists, deleted }),
        keepalive,
      });
      if (res.ok) { saveDeleted([]); setDotSynced(true); }
    } catch (e) { /* offline: localStorage already has everything */ }
  }
  // A tab going to background mid-edit should not lose the last change.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && pushTimer) {
      clearTimeout(pushTimer); pushTimer = undefined;
      pushAll(true);
    }
  });

  async function syncNow() {
    if (!core.acct.email) return;
    // Round 7 BUG FIX (Antonio: removed checklist sections were coming
    // back after sync). Root cause: this used to PULL first, then push.
    // Any local edit made in the last few seconds -- still sitting in
    // bumpActive()'s 2.5s debounce, or just made right as a sign-in
    // triggered this same syncNow() call -- had not reached the server
    // yet. If the server happened to hold an older blob for this list
    // (from before that edit) with a HIGHER updated_at than this device's
    // pre-push local `u` -- the ordinary state right after a fresh local
    // edit, before its own push has landed -- the pull branch below would
    // treat that stale server copy as newer and silently overwrite the
    // local edit, including anything removed via the x. Reproduced with a
    // mocked stale-but-newer-timestamp server response; fixed by pushing
    // BEFORE pulling. This is always safe to do in this order: the server
    // enforces strictly-newer on its own end (see sync.js), so an older
    // local push here is just a no-op there, never a rollback of
    // something another device already stored more recently. Pushing
    // first only ever helps: it gives this device's own latest edits a
    // chance to become "the newest" on the server before any pull could
    // mistake "not pushed yet" for "doesn't exist."
    await pushAll(false);
    let server: { id: string; name: string; blob: string; updated_at: number }[] = [];
    try {
      const res = await fetch('/api/sync');
      if (!res.ok) return;
      const d = await res.json();
      server = Array.isArray(d.lists) ? d.lists : [];
    } catch (e) { return; }
    const reg = core.loadReg();
    const deleted = loadDeleted();
    let activeChanged = false;
    server.forEach((s) => {
      if (deleted.indexOf(s.id) !== -1) return; // deleted here; push will clean the server
      const local = reg.lists.find((l) => l.id === s.id);
      if (!local) {
        reg.lists.push({ id: s.id, n: s.name, u: s.updated_at });
        setParked(s.id, s.blob);
      } else if (s.updated_at > (local.u || 0)) {
        local.n = s.name; local.u = s.updated_at;
        if (reg.active === s.id) { applyBlobStr(s.blob); activeChanged = true; }
        else setParked(s.id, s.blob);
      }
    });
    core.saveReg(reg);
    setDotSynced(true);
    if (activeChanged) location.reload(); // fresh render from the pulled state; u now matches, so no loop
    else renderPills();
  }

  // Signed-out chip is a dim verb ("Sync"), signed-in is a green state
  // Round 5, fifth pass (Antonio, resolving the round-3 open question
  // himself): "the sync button could just say Sync. If it is gray, it's
  // off. If it is green, it's on." SUPERSEDES the earlier "label must
  // change with the state, not just the colour" ruling above, label now
  // stays "Sync" always, colour alone carries the state. Agreed this is the
  // right call when asked: the chip isn't the only place state shows up
  // (the chevron and, once opened, "Synced with <email>" both reinforce
  // it), and gray-vs-green is one of the safer color pairs for colorblind
  // users since gray reads as desaturated regardless of hue perception ,
  // unlike, say, red/green. Flagged, not silently changed.
  function setDotSynced(on: boolean) {
    const synced = on && !!core.acct.email;
    if (acctLine) acctLine.classList.toggle('is-synced', synced);
  }

  function updateAcctUI() {
    const signedIn = !!core.acct.email;
    if (acctOut) acctOut.hidden = signedIn;
    if (acctIn) acctIn.hidden = !signedIn;
    if (acctEmailEl) acctEmailEl.textContent = core.acct.email || '';
    setDotSynced(signedIn);
    // Completion step: the account asks what the gate asks, until it has a
    // name. Prefilled when this device already greeted the DJ. The card
    // opens itself so the form is actually seen after the sign-in redirect.
    const profileForm = document.getElementById('acctProfile') as HTMLFormElement | null;
    if (profileForm) {
      const needs = signedIn && !core.acct.artist;
      profileForm.hidden = !needs;
      if (needs) {
        const a = profileForm.querySelector('input[name="artist"]') as HTMLInputElement | null;
        if (a && !a.value) {
          try { a.value = localStorage.getItem('SMG_ARTIST') || ''; } catch (e) { /* blocked */ }
        }
        if (acctCard && acctCard.hidden && acctLine) {
          acctCard.hidden = false;
          acctLine.setAttribute('aria-expanded', 'true');
        }
      }
    }
    updateListSwitch();
  }

  function updateListSwitch() {
    if (!listSwitch) return;
    const show = core.getMode() === 'custom' && !!core.acct.email;
    listSwitch.hidden = !show;
    if (show) renderPills();
  }

  /* ----- list reorder (drag the handle left or right, Lists Delete/Done
     mode only). Same concept as the checklist's own task-drag, but the pills
     live in a horizontal, wrapping row: placement tracks the nearest pill by
     2D center distance instead of just top/bottom, and the shaft+chevrons
     icon lies on its side to match (Antonio, round 9). */
  function makePillDragHandle(pill: HTMLElement, name: string): HTMLButtonElement {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'ls-drag';
    b.setAttribute('aria-label', 'Arrastra para reordenar ' + name);
    b.innerHTML = '<svg viewBox="0 0 22 14" width="16" height="10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 7h18"/><path d="M6 3 2 7l4 4"/><path d="M16 3l4 4-4 4"/></svg>';
    initPillDrag(b, pill);
    return b;
  }
  function initPillDrag(handle: HTMLElement, pill: HTMLElement) {
    handle.addEventListener('pointerdown', (ev: PointerEvent) => {
      if (!listSwitch || !listSwitch.classList.contains('moving')) return;
      const ul = lsPills as HTMLElement | null; if (!ul) return;
      ev.preventDefault();
      ev.stopPropagation();
      const grabX = ev.clientX - pill.getBoundingClientRect().left;
      const grabY = ev.clientY - pill.getBoundingClientRect().top;
      pill.classList.add('dragging');
      document.body.classList.add('dragging-row');

      const place = (clientX: number, clientY: number) => {
        pill.style.transform = '';
        const nat = pill.getBoundingClientRect();
        const wantLeft = clientX - grabX;
        const wantTop = clientY - grabY;
        const cx = wantLeft + nat.width / 2;
        const cy = wantTop + nat.height / 2;
        const sibs = Array.from(ul.children).filter((n) => n !== pill) as HTMLElement[];
        let closest: HTMLElement | null = null;
        let closestDist = Infinity;
        sibs.forEach((sib) => {
          const r = sib.getBoundingClientRect();
          const d = Math.hypot(cx - (r.left + r.width / 2), cy - (r.top + r.height / 2));
          if (d < closestDist) { closestDist = d; closest = sib; }
        });
        if (closest) {
          const r = (closest as HTMLElement).getBoundingClientRect();
          const before = new Map<HTMLElement, DOMRect>();
          sibs.forEach((s) => before.set(s, s.getBoundingClientRect()));
          if (cx < r.left + r.width / 2) ul.insertBefore(pill, closest);
          else ul.insertBefore(pill, (closest as HTMLElement).nextSibling);
          sibs.forEach((s) => {
            const before2 = before.get(s); if (!before2) return;
            const after = s.getBoundingClientRect();
            const dx = before2.left - after.left, dy = before2.top - after.top;
            if (!dx && !dy) return;
            s.style.transition = 'none';
            s.style.transform = `translate(${dx}px, ${dy}px)`;
            requestAnimationFrame(() => { s.style.transition = 'transform 0.16s ease'; s.style.transform = ''; });
          });
        }
        pill.style.transform = '';
        const now = pill.getBoundingClientRect();
        pill.style.transform = `translate(${(wantLeft - now.left).toFixed(1)}px, ${(wantTop - now.top).toFixed(1)}px) scale(1.03)`;
      };

      pill.style.transition = 'transform var(--t-fast), box-shadow var(--t-fast)';
      place(ev.clientX, ev.clientY);
      window.setTimeout(() => { if (pill.classList.contains('dragging')) pill.style.transition = ''; }, 130);
      const move = (e: PointerEvent) => { e.preventDefault(); place(e.clientX, e.clientY); };
      const up = () => {
        document.removeEventListener('pointermove', move);
        document.removeEventListener('pointerup', up);
        document.removeEventListener('pointercancel', up);
        pill.style.transition = 'transform 0.16s ease';
        pill.style.transform = '';
        window.setTimeout(() => { pill.style.transition = ''; }, 190);
        pill.classList.remove('dragging');
        document.body.classList.remove('dragging-row');
        savePillOrderFromDom();
      };
      document.addEventListener('pointermove', move, { passive: false });
      document.addEventListener('pointerup', up);
      document.addEventListener('pointercancel', up);
    });
  }
  function savePillOrderFromDom() {
    if (!lsPills) return;
    const order = Array.from(lsPills.children).map((p) => (p as HTMLElement).dataset.id || '');
    const reg = core.loadReg();
    reg.lists.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
    core.saveReg(reg);
  }

  // Round 11.5 (Antonio): real list rename, not just a checklist item rename.
  // Bumps just the ONE list's own timestamp (not bumpActive(), which only
  // ever touches the active list) so a renamed inactive list still gets
  // picked up by the next debounced push.
  function bumpList(id: string) {
    try {
      const reg = core.loadReg();
      const l = reg.lists.find((x) => x.id === id);
      if (l) { l.u = Date.now(); core.saveReg(reg); }
    } catch (e) { /* never let sync bookkeeping break a rename */ }
    if (core.acct.email) {
      if (pushTimer) clearTimeout(pushTimer);
      pushTimer = setTimeout(() => { pushAll(false); }, 2500);
    }
  }
  function renameList(id: string, name: string) {
    const t = (name || '').trim().slice(0, 40);
    if (!t) return;
    const reg = core.loadReg();
    const l = reg.lists.find((x) => x.id === id);
    if (!l || l.n === t) return;
    l.n = t;
    core.saveReg(reg);
    bumpList(id);
  }
  // Same click-to-edit-inline flow as the checklist item pencil
  // (makeEditButton/beginRename below), pointed at a list name instead.
  function beginPillRename(pill: HTMLElement, span: HTMLElement, id: string) {
    if (pill.querySelector('.ls-name-edit')) return;
    const input = document.createElement('input');
    input.type = 'text'; input.className = 'ls-name-edit'; input.maxLength = 40;
    input.value = span.textContent || '';
    span.replaceWith(input);
    input.focus();
    const n = input.value.length;
    input.setSelectionRange(n, n);
    // Typing, clicking or dragging inside the field must never switch or
    // reorder the list out from under the DJ mid-edit.
    input.addEventListener('click', (e) => e.stopPropagation());
    input.addEventListener('pointerdown', (e) => e.stopPropagation());
    const commit = () => {
      const t = (input.value || '').trim();
      if (t) renameList(id, t);
      renderPills(); // rebuilds the row either way, restoring the span
    };
    input.addEventListener('blur', commit);
    input.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
      if (e.key === 'Escape') { input.value = span.textContent || ''; input.blur(); }
    });
  }
  function makePillPencil(pill: HTMLElement, span: HTMLElement, id: string, name: string): HTMLButtonElement {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'ls-pencil';
    b.setAttribute('aria-label', 'Renombrar ' + name);
    b.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>';
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      beginPillRename(pill, span, id);
    });
    return b;
  }

  let pillArmTimer: ReturnType<typeof setTimeout> | undefined;
  function renderPills() {
    if (!lsPills || !core.acct.email) return;
    const reg = core.loadReg();
    // The collapsed header names the active list, so no tap is needed just
    // to know where you are.
    const activeName = document.getElementById('lsActiveName');
    if (activeName) {
      const a = reg.lists.find((l) => l.id === reg.active);
      activeName.textContent = a ? a.n : '';
    }
    lsPills.innerHTML = '';
    reg.lists.forEach((l) => {
      const pill = document.createElement('button');
      pill.type = 'button';
      pill.className = 'ls-pill' + (l.id === reg.active ? ' is-on' : '');
      pill.dataset.id = l.id;
      const name = document.createElement('span');
      name.className = 'ls-name';
      name.textContent = l.n;
      pill.appendChild(name);
      // Round 11.5 follow-up: pills are covered controls too now, same as
      // every other button on the page -- so a DJ can see and read what
      // tapping a pill does before they've ever tapped one.
      core.attachExplainer(pill, () => 'Toca para cambiar a esta lista. Las marcas, las notas y las ediciones se guardan por separado en cada lista.');
      if (core.isInfoLit()) pill.classList.add('info-lit');
      // Round 11.5: rename lives on every pill, including the active one --
      // the DJ's current list is the one most likely to need a real name.
      // Gated to Move mode, same as the drag handle appended below.
      pill.appendChild(makePillPencil(pill, name, l.id, l.n));
      if (l.id !== reg.active) {
        pill.addEventListener('click', (e) => {
          const t = e.target as HTMLElement;
          if (t.classList.contains('ls-x') || t.closest('.ls-drag') || t.closest('.ls-pencil') || t.closest('.ls-name-edit')) return;
          switchList(l.id);
        });
        // Deleting a whole list is the most destructive tap on the page:
        // Edit mode only, and the same two-tap contract as Reset.
        const x = document.createElement('button');
        x.type = 'button';
        x.className = 'ls-x';
        x.textContent = '×';
        x.setAttribute('aria-label', 'Borrar la lista ' + l.n);
        x.addEventListener('click', (e) => {
          e.stopPropagation();
          if (!x.classList.contains('armed')) {
            x.classList.add('armed');
            if (pillArmTimer) clearTimeout(pillArmTimer);
            pillArmTimer = setTimeout(() => x.classList.remove('armed'), 4000);
            return;
          }
          deleteList(l.id);
        });
        pill.appendChild(x);
      }
      // Round 9 (Antonio): a reorder handle after the delete x, same idea as
      // the checklist's own drag handle, but sideways since pills sit in a
      // horizontal row. Lives in the same Delete/Done mode as the x -- one
      // toggle reveals both, same pattern as the checklist's Edit toggle
      // revealing pencil + drag + remove together. On for every pill,
      // including the active one, so the active list can move too.
      pill.appendChild(makePillDragHandle(pill, l.n));
      lsPills.appendChild(pill);
    });
    // At the cap the "+ New list" affordance disappears entirely: a dead
    // button would just restate the mess the cap exists to prevent.
    if (lsNewBtn && lsNewForm) {
      const atCap = reg.lists.length >= MAX_LISTS;
      if (atCap) { lsNewBtn.hidden = true; lsNewForm.hidden = true; }
      else if (lsNewForm.hidden) lsNewBtn.hidden = false;
    }
  }

  function switchList(id: string) {
    const reg = core.loadReg();
    if (id === reg.active || !reg.lists.some((l) => l.id === id)) return;
    setParked(reg.active, JSON.stringify(snapshotLive()));
    applyBlobStr(getParked(id) || '{}');
    reg.active = id;
    core.saveReg(reg);
    // A full rebuild beats surgically re-rendering eight kinds of state
    // (same call Reset makes).
    location.reload();
  }

  function createList(name: string) {
    const t = (name || '').trim();
    if (!t) return;
    const reg = core.loadReg();
    if (reg.lists.length >= MAX_LISTS) {
      if (lsMsg) { lsMsg.textContent = 'Siete listas es el límite. Borra alguna que ya no toques.'; lsMsg.className = 'acct-msg err'; }
      return;
    }
    const id = 'l-' + t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 24) + '-' + Math.random().toString(36).slice(2, 6);
    // A new list is a fresh Custom baseline: the full Advanced set, nothing
    // ticked, nothing customised yet (that is what Custom means here).
    reg.lists.push({ id, n: t.slice(0, 40), u: Date.now() });
    core.saveReg(reg);
    setParked(id, JSON.stringify({}));
    switchList(id);
  }

  function deleteList(id: string) {
    const reg = core.loadReg();
    if (id === reg.active) return; // the UI never offers this
    reg.lists = reg.lists.filter((l) => l.id !== id);
    core.saveReg(reg);
    dropParked(id);
    const del = loadDeleted();
    if (del.indexOf(id) === -1) { del.push(id); saveDeleted(del); }
    renderPills();
    if (core.acct.email) pushAll(false);
  }

  function markSignedIn(email: string, artist?: string | null) {
    core.acct.email = email;
    if (artist !== undefined) core.acct.artist = artist;
    // Signing in also registers this device (Antonio's ruling 3: same
    // identity, the account is the layer on top).
    core.setUnlocked();
    if (!core.getEmail()) core.setEmail(email);
    // The artist name follows the DJ like the lists do: a new device learns
    // it from the account, so the homepage greeting works there too.
    if (core.acct.artist) {
      try {
        if (!localStorage.getItem('SMG_ARTIST')) localStorage.setItem('SMG_ARTIST', core.acct.artist.split(/\s+/)[0]);
      } catch (e) { /* blocked */ }
    }
    // A device that never had a registry gets one now; a list that already
    // has real content on it deserves to reach the account without waiting
    // for the next edit.
    const reg = core.loadReg();
    const a = reg.lists.find((l) => l.id === reg.active);
    if (a && !a.u && liveHasContent()) a.u = Date.now();
    core.saveReg(reg);
    updateAcctUI();
    syncNow();
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'account_signin', { placement: 'checklist' });
    }
  }

  // Round 7: if sign-in just completed because Advanced/Custom was locked
  // (not because the DJ opened Sync on its own), hand over the mode the
  // same way the old registration gate used to -- apply it, close the
  // card, scroll to the top. Called from BOTH sign-in paths: the
  // synchronous one (Google from the card) and the one that survives a
  // full page reload (the magic-link redirect), which is exactly why the
  // pending intent has to live in localStorage and not just a JS variable.
  // Also preserves the marketing double opt-in the old gate fired
  // (Antonio's ruling: account sign-in itself does NOT join the marketing
  // list, only a plain CRM contact -- but arriving via a mode-unlock is
  // the same funnel the old gate fed, so that specific path still sends
  // the opt-in email, same as it always did).
  function applyPendingModeIfAny(): boolean {
    const pm = core.readPendingMode();
    if (!pm) return false;
    core.clearPendingMode();
    core.setMode(pm);
    updateListSwitch();
    if (acctCard) acctCard.hidden = true;
    if (acctLine) acctLine.setAttribute('aria-expanded', 'false');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    try {
      fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: core.acct.email || '', source: 'checklist-' + pm, artist: core.acct.artist || '', instagram: '' }),
      });
    } catch (e) { /* unlocked anyway; feature is free */ }
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'advanced_unlock', { placement: 'checklist', mode: pm, method: 'account' });
    }
    return true;
  }

  // Google Identity Services: only injected when the server says a client id
  // is configured and nobody is signed in. One Tap on THIS page only. TWO
  // buttons share one callback: the sync card (plain sign-in) and the gate
  // (registration: artist required, joins the list, fulfils what the DJ
  // reached for). Which one was used is tracked by pointerenter on the
  // wrappers, because clicks inside Google's iframe never reach us.
  let gsiFrom: 'card' | 'gate' = 'card';
  function initGoogle() {
    if (!core.acct.google || core.acct.email || document.getElementById('gsiScript')) return;
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.id = 'gsiScript';
    s.async = true;
    s.defer = true;
    s.onload = () => {
      const g = (window as any).google;
      if (!g || !g.accounts || !g.accounts.id) return;
      g.accounts.id.initialize({
        client_id: core.acct.google,
        callback: async (resp: { credential: string }) => {
          const fromGate = gsiFrom === 'gate';
          const body: any = { credential: resp.credential };
          if (fromGate && unlockForm) {
            const aInp = unlockForm.querySelector('input[name="artist"]') as HTMLInputElement | null;
            const iInp = unlockForm.querySelector('input[name="instagram"]') as HTMLInputElement | null;
            body.artist = aInp ? aInp.value.trim() : '';
            body.instagram = iInp ? iInp.value.trim() : '';
            body.register = true;
          }
          try {
            const r = await fetch('/api/auth/google', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify(body),
            });
            const d = await r.json();
            if (d && d.ok && d.email) {
              markSignedIn(d.email, d.artist || null);
              if (fromGate) {
                // Same after-registration moves as the email form: hide the
                // gate and hand over what they actually came for.
                if (unlockEl) unlockEl.hidden = true;
                if (core.pendingWant() === 'pdf') {
                  if (!core.printCurrentList() && backupMsg) {
                    backupMsg.textContent = 'Ya estás registrado. Tu navegador bloqueó la ventana de descarga: toca Descargar lista otra vez y permite las ventanas emergentes.';
                    backupMsg.className = 'backup-msg ok';
                  }
                } else if (core.pendingWant() === 'email') {
                  core.sendBackup(d.email);
                } else {
                  core.setMode(core.pendingMode());
                  updateListSwitch();
                  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                  window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
                }
                if (typeof (window as any).gtag === 'function') {
                  (window as any).gtag('event', 'advanced_unlock', { placement: 'checklist', mode: core.pendingWant() === 'mode' ? core.pendingMode() : core.pendingWant(), method: 'google' });
                }
              } else {
                // Card path (round 7): Google was pressed from the account
                // card, not the (now PDF/email-only) gate. If that card was
                // opened because Advanced/Custom was locked, hand over the
                // mode now; if it was opened by a plain Sync click, this is
                // a no-op and the card just stays open, unchanged.
                applyPendingModeIfAny();
              }
            } else {
              const msgEl = fromGate ? unlockMsg : acctMsg;
              if (msgEl) { msgEl.textContent = 'El acceso con Google no funcionó. Usa tu correo.'; msgEl.className = (fromGate ? 'unlock-msg' : 'acct-msg') + ' err'; }
            }
          } catch (e) {
            const msgEl = fromGate ? unlockMsg : acctMsg;
            if (msgEl) { msgEl.textContent = 'Sin conexión ahora. Tu lista está a salvo en este dispositivo.'; msgEl.className = (fromGate ? 'unlock-msg' : 'acct-msg') + ' err'; }
          }
        },
      });
      const holder = document.getElementById('gsiBtn');
      if (holder) {
        g.accounts.id.renderButton(holder, { theme: 'filled_black', size: 'large', text: 'continue_with', shape: 'rectangular' });
        // Same Google-first collapse as the gate (round 5, fourth pass): once
        // Google actually renders here, hide the email form behind its own
        // toggle instead of showing both paths stacked and undifferentiated.
        if (acctForm) acctForm.hidden = true;
        const cardToggle = document.getElementById('acctEmailToggle');
        if (cardToggle) cardToggle.hidden = false;
      }
      const gateHolder = document.getElementById('gsiGateBtn');
      if (gateHolder) {
        g.accounts.id.renderButton(gateHolder, { theme: 'filled_black', size: 'large', text: 'continue_with', shape: 'rectangular', width: 230 });
        const alt = document.getElementById('unlockAlt');
        if (alt) alt.hidden = false;
        // Google is the default path now (round 5): once it actually
        // renders, collapse the form behind the toggle. Without JS or
        // without a configured client id, none of this runs and the form
        // just stays visible, which is the only path there is.
        if (unlockForm) unlockForm.hidden = true;
        const toggle = document.getElementById('unlockEmailToggle');
        if (toggle) toggle.hidden = false;
      }
      g.accounts.id.prompt();
    };
    document.head.appendChild(s);
  }

  // Which Google button was pressed: clicks inside Google's iframe never
  // reach us, so pointerenter on the wrapper is the tell.
  {
    const gateWrap = document.getElementById('gsiGateWrap');
    const cardWrap = document.getElementById('gsiBtn');
    if (gateWrap) gateWrap.addEventListener('pointerenter', () => { gsiFrom = 'gate'; });
    if (cardWrap) cardWrap.addEventListener('pointerenter', () => { gsiFrom = 'card'; });
  }

  // "No Google? No problem. Use your other email." (Antonio's own phrasing,
  // round 5): reveals the email/artist/instagram form, which starts hidden
  // once Google is the visible default path above.
  {
    const toggle = document.getElementById('unlockEmailToggle');
    if (toggle) toggle.addEventListener('click', () => {
      if (unlockForm) unlockForm.hidden = false;
      toggle.hidden = true;
      const inp = unlockForm && unlockForm.querySelector('input[name="email"]') as HTMLInputElement | null;
      if (inp) inp.focus();
    });
  }
  // Same toggle, on the Sync card's own Google/email choice (round 5,
  // fourth pass), identical reasoning, separate element since the card and
  // the gate are two different forms on the page.
  {
    const cardToggle = document.getElementById('acctEmailToggle');
    if (cardToggle) cardToggle.addEventListener('click', () => {
      if (acctForm) acctForm.hidden = false;
      cardToggle.hidden = true;
      const inp = acctForm && acctForm.querySelector('input[name="email"]') as HTMLInputElement | null;
      if (inp) inp.focus();
    });
  }

  // The sync chip's own expand/collapse and the click-away close moved to the
  // page: the card has to open on the very tap that starts this file
  // downloading, so it cannot wait for this file to arrive.


  // Typed email: send the one-tap link.
  if (acctForm) {
    let busy = false;
    acctForm.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      if (busy) return;
      const inp = acctForm.querySelector('input[name="email"]') as HTMLInputElement;
      const email = (inp.value || '').trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        if (acctMsg) { acctMsg.textContent = 'Ese correo no se ve bien. Revísalo e intenta de nuevo.'; acctMsg.className = 'acct-msg err'; }
        inp.focus();
        return;
      }
      busy = true;
      if (acctMsg) { acctMsg.textContent = 'Enviando tu enlace...'; acctMsg.className = 'acct-msg'; }
      try {
        const res = await fetch('/api/auth/email', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        if (res.status === 429) {
          if (acctMsg) { acctMsg.textContent = 'Ya va un enlace en camino. Revisa tu bandeja de entrada, o espera unos minutos por uno nuevo.'; acctMsg.className = 'acct-msg err'; }
        } else if (res.ok) {
          if (acctMsg) { acctMsg.textContent = 'Enviado a ' + email + '. Ábrelo en este dispositivo y toca el botón: eso te conecta aquí.'; acctMsg.className = 'acct-msg ok'; }
        } else {
          if (acctMsg) { acctMsg.textContent = 'No se pudo enviar ahora, el problema es de nuestro lado. Intenta de nuevo en un minuto.'; acctMsg.className = 'acct-msg err'; }
        }
      } catch (e) {
        if (acctMsg) { acctMsg.textContent = 'Sin conexión. Intenta de nuevo cuando tengas señal.'; acctMsg.className = 'acct-msg err'; }
      }
      busy = false;
    });
  }

  // The completion step: artist required (same rule and same error line as
  // the gate), Instagram optional with the follow-back promise.
  const acctProfileForm = document.getElementById('acctProfile') as HTMLFormElement | null;
  const acctProfileMsg = document.getElementById('acctProfileMsg');
  if (acctProfileForm) {
    let profileBusy = false;
    acctProfileForm.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      if (profileBusy) return;
      const aInp = acctProfileForm.querySelector('input[name="artist"]') as HTMLInputElement;
      const iInp = acctProfileForm.querySelector('input[name="instagram"]') as HTMLInputElement | null;
      const artist = (aInp.value || '').trim();
      const instagram = iInp ? (iInp.value || '').trim() : '';
      if (!artist) {
        if (acctProfileMsg) { acctProfileMsg.textContent = 'Pon tu nombre artístico o tu nombre de pila, para saber cómo llamarte.'; acctProfileMsg.className = 'acct-msg err'; }
        aInp.focus();
        return;
      }
      profileBusy = true;
      try {
        const res = await fetch('/api/profile', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ artist, instagram }),
        });
        const d = await res.json();
        if (res.ok && d && d.ok) {
          core.acct.artist = artist;
          try { localStorage.setItem('SMG_ARTIST', artist.split(/\s+/)[0]); } catch (e) { /* blocked */ }
          updateAcctUI();
          if (acctMsg2) {
            acctMsg2.textContent = instagram ? 'Guardado. Seguimos tu trabajo con gusto.' : 'Guardado.';
            acctMsg2.className = 'acct-msg ok';
            if (acctMsg2ClearTimer) clearTimeout(acctMsg2ClearTimer);
            acctMsg2ClearTimer = setTimeout(() => {
              if (acctMsg2 && acctMsg2.classList.contains('ok')) { acctMsg2.textContent = ''; acctMsg2.className = 'acct-msg'; }
            }, 2200);
          }
          if (typeof (window as any).gtag === 'function') {
            (window as any).gtag('event', 'account_profile', { placement: 'checklist' });
          }
        } else if (acctProfileMsg) {
          acctProfileMsg.textContent = 'No se pudo guardar ahora, el problema es de nuestro lado. Intenta de nuevo en un minuto.'; acctProfileMsg.className = 'acct-msg err';
        }
      } catch (e) {
        if (acctProfileMsg) { acctProfileMsg.textContent = 'Sin conexión. Intenta de nuevo cuando tengas señal.'; acctProfileMsg.className = 'acct-msg err'; }
      }
      profileBusy = false;
    });
  }

  // Sign out: the session ends, the device keeps everything it has.
  // Round 7 (Antonio): this used to fire on one tap, which was too easy to
  // hit by accident -- same two-tap arm as Delete account and Reset now.
  const signOutBtn = document.getElementById('signOutBtn');
  if (signOutBtn) {
    let soArmed = false;
    let soArmTimer: ReturnType<typeof setTimeout> | undefined;
    const soDisarm = () => {
      soArmed = false;
      if (soArmTimer) clearTimeout(soArmTimer);
      signOutBtn.classList.remove('armed');
    };
    signOutBtn.addEventListener('click', async () => {
      if (!soArmed) {
        soArmed = true;
        signOutBtn.classList.add('armed');
        soArmTimer = setTimeout(soDisarm, 4000);
        return;
      }
      soDisarm();
      try { await fetch('/api/auth/logout', { method: 'POST' }); } catch (e) { /* cookie dies server-side next visit */ }
      core.acct.email = null;
      // Named lists are an account feature: land back on the main list so the
      // page never strands you on a list you can no longer switch away from.
      const reg = core.loadReg();
      if (reg.active !== 'main' && reg.lists.some((l) => l.id === 'main')) { switchList('main'); return; }
      updateAcctUI();
    });
  }

  // Delete account: two taps, then everything server-side is gone. The
  // device's own list stays, because it is the DJ's device.
  const delAcctBtn = document.getElementById('delAcctBtn');
  if (delAcctBtn) {
    let armed = false;
    let armTimer: ReturnType<typeof setTimeout> | undefined;
    // Round 5, third pass (Antonio): this line only exists at all once
    // Delete account is armed, at rest it's empty and hidden, not a
    // standing warning for something that hasn't happened.
    // Round 7 (Antonio, exact copy supplied): shorter, drops the "this
    // session stays on the device" clause entirely and adds the "!".
    const delFine = document.getElementById('acctDelFine');
    const delFineWarn = 'Esto no se puede deshacer. Tu cuenta y las listas guardadas y sincronizadas se van a borrar.';
    const disarm = () => {
      armed = false;
      if (armTimer) clearTimeout(armTimer);
      delAcctBtn.classList.remove('armed');
      if (delFine) { delFine.hidden = true; delFine.textContent = ''; }
    };
    delAcctBtn.addEventListener('click', async () => {
      if (!armed) {
        armed = true;
        delAcctBtn.classList.add('armed');
        if (delFine) { delFine.hidden = false; delFine.textContent = delFineWarn; }
        armTimer = setTimeout(disarm, 4000);
        return;
      }
      disarm();
      if (acctMsg2) { acctMsg2.textContent = 'Borrando...'; acctMsg2.className = 'acct-msg'; }
      try {
        const res = await fetch('/api/account', { method: 'DELETE' });
        const d = await res.json();
        if (res.ok && d && d.ok) {
          core.acct.email = null;
          try {
            localStorage.removeItem(core.keys.UNLOCK_KEY);
            localStorage.removeItem(core.keys.EMAIL_KEY);
            localStorage.removeItem('SMG_ARTIST');
            localStorage.removeItem(core.keys.DELETED_KEY);
          } catch (e) { /* blocked */ }
          // Deleting the account re-locks the two gated modes, so the control
          // has to say so again.
          core.syncLockedState();
          if (typeof (window as any).gtag === 'function') {
            (window as any).gtag('event', 'account_delete', { placement: 'checklist' });
          }
          const reg = core.loadReg();
          if (reg.active !== 'main' && reg.lists.some((l) => l.id === 'main')) { switchList('main'); return; }
          updateAcctUI();
          if (acctMsg) { acctMsg.textContent = 'Cuenta borrada. De nuestro lado ya no queda nada; la lista de este dispositivo sigue siendo tuya.'; acctMsg.className = 'acct-msg ok'; }
        } else if (acctMsg2) {
          acctMsg2.textContent = 'No se pudo borrar ahora, el problema es de nuestro lado. Intenta de nuevo en un minuto.'; acctMsg2.className = 'acct-msg err';
        }
      } catch (e) {
        if (acctMsg2) { acctMsg2.textContent = 'Sin conexión. Intenta de nuevo cuando tengas señal.'; acctMsg2.className = 'acct-msg err'; }
      }
    });
  }

  // The lists region folds and unfolds (Antonio: save space, especially on
  // phones). Collapsed on every load: after a switch the page reloads, and
  // arriving folded is exactly the calm he asked for.
  {
    const lsHead = document.getElementById('lsHead');
    const lsBody = document.getElementById('lsBody');
    if (lsHead && lsBody) lsHead.addEventListener('click', () => {
      const open = lsBody.hidden;
      lsBody.hidden = !open;
      lsHead.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // New-list controls.
  if (lsNewBtn && lsNewForm) lsNewBtn.addEventListener('click', () => {
    lsNewForm.hidden = false;
    lsNewBtn.hidden = true;
    if (lsNewName) lsNewName.focus();
  });
  if (lsNewForm) lsNewForm.addEventListener('submit', (ev) => {
    ev.preventDefault();
    if (lsNewName) createList(lsNewName.value);
  });

  // Round 11.5 (Antonio, live review): Delete and Move are now two separate,
  // single-purpose toggles instead of one "Delete" button that also revealed
  // the reorder handle ("why is the delete button giving me the option to
  // move? it's a little bit strange"). Mutually exclusive: turning one on
  // turns the other off, so a DJ is never in both a destructive mode and a
  // reorganise mode at once. Each toggle's word label lives in its own
  // .ls-btn-label span now (the button also carries an icon), so the label
  // swap targets that span instead of the whole button's textContent.
  const lsDelBtn = document.getElementById('lsDelBtn');
  const lsMoveBtn = document.getElementById('lsMoveBtn');
  const lsDelLabel = lsDelBtn && lsDelBtn.querySelector('.ls-btn-label');
  const lsMoveLabel = lsMoveBtn && lsMoveBtn.querySelector('.ls-btn-label');
  function setListDeleteMode(on: boolean) {
    if (!listSwitch || !lsDelBtn) return;
    listSwitch.classList.toggle('deleting', on);
    lsDelBtn.classList.toggle('active', on);
    if (lsDelLabel) lsDelLabel.textContent = on ? 'Listo' : 'Borrar';
    if (!on) document.querySelectorAll('.ls-x.armed').forEach((x) => x.classList.remove('armed'));
  }
  function setListMoveMode(on: boolean) {
    if (!listSwitch || !lsMoveBtn) return;
    listSwitch.classList.toggle('moving', on);
    lsMoveBtn.classList.toggle('active', on);
    if (lsMoveLabel) lsMoveLabel.textContent = on ? 'Listo' : 'Administrar';
  }
  if (lsDelBtn && listSwitch) lsDelBtn.addEventListener('click', () => {
    const on = !listSwitch.classList.contains('deleting');
    if (on) setListMoveMode(false); // the two modes never run together
    setListDeleteMode(on);
  });
  if (lsMoveBtn && listSwitch) lsMoveBtn.addEventListener('click', () => {
    const on = !listSwitch.classList.contains('moving');
    if (on) setListDeleteMode(false);
    setListMoveMode(on);
  });

  // The sign-in redirect lands here. ?signedin=1: the session cookie is
  // already set, the /api/auth/me call below turns the row green; one line
  // says so and the param goes away. ?signin=expired: the link was dead or
  // used; open the card so asking again is one tap away.
  {
    const sp = new URLSearchParams(location.search);
    if (sp.get('signedin') === '1') {
      if (acctMsg) { acctMsg.textContent = 'Sesión iniciada. Tus listas te siguen ahora.'; acctMsg.className = 'acct-msg ok'; }
      sp.delete('signedin');
      history.replaceState(null, '', location.pathname + (sp.toString() ? '?' + sp.toString() : '') + location.hash);
    } else if (sp.get('signin')) {
      if (acctCard && acctLine) { acctCard.hidden = false; acctLine.setAttribute('aria-expanded', 'true'); }
      if (acctMsg) { acctMsg.textContent = 'Ese enlace de acceso expiró o ya se usó. Pide uno nuevo aquí abajo.'; acctMsg.className = 'acct-msg err'; }
      sp.delete('signin');
      history.replaceState(null, '', location.pathname + (sp.toString() ? '?' + sp.toString() : '') + location.hash);
    }
  }

  core.modeBtns.forEach((b) => b.addEventListener('click', () => updateListSwitch()));

  // Who is signed in? Asked once per load; offline or on a static test
  // server this fails quietly and the page is exactly what it was before
  // accounts existed.
  (async function initAccount() {
    try {
      // ALREADY ANSWERED? The page probes /api/auth/me itself for the devices
      // that could be signed in, and hands the answer over rather than making
      // this file ask the same question a second time.
      const d = me || await (await fetch('/api/auth/me')).json();
      if (d && d.ok) {
        core.acct.google = d.google || null;
        if (d.email) {
          markSignedIn(d.email, d.artist || null);
          // Round 7: catches the magic-link path, which is a full page
          // reload -- the in-memory pendingMode is gone by now, which is
          // exactly why the pending intent lives in localStorage instead.
          applyPendingModeIfAny();
          return;
        }
      }
    } catch (e) { /* signed out is the default state */ }
    updateAcctUI();
    initGoogle();
  })();
  return {
    // The debounce and the "is anybody signed in" test both live in here, so
    // the page's bumpActive() stays ten lines and a tick costs exactly the same
    // whether this file has loaded or never will.
    schedulePush,
    updateListSwitch,
  };
}
