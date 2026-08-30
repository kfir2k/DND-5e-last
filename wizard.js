// ---------- Character Wizard: guided, step-by-step creation ----------
// Loaded after app.js — reuses its globals ($, $$, esc, num, defaultState, createChar,
// openCharSelect, CLASSES, RACES, RACE_IMG, CLASS_COLOR, CLASS_ICON, CLASS_FLAVOR, SKILLS,
// ABILITIES, WEAPONS, ARMORS, ITEM_DB, PACKS, FEATURE_LIB, subclassNamesForClass).
// The wizard keeps its own isolated draft (WIZ) and never touches the live S — the only point
// it touches real storage is the single createChar(finalData) call when the hero is forged.
// Backgrounds are intentionally left out — the sheet doesn't model them yet.

/* ============ curated data the base sheet doesn't have on its own ============ */
const WIZ_CONCEPTS=[
  {id:'melee',label:'Steel & Shield',ico:'⚔',classes:['fighter','paladin','barbarian'],c:'#c0524a'},
  {id:'caster',label:'Arcane Power',ico:'📖',classes:['wizard','sorcerer','warlock'],c:'#5aa9e0'},
  {id:'sneak',label:'Cunning & Shadow',ico:'🗡',classes:['rogue','ranger','monk'],c:'#6b6f8a'},
  {id:'wild',label:'Nature & Faith',ico:'🍃',classes:['cleric','druid'],c:'#7dc26a'},
  {id:'face',label:'Charm & Song',ico:'🎵',classes:['bard','warlock'],c:'#d9599b'},
  {id:'grim',label:'Blood & Vengeance',ico:'🩸',classes:['bloodhunter','ranger'],c:'#9c2b3c'},
];

const WIZ_CLASS_SKILLS={
  barbarian:{count:2,options:['animal','athletics','intimidation','nature','perception','survival']},
  bard:{count:3,options:SKILLS.map(s=>s[0])},
  cleric:{count:2,options:['history','insight','medicine','persuasion','religion']},
  druid:{count:2,options:['arcana','animal','insight','medicine','nature','perception','religion','survival']},
  fighter:{count:2,options:['acrobatics','animal','athletics','history','insight','intimidation','perception','survival']},
  monk:{count:2,options:['acrobatics','athletics','history','insight','religion','stealth']},
  paladin:{count:2,options:['athletics','insight','intimidation','medicine','persuasion','religion']},
  ranger:{count:3,options:['animal','athletics','insight','investigation','nature','perception','stealth','survival']},
  rogue:{count:4,options:['acrobatics','athletics','deception','insight','intimidation','investigation','perception','performance','persuasion','sleight','stealth']},
  sorcerer:{count:2,options:['arcana','deception','insight','intimidation','persuasion','religion']},
  warlock:{count:2,options:['arcana','deception','history','intimidation','investigation','nature','religion']},
  wizard:{count:2,options:['arcana','history','insight','investigation','medicine','religion']},
  bloodhunter:{count:3,options:['acrobatics','arcana','athletics','history','insight','investigation','religion','survival']},
};

const WIZ_FIGHTING_STYLES=[
  {id:'archery',name:'Archery',desc:'+2 bonus to attack rolls you make with ranged weapons.'},
  {id:'defense',name:'Defense',desc:'+1 AC while wearing any armor.',fx:[{t:'stat',stat:'ac',n:1}]},
  {id:'dueling',name:'Dueling',desc:'+2 damage with a one-handed melee weapon, as long as nothing is in your other hand.'},
  {id:'great-weapon',name:'Great Weapon Fighting',desc:'Reroll 1s and 2s on damage dice from two-handed melee weapons.'},
  {id:'protection',name:'Protection',desc:'Reaction: impose disadvantage on an attack against an ally within 5 ft. (requires a shield).'},
  {id:'two-weapon',name:'Two-Weapon Fighting',desc:'Add your ability modifier to the damage of your off-hand attack.'},
];

// What a level-1 subclass pick is actually *called* — only matters for classes that get one
// this early (see SUBCLASS_LEVEL in app.js: cleric/sorcerer/warlock all pick at level 1).
const WIZ_SUBCLASS_LABEL={cleric:'Divine Domain',sorcerer:'Sorcerous Origin',warlock:'Otherworldly Patron'};

// Reference-only proficiency summary shown on the Features scene.
const WIZ_PROFS={
  barbarian:'Light and medium armor, shields; simple and martial weapons.',
  bard:'Light armor; simple weapons, hand crossbows, longswords, rapiers, shortswords; three instruments of your choice.',
  cleric:'Light and medium armor, shields; simple weapons.',
  druid:"Light and medium armor (nonmetal), shields (nonmetal); clubs, daggers, darts, javelins, maces, quarterstaffs, scimitars, sickles, slings, spears; herbalism kit.",
  fighter:'All armor, shields; simple and martial weapons.',
  monk:"Simple weapons, shortswords; one type of artisan's tools or one musical instrument (your choice).",
  paladin:'All armor, shields; simple and martial weapons.',
  ranger:'Light and medium armor, shields; simple and martial weapons.',
  rogue:"Light armor; simple weapons, hand crossbows, longswords, rapiers, shortswords; thieves' tools.",
  sorcerer:'Daggers, darts, slings, quarterstaffs, light crossbows.',
  warlock:'Light armor; simple weapons.',
  wizard:'Daggers, darts, slings, quarterstaffs, light crossbows.',
  bloodhunter:"Light and medium armor, shields; simple and martial weapons; alchemist's supplies.",
};

