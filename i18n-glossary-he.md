# Hebrew glossary for the game-data translation

There is no established Hebrew edition of 5e to copy terms from (searched; nothing usable), so these are
**proposals**. Rows marked ★ need an owner's decision before the bulk of the work — a term chosen here is
used in hundreds of entries. Everything else is either already live in the app's UI or follows from it.

Terms that tools/i18n-check.js enforces live in `tools/i18n-terms.js`; change a term there and in this file
together, then search/replace it across `i18n-he-*.js`.

## How the text reads (style rules)

| Rule | Example |
|---|---|
| The English entries are terse notes, so the Hebrew is too — noun phrases and infinitives, not full sentences. | `Resistance to …` → `עמידות ל…` |
| No second-person **verbs** (they are gendered). The suffix ך (`שלך`, `לעברך`) is spelled the same for everyone, so it is fine. | `until your next turn` → `עד התור הבא שלך` |
| Spell and feature **names are Hebrew only** (your earlier choice). | `Fireball` → `כדור אש` |
| Dice, numbers, `DC`, `HP`, `AC` are never altered. The checker compares every digit and every `NdM`. | `2d8` stays `2d8` |
| Ability scores are written out in Hebrew in descriptions; the 3-letter forms stay only in formulas (`PROF`, `STR`…). | `(Dex save)` → `(הצלת זריזות)` |
| Damage: number, then `נזק`, then the type. | `1d6 acid damage` → `1d6 נזק חומצה` |
| Character level: `ברמת דמות 5`, then `ברמה 11`. Slot level: `רמת משבצת`. | `at 5th character level` → `ברמת דמות 5` |
| Feet are `רגל`, a 5-ft cube is `קובייה של 5 רגל`; weight is `ליברות`. | `within 30 ft` → `בטווח 30 רגל` |

## Already in the app (confirmed by use — listed so nothing contradicts them)

| English | Hebrew |
|---|---|
| Strength / Dexterity / Constitution / Intelligence / Wisdom / Charisma | כוח / זריזות / חוסן / אינטליגנציה / חוכמה / כריזמה |
| Acid / Cold / Fire / Force / Lightning / Necrotic / Poison / Psychic / Radiant / Thunder | חומצה / קור / אש / כוח / ברק / נקרוטי / רעל / נפשי / זוהר / רעם |
| Bludgeoning / Piercing / Slashing | מוחץ / דוקר / חותך |
| Blinded, Charmed, Deafened, Frightened, Grappled, Incapacitated, Invisible, Paralyzed, Petrified, Poisoned, Prone, Restrained, Stunned, Unconscious, Exhaustion | עיוור, מכושף, חירש, מפוחד, אחוז, חסר יכולת פעולה, בלתי נראה, משותק, מאובן, מורעל, שרוע, כבול, המום, מחוסר הכרה, תשישות |
| action / bonus action / reaction | פעולה / פעולת בונוס / תגובה |
| saving throw · ability check · attack roll | הטלת הצלה · בדיקת תכונה · הטלת התקפה |
| advantage / disadvantage | יתרון / חיסרון |
| concentration · ritual · cantrip · spell slot | ריכוז · טקס · קנטריפ · משבצת כישוף |
| proficiency · expertise · proficiency bonus | מיומנות · מומחיות · בונוס מיומנות |
| hit points · hit die · short / long rest | נקודות חיים · קוביית חיים · מנוחה קצרה / ארוכה |
| resistance · immunity · vulnerability | עמידות · חסינות · פגיעות |
| creature · target · object | יצור · מטרה · חפץ |

## Decisions needed ★

