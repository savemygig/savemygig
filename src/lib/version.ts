// Site version badge, shown small and muted in the footer.
//
// Two independent numbers, on purpose:
//  - MAJOR.MINOR: bumped by hand, only at real, visible milestones (a new
//    feature ships, not every commit). Antonio's own framing: below 1.0
//    means "still being refined," 1.0 means "feature-complete, stable."
//    0.2 marks THIS milestone -- accounts + cross-device sync going live.
//  - BUILD: a plain integer, bumped by +1 every time a real change is
//    pushed to the LIVE site (main), and only then -- never on a local
//    verification build, never on a preview-branch push. This is what
//    Antonio asked for: a number that visibly climbs as real upgrades
//    ship, with zero manual upkeep on his side. Whoever is deploying
//    (Claude, in practice) owns incrementing this by hand as part of the
//    merge-to-main step -- see project memory's pipeline notes.
export const VERSION_MAJOR_MINOR = '0.2';
export const VERSION_BUILD = 1;
export const VERSION_LABEL = `Beta v${VERSION_MAJOR_MINOR} · build ${VERSION_BUILD}`;

// Antonio (2026-07-30): the badge should only exist while the site actually
// IS in beta -- once VERSION_MAJOR_MINOR crosses 1.0, hide it automatically
// rather than needing a second manual step to remove it. Derived from the
// major number, not hardcoded, so bumping to "1.0" later turns this off by
// itself with no separate flag to remember.
export const IS_BETA = parseFloat(VERSION_MAJOR_MINOR) < 1;
