# Cleric

Source: https://dnd5e.wikidot.com/cleric
Fetched: 2026-09-05 (level table gaps filled + full feature text added 2026-09-11)

## Level progression table (complete, all 20 rows)

| Level | Proficiency Bonus | Features | Cantrips Known | 1st | 2nd | 3rd | 4th | 5th | 6th | 7th | 8th | 9th |
|-------|-------------------|----------|----------------|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| 1st | +2 | Spellcasting, Divine Domain | 3 | 2 | — | — | — | — | — | — | — | — |
| 2nd | +2 | Channel Divinity (x1), Divine Domain feature | 3 | 3 | — | — | — | — | — | — | — | — |
| 3rd | +2 | — | 3 | 4 | 2 | — | — | — | — | — | — | — |
| 4th | +2 | Ability Score Improvement | 4 | 4 | 3 | — | — | — | — | — | — | — |
| 5th | +3 | Destroy Undead (CR 1/2) | 4 | 4 | 3 | 2 | — | — | — | — | — | — |
| 6th | +3 | Channel Divinity (x2), Divine Domain feature | 4 | 4 | 3 | 3 | — | — | — | — | — | — |
| 7th | +3 | — | 4 | 4 | 3 | 3 | 1 | — | — | — | — | — |
| 8th | +3 | Ability Score Improvement, Destroy Undead (CR 1), Divine Domain feature | 4 | 4 | 3 | 3 | 2 | — | — | — | — | — |
| 9th | +4 | — | 4 | 4 | 3 | 3 | 3 | 1 | — | — | — | — |
| 10th | +4 | Divine Intervention | 5 | 4 | 3 | 3 | 3 | 2 | — | — | — | — |
| 11th | +4 | Destroy Undead (CR 2) | 5 | 4 | 3 | 3 | 3 | 2 | 1 | — | — | — |
| 12th | +4 | Ability Score Improvement | 5 | 4 | 3 | 3 | 3 | 2 | 1 | — | — | — |
| 13th | +5 | — | 5 | 4 | 3 | 3 | 3 | 2 | 1 | 1 | — | — |
| 14th | +5 | Destroy Undead (CR 3) | 5 | 4 | 3 | 3 | 3 | 2 | 1 | 1 | — | — |
| 15th | +5 | — | 5 | 4 | 3 | 3 | 3 | 2 | 1 | 1 | 1 | — |
| 16th | +5 | Ability Score Improvement | 5 | 4 | 3 | 3 | 3 | 2 | 1 | 1 | 1 | — |
| 17th | +6 | Destroy Undead (CR 4), Divine Domain feature | 5 | 4 | 3 | 3 | 3 | 2 | 1 | 1 | 1 | 1 |
| 18th | +6 | Channel Divinity (x3) | 5 | 4 | 3 | 3 | 3 | 3 | 1 | 1 | 1 | 1 |
| 19th | +6 | Ability Score Improvement | 5 | 4 | 3 | 3 | 3 | 3 | 2 | 1 | 1 | 1 |
| 20th | +6 | Divine Intervention improvement | 5 | 4 | 3 | 3 | 3 | 3 | 2 | 2 | 1 | 1 |

## Core class features (full text)

**Spellcasting** — 3 cantrips known at 1st level (grows with level per the Cleric table's own
cantrips-known column above). Prepares a number of cleric spells each day equal to WIS modifier +
cleric level (minimum 1); Wisdom is the spellcasting ability; spell save DC = 8 + proficiency +
WIS modifier.

**Divine Domain** (1st level) — subclass choice; further features at 2nd, 6th, 8th, and 17th.

**Channel Divinity: Turn Undead** — action, present holy symbol: each undead that can see or hear
you within 30 ft. makes a WIS save or is turned for 1 minute or until it takes damage. Available
×1 at 2nd level, ×2 at 6th, ×3 at 18th; regains all uses on a short or long rest.

**Destroy Undead** — a turned undead is instantly destroyed instead if its CR is at or below a
threshold that rises with level: 1/2 at 5th, 1 at 8th, 2 at 11th, 3 at 14th, 4 at 17th. (This
threshold table was missing from the originally-cached level table above — rows 11/14/17 were
compressed/omitted on first fetch; confirmed complete on the 2026-09-11 re-fetch.)

**Divine Intervention** (10th level) — action: describe the aid you seek and roll percentile
dice; on a roll ≤ your cleric level, your deity intervenes (DM adjudicates the effect). On
success, can't use again for 7 days; on failure, can try again after a long rest. At 20th level,
succeeds automatically with no roll required.

## Subclass

Category: **Divine Domain**, first chosen at **1st level**.
Subclass feature rows: 1 (choice), 2, 6, 8, 17.

## Subclass list (official, non-UA, non-planar-variant)

- Arcana — `cleric:arcana`
- Death — `cleric:death`
- Forge — `cleric:forge`
- Grave — `cleric:grave` (in FEATURE_LIB as "Grave Domain"; full text cached separately at
  `subclasses/cleric-grave-domain.md`)
- Knowledge — `cleric:knowledge`
- Life — `cleric:life` (in FEATURE_LIB as "Life Domain"; full text cached separately at
  `subclasses/cleric-life-domain.md`)
- Light — `cleric:light`
- Nature — `cleric:nature`
- Order — `cleric:order`
- Peace — `cleric:peace`
- Tempest — `cleric:tempest`
- Trickery — `cleric:trickery`
- Twilight — `cleric:twilight`
- War — `cleric:war`

Also noted on page but out of scope: planar-variant domains (Solidarity, Strength, Ambition, Zeal)
and UA versions (Fate, City, Protection, Twilight-UA, Unity).

All 14 official domains are already fully built out in FEATURE_LIB, each with its own cache file
under `subclasses/cleric-*.md` (or `cleric-*-domain.md`) — see that folder.

## Verification note (2026-09-11)

Cross-checked all base-class features and all 14 domains against this page and the 12
already-cached domain files. Found and fixed two real bugs in FEATURE_LIB:
- **Destroy Undead** had no CR thresholds at all (just "low CR" with no numbers) — added the full
  1/2 → 1 → 2 → 3 → 4 progression above.
- **Divine Intervention** was missing the 20th-level automatic-success upgrade.
- **Keeper of Souls** (Grave Domain, 17th level) said 60 ft. and was modeled as a short-rest
  resource; the actual range is 30 ft. and the reset is once-per-turn, not rest-based (see
  `subclasses/cleric-grave-domain.md` for the fix detail).

Every other domain (Arcana, Death, Forge, Knowledge, Life, Light, Nature, Order, Peace, Tempest,
Trickery, Twilight, War) was already accurate against its cached page — no changes needed.
