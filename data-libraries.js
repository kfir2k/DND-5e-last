// ---------- Feature library: common class features & feats with effects pre-attached ----------
// g=group, l=class level gained, d=short description, fx=mechanical effects (same format as feature effects)
const FEATURE_LIB=[
 // Barbarian
 {n:'Rage',g:'Barbarian',l:1,d:'Bonus action: advantage on STR checks & saves, bonus rage damage, resistance to bludgeoning/piercing/slashing. Not in heavy armor.',combat:true},
 {n:'Unarmored Defense (Barbarian)',g:'Barbarian',l:1,d:'While not wearing armor, AC = 10 + DEX mod + CON mod (shield allowed). Use the AC override in Inventory.'},
 {n:'Reckless Attack',g:'Barbarian',l:2,d:'Advantage on melee STR attacks this turn; attacks against you have advantage until your next turn.',combat:true},
 {n:'Danger Sense',g:'Barbarian',l:2,d:'Advantage on DEX saves against effects you can see (traps, spells).',combat:true},
 {n:'Extra Attack',g:'Barbarian',l:5,d:'Attack twice when you take the Attack action.',combat:true},
 {n:'Fast Movement',g:'Barbarian',l:5,d:'+10 ft. speed while not in heavy armor.',fx:[{t:'stat',stat:'speed',n:10}]},
 {n:'Feral Instinct',g:'Barbarian',l:7,d:'Advantage on initiative rolls; act normally when surprised if you rage first.',combat:true},
 {n:'Brutal Critical',g:'Barbarian',l:9,d:'Roll one extra weapon damage die on a critical hit.',combat:true},
 // Bard
 {n:'Bardic Inspiration',g:'Bard',l:1,d:'Bonus action: give a creature a d6 (grows with level) to add to one roll. CHA mod uses per long rest.',combat:true,usesPer:'long',usesScale:'cha'},
 {n:'Jack of All Trades',g:'Bard',l:2,d:'Add half proficiency (rounded down) to ability checks that don\'t already include it.'},
 {n:'Song of Rest',g:'Bard',l:2,d:'Party regains extra 1d6 HP when spending hit dice on a short rest.'},
 {n:'Expertise (Bard)',g:'Bard',l:3,d:'Choose two skill proficiencies: double proficiency. Set those skills to expertise (tap dot twice).'},
 {n:'Font of Inspiration',g:'Bard',l:5,d:'Bardic Inspiration recharges on short rests too.'},
 {n:'Countercharm',g:'Bard',l:6,d:'Performance grants allies advantage on saves vs. fear and charm.',combat:true},
 {n:'Magical Secrets',g:'Bard',l:10,d:'Learn two spells from any class lists.'},
 // Cleric
 {n:'Channel Divinity',g:'Cleric',l:2,d:'Turn Undead + domain option. 1/rest (2 at lvl 6, 3 at 18).',combat:true,usesMax:1,usesPer:'short'},
 {n:'Destroy Undead',g:'Cleric',l:5,d:'Turned undead of low CR are destroyed instead.'},
 {n:'Divine Intervention',g:'Cleric',l:10,d:'Roll d100 under Cleric level: your deity intervenes. 7-day cooldown on success.',combat:true},
 // Druid
 {n:'Wild Shape',g:'Druid',l:2,d:'Transform into a beast (CR/movement limits by level), 2 uses per short/long rest.',combat:true,usesMax:2,usesPer:'short'},
 {n:'Wild Shape Improvement',g:'Druid',l:4,d:'CR 1/2 and swimming forms (lvl 4); CR 1 and flying forms (lvl 8).'},
 // Fighter
 {n:'Fighting Style',g:'Fighter',l:1,d:'Pick a style: Defense (+1 AC in armor — add a stat effect), Archery (+2 ranged attack), Dueling (+2 damage one-handed), etc.'},
 {n:'Second Wind',g:'Fighter',l:1,d:'Bonus action: regain 1d10 + fighter level HP, once per short/long rest.',combat:true,usesMax:1,usesPer:'short'},
 {n:'Action Surge',g:'Fighter',l:2,d:'One additional action, once per short/long rest (twice at lvl 17).',combat:true,usesMax:1,usesPer:'short'},
 {n:'Extra Attack (Fighter)',g:'Fighter',l:5,d:'Attack twice per Attack action (3× at lvl 11, 4× at lvl 20).',combat:true},
 {n:'Indomitable',g:'Fighter',l:9,d:'Reroll a failed saving throw, once per long rest.',combat:true,usesMax:1,usesPer:'long'},
 // Monk
 {n:'Unarmored Defense (Monk)',g:'Monk',l:1,d:'While unarmored & no shield, AC = 10 + DEX mod + WIS mod. Use the AC override in Inventory.'},
 {n:'Martial Arts',g:'Monk',l:1,d:'DEX for monk weapons/unarmed, martial arts die damage, bonus unarmed strike.',combat:true},
 {n:'Ki',g:'Monk',l:2,d:'Ki points = monk level, recharge on rest. Flurry of Blows, Patient Defense, Step of the Wind.',combat:true},
 {n:'Unarmored Movement',g:'Monk',l:2,d:'+10 ft. speed unarmored (grows with level).',fx:[{t:'stat',stat:'speed',n:10}]},
 {n:'Deflect Missiles',g:'Monk',l:3,d:'Reaction: reduce ranged weapon damage by 1d10 + DEX + monk level; catch and throw back for 1 ki.',combat:true},
 {n:'Slow Fall',g:'Monk',l:4,d:'Reaction: reduce fall damage by 5 × monk level.'},
 {n:'Stunning Strike',g:'Monk',l:5,d:'1 ki on hit: CON save or stunned until end of your next turn.',combat:true},
 {n:'Evasion (Monk)',g:'Monk',l:7,d:'DEX save for half damage → no damage on success, half on failure.',combat:true},
 {n:'Purity of Body',g:'Monk',l:10,d:'Immune to disease and poison.'},
 // Paladin
 {n:'Divine Sense',g:'Paladin',l:1,d:'Action: detect celestials, fiends, undead within 60 ft. 1+CHA uses per long rest.',combat:true,usesPer:'long',usesScale:'cha',usesScaleBonus:1},
 {n:'Lay on Hands',g:'Paladin',l:1,d:'Healing pool = 5 × paladin level per long rest.',combat:true},
 {n:'Fighting Style (Paladin)',g:'Paladin',l:2,d:'Pick a style: Defense (+1 AC in armor — add a stat effect), Dueling, Great Weapon Fighting, Protection.'},
 {n:'Divine Smite',g:'Paladin',l:2,d:'Spend a slot on melee hit: +2d8 radiant (+1d8 per slot level above 1st, +1d8 vs undead/fiends).',combat:true},
 {n:'Divine Health',g:'Paladin',l:3,d:'Immune to disease.'},
 {n:'Aura of Protection',g:'Paladin',l:6,d:'You and allies within 10 ft. add your CHA mod to all saving throws.',combat:true},
 {n:'Aura of Courage',g:'Paladin',l:10,d:'You and allies within 10 ft. can\'t be frightened.',combat:true},
 // Ranger
 {n:'Favored Enemy',g:'Ranger',l:1,d:'Advantage on Survival to track and INT checks to recall info about your favored enemies.',fx:[{t:'note',skills:['survival'],kind:'adv',cond:'tracking your favored enemies'}]},
 {n:'Natural Explorer',g:'Ranger',l:1,d:'In favored terrain: double proficiency on INT/WIS checks, no difficult-terrain slowdown, can\'t get lost, always alert.',fx:[{t:'note',skills:['nature','survival','perception'],kind:'dprof',cond:'in favored terrain'}]},
 {n:'Fighting Style (Ranger)',g:'Ranger',l:2,d:'Pick a style: Archery (+2 ranged attack — add as misc bonus on your bow), Defense (+1 AC in armor), Dueling, Two-Weapon.'},
 {n:'Primeval Awareness',g:'Ranger',l:3,d:'Spend a slot: sense favored-enemy types within 1 mile (6 in favored terrain).'},
 {n:'Extra Attack (Ranger)',g:'Ranger',l:5,d:'Attack twice when you take the Attack action.',combat:true},
 {n:'Land\'s Stride',g:'Ranger',l:8,d:'Nonmagical difficult terrain costs no extra movement; advantage vs. magical plants.'},
 {n:'Hide in Plain Sight',g:'Ranger',l:10,d:'+10 to Stealth when camouflaged and motionless.',fx:[{t:'note',skills:['stealth'],kind:'flat',n:10,cond:'camouflaged & motionless'}]},
 // Rogue
 {n:'Expertise (Rogue)',g:'Rogue',l:1,d:'Choose two skill proficiencies (or one + thieves\' tools): double proficiency. Set those skills to expertise.'},
 {n:'Sneak Attack',g:'Rogue',l:1,d:'+1d6 damage (grows every odd level) with finesse/ranged weapon when you have advantage or an ally is adjacent.',combat:true},
 {n:'Thieves\' Cant',g:'Rogue',l:1,d:'Secret rogue code and signs.'},
 {n:'Cunning Action',g:'Rogue',l:2,d:'Bonus action: Dash, Disengage, or Hide.',combat:true},
 {n:'Uncanny Dodge',g:'Rogue',l:5,d:'Reaction: halve damage from one attacker you can see.',combat:true},
 {n:'Evasion (Rogue)',g:'Rogue',l:7,d:'DEX save for half damage → no damage on success, half on failure.',combat:true},
 // Sorcerer
 {n:'Sorcery Points',g:'Sorcerer',l:2,d:'Points = sorcerer level; convert to/from spell slots (Flexible Casting).',combat:true},
 {n:'Metamagic',g:'Sorcerer',l:3,d:'Learn 2 metamagic options (Twinned, Quickened, Subtle...).',combat:true},
 // Warlock
 {n:'Eldritch Invocations',g:'Warlock',l:2,d:'Learn 2 invocations (more with level) — passive magical boons.'},
 {n:'Pact Boon',g:'Warlock',l:3,d:'Pact of the Blade, Chain, or Tome.'},
 // Wizard
 {n:'Arcane Recovery',g:'Wizard',l:1,d:'Once/day on short rest: recover slots totaling half wizard level (rounded up), none above 5th.'},
 // Feats
 {n:'Alert',g:'Feats',l:0,d:'+5 initiative, can\'t be surprised while conscious, unseen attackers gain no advantage on you.',fx:[{t:'stat',stat:'init',n:5}]},
 {n:'Observant',g:'Feats',l:0,d:'+5 passive Perception & Investigation, read lips. Also +1 INT or WIS (add via ASI/base score).',fx:[{t:'stat',stat:'passive',n:5}]},
 {n:'Mobile',g:'Feats',l:0,d:'+10 ft. speed; Dash ignores difficult terrain; melee attack prevents opportunity attacks from target.',fx:[{t:'stat',stat:'speed',n:10}]},
 {n:'Tough',g:'Feats',l:0,d:'+2 HP per character level. NOTE: re-check the Max HP effect after leveling up.'},
 {n:'Lucky',g:'Feats',l:0,d:'3 luck points per long rest: reroll your d20 or an attacker\'s.',combat:true,usesMax:3,usesPer:'long'},
 {n:'War Caster',g:'Feats',l:0,d:'Advantage on concentration saves, somatic components with full hands, cast as opportunity attack.',combat:true},
 {n:'Sentinel',g:'Feats',l:0,d:'Opportunity hits stop movement; attack those who attack your allies; Disengage doesn\'t work on you.',combat:true},
 {n:'Sharpshooter',g:'Feats',l:0,d:'No long-range disadvantage, ignore cover, optional -5 attack / +10 damage on ranged attacks.',combat:true},
 {n:'Great Weapon Master',g:'Feats',l:0,d:'Bonus attack on crit/kill; optional -5 attack / +10 damage with heavy weapons.',combat:true},
 {n:'Polearm Master',g:'Feats',l:0,d:'Bonus 1d4 butt-end attack; opportunity attacks when enemies enter your reach.',combat:true},
 {n:'Crossbow Expert',g:'Feats',l:0,d:'Ignore loading, no melee disadvantage, bonus hand-crossbow shot.',combat:true},
 {n:'Shield Master',g:'Feats',l:0,d:'Bonus shove with shield, add shield AC to DEX saves vs. targeted effects, no damage on passed DEX saves.',combat:true},
 {n:'Dual Wielder',g:'Feats',l:0,d:'+1 AC while dual wielding (add a stat effect if always), use non-light weapons, draw two at once.'},
 {n:'Defensive Duelist',g:'Feats',l:0,d:'Reaction with finesse weapon: +proficiency to AC vs. one melee attack.',combat:true},
 {n:'Resilient',g:'Feats',l:0,d:'+1 to one ability and proficiency in its saves — add a "Saving throw proficiency" effect for your pick.'},
 {n:'Skilled',g:'Feats',l:0,d:'Proficiency in any 3 skills/tools — add "Skill proficiency" effects for your picks.'},
 {n:'Skill Expert',g:'Feats',l:0,d:'+1 ability, one new proficiency, one expertise — add the matching skill effects.'},
 {n:'Actor',g:'Feats',l:0,d:'+1 CHA; advantage on Deception/Performance while impersonating; mimic voices.',fx:[{t:'note',skills:['deception','performance'],kind:'adv',cond:'impersonating someone'}]},
 {n:'Athlete',g:'Feats',l:0,d:'+1 STR or DEX; stand up with 5 ft.; climb at full speed; running jumps after 5 ft.'},
 {n:'Magic Initiate',g:'Feats',l:0,d:'Two cantrips + one 1st-level spell (1/long rest) from one class list.'},
 {n:'Fey Touched',g:'Feats',l:0,d:'+1 INT/WIS/CHA; learn Misty Step + one 1st-level divination/enchantment spell, each 1/long rest.'},
 {n:'Shadow Touched',g:'Feats',l:0,d:'+1 INT/WIS/CHA; learn Invisibility + one 1st-level illusion/necromancy spell, each 1/long rest.'},
 {n:'Telekinetic',g:'Feats',l:0,d:'+1 INT/WIS/CHA; Mage Hand (invisible); bonus-action 5 ft. shove.'},
 {n:'Telepathic',g:'Feats',l:0,d:'+1 INT/WIS/CHA; speak telepathically within 60 ft.; Detect Thoughts 1/day.'},
 {n:'Inspiring Leader',g:'Feats',l:0,d:'10-min speech: 6 allies gain temp HP = your level + CHA mod.'},
 {n:'Healer',g:'Feats',l:0,d:'Healer\'s kit: stabilize + 1 HP, or heal 1d6+4+their hit dice once per rest per creature.',combat:true},
 {n:'Mage Slayer',g:'Feats',l:0,d:'Opportunity attack on adjacent casters; impose disadvantage on their concentration; advantage vs. their spells within 5 ft.',combat:true},
 {n:'Savage Attacker',g:'Feats',l:0,d:'Once per turn, reroll melee weapon damage and use either roll.',combat:true},
 {n:'Tavern Brawler',g:'Feats',l:0,d:'+1 STR or CON; unarmed d4; proficient with improvised weapons; bonus-action grapple after hitting.',combat:true},
 {n:'Elven Accuracy',g:'Feats',l:0,d:'(Elf/half-elf) +1 DEX/INT/WIS/CHA; reroll one die when attacking with advantage using those abilities.',combat:true},
 {n:'Squat Nimbleness',g:'Feats',l:0,d:'(Dwarf/small race) +1 STR or DEX; +5 ft. speed; proficiency in Acrobatics or Athletics.',fx:[{t:'stat',stat:'speed',n:5}]},
 // ---- Subclasses ---- one iconic pick per class, grouped as "Class — Subclass" so they sit
 // right next to that class's base features in search. Not exhaustive (every class has several
 // subclasses across the sourcebooks) — add more groups here the same way as your table needs them.
 // Barbarian: Path of the Berserker
 {n:'Frenzy',g:'Barbarian — Path of the Berserker',l:3,d:'While raging, bonus-action melee attack each turn; take 1 level of exhaustion when the rage ends.',combat:true},
 {n:'Mindless Rage',g:'Barbarian — Path of the Berserker',l:6,d:'Can\'t be charmed or frightened while raging (already charmed/frightened when you rage? no effect while raging).'},
 {n:'Intimidating Presence',g:'Barbarian — Path of the Berserker',l:10,d:'Action: frighten one creature within 30 ft. (WIS save), for as long as you attack no one else.',combat:true},
 {n:'Retaliation',g:'Barbarian — Path of the Berserker',l:14,d:'Reaction: melee attack a creature within 5 ft. that just damaged you.',combat:true},
 // Bard: College of Lore
 {n:'Bonus Proficiencies (Lore)',g:'Bard — College of Lore',l:3,d:'Proficiency in three skills of your choice — add the matching skill effects.'},
 {n:'Cutting Words',g:'Bard — College of Lore',l:3,d:'Reaction: expend a Bardic Inspiration die to subtract it from an enemy\'s attack roll, ability check, or damage roll.',combat:true},
 {n:'Additional Magical Secrets',g:'Bard — College of Lore',l:6,d:'Learn two spells from any class list; they count as Bard spells for you.'},
 {n:'Peerless Skill',g:'Bard — College of Lore',l:14,d:'Add a Bardic Inspiration die to one of your own ability checks.',combat:true},
 // Cleric: Life Domain
 {n:'Bonus Proficiency (Life)',g:'Cleric — Life Domain',l:1,d:'Proficiency with heavy armor.'},
 {n:'Disciple of Life',g:'Cleric — Life Domain',l:1,d:'Your healing spells restore extra HP equal to 2 + the spell\'s level.'},
 {n:'Preserve Life (Channel Divinity)',g:'Cleric — Life Domain',l:2,d:'Channel Divinity: distribute HP equal to 5× your cleric level among injured creatures within 30 ft. (max half their HP each).',combat:true},
 {n:'Blessed Healer',g:'Cleric — Life Domain',l:6,d:'Spells that restore HP to others also heal you for 2 + the spell\'s level.'},
 {n:'Divine Strike (Life)',g:'Cleric — Life Domain',l:8,d:'Once per turn, add 1d8 radiant damage on a weapon hit (2d8 at 14th level).',combat:true},
 {n:'Supreme Healing',g:'Cleric — Life Domain',l:17,d:'Your healing spells restore the maximum possible HP instead of rolling.'},
 // Cleric: Grave Domain
 {n:'Circle of Mortality',g:'Cleric — Grave Domain',l:1,d:'Healing spells restore the maximum possible HP to a creature at 0 HP instead of rolling. Also learn Spare the Dying (doesn\'t count against cantrips known; 30 ft. range, bonus action for you).'},
 {n:'Eyes of the Grave',g:'Cleric — Grave Domain',l:1,d:'Action: sense undead within 60 ft. (not behind total cover) and see a faint aura on any you can see. WIS mod uses (min 1) per long rest.',combat:true,usesPer:'long',usesScale:'wis'},
 {n:'Path to the Grave (Channel Divinity)',g:'Cleric — Grave Domain',l:2,d:'Channel Divinity: curse one creature within 30 ft. until the end of your next turn — the next attack against it (yours or an ally\'s) gains vulnerability to all its damage, then the curse ends.',combat:true},
 {n:'Sentinel at Death\'s Door',g:'Cleric — Grave Domain',l:6,d:'Reaction: turn a critical hit against you or a creature within 30 ft. into a normal hit, canceling crit effects. WIS mod uses (min 1) per long rest.',combat:true,usesPer:'long',usesScale:'wis'},
 {n:'Potent Spellcasting (Grave)',g:'Cleric — Grave Domain',l:8,d:'Add your WIS mod to the damage you deal with Cleric cantrips.',combat:true},
 {n:'Keeper of Souls',g:'Cleric — Grave Domain',l:17,d:'When an enemy dies within 60 ft. of you, regain HP equal to its Hit Dice and give them to yourself or one ally within 60 ft. (can\'t exceed their max HP). Not while incapacitated.',combat:true,usesMax:1,usesPer:'short'},
 // Druid: Circle of the Moon
 {n:'Combat Wild Shape',g:'Druid — Circle of the Moon',l:2,d:'Wild Shape as a bonus action; spend a spell slot while shapeshifted to heal yourself (1d8 per slot level).',combat:true},
 {n:'Circle Forms',g:'Druid — Circle of the Moon',l:2,d:'Wild Shape into higher-CR beasts than other druids (CR 1 at 2nd level, scaling with your druid level).'},
 {n:'Primal Strike',g:'Druid — Circle of the Moon',l:6,d:'Your beast form\'s attacks count as magical for overcoming resistance/immunity.'},
 {n:'Elemental Wild Shape',g:'Druid — Circle of the Moon',l:10,d:'Expend two Wild Shape uses to transform into an air, earth, fire, or water elemental.'},
 // Fighter: Champion
 {n:'Improved Critical',g:'Fighter — Champion',l:3,d:'Weapon attacks score a critical hit on a roll of 19 or 20.',combat:true},
 {n:'Remarkable Athlete',g:'Fighter — Champion',l:7,d:'Add half proficiency (round up) to STR/DEX/CON checks that don\'t already use it; running long jump distance increases.'},
 {n:'Additional Fighting Style',g:'Fighter — Champion',l:10,d:'Learn a second Fighting Style.'},
 {n:'Superior Critical',g:'Fighter — Champion',l:15,d:'Weapon attacks score a critical hit on a roll of 18-20.',combat:true},
 {n:'Survivor',g:'Fighter — Champion',l:18,d:'At the start of each turn, regain HP (5 + CON mod) if below half HP and not at 0.'},
 // Monk: Way of the Open Hand
 {n:'Open Hand Technique',g:'Monk — Way of the Open Hand',l:3,d:'On a Flurry of Blows hit, impose one: knock prone (DEX save), push 15 ft. (STR save), or no reactions until your next turn.',combat:true},
 {n:'Wholeness of Body',g:'Monk — Way of the Open Hand',l:6,d:'Action: heal yourself HP equal to 3× your monk level, once per long rest.',combat:true,usesMax:1,usesPer:'long'},
 {n:'Tranquility',g:'Monk — Way of the Open Hand',l:11,d:'At the end of a long rest, gain the effect of Sanctuary until your next long rest.'},
 {n:'Quivering Palm',g:'Monk — Way of the Open Hand',l:17,d:'Hit a creature while you have 3+ ki points to set up lethal vibrations; later, bonus action to force a CON save or drop it to 0 HP.',combat:true},
 // Paladin: Oath of Devotion
 {n:'Sacred Weapon (Channel Divinity)',g:'Paladin — Oath of Devotion',l:3,d:'Channel Divinity: add your CHA mod to attack rolls with one weapon for 1 minute; it counts as magical and sheds light.',combat:true},
 {n:'Turn the Unholy (Channel Divinity)',g:'Paladin — Oath of Devotion',l:3,d:'Channel Divinity: fiends and undead within 30 ft. must save or be turned.',combat:true},
 {n:'Aura of Devotion',g:'Paladin — Oath of Devotion',l:7,d:'You and allies within 10 ft. can\'t be charmed while you\'re conscious.'},
 {n:'Purity of Spirit',g:'Paladin — Oath of Devotion',l:15,d:'You and allies within 10 ft. are constantly under a Protection from Evil and Good effect.'},
 {n:'Holy Nimbus',g:'Paladin — Oath of Devotion',l:20,d:'Action: emanate sunlight — 10 radiant damage to enemies starting their turn within 30 ft., advantage on saves vs. fiends/undead, once per long rest.',combat:true,usesMax:1,usesPer:'long'},
 // Ranger: Gloom Stalker
 {n:'Gloom Stalker Magic',g:'Ranger — Gloom Stalker',l:3,d:'Know bonus spells by level (Disguise Self 3rd, Rope Trick 5th, Fear 9th, Greater Invisibility 13th), each once per long rest without a slot.'},
 {n:'Dread Ambusher',g:'Ranger — Gloom Stalker',l:3,d:'Add your WIS mod to initiative. On the first turn of combat, make an extra attack against one creature, and gain +10 ft. speed until the turn ends if you hit.',combat:true},
 {n:'Umbral Sight',g:'Ranger — Gloom Stalker',l:3,d:'Darkvision 60 ft. (or +30 ft. if you already have it); invisible to creatures relying on darkvision to see you in darkness.'},
 {n:'Stalker\'s Flurry',g:'Ranger — Gloom Stalker',l:11,d:'Once per turn on a miss, make another attack against the same or a different creature within range.',combat:true},
 {n:'Shadowy Dodge',g:'Ranger — Gloom Stalker',l:15,d:'Reaction: impose disadvantage on an attack roll made against you.',combat:true},
 // Rogue: Thief
 {n:'Fast Hands',g:'Rogue — Thief',l:3,d:'Use the bonus action from Cunning Action to make a Sleight of Hand check, use thieves\' tools, or use an item.',combat:true},
 {n:'Second-Story Work',g:'Rogue — Thief',l:3,d:'Climbing no longer costs extra movement; running long jump distance increases by your DEX mod.'},
 {n:'Supreme Sneak',g:'Rogue — Thief',l:9,d:'Advantage on Stealth checks if you move no more than half your speed on the same turn.',fx:[{t:'note',skills:['stealth'],kind:'adv',cond:'moving no more than half speed that turn'}]},
 {n:'Use Magic Device',g:'Rogue — Thief',l:13,d:'Ignore class, race, and level requirements on the use of magic items.'},
 {n:'Thief\'s Reflexes',g:'Rogue — Thief',l:17,d:'Take two turns during the first round of combat: one at your normal initiative, one at initiative −10.',combat:true},
 // Sorcerer: Draconic Bloodline
 {n:'Dragon Ancestor',g:'Sorcerer — Draconic Bloodline',l:1,d:'Choose a dragon type; speak/read/write Draconic; double proficiency on CHA checks interacting with dragons.'},
 {n:'Draconic Resilience',g:'Sorcerer — Draconic Bloodline',l:1,d:'+1 HP per sorcerer level; AC = 13 + DEX mod when not wearing armor.'},
 {n:'Elemental Affinity',g:'Sorcerer — Draconic Bloodline',l:6,d:'Add your CHA mod to the damage of one spell matching your dragon\'s damage type; spend 1 sorcery point for 1 hour of resistance to that type.',combat:true},
 {n:'Dragon Wings',g:'Sorcerer — Draconic Bloodline',l:14,d:'Bonus action: sprout wings, fly speed equal to your speed (no heavy armor).',combat:true},
 {n:'Draconic Presence',g:'Sorcerer — Draconic Bloodline',l:18,d:'Action: spend 5 sorcery points to exude awe or fear in a 60 ft. aura, charming or frightening creatures (WIS save).',combat:true},
 // Warlock: The Fiend
 {n:'Dark One\'s Blessing',g:'Warlock — The Fiend',l:1,d:'When you reduce a hostile creature to 0 HP, gain temp HP equal to your CHA mod + warlock level.'},
 {n:'Dark One\'s Own Luck',g:'Warlock — The Fiend',l:6,d:'Add a d10 to one ability check or saving throw, once per short or long rest.',combat:true,usesMax:1,usesPer:'short'},
 {n:'Fiendish Resilience',g:'Warlock — The Fiend',l:10,d:'Choose a damage type after a short/long rest; resistant to it until your next short/long rest.'},
 {n:'Hurl Through Hell',g:'Warlock — The Fiend',l:14,d:'When you hit with an attack, banish the target briefly to a hellish plane for 10d10 psychic damage, once per long rest.',combat:true,usesMax:1,usesPer:'long'},
 // Wizard: School of Evocation
 {n:'Evocation Savant',g:'Wizard — School of Evocation',l:2,d:'Half the gold and time cost to copy an Evocation spell into your spellbook.'},
 {n:'Sculpt Spells',g:'Wizard — School of Evocation',l:2,d:'Choose allies within an Evocation spell\'s area to automatically succeed the save and take no damage on a success.'},
 {n:'Potent Cantrip',g:'Wizard — School of Evocation',l:6,d:'Creatures that succeed on a save against your cantrips still take half damage.',combat:true},
 {n:'Empowered Evocation',g:'Wizard — School of Evocation',l:10,d:'Add your INT mod to the damage of one Evocation spell you cast.',combat:true},
 {n:'Overchannel',g:'Wizard — School of Evocation',l:14,d:'Deal maximum damage with a 1st-5th level evocation spell; each use after the first that day costs you HP.',combat:true}
];