// PHB starting-equipment tables. Each class has a fixed grant (always given) plus zero or more
// lettered choice groups (pick exactly one option per group). "Any simple/martial weapon" slots
// resolve to one iconic representative — swap it for another of the same category in Combat
// afterward if you'd rather have something else; nothing here is locked in.
// Grant bundle shape: {weapons:[[weaponKey,qty],...], armor:ARMORS key, shield:bool,
//                      items:[[itemDbName,qty],...], packs:[packName,...]}
const WIZ_EQUIPMENT={
  barbarian:{
    groups:[
      [{label:'A greataxe',grant:{weapons:[['greataxe',1]]}},
       {label:'A martial weapon (Longsword)',grant:{weapons:[['longsword',1]]}}],
      [{label:'Two handaxes',grant:{weapons:[['handaxe',2]]}},
       {label:'A simple weapon (Spear)',grant:{weapons:[['spear',1]]}}],
    ],
    fixed:{weapons:[['javelin',4]],packs:["Explorer's Pack"]},
  },
  bard:{
    groups:[
      [{label:'A rapier',grant:{weapons:[['rapier',1]]}},
       {label:'A longsword',grant:{weapons:[['longsword',1]]}},
       {label:'A simple weapon (Dagger)',grant:{weapons:[['dagger',1]]}}],
      [{label:"A diplomat's pack",grant:{packs:["Diplomat's Pack"]}},
       {label:"An entertainer's pack",grant:{packs:["Entertainer's Pack"]}}],
      [{label:'A lute',grant:{items:[['Lute',1]]}},
       {label:'Another instrument (Flute)',grant:{items:[['Flute',1]]}}],
    ],
    fixed:{armor:'leather',weapons:[['dagger',1]]},
  },
  cleric:{
    groups:[
      [{label:'A mace',grant:{weapons:[['mace',1]]}},
       {label:'A warhammer (if proficient)',grant:{weapons:[['warhammer',1]]}}],
      [{label:'Scale mail',grant:{armor:'scale'}},
       {label:'Leather armor',grant:{armor:'leather'}},
       {label:'Chain mail (if proficient)',grant:{armor:'chainmail'}}],
      [{label:'A light crossbow & 20 bolts',grant:{weapons:[['lightcrossbow',1]],items:[['Crossbow Bolts (20)',1]]}},
       {label:'A simple weapon (Sickle)',grant:{weapons:[['sickle',1]]}}],
      [{label:"A priest's pack",grant:{packs:["Priest's Pack"]}},
       {label:"An explorer's pack",grant:{packs:["Explorer's Pack"]}}],
    ],
    fixed:{shield:true,items:[['Holy Symbol',1]]},
  },
  druid:{
    groups:[
      [{label:'A wooden shield',grant:{shield:true,items:[['Wooden Shield',1]]}},
       {label:'A simple weapon (Sickle)',grant:{weapons:[['sickle',1]]}}],
      [{label:'A scimitar',grant:{weapons:[['scimitar',1]]}},
       {label:'A simple melee weapon (Quarterstaff)',grant:{weapons:[['quarterstaff',1]]}}],
    ],
    fixed:{armor:'leather',items:[['Druidic Focus',1]],packs:["Explorer's Pack"]},
  },
  fighter:{
    groups:[
      [{label:'Chain mail',grant:{armor:'chainmail'}},
       {label:'Leather armor, a longbow & 20 arrows',grant:{armor:'leather',weapons:[['longbow',1]],items:[['Arrows (20)',1]]}}],
      [{label:'A martial weapon & a shield (Longsword)',grant:{weapons:[['longsword',1]],shield:true}},
       {label:'Two martial weapons (Battleaxe & Warhammer)',grant:{weapons:[['battleaxe',1],['warhammer',1]]}}],
      [{label:'A light crossbow & 20 bolts',grant:{weapons:[['lightcrossbow',1]],items:[['Crossbow Bolts (20)',1]]}},
       {label:'Two handaxes',grant:{weapons:[['handaxe',2]]}}],
      [{label:"A dungeoneer's pack",grant:{packs:["Dungeoneer's Pack"]}},
       {label:"An explorer's pack",grant:{packs:["Explorer's Pack"]}}],
    ],
    fixed:{},
  },
  monk:{
    groups:[
      [{label:'A shortsword',grant:{weapons:[['shortsword',1]]}},
       {label:'A simple weapon (Quarterstaff)',grant:{weapons:[['quarterstaff',1]]}}],
      [{label:"A dungeoneer's pack",grant:{packs:["Dungeoneer's Pack"]}},
       {label:"An explorer's pack",grant:{packs:["Explorer's Pack"]}}],
    ],
    fixed:{weapons:[['dart',10]]},
  },
  paladin:{
    groups:[
      [{label:'A martial weapon & a shield (Longsword)',grant:{weapons:[['longsword',1]],shield:true}},
       {label:'Two martial weapons (Longsword & Warhammer)',grant:{weapons:[['longsword',1],['warhammer',1]]}}],
      [{label:'Five javelins',grant:{weapons:[['javelin',5]]}},
       {label:'A simple melee weapon (Mace)',grant:{weapons:[['mace',1]]}}],
      [{label:"A priest's pack",grant:{packs:["Priest's Pack"]}},
       {label:"An explorer's pack",grant:{packs:["Explorer's Pack"]}}],
    ],
    fixed:{armor:'chainmail',items:[['Holy Symbol',1]]},
  },
  ranger:{
    groups:[
      [{label:'Scale mail',grant:{armor:'scale'}},
       {label:'Leather armor',grant:{armor:'leather'}}],
      [{label:'Two shortswords',grant:{weapons:[['shortsword',2]]}},
       {label:'Two simple melee weapons (Handaxes)',grant:{weapons:[['handaxe',2]]}}],
      [{label:"A dungeoneer's pack",grant:{packs:["Dungeoneer's Pack"]}},
       {label:"An explorer's pack",grant:{packs:["Explorer's Pack"]}}],
    ],
    fixed:{weapons:[['longbow',1]],items:[['Arrows (20)',1]]},
  },
  rogue:{
    groups:[
      [{label:'A rapier',grant:{weapons:[['rapier',1]]}},
       {label:'A shortsword',grant:{weapons:[['shortsword',1]]}}],
      [{label:'A shortbow & quiver of 20 arrows',grant:{weapons:[['shortbow',1]],items:[['Arrows (20)',1],['Quiver',1]]}},
       {label:'A shortsword',grant:{weapons:[['shortsword',1]]}}],
      [{label:"A burglar's pack",grant:{packs:["Burglar's Pack"]}},
       {label:"A dungeoneer's pack",grant:{packs:["Dungeoneer's Pack"]}},
       {label:"An explorer's pack",grant:{packs:["Explorer's Pack"]}}],
    ],
    fixed:{armor:'leather',weapons:[['dagger',2]],items:[["Thieves' Tools",1]]},
  },
  sorcerer:{
    groups:[
      [{label:'A light crossbow & 20 bolts',grant:{weapons:[['lightcrossbow',1]],items:[['Crossbow Bolts (20)',1]]}},
       {label:'A simple weapon (Dagger)',grant:{weapons:[['dagger',1]]}}],
      [{label:'A component pouch',grant:{items:[['Component Pouch',1]]}},
       {label:'An arcane focus',grant:{items:[['Arcane Focus',1]]}}],
      [{label:"A dungeoneer's pack",grant:{packs:["Dungeoneer's Pack"]}},
       {label:"An explorer's pack",grant:{packs:["Explorer's Pack"]}}],
    ],
    fixed:{weapons:[['dagger',2]]},
  },
  warlock:{
    groups:[
      [{label:'A light crossbow & 20 bolts',grant:{weapons:[['lightcrossbow',1]],items:[['Crossbow Bolts (20)',1]]}},
       {label:'A simple weapon (Sickle)',grant:{weapons:[['sickle',1]]}}],
      [{label:'A component pouch',grant:{items:[['Component Pouch',1]]}},
       {label:'An arcane focus',grant:{items:[['Arcane Focus',1]]}}],
      [{label:"A scholar's pack",grant:{packs:["Scholar's Pack"]}},
       {label:"A dungeoneer's pack",grant:{packs:["Dungeoneer's Pack"]}}],
    ],
    fixed:{armor:'leather',weapons:[['dagger',2],['sickle',1]]},
  },
  wizard:{
    groups:[
      [{label:'A quarterstaff',grant:{weapons:[['quarterstaff',1]]}},
       {label:'A dagger',grant:{weapons:[['dagger',1]]}}],
      [{label:'A component pouch',grant:{items:[['Component Pouch',1]]}},
       {label:'An arcane focus',grant:{items:[['Arcane Focus',1]]}}],
      [{label:"A scholar's pack",grant:{packs:["Scholar's Pack"]}},
       {label:"An explorer's pack",grant:{packs:["Explorer's Pack"]}}],
    ],
    fixed:{items:[['Spellbook',1]]},
  },
  bloodhunter:{
    groups:[
      [{label:'A martial weapon (Longsword)',grant:{weapons:[['longsword',1]]}},
       {label:'Two simple weapons (Daggers)',grant:{weapons:[['dagger',2]]}}],
      [{label:'A light crossbow & 20 bolts',grant:{weapons:[['lightcrossbow',1]],items:[['Crossbow Bolts (20)',1]]}},
       {label:'A hand crossbow & 20 bolts',grant:{weapons:[['handcrossbow',1]],items:[['Crossbow Bolts (20)',1]]}}],
      [{label:'Studded leather armor',grant:{armor:'studded'}},
       {label:'Scale mail armor',grant:{armor:'scale'}}],
    ],
    fixed:{items:[["Alchemist's Supplies",1]],packs:["Explorer's Pack"]},
  },
};

