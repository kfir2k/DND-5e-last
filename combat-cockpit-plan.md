# Combat Cockpit — Plan (Option 3)

One-screen, tablet-first combat dashboard. Design north star: **as flexible as a paper sheet, as smart as an app**. Every number the app computes can be overridden; every card the app generates can be edited, hidden, or replaced by a hand-written one. Automation suggests — the player decides.

---

## 1. Principles

1. **Paper-first flexibility.** Anything auto-generated (attack bonuses, spell cast types, uses) has a manual override, exactly like the existing patterns: AC auto-engine toggle, "= PROF" uses toggle, editable spell meta/desc. New rule: *every card is editable in place; every derived field shows its math on tap.*
2. **Data-driven, class-agnostic.** The cockpit renders only from data every character already has: attack rows, spell cast-time pills, combat-flagged features with uses, effect reminders. A barbarian, wizard, or homebrew class all work with zero class-specific code.
3. **Tablet-first.** Tap targets ≥ 44px, no hover-only info (tap-to-expand everywhere, like the ★ badges), one screen in landscape — no scrolling mid-fight. Portrait stacks: survival → actions → resources.
4. **Nothing enforced.** No locked action economy (that was Option 4). The cockpit reminds and tracks; it never blocks. A player can tap two "actions" in a turn — their table, their rules.

---

## 2. Layout (landscape tablet)

```
┌────────────────────────────────────────────────────────────┐
│ TOP STRIP: name · ⭘ concentration banner · state chips     │
├──────────┬──────────────────────────────────┬──────────────┤
│ SURVIVAL │  DO SOMETHING (action cards)     │  RESOURCES   │
│  HP big  │  [filter: All Action Bonus       │  spell slots │
│  AC·Init │           Reaction Other]        │  states      │
│  ·Speed  │  ┌────────┐ ┌────────┐          │  reminders   │
│  hit dice│  │ card   │ │ card   │  …grid   │  ? rules     │
│  + rests │  └────────┘ └────────┘          │    drawer    │
└──────────┴──────────────────────────────────┴──────────────┘
```

Portrait / narrow: single column — top strip, survival row (compact), action grid, resources row.

---

## 3. Zones in detail

### 3.1 Top strip
- Character name + class/level chip (read-only, from Build).
- **Concentration banner**: when a concentration spell is cast from a card, it appears here ("⭘ Concentrating: Hunter's Mark — CON save when damaged"). Tap to drop. Manual set also possible (paper mode: type anything).
- **State chips**: free-form toggles the player defines once ("Raging", "Hidden", "Blessed", "Wild Shape"). Just labels — no mechanics attached unless the player links a feature's reminder to one (later, optional).

### 3.2 Survival (left)
- **HP card** — the biggest thing on screen. Current/max, temp HP, big −10/−5/−1/+1/+5/+10 buttons (existing hpPanel logic reused). Bar with bloodied/critical coloring (exists).
- **AC · Initiative · Speed** — one compact card, values from existing engine incl. feature bonuses and ★ stat reminders (badges render here too).
- **Hit dice + rest buttons** — existing logic, compact row.
- **Death saves**: hidden while HP > 0. At 0 HP the survival zone flips to a takeover card: big skull, 3+3 tap circles, "stabilized" button. (Paper flexibility: a small "show anyway" link for edge cases.)

### 3.3 Do something (center) — the heart
One grid of **action cards**, built from four sources:

| Source | Card shows | Tap does |
|---|---|---|
| Attacks (S.attacks) | name, +hit, damage, tags | expand: breakdown, notes |
| Spells (prepared/known, from Spells tab) | name, cast-type pill, slot pips inline, one-line desc | expand: full desc; "Cast" spends a slot (undo snackbar) |
| Combat features (S.features, combat flag) | name, uses dots, one-line desc | expand: full desc; tap dot spends a use |
| **Custom cards** (new) | free title + free text + optional cost | whatever the player wrote — pure paper |

