/*
 * THE ONE SCRIPT EVERY BASE PAGE SHARES.
 *
 * WHY THIS FILE EXISTS (2026-08-06, perf batch 8). Six blocks of script were
 * byte-for-byte identical on all 143 Base-layout pages and were re-sent with
 * every single document: the header (drawer, search overlay, footer brand,
 * share copy), the site search itself, the language picker, the back-to-top
 * button, the magic-link device registration and the service worker
 * registration. Measured on the built dist that was 13.0 KB of duplicate
 * source per page, and on the homepage and /faq 19.5 KB, because those two
 * render a second search box and so shipped the 6.5 KB search block twice.
 *
 * None of it was ever cacheable. Inline script is part of the document, so a
 * reader walking five pages downloaded the same code five times, and the
 * service worker precached a copy of it inside each of the 70 routes it
 * installs. Collected here it is ONE content-hashed file: downloaded once for
 * the whole site, revalidated never (the hash is the version), and precached
 * once instead of seventy times.
 *
 * THE RULE THAT MADE THIS SAFE, and it is the rule that killed the email
 * capture form on 2026-08-05: NOTHING IN HERE MAY READ define:vars. define:vars
 * implies is:inline, is:inline ships the block byte for byte with no TypeScript
 * pass, and that is how ten `as HTMLElement` casts reached browsers as a
 * SyntaxError. Every per-page value this file needs arrives on a data attribute
 * instead: data-sw-lang on <html>, data-current on the picker, and the full set
 * Search.astro already put on its own wrapper. Search.astro, TranslationNotice
 * and the nav toggle were written to that pattern before this file existed;
 * this is the same pattern applied to the rest.
 *
 * WHAT DELIBERATELY DID NOT MOVE IN HERE. Every script that ships an element
 * hidden and then reveals it stays inline, because inline runs during parse and
 * a module runs after it: externalizing those would put the reveal after first
 * paint, which is the flash or the layout shift each of them was written to
 * prevent. That is the cookie card (Consent.astro, which also publishes --ck-h
 * for the sticky emergency CTA to stack on), the translation notice, the
 * language undo line, the install cards, the promo slots, the checklist's intro
 * and backup-note hides, and EmailCapture's registered-device branch, which
 * rewrites the form before a registered reader can see the input it removes.
 * The language detection block in Base.astro's head stays inline for a
 * different reason: it runs before <title> and redirects at the root, so it
 * must not wait for a network request. And the tunnel layout keeps its own
 * three small blocks: pulling this 8 KB file into a cold rescue deep link to
 * save 1.2 KB of inline script would make the one page that matters most
 * slower.
 *
 * ORDER. Base.astro loads this where its bundled header script already sat, in
 * the footer, so it still runs BEFORE a page's own module script (module
 * execution follows document order and a page's script is appended after the
 * layout's). The checklist reads SMG_UNLOCKED at init and the magic-link
 * handler below writes it, so that order is load-bearing, not incidental.
 */
/* THE HEADER: drawer, search overlay, footer brand, share copy. Moved out of
   Base.astro unchanged, and it was already a BUNDLED TypeScript block there,
   so it is typed and compiled exactly as before. */