/* ============ wizard state ============ */
const WIZ_STEP_META=[
  {key:'concept',label:'Concept',icon:'⚔',roman:'I'},
  {key:'race',label:'Bloodline',icon:'🩸',roman:'II'},
  {key:'class',label:'Calling',icon:'🎭',roman:'III'},
  {key:'abilities',label:'Body & Mind',icon:'⚡',roman:'IV'},
  {key:'skills',label:'Training',icon:'🎯',roman:'V'},
  {key:'features',label:'Features',icon:'✦',roman:'VI'},
  {key:'equipment',label:'Gear',icon:'🎒',roman:'VII'},
  {key:'name',label:'Name',icon:'✒',roman:'VIII'},
];
const WIZ_POOL=27;
const WIZ_POINT_COSTS={8:0,9:1,10:2,11:3,12:4,13:5,14:7,15:9};
const WIZ_COMMON_RACES=['human','elf','dwarf','halfling','dragonborn','tiefling','gnome','halfelf','halforc'];

let WIZ=null;
function wizFreshState(){
  return {
    step:0, finished:false, animating:false,
    concepts:[], raceId:'', subraceId:'', flexBonus:['',''],
    classId:'', ab:{str:8,dex:8,con:8,int:8,wis:8,cha:8},
    skills:[], subclass:'', fightingStyle:'', expertise:[],
    equipPicks:{}, name:'',
  };
}

/* ============ pure helpers — mirror app.js's own formulas, kept local so nothing here
   has to touch the live S mid-wizard (see file header) ============ */
function wizRaceObj(){ return RACES[WIZ.raceId]||null; }
function wizSubObj(){ const r=wizRaceObj(); return r&&r.subs ? r.subs[WIZ.subraceId] : null; }
function wizFlexCount(){ const r=wizRaceObj(); if(!r) return 0; return (wizSubObj()&&wizSubObj().flex)||r.flex||0; }
function wizRaceBonus(k){
  const r=wizRaceObj(); if(!r) return 0;
  const sub=wizSubObj();
  let b=((r.bonus&&r.bonus[k])||0)+((sub&&sub.bonus&&sub.bonus[k])||0);
  if(wizFlexCount()>0 && WIZ.flexBonus.includes(k)) b+=1;
  return b;
}
function wizAbTotal(k){ return WIZ.ab[k]+wizRaceBonus(k); }
function wizAbMod(total){ return Math.floor((total-10)/2); }
function wizRaceDisplayName(){ const r=wizRaceObj(); if(!r) return ''; const sub=wizSubObj(); return (sub&&sub.name)||r.name; }
function wizRaceSpeed(){ const r=wizRaceObj(); if(!r) return 0; const sub=wizSubObj(); return (sub&&sub.speed)||r.speed; }
function wizRaceDark(){ const r=wizRaceObj(); if(!r) return 0; const sub=wizSubObj(); return (sub&&sub.dark!=null)?sub.dark:(r.dark||0); }
function wizAbCost(){ return Object.values(WIZ.ab).reduce((s,v)=>s+WIZ_POINT_COSTS[v],0); }
function wizRecommendedClassIds(){
  const s=new Set();
  WIZ.concepts.forEach(cid=>{const c=WIZ_CONCEPTS.find(x=>x.id===cid); if(c) c.classes.forEach(x=>s.add(x));});
  return s;
}
function wizTint(){
  if(WIZ.classId && CLASS_COLOR[WIZ.classId]) return CLASS_COLOR[WIZ.classId];
  const concept=WIZ_CONCEPTS.find(c=>WIZ.concepts.includes(c.id));
  return concept ? concept.c : '#c9a227';
}

/* ============ step gating ============ */
function wizStepReady(i){
  const cls=CLASSES[WIZ.classId];
  switch(i){
    case 0: return true;
    case 1: {
      if(!WIZ.raceId) return false;
      const r=wizRaceObj();
      if(r.subs && !WIZ.subraceId) return false;
      if(wizFlexCount()>0){
        const picks=WIZ.flexBonus.filter(Boolean);
        if(picks.length<wizFlexCount() || new Set(picks).size<picks.length) return false;
      }
      return true;
    }
    case 2: return !!WIZ.classId;
    case 3: return true;
    case 4: { const spec=WIZ_CLASS_SKILLS[WIZ.classId]; return !spec || WIZ.skills.length===spec.count; }
    case 5: {
      if(!cls) return false;
      if(WIZ.classId==='fighter' && !WIZ.fightingStyle) return false;
      if(WIZ.classId==='rogue' && WIZ.expertise.length!==2) return false;
      if(subclassNamesForClass(WIZ.classId).length>1 && !WIZ.subclass) return false;
      return true;
    }
    case 6: { const spec=WIZ_EQUIPMENT[WIZ.classId]; if(!spec) return true; return (spec.groups||[]).every((g,gi)=>WIZ.equipPicks[gi]!=null); }
    case 7: return !!WIZ.name.trim();
    default: return true;
  }
}
function wizCanContinue(){ return wizStepReady(WIZ.step); }

/* ============ scene renderers ============ */
function sceneConcept(){
  return `
    <div class="wiz-eyebrow">Before the road</div>
    <h1>How do you meet the world?</h1>
    <p class="wiz-lede">Pick one or more instincts. The paths ahead will point out what fits — nothing is locked in.</p>
    <div class="wiz-sigil-grid">
      ${WIZ_CONCEPTS.map(c=>`
        <button class="wiz-sigil ${WIZ.concepts.includes(c.id)?'sel':''}" style="--sc:${c.c}" data-concept="${c.id}" type="button">
          <span class="ico">${c.ico}</span><span class="lbl">${c.label}</span>
        </button>`).join('')}
    </div>`;
}

