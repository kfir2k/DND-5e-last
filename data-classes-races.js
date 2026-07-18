// ---------- Constants ----------
const ABILITIES = [
  ['str','Strength'],['dex','Dexterity'],['con','Constitution'],
  ['int','Intelligence'],['wis','Wisdom'],['cha','Charisma']
];
const SKILLS = [
  ['acrobatics','Acrobatics','dex'],['animal','Animal Handling','wis'],
  ['arcana','Arcana','int'],['athletics','Athletics','str'],
  ['deception','Deception','cha'],['history','History','int'],
  ['insight','Insight','wis'],['intimidation','Intimidation','cha'],
  ['investigation','Investigation','int'],['medicine','Medicine','wis'],
  ['nature','Nature','int'],['perception','Perception','wis'],
  ['performance','Performance','cha'],['persuasion','Persuasion','cha'],
  ['religion','Religion','int'],['sleight','Sleight of Hand','dex'],
  ['stealth','Stealth','dex'],['survival','Survival','wis']
];
const TABS = [
  ['overview','Overview'],['build','Build'],['combat','Combat'],['skills','Skills'],
  ['spells','Spells'],['inventory','Inventory'],['features','Features'],
  ['character','Character'],['notes','Notes']
];
const STORE_KEY = 'dnd5e-binder-v1';

// ---------- 5e (2014 PHB) class data ----------
// hd = hit die size, saves = saving throw proficiencies,
// cast = 'full' | 'half' | 'pact', ab = spellcasting ability
const CLASSES = {
  barbarian:{name:'Barbarian',hd:12,saves:['str','con']},
  bard:     {name:'Bard',     hd:8, saves:['dex','cha'],cast:'full',ab:'cha'},
  cleric:   {name:'Cleric',   hd:8, saves:['wis','cha'],cast:'full',ab:'wis'},
  druid:    {name:'Druid',    hd:8, saves:['int','wis'],cast:'full',ab:'wis'},
  fighter:  {name:'Fighter',  hd:10,saves:['str','con']},
  monk:     {name:'Monk',     hd:8, saves:['str','dex']},
  paladin:  {name:'Paladin',  hd:10,saves:['wis','cha'],cast:'half',ab:'cha'},
  ranger:   {name:'Ranger',   hd:10,saves:['str','dex'],cast:'half',ab:'wis'},
  rogue:    {name:'Rogue',    hd:8, saves:['dex','int']},
  sorcerer: {name:'Sorcerer', hd:6, saves:['con','cha'],cast:'full',ab:'cha'},
  warlock:  {name:'Warlock',  hd:8, saves:['wis','cha'],cast:'pact',ab:'cha'},
  wizard:   {name:'Wizard',   hd:6, saves:['int','wis'],cast:'full',ab:'int'}
};
// Flavor-color per class (the same elemental-accent language used everywhere else on the sheet)
// so the Build screen feels like it's forging a character instead of filling out a form.
const CLASS_ICON={barbarian:'🪓',bard:'🎵',cleric:'✨',druid:'🍃',fighter:'⚔',monk:'☯',
  paladin:'🛡',ranger:'🏹',rogue:'🗡',sorcerer:'🔥',warlock:'👁',wizard:'📖'};
const CLASS_COLOR={barbarian:'#c0524a',bard:'#d9599b',cleric:'#e3c15c',druid:'#7dc26a',
  fighter:'#8b98ab',monk:'#5fbfa0',paladin:'#c9a227',ranger:'#4f9e5c',rogue:'#6b6f8a',
  sorcerer:'#e0705a',warlock:'#8b5cc9',wizard:'#5aa9e0'};