function header() {
  const t = document.getElementById('navToggle');
  const l = document.getElementById('navLinks');
  const scrim = document.getElementById('navScrim');
  if (t && l) {
    // THE SCROLL LOCK IS `overflow: hidden` ON <html> AND NOTHING ELSE.
    // The usual trick, pinning the body with position:fixed and a negative
    // top, CANNOT be used here: the drawer lives inside the header, which is
    // at the top of the document, so pinning the body would drag the open
    // drawer off the top of the screen with it. overflow:hidden moves
    // nothing, which is also why the scroll position needs no arithmetic to
    // survive. It is recorded and re-asserted on close anyway, because an
    // engine that DOES shift while the root is clipped would otherwise put
    // the reader somewhere they did not choose, and that is one line.
    let scrollAt = 0;
    const setOpen = (open: boolean) => {
      l.classList.toggle('open', open);
      t.setAttribute('aria-expanded', open ? 'true' : 'false');
      // The glyph becomes an X in CSS; the label has to say the same thing
      // to anyone using a screen reader, IN THE READER'S LANGUAGE. Both
      // strings ride on the button as data attributes (see the note on the
      // element): this script is bundled and typed, so it cannot take
      // define:vars without shipping TypeScript to the browser.
      t.setAttribute('aria-label', (open ? t.dataset.labelClose : t.dataset.labelOpen) || '');
      if (scrim) scrim.hidden = !open;
      if (open) {
        scrollAt = window.scrollY;
        document.documentElement.classList.add('nav-open');
      } else {
        document.documentElement.classList.remove('nav-open');
        if (window.scrollY !== scrollAt) window.scrollTo(0, scrollAt);
      }
    };
    t.addEventListener('click', () => setOpen(!l.classList.contains('open')));
    // Tapping the darkened page closes it, which is what a scrim is FOR: it
    // is the affordance that tells a reader the layer is dismissible.
    if (scrim) scrim.addEventListener('click', () => setOpen(false));
    // Escape closes it, matching the search overlay. It never did before,
    // which was defensible while the drawer was a panel and is not once it
    // is a modal-looking layer with a backdrop.
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && l.classList.contains('open')) { setOpen(false); t.focus(); }
    });
    // Crossing into desktop width turns the drawer back into a nav row, so
    // an open drawer stops existing and its scroll lock would have nothing
    // left to release it. Rotating a tablet was enough to reach that.
    const wide = window.matchMedia('(min-width: 901px)');
    const onWide = () => { if (wide.matches && l.classList.contains('open')) setOpen(false); };
    if (wide.addEventListener) wide.addEventListener('change', onWide);
    else if ((wide as any).addListener) (wide as any).addListener(onWide);
  }
  const sBtn = document.getElementById('navSearchBtn');
  const sOv = document.getElementById('searchOverlay');
  const sClose = document.getElementById('searchClose');
  if (sBtn && sOv) {
    // THE OVERLAY PROMISES aria-modal AND NOW KEEPS IT (2026-08-06).
    // The panel has declared role="dialog" aria-modal="true" since it was
    // built, and Search.astro added a Tab trap on 2026-08-04, so a KEYBOARD
    // user was held inside. Nobody was holding a screen reader: swiping on
    // iOS VoiceOver, or walking the virtual cursor on NVDA, went straight
    // through the dialog into the header, the whole page and the footer,
    // which is precisely the thing aria-modal tells a reader cannot happen.
    // aria-modal is a claim about the accessibility tree, not about Tab.
    // `inert` is the one primitive that makes the claim true: it removes the
    // subtree from the tab order AND from the accessibility tree AND from
    // hit-testing, in one attribute, in every current browser.
    // The search BUTTON lives inside the header, so the order in
    // closeSearch below is load-bearing: clear inert first, focus second.
    // Focusing an inert element is a no-op, and the return focus is the
    // whole reason the close path exists.
    // The skip link and the back-to-top button are in this list for the same
    // reason as the other three, not as extras: they are page chrome that
    // only sits OUTSIDE header/#main/footer because of where in the DOM it
    // has to live. Left reachable, the accessibility tree still offered a
    // reader a jump into the inert content and a scroll control for a page
    // they cannot read. The cookie card is deliberately NOT here: it is its
    // own dialog, and whether one modal should silence another is a product
    // decision, not an attribute.
    const layers = [
      document.querySelector('.skip-link'),
      document.querySelector('header.site-nav-wrap'),
      document.getElementById('main'),
      document.querySelector('footer.site-footer'),
      document.getElementById('toTop'),
    ].filter(Boolean) as HTMLElement[];
    const openSearch = () => {
      sOv.hidden = false;
      sBtn.setAttribute('aria-expanded', 'true');
      layers.forEach((el) => { el.inert = true; });
      const inp = sOv.querySelector('.srch-input');
      if (inp) (inp as HTMLInputElement).focus();
    };
    const closeSearch = () => {
      sOv.hidden = true;
      layers.forEach((el) => { el.inert = false; });
      sBtn.setAttribute('aria-expanded', 'false');
      sBtn.focus();
    };
    sBtn.addEventListener('click', openSearch);
    if (sClose) sClose.addEventListener('click', closeSearch);
    sOv.addEventListener('click', (e) => { if (e.target === sOv) closeSearch(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !sOv.hidden) closeSearch();
      // "/" opens search, the way every developer tool does it
      const t = e.target as HTMLElement;
      const typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
      if (e.key === '/' && sOv.hidden && !typing) { e.preventDefault(); openSearch(); }
    });
  }

  // Footer brand = back to top (Antonio): tapping the wordmark or the
  // seal pushes you to the beginning of the page, same move as the
  // floating circle. The href="/" stays as the no-JS fallback.
  const footTop = (e: Event) => {
    e.preventDefault();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  };
  document.querySelectorAll('.foot-lockup, .foot-seal').forEach((el) => el.addEventListener('click', footTop));

  const copyBtn = document.getElementById('shareCopy');
  if (copyBtn) {
    let copyTimer;
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(copyBtn.dataset.shareUrl || 'https://www.savemygig.com');
        clearTimeout(copyTimer);
        copyBtn.classList.add('copied');
        copyTimer = setTimeout(() => copyBtn.classList.remove('copied'), 1500);
      } catch (e) { /* ignore */ }
    });
  }
}

