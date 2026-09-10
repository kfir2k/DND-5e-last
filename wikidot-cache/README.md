# wikidot-cache

Local cache of pages fetched from `dnd5e.wikidot.com` while verifying or sourcing game data for
this project (see the "Verifying game data against dnd5e.wikidot.com" section of `CLAUDE.md`).

Purpose: avoid re-fetching the same page from the network on a future task. Before fetching a
page from wikidot, check here first.

## Layout

One subfolder per category, mirroring the site sections used in `CLAUDE.md`:

- `spells/` — `https://dnd5e.wikidot.com/spell:<kebab-case-name>` pages, plus the master
  `spells` index page
- `classes/` — `https://dnd5e.wikidot.com/<class-name>` overview pages only (fighter, wizard, etc.)
- `classes/subclasses/` — each class's subclass pages
  (`https://dnd5e.wikidot.com/<class-name>:<subclass-slug>`, e.g. `fighter:rune-knight`)
- `races/` — `https://dnd5e.wikidot.com/lineage` index and individual race pages
- `items/` — pages from `adventuring-gear`, `armor`, `weapons`, `wondrous-items`, `tools`
- `backgrounds/` — `https://dnd5e.wikidot.com/background:<kebab-case-name>` pages
- `feats/` — `https://dnd5e.wikidot.com/feat:<name>` pages

## File format

Save each fetched page as `<slug>.md` (the page's URL slug, kebab-case) in the matching
subfolder, containing:

1. The source URL
2. The date it was fetched
3. **The complete content fetched from the page — everything, not a subset picked for the current
   task.** "The part I actually needed" is not an acceptable filter; the next task that opens this
   file needs the parts you didn't. For a class page that means the full level-progression table,
   every base-class feature's complete text (not summarized), every fighting-style/maneuver/
   invocation-style option list in full with exact wording, and the complete subclass list — all
   of it, every time, regardless of what today's task happened to need. If one WebFetch call
   didn't return the whole page, make more calls until it's complete before writing the file.

A file that's missing something from the page it cites is worse than no file at all — it reads as
authoritative and stops a future session from ever re-checking it. When in doubt, fetch and save
more, not less.

Example: `wikidot-cache/spells/fireball.md` for `https://dnd5e.wikidot.com/spell:fireball`.

For any numeric/mechanical detail (dice, DCs, uses-per-rest, durations), prefer capturing the
**verbatim quoted text** from the page over a paraphrase — a WebFetch summary can state a rule
that isn't actually on the page, and a verbatim quote is what lets a future session catch that.
When a feature or option list differs by class (Fighting Style is the running example — the same
option can be core for one class and UA-only for another), note that explicitly instead of
assuming one class's list applies to another.

Wikidot slugs with a colon (`fighter:rune-knight`, `cleric:war`, `spell:fireball`, …) can't be used
verbatim as a Windows filename — replace the colon with a dash instead (`fighter-rune-knight.md`,
`cleric-war.md`), noting the substitution in the file's own header line so the real source URL is
still obvious.

## Staleness

SRD content on wikidot rarely changes. If a cached page looks like it might be out of date for a
specific fact, re-fetch and overwrite the cached file rather than trusting a stale copy.
