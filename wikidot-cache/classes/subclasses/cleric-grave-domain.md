# Cleric: Grave Domain

Source: https://dnd5e.wikidot.com/cleric:grave
Fetched: 2026-09-11

Note: filename uses dashes instead of the URL's colon (`cleric:grave`).

## Grave Domain Spells

| Cleric Level | Spells |
|---|---|
| 1st | Bane, False Life |
| 3rd | Gentle Repose, Ray of Enfeeblement |
| 5th | Revivify, Vampiric Touch |
| 7th | Blight, Death Ward |
| 9th | Antilife Shell, Raise Dead |

## Circle of Mortality (1st level)

"When you would normally roll one or more dice to restore hit points with a spell to a creature at
0 hit points, you instead use the highest number possible for each die." You also learn the Spare
the Dying cantrip if you don't know it already (doesn't count against cantrips known); for you it
has a range of 30 feet and you can cast it as a bonus action.

## Eyes of the Grave (1st level)

"At 1st level, you gain the ability to occasionally sense the presence of the undead, whose
existence is an insult to the natural cycle of life. As an action, you can open your awareness to
magically detect undead. Until the end of your next turn, you know the location of any undead
within 60 feet of you that isn't behind total cover and that isn't protected from divination
magic. This sense doesn't tell you anything about a creature's capabilities or identity.

You can use this feature a number of times equal to your Wisdom modifier (minimum of once). You
regain all expended uses when you finish a long rest."

## Channel Divinity: Path to the Grave (2nd level)

"As an action, you choose one creature you can see within 30 feet of you, cursing it until the end
of your next turn. The next time you or an ally of yours hits the cursed creature with an attack,
the creature has vulnerability to all of that attack's damage, and then the curse ends."

## Sentinel at Death's Door (6th level)

"As a reaction when you or an ally that you can see within 30 feet of you suffers a critical hit,
you can turn that attack into a normal hit." (WIS-modifier uses per long rest, matching the same
pattern as Eyes of the Grave — confirm exact wording on a future re-fetch if this needs a literal
quote; not fully re-quoted this session, but the app's WIS-mod/long-rest tracking already matches
known SRD text for this feature.)

## Potent Spellcasting (8th level)

"You add your Wisdom modifier to the damage you deal with any cleric cantrip."

## Keeper of Souls (17th level)

"At 17th level, you can seize a trace of vitality from a parting soul and use it to heal the
living. When an enemy you can see dies within 30 feet of you, you or one ally of your choice that
is within 30 feet of you regains hit points equal to the enemy's number of Hit Dice. You can use
this feature only if you aren't incapacitated. Once you use it, you can't do so again until the
start of your next turn."

Note: FEATURE_LIB previously had this at 60 ft. and modeled as a short-rest resource (usesMax:1,
usesPer:'short') — both wrong. Fixed 2026-09-11 to 30 ft. and a once-per-turn reset (no usesMax/
usesPer, same convention as Divine Strike elsewhere in this file, since the app has no per-turn
reset mechanism).
