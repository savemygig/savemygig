import { groups as en } from '../src/data/checklist.js';
import { groups as pt } from '../src/data/checklist.pt.js';
import { groups as es } from '../src/data/checklist.es.js';

const diffs = [];
function cmp(name, other) {
  if (other.length !== en.length) diffs.push(`${name}: group count ${other.length} != ${en.length}`);
  en.forEach((g, i) => {
    const o = other[i];
    if (!o) { diffs.push(`${name}: missing group at index ${i} (${g.id})`); return; }
    if (o.id !== g.id) diffs.push(`${name}: group[${i}].id "${o.id}" != "${g.id}"`);
    if (o.icon !== g.icon) diffs.push(`${name}: group[${i}](${g.id}).icon "${o.icon}" != "${g.icon}"`);
    if (('blurbBase' in g) !== ('blurbBase' in o)) diffs.push(`${name}: group[${i}](${g.id}) blurbBase presence mismatch`);
    if (o.items.length !== g.items.length) diffs.push(`${name}: group ${g.id} item count ${o.items.length} != ${g.items.length}`);
    g.items.forEach((it, j) => {
      const oi = o.items[j];
      if (!oi) { diffs.push(`${name}: ${g.id} missing item ${j} (${it.key})`); return; }
      if (oi.key !== it.key) diffs.push(`${name}: ${g.id}[${j}].key "${oi.key}" != "${it.key}"`);
      if (oi.level !== it.level) diffs.push(`${name}: ${g.id}/${it.key}.level "${oi.level}" != "${it.level}"`);
      if (!oi.label || !oi.label.trim()) diffs.push(`${name}: ${g.id}/${it.key} empty label`);
      if (oi.label === it.label) diffs.push(`${name}: ${g.id}/${it.key} label UNTRANSLATED ("${it.label}")`);
    });
    if (o.title === g.title && g.title !== 'Música') diffs.push(`${name}: group ${g.id} title untranslated ("${g.title}")`);
  });
}
cmp('pt', pt); cmp('es', es);

const count = (a) => a.reduce((n, g) => n + g.items.length, 0);
console.log(`groups: en=${en.length} pt=${pt.length} es=${es.length}`);
console.log(`items:  en=${count(en)} pt=${count(pt)} es=${count(es)}`);
const basic = (a) => a.reduce((n, g) => n + g.items.filter(i => i.level === 'basic').length, 0);
console.log(`basic:  en=${basic(en)} pt=${basic(pt)} es=${basic(es)}`);
if (diffs.length) { console.log('FAIL\n' + diffs.join('\n')); process.exit(1); }
console.log('PASS: identical group ids/order, item keys/order, levels, icons.');
