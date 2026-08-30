# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-page, tablet-friendly D&D 5e character binder. Plain HTML/CSS/vanilla JS — no
frameworks, no build tooling, no package manager, no bundler, no test runner. `index.html` is the
app shell; opening it in a browser (or serving the folder statically) is the entire dev loop.

## Running it

There is no build step and no dev server config in this repo. To iterate:

- Open `index.html` directly in a browser, or serve the folder with any static file server
  (e.g. `npx serve .`) so the service worker (`sw.js`) and `fetch`-based caching behave normally.
- There is no lint, test, or CI setup — verify changes by exercising the UI in a browser.
- The GitHub Pages deploy is just this repo's contents served statically (`.nojekyll` at the
  root disables Jekyll processing) — nothing to compile before pushing.

## Script load order (matters — later files depend on globals from earlier ones)

`index.html` loads scripts in this order, and each one relies on globals defined by the ones
before it:

1. `data-classes-races.js` — `ABILITIES`, `SKILLS`, `TABS`, `STORE_KEY`, `CLASSES`, `RACES`, ASI/XP tables
2. `data-spells.js` — the spell index (`SPELL_RAW` + decoders) and `SP_*` lookup tables
3. `data-rules.js` — `RULES_DB`, the combat rules cheatsheet shown in the cockpit
4. `data-items.js` — `ITEM_TYPES`, `ITEM_RAW` (adventuring gear index)
5. `data-equipment.js` — `ARMORS`, `WEAPONS`/AC math (`computedBaseAC`, etc.)
6. `data-libraries.js` — `FEATURE_LIB` (class features/feats with mechanical effects pre-attached), race trait library
7. `data-backgrounds.js` — `BACKGROUNDS` (skills/tools/languages/gold/equipment per background) and
   `BACKGROUND_LIB` (the searchable trait library — skill-grant + signature-feature entries)
8. `app.js` — all application state, rendering, and event wiring (the bulk of the logic, ~5700 lines)
9. `wizard.js` — guided step-by-step character creation; reuses `app.js` globals, keeps its own
   isolated draft (`WIZ`) and only touches real storage via `createChar()` at the end
10. `map.js` — campaign map (upload image, pin party/waypoints/quests); own localStorage key,
    independent of character state

All data files are plain `const` declarations in global scope (no modules, no exports) — grepping
for a constant name across `data-*.js` is the fastest way to find where game data lives.

## Verifying game data against dnd5e.wikidot.com

The mechanical content in the `data-*.js` files (classes, races, spells, items, armor/weapons,
class features/feats) is meant to mirror the 5e SRD as published on https://dnd5e.wikidot.com —
`data-spells.js` already cites that site as its source in its own header comment. **Whenever you
add a new entry or edit an existing one in these files, cross-check it against the corresponding
page on that site before treating the change as done:**

- Spells (`data-spells.js`, `SPELL_RAW`) — `https://dnd5e.wikidot.com/spells` has one master table
  per spell level with the same fields stored here (school, casting time, range, duration,
  components); individual spells are at `https://dnd5e.wikidot.com/spell:<kebab-case-name>` for
  full text.
- Classes (`data-classes-races.js`, `CLASSES`) — `https://dnd5e.wikidot.com/<class-name>` (e.g.
  `/fighter`, `/wizard`) has hit die, saving throws, proficiencies, and the level-progression table.
- Races (`data-classes-races.js`, `RACES`) — `https://dnd5e.wikidot.com/lineage` indexes every
  race; each has its own page with ability bonuses, speed, and traits.
- Items/equipment (`data-items.js`, `data-equipment.js`) — split across
  `https://dnd5e.wikidot.com/adventuring-gear`, `/armor`, `/weapons`, `/wondrous-items`, `/tools`.
- Class features & feats (`data-libraries.js`, `FEATURE_LIB`) — the same class pages above list
  features by level; feats are at `https://dnd5e.wikidot.com/feat:<name>`.
- Backgrounds (`data-backgrounds.js`, `BACKGROUNDS`/`BACKGROUND_LIB`) —
  `https://dnd5e.wikidot.com/background:<kebab-case-name>` (e.g. `/background:acolyte`) has skill/tool/
  language proficiencies, starting equipment and gold, and the signature feature's full text.

Only verify mechanical fields this way (level, school, range/duration, hit die, ability bonuses,
AC/damage, uses-per-rest, etc.) — the short one-line descriptions already in these files are
deliberate paraphrases, not literal quotes from the site, so don't rewrite them to match the
site's wording unless they're actually incorrect.

