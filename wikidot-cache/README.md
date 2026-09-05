# wikidot-cache

Local cache of pages fetched from `dnd5e.wikidot.com` while verifying or sourcing game data for
this project (see the "Verifying game data against dnd5e.wikidot.com" section of `CLAUDE.md`).

Purpose: avoid re-fetching the same page from the network on a future task. Before fetching a
page from wikidot, check here first.

## Layout

One subfolder per category, mirroring the site sections used in `CLAUDE.md`:

- `spells/` — `https://dnd5e.wikidot.com/spell:<kebab-case-name>` pages, plus the master
  `spells` index page
- `classes/` — `https://dnd5e.wikidot.com/<class-name>` pages (fighter, wizard, etc.)
- `races/` — `https://dnd5e.wikidot.com/lineage` index and individual race pages
- `items/` — pages from `adventuring-gear`, `armor`, `weapons`, `wondrous-items`, `tools`
- `backgrounds/` — `https://dnd5e.wikidot.com/background:<kebab-case-name>` pages
- `feats/` — `https://dnd5e.wikidot.com/feat:<name>` pages

## File format

Save each fetched page as `<slug>.md` (the page's URL slug, kebab-case) in the matching
subfolder, containing:

1. The source URL
2. The date it was fetched
3. The raw extracted content (text/tables) actually used

Example: `wikidot-cache/spells/fireball.md` for `https://dnd5e.wikidot.com/spell:fireball`.

## Staleness

SRD content on wikidot rarely changes. If a cached page looks like it might be out of date for a
specific fact, re-fetch and overwrite the cached file rather than trusting a stale copy.