function sceneRace(){
  const cards=WIZ_COMMON_RACES.map(id=>{
    const r=RACES[id];
    const bonusTxt=Object.entries(r.bonus||{}).map(([k,v])=>`+${v} ${k.toUpperCase()}`).join(' ') || (r.flex?'+1/+1 (your choice)':'');
    const img=`race-art/${RACE_IMG[id]||id}.jpg`;
    return `<div class="wiz-filmcard ${WIZ.raceId===id?'sel':''}" data-racepick="${id}">
      <div class="wiz-filmart" style="background-image:url('${img}')"></div>
      <span class="nm">${esc(r.name)}</span>
      <span class="sub">${esc(bonusTxt)}${r.dark?` · darkvision ${r.dark} ft.`:''}</span>
    </div>`;
  }).join('');

  let sub='';
  const race=wizRaceObj();
  if(race && race.subs){
    sub+=`<div class="wiz-subhead">Choose a Subrace</div><div class="wiz-pillrow">
      ${Object.entries(race.subs).map(([id,s])=>`<button class="wiz-pill ${WIZ.subraceId===id?'sel':''}" data-subracepick="${id}" type="button">${esc(s.name)}</button>`).join('')}
    </div>`;
  }
  if(race && wizFlexCount()>0){
    const n=wizFlexCount();
    sub+=`<div class="wiz-subhead">Choose ${n} Bonus Abilit${n>1?'ies':'y'} (+1 each)</div>`;
    for(let slot=0;slot<n;slot++){
      sub+=`<div class="wiz-pillrow">${ABILITIES.map(([k,label])=>{
        const takenElsewhere=WIZ.flexBonus.some((v,i)=>v===k&&i!==slot);
        return `<button class="wiz-pill ${WIZ.flexBonus[slot]===k?'sel':''}" ${takenElsewhere?'disabled':''} data-flexpick="${k}" data-flexslot="${slot}" type="button">${label}</button>`;
      }).join('')}</div>`;
    }
  }

  return `
    <div class="wiz-eyebrow">Blood and bone</div>
    <h1>Choose Your Bloodline</h1>
    <p class="wiz-lede">Every people carries the world differently. This shapes your body, not your story.</p>
    <div class="wiz-filmwrap">
      <button class="wiz-filmarrow" data-filmnav="-1" type="button">‹</button>
      <div class="wiz-filmstrip">${cards}</div>
      <button class="wiz-filmarrow" data-filmnav="1" type="button">›</button>
    </div>
    ${sub}`;
}

function sceneClass(){
  const rec=wizRecommendedClassIds();
  const cards=Object.keys(CLASSES).map(id=>{
    const c=CLASSES[id];
    const img=`class-art/${id}-portrait.jpg`;
    return `<div class="wiz-filmcard ${WIZ.classId===id?'sel':''}" style="--c:${CLASS_COLOR[id]}" data-classpick="${id}">
      ${rec.has(id)?'<span class="wiz-filmrec">★ Fit</span>':''}
      <div class="wiz-filmart" style="background-image:url('${img}')"></div>
      <span class="nm">${esc(c.name)}</span>
      <span class="sub">${esc(CLASS_FLAVOR[id]||'')}</span>
    </div>`;
  }).join('');
  return `
    <div class="wiz-eyebrow">Your calling</div>
    <h1>Choose Your Path</h1>
    <p class="wiz-lede">${WIZ.concepts.length?'Paths marked ★ fit the instincts you chose. The rest are just as open.':'Every path stands open — walk toward what calls to you.'}</p>
    <div class="wiz-filmwrap">
      <button class="wiz-filmarrow" data-filmnav="-1" type="button">‹</button>
      <div class="wiz-filmstrip">${cards}</div>
      <button class="wiz-filmarrow" data-filmnav="1" type="button">›</button>
    </div>`;
}

function sceneAbilities(){
  const remaining=WIZ_POOL-wizAbCost();
  return `
    <div class="wiz-eyebrow">At the anvil</div>
    <h1>Temper Body &amp; Mind</h1>
    <div class="wiz-anvil">🔨</div>
    <p class="wiz-lede">Spend your points where your path needs them most. Racial bonuses are added automatically on top of these.</p>
    <button class="wiz-autobtn" id="wizAutoAb" type="button">⚡ Auto-temper for my path</button>
    <p class="wiz-poolnote">Points remaining: <b>${remaining}</b> / ${WIZ_POOL}</p>
    <div class="wiz-dialgrid">
      ${Object.entries(WIZ.ab).map(([k,v])=>{
        const total=wizAbTotal(k), bonus=total-v, mod=wizAbMod(total);
        return `<div class="wiz-dial">
          <div class="an">${k}</div>
          <div class="av">${v}${bonus?`<i class="wiz-racial">+${bonus}</i>`:''}</div>
          <div class="amod">${bonus?`${total} total — `:''}${(mod>=0?'+':'')+mod} modifier</div>
          <div class="wiz-dial-steppers">
            <button data-abdown="${k}" ${v<=8?'disabled':''} type="button">−</button>
            <button data-abup="${k}" ${(v>=15||remaining<=0)?'disabled':''} type="button">+</button>
          </div>
        </div>`;
      }).join('')}
    </div>`;
}

function sceneSkills(){
  const cls=CLASSES[WIZ.classId];
  const spec=WIZ_CLASS_SKILLS[WIZ.classId];
  if(!spec){
    return `<div class="wiz-eyebrow">Training</div><h1>No Formal Training Needed</h1><p class="wiz-lede">This path grants no class skill choices — move on when you're ready.</p>`;
  }
  const remaining=spec.count-WIZ.skills.length;
  return `
    <div class="wiz-eyebrow">What you've practiced</div>
    <h1>Choose Your Training</h1>
    <p class="wiz-lede">${cls.name}s train in ${spec.count} of the skills below. ${remaining>0?`Pick ${remaining} more.`:'All set.'}</p>
    <div class="wiz-skillgrid">
      ${spec.options.map(k=>{
        const sk=SKILLS.find(s=>s[0]===k);
        const sel=WIZ.skills.includes(k);
        const full=!sel && WIZ.skills.length>=spec.count;
        return `<button class="wiz-skillchip ${sel?'sel':''} ${full?'off':''}" data-skillpick="${k}" ${full?'disabled':''} type="button">
          <span class="nm">${sk[1]}</span><span class="ab">${sk[2].toUpperCase()}</span>
        </button>`;
      }).join('')}
    </div>`;
}

