#!/usr/bin/env python3
"""
THE ROUND SEAL. Writes public/images/seal-footer.svg.

WHY IT WAS REBUILT (2026-08-04). The old seal-footer.webp was raster art
carrying the RETIRED tagline, "DJ RESCUE AND PREVENTION", and the retired
exclamation mark, drawn in ink, in the mobile footer of every page. The
pre-press audit pulled it rather than ship the dead brand under the live one.
Antonio, immediately and correctly: "in mobile it is wrong because it lost
the round symbol." Both things are true, so the mark is rebuilt here from the
live brand instead of waiting on a re-export.

WHY THERE IS NO TEXT RING. The first version set "SAVE MY GIG" and the
tagline as outlines on circular arcs (an <img> SVG cannot load the site's
fonts, so live <text> would render in whatever the OS chose, which is not
acceptable for a brand mark). The geometry worked on paper and the glyphs
still landed wrong, and more to the point: this renders at 104 CSS px in the
footer, where a ring of 9px type is grey mush. The old seal had the same
problem, its ring was decoration, not reading matter. So the mark is the
shield in a ring: unmistakable at 104px, unmistakable at 16px, and it cannot
carry a stale tagline because it carries no words at all.

If a lettered seal is wanted for print or merch, that is a design job for a
proper export, not a generated asset.

REGENERATE after any palette or shield change:
    python3 scripts/gen-seal.py
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "images" / "seal-footer.svg"

C_RED, C_BLACK = "#ff4d2e", "#080a09"
R = 100.0
SHIELD_H = 108.0        # shield ink height inside the ring

shield = (ROOT / "public" / "images" / "logo-shield.svg").read_text()
paths = [(f, d) for f, d in re.findall(r'<path fill="(#[0-9a-fA-F]{6})" d="([^"]+)"', shield) if len(d) > 200]
assert paths, "no shield paths found"

# Ink box of logo-shield.svg, the same numbers its own viewBox is trimmed to.
SH_X0, SH_Y0, SH_X1, SH_Y1 = 57.15, 79.42, 752.85, 883.20
sh_w, sh_h = SH_X1 - SH_X0, SH_Y1 - SH_Y0
k = SHIELD_H / sh_h
tx = -(SH_X0 + sh_w / 2) * k
ty = -(SH_Y0 + sh_h / 2) * k

inner = "".join(f'<path fill="{f}" d="{d}"/>' for f, d in paths)
svg = (
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{-R} {-R} {2*R} {2*R}" '
    f'role="img" aria-label="Save My Gig">'
    f'<circle r="{R-2}" fill="{C_BLACK}"/>'
    f'<circle r="{R-2}" fill="none" stroke="{C_RED}" stroke-width="4"/>'
    f'<circle r="{R-12}" fill="none" stroke="{C_RED}" stroke-width="1.2" opacity="0.45"/>'
    f'<g transform="translate({tx:.2f} {ty:.2f}) scale({k:.5f})">{inner}</g>'
    f'</svg>'
)
OUT.write_text(svg)
print(f"wrote {OUT.relative_to(ROOT)}  ({len(svg)/1024:.1f} KB)")
