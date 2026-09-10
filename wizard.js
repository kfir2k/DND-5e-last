// ---------- Character Wizard: guided, step-by-step creation ----------
// Loaded after app.js — reuses its globals ($, $$, esc, num, defaultState, createChar,
// openCharSelect, CLASSES, RACES, RACE_IMG, CLASS_COLOR, CLASS_ICON, CLASS_FLAVOR, SKILLS,
// ABILITIES, WEAPONS, ARMORS, ITEM_DB, PACKS, FEATURE_LIB, subclassNamesForClass,
// CLASS_SKILL_CHOICES).
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
// Ability scores are free-form now (no point-buy pool): any score from 3 to 20 per ability, typed
// or stepped. Presets (standard array / 4d6-drop-lowest) are conveniences, not constraints.
const WIZ_AB_MIN=3, WIZ_AB_MAX=20;
const WIZ_STANDARD_ARRAY=[15,14,13,12,10,8];
const WIZ_CLASS_PRIO={
  barbarian:['str','con','dex'],fighter:['str','con','dex'],paladin:['str','cha','con'],
  monk:['dex','wis','con'],rogue:['dex','int','con'],ranger:['dex','wis','con'],bloodhunter:['dex','int','con'],
  wizard:['int','con','dex'],sorcerer:['cha','con','dex'],warlock:['cha','con','dex'],bard:['cha','dex','con'],
  cleric:['wis','con','str'],druid:['wis','con','dex'],
};
const WIZ_AB_COLOR={str:'#c0524a',dex:'#7dc26a',con:'#d59a3a',int:'#5aa9e0',wis:'#b48ee0',cha:'#d9599b'};
const WIZ_AB_LORE={str:'Muscle & might',dex:'Grace & reflex',con:'Grit & endurance',int:'Reason & memory',wis:'Insight & instinct',cha:'Presence & will'};
const WIZ_COMMON_RACES=['human','elf','dwarf','halfling','dragonborn','tiefling','gnome','halfelf','halforc'];
const WIZ_RACE_LORE={
  human:'Restless, ambitious and everywhere — humans build fast, dream big and burn bright.',
  elf:'Long-lived and graceful, elves move through the world like a breeze through ancient trees.',
  dwarf:'Stone-stubborn and hearth-loyal, dwarves remember every grudge and every kindness.',
  halfling:'Small, cheerful and impossibly lucky, halflings slip past danger with a grin.',
  dragonborn:'Proud heirs of dragons, with a breath weapon and a code of honor to match.',
  tiefling:'Marked by an infernal bloodline, tieflings carry both suspicion and quiet fire.',
  gnome:'Curious tinkerers and tricksters, gnomes meet the world with wide-eyed delight.',
  halfelf:'Caught between two peoples, half-elves belong to neither — and charm both.',
  halforc:'Strong, fierce and relentless, half-orcs refuse to fall while there is a fight left.',
};

