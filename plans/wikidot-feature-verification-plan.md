# Verify class/race/feat text against dnd5e.wikidot.com — progress & remaining work

## Context

Ongoing task: go through `FEATURE_LIB` and `RACE_LIB` in [data-libraries.js](../data-libraries.js)
class by class (then race by race), cross-checking every feature's mechanical text against
https://dnd5e.wikidot.com per [CLAUDE.md](../CLAUDE.md)'s "Verifying game data" section, fixing
inaccuracies, and making sure `wikidot-cache/` actually holds the full fetched content so future
passes don't re-derive the same facts. This file tracks what's done and what's left so the work can
resume in a new session.

**Read `CLAUDE.md`'s wikidot-verification section before continuing** — it was strengthened during
this work with rules learned the hard way:
- Scope is "official, non-UA," not "PHB-only" (Tasha's/Xanathar's/etc. content is in scope).
- Shared "choose one from a list" features (Fighting Style is the example) can have a **different**
  official option list per class — verify each class's own page, never copy one class's list to
  another.
- WebFetch summaries can hallucinate mechanical details — ask for **verbatim quoted text** before
  changing any dice/DC/uses-per-rest/duration, and prefer an existing cached verbatim quote over a
  fresh paraphrase-only fetch.
- A cache file must hold the **complete** fetched content (full level table, every base-class
  feature in full, every option list in full, complete subclass list) — not just the part that
  happened to matter for the task at hand. A partial cache file is treated as worse than no file.

## Done

- **Fighter** — base class features fully verified (Indomitable's 13th/17th-level scaling fixed;
  Battle Master maneuver-count math bug found and fixed, `pickCap` corrected from `{3:3,7:4,10:5,15:6}`
  to `{3:3,7:5,10:7,15:9}`). All 10 subclasses verified (Champion, Battle Master, Samurai, Arcane
  Archer, Banneret, Cavalier, Echo Knight, Eldritch Knight, Psi Warrior, Rune Knight) — fixed Warding
  Maneuver (Cavalier, missing weapon/shield requirement), Stone Rune and Storm Rune (Rune Knight,
  both missing their real mechanical payoff). Cache: `wikidot-cache/classes/fighter.md` and all 10
  `subclasses/` files are complete.
  - **Fighting Style overhaul**: the umbrella "Fighting Style" feature existed but had no actual
    selectable options anywhere in the library — fixed by adding every official option as its own
    searchable `FEATURE_LIB` entry, tagged `pool:'fs-<class>'` so it's excluded from auto-grant but
    shows up in the Features-tab search. Did this correctly *per class* after discovering the option
    lists differ: **Fighter** (11: Archery, Blind Fighting, Defense, Dueling, Great Weapon Fighting,
    Interception, Protection, Superior Technique, Thrown Weapon Fighting, Two-Weapon Fighting,
    Unarmed Fighting), **Paladin** (7: Blessed Warrior, Blind Fighting, Defense, Dueling, Great
    Weapon Fighting, Interception, Protection), **Ranger** (7: Archery, Blind Fighting, Defense,
    Druidic Warrior, Dueling, Thrown Weapon Fighting, Two-Weapon Fighting), **Blood Hunter** (4:
    Archery, Dueling, Great Weapon Fighting, Two-Weapon Fighting — homebrew, no wikidot source, kept
    to its original narrower list), **Bard — College of Swords** (2: Dueling, Two-Weapon Fighting).
    Cache updated: `classes/paladin.md` and `classes/ranger.md` now carry the verbatim Fighting Style
    option text and the official/UA breakdown per class.
  - **Note**: Paladin and Ranger only got the Fighting Style fix — their *other* base-class features
    and subclasses (Sacred Oaths, Ranger Conclaves) have **not** been through a full verification
    pass yet. Treat them as not-yet-started for the rest of this plan.

