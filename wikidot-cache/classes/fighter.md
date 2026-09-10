# Fighter

Source: https://dnd5e.wikidot.com/fighter
Fetched: 2026-09-05

## Level progression table

| Level | Proficiency Bonus | Features |
|-------|-------------------|----------|
| 1st | +2 | Fighting Style, Second Wind |
| 2nd | +2 | Action Surge (x1) |
| 3rd | +2 | Martial Archetype |
| 4th | +2 | Ability Score Improvement, Martial Versatility (Optional) |
| 5th | +3 | Extra Attack (x1) |
| 6th | +3 | Ability Score Improvement, Martial Versatility (Optional) |
| 7th | +3 | Martial Archetype feature |
| 8th | +3 | Ability Score Improvement, Martial Versatility (Optional) |
| 9th | +4 | Indomitable (x1) |
| 10th | +4 | Martial Archetype feature |
| 11th | +4 | Extra Attack (x2) |
| 12th | +4 | Ability Score Improvement, Martial Versatility (Optional) |
| 13th | +5 | Indomitable (x2) |
| 14th | +5 | Ability Score Improvement, Martial Versatility (Optional) |
| 15th | +5 | Martial Archetype feature |
| 16th | +5 | Ability Score Improvement, Martial Versatility (Optional) |
| 17th | +6 | Action Surge (x2), Indomitable (x3) |
| 18th | +6 | Martial Archetype feature |
| 19th | +6 | Ability Score Improvement, Martial Versatility (Optional) |
| 20th | +6 | Extra Attack (x3) |

## Subclass

Category: **Martial Archetype**, first chosen at **3rd level**.
Subclass feature rows: 3 (choice), 7, 10, 15, 18.

## Subclass list (official, non-UA)

- Arcane Archer — `fighter:arcane-archer`
- Banneret (Purple Dragon Knight) — `fighter:banneret`
- Battle Master — `fighter:battle-master` (already in FEATURE_LIB)
- Cavalier — `fighter:cavalier`
- Champion — `fighter:champion` (already in FEATURE_LIB)
- Echo Knight — `fighter:echo-knight`
- Eldritch Knight — `fighter:eldritch-knight`
- Psi Warrior — `fighter:psi-warrior`
- Rune Knight — `fighter:rune-knight`
- Samurai — `fighter:samurai` (already in FEATURE_LIB)

Out of scope (UA/archived): Arcane Archer (2016/2017), Brute, Cavalier (UA), Knight, Monster Hunter, Psi Knight, Psychic Warrior, Rune Knight (UA), Samurai (UA), Scout, Sharpshooter.

## Core class features (full text, fetched 2026-09-11)

**Fighting Style (1st level)** — choose one, can't repeat: Archery (+2 to ranged attack rolls); Defense (+1 AC
while wearing armor); Dueling (+2 damage with a one-handed melee weapon, no other weapon in the other hand);
Great Weapon Fighting (reroll damage dice that show 1 or 2 on a two-handed/versatile melee weapon, must use the
new roll); Protection (with a shield, impose disadvantage on an attack against another creature within 5 ft.);
Two-Weapon Fighting (add ability modifier to the second attack's damage in two-weapon fighting).
(TCoE optional styles also exist on the site — Blind Fighting, Interception, Superior Technique, Thrown Weapon
Fighting, Unarmed Fighting — out of scope, matching this repo's PHB-first convention.)

**Second Wind (1st level)** — bonus action: regain 1d10 + fighter level HP. Once per short/long rest.

**Action Surge (2nd level)** — take one additional action on your turn. Once per short/long rest; twice before a
rest (but only once on the same turn) starting at 17th level.

**Martial Archetype (3rd level)** — subclass choice; further features at 7th, 10th, 15th, 18th.

**Ability Score Improvement** — at 4th, 6th, 8th, 12th, 14th, 16th, 19th: +2 to one score, or +1 to two scores
(or a feat).

**Extra Attack (5th level)** — attack twice instead of once with the Attack action. Three attacks at 11th level,
four at 20th.

**Indomitable (9th level)** — reroll a failed saving throw (must use the new roll). Once per long rest; twice at
13th level, three times at 17th.

Verified against FEATURE_LIB 2026-09-11: Indomitable's description was missing the 13th/17th-level scaling note
(fixed); Battle Master's Combat Superiority text and pickCap both undercounted total maneuvers known at 15th
level (said 7, corrected to 9 — confirmed via the two-more-at-7th/10th/15th wording above).
