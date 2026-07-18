# Character Binder — D&D 5e

A single-file, tablet-friendly character sheet for D&D 5e. Open `character-binder.html` in any
browser — no install, no server, no build step. Everything is saved automatically to the browser's
local storage as you play.

## What it does

- **Build** — pick class, level, subclass and race; proficiency bonus, hit dice, saving throws
  and spell slots are calculated automatically.
- **Abilities & Skills** — ability scores, modifiers and skill proficiencies, color-coded by
  ability so the sheet reads at a glance.
- **Features & Traits** — a searchable library of class features, race traits and feats. Picking
  one from the library auto-attaches its mechanical effects (skill bonuses, stat bumps, combat
  tracking) instead of typing them in by hand. Has a lock toggle for a compact read-only view
  during play.
- **Spells** — a spellbook-style view grouped by level, with slot tracking, prepared spells, and a
  searchable spell index with quick access to range/duration/school and a link to the full text.
- **Combat** — HP, AC, initiative, attacks, and a live panel of any feature flagged "show in
  combat," with per-rest use-tracking (some auto-scale with proficiency bonus).
- **Inventory & Character** — equipment, money, backstory and notes.

## Design

Everything shares one visual language: a dark leather-and-parchment palette, Cinzel for headings
and Crimson Pro for body text, and consistent color-coding (by ability score, spell level, class,
or feature source) instead of plain gray boxes everywhere.

## Data & saving

Character data lives in the browser's local storage (`dnd5e-binder-v1`), so it persists between
sessions on the same device/browser automatically. Use the Export/Import buttons in Settings to
save a character to a `.json` file (see `Din Karter.json` for an example) or move it to another
device.

## Tech

Plain HTML, CSS and vanilla JavaScript — no frameworks, no build tooling, no external dependencies
beyond a Google Fonts import. The app is split across a few files that sit next to each other:

- `character-binder.html` — page shell (markup + script/style includes)
- `styles.css` — all styling
- `data-classes-races.js`, `data-spells.js`, `data-equipment.js`, `data-libraries.js` — static
  game data (classes, races, spells, armor/weapons, feature & race-trait libraries)
- `app.js` — application logic (state, rendering, event wiring, calculations)

Still no server or build step: keep all the files together in the folder and open
`character-binder.html` directly in a browser. Sharing/backing up a copy of the app now means
copying the whole folder rather than a single file.