- **Cleric** — base class fully verified (Destroy Undead was missing its entire CR-threshold table,
  fixed; Divine Intervention was missing the 20th-level auto-success upgrade, fixed; added a level-1
  "Divine Domain" pointer entry so a level-1 Cleric has *something* findable in the Features search
  before Channel Divinity unlocks at 2nd — this was a real UX gap, every other class has a real
  level-1 entry). All 14 official domains verified (Arcana, Death, Forge, Grave, Knowledge, Life,
  Light, Nature, Order, Peace, Tempest, Trickery, Twilight, War) — only Grave Domain needed a fix
  (Keeper of Souls: range was 60 ft., should be 30 ft.; was modeled as a short-rest resource, is
  actually a once-per-turn effect). Cache: `classes/cleric.md` rewritten with the complete level
  table (previously missing rows 11–16/19) and full base-feature text; added the two missing domain
  cache files (`cleric-grave-domain.md`, `cleric-life-domain.md`); the other 12 domains already had
  good cache files from an earlier session and were confirmed still accurate.

## Remaining classes (full base-class + all-subclasses pass, same depth as Fighter/Cleric)

Suggested order — pick whichever, no dependency between them:

- [ ] **Paladin** — finish the pass (Fighting Style already done). Base features: Divine Sense, Lay
  on Hands, Divine Smite, Divine Health, Aura of Protection, Aura of Courage, Extra Attack, Improved
  Divine Smite, Cleansing Touch, Aura Improvements. `classes/paladin.md` cache already has a "Base
  class feature text" section from a prior session — read it first, it may already cover most of
  this. Sacred Oaths to verify: Devotion, Ancients, Vengeance, Conquest, Redemption, Glory, Crown,
  Watchers, Oathbreaker (9 total per the cache's subclass list).
- [ ] **Ranger** — finish the pass (Fighting Style already done). Base features: Favored Enemy,
  Natural Explorer, Primeval Awareness, Extra Attack, Land's Stride, Hide in Plain Sight, Vanish,
  Feral Senses, Foe Slayer. Ranger Conclaves to verify: Hunter, Beast Master, Gloom Stalker,
  Horizon Walker, Monster Slayer, Fey Wanderer, Swarmkeeper, Drakewarden (8 total per cache).
- [ ] **Barbarian** — Rage, Unarmored Defense, Reckless Attack, Danger Sense, Extra Attack, Fast
  Movement, Feral Instinct, Brutal Critical, Relentless Rage, Persistent Rage, Indomitable Might,
  Primal Champion. Primal Paths to verify (cache lists Berserker, Totem Warrior, Ancestral Guardian,
  Storm Herald, Zealot, Beast, Wild Magic, Battlerager, Giant — check `classes/barbarian.md` for the
  exact confirmed list).
- [ ] **Bard** — Bardic Inspiration (done — verified while fixing Fighting Style, no issues found),
  Jack of All Trades, Song of Rest, Expertise, Font of Inspiration, Countercharm, Magical Secrets,
  Superior Inspiration. Colleges to verify: Lore, Valor, Glamour, Swords (Fighting Style already
  done), Whispers, Eloquence, Creation, Spirits (8 total per cache).
- [ ] **Druid** — Druidic, Wild Shape, Timeless Body, Beast Spells, Archdruid. Circles to verify:
  Land, Moon, Dreams, Shepherd, Spores, Stars, Wildfire.
- [ ] **Monk** — Unarmored Defense, Martial Arts, Ki, Unarmored Movement, Deflect Missiles, Slow
  Fall, Extra Attack, Stunning Strike, Ki-Empowered Strikes, Evasion, Stillness of Mind, Purity of
  Body, Tongue of the Sun and Moon, Diamond Soul, Timeless Body, Empty Body, Perfect Self. Monastic
  Traditions to verify: Open Hand, Shadow, Four Elements, Long Death, Sun Soul, Drunken Master,
  Kensei, Astral Self, Mercy, Ascendant Dragon.
- [ ] **Rogue** — Expertise, Sneak Attack, Thieves' Cant, Cunning Action, Uncanny Dodge, Evasion,
  Reliable Talent, Blindsense, Slippery Mind, Elusive, Stroke of Luck. Roguish Archetypes to verify:
  Thief, Assassin, Arcane Trickster, Mastermind, Swashbuckler, Inquisitive, Scout, Phantom, Soulknife.
- [ ] **Sorcerer** — Sorcerous Origin, Font of Magic, Metamagic, Sorcerous Restoration. Origins to
  verify: Draconic Bloodline, Wild Magic, Divine Soul, Shadow Magic, Storm Sorcery, Aberrant Mind,
  Clockwork Soul, Lunar Sorcery.
- [ ] **Warlock** — Otherworldly Patron, Pact Magic, Eldritch Invocations, Pact Boon, Mystic Arcanum
  (done — verified while checking base features, no issues found), Eldritch Master (done, no issues
  found). Patrons to verify: Archfey, Fiend, Great Old One, Celestial, Hexblade, Fathomless, Genie,
  Undead, Undying.
- [ ] **Wizard** — Arcane Recovery, Spell Mastery, Signature Spells. Arcane Traditions to verify:
  Abjuration, Conjuration, Divination, Enchantment, Evocation, Illusion, Necromancy, Transmutation,
  Bladesinging, War Magic, Chronurgy, Graviturgy, Order of Scribes.
- [ ] **Blood Hunter** — third-party content (Matt Mercer / Crit Role via D&D Beyond partnership),
  **no wikidot page exists** for it. Skip wikidot cross-checking entirely for this class; if it ever
  needs a pass, verify against the official Blood Hunter homebrew document instead and note the
  source explicitly in the cache (there's no `wikidot-cache` entry for a page that doesn't exist).

## Races (not started at all)

`RACE_LIB` in data-libraries.js covers 9 PHB common races (with subraces) plus ~37 exotic/monstrous
lineages (46 total groups). No wikidot fetching has happened for races yet — `wikidot-cache/races/`
is currently empty except the README.

Suggested approach, mirroring the class work:
1. Start with the 9 PHB common races (the "most important main races" from the original ask):
   Dwarf (Hill/Mountain), Elf (High/Wood/Drow), Halfling (Lightfoot/Stout), Human (Standard/Variant),
   Dragonborn, Gnome (Forest/Rock), Half-Elf, Half-Orc, Tiefling.
2. Fetch `https://dnd5e.wikidot.com/lineage` first (the index) and cache it, then each race's own
   page — same "fetch the complete page, save it whole" rule as classes.
3. Cross-check every `RACE_LIB` entry's mechanical text (darkvision range, resistance types, save
   proficiencies, spell-like abilities and their levels/uses-per-rest) against the page.