let WIZ=null;
function wizFreshState(){
  return {
    step:0, finished:false, animating:false,
    concepts:[], raceId:'', subraceId:'', flexBonus:['',''],
    classId:'', ab:{str:8,dex:8,con:8,int:8,wis:8,cha:8}, abTouched:false,
    skills:[], subclass:'', fightingStyle:'', expertise:[],
    equipPicks:{}, name:'',
    focus:{race:0,class:0},
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
function wizPrioOrder(){
  const p=WIZ_CLASS_PRIO[WIZ.classId]||['str','dex','con','wis','int','cha'];
  return [...p, ...ABILITIES.map(a=>a[0]).filter(k=>!p.includes(k))];
}
function wizAbSet(k,v){
  const n=Math.round(Number(v));
  WIZ.ab[k]=isNaN(n)?WIZ_AB_MIN:Math.max(WIZ_AB_MIN,Math.min(WIZ_AB_MAX,n));
  WIZ.abTouched=true;
}
// Highest value goes to the class's primary ability, next to its secondary, and so on.
function wizAssignArray(values,keepUntouched){
  const sorted=values.slice().sort((a,b)=>b-a);
  wizPrioOrder().forEach((k,i)=>{ WIZ.ab[k]=Math.max(WIZ_AB_MIN,Math.min(WIZ_AB_MAX,sorted[i])); });
  if(!keepUntouched) WIZ.abTouched=true;
}
function wizRoll4d6(){
  const d=[0,0,0,0].map(()=>1+Math.floor(Math.random()*6)).sort((a,b)=>a-b);
  return d[1]+d[2]+d[3];
}
function wizAbSum(){ return Object.values(WIZ.ab).reduce((s,v)=>s+v,0); }

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
    case 4: { const spec=CLASS_SKILL_CHOICES[WIZ.classId]; return !spec || WIZ.skills.length===spec.count; }
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

/* ============ shared scene fragments ============ */
function wizHead(eyebrow,title,lede){
  return `<div class="wiz-head">
    <div class="wiz-eyebrow">${eyebrow}</div>
    <h1>${title}</h1>
    ${lede?`<p class="wiz-lede">${lede}</p>`:''}
  </div>`;
}
const WIZ_GLARE='<span class="wiz-glare" aria-hidden="true"></span>';

/* ============ scene renderers ============ */
function sceneConcept(){
  return wizHead('Before the road','How do you meet the world?','Pick one or more instincts. The paths ahead will point out what fits — nothing is locked in.')+`
    <div class="wiz-sigil-grid">
      ${WIZ_CONCEPTS.map(c=>`
        <button class="wiz-sigil wiz-tilt ${WIZ.concepts.includes(c.id)?'sel':''}" style="--sc:${c.c}" data-concept="${c.id}" type="button">
          <span class="wiz-sigil-ring"></span>
          <span class="wiz-sigil-face"><span class="ico">${c.ico}</span><span class="lbl">${c.label}</span></span>
          ${WIZ_GLARE}
        </button>`).join('')}
    </div>`;
}

/* --- 3D coverflow carousel shared by the Bloodline and Calling scenes --- */
function wizCarouselHtml(kind,cards){
  return `<div class="wiz-carousel" data-carousel="${kind}" tabindex="0" aria-label="${kind==='race'?'Bloodlines':'Paths'}">
      <button class="wiz-car-arrow" data-carnav="-1" type="button" aria-label="Previous">‹</button>
      <div class="wiz-car-stage">${cards}</div>
      <button class="wiz-car-arrow" data-carnav="1" type="button" aria-label="Next">›</button>
    </div>
    <div class="wiz-car-detail" id="wizCarDetail"></div>`;
}
function wizCarItems(kind){ return kind==='race' ? WIZ_COMMON_RACES : Object.keys(CLASSES); }
function wizCarTransform(o){
  const a=Math.abs(o), s=Math.sign(o);
  const narrow=innerWidth<640;
  const gap=narrow?112:172;
  const x=o*gap + s*Math.min(a,1)*(narrow?14:26);
  const z=a===0?70:-(80+a*80);
  const ry=a===0?0:-s*Math.min(26+a*6,50);
  const sc=a===0?1:Math.max(.68,.9-a*.06);
  return `translate(-50%,-50%) translate3d(${x.toFixed(1)}px,0,${z}px) rotateY(${ry}deg) scale(${sc.toFixed(3)})`;
}
function wizCarouselApply(root){
  const car=root.querySelector('.wiz-carousel'); if(!car) return;
  const kind=car.dataset.carousel, items=wizCarItems(kind);
  const focus=WIZ.focus[kind];
  car.querySelectorAll('.wiz-car-card').forEach(el=>{
    const o=+el.dataset.caridx-focus, a=Math.abs(o);
    el.style.transform=wizCarTransform(o);
    el.style.zIndex=String(100-a);
    el.style.opacity=a>4?'0':String(Math.max(.25,1-a*.16));
    el.style.pointerEvents=a>4?'none':'';
    el.classList.toggle('focus',o===0);
  });
  const id=items[focus];
  const detail=root.querySelector('#wizCarDetail');
  if(detail) detail.innerHTML = kind==='race' ? wizRaceDetail(id) : wizClassDetail(id);
  wizSetBackdrop(kind==='race' ? `race-art/${RACE_IMG[id]||id}.jpg` : `class-art/${id}-hero.jpg`);
  const shell=document.getElementById('wizShell');
  if(shell) shell.style.setProperty('--wiz-tint', kind==='class' ? (CLASS_COLOR[id]||wizTint()) : wizTint());
}
function wizCarouselFocus(root,idx){
  const car=root.querySelector('.wiz-carousel'); if(!car) return;
  const kind=car.dataset.carousel, n=wizCarItems(kind).length;
  WIZ.focus[kind]=Math.max(0,Math.min(n-1,idx));
  wizCarouselApply(root);
}
function wizRaceDetail(id){
  const r=RACES[id]; if(!r) return '';
  const chips=raceFlavorChips(id,'').map(c=>`<span class="wiz-chip">${esc(c)}</span>`).join('');
  const sel=WIZ.raceId===id;
  return `<div class="wiz-det-name">${esc(r.name)}${sel?'<span class="wiz-det-sel">✓ chosen</span>':''}</div>
    <p class="wiz-det-lore">${esc(WIZ_RACE_LORE[id]||'')}</p>
    <div class="wiz-chiprow">${chips}${r.subs?`<span class="wiz-chip soft">${Object.keys(r.subs).length} subraces</span>`:''}</div>
    <button class="wiz-choose ${sel?'is-sel':''}" data-carchoose="${id}" type="button">${sel?'✓ '+esc(r.name)+' chosen':'Choose '+esc(r.name)}</button>`;
}
function wizClassDetail(id){
  const c=CLASSES[id]; if(!c) return '';
  const rec=wizRecommendedClassIds().has(id);
  const prio=(WIZ_CLASS_PRIO[id]||[])[0];
  const cast=c.cast==='full'?'Full spellcaster':c.cast==='half'?'Half spellcaster':c.cast==='pact'?'Pact magic':'No spellcasting';
  const sel=WIZ.classId===id;
  return `<div class="wiz-det-name" style="--c:${CLASS_COLOR[id]}">${CLASS_ICON[id]||''} ${esc(c.name)}${sel?'<span class="wiz-det-sel">✓ chosen</span>':''}${rec?'<span class="wiz-det-rec">★ fits your instincts</span>':''}</div>
    <p class="wiz-det-lore">${esc(CLASS_FLAVOR[id]||'')}</p>
    <div class="wiz-chiprow">
      <span class="wiz-chip">d${c.hd} hit die</span>
      <span class="wiz-chip">Saves: ${c.saves.map(s=>s.toUpperCase()).join(' & ')}</span>
      ${prio?`<span class="wiz-chip">Primary: ${prio.toUpperCase()}</span>`:''}
      <span class="wiz-chip soft">${cast}</span>
    </div>
    <button class="wiz-choose ${sel?'is-sel':''}" data-carchoose="${id}" type="button">${sel?'✓ '+esc(c.name)+' chosen':'Walk the path of the '+esc(c.name)}</button>`;
}

function sceneRace(){
  if(WIZ.raceId){ const i=WIZ_COMMON_RACES.indexOf(WIZ.raceId); if(i>-1) WIZ.focus.race=i; }
  const cards=WIZ_COMMON_RACES.map((id,i)=>{
    const r=RACES[id];
    const bonusTxt=Object.entries(r.bonus||{}).map(([k,v])=>`+${v} ${k.toUpperCase()}`).join(' ') || (r.flex?'+1/+1 (your choice)':'subrace picks');
    const img=`race-art/${RACE_IMG[id]||id}.jpg`;
    return `<div class="wiz-car-card ${WIZ.raceId===id?'sel':''}" data-caridx="${i}" data-racepick="${id}">
      <div class="wiz-car-art" style="background-image:url('${img}')"></div>
      <div class="wiz-car-cap"><span class="nm">${esc(r.name)}</span><span class="sub">${esc(bonusTxt)}</span></div>
      <span class="wiz-car-check">✓</span>
      <span class="wiz-car-edge"></span>
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
  return wizHead('Blood and bone','Choose Your Bloodline','Swipe or drag to turn the gallery. Every people carries the world differently.')+
    wizCarouselHtml('race',cards)+(sub?`<div class="wiz-after-car">${sub}</div>`:'');
}

function sceneClass(){
  const ids=Object.keys(CLASSES);
  if(WIZ.classId){ const i=ids.indexOf(WIZ.classId); if(i>-1) WIZ.focus.class=i; }
  const rec=wizRecommendedClassIds();
  const cards=ids.map((id,i)=>{
    const c=CLASSES[id];
    const img=`class-art/${id}-portrait.jpg`;
    return `<div class="wiz-car-card ${WIZ.classId===id?'sel':''}" style="--c:${CLASS_COLOR[id]}" data-caridx="${i}" data-classpick="${id}">
      ${rec.has(id)?'<span class="wiz-car-rec">★ Fit</span>':''}
      <div class="wiz-car-art" style="background-image:url('${img}')"></div>
      <div class="wiz-car-cap"><span class="nm">${esc(c.name)}</span><span class="sub">d${c.hd} · ${c.saves.map(s=>s.toUpperCase()).join('/')}</span></div>
      <span class="wiz-car-check">✓</span>
      <span class="wiz-car-edge"></span>
    </div>`;
  }).join('');
  return wizHead('Your calling','Choose Your Path',WIZ.concepts.length?'Paths marked ★ fit the instincts you chose. The rest are just as open.':'Every path stands open — walk toward what calls to you.')+
    wizCarouselHtml('class',cards);
}

function wizRuneHtml(k,label){
  const v=WIZ.ab[k], total=wizAbTotal(k), bonus=total-v, mod=wizAbMod(total);
  return `<div class="wiz-rune-pos" style="--i:${ABILITIES.findIndex(a=>a[0]===k)}">
    <div class="wiz-rune wiz-tilt" data-rune="${k}" style="--ac:${WIZ_AB_COLOR[k]}">
      <div class="an">${k}</div>
      <div class="an2">${label}</div>
      <input class="wiz-ab-in" data-abin="${k}" value="${v}" inputmode="numeric" maxlength="2" aria-label="${label} score" autocomplete="off">
      <div class="bonus">${bonus?`+${bonus} racial → <b>${total}</b>`:'&nbsp;'}</div>
      <div class="amod">${(mod>=0?'+':'')+mod}</div>
      <div class="lore">${WIZ_AB_LORE[k]}</div>
      <div class="wiz-rune-steppers">
        <button data-abdown="${k}" ${v<=WIZ_AB_MIN?'disabled':''} type="button" aria-label="Lower ${label}">−</button>
        <button data-abup="${k}" ${v>=WIZ_AB_MAX?'disabled':''} type="button" aria-label="Raise ${label}">+</button>
      </div>
      ${WIZ_GLARE}
    </div>
  </div>`;
}
function sceneAbilities(){
  if(!WIZ.abTouched) wizAssignArray(WIZ_STANDARD_ARRAY,true);
  const cls=CLASSES[WIZ.classId];
  return wizHead('At the anvil','Temper Body &amp; Mind',`No point limit here — set any score from ${WIZ_AB_MIN} to ${WIZ_AB_MAX}. Tap a number to type it, or let the dice decide.${cls?` Racial bonuses are added on top.`:''}`)+`
    <div class="wiz-forge-tools">
      <button class="wiz-autobtn" data-abpreset="auto" type="button">⚡ Best for my path</button>
      <button class="wiz-autobtn" data-abpreset="roll" type="button">🎲 Roll 4d6, drop lowest</button>
      <button class="wiz-autobtn" data-abpreset="flat" type="button">◦ All 10s</button>
      <span class="wiz-forge-sum" id="wizAbSum" title="Sum of the six base scores">Σ ${wizAbSum()}</span>
    </div>
    <div class="wiz-forge">
      <div class="wiz-forge-core">
        <canvas id="wizD20" width="260" height="260" aria-hidden="true"></canvas>
        <div class="wiz-forge-glow"></div>
      </div>
      <div class="wiz-runes">${ABILITIES.map(([k,label])=>wizRuneHtml(k,label)).join('')}</div>
    </div>`;
}
function wizRefreshRunes(root){
  ABILITIES.forEach(([k])=>{
    const rune=root.querySelector(`.wiz-rune[data-rune="${k}"]`); if(!rune) return;
    const v=WIZ.ab[k], total=wizAbTotal(k), bonus=total-v, mod=wizAbMod(total);
    const inp=rune.querySelector('.wiz-ab-in'); if(inp && document.activeElement!==inp) inp.value=v;
    rune.querySelector('.bonus').innerHTML=bonus?`+${bonus} racial → <b>${total}</b>`:'&nbsp;';
    rune.querySelector('.amod').textContent=(mod>=0?'+':'')+mod;
    rune.querySelector('[data-abdown]').disabled=v<=WIZ_AB_MIN;
    rune.querySelector('[data-abup]').disabled=v>=WIZ_AB_MAX;
  });
  const sum=root.querySelector('#wizAbSum'); if(sum) sum.textContent='Σ '+wizAbSum();
}
function wizPopRunes(root,stagger){
  root.querySelectorAll('.wiz-rune').forEach((el,i)=>{
    el.classList.remove('pop'); void el.offsetWidth;
    setTimeout(()=>el.classList.add('pop'), stagger?i*90:0);
  });
}

function sceneSkills(){
  const cls=CLASSES[WIZ.classId];
  const spec=CLASS_SKILL_CHOICES[WIZ.classId];
  if(!spec){
    return wizHead('Training','No Formal Training Needed','This path grants no class skill choices — move on when you\'re ready.');
  }
  const remaining=spec.count-WIZ.skills.length;
  return wizHead('What you\'ve practiced','Choose Your Training',`${cls.name}s train in ${spec.count} of the skills below. ${remaining>0?`Pick ${remaining} more.`:'All set.'}`)+`
    <div class="wiz-pips">${Array.from({length:spec.count},(_,i)=>`<span class="wiz-pip ${i<WIZ.skills.length?'on':''}"></span>`).join('')}</div>
    <div class="wiz-skillgrid">
      ${spec.options.map(k=>{
        const sk=SKILLS.find(s=>s[0]===k);
        const sel=WIZ.skills.includes(k);
        const full=!sel && WIZ.skills.length>=spec.count;
        return `<button class="wiz-skillchip wiz-tilt ${sel?'sel':''} ${full?'off':''}" data-skillpick="${k}" ${full?'disabled':''} type="button" style="--ac:${WIZ_AB_COLOR[sk[2]]}">
          <span class="nm">${sk[1]}</span><span class="ab">${sk[2].toUpperCase()}</span>${WIZ_GLARE}
        </button>`;
      }).join('')}
    </div>`;
}

function sceneFeatures(){
  const cls=CLASSES[WIZ.classId];
  const subNames=subclassNamesForClass(WIZ.classId);
  if(subNames.length===1 && !WIZ.subclass) WIZ.subclass=subNames[0];
  if(subNames.length!==1 && WIZ.subclass && !subNames.includes(WIZ.subclass)) WIZ.subclass='';

  // Entries with a `pool` are pick-one options (fighting styles), not features everyone gets.
  const baseFeats=FEATURE_LIB.filter(e=>e.g===cls.name && e.l<=1 && !e.pool &&
    !(cls.name==='Fighter'&&e.n==='Fighting Style') &&
    !(cls.name==='Rogue'&&e.n.startsWith('Expertise')));

  let html=wizHead('What you carry within','Level 1 Features',WIZ_PROFS[WIZ.classId]?`Proficient with: ${esc(WIZ_PROFS[WIZ.classId])}`:'')+`
    <div class="wiz-featgrid">
      ${baseFeats.map(f=>`<div class="wiz-featcard wiz-tilt"><div class="nm">${esc(f.n)}</div><div class="sub">${esc(f.d)}</div>${WIZ_GLARE}</div>`).join('')}
    </div>`;

  if(WIZ.classId==='fighter'){
    html+=`<div class="wiz-subhead">Choose a Fighting Style</div>
      <div class="wiz-optgrid">
        ${FEATURE_LIB.filter(e=>e.pool==='fs-fighter').map(s=>`<button class="wiz-optcard wiz-tilt ${WIZ.fightingStyle===s.n?'sel':''}" data-style="${esc(s.n)}" type="button">
          <span class="nm">${esc(s.n)}</span><span class="sub">${esc(s.d)}</span>${WIZ_GLARE}
        </button>`).join('')}
      </div>`;
  }
  if(WIZ.classId==='rogue'){
    html+=`<div class="wiz-subhead">Expertise — pick 2 trained skills to master</div>
      <div class="wiz-skillgrid">
        ${WIZ.skills.map(k=>{
          const sk=SKILLS.find(s=>s[0]===k), sel=WIZ.expertise.includes(k), full=!sel&&WIZ.expertise.length>=2;
          return `<button class="wiz-skillchip wiz-tilt ${sel?'sel':''} ${full?'off':''}" data-exppick="${k}" ${full?'disabled':''} type="button" style="--ac:${WIZ_AB_COLOR[sk[2]]}"><span class="nm">${sk[1]}</span>${WIZ_GLARE}</button>`;
        }).join('')}
      </div>`;
  }
  if(subNames.length>1){
    html+=`<div class="wiz-subhead">Choose Your ${WIZ_SUBCLASS_LABEL[WIZ.classId]||'Subclass'}</div>
      <div class="wiz-optgrid">
        ${subNames.map(nm=>{
          const feats=FEATURE_LIB.filter(e=>e.g===cls.name+' — '+nm && e.l<=1);
          return `<button class="wiz-optcard wiz-tilt wide ${WIZ.subclass===nm?'sel':''}" data-subclasspick="${esc(nm)}" type="button">
            <span class="nm">${esc(nm)}</span>
            ${feats.map(f=>`<span class="sub"><b>${esc(f.n)}:</b> ${esc(f.d)}</span>`).join('')}${WIZ_GLARE}
          </button>`;
        }).join('')}
      </div>`;
  } else if(subNames.length===1){
    const feats=FEATURE_LIB.filter(e=>e.g===cls.name+' — '+subNames[0] && e.l<=1);
    html+=`<div class="wiz-subhead">Your ${WIZ_SUBCLASS_LABEL[WIZ.classId]||'Subclass'} — ${esc(subNames[0])}</div>
      <div class="wiz-featgrid">
        ${feats.map(f=>`<div class="wiz-featcard wiz-tilt"><div class="nm">${esc(f.n)}</div><div class="sub">${esc(f.d)}</div>${WIZ_GLARE}</div>`).join('')}
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
function wizGrantGlyph(grant){
  if(!grant) return '✦';
  if(grant.armor||grant.shield) return '🛡';
  if(grant.weapons&&grant.weapons.length){ const w=WEAPONS[grant.weapons[0][0]]; return (w&&w.rng)?'🏹':'⚔'; }
  if(grant.packs&&grant.packs.length) return '🎒';
  return '✦';
}

function sceneEquipment(){
  const spec=WIZ_EQUIPMENT[WIZ.classId];
  if(!spec) return wizHead('Pack and blade','Gear','Nothing to choose here — you\'ll fill your pack in on the sheet.');
  const fixedLines=wizGrantLabel(spec.fixed);
  let html=wizHead('Pack and blade','Choose Your Gear','The classic loadout — swap anything later from the Inventory tab.');
  if(fixedLines.length) html+=`<p class="wiz-fixedlist"><b>Always in your pack:</b> ${fixedLines.map(esc).join(', ')}</p>`;
  (spec.groups||[]).forEach((group,gi)=>{
    html+=`<div class="wiz-eqgroup">
      <div class="wiz-eqgroup-label">Choice ${gi+1}</div>
      <div class="wiz-optgrid">
        ${group.map((opt,oi)=>`<button class="wiz-optcard wiz-tilt gear ${WIZ.equipPicks[gi]===oi?'sel':''}" data-eqgroup="${gi}" data-eqopt="${oi}" type="button">
          <span class="glyph">${wizGrantGlyph(opt.grant)}</span>
          <span class="nm">${esc(opt.label)}</span>${WIZ_GLARE}
        </button>`).join('')}
      </div>
    </div>`;
  });
  return html;
}

function sceneName(){
  const cls=CLASSES[WIZ.classId];
  return wizHead('The last thread','Speak Your Name','Once spoken, it\'s yours — carve it into the sheet.')+`
    <div class="wiz-plate wiz-tilt" id="wizPlate" style="--c:${CLASS_COLOR[WIZ.classId]||'#c9a227'}">
      <div class="wiz-plate-art" style="background-image:url('class-art/${WIZ.classId}-portrait.jpg')"></div>
      <div class="wiz-plate-body">
        <div class="wiz-plate-name" id="wizPlateName">${esc(WIZ.name)||'<span class="ph">Unnamed</span>'}</div>
        <div class="wiz-plate-by">${esc(wizRaceDisplayName())} · ${cls?esc(cls.name):''} 1${WIZ.subclass?' · '+esc(WIZ.subclass):''}</div>
      </div>
      ${WIZ_GLARE}
    </div>
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
    <div class="wiz-herocard wiz-tilt" style="--c:${CLASS_COLOR[WIZ.classId]||'#c9a227'}">
      <div class="wiz-hc-art" style="background-image:url('class-art/${WIZ.classId}-portrait.jpg')"></div>
      <div class="wiz-hc-frame"></div>
      <div class="wiz-hc-body">
        <h1>${esc(WIZ.name)}</h1>
        <div class="wiz-hc-by">${esc(wizRaceDisplayName())} · ${esc(cls.name)} 1${WIZ.subclass?' · '+esc(WIZ.subclass):''}</div>
        <div class="wiz-statline">
          ${ABILITIES.map(([k])=>`<div class="s" style="--ac:${WIZ_AB_COLOR[k]}"><b>${abFinal[k]}</b><i>${k}</i><em>${(wizAbMod(abFinal[k])>=0?'+':'')+wizAbMod(abFinal[k])}</em></div>`).join('')}
        </div>
        <div class="wiz-statline vital">
          <div class="s"><b>${hpMax}</b><i>HP</i></div>
          <div class="s"><b>1d${cls.hd}</b><i>hit die</i></div>
          <div class="s"><b>+2</b><i>prof</i></div>
          <div class="s"><b>${wizRaceSpeed()}</b><i>speed</i></div>
        </div>
      </div>
      ${WIZ_GLARE}
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

// Features come straight from the app's own library plan (grantedPlan → FEATURE_LIB / RACE_LIB /
// BACKGROUND_LIB entries, converted by the same libEntryToFeature/raceEntryToFeature helpers the
// Features tab and Level Up use), so every card lands under "Class Features" / "<Subclass>" /
// "Racial Traits" with a proper byline and grantKey — never under "Custom". Runs AFTER createChar()
// has loaded the forged hero into S, because grantedPlan() and the level/stat-scaled helpers all
// read the live S (level, abilities, race) — see the #wizFinBegin handler.
function wizGrantLibraryFeatures(){
  const out=[];
  const subLabel=WIZ_SUBCLASS_LABEL[WIZ.classId];
  grantedPlan().forEach(p=>{
    // "Choose one…" reminder cards for decisions the wizard already made.
    if(p.lib==='feature' && WIZ.fightingStyle && /^Fighting Style/.test(p.ent.n)) return;
    if(p.lib==='feature' && WIZ.subclass && subLabel && p.ent.n===subLabel) return;
    const f = p.lib==='race' ? raceEntryToFeature(p.ent,p.source)
      : p.lib==='background' ? backgroundEntryToFeature(p.ent,p.source)
      : libEntryToFeature(p.ent,p.source);
    f.source.grantKey=p.key;
    out.push(f);
  });
  if(WIZ.classId==='fighter' && WIZ.fightingStyle){
    const st=FEATURE_LIB.find(e=>e.pool==='fs-fighter' && e.n===WIZ.fightingStyle);
    // No grantKey on purpose: pool picks aren't part of grantedPlan(), so a keyed copy would be
    // swept away as "no longer granted" the moment auto-grant is switched on.
    if(st) out.push(libEntryToFeature(st,{kind:'class',classId:'fighter',className:'Fighter'}));
  }
  S.features = out.length ? out
    : [{title:'',desc:'',fx:[],combat:false,usesMax:0,usesPer:'short',usesUsed:0,usesScale:'',levelAt:null,source:{kind:'custom'}}];
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
  data.classSkillPicks=WIZ.skills.slice();

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
    if(WIZ.fightingStyle==='Archery'){
      const atk=data.attacks.find(a=>WEAPONS[a.weapon]&&WEAPONS[a.weapon].rng);
      if(atk) atk.miscAtk=2;
    } else if(WIZ.fightingStyle==='Dueling'){
      const oneHanded=data.attacks.filter(a=>{const w=WEAPONS[a.weapon];return w&&!w.light&&!w.h2&&!w.rng;});
      if(oneHanded.length===1) oneHanded[0].miscDmg=2;
    }
  }
  if(!data.attacks.length) data.attacks.push({name:'Unarmed Strike',weapon:'unarmed',die:'1',dmgStat:'auto',magic:0,miscAtk:0,miscDmg:0,rolled:'',buffs:[]});

  data.features=[];   // filled from the library once the hero is live — see wizGrantLibraryFeatures()
  if(WIZ_PROFS[WIZ.classId]) data.otherProfs=[WIZ_PROFS[WIZ.classId]];
  data.languages=['Common'];

  return data;
}

/* ============ scene wiring (one delegated handler set per rendered scene) ============ */
let WIZ_CAR_DRAG=null;   // {x0, moved, kind} while a carousel is being dragged
let WIZ_CAR_WHEEL_AT=0;

function wizWireScene(){
  const root=document.getElementById('wizActiveScene');
  if(!root) return;
  const rerender=()=>{ wizRenderSceneInner(); wizRenderRail(); };

  root.addEventListener('click',e=>{
    const t=e.target;
    let el;
    if((el=t.closest('[data-concept]'))){
      const id=el.dataset.concept, i=WIZ.concepts.indexOf(id);
      if(i>-1) WIZ.concepts.splice(i,1); else WIZ.concepts.push(id);
      rerender(); return;
    }
    if((el=t.closest('[data-carnav]'))){
      const car=root.querySelector('.wiz-carousel'); if(!car) return;
      wizCarouselFocus(root, WIZ.focus[car.dataset.carousel]+(+el.dataset.carnav)); return;
    }
    if((el=t.closest('.wiz-car-card'))){
      if(WIZ_CAR_DRAG && WIZ_CAR_DRAG.moved) return;   // a swipe, not a tap
      const idx=+el.dataset.caridx, car=el.closest('.wiz-carousel'), kind=car.dataset.carousel;
      if(idx!==WIZ.focus[kind]){ wizCarouselFocus(root,idx); return; }
      wizChoose(kind, el.dataset.racepick||el.dataset.classpick); return;
    }
    if((el=t.closest('[data-carchoose]'))){
      const car=root.querySelector('.wiz-carousel'); if(!car) return;
      wizChoose(car.dataset.carousel, el.dataset.carchoose); return;
    }
    if((el=t.closest('[data-subracepick]'))){ WIZ.subraceId=el.dataset.subracepick; rerender(); return; }
    if((el=t.closest('[data-flexpick]'))){
      const k=el.dataset.flexpick, slot=+el.dataset.flexslot;
      WIZ.flexBonus[slot]=(WIZ.flexBonus[slot]===k)?'':k; rerender(); return;
    }
    if((el=t.closest('[data-abup],[data-abdown]'))){
      const up=el.hasAttribute('data-abup'), k=up?el.dataset.abup:el.dataset.abdown;
      wizAbSet(k, WIZ.ab[k]+(up?1:-1));
      wizRefreshRunes(root); wizD20Kick(up?1:-1);
      const rune=el.closest('.wiz-rune'); if(rune){ rune.classList.remove('pop'); void rune.offsetWidth; rune.classList.add('pop'); }
      return;
    }
    if((el=t.closest('[data-abpreset]'))){
      const mode=el.dataset.abpreset;
      if(mode==='auto'){ wizAssignArray(WIZ_STANDARD_ARRAY); wizRefreshRunes(root); wizPopRunes(root,true); wizD20Kick(2); }
      else if(mode==='flat'){ ABILITIES.forEach(([k])=>WIZ.ab[k]=10); WIZ.abTouched=true; wizRefreshRunes(root); wizPopRunes(root,false); wizD20Kick(-1); }
      else if(mode==='roll'){
        if(el.disabled) return;
        el.disabled=true; el.classList.add('rolling');
        root.querySelectorAll('.wiz-rune').forEach(r=>r.classList.add('rolling'));
        wizD20Spin(1300);
        setTimeout(()=>{
          wizAssignArray([0,0,0,0,0,0].map(wizRoll4d6));
          root.querySelectorAll('.wiz-rune').forEach(r=>r.classList.remove('rolling'));
          wizRefreshRunes(root); wizPopRunes(root,true);
          el.disabled=false; el.classList.remove('rolling');
        },1300);
      }
      return;
    }
    if((el=t.closest('[data-skillpick]'))){
      const k=el.dataset.skillpick, spec=CLASS_SKILL_CHOICES[WIZ.classId];
      const i=WIZ.skills.indexOf(k);
      if(i>-1) WIZ.skills.splice(i,1);
      else if(WIZ.skills.length<spec.count) WIZ.skills.push(k);
      rerender(); return;
    }
    if((el=t.closest('[data-style]'))){ WIZ.fightingStyle=el.dataset.style; rerender(); return; }
    if((el=t.closest('[data-exppick]'))){
      const k=el.dataset.exppick, i=WIZ.expertise.indexOf(k);
      if(i>-1) WIZ.expertise.splice(i,1);
      else if(WIZ.expertise.length<2) WIZ.expertise.push(k);
      rerender(); return;
    }
    if((el=t.closest('[data-subclasspick]'))){ WIZ.subclass=el.dataset.subclasspick; rerender(); return; }
    if((el=t.closest('[data-eqgroup]'))){
      WIZ.equipPicks[+el.dataset.eqgroup]=+el.dataset.eqopt; rerender(); return;
    }
    if(t.closest('#wizFinAdjust')){ wizTransitionTo(7,false); return; }
    if((el=t.closest('#wizFinBegin'))){
      el.disabled=true; el.textContent='✓ Forging…';
      const data=wizFinalize();
      closeWizard();
      const before=ROSTER.active;
      createChar(data);
      // createChar() bails (storage full) without switching slots — never write into the old hero.
      if(ROSTER.active!==before){ wizGrantLibraryFeatures(); save(); renderAll(); }
    }
  });

  // Ability score inputs: type any number, clamp on commit.
  root.querySelectorAll('.wiz-ab-in').forEach(inp=>{
    inp.addEventListener('focus',()=>inp.select());
    inp.addEventListener('keydown',e=>{
      if(e.key==='Enter'){ inp.blur(); }
      else if(e.key==='ArrowUp'){ e.preventDefault(); wizAbSet(inp.dataset.abin,WIZ.ab[inp.dataset.abin]+1); wizRefreshRunes(root); inp.value=WIZ.ab[inp.dataset.abin]; }
      else if(e.key==='ArrowDown'){ e.preventDefault(); wizAbSet(inp.dataset.abin,WIZ.ab[inp.dataset.abin]-1); wizRefreshRunes(root); inp.value=WIZ.ab[inp.dataset.abin]; }
    });
    inp.addEventListener('change',()=>{ wizAbSet(inp.dataset.abin,inp.value); inp.value=WIZ.ab[inp.dataset.abin]; wizRefreshRunes(root); wizD20Kick(1); });
    inp.addEventListener('blur',()=>{ inp.value=WIZ.ab[inp.dataset.abin]; });
  });

  // Carousel: drag/swipe to turn.
  const stage=root.querySelector('.wiz-car-stage');
  if(stage){
    stage.addEventListener('pointerdown',e=>{
      if(e.button!==undefined && e.button!==0) return;
      WIZ_CAR_DRAG={x0:e.clientX,moved:false,kind:stage.closest('.wiz-carousel').dataset.carousel,id:e.pointerId};
      try{ stage.setPointerCapture(e.pointerId); }catch(_){ }
    });
    stage.addEventListener('pointermove',e=>{
      if(!WIZ_CAR_DRAG || WIZ_CAR_DRAG.id!==e.pointerId) return;
      const dx=e.clientX-WIZ_CAR_DRAG.x0;
      if(Math.abs(dx)>10) WIZ_CAR_DRAG.moved=true;
      if(Math.abs(dx)>56){ wizCarouselFocus(root, WIZ.focus[WIZ_CAR_DRAG.kind]+(dx<0?1:-1)); WIZ_CAR_DRAG.x0=e.clientX; }
    });
    const end=e=>{
      if(!WIZ_CAR_DRAG || WIZ_CAR_DRAG.id!==e.pointerId) return;
      try{ stage.releasePointerCapture(e.pointerId); }catch(_){ }
      const d=WIZ_CAR_DRAG; setTimeout(()=>{ if(WIZ_CAR_DRAG===d) WIZ_CAR_DRAG=null; },0);
    };
    stage.addEventListener('pointerup',end); stage.addEventListener('pointercancel',end);
    const car=stage.closest('.wiz-carousel');
    car.addEventListener('wheel',e=>{
      if(Math.abs(e.deltaX)<=Math.abs(e.deltaY)) return;   // vertical wheel still scrolls the page
      e.preventDefault();
      const now=performance.now(); if(now-WIZ_CAR_WHEEL_AT<260) return; WIZ_CAR_WHEEL_AT=now;
      wizCarouselFocus(root, WIZ.focus[car.dataset.carousel]+(e.deltaX>0?1:-1));
    },{passive:false});
    wizCarouselApply(root);
  }

  const nameInput=root.querySelector('#wizNameInput');
  if(nameInput){
    nameInput.addEventListener('input',e=>{
      WIZ.name=e.target.value; wizSyncNextButton();
      const pn=root.querySelector('#wizPlateName'); if(pn) pn.innerHTML=esc(WIZ.name)||'<span class="ph">Unnamed</span>';
    });
    nameInput.focus();
  }

  const d20=root.querySelector('#wizD20');
  if(d20) wizD20Start(d20);

  wizTiltInit(root);
}

function wizChoose(kind,id){
  if(kind==='race'){
    if(WIZ.raceId!==id){ WIZ.raceId=id; WIZ.subraceId=''; WIZ.flexBonus=['','']; }
  } else {
    if(WIZ.classId!==id){ WIZ.skills=[]; WIZ.subclass=''; WIZ.fightingStyle=''; WIZ.expertise=[]; WIZ.equipPicks={}; if(!WIZ.abTouched) WIZ.ab={str:8,dex:8,con:8,int:8,wis:8,cha:8}; }
    WIZ.classId=id;
  }
  const veil=document.getElementById('wizVeil');
  if(veil){ veil.classList.remove('flash'); void veil.offsetWidth; veil.classList.add('flash'); }
  wizRenderSceneInner(); wizRenderRail();
}

/* ============ 3D tilt: any .wiz-tilt element leans toward the pointer, with a moving glare ============ */
function wizReduced(){ return matchMedia('(prefers-reduced-motion: reduce)').matches; }
function wizTiltInit(root){
  if(wizReduced()) return;
  let raf=0, pending=null;
  const apply=()=>{
    raf=0; if(!pending) return;
    const {el,x,y}=pending; pending=null;
    el.style.setProperty('--rx',((0.5-y)*14).toFixed(2)+'deg');
    el.style.setProperty('--ry',((x-0.5)*16).toFixed(2)+'deg');
    el.style.setProperty('--gx',(x*100).toFixed(1)+'%');
    el.style.setProperty('--gy',(y*100).toFixed(1)+'%');
    el.classList.add('tilting');
  };
  root.addEventListener('pointermove',e=>{
    if(e.pointerType==='touch') return;
    const el=e.target.closest('.wiz-tilt'); if(!el) return;
    const r=el.getBoundingClientRect(); if(!r.width||!r.height) return;
    pending={el,x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height};
    if(!raf) raf=requestAnimationFrame(apply);
  });
  root.addEventListener('pointerout',e=>{
    const el=e.target.closest('.wiz-tilt'); if(!el) return;
    if(e.relatedTarget && el.contains(e.relatedTarget)) return;
    ['--rx','--ry','--gx','--gy'].forEach(p=>el.style.removeProperty(p));
    el.classList.remove('tilting');
  });
}

/* ============ pointer parallax: the whole stage leans with the mouse / device tilt ============ */
const WIZ_PAR={tx:0,ty:0,x:0,y:0,raf:0,lastMouse:0,wired:false,orientAsked:false};
function wizParallaxTarget(x,y){
  WIZ_PAR.tx=Math.max(-1,Math.min(1,x)); WIZ_PAR.ty=Math.max(-1,Math.min(1,y));
  if(!WIZ_PAR.raf) WIZ_PAR.raf=requestAnimationFrame(wizParallaxTick);
}
function wizParallaxTick(){
  WIZ_PAR.raf=0;
  const shell=document.getElementById('wizShell'); if(!shell||!shell.classList.contains('open')) return;
  WIZ_PAR.x+=(WIZ_PAR.tx-WIZ_PAR.x)*.08; WIZ_PAR.y+=(WIZ_PAR.ty-WIZ_PAR.y)*.08;
  shell.style.setProperty('--px',WIZ_PAR.x.toFixed(4)); shell.style.setProperty('--py',WIZ_PAR.y.toFixed(4));
  if(Math.abs(WIZ_PAR.tx-WIZ_PAR.x)>.002||Math.abs(WIZ_PAR.ty-WIZ_PAR.y)>.002) WIZ_PAR.raf=requestAnimationFrame(wizParallaxTick);
}
function wizWireParallax(){
  if(WIZ_PAR.wired) return; WIZ_PAR.wired=true;
  const shell=document.getElementById('wizShell'); if(!shell) return;
  shell.addEventListener('pointermove',e=>{
    if(e.pointerType==='touch'||wizReduced()) return;
    WIZ_PAR.lastMouse=performance.now();
    wizParallaxTarget((e.clientX/innerWidth-.5)*2,(e.clientY/innerHeight-.5)*2);
  });
  const onOrient=e=>{
    if(wizReduced()||!shell.classList.contains('open')) return;
    if(performance.now()-WIZ_PAR.lastMouse<2000) return;   // a mouse is driving; ignore the gyro
    if(e.gamma==null||e.beta==null) return;
    const landscape=innerWidth>innerHeight;
    const gx=landscape?e.beta:e.gamma, gy=landscape?-e.gamma:e.beta-40;
    wizParallaxTarget(gx/28, gy/28);
  };
  // iOS asks for permission from a user gesture; everywhere else the event just works.
  shell.addEventListener('pointerdown',()=>{
    if(WIZ_PAR.orientAsked) return; WIZ_PAR.orientAsked=true;
    if(typeof DeviceOrientationEvent!=='undefined' && typeof DeviceOrientationEvent.requestPermission==='function'){
      DeviceOrientationEvent.requestPermission().then(st=>{ if(st==='granted') addEventListener('deviceorientation',onOrient); }).catch(()=>{});
    }
  },{once:false});
  if(typeof DeviceOrientationEvent!=='undefined' && typeof DeviceOrientationEvent.requestPermission!=='function'){
    addEventListener('deviceorientation',onOrient);
  }
}

/* ============ backdrop: the focused class/race art bleeds into the whole stage ============ */
let WIZ_BD_URL='';
function wizSetBackdrop(url){
  const bd=document.getElementById('wizBackdrop'); if(!bd) return;
  if(url===WIZ_BD_URL) return;
  WIZ_BD_URL=url;
  const layers=bd.querySelectorAll('.wiz-bd-layer');
  const cur=bd.querySelector('.wiz-bd-layer.on');
  const next=cur===layers[0]?layers[1]:layers[0];
  if(!url){ layers.forEach(l=>l.classList.remove('on')); return; }
  const img=new Image();
  img.onload=()=>{ if(WIZ_BD_URL!==url) return; next.style.backgroundImage=`url('${url}')`; layers.forEach(l=>l.classList.remove('on')); next.classList.add('on'); };
  img.onerror=()=>{ if(WIZ_BD_URL===url) layers.forEach(l=>l.classList.remove('on')); };
  img.src=url;
}
function wizSceneBackdrop(){
  if(WIZ.finished || WIZ.step>=3){ return WIZ.classId?`class-art/${WIZ.classId}-hero.jpg`:''; }
  if(WIZ.step===0) return '';
  return null;   // carousel scenes set their own from the focused card
}

/* ============ the d20: a real projected icosahedron on canvas, lit in the class colour ============ */
const WIZ_D20={canvas:null,ctx:null,rx:.6,ry:.2,rz:0,vx:.0035,vy:.006,vz:.0012,burst:0,burstT:0,raf:0,glow:0};
const WIZ_ICO=(()=>{
  const t=(1+Math.sqrt(5))/2;
  const V=[[-1,t,0],[1,t,0],[-1,-t,0],[1,-t,0],[0,-1,t],[0,1,t],[0,-1,-t],[0,1,-t],[t,0,-1],[t,0,1],[-t,0,-1],[-t,0,1]]
    .map(v=>{const l=Math.hypot(...v);return v.map(c=>c/l);});
  const F=[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],
    [3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]];
  // Opposite faces on a real d20 sum to 21; this numbering keeps that property.
  const N=[20,8,14,2,12,10,16,6,18,4,1,13,7,19,9,11,5,15,3,17];
  return {V,F,N};
})();
function wizHexRgb(hex){
  const m=/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex||'');
  return m?[parseInt(m[1],16),parseInt(m[2],16),parseInt(m[3],16)]:[201,162,39];
}
function wizD20Start(canvas){
  const dpr=Math.min(2,devicePixelRatio||1);
  canvas.width=260*dpr; canvas.height=260*dpr;
  WIZ_D20.canvas=canvas; WIZ_D20.ctx=canvas.getContext('2d'); WIZ_D20.ctx.setTransform(dpr,0,0,dpr,0,0);
  if(!WIZ_D20.raf) WIZ_D20.raf=requestAnimationFrame(wizD20Frame);
  if(wizReduced()) wizD20Draw();
}
function wizD20Kick(dir){ WIZ_D20.vy+=dir*.02; WIZ_D20.vx+=dir*.008; WIZ_D20.glow=1; }
function wizD20Spin(ms){ WIZ_D20.burst=performance.now()+ms; WIZ_D20.burstT=ms; WIZ_D20.glow=1; }
function wizD20Frame(now){
  WIZ_D20.raf=0;
  const c=WIZ_D20.canvas;
  if(!c||!c.isConnected){ WIZ_D20.canvas=null; return; }
  if(wizReduced()){ return; }
  const par=WIZ_PAR;
  let sx=1;
  if(WIZ_D20.burst){ const left=WIZ_D20.burst-now; if(left<=0){ WIZ_D20.burst=0; } else { const p=left/WIZ_D20.burstT; sx=1+p*p*22; } }
  WIZ_D20.rx+=WIZ_D20.vx*sx + (par.y*.004); WIZ_D20.ry+=WIZ_D20.vy*sx + (par.x*.006); WIZ_D20.rz+=WIZ_D20.vz*sx;
  WIZ_D20.vx+=(.0035-WIZ_D20.vx)*.03; WIZ_D20.vy+=(.006-WIZ_D20.vy)*.03;
  WIZ_D20.glow*=.94;
  wizD20Draw();
  WIZ_D20.raf=requestAnimationFrame(wizD20Frame);
}
function wizD20Draw(){
  const ctx=WIZ_D20.ctx; if(!ctx) return;
  const S=260, cx=S/2, cy=S/2, R=88, f=4.2;
  const tint=wizHexRgb(wizTint());
  const {rx,ry,rz}=WIZ_D20;
  const cxr=Math.cos(rx),sxr=Math.sin(rx),cyr=Math.cos(ry),syr=Math.sin(ry),czr=Math.cos(rz),szr=Math.sin(rz);
  const rot=([x,y,z])=>{
    let y1=y*cxr-z*sxr, z1=y*sxr+z*cxr;               // X
    let x2=x*cyr+z1*syr, z2=-x*syr+z1*cyr;            // Y
    let x3=x2*czr-y1*szr, y3=x2*szr+y1*czr;           // Z
    return [x3,y3,z2];
  };
  const P=WIZ_ICO.V.map(rot);
  const proj=([x,y,z])=>{ const k=f/(f-z); return [cx+x*R*k, cy-y*R*k, k]; };
  const light=[-.45,.65,.62]; const ll=Math.hypot(...light); light.forEach((v,i)=>light[i]=v/ll);
  const faces=WIZ_ICO.F.map((fi,i)=>{
    const a=P[fi[0]],b=P[fi[1]],c=P[fi[2]];
    const cen=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3];
    let n=[(b[1]-a[1])*(c[2]-a[2])-(b[2]-a[2])*(c[1]-a[1]),(b[2]-a[2])*(c[0]-a[0])-(b[0]-a[0])*(c[2]-a[2]),(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])];
    const nl=Math.hypot(...n)||1; n=n.map(v=>v/nl);
    if(n[0]*cen[0]+n[1]*cen[1]+n[2]*cen[2]<0) n=n.map(v=>-v);
    return {i,a,b,c,cen,n,z:cen[2]};
  }).sort((p,q)=>p.z-q.z);

  ctx.clearRect(0,0,S,S);
  // soft glow behind the die
  const g=ctx.createRadialGradient(cx,cy,10,cx,cy,125);
  g.addColorStop(0,`rgba(${tint[0]},${tint[1]},${tint[2]},${(.22+WIZ_D20.glow*.35).toFixed(3)})`);
  g.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=g; ctx.fillRect(0,0,S,S);

  ctx.font='700 15px Cinzel, Georgia, serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  faces.forEach(fc=>{
    const front=fc.n[2]>0;
    const [ax,ay]=proj(fc.a),[bx,by]=proj(fc.b),[cx2,cy2]=proj(fc.c);
    const lam=Math.max(0,fc.n[0]*light[0]+fc.n[1]*light[1]+fc.n[2]*light[2]);
    const spec=Math.pow(lam,14);
    const sh=front?(.18+lam*.62):.08;
    const r=Math.round(tint[0]*sh+255*spec*.5), gg=Math.round(tint[1]*sh+255*spec*.5), b=Math.round(tint[2]*sh+255*spec*.5);
    ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(bx,by); ctx.lineTo(cx2,cy2); ctx.closePath();
    ctx.fillStyle=`rgb(${Math.min(255,r)},${Math.min(255,gg)},${Math.min(255,b)})`; ctx.fill();
    ctx.strokeStyle=front?'rgba(255,225,160,.55)':'rgba(255,225,160,.12)'; ctx.lineWidth=front?1.1:.6; ctx.stroke();
    if(front && fc.n[2]>.3){
      const [px,py,pk]=proj(fc.cen);
      ctx.save(); ctx.translate(px,py); ctx.scale(fc.n[2]*pk,fc.n[2]*pk);
      ctx.fillStyle=`rgba(255,240,205,${(.35+fc.n[2]*.65).toFixed(2)})`;
      ctx.fillText(String(WIZ_ICO.N[fc.i]),0,1);
      ctx.restore();
    }
  });
}

/* ============ transitions / rail ============ */
function wizRenderSceneInner(){
  const wrap=document.getElementById('wizSceneWrap'); if(!wrap) return;
  const html = WIZ.finished ? sceneFinale() : WIZ_SCENES[WIZ.step]();
  wrap.innerHTML=`<div class="wiz-scene" id="wizActiveScene" data-step="${WIZ.finished?'finale':WIZ_STEP_META[WIZ.step].key}">${html}</div>`;
  const shell=document.getElementById('wizShell');
  if(shell) shell.style.setProperty('--wiz-tint', wizTint());
  wizWireScene();   // a carousel scene re-tints to its focused card from here
  const bd=wizSceneBackdrop(); if(bd!==null) wizSetBackdrop(bd);
}

function wizTransitionTo(newStep,finishing){
  if(WIZ.animating) return; WIZ.animating=true;
  const reduced=wizReduced();
  const scene=document.getElementById('wizActiveScene');
  const veil=document.getElementById('wizVeil');
  const shell=document.getElementById('wizShell');
  const doSwap=()=>{
    if(finishing===true) WIZ.finished=true; else if(finishing===false) WIZ.finished=false;
    WIZ.step=newStep;
    if(shell) shell.scrollTop=0;
    wizRenderSceneInner(); wizRenderRail();
    const s2=document.getElementById('wizActiveScene');
    if(!reduced && s2){ s2.classList.add('pre-in'); requestAnimationFrame(()=>requestAnimationFrame(()=>s2.classList.remove('pre-in'))); }
    setTimeout(()=>{ WIZ.animating=false; },520);
  };
  if(reduced||!scene){ if(scene) scene.style.opacity=0; setTimeout(doSwap,reduced?60:120); return; }
  scene.classList.add(newStep<WIZ.step&&finishing!==true?'out-back':'out');
  if(veil){ veil.classList.remove('flash'); void veil.offsetWidth; veil.classList.add('flash'); }
  setTimeout(doSwap,360);
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

/* ============ ambient embers — a depth field that parallaxes with the pointer ============ */
let WIZ_EMBERS_ON=false;
function wizStartEmbers(){
  if(WIZ_EMBERS_ON) return;
  const canvas=document.getElementById('wizEmbers'); if(!canvas) return;
  if(wizReduced()) return;
  WIZ_EMBERS_ON=true;
  const ctx=canvas.getContext('2d');
  let W,H,parts=[];
  function resize(){ W=canvas.width=innerWidth; H=canvas.height=innerHeight; }
  resize();
  const onResize=()=>resize();
  addEventListener('resize',onResize);
  function spawn(){
    const d=.25+Math.random()*.75;   // depth 0..1: far → near
    parts.push({x:Math.random()*W,y:H+10,d,vy:(.18+Math.random()*.4)*(.4+d),vx:(Math.random()-.5)*.25,r:(.8+Math.random()*2)*(.5+d),a:(.12+Math.random()*.3)*(.4+d*.6),life:0,tw:Math.random()*6.28});
  }
  function tick(){
    const shell=document.getElementById('wizShell');
    const active=shell && shell.classList.contains('open');
    if(!active && !parts.length){ WIZ_EMBERS_ON=false; removeEventListener('resize',onResize); ctx.clearRect(0,0,W,H); return; }
    if(active && Math.random()<0.55 && parts.length<90) spawn();
    ctx.clearRect(0,0,W,H);
    const tint=wizHexRgb(wizTint());
    const px=WIZ_PAR.x, py=WIZ_PAR.y;
    parts.forEach(p=>{
      p.y-=p.vy; p.x+=p.vx+Math.sin(p.y*0.01+p.tw)*.18; p.life++;
      const fade=Math.max(0,1-p.life/620)*Math.min(1,p.life/40);
      const ox=-px*p.d*p.d*60, oy=-py*p.d*p.d*40;
      const warm=p.d>.7;
      const col=warm?`${255},${170+Math.round(p.d*30)},${90}`:`${Math.round(200+tint[0]*.2)},${Math.round(180+tint[1]*.2)},${Math.round(120+tint[2]*.3)}`;
      ctx.beginPath(); ctx.fillStyle=`rgba(${col},${(p.a*fade).toFixed(3)})`;
      ctx.arc(p.x+ox,p.y+oy,p.r,0,Math.PI*2); ctx.fill();
    });
    parts=parts.filter(p=>p.y>-20 && p.life<640);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ============ open / close / wire ============ */
function openWizard(){
  WIZ=wizFreshState();
  const shell=document.getElementById('wizShell'); if(!shell) return;
  shell.classList.add('open');
  WIZ_BD_URL=''; wizSetBackdrop('');
  wizWireParallax();
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
    if(!shell || !shell.classList.contains('open') || !WIZ) return;
    if(e.key==='Escape'){ closeWizard(); openCharSelect(); return; }
    const inField=/^(INPUT|TEXTAREA|SELECT)$/.test((e.target&&e.target.tagName)||'');
    if(inField) return;
    const root=document.getElementById('wizActiveScene');
    const car=root&&root.querySelector('.wiz-carousel');
    if(car && (e.key==='ArrowLeft'||e.key==='ArrowRight')){
      e.preventDefault(); wizCarouselFocus(root, WIZ.focus[car.dataset.carousel]+(e.key==='ArrowRight'?1:-1)); return;
    }
    if(car && e.key==='Enter'){
      const kind=car.dataset.carousel; wizChoose(kind, wizCarItems(kind)[WIZ.focus[kind]]); return;
    }
  });
}
wireWizard();