// ---------- Race Traits library ----------
// Its own searchable pick-list (separate from FEATURE_LIB above) grouped by race, matching the
// race names in RACES. Covers the 9 PHB common races plus every exotic/monstrous race offered
// in the Build tab (Shadar-Kai, Githyanki, Grung, etc.) so nothing is missing.
const RACE_LIB=[
 // Dwarf
 {n:'Darkvision',g:'Dwarf',d:'See in dim light within 60 ft. as if bright, and in darkness as if dim (no color).'},
 {n:'Dwarven Resilience',g:'Dwarf',d:'Advantage on saving throws against poison; resistance to poison damage.'},
 {n:'Dwarven Combat Training',g:'Dwarf',d:'Proficiency with battleaxe, handaxe, light hammer, and warhammer.'},
 {n:'Stonecunning',g:'Dwarf',d:'Double proficiency on History checks about the origin of stonework.',fx:[{t:'note',skills:['history'],kind:'dprof',cond:'about the origin of stonework'}]},
 {n:'Dwarven Toughness (Hill Dwarf)',g:'Dwarf',d:'+1 HP per level. Auto-scaled to your current level on add — recheck after leveling up.'},
 {n:'Dwarven Armor Training (Mountain Dwarf)',g:'Dwarf',d:'Proficiency with light and medium armor.'},
 // Elf
 {n:'Darkvision',g:'Elf',d:'See in dim light within 60 ft. as if bright, and in darkness as if dim (no color).'},
 {n:'Fey Ancestry',g:'Elf',d:'Advantage on saving throws against being charmed; magic can\'t put you to sleep.'},
 {n:'Trance',g:'Elf',d:'Meditate deeply 4 hours instead of sleeping 8 to gain the benefit of a long rest.'},
 {n:'Keen Senses',g:'Elf',d:'Proficiency in Perception.',fx:[{t:'skill',skills:['perception'],grant:'prof'}]},
 {n:'Elf Weapon Training (High/Wood Elf)',g:'Elf',d:'Proficiency with longsword, shortsword, shortbow, and longbow.'},
 {n:'Cantrip (High Elf)',g:'Elf',d:'Know one Wizard cantrip (INT is your spellcasting ability for it).'},
 {n:'Fleet of Foot (Wood Elf)',g:'Elf',d:'+5 ft. speed.',fx:[{t:'stat',stat:'speed',n:5}]},
 {n:'Mask of the Wild (Wood Elf)',g:'Elf',d:'Hide even when only lightly obscured by natural foliage, rain, snow, mist, or other natural phenomena.'},
 {n:'Superior Darkvision (Drow)',g:'Elf',d:'Darkvision out to 120 ft.'},
 {n:'Sunlight Sensitivity (Drow)',g:'Elf',d:'Disadvantage on attack rolls and Perception checks that rely on sight in direct sunlight.'},
 {n:'Drow Magic',g:'Elf',d:'Know Dancing Lights; Faerie Fire 1/day at 3rd level; Darkness 1/day at 5th level (CHA).'},
 // Halfling
 {n:'Lucky',g:'Halfling',d:'Reroll a 1 on an attack roll, ability check, or saving throw — must use the new roll.'},
 {n:'Brave',g:'Halfling',d:'Advantage on saving throws against being frightened.'},
 {n:'Halfling Nimbleness',g:'Halfling',d:'Move through the space of any creature that is a size larger than you.'},
 {n:'Naturally Stealthy (Lightfoot)',g:'Halfling',d:'Can attempt to hide even when obscured only by a creature at least one size larger than you.'},
 {n:'Stout Resilience (Stout Halfling)',g:'Halfling',d:'Advantage on saving throws against poison; resistance to poison damage.'},
 // Human
 {n:'Skill Versatility (Variant Human)',g:'Human',d:'Proficiency in one skill of your choice — add the matching skill effect.'},
 // Dragonborn
 {n:'Draconic Ancestry',g:'Dragonborn',d:'Choose a dragon type — sets your breath weapon\'s damage type and shape, and your resistance.'},
 {n:'Breath Weapon',g:'Dragonborn',d:'Action: exhale energy in a line or cone (by ancestry). Target(s) make a DEX or CON save (by type) or take damage.',combat:true,usesMax:1,usesPer:'short'},
 {n:'Damage Resistance',g:'Dragonborn',d:'Resistance to the damage type of your draconic ancestry.'},
 // Gnome
 {n:'Darkvision',g:'Gnome',d:'See in dim light within 60 ft. as if bright, and in darkness as if dim (no color).'},
 {n:'Gnome Cunning',g:'Gnome',d:'Advantage on INT, WIS, and CHA saving throws against magic.'},
 {n:'Natural Illusionist (Forest Gnome)',g:'Gnome',d:'Know the Minor Illusion cantrip (INT).'},
 {n:'Speak with Small Beasts (Forest Gnome)',g:'Gnome',d:'Communicate simple ideas with Small or smaller beasts.'},
 {n:'Artificer\'s Lore (Rock Gnome)',g:'Gnome',d:'Double proficiency on History checks about magic, alchemical, or technological items.',fx:[{t:'note',skills:['history'],kind:'dprof',cond:'about magic, alchemical, or technological items'}]},
 {n:'Tinker (Rock Gnome)',g:'Gnome',d:'Proficiency with tinker\'s tools; build a Tiny clockwork device (1 hour, 10 gp of materials).'},
 // Half-Elf
 {n:'Darkvision',g:'Half-Elf',d:'See in dim light within 60 ft. as if bright, and in darkness as if dim (no color).'},
 {n:'Fey Ancestry',g:'Half-Elf',d:'Advantage on saving throws against being charmed; magic can\'t put you to sleep.'},
 {n:'Skill Versatility',g:'Half-Elf',d:'Proficiency in two skills of your choice — add the matching skill effects.'},
 // Half-Orc
 {n:'Darkvision',g:'Half-Orc',d:'See in dim light within 60 ft. as if bright, and in darkness as if dim (no color).'},
 {n:'Relentless Endurance',g:'Half-Orc',d:'When reduced to 0 HP but not killed outright, drop to 1 HP instead — once per long rest.',combat:true,usesMax:1,usesPer:'long'},
 {n:'Savage Attacks',g:'Half-Orc',d:'On a melee critical hit, roll one additional weapon damage die.'},
 // Tiefling
 {n:'Darkvision',g:'Tiefling',d:'See in dim light within 60 ft. as if bright, and in darkness as if dim (no color).'},
 {n:'Hellish Resistance',g:'Tiefling',d:'Resistance to fire damage.'},
 {n:'Infernal Legacy',g:'Tiefling',d:'Know Thaumaturgy; cast Hellish Rebuke 1/day at 3rd level, Darkness 1/day at 5th level (CHA).'},
 // Aarakocra
 {n:'Flight',g:'Aarakocra',d:'Fly speed equal to your walking speed (light or no armor).'},
 {n:'Talons',g:'Aarakocra',d:'Unarmed strikes with your talons deal 1d4 slashing damage.'},
 // Aasimar
 {n:'Darkvision',g:'Aasimar',d:'See in dim light within 60 ft. as if bright, and in darkness as if dim (no color).'},
 {n:'Celestial Resistance',g:'Aasimar',d:'Resistance to necrotic and radiant damage.'},
 {n:'Healing Hands',g:'Aasimar',d:'Action: touch a creature to heal HP equal to your level, once per long rest.'},
 {n:'Light Bearer',g:'Aasimar',d:'Know the Light cantrip (CHA).'},
 {n:'Celestial Transformation (3rd level+)',g:'Aasimar',d:'Bonus action: transform for 1 minute (Protector/Scourge/Fallen) — extra wings/damage/aura by subtype, once per long rest.',combat:true,usesMax:1,usesPer:'long'},
 // Changeling
 {n:'Shapechanger',g:'Changeling',d:'Action: change your appearance (not size) — another humanoid\'s face, voice, body type, hair, etc. Lasts until you use this again or die.'},
 {n:'Changeling Instincts',g:'Changeling',d:'Proficiency in two of: Deception, Insight, Intimidation, Performance, Persuasion.'},
 // Deep Gnome
 {n:'Superior Darkvision',g:'Deep Gnome',d:'Darkvision out to 120 ft.'},
 {n:'Gnome Cunning',g:'Deep Gnome',d:'Advantage on INT, WIS, and CHA saving throws against magic.'},
 {n:'Stone Camouflage',g:'Deep Gnome',d:'Advantage on Stealth checks to hide in rocky terrain.',fx:[{t:'note',skills:['stealth'],kind:'adv',cond:'hiding in rocky terrain'}]},
 {n:'Svirfneblin Magic',g:'Deep Gnome',d:'Nondetection always active on yourself; at 3rd level Blindness/Deafness, 5th Blur, 7th Disguise Self, each 1/long rest.'},
 // Duergar
 {n:'Superior Darkvision',g:'Duergar',d:'Darkvision out to 120 ft.'},
 {n:'Duergar Resilience',g:'Duergar',d:'Advantage on saves against poison, illusions, and being charmed or paralyzed.'},
 {n:'Sunlight Sensitivity',g:'Duergar',d:'Disadvantage on attack rolls and Perception checks that rely on sight in direct sunlight.'},
 {n:'Duergar Magic',g:'Duergar',d:'At 3rd level cast Enlarge/Reduce on yourself only; at 5th level Invisibility on yourself only. Each 1/long rest.'},
 // Eladrin
 {n:'Darkvision',g:'Eladrin',d:'See in dim light within 60 ft. as if bright, and in darkness as if dim (no color).'},
 {n:'Fey Ancestry',g:'Eladrin',d:'Advantage on saving throws against being charmed; magic can\'t put you to sleep.'},
 {n:'Trance',g:'Eladrin',d:'Meditate deeply 4 hours instead of sleeping 8 to gain the benefit of a long rest.'},
 {n:'Fey Step',g:'Eladrin',d:'Bonus action: teleport up to 30 ft. to an unoccupied space you can see, with a seasonal effect. Recharges on a short or long rest.',combat:true,usesMax:1,usesPer:'short'},
 // Fairy
 {n:'Fairy Magic',g:'Fairy',d:'Know Druidcraft; at 3rd level Faerie Fire 1/long rest, at 5th level Enlarge/Reduce 1/long rest (CHA).'},
 {n:'Flight',g:'Fairy',d:'Fly speed 30 ft.; can\'t wear heavy armor while flying.'},
 // Firbolg
 {n:'Firbolg Magic',g:'Firbolg',d:'Detect Magic and Disguise Self (self only, appear smaller), each 1/short or long rest (WIS).'},
 {n:'Hidden Step',g:'Firbolg',d:'Bonus action: turn invisible until the start of your next turn or until you attack, cast, or force a save. 1/short rest.',combat:true,usesMax:1,usesPer:'short'},
 {n:'Speech of Beast and Leaf',g:'Firbolg',d:'Communicate simple ideas with beasts and plants; they\'re more likely to be favorably disposed toward you.'},
 // Genasi (Air)
 {n:'Unending Breath',g:'Genasi (Air)',d:'Hold your breath indefinitely while not incapacitated.'},
 {n:'Mingle with the Wind',g:'Genasi (Air)',d:'Cast Levitate on yourself, no components, once per long rest.',combat:true,usesMax:1,usesPer:'long'},
 // Genasi (Earth)
 {n:'Earth Walk',g:'Genasi (Earth)',d:'Walk on nonmagical difficult terrain made of earth or stone without extra movement cost.'},
 {n:'Merge with Stone',g:'Genasi (Earth)',d:'Cast Meld into Stone, no components, once per long rest.',combat:true,usesMax:1,usesPer:'long'},
 // Genasi (Fire)
 {n:'Darkvision',g:'Genasi (Fire)',d:'See in dim light within 60 ft. as if bright, and in darkness as if dim (no color).'},
 {n:'Fire Resistance',g:'Genasi (Fire)',d:'Resistance to fire damage.'},
 {n:'Reach to the Blaze',g:'Genasi (Fire)',d:'Know Produce Flame; at 3rd level cast Burning Hands once per long rest.'},
 // Genasi (Water)
 {n:'Acid Resistance',g:'Genasi (Water)',d:'Resistance to acid damage.'},
 {n:'Amphibious',g:'Genasi (Water)',d:'Breathe air and water.'},
 {n:'Call to the Wave',g:'Genasi (Water)',d:'Know Shape Water; at 3rd level cast Create or Destroy Water once per long rest.'},
 // Githyanki
 {n:'Githyanki Psionics',g:'Githyanki',d:'Know Mage Hand (silvery astral hand); at 3rd level Jump 1/long rest, at 5th level Misty Step 1/long rest (INT).'},
 {n:'Martial Prodigy',g:'Githyanki',d:'Proficiency with shortsword, longsword, greatsword, and light and medium armor.'},
 // Githzerai
 {n:'Githzerai Psionics',g:'Githzerai',d:'Know Mage Hand (invisible); at 3rd level Shield 1/long rest, at 5th level Detect Thoughts 1/long rest (WIS).'},
 {n:'Mental Discipline',g:'Githzerai',d:'Advantage on saving throws against being charmed or frightened.'},
 // Goliath
 {n:'Natural Athlete',g:'Goliath',d:'Proficiency in Athletics.',fx:[{t:'skill',skills:['athletics'],grant:'prof'}]},
 {n:'Stone\'s Endurance',g:'Goliath',d:'Reaction: reduce damage from one incoming hit by 1d12 + CON mod. 1/short rest.',combat:true,usesMax:1,usesPer:'short'},
 {n:'Powerful Build',g:'Goliath',d:'Count as one size larger for carrying capacity and push/drag/lift; advantage escaping a grapple.'},
 {n:'Mountain Born',g:'Goliath',d:'Acclimated to high altitude; resistance to cold damage.'},
 // Harengon
 {n:'Hare-Trigger',g:'Harengon',d:'Add your proficiency bonus to initiative rolls.'},
 {n:'Leporine Senses',g:'Harengon',d:'Advantage on Wisdom (Perception) checks relying on hearing or smell.'},
 {n:'Rabbit Hop',g:'Harengon',d:'Bonus action: jump distance without moving, no opportunity attacks. Uses = proficiency bonus per long rest.',combat:true,usesPer:'long',usesScale:'prof'},
 // Kenku
 {n:'Expert Forgery',g:'Kenku',d:'Duplicate other creatures\' handwriting and craftwork with great fidelity.'},
 {n:'Kenku Training',g:'Kenku',d:'Proficiency in two of: Acrobatics, Deception, Stealth, Sleight of Hand.'},
 {n:'Mimicry',g:'Kenku',d:'Accurately mimic sounds you\'ve heard, including speech (Insight vs. your Deception to detect the ruse).'},
 // Locathah
 {n:'Natural Armor',g:'Locathah',d:'AC = 12 + DEX mod when not wearing armor (shield allowed).'},
 {n:'Emissary of the Sea',g:'Locathah',d:'Communicate simple ideas with beasts that have a swim speed.'},
 {n:'Leviathan Will',g:'Locathah',d:'Advantage on saving throws against being charmed or frightened.'},
 // Owlin
 {n:'Superior Darkvision',g:'Owlin',d:'Darkvision out to 120 ft.'},
 {n:'Flight',g:'Owlin',d:'Fly speed equal to your walking speed (light or no armor).'},
 {n:'Silent Feathers',g:'Owlin',d:'Proficiency in Stealth.',fx:[{t:'skill',skills:['stealth'],grant:'prof'}]},
 // Satyr
 {n:'Ram',g:'Satyr',d:'Unarmed strikes with your head deal 1d6 bludgeoning damage.'},
 {n:'Magic Resistance',g:'Satyr',d:'Advantage on saving throws against spells and other magical effects.'},
 {n:'Mirthful Leaps',g:'Satyr',d:'Add 1d8 to your long jump and high jump distance in feet.'},
 // Sea Elf
 {n:'Darkvision',g:'Sea Elf',d:'See in dim light within 60 ft. as if bright, and in darkness as if dim (no color).'},
 {n:'Fey Ancestry',g:'Sea Elf',d:'Advantage on saving throws against being charmed; magic can\'t put you to sleep.'},
 {n:'Child of the Sea',g:'Sea Elf',d:'Swim speed 30 ft.; breathe air and water.'},
 {n:'Friend of the Sea',g:'Sea Elf',d:'Communicate simple ideas with beasts that have a swim speed.'},
 {n:'Sea Elf Training',g:'Sea Elf',d:'Proficiency with spear, trident, light crossbow, heavy crossbow, and net.'},
 // Shadar-Kai
 {n:'Darkvision',g:'Shadar-Kai',d:'See in dim light within 60 ft. as if bright, and in darkness as if dim (no color).'},
 {n:'Fey Ancestry',g:'Shadar-Kai',d:'Advantage on saving throws against being charmed; magic can\'t put you to sleep.'},
 {n:'Necrotic Resistance',g:'Shadar-Kai',d:'Resistance to necrotic damage.'},
 {n:'Blessing of the Raven Queen',g:'Shadar-Kai',d:'Bonus action: teleport up to 30 ft. to an unoccupied space you can see; until the end of the turn you have resistance to all damage. 1/short or long rest.',combat:true,usesMax:1,usesPer:'short'},
 // Tabaxi
 {n:'Darkvision',g:'Tabaxi',d:'See in dim light within 60 ft. as if bright, and in darkness as if dim (no color).'},
 {n:'Feline Agility',g:'Tabaxi',d:'Double your speed until you move 0 ft. on one of your turns; can\'t use again until you move 0 ft. on a turn.'},
 {n:'Cat\'s Claws',g:'Tabaxi',d:'Unarmed strikes deal 1d4 slashing damage; climb speed 20 ft.'},
 {n:'Cat\'s Talent',g:'Tabaxi',d:'Proficiency in Perception and Stealth.'},
 // Tortle
 {n:'Natural Armor',g:'Tortle',d:'AC = 17 (DEX doesn\'t apply); can\'t wear light, medium, or heavy armor (shield ok).'},
 {n:'Claws',g:'Tortle',d:'Unarmed strikes deal 1d4 slashing damage; climb speed 20 ft.'},
 {n:'Shell Defense',g:'Tortle',d:'Action: withdraw into your shell — +4 AC, advantage on STR/CON saves, but prone, speed 0, disadvantage on DEX saves, no reactions. Only action available is to emerge.',combat:true},
 {n:'Hold Breath',g:'Tortle',d:'Hold your breath for up to 1 hour.'},
 // Triton
 {n:'Darkvision',g:'Triton',d:'See in dim light within 60 ft. as if bright, and in darkness as if dim (no color).'},
 {n:'Amphibious',g:'Triton',d:'Breathe air and water.'},
 {n:'Guardians of the Depths',g:'Triton',d:'Resistance to cold damage; adapted to deep ocean pressure and temperature.'},
 {n:'Emissary of the Sea',g:'Triton',d:'Communicate simple ideas with beasts that have a swim speed.'},
 {n:'Control Air and Water',g:'Triton',d:'Cast Fog Cloud; at 3rd level Gust of Wind 1/day; at 5th level Wall of Water 1/day (CHA).'},
 // Verdan
 {n:'Limited Telepathy',g:'Verdan',d:'Telepathically speak with creatures within 30 ft. that share a language with you.'},
 {n:'Persuasive',g:'Verdan',d:'Proficiency in Deception and Persuasion.'},
 {n:'Fey Resilience',g:'Verdan',d:'Advantage on saving throws against being charmed or magically put to sleep.'},
 // Bugbear
 {n:'Darkvision',g:'Bugbear',d:'See in dim light within 60 ft. as if bright, and in darkness as if dim (no color).'},
 {n:'Long-Limbed',g:'Bugbear',d:'Melee attacks on your turn have reach 5 ft. greater than normal.'},
 {n:'Powerful Build',g:'Bugbear',d:'Count as one size larger for carrying capacity and push/drag/lift.'},
 {n:'Sneaky',g:'Bugbear',d:'Proficiency in Stealth.',fx:[{t:'skill',skills:['stealth'],grant:'prof'}]},
 {n:'Surprise Attack',g:'Bugbear',d:'If you hit a surprised creature on your first turn, add 2d6 extra damage.'},
 // Centaur
 {n:'Charge',g:'Centaur',d:'If you move 30+ ft. straight toward a target then hit it with a melee attack the same turn, add extra damage (1d6, or 2d6 with a hooved weapon).',combat:true},
 {n:'Hooves',g:'Centaur',d:'Unarmed strikes with your hooves deal 1d4 + STR bludgeoning; usable alongside a hand attack in the same Attack action.'},
 {n:'Equine Build',g:'Centaur',d:'Count as one size larger for carrying capacity; advantage on saves against being knocked prone.'},
 {n:'Survivor',g:'Centaur',d:'Regain extra HP equal to your level when you spend Hit Dice on a short rest, once per short or long rest.'},
 // Goblin
 {n:'Darkvision',g:'Goblin',d:'See in dim light within 60 ft. as if bright, and in darkness as if dim (no color).'},
 {n:'Fury of the Small',g:'Goblin',d:'When you damage a creature larger than you, add extra damage equal to your level, once per short or long rest.',combat:true,usesMax:1,usesPer:'short'},
 {n:'Nimble Escape',g:'Goblin',d:'Bonus action: Disengage or Hide.',combat:true},
 // Grung
 {n:'Amphibious',g:'Grung',d:'Breathe air and water.'},
 {n:'Poisonous Skin',g:'Grung',d:'Anything that touches you or hits you with a melee attack while within 5 ft. must save or be poisoned for 1 minute.'},
 {n:'Standing Leap',g:'Grung',d:'Long jump up to 25 ft. and high jump up to 15 ft., with or without a running start.'},
 // Hobgoblin
 {n:'Darkvision',g:'Hobgoblin',d:'See in dim light within 60 ft. as if bright, and in darkness as if dim (no color).'},
 {n:'Martial Training',g:'Hobgoblin',d:'Proficiency with light armor and two martial weapons of your choice.'},
 {n:'Saving Face',g:'Hobgoblin',d:'After missing an attack roll or failing an ability check/save, gain a bonus equal to allies within 30 ft. who can see you (max your CON mod), once per short or long rest.',combat:true,usesMax:1,usesPer:'short'},
 // Kobold
 {n:'Darkvision',g:'Kobold',d:'See in dim light within 60 ft. as if bright, and in darkness as if dim (no color).'},
 {n:'Sunlight Sensitivity',g:'Kobold',d:'Disadvantage on attack rolls and Perception checks that rely on sight in direct sunlight.'},
 {n:'Draconic Cry',g:'Kobold',d:'Bonus action: shout for allies within 10 ft. who can hear you to gain advantage on attacks against one target this turn. 1/short or long rest.',combat:true,usesMax:1,usesPer:'short'},
 {n:'Grovel, Cower, and Beg',g:'Kobold',d:'Bonus action: cower pathetically — foes within 10 ft. who can hear you must save or have disadvantage on attacks vs. others until the start of your next turn. 1/short rest.',combat:true,usesMax:1,usesPer:'short'},
 // Lizardfolk
 {n:'Darkvision',g:'Lizardfolk',d:'See in dim light within 60 ft. as if bright, and in darkness as if dim (no color).'},
 {n:'Bite',g:'Lizardfolk',d:'Unarmed strikes with your bite deal 1d6 piercing damage.'},
 {n:'Cunning Artisan',g:'Lizardfolk',d:'Craft a shield, club, javelin, or other simple item from a slain creature\'s hide or bone during a short rest.'},
 {n:'Hold Breath',g:'Lizardfolk',d:'Hold your breath for up to 15 minutes.'},
 {n:'Hunter\'s Lore',g:'Lizardfolk',d:'Proficiency in two of: Animal Handling, Nature, Perception, Stealth, Survival.'},
 {n:'Natural Armor',g:'Lizardfolk',d:'AC = 13 + DEX mod (shield allowed); no other armor.'},
 // Minotaur
 {n:'Darkvision',g:'Minotaur',d:'See in dim light within 60 ft. as if bright, and in darkness as if dim (no color).'},
 {n:'Horns',g:'Minotaur',d:'Unarmed strikes with your horns deal 1d6 + STR piercing damage.'},
 {n:'Goring Rush',g:'Minotaur',d:'If you move 10+ ft. straight toward a target then hit it with horns the same turn, add 1d6 damage and push it 5 ft. if Large or smaller.',combat:true},
 {n:'Imposing Presence',g:'Minotaur',d:'Force one creature within 10 ft. to make a WIS save or have disadvantage on its next attack or check against you before your next turn. 1/short or long rest.',combat:true,usesMax:1,usesPer:'short'},
 {n:'Labyrinthine Recall',g:'Minotaur',d:'Perfectly recall any path you have traveled.'},
 // Orc
 {n:'Darkvision',g:'Orc',d:'See in dim light within 60 ft. as if bright, and in darkness as if dim (no color).'},
 {n:'Aggressive',g:'Orc',d:'Bonus action: move up to your speed toward an enemy you can see.',combat:true},
 {n:'Powerful Build',g:'Orc',d:'Count as one size larger for carrying capacity.'},
 {n:'Adrenaline Rush',g:'Orc',d:'Bonus action: Dash, gaining temp HP equal to your proficiency bonus. Uses = proficiency bonus per long rest.',combat:true,usesPer:'long',usesScale:'prof'},
 // Shifter
 {n:'Darkvision',g:'Shifter',d:'See in dim light within 60 ft. as if bright, and in darkness as if dim (no color).'},
 {n:'Shifting',g:'Shifter',d:'Bonus action: shift into a bestial form for 1 minute, gaining temp HP and a subrace feature (Beasthide/Longtooth/Swiftstride/Wildhunt). Once per short or long rest.',combat:true,usesMax:1,usesPer:'short'},
 // Yuan-Ti
 {n:'Darkvision',g:'Yuan-Ti',d:'See in dim light within 60 ft. as if bright, and in darkness as if dim (no color).'},
 {n:'Innate Spellcasting',g:'Yuan-Ti',d:'Know Poison Spray; at 3rd level Animal Friendship (snakes only) 1/day; at 6th level Suggestion 1/day (CHA).'},
 {n:'Magic Resistance',g:'Yuan-Ti',d:'Advantage on saving throws against spells and other magical effects.'},
 {n:'Poison Immunity',g:'Yuan-Ti',d:'Immune to poison damage and the poisoned condition.'}
];