- **Filter row**: All / Action / Bonus / Reaction / Other. Action type comes from data (spell cast-time pill; new `actionType` field on attacks and features, default "action") and is *always editable per card*.
- **Conditional cards**: optional condition text ("first turn of combat", "once per turn, needs advantage", "when hit"). Rendered amber with a ⏱ chip, sorted after unconditional cards of the same type. Never hidden.
- **Pin/hide**: any card can be pinned to the front or hidden from the cockpit (still lives in its home tab). Spell list for a full caster is long — default shows prepared spells only, toggle "show all".
- **Upcasting**: casting expands a one-row slot picker (levels with free slots) instead of auto-spending the lowest.

### 3.4 Resources (right)
- **Spell slots** — existing pips panel, unchanged behavior (hidden for non-casters).
- **States** — the chips' management (add/remove), mirrors top strip.
- **Reminders feed** — all ★ stat reminders + feature statnotes in one tappable list (they also stay on their stats).
- **? Rules drawer** — collapsible cheatsheet: standard actions (Dash, Dodge, Disengage, Help, Hide, Ready, Grapple, Shove), advantage/disadvantage, cover, opportunity attacks, concentration, conditions glossary. Static text in a data file; tap a term anywhere (condition chip, card) to open it at that entry.

---

## 4. Where every current Combat card goes

| Today | In cockpit |
|---|---|
| combat-hud (HP/AC strip) | absorbed into top strip + survival zone |
| Vitals panel | survival compact card (AC·Init·Speed) + reminders feed |
| Hit Points panel | survival HP card (same logic) |
| Hit Dice & Death Saves | survival; death saves become 0-HP takeover |
| Attacks & Spellcasting | action cards (attacks source) + atkNotes moves into a custom card |
| Spell Slots panel | resources zone (same pips) + inline pips on spell cards |
| Combat Features panel | action cards (features source) |

Nothing is deleted; other tabs (Spells, Features, Overview) stay the editing home. The cockpit is a *view* over the same S data — same pattern as renderCombatSlots today.

---

## 5. Data model changes (all additive, save-compatible)

- `S.attacks[i].actionType` ('action'|'bonus'|'reaction'|'other', default 'action'), `.cond` (text, optional)
- `S.features[i].actionType`, `.cond` (combat-flagged ones only; default 'action')
- spells: derive from SPELL_DB cast code; custom/unknown spells get `.actionType` editable (default from meta text if it starts with "Bonus Action" etc.)
- `S.customCards[]`: {title, text, actionType, cond, usesMax?, usesUsed?}
- `S.states[]`: strings; `S.concentration`: {name, note} | null
- `S.cockpit`: {pins:[], hidden:[], showAllSpells:false}
- New static data: `data-rules.js` (cheatsheet + conditions glossary)

Old saves: all fields optional with defaults → no migration needed beyond backfill-on-render (same pattern as spell meta/desc).

## 6. Build order (each step ships usable)

1. **Shell** — cockpit grid replaces combat tab; existing panels slotted into zones unchanged. Portrait stacking. *(pure layout, no data changes)*
2. **Action cards** — unified grid from attacks/spells/features, filter row, tap-to-spend with undo, expand-for-help. Inline slot pips.
3. **Flexibility layer** — per-card actionType editing, conditions (amber), custom cards, pin/hide, show-all-spells toggle.
4. **State & help layer** — concentration banner (auto-set on casting conc. spells), state chips, reminders feed, rules drawer + conditions glossary, death-saves takeover, upcast picker.
5. **Polish** — transitions, long-press shortcuts (long-press spell = expand without casting), print-friendly fallback?

## 7. Open questions

1. Rules drawer text: English SRD summaries fine, or Hebrew too?
2. Should casting a spell with a damage formula offer a dice-roll helper, or stay paper (you roll real dice)? Current lean: stay paper — show the formula big, no RNG.
3. Keep the old Combat tab reachable during transition (a "classic view" toggle), or hard switch?
