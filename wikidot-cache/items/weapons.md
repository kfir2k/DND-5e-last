# Weapons

Source: https://dnd5e.wikidot.com/weapons
Fetched: 2026-09-06

## Simple Melee Weapons

| Weapon | Cost | Damage | Weight | Properties |
|--------|------|--------|--------|------------|
| Club | 1 sp | 1d4 bludgeoning | 2 lb. | Light |
| Dagger | 2 gp | 1d4 piercing | 1 lb. | Finesse, light, thrown (20/60) |
| Greatclub | 2 sp | 1d8 bludgeoning | 10 lb. | Two-handed |
| Handaxe | 5 gp | 1d6 slashing | 2 lb. | Light, thrown (20/60) |
| Javelin | 5 sp | 1d6 piercing | 2 lb. | Thrown (30/120) |
| Light hammer | 2 gp | 1d4 bludgeoning | 2 lb. | Light, thrown (20/60) |
| Mace | 5 gp | 1d6 bludgeoning | 4 lb. | — |
| Quarterstaff | 2 sp | 1d6 bludgeoning | 4 lb. | Versatile (1d8) |
| Sickle | 1 gp | 1d4 slashing | 2 lb. | Light |
| Spear | 1 gp | 1d6 piercing | 3 lb. | Thrown (20/60), versatile (1d8) |

## Simple Ranged Weapons

| Weapon | Cost | Damage | Weight | Properties |
|--------|------|--------|--------|------------|
| Crossbow, light | 25 gp | 1d8 piercing | 5 lb. | Ammunition (80/320), loading, two-handed |
| Dart | 5 cp | 1d4 piercing | 1/4 lb. | Finesse, thrown (20/60) |
| Shortbow | 25 gp | 1d6 piercing | 2 lb. | Ammunition (80/320), two-handed |
| Sling | 1 sp | 1d4 bludgeoning | — | Ammunition (30/120) |

## Martial Melee Weapons

| Weapon | Cost | Damage | Weight | Properties |
|--------|------|--------|--------|------------|
| Battleaxe | 10 gp | 1d8 slashing | 4 lb. | Versatile (1d10) |
| Flail | 10 gp | 1d8 bludgeoning | 2 lb. | — |
| Glaive | 20 gp | 1d10 slashing | 6 lb. | Heavy, reach, two-handed |
| Greataxe | 30 gp | 1d12 slashing | 7 lb. | Heavy, two-handed |
| Greatsword | 50 gp | 2d6 slashing | 6 lb. | Heavy, two-handed |
| Halberd | 20 gp | 1d10 slashing | 6 lb. | Heavy, reach, two-handed |
| Lance | 10 gp | 1d12 piercing | 6 lb. | Reach, special |
| Longsword | 15 gp | 1d8 slashing | 3 lb. | Versatile (1d10) |
| Maul | 10 gp | 2d6 bludgeoning | 10 lb. | Heavy, two-handed |
| Morningstar | 15 gp | 1d8 piercing | 4 lb. | — |
| Pike | 5 gp | 1d10 piercing | 18 lb. | Heavy, reach, two-handed |
| Rapier | 25 gp | 1d8 piercing | 2 lb. | Finesse |
| Scimitar | 25 gp | 1d6 slashing | 3 lb. | Finesse, light |
| Shortsword | 10 gp | 1d6 piercing | 2 lb. | Finesse, light |
| Trident | 5 gp | 1d6 piercing | 4 lb. | Thrown (20/60), versatile (1d8) |
| War pick | 5 gp | 1d8 piercing | 2 lb. | — |
| Warhammer | 15 gp | 1d8 bludgeoning | 2 lb. | Versatile (1d10) |
| Whip | 2 gp | 1d4 slashing | 3 lb. | Finesse, reach |

## Martial Ranged Weapons

| Weapon | Cost | Damage | Weight | Properties |
|--------|------|--------|--------|------------|
| Blowgun | 10 gp | 1 piercing | 1 lb. | Ammunition (25/100), loading |
| Crossbow, hand | 75 gp | 1d6 piercing | 3 lb. | Ammunition (30/120), light, loading |
| Crossbow, heavy | 50 gp | 1d10 piercing | 18 lb. | Ammunition (100/400), heavy, loading, two-handed |
| Longbow | 50 gp | 1d8 piercing | 2 lb. | Ammunition (150/600), heavy, two-handed |
| Net | 1 gp | — | 3 lb. | Special, thrown (5/15) |

## Setting-Specific Weapons (not added to this app — out of SRD/PHB core scope)

- Forgotten Realms: Yklwa — 1 gp, 1d8 piercing, 3 lb., thrown (10/30)
- Dragonlance: Hoopak — 1 gp, 1d6 piercing melee / 1d4 bludgeoning ranged, 2 lb., ammunition (40/160), finesse, special, two-handed. Ignores ammunition property in melee; ranged mode uses sling bullets and deals 1d4 bludgeoning.
- Eberron: Double-Bladed Scimitar — 100 gp, 2d4 slashing, 6 lb., special, two-handed. Attack action + bonus action second strike for 1d4 slashing (instead of 2d4).

## Special property text

**Lance:** "You have disadvantage when you use a lance to attack a target within 5 feet of you. Also, a lance requires two hands to wield when you aren't mounted."

**Net:** "A Large or smaller creature hit by a net is restrained until it is freed. A net has no effect on creatures that are formless, or creatures that are Huge or larger. A creature can use its action to make a DC 10 Strength check, freeing itself or another creature within its reach on a success. Dealing 5 slashing damage to the net (AC 10) also frees the creature without harming it, ending the effect and destroying the net."

## Verification note (2026-09-06)

Cross-checked against this page: `data-equipment.js`'s `WEAPONS` table (damage die, damage type,
and every property flag — fin/light/ver/reach/heavy/h2/thrown/rng/loading — for all 38 PHB
weapons including Blowgun and Net) matches this table, with one fix made along the way: **Dart**
was previously tagged `rng:'20/60'` (the Ammunition property) but the real PHB property is
**Thrown (20/60)** — same family as Javelin/Handaxe, not Sling/Shortbow. Corrected to
`thrown:'20/60'`.

Cost and weight are **not** currently tracked in `WEAPONS` at all (no such fields exist in the
schema) — see the app's own Inventory/gold-tracking system for how it currently handles item cost
separately from combat stats, before deciding whether to add cost/weight here too.
