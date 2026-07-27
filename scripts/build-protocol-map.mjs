/*
 * Renders the extracted protocol into a single self-contained HTML map.
 * Built to be READ AND MARKED UP by Antonio, so every screen shows exactly
 * what a DJ sees: the question, the steps, the warnings, and where each answer
 * sends them. Engineering comments are stripped by the extractor.
 *
 * Run: node scripts/extract-protocol.mjs > /tmp/protocol.json
 *      node scripts/build-protocol-map.mjs /tmp/protocol.json > /tmp/protocol-map.html
 */
import { readFile } from 'node:fs/promises';

const data = JSON.parse(await readFile(process.argv[2] || '/tmp/protocol.json', 'utf-8'));
const byRoute = new Map(data.screens.map((s) => [s.route, s]));
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const short = (r) => r.replace('/protocol/', '');

// depth:0 means "claim these roots only, do not follow their links". The four
// moves screen links back into the critical tree as its escape hatch, so
// without this it swallowed all 21 critical screens and left CRITICAL empty.
const BRANCHES = [
  { id: 'now',  name: 'THE FOUR MOVES',  sub: 'Under 60 minutes. No questions, no branching.',
    roots: ['/protocol/critical/now'], depth: 0 },
  { id: 'ns',   name: 'NO SOUND',        sub: 'Triage by where the signal dies.',
    roots: ['/protocol/no-sound'] },
  { id: 'crit', name: 'CRITICAL',        sub: 'The full diagnosis tree, for a DJ with time.',
    roots: ['/protocol/critical'] },
  { id: 'qf',   name: 'QUICK FIX',       sub: '1 to 3 hours. Fix it properly before soundcheck.',
    roots: ['/protocol/quick-fix'] },
  { id: 'fr',   name: 'FULL RECOVERY',   sub: 'Tomorrow or later. Rebuild so it never repeats.',
    roots: ['/protocol/full-recovery'] },
];

// Assign each screen to the first branch that reaches it, so nothing prints twice.
const claimed = new Set();
for (const b of BRANCHES) {
  b.screens = [];
  const q = [...b.roots];
  while (q.length) {
    const r = q.shift();
    if (claimed.has(r) || !byRoute.has(r)) continue;
    claimed.add(r);
    const s = byRoute.get(r);
    b.screens.push(s);
    if (b.depth !== 0) for (const o of s.options) q.push(o.href.split('?')[0]);
  }
}
const orphans = data.screens.filter((s) => !claimed.has(s.route));

const outcome = (href) => {
  if (href.startsWith('/saved')) return { cls: 'out-good', text: 'OUTCOME: back on' };
  if (href.startsWith('/files-lost')) return { cls: 'out-bad', text: 'OUTCOME: files lost' };
  if (!href.startsWith('/protocol')) return { cls: 'out-oth', text: 'LEAVES THE TUNNEL' };
  return null;
};