const FEATS=['Actor','Alert','Artificer Initiate','Athlete','Bountiful Luck','Charger','Chef',
'Crossbow Expert','Crusher','Defensive Duelist','Dragon Fear','Dragon Hide','Drow High Magic',
'Dual Wielder','Dungeon Delver','Durable','Dwarven Fortitude','Eldritch Adept','Elemental Adept',
'Elven Accuracy','Fade Away','Fey Teleportation','Fey Touched','Fighting Initiate',
'Flames of Phlegethos','Gift of the Chromatic Dragon','Gift of the Gem Dragon',
'Gift of the Metallic Dragon','Grappler','Great Weapon Master','Gunner','Healer',
'Heavily Armored','Heavy Armor Master','Infernal Constitution','Inspiring Leader','Keen Mind',
'Lightly Armored','Linguist','Lucky','Mage Slayer','Magic Initiate','Martial Adept',
'Medium Armor Master','Metamagic Adept','Mobile','Moderately Armored','Mounted Combatant',
'Observant','Orcish Fury','Piercer','Poisoner','Polearm Master','Prodigy','Resilient',
'Ritual Caster','Savage Attacker','Second Chance','Sentinel','Shadow Touched','Sharpshooter',
'Shield Master','Skill Expert','Skilled','Skulker','Slasher','Spell Sniper','Squat Nimbleness',
'Strixhaven Initiate','Strixhaven Mascot','Tavern Brawler','Telekinetic','Telepathic','Tough',
'War Caster','Weapon Master','Wood Elf Magic'];

