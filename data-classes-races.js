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
// One-line character-select flavor text per class, shown beside the big portrait on the Build screen.
const CLASS_FLAVOR={
  barbarian:'Fury given form — she abandons defense for raw, unstoppable rage, striking hardest the closer death creeps.',
  bard:'A storyteller and spellsinger who turns wit, music and charm into magic that lifts allies and unravels foes.',
  cleric:'A conduit for divine power, channeling their god’s will into healing light or righteous judgment.',
  druid:'Keeper of the wild, shifting shape and bending nature itself to protect the balance of the world.',
  fighter:'A master of arms and tactics, trained to outlast and outfight anything the battlefield throws at them.',
  monk:'A disciplined martial artist who channels inner energy into strikes faster than the eye can follow.',
  paladin:'A sworn champion bound by sacred oath, wielding martial might and divine magic in equal measure.',
  ranger:'A hunter of the frontier, as deadly with a blade as with a bow, and never lost in hostile terrain.',
  rogue:'A shadow between heartbeats — precise, cunning, and lethal the moment an opening appears.',
  sorcerer:'Magic runs in their blood, wild and instinctive, reshaped on the fly to suit the moment’s need.',
  warlock:'Bound by pact to a power beyond mortal ken, trading service for magic that bends reality’s rules.',
  wizard:'A scholar of the arcane, wielding spells drawn from years of study and a mind as sharp as any blade.',
};
// Flavor-only power bars for the Build screen's stat readout (NOT mechanical stats) — derived from
// hit die size and casting progression so every class gets a value without hand-tuning 12 sets of
// numbers. Martial scales with hit die; Arcane scales with casting progression; Resilience blends
// hit die with a CON save (a real toughness signal 5e already encodes).
const CAST_POWER={undefined:8,full:100,half:70,pact:55};
function classPowerBars(classId){
  const c=CLASSES[classId]; if(!c) return null;
  const hdScale={6:35,8:55,10:75,12:100}[c.hd]||55;
  const arcane=CAST_POWER[c.cast]||CAST_POWER[undefined];
  const resilience=Math.round(hdScale*0.5+(c.saves.includes('con')?50:20));
  return [
    {label:'Martial',pct:hdScale},
    {label:'Arcane',pct:arcane},
    {label:'Resilience',pct:Math.min(100,resilience)},
  ];
}
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

// Short data-driven trait chips for the Build screen's heritage picker — built straight from
// RACES so all 46 lineages get an accurate line without hand-writing 46 blurbs.
function raceFlavorChips(raceId,subraceId){
  const r=RACES[raceId]; if(!r) return [];
  const sub=r.subs?r.subs[subraceId]:null;
  const chips=[r.group+' lineage','Speed '+((sub&&sub.speed)||r.speed)+' ft.'];
  const bonus={};
  Object.entries(r.bonus||{}).forEach(([k,v])=>bonus[k]=(bonus[k]||0)+v);
  Object.entries((sub&&sub.bonus)||{}).forEach(([k,v])=>bonus[k]=(bonus[k]||0)+v);
  Object.entries(bonus).forEach(([k,v])=>chips.push('+'+v+' '+k.toUpperCase()));
  if(r.motm) chips.push('+2/+1 (your choice)');
  else if((sub&&sub.flex)||r.flex) chips.push('+'+((sub&&sub.flex)||r.flex)+' (your choice)');
  const dark=(sub&&sub.dark!=null)?sub.dark:(r.dark||0);
  if(dark>0) chips.push('Darkvision '+dark+' ft.');
  if(r.move) chips.push(r.move[0].toUpperCase()+r.move.slice(1));
  return chips;
}

// Race portrait art (class-art/, race-art/ — see Build tab). Most exotic/monstrous lineages
// don't have dedicated art, so they borrow the closest available family/vibe match rather than
// go without a portrait; the 20 with real dedicated photos map to themselves.
const RACE_IMG={
  dwarf:'dwarf',elf:'elf',halfling:'halfling',human:'human',dragonborn:'dragonborn',
  gnome:'gnome',halfelf:'halfelf',halforc:'halforc',tiefling:'tiefling',
  eladrin:'eladrin',shadarkai:'shadarkai',deepgnome:'gnome',orc:'orc',aasimar:'aasimar',
  githyanki:'githyanki',githzerai:'githzerai',harengon:'harengon',lizardfolk:'lizardfolk',owlin:'owlin',
  // borrowed — bird-folk
  aarakocra:'owlin',kenku:'owlin',
  // borrowed — small/mischievous
  goblin:'gnome',kobold:'lizardfolk',verdan:'halfling',
  // borrowed — fey
  fairy:'eladrin',satyr:'eladrin',
  // borrowed — elf-family
  seaelf:'elf',
  // borrowed — dwarf-family
  duergar:'dwarf',tortle:'dwarf',
  // borrowed — reptilian/aquatic
  locathah:'lizardfolk',triton:'lizardfolk',grung:'lizardfolk',yuanti:'lizardfolk',
  // borrowed — large & powerful
  goliath:'halforc',centaur:'halforc',shifter:'halforc',
  // borrowed — monstrous/militant
  bugbear:'orc',hobgoblin:'orc',minotaur:'orc',
  // borrowed — human-passing / no close match
  changeling:'human',firbolg:'human',
  // borrowed — elemental/otherworldly-touched
  genasiair:'tiefling',genasiearth:'tiefling',genasifire:'tiefling',genasiwater:'tiefling',
  // borrowed — anthro
  tabaxi:'harengon',
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
// PHB 1-20 XP-to-reach-this-level table (index = level). Only used when a table tracks XP —
// tables that level by milestone just never fill the XP field, so the Overview XP bar stays
// hidden (see renderOverviewIdentity).
const XP_THRESHOLDS=[0,0,300,900,2700,6500,14000,23000,34000,48000,64000,85000,
  100000,120000,140000,165000,195000,225000,265000,305000,355000];