function sceneFeatures(){
  const cls=CLASSES[WIZ.classId];
  const subNames=subclassNamesForClass(WIZ.classId);
  if(subNames.length===1 && !WIZ.subclass) WIZ.subclass=subNames[0];
  if(subNames.length!==1 && WIZ.subclass && !subNames.includes(WIZ.subclass)) WIZ.subclass='';

  const baseFeats=FEATURE_LIB.filter(e=>e.g===cls.name && e.l<=1 &&
    !(cls.name==='Fighter'&&e.n==='Fighting Style') &&
    !(cls.name==='Rogue'&&e.n.startsWith('Expertise')));

  let html=`<div class="wiz-eyebrow">What you carry within</div><h1>Level 1 Features</h1>
    ${WIZ_PROFS[WIZ.classId]?`<p class="wiz-lede">Proficient with: ${esc(WIZ_PROFS[WIZ.classId])}</p>`:''}
    <div class="wiz-featgrid">
      ${baseFeats.map(f=>`<div class="wiz-featcard"><div class="nm">${esc(f.n)}</div><div class="sub">${esc(f.d)}</div></div>`).join('')}
    </div>`;

  if(WIZ.classId==='fighter'){
    html+=`<div class="wiz-subhead">Choose a Fighting Style</div>
      <div class="wiz-optgrid">
        ${WIZ_FIGHTING_STYLES.map(s=>`<button class="wiz-optcard ${WIZ.fightingStyle===s.id?'sel':''}" data-style="${s.id}" type="button">
          <span class="nm">${s.name}</span><span class="sub">${s.desc}</span>
        </button>`).join('')}
      </div>`;
  }
  if(WIZ.classId==='rogue'){
    html+=`<div class="wiz-subhead">Expertise — pick 2 trained skills to master</div>
      <div class="wiz-skillgrid">
        ${WIZ.skills.map(k=>{
          const sk=SKILLS.find(s=>s[0]===k), sel=WIZ.expertise.includes(k), full=!sel&&WIZ.expertise.length>=2;
          return `<button class="wiz-skillchip ${sel?'sel':''} ${full?'off':''}" data-exppick="${k}" ${full?'disabled':''} type="button"><span class="nm">${sk[1]}</span></button>`;
        }).join('')}
      </div>`;
  }
  if(subNames.length>1){
    html+=`<div class="wiz-subhead">Choose Your ${WIZ_SUBCLASS_LABEL[WIZ.classId]||'Subclass'}</div>
      <div class="wiz-optgrid">
        ${subNames.map(nm=>{
          const feats=FEATURE_LIB.filter(e=>e.g===cls.name+' — '+nm && e.l<=1);
          return `<button class="wiz-optcard wide ${WIZ.subclass===nm?'sel':''}" data-subclasspick="${esc(nm)}" type="button">
            <span class="nm">${esc(nm)}</span>
            ${feats.map(f=>`<span class="sub"><b>${esc(f.n)}:</b> ${esc(f.d)}</span>`).join('')}
          </button>`;
        }).join('')}
      </div>`;
  } else if(subNames.length===1){
    const feats=FEATURE_LIB.filter(e=>e.g===cls.name+' — '+subNames[0] && e.l<=1);
    html+=`<div class="wiz-subhead">Your ${WIZ_SUBCLASS_LABEL[WIZ.classId]||'Subclass'} — ${esc(subNames[0])}</div>
      <div class="wiz-featgrid">
        ${feats.map(f=>`<div class="wiz-featcard"><div class="nm">${esc(f.n)}</div><div class="sub">${esc(f.d)}</div></div>`).join('')}
      </div>`;
  }
  return html;
}

function wizGrantLabel(bundle){
  if(!bundle) return [];
  const out=[];
  (bundle.weapons||[]).forEach(([k,q])=>{ const w=WEAPONS[k]; if(w) out.push(q>1?`${w.n} ×${q}`:w.n); });
  if(bundle.armor && ARMORS[bundle.armor]) out.push(ARMORS[bundle.armor].n);
  if(bundle.shield) out.push('Shield');
  (bundle.items||[]).forEach(([n,q])=>out.push(q>1?`${n} ×${q}`:n));
  (bundle.packs||[]).forEach(p=>out.push(p));
  return out;
}

function sceneEquipment(){
  const spec=WIZ_EQUIPMENT[WIZ.classId];
  if(!spec) return `<div class="wiz-eyebrow">Pack and blade</div><h1>Gear</h1><p class="wiz-lede">Nothing to choose here — you'll fill your pack in on the sheet.</p>`;
  const fixedLines=wizGrantLabel(spec.fixed);
  let html=`<div class="wiz-eyebrow">Pack and blade</div><h1>Choose Your Gear</h1>
    <p class="wiz-lede">The classic loadout — swap anything later from the Inventory tab.</p>`;
  if(fixedLines.length) html+=`<p class="wiz-fixedlist"><b>Always in your pack:</b> ${fixedLines.map(esc).join(', ')}</p>`;
  (spec.groups||[]).forEach((group,gi)=>{
    html+=`<div class="wiz-eqgroup">
      <div class="wiz-eqgroup-label">Choice ${gi+1}</div>
      <div class="wiz-optgrid">
        ${group.map((opt,oi)=>`<button class="wiz-optcard ${WIZ.equipPicks[gi]===oi?'sel':''}" data-eqgroup="${gi}" data-eqopt="${oi}" type="button">
          <span class="nm">${esc(opt.label)}</span>
        </button>`).join('')}
      </div>
    </div>`;
  });
  return html;
}

function sceneName(){
  return `
    <div class="wiz-eyebrow">The last thread</div>
    <h1>Speak Your Name</h1>
    <p class="wiz-lede">Once spoken, it's yours — carve it into the sheet.</p>
    <input class="wiz-name-input" id="wizNameInput" placeholder="Character name" value="${esc(WIZ.name)}" maxlength="40" autocomplete="off">`;
}

function wizCollectGrant(){
  const spec=WIZ_EQUIPMENT[WIZ.classId];
  const merged={weapons:{},items:{},armor:'',shield:false,packs:[]};
  if(!spec) return merged;
  const bundles=[spec.fixed||{}];
  (spec.groups||[]).forEach((g,gi)=>{ const pick=WIZ.equipPicks[gi]; if(pick!=null && g[pick]) bundles.push(g[pick].grant); });
  bundles.forEach(b=>{
    (b.weapons||[]).forEach(([k,q])=>{ merged.weapons[k]=(merged.weapons[k]||0)+q; });
    (b.items||[]).forEach(([n,q])=>{ merged.items[n]=(merged.items[n]||0)+q; });
    if(b.armor) merged.armor=b.armor;
    if(b.shield) merged.shield=true;
    (b.packs||[]).forEach(p=>merged.packs.push(p));
  });
  return merged;
}