const LANGUAGES=[
 {n:'Common',g:'Standard'},{n:'Dwarvish',g:'Standard'},{n:'Elvish',g:'Standard'},
 {n:'Giant',g:'Standard'},{n:'Gnomish',g:'Standard'},{n:'Goblin',g:'Standard'},
 {n:'Halfling',g:'Standard'},{n:'Orc',g:'Standard'},
 {n:'Abyssal',g:'Exotic'},{n:'Celestial',g:'Exotic'},{n:'Deep Speech',g:'Exotic'},
 {n:'Draconic',g:'Exotic'},{n:'Infernal',g:'Exotic'},{n:'Primordial',g:'Exotic'},
 {n:'Sylvan',g:'Exotic'},{n:'Undercommon',g:'Exotic'},
 {n:'Druidic',g:'Secret'},{n:"Thieves' Cant",g:'Secret'}
];

// ---------- Other Proficiencies: armor, weapon & tool categories from the PHB, same {n,g,d} shape
// as LANGUAGES above. Specific weapon entries are generated off the WEAPONS table (data-equipment.js,
// loaded before this file) so their blurbs never drift from the stats used on the Combat tab.
function weaponBlurb(key){
  const w=WEAPONS[key]; if(!w) return '';
  const bits=[`${w.d} ${w.ty}`];
  if(w.fin) bits.push('finesse');
  if(w.ver) bits.push(`versatile (${w.ver})`);
  if(w.reach) bits.push('reach');
  if(w.h2) bits.push('two-handed'); else if(w.light) bits.push('light');
  if(w.thrown) bits.push(`thrown ${w.thrown} ft.`);
  if(w.rng) bits.push(`range ${w.rng} ft.`);
  return bits.join(', ');
}
const SIMPLE_MELEE_W=['club','dagger','greatclub','handaxe','javelin','lighthammer','mace','quarterstaff','sickle','spear'];
const SIMPLE_RANGED_W=['lightcrossbow','dart','shortbow','sling'];
const MARTIAL_MELEE_W=['battleaxe','flail','glaive','greataxe','greatsword','halberd','lance','longsword','maul','morningstar','pike','rapier','scimitar','shortsword','trident','warpick','warhammer','whip'];
const MARTIAL_RANGED_W=['handcrossbow','heavycrossbow','longbow'];
const PROFICIENCIES=[
 {n:'Light Armor',g:'Armor',d:'Padded, leather, studded leather. Add your full Dex modifier to AC; no Strength requirement.'},
 {n:'Medium Armor',g:'Armor',d:'Hide, chain shirt, scale mail, breastplate, half plate. Add your Dex modifier to AC, max +2.'},
 {n:'Heavy Armor',g:'Armor',d:'Ring mail, chain mail, splint, plate. Flat AC, no Dex bonus; some need a Strength minimum or impose stealth disadvantage.'},
 {n:'Shields',g:'Armor',d:"+2 AC while strapped to one arm; can't also wield a two-handed weapon."},
 {n:'Simple Weapons',g:'Weapons',d:'Every simple melee & ranged weapon — clubs, daggers, spears, slings, light crossbows and the rest. What most classes start with.'},
 {n:'Martial Weapons',g:'Weapons',d:'Every martial melee & ranged weapon — swords, axes, polearms, longbows, heavy crossbows and the rest. Includes Simple Weapons too.'},
 ...SIMPLE_MELEE_W.map(k=>({n:WEAPONS[k].n,g:'Simple Melee Weapons',d:weaponBlurb(k)})),
 ...SIMPLE_RANGED_W.map(k=>({n:WEAPONS[k].n,g:'Simple Ranged Weapons',d:weaponBlurb(k)})),
 ...MARTIAL_MELEE_W.map(k=>({n:WEAPONS[k].n,g:'Martial Melee Weapons',d:weaponBlurb(k)})),
 ...MARTIAL_RANGED_W.map(k=>({n:WEAPONS[k].n,g:'Martial Ranged Weapons',d:weaponBlurb(k)})),
 {n:"Alchemist's Supplies",g:"Artisan's Tools",d:'Identify and mix potions, acids, and other alchemical substances.'},
 {n:"Brewer's Supplies",g:"Artisan's Tools",d:"Brew ale, beer and spirits; judge or improve a drink's quality."},
 {n:"Calligrapher's Supplies",g:"Artisan's Tools",d:'Produce ornate lettering and imitate handwriting.'},
 {n:"Carpenter's Tools",g:"Artisan's Tools",d:'Build and repair wooden structures and objects.'},
 {n:"Cartographer's Tools",g:"Artisan's Tools",d:'Draw and read maps accurately.'},
 {n:"Cobbler's Tools",g:"Artisan's Tools",d:'Make and repair shoes and boots.'},
 {n:"Cook's Utensils",g:"Artisan's Tools",d:"Prepare and season food; judge by taste whether it's spoiled or poisoned."},
 {n:"Glassblower's Tools",g:"Artisan's Tools",d:'Shape molten glass into vessels and objects.'},
 {n:"Jeweler's Tools",g:"Artisan's Tools",d:'Cut and set gemstones; appraise their value.'},
 {n:"Leatherworker's Tools",g:"Artisan's Tools",d:'Craft and repair leather goods and armor.'},
 {n:"Mason's Tools",g:"Artisan's Tools",d:'Cut, shape and set stone.'},
 {n:"Painter's Supplies",g:"Artisan's Tools",d:'Create paintings and other visual art.'},
 {n:"Potter's Tools",g:"Artisan's Tools",d:'Shape and fire clay into pottery.'},
 {n:"Smith's Tools",g:"Artisan's Tools",d:'Forge and repair metal weapons, armor and objects.'},
 {n:"Tinker's Tools",g:"Artisan's Tools",d:'Build and repair small mechanisms — locks, clockwork, simple devices.'},
 {n:"Weaver's Tools",g:"Artisan's Tools",d:'Spin thread and weave cloth.'},
 {n:"Woodcarver's Tools",g:"Artisan's Tools",d:'Carve wooden objects and figures.'},
 {n:'Dice Set',g:'Gaming Sets',d:'Play (and cheat at) dice games; read the room while gambling.'},
 {n:'Dragonchess Set',g:'Gaming Sets',d:'Play the three-tiered strategy game popular among nobles and sages.'},
 {n:'Playing Card Set',g:'Gaming Sets',d:'Play (and cheat at) card games.'},
 {n:'Three-Dragon Ante Set',g:'Gaming Sets',d:'Play the fast, high-stakes card game favored in taverns.'},
 {n:'Bagpipes',g:'Musical Instruments',d:'Perform on the bagpipes.'},
 {n:'Drum',g:'Musical Instruments',d:'Perform on hand or frame drums.'},
 {n:'Dulcimer',g:'Musical Instruments',d:'Perform on the hammered dulcimer.'},
 {n:'Flute',g:'Musical Instruments',d:'Perform on the flute.'},
 {n:'Horn',g:'Musical Instruments',d:'Perform on a horn.'},
 {n:'Lute',g:'Musical Instruments',d:'Perform on the lute.'},
 {n:'Lyre',g:'Musical Instruments',d:'Perform on the lyre.'},
 {n:'Pan Flute',g:'Musical Instruments',d:'Perform on the pan flute.'},
 {n:'Shawm',g:'Musical Instruments',d:'Perform on the shawm, an oboe-like reed instrument.'},
 {n:'Viol',g:'Musical Instruments',d:'Perform on the viol.'},
 {n:'Disguise Kit',g:'Other Tools',d:'Create convincing physical disguises with makeup, hair and props.'},
 {n:'Forgery Kit',g:'Other Tools',d:'Copy handwriting, seals and the look of official documents.'},
 {n:'Herbalism Kit',g:'Other Tools',d:'Identify plants and brew remedies, including the base ingredient for potions of healing.'},
 {n:"Navigator's Tools",g:'Other Tools',d:'Chart a course and avoid getting lost at sea or on the road.'},
 {n:"Poisoner's Kit",g:'Other Tools',d:'Safely handle and apply poisons; identify poisoned food or drink.'},
 {n:"Thieves' Tools",g:'Other Tools',d:'Pick locks and disarm traps.'},
 {n:'Vehicles (Land)',g:'Vehicles',d:'Drive and control carts, wagons and other land vehicles.'},
 {n:'Vehicles (Water)',g:'Vehicles',d:'Pilot and navigate ships and other waterborne vehicles.'}
];

