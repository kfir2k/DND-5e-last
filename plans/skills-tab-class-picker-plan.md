# Upgrade the Skills tab: editable class skill-choice picker

## Context

The Skills tab (`renderSkills()`, [app.js:1127](../app.js#L1127)) is currently a flat, freeform list —
every skill's proficiency dot cycles 0→1→2 (none/proficient/expertise) with no connection to the
class chosen on the Build screen. The class's "choose N skills from this list" rule
(`WIZ_CLASS_SKILLS`, [wizard.js:19-33](../wizard.js#L19)) is only ever applied once, inside the
character-creation wizard (`sceneSkills`, [wizard.js:409-429](../wizard.js#L409); flushed into the new
character at [wizard.js:633-635](../wizard.js#L633)). After that, there is no way to revisit that
choice — a player who wants to swap one trained skill for another has to manually track which dots
correspond to their class budget versus a free extra proficiency, with zero help from the UI. Race,
background, and feat grants already flow through the `fx` system into `fxSkillGrant()`
([app.js:173-177](../app.js#L173)) and show a "✦ {source}" badge, but the class's own skill *choice*
has no equivalent live editing surface.

This plan adds a persistent, editable "class training" picker directly in the Skills tab, wired to
the same skill-choice data the wizard already uses, so the class chosen on Build stays visibly and
mechanically connected to the Skills screen for the life of the character (not just at creation).

Scope note: this plan intentionally does **not** touch the Overview tab's "Trained Skills" mirror
(`renderOverviewSkillChips()`), the fx-grant badge system, or Bard/Rogue Expertise automation —
those were considered and explicitly deferred per user direction, to keep this change focused.

## Key architectural constraint

Scripts load in a fixed order (see CLAUDE.md): `data-classes-races.js` → ... → `app.js` →
`wizard.js` → `map.js`. `app.js` calls `load(); renderAll();` at its own top level
([app.js:5860-5862](../app.js#L5860)) — this executes **before** `wizard.js` has loaded, so anything
`app.js` needs at boot cannot reference wizard-only globals like `WIZ_CLASS_SKILLS`. The class
skill-choice table must therefore move to a file `app.js` can already see.

## Changes

**1. `data-classes-races.js`** — relocate the skill-choice table here (it's class rules data, not
wizard-specific), renamed for clarity since it's no longer wizard-only:
- Move `WIZ_CLASS_SKILLS` ([wizard.js:19-33](../wizard.js#L19)) into `data-classes-races.js`, placed
  after `SKILLS`/`CLASSES` (the `bard` entry does `SKILLS.map(s=>s[0])`, so it must come after
  `SKILLS`). Rename to `CLASS_SKILL_CHOICES`.

**2. `wizard.js`** — update references, and start tracking picks from creation:
- Replace all `WIZ_CLASS_SKILLS` references (`sceneSkills` at [wizard.js:410-411](../wizard.js#L410),
  and the step-gating check around [wizard.js:290](../wizard.js#L290)) with `CLASS_SKILL_CHOICES`.
- At the final data flush ([wizard.js:633-635](../wizard.js#L633)), add
  `data.classSkillPicks = WIZ.skills.slice();` so freshly created characters start with their picks
  already tracked — no migration guesswork needed for new characters.

**3. `app.js`**:
- `defaultState()` ([app.js:18-19](../app.js#L18)): add `classSkillPicks:[],` alongside `skills`/
  `favSkills`/`ovHidden`.
- New migration `migrateClassSkillPicks()`, called from `load()` alongside the existing
  `migrateAttacks()`/`migrateNotes()`/`migrateBuild()` ([app.js:911-913](../app.js#L911)). For
  characters saved before this change (`classSkillPicks` missing), backfill by taking skills in the
  class's `options` list where `S.skills[k]===1` (proficient, not expertise) **and**
  `fxSkillGrant(k)===0` (not already covered by a race/background/feat grant, so we don't take
  credit for something else's grant), up to `spec.count`, in `SKILLS` order. This is a best-effort
  reconstruction — it does not alter any existing `S.skills` values, only backfills the new
  bookkeeping array.
- `PAGES.skills` template ([app.js:510-521](../app.js#L510)): add a panel before the existing "Skills"
  panel, e.g. `<div class="panel" id="classSkillPanel"><h2>Class Training</h2><div id="classSkillGrid"></div></div>`,
  hidden via JS when the current class has no entry in `CLASS_SKILL_CHOICES` (custom/blank class —
  mirrors the `if(!spec)` fallback `sceneSkills` already uses).
- New `renderClassSkillPicker()`, called from `renderSkills()` ([app.js:1127](../app.js#L1127)) so it
  stays in sync with every existing call site (`renderAll()` at
  [app.js:5819](../app.js#L5819), `fxRefresh()` at [app.js:1969](../app.js#L1969), and the skill-dot click
  handler itself). Reuses the wizard's existing `.wiz-skillgrid`/`.wiz-skillchip` CSS
  ([styles.css:3152-3163](../styles.css#L3152)) for visual consistency with the Build flow, accented
  with `CLASS_COLOR[S.classId]` (same lookup already used for the Features tab's source byline,
  [app.js:1841](../app.js#L1841)):
  - Shows "{class name} trains in {count} skills below ({picked}/{count} chosen)".
  - Renders one chip per `spec.options` entry; selected chips reflect `S.classSkillPicks`; unselected
    chips disable once the count cap is reached (mirrors `sceneSkills`'s own `full` logic,
    [wizard.js:424](../wizard.js#L424)).
  - Click handler toggles membership in `S.classSkillPicks`: adding a pick sets `S.skills[k]=1` only
    if currently `0` (never downgrades an existing expertise); removing a pick resets `S.skills[k]`
    to `0` **only if** it was exactly `1` (so it doesn't erase an expertise or an fx-grant the player
    separately has) — mirrors the wizard's own flush semantics but live-editable.
- Inside the existing per-skill row markup in `renderSkills()` ([app.js:1142-1149](../app.js#L1142)),
  add a small class-colored inline tag (new `.sk-classtag` style, sized like the existing `.sk-fx`
  badges) next to any skill present in `S.classSkillPicks`, so the main list itself visually marks
  which dots are the player's class-training choices versus other manual proficiencies — this is the
  "locked vs. free" distinction the direction calls for, scoped to class picks only (not a full
  source-color system across every grant type).

**4. `styles.css`** — small additions only:
- Scope override so `.wiz-skillgrid` reads well inside the narrower Skills-tab panel instead of the
  wizard's full-screen layout (e.g. `#classSkillGrid .wiz-skillgrid{justify-content:flex-start;max-width:none}`).
- New `.sk-classtag` rule for the inline class-training tag on skill rows.

## Known edge cases (deliberately left as-is, not regressions)

- Changing `S.classId` later (Build tab) does not auto-migrate old picks — stale picks simply stop
  counting toward the new class's budget (its `options` list won't include them) and remain as
  ordinary manual proficiencies. Consistent with how `BUILD_FIELDS` overrides elsewhere never
  silently discard player data.
- A skill that's both class-picked and already fx-granted (e.g. background also gives it) is a
  slightly "wasted" pick by strict 5e rules, but mechanically harmless since `effSkill()` already
  takes the max of manual/pick vs. grant — no double bonus.

## Verification

- Serve the folder (`npx serve .`) and exercise in a browser (no test runner in this repo).
- New character via the wizard (e.g. Rogue): confirm the 4 skills picked in `sceneSkills` show up
  pre-checked in the Skills tab's new "Class Training" panel, and the main skill list shows the
  class tag next to each.
- Toggle picks in the Skills tab: confirm the count cap disables further picks at the limit, and
  unpicking a skill that's only proficient (not expertise, not fx-granted) clears its dot back to
  none.
- Load a character created before this change (or an exported `.json` from `Characters/`): confirm
  `migrateClassSkillPicks()` backfills a sensible set without altering existing skill dots.
- Set `S.classId` to a class with no `CLASS_SKILL_CHOICES` entry (or blank/custom): confirm the
  "Class Training" panel hides and the rest of the Skills tab behaves exactly as it does today.
- Switch characters via the roster: confirm picks are per-character (stored in `S`, saved under
  each character's own `dnd5e-binder-char-<id>` key) and don't bleed across characters.
