#!/usr/bin/env python3
"""
THE LOCKUP GENERATOR. Writes src/components/brand-lockup.svg.

WHY THE LOCKUP IS AN IMAGE (Antonio's decision "B", 2026-08-03).
The tagline alignment went through three generations as live text:
  1. letter-spacing solved against painted pixels in headless Chromium:
     measured 0.00px locally, drifted 2px on his Mac, because macOS and
     Linux font engines round glyph advances differently.
  2. flex, one span per letter, space-between: alignment by construction,
     but still rendered by each visitor's font engine, so the last DEVICE
     pixel still wobbled between machines.
  3. this. The letters are converted to vector outlines ONCE, here, and
     every screen in the world rasterises the same paths. His words: "it's
     easy for you to make a perfect pixel match" were wrong for live text
     (the visitor's browser paints it, not us) and exactly right for an
     image. So it became an image.

THE GEOMETRY is SHAPED BY HARFBUZZ, the same engine Chrome uses, so the
glyph positions (including KERNING) are what the browser would have
produced. The first generated version used raw advances without kerning
and Antonio caught it by eye: the SAVE-MY gap came out wider than the
text version had rendered it, because the browser had been kerning the
E-space and space-M pairs all along. Never lay out brand type without
shaping; the font's kern table is part of the design.

Then, all solved in closed form, no iteration, no measurement:
  - Wordmark: "SAVE MY GIG", Archivo variable instanced at wght 900,
    -0.02em tracking, GIG filled brand red, rest off-white.
  - Tagline: "DJ BOOTH INTELLIGENCE", Inter instanced at wght 600, at
    0.3943x the wordmark em (the 8.8px/22.32px ratio the text version
    used). Its glyphs keep their natural advances; a single computed
    extra-gap is added between every adjacent pair so that the FIRST
    glyph's ink starts exactly at the wordmark's ink left and the LAST
    glyph's ink ends exactly at its ink right. Ink, not boxes: the D
    aligns to the S and the E to the G by their painted edges, which is
    the thing Antonio's falcon eyes actually check.
  - The viewBox is trimmed to the ink bbox, so the SVG's own edges ARE the
    lockup's ink edges and CSS sizing is exact by definition.

REGENERATE when the tagline text, the fonts, or the brand colours change:
    python3 scripts/gen-lockup.py
Then commit the SVG. It is deliberately NOT a build step: the output is a
brand asset that changes only when the brand does, and belongs in review.
"""

import io
import re
from pathlib import Path

import uharfbuzz as hb

from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen
from fontTools.misc.transform import Transform

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "components" / "brand-lockup.svg"

WORD = "SAVE MY GIG"
RED_PART = "GIG"          # filled brand red, the accent chosen 2026-08-03
TAG = "DJ BOOTH INTELLIGENCE"

TRACK_WORD = -0.02        # em, the wordmark's tracking, from the CSS it replaces
TAG_SCALE = 8.8 / 22.32   # tagline em / wordmark em, from the text version
GAP_EM = 0.381            # vertical ink gap word-bottom to tag-top, in wordmark em,
                          # measured from the approved text rendering

C_TEXT = "#f3f1ec"
C_RED = "#ff4d2e"
C_DIM = "#9a978f"


def load(path, wght):
    f = TTFont(str(path))
    if "fvar" in f:
        instantiateVariableFont(f, {"wght": wght}, inplace=True)
    return f


def shape(path, wght, text, tracking_em=0.0, upem=None):
    """HarfBuzz positions for `text`: [(char, x_advance_offsetted)], in font units,
    with CSS-style tracking added after every glyph (spaces included).
    The woff2 is DECOMPRESSED to sfnt first: HarfBuzz does not parse woff2,
    and feeding it one fails silently, shaping at the default weight. That
    silent failure shipped a 19% narrower wordmark on the first run of this
    version, caught because the viewBox width printed at the end changed."""
    tf = TTFont(str(path))
    tf.flavor = None
    buf_io = io.BytesIO()
    tf.save(buf_io)
    blob = hb.Blob(buf_io.getvalue())
    face = hb.Face(blob)
    font = hb.Font(face)
    font.set_variations({"wght": wght})
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(font, buf, {"kern": True, "liga": False})
    upm = upem or face.upem
    pos = []
    x = 0.0
    for info, p_ in zip(buf.glyph_infos, buf.glyph_positions):
        ch = text[info.cluster]
        pos.append((ch, x + p_.x_offset))
        x += p_.x_advance + tracking_em * upm
    return pos, upm


def glyph_of(font, ch):
    return font.getBestCmap()[ord(ch)]


def advance(font, ch):
    return font["hmtx"][glyph_of(font, ch)][0]


def ink(font, ch):
    gs = font.getGlyphSet()
    bp = BoundsPen(gs)
    gs[glyph_of(font, ch)].draw(bp)
    return bp.bounds  # None for space


