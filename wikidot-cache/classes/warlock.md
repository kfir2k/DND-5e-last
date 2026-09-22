# Warlock

Source: https://dnd5e.wikidot.com/warlock
Fetched: 2026-09-05 (level table + subclass list); Core class features section added 2026-09-22.

## Level progression table

| Level | Proficiency Bonus | Features | Cantrips Known | Spells Known | Spell Slots | Slot Level | Invocations Known |
|-------|-------------------|----------|-----------------|--------------|-------------|------------|---------------------|
| 1st | +2 | Otherworldly Patron, Pact Magic | 2 | 2 | 1 | 1st | — |
| 2nd | +2 | Eldritch Invocations | 2 | 3 | 2 | 1st | 2 |
| 3rd | +2 | Pact Boon | 2 | 4 | 2 | 2nd | 2 |
| 4th | +2 | Ability Score Improvement, Eldritch Versatility (Optional) | 3 | 5 | 2 | 2nd | 2 |
| 5th | +3 | — | 3 | 6 | 2 | 3rd | 3 |
| 6th | +3 | Otherworldly Patron feature | 3 | 7 | 2 | 3rd | 3 |
| 7th | +3 | — | 3 | 8 | 2 | 4th | 4 |
| 8th | +3 | Ability Score Improvement, Eldritch Versatility (Optional) | 3 | 9 | 2 | 4th | 4 |
| 9th | +4 | — | 3 | 10 | 2 | 5th | 5 |
| 10th | +4 | Otherworldly Patron feature | 4 | 10 | 2 | 5th | 5 |
| 11th | +4 | Mystic Arcanum (6th level) | 4 | 11 | 3 | 5th | 5 |
| 12th | +4 | Ability Score Improvement, Eldritch Versatility (Optional) | 4 | 11 | 3 | 5th | 6 |
| 13th | +5 | Mystic Arcanum (7th level) | 4 | 12 | 3 | 5th | 6 |
| 14th | +5 | Otherworldly Patron feature | 4 | 12 | 3 | 5th | 6 |
| 15th | +5 | Mystic Arcanum (8th level) | 4 | 13 | 3 | 5th | 7 |
| 16th | +5 | Ability Score Improvement, Eldritch Versatility (Optional) | 4 | 13 | 3 | 5th | 7 |
| 17th | +6 | Mystic Arcanum (9th level) | 4 | 14 | 4 | 5th | 7 |
| 18th | +6 | — | 4 | 14 | 4 | 5th | 8 |
| 19th | +6 | Ability Score Improvement, Eldritch Versatility (Optional) | 4 | 15 | 4 | 5th | 8 |
| 20th | +6 | Eldritch Master | 4 | 15 | 4 | 5th | 8 |

## Subclass

Category: **Otherworldly Patron**, first chosen at **1st level**.
Subclass feature rows: 1 (choice), 6, 10, 14.

## Subclass list (official, non-UA)

- Archfey (PHB) — `warlock:archfey`
- Celestial (XGE) — `warlock:celestial`
- Fathomless (TCE) — `warlock:fathomless`
- Fiend (PHB) — `warlock:fiend` (already in FEATURE_LIB as "The Fiend")
- Genie (Fizban's) — `warlock:the-genie`
- Great Old One (PHB) — `warlock:great-old-one`
- Hexblade (XGE) — `warlock:hexblade`
- Undead (Van Richten's) — `warlock:undead`
- Undying (SCAG) — `warlock:undying`

Out of scope (UA/archived/multiclass crossover): Mage of Lorehold/Silverquill/Witherbloom, Celestial (archived), Genie (archived), Ghost in the Machine, Hexblade (archived), Lurker in the Deep, Noble Genie, Raven Queen, Seeker, Undead (archived), Undying Light.

## Core class features (full text, fetched 2026-09-22)

**Pact Magic (1st level)** — Charisma is your spellcasting ability. All warlock spell slots are the same
level (shown in the table above) and all recharge on a *short or long rest* (not just long rest, unlike
other full/half casters). Cantrips and spells known grow per the table.

**Eldritch Invocations (2nd level)** — you learn invocations granting magical fragments of forbidden
knowledge, some tied to a level or Pact Boon prerequisite. The number known grows per the "Invocations
Known" column above (2 at 2nd, growing to 8 at 18th). Whenever you gain a warlock level you can swap out
one invocation you know for a different one you qualify for. See `eldritch-invocations.md` in this same
folder for the full invocation list.

**Pact Boon (3rd level)** — choose one of four options (no UA marker on any of these four on the page;
a separate "Pact of the Star Chain (UA)" option exists lower on the page and is explicitly UA-tagged,
excluded per this repo's UA policy):
- **Pact of the Blade** — as an action, create a magical melee weapon in an empty hand (or summon a bonded
  magic weapon from an extradimensional space via a 1-hour ritual). You gain proficiency with it while
  wielding it, and it counts as magical for overcoming resistance/immunity to nonmagical attacks. It
  disappears if it ends a turn more than 5 ft. from you, or if you dismiss it (no action).
- **Pact of the Chain** — learn *find familiar* as a ritual, not counting against spells known; when cast,
  you can choose an imp, pseudodragon, quasit, or sprite in addition to the normal familiar forms. You can
  also, in combat, forgo one of your own attacks to let your familiar use its reaction to make one attack.
- **Pact of the Tome** — your patron gives you a Book of Shadows; choose three cantrips from any class's
  spell list, which you can cast at will while the book is on your person — they don't count against your
  number of cantrips known. If the book is lost, a 1-hour ceremony during a short/long rest gets you a
  replacement; it turns to ash when you die.
- **Pact of the Talisman** — your patron gives you an amulet. When its wearer fails an ability check, they
  can add a d4 to the roll (potentially turning failure into success), a number of times equal to your
  proficiency bonus, refreshing on a long rest. Replaceable the same way as the other pacts if lost.

**Ability Score Improvement** — at 4th, 8th, 12th, 16th, 19th: +2 to one score, or +1 to two scores (or a
feat).

**Mystic Arcanum (11th/13th/15th/17th level)** — choose one 6th-level warlock spell (7th at 13th, 8th at
15th, 9th at 17th); cast it once per long rest with no spell slot required.

**Eldritch Master (20th level)** — action, spend 1 minute entreating your patron for the return of your
expended magic; regain all expended Pact Magic spell slots. Usable once per long rest even if interrupted
before completion (uses the rest's recovery either way).

Verified against FEATURE_LIB 2026-09-22 while researching Eldritch Invocations/Pact Boon for the
level-up-picker overhaul — Pact Boon was previously a single prose line with no individual pact entries;
Eldritch Invocations had no data in the app at all.
