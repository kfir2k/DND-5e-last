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
8. `i18n-he.js` — `I18N_HE` (English UI text → Hebrew), `I18N_HE_RX` (patterns for sentences with
   numbers/names inside), `I18N_HE_KEEP`, and the `heAdd()` helper; plain data, no logic. Then the
   game-data translation files `i18n-he-spells.js` (and, as they are written, `i18n-he-features.js`, …),
   which add to the same dictionary via `heAdd()`. See "UI language (Hebrew)" below.
9. `i18n.js` — the `I18N` engine and the language preference (`LANG_KEY`); in English mode it
   installs nothing. Must load before `app.js`, which calls `I18N.t()` while it boots.
10. `app.js` — all application state, rendering, and event wiring (the bulk of the logic, ~7900 lines)
11. `wizard.js` — guided step-by-step character creation; reuses `app.js` globals, keeps its own
    isolated draft (`WIZ`) and only touches real storage via `createChar()` at the end
12. `map.js` — campaign map (upload image, pin party/waypoints/quests); own localStorage key,
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

### Scope: official content, not just the core PHB

This app's scope is **everything official/published and non-UA**, not "PHB-only." Rune Knight,
Psi Warrior, and plenty of other Tasha's Cauldron/Xanathar's/other-sourcebook content are already
built out in full elsewhere in `FEATURE_LIB` — so don't assume a feature, option, or subclass is
"out of scope" just because it isn't in the core Player's Handbook or looks unfamiliar. The only
things to actually exclude are Unearthed Arcana/playtest material and homebrew with no published
source. When a wikidot page marks something `(UA)`, leave it out; when it doesn't, it's in scope
even if it's from a later book. If genuinely unsure whether something is UA vs. published, check
rather than guessing either way.

### Shared "choose one from a list" options differ per class — verify per class, not once

Several features across classes work the same way structurally but draw from a *different* option
list per class — Fighting Style (Fighter/Paladin/Ranger/Blood Hunter/College of Swords) is the
clearest example, but the same pattern applies to anything similar (e.g. a shared feat or
maneuver-style choice gated per class). **Never assume the option list you verified for one class
applies unchanged to another** — wikidot's own per-class pages disagree with each other on this:
the same option can be core for one class, marked `(UA)`-only for a second, and simply absent for
a third (e.g. Interception is official for Fighter and Paladin but UA-only for Ranger; Thrown
Weapon Fighting is official for Fighter and Ranger but UA-only for Paladin; Paladin and Ranger each
also get their own unique option — Blessed Warrior / Druidic Warrior — that doesn't exist for
Fighter at all). Fetch and check **that specific class's own page** before adding or copying a
shared option list across classes.

### WebFetch summaries can hallucinate mechanical details — verify with verbatim quotes

A WebFetch summary is an LLM's paraphrase of a page, not the page itself, and it can confidently
state a rule (a uses-per-rest limit, a recharge mechanic, a duration) that simply isn't in the
source. **Before changing or adding any numeric/mechanical detail (dice, DCs, uses-per-rest,
durations, prerequisites), ask WebFetch explicitly for the "VERBATIM, word-for-word quoted text,"
not a summary** — a paraphrase-only answer is not sufficient grounds to change game data. If an
already-cached file has a verbatim quote for the same feature, that quote outranks a fresh
summary-only fetch; re-fetch with a verbatim-quote prompt to resolve the conflict rather than
trusting whichever came later.

### Cache fetched wikidot pages locally

`wikidot-cache/` (see its own `README.md`) holds pages already fetched from
`dnd5e.wikidot.com`, split into `spells/`, `classes/`, `races/`, `items/`, `backgrounds/`,
`feats/`. **Before fetching a page from wikidot, open and read the matching cache file if one
exists** — don't just check that the filename is there, read its actual content, since a citation
you need might already be sitting in it. Don't re-fetch over the network something already cached.