function sceneFinale(){
  const cls=CLASSES[WIZ.classId];
  const abFinal=Object.fromEntries(Object.keys(WIZ.ab).map(k=>[k,wizAbTotal(k)]));
  const hpMax=Math.max(1,cls.hd+wizAbMod(abFinal.con));
  const merged=wizCollectGrant();
  const gearLines=[
    ...Object.entries(merged.weapons).map(([k,q])=>{const w=WEAPONS[k];return w?(q>1?`${w.n} ×${q}`:w.n):null;}).filter(Boolean),
    merged.armor&&ARMORS[merged.armor]?ARMORS[merged.armor].n:null, merged.shield?'Shield':null,
    ...Object.entries(merged.items).map(([n,q])=>q>1?`${n} ×${q}`:n), ...merged.packs,
  ].filter(Boolean);
  const trained=WIZ.skills.map(k=>{const s=SKILLS.find(x=>x[0]===k);return s?s[1]:k;});
  return `
    <div class="wiz-finale-seal">${CLASS_ICON[WIZ.classId]||'⚜'}</div>
    <div class="wiz-eyebrow">Destiny sealed</div>
    <h1>${esc(WIZ.name)}</h1>
    <p class="wiz-lede">${esc(wizRaceDisplayName())} · ${esc(cls.name)} 1${WIZ.subclass?' · '+esc(WIZ.subclass):''}</p>
    <div class="wiz-statline">
      ${ABILITIES.map(([k])=>`<div class="s"><b>${abFinal[k]}</b><i>${k}</i></div>`).join('')}
    </div>
    <div class="wiz-statline">
      <div class="s"><b>${hpMax}</b><i>HP</i></div>
      <div class="s"><b>1d${cls.hd}</b><i>hit die</i></div>
      <div class="s"><b>+2</b><i>prof</i></div>
    </div>
    <p class="wiz-lede">Trained: ${esc(trained.join(', ')||'—')}</p>
    <p class="wiz-lede">Carrying: ${esc(gearLines.join(', ')||'—')}</p>
    <div class="wiz-finale-actions">
      <button class="wiz-rail-nav" id="wizFinAdjust" type="button">↺ Adjust choices</button>
      <button class="wiz-rail-nav primary" id="wizFinBegin" type="button">⚜ Begin the Adventure</button>
    </div>`;
}

const WIZ_SCENES=[sceneConcept,sceneRace,sceneClass,sceneAbilities,sceneSkills,sceneFeatures,sceneEquipment,sceneName];

/* ============ finalize -> a real character, via the existing createChar() ============ */
function wizGrantEquipmentItem(data,name,qty,fallbackDesc){
  const src=ITEM_DB[name.toLowerCase()];
  const existing=data.equipment.find(e=>(e.name||'').toLowerCase()===name.toLowerCase());
  if(existing){ existing.qty=String(num(existing.qty)+qty); return; }
  if(src) data.equipment.push({qty:String(qty),name:src.n,type:src.t,desc:src.d,combat:!!src.cb,att:false});
  else data.equipment.push({qty:String(qty),name,type:'G',desc:fallbackDesc||'',combat:false,att:false});
}

function wizBuildFeatures(){
  const cls=CLASSES[WIZ.classId];
  const out=[];
  FEATURE_LIB.filter(e=>e.g===cls.name && e.l<=1).forEach(e=>{
    if(cls.name==='Fighter' && e.n==='Fighting Style') return;
    if(cls.name==='Rogue' && e.n.startsWith('Expertise')) return;
    out.push({title:e.n,desc:e.d,fx:(e.fx||[]).slice(),combat:!!e.combat,usesMax:e.usesMax,usesPer:e.usesPer,source:e.g});
  });
  if(WIZ.classId==='fighter' && WIZ.fightingStyle){
    const st=WIZ_FIGHTING_STYLES.find(s=>s.id===WIZ.fightingStyle);
    if(st) out.push({title:'Fighting Style: '+st.name,desc:st.desc,fx:(st.fx||[]).slice(),combat:false,source:'Fighter'});
  }
  if(WIZ.classId==='rogue' && WIZ.expertise.length===2){
    const names=WIZ.expertise.map(k=>{const s=SKILLS.find(x=>x[0]===k);return s?s[1]:k;});
    out.push({title:'Expertise',desc:'Double proficiency bonus on '+names.join(' and ')+'.',fx:[],source:'Rogue'});
  }
  if(WIZ.subclass){
    FEATURE_LIB.filter(e=>e.g===cls.name+' — '+WIZ.subclass && e.l<=1).forEach(e=>{
      out.push({title:e.n,desc:e.d,fx:(e.fx||[]).slice(),combat:!!e.combat,usesMax:e.usesMax,usesPer:e.usesPer,source:e.g});
    });
  }
  if(!out.length) out.push({title:'',desc:'',fx:[]});
  return out;
}

function wizFinalize(){
  const data=defaultState();
  const cls=CLASSES[WIZ.classId];

  data.name=WIZ.name.trim();
  data.classId=WIZ.classId;
  data.level=1;
  data.classLevel=cls.name+' 1';
  data.raceId=WIZ.raceId;
  data.subraceId=WIZ.subraceId||'';
  data.flexBonus=WIZ.flexBonus.slice();
  data.race=wizRaceDisplayName();
  data.speed=wizRaceSpeed()+' ft.';
  const dv=wizRaceDark(); data.vision=dv>0?dv+' ft.':'None';

  data.abilities={...WIZ.ab};
  data.profBonus=2;
  data.hdTotal='1d'+cls.hd; data.hd=data.hdTotal;
  const conMod=wizAbMod(wizAbTotal('con'));
  data.hpMax=Math.max(1,cls.hd+conMod); data.hpCurrent=data.hpMax;

  data.saveProf={str:false,dex:false,con:false,int:false,wis:false,cha:false};
  cls.saves.forEach(k=>data.saveProf[k]=true);

  data.skills=Object.fromEntries(SKILLS.map(s=>[s[0],0]));
  WIZ.skills.forEach(k=>data.skills[k]=1);
  WIZ.expertise.forEach(k=>data.skills[k]=2);

  if(cls.cast){
    data.spellClass=cls.name; data.spellAbility=cls.ab;
    if(cls.cast==='full') data.spellLevels[1].total=2;
    else if(cls.cast==='pact') data.spellLevels[1].total=1;
  }
  data.subclass=WIZ.subclass||''; data.subclassClassId=data.subclass?WIZ.classId:'';

  data.equipment=[]; data.attacks=[];
  const merged=wizCollectGrant();
  data.equip.armor=merged.armor||'none';
  data.equip.shield=!!merged.shield;
  data.equip.acAuto=true;
  Object.entries(merged.weapons).forEach(([key,qty])=>{
    const w=WEAPONS[key]; if(!w) return;
    data.attacks.push({name:w.n,weapon:key,die:w.d,dmgStat:'auto',magic:0,miscAtk:0,miscDmg:0,rolled:'',buffs:[]});
    wizGrantEquipmentItem(data,w.n,qty,'See Combat for its attack stats.');
  });
  Object.entries(merged.items).forEach(([name,qty])=>wizGrantEquipmentItem(data,name,qty));
  merged.packs.forEach(packName=>{
    const pack=PACKS.find(p=>p.n===packName);
    if(pack) pack.items.forEach(([name,qty])=>wizGrantEquipmentItem(data,name,qty));
  });
  if(WIZ.classId==='fighter'){
    if(WIZ.fightingStyle==='archery'){
      const atk=data.attacks.find(a=>WEAPONS[a.weapon]&&WEAPONS[a.weapon].rng);
      if(atk) atk.miscAtk=2;
    } else if(WIZ.fightingStyle==='dueling'){
      const oneHanded=data.attacks.filter(a=>{const w=WEAPONS[a.weapon];return w&&!w.light&&!w.h2&&!w.rng;});
      if(oneHanded.length===1) oneHanded[0].miscDmg=2;
    }
  }
  if(!data.attacks.length) data.attacks.push({name:'Unarmed Strike',weapon:'unarmed',die:'1',dmgStat:'auto',magic:0,miscAtk:0,miscDmg:0,rolled:'',buffs:[]});

  data.features=wizBuildFeatures();
  if(WIZ_PROFS[WIZ.classId]) data.otherProfs=[WIZ_PROFS[WIZ.classId]];
  data.languages=['Common'];

  return data;
}