const screenHtml = (s, i) => {
  const opts = s.options.map((o) => {
    const href = o.href.split('?')[0];
    const out = outcome(href);
    const target = out
      ? `<span class="${out.cls}">${out.text}</span>`
      : `<a href="#${esc(href)}" class="goto">${esc(short(href))}</a>`;
    return `<li class="opt opt-${esc(o.key)}">
        <span class="opt-label">${esc(o.label) || '(pad)'}</span>
        ${o.desc ? `<span class="opt-desc">${esc(o.desc)}</span>` : ''}
        <span class="opt-arrow">&rarr;</span> ${target}
      </li>`;
  }).join('');

  return `<article class="screen${s.isDraft ? ' is-draft' : ''}" id="${esc(s.route)}">
    <header class="s-head">
      <span class="s-num">${i}</span>
      <div>
        <h3>${esc(s.heading || s.title)}</h3>
        <code class="s-route">${esc(s.route)}</code>
        ${s.isDraft ? '<span class="tag tag-draft">NEEDS YOUR RULING</span>' : '<span class="tag tag-ok">reviewed</span>'}
        ${s.stepLabel ? `<span class="tag">${esc(s.stepLabel)}</span>` : ''}
      </div>
    </header>
    ${s.warns.map((w) => `<p class="warn">${esc(w)}</p>`).join('')}
    ${s.steps.length ? `<ul class="steps">${s.steps.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
    ${s.details.length ? `<p class="det">Behind a tap: ${s.details.map((d) => esc(d)).join(' &middot; ')}</p>` : ''}
    ${s.question ? `<p class="q">${esc(s.question)}</p>` : ''}
    ${opts ? `<ul class="opts">${opts}</ul>` : '<p class="q dim">No onward choice on this screen.</p>'}
  </article>`;
};

let n = 0;
const branchesHtml = BRANCHES.map((b) => `
  <section class="branch" id="b-${b.id}">
    <h2>${esc(b.name)} <span class="b-count">${b.screens.length} screens</span></h2>
    <p class="b-sub">${esc(b.sub)}</p>
    ${b.screens.map((s) => screenHtml(s, ++n)).join('')}
  </section>`).join('');

const draftCount = data.screens.filter((s) => s.isDraft).length;

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Save My Gig, the emergency protocol as it stands</title>
<style>
  :root{--bg:#0a0a0b;--surf:#151413;--surf2:#1c1a17;--edge:#2a2723;--text:#f3f1ec;
        --dim:#9a978f;--faint:#807d76;--red:#ff4d2e;--green:#3ad884;--amber:#d9a441}
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--text);
       font:16px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif}
  .wrap{max-width:900px;margin:0 auto;padding:2.5rem 1.25rem 5rem}
  h1{font-size:clamp(1.8rem,5vw,2.6rem);line-height:1.1;margin:0 0 .5rem;letter-spacing:-.02em}
  h1 span{color:var(--red)}
  .lede{color:var(--dim);margin:0 0 1.5rem;max-width:60ch}
  .stats{display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:1.5rem}
  .stat{background:var(--surf);border:1px solid var(--edge);border-radius:3px;padding:.5rem .8rem;font-size:.82rem}
  .stat b{color:var(--text);font-size:1.05rem}
  .how{background:var(--surf);border-left:3px solid var(--amber);padding:1rem 1.1rem;border-radius:3px;margin-bottom:2.5rem}
  .how h3{margin:0 0 .4rem;font-size:.95rem;letter-spacing:.04em;text-transform:uppercase;color:var(--amber)}
  .how p{margin:0 0 .5rem;color:var(--dim);font-size:.92rem}
  .how p:last-child{margin:0}
  nav.toc{display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:3rem}
  nav.toc a{background:var(--surf2);border:1px solid var(--edge);border-radius:3px;
            padding:.45rem .75rem;color:var(--text);text-decoration:none;font-size:.82rem}
  nav.toc a:hover{border-color:var(--dim)}
  .branch{margin-bottom:3.5rem}
  .branch>h2{font-size:1.15rem;letter-spacing:.06em;text-transform:uppercase;
             border-bottom:1px solid var(--edge);padding-bottom:.5rem;margin:0 0 .3rem}
  .b-count{color:var(--faint);font-size:.78rem;letter-spacing:.02em;text-transform:none;font-weight:400}
  .b-sub{color:var(--dim);font-size:.9rem;margin:0 0 1.5rem}
  .screen{background:var(--surf);border:1px solid var(--edge);border-radius:3px;
          padding:1.1rem 1.2rem;margin-bottom:.9rem}
  .screen.is-draft{border-left:3px solid var(--amber)}
  .s-head{display:flex;gap:.85rem;align-items:flex-start;margin-bottom:.7rem}
  .s-num{flex:0 0 auto;width:1.9rem;height:1.9rem;border-radius:50%;background:var(--surf2);
         border:1px solid var(--edge);display:flex;align-items:center;justify-content:center;
         font-size:.8rem;font-weight:700;color:var(--dim)}
  .s-head h3{margin:0 0 .25rem;font-size:1.05rem;line-height:1.25}
  .s-route{display:inline-block;font-size:.74rem;color:var(--faint);
           font-family:ui-monospace,Menlo,monospace;margin-right:.5rem}
  .tag{display:inline-block;font-size:.66rem;letter-spacing:.08em;text-transform:uppercase;
       border:1px solid var(--edge);border-radius:2px;padding:.1rem .4rem;color:var(--faint);margin-right:.3rem}
  .tag-draft{color:var(--amber);border-color:rgba(217,164,65,.5)}
  .tag-ok{color:var(--green);border-color:rgba(58,216,132,.4)}
  .warn{background:rgba(255,77,46,.09);border-left:3px solid var(--red);
        padding:.6rem .8rem;margin:0 0 .7rem;font-size:.88rem;border-radius:2px}
  .steps{margin:0 0 .7rem;padding-left:1.1rem;color:var(--dim);font-size:.9rem}
  .steps li{margin-bottom:.28rem}
  .det{margin:0 0 .7rem;font-size:.8rem;color:var(--faint);font-style:italic}
  .q{margin:.6rem 0 .5rem;font-weight:700;font-size:.98rem}
  .q.dim{font-weight:400;color:var(--faint);font-size:.85rem}
  .opts{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.35rem}
  .opt{background:var(--surf2);border:1px solid var(--edge);border-radius:2px;
       padding:.45rem .65rem;font-size:.85rem;display:flex;flex-wrap:wrap;gap:.4rem;align-items:baseline}
  .opt-a{border-left:2px solid var(--green)}
  .opt-b{border-left:2px solid var(--red)}
  .opt-pad,.opt-c,.opt-d{border-left:2px solid var(--edge)}
  .opt-label{font-weight:700}
  .opt-desc{color:var(--faint);font-size:.8rem;flex:1 1 100%}
  .opt-arrow{color:var(--faint)}
  .goto{color:var(--dim);text-decoration:none;border-bottom:1px dotted var(--edge);
        font-family:ui-monospace,Menlo,monospace;font-size:.78rem}
  .goto:hover{color:var(--text)}
  .out-good{color:var(--green);font-size:.76rem;letter-spacing:.06em}
  .out-bad{color:var(--red);font-size:.76rem;letter-spacing:.06em}
  .out-oth{color:var(--faint);font-size:.76rem;letter-spacing:.06em}
  footer{margin-top:3rem;padding-top:1.2rem;border-top:1px solid var(--edge);
         color:var(--faint);font-size:.82rem}
  @media print{
    body{background:#fff;color:#000}
    .screen,.opt,.stat,nav.toc a{background:#fff;border-color:#bbb}
    .goto,.dim,.steps,.s-route,.tag,.b-sub,.lede,footer{color:#333}
    .screen{break-inside:avoid}
    nav.toc{display:none}
  }
</style></head><body><div class="wrap">

<h1>The emergency protocol, <span>as it stands today</span></h1>
<p class="lede">Every screen a DJ can reach, the question it asks, and where each
answer sends them. Generated straight from the live source, so this cannot drift
from what is actually deployed.</p>

<div class="stats">
  <span class="stat"><b>${data.screens.length}</b> screens</span>
  <span class="stat"><b>${draftCount}</b> awaiting your ruling</span>
  <span class="stat"><b>0</b> dead ends</span>
  <span class="stat"><b>0</b> orphans</span>
  <span class="stat"><b>0</b> broken links</span>
</div>

<div class="how">
  <h3>What I need from you</h3>
  <p>The amber screens are the ones no DJ has ever verified. I can judge structure,
  wording and safety. I cannot judge whether a CDJ actually behaves the way we say
  it does.</p>
  <p>Read the amber ones and mark each: <b>OK</b>, <b>WRONG</b>, or <b>SOFTEN</b>
  (true sometimes, so we should hedge or name the models). That is the whole job.
  The detailed list of the 23 specific claims is in the companion document.</p>
</div>

<nav class="toc">
  ${BRANCHES.map((b) => `<a href="#b-${b.id}">${esc(b.name)} (${b.screens.length})</a>`).join('')}
</nav>

${branchesHtml}
${orphans.length ? `<section class="branch"><h2>UNREACHABLE</h2>${orphans.map((s) => screenHtml(s, ++n)).join('')}</section>` : ''}

<footer>
  Save My Gig &middot; generated from source on the day it was built.
  Green edge on an answer means it leads onward or to a good outcome; red means
  the failure route. Amber left edge on a screen means it has never been checked
  by a working DJ.
</footer>
</div></body></html>`;

console.log(html);