## Architecture (app.js)

**State**: a single global object `S` (see `defaultState()` at the top of `app.js`) holds the
entire character sheet. There's no framework — UI reads/writes `S` directly, then calls `save()`
(debounced 350ms) and the relevant `render*()` function(s).

**Multi-character roster**: `S` is one character. `ROSTER` (`{list, active, meta}`) tracks all
characters; each is stored under its own `localStorage` key (`dnd5e-binder-char-<id>`), with
`ROSTER` itself under `dnd5e-binder-roster-v1`. Switching characters calls `flushSave()` first so a
pending debounced save can't land in the wrong slot, then `load()` + `renderAll()`.

**Data binding**: elements with `data-bind="path.to.field"` are wired by `bindAll()` to read/write
`S` via `getPath`/`setPath` (dot-path into the state object) and re-synced by `syncBound()`.
Elements with `data-calc` show derived/computed values set by `recalc()`. This is the core loop for
almost every input on the sheet — look here first when a field isn't saving or updating.

**Rendering**: no virtual DOM/diffing — each UI section has its own `render*()` function that
rebuilds its `innerHTML` from `S` (e.g. `renderAttacks`, `renderFeatures`, `renderSpellLevels`,
`renderCombatFeatures`, `renderOverview`). `renderAll()` calls all of them plus `bindAll()` +
`syncBound()` + `recalc()`, and runs once at boot and after anything that swaps out the whole
character (new/import/switch/reset). Individual actions call only the specific `render*()`
functions they affect, not `renderAll()`.

**Tabs**: `TABS` (in `data-classes-races.js`) is the ordered `[id, label]` list; `PAGES[id]` in
`app.js` holds each tab's HTML template. `buildShell()` builds the tab buttons/pages once at boot;
`showTab(id)` toggles visibility and does a few per-tab fixups (autosize textareas that were
hidden, re-render Combat/Overview since they can go stale while not visible).

**Build-derived vs. player-overridden fields**: many fields (speed, vision, saves, AC-relevant
stats, etc.) are normally computed from class/race/level, but the player can hand-type over them.
`BUILD_FIELDS` + `bovHas`/`bovClaim`/`bovSet`/`bovReset` (the "build override" system) track which
fields have been taken over from the computed default — see the long comment above `BUILD_FIELDS`
in `app.js` for the reasoning. `applyBuild()` recomputes defaults; overridden fields keep the
player's value.

**Feature effects (`fx`)**: class features, feats, and race traits carry a small mechanical-effect
DSL — `{t:'stat',...}`, `{t:'skill',...}`, `{t:'save',...}`, `{t:'note',...}`, `{t:'statnote',...}`
— read by `allFx()` and applied live throughout stat calculations (`fxStat`, `fxSkillGrant`,
`fxSaveProf`, etc.), so a granted bonus stays correct as level/abilities change instead of being
baked in as a static number. `FEATURE_LIB` in `data-libraries.js` is the canonical source of these
effects for known 5e features; picking one from the library auto-attaches its `fx`.

**Combat cockpit**: the Combat tab's "cards" (`cockpitCards()`), turn plans (`S.turnPlans`), and
zone filtering (`CK_ZONES`, `CK_FILTER`) are a separate rendering subsystem layered on top of
attacks/spells/features — see the `// ========== Combat cockpit ==========` section.

**Migrations**: `load()` always runs `migrateAttacks()`, `migrateNotes()`, `migrateBuild()` after
reading a saved character, so older save shapes (attacks, notes, and build-override data have all
changed shape over time) are normalized forward. When changing the shape of persisted state, add a
migration rather than assuming existing saves already match.

**Data files hold game rules only — no rendering, no DOM.** All rendering and state logic lives in
`app.js`/`wizard.js`/`map.js`.

## Persistence

Everything is `localStorage`, no backend:
- `dnd5e-binder-char-<id>` — one character's full state (JSON of `S`)
- `dnd5e-binder-roster-v1` — the roster (`ROSTER`)
- `dnd5e-binder-map-v2` — the campaign map
- `dnd5e-binder-wide-v1` — UI-only wide-layout preference, independent of character/roster

Characters can be exported/imported as standalone `.json` files (Settings, or the character-select
screen) — see the `Characters/` folder for example exports. Import always creates a *new* roster
entry rather than overwriting the current sheet.