/* SITE SEARCH, moved out of Search.astro. Every localized string already rode
   on the wrapper as a data attribute, precisely so two boxes on one page could
   not collide, which is also what makes it movable at all. Running once here
   wires every instance on the page in a single pass; the data-wired guard is
   kept so a page that still renders its own copy cannot double-bind. */
function search() {
  // Runs once per rendered instance; each run wires every instance that is
  // not wired yet, so however many boxes a page has, they all work.
  document.querySelectorAll<HTMLElement>('[data-search]').forEach(function (wrap) {
    if (wrap.dataset.wired) return;
    wrap.dataset.wired = '1';
    var input = wrap.querySelector('.srch-input') as HTMLInputElement;
    var out = wrap.querySelector('.srch-results') as HTMLElement;
    var clear = wrap.querySelector('.srch-clear') as HTMLElement;
    var docs: any[] | null = null, loadP: Promise<void> | null = null, cur = -1;
    // ONE INDEX PER LANGUAGE (2026-08-05). This used to fetch a single flat
    // search-index.json holding all three languages and never filtered it, so
    // an English reader searching "usb" was offered Spanish articles and a
    // Brazilian searching "E-8302" got the English one. The language is fixed
    // at build time by the page that rendered this box, so the filter is the
    // file name and costs nothing at runtime.
    var D = wrap.dataset;
    var INDEX = D.index || '/search-index.en.json';

    // Callers always get a promise that resolves AFTER the index exists.
    // (The old version resolved immediately while a fetch was in flight, so
    // the first keystroke could render nothing and never retry.)
    function load() {
      if (docs) return Promise.resolve();
      if (!loadP) {
        loadP = fetch(INDEX)
          .then(function (r) { return r.json(); })
          .then(function (d) { docs = d; })
          .catch(function () { loadP = null; });
      }
      return loadP;
    }

    function esc(s: string) { return s.replace(/[&<>"]/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' } as Record<string, string>)[c]; }); }

    function mark(text: string, terms: string[]) {
      var s = esc(text);
      terms.forEach(function (t: string) {
        if (t.length < 2) return;
        s = s.replace(new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '<mark>$1</mark>');
      });
      return s;
    }

    function snippet(doc: any, terms: string[]) {
      var b = doc.b || '';
      var i = -1;
      for (var k = 0; k < terms.length && i < 0; k++) i = b.toLowerCase().indexOf(terms[k]);
      if (i < 0) return doc.d || b.slice(0, 120);
      var start = Math.max(0, i - 50);
      return (start ? '…' : '') + b.slice(start, start + 150) + '…';
    }

    function score(doc: any, terms: string[]) {
      var t = (doc.t || '').toLowerCase();
      var h = (doc.h || []).join(' ').toLowerCase();
      var d = (doc.d || '').toLowerCase();
      var b = (doc.b || '').toLowerCase();
      var total = 0;
      for (var i = 0; i < terms.length; i++) {
        var q = terms[i], hit = 0;
        if (t.indexOf(q) >= 0) hit += 12;      // title
        if (h.indexOf(q) >= 0) hit += 8;       // a question on an expandable section
        if (d.indexOf(q) >= 0) hit += 4;       // meta description
        if (b.indexOf(q) >= 0) hit += 2;       // body, including collapsed content
        if (!hit) return 0;                     // every term must appear somewhere
        total += hit;
      }
      return total;
    }

    function render(q: string) {
      var terms = q.toLowerCase().split(/\s+/).filter(Boolean);
      if (!terms.length || !docs) { out.hidden = true; input.removeAttribute('aria-activedescendant'); input.setAttribute('aria-expanded', 'false'); return; }
      var hits = docs.map(function (d: any) { return { d: d, s: score(d, terms) }; })
                     .filter(function (x: any) { return x.s > 0; })
                     .sort(function (a: any, b: any) { return b.s - a.s; })
                     .slice(0, 8);
      cur = -1;
      if (!hits.length) {
        // Localized and language-prefixed. Both links used to be hardcoded
        // "/faq" and "/emergency", so the one moment a reader had already
        // failed to find something was also the moment we dropped them into
        // another language.
        out.innerHTML = '<p class="srch-none">' + esc(D.noneFor) + ' “' + esc(q) +
          '”. ' + esc(D.noneTry) + ' <a href="' + D.faqHref + '">' + esc(D.noneFaq) +
          '</a>, ' + esc(D.noneOr) + ' <a href="' + D.startHref + '">' + esc(D.noneStart) +
          '</a>.</p>';
      } else {
        // Each option gets an id so aria-activedescendant can point at it.
        // Without that, arrow-key navigation moved a visual highlight only:
        // focus never leaves the input, so a screen reader announced nothing
        // as the user walked the list and Enter fired a result they had never
        // been told about. ids are derived from this instance's results id, so
        // the homepage box and the header overlay cannot collide.
        out.innerHTML = hits.map(function (x: any, i: number) {
          return '<a class="srch-hit" role="option" aria-selected="false" id="' +
            out.id + '-opt-' + i + '" href="' + x.d.u + '">' +
            '<span class="srch-hit-t">' + mark(x.d.t, terms) + '</span>' +
            '<span class="srch-hit-d">' + mark(snippet(x.d, terms), terms) + '</span></a>';
        }).join('');
      }
      input.removeAttribute('aria-activedescendant');
      out.hidden = false;
      input.setAttribute('aria-expanded', 'true');
    }

    // THE LONG PLACEHOLDER SWAP IS NOT HERE, and that is deliberate: it is the
    // one part of this component that mutates what is already on screen, so it
    // stayed an inline block in Search.astro. Moving it here would have shown a
    // desktop reader the short placeholder and then replaced it a frame later,
    // which is the flash the markup-ships-short design exists to avoid. It only
    // renders on the two pages that pass shortPlaceholder, so it costs ~250
    // bytes on six documents instead of 13 KB on a hundred and forty three.

    input.addEventListener('focus', load);
    input.addEventListener('input', function () {
      var q = input.value.trim();
      clear.hidden = !q;
      if (!q) { out.hidden = true; input.removeAttribute('aria-activedescendant'); input.setAttribute('aria-expanded', 'false'); return; }
      load().then(function () { render(q); });
    });
    clear.addEventListener('click', function () {
      input.value = ''; clear.hidden = true; out.hidden = true; input.focus();
      input.removeAttribute('aria-activedescendant');
      input.setAttribute('aria-expanded', 'false');
    });
    input.addEventListener('keydown', function (e) {
      var items = out.querySelectorAll('.srch-hit');
      if (e.key === 'Escape') { out.hidden = true; input.removeAttribute('aria-activedescendant'); input.setAttribute('aria-expanded', 'false'); return; }
      if (!items.length) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        cur = e.key === 'ArrowDown' ? Math.min(cur + 1, items.length - 1) : Math.max(cur - 1, 0);
        for (var i = 0; i < items.length; i++) {
          var on = i === cur;
          items[i].classList.toggle('on', on);
          items[i].setAttribute('aria-selected', on ? 'true' : 'false');
        }
        input.setAttribute('aria-activedescendant', items[cur].id);
        items[cur].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter' && cur >= 0) {
        e.preventDefault(); window.location.href = items[cur].getAttribute('href');
      }
    });
    document.addEventListener('click', function (e) {
      if (!wrap.contains(e.target)) { out.hidden = true; input.removeAttribute('aria-activedescendant'); input.setAttribute('aria-expanded', 'false'); }
    });

    // FOCUS TRAP (2026-08-04). When this instance is the one inside the
    // header's search overlay, that overlay declares aria-modal="true" but
    // did nothing to hold focus: Tab walked straight out of the dialog and
    // through the page behind it, which is exactly what aria-modal promises
    // a screen-reader user it will not do. The inline boxes (homepage, /faq)
    // are not in a dialog, so closest() finds nothing and they are untouched.
    // Escape and its focus return live in Base.astro and are left alone.
    var dlg = wrap.closest('[role="dialog"][aria-modal="true"]') as HTMLElement | null;
    if (dlg && !dlg.dataset.trapped) {
      dlg.dataset.trapped = '1';
      var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]),' +
        ' select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
      // Re-queried on every Tab rather than cached once on open, because the
      // result list is built as you type: caching would leave the hits out
      // of the cycle and trap you on the input.
      var tabbable = function () {
        return Array.prototype.filter.call(dlg!.querySelectorAll(FOCUSABLE), function (el: HTMLElement) {
          return !el.hasAttribute('hidden') && el.getClientRects().length > 0;
        });
      };
      // The dialog is only laid out while its wrapper is shown, so a live
      // client rect is the open test; no need to watch the hidden attribute.
      document.addEventListener('keydown', function (e: KeyboardEvent) {
        if (e.key !== 'Tab' || !dlg!.getClientRects().length) return;
        var list = tabbable();
        if (!list.length) return;
        var first = list[0], last = list[list.length - 1], a = document.activeElement;
        if (!dlg!.contains(a)) { e.preventDefault(); (e.shiftKey ? last : first).focus(); return; }
        if (e.shiftKey && a === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && a === last) { e.preventDefault(); first.focus(); }
      }, true);
    }
  });
}