**Whenever you fetch a page from wikidot for any reason, save the complete fetched content into
the matching subfolder as `<slug>.md` — every feature, every option, every table row on that page,
not just the part relevant to the task in front of you.** This is not optional and not a
judgment call: "save the extracted content actually used" has been the source of every gap found
so far (a class page cached with only its level table and subclass list, a Fighting Style option
skipped because that task didn't need it yet). A page is only "cached" once nothing on it would
require a re-fetch for a *different* future task — a partial save is functionally the same as no
save, because the next session has no way to know what was left out. Concretely, for a class page
that means: the full level-progression table, every base-class feature's full text end to end
(not summarized), every fighting-style/maneuver/invocation-style option list in full with its
exact wording, and the complete subclass list — even the parts that don't matter for whatever
you're verifying right now. If a single WebFetch call didn't return everything the page has,
issue more calls until it's actually complete before writing the file, and say so if you're
stopping short. When you fetch a subclass or feature page and it's not yet cached, save it in
full too, even if the fetch was only to double-check one number. If a cached page might be stale
for a fact you're checking, re-fetch the *whole* page and overwrite the cached copy — don't patch
in just the one fact that changed and leave the rest as it was.

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
- `dnd5e-binder-tab-v1` — UI-only last-open tab (restored at boot by `lastTab()`), independent of character/roster
- `dnd5e-binder-lang-v1` — UI-only language, `'en'` (default) or `'he'`; read by `i18n.js` before `app.js`
  runs, written only by the Settings → Language control. Never in `S` or any export.
  (`dnd5e-binder-lang-reload` in `sessionStorage` is a one-shot flag set across that switch's reload.)
- `dnd5e-binder-backup-v1` — backup bookkeeping only (last-export time per character id, nudge
  snooze, iOS tip dismissed); drives the backup nudge bar. Never written into `S` or any export.
- `dnd5e-binder-rescue-<id>-<ts>` — raw text of a save that failed to parse, parked by `load()`
  before a blank sheet replaces it

Characters can be exported/imported as standalone `.json` files (Settings, or the character-select
screen) — see the `Characters/` folder for example exports. Import always creates a *new* roster
entry rather than overwriting the current sheet. **The single-character export format is exactly
`S` as JSON and must stay that way** — players have these files on disk. "Back up all" writes a
separate bundle shape, `{format:'dnd5e-binder-bundle', version, exported, chars:[<plain character
files>]}`; `parseImport()` recognises a bundle only by that `format` marker, so any other object is
treated as a single character, exactly as before.

## UI language (Hebrew)

The app is written in English; Hebrew is an overlay. `i18n.js` runs a `MutationObserver` over
`document.body` and swaps UI text that **exactly matches** a key in `I18N_HE` (text nodes, plus the
`placeholder`/`title`/`aria-label`/`alt`/`data-placeholder`/option-label attributes). Anything without an
entry simply stays English, so nothing can break and translation can grow a piece at a time. It is
switched **only** from Settings → Language (a bilingual `translate="no"` row in `index.html`); the switch
saves, writes `dnd5e-binder-lang-v1` and reloads. English mode installs no observer and does no work.

**Display-time only, always.** Never edit `data-*.js` to translate, and never translate by changing the
strings the app copies into `S` (`grantKey`, `featureIsPristine`, library joins, `S.classLevel`… all compare
English text). The engine skips `contenteditable` (the backstory editor's `innerText` is saved straight into
`S`), `textarea`, `translate="no"`, and the containers that show *untranslated* game data (items, weapons,
languages, proficiencies — see `SKIP` in `i18n.js`). Game data that HAS Hebrew entries (spells, features,
race traits, backgrounds) is translated everywhere it appears, by exact match; one without an entry stays
English. Long game-data sentences are never run through the regex patterns (`PROSE` in `i18n.js`), and the
open-ended patterns only accept known vocabulary — a half-translated sentence is a bug.

**Translating game data (spells, features, race traits, backgrounds)** — in progress, on the
`experimental/hebrew-ui` branch. Read `i18n-glossary-he.md` first (terms, style rules, open ★ decisions).
- Entries are `[English, Hebrew]` pairs passed to `heAdd([...])` in `i18n-he-<kind>.js`, name and description
  as separate pairs, English copied exactly from the data file. A second, different Hebrew for the same
  English is recorded as a conflict instead of silently overwriting.
- `node tools/i18n-check.js` is the accuracy gate — run it after every batch. It compares each Hebrew entry
  with its English for every digit and `NdM` die, damage types, conditions, ability names, number words
  (two/half/twice…), the terms in `tools/i18n-terms.js`, leftover English, and conflicting duplicates. It
  exits non-zero on errors. It cannot judge style — a human proofreads.
  `--todo spells:0` / `features:Bard` prints the next entries to translate; `--groups` lists the groups;
  `--review spells:0` writes a side-by-side EN|HE page to `tools/review/` (git-ignored locally) for proofreading.
- **A saved character keeps its own copy** of each spell/feature text from the day it was added, and the
  library has been edited since — so a sheet often holds an *older or hand-pasted version* that no library
  translation matches. `node tools/i18n-check.js --character Characters/<file>.json` lists exactly what is on
  that sheet and still English, flagging the older versions with the library's current text; give each its own
  `heAdd` entry (keep the numbers/terms in step with the library translation). This is how to cover one
  player's sheet without translating the whole library.
- Spell names also appear in the library pickers: typing Hebrew in a picker's search box does not find a spell
  yet (the filters match English names only) — a known follow-up.

**Adding or changing UI text:**
- A new static label/placeholder/tooltip: add `'English exactly as rendered': 'עברית'` to `I18N_HE`
  (keys are whitespace-collapsed; HTML entities are decoded, so write `&`, not `&amp;`). Split text sits
  in separate DOM nodes where the app splits it — a paragraph with `<b>`/`<i>` needs one entry per piece.
- A sentence with a number or name in it: add a `[regex, (m, tr) => hebrew]` to `I18N_HE_RX`
  (`tr()` translates a captured piece through the dictionary; `heN(n, one, many)` picks singular/plural).
- A sentence the JS assembles from several fixed words (the Build summary line): wrap those words in
  `I18N.t('…')` — the identity in English — and give each an entry. Don't rely on regexing the result.
- A word that means something else elsewhere (weapon tag "Light" vs the cantrip): key it
  `'<first class of its parent>|Light'` (see `wpn-tag|Light`) so it only applies in that element.
- Keep HP/AC/DC, the ability abbreviations, dice notation and the formula tokens PROF/LVL/STR… in Latin —
  the formula fields parse those tokens.
- Find what's still untranslated by running the app in Hebrew and calling `I18N.missing()` in the console
  (`copy(I18N.missingSkeleton())` gives paste-ready dictionary lines). Game-data text will show up in it too.

**Layout stays left-to-right** (no `dir="rtl"` on the page — that would mean mirroring ~200 left/right CSS
rules, the tab strip's scroll math, drawers, the wizard's 3D scenes and the map). After translating a node
the engine puts `dir="auto"` (or `rtl` when a line opens with an English name but is mostly Hebrew) on its
*text box* — never on a flex/grid container, which `dir` would mirror — so Hebrew sentences read and
align right-to-left. Each run of Latin/number text inside Hebrew becomes an LTR island (U+2066/U+2069),
so `1d4+4` / `+2` / `Bard 6` stay in one piece. Keep invisible bidi characters out of source: write them as
`\u2066` escapes.

**Fonts:** Cinzel and Crimson Pro have no Hebrew. `fonts/frank-ruhl-libre-hebrew.woff2` is aliased to both
family names in `styles.css` with `unicode-range` limited to the Hebrew block. **Those `@font-face` weight/
style descriptors must mirror the Google Fonts `<link>` in `index.html`** (Cinzel 500/700; Crimson Pro 400,
600, 400 italic): the browser picks a weight/style set first and only then looks glyphs up inside it, so a
Hebrew face with different descriptors gets chosen for Latin text too and strips it of glyphs. If you change
the `<link>`, change those rules to match.

**Verifying:** there's no test runner, so check in a browser: English must look exactly as before (the only
intended difference is that Hebrew text already in the app now uses the bundled font); in Hebrew, click
every tab/modal and check `I18N.missing()`, watch for clipped labels and Hebrew-only overflow at tablet
widths, and confirm no translated text appears in a saved character (the export is still exactly `S`).

## End-of-task changelog line

After finishing a change (a bug fix, a new feature, a data addition/correction — anything the user
might want in a GitHub commit message or release notes), end the response with a short suggested
title line for it, clearly marked so it's easy to spot and copy, e.g.:

> **Changelog:** Add advantage-on-save reminders to Features/Skills/Overview

Keep it to one line, written the way a changelog entry reads (imperative, no trailing period), not
a recap of the conversation. This is a convenience, not a commit — don't run any git commands
because of it, and skip it entirely for pure investigation/discussion turns with no actual change.
