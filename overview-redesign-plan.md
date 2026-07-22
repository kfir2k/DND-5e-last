# Overview Redesign — Plan

Goal: Overview becomes the character's **title page** — the screen you open at session start and show to the table. Today it's a leftover mix (abilities, vitals, HP, inspiration/XP, small "at a glance"), and most of what defines the character isn't on it. Everything stays editable in place (paper first); the deep editing homes stay on their own tabs.

---

## 1. What's missing today (the "relevant stuff")

- **Identity** — name, class, subclass, level, race, background live in the header or Build tab; the Overview doesn't say *who this is*.
- **Saving throws** — nowhere on Overview (only Skills tab).
- **Trained skills** — no summary of what you're actually good at.
- **Spellcasting numbers** — Save DC / spell attack are buried in Spells.
- **Wealth** — total coin not visible outside Inventory.
- **Attunement** — not tracked anywhere in the tool (3-slot rule).
- **Active states / concentration** — combat-only today, but "Raging / concentrating on X" is character state, not combat state.
- **Level-up outlook** — XP to next level, next ASI/feat level, when proficiency bumps.
- **Personality** — traits/ideals/bonds/flaws are two tabs away; a whisper of them belongs on the title page.

## 2. New layout (top to bottom)

**A. Identity banner (full width)**
Crest tile (class icon in the class color, first letter fallback) · Name in large Cinzel · line 2: "Gloom Stalker Ranger 5 · Wood Elf · Haunted One · Neutral Good" (all fields editable inline, class/level pull from Build). Right side: **Inspiration star** (existing toggle, bigger) and **XP bar** — current XP over the PHB threshold to next level, with "2,300 to level 6" under it.

**B. Vitals strip (full width, reuse combat-bar cells)**
Same uniform cells as the combat HUD: HP mini-bar (with temp), AC, Init, Speed, Prof, Passive, Vision. One component, two homes — they already share bindings, so this is markup reuse, not duplication.

**C. Main grid (two columns, stack on tablet)**

Left column:
- **Ability scores** — unchanged (already the editing home, looks right).
- **Saving throws** — the six compact tiles reused from Skills, half size.

Right column:
- **Trained skills** — chips only for proficient/expertise skills with their bonus ("Stealth +6 ●●", "Perception +5"), tap → jumps to Skills tab. Empty state nudges to Skills.
- **Spellcasting card** (casters only): Save DC, spell attack, slots-remaining pips summary, concentration banner mirror.
- **Wealth & attunement**: total coin ("142 gp equivalent" + per-coin small), and **3 attunement slots** — new `att` flag on Magic-type inventory items; slots show attuned item names, warn at 4+.
- **States** — mirror of the combat states chips + concentration (same data).

**D. Character whisper (full width, thin)**
One italic line per non-empty field: Traits · Ideals · Bonds · Flaws, truncated to a line each, tap → Character tab. Skipped entirely when empty.

**E. At a Glance** — retired; its numbers all live in B/C now.

## 3. Data changes (small)

- `equipment[i].att` (bool) — attuned toggle, shown on Magic items' rows in Inventory.
- XP thresholds table (PHB 1–20) in data-classes-races.js.
- Nothing else — identity, skills, saves, states, money, spell numbers all exist.

## 4. Build order

1. Identity banner + XP bar (thresholds table).
2. Vitals strip reuse + retire "At a Glance".
3. Right column: trained skills, spellcasting card, states mirror.
4. Wealth + attunement (inventory `att` toggle + overview slots).
5. Character whisper + polish pass (spacing, tablet stacking).
6. Verify: jsdom flow tests + old-save compatibility.

## 5. Open questions

1. XP bar: some tables use milestone leveling — hide the bar when XP field is empty?
2. Should the crest tile support a custom emoji/letter per character (fun for your friends), or stay class-based?
3. Trained-skill chips: show all proficiencies or top 6 by bonus?