/* THE LANGUAGE PICKER, moved out of LangPicker.astro. CURRENT used to arrive
   through define:vars; it is data-current on #langWrap now. */
function langPicker() {
  const wrap0 = document.getElementById('langWrap');
  const CURRENT = (wrap0 && wrap0.dataset.current) || 'en';
  (function () {
    var wrap = document.getElementById('langWrap');
    var list = document.getElementById('langList');
    if (!wrap || !list) return;
    var sum = wrap.querySelector('.lang-sum');

    function notes() { return wrap.querySelectorAll('.lang-note'); }

    function showList() {
      list.hidden = false;
      notes().forEach(function (n) { n.hidden = true; });
    }

    function showNote(code) {
      var note = document.getElementById('langNote-' + code);
      if (!note) return;
      list.hidden = true;
      notes().forEach(function (n) { n.hidden = n !== note; });
      var back = note.querySelector('[data-back]');
      if (back) back.focus();
    }

    // Always reopen on the list, never on whichever notice was left showing.
    wrap.addEventListener('toggle', function () { if (!wrap.open) showList(); });

    // THE REVIEW DOOR. ?preview=1 turns the held-back languages into working
    // links in this browser only. It is read on every page so Antonio can
    // switch it on once and then browse normally.
    try {
      var q = new URLSearchParams(location.search).get('preview');
      if (q === '1') localStorage.setItem('SMG_PREVIEW', '1');
      else if (q === '0') localStorage.removeItem('SMG_PREVIEW');
    } catch (e) { /* private mode: no preview, which is the safe default */ }
    function preview() {
      try { return localStorage.getItem('SMG_PREVIEW') === '1'; } catch (e) { return false; }
    }

    // Remember the choice, but ONLY a published language. Storing a held-back
    // one would send a reviewer's next bare visit into a language the public
    // cannot see, and the detection script would then have to defend against
    // a value it should never have been given.
    function remember(code, isLive) {
      if (!isLive) return;
      try { localStorage.setItem('SMG_LANG', code); } catch (e) { /* nothing to do */ }
    }

    wrap.addEventListener('click', function (e) {
      var opt = e.target.closest ? e.target.closest('.lang-opt') : null;
      if (opt) {
        var code = opt.getAttribute('data-lang');
        var isLive = opt.getAttribute('data-live') === '1';
        // The language you are already reading: nothing to do but close.
        if (code === CURRENT) {
          e.preventDefault();
          wrap.open = false;
          if (sum) sum.focus();
          return;
        }
        if (isLive) { remember(code, true); return; } // let the anchor navigate
        // Held back. A reviewer goes through; everyone else gets the notice
        // in their own language.
        if (preview()) {
          var href = opt.getAttribute('data-href');
          if (href) { location.href = href; return; }
        }
        showNote(code);
        return;
      }
      if (e.target.closest && e.target.closest('[data-back]')) showList();
    });

    // Click outside and Escape, which native <details> does not give us. Both
    // are desktop behaviours: on a phone this is an inline drawer row and
    // closing it by tapping elsewhere in the menu would be surprising.
    function floating() { return window.matchMedia('(min-width: 901px)').matches; }

    document.addEventListener('click', function (e) {
      if (!wrap.open || !floating()) return;
      if (!wrap.contains(e.target)) wrap.open = false;
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && wrap.open && floating()) {
        wrap.open = false;
        if (sum) sum.focus();
      }
    });
  })();
}

