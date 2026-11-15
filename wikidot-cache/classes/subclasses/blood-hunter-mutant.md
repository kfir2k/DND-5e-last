# Blood Hunter: Order of the Mutant (+ the Mutagens list)

Sources:
- https://dnd5e.wikidot.com/blood-hunter:mutant (features)
- http://dnd5e.wikidot.com/blood-hunter:mutagens (the mutagen list — a separate page, linked from the one above)

Fetched: 2026-11-15

Page attribution: "Source: DND Beyond" (the 2020 Blood Hunter). Nothing on either page is marked (UA).

**Completeness note — read before trusting this file for wording.** The fetch tool would only return
short exact quotes (under ~125 characters each) plus a close paraphrase, not the full page text. Every
feature and all 20 mutagens are listed below with all of their numbers, but only the lines in
"quotes" are word-for-word; the rest is paraphrase. If exact wording (not numbers) matters for a
future task, re-fetch the page.

## Features

**Mutagencraft (3rd level)** — "As a bonus action, you consume a mutagen, whose effects and side effects
last until you finish a short or long rest" "unless otherwise specified." Using an action ends all
active mutagens. Mutagens affect only their creator. Unused mutagens become inert at the next rest.

| Blood Hunter level | Mutagens created | Formulas known |
|---|---|---|
| 3rd | 1 | 4 |
| 7th | 2 | 5 |
| 11th | 2 | 6 |
| 15th | 3 | 7 |
| 18th | 3 | 8 |

**Formulas** — choose four mutagen formulas at 3rd level; the count grows with level per the table.
When you learn a new formula you may swap out one you already know.

**Strange Metabolism (7th level)** — immunity to poison damage and the poisoned condition. "As a bonus
action, you can ignore the negative side effect of one mutagen affecting you for 1 minute." Once per
long rest.

**Brand of Axiom (11th level)** — Brand of Castigation ends illusions and invisibility on the branded
creature. A branded creature in an alternate form must make a Wisdom save or revert and be stunned
until the end of your next turn; attempts to change form require the same save, with the same stun
on a failure.

**Blood Curse of Corrosion (15th level)** — gain the Blood Curse of Corrosion for Blood Maledict; it
doesn't count against blood curses known.

**Exalted Mutation (18th level)** — bonus action: end one active mutagen's effects and side effects,
then immediately start a known mutagen in its place. Uses equal to Hemocraft modifier (minimum 1),
regained on a long rest.

## Mutagens (20, in page order)

The page has no separate "Side effect" label — the side effect is each entry's "However, …" clause.
Prerequisites are stated only for Aether, Cruelty, Precision (11th level) and Reconstruction (7th level).

1. **Aether** (prerequisite: 11th level) — "You have a flying speed of 20 feet for 1 hour." Side
   effect: disadvantage on Strength and Dexterity checks for that hour.
2. **Alluring** — advantage on Charisma checks. Side effect: disadvantage on initiative rolls.
3. **Celerity** — "Your Dexterity score increases by 3, as does your maximum for that score." "Your
   Dexterity score and your maximum increase by 4 if you consume this mutagen at 11th level, and by 5
   at 18th level." Side effect: disadvantage on Wisdom saving throws.
4. **Conversant** — advantage on Intelligence checks. Side effect: disadvantage on Wisdom checks.
5. **Cruelty** (prerequisite: 11th level) — when you take the Attack action, one extra weapon attack as
   a bonus action. Side effect: disadvantage on Intelligence, Wisdom, and Charisma saving throws.
6. **Deftness** — advantage on Dexterity checks. Side effect: disadvantage on Wisdom checks.
7. **Embers** — resistance to fire damage; vulnerability to cold damage.
8. **Gelid** — resistance to cold damage; vulnerability to fire damage.
9. **Impermeable** — resistance to piercing damage; vulnerability to slashing damage.
10. **Mobility** — immunity to the grappled and restrained conditions; at 11th level also immune to the
    paralyzed condition. Side effect: disadvantage on Strength checks.
11. **Nighteye** — "You have darkvision out to a range of 60 feet." "If you already have darkvision, its
    range increases by 60 feet." Side effect: disadvantage on attack rolls and Wisdom (Perception)
    checks that rely on sight while in direct sunlight.
12. **Percipient** — advantage on Wisdom checks. Side effect: disadvantage on Charisma checks.
13. **Potency** — "Your Strength score increases by 3, as does your maximum for that score." "Your
    Strength score and your maximum increase by 4 if you consume this mutagen at 11th level, and by 5
    at 18th level." Side effect: disadvantage on Dexterity saving throws.
14. **Precision** (prerequisite: 11th level) — weapon attacks score a critical hit on a roll of 19 or 20.
    Side effect: disadvantage on Strength saving throws.
15. **Rapidity** — "Your speed increases by 10 feet." "At 15th level, your speed increases by an
    additional 5 feet." Side effect: disadvantage on Intelligence checks.
16. **Reconstruction** (prerequisite: 7th level) — for 1 hour, at the start of each of your turns you
    regain hit points equal to your proficiency bonus if you have at least 1 hit point but fewer than
    half your maximum. "However, your speed is reduced by 10 feet during this time."
17. **Sagacity** — "Your Intelligence score increases by 3, as does your maximum for that score." "Your
    Intelligence score and your maximum increase by 4 if you consume this mutagen at 11th level, and
    by 5 at 18th level." Side effect: disadvantage on Charisma saving throws.
18. **Shielded** — resistance to slashing damage; vulnerability to bludgeoning damage.
19. **Unbreakable** — resistance to bludgeoning damage; vulnerability to piercing damage.
20. **Vermillion** — one additional use of Blood Maledict. Side effect: disadvantage on death saving
    throws.

## How this is used in the app

`data-libraries.js` holds the six subclass features plus one `Mutagen: <name>` entry per formula
(pool `mutagens`, picked through Mutagencraft). Each mutagen is a switchable feature (`toggle:true`,
`ends:'short'`); its drawback effects are tagged `side:true` so they can be switched off on their own.
