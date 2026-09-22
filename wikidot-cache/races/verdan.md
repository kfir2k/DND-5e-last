# Verdan — dnd5e.wikidot.com/lineage:verdan

Cached 2026-09-22. Source: https://dnd5e.wikidot.com/lineage:verdan

Unlike the other "Exotic Lineages" cached alongside it (Sea Elf/Shadar-kai/Tabaxi/Tortle/Triton),
Verdan has only ONE published version — it was introduced in *Acquisitions Incorporated* (2019)
and was never given a Monsters of the Multiverse update, so there's no flexible-ASI/unified
"MotM version" the way there is for the others. This matches the existing `data-classes-races.js`
entry, which correctly has no `motm:true` flag on `verdan`.

Full trait list, in the order they appear on the page: Ability Score Increase, Age, Alignment,
Size, Speed, Black Blood Healing, Limited Telepathy, Persuasive, Telepathic Insight, Languages.
Confirmed via repeated targeted fetches: **there is no Darkvision trait anywhere on this page** —
Verdan (despite goblin ancestry) does not get darkvision. Also confirmed: Black Blood Healing,
Limited Telepathy, Persuasive, and Telepathic Insight are each **separate, always-on traits every
Verdan gets** — there is no "choose one" / Variant-Legacy-style mechanic bundling them; all four
apply simultaneously.

**Ability Score Increase**
"Your Charisma score increases by 2, and your Constitution score increases by 1." — confirms the
existing app data (`bonus:{cha:2,con:1}`) is correct.

**Size**
"Verdan start out similar in size to the goblins they were created from, ranging from 3 to 4 feet
in height. But at some point after reaching maturity, each verdan undergoes a sudden growth spurt
of 2 feet or more. At 1st level, you are a small creature. When you reach 5th level, you become a
medium creature." (i.e. Small at levels 1–4, Medium from level 5 on.)

**Speed**
"Your base walking speed is 30 feet."

**Darkvision**
Not present as a trait on this page — Verdan has no darkvision.

**Black Blood Healing**
"The black blood that is a sign of your people's connection to That-Which-Endures boosts your
natural healing. When you roll either 1 or 2 on any Hit Die you spend at the end of a short rest,
you can re-roll the die and must use the new roll."

**Limited Telepathy**
"You can telepathically speak to any creature you can see within 30 feet."

**Persuasive**
"Your people's lack of history makes you trustworthy and humble. You have proficiency in the
Persuasion skill."

**Telepathic Insight**
"Your mind's connection to the world around you strengthens your will. You have advantage on all
Wisdom and Charisma saving throws."

**Languages**
"You can speak, read, and write Common, Goblin, and one additional language."

No content on this page is marked (UA).