/* ============ scene wiring ============ */
function wizWireScene(){
  const root=document.getElementById('wizActiveScene');
  if(!root) return;
  root.querySelectorAll('[data-concept]').forEach(el=>el.addEventListener('click',()=>{
    const id=el.dataset.concept, i=WIZ.concepts.indexOf(id);
    if(i>-1) WIZ.concepts.splice(i,1); else WIZ.concepts.push(id);
    wizRenderSceneInner(); wizRenderRail();
  }));
  root.querySelectorAll('[data-racepick]').forEach(el=>el.addEventListener('click',()=>{
    WIZ.raceId=el.dataset.racepick; WIZ.subraceId=''; WIZ.flexBonus=['',''];
    wizRenderSceneInner(); wizRenderRail();
  }));
  root.querySelectorAll('[data-subracepick]').forEach(el=>el.addEventListener('click',()=>{
    WIZ.subraceId=el.dataset.subracepick; wizRenderSceneInner(); wizRenderRail();
  }));
  root.querySelectorAll('[data-flexpick]').forEach(el=>el.addEventListener('click',()=>{
    const k=el.dataset.flexpick, slot=+el.dataset.flexslot;
    WIZ.flexBonus[slot]=(WIZ.flexBonus[slot]===k)?'':k;
    wizRenderSceneInner(); wizRenderRail();
  }));
  root.querySelectorAll('[data-classpick]').forEach(el=>el.addEventListener('click',()=>{
    if(WIZ.classId!==el.dataset.classpick){ WIZ.skills=[]; WIZ.subclass=''; WIZ.fightingStyle=''; WIZ.expertise=[]; WIZ.equipPicks={}; }
    WIZ.classId=el.dataset.classpick;
    wizRenderSceneInner(); wizRenderRail();
  }));
  root.querySelectorAll('[data-filmnav]').forEach(el=>el.addEventListener('click',()=>{
    const fs=root.querySelector('.wiz-filmstrip'); if(fs) fs.scrollBy({left:+el.dataset.filmnav*230,behavior:'smooth'});
  }));
  root.querySelectorAll('[data-abup]').forEach(el=>el.addEventListener('click',()=>{
    const k=el.dataset.abup, next=WIZ.ab[k]+1;
    if(next<=15 && wizAbCost()+(WIZ_POINT_COSTS[next]-WIZ_POINT_COSTS[WIZ.ab[k]])<=WIZ_POOL){ WIZ.ab[k]=next; wizRenderSceneInner(); }
  }));
  root.querySelectorAll('[data-abdown]').forEach(el=>el.addEventListener('click',()=>{
    const k=el.dataset.abdown; if(WIZ.ab[k]>8){ WIZ.ab[k]--; wizRenderSceneInner(); }
  }));
  const auto=root.querySelector('#wizAutoAb');
  if(auto) auto.addEventListener('click',()=>{
    const prio={barbarian:['str','con'],fighter:['str','con'],paladin:['str','cha'],monk:['dex','wis'],
      rogue:['dex','int'],ranger:['dex','wis'],bloodhunter:['dex','int'],
      wizard:['int','con'],sorcerer:['cha','con'],warlock:['cha','con'],bard:['cha','dex'],
      cleric:['wis','con'],druid:['wis','con']}[WIZ.classId]||['str','dex'];
    WIZ.ab={str:8,dex:8,con:8,int:8,wis:8,cha:8};
    const order=[prio[0],prio[1],...Object.keys(WIZ.ab).filter(k=>!prio.includes(k))];
    let pool=WIZ_POOL;
    order.forEach(k=>{
      while(WIZ.ab[k]<15){
        const cost=WIZ_POINT_COSTS[WIZ.ab[k]+1]-WIZ_POINT_COSTS[WIZ.ab[k]];
        const cap=(k===prio[0]||k===prio[1])?15:14;
        if(cost<=pool && WIZ.ab[k]<cap){ pool-=cost; WIZ.ab[k]++; } else break;
      }
    });
    wizRenderSceneInner();
  });
  root.querySelectorAll('[data-skillpick]').forEach(el=>el.addEventListener('click',()=>{
    const k=el.dataset.skillpick, spec=WIZ_CLASS_SKILLS[WIZ.classId];
    const i=WIZ.skills.indexOf(k);
    if(i>-1) WIZ.skills.splice(i,1);
    else if(WIZ.skills.length<spec.count) WIZ.skills.push(k);
    wizRenderSceneInner(); wizRenderRail();
  }));
  root.querySelectorAll('[data-style]').forEach(el=>el.addEventListener('click',()=>{
    WIZ.fightingStyle=el.dataset.style; wizRenderSceneInner(); wizRenderRail();
  }));
  root.querySelectorAll('[data-exppick]').forEach(el=>el.addEventListener('click',()=>{
    const k=el.dataset.exppick, i=WIZ.expertise.indexOf(k);
    if(i>-1) WIZ.expertise.splice(i,1);
    else if(WIZ.expertise.length<2) WIZ.expertise.push(k);
    wizRenderSceneInner(); wizRenderRail();
  }));
  root.querySelectorAll('[data-subclasspick]').forEach(el=>el.addEventListener('click',()=>{
    WIZ.subclass=el.dataset.subclasspick; wizRenderSceneInner(); wizRenderRail();
  }));
  root.querySelectorAll('[data-eqgroup]').forEach(el=>el.addEventListener('click',()=>{
    WIZ.equipPicks[+el.dataset.eqgroup]=+el.dataset.eqopt;
    wizRenderSceneInner(); wizRenderRail();
  }));
  const nameInput=root.querySelector('#wizNameInput');
  if(nameInput){
    nameInput.addEventListener('input',e=>{ WIZ.name=e.target.value; wizSyncNextButton(); });
    nameInput.focus();
  }
  const finAdjust=root.querySelector('#wizFinAdjust');
  if(finAdjust) finAdjust.addEventListener('click',()=>{ wizTransitionTo(7,false); });
  const finBegin=root.querySelector('#wizFinBegin');
  if(finBegin) finBegin.addEventListener('click',()=>{
    finBegin.disabled=true; finBegin.textContent='✓ Forging…';
    const data=wizFinalize();
    closeWizard();
    createChar(data);
  });
}

