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
 // Blood Hunter
 {n:'Hunter\'s Bane',g:'Blood Hunter',l:1,d:'Advantage on Survival checks to track, and Intelligence checks to recall lore about, fey, fiends, and undead. Your hemocraft save DC uses Intelligence.',fx:[{t:'note',skills:['survival'],kind:'adv',cond:'tracking fey, fiends, or undead'}]},
 {n:'Blood Maledict',g:'Blood Hunter',l:1,d:'Bonus action: afflict a creature within 30 ft. with one of two blood curses you know; amplify it by taking necrotic damage equal to half your Blood Hunter level for a stronger effect. 1/rest (2 at 6th, 3 at 13th, 4 at 17th).',combat:true,usesMax:1,usesPer:'short'},
 // Blood Curses (base list for Blood Maledict, not tied to an Order) — uses are tracked on Blood Maledict itself, not per curse
 {n:'Blood Curse of Binding',g:'Blood Hunter',l:1,d:'Blood Maledict: a Large or smaller creature within 30 ft. fails a STR save or its speed becomes 0 and it can\'t take reactions until the end of your next turn. Amplify: works on any size, lasts 1 minute, repeat save each turn.',combat:true,actionType:'bonus'},
 {n:'Blood Curse of Bloated Agony',g:'Blood Hunter',l:1,d:'Blood Maledict: a creature within 30 ft. has disadvantage on STR and DEX checks, and takes 1d8 necrotic damage if it makes more than one attack on its turn. Amplify: lasts 1 minute, CON save each turn to end early.',combat:true,actionType:'bonus'},
 {n:'Blood Curse of Exposure',g:'Blood Hunter',l:1,d:'Blood Maledict (reaction): when a creature within 30 ft. takes damage, it loses resistance to that damage type until the end of its next turn. Amplify: strips immunity to that damage type instead.',combat:true,actionType:'reaction'},
 {n:'Blood Curse of the Eyeless',g:'Blood Hunter',l:1,d:'Blood Maledict (reaction): when a creature within 30 ft. makes an attack roll, subtract your hemocraft die from it. Amplify: applies to every attack roll it makes until the end of its turn.',combat:true,actionType:'reaction'},
 {n:'Blood Curse of the Marked',g:'Blood Hunter',l:1,d:'Blood Maledict: a creature within 30 ft. takes an extra hemocraft die of rite damage the next time your active Crimson Rite hits it this turn. Amplify: your next attack against it has advantage before the end of your turn.',combat:true,actionType:'bonus'},
 {n:'Blood Curse of the Muddled Mind',g:'Blood Hunter',l:1,d:'Blood Maledict: a concentrating creature within 30 ft. has disadvantage on its next Constitution save to maintain concentration. Amplify: disadvantage on every concentration save it makes until the end of your next turn.',combat:true,actionType:'bonus'},
 {n:'Crimson Rite',g:'Blood Hunter',l:2,d:'Bonus action: imbue a weapon you\'re holding with an elemental rite, adding rite damage on hit; you take necrotic damage at the start of each of your turns while it\'s active. Extra rites known at 7th & 14th.',combat:true},
 {n:'Fighting Style (Blood Hunter)',g:'Blood Hunter',l:2,d:'Pick a style: Archery, Dueling, Great Weapon Fighting, or Two-Weapon Fighting.'},
 {n:'Extra Attack (Blood Hunter)',g:'Blood Hunter',l:5,d:'Attack twice when you take the Attack action.',combat:true},
 {n:'Brand of Castigation',g:'Blood Hunter',l:6,d:'On a hit with an active Crimson Rite weapon, brand the creature: you always know its direction, and it takes psychic damage equal to your hemocraft modifier whenever it damages you or a creature within 5 ft. of you.',combat:true},
 {n:'Grim Psychometry',g:'Blood Hunter',l:9,d:'Touch an object or place to sense sinister history tied to it — advantage on the History check, with a chance of a brief vision.',fx:[{t:'note',skills:['history'],kind:'adv',cond:'about sinister history tied to something you touch'}]},
 {n:'Dark Augmentation',g:'Blood Hunter',l:10,d:'+5 ft. speed, and advantage on Strength, Dexterity, and Constitution saving throws.',fx:[{t:'stat',stat:'speed',n:5}],combat:true},
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
 // ---- Subclasses ---- grouped as "Class — Subclass" so they sit right next to that class's base
 // features in search. Fighter and Cleric are fully covered (every official subclass/domain);
 // every other class still has only one or a few picks in — add more groups here the same way
 // as your table needs them, matching the naming/level/fx conventions of the entries already below.
 // Barbarian: Path of the Berserker
 {n:'Frenzy',g:'Barbarian — Path of the Berserker',l:3,d:'While raging, bonus-action melee attack each turn; take 1 level of exhaustion when the rage ends.',combat:true},
 {n:'Mindless Rage',g:'Barbarian — Path of the Berserker',l:6,d:'Can\'t be charmed or frightened while raging (already charmed/frightened when you rage? no effect while raging).'},
 {n:'Intimidating Presence',g:'Barbarian — Path of the Berserker',l:10,d:'Action: frighten one creature within 30 ft. (WIS save), for as long as you attack no one else.',combat:true},
 {n:'Retaliation',g:'Barbarian — Path of the Berserker',l:14,d:'Reaction: melee attack a creature within 5 ft. that just damaged you.',combat:true},
 // Blood Hunter: Order of the Mutant
 {n:'Mutagencraft',g:'Blood Hunter — Order of the Mutant',l:3,d:'Learn 4 mutagen formulas (more at higher levels); bonus action to concoct one after a short/long rest, altering your mental or physical abilities at the cost of a risky side effect.'},
 {n:'Strange Metabolism',g:'Blood Hunter — Order of the Mutant',l:7,d:'Immune to poison damage and the poisoned condition. Bonus action: ignore a mutagen\'s negative side effect for 1 minute, once per long rest.',combat:true,usesMax:1,usesPer:'long'},
 {n:'Brand of Axiom',g:'Blood Hunter — Order of the Mutant',l:11,d:'Branding a creature with Brand of Castigation ends illusions/invisibility on it and blocks new ones; it must succeed a WIS save or revert from an altered/alternate form and be stunned.',combat:true},
 {n:'Blood Curse of Corrosion',g:'Blood Hunter — Order of the Mutant',l:15,d:'Gain the Blood Curse of Corrosion for Blood Maledict, infusing a creature\'s body with terrible toxins; doesn\'t count against your curses known.'},
 {n:'Exalted Mutation',g:'Blood Hunter — Order of the Mutant',l:18,d:'Bonus action: end one active mutagen and immediately concoct a different known mutagen for free. Hemocraft modifier uses per long rest.',combat:true,usesPer:'long',usesScale:'int'},
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
 // Cleric: Arcana Domain
 {n:'Arcane Initiate',g:'Cleric — Arcana Domain',l:1,d:'Gain proficiency in Arcana and learn 2 cantrips of your choice from the wizard spell list; they count as cleric cantrips for you.'},
 {n:'Arcane Abjuration (Channel Divinity)',g:'Cleric — Arcana Domain',l:2,d:'Channel Divinity: present your holy symbol to force one celestial, elemental, fey, or fiend within 30 ft. that can see or hear you to make a WIS save or be turned for 1 minute or until it takes damage.',combat:true},
 {n:'Spell Breaker',g:'Cleric — Arcana Domain',l:6,d:'When you restore HP to an ally with a spell of 1st level or higher, you can also end one spell on that creature of level equal to or lower than the healing spell\'s slot level.',combat:true},
 {n:'Potent Spellcasting (Arcana)',g:'Cleric — Arcana Domain',l:8,d:'Add your WIS mod to the damage you deal with Cleric cantrips.',combat:true},
 {n:'Arcane Mastery',g:'Cleric — Arcana Domain',l:17,d:'Choose 4 wizard spells, one each of levels 6th-9th; add them to your domain spells — always prepared and count as cleric spells for you.'},
 // Cleric: Death Domain
 {n:'Bonus Proficiency (Death)',g:'Cleric — Death Domain',l:1,d:'Proficiency with martial weapons.'},
 {n:'Reaper',g:'Cleric — Death Domain',l:1,d:'Learn one necromancy cantrip from any spell list; when you cast a necromancy cantrip that normally targets only one creature, it can instead target two creatures within 5 ft. of each other.',combat:true},
 {n:'Touch of Death (Channel Divinity)',g:'Cleric — Death Domain',l:2,d:'Channel Divinity: when you hit with a melee attack, deal extra necrotic damage equal to 5 + twice your cleric level.',combat:true},
 {n:'Inescapable Destruction',g:'Cleric — Death Domain',l:6,d:'Necrotic damage from your cleric spells and Channel Divinity options ignores resistance to necrotic damage.',combat:true},
 {n:'Divine Strike (Death)',g:'Cleric — Death Domain',l:8,d:'Once per turn, add 1d8 necrotic damage on a weapon hit (2d8 at 14th level).',combat:true},
 {n:'Improved Reaper',g:'Cleric — Death Domain',l:17,d:'When you cast a necromancy spell of 1st-5th level that targets only one creature, it can instead target two creatures within 5 ft. of each other (provide materials for each target if the spell consumes them).',combat:true},
 // Cleric: Forge Domain
 {n:'Bonus Proficiencies (Forge)',g:'Cleric — Forge Domain',l:1,d:'Proficiency with heavy armor and smith\'s tools.'},
 {n:'Blessing of the Forge',g:'Cleric — Forge Domain',l:1,d:'At the end of a long rest, touch one nonmagical suit of armor or simple/martial weapon: until the end of your next long rest (or until you die) it grants +1 AC (armor) or +1 to attack and damage rolls (weapon).',usesMax:1,usesPer:'long'},
 {n:'Artisan\'s Blessing (Channel Divinity)',g:'Cleric — Forge Domain',l:2,d:'Channel Divinity: spend 1 hour to magically craft a nonmagical metal item worth up to 100 gp (a weapon, armor, 10 pieces of ammunition, a set of tools, etc.), consuming metal of equal value.'},
 {n:'Soul of the Forge',g:'Cleric — Forge Domain',l:6,d:'Resistance to fire damage; while wearing heavy armor, +1 bonus to AC.'},
 {n:'Divine Strike (Forge)',g:'Cleric — Forge Domain',l:8,d:'Once per turn, add 1d8 fire damage on a weapon hit (2d8 at 14th level).',combat:true},
 {n:'Saint of Forge and Fire',g:'Cleric — Forge Domain',l:17,d:'Immunity to fire damage; while wearing heavy armor, resistance to bludgeoning, piercing, and slashing damage from nonmagical attacks.'},
 // Cleric: Knowledge Domain
 {n:'Blessings of Knowledge',g:'Cleric — Knowledge Domain',l:1,d:'Learn 2 languages and gain proficiency in 2 of: Arcana, History, Nature, Religion; your proficiency bonus is doubled for ability checks using either chosen skill.'},
 {n:'Knowledge of the Ages (Channel Divinity)',g:'Cleric — Knowledge Domain',l:2,d:'Channel Divinity: as an action, choose one skill or tool — gain proficiency with it for 10 minutes.',combat:true},
 {n:'Read Thoughts (Channel Divinity)',g:'Cleric — Knowledge Domain',l:6,d:'Channel Divinity: as an action, target one creature within 60 ft. (WIS save) to read its surface thoughts for 1 minute; you can end the effect to cast Suggestion on it with no spell slot and an automatic failed save.',combat:true},
 {n:'Potent Spellcasting (Knowledge)',g:'Cleric — Knowledge Domain',l:8,d:'Add your WIS mod to the damage you deal with Cleric cantrips.',combat:true},
 {n:'Visions of the Past',g:'Cleric — Knowledge Domain',l:17,d:'Meditate 1+ minutes (concentration, up to your WIS score in minutes) to receive shadowy visions of a recent event tied to an object you hold or your surroundings.',usesMax:1,usesPer:'short'},
 // Cleric: Light Domain
 {n:'Bonus Cantrip (Light)',g:'Cleric — Light Domain',l:1,d:'Learn the Light cantrip if you don\'t already know it; it doesn\'t count against your cantrips known.'},
 {n:'Warding Flare',g:'Cleric — Light Domain',l:1,d:'Reaction: when attacked by a creature you can see within 30 ft., impose disadvantage on its attack roll (no effect on attackers immune to being blinded). WIS mod uses (min 1) per long rest.',combat:true,usesPer:'long',usesScale:'wis'},
 {n:'Radiance of the Dawn (Channel Divinity)',g:'Cleric — Light Domain',l:2,d:'Channel Divinity: dispel magical darkness within 30 ft.; each hostile creature within 30 ft. makes a CON save, taking 2d10 + cleric level radiant damage on a fail (half on a success).',combat:true},
 {n:'Improved Flare',g:'Cleric — Light Domain',l:6,d:'You can also use Warding Flare when a creature you can see within 30 ft. attacks someone other than you.',combat:true},
 {n:'Potent Spellcasting (Light)',g:'Cleric — Light Domain',l:8,d:'Add your WIS mod to the damage you deal with Cleric cantrips.',combat:true},
 {n:'Corona of Light',g:'Cleric — Light Domain',l:17,d:'Action: activate a 1-minute (or until dismissed) aura of bright light in a 60 ft. radius and dim light 30 ft. beyond; enemies in the bright light have disadvantage on saves against spells dealing fire or radiant damage.',combat:true},
 // Cleric: Nature Domain
 {n:'Acolyte of Nature',g:'Cleric — Nature Domain',l:1,d:'Learn one cantrip of your choice from the druid spell list (doesn\'t count against cantrips known) and gain proficiency in one of: Animal Handling, Nature, Survival.'},
 {n:'Bonus Proficiency (Nature)',g:'Cleric — Nature Domain',l:1,d:'Proficiency with heavy armor.'},
 {n:'Charm Animals and Plants (Channel Divinity)',g:'Cleric — Nature Domain',l:2,d:'Channel Divinity: as an action, present your holy symbol — each beast or plant creature that can see you within 30 ft. makes a WIS save or is charmed (friendly to you and creatures you designate) for 1 minute or until it takes damage.',combat:true},
 {n:'Dampen Elements',g:'Cleric — Nature Domain',l:6,d:'Reaction: when you or a creature within 30 ft. takes acid, cold, fire, lightning, or thunder damage, grant that creature resistance to that instance of the damage.',combat:true},
 {n:'Divine Strike (Nature)',g:'Cleric — Nature Domain',l:8,d:'Once per turn, add 1d8 cold, fire, or lightning damage (your choice) on a weapon hit (2d8 at 14th level).',combat:true},
 {n:'Master of Nature',g:'Cleric — Nature Domain',l:17,d:'Bonus action: verbally command what each creature charmed by your Charm Animals and Plants will do on its next turn.',combat:true},
 // Cleric: Order Domain
 {n:'Bonus Proficiency (Order)',g:'Cleric — Order Domain',l:1,d:'Proficiency with heavy armor and in the Intimidation or Persuasion skill (your choice).'},
 {n:'Voice of Authority',g:'Cleric — Order Domain',l:1,d:'When you cast a spell with a spell slot of 1st level or higher and target an ally with it, that ally can use its reaction right after to make one weapon attack against a target you designate.',combat:true},
 {n:'Channel Divinity: Order\'s Demand',g:'Cleric — Order Domain',l:2,d:'Channel Divinity: each creature of your choice within 30 ft. that can see or hear you must succeed on a WIS save or be charmed by you until the end of your next turn or until it takes damage; you may also force a charmed creature to drop what it\'s holding.',combat:true},
 {n:'Embodiment of the Law',g:'Cleric — Order Domain',l:6,d:'When you cast an enchantment spell using a spell slot of 1st level or higher, you can change its casting time to 1 bonus action. WIS mod uses (min 1) per long rest.',combat:true,usesPer:'long',usesScale:'wis'},
 {n:'Divine Strike (Order)',g:'Cleric — Order Domain',l:8,d:'Once per turn, add 1d8 psychic damage on a weapon hit (2d8 at 14th level).',combat:true},
 {n:'Order\'s Wrath',g:'Cleric — Order Domain',l:17,d:'When you deal Divine Strike damage, curse the target until the start of your next turn; the next ally attack to hit it deals an extra 2d8 psychic damage and ends the curse (one curse per turn).',combat:true},
 // Cleric: Peace Domain
 {n:'Implement of Peace',g:'Cleric — Peace Domain',l:1,d:'Proficiency in the Insight, Performance, or Persuasion skill (your choice).'},
 {n:'Emboldening Bond',g:'Cleric — Peace Domain',l:1,d:'Action: forge a 10-minute bond among a number of willing creatures (including yourself) within 30 ft. equal to your proficiency bonus. While a bonded creature is within 30 ft. of another bonded creature, it can add a d4 to one attack roll, ability check, or save per turn. Proficiency-bonus uses per long rest.',combat:true,usesPer:'long',usesScale:'prof'},
 {n:'Channel Divinity: Balm of Peace',g:'Cleric — Peace Domain',l:2,d:'Channel Divinity: move up to your speed without provoking opportunity attacks, restoring 2d6 + WIS mod HP (min 1) to each creature you come within 5 ft. of during the move (each creature only once).',combat:true},
 {n:'Protective Bond',g:'Cleric — Peace Domain',l:6,d:'Reaction: when a creature bonded by your Emboldening Bond is about to take damage, another bonded creature within 30 ft. of it can teleport to within 5 ft. of it and take all the damage instead.',combat:true},
 {n:'Potent Spellcasting (Peace)',g:'Cleric — Peace Domain',l:8,d:'Add your WIS mod to the damage you deal with Cleric cantrips.',combat:true},
 {n:'Expansive Bond',g:'Cleric — Peace Domain',l:17,d:'Emboldening Bond and Protective Bond now work at up to 60 ft. between bonded creatures, and a creature that uses Protective Bond to take another\'s damage has resistance to that damage.',combat:true},
 // Cleric: Tempest Domain
 {n:'Bonus Proficiency (Tempest)',g:'Cleric — Tempest Domain',l:1,d:'Proficiency with martial weapons and heavy armor.'},
 {n:'Wrath of the Storm',g:'Cleric — Tempest Domain',l:1,d:'Reaction: when a creature within 5 ft. you can see hits you with an attack, force it to make a DEX save, taking 2d8 lightning or thunder damage (your choice) on a fail, half on a success. WIS mod uses (min 1) per long rest.',combat:true,usesPer:'long',usesScale:'wis'},
 {n:'Channel Divinity: Destructive Wrath',g:'Cleric — Tempest Domain',l:2,d:'Channel Divinity: when you roll lightning or thunder damage, deal maximum damage instead of rolling.',combat:true},
 {n:'Thunderous Strike',g:'Cleric — Tempest Domain',l:6,d:'When you deal lightning damage to a Large or smaller creature, you can also push it up to 10 ft. away from you.',combat:true},
 {n:'Divine Strike (Tempest)',g:'Cleric — Tempest Domain',l:8,d:'Once per turn, add 1d8 thunder damage on a weapon hit (2d8 at 14th level).',combat:true},
 {n:'Stormborn',g:'Cleric — Tempest Domain',l:17,d:'You have a flying speed equal to your walking speed whenever you are not underground or indoors.'},
 // Cleric: Trickery Domain
 {n:'Blessing of the Trickster',g:'Cleric — Trickery Domain',l:1,d:'Action: touch a willing creature other than yourself to give it advantage on DEX (Stealth) checks for 1 hour or until you use this again.'},
 {n:'Channel Divinity: Invoke Duplicity',g:'Cleric — Trickery Domain',l:2,d:'Channel Divinity, action: create an illusory duplicate of yourself within 30 ft. for 1 minute (or until you lose concentration); bonus action to move it up to 30 ft. (max 120 ft. away). You can cast spells as if from its space using your own senses, and when you and the duplicate are both within 5 ft. of a creature that can see it, you have advantage on attack rolls against that creature.',combat:true},
 {n:'Channel Divinity: Cloak of Shadows',g:'Cleric — Trickery Domain',l:6,d:'Channel Divinity, action: turn invisible until the end of your next turn, or until you attack or cast a spell.',combat:true},
 {n:'Divine Strike (Trickery)',g:'Cleric — Trickery Domain',l:8,d:'Once per turn, add 1d8 poison damage on a weapon hit (2d8 at 14th level).',combat:true},
 {n:'Improved Duplicity',g:'Cleric — Trickery Domain',l:17,d:'Invoke Duplicity now creates up to four duplicates instead of one; as a bonus action, move any number of them up to 30 ft. each (max 120 ft. away).',combat:true},
 // Cleric: Twilight Domain
 {n:'Bonus Proficiency (Twilight)',g:'Cleric — Twilight Domain',l:1,d:'Proficiency with martial weapons and heavy armor.'},
 {n:'Eyes of Night',g:'Cleric — Twilight Domain',l:1,d:'You have darkvision out to 300 ft., treating dim light as bright light and darkness as dim light within it. You can share this darkvision with willing creatures within 10 ft. (up to WIS mod, min 1) for 1 hour; once shared, you can\'t do so again until a long rest unless you expend a spell slot.',usesPer:'long',usesScale:'wis'},
 {n:'Vigilant Blessing',g:'Cleric — Twilight Domain',l:1,d:'Action: touch a creature (possibly yourself) to give it advantage on its next initiative roll.',combat:true},
 {n:'Channel Divinity: Twilight Sanctuary',g:'Cleric — Twilight Domain',l:2,d:'Channel Divinity: create a 30-ft.-radius sphere of dim light around you for 1 minute. A creature that ends its turn in it gains 1d6 + your cleric level temp HP, or you end one charmed or frightened effect on it (your choice each time).',combat:true},
 {n:'Steps of Night',g:'Cleric — Twilight Domain',l:6,d:'Bonus action, while in dim light or darkness: gain a flying speed equal to your walking speed for 1 minute. Uses equal to proficiency bonus per long rest.',combat:true,usesPer:'long',usesScale:'prof'},
 {n:'Divine Strike (Twilight)',g:'Cleric — Twilight Domain',l:8,d:'Once per turn, add 1d8 radiant damage on a weapon hit (2d8 at 14th level).',combat:true},
 {n:'Twilight Shroud',g:'Cleric — Twilight Domain',l:17,d:'You and your allies have half cover while within the sphere created by Twilight Sanctuary.',combat:true},
 // Cleric: War Domain
 {n:'Bonus Proficiency (War)',g:'Cleric — War Domain',l:1,d:'Proficiency with martial weapons and heavy armor.'},
 {n:'War Priest',g:'Cleric — War Domain',l:1,d:'When you take the Attack action, you can make one weapon attack as a bonus action. WIS mod uses (min 1) per long rest.',combat:true,usesPer:'long',usesScale:'wis'},
 {n:'Channel Divinity: Guided Strike',g:'Cleric — War Domain',l:2,d:'Channel Divinity: after seeing an attack roll (yours) but before the DM says hit or miss, gain a +10 bonus to it.',combat:true},
 {n:'Channel Divinity: War God\'s Blessing',g:'Cleric — War Domain',l:6,d:'Reaction: when a creature within 30 ft. makes an attack roll, use Channel Divinity to grant it a +10 bonus, chosen after the roll but before the DM says hit or miss.',combat:true},
 {n:'Divine Strike (War)',g:'Cleric — War Domain',l:8,d:'Once per turn, add 1d8 damage of the same type as your weapon on a weapon hit (2d8 at 14th level).',combat:true},
 {n:'Avatar of Battle',g:'Cleric — War Domain',l:17,d:'Resistance to bludgeoning, piercing, and slashing damage from nonmagical attacks.',combat:true},
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
 // Fighter: Battle Master
 {n:'Combat Superiority',g:'Fighter — Battle Master',l:3,d:'Learn 3 maneuvers (2 more at 7th, 10th & 15th — 7 total) and gain 4 superiority dice, d8s (5 at 7th, 6 at 15th). Spend a die to fuel a maneuver on a hit or as a reaction; regain all expended dice on a short/long rest. Maneuver save DC = 8 + proficiency + STR/DEX mod.',combat:true,pool:'battlemaster-maneuvers',poolLabel:'Maneuvers',pickCap:{3:3,7:4,10:5,15:6}},
 {n:'Student of War',g:'Fighter — Battle Master',l:3,d:'Proficiency with one type of artisan\'s tools of your choice.'},
 {n:'Know Your Enemy',g:'Fighter — Battle Master',l:7,d:'After 1 minute observing/interacting with a creature outside combat, learn whether it\'s your equal, superior, or inferior in two traits you choose (STR, DEX, CON, AC, current HP, total class levels, fighter levels).'},
 {n:'Improved Combat Superiority',g:'Fighter — Battle Master',l:10,d:'Superiority dice become d10s (d12s at 18th level).'},
 {n:'Relentless',g:'Fighter — Battle Master',l:15,d:'When you roll initiative with no superiority dice remaining, regain one.',combat:true},
 // Battle Master maneuvers — options for Combat Superiority above; uses are tracked on that
 // feature, not per maneuver. `pool` ties these to Combat Superiority's `pickCap` so Level Up can
 // offer them as a "choose N" picker instead of listing all 16 as automatically gained.
 {n:'Commander\'s Strike',g:'Fighter — Battle Master',l:3,d:'Bonus action: forgo one of your attacks to direct a willing ally to use their reaction to attack the same target; add the superiority die to their damage.',combat:true,actionType:'bonus',pool:'battlemaster-maneuvers'},
 {n:'Disarming Attack',g:'Fighter — Battle Master',l:3,d:'On a hit, add the superiority die to the damage; target makes a STR save or drops one item of your choice it\'s holding.',combat:true,pool:'battlemaster-maneuvers'},
 {n:'Distracting Strike',g:'Fighter — Battle Master',l:3,d:'On a hit, add the superiority die to the damage; the next attack against that creature by someone other than you has advantage before your next turn.',combat:true,pool:'battlemaster-maneuvers'},
 {n:'Evasive Footwork',g:'Fighter — Battle Master',l:3,d:'While you move, add the superiority die to your AC until you stop moving.',combat:true,pool:'battlemaster-maneuvers'},
 {n:'Feinting Attack',g:'Fighter — Battle Master',l:3,d:'Bonus action to feint against a creature within 5 ft.; advantage on your next attack against it this turn, and add the superiority die to the damage on a hit.',combat:true,actionType:'bonus',pool:'battlemaster-maneuvers'},
 {n:'Goading Attack',g:'Fighter — Battle Master',l:3,d:'On a hit, add the superiority die to the damage; target makes a WIS save or has disadvantage on attacks against anyone but you until your next turn.',combat:true,pool:'battlemaster-maneuvers'},
 {n:'Lunging Attack',g:'Fighter — Battle Master',l:3,d:'When you make a melee attack, increase your reach by 5 ft. for it; add the superiority die to the damage on a hit.',combat:true,pool:'battlemaster-maneuvers'},
 {n:'Maneuvering Attack',g:'Fighter — Battle Master',l:3,d:'On a hit, add the superiority die to the damage; a willing ally can then use their reaction to move up to half their speed without provoking opportunity attacks from the target.',combat:true,pool:'battlemaster-maneuvers'},
 {n:'Menacing Attack',g:'Fighter — Battle Master',l:3,d:'On a hit, add the superiority die to the damage; target makes a WIS save or is frightened of you until the end of your next turn.',combat:true,pool:'battlemaster-maneuvers'},
 {n:'Parry',g:'Fighter — Battle Master',l:3,d:'Reaction when hit by a melee attack: reduce the damage by the superiority die roll + your DEX modifier.',combat:true,actionType:'reaction',pool:'battlemaster-maneuvers'},
 {n:'Precision Attack',g:'Fighter — Battle Master',l:3,d:'When you make an attack roll, add the superiority die to it, before or after seeing the roll.',combat:true,pool:'battlemaster-maneuvers'},
 {n:'Pushing Attack',g:'Fighter — Battle Master',l:3,d:'On a hit, add the superiority die to the damage; target makes a STR save or is pushed 15 ft. away, if Large or smaller.',combat:true,pool:'battlemaster-maneuvers'},
 {n:'Rally',g:'Fighter — Battle Master',l:3,d:'Bonus action: choose a friendly creature that can see or hear you; it gains temporary HP equal to the superiority die roll + your CHA modifier.',combat:true,actionType:'bonus',pool:'battlemaster-maneuvers'},
 {n:'Riposte',g:'Fighter — Battle Master',l:3,d:'Reaction when a creature misses you with a melee attack: make a melee attack against it; add the superiority die to the damage on a hit.',combat:true,actionType:'reaction',pool:'battlemaster-maneuvers'},
 {n:'Sweeping Attack',g:'Fighter — Battle Master',l:3,d:'On a hit, choose another creature within 5 ft. of the original target and within your reach; it takes damage equal to the superiority die roll if the attack would\'ve hit its AC.',combat:true,pool:'battlemaster-maneuvers'},
 {n:'Trip Attack',g:'Fighter — Battle Master',l:3,d:'On a hit, add the superiority die to the damage; target makes a STR save or is knocked prone, if Large or smaller.',combat:true,pool:'battlemaster-maneuvers'},
 // Fighter: Samurai
 {n:'Bonus Proficiency (Samurai)',g:'Fighter — Samurai',l:3,d:'Proficiency in one of History, Insight, Performance, or Persuasion — or learn one language of your choice.'},
 {n:'Fighting Spirit',g:'Fighter — Samurai',l:3,d:'Bonus action: advantage on weapon attack rolls until the end of the turn; if you have no temp HP, also gain some (5 at 3rd level, 10 at 10th, 15 at 15th). 3 uses per long rest.',combat:true,usesMax:3,usesPer:'long',actionType:'bonus'},
 {n:'Elegant Courtier',g:'Fighter — Samurai',l:7,d:'Add your WIS mod to Charisma (Persuasion) checks. Gain proficiency in WIS saves — or, if already proficient, in INT or CHA saves instead.'},
 {n:'Tireless Spirit',g:'Fighter — Samurai',l:10,d:'When you roll initiative with no uses of Fighting Spirit remaining, regain one use.',combat:true},
 {n:'Rapid Strike',g:'Fighter — Samurai',l:15,d:'When you attack with advantage, you can forgo the advantage on one attack roll to make an extra weapon attack against the same target, as part of the same Attack action. Once per turn.',combat:true},
 {n:'Strength before Death',g:'Fighter — Samurai',l:18,d:'When reduced to 0 HP but not killed outright, reaction to delay falling unconscious and take an extra turn (still make death saves as normal). Once per long rest.',combat:true,usesMax:1,usesPer:'long',actionType:'reaction'},
 // Fighter: Arcane Archer
 {n:'Arcane Archer Lore',g:'Fighter — Arcane Archer',l:3,d:'Gain proficiency in Arcana or Nature (your choice) and learn the Prestidigitation or Druidcraft cantrip (your choice).'},
 {n:'Arcane Shot',g:'Fighter — Arcane Archer',l:3,d:'Know 2 Arcane Shot options (1 more at 7th, 10th, 15th & 18th). Once per turn when you fire a shortbow/longbow arrow as part of the Attack action, apply one known option to it. Save DC = 8 + proficiency + INT mod.',combat:true,usesMax:2,usesPer:'short'},
 {n:'Banishing Arrow',g:'Fighter — Arcane Archer',l:3,d:'Target makes a CHA save or is banished (speed 0, incapacitated) for 1 minute; at 18th level also deals 2d6 force damage on the hit.',combat:true},
 {n:'Beguiling Arrow',g:'Fighter — Arcane Archer',l:3,d:'Target takes 2d6 psychic damage (4d6 at 18th) and makes a WIS save or is charmed by an ally you choose within 30 ft. until the start of your next turn.',combat:true},
 {n:'Bursting Arrow',g:'Fighter — Arcane Archer',l:3,d:'Target and everything within 10 ft. of it takes 2d6 force damage (4d6 at 18th).',combat:true},
 {n:'Enfeebling Arrow',g:'Fighter — Arcane Archer',l:3,d:'Target takes 2d6 necrotic damage (4d6 at 18th) and makes a CON save or its weapon-attack damage is halved until the start of your next turn.',combat:true},
 {n:'Grasping Arrow',g:'Fighter — Arcane Archer',l:3,d:'Target takes 2d6 poison damage (4d6 at 18th), its speed is reduced by 10 ft., and it takes 2d6 slashing damage (4d6 at 18th) the first time each turn it moves at least 1 ft., until the end of your next turn.',combat:true},
 {n:'Piercing Arrow',g:'Fighter — Arcane Archer',l:3,d:'Fires through a line; each creature in it makes a DEX save or takes the arrow\'s damage plus 1d6 piercing damage (2d6 at 18th).',combat:true},
 {n:'Seeking Arrow',g:'Fighter — Arcane Archer',l:3,d:'Target makes a DEX save, even with cover or invisible, or takes the arrow\'s damage plus 1d6 force damage (2d6 at 18th).',combat:true},
 {n:'Shadow Arrow',g:'Fighter — Arcane Archer',l:3,d:'Target takes 2d6 psychic damage (4d6 at 18th) and makes a WIS save or can\'t see anything farther than 5 ft. away until the end of your next turn.',combat:true},
 {n:'Magic Arrow',g:'Fighter — Arcane Archer',l:7,d:'Nonmagical arrows fired from a shortbow/longbow count as magical for overcoming resistance/immunity to nonmagical attacks and damage.',combat:true},
 {n:'Curving Shot',g:'Fighter — Arcane Archer',l:7,d:'On a miss with a magic arrow, bonus action to reroll the attack against a different target within 60 ft. of the original.',combat:true,actionType:'bonus'},
 {n:'Ever-Ready Shot',g:'Fighter — Arcane Archer',l:15,d:'If you roll initiative with no uses of Arcane Shot remaining, regain one use of it.',combat:true},
 // Fighter: Banneret
 {n:'Rallying Cry',g:'Fighter — Banneret',l:3,d:'When you use Second Wind, up to 3 allies within 60 ft. who can see or hear you regain HP equal to your fighter level.',combat:true},
 {n:'Royal Envoy',g:'Fighter — Banneret',l:7,d:'Gain Persuasion proficiency (or, if already proficient, proficiency in Animal Handling, Insight, Intimidation, or Performance instead); double proficiency bonus on Persuasion checks.'},
 {n:'Inspiring Surge',g:'Fighter — Banneret',l:10,d:'When you use Action Surge, one ally within 60 ft. who can see or hear you can make one melee or ranged weapon attack with its reaction.',combat:true},
 {n:'Bulwark',g:'Fighter — Banneret',l:15,d:'When you use Indomitable to reroll an INT/WIS/CHA save and aren\'t incapacitated, one ally within 60 ft. who also failed the same save (and can see/hear you) can reroll it too, using the new roll.',combat:true},
 {n:'Inspiring Surge Improvement',g:'Fighter — Banneret',l:18,d:'Inspiring Surge can affect two allies within 60 ft. instead of one.',combat:true},
 // Fighter: Cavalier
 {n:'Bonus Proficiency',g:'Fighter — Cavalier',l:3,d:'Proficiency in one of Animal Handling, History, Insight, Performance, or Persuasion — or learn one language of your choice.'},
 {n:'Born to the Saddle',g:'Fighter — Cavalier',l:3,d:'Advantage on saves to avoid falling off your mount; falling 10 ft. or less from a mount lets you land on your feet if not incapacitated; mounting/dismounting costs only 5 ft. of movement.'},
 {n:'Unwavering Mark',g:'Fighter — Cavalier',l:3,d:'On a melee hit, mark the creature until the end of your next turn: while within 5 ft. of you it has disadvantage on attacks that don\'t target you, and if it damages someone other than you, you can make a bonus-action melee attack against it on your next turn with advantage, dealing extra damage equal to half your fighter level on a hit.',combat:true},
 {n:'Warding Maneuver',g:'Fighter — Cavalier',l:7,d:'Reaction when you or a creature within 5 ft. of you is hit by an attack: roll 1d8 and add it to the target\'s AC against that attack; if it still hits, the target has resistance to the attack\'s damage.',combat:true,actionType:'reaction'},
 {n:'Hold the Line',g:'Fighter — Cavalier',l:10,d:'Creatures provoke your opportunity attack when they move 5 ft. or more while within your reach; on a hit with an opportunity attack, the target\'s speed becomes 0 until the end of the current turn.',combat:true},
 {n:'Ferocious Charger',g:'Fighter — Cavalier',l:15,d:'After moving at least 10 ft. in a straight line before hitting a creature with an attack, it makes a STR save (DC 8 + proficiency + STR mod) or is knocked prone. Once per turn.',combat:true},
 {n:'Vigilant Defender',g:'Fighter — Cavalier',l:18,d:'Gain a special reaction usable once on every creature\'s turn but your own, only to make an opportunity attack; can\'t be used on a turn you also use your normal reaction.',combat:true,actionType:'reaction'},
 // Fighter: Echo Knight
 {n:'Manifest Echo',g:'Fighter — Echo Knight',l:3,d:'Bonus action: manifest an illusory echo of yourself in an unoccupied space you can see within 15 ft. (AC 14 + proficiency, 1 HP, immune to all conditions, moves up to 30 ft./turn, destroyed if more than 30 ft. from you at the end of your turn). Bonus action: teleport to swap places with it, costing 15 ft. of your movement regardless of distance. Attacks can originate from either your space or the echo\'s.',combat:true,actionType:'bonus'},
 {n:'Unleash Incarnation',g:'Fighter — Echo Knight',l:3,d:'Whenever you take the Attack action, make one additional melee attack from the echo\'s position. Uses = CON mod (min 1), regained on a long rest.',combat:true,usesPer:'long',usesScale:'con'},
 {n:'Echo Avatar',g:'Fighter — Echo Knight',l:7,d:'Action: see through your echo\'s eyes and hear through its ears for up to 10 minutes (you\'re deafened and blinded to your own senses meanwhile); while doing so the echo can be up to 1,000 ft. away without being destroyed.'},
 {n:'Shadow Martyr',g:'Fighter — Echo Knight',l:10,d:'Reaction before an attack roll against a creature is made: teleport your echo to an unoccupied space within 5 ft. of that creature so the attack targets the echo instead. Once per short/long rest.',combat:true,usesMax:1,usesPer:'short',actionType:'reaction'},
 {n:'Reclaim Potential',g:'Fighter — Echo Knight',l:15,d:'When your echo is destroyed, if you have no temporary HP you gain 2d6 + CON mod temporary HP. Uses = CON mod (min 1), regained on a long rest.',combat:true,usesPer:'long',usesScale:'con'},
 {n:'Legion of One',g:'Fighter — Echo Knight',l:18,d:'You can have two echoes manifested at once (manifesting a third destroys the two oldest); attacks can originate from either echo\'s position or your own. When you roll initiative with no uses of Unleash Incarnation remaining, regain one use.',combat:true},
 // Fighter: Eldritch Knight
 {n:'Spellcasting',g:'Fighter — Eldritch Knight',l:3,d:'Learn 2 cantrips and 3 1st-level spells from the wizard list (at least 2 of the 1st-level spells must be abjuration or evocation). INT is your spellcasting ability.'},
 {n:'Weapon Bond',g:'Fighter — Eldritch Knight',l:3,d:'1-hour ritual (can be done on a short rest) bonds you to a weapon: you can\'t be disarmed of it unless incapacitated, and can summon it to your hand as a bonus action. Up to 2 bonded weapons, but only 1 summoned per turn.',combat:true,actionType:'bonus'},
 {n:'War Magic',g:'Fighter — Eldritch Knight',l:7,d:'When you use your action to cast a cantrip, make one weapon attack as a bonus action.',combat:true,actionType:'bonus'},
 {n:'Eldritch Strike',g:'Fighter — Eldritch Knight',l:10,d:'On a weapon hit, the target has disadvantage on the next save it makes against a spell you cast before the end of your next turn.',combat:true},
 {n:'Arcane Charge',g:'Fighter — Eldritch Knight',l:15,d:'When you use Action Surge, teleport up to 30 ft. to an unoccupied space you can see, before or after the extra action.',combat:true},
 {n:'Improved War Magic',g:'Fighter — Eldritch Knight',l:18,d:'When you use your action to cast a spell (not just a cantrip), make one weapon attack as a bonus action.',combat:true,actionType:'bonus'},
 // Fighter: Psi Warrior
 {n:'Psionic Power',g:'Fighter — Psi Warrior',l:3,d:'Gain psionic energy dice equal to twice your proficiency bonus, d6s (d8 at 5th level, d10 at 11th, d12 at 17th); regain all on a long rest. Fuels Protective Field, Psionic Strike, and Telekinetic Movement.',combat:true},
 {n:'Protective Field',g:'Fighter — Psi Warrior',l:3,d:'Reaction when you or a creature within 30 ft. takes damage: expend a psionic energy die, roll it, and reduce that damage by the result + your INT mod (minimum 1).',combat:true,actionType:'reaction'},
 {n:'Psionic Strike',g:'Fighter — Psi Warrior',l:3,d:'Once per turn, immediately after hitting with a weapon attack within 30 ft., expend a psionic energy die to deal extra force damage equal to the roll + your INT mod.',combat:true},
 {n:'Telekinetic Movement',g:'Fighter — Psi Warrior',l:3,d:'Action: move a Large or smaller loose object or a willing creature within 30 ft. up to 30 ft. to an unoccupied space you can see. Free once per short/long rest; expend a psionic energy die to use again.',combat:true,usesMax:1,usesPer:'short'},
 {n:'Psi-Powered Leap',g:'Fighter — Psi Warrior',l:7,d:'Bonus action: gain a flying speed equal to twice your walking speed until the end of the current turn. Free once per short/long rest; expend a psionic energy die to use again.',combat:true,actionType:'bonus',usesMax:1,usesPer:'short'},
 {n:'Telekinetic Thrust',g:'Fighter — Psi Warrior',l:7,d:'When your Psionic Strike damages a target, force a STR save (DC 8 + proficiency + INT mod); on a fail, knock it prone or move it up to 10 ft. in any direction.',combat:true},
 {n:'Guarded Mind',g:'Fighter — Psi Warrior',l:10,d:'Resistance to psychic damage. If you start your turn charmed or frightened, expend a psionic energy die to end all such effects on yourself.',combat:true},
 {n:'Bulwark of Force',g:'Fighter — Psi Warrior',l:15,d:'Bonus action: grant half cover to a number of creatures (including yourself) within 30 ft. equal to your INT mod (min 1), for 1 minute or until incapacitated. Free once per short/long rest; expend a psionic energy die to use again.',combat:true,actionType:'bonus',usesMax:1,usesPer:'short'},
 {n:'Telekinetic Master',g:'Fighter — Psi Warrior',l:18,d:'Cast Telekinesis at will with no components (INT-based); while concentrating on it, make a weapon attack as a bonus action on each of your turns. Free once per short/long rest; expend a psionic energy die to cast it again.',combat:true,actionType:'bonus',usesMax:1,usesPer:'short'},
 // Fighter: Rune Knight
 {n:'Bonus Proficiencies',g:'Fighter — Rune Knight',l:3,d:'Proficiency with smith\'s tools; learn to speak, read, and write Giant.'},
 {n:'Rune Carver',g:'Fighter — Rune Knight',l:3,d:'Learn 2 runes (3 at 7th, 4 at 10th, 5 at 15th), inscribed onto armor, a weapon, or a shield after a long rest. Hill and Storm Runes require 7th level. Rune save DC = 8 + proficiency + CON mod.',combat:true},
 {n:'Cloud Rune',g:'Fighter — Rune Knight',l:3,d:'Advantage on Sleight of Hand and Deception checks. Reaction: when you or a creature within 30 ft. is hit by an attack roll, redirect it to a different creature within 30 ft. (not the attacker), using the same roll. Once per short/long rest.',combat:true,actionType:'reaction',usesMax:1,usesPer:'short'},
 {n:'Fire Rune',g:'Fighter — Rune Knight',l:3,d:'Doubles your proficiency bonus on tool checks. On a weapon hit, deal an extra 2d6 fire damage and force a STR save or restrain the target for 1 minute, dealing 2d6 fire damage at the start of each of its turns while restrained. Once per short/long rest.',combat:true,usesMax:1,usesPer:'short'},
 {n:'Frost Rune',g:'Fighter — Rune Knight',l:3,d:'Advantage on Animal Handling and Intimidation checks. Bonus action: +2 to STR/CON checks and saves for 10 minutes. Once per short/long rest.',combat:true,actionType:'bonus',usesMax:1,usesPer:'short'},
 {n:'Stone Rune',g:'Fighter — Rune Knight',l:3,d:'Advantage on Insight checks; 120 ft. darkvision. Reaction: force a creature to make a WIS save or be charmed by you for 1 minute. Once per short/long rest.',combat:true,actionType:'reaction',usesMax:1,usesPer:'short'},
 {n:'Hill Rune',g:'Fighter — Rune Knight',l:7,d:'Advantage on saves against poison and resistance to poison damage. Bonus action: resistance to bludgeoning, piercing, and slashing damage for 1 minute. Once per short/long rest.',combat:true,actionType:'bonus',usesMax:1,usesPer:'short'},
 {n:'Storm Rune',g:'Fighter — Rune Knight',l:7,d:'Advantage on Arcana checks; can\'t be surprised while conscious. Bonus action: enter a prophetic state for 1 minute or until incapacitated. Once per short/long rest.',combat:true,actionType:'bonus',usesMax:1,usesPer:'short'},
 {n:'Giant\'s Might',g:'Fighter — Rune Knight',l:3,d:'Bonus action: become Large for 1 minute (if you have room), with advantage on STR checks and saves; once per turn, one weapon or unarmed attack deals an extra 1d6 damage. Uses = proficiency bonus per long rest.',combat:true,actionType:'bonus',usesPer:'long',usesScale:'prof'},
 {n:'Runic Shield',g:'Fighter — Rune Knight',l:7,d:'Reaction: when an attack roll targets a creature you can see within 60 ft., force the attacker to reroll. Uses = proficiency bonus per long rest.',combat:true,actionType:'reaction',usesPer:'long',usesScale:'prof'},
 {n:'Great Stature',g:'Fighter — Rune Knight',l:10,d:'Permanently grow 3d4 inches taller; Giant\'s Might\'s bonus damage increases to 1d8.',combat:true},
 {n:'Master of Runes',g:'Fighter — Rune Knight',l:15,d:'Each rune you know can be invoked twice between rests instead of once.'},
 {n:'Runic Juggernaut',g:'Fighter — Rune Knight',l:18,d:'Giant\'s Might\'s bonus damage increases to 1d10; while transformed by Giant\'s Might you can become Huge instead of Large, gaining 5 extra ft. of reach.',combat:true},
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
 // The HP half is a flat +1/level, wired live via the LVL formula so it keeps up with level-ups
 // automatically. The AC half ("13 + DEX when unarmored") isn't expressible as an fx — 'stat'
 // effects only ever add to the computed base AC, they can't replace its formula — so it's left
 // as text, same as Barbarian/Monk Unarmored Defense: use the AC override in Inventory for that.
 {n:'Draconic Resilience',g:'Sorcerer — Draconic Bloodline',l:1,d:'+1 HP per sorcerer level; AC = 13 + DEX mod when not wearing armor. Use the AC override in Inventory for the AC half.',fx:[{t:'stat',stat:'hpmax',n:'LVL'}]},
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
// A handful of RACE_LIB entries above grant "N skills of your choice" rather than a fixed skill —
// same shape as CLASS_SKILL_CHOICES (data-classes-races.js), keyed by the exact trait name so
// app.js's proficiency picker (renderClassSkillPicker) can match it against whichever race/subrace
// traits currently apply (raceTraitApplies). Traits that grant *specific* named skills with no
// choice involved (Cat's Talent, Sneaky, Silent Feathers, ...) aren't listed here — there's nothing
// to pick. "of your choice" with no list means any skill, so options is every SKILLS key.
const RACE_SKILL_CHOICES={
  'Skill Versatility (Variant Human)':{count:1,options:SKILLS.map(s=>s[0])},
  'Skill Versatility':{count:2,options:SKILLS.map(s=>s[0])}, // Half-Elf
  'Changeling Instincts':{count:2,options:['deception','insight','intimidation','performance','persuasion']},
  'Kenku Training':{count:2,options:['acrobatics','deception','stealth','sleight']},
  "Hunter's Lore":{count:2,options:['animal','nature','perception','stealth','survival']},
};

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