def path_d(font, ch, transform):
    gs = font.getGlyphSet()
    spen = SVGPathPen(gs)
    gs[glyph_of(font, ch)].draw(TransformPen(spen, transform))
    return spen.getCommands()


archivo = load(ROOT / "public" / "fonts" / "archivo-latin-wght-normal.woff2", 900)
inter = load(ROOT / "public" / "fonts" / "inter-latin-wght-normal.woff2", 600)
UPM_A = archivo["head"].unitsPerEm
UPM_I = inter["head"].unitsPerEm

# ---- wordmark layout, in wordmark-em units (1.0 = word font size) ----
sA = 1.0 / UPM_A
shaped_word, _ = shape(ROOT / "public" / "fonts" / "archivo-latin-wght-normal.woff2", 900, WORD, TRACK_WORD, UPM_A)
word_glyphs = [(ch, gx * sA) for ch, gx in shaped_word]

def ink_em(font, ch, s):
    b = ink(font, ch)
    return None if b is None else (b[0] * s, b[1] * s, b[2] * s, b[3] * s)

word_inks = [(ch, gx, ink_em(archivo, ch, sA)) for ch, gx in word_glyphs]
word_left = min(gx + b[0] for ch, gx, b in word_inks if b)
word_right = max(gx + b[2] for ch, gx, b in word_inks if b)
word_top = max(gx and b[3] for ch, gx, b in word_inks if b)   # font units: +y up
word_top = max(b[3] for ch, gx, b in word_inks if b)
word_bottom = min(b[1] for ch, gx, b in word_inks if b)
target_w = word_right - word_left

# ---- tagline layout: natural advances + one solved extra per gap ----
sI = TAG_SCALE / UPM_I
shaped_tag, _ = shape(ROOT / "public" / "fonts" / "inter-latin-wght-normal.woff2", 600, TAG, 0.0, UPM_I)
nat = [(ch, gx * sI) for ch, gx in shaped_tag]
inks = [ink_em(inter, ch, sI) for ch, _ in nat]
first_ink = next(b for b in inks if b)
last_idx = max(i for i, b in enumerate(inks) if b)
last_ink = inks[last_idx]
# shaped natural position of the last glyph, then one solved extra per gap
gaps_before_last = last_idx
natural_last_x = nat[last_idx][1] - nat[0][1]
extra = (target_w - ((-first_ink[0]) + natural_last_x + last_ink[2])) / gaps_before_last
tag_glyphs = []
for i, (ch, gx) in enumerate(nat):
    tag_glyphs.append((ch, (gx - nat[0][1]) - first_ink[0] + i * extra))
tag_top = max(b[3] for b in inks if b)
tag_bottom = min(b[1] for b in inks if b)

# ---- vertical: word ink occupies [0 .. word_top-word_bottom], y flipped ----
# SVG y grows downward. Word baseline at y_wb; tag baseline below.
y_wb = word_top                       # word ink top sits at y=0
word_ink_bottom_y = y_wb - word_bottom
tag_ink_top_y = word_ink_bottom_y + GAP_EM
y_tb = tag_ink_top_y + tag_top        # tag baseline
total_h = y_tb - tag_bottom

# ---- emit ----
def emit(glyphs, font, scale, y_base, x_shift):
    parts = []
    for ch, gx in glyphs:
        if ch == " ":
            continue
        t = Transform(scale, 0, 0, -scale, gx - x_shift, y_base)
        d = path_d(font, ch, t)
        if d:
            parts.append(d)
    return " ".join(parts)

white_glyphs = [(c, gx) for c, gx in word_glyphs[: len(WORD) - len(RED_PART)]]
red_glyphs = [(c, gx) for c, gx in word_glyphs[len(WORD) - len(RED_PART):]]

d_white = emit(white_glyphs, archivo, sA, y_wb, word_left)
d_red = emit(red_glyphs, archivo, sA, y_wb, word_left)
d_tag = emit(tag_glyphs, inter, sI, y_tb, 0.0)

fmt = lambda v: f"{v:.4f}"
svg = (
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {fmt(target_w)} {fmt(total_h)}" '
    f'role="img" aria-label="Save My Gig, DJ Booth Intelligence">'
    f'<path fill="{C_TEXT}" d="{d_white}"/>'
    f'<path fill="{C_RED}" d="{d_red}"/>'
    f'<path fill="{C_DIM}" d="{d_tag}"/>'
    f"</svg>"
)
svg = re.sub(r"(\d+\.\d{2})\d+", r"\1", svg)  # 2dp is sub-thousandth-pixel at render size
OUT.write_text(svg)
print(f"wrote {OUT.relative_to(ROOT)}  viewBox 0 0 {fmt(target_w)} {fmt(total_h)}  ({len(svg)/1024:.1f} KB)")
print(f"aspect ratio (h/w): {total_h/target_w:.6f}")
