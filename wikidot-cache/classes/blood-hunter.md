# Blood Hunter (third-party: Critical Role / Matthew Mercer)

Source: https://dnd5e.wikidot.com/blood-hunter
Fetched: 2026-09-05 (level table + full feature list; first pass on 2026-09-05 only confirmed
the page existed and listed subclasses without extracting the table — this pass fills that gap)

Page exists and is indexed on dnd5e.wikidot.com despite being third-party (not WotC/SRD) content.

## Level progression table (1-20)

| Level | Prof. Bonus | Hemocraft Die | Blood Curses Known | Features |
|-------|-------------|---------------|---------------------|----------|
| 1  | +2 | 1d4  | 1 | Hunter's Bane, Blood Maledict |
| 2  | +2 | 1d4  | 1 | Fighting Style, Crimson Rite |
| 3  | +2 | 1d4  | 1 | Blood Hunter Order |
| 4  | +2 | 1d4  | 1 | Ability Score Improvement |
| 5  | +3 | 1d6  | 1 | Extra Attack |
| 6  | +3 | 1d6  | 2 | Brand of Castigation, Blood Maledict (2/rest) |
| 7  | +3 | 1d6  | 2 | Order feature, Crimson Rite improvement (extra rite known) |
| 8  | +3 | 1d6  | 2 | Ability Score Improvement |
| 9  | +4 | 1d6  | 2 | Grim Psychometry |
| 10 | +4 | 1d6  | 3 | Dark Augmentation |
| 11 | +4 | 1d8  | 3 | Order feature |
| 12 | +4 | 1d8  | 3 | Ability Score Improvement |
| 13 | +5 | 1d8  | 3 | Brand of Tethering, Blood Maledict (3/rest) |
| 14 | +5 | 1d8  | 4 | Hardened Soul, Crimson Rite improvement (extra rite known) |
| 15 | +5 | 1d8  | 4 | Order feature |
| 16 | +5 | 1d8  | 4 | Ability Score Improvement |
| 17 | +6 | 1d10 | 4 | Blood Maledict (4/rest) |
| 18 | +6 | 1d10 | 5 | Order feature |
| 19 | +6 | 1d10 | 5 | Ability Score Improvement |
| 20 | +6 | 1d10 | 5 | Sanguine Mastery |

Blood Hunter Order (subclass) is chosen at 3rd level; further order features come at 7, 11, 15, 18.

## Base class features already in FEATURE_LIB (through level 10)

Hunter's Bane (1), Blood Maledict (1) + 6 base blood curses (Binding, Bloated Agony, Exposure,
Eyeless, the Marked, Muddled Mind), Crimson Rite (2), Fighting Style (2), Extra Attack (5),
Brand of Castigation (6), Grim Psychometry (9), Dark Augmentation (10).

Crimson Rite's and Blood Maledict's per-rest/rite scaling at higher levels (2→3→4 curses/uses,
extra rites at 7th/14th) is folded as prose into those existing level-1/2 entries rather than
getting separate rows — matches how the existing entries are already written.

## Base features missing from FEATURE_LIB (added in this pass)

- **Blood Hunter Order** (3rd) — choice of subclass (Ghostslayer / Lycan / Mutant / Profane Soul).
- **Brand of Tethering** (13th) — Brand of Castigation's backlash damage doubles to 2x hemocraft
  modifier; branded creature can't Dash, and teleporting away deals it 4d6 psychic damage unless
  it succeeds a WIS save.
- **Hardened Soul** (14th) — advantage on saves vs. charmed and frightened.
- **Sanguine Mastery** (20th, capstone) — reroll a hemocraft die once per turn; regain one
  expended Blood Maledict use on a crimson-rite weapon crit.

## Subclass list (with wikidot slugs)

- Ghostslayer — `blood-hunter:ghostslayer` — added this pass, see `subclasses/blood-hunter-ghostslayer.md`
- Lycan — `blood-hunter:lycan` — added this pass, see `subclasses/blood-hunter-lycan.md`
- Mutant — `blood-hunter:mutant` — already in FEATURE_LIB as "Order of the Mutant"
- Profane Soul — `blood-hunter:profane-soul` — added this pass, see `subclasses/blood-hunter-profane-soul.md`
