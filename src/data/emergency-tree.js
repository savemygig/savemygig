/*
 * THE EMERGENCY TREE. Single source of truth for the rescue flow.
 *
 * Generated 2026-07-28 by scripts/gen-tree.mjs from the legacy /protocol
 * screens (copy preserved verbatim) + the approved architecture
 * (claude/emergency-architecture-plan-2026-07-28.md in project memory):
 * five doors, time demoted into branches, shared rebuild chain, new frozen
 * door. From now on EDIT THIS FILE, not the generator.
 *
 * Node model: { title, status, red, label?, heading, headingClass?,
 *   blocks: [ {t:'dim'|'assumed'|'note', html} | {t:'check', items[]} |
 *             {t:'alert', emoji, html} | {t:'details', summary, html} ],
 *   question?, step?, neutral?, draft?, moves?,
 *   options: [ {label, to, desc?, tone?, event?, data?} ] }
 * 'to' is a node id (rendered at /protocol/<id>) or an absolute URL.
 * Rendered by src/pages/protocol/[...slug].astro. Integrity is enforced by
 * scripts/check-tree.mjs in the gate: unique ids, resolvable targets, all
 * nodes reachable from a door, every path reaches a terminal, 2-4 options,
 * depth budget, sw.js precache in sync, every option labeled.
 *
 * STANDING DESIGN PRINCIPLE (Antonio, 2026-08-03): NEVER recommend a
 * destructive action (formatting, rebuilding a database, deleting files,
 * firmware updates, factory resets) until every reasonable non-destructive
 * cause has been eliminated. Any step that can permanently destroy user
 * data must be preceded by at least one additional confirmation question
 * designed to rule out common false positives (see music/other-track: one
 * corrupt file must never walk a DJ into erasing a healthy drive), and the
 * destructive screen itself gates behind explicit consent. When editing
 * this tree, trace every route into a format/erase node and name the
 * false positive it has ruled out. If you cannot, add the ruling-out
 * screen first.
 */

export const DOORS = ["usb/start","music/start","sound/start","frozen/start","export/start"];