4. Exotic/monstrous races (Aarakocra, Aasimar, Changeling, ... Yuan-Ti) are explicitly in scope too
   (this app already builds all of them out) — just lower priority than the PHB 9.

## Feats (not started)

`FEATURE_LIB`'s `g:'Feats'` group has entries (Lucky, Alert, Observant, Mobile, Squat Nimbleness,
etc.) that were never part of this verification pass. `wikidot-cache/feats/` is empty except the
README. Each feat's page is `https://dnd5e.wikidot.com/feat:<name>`. Lower priority than classes/
races per the original ask, but worth a pass eventually for the same accuracy reasons.

## Backgrounds (not started, not yet requested)

`data-backgrounds.js` (`BACKGROUNDS`/`BACKGROUND_LIB`) is in CLAUDE.md's verification scope too but
hasn't come up in this conversation at all. Not scheduled here unless asked for.

## Process reminder for whoever resumes this

1. Read the class's existing `wikidot-cache/classes/<name>.md` file fully before fetching anything.
2. Fetch what's missing, asking WebFetch explicitly for verbatim quotes on anything numeric.
3. Fix `FEATURE_LIB`/`RACE_LIB` entries that are actually wrong (not just less detailed than the
   source — CLAUDE.md's "deliberate paraphrase" rule still applies to *flavor* wording, just not to
   wrong numbers/levels/ranges/uses).
4. Save the **complete** page content back to the cache file, overwriting a stale/partial one.
5. One class (or race batch) per turn, then report back with a summary before continuing — this was
   the working rhythm established so far and it's kept each batch reviewable.