// Subclass features live in the same FEATURE_LIB, grouped as "Class — Subclass". Pulling the
// suggestion list for the Build tab's datalist straight from those group names keeps everything
// in one place — add a new subclass group up there and it shows up here automatically.
function subclassNamesForClass(classId){
  const cname=CLASSES[classId]&&CLASSES[classId].name; if(!cname) return [];
  const prefix=cname+' — ';
  return [...new Set(FEATURE_LIB.filter(e=>e.g.startsWith(prefix)).map(e=>e.g.slice(prefix.length)))];
}
// Full-caster spell slots by character level (index = level, values = slots for spell levels 1-9)
const FULL_SLOTS=[[],
  [2],[3],[4,2],[4,3],[4,3,2],[4,3,3],[4,3,3,1],[4,3,3,2],[4,3,3,3,1],[4,3,3,3,2],
  [4,3,3,3,2,1],[4,3,3,3,2,1],[4,3,3,3,2,1,1],[4,3,3,3,2,1,1],[4,3,3,3,2,1,1,1],
  [4,3,3,3,2,1,1,1],[4,3,3,3,2,1,1,1,1],[4,3,3,3,3,1,1,1,1],[4,3,3,3,3,2,1,1,1],[4,3,3,3,3,2,2,1,1]];
// Warlock Pact Magic: a few slots, all at one spell level
function pactSlots(l){
  const n = l<2?1 : l<11?2 : l<17?3 : 4;          // number of slots
  const sl = l<3?1 : l<5?2 : l<7?3 : l<9?4 : 5;   // slot level
  const a=[0,0,0,0,0,0,0,0,0]; a[sl-1]=n; return a;
}