/* BACK TO TOP. */
function backToTop() {
  (function () {
    var btn = document.getElementById('toTop');
    if (!btn) return;
    var shown = false;
    function check() {
      var want = window.scrollY > window.innerHeight * 1.5;
      if (want !== shown) { shown = want; btn.hidden = !want; }
    }
    window.addEventListener('scroll', check, { passive: true });
    check();
    btn.addEventListener('click', function () {
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
  })();
}

/* MAGIC-LINK DEVICE REGISTRATION. */
function magicLink() {
  // Magic-link device registration: the confirmation email's link carries
  // #reg=<encoded email>. Clicking it proved ownership of the address (the
  // token was verified server-side before the redirect), so this device is
  // registered on the spot: same keys the checklist gate and capture forms
  // read. Open the same email on a new phone and tap the same button, and
  // that phone is in. The fragment is stripped immediately: it never
  // reaches server logs, analytics, or the visible URL for more than a
  // moment.
  (function () {
    var m = (location.hash || '').match(/^#reg=([A-Za-z0-9_-]+)/);
    if (!m) return;
    try {
      var b64 = m[1].replace(/-/g, '+').replace(/_/g, '/');
      var email = decodeURIComponent(atob(b64));
      if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        localStorage.setItem('SMG_UNLOCKED', '1');
        localStorage.setItem('SMG_EMAIL', email);
      }
    } catch (e) { /* malformed fragment: ignore */ }
    history.replaceState(null, '', location.pathname + location.search);
  })();
}

/* SERVICE WORKER. The language used to arrive through define:vars; it is
   data-sw-lang on <html> now, written by Base.astro from the registry so the
   mapping of default language to empty string stays in one place. */
function serviceWorker() {
  const swLang = document.documentElement.dataset.swLang || '';
  // Register the service worker so the rescue flow works with no signal.
  // The language rides on the URL: the worker precaches ONE language, the
  // one you installed from, and a different script URL is a different
  // worker, so switching language installs the right offline copy instead
  // of leaving a Brazilian with an English rescue path in a basement.
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker
        .register('/sw.js' + (swLang ? '?lang=' + swLang : ''))
        .catch(function () {});
    });
  }
}

/* THE MAGIC LINK RUNS FIRST, deliberately. It writes SMG_UNLOCKED and
   SMG_EMAIL, and the checklist reads both while it initialises. It used to be
   an inline block at the foot of the body, so it ran during parse and was
   therefore always ahead of every module; here the guarantee is document
   order instead, and this call being first is the other half of it. */
magicLink();
header();
search();
langPicker();
backToTop();
serviceWorker();