/* ============ transitions / rail ============ */
function wizRenderSceneInner(){
  const wrap=document.getElementById('wizSceneWrap'); if(!wrap) return;
  const html = WIZ.finished ? sceneFinale() : WIZ_SCENES[WIZ.step]();
  wrap.innerHTML=`<div class="wiz-scene" id="wizActiveScene">${html}</div>`;
  wizWireScene();
  const shell=document.getElementById('wizShell');
  if(shell) shell.style.setProperty('--wiz-tint', wizTint());
}

function wizTransitionTo(newStep,finishing){
  if(WIZ.animating) return; WIZ.animating=true;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scene=document.getElementById('wizActiveScene');
  const veil=document.getElementById('wizVeil');
  const doSwap=()=>{
    if(finishing===true) WIZ.finished=true; else if(finishing===false) WIZ.finished=false;
    WIZ.step=newStep;
    wizRenderSceneInner(); wizRenderRail();
    const s2=document.getElementById('wizActiveScene');
    if(!reduced && s2){ s2.classList.add('pre-in'); requestAnimationFrame(()=>requestAnimationFrame(()=>s2.classList.remove('pre-in'))); }
    setTimeout(()=>{ WIZ.animating=false; },460);
  };
  if(reduced||!scene){ if(scene) scene.style.opacity=0; setTimeout(doSwap,reduced?60:120); return; }
  scene.classList.add('out');
  if(veil){ veil.classList.remove('flash'); void veil.offsetWidth; veil.classList.add('flash'); }
  setTimeout(doSwap,320);
}

function wizRenderRail(){
  const track=document.getElementById('wizRailTrack'); if(!track) return;
  const pct=WIZ.finished?100:(WIZ.step/(WIZ_STEP_META.length-1))*100;
  track.innerHTML=`<div class="wiz-rail-fill" style="width:${pct}%"></div>`+WIZ_STEP_META.map((m,i)=>{
    const done=WIZ.finished || i<WIZ.step;
    const current=!WIZ.finished && i===WIZ.step;
    return `<div class="wiz-rail-node ${done?'done':''} ${current?'current':''}" data-railgoto="${i}">
      ${done&&!current?'✓':m.icon}<span class="rn-lbl">${m.label}</span>
    </div>`;
  }).join('');
  track.querySelectorAll('[data-railgoto]').forEach(el=>el.addEventListener('click',()=>{
    const i=+el.dataset.railgoto;
    if(WIZ.animating) return;
    if(i<=WIZ.step || WIZ.finished) wizTransitionTo(i,false);
  }));
  const meta=WIZ.finished?{roman:'IX',label:'Forged'}:WIZ_STEP_META[WIZ.step];
  const rEl=document.getElementById('wizTopRoman'), lEl=document.getElementById('wizTopLabel');
  if(rEl) rEl.textContent=meta.roman;
  if(lEl) lEl.textContent=meta.label;
  const backBtn=document.getElementById('wizBack');
  if(backBtn) backBtn.disabled = WIZ.step===0 && !WIZ.finished;
  wizSyncNextButton();
}
function wizSyncNextButton(){
  const btn=document.getElementById('wizNext'); if(!btn) return;
  if(WIZ.finished){ btn.style.visibility='hidden'; return; }
  btn.style.visibility='visible';
  const last=WIZ.step===WIZ_STEP_META.length-1;
  btn.textContent = last ? '⚜ Forge This Hero' : 'Continue ›';
  btn.disabled = !wizCanContinue();
}

/* ============ ambient ember particles — start only while the wizard is open ============ */
let WIZ_EMBERS_ON=false;
function wizStartEmbers(){
  if(WIZ_EMBERS_ON) return;
  const canvas=document.getElementById('wizEmbers'); if(!canvas) return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  WIZ_EMBERS_ON=true;
  const ctx=canvas.getContext('2d');
  let W,H,parts=[];
  function resize(){ W=canvas.width=innerWidth; H=canvas.height=innerHeight; }
  resize();
  const onResize=()=>resize();
  addEventListener('resize',onResize);
  function spawn(){ parts.push({x:Math.random()*W,y:H+10,vy:.35+Math.random()*.55,vx:(Math.random()-.5)*.3,r:1+Math.random()*2.2,a:.15+Math.random()*.35,life:0}); }
  function tick(){
    const shell=document.getElementById('wizShell');
    const active=shell && shell.classList.contains('open');
    if(!active && !parts.length){ WIZ_EMBERS_ON=false; removeEventListener('resize',onResize); ctx.clearRect(0,0,W,H); return; }
    if(active && Math.random()<0.5 && parts.length<70) spawn();
    ctx.clearRect(0,0,W,H);
    parts.forEach(p=>{
      p.y-=p.vy; p.x+=p.vx+Math.sin(p.y*0.01)*.15; p.life++;
      const fade=Math.max(0,1-p.life/500);
      ctx.beginPath(); ctx.fillStyle=`rgba(255,170,90,${(p.a*fade).toFixed(3)})`;
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
    });
    parts=parts.filter(p=>p.y>-10 && p.life<520);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ============ open / close / wire ============ */
function openWizard(){
  WIZ=wizFreshState();
  const shell=document.getElementById('wizShell'); if(!shell) return;
  shell.classList.add('open');
  wizRenderSceneInner(); wizRenderRail();
  wizStartEmbers();
}
function closeWizard(){
  const shell=document.getElementById('wizShell'); if(!shell) return;
  shell.classList.remove('open');
}
function wireWizard(){
  const backBtn=document.getElementById('wizBack');
  const nextBtn=document.getElementById('wizNext');
  const exitBtn=document.getElementById('wizExitBtn');
  if(!backBtn||!nextBtn||!exitBtn) return;
  backBtn.addEventListener('click',()=>{
    if(!WIZ || WIZ.animating) return;
    if(WIZ.finished){ wizTransitionTo(7,false); return; }
    if(WIZ.step>0) wizTransitionTo(WIZ.step-1);
  });
  nextBtn.addEventListener('click',()=>{
    if(!WIZ || WIZ.animating || !wizCanContinue()) return;
    if(WIZ.step===WIZ_STEP_META.length-1) wizTransitionTo(WIZ.step,true);
    else wizTransitionTo(WIZ.step+1);
  });
  exitBtn.addEventListener('click',()=>{ closeWizard(); openCharSelect(); });
  document.addEventListener('keydown',e=>{
    const shell=document.getElementById('wizShell');
    if(e.key==='Escape' && shell && shell.classList.contains('open')){ closeWizard(); openCharSelect(); }
  });
}
wireWizard();