| # | English | Proposed Hebrew | Alternatives / notes |
|---|---|---|---|
| ★1 | **Schools of magic** — Abjuration | הגנה | הרחקה |
| | Conjuration | זימון | |
| | Divination | ניבוי | גילוי עתידות |
| | Enchantment | הקסמה | כישוף נפש |
| | **Evocation** | **שחרור** | אבוקציה (transliteration) · הפעלת כוח — *weakest of the eight* |
| | Illusion | אשליה | |
| | Necromancy | ניקרומנטיקה | the usual transliteration |
| | Transmutation | המרה | הסבה |
| ★2 | **Eldritch** (Eldritch Blast, Invocations, Knight) | מיסטי — `קרן מיסטית`, `השבעות מיסטיות`, `אביר מיסטי` | transliterate `אלדריץ'` |
| ★3 | **Class names** — Barbarian · Bard · Cleric · Druid · Fighter · Monk | ברברי · בארד · כוהן · דרואיד · לוחם · נזיר | Bard also `מספר סיפורים`; Cleric also `כומר` |
| | Paladin · Ranger · Rogue · Sorcerer · Warlock · Wizard · Blood Hunter | פלדין · סייר · נוכל · מכשף · ווֹרלוק · קוסם · צייד דם | Warlock also `בעל ברית`; Sorcerer also `קוסם דם`; Rogue also `גנב` |
| ★4 | melee attack / ranged attack | התקפת קרב קרוב / התקפת טווח | `התקפת מגע` clashes with the *Touch* range |
| ★5 | Spell **names** | translate the meaning (`Fireball` → `כדור אש`, `Magic Missile` → `טיל קסם`) | some are people/places (`Tasha's…`, `Bigby's…`): transliterate the name, translate the rest |
| ★6 | Senses — Blindsight · Truesight · Tremorsense | ראיית עיוור · ראיית אמת · חישת רעידות | `ראיית עיוור` reads oddly; alternative `חוש עיוור` |
| ★7 | Gender of "you" in game text | no verbs in 2nd person (see style rules) | masculine generic (`אתה`) would read more naturally but excludes |

## Mechanical vocabulary (will apply unless you object)

| English | Hebrew |
|---|---|
| turn · round · initiative | תור · סבב · יוזמה |
| range · self · touch · sight | טווח · עצמי · מגע · קו ראייה |
| radius · cone · line · cube · sphere · cylinder · dome | רדיוס · חרוט · קו · קובייה · כדור · גליל · כיפה |
| bright light · dim light · darkness | אור בהיר · אור עמום · חושך |
| difficult terrain | שטח קשה |
| temporary hit points | נקודות חיים זמניות |
| spell attack · spell save DC · spellcasting ability | התקפת כישוף · DC הצלה מכישוף · תכונת הטלת כישופים |
| concentration check | בדיקת ריכוז (CON save) |
| "once per turn / per long rest" | פעם בתור / פעם בכל מנוחה ארוכה |
| "at higher levels" (slot scaling) | `+1d6 לכל רמת משבצת מעל 3` |
| ki · ki points | קי · נקודות קי |
| Martial Arts · Martial Arts die | אומנויות לחימה · קוביית אומנויות לחימה |
| Flurry of Blows · Patient Defense · Step of the Wind | מטר מכות · הגנה סבלנית · צעד הרוח |
| unarmed strike · monk weapon | מכה ללא נשק · נשק נזיר |
| elemental discipline | דיסציפלינת יסוד |
| Wild Shape · Wild Shape form | צורה פראית (התמרה לחיה = ״התמרה״) |
| Divine Domain / Druid Circle / Monastic Tradition | תחום ·מעגל · דרך (`Way of …` = ״דרך …״) |

## Choices made while translating features, races and backgrounds (please proofread)

| English | Hebrew used | Note |
|---|---|---|
| Sorcery Points · Metamagic | נקודות כשפים · מטא-קסם | Sorcerer |
| Sneak Attack · Cunning Action · Thieves' Cant | התקפה מתגנבת · פעולה ערמומית · שפת הגנבים | Rogue |
| Pact Magic · Eldritch Invocations · Pact Boon | קסם הברית · השבעות מיסטיות · מתנת הברית | Warlock |
| Warlock patrons | השד · הארכי-פיה · השמימי · עמקי הים · הג'יני · הקדמון הגדול · להב המארה · הבלתי-מת · הבלתי-גוסס | |
| Cleric domain · Druid circle · Monk way · Wizard school | תחום … · מעגל … · דרך … · אסכולת … | e.g. תחום החיים, מעגל הירח, דרך היד הפתוחה, אסכולת ההגנה |
| Wild Magic Surge | גל הקסם הפראי | same wording as the Barbarian text |
| Shifter (race) | שיפטר | not "משנה צורה", which is the Hebrew for the Shapechanger trait |
| Sleight of Hand | פרץ יד | already in the UI skill list — `קלות יד` is the more common wording; one search-and-replace if preferred |
| Weapon and tool names inside descriptions | גרזן קרב, חרב ארוכה, כלי גנבים, ערכת הסוואה… | the item/weapon *pickers* are still English |
| `at will` | כרצון | |
