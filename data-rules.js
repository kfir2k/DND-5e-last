// ---------- Combat rules cheatsheet (5e SRD summaries) ----------
// Shown in the cockpit's Rules drawer. Format: sections of [name, one-liner] pairs.
const RULES_DB=[
{s:'Actions in combat',items:[
["Attack","Make one melee or ranged attack. Extra Attack lets some classes attack more than once with this action."],
["Cast a spell","Cast a spell with a casting time of 1 action. You can also cast a bonus-action spell in the same turn, but then any other spell that turn must be a cantrip with a 1-action cast."],
["Dash","Double your movement this turn."],
["Disengage","Your movement doesn't provoke opportunity attacks for the rest of the turn."],
["Dodge","Until your next turn: attacks against you have disadvantage, and you make DEX saves with advantage. Lost if you're incapacitated or speed is 0."],
["Help","Give an ally advantage on their next ability check, or on their next attack against a creature within 5 ft of you."],
["Hide","Make a Stealth check to become unseen. You can't hide from a creature that can see you clearly."],
["Ready","Choose a trigger and an action; when the trigger happens, use your reaction to act. Readied spells require concentration until released."],
["Search","Make a Perception or Investigation check to find something."],
["Use an object","Interact with a second object (the first each turn is free) or use an item that requires an action."],
["Grapple","Replaces one attack: your Athletics vs their Athletics or Acrobatics. On a win, their speed becomes 0. They can use an action to try to escape."],
["Shove","Replaces one attack: your Athletics vs their Athletics or Acrobatics. On a win, push them 5 ft or knock them prone."]
]},
{s:'Key concepts',items:[
["Opportunity attack","When a creature you can see moves out of your reach, use your reaction for one melee attack against it. Disengage prevents it; teleporting doesn't provoke."],
["Advantage / disadvantage","Roll two d20s, take the higher (advantage) or lower (disadvantage). Multiple sources don't stack; one of each cancels to a normal roll."],
["Concentration","One concentration spell at a time. When you take damage, make a CON save: DC 10 or half the damage, whichever is higher. Casting another concentration spell drops the first."],
["Cover","Half cover: +2 AC and DEX saves. Three-quarters: +5. Full cover: can't be targeted directly."],
["Critical hit","A natural 20 hits and rolls all the attack's damage dice twice. A natural 1 always misses."],
["Unseen attacker","Attacking a target you can't see: disadvantage. Attacking while unseen: advantage; attacking reveals your position."],
["Two-weapon fighting","Attack action with a light melee weapon: bonus action to attack with a different light weapon in the other hand, without adding your ability modifier to its damage (unless a feature says otherwise)."],
["Ritual casting","A spell tagged ritual can be cast without a slot by taking 10 extra minutes — outside combat only, in practice."],
["Bonus action","You get at most one per turn, and only if a feature or spell grants one. You can take it before or after your action."],
["Reaction","One per round, refreshes at the start of your turn. Used for opportunity attacks, Shield, Counterspell, readied actions..."],
["Temp HP","A buffer on top of HP. Doesn't stack — take the higher value. Lost first, can't be healed."],
["Dropping to 0 HP","You fall unconscious and start death saves — unless the damage remaining equals your HP max, which kills you outright."]
]},
{s:'Conditions',items:[
["Blinded","Auto-fail sight checks. Attacks against you: advantage. Your attacks: disadvantage."],
["Charmed","Can't attack the charmer or target them with harmful effects. Charmer has advantage on social checks against you."],
["Deafened","Auto-fail hearing checks."],
["Frightened","Disadvantage on checks and attacks while the source is in sight. Can't willingly move closer to it."],
["Grappled","Speed 0. Ends if the grappler is incapacitated or you're moved out of reach."],
["Incapacitated","No actions, no reactions."],
["Invisible","Unseen: attacks against you have disadvantage, yours have advantage. You can still be heard and tracked."],
["Paralyzed","Incapacitated, can't move or speak. Auto-fail STR/DEX saves. Attacks against you: advantage; hits from within 5 ft are crits."],
["Petrified","Turned to stone: incapacitated, unaware, resistance to all damage, immune to poison and disease."],
["Poisoned","Disadvantage on attack rolls and ability checks."],
["Prone","Crawl at half speed or stand up (costs half your speed). Your attacks: disadvantage. Attacks against you: advantage within 5 ft, disadvantage beyond."],
["Restrained","Speed 0. Attacks against you: advantage; yours: disadvantage. DEX saves: disadvantage."],
["Stunned","Incapacitated, can't move, barely speaks. Auto-fail STR/DEX saves. Attacks against you: advantage."],
["Unconscious","Incapacitated, prone, drops everything, unaware. Auto-fail STR/DEX saves. Attacks against you: advantage; hits within 5 ft are crits."],
["Exhaustion","Six stacking levels: 1 disadvantage on checks, 2 speed halved, 3 disadvantage on attacks and saves, 4 HP max halved, 5 speed 0, 6 death. Long rest with food and water removes one level."]
]}
];