export const TREE = {
  "music/start": {
    "title": "Can You See Your Playlists?",
    "status": "Critical_Path",
    "red": true,
    "blocks": [
      {
        "t": "dim",
        "html": "That is good news. It rules out the worst case. Now we find out what the player cannot read."
      }
    ],
    "label": "Diagnostic",
    "heading": "The drive is being read",
    "question": "Can you see your playlists on the player?",
    "step": "symptom",
    "options": [
      {
        "label": "NO - MY PLAYLISTS ARE GONE",
        "to": "music/folder",
        "desc": "Gone, empty, or refusing to open: all count. Usually a 15-second fix.",
        // Symptom split, not a choice: neither branch is the safe one.
        "tone": "amber"
      },
      {
        "label": "YES, BUT TRACKS WON'T PLAY",
        "to": "music/other-track",
        "desc": "Error codes, or tracks that refuse to play.",
        // Same split: a symptom answer never earns green.
        "tone": "amber"
      }
    ]
  },
  "music/other-track": {
    "title": "Try Another Track",
    "status": "Critical · Fastest check",
    "red": true,
    "blocks": [
      {
        "t": "dim",
        "html": "One corrupt file and a dying drive look identical from where you stand. Three seconds tells them apart, and it is the difference between playing around one track and rebuilding a healthy drive for nothing."
      },
      {
        "t": "check",
        "items": [
          "Load a <strong>different track</strong>, from a <strong>different playlist</strong>. If it plays, try one more from somewhere else."
        ]
      },
      {
        "t": "note",
        "html": "Every single track refusing on an older deck can also be the file type: many pre-NXS2 players do not read FLAC or ALAC at all. The files are fine; that deck cannot decode them, and no rebuild changes that."
      }
    ],
    "label": "Before anything else",
    "heading": "One file, or the whole drive?",
    "question": "Does that one play?",
    "step": "music_other_track",
    "options": [
      {
        "label": "YES, IT PLAYS",
        "to": "/saved?path=critical&branch=one_track",
        "desc": "It was those files, not your drive. Play around them tonight; if another one fails, come back.",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "critical"
        }
      },
      {
        "label": "NO, NOTHING LOADS",
        "to": "shared/computer",
        "desc": "Then it is the drive or the database, and we fix that."
      }
    ]
  },
  "music/folder": {
    "title": "Play from FOLDER view",
    "status": "Critical · Fastest fix",
    "red": true,
    "blocks": [
      {
        "t": "dim",
        "html": "Missing playlists usually does not mean a broken drive. The player often just cannot read the playlist database, while the music files sit on the stick untouched. FOLDER view ignores the database completely."
      },
      {
        "t": "check",
        "items": [
          "Press <strong>SOURCE</strong> and select your USB.",
          "Switch the browse view to <strong>FOLDER</strong>.",
          "Load a track."
        ]
      },
      {
        "t": "alert",
        "emoji": "💡",
        "html": "You lose cues, grids, playlists, Sync and Quantize. You keep the gig. Fix the database properly tomorrow, not now."
      },
      {
        "t": "note",
        "html": "Works on the other player but not this one? That is the library format split, not a broken drive. <a href=\"/knowledge/pioneer-dj/rekordbox#onelibrary\">What that means</a>, after the gig."
      }
    ],
    "label": "Try this first, 15 seconds",
    "heading": "Your tracks are probably still there",
    "question": "Can you load and play a track this way?",
    "step": "folder_view",
    "options": [
      {
        "label": "YES - TRACKS ARE PLAYING",
        "to": "/saved?path=critical&branch=folder_view",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "critical"
        }
      },
      {
        "label": "NO - STILL NOTHING",
        "to": "shared/computer",
        "desc": "Then we look at the drive itself."
      }
    ]
  },
  "shared/computer": {
    "title": "Do you have a computer?",
    "status": "Critical_Path",
    "red": true,
    "blocks": [
      {
        "t": "dim",
        "html": "Not fix the USB. That comes after the gig."
      }
    ],
    "label": "Decision point",
    "heading": "Goal right now: play a set.",
    "question": "Do you have a computer right now?",
    "step": "critical_fork_computer",
    "options": [
      {
        "label": "YES, I HAVE A COMPUTER",
        "to": "shared/usb-check"
      },
      {
        "label": "NO COMPUTER",
        "to": "usb/booth",
        // Resource NO with a live route: costs options, not the gig.
        "tone": "amber"
      }
    ]
  },
  "shared/usb-check": {
    "title": "USB Check",
    "status": "Critical · Laptop",
    "red": true,
    "blocks": [
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "<strong>If your computer offers to format or initialise the drive, say NO.</strong> On a Mac, do not touch \"Initialize…\": it opens Disk Utility, one step from erasing the drive. Your files are still there. Choose Ignore or Eject."
      }
    ],
    "label": "Diagnostic",
    "heading": "You have a computer",
    "question": "Plug the USB into the computer. What happens?",
    "step": "usb_check",
    "options": [
      {
        "label": "I CAN SEE MY FILES",
        "to": "rebuild/second-usb"
      },
      {
        "label": "NOTHING / ERROR MESSAGE",
        "to": "shared/usb-dead"
      }
    ]
  },
  "shared/usb-dead": {
    "title": "Computer Can't Read USB",
    "status": "Critical · USB Check",
    "red": true,
    "blocks": [
      {
        "t": "dim",
        "html": "Two minutes, in order:"
      },
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "<strong>If it offers to format or initialise the drive, say NO.</strong> Formatting now can wipe out files that are still recoverable."
      },
      {
        "t": "check",
        "items": [
          "Plug <strong>direct</strong>, not through a hub or a dock. Bus-powered hubs drop marginal drives.",
          "Try <strong>another computer</strong> if one is nearby. A phone adapter can prove the drive is alive, but tonight's rebuild needs a computer."
        ]
      }
    ],
    "draft": true,
    "label": "Diagnostic",
    "heading": "The computer can't read it either",
    "headingClass": "danger",
    "question": "Can any device see the USB now?",
    "step": "usb_dead_check",
    "options": [
      {
        "label": "YES - FILES ARE VISIBLE NOW",
        "to": "rebuild/second-usb"
      },
      {
        "label": "NO - THE USB IS DEAD",
        "to": "shared/survival",
        "desc": "We get you playing another way. File recovery comes after the gig."
      }
    ]
  },
  "usb/booth": {
    "title": "No Computer - Player Checks",
    "status": "Critical · No Laptop",
    "red": true,
    "blocks": [
      {
        "t": "assumed",
        "html": "Reseating it, the other slot, the other player and your own spare are all assumed done. These are the ones that get skipped."
      },
      {
        "t": "check",
        "items": [
          "<strong>PRO DJ LINK.</strong> If the booth is linked, browse and load from a drive sitting in another player. Your dead drive stops mattering.",
          "<strong>Give it thirty seconds.</strong> A large library mounts slowly and looks dead while it does. Most drives get pulled before they finish.",
          "<strong>FOLDER view</strong>, if you have not already tried it. When the drive appears but your playlists do not, the database died and the audio did not. Browse by folder and play."
        ]
      },
      {
        "t": "note",
        "html": "Old players are picky about new drives: a fast USB 3.1/3.2 stick or a very large drive can be refused by an older CDJ that reads a plain stick fine. Your drive may not be dead at all, which is exactly why borrowing works."
      }
    ],
    "draft": true,
    "label": "Step 1 of 2",
    "heading": "Work the booth",
    "question": "Can you load and play a track on any player now?",
    "step": "no_laptop_1",
    "options": [
      {
        "label": "YES, IT IS READING",
        "to": "/saved?path=critical&branch=no_laptop",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "critical"
        }
      },
      {
        "label": "NO, STILL NOTHING",
        "to": "usb/restart"
      }
    ]
  },
  "usb/restart": {
    "title": "No Computer - Restart Player",
    "status": "Critical · No Laptop",
    "red": true,
    "blocks": [
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "<strong>Only if nobody is playing on this player right now.</strong> If another DJ is on, leave it alone: answer NO below and keep moving."
      },
      {
        "t": "check",
        "items": [
          "Remove your USB first, press <span class=\"mono\">USB STOP</span>, wait for the light to stop blinking.",
          "Power the player off. Wait 20 seconds.",
          "Power back on, let it fully boot.",
          "Insert the USB and wait, some drives take 30+ seconds to mount."
        ]
      }
    ],
    "draft": true,
    "label": "Step 2 of 2",
    "heading": "Restart the player",
    "question": "Does the player read the USB now?",
    "step": "no_laptop_2",
    "options": [
      {
        "label": "YES, IT IS READING",
        "to": "/saved?path=critical&branch=no_laptop",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "critical"
        }
      },
      {
        "label": "NO, STILL DEAD",
        "to": "shared/survival"
      }
    ]
  },
  "shared/survival": {
    "title": "Survival Mode",
    "status": "Critical · Survival",
    "red": true,
    "blocks": [
      {
        "t": "dim",
        "html": "Stop troubleshooting. Just get sound out of the speakers when it is your turn."
      },
      {
        "t": "check",
        "items": [
          "<strong>Ask the DJ before or after you.</strong> Their drive is a rekordbox export like yours, so it will read. This has happened to all of them.",
          "<strong>Check for a booth laptop.</strong> Your USB may still read on a computer even if players refuse it.",
          "<strong>Swap slots</strong> with the next DJ and use the extra time."
        ]
      },
      {
        "t": "details",
        "summary": "If there is no drive anywhere",
        "html": "<p> A phone into a spare channel keeps the room from going silent. Be clear with yourself about what it is: not your set continuing, the room not stopping. It only works if you already carry a USB-C to 3.5mm adapter and a 3.5mm to twin RCA cable. </p>"
      }
    ],
    "draft": true,
    "label": "Survival mode",
    "heading": "Survival mode: play without your USB",
    "question": "Did you find a way to play?",
    "step": "survival",
    "options": [
      {
        "label": "YES, I AM PLAYING",
        "to": "/saved?path=critical&branch=survival",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "critical"
        }
      },
      {
        "label": "NO, NOTHING WORKED",
        "to": "/files-lost?path=critical&branch=survival",
        "event": "outcome_reached",
        "data": {
          "outcome": "lost",
          "path": "critical"
        }
      }
    ]
  },
  "rebuild/risk": {
    "title": "One Drive, One Decision",
    "status": "Critical · Laptop",
    "red": true,
    "blocks": [
      {
        "t": "dim",
        "html": "The full rebuild takes 15 minutes or more. On in five? Borrow a drive first, rebuild after."
      },
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "<strong>You will erase this drive.</strong> Anything that does not copy off cleanly first is gone until you can work on it properly at home."
      }
    ],
    "label": "Decision point",
    "heading": "One drive, one decision",
    "question": "Are you willing to temporarily copy your files to this computer and erase your USB so you can play?",
    "step": "risk_consent",
    "options": [
      {
        "label": "YES - COPY, THEN ERASE THIS DRIVE",
        "to": "rebuild/copy",
        // Consenting to an irreversible erase is never green. The card above
        // says this cannot be undone, so the pad cannot say "safe". Amber is
        // the honest reading: it costs you, and you have chosen it.
        "tone": "amber"
      },
      {
        "label": "NO - DO NOT ERASE THIS DRIVE",
        "to": "rebuild/no-erase",
        // Declining destruction is caution, never the red answer.
        "tone": "amber"
      }
    ]
  },
  "rebuild/second-usb": {
    "title": "Second USB?",
    "status": "Critical · Laptop",
    "red": true,
    "blocks": [
      {
        "t": "dim",
        "html": "Your files are readable, so the fast, safe route comes first. With a second drive, your original never gets touched tonight."
      },
      {
        "t": "note",
        "html": "This computer has rekordbox with <strong>your</strong> library on it? Take the <a href=\"/protocol/export/backup\">export rescue</a> instead: a fresh export keeps your cues and playlists, a raw file copy does not."
      }
    ],
    "label": "The fast route first",
    "heading": "FILES ARE VISIBLE",
    "headingClass": "accent",
    "question": "Do you have another USB you can use right now?",
    "step": "second_usb",
    "options": [
      {
        "label": "YES - I HAVE ANOTHER USB",
        "to": "rebuild/second-format",
        "desc": "We build tonight on that one. Your original stays untouched."
      },
      {
        "label": "NO - I ONLY HAVE THIS ONE",
        "to": "rebuild/risk",
        "desc": "Then there is one decision to make first.",
        // Resource NO with a live route: costs options, not the gig. Same
        // shape as shared/computer NO, so the same colour.
        "tone": "amber"
      }
    ]
  },
  "rebuild/second-format": {
    "title": "Format the Second USB",
    "status": "Critical · Second USB",
    "red": true,
    "blocks": [
      {
        "t": "dim",
        "html": "Tonight gets built on the second drive. Whatever state your first one is in, nothing more happens to it from here."
      },
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "<strong>This erases everything on the SECOND drive. If you borrowed it, stop and check with the owner first.</strong> Someone else's library is not expendable, and they may not know you are about to format it."
      },
      {
        "t": "check",
        "items": [
          "On Windows: the built-in dialog only offers FAT32 up to 32GB. A bigger stick needs the free <strong>guiformat</strong> tool.",
          "Plug the <strong>second</strong> USB into the computer.",
          "Right-click → <strong>Format</strong> (or Disk Utility on Mac).",
          "Format: <span class=\"mono\">FAT32</span> · Scheme: <span class=\"mono\">MBR</span> · Quick format: OK"
        ]
      }
    ],
    "draft": true,
    "label": "Step 1 of 2",
    "heading": "Format the second USB",
    "question": "Is the second USB formatted?",
    "step": "second_usb_format",
    "options": [
      // All three carry an explicit tone. With more than two options the
      // renderer falls back to neutral, and this screen is too consequential
      // to say nothing with colour.
      {
        "label": "YES - FORMATTED",
        "to": "rebuild/second-copy",
        // Green: the drive is ready and the fast route is open.
        "tone": "green"
      },
      {
        "label": "NO - CAN'T FORMAT IT",
        "to": "shared/survival",
        "desc": "Survival mode: other ways to play tonight.",
        // Declining or failing to destroy is caution, never red. It costs
        // you the fast route, not the gig.
        "tone": "amber"
      },
      {
        "label": "I CANNOT ERASE THIS DRIVE",
        "to": "shared/survival",
        "desc": "Borrowed, or the owner said no. That is the right call, and there are other ways to play tonight.",
        // The alert above tells a DJ to check with the owner. Until now the
        // only way to act on that answer was to claim a technical failure
        // that never happened. Honouring someone else's library is caution.
        "tone": "amber"
      }
    ]
  },
  "rebuild/second-copy": {
    "title": "Copy Tracks to Second USB",
    "status": "Critical · Second USB",
    "red": true,
    "blocks": [
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "<strong>Do not remove either USB while copying.</strong>"
      },
      {
        "t": "check",
        "items": [
          "Copy <strong>only the tracks you need tonight</strong> to the second drive: from the folder you already made on the computer, or straight off your original USB if it still reads.",
          "Use Search, artist name or date added, to find them fast.",
          "If a file stalls, skip it and keep going. Whatever lands is your set.",
          "Eject both drives safely when done."
        ]
      }
    ],
    "draft": true,
    "label": "Step 2 of 2",
    "heading": "Copy tonight's tracks across",
    "question": "Are tonight's tracks on the second USB?",
    "step": "second_usb_copy",
    "options": [
      {
        "label": "YES - LOAD IT ON THE PLAYER",
        "to": "rebuild/load"
      },
      {
        "label": "NO - COPY KEEPS FAILING",
        "to": "shared/survival",
        "desc": "The original will not give the files up tonight. Other ways to play."
      }
    ]
  },
  "rebuild/no-erase": {
    "title": "Find Another USB",
    "status": "Critical · Safe Route",
    "red": true,
    "blocks": [
      {
        "t": "dim",
        "html": "Tonight now runs from a different stick. Whatever state your original drive is in, nothing more happens to it here: it gets looked at properly after the gig, on a computer, with time."
      },
      {
        "t": "check",
        "items": [
          "Ask the other DJs, the promoter, the bar. Someone has a USB.",
          "Even a small one works. You only need tonight's set."
        ]
      }
    ],
    "draft": true,
    "label": "Safe route",
    "heading": "We need any other USB for tonight.",
    "question": "Did you find another USB drive?",
    "step": "no_erase",
    "options": [
      {
        "label": "YES, GOT ONE",
        "to": "rebuild/second-format"
      },
      {
        "label": "NO - NO OTHER USB HERE",
        "to": "shared/survival",
        "desc": "Survival mode: other ways to play tonight."
      }
    ]
  },
  "rebuild/copy": {
    "title": "Step 1 - Copy Files",
    "status": "Critical · Recovery",
    "red": true,
    "blocks": [
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "<strong>Do not remove the USB while copying.</strong> Interrupting this step may cause data loss."
      },
      {
        "t": "check",
        "items": [
          "Create a new folder on the desktop.",
          "Copy <strong>only the essential tracks</strong> you need to play.",
          "Open the USB → use <strong>Search</strong>. Search by artist name or date added.",
          "If a file stalls, skip it and keep going. Whatever lands is your set."
        ]
      }
    ],
    "label": "Step 1 of 5",
    "heading": "Copy your files to this computer",
    "question": "Have you copied enough tracks to play your set?",
    "step": "copy_files",
    "options": [
      {
        "label": "YES, COPIED",
        "to": "rebuild/erase"
      },
      {
        "label": "NO, COPY KEEPS FAILING",
        "to": "shared/survival",
        "desc": "This drive will not give the files up tonight. We get you playing another way; recovery comes after the gig."
      }
    ]
  },
  "rebuild/erase": {
    "title": "Step 2 - Prepare the USB",
    "status": "Critical · Recovery",
    "red": true,
    "blocks": [
      {
        "t": "dim",
        "html": "Tonight's tracks are safe on the computer. Everything else on this stick dies in the next step."
      },
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "<strong>The next step will ERASE your USB.</strong> This is irreversible. Only the tracks you copied to the computer will remain."
      }
    ],
    "label": "Step 2 of 5",
    "heading": "Prepare the USB",
    "question": "Are you ready to erase the USB and continue?",
    "step": "erase_consent",
    "options": [
      {
        "label": "YES - ERASE AND CONTINUE",
        "to": "rebuild/format",
        // Same as rebuild/risk: green on the pad that erases the drive told
        // a DJ pattern-matching on colour that this was the safe answer.
        // Amber: it costs you, and you have chosen it.
        "tone": "amber"
      },
      {
        "label": "NO - STOP HERE",
        "to": "rebuild/no-erase",
        // Same: stopping before an erase is legitimate, not failure.
        "tone": "amber"
      }
    ]
  },
  "rebuild/format": {
    "title": "Step 3 - Format the USB",
    "status": "Critical · Recovery",
    "red": true,
    "blocks": [
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "<strong>This erases the drive completely.</strong> It is the one exception to the never-format rule, and it is safe only because tonight's tracks are now on the computer. Confirm the disk name and size before you touch anything, formatting the wrong disk is unrecoverable."
      },
      {
        "t": "check",
        "items": [
          "Right-click the USB drive → <strong>Format</strong> (or Disk Utility on Mac).",
          "Windows only offers FAT32 up to 32GB in that dialog. Bigger stick: use the free <strong>guiformat</strong> tool, two minutes.",
          "Format: <span class=\"mono\">FAT32</span>, not exFAT, not NTFS. Older CDJs refuse exFAT.",
          "Name: <span class=\"mono\">SAVEMYGIG</span> (or anything you like)",
          "Quick format: OK",
          "Scheme: <span class=\"mono\">Master Boot Record (MBR)</span>"
        ]
      },
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "<strong>Do not remove the USB during formatting.</strong>"
      }
    ],
    "label": "Step 3 of 5",
    "heading": "USB format",
    "question": "Has the USB been successfully formatted?",
    "step": "format",
    "options": [
      {
        "label": "YES - USB IS FORMATTED",
        "to": "rebuild/copy-back"
      },
      {
        "label": "NO - THE FORMAT FAILS",
        "to": "rebuild/no-erase",
        "desc": "The drive is done, and it no longer matters: your set is on the computer. Any other stick finishes the job."
      }
    ]
  },
  "rebuild/copy-back": {
    "title": "Step 4 - Copy Music Back",
    "status": "Critical · Recovery",
    "red": true,
    "blocks": [
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "<strong>Do not remove the USB while copying.</strong> Interrupting this step may cause data loss."
      },
      {
        "t": "dim",
        "html": "Only what you need to play tonight."
      }
    ],
    "label": "Step 4 of 5",
    "heading": "Copy music back to the USB",
    "question": "Are the tracks now on the USB?",
    "step": "copy_back",
    "options": [
      {
        "label": "YES - TRACKS ARE ON USB",
        "to": "rebuild/load"
      },
      {
        "label": "NO - COPY KEEPS FAILING",
        "to": "rebuild/fallback"
      }
    ]
  },
  "rebuild/load": {
    "title": "Step 5 - Load on the Player",
    "status": "Critical · Recovery",
    "red": true,
    "blocks": [
      {
        "t": "check",
        "items": [
          "On the CDJ/XDJ, press <span class=\"mono\">SOURCE</span>",
          "Select <span class=\"mono\">USB</span>",
          "Go to <span class=\"mono\">FOLDER</span>",
          "Load tracks from the folder you copied."
        ]
      },
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "These tracks were <strong>not exported via rekordbox</strong>, so some features may be limited (Quantize, Sync, Hot Cues). This is normal. <strong>You can still play your set.</strong>"
      }
    ],
    "label": "Step 5 of 5",
    "heading": "Load music on the player",
    "question": "Can you load and play the tracks on the CDJ?",
    "step": "load",
    "options": [
      {
        "label": "YES - I AM PLAYING",
        "to": "/saved?path=critical&branch=laptop",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "critical"
        }
      },
      {
        "label": "NO - STILL NOT PLAYING",
        "to": "rebuild/fallback"
      }
    ]
  },
  "rebuild/fallback": {
    "title": "Last Options",
    "status": "Critical · Fallback",
    "red": true,
    "blocks": [
      {
        "t": "check",
        "items": [
          "<strong>Re-do the format once</strong>, choosing <span class=\"mono\">FAT32</span> explicitly (not exFAT) and <span class=\"mono\">MBR</span>. A GPT drive is a common cause of \"formatted but unreadable\"."
        ]
      }
    ],
    "draft": true,
    "label": "Fallback",
    "heading": "One thing left before survival mode",
    "question": "Is it reading now?",
    "step": "fallback",
    "options": [
      {
        "label": "YES - IT IS READING",
        "to": "/saved?path=critical&branch=fallback",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "critical"
        }
      },
      {
        "label": "NO - SURVIVAL MODE",
        "to": "shared/survival"
      }
    ]
  },
  "sound/start": {
    "title": "No Sound",
    "status": "No_Sound",
    "red": true,
    "blocks": [
      {
        "t": "dim",
        "html": "Nothing is broken on your drive. Something is not passing the signal."
      }
    ],
    "heading": "Your music is fine. This is routing.",
    "question": "Where is the sound missing?",
    "step": "ns_entry",
    // SEVERITY, NOT SYMMETRY (Antonio, 2026-08-03). These four were all grey,
    // which said the four are equally bad. They are not: exactly one of them
    // means the room is silent. Red is reserved for that one.
    "options": [
      {
        "label": "ONE CHANNEL, OTHERS FINE",
        "to": "sound/channel",
        "desc": "One deck silent, the rest of the mixer alive.",
        // You still have a working deck to mix on.
        "tone": "amber"
      },
      {
        "label": "EVERYTHING IS SILENT",
        "to": "sound/master",
        "desc": "Nothing from the mixer at all.",
        // The only one where the room has no music. This is the red level.
        "tone": "red"
      },
      {
        "label": "NO CUE IN MY HEADPHONES",
        "to": "sound/phones",
        "desc": "The room is fine, you just cannot pre-listen.",
        // Green under the time-pressure rule, not amber. Its own description
        // says the room is fine. The crowd cannot tell, nothing is at risk,
        // and the DJ can fix this between tracks. Colouring it amber would
        // have told a DJ to hurry over something nobody else can hear.
        "tone": "green"
      },
      {
        "label": "SOUND IS THERE BUT WRONG",
        "to": "sound/thin",
        "desc": "Thin, quiet, distorted or one-sided.",
        "tone": "amber"
      }
    ]
  },
  // sound/thin facts are AlphaTheta's own, already sourced for the Dictionary
  // EQ trio (2026-08-02): -26 dB EQ-mode floor and EQ CURVE isolator mode from
  // the DJM-900NXS2 operating instructions; the separate 3-band master
  // isolator from the DJM-V10 specifications; booth EQ as monitor-path-only
  // from the same manuals.
  "sound/thin": {
    "title": "Zero the Strip",
    "status": "No_Sound · Quality",
    "red": true,
    "blocks": [
      {
        "t": "dim",
        "html": "Thin, no bass, no punch? That is almost always the last DJ's settings still in the desk, not a fault. Five seconds."
      },
      {
        "t": "check",
        "items": [
          "Sweep the channel <strong>EQ</strong> knobs to 12 o'clock. Full left is not off, but it is close: the DJM-900NXS2 cuts to -26 dB in EQ mode.",
          "Find the <strong>isolator</strong> and set it flat. On the 900NXS2 it is the EQ CURVE switch; the V10 has a separate 3-band master isolator.",
          "Thin in the booth but fine on the floor? That is <strong>booth EQ</strong>, a second EQ on the monitor path only. The room never heard a problem."
        ]
      }
    ],
    "label": "The five second fix",
    "heading": "Someone else's EQ is still in the desk",
    "question": "Full and clean now?",
    "step": "ns_thin",
    "options": [
      {
        "label": "YES, SOUNDS RIGHT",
        "to": "/saved?path=no_sound&branch=thin",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "no_sound"
        }
      },
      {
        "label": "NO, STILL WRONG",
        "to": "sound/wrong",
        "desc": "Then we chase it: jacks, trim, cable."
      }
    ]
  },
  "sound/channel": {
    "title": "Silent Channel",
    "status": "No_Sound · Channel",
    "red": true,
    "blocks": [
      {
        "t": "check",
        "items": [
          "Move the crossfader fully away from your channel, then back.",
          "Find the crossfader <strong>ASSIGN</strong> for that channel (A / B / THRU). Set it to <strong>THRU</strong>."
        ]
      },
      {
        "t": "note",
        "html": "No ASSIGN switch anywhere? Some mixers have no crossfader at all (DJM-V10-LF, DJM-V5, rotary mixers). On those every channel already behaves as THRU, so this is not your problem. Keep going."
      }
    ],
    "label": "Check this first",
    "heading": "Check the crossfader",
    "question": "Is the sound back?",
    "step": "ns_channel",
    "options": [
      {
        "label": "YES, IT PLAYS",
        "to": "/saved?path=no_sound&branch=crossfader",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "no_sound"
        }
      },
      {
        "label": "NO, STILL SILENT",
        "to": "sound/channel-2"
      }
    ]
  },
  "sound/channel-2": {
    "title": "Channel Strip",
    "status": "No_Sound · Channel",
    "red": true,
    "blocks": [
      {
        "t": "assumed",
        "html": "Fader up is assumed. Nobody reaches step two of a dead channel with the fader down."
      },
      {
        "t": "check",
        "items": [
          "<strong>TRIM / GAIN</strong> to 12 o'clock.",
          "<strong>COLOR FX off, FILTER knob to 12 o'clock.</strong> A filter swept to either end by the last DJ silences a channel with everything else looking right."
        ]
      }
    ],
    "label": "Top to bottom",
    "heading": "Walk the channel strip",
    "question": "Sound now?",
    "step": "ns_channel2",
    "options": [
      {
        "label": "YES, IT PLAYS",
        "to": "/saved?path=no_sound&branch=channel_strip",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "no_sound"
        }
      },
      {
        "label": "NO, STILL SILENT",
        "to": "sound/channel-3"
      }
    ]
  },
  "sound/channel-3": {
    "title": "Input Source",
    "status": "No_Sound · Channel",
    "red": true,
    "blocks": [
      {
        "t": "check",
        "items": [
          "Find the <strong>source selector</strong> at the top of the channel strip (USB / DIGITAL / LINE / PHONO).",
          "Set it to where your music actually comes from.",
          "Still nothing? Move your source to a working channel and play from there."
        ]
      }
    ],
    "label": "The input",
    "heading": "Check the input source",
    "question": "Are you playing on any channel now?",
    "step": "ns_channel3",
    "options": [
      {
        "label": "YES, I AM ON",
        "to": "/saved?path=no_sound&branch=source",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "no_sound"
        }
      },
      {
        "label": "NO, STILL NOTHING",
        "to": "sound/fallback"
      }
    ]
  },
  "sound/master": {
    "title": "Nothing At All",
    "status": "No_Sound · Master",
    "red": true,
    "blocks": [
      {
        "t": "check",
        "items": [
          "Raise <strong>MASTER</strong> to 12 o'clock. Raise <strong>BOOTH</strong> too.",
          "Check nothing is muted, and nothing is plugged into the <strong>master insert</strong>."
        ]
      },
      {
        "t": "details",
        "summary": "What is the master insert",
        "html": "<p> A patch point on the back of the mixer where an outboard processor sits in the master signal. If a cable is plugged in and nothing sends audio back, the master goes silent with every fader up. If something is patched in, it is almost certainly the venue's: ask before you pull it. <br /><br /> Words for the tech: <strong>\"There's something patched into the master insert. Is that live, or is it dead gear I can pull?\"</strong> </p>"
      }
    ],
    "label": "The master",
    "heading": "Check the master",
    "question": "Sound in the room?",
    "step": "ns_master",
    "options": [
      {
        "label": "YES, IT PLAYS",
        "to": "/saved?path=no_sound&branch=master",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "no_sound"
        }
      },
      {
        "label": "NO, STILL SILENT",
        "to": "sound/master-2"
      }
    ]
  },
  "sound/master-2": {
    "title": "Follow The Cable",
    "status": "No_Sound · Master",
    "red": true,
    "blocks": [
      {
        "t": "check",
        "items": [
          "<strong>Master fader down before you touch a connector.</strong> Back up after. Hot-plugging into a live PA sends a full-level thump through it and can kill drivers.",
          "Reseat the master output cables, both ends.",
          "Swap the master pair for the <strong>booth output</strong> pair if the plugs fit (booth out is a 1/4 inch jack pair on most DJMs, so XLR house cables need adapters).",
          "Amps powered? In most venues the rack is not in the booth, so this is usually a question for someone else, not a thing you check."
        ]
      },
      {
        "t": "details",
        "summary": "Words for whoever runs the room",
        "html": "<p> <strong>\"My master is up and the meters are moving. Can someone confirm the amps are powered?\"</strong> <br /><br /> Naming the meters matters. It is the difference between a request they have to investigate and one they can answer immediately. </p>"
      }
    ],
    "label": "Out of the mixer",
    "heading": "Follow the cable out",
    "question": "Sound now?",
    "step": "ns_master2",
    "options": [
      {
        "label": "YES, IT PLAYS",
        "to": "/saved?path=no_sound&branch=cable",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "no_sound"
        }
      },
      {
        "label": "NO, STILL SILENT",
        "to": "sound/house"
      }
    ]
  },
  "sound/house": {
    "title": "Get The House Tech",
    "status": "No_Sound · House",
    "red": true,
    "blocks": [
      {
        "t": "check",
        "items": [
          "This is the venue's signal chain now, not your gear.",
          "Tell them exactly: <strong>\"Mixer master is up, master meters are moving. Nothing after the booth output.\"</strong>",
          "While they work: keep your set cued and ready to go."
        ]
      },
      {
        "t": "assumed",
        "html": "If you are the tech reading this: the DJ has already been through channel, crossfader assign, source select, trim, master level, master insert and the output cables at the mixer end. The mixer is passing signal."
      },
      {
        "t": "note",
        "html": "A silent room from the house side is not your failure. Stay ready."
      }
    ],
    "label": "Not your gear",
    "heading": "Get the house tech",
    "question": "Did the house bring it back?",
    "step": "ns_house",
    "options": [
      {
        "label": "YES, I AM ON",
        "to": "/saved?path=no_sound&branch=house",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "no_sound"
        }
      },
      {
        "label": "NO, STILL NOTHING",
        "to": "sound/fallback"
      }
    ]
  },
  "sound/phones": {
    "title": "No Cue In Headphones",
    "status": "No_Sound · Headphones",
    "red": true,
    "blocks": [
      {
        "t": "assumed",
        "html": "CUE is lit. That is how you found this."
      },
      {
        "t": "check",
        "items": [
          "Headphone <strong>MIX</strong> knob fully to CUE, not to MASTER.",
          "Headphone <strong>LEVEL</strong> up halfway."
        ]
      }
    ],
    "label": "Cue first",
    "heading": "Check the cue, not the jack",
    "question": "Hearing it now?",
    "step": "ns_phones",
    "options": [
      {
        "label": "YES, I HEAR IT",
        "to": "/saved?path=no_sound&branch=cue",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "no_sound"
        }
      },
      {
        "label": "NO, STILL NOTHING",
        "to": "sound/phones-2"
      }
    ]
  },
  "sound/phones-2": {
    "title": "Headphone Jack",
    "status": "No_Sound · Headphones",
    "red": true,
    "blocks": [
      {
        "t": "check",
        "items": [
          "Push the plug in firmly. Half-inserted is the classic.",
          "Try the other headphone socket if the mixer has more than one.",
          "Screw the adapter down fully, or try someone else's headphones."
        ]
      },
      {
        "t": "note",
        "html": "You can mix without cue if you have to. Long blends, tracks you know."
      }
    ],
    "label": "Now the jack",
    "heading": "Now the jack",
    "question": "Hearing it now?",
    "step": "ns_phones2",
    "options": [
      {
        "label": "YES, I HEAR IT",
        "to": "/saved?path=no_sound&branch=jack",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "no_sound"
        }
      },
      {
        "label": "NO, STILL NOTHING",
        "to": "sound/fallback"
      }
    ]
  },
  "sound/wrong": {
    "title": "Sound But Wrong",
    "status": "No_Sound · Quality",
    "red": true,
    "blocks": [
      {
        "t": "check",
        "items": [
          "<strong>Master fader down before you touch a connector.</strong> Back up after. The room is playing, and hot-plugging into a live PA can kill drivers.",
          "Reseat every jack in the path. Half-inserted causes one-sided sound.",
          "Set <strong>TRIM</strong> so the channel meter peaks orange, never red.",
          "Swap the suspect cable. Cables fail more often than gear."
        ]
      }
    ],
    "label": "Quiet, distorted or one-sided",
    "heading": "Quiet, distorted or one side only",
    "question": "Clean now?",
    "step": "ns_wrong",
    "options": [
      {
        "label": "YES, SOUNDS RIGHT",
        "to": "/saved?path=no_sound&branch=quality",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "no_sound"
        }
      },
      {
        "label": "NO, STILL WRONG",
        "to": "sound/wrong-2"
      }
    ]
  },
  "sound/wrong-2": {
    "title": "Isolate It",
    "status": "No_Sound · Quality",
    "red": true,
    "blocks": [
      {
        "t": "check",
        "items": [
          "Move your source to another channel. Fixed? Channel fault, stay there.",
          "Try another output, booth against master. Fixed? Output fault, tell the house.",
          "Still wrong everywhere? Source fault. Different cable, different device."
        ]
      }
    ],
    "label": "30 seconds",
    "heading": "Isolate it in 30 seconds",
    "question": "Playable now?",
    "step": "ns_wrong2",
    "options": [
      {
        "label": "YES, I AM ON",
        "to": "/saved?path=no_sound&branch=isolate",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "no_sound"
        }
      },
      {
        "label": "NO, STILL WRONG",
        "to": "sound/fallback"
      }
    ]
  },
  "sound/fallback": {
    "title": "Survival Mode: Sound",
    "status": "No_Sound · Survival",
    "red": true,
    "blocks": [
      {
        "t": "dim",
        "html": "Stop diagnosing. Anything that makes noise when it is your turn."
      },
      {
        "t": "check",
        "items": [
          "Move everything to a channel you know works, even if you share it.",
          "Ask the DJ before or after you. They know this mixer's quirks.",
          "Ask the sound tech for any spare input, a phone into a line channel counts.",
          "Keep the room going on the player that still works. One deck cannot mix, so this buys time, not a set.",
          "On PRO DJ LINK, load your tracks from the USB still sitting in the dead player."
        ]
      }
    ],
    "label": "Stop debugging",
    "heading": "Get sound out of the speakers",
    "question": "Did you find a way to play?",
    "step": "ns_fallback",
    "options": [
      {
        "label": "YES, I AM COVERED",
        "to": "/saved?path=no_sound&branch=survival",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "no_sound"
        }
      },
      {
        // ROUTE REVIEWED 2026-08-04 and deliberately KEPT. The obvious fix
        // was to send this to shared/survival, the critical path's safety
        // net. It does not fit a silent room: its heading is "play without
        // your USB", two of its three moves are about reading a drive on
        // another player or a laptop, and its own NO exits to /files-lost,
        // a file-recovery page, for a DJ whose files are fine. Sending a
        // no-sound failure there would tell them we lost track of their
        // problem. sound/fallback already carries the survival moves that
        // do apply. What was actually wrong was the LABEL: it promised
        // help and delivered a form. It now says so plainly instead.
        "label": "NO, I AM OUT OF MOVES",
        "to": "/feedback?from=no_sound",
        "desc": "This is the end of the no-sound flow. What comes next is a form, not a fix: tell us what the mixer was doing and we build the answer for the next DJ.",
        "event": "outcome_reached",
        "data": {
          "outcome": "handoff",
          "path": "no_sound"
        }
      }
    ]
  },
  "export/start": {
    "title": "rekordbox Export Failed",
    "status": "Export_Fix",
    "red": false,
    "blocks": [
      {
        "t": "dim",
        "html": "A failed export gets fixed at a computer, properly, so it does not fail again in the booth. Minutes from playing with no computer? Take the booth workarounds instead."
      }
    ],
    "draft": true,
    "heading": "EXPORT <span class=\"accent\">RESCUE</span>",
    "question": "Do you have access to a computer with rekordbox on it?",
    "step": "qf_computer",
    "options": [
      // Three options now, so every one carries an explicit tone: past two
      // the renderer falls back to neutral and the colour would say nothing.
      {
        "label": "YES, WITH rekordbox",
        "to": "export/usb-check",
        // Green: a computer with rekordbox means you have the time and the
        // tools to fix this properly.
        "tone": "green"
      },
      {
        "label": "NO, NOT RIGHT NOW",
        "to": "export/find",
        // No computer yet: slower path, still a path.
        "tone": "amber"
      },
      {
        "label": "I AM ON IN MINUTES",
        "to": "usb/moves",
        "desc": "Skip the repair. Straight to the booth workarounds.",
        // Red: the paragraph above offered this route and no pad did it, so
        // a DJ read an instruction with no control. Red is the time reading,
        // not the severity one: you are on in minutes, so move now.
        "tone": "red"
      }
    ]
  },
  "export/find": {
    "title": "Find a Computer",
    "status": "Quick_Fix",
    "red": false,
    "blocks": [
      {
        "t": "dim",
        "html": "A proper fix needs rekordbox. You have time to find one:"
      },
      {
        "t": "check",
        "items": [
          "Your own laptop at home or in the car?",
          "Another DJ on the lineup with rekordbox installed.",
          "The venue or promoter's office computer (rekordbox is a free download)."
        ]
      }
    ],
    "draft": true,
    "label": "Step 0",
    "heading": "You have time, use it to find a computer",
    "question": "Did you get access to a computer?",
    "step": "qf_find_computer",
    "options": [
      {
        "label": "YES, GOT ONE",
        "to": "export/usb-check"
      },
      {
        "label": "NO, SWITCH TO WORKAROUNDS",
        "to": "usb/moves",
        "desc": "No computer means no real repair. We use the critical path to get you playing.",
        // Giving up the repair for workarounds is a trade, not a loss.
        "tone": "amber"
      }
    ]
  },
  "export/usb-check": {
    "title": "Export Rescue: USB Check",
    "status": "Quick_Fix",
    "red": false,
    "blocks": [
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "<strong>The moment the drive mounts, the computer may offer to format or initialise it. Say NO.</strong> On a Mac the button is labelled \"Initialize…\" and it opens Disk Utility, one step from wiping the drive. Nothing is lost yet. Choose Ignore or Eject, then answer below."
      }
    ],
    "draft": true,
    "label": "Step 1",
    "heading": "Check the USB on the computer",
    "question": "Plug the USB into the computer. What happens?",
    "step": "qf_usb_check",
    "options": [
      {
        "label": "I CAN SEE MY FILES",
        "to": "export/backup"
      },
      {
        "label": "NOTHING / ERROR MESSAGE",
        "to": "export/dead-checks"
      }
    ]
  },
  "export/dead-checks": {
    "title": "Drive Checks",
    "status": "Quick_Fix",
    "red": false,
    "blocks": [
      {
        "t": "check",
        "items": [
          "Different USB port, plugged in <strong>directly</strong> (no hub).",
          "Another computer if one is around.",
          "If it asks \"do you want to format?\" - <strong>say NO.</strong> Your files are still there."
        ]
      }
    ],
    "draft": true,
    "label": "Step 1b",
    "heading": "The computer doesn't see it. Quick checks:",
    "question": "Can any computer see the files now?",
    "step": "qf_dead_checks",
    "options": [
      {
        "label": "YES, FILES VISIBLE",
        "to": "export/backup"
      },
      {
        "label": "NO, DRIVE STAYS DEAD",
        "to": "export/fresh",
        "desc": "We build tonight's USB on a different drive. Recovery of this one comes after the gig."
      }
    ]
  },
  "export/backup": {
    "title": "Backup First",
    "status": "Quick_Fix",
    "red": false,
    "blocks": [
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "Everything after this point can end in a format. <strong>Copy your music off first.</strong>"
      },
      {
        "t": "check",
        "items": [
          "Copy the whole drive to the computer. At minimum the <strong>Contents</strong> folder, which saves your audio but not your playlists, cues or grids: you would be digging through artist and album folders to find a track.",
          "If some files fail, copy what you can and note which ones. Skipped files are gone for good if this drive gets formatted later, so if any of them matter, take the fresh-drive route instead and keep this one intact.",
          "While it copies: open rekordbox, top-left mode selector to <span class=\"mono\">EXPORT</span>. If your USB shows under <strong>Devices</strong>, the next screen refreshes it; if it never shows, say so on the next screen and we rebuild clean."
        ]
      }
    ],
    "draft": true,
    "label": "Step 2",
    "heading": "Safety copy before the rebuild",
    "question": "Did the copy complete?",
    "step": "qf_backup",
    "options": [
      {
        "label": "YES, MUSIC IS SAFE",
        "to": "export/repair"
      },
      {
        "label": "NO, COPY KEEPS FAILING",
        "to": "export/fresh",
        "desc": "The drive is failing. We build tonight on a different one."
      }
    ]
  },
  "export/repair": {
    "title": "Repair the Device",
    "status": "Quick_Fix",
    "red": false,
    "blocks": [
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "<strong>Check your Collection first.</strong> If this is a borrowed or venue computer and the Collection is empty, do NOT delete anything. There would be nothing to put back. Use the music you just backed up instead."
      },
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "<strong>Deleting the playlists on the device deletes tonight's cues and grids with them.</strong> The backup two steps back saved audio only. Your Collection on this computer still holds the cues and grids, and the drive gets them back when the fresh sync finishes. Between those two moments they exist in one place only."
      },
      {
        "t": "check",
        "items": [
          "In rekordbox, on the <strong>device</strong>: delete tonight's playlists.",
          "Drag tonight's playlists from your collection onto the device again (fresh sync).",
          "Wait for the sync to finish completely.",
          "Eject with the <strong>eject button in rekordbox</strong>, never pull the drive."
        ]
      }
    ],
    "draft": true,
    "label": "Step 3",
    "heading": "Refresh the export",
    "question": "Did the sync finish without errors?",
    "step": "qf_repair",
    "options": [
      {
        "label": "YES, SYNC DONE",
        "to": "export/verify"
      },
      {
        "label": "NO - ERRORS, OR DEVICE NOT SHOWING",
        "to": "export/errors"
      }
    ]
  },
  "export/errors": {
    "title": "Read the Error",
    "status": "Quick_Fix",
    "red": false,
    "blocks": [
      {
        "t": "dim",
        "html": "Ten seconds here saves a pointless format. Sync errors split into two families and only one of them is the drive's fault."
      }
    ],
    "draft": true,
    "label": "Step 3b",
    "heading": "What is rekordbox complaining about?",
    "question": "What do the errors look like?",
    "step": "qf_errors",
    "options": [
      {
        "label": "FILES MISSING OR NOT FOUND",
        "to": "export/export",
        "desc": "Library-side, not the drive. Import the folder you backed up, then export fresh. No format needed.",
        // Symptom split: both answers just name the problem.
        "tone": "amber"
      },
      {
        "label": "DEVICE, WRITE OR UNKNOWN ERRORS",
        "to": "export/erase",
        "desc": "Then the drive side is suspect and we rebuild it clean.",
        // Same split, other family.
        "tone": "amber"
      }
    ]
  },
  "export/erase": {
    "title": "Prepare to Format",
    "status": "Quick_Fix",
    "red": false,
    "blocks": [
      {
        "t": "dim",
        "html": "Your safety copy from the backup step is what makes this survivable."
      },
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "<strong>The next step ERASES this USB completely.</strong> Anything that failed to copy earlier is gone for good. If any of those files matter, stop here and take the fresh-drive route instead."
      }
    ],
    "draft": true,
    "label": "Step 3c",
    "heading": "Prepare the USB",
    "question": "Are you ready to erase this USB and continue?",
    "step": "qf_erase_consent",
    "options": [
      {
        "label": "YES - ERASE AND CONTINUE",
        "to": "export/format",
        // Third consent screen, same correction. The alert above says
        // anything that failed to copy is gone for good; a green pad under
        // that sentence contradicts it. Amber: chosen, and it costs you.
        "tone": "amber"
      },
      {
        "label": "NO - KEEP THIS DRIVE AS IT IS",
        "to": "export/fresh",
        "desc": "We build tonight on a different drive instead.",
        // Keeping the drive intact has a real route. Caution, not danger.
        "tone": "amber"
      }
    ]
  },
  "export/format": {
    "title": "Clean Format",
    "status": "Quick_Fix",
    "red": false,
    "blocks": [
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "<strong>This erases the drive completely.</strong> Anything still only on this drive is gone. If any file failed to copy earlier, it is not coming back after this step."
      },
      {
        "t": "check",
        "items": [
          "Confirm you are on the right disk: check the name and the size before you touch anything.",
          "Format the <em>device</em>, not the volume. On Mac: Disk Utility, View, Show All Devices.",
          "Drive bigger than 32GB on Windows? The built-in dialog will not offer FAT32. Use the free <strong>guiformat</strong> tool, then come back.",
          "Format: <span class=\"mono\">FAT32</span> · Scheme: <span class=\"mono\">MBR</span> · Quick format OK."
        ]
      }
    ],
    "draft": true,
    "label": "Step 4",
    "heading": "Format the USB clean",
    "question": "Formatted successfully?",
    "step": "qf_format",
    "options": [
      {
        "label": "YES, CLEAN AND EMPTY",
        "to": "export/export"
      },
      {
        "label": "NO, FORMAT FAILS",
        "to": "export/fresh",
        "desc": "If the dialog refused FAT32 on a big drive, use guiformat first. If the format itself fails, the drive is done and we build on another."
      }
    ]
  },
  "export/export": {
    "title": "Fresh Export",
    "status": "Quick_Fix",
    "red": false,
    "blocks": [
      {
        "t": "check",
        "items": [
          "rekordbox in <span class=\"mono\">EXPORT</span> mode, USB connected.",
          "Drag <strong>tonight's playlists only</strong> onto the device. Small export = fast and reliable.",
          "No rekordbox library on this computer? Import the music folder you backed up first, then export it.",
          "Wait for the full sync, then eject with the rekordbox eject button."
        ]
      }
    ],
    "draft": true,
    "label": "Step 5",
    "heading": "Export tonight's music with rekordbox",
    "question": "Export finished without errors?",
    "step": "qf_export",
    "options": [
      {
        "label": "YES, EXPORT DONE",
        "to": "export/verify"
      },
      {
        "label": "NO, EXPORT FAILS",
        "to": "export/fresh"
      }
    ]
  },
  "export/fresh": {
    "title": "Fresh Drive",
    "status": "Quick_Fix",
    "red": false,
    "blocks": [
      {
        "t": "check",
        "items": [
          "Get <strong>any other USB drive</strong>. Your spare, another DJ's, the venue's."
        ]
      },
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "<strong>If you borrowed this drive, stop and check with the owner.</strong> The next step erases it completely. Someone else's library is not expendable, and they may not know you are about to format it."
      },
      {
        "t": "check",
        "items": [
          "Once you know the drive is empty or expendable, format it: <span class=\"mono\">FAT32</span> + <span class=\"mono\">MBR</span>.",
          "Export tonight's playlists from rekordbox, or copy the music files you backed up.",
          "Verify: eject, replug, everything loads."
        ]
      }
    ],
    "draft": true,
    "label": "Plan B",
    "heading": "Build tonight on a different drive",
    "question": "Is the fresh drive working?",
    "step": "qf_fresh_usb",
    "options": [
      {
        "label": "YES - I AM BACK ON",
        "to": "/saved?path=quick_fix&branch=fresh_usb",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "quick_fix"
        }
      },
      {
        "label": "NO, OUT OF TIME",
        "to": "usb/moves",
        "desc": "Switch to the critical path: workarounds and survival mode."
      }
    ]
  },
  "export/verify": {
    "title": "Verify",
    "status": "Quick_Fix",
    "red": false,
    "blocks": [
      {
        "t": "check",
        "items": [
          "Unplug the USB, wait 5 seconds, plug it back in.",
          "Open it in rekordbox: device loads, playlists intact.",
          "If you can reach a player before your set: test it there too (<span class=\"mono\">SOURCE → USB</span>)."
        ]
      }
    ],
    "draft": true,
    "label": "Final step",
    "heading": "Verify before you trust it",
    "question": "Does everything load correctly?",
    "step": "qf_verify",
    "options": [
      {
        "label": "YES - EVERYTHING LOADS",
        "to": "/saved?path=quick_fix",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "quick_fix"
        }
      },
      {
        "label": "NO, STILL BROKEN",
        "to": "export/fresh"
      }
    ]
  },
  "usb/start": {
    "title": "USB Not Recognized",
    "status": "Critical_Path",
    "red": true,
    "label": "Diagnostic",
    "heading": "The player does not see the drive",
    // THE FIRST SCREEN NOW GIVES THE INSTRUCTION IT USED TO ASSUME
    // (2026-08-06). This is the entry point of the most common failure on the
    // site, and it opened by asserting "you have already reseated it and tried
    // the other deck" -- an instruction NO page here has ever actually given.
    // Reseating and the second slot fix a large share of real cases, they cost
    // nothing, they risk nothing, and they are the two things a DJ standing at
    // a dead player is most likely to have done in a hurry rather than
    // properly. So the check comes first and the old line follows it as a
    // hand-off instead of pre-empting it.
    // The block stays `assumed` and not `dim` on purpose: on these screens
    // .assumed is the quiet hairline-ruled aside, which is the right weight
    // for "if that worked, stop reading". Promoting it to body text would put
    // it in competition with the check above it.
    "blocks": [
      {
        "t": "check",
        "items": [
          "Pull the drive out and push it back in, firmly. Then try the other slot on the same player."
        ]
      },
      {
        "t": "assumed",
        "html": "If that was it, you are done. If not, keep going."
      }
    ],
    "question": "Does any other player in the booth read the drive?",
    "step": "usb_start",
    "options": [
      {
        "label": "YES, ANOTHER PLAYER READS IT",
        "to": "usb/link",
        "desc": "Then you can be playing in under a minute."
      },
      {
        "label": "NO, NOTHING READS IT",
        "to": "usb/moves",
        "desc": "The four moves. A list, not questions."
      }
    ]
  },
  "usb/link": {
    "title": "Play Over LINK",
    "status": "Critical · Fastest fix",
    "red": true,
    "label": "Try this first",
    "heading": "Load from the player that sees it",
    "blocks": [
      {
        "t": "dim",
        "html": "If the booth is linked over PRO DJ LINK, any player can browse and load from a drive that is physically in another one. Your own port being dead stops mattering."
      },
      {
        "t": "check",
        "items": [
          "Press <strong>SOURCE</strong> on the player you want to play on.",
          "Select the other player’s USB (the LINK / remote device).",
          "Browse and load your track from there."
        ]
      }
    ],
    "question": "Did it load?",
    "step": "usb_link",
    "options": [
      {
        "label": "YES, I AM PLAYING",
        "to": "/saved?path=critical&branch=link",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "critical"
        }
      },
      {
        "label": "NO, STILL NOTHING",
        "to": "usb/moves",
        "desc": "The four moves. A list, not questions."
      }
    ]
  },
  "usb/moves": {
    "title": "The Four Moves",
    "status": "Critical · Do this now",
    "red": true,
    "srHeading": "Four moves, in order, until it plays",
    "heading": "Four moves you have not tried.",
    "moves": true,
    "blocks": [],
    "step": "runlist",
    "options": [
      {
        "label": "I AM PLAYING",
        "to": "/saved?path=critical&branch=runlist",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "critical"
        }
      },
      {
        "label": "NOTHING WORKED, AND I HAVE TIME",
        "to": "usb/computer",
        "desc": "Step by step diagnosis, one question at a time.",
        // GREEN, and Antonio overruled me to get here. I called it red on
        // the grounds that the four moves had all failed, which is severity
        // reasoning. He ruled the axis is TIME PRESSURE, not severity: "if
        // he has time, it's green, it's not urgent." The label says I HAVE
        // TIME in as many words, and the route it opens is a calm step by
        // step diagnosis. Nothing here has to happen in the next sixty
        // seconds, so nothing here is red.
        "tone": "green",
        "event": "step_completed",
        "data": {
          "step": "runlist_to_tree"
        }
      }
    ]
  },
  "usb/computer": {
    "title": "Do You Have a Computer?",
    "status": "Critical_Path",
    "red": true,
    "blocks": [
      {
        "t": "dim",
        "html": "You have done the booth moves, so we do not repeat them. With a computer we fix the drive; without one, we get you playing another way."
      }
    ],
    "label": "Decision point",
    "heading": "Goal right now: play a set.",
    "question": "Do you have a computer right now?",
    "step": "usb_fork_computer",
    "options": [
      {
        "label": "YES, I HAVE A COMPUTER",
        "to": "shared/usb-check"
      },
      {
        "label": "NO COMPUTER",
        "to": "shared/survival",
        "desc": "The booth moves are done. Straight to the other ways to play."
      }
    ]
  },
  "frozen/start": {
    "title": "Frozen Player",
    "status": "Critical_Path",
    "red": true,
    "label": "Diagnostic",
    "heading": "A frozen screen is not always frozen audio",
    "blocks": [
      {
        "t": "dim",
        "html": "If a track was playing when it locked up, it will usually keep playing. Nothing gets touched until the room is covered."
      }
    ],
    "question": "Is the frozen player live in the mix right now?",
    "step": "frozen_start",
    "neutral": true,
    "options": [
      {
        "label": "IT IS PLAYING THE ROOM",
        "to": "frozen/live",
        "desc": "We move the room first, restart second.",
        // Amber, not red: the room still HAS music. What you have lost is
        // your freedom to act, because the deck you would restart is the
        // one the crowd is hearing, and the track has an end.
        "tone": "amber"
      },
      {
        "label": "IT IS IDLE, NOT IN THE MIX",
        "to": "frozen/restart",
        "desc": "Then it can be restarted without risk.",
        // Green. Its own description says "without risk", which is the
        // definition of the green level.
        "tone": "green"
      }
    ]
  },
  "frozen/live": {
    "title": "Keep the Room Playing",
    "status": "Critical · Live deck",
    "red": true,
    "label": "Step 1 of 2",
    "heading": "Get the music onto another deck first",
    "blocks": [
      {
        "t": "dim",
        "html": "The frozen player keeps playing for now. The restart happens only when it is no longer carrying the room."
      },
      {
        "t": "check",
        "items": [
          "Leave the frozen player completely alone. No buttons, no USB, no power.",
          "Get the next track ready on another player: its own drive, or your drive over <strong>PRO DJ LINK</strong> if the network still responds.",
          "Take over in the mix from the working deck."
        ]
      }
    ],
    "question": "Is another deck carrying the room?",
    "step": "frozen_live",
    "options": [
      {
        "label": "YES, I AM COVERED",
        "to": "frozen/restart",
        "desc": "Now the frozen player can be restarted safely."
      },
      {
        "label": "NO, NOTHING ELSE CAN PLAY",
        "to": "shared/survival",
        "desc": "Other ways to keep sound in the room."
      }
    ]
  },
  "frozen/restart": {
    "title": "Restart the Player",
    "status": "Critical · Restart",
    "red": true,
    "label": "The restart",
    "heading": "Power-cycle it properly",
    "blocks": [
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "Only restart a player that is not carrying the room. If it is still playing, go back and hand the room to another deck first."
      },
      {
        "t": "check",
        "items": [
          "Press <strong>USB STOP</strong> if it responds, and wait for the light to stop blinking.",
          "Power off. Wait twenty seconds.",
          "Power on and let it boot fully before touching anything.",
          "Reinsert the drive and give it thirty seconds. Big libraries mount slowly. If the player froze while browsing, test the drive in another deck first: a corrupt database can freeze it again."
        ]
      }
    ],
    "question": "Is the player back and reading your drive?",
    "step": "frozen_restart",
    "options": [
      {
        "label": "YES, I AM PLAYING",
        "to": "/saved?path=frozen&branch=restart",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "frozen"
        }
      },
      {
        "label": "NO, STILL LOCKED OR NOT READING",
        "to": "frozen/link"
      }
    ]
  },
  "frozen/link": {
    "title": "Take It Off the Network",
    "status": "Critical · Link",
    "red": true,
    "label": "Last isolation",
    "heading": "Isolate it from the booth",
    "blocks": [
      {
        "t": "dim",
        "html": "When more than one player misbehaves at once, the LINK network is a suspect. A player that freezes on the network can run fine standalone."
      },
      {
        "t": "check",
        "items": [
          "Unplug the <strong>LINK</strong> cable from the frozen player only. Leave the rest of the booth alone.",
          "Restart it once more, standalone.",
          "Play from its own USB port."
        ]
      }
    ],
    "question": "Playing on any deck now?",
    "step": "frozen_link",
    "options": [
      {
        "label": "YES, I AM PLAYING",
        "to": "/saved?path=frozen&branch=isolate",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "frozen"
        }
      },
      {
        "label": "NO, STILL NOTHING",
        "to": "shared/survival",
        "desc": "We get you playing another way."
      }
    ]
  }
};