// ---------- Race / lineage data (dnd5e.wikidot.com/lineage) ----------
// bonus = fixed ability bonuses; flex = number of free +1s (Half-Elf, Variant Human);
// motm = Monsters of the Multiverse lineage: player chooses +2 to one score and +1 to another;
// move = extra movement mode (fly/swim/climb), shown in the build note
// dark = darkvision range in feet (0/omitted = none); subrace "dark" overrides the race default
// (e.g. Drow get 120 instead of the base Elf's 60) — drives the Vitals "Darkvision" tile.
const RACES = {
  // — Common —
  dwarf:{name:'Dwarf',group:'Common',speed:25,bonus:{con:2},dark:60,subs:{
    hill:{name:'Hill Dwarf',bonus:{wis:1}},
    mountain:{name:'Mountain Dwarf',bonus:{str:2}}}},
  elf:{name:'Elf',group:'Common',speed:30,bonus:{dex:2},dark:60,subs:{
    high:{name:'High Elf',bonus:{int:1}},
    wood:{name:'Wood Elf',bonus:{wis:1},speed:35},
    drow:{name:'Drow (Dark Elf)',bonus:{cha:1},dark:120}}},
  halfling:{name:'Halfling',group:'Common',speed:25,bonus:{dex:2},subs:{
    lightfoot:{name:'Lightfoot Halfling',bonus:{cha:1}},
    stout:{name:'Stout Halfling',bonus:{con:1}}}},
  human:{name:'Human',group:'Common',speed:30,bonus:{},subs:{
    standard:{name:'Standard (+1 all)',bonus:{str:1,dex:1,con:1,int:1,wis:1,cha:1}},
    variant:{name:'Variant Human',bonus:{},flex:2}}},
  dragonborn:{name:'Dragonborn',group:'Common',speed:30,bonus:{str:2,cha:1}},
  gnome:{name:'Gnome',group:'Common',speed:25,bonus:{int:2},dark:60,subs:{
    forest:{name:'Forest Gnome',bonus:{dex:1}},
    rock:{name:'Rock Gnome',bonus:{con:1}}}},
  halfelf:{name:'Half-Elf',group:'Common',speed:30,bonus:{cha:2},flex:2,dark:60},
  halforc:{name:'Half-Orc',group:'Common',speed:30,bonus:{str:2,con:1},dark:60},
  tiefling:{name:'Tiefling',group:'Common',speed:30,bonus:{cha:2,int:1},dark:60},
  // — Exotic —
  aarakocra:{name:'Aarakocra',group:'Exotic',speed:30,motm:true,move:'fly = walking speed'},
  aasimar:{name:'Aasimar',group:'Exotic',speed:30,motm:true,dark:60},
  changeling:{name:'Changeling',group:'Exotic',speed:30,motm:true},
  deepgnome:{name:'Deep Gnome',group:'Exotic',speed:30,motm:true,dark:120},
  duergar:{name:'Duergar',group:'Exotic',speed:30,motm:true,dark:120},
  eladrin:{name:'Eladrin',group:'Exotic',speed:30,motm:true,dark:60},
  fairy:{name:'Fairy',group:'Exotic',speed:30,motm:true,move:'fly 30 ft.'},
  firbolg:{name:'Firbolg',group:'Exotic',speed:30,motm:true},
  genasiair:{name:'Genasi (Air)',group:'Exotic',speed:30,motm:true},
  genasiearth:{name:'Genasi (Earth)',group:'Exotic',speed:30,motm:true},
  genasifire:{name:'Genasi (Fire)',group:'Exotic',speed:30,motm:true,dark:60},
  genasiwater:{name:'Genasi (Water)',group:'Exotic',speed:30,motm:true,move:'swim 30 ft.'},
  githyanki:{name:'Githyanki',group:'Exotic',speed:30,motm:true},
  githzerai:{name:'Githzerai',group:'Exotic',speed:30,motm:true},
  goliath:{name:'Goliath',group:'Exotic',speed:30,motm:true},
  harengon:{name:'Harengon',group:'Exotic',speed:30,motm:true},
  kenku:{name:'Kenku',group:'Exotic',speed:30,motm:true},
  locathah:{name:'Locathah',group:'Exotic',speed:30,bonus:{str:2,dex:1},move:'swim 30 ft.'},
  owlin:{name:'Owlin',group:'Exotic',speed:30,motm:true,move:'fly = walking speed',dark:120},
  satyr:{name:'Satyr',group:'Exotic',speed:35,motm:true},
  seaelf:{name:'Sea Elf',group:'Exotic',speed:30,motm:true,move:'swim 30 ft.',dark:60},
  shadarkai:{name:'Shadar-Kai',group:'Exotic',speed:30,motm:true,dark:60},
  tabaxi:{name:'Tabaxi',group:'Exotic',speed:30,motm:true,move:'climb 30 ft.',dark:60},
  tortle:{name:'Tortle',group:'Exotic',speed:30,motm:true},
  triton:{name:'Triton',group:'Exotic',speed:30,motm:true,move:'swim 30 ft.',dark:60},
  verdan:{name:'Verdan',group:'Exotic',speed:30,bonus:{cha:2,con:1}},
  // — Monstrous —
  bugbear:{name:'Bugbear',group:'Monstrous',speed:30,motm:true,dark:60},
  centaur:{name:'Centaur',group:'Monstrous',speed:40,motm:true},
  goblin:{name:'Goblin',group:'Monstrous',speed:30,motm:true,dark:60},
  grung:{name:'Grung',group:'Monstrous',speed:25,bonus:{dex:2,con:1},move:'climb 25 ft.'},
  hobgoblin:{name:'Hobgoblin',group:'Monstrous',speed:30,motm:true,dark:60},
  kobold:{name:'Kobold',group:'Monstrous',speed:30,motm:true,dark:60},
  lizardfolk:{name:'Lizardfolk',group:'Monstrous',speed:30,motm:true,move:'swim 30 ft.',dark:60},
  minotaur:{name:'Minotaur',group:'Monstrous',speed:30,motm:true,dark:60},
  orc:{name:'Orc',group:'Monstrous',speed:30,motm:true,dark:60},
  shifter:{name:'Shifter',group:'Monstrous',speed:30,motm:true,dark:60},
  yuanti:{name:'Yuan-Ti',group:'Monstrous',speed:30,motm:true,dark:60}
};

// ---------- ASI / Feat levels & feat names ----------
// Every class gets an Ability Score Improvement (or feat) at 4, 8, 12, 16, 19.
// Fighters get extras at 6 & 14; Rogues at 10.
function asiLevels(classId){
  const base=[4,8,12,16,19];
  if(classId==='fighter') return [4,6,8,12,14,16,19];
  if(classId==='rogue')   return [4,8,10,12,16,19];
  return base;
}
