// ---------- Default state (mirrors the PDF fields) ----------
function defaultState(){
  return {
    // Page 1 header
    name:'', classLevel:'', background:'', playerName:'', race:'', alignment:'', xp:'',
    inspiration:false, profBonus:2,
    // Smart build (class/race presets)
    classId:'', level:1, subclass:'', subclassClassId:'', raceId:'', subraceId:'', flexBonus:['',''], asi:{}, asiExtra:[],
    backgroundId:'',
    // Build-derived fields the player has taken manual control of (see BUILD_FIELDS). A key being
    // present at all means "hands off" — applyBuild still computes the rules value to show as a
    // reference, but writes yours. autoGrant mirrors class/subclass/race features into S.features;
    // off by default, because which features you actually want on the sheet is the player's call,
    // not something to decide for them the moment they tap a class.
    buildOverride:{}, autoGrant:false, buildCustomOpen:false, buildMigrated:false,
    abilities:{str:10,dex:10,con:10,int:10,wis:10,cha:10},
    saveProf:{str:false,dex:false,con:false,int:false,wis:false,cha:false},
    skills:Object.fromEntries(SKILLS.map(s=>[s[0],0])), // 0 none, 1 proficient, 2 expertise
    favSkills:[], // skills pinned onto Overview's Trained Skills card despite 0 proficiency
    ovHidden:[], // trained/expertise skills the player has hidden from Overview's Trained Skills card
    // Combat
    ac:10, initiativeMisc:0, speed:'30 ft.', vision:'None',
    hpMax:10, hpCurrent:10, hpTemp:0, hdTotal:'', hd:'', hdUsed:0,
    deathS:[false,false,false], deathF:[false,false,false],
    stress:0, // homebrew: subtract this from every d20 roll while it's above 0 — tracked, not auto-applied
    attacks:[{name:'Longsword',weapon:'longsword',die:'1d8',dmgStat:'auto',magic:0,miscAtk:0,miscDmg:0,rolled:'',buffs:[]}], atkNotes:'',
    // Inventory
    equip:{armor:'none',armorMagic:0,shield:false,shieldMagic:0,acAuto:false,
           head:'',neck:'',cloak:'',hands:'',ring1:'',ring2:'',boots:'',mainhand:'',offhand:''},
    money:{cp:0,sp:0,ep:0,gp:0,pp:0},
    equipment:[], treasure:'',
    // Features
    features:[{title:'',desc:'',fx:[]}], profLang:'', languages:[], otherProfs:[], featuresLocked:false,
    // Spells (page 3): level 0 = cantrips
    spellClass:'', spellAbility:'', spellsLocked:false,
    spellLevels:Array.from({length:10},()=>({total:0,used:0,spells:[]})),
    // Inventory UI: active pack chip, folded Equipped panel
    eqTab:'ALL', invEqOpen:true,
    // Combat cockpit
    customCards:[], states:[], concentration:null,
    turnPlans:[{name:'Default',steps:[]}], turnPlanIdx:0,
    cockpit:{hidden:[],pins:[],showAllSpells:false,showDeath:false,atkOpen:false,hiddenZones:[],planCollapsed:false},
    // Page 2
    portrait:'',
    age:'',height:'',weight:'',eyes:'',skin:'',hair:'',
    personality:'', ideals:'', bonds:'', flaws:'',
    goals:'', secrets:'',
    allies:'', factionName:'', backstory:'',
    notes:[{title:'Session notes',body:'',tags:[],session:''}]
  };
}
let S = defaultState();

// ---------- Tiny helpers ----------
const $  = s=>document.querySelector(s);
const $$ = s=>[...document.querySelectorAll(s)];
const esc = v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const mod = score=>Math.floor((Number(score)||0)/2)-5;
const fmt = n=>(n>=0?'+':'')+n;
const num = v=>{const n=parseInt(v,10);return isNaN(n)?0:n;};

// ----- Racial bonus helpers -----
// Ability total = base score you typed + racial bonus. Bonuses are never
// written into the base score, so changing race can't double-apply them.
function raceInfo(){
  const r=RACES[S.raceId]; if(!r) return null;
  const sub=r.subs ? r.subs[S.subraceId] : null;
  return {r,sub};
}
function flexCount(){
  const ri=raceInfo(); if(!ri) return 0;
  if(ri.r.motm) return 2; // MotM lineages: choose a +2 and a +1
  return (ri.sub&&ri.sub.flex)||ri.r.flex||0;
}
// What the lineage data itself grants.
function racialBonusRules(k){
  const ri=raceInfo(); if(!ri) return 0;
  if(ri.r.motm){ // flexBonus[0] gets +2, flexBonus[1] gets +1
    let b=0;
    if(S.flexBonus[0]===k) b+=2;
    if(S.flexBonus[1]===k && S.flexBonus[1]!==S.flexBonus[0]) b+=1;
    return b;
  }
  let b=((ri.r.bonus&&ri.r.bonus[k])||0)+((ri.sub&&ri.sub.bonus&&ri.sub.bonus[k])||0);
  if(flexCount()>0 && S.flexBonus.includes(k)) b+=1;
  return b;
}
// What actually applies. RACES carries one canonical spread per lineage — Tiefling is +2 CHA
// +1 INT, which is really the Asmodeus bloodline — but the variant bloodlines just move that
// third point somewhere else (Dispater +1 DEX, Zariel +1 STR, and so on for a dozen more).
// Fanning all 46 lineages out into every published variant would be a lot of near-identical
// data for something a player can state in one line, so the whole spread is instead one
// overridable field: take it over in Build ▸ Customize and type what your bloodline, uncommon
// lineage or DM actually gave you. Same override rule as every other build-derived value.
function racialBonus(k){
  const ov=bovHas('raceBonus')&&S.buildOverride.raceBonus;
  return ov ? num(ov[k]) : racialBonusRules(k);
}
// Bonuses from Ability Score Improvements chosen at ASI levels, plus any DM-granted bonus picks
// (S.asiExtra — outside the normal level progression, so they always count regardless of level).
function asiBonus(k){
  let b=0;
  const lvls=asiLevels(S.classId);
  for(const L of lvls){
    if(L>num(S.level)) continue;
    const e=S.asi[L];
    if(e&&e.choice==='asi'){ if(e.a===k)b+=1; if(e.b===k)b+=1; }
  }
  (S.asiExtra||[]).forEach(e=>{
    if(e.choice==='asi'){ if(e.a===k)b+=1; if(e.b===k)b+=1; }
  });
  return b;
}
function score(k){ return (Number(S.abilities[k])||0)+racialBonus(k)+asiBonus(k); }
function amod(k){ return mod(score(k)); }
// Uses-scale: ties a feature's max uses to a live stat instead of a fixed number that goes
// stale the moment you level up or bump an ability score. 'prof' = proficiency bonus; any
// ABILITIES key = that ability's modifier (Bardic Inspiration, Rabbit Hop, etc.). usesScaleBonus
// adds a flat amount on top for the handful of features phrased "1 + mod" (Divine Sense).
// Always floored at 1 so a scaled feature never silently shows "0 uses" from a bad modifier.
function usesScaleBase(scale){
  if(scale==='prof') return num(S.profBonus);
  if(ABILITIES.some(([k])=>k===scale)) return amod(scale);
  return null;
}
function usesScaleValue(scale,bonus){
  const base=usesScaleBase(scale);
  return base==null ? null : Math.max(1,base+num(bonus));
}
function usesScaleLabel(scale){
  if(scale==='prof') return 'your proficiency bonus';
  const ab=ABILITIES.find(([k])=>k===scale);
  return ab ? `your ${ab[1]} modifier` : '';
}

// ----- Feature effects -----
// Each feature can carry effects: {t:'stat',stat,n} flat bonus,
// {t:'skill',skills:[...],grant} proficiency/expertise on one or more skills,
// {t:'save',ab} save proficiency,
// {t:'note',skills:[...],kind,cond} = ★ conditional reminder shown on each affected skill's row,
// {t:'statnote',stat,n?,cond} = ★ conditional reminder shown next to that stat on the Overview.
// (skills:[...] is the current format; skill:'x' — a single string — is still read for old saved data.)
function xSkills(x){ return x.skills || (x.skill?[x.skill]:[]); }
function allFx(){
  const out=[];
  (S.features||[]).forEach(f=>(f.fx||[]).forEach(x=>out.push({...x,src:f.title||'Feature'})));
  return out;
}
// An effect amount can be a plain number or a mini-formula using PROF, LVL, and ability
// modifiers (STR DEX CON INT WIS CHA) — e.g. "PROF", "DEX+1", "2*PROF". Resolved live against
// the sheet, so these bonuses keep up with level-ups the same way "= PROF" uses do.
function fxAmount(n){
  if(typeof n==='number') return n;
  const s=String(n??'').trim();
  if(!s) return 0;
  if(/^[+-]?\d+$/.test(s)) return +s;
  const expr=s.toLowerCase()
    .replace(/prof/g,`(${num(S.profBonus)})`)
    .replace(/lvl|level/g,`(${num(S.level)})`)
    .replace(/str|dex|con|int|wis|cha/g,m=>`(${amod(m)})`);
  if(!/^[\d+\-*/() ]+$/.test(expr)) return 0; // unknown tokens — refuse rather than guess
  try{ return Math.floor(Number(Function('"use strict";return('+expr+')')())||0); }
  catch(e){ return 0; }
}
// Chip/badge display for an amount: plain numbers as "+2"; formulas as "PROF (+3)" so the rule
// and today's number both stay visible.
function fmtAmount(n){
  const s=String(n??'').trim();
  return (typeof n==='number'||/^[+-]?\d*$/.test(s)) ? fmt(fxAmount(n)) : `${s.toUpperCase()} (${fmt(fxAmount(n))})`;
}
function fxStat(stat){ return allFx().filter(x=>x.t==='stat'&&x.stat===stat).reduce((n,x)=>n+fxAmount(x.n),0); }
function fxStatRems(stat){ return allFx().filter(x=>x.t==='statnote'&&x.stat===stat); }
function fxSkillGrant(k){
  let g=0;
  allFx().forEach(x=>{ if(x.t==='skill'&&xSkills(x).includes(k)) g=Math.max(g,x.grant==='exp'?2:1); });
  return g;
}
function effSkill(k){ return Math.max(S.skills[k]||0,fxSkillGrant(k)); }
function fxSaveProf(k){ return allFx().some(x=>x.t==='save'&&x.ab===k); }
function fxNotes(k){ return allFx().filter(x=>x.t==='note'&&xSkills(x).includes(k)); }
// Compute what a conditional reminder means in actual numbers for this skill.
// 'dprof' (and the older 'prof' alias) is a single adaptive rule: it grants proficiency
// if you don't have it, or doubles it if you already do — so it always shows one real number.
function noteMath(k,ab,x){
  const P=num(S.profBonus), eff=effSkill(k);
  const base=amod(ab)+eff*P;
  const kind=x.kind==='prof'?'dprof':x.kind;
  if(kind==='adv')   return 'roll with advantage';
  if(kind==='dprof') return eff>=2 ? `already ${fmt(base)} (expertise — no change)`
                          : eff>=1 ? `roll ${fmt(amod(ab)+2*P)} instead of ${fmt(base)} (proficiency doubled)`
                          : `roll ${fmt(amod(ab)+1*P)} instead of ${fmt(base)} (situational proficiency, +${fmt(P)})`;
  if(kind==='flat')  return `roll ${fmt(base+fxAmount(x.n))} instead of ${fmt(base)}`;
  return x.text||''; // old free-text reminders
}
// Terse version for the inline badge on the skill row: just the resulting number (or short word),
// nothing to show if the effect wouldn't actually change anything (e.g. already at expertise).
// noteMath() above still computes the full sentence, used as this badge's hover tooltip.
function noteBadge(k,ab,x){
  const P=num(S.profBonus), eff=effSkill(k);
  const kind=x.kind==='prof'?'dprof':x.kind;
  if(kind==='adv')   return 'adv';
  if(kind==='dprof') return eff>=2 ? null : fmt(amod(ab)+(eff>=1?2:1)*P);
  if(kind==='flat')  return fmt(amod(ab)+eff*P+fxAmount(x.n));
  return x.text||null;
}

function getPath(obj,path){return path.split('.').reduce((o,k)=>o?.[k],obj);}
function setPath(obj,path,val){
  const ks=path.split('.');const last=ks.pop();
  ks.reduce((o,k)=>o[k],obj)[last]=val;
}

// ---------- Page templates ----------
// The combat HUD strip — HP/AC/Init up top, Speed/Prof/Passive/Vision underneath, concentration
// + top-state chips woven in — is rendered on both Combat (where it lives sticky at the top of a
// fight) and Overview (the title page's vitals strip). Same markup, same data-bind/data-calc
// bindings, two homes: this is markup reuse, not a second implementation to keep in sync by hand.
function combatHudHTML(){
  return `
  <div class="combat-hud">
    <div class="chud-primary">
    <div class="chud-hp">
      <div class="chud-hpline">
        <span class="hp-btns chud-btns">
          <button class="hp-btn dmg" data-hp="-10">−10</button>
          <button class="hp-btn dmg" data-hp="-5">−5</button>
          <button class="hp-btn dmg" data-hp="-1">−1</button>
        </span>
        <span class="chud-nums">
          <input type="number" class="chud-in" data-bind="hpCurrent" title="Current HP">
          <span class="chud-slash">/</span>
          <input type="number" class="chud-in" data-bind="hpMax" title="Hit point maximum">
        </span>
        <span class="hp-btns chud-btns">
          <button class="hp-btn heal" data-hp="1">+1</button>
          <button class="hp-btn heal" data-hp="5">+5</button>
          <button class="hp-btn heal" data-hp="10">+10</button>
        </span>
        <span class="chud-temp" title="Temporary HP — soaked before real HP"><span class="chud-templbl">temp</span><input type="number" class="chud-in chud-tempin" data-bind="hpTemp"></span>
        <span class="chud-custom" title="Type any amount, then apply it as damage or healing">
          <button class="hp-btn dmg" data-hpcustom="-1" title="Apply as damage">−</button>
          <input type="number" min="0" class="chud-in chud-customin" placeholder="0">
          <button class="hp-btn heal" data-hpcustom="1" title="Apply as healing">+</button>
        </span>
      </div>
      <div class="hp-bar chud-bar"><div class="hp-fill"></div><span class="hp-temp-fill"></span></div>
      <span class="ckv-formula" data-fxform="hpmax"></span>
    </div>
    <span class="ck-conc"></span>
    <span class="ck-topstates"></span>
    </div>
    <div class="chud-senses">
      <div class="ckv ckv-primary"><span class="ckv-l">Armor Class</span>
        <span class="ckv-valrow"><input type="number" data-bind="ac"><span class="ckv-mod" data-fxmod="ac"></span></span>
        <span class="ckv-formula" data-fxform="ac"></span>
      </div>
      <div class="ckv ckv-primary computed"><span class="ckv-l">Initiative</span>
        <span class="ckv-valrow"><span class="ckv-big" data-calc="initiative">+0</span><span class="ckv-mod" data-fxmod="init"></span></span>
        <span class="ckv-formula" data-fxform="init"></span>
      </div>
      <div class="ckv ckv-sec"><span class="ckv-l">Speed</span>
        <span class="ckv-valrow"><input type="text" class="ckv-wide" data-bind="speed"><span class="ckv-mod" data-fxmod="speed"></span></span>
        <span class="ckv-formula" data-fxform="speed"></span>
      </div>
      <div class="ckv ckv-sec"><span class="ckv-l">Proficiency Bonus</span><input type="number" data-bind="profBonus"><span class="ckv-formula" data-fxform="prof"></span></div>
      <div class="ckv ckv-sec computed"><span class="ckv-l">Passive Perception</span>
        <span class="ckv-valrow"><span class="ckv-big" data-calc="passive">10</span><span class="ckv-mod" data-fxmod="passive"></span></span>
        <span class="ckv-formula" data-fxform="passive"></span>
      </div>
      <div class="ckv ckv-sec"><span class="ckv-l">Darkvision</span>
        <span class="ckv-valrow"><input type="text" class="ckv-wide" data-bind="vision"><span class="ckv-mod" data-fxmod="vision"></span></span>
        <span class="ckv-formula" data-fxform="vision"></span>
      </div>
    </div>
  </div>`;
}

const PAGES = {
overview:`
  <div class="panel ov-identity" id="ovIdentity">
    <div class="ov-id-icon" id="ovIdIcon">⚔</div>
    <div class="ov-id-main">
      <input type="text" class="ov-id-name" data-bind="name" placeholder="Character Name" autocomplete="off">
      <div class="ov-id-line">
        <input type="text" class="ov-id-field" id="subclassOv" data-bind="subclass" placeholder="Subclass" size="12" autocomplete="off" readonly>
        <span class="ov-id-dot">·</span>
        <input type="text" class="ov-id-field" data-bind="classLevel" placeholder="Class &amp; Level" size="12">
        <span class="ov-id-dot">·</span>
        <input type="text" class="ov-id-field" data-bind="race" placeholder="Race" size="10">
        <span class="ov-id-dot">·</span>
        <input type="text" class="ov-id-field" data-bind="background" placeholder="Background" size="10">
        <span class="ov-id-dot">·</span>
        <input type="text" class="ov-id-field" data-bind="alignment" placeholder="Alignment" size="10">
      </div>
      <p class="ov-id-outlook" id="ovOutlook"></p>
    </div>
    <div class="ov-id-side">
      <button class="insp-btn big" id="inspBtn">Inspiration</button>
      <div class="ov-xp" id="ovXp"></div>
    </div>
  </div>
  ${combatHudHTML()}
  <div class="grid g2 ov-main-grid">
    <div class="ov-col">
      <div class="panel"><h2>Ability Scores</h2><div class="abilities" id="abilityCards"></div></div>
      <div class="panel"><h2>Saving Throws</h2><div class="save-list-mini" id="ovSaves"></div></div>
      <div class="panel stress-panel"><h2>Stress</h2>
        <div class="stress-widget">
          <button class="stress-btn stress-down" data-stress="-1" title="Reduce stress">−</button>
          <div class="stress-ring" id="stressRing" style="--pct:0">
            <div class="stress-ring-inner">
              <span class="stress-num" id="stressNum">0</span>
              <span class="stress-max">/ 10</span>
            </div>
          </div>
          <button class="stress-btn stress-up" data-stress="1" title="Gain stress">+</button>
        </div>
        <p class="prep-note stress-note" id="stressNote">No stress — rolls are unaffected.</p>
      </div>
    </div>
    <div class="ov-col">
      <div class="panel ov-skills-panel"><h2>Trained Skills</h2><div id="ovSkillChips"></div></div>
      <div class="panel ov-spellslots-panel" id="ovSpellPanel"><h2>🔮 Spellcasting</h2>
        <div class="stats-row" style="grid-template-columns:1fr 1fr">
          <div class="stat computed stat-dc"><span class="stat-label">🔮 Spell Save DC</span><span class="big" data-calc="spellDC">—</span></div>
          <div class="stat computed stat-dc"><span class="stat-label">✨ Spell Attack</span><span class="big" data-calc="spellAtk">—</span></div>
        </div>
        <div class="ov-spellslots-list"></div>
        <span class="ck-conc"></span>
      </div>
      <div class="panel"><h2>Wealth &amp; Attunement</h2><div id="ovWealth"></div></div>
      <div class="panel"><h2>States</h2>
        <div class="ck-states-list"></div>
        <div class="fx-addrow" style="margin-top:6px">
          <input type="text" id="ovStateIn" placeholder="e.g. Raging, Hidden, Blessed" style="flex:1;min-width:0">
          <button class="add-btn" id="ovStateAdd">+</button>
        </div>
      </div>
    </div>
  </div>
  <div class="panel ov-whisper" id="ovWhisper"></div>`,

build:`
  <div class="panel build-panel" id="buildPanel">
    <div class="bHeroGroup">
    <section class="bHero bcsHero" id="bHero">
      <div class="bcsCorner bcsCornerTl"></div><div class="bcsCorner bcsCornerTr"></div>
      <div class="bcsCorner bcsCornerBl"></div><div class="bcsCorner bcsCornerBr"></div>
      <div class="bRailCol">
        <div class="bRailColLbl">Class</div>
        <div class="bRail" id="classRail"></div>
      </div>
      <div class="bStage">
        <div class="bStageArt">
          <img class="bLayer bBgA visible" id="bBgA" alt="">
          <img class="bLayer bBgB" id="bBgB" alt="">
          <div class="bScrim"></div>
          <div class="bFlash" id="bFlash"></div>
          <button class="bArrow bArrowL" id="classPrevBtn" type="button" aria-label="Previous class">‹</button>
          <button class="bArrow bArrowR" id="classNextBtn" type="button" aria-label="Next class">›</button>
        </div>
        <div class="bContent bContentBanner">
          <div class="bEyebrow" id="bEyebrow">Choose your class</div>
          <h2 class="bName" id="bName">—</h2>
          <div class="bLevelStars" id="bLevelStars"></div>
          <div class="bStatBars" id="bStatBars"></div>
          <p class="bFlavor" id="bFlavor">Pick a class from the roster to see how they fight.</p>
          <div class="bFields">
            <label class="fld bFld"><span>Level</span><input type="number" id="levelIn" min="1" max="20" value="1"></label>
            <label class="fld bFld sug-wrap"><span>Subclass</span><input type="text" id="subclassIn" data-bind="subclass" autocomplete="off" placeholder="Tap to choose — e.g. Gloom Stalker" readonly></label>
          </div>
          <div class="bSelectedPill" id="bSelectedPill">Selected</div>
        </div>
      </div>
    </section>

    <div class="bHeroSeam"><span class="bHeroSeamGem">✦</span></div>

    <section class="bHero bcsHero bHeroMini" id="bHeroMini">
      <div class="bcsCorner bcsCornerTl"></div><div class="bcsCorner bcsCornerTr"></div>
      <div class="bcsCorner bcsCornerBl"></div><div class="bcsCorner bcsCornerBr"></div>
      <div class="bRailCol bRailColMini">
        <div class="bRailColLbl">Heritage</div>
        <div class="bRail bRailMini" id="raceRail"></div>
      </div>
      <div class="bStage">
        <img class="bLayer bMbgA visible" id="bMbgA" alt="">
        <img class="bLayer bMbgB" id="bMbgB" alt="">
        <div class="bMiniPortraitWrap">
          <img class="bLayer bMportA visible" id="bMportA" alt="">
          <img class="bLayer bMportB" id="bMportB" alt="">
        </div>
        <div class="bScrim"></div>
        <button class="bArrow bArrowL bArrowSm" id="racePrevBtn" type="button" aria-label="Previous heritage">‹</button>
        <button class="bArrow bArrowR bArrowSm" id="raceNextBtn" type="button" aria-label="Next heritage">›</button>
        <div class="bContent bContentMini">
          <div class="bEyebrow">Heritage</div>
          <h3 class="bName bNameMini" id="bRaceName">—</h3>
          <div class="bChipRow" id="bRaceChips"></div>
        </div>
      </div>
    </section>
    </div>

    <div class="grid g3" id="subDetails">
      <label class="fld" id="subraceFld" style="display:none"><span>Subrace</span><div class="bPillRow" id="subracePills"></div></label>
      <label class="fld flex-fld" id="flexFld" style="display:none"><span id="flexLbl">Flexible Bonus</span><div class="bPillRow" id="flexPills"></div></label>
    </div>
    <p class="prep-note" id="buildNote">Choose a class and level to auto-set proficiency, hit dice, saving throws and spell slots. Choose a race for speed and ability bonuses. Subclass features are searchable in the Features tab once picked here.</p>
    <div class="bCustom">
      <button type="button" class="bCustomBtn" id="buildCustomBtn" title="Override any of the values your class and heritage set — they stop being overwritten once you do">✎ Customize defaults</button>
      <div class="bCustomBody" id="buildCustomBody" style="display:none"></div>
    </div>
  </div>
  <div class="panel" id="asiPanel" style="display:none"><h2>Level-Up Choices — ASI &amp; Feats</h2>
    <p class="prep-note" style="margin:0 0 10px">ASI = two +1s (same ability twice for +2), added automatically. Or pick a Feat.</p>
    <div id="asiList"></div>
  </div>`,

combat:`
  ${combatHudHTML()}
  <div class="ck-duo" id="ckDuo">
    <div class="panel ck-actions-panel"><h2>⚡ Do Something</h2>
      <div id="ckUndo"></div>
      <div class="ck-toolbar">
        <div class="ck-search"><span class="ck-search-ic">🔍</span><input type="text" id="ckSearch" placeholder="Search actions…" autocomplete="off"></div>
        <div class="ck-zone-chips" id="ckZoneChips"></div>
        <div id="ckTypeWrap"></div>
      </div>
      <div class="ck-zones" id="ckCards"></div>
      <div class="fx-addrow" style="margin-top:8px">
        <button class="add-btn" id="ckAddCustom">+ Custom card</button>
        <button class="add-btn" id="ckSpellsToggle"></button>
      </div>
    </div>
    <div class="panel ck-plan-panel" id="ckPlanPanel">
      <div class="ck-plan-collapsed-tab" id="ckPlanCollapsedTab" title="Show Turn Plan">
        <span>🗺 Turn Plan</span><span class="ck-plan-collapsed-count" id="ckPlanCollapsedCount"></span>
      </div>
      <div class="ck-plan-open">
        <h2>🗺 Turn Plan</h2>
        <div class="ck-plan-toolbar" id="ckPlanToolbar">
          <span class="ck-plan-switch" id="ckPlanSwitch"></span>
          <button class="ck-tbtn" id="ckPlanRenameBtn" title="Rename this plan">✎</button>
          <button class="ck-tbtn" id="ckPlanAddBtn" title="New plan">+</button>
          <button class="del-btn" id="ckPlanDelBtn" title="Delete this plan">✕</button>
          <div class="ck-toolbar-spacer"></div>
          <button class="ck-tbtn ck-tbtn-accent" id="ckPlanWizard" style="display:none">🧙 Roll This Turn</button>
          <button class="ck-tbtn" id="ckPlanClear" style="display:none">Clear</button>
          <button class="ck-tbtn" id="ckPlanCollapseBtn" title="Hide Turn Plan to widen Do Something">≫</button>
        </div>
        <div class="ck-plan" id="ckPlan"></div>
      </div>
    </div>
  </div>
  <div class="ck-pop" id="ckPop"></div>
  <div class="ck-grid">
    <div class="ck-col ck-left">
      <div class="panel ck-death" id="ckDeathPanel"><h2 id="ckDeathHead">💀 Death Saves</h2>
        <div class="ck-death-body">
          <div class="ds-row"><span>Successes</span><div id="dsS"></div></div>
          <div class="ds-row"><span>Failures</span><div id="dsF"></div></div>
          <p class="prep-note" style="margin:8px 0 0">At 0 HP, roll a d20 at the start of each turn: 10+ is a success. 3 successes = stable, 3 failures = dead. Natural 20 = back up with 1 HP; natural 1 = two failures. Taking damage at 0 HP = one failure (critical hit = two).</p>
        </div>
      </div>
      <div class="panel"><h2>Hit Dice</h2>
        <div class="hd-row">
          <span class="stat-label">Hit Dice Left</span>
          <span class="big" data-calc="hd">—</span>
          <div class="hp-btns">
            <button class="hp-btn dmg" id="hdSpend">−</button>
            <button class="hp-btn heal" id="hdRegain">+</button>
          </div>
        </div>
        <p class="prep-note" style="margin:6px 0 0">Spend one on a short rest: roll it, add your CON modifier, heal that much. Rest buttons are in the top bar.</p>
      </div>
    </div>
    <div class="ck-col ck-center">
      <div class="panel ck-atk-panel" id="ckAtkPanel"><h2 id="ckAtkHead">⚔ Attacks</h2>
        <div class="ck-atk-body">
          <div id="attackList"></div>
          <button class="add-btn" data-add="attacks">+ Add attack</button>
          <label class="fld" style="margin-top:14px"><span>Additional notes</span>
            <textarea data-bind="atkNotes" placeholder="Ammunition, special attack options, spell attack reminders..."></textarea>
          </label>
        </div>
      </div>
    </div>
    <div class="ck-col ck-right">
      <div class="panel ov-spellslots-panel" id="combatSlotsPanel"><h2>🔮 Spell Slots</h2>
        <div class="stats-row" style="grid-template-columns:1fr 1fr">
          <div class="stat computed stat-dc"><span class="stat-label">🔮 Spell Save DC</span><span class="big" data-calc="spellDC">—</span></div>
          <div class="stat computed stat-dc"><span class="stat-label">✨ Spell Attack</span><span class="big" data-calc="spellAtk">—</span></div>
        </div>
        <div class="ov-spellslots-list" id="combatSlots"></div>
      </div>
      <div class="panel"><h2>🏷 States</h2>
        <div class="ck-states-list" id="ckStates"></div>
        <div class="fx-addrow" style="margin-top:6px">
          <input type="text" id="ckStateIn" placeholder="e.g. Raging, Hidden, Blessed" style="flex:1;min-width:0">
          <button class="add-btn" id="ckStateAdd">+</button>
        </div>
        <p class="prep-note" style="margin:6px 0 0">Free-form markers for anything active on you — pure paper, no rules attached.</p>
      </div>
      <div class="panel" id="ckRemPanel"><h2>★ Reminders</h2><div id="ckRems"></div></div>
      <div class="panel"><h2>📖 Rules</h2><div id="ckRules"></div></div>
    </div>
  </div>`,

skills:`
  <div class="panel"><h2>Saving Throws</h2>
    <div id="saveList"></div>
    <div class="sense-row">
      <span class="sense-chips-line">
        <span class="sense-chip">👁 Passive Perception <b data-calc="passive">10</b></span>
        <span class="sense-chip">📖 Proficiency <b data-calc="prof">+2</b></span>
      </span>
      <span class="prep-note sense-note">Tap a save tile or skill circle: proficiency → expertise → none · <span style="color:var(--green)">green</span> = granted by a feature (already counted) · <span style="color:var(--gold)">★</span> = situational reminder, apply it yourself.</span>
    </div>
  </div>
  <div class="panel"><h2>Skills</h2><div id="skillList"></div></div>`,

spells:`
  <div class="grimoire">
    <div class="ledger-head">
      <div class="stat-row">
        <div class="stat-cell">
          <div class="sc-label">Spellcasting Class</div>
          <input type="text" class="sc-input" data-bind="spellClass" placeholder="—">
        </div>
        <div class="stat-cell">
          <div class="sc-label">Ability</div>
          <select class="sc-input" data-bind="spellAbility">
            <option value="">— none —</option>
            <option value="int">Intelligence</option>
            <option value="wis">Wisdom</option>
            <option value="cha">Charisma</option>
          </select>
        </div>
        <div class="stat-cell">
          <div class="sc-label">Save DC</div>
          <div class="sc-computed" data-calc="spellDC">—</div>
          <div class="sc-hint"><b>8 + Prof + Ability mod.</b> Target rolls this or higher to resist your spell.</div>
        </div>
        <div class="stat-cell">
          <div class="sc-label">Attack</div>
          <div class="sc-computed" data-calc="spellAtk">—</div>
          <div class="sc-hint"><b>Prof + Ability mod.</b> Your bonus to hit with a spell attack roll.</div>
        </div>
      </div>
      <div class="search-row">
        <div class="search-label">+ Add a spell</div>
        <div style="position:relative">
          <input type="text" id="spellSearch" placeholder="Search your spellbook…" autocomplete="off">
          <div id="spellResults" class="lib-results"></div>
        </div>
      </div>
      <div class="toolbar-row">
        <button class="lock-toggle" id="spellsLockBtn"></button>
        <div class="spell-jumprow">
          <button class="jump-chip tier0" data-jump="0" title="Cantrips">✦</button>
          <button class="jump-chip tier1" data-jump="1" title="1st Level">I</button>
          <button class="jump-chip tier1" data-jump="2" title="2nd Level">II</button>
          <button class="jump-chip tier1" data-jump="3" title="3rd Level">III</button>
          <button class="jump-chip tier2" data-jump="4" title="4th Level">IV</button>
          <button class="jump-chip tier2" data-jump="5" title="5th Level">V</button>
          <button class="jump-chip tier2" data-jump="6" title="6th Level">VI</button>
          <button class="jump-chip tier3" data-jump="7" title="7th Level">VII</button>
          <button class="jump-chip tier3" data-jump="8" title="8th Level">VIII</button>
          <button class="jump-chip tier3" data-jump="9" title="9th Level">IX</button>
        </div>
      </div>
    </div>
    <p class="prep-note" style="margin:8px 4px 0">Tap a search result to add it at the right level · tap a spell to read its full text · ◆ = slots remaining</p>
    <div id="spellLevels"></div>
  </div>
  <div class="modal-bg" id="spellModalBg">
    <div class="modal spell-modal" id="spellModalPanel"></div>
  </div>`,

inventory:`
  <div class="money-hud">
    <span class="coin-hud c-cp" title="Copper"><input type="number" data-bind="money.cp"><i>CP</i></span>
    <span class="coin-hud c-sp" title="Silver"><input type="number" data-bind="money.sp"><i>SP</i></span>
    <span class="coin-hud c-ep" title="Electrum"><input type="number" data-bind="money.ep"><i>EP</i></span>
    <span class="coin-hud c-gp" title="Gold"><input type="number" data-bind="money.gp"><i>GP</i></span>
    <span class="coin-hud c-pp" title="Platinum"><input type="number" data-bind="money.pp"><i>PP</i></span>
  </div>
  <div class="panel" id="invEqPanel"><h2 id="invEqHead">Equipped &amp; Defense</h2>
    <div class="inv-duo">
    <div class="inv-grid">
      <label class="inv-slot" title="Helm, hat, circlet…">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 14a7 7 0 0 1 14 0v3H5z"/><path d="M8 14h8"/><path d="M12 7v-2"/></svg>
        <span class="inv-lbl">Head</span><input type="text" data-bind="equip.head" placeholder=" ">
      </label>
      <label class="inv-slot" title="Amulet, periapt…">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4c1 5 4 7 7 7s6-2 7-7"/><path d="M12 11v3"/><path d="M12 14l2.5 3-2.5 4-2.5-4z"/></svg>
        <span class="inv-lbl">Neck</span><input type="text" data-bind="equip.neck" placeholder=" ">
      </label>
      <label class="inv-slot" title="Cloak, mantle…">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3C7 6 6 13 7.5 20l4.5-3 4.5 3C18 13 17 6 12 3z"/><path d="M9.5 5.5h5"/></svg>
        <span class="inv-lbl">Cloak</span><input type="text" data-bind="equip.cloak" placeholder=" ">
      </label>
      <label class="inv-slot" title="Weapon">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2v13"/><path d="M12 2l2 3-2 2-2-2z"/><path d="M7.5 15h9"/><path d="M12 15v6"/><path d="M10 21h4"/></svg>
        <span class="inv-lbl">Main hand</span><input type="text" data-bind="equip.mainhand" placeholder=" ">
      </label>
      <label class="inv-slot" title="Weapon, focus, shield…">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l7 2.5V12c0 4.5-3.5 6.8-7 9-3.5-2.2-7-4.5-7-9V5.5z"/><path d="M12 6.5v10"/></svg>
        <span class="inv-lbl">Off hand</span><input type="text" data-bind="equip.offhand" placeholder=" ">
      </label>
      <label class="inv-slot" title="Gloves, gauntlets…">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 21V9a4 4 0 0 1 8 0v12"/><path d="M8 12h8"/><path d="M12 9v3"/></svg>
        <span class="inv-lbl">Hands</span><input type="text" data-bind="equip.hands" placeholder=" ">
      </label>
      <label class="inv-slot" title="Ring">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="14" r="6"/><path d="M9.5 6.5L12 3l2.5 3.5-2.5 1.7z"/></svg>
        <span class="inv-lbl">Ring I</span><input type="text" data-bind="equip.ring1" placeholder=" ">
      </label>
      <label class="inv-slot" title="Ring">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="14" r="6"/><path d="M9.5 6.5L12 3l2.5 3.5-2.5 1.7z"/></svg>
        <span class="inv-lbl">Ring II</span><input type="text" data-bind="equip.ring2" placeholder=" ">
      </label>
      <label class="inv-slot" title="Boots, greaves…">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3v10l-4 5v3h14v-3l-6-5V3z"/><path d="M9 8h4"/></svg>
        <span class="inv-lbl">Boots</span><input type="text" data-bind="equip.boots" placeholder=" ">
      </label>
    </div>
    <div class="inv-def">
      <label class="fld"><span>Armor worn</span><select id="armorSel"></select></label>
      <div style="display:flex;gap:14px;flex-wrap:wrap">
        <label class="fld" style="flex:0 0 auto"><span>Armor magic +N</span><input type="number" id="armorMagic" style="width:70px"></label>
        <label class="fld" style="flex:1 1 auto"><span>Shield</span>
          <span style="display:flex;gap:10px;align-items:center">
            <input type="checkbox" id="shieldChk" style="width:auto"> <span style="color:var(--muted);font-size:.85rem">equipped (+2)</span>
            <input type="number" id="shieldMagic" style="width:60px" title="Shield magic +N">
          </span>
        </label>
      </div>
      <div class="fx-addrow" style="border-top:1px solid var(--border);padding-top:10px;margin-top:2px">
        <label style="display:flex;gap:8px;align-items:center;cursor:pointer">
          <input type="checkbox" id="acAutoChk" style="width:auto">
          <span style="font-family:'Cinzel',serif;font-size:.82rem;letter-spacing:1px;color:var(--muted)">COMPUTE AC FROM ARMOR</span>
        </label>
        <span class="bonus" id="hudAC" style="min-width:70px"></span>
        <span class="prep-note" id="hudACnote" style="margin:0"></span>
      </div>
    </div>
    </div>
  </div>
  <div class="panel eq-panel"><h2>Inventory</h2>
    <div class="eq-chips" id="eqTabs"></div>
    <div class="fx-addrow" style="margin:0 0 12px;position:relative">
      <div style="position:relative;flex:1 1 220px;max-width:300px">
        <input type="text" id="packSearch" dir="auto" style="width:100%" placeholder="Filter your pack…" autocomplete="off">
      </div>
      <button class="eq-newbtn eq-packbtn" id="eqIndexBtn" type="button">📖 Gear Index</button>
      <button class="eq-newbtn eq-packbtn" id="eqPackBtn" type="button">🎒 Starting Pack</button>
      <button class="eq-newbtn eq-packbtn" id="eqSelectBtn" type="button">☑ Select</button>
      <button class="eq-newbtn" id="eqNewItemBtn" type="button">+ New Item</button>
    </div>
    <div class="eq-bulkbar" id="eqBulkBar" style="display:none">
      <span id="eqBulkCount">0 selected</span>
      <span style="display:flex;gap:8px">
        <button class="eq-delbtn" id="eqBulkDeleteBtn" type="button">Delete selected</button>
        <button class="eq-packbtn eq-newbtn" id="eqBulkCancelBtn" type="button">Cancel</button>
      </span>
    </div>
    <div id="equipList" class="eq-list"></div>
    <div id="eqTreasure" style="display:none">
      <textarea data-bind="treasure" dir="auto" placeholder="Gems, art objects, deeds, favors owed, that suspicious idol..."></textarea>
    </div>
  </div>

  <div class="eq-backdrop" id="eqBackdrop"></div>
  <div class="eq-drawer" id="eqDrawer">
    <div class="eq-drawer-head">
      <h3 id="eqDrawerTitle">New Item</h3>
      <button class="eq-drawer-close" id="eqDrawerClose" type="button">✕</button>
    </div>
    <div class="eq-drawer-tabs">
      <button class="eq-dtab on" data-eqdtab="single" type="button">Single item</button>
      <button class="eq-dtab" data-eqdtab="bulk" type="button">Paste a list</button>
    </div>
    <div class="eq-drawer-body" id="eqSinglePane">
      <div class="eq-field big">
        <label>Name</label>
        <input type="text" id="eqName" dir="auto" placeholder="e.g. Potion of Healing, שריון שרשראות…">
      </div>
      <div class="eq-field">
        <label>Quantity</label>
        <div class="eq-qtyfield">
          <button type="button" id="eqQtyDown">−</button>
          <input type="text" id="eqQty" value="1" inputmode="numeric">
          <button type="button" id="eqQtyUp">+</button>
          <span>blank = not tracked (permanent gear)</span>
        </div>
      </div>
      <div class="eq-field">
        <label>Category</label>
        <div class="eq-catpick" id="eqCatPicker"></div>
      </div>
      <div class="eq-field">
        <label>Weight (lb) <span class="eq-optional">— optional, if you want to track encumbrance</span></label>
        <input type="number" id="eqWeight" placeholder="0" style="max-width:120px">
      </div>
      <div class="eq-field">
        <label>Notes / what it does</label>
        <textarea id="eqDesc" dir="auto" placeholder="Effect, quirks, where you got it…"></textarea>
      </div>
      <div class="eq-switchrow">
        <div><b>Usable on the Combat tab</b><span>Shows this item as a quick-use card mid-fight</span></div>
        <button type="button" class="eq-switch" id="eqCombatSwitch"></button>
      </div>
      <div class="eq-switchrow" id="eqAttuneRow" style="display:none">
        <div><b>Attuned</b><span>Counts toward your 3-item attunement limit</span></div>
        <button type="button" class="eq-switch" id="eqAttuneSwitch"></button>
      </div>
    </div>
    <div class="eq-drawer-body" id="eqBulkPane" style="display:none">
      <div class="eq-field" style="flex:1;display:flex;flex-direction:column">
        <label>One item per line</label>
        <textarea id="eqBulkText" dir="auto" class="eq-bulktext" style="flex:1" placeholder="3 Torches&#10;Rope, 50 ft&#10;בד קסם x2&#10;Bedroll"></textarea>
      </div>
      <p class="eq-bulkhint">A number at the start or end of a line becomes the quantity — the rest becomes the item name. Everything lands in the category selected above; you can re-sort after.</p>
    </div>
    <div class="eq-drawer-foot">
      <button class="eq-delbtn" id="eqDelBtn" type="button" style="display:none">Delete</button>
      <button class="eq-savebtn" id="eqSaveBtn" type="button">Add to pack</button>
    </div>
  </div>
  <div class="modal-bg" id="itemIndexModal">
    <div class="modal eq-index-modal">
      <button class="close-x" id="itemIndexClose" type="button">✕</button>
      <h2>Gear Index</h2>
      <input type="text" id="itemIndexSearch" dir="auto" placeholder="Search the gear index…" autocomplete="off">
      <div id="itemIndexList" class="eq-index-list"></div>
    </div>
  </div>
  <div class="modal-bg" id="packModal">
    <div class="modal eq-index-modal">
      <button class="close-x" id="packModalClose" type="button">✕</button>
      <h2>Starting Packs</h2>
      <input type="text" id="packModalSearch" dir="auto" placeholder="Search packs…" autocomplete="off">
      <div id="packModalList" class="eq-index-list"></div>
    </div>
  </div>
  <div class="eq-toast" id="eqToast"><span id="eqToastMsg"></span><button id="eqToastUndo" type="button" style="display:none">Undo</button></div>`,

features:`
  <div class="panel"><h2>Features &amp; Traits<button class="lock-toggle" id="featuresLockBtn"></button></h2>
    <div class="fx-addrow" id="featuresEditBar" style="margin:0 0 12px">
      <div style="position:relative;flex:0 0 300px">
        <input type="text" id="libSearch" style="width:100%" placeholder="+ Search class features &amp; feats…" autocomplete="off">
        <div id="libResults" class="lib-results"></div>
      </div>
      <div style="position:relative;flex:0 0 260px">
        <input type="text" id="raceSearch" style="width:100%" placeholder="+ Search race traits…" autocomplete="off">
        <div id="raceResults" class="lib-results"></div>
      </div>
      <div style="position:relative;flex:0 0 240px">
        <input type="text" id="backgroundSearch" style="width:100%" placeholder="+ Search background traits…" autocomplete="off">
        <div id="backgroundResults" class="lib-results"></div>
      </div>
      <button type="button" class="lib-scope" id="libScope" title="Narrow all three searches to what your class, subclass, heritage and background actually give you"></button>
      <span class="prep-note" style="margin:0">effects come pre-attached</span>
    </div>
    <div id="featureList"></div>
    <div class="fx-addrow" style="margin-top:0">
      <button class="add-btn" data-add="features" id="addFeatureBtn">+ Add feature</button>
      <button class="add-btn" id="addFeatBtn" title="For a DM-granted feat, or any feat not in the search above">+ Add custom feat</button>
    </div>
  </div>
  <div class="grid g2">
    <div class="panel"><h2>Other Proficiencies</h2>
      <div class="fx-addrow" style="margin:0 0 10px;position:relative">
        <input type="text" id="profSearch" style="flex:1 1 auto" placeholder="+ Search armor, weapon &amp; tool proficiencies…" autocomplete="off">
        <div id="profResults" class="lib-results"></div>
      </div>
      <div id="profChips"></div>
      <textarea data-bind="profLang" placeholder="Anything else — homebrew tools, specific weapon models, notes…" style="margin-top:10px"></textarea>
    </div>
    <div class="panel"><h2>Languages</h2>
      <div class="fx-addrow" style="margin:0 0 10px;position:relative">
        <input type="text" id="langSearch" style="flex:1 1 auto" placeholder="+ Search or type a language…" autocomplete="off">
        <div id="langResults" class="lib-results"></div>
      </div>
      <div id="langChips"></div>
    </div>
  </div>`,

character:`
  <div class="panel cp-dossier">
    <div class="cp-photo-col">
      <div class="cp-photo-mount">
        <div class="cp-photo-tape"></div>
        <div class="cp-photo-inner" id="cpPortraitImg">🎭</div>
      </div>
      <input type="file" id="cpPortraitFile" accept="image/*" style="display:none">
      <button type="button" class="cp-portrait-btn" id="cpPortraitBtn">Upload Portrait</button>
      <button type="button" class="cp-portrait-remove" id="cpPortraitRemove" style="display:none">Remove photo</button>
    </div>
    <div class="cp-id-fields">
      <h2>Identity</h2>
      <div class="grid g3">
        <label class="fld-paper"><span>Player Name</span><input type="text" data-bind="playerName"></label>
        <label class="fld-paper"><span>Faction / Organization</span><input type="text" data-bind="factionName"></label>
        <label class="fld-paper"><span>Age</span><input type="text" data-bind="age"></label>
        <label class="fld-paper"><span>Height</span><input type="text" data-bind="height"></label>
        <label class="fld-paper"><span>Weight</span><input type="text" data-bind="weight"></label>
        <label class="fld-paper"><span>Eyes</span><input type="text" data-bind="eyes"></label>
        <label class="fld-paper"><span>Skin</span><input type="text" data-bind="skin"></label>
        <label class="fld-paper"><span>Hair</span><input type="text" data-bind="hair"></label>
      </div>
    </div>
  </div>
  <div class="panel">
    <h2>Background</h2>
    <label class="fld"><span>Background</span>
      <select id="backgroundSelect">
        <option value="">— None —</option>
        ${BACKGROUND_ORDER.map(id=>`<option value="${id}">${esc(BACKGROUNDS[id].name)}</option>`).join('')}
      </select>
    </label>
    <p class="bg-info-text" id="backgroundInfo">Pick a background to see what it grants.</p>
    <button type="button" class="add-btn" id="bgGrantBtn" style="display:none">Grant Starting Gear &amp; Gold</button>
  </div>
  <div class="panel cp-ledger">
    <div class="ledger-row"><label>Personality Traits</label><textarea data-bind="personality" placeholder="How they walk into a room, speak, react under pressure…"></textarea></div>
    <div class="ledger-row"><label>Ideals</label><textarea data-bind="ideals" placeholder="What they believe in, live by, would die for…"></textarea></div>
    <div class="ledger-row"><label>Bonds</label><textarea data-bind="bonds" placeholder="People, places, or things they're tied to…"></textarea></div>
    <div class="ledger-row"><label>Flaws</label><textarea data-bind="flaws" placeholder="Vices, blind spots, the thing that keeps tripping them up…"></textarea></div>
    <div class="ledger-row"><label>Goals &amp; Motivations</label><textarea data-bind="goals" placeholder="What are they chasing? What would make all this worth it?"></textarea></div>
    <div class="ledger-row"><label>Fears &amp; Secrets</label><textarea data-bind="secrets" placeholder="What do they hide — from the party, or from themselves?"></textarea></div>
    <div class="ledger-row"><label>Allies &amp; Organizations</label><textarea data-bind="allies" placeholder="Contacts, patrons, rivals, debts owed either way…"></textarea></div>
  </div>
  <div class="panel cp-scroll" id="cpScroll"><h2>Backstory</h2>
    <div class="cp-scroll-body" id="cpScrollBody">
      <div class="cp-backstory-edit" id="cpBackstoryEdit" contenteditable="true" data-placeholder="Where they came from, what shaped them, how they ended up here…"></div>
      <div class="cp-scroll-fade"></div>
    </div>
    <div class="cp-scroll-foot">
      <span class="cp-scroll-count" id="cpWordCount"></span>
      <button type="button" class="cp-expand-btn" id="cpExpandBtn">⤢ Expand</button>
    </div>
  </div>`,

notes:`
  <div class="tl-toolbar">
    <input type="text" id="noteSearch" class="tl-search" placeholder="Search notes… (title, body, tags, session)" autocomplete="off">
    <div id="noteTagFilters" class="tl-filters"></div>
  </div>
  <div id="noteList" class="timeline"></div>
  <button class="add-btn" data-add="notes">+ New note</button>`
};

// ---------- Persistence (multi-character roster) ----------
// One character per localStorage key, plus a tiny index: {list:[ids], active:id, meta:{id:{t}}}.
// meta.t = last-played timestamp, so the select screen can sort by recency. The pre-roster
// single save (STORE_KEY) is adopted as the first roster entry on first boot — it is left in
// place untouched as a one-time backup, and never read again once the roster exists.
const ROSTER_KEY='dnd5e-binder-roster-v1';
const CHAR_PREFIX='dnd5e-binder-char-';
let ROSTER={list:[],active:null,meta:{}};
const charKey=id=>CHAR_PREFIX+id;
const newCharId=()=>'c'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
function saveRoster(){ try{ localStorage.setItem(ROSTER_KEY,JSON.stringify(ROSTER)); }catch(e){} }
function initRoster(){
  try{ const raw=localStorage.getItem(ROSTER_KEY); if(raw) ROSTER=Object.assign({list:[],active:null,meta:{}},JSON.parse(raw)); }
  catch(e){ ROSTER={list:[],active:null,meta:{}}; }
  ROSTER.list=(ROSTER.list||[]).filter(id=>localStorage.getItem(charKey(id))!=null);
  ROSTER.meta=ROSTER.meta||{};
  if(!ROSTER.list.length){
    // First boot on the roster system: adopt the legacy single save if there is one.
    const id=newCharId();
    const legacy=localStorage.getItem(STORE_KEY);
    try{ localStorage.setItem(charKey(id),legacy||JSON.stringify(defaultState())); }catch(e){}
    ROSTER.list=[id];
  }
  if(!ROSTER.list.includes(ROSTER.active)) ROSTER.active=ROSTER.list[0];
  saveRoster();
}
let saveTimer=null;
// Notes tab UI state (which tag filters are toggled on, current search text) — deliberately not
// part of S: it's a view over the notes, not data worth persisting per character.
let activeNoteFilters=new Set();
let noteSearchQuery='';
function saveNow(){
  try{
    localStorage.setItem(charKey(ROSTER.active),JSON.stringify(S));
    ROSTER.meta[ROSTER.active]={t:Date.now()}; saveRoster();
    const el=$('#saveStatus');
    el.textContent='saved'; el.classList.add('flash');
    setTimeout(()=>el.classList.remove('flash'),600);
  }catch(e){ $('#saveStatus').textContent='save failed'; }
}
function save(){
  clearTimeout(saveTimer);
  saveTimer=setTimeout(saveNow,350);
}
// Any pending debounced save must land in the OLD character's slot before S is replaced —
// switching mid-debounce would otherwise write hero A's sheet into hero B's key.
function flushSave(){ if(saveTimer){ clearTimeout(saveTimer); saveTimer=null; saveNow(); } }
function load(){
  try{
    const raw=localStorage.getItem(charKey(ROSTER.active));
    if(raw){ S=Object.assign(defaultState(),JSON.parse(raw)); }
    else S=defaultState();
  }catch(e){ /* corrupt data -> start fresh */ }
  migrateAttacks();
  migrateNotes();
  migrateBuild();
}
// Build overrides and feature auto-granting arrived after these characters were already written.
// A subclass typed before subclassClassId existed is adopted by the current class every load,
// so it isn't misread as "left over from a class you switched away from" and cleared.
//
// The rest runs once per sheet (buildMigrated pins it, so it survives export/import too) and
// settles two things an existing character can't answer for itself:
//  - Anything already different from what the class and heritage rules would hand you — a
//    hand-typed "90FT" darkvision, an extra save proficiency, a multiclass "Cleric 3 / Rogue 2" —
//    is recorded as a deliberate override instead of being normalised away the first time someone
//    taps the Build tab. applyBuild now writes speed/vision/race, which it partly didn't before,
//    so without this pass those edits would silently vanish on upgrade.
// Auto-granting needs no migration: it is off by default for everyone, new sheets included, so
// an existing Features tab is never touched until the player asks for it in Build ▸ Customize.
// A blank value is never claimed — an unfilled field is not an edit, and pinning "" would freeze
// the field empty forever. A non-blank one always is, even where the class grants nothing: slots
// on a non-casting class are either a deliberate Eldritch Knight or a leftover from a class the
// sheet used to be, and there's no telling which apart, so they're kept and flagged "custom" with
// a ↺ rather than silently deleted.
const bovBlank=v=>v===''||v==null||(Array.isArray(v)&&(!v.length||v.every(x=>!x)));
function migrateBuild(){
  if(!S.buildOverride||typeof S.buildOverride!=='object') S.buildOverride={};
  if(S.subclass && !S.subclassClassId) S.subclassClassId=S.classId;
  if(S.buildMigrated) return;
  S.buildMigrated=true;
  const authored=(S.features||[]).some(f=>(f.title||'').trim()||(f.desc||'').trim());
  if(!authored && !S.classId && !S.raceId) return; // brand-new sheet: nothing to preserve
  BUILD_FIELDS.forEach(f=>{
    if(!f.avail()) return;
    const cur=f.get();
    if(bovBlank(cur)) return;
    if(JSON.stringify(cur)!==JSON.stringify(f.rules())) S.buildOverride[f.key]=cur;
  });
}
// Notes predate tags/session (the Session Timeline layout) — backfill both on any older save
// so every note has a shape renderNotes() can rely on instead of scattering `||[]` everywhere.
function migrateNotes(){
  S.notes = (S.notes||[]).map(n=>({title:n.title||'',body:n.body||'',tags:n.tags||[],session:n.session||''}));
}
// Attacks have gone through a few shapes across rebuilds of this panel. Fold every earlier shape
// into today's unified one (weapon:'longsword'|'custom', die, dmgStat, buffs[]) on load, so
// nothing a player already typed in gets silently dropped just because the schema changed again.
function migrateAttacks(){
  // The weapon dropdown and the nickname field used to be separate, so a blank name relied on
  // the dropdown's own label to show what weapon it was. Now name is the only visible identity,
  // so any weapon-matched row with no name gets backfilled with the weapon's own name.
  S.attacks = (S.attacks||[]).map(a=>{
    if(a.weapon==='custom' || (a.weapon && WEAPONS[a.weapon] && a.die!==undefined && a.buffs!==undefined)){
      if(!a.name && WEAPONS[a.weapon]) a.name=WEAPONS[a.weapon].n;
      if(a.miscDmg===undefined) a.miscDmg=0; // introduced after this row's shape already existed
      return a; // already today's shape
    }
    if(a.weapon!==undefined && WEAPONS[a.weapon]){
      // v2 shape: smart weapon attack, damage riders instead of buffs (its "miscDmg" was a dice
      // string back then, not the numeric misc-damage field of today — fold it into a buff)
      const buffs=(a.riders||[]).map(r=>({name:'',dice:r.dice||'',flat:0,type:r.type||'',on:true}));
      if(a.miscDmg) buffs.push({name:'',dice:String(a.miscDmg).trim(),flat:0,type:'',on:true});
      return {name:a.name||WEAPONS[a.weapon].n,weapon:a.weapon,die:WEAPONS[a.weapon].d,dmgStat:'auto',
        magic:num(a.magic),miscAtk:num(a.miscAtk),miscDmg:0,rolled:'',buffs};
    }
    // v1 shape: fully freeform {name,bonus,dmg}. Bonus/damage were single strings that can't be
    // safely split into stat/magic/buffs automatically, so keep them visible as a legacy note
    // instead of guessing — the player can rebuild the row properly using the new fields.
    const legacyNote=[a.bonus,a.dmg].filter(Boolean).join(' · ');
    const dieMatch=/(\d*d\d+)/.exec(a.dmg||'');
    return {name:a.name||'Custom weapon',weapon:'custom',die:dieMatch?dieMatch[1]:'1d6',dmgStat:'none',dmgType:'',
      magic:0,miscAtk:0,miscDmg:0,rolled:'',buffs:[],legacyNote:legacyNote||undefined};
  });
}

// ---------- Build tabs & pages ----------
function buildShell(){
  $('#tabs').innerHTML = TABS.map(([id,label])=>
    `<button class="tab-btn" data-tab="${id}">${label}</button>`).join('');
  $('#pages').innerHTML = TABS.map(([id])=>
    `<section class="tab-page" id="page-${id}">${PAGES[id]}</section>`).join('');
  $$('.tab-btn').forEach(b=>b.addEventListener('click',()=>showTab(b.dataset.tab)));
}
function showTab(id){
  $$('.tab-btn').forEach(b=>b.classList.toggle('active',b.dataset.tab===id));
  $$('.tab-page').forEach(p=>p.classList.toggle('active',p.id==='page-'+id));
  // Textareas rendered while their tab was hidden measured scrollHeight 0, so auto-grow
  // clipped them to the minimum — remeasure everything the moment the tab is actually visible.
  $$('#page-'+id+' textarea').forEach(autoGrow);
  // Same "measured while hidden" trap as the autoGrow line above: the Backstory box's own
  // scrollHeight/clientHeight both read 0 while its tab was display:none, so the long-text fade
  // and Expand button never turned on for an already-long backstory until this re-check runs.
  if(id==='character') updateBackstoryMeta();
  if(id==='overview') renderOverview();
  // Title/description edits on the Features tab don't live-refresh this panel (typing shouldn't
  // yank focus mid-keystroke), so re-render it fresh whenever the Combat tab is opened — otherwise
  // a feature edited after its "Show in Combat" flag was set could show a stale row with no chevron.
  if(id==='combat') renderCombatFeatures();
}

// ---------- Data binding ----------
function bindAll(){
  $$('[data-bind]').forEach(el=>{
    if(el._bound) return; el._bound=true;
    if(el.tagName==='TEXTAREA') autoGrow(el);
    el.addEventListener('input',()=>{
      const val = el.type==='number' ? num(el.value) : el.value;
      setPath(S,el.dataset.bind,val);
      // Editing a build-derived field in its natural home — the header's Class & Level and Race,
      // the Overview vitals' Speed / Prof / Vision — takes it over from the class or heritage
      // default (see BUILD_FIELDS). Without this the value looked editable but the next tap on
      // the Build tab stamped the computed one straight back over it.
      if(buildField(el.dataset.bind)){ bovClaim(el.dataset.bind); renderBuildNote(); renderBuildCustom(); }
      syncBound(el.dataset.bind,el);
      if(el.tagName==='TEXTAREA') autoGrow(el);
      recalc(); save();
    });
  });
}
// Push state values into every bound element (skip the one being typed in)
function syncBound(path=null,skipEl=null){
  $$('[data-bind]').forEach(el=>{
    if(el===skipEl) return;
    if(path && el.dataset.bind!==path) return;
    const v=getPath(S,el.dataset.bind);
    if(el.value!==String(v??'')) el.value=v??'';
    if(el.tagName==='TEXTAREA') autoGrow(el);
  });
}

// ---------- Static component renderers ----------
const AB_ICON={str:'⚔',dex:'🏹',con:'🛡',int:'📖',wis:'👁',cha:'✦'};
const AB_COLOR={str:'#e0705a',dex:'#7dc26a',con:'#e0ab4a',int:'#5aa9e0',wis:'#a58ce0',cha:'#e06bb0'};
function renderAbilityCards(){
  $('#abilityCards').innerHTML = ABILITIES.map(([k,label])=>`
    <div class="ability ab-${k}">
      <div class="ability-icon">${AB_ICON[k]||''}</div>
      <div class="ability-name">${label}</div>
      <div class="mod" data-abmod="${k}">+0</div>
      <input type="number" data-bind="abilities.${k}" value="${S.abilities[k]}">
      <div class="ab-race" data-abrace="${k}"></div>
    </div>`).join('');
}
// Saving throws as six ability tiles — same elemental icon + color language as the ability
// cards, so a save reads as "that ability, defending". The whole tile is the tap target.
// Rendered into both the Skills tab's full list and Overview's compact mirror — same tiles, same
// data-save/data-savebonus wiring, two homes (see combatHudHTML for the same pattern on Combat).
function renderSaves(){
  const html = ABILITIES.map(([k,label])=>{
    const srcs=allFx().filter(x=>x.t==='save'&&x.ab===k).map(x=>x.src);
    const granted=srcs.length>0&&!S.saveProf[k];
    const cls=S.saveProf[k]?'on':granted?'grant':'';
    const tag=S.saveProf[k]?'proficient':granted?`✦ ${esc(srcs.join(', '))}`:'&nbsp;';
    return `
    <button class="save-tile ${cls}" data-save="${k}" style="--ab-color:${AB_COLOR[k]};--ab-glow:${AB_COLOR[k]}40"
      title="${granted?'Proficiency granted by: '+esc(srcs.join(', '))+' — already counted':'Tap to toggle save proficiency'}">
      <span class="save-icon">${AB_ICON[k]||''}</span>
      <span class="save-name">${label}</span>
      <span class="save-bonus" data-savebonus="${k}">+0</span>
      <span class="save-tag">${tag}</span>
    </button>`;}).join('');
  $$('#saveList, #ovSaves').forEach(el=>el.innerHTML=html);
  $$('[data-save]').forEach(b=>b.addEventListener('click',()=>{
    S.saveProf[b.dataset.save]=!S.saveProf[b.dataset.save];
    // Toggling a save by hand takes the field over from the class default — otherwise the next
    // tap on the Build tab would stamp c.saves straight back over it. ↺ in Build ▸ Customize
    // hands it back to the class.
    bovClaim('saves');
    renderSaves(); renderBuildNote(); renderBuildCustom(); recalc(); save();
  }));
}
// Terse feature badges for a skill — permanent grants (✦, green) and situational reminders
// (★, gold, tap to unfold the "when" condition). Shared by the Skills tab's own rows and
// Overview's Trained Skills chips, so a reminder is never visible in one place and silently
// missing from the other.
function skillBadgesHTML(k,ab){
  const man=S.skills[k], g=fxSkillGrant(k);
  const badges=[];
  if(g>man){
    const srcs=allFx().filter(x=>x.t==='skill'&&xSkills(x).includes(k)).map(x=>x.src).join(', ');
    badges.push(`<span class="sk-fx perm">✦ ${esc(srcs)}<span class="sk-tip">Always active — already counted in the bonus</span></span>`);
  }
  if(k==='stealth'){
    const a=ARMORS[(S.equip||{}).armor]||ARMORS.none;
    if(a.sd) badges.push(`<span class="sk-fx warn">⚠ Disadvantage<span class="sk-tip">${esc(a.n.split(' (')[0])} imposes disadvantage on Stealth</span></span>`);
  }
  fxNotes(k).forEach(n=>{
    const b=noteBadge(k,ab,n);
    if(b==null) return; // effect makes no difference here (e.g. already at expertise) — nothing to show
    const tip=n.cond?`<span class="sk-tip">${esc(n.cond)}</span>`:'';
    badges.push(`<span class="sk-fx" data-notemath="${k}">★ ${esc(n.src)} <b>${esc(b)}</b>${tip}</span>`);
  });
  return badges.join('');
}
// Overview's effect summary — same underlying data as skillBadgesHTML above, but written as
// plain always-visible text on the skill's own line ("+3 or +6 if ★ Natural Explorer (in
// favored terrain)") instead of tap-to-open pills. The Skills tab keeps the pill/tooltip version;
// this one is for the Trained Skills card, where the point is reading everything at a glance,
// with nothing needing a tap to reveal.
function skillInlineFxHTML(k,ab){
  const man=S.skills[k], g=fxSkillGrant(k);
  const parts=[];
  if(g>man){
    const srcs=allFx().filter(x=>x.t==='skill'&&xSkills(x).includes(k)).map(x=>x.src).join(', ');
    parts.push(`<span class="ov-fx-in perm">✦ ${esc(srcs)}</span>`);
  }
  if(k==='stealth'){
    const a=ARMORS[(S.equip||{}).armor]||ARMORS.none;
    if(a.sd) parts.push(`<span class="ov-fx-in warn">⚠ Disadvantage <i>(${esc(a.n.split(' (')[0])})</i></span>`);
  }
  fxNotes(k).forEach(n=>{
    const b=noteBadge(k,ab,n);
    if(b==null) return;
    const cond=n.cond?` <i>(${esc(n.cond)})</i>`:'';
    parts.push(`<span class="ov-fx-in note">or <b>${esc(b)}</b> if ${esc(n.src)}${cond}</span>`);
  });
  return parts.join('<span class="ov-fx-sep">;</span> ');
}
function renderSkills(){
  // Grouped by ability score (STR, DEX, CON, INT, WIS, CHA) — matches the paper sheet's layout
  // and reads cleaner than one long A-Z list. The ability is shown once per group header instead
  // of repeated on every row, which also frees up room.
  $('#skillList').innerHTML = ABILITIES.filter(([abKey])=>SKILLS.some(([,,ab])=>ab===abKey)).map(([abKey,abLabel])=>{
    const rows = SKILLS.filter(([,,ab])=>ab===abKey).map(([k,label])=>{
      const man=S.skills[k], g=fxSkillGrant(k);
      // dot shows your manual choice; if a feature grants more, it fills green instead
      let dotCls=man===1?'on':man===2?'exp':'';
      let dotTitle='Tap: proficiency → expertise → none';
      if(g>man){ dotCls='grant'+(g===2?' expg':''); dotTitle='Granted by a feature — tap to set manually'; }
      // terse feature badges, on their own second line under the row. Hovering rises a small
      // animated tooltip with just the "when" condition (e.g. "in favored terrain") — kept short.
      const badges=skillBadgesHTML(k,abKey);
      return `
      <div class="skill-item">
        <div class="skill-row">
          <button class="dot ${dotCls}" data-skill="${k}" title="${dotTitle}"></button>
          <span class="bonus" data-skillbonus="${k}">+0</span>
          <span class="sk-name">${label}</span>
        </div>
        ${badges?`<div class="skill-fx-row">${badges}</div>`:''}
      </div>`;
    }).join('');
    return `<div class="skill-group ab-${abKey}"><div class="skill-group-head"><span class="sgh-icon">${AB_ICON[abKey]||''}</span>${abLabel}</div>${rows}</div>`;
  }).join('');
  $$('[data-skill]').forEach(b=>b.addEventListener('click',()=>{
    const k=b.dataset.skill;
    S.skills[k]=(S.skills[k]+1)%3;
    renderSkills(); recalc(); save();
  }));
}
function renderDeathSaves(){
  const make=(arr,cls)=>arr.map((on,i)=>
    `<button class="ds-dot ${cls} ${on?'on':''}" data-ds="${cls}${i}"></button>`).join(' ');
  $('#dsS').innerHTML=make(S.deathS,'s');
  $('#dsF').innerHTML=make(S.deathF,'f');
  $$('[data-ds]').forEach(b=>b.addEventListener('click',()=>{
    const cls=b.dataset.ds[0], i=+b.dataset.ds[1];
    const arr=cls==='s'?S.deathS:S.deathF;
    arr[i]=!arr[i]; b.classList.toggle('on'); save();
  }));
}

// ---------- Dynamic list renderers ----------
function buffPill(a,i,b,j){
  const c=DMG_COLOR[b.type]||'';
  return `
  <span class="buff-pill ${b.on?'on':''}" ${c?`style="--rider-c:${c}"`:''}>
    <input type="checkbox" ${b.on?'checked':''} data-buffon="${i}.${j}" title="Active this turn">
    ${b.conc?`<span class="buff-conc" title="Requires concentration">◉C</span>`:''}
    <input type="text" class="buff-name" value="${esc(b.name)}" placeholder="Buff name" data-buffname="${i}.${j}">
    <input type="text" class="buff-dice" value="${esc(b.dice)}" placeholder="dice" data-buffdice="${i}.${j}" title="Dice reminder — fold this into your physical roll">
    <input type="number" class="buff-flat" value="${num(b.flat)}" data-buffflat="${i}.${j}" title="Flat bonus — added automatically">
    <select data-bufftype="${i}.${j}">${DMG_TYPES.map(([v,l])=>`<option value="${v}" ${b.type===v?'selected':''}>${l}</option>`).join('')}</select>
    <button class="rider-del" data-buffdel="${i}.${j}" title="Remove this buff">✕</button>
  </span>`;
}
// Themed weapon search — same searchable-dropdown pattern as the Features/Races/Languages
// pickers (.lib-results), instead of the browser's own unstyled <datalist> popup.
function renderWeaponResults(i){
  const panel=$(`[data-wresults="${i}"]`); if(!panel) return;
  const a=S.attacks[i]; if(!a) return;
  const q=(a.name||'').trim().toLowerCase();
  const items=Object.entries(WEAPONS).filter(([,w])=>!q||w.n.toLowerCase().includes(q));
  if(!items.length){ panel.innerHTML='<div class="empty">No matches — this will be a custom weapon</div>'; return; }
  const grp=(label,list)=>!list.length?'':`<div class="grp">${label}</div>`+
    list.map(([id,w])=>`<div class="item" data-wpick="${i}.${id}">${esc(w.n)}</div>`).join('');
  panel.innerHTML = grp('Melee',items.filter(([,w])=>!w.rng)) + grp('Ranged',items.filter(([,w])=>w.rng));
}
// Cards default collapsed — a glance-only strip (name, Hit, Damage, roll → Final) is what you
// actually need mid-fight; full editing (stat/die/type, misc bonuses, buffs, notes) is one tap
// away instead of permanently taking up floor space. A brand-new, still-unnamed attack always
// opens automatically — nothing to glance at yet, only something to configure.
const ATK_OPEN=new Set();
function refocusNameInput(i,cursor){
  const el=$(`[data-nameinput="${i}"]`); if(!el) return;
  el.focus();
  try{ el.setSelectionRange(cursor,cursor); }catch(e){}
}
function attackRowHTML(a,i){
  const c=atkSummary(a);
  const isCustom=a.weapon==='custom'||!WEAPONS[a.weapon];
  const icon=isCustom?'✏':(c.w&&c.w.rng?'🏹':'⚔');
  const open=ATK_OPEN.has(i)||!(a.name||'').trim();
  const roll=`
    <div class="atk-roll">
      <input type="number" value="${esc(a.rolled)}" placeholder="roll" data-rolled="${i}" title="What you rolled on the weapon's damage dice">
      ${(a.buffs||[]).map((b,j)=>({b,j})).filter(({b})=>b.on&&(b.dice||'').trim()).map(({b,j})=>`
      <span class="atk-plus">+</span>
      <input type="number" class="atk-buffroll" value="${esc(b.rolled)}" placeholder="${esc(b.dice)}" data-buffrolled="${i}.${j}" title="What you rolled on ${esc(b.name||'this buff')}'s ${esc(b.dice)} damage dice">`).join('')}
      <span class="atk-eq">=</span>
      <span class="atk-final" data-atkfinal="${i}">${c.finalDamage!=null?c.finalDamage:'—'}</span>
    </div>`;
  if(!open){
    return `
    <div class="atk-card atk-collapsed">
      <div class="atk-mini-head" data-atkopen="${i}" title="Tap for full editing">
        <span class="atk-icon">${icon}</span>
        <span class="atk-mini-name">${esc(a.name)}</span>
        <span class="atk-mini-hit"><span class="atk-label">Hit</span><span class="big" data-atkview="${i}">${c.bonus}</span></span>
        <span class="atk-mini-dmg"><span class="atk-label">Damage</span><span class="atk-formula" data-atkdmg="${i}">${c.dmg}</span></span>
        <span class="atk-chevron">▸</span>
      </div>
      ${roll}
      <button class="del-btn" data-del="attacks.${i}" title="Remove this attack">✕</button>
    </div>`;
  }
  const statOpts=ATK_STATS.map(([v,l])=>`<option value="${v}" ${(a.dmgStat||'auto')===v?'selected':''}>${l}</option>`).join('');
  const buffs=a.buffs||[];
  return `
  <div class="atk-card atk-open">
  <div class="atk-row">
    <button class="atk-collapse" data-atkopen="${i}" title="Collapse to a summary strip">▾</button>
    <span class="atk-icon" title="${isCustom?'Custom weapon':(c.w&&c.w.rng?'Ranged weapon':'Melee weapon')}">${icon}</span>
    <div class="atk-id">
      <input type="text" class="atk-combo" autocomplete="off" value="${esc(a.name)}" data-nameinput="${i}"
        placeholder="Weapon name — pick one or type your own" title="Pick a built-in weapon or type any name — either way this becomes the attack's name">
      <div class="lib-results atk-weapon-results" data-wresults="${i}"></div>
      <div class="atk-config">
        <span class="cfg-pair"><span class="cfg-lbl">🧬 Stat</span>
          <select class="atk-stat-sel" data-ssel="${i}" title="Which ability governs this attack's to-hit and damage">${statOpts}</select></span>
        <span class="cfg-pair"><span class="cfg-lbl">🎲 Die</span>
          <input type="text" class="atk-die" value="${esc(c.die)}" data-diein="${i}" placeholder="1d8" title="Damage die — type any notation, e.g. 2d6"></span>
        ${isCustom?`<span class="cfg-pair"><span class="cfg-lbl">💥 Type</span>
          <select class="atk-dtype-sel" data-dtsel="${i}" title="Damage type">${DMG_TYPES.map(([v,l])=>`<option value="${v}" ${(a.dmgType||'')===v?'selected':''}>${l}</option>`).join('')}</select></span>`:''}
        <span class="cfg-pair"><span class="cfg-lbl">✨ Magic</span>
          <input type="number" class="atk-tiny" value="${num(a.magic)}" data-wnum="attacks.${i}.magic" title="Magic +N — a magic weapon's bonus, added to BOTH to-hit and damage"></span>
        <span class="cfg-pair"><span class="cfg-lbl">± Atk misc</span>
          <input type="number" class="atk-tiny" value="${num(a.miscAtk)}" data-wnum="attacks.${i}.miscAtk" title="Misc to-hit ONLY — bless, fighting styles, DM boosts that don't touch damage"></span>
        <span class="cfg-pair"><span class="cfg-lbl">± Dmg misc</span>
          <input type="number" class="atk-tiny" value="${num(a.miscDmg)}" data-wnum="attacks.${i}.miscDmg" title="Misc damage ONLY — DM boosts, dueling/great-weapon fighting style, that don't touch to-hit"></span>
      </div>
    </div>
    <div class="atk-hit">
      <span class="atk-label">Hit</span>
      <span class="big" data-atkview="${i}">${c.bonus}</span>
      <span class="atk-breakdown" data-atkbreak="${i}">${c.breakdown}</span>
    </div>
    <div class="atk-dmg">
      <span class="atk-label">Damage</span>
      <span class="atk-formula" data-atkdmg="${i}">${c.dmg}</span>
      <span class="atk-breakdown" data-atkdmgbreak="${i}">${c.dmgBreakdown}</span>
      ${roll}
    </div>
    <button class="del-btn" data-del="attacks.${i}" title="Remove this attack">✕</button>
  </div>
  ${a.legacyNote?`<span class="atk-legacy">Converted from an older version — was: ${esc(a.legacyNote)}. Rebuild it with the fields above.</span>`:''}
  <div class="buff-row">
    ${buffs.map((b,j)=>buffPill(a,i,b,j)).join('')}
    <select class="add-btn" data-bpreset="${i}">
      <option value="">+ Add buff…</option>
      ${BUFF_PRESETS.map((p,k)=>`<option value="${k}">${p.n}${p.conc?' ◉C':''}</option>`).join('')}
      <option value="custom">✏ Custom buff…</option>
    </select>
  </div>
  <textarea class="atk-note" data-li="attacks.${i}.note" placeholder="✎ notes — reach, thrown 20/60, silvered, two-handed, or anything else worth writing down…">${esc(a.note||'')}</textarea>
  </div>`;
}
function renderAttacks(){
  $('#attackList').innerHTML = S.attacks.map((a,i)=>attackRowHTML(a,i)).join('');
  wireList('#attackList');
  $$('[data-atkopen]').forEach(el=>el.addEventListener('click',()=>{
    const i=+el.dataset.atkopen;
    ATK_OPEN.has(i)?ATK_OPEN.delete(i):ATK_OPEN.add(i);
    renderAttacks();
  }));
  // Selects & structural changes (add/remove/toggle) re-render fully — cheap for a handful of
  // rows and none of these are continuous-typing fields, so there's no focus to preserve.
  // The combo field is both the weapon picker and the name: typing a name that exactly matches
  // a built-in weapon (usually by picking it from the themed search dropdown below) locks in
  // that weapon's die/stat; anything else is treated as a custom weapon. Re-render only happens
  // on that transition, not on every keystroke of a custom name, so typing doesn't lose focus.
  $$('[data-nameinput]').forEach(inp=>{
    inp.addEventListener('focus',()=>{
      renderWeaponResults(+inp.dataset.nameinput);
      inp.nextElementSibling.classList.add('open');
    });
    inp.addEventListener('input',()=>{
      const i=+inp.dataset.nameinput, a=S.attacks[i];
      a.name=inp.value;
      // A card only shows this field while open — either explicitly (ATK_OPEN) or because it's
      // still unnamed. The moment typing gives it a name, that second reason stops applying, so
      // without this, a re-render triggered mid-keystroke (below) would collapse the card out
      // from under the cursor. Mark it explicitly open for as long as you're typing in it.
      ATK_OPEN.add(i);
      renderWeaponResults(i);
      inp.nextElementSibling.classList.add('open');
      const norm=inp.value.trim().toLowerCase();
      const matchId=Object.keys(WEAPONS).find(id=>WEAPONS[id].n.toLowerCase()===norm);
      // Locking in / dropping a built-in weapon changes the die + stat select, which forces a
      // full re-render — that swaps in a fresh <input>, so refocus it (cursor where it was) or
      // every keystroke that crosses this boundary would silently eat the next one.
      const cursor=inp.selectionStart;
      if(matchId && a.weapon!==matchId){
        a.weapon=matchId; a.die=WEAPONS[matchId].d; a.dmgStat='auto';
        renderAttacks(); save(); refocusNameInput(i,cursor); return;
      }
      if(!matchId && a.weapon!=='custom'){
        a.weapon='custom';
        renderAttacks(); save(); refocusNameInput(i,cursor); return;
      }
      save();
    });
  });
  $$('[data-wresults]').forEach(panel=>panel.addEventListener('click',e=>{
    const item=e.target.closest('[data-wpick]'); if(!item) return;
    const [i,id]=item.dataset.wpick.split('.');
    const a=S.attacks[+i], w=WEAPONS[id];
    a.name=w.n; a.weapon=id; a.die=w.d; a.dmgStat='auto';
    renderAttacks(); save();
  }));
  $$('[data-diein]').forEach(inp=>inp.addEventListener('input',()=>{
    S.attacks[+inp.dataset.diein].die=inp.value; recalc(); save();
  }));
  $$('[data-ssel]').forEach(s=>s.addEventListener('change',()=>{
    S.attacks[+s.dataset.ssel].dmgStat=s.value; recalc(); save();
  }));
  $$('[data-dtsel]').forEach(s=>s.addEventListener('change',()=>{
    S.attacks[+s.dataset.dtsel].dmgType=s.value; recalc(); save();
  }));
  $$('[data-wnum]').forEach(inp=>inp.addEventListener('input',()=>{
    setPath(S,inp.dataset.wnum,num(inp.value)); recalc(); save();
  }));
  $$('[data-rolled]').forEach(inp=>inp.addEventListener('input',()=>{
    S.attacks[+inp.dataset.rolled].rolled=inp.value; recalc(); save();
  }));
  // Each active buff with dice gets its own roll input next to the weapon's, summed straight
  // into Final — same live-recalc-without-re-render treatment as the weapon roll above.
  $$('[data-buffrolled]').forEach(inp=>inp.addEventListener('input',()=>{
    const [i,j]=inp.dataset.buffrolled.split('.').map(Number);
    S.attacks[i].buffs[j].rolled=inp.value; recalc(); save();
  }));
  // Buff pills: name/dice/flat text just recalculate (keeps focus while typing); everything
  // else (toggle, type, add, remove) re-renders since it changes the pill's shape or color.
  $$('[data-buffname]').forEach(inp=>inp.addEventListener('input',()=>{
    const [i,j]=inp.dataset.buffname.split('.').map(Number);
    S.attacks[i].buffs[j].name=inp.value; save();
  }));
  $$('[data-buffdice]').forEach(inp=>{
    inp.addEventListener('input',()=>{
      const [i,j]=inp.dataset.buffdice.split('.').map(Number);
      S.attacks[i].buffs[j].dice=inp.value; recalc(); save();
    });
    // Typing doesn't re-render (keeps focus), but leaving the field does — that's what shows or
    // hides this buff's damage-roll input in the Damage box once dice goes empty <-> non-empty.
    inp.addEventListener('blur',()=>renderAttacks());
  });
  $$('[data-buffflat]').forEach(inp=>inp.addEventListener('input',()=>{
    const [i,j]=inp.dataset.buffflat.split('.').map(Number);
    S.attacks[i].buffs[j].flat=num(inp.value); recalc(); save();
  }));
  $$('[data-bufftype]').forEach(sel=>sel.addEventListener('change',()=>{
    const [i,j]=sel.dataset.bufftype.split('.').map(Number);
    S.attacks[i].buffs[j].type=sel.value; renderAttacks(); save();
  }));
  $$('[data-buffon]').forEach(cb=>cb.addEventListener('change',()=>{
    const [i,j]=cb.dataset.buffon.split('.').map(Number);
    S.attacks[i].buffs[j].on=cb.checked; renderAttacks(); save();
  }));
  $$('[data-buffdel]').forEach(b=>b.addEventListener('click',()=>{
    const [i,j]=b.dataset.buffdel.split('.').map(Number);
    S.attacks[i].buffs.splice(j,1); renderAttacks(); save();
  }));
  // One dropdown covers both quick-add presets and a blank custom buff (last option) — no
  // second button needed for the same action.
  $$('[data-bpreset]').forEach(s=>s.addEventListener('change',()=>{
    if(s.value==='') return;
    const i=+s.dataset.bpreset;
    const buff = s.value==='custom' ? {name:'',dice:'',flat:0,type:'',on:true,rolled:''} : {...BUFF_PRESETS[+s.value],on:true,rolled:''};
    (S.attacks[i].buffs=S.attacks[i].buffs||[]).push(buff);
    renderAttacks(); save();
  }));
}
// Closes a weapon search dropdown when the player clicks anywhere outside it. Wired once at
// boot (not per-render) since it's a single delegated listener on the whole document.
function wireWeaponSearch(){
  document.addEventListener('click',e=>{
    if(e.target.closest('.atk-combo') || e.target.closest('.atk-weapon-results')) return;
    $$('.atk-weapon-results.open').forEach(p=>p.classList.remove('open'));
  });
}
// Icons for the six gear categories (plus treasure) — same stroke-line language as the
// Equipped & Defense slot icons above.
const EQ_ICONS={
  C:'<path d="M10 3h4"/><path d="M11 3v5.2l-4.3 8A3 3 0 0 0 9.4 21h5.2a3 3 0 0 0 2.7-4.8L13 8.2V3"/><path d="M9 14h6"/>',
  A:'<path d="M4 20L20 4"/><path d="M13 4h7v7"/>',
  M:'<path d="M12 3l1.9 5.3L19 10l-5.1 1.7L12 17l-1.9-5.3L5 10l5.1-1.7z"/>',
  S:'<path d="M5 6a2 2 0 1 1 4 0v12a2 2 0 1 1-4 0z"/><path d="M9 6h8a2 2 0 0 1 2 2"/><path d="M9 18h8a2 2 0 0 0 2-2"/>',
  T:'<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.8 2.8-2-2z"/>',
  G:'<path d="M7 9V7a5 5 0 0 1 10 0v2"/><rect x="5" y="9" width="14" height="12" rx="3"/><path d="M9 13h6"/>',
  TR:'<path d="M6 9l6-6 6 6-6 12z"/><path d="M6 9h12"/><path d="M9 9l3 12 3-12"/>'
};
function eqIcon(ty){ return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${EQ_ICONS[ty]||''}</svg>`; }
// One color per gear category — a quick-scan cue on each pack card (a left-edge fade, plus the
// category label itself) so the eye can sort potions from scrolls from gear without reading text.
const ITEM_TYPE_COLOR={C:'#7dc26a',A:'#c98a4b',M:'#a58ce0',S:'#5aa9e0',T:'#e0705a',G:'#8a94a3'};

// Card list + a spacious add/edit drawer: the pack itself only ever shows name, qty, category
// and flags at a glance — every other field (description, weight, combat/attune) lives in the
// drawer so entering a lot of gear doesn't mean fighting six cramped inline controls per row.
function renderEquipment(){
  const list=$('#equipList'); if(!list) return;
  S.equipment=S.equipment||[];
  // backfill rows saved before items had types
  S.equipment.forEach(e=>{ if(e.type==null)e.type=(ITEM_TYPES[S.eqTab]?S.eqTab:'G'); if(e.desc==null)e.desc=''; if(e.combat==null)e.combat=false; if(e.att==null)e.att=false; });
  const order=Object.keys(ITEM_TYPES);
  const present=S.equipment.filter(e=>(e.name||'').trim()||String(e.qty||'').trim());

  if(!S.eqTab) S.eqTab='ALL';
  const counts=Object.fromEntries(order.map(ty=>[ty,present.filter(e=>e.type===ty).length]));
  const chips=[['ALL','All',present.length,null],...order.map(ty=>[ty,ITEM_TYPES[ty][1],counts[ty],ty]),['TR','Treasure',null,'TR']];
  $('#eqTabs').innerHTML=chips.map(([id,label,n,ic])=>
    `<button class="eq-chip ${S.eqTab===id?'on':''}" data-eqtab="${id}">${ic?eqIcon(ic):''}${label}${n?` <b>${n}</b>`:''}</button>`).join('');
  $$('[data-eqtab]').forEach(b=>b.addEventListener('click',()=>{
    S.eqTab=b.dataset.eqtab;
    renderEquipment(); save();
  }));

  const treasure=S.eqTab==='TR';
  $('#eqTreasure').style.display=treasure?'':'none';
  $('#eqNewItemBtn').closest('.fx-addrow').style.display=treasure?'none':'';
  list.style.display=treasure?'none':'';
  $('#eqSelectBtn').style.display=treasure?'none':'';
  if(treasure){
    if(EQ_SELECT_MODE){ EQ_SELECT_MODE=false; EQ_SELECTED.clear(); }
    $('#eqBulkBar').style.display='none';
    const ta=$('#eqTreasure textarea'); if(ta) autoGrow(ta); return;
  }

  const base=(S.eqTab==='ALL'?present:present.filter(e=>e.type===S.eqTab));
  const q=EQ_SEARCH_Q.trim().toLowerCase();
  const filtered=q?base.filter(e=>(e.name||'').toLowerCase().includes(q)||(e.desc||'').toLowerCase().includes(q)):base;
  const rows=filtered.map(e=>({e,i:S.equipment.indexOf(e)}));
  // Prune selections that scrolled out of existence (item deleted elsewhere)
  if(EQ_SELECTED.size) [...EQ_SELECTED].forEach(i=>{ if(i>=S.equipment.length) EQ_SELECTED.delete(i); });
  $('#eqSelectBtn').textContent = EQ_SELECT_MODE ? '✕ Cancel select' : '☑ Select';
  $('#eqSelectBtn').classList.toggle('on', EQ_SELECT_MODE);
  $('#eqBulkBar').style.display = EQ_SELECT_MODE ? 'flex' : 'none';
  $('#eqBulkCount').textContent = `${EQ_SELECTED.size} selected`;
  $('#eqBulkDeleteBtn').disabled = EQ_SELECTED.size===0;
  list.innerHTML = rows.length ? rows.map(({e,i})=>{
    const cat=ITEM_TYPES[e.type]||ITEM_TYPES.G;
    let flags='';
    if(e.combat) flags+='<span class="eq-flag combat">⚔ Combat</span>';
    if(e.att) flags+='<span class="eq-flag attune">✦ Attuned</span>';
    const picked=EQ_SELECTED.has(i);
    const catColor=ITEM_TYPE_COLOR[e.type]||ITEM_TYPE_COLOR.G;
    return `<div class="eq-card ${EQ_SELECT_MODE?'selectable':''} ${picked?'selected':''}" data-eqopen="${i}" style="--cat:${catColor}">
      ${EQ_SELECT_MODE ? `<label class="eq-select-check"><input type="checkbox" ${picked?'checked':''} tabindex="-1"></label>` : `
      <div class="eq-qtystep">
        <button type="button" data-eqstep="-1" data-i="${i}">−</button>
        <div class="eq-medal">${String(e.qty||'').trim()!==''?esc(e.qty):'—'}</div>
        <button type="button" data-eqstep="1" data-i="${i}">+</button>
      </div>`}
      <div class="eq-card-body">
        <div class="eq-card-name">${esc(e.name)||'<span style="color:var(--faint)">Unnamed item</span>'}</div>
        <div class="eq-card-meta"><span class="eq-card-cat">${eqIcon(e.type)}${cat[1]}</span>${flags}</div>
        ${e.desc?`<div class="eq-card-desc">${esc(e.desc)}</div>`:''}
      </div>
      ${EQ_SELECT_MODE?'':'<span class="eq-chev">›</span>'}
    </div>`;
  }).join('') : `<p class="prep-note" style="margin:0">${q?`No items in your pack match “${esc(EQ_SEARCH_Q.trim())}”.`:(S.eqTab==='ALL'?'Empty pack — search the gear index above or “+ New Item” for a custom one.':`No ${ITEM_TYPES[S.eqTab][1].toLowerCase()} yet — “+ New Item” creates one right in this category.`)}</p>`;

  $$('[data-eqopen]').forEach(card=>card.addEventListener('click',e=>{
    if(e.target.closest('[data-eqstep]')) return;
    const i=+card.dataset.eqopen;
    if(EQ_SELECT_MODE){
      if(EQ_SELECTED.has(i)) EQ_SELECTED.delete(i); else EQ_SELECTED.add(i);
      renderEquipment();
      return;
    }
    openEqDrawer(i);
  }));
  $$('[data-eqstep]').forEach(b=>b.addEventListener('click',e=>{
    e.stopPropagation();
    const it=S.equipment[+b.dataset.i], delta=+b.dataset.eqstep;
    if(String(it.qty||'').trim()===''){ if(delta>0) it.qty='1'; }
    else it.qty=String(Math.max(0,num(it.qty)+delta));
    renderEquipment(); save();
  }));
  if($('#ckCards')) renderCockpitCards(); // combat item cards mirror qty/flag changes
}

// ---------- Item drawer (add / edit one item, or paste a whole list) ----------
let EQ_DRAWER_MODE='single';
let EQ_EDIT_IDX=null; // null while adding a new item
let EQ_SEARCH_Q=''; // live filter over the pack list — separate from the gear-index dropdown
let EQ_SELECT_MODE=false; // multi-select for bulk delete
let EQ_SELECTED=new Set(); // indices into S.equipment
function eqCatPickerHTML(selected){
  return Object.keys(ITEM_TYPES).map(ty=>
    `<button type="button" class="eq-catopt ${ty===selected?'on':''}" data-eqcat="${ty}">${eqIcon(ty)}${ITEM_TYPES[ty][1]}</button>`
  ).join('');
}
function eqSwitchSet(el,on){ el.classList.toggle('on',!!on); el.dataset.on=on?'1':''; }
function eqSwitchOn(el){ return !!el.dataset.on; }
function openEqDrawer(idx){
  EQ_EDIT_IDX = idx==null ? null : idx;
  const it = EQ_EDIT_IDX==null ? null : S.equipment[EQ_EDIT_IDX];
  $('#eqDrawerTitle').textContent = it ? 'Edit Item' : 'New Item';
  $('#eqName').value = it ? it.name : '';
  $('#eqQty').value = it ? it.qty : '1';
  $('#eqWeight').value = it && it.wt ? it.wt : '';
  $('#eqDesc').value = it ? it.desc : '';
  const cat = it ? it.type : (ITEM_TYPES[S.eqTab] ? S.eqTab : 'G');
  $('#eqCatPicker').innerHTML = eqCatPickerHTML(cat);
  $$('[data-eqcat]').forEach(b=>b.addEventListener('click',()=>{
    $$('[data-eqcat]').forEach(o=>o.classList.remove('on'));
    b.classList.add('on');
    $('#eqAttuneRow').style.display = b.dataset.eqcat==='M' ? 'flex' : 'none';
  }));
  $('#eqAttuneRow').style.display = cat==='M' ? 'flex' : 'none';
  eqSwitchSet($('#eqCombatSwitch'), it ? it.combat : false);
  eqSwitchSet($('#eqAttuneSwitch'), it ? it.att : false);
  eqSwitchDrawerTab('single');
  $('#eqBackdrop').classList.add('open');
  $('#eqDrawer').classList.add('open');
  setTimeout(()=>$('#eqName').focus(),200);
}
function closeEqDrawer(){
  $('#eqBackdrop').classList.remove('open');
  $('#eqDrawer').classList.remove('open');
}
function eqSwitchDrawerTab(mode){
  EQ_DRAWER_MODE=mode;
  $$('.eq-dtab').forEach(t=>t.classList.toggle('on',t.dataset.eqdtab===mode));
  $('#eqSinglePane').style.display = mode==='single' ? 'flex' : 'none';
  $('#eqBulkPane').style.display = mode==='bulk' ? 'flex' : 'none';
  $('#eqDelBtn').style.display = (mode==='single' && EQ_EDIT_IDX!=null) ? '' : 'none';
  $('#eqSaveBtn').textContent = mode==='bulk' ? 'Add all to pack' : (EQ_EDIT_IDX!=null ? 'Save changes' : 'Add to pack');
}
// undoFn, when given, shows an "Undo" button that reverts the change (used for
// multi-item actions — packs, kits, bulk paste, bulk delete — where manually
// reversing a mistake item-by-item would be tedious).
function eqToast(msg,undoFn){
  const t=$('#eqToast'); if(!t) return;
  $('#eqToastMsg').textContent=msg;
  const undoBtn=$('#eqToastUndo');
  undoBtn.style.display = undoFn ? '' : 'none';
  undoBtn.onclick = undoFn ? ()=>{ undoFn(); t.classList.remove('show'); } : null;
  t.classList.add('show');
  clearTimeout(eqToast._h); eqToast._h=setTimeout(()=>t.classList.remove('show'),undoFn?4500:1800);
}
// "3 Torches", "Rope, 50 ft x2" — a leading or trailing number becomes qty, everything else is
// the name verbatim (so it still works for names that are just numbers-ish).
function parseBulkEqLine(line){
  line=line.trim();
  let m=line.match(/^(\d+)\s*[x×]?\s+(.+)$/i);
  if(m) return {qty:m[1],name:m[2].trim()};
  m=line.match(/^(.+?)\s*[x×]\s*(\d+)$/i);
  if(m) return {qty:m[2],name:m[1].trim()};
  return {qty:'',name:line};
}
function eqSnapshot(){ return S.equipment.map(e=>({...e})); }
function eqRestore(snap){ S.equipment=snap; renderEquipment(); renderCombatFeatures(); renderOverviewWealth(); save(); }
function wireEquipmentDrawer(){
  // Moved to <body> so the tab-switch fade animation (which briefly gives .tab-page a
  // CSS transform, i.e. a containing block) can never hijack this fixed-position drawer's
  // placement, and so it isn't yanked away if the player switches tabs while it's open.
  document.body.appendChild($('#eqBackdrop'));
  document.body.appendChild($('#eqDrawer'));
  // eqToast lives in this same template but is now also triggered from the Build tab (the
  // Background "Grant Starting Gear & Gold" button) — without this it sits inside Inventory's
  // display:none .tab-page and never becomes visible when fired from anywhere else.
  document.body.appendChild($('#eqToast'));
  $('#eqNewItemBtn').addEventListener('click',()=>openEqDrawer(null));
  $('#eqDrawerClose').addEventListener('click',closeEqDrawer);
  $('#eqBackdrop').addEventListener('click',closeEqDrawer);
  $$('.eq-dtab').forEach(t=>t.addEventListener('click',()=>eqSwitchDrawerTab(t.dataset.eqdtab)));
  $('#eqQtyUp').addEventListener('click',()=>{ $('#eqQty').value=num($('#eqQty').value)+1; });
  $('#eqQtyDown').addEventListener('click',()=>{ $('#eqQty').value=Math.max(0,num($('#eqQty').value)-1); });
  $('#eqCombatSwitch').addEventListener('click',()=>eqSwitchSet($('#eqCombatSwitch'),!eqSwitchOn($('#eqCombatSwitch'))));
  $('#eqAttuneSwitch').addEventListener('click',()=>eqSwitchSet($('#eqAttuneSwitch'),!eqSwitchOn($('#eqAttuneSwitch'))));
  $('#eqDelBtn').addEventListener('click',()=>{
    if(EQ_EDIT_IDX==null) return;
    const snap=eqSnapshot();
    S.equipment.splice(EQ_EDIT_IDX,1);
    eqToast('Removed',()=>eqRestore(snap));
    closeEqDrawer(); renderEquipment(); renderCombatFeatures(); renderOverviewWealth(); save();
  });
  $('#eqSaveBtn').addEventListener('click',()=>{
    const catBtn=$('.eq-catopt.on'); const cat=catBtn?catBtn.dataset.eqcat:'G';
    if(EQ_DRAWER_MODE==='bulk'){
      const lines=$('#eqBulkText').value.split('\n').map(l=>l.trim()).filter(Boolean);
      if(!lines.length) return;
      const snap=eqSnapshot();
      lines.forEach(line=>{
        const {qty,name}=parseBulkEqLine(line);
        S.equipment.push({qty,name,type:cat,desc:'',combat:false,att:false});
      });
      $('#eqBulkText').value='';
      eqToast(`Added ${lines.length} item${lines.length>1?'s':''}`,()=>eqRestore(snap));
      if(S.eqTab!=='ALL'&&S.eqTab!==cat) S.eqTab=cat;
      closeEqDrawer(); renderEquipment(); save();
      return;
    }
    const name=$('#eqName').value.trim();
    if(!name){ $('#eqName').focus(); return; }
    const data={
      name, qty:$('#eqQty').value.trim(), type:cat,
      wt: parseFloat($('#eqWeight').value) || undefined,
      desc:$('#eqDesc').value,
      combat:eqSwitchOn($('#eqCombatSwitch')),
      att: cat==='M' ? eqSwitchOn($('#eqAttuneSwitch')) : false,
    };
    let target;
    if(EQ_EDIT_IDX!=null){ target=Object.assign(S.equipment[EQ_EDIT_IDX],data); eqToast('Saved'); }
    else { S.equipment.push(data); target=S.equipment[S.equipment.length-1]; eqToast(`Added ${name}`); }
    if(target.combat&&!target.actionType) target.actionType='item'; // lands in combat as an Item card
    if(S.eqTab!=='ALL'&&S.eqTab!==cat) S.eqTab=cat;
    closeEqDrawer(); renderEquipment(); renderCombatFeatures(); renderOverviewWealth(); save();
  });
}
// Gear index browser — a real modal (like Settings) instead of a focus/blur dropdown, which
// was flaky to open reliably and closed itself before a second pick. Opens on a plain click,
// stays open across multiple adds, and only closes when you say so.
function wireItemIndexModal(){
  const btn=$('#eqIndexBtn'), modal=$('#itemIndexModal'), input=$('#itemIndexSearch'), list=$('#itemIndexList');
  if(!btn||!modal) return;
  document.body.appendChild(modal); // survives the tab-fade transform, same reason as the eq drawer
  const allItems=Object.values(ITEM_DB);
  function renderResults(){
    const q=input.value.trim().toLowerCase();
    const items=allItems.filter(it=>!q||it.n.toLowerCase().includes(q)||(it.d||'').toLowerCase().includes(q));
    if(!items.length){ list.innerHTML='<div class="empty">No matches — close this and use "+ New Item" for a custom entry</div>'; return; }
    let html='';
    Object.keys(ITEM_TYPES).forEach(ty=>{
      const g=items.filter(it=>it.t===ty);
      if(!g.length) return;
      html+=`<div class="grp">${ITEM_TYPES[ty][1]}</div>`+
        g.map(it=>`<div class="item" data-itempick="${esc(it.n)}">${it.cb?'⚔ ':''}${esc(it.n)}${KITS[it.n]?' 🛠':''}<small>${esc(it.d)}</small></div>`).join('');
    });
    list.innerHTML=html;
  }
  const open=()=>{ input.value=''; renderResults(); modal.classList.add('open'); setTimeout(()=>input.focus(),50); };
  const close=()=>modal.classList.remove('open');
  btn.addEventListener('click',open);
  $('#itemIndexClose').addEventListener('click',close);
  modal.addEventListener('click',e=>{ if(e.target===modal) close(); });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&modal.classList.contains('open')) close(); });
  input.addEventListener('input',renderResults);
  list.addEventListener('click',e=>{
    const el=e.target.closest('[data-itempick]'); if(!el) return;
    const it=ITEM_DB[el.dataset.itempick.toLowerCase()]; if(!it) return;
    S.equipment.push({qty:String(it.q),name:it.n,type:it.t,desc:it.d,combat:it.cb,att:false});
    const kit=KITS[it.n];
    if(kit){
      const snap=eqSnapshot();
      kit.forEach(([name,qty])=>addPackItem(name,qty));
      S.eqTab='ALL';
      eqToast(`Added ${it.n} + ${kit.length} craftable items`,()=>eqRestore(snap));
      renderEquipment(); renderCombatFeatures(); renderOverviewWealth(); save();
    } else {
      if(S.eqTab!=='ALL'&&S.eqTab!==it.t) S.eqTab=it.t; // jump to where it landed
      eqToast(`Added ${it.n}`);
      renderEquipment(); renderCombatFeatures(); save();
    }
    el.classList.add('added'); // brief feedback without closing — you can keep tapping more items
    setTimeout(()=>el.classList.remove('added'),400);
  });
  // Equipped & Defense folds too — on a tablet you set it once and want it out of the way
  const eqPanel=$('#invEqPanel'), eqHead=$('#invEqHead');
  if(eqPanel&&eqHead){
    eqPanel.classList.toggle('closed',S.invEqOpen===false);
    eqHead.addEventListener('click',()=>{
      S.invEqOpen=S.invEqOpen===false;
      eqPanel.classList.toggle('closed',S.invEqOpen===false);
      save();
    });
  }
}
// Separate from the gear-index search above: this one only ever filters the cards already
// in the pack, with no dropdown and nothing to add — the two were merged into one input
// before and it made "search index" results look like they were fighting the live pack filter.
function wirePackSearch(){
  const input=$('#packSearch'); if(!input) return;
  input.addEventListener('input',()=>{ EQ_SEARCH_Q=input.value; renderEquipment(); });
}
// Starting-equipment packs (Explorer's Pack, Burglar's Pack, ...) — one tap drops every
// item they contain into the pack at once, merging into a matching stack if you already have some.
function addPackItem(name,qty){
  const src=ITEM_DB[name.toLowerCase()]; if(!src) return;
  const existing=S.equipment.find(e=>(e.name||'').toLowerCase()===name.toLowerCase()&&e.type===src.t);
  if(existing && String(existing.qty||'').trim()!=='') existing.qty=String(num(existing.qty)+qty);
  else S.equipment.push({qty:String(qty),name:src.n,type:src.t,desc:src.d,combat:!!src.cb,att:false});
}
function addPack(pack){
  const snap=eqSnapshot();
  pack.items.forEach(([name,qty])=>addPackItem(name,qty));
  S.eqTab='ALL';
  eqToast(`Added ${pack.n} — ${pack.items.length} items`,()=>eqRestore(snap));
  renderEquipment(); renderCombatFeatures(); renderOverviewWealth(); save();
}
// Background gear/gold/tools are a deliberate one-click action, never applied automatically when
// picking a background — browsing Acolyte -> Criminal -> Soldier while comparing options must
// never silently mutate money or inventory the way S.autoGrant's pristine-diff safely does for
// features. Clicking this twice is expected to double the grant, exactly like double-clicking the
// "Starting Pack" button would — no "already granted" tracking is invented beyond what
// addPackItem() already does (merging matching item stacks by name).
function wireBackgroundGrantBtn(){
  $('#bgGrantBtn')?.addEventListener('click',()=>{
    const bg=BACKGROUNDS[S.backgroundId]; if(!bg) return;
    const snap={equipment:eqSnapshot(),gold:num(S.money.gp),otherProfs:S.otherProfs.slice()};
    (bg.equipment.items||[]).forEach(([name,qty])=>addPackItem(name,qty));
    (bg.equipment.packs||[]).forEach(packName=>{
      const pack=PACKS.find(p=>p.n===packName);
      if(pack) pack.items.forEach(([name,qty])=>addPackItem(name,qty));
    });
    S.money.gp=num(S.money.gp)+num(bg.gold);
    (bg.tools||[]).forEach(t=>{ if(!S.otherProfs.some(p=>p.toLowerCase()===t.toLowerCase())) S.otherProfs.push(t); });
    S.eqTab='ALL';
    eqToast(`Added ${bg.name}'s starting gear, ${bg.gold} gp`+(bg.tools.length?', tools':''),()=>{
      S.equipment=snap.equipment; S.money.gp=snap.gold; S.otherProfs=snap.otherProfs;
      renderEquipment(); renderProficiencies(); renderOverviewWealth(); save();
    });
    renderEquipment(); renderCombatFeatures(); renderOverviewWealth(); renderProficiencies(); save();
  });
}
// Same real-modal treatment as the Gear Index: opens reliably on one click, stays open so you
// can drop in more than one pack (or a pack plus a couple of extra kits) before closing it.
function wirePackModal(){
  const btn=$('#eqPackBtn'), modal=$('#packModal'), input=$('#packModalSearch'), list=$('#packModalList');
  if(!btn||!modal) return;
  document.body.appendChild(modal); // survives the tab-fade transform, same reason as the eq drawer
  function renderResults(){
    const q=input.value.trim().toLowerCase();
    const packs=PACKS.filter((p,i)=>!q||p.n.toLowerCase().includes(q)||p.items.some(x=>x[0].toLowerCase().includes(q)));
    if(!packs.length){ list.innerHTML='<div class="empty">No matches</div>'; return; }
    list.innerHTML=packs.map(p=>{
      const i=PACKS.indexOf(p);
      return `<div class="item" data-packpick="${i}">${esc(p.n)}<small>${esc(p.price)} — ${p.items.length} items: ${p.items.map(x=>esc(x[0])).join(', ')}</small></div>`;
    }).join('');
  }
  const open=()=>{ input.value=''; renderResults(); modal.classList.add('open'); setTimeout(()=>input.focus(),50); };
  const close=()=>modal.classList.remove('open');
  btn.addEventListener('click',open);
  $('#packModalClose').addEventListener('click',close);
  modal.addEventListener('click',e=>{ if(e.target===modal) close(); });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&modal.classList.contains('open')) close(); });
  input.addEventListener('input',renderResults);
  list.addEventListener('click',e=>{
    const el=e.target.closest('[data-packpick]'); if(!el) return;
    addPack(PACKS[+el.dataset.packpick]);
    el.classList.add('added');
    setTimeout(()=>el.classList.remove('added'),400);
  });
}
// Multi-select for bulk delete — "Select" toggles a checkbox mode on the pack list
// (renderEquipment renders the checkboxes and toolbar count), this just wires the
// toolbar buttons. Bulk delete reuses the Undo toast so a mis-tap is recoverable.
function wireEqSelect(){
  $('#eqSelectBtn').addEventListener('click',()=>{
    EQ_SELECT_MODE=!EQ_SELECT_MODE;
    if(!EQ_SELECT_MODE) EQ_SELECTED.clear();
    renderEquipment();
  });
  $('#eqBulkCancelBtn').addEventListener('click',()=>{
    EQ_SELECT_MODE=false; EQ_SELECTED.clear();
    renderEquipment();
  });
  $('#eqBulkDeleteBtn').addEventListener('click',()=>{
    if(!EQ_SELECTED.size) return;
    const n=EQ_SELECTED.size;
    const snap=eqSnapshot();
    S.equipment=S.equipment.filter((e,i)=>!EQ_SELECTED.has(i));
    EQ_SELECTED.clear();
    EQ_SELECT_MODE=false;
    eqToast(`Removed ${n} item${n>1?'s':''}`,()=>eqRestore(snap));
    renderEquipment(); renderCombatFeatures(); renderOverviewWealth(); save();
  });
}
const FX_STATS={ac:'AC',speed:'Speed',init:'Initiative',passive:'Passive Perception',hpmax:'Max HP',vision:'Darkvision Range'};
const SKILL_NAMES=Object.fromEntries(SKILLS.map(s=>[s[0],s[1]]));
let FX_DRAFT={}; // in-progress "add effect" form per feature (not saved)

function fxChipLabel(x){
  if(x.t==='stat')  return `${FX_STATS[x.stat]} ${fmtAmount(x.n)}`;
  if(x.t==='skill') return `${xSkills(x).map(s=>SKILL_NAMES[s]).join(', ')}: ${x.grant==='exp'?'Expertise':'Proficiency'}`;
  if(x.t==='save')  return `${AB_NAMES[x.ab]} save proficiency`;
  if(x.t==='note'){
    const kind=x.kind==='prof'?'dprof':x.kind;
    const what=kind==='adv'?'advantage':kind==='dprof'?'proficiency boost':kind==='flat'?fmtAmount(x.n):'note';
    return `★ ${xSkills(x).map(s=>SKILL_NAMES[s]).join(', ')}: ${what}${x.cond?' ('+x.cond+')':''}`;
  }
  if(x.t==='statnote'){
    const amt=String(x.n??'').trim();
    return `★ ${FX_STATS[x.stat]}${amt?' '+fmtAmount(x.n):''}${x.cond?' ('+x.cond+')':''}`;
  }
  return '?';
}
function skillPickHTML(i,checked){
  return `<div class="fx-skillpick" data-fxskills="${i}">${SKILLS.map(([v,l,ab])=>
    `<span class="skpick ${checked.includes(v)?'on':''}" data-skillval="${v}" style="--ab-color:${AB_COLOR[ab]}">${l}<i>${ab}</i></span>`).join('')}</div>`;
}
// Maps a FEATURE_LIB group name ("Barbarian", "Ranger — Gloom Stalker") back to a CLASSES key,
// so a class feature can wear its owning class's own icon/color (the same ones the Build screen
// uses) instead of one flat "class feature" color for all twelve classes.
function classIdFromGroupName(g){
  const base=(g||'').split(' — ')[0];
  const found=Object.entries(CLASSES).find(([,c])=>c.name===base);
  return found?found[0]:'';
}
// Colors each feature card by where it came from — class, race, feat, or hand-written — so a
// page of features reads as more than one uniform stack. A quiet fine-print byline names the
// source (the class or race it belongs to); hand-written features get no byline at all, since
// there's nothing meaningful to label them with. Falls back to "custom" for features saved
// before this field existed, so old characters don't break.
function featureSourceMeta(f){
  const s=f.source||{kind:'custom'};
  if(s.kind==='class'){
    const c=CLASSES[s.classId];
    return {byline:s.className||(c&&c.name)||'',color:CLASS_COLOR[s.classId]||'#c9a227'};
  }
  // Subclass features wear their class's color too — they're the same pillar of the character —
  // but the byline carries the full "Cleric — Life Domain" so the two read apart at a glance.
  if(s.kind==='subclass'){
    const c=CLASSES[s.classId];
    return {byline:s.className||((c?c.name+' — ':'')+(s.subclassName||'')),color:CLASS_COLOR[s.classId]||'#c9a227'};
  }
  if(s.kind==='race') return {byline:s.raceName||'',color:'#7dc26a'};
  if(s.kind==='background') return {byline:s.backgroundName||'',color:'#c9a227'};
  if(s.kind==='feat') return {byline:'Feat',color:'#a58ce0'};
  return {byline:'',color:'#5aa9e0'};
}
function renderFeatures(){
  // Locked = compact read-only pass: no inputs, no edit chrome. Everything just sits there
  // plainly (title, description, effects) — no collapse/expand needed for a handful of features.
  if(S.featuresLocked){
    $('#featureList').innerHTML = S.features.map(f=>{
      const src=featureSourceMeta(f);
      const chips=(f.fx||[]).map(x=>`<span class="fx-chip ro">${esc(fxChipLabel(x))}</span>`).join('');
      return `
      <div class="feature-card locked" style="--src:${src.color}">
        <div class="feature-cap">${esc((f.title||'?').trim().charAt(0).toUpperCase()||'?')}</div>
        <div class="feature-body">
          <div class="cf-row" style="align-items:flex-start">
            <div>
              ${src.byline?`<span class="feature-byline">${esc(src.byline)}</span>`:''}
              <span class="cf-name">${esc(f.title||'Feature')}</span>
            </div>
            ${f.combat?'<span class="cf-tag">⚔</span>':''}
          </div>
          ${f.desc?`<div class="locked-desc">${esc(f.desc)}</div>`:''}
          ${chips?`<div class="fx-chip-row">${chips}</div>`:''}
        </div>
      </div>`;
    }).join('');
    return;
  }
  $('#featureList').innerHTML = S.features.map((f,i)=>{
    const chips=(f.fx||[]).map((x,j)=>
      `<span class="fx-chip" title="${esc(x.text||x.cond||'')}">${esc(fxChipLabel(x))}<button class="edit" data-fxedit="${i}.${j}" title="Edit this effect in place">✎</button><button class="copy" data-fxcopy="${i}.${j}" title="Duplicate as a separate new effect (e.g. to also cover another skill)">⧉</button><button data-fxdel="${i}.${j}" title="Remove effect">✕</button></span>`).join('');
    const d=FX_DRAFT[i]||{};
    const draftSkills=xSkills(d);
    const editing=d._editIdx!=null;
    const addLabel=editing?'Save changes':'Add';
    const cancelBtn=editing?`<button class="cancel-btn" data-fxcancel="${i}">Cancel</button>`:'';
    const editHint=editing?`<div class="fx-edit-hint">Editing this effect — "${addLabel}" updates it in place. "Cancel" leaves it unchanged.</div>`:'';
    let stage='';
    if(d.t==='stat') stage=`
      <select data-fxa="${i}">${Object.entries(FX_STATS).map(([v,l])=>`<option value="${v}" ${d.stat===v?'selected':''}>${l}</option>`).join('')}</select>
      <input type="text" style="width:150px" value="${esc(d.n??1)}" data-fxn="${i}" placeholder="2 / PROF / DEX+1" title="A number, or an auto-calc formula: PROF, LVL, STR, DEX, CON, INT, WIS, CHA (ability modifiers) — e.g. PROF, DEX+1, 2*PROF. Updates itself on level-up.">
      <span class="fx-amt-hint">= ${fmt(fxAmount(d.n??1))}</span>
      <button class="add-btn" data-fxok="${i}">${addLabel}</button>${cancelBtn}`;
    else if(d.t==='skill') stage=`
      ${skillPickHTML(i,draftSkills)}
      <select data-fxg="${i}"><option value="prof" ${d.grant!=='exp'?'selected':''}>Proficiency</option><option value="exp" ${d.grant==='exp'?'selected':''}>Expertise</option></select>
      <button class="add-btn" data-fxok="${i}">${addLabel}</button>${cancelBtn}`;
    else if(d.t==='save') stage=`
      <select data-fxa="${i}">${ABILITIES.map(([v,l])=>`<option value="${v}" ${d.ab===v?'selected':''}>${l}</option>`).join('')}</select>
      <button class="add-btn" data-fxok="${i}">${addLabel}</button>${cancelBtn}`;
    else if(d.t==='note') stage=`
      ${skillPickHTML(i,draftSkills)}
      <select data-fxk="${i}">
        <option value="dprof" ${d.kind!=='adv'&&d.kind!=='flat'?'selected':''}>Proficiency boost (grants it, or doubles it if already proficient)</option>
        <option value="adv" ${d.kind==='adv'?'selected':''}>Advantage</option>
        <option value="flat" ${d.kind==='flat'?'selected':''}>Flat bonus +N</option>
      </select>
      ${d.kind==='flat'?`<input type="text" style="width:90px" value="${esc(d.n??10)}" data-fxn="${i}" placeholder="10 / PROF" title="A number or a formula (PROF, LVL, STR…, e.g. 2*PROF)">`:''}
      <input type="text" style="min-width:180px;flex:1" placeholder="When? e.g. in favored terrain" value="${esc(d.text||d.cond||'')}" data-fxt="${i}">
      <button class="add-btn" data-fxok="${i}">${addLabel}</button>${cancelBtn}`;
    else if(d.t==='statnote') stage=`
      <select data-fxa="${i}">${Object.entries(FX_STATS).map(([v,l])=>`<option value="${v}" ${d.stat===v?'selected':''}>${l}</option>`).join('')}</select>
      <input type="text" style="width:190px" value="${esc(d.n??'')}" data-fxn="${i}" placeholder="Optional bonus: 2 / PROF / DEX+1" title="Optional bonus shown on the badge — a number or a formula (PROF, DEX+1…). Not added to the stat: it's a reminder, the situational math stays yours.">
      <input type="text" style="min-width:180px;flex:1" placeholder="When? e.g. while raging" value="${esc(d.text||d.cond||'')}" data-fxt="${i}">
      <button class="add-btn" data-fxok="${i}">${addLabel}</button>${cancelBtn}
      <span class="prep-note" style="flex-basis:100%;margin:0">Shows as a ★ badge on the Overview — the bonus is a reminder only, not added to the stat. Formulas: PROF, LVL, STR…CHA (e.g. DEX+1, 2*PROF).</span>`;
    if(stage) stage=editHint+stage;
    const src=featureSourceMeta(f);
    return `
    <div class="feature-card" style="--src:${src.color}">
      <div class="feature-cap">${esc((f.title||'?').trim().charAt(0).toUpperCase()||'?')}</div>
      <div class="feature-body">
        <div class="feature-head">
          <div class="feature-headtext">
            ${src.byline?`<span class="feature-byline">${esc(src.byline)}</span>`:''}
            <input type="text" class="feature-title" value="${esc(f.title)}" data-li="features.${i}.title" placeholder="Feature name (e.g. Natural Explorer)">
          </div>
          <button class="combat-flag ${f.combat?'on':''}" data-combat="${i}" title="${f.combat?'Shown in Combat tab — tap to remove':'Tap to show in Combat tab'}">⚔</button>
          <button class="del-btn" data-del="features.${i}">✕</button>
        </div>
        <textarea class="desc-ta" data-li="features.${i}.desc" placeholder="What it does...">${esc(f.desc)}</textarea>
        ${f.combat?`
        <div class="fx-addrow" style="margin:4px 0 0">
          <span class="prep-note" style="margin:0">Uses</span>
          ${f.usesScale
            ? `<span class="prof-uses-val" title="Auto-set from ${usesScaleLabel(f.usesScale)}${num(f.usesScaleBonus)?` + ${num(f.usesScaleBonus)}`:''} (min 1) — updates when the stat changes">= ${num(f.usesMax)}</span>`
            : `<input type="number" min="0" style="width:50px" value="${num(f.usesMax)}" data-uses="${i}" title="0 = not tracked (passive/at-will)">`}
          <select data-usesper="${i}"><option value="short" ${f.usesPer!=='long'?'selected':''}>per short rest</option><option value="long" ${f.usesPer==='long'?'selected':''}>per long rest</option></select>
          <select class="uses-scale-sel" data-usesscale="${i}" title="Tie max uses to a stat instead of typing a fixed number">
            <option value="">Fixed number</option>
            <option value="prof" ${f.usesScale==='prof'?'selected':''}>= Proficiency</option>
            ${ABILITIES.map(([k,l])=>`<option value="${k}" ${f.usesScale===k?'selected':''}>= ${l} mod</option>`).join('')}
          </select>
          ${f.usesScale?`<select data-usesbonus="${i}" title="Flat amount added on top, if any — e.g. Divine Sense is 1 + CHA mod">
            ${[0,1,2,3].map(n=>`<option value="${n}" ${num(f.usesScaleBonus)===n?'selected':''}>${n?'+'+n:'+0'}</option>`).join('')}
          </select>`:''}
        </div>`:''}
        ${chips?`<div style="margin-top:6px">${chips}</div>`:''}
        ${d.t||d._pickerOpen?`
        <div class="fx-addrow" style="margin-top:6px">
          <select data-fxtype="${i}" style="flex:0 0 230px">
            <option value="">+ add effect…</option>
            <option value="stat" ${d.t==='stat'?'selected':''}>Stat bonus (AC, speed, HP…)</option>
            <option value="skill" ${d.t==='skill'?'selected':''}>Skill proficiency / expertise</option>
            <option value="save" ${d.t==='save'?'selected':''}>Saving throw proficiency</option>
            <option value="note" ${d.t==='note'?'selected':''}>★ Skill reminder (conditional)</option>
            <option value="statnote" ${d.t==='statnote'?'selected':''}>★ Stat reminder (shown on Overview)</option>
          </select>
          ${stage}
        </div>`:`
        <button class="fx-open-btn" style="margin-top:6px" data-fxopen="${i}">+ Effect</button>`}
      </div>
    </div>`;
  }).join('');
  wireList('#featureList');
  wireFx();
}
// Re-render everything a feature effect can touch
function fxRefresh(){ renderFeatures(); renderSkills(); renderSaves(); renderCombatFeatures(); recalc(); save(); }
// Lock toggle (compact read-only view) — just swaps the panel chrome and re-renders the list.
function wireFeaturesLock(){
  const syncChrome=()=>{
    const locked=!!S.featuresLocked;
    const btn=$('#featuresLockBtn');
    btn.textContent=locked?'🔒':'🔓';
    btn.title=locked?'Locked — tap to unlock editing':'Unlocked — tap to lock into a compact view';
    btn.classList.toggle('locked',locked);
    $('#featuresEditBar').style.display=locked?'none':'';
    $('#addFeatureBtn').style.display=locked?'none':'';
    $('#addFeatBtn').style.display=locked?'none':'';
  };
  $('#featuresLockBtn').addEventListener('click',()=>{
    S.featuresLocked=!S.featuresLocked;
    syncChrome(); renderFeatures(); save();
  });
  syncChrome();
}

// ⚔ Combat tab panel — pulls in every feature flagged "Show in Combat". Kept deliberately compact:
// one slim row per feature (name + pips), no card, no always-visible description — tap a row to
// unfold its text only if you need the reminder, tap a pip to track a use. Nothing to skim past.
// ========== Combat cockpit ==========
// One-screen combat dashboard. The "Do Something" grid is a VIEW over data that already lives
// elsewhere (attacks, spellbook, combat-flagged features) plus free-form custom cards. Paper
// rule: every derived field is overridable per card (action type, condition), every card can be
// pinned/hidden, and nothing is enforced — the cockpit reminds and tracks, the player decides.
// A card can hold MORE THAN ONE action-economy tag at once (e.g. an off-hand light weapon is
// both an Action and a Bonus Action attack depending on the moment) — cards[].types is always
// an array; cards[].type is just its first/primary tag, used only for the spine color and sort.
const CK_TYPES=[['action','Action'],['bonus','Bonus Action'],['reaction','Reaction'],['item','Item'],['other','Other']];
const CK_TYPE_ORDER={action:0,bonus:1,reaction:2,item:3,other:4};
const CK_PILL={action:'pill-action',bonus:'pill-bonus',reaction:'pill-react',item:'pill-item',other:'pill-cast'};
// Source categories the "Do Something" grid groups into — orthogonal to the action-economy
// filter above (a Fireball is both "in the Spells zone" and "under the Action filter"). Each
// zone can be shown/hidden independently via the rail (S.cockpit.hiddenZones) so a player who
// only cares about spells this fight can tuck the others out of the way without losing them.
const CK_ZONES=[['weap','⚔','Weapons'],['spell','🔮','Spells'],['feat','🎖','Features & Feats'],['item','🎒','Items & Notes']];
// New tag list for a card, or the single-value legacy field wrapped in an array if it was
// never migrated — every card format has always stored one of these two shapes.
function ckTypesOf(obj,legacyVal,fallback){
  return Array.isArray(obj.actionTypes)&&obj.actionTypes.length ? obj.actionTypes : [legacyVal||fallback];
}
let CK_FILTER='all', CK_UNDO=null, CK_SEARCH='';
// One card's detail can be open at a time in the "Do Something" grid — it floats in a popover
// anchored to the card (see openCkPop/closeCkPop) rather than expanding the card in place, so
// browsing the grid never reflows. Turn-plan steps are a separate, independent open-set (below):
// a step's card sits in a normal vertical list, so expanding one in place there is just an
// ordinary accordion, not the "grid card grows and shoves its neighbors down" problem this fixes.
let CK_OPEN_KEY=null;
const CK_RULES_OPEN=new Set();
// Older saves may lack the cockpit fields entirely — normalize on every access.
function ck(){
  S.cockpit=S.cockpit||{};
  const c=S.cockpit;
  c.hidden=c.hidden||[]; c.pins=c.pins||[]; c.hiddenZones=c.hiddenZones||[];
  S.customCards=S.customCards||[]; S.states=S.states||[];
  // Plan templates: named step lists for different situations (boss fight, defensive...).
  // Saves from the single-plan era get their old steps folded into a "Default" template.
  if(!Array.isArray(S.turnPlans)||!S.turnPlans.length)
    S.turnPlans=[{name:'Default',steps:Array.isArray(S.turnPlan)?S.turnPlan:[]}];
  S.turnPlans.forEach(p=>{ p.steps=p.steps||[]; });
  S.turnPlanIdx=Math.max(0,Math.min(num(S.turnPlanIdx),S.turnPlans.length-1));
  return c;
}
function ckPlan(){ ck(); return S.turnPlans[S.turnPlanIdx]; }
// Resolve a card key ("atk:0" / "sp:1.2" / "ft:5" / "cc:0") back to its state object.
function ckRef(key){
  const [kind,rest]=key.split(':');
  if(kind==='atk') return S.attacks[+rest];
  if(kind==='ft') return S.features[+rest];
  if(kind==='cc') return S.customCards[+rest];
  if(kind==='it') return S.equipment[+rest];
  if(kind==='sp'){ const [L,i]=rest.split('.').map(Number); return (S.spellLevels[L]||{spells:[]}).spells[i]; }
  return null;
}
// Action type for a spell: explicit override > cast-time code from the index > guess from the
// editable meta line (custom spells) > 'other'.
function spellActionType(sp){
  if(sp.actionType) return sp.actionType;
  const db=SPELL_DB[(sp.name||'').trim().toLowerCase()];
  if(db) return db.t==='A'?'action':db.t==='B'?'bonus':db.t==='R'?'reaction':'other';
  const m=(sp.meta||'').toLowerCase();
  if(m.startsWith('bonus')) return 'bonus';
  if(m.startsWith('reaction')) return 'reaction';
  if(m.includes('action')) return 'action';
  return 'other';
}
function spellIsConc(sp){
  const db=SPELL_DB[(sp.name||'').trim().toLowerCase()];
  if(db) return (SP_DUR[db.du]||'').startsWith('Conc');
  return (sp.meta||'').toLowerCase().includes('conc');
}
// Spell Save DC / Spell Attack bonus — one formula, shared by recalc() (which paints it onto every
// data-calc="spellDC"/"spellAtk" element) and the cockpit spell cards (which need the raw numbers).
function spellDCAtk(){
  if(!S.spellAbility) return {dc:null,atk:null};
  const m=amod(S.spellAbility), P=num(S.profBonus);
  return {dc:8+P+m, atk:P+m};
}
// Assemble every card the grid can show, from all four sources.
function cockpitCards(){
  const c=ck(), cards=[];
  (S.attacks||[]).forEach((a,i)=>{
    if(!(a.name||'').trim()) return;
    const types=ckTypesOf(a,a.actionType,'action');
    cards.push({key:'atk:'+i,kind:'atk',i,name:a.name,types,type:types[0],cond:a.cond||'',zone:'weap'});
  });
  const anyPrep=S.spellLevels.some((lv,L)=>L>0&&lv.spells.some(s=>s.prep));
  S.spellLevels.forEach((lv,L)=>lv.spells.forEach((sp,i)=>{
    if(!(sp.name||'').trim()) return;
    if(L>0&&anyPrep&&!c.showAllSpells&&!sp.prep) return;
    const types=Array.isArray(sp.actionTypes)&&sp.actionTypes.length?sp.actionTypes:[spellActionType(sp)];
    cards.push({key:`sp:${L}.${i}`,kind:'sp',L,i,name:sp.name,types,type:types[0],cond:sp.cond||'',conc:spellIsConc(sp),zone:'spell'});
  }));
  S.features.forEach((f,gi)=>{
    const isFeat=!!(f.source&&f.source.kind==='feat');
    // Class/race features stay opt-in (⚔ "Show in Combat"), but a feat — chosen at level-up or
    // added by hand for something the DM granted — always earns a spot here under its own Feats
    // filter, action-usable or not: "what feats do I have" is exactly what you want mid-fight.
    if(!f.combat && !isFeat) return;
    const types=ckTypesOf(f,f.actionType,num(f.usesMax)>0?'action':'other');
    cards.push({key:'ft:'+gi,kind:'ft',gi,name:f.title||'Feature',types,type:types[0],cond:f.cond||'',isFeat,zone:'feat'});
  });
  S.customCards.forEach((cc,i)=>{
    const types=ckTypesOf(cc,cc.type,'action');
    cards.push({key:'cc:'+i,kind:'cc',i,name:cc.title||'Custom',types,type:types[0],cond:cc.cond||'',zone:'item'});
  });
  (S.equipment||[]).forEach((e,i)=>{
    if(!e.combat||!(e.name||'').trim()) return;
    // Blank qty = untracked (always usable); only an explicit 0 counts as "out of stock".
    const tracked=String(e.qty??'').trim()!=='';
    const types=ckTypesOf(e,e.actionType,'item');
    cards.push({key:'it:'+i,kind:'it',i,name:e.name,types,type:types[0],cond:e.cond||'',out:tracked&&num(e.qty)<=0,zone:'item'});
  });
  cards.forEach(x=>{ x.pin=c.pins.includes(x.key); });
  return cards;
}
function ckSlotPips(L){
  const lv=S.spellLevels[L]; if(!lv||!lv.total) return '';
  return `<span class="pips ck-pips">${Array.from({length:lv.total},(_,k)=>
    `<button class="pip ${k<lv.used?'used':''}" data-ckslot="${L}.${k}"></button>`).join('')}</span>`;
}
// stepIdx present → this open body is a turn-plan step, not the "Do Something" grid card.
// Same weapon, two different questions: the card's tags say every economy slot it *could* fill
// (drives where it shows up when browsing); a step's own type says what it *is*, right here, in
// this one planned turn — so "Shortsword" attacked three times in a row can have its third swing
// marked as the Bonus Action without relabeling the other two, or the card everywhere else.
function ckGearRow(card,stepIdx){
  const obj=ckRef(card.key); if(!obj) return '';
  let typePicker,label;
  if(stepIdx!=null){
    const step=ckPlan().steps[stepIdx], stepType=step.type||card.type;
    label='This step:';
    typePicker=CK_TYPES.map(([v,l])=>
      `<button type="button" class="ck-typechip ${CK_PILL[v]} ${stepType===v?'on':''}" data-ckstept="${stepIdx}::${v}" title="Mark this one step as ${l}">${l}</button>`
    ).join('');
  }else{
    label='Shows under:';
    typePicker=CK_TYPES.map(([v,l])=>
      `<button type="button" class="ck-typechip ${CK_PILL[v]} ${card.types.includes(v)?'on':''}" data-cktoggletype="${card.key}::${v}" title="${card.types.includes(v)?`Tap to stop showing this under ${l}`:`Tap to also show this under ${l}`}">${l}</button>`
    ).join('');
  }
  return `<div class="ck-gear">
    <div class="ck-typepick"><span class="ck-gear-label">${label}</span>${typePicker}</div>
    <input type="text" value="${esc(obj.cond||'')}" data-ckcond="${card.key}" placeholder="Condition — e.g. first turn of combat, once per turn">
    <button data-ckpin="${card.key}">${card.pin?'📌 Unpin':'📌 Pin'}</button>
  </div>`;
}
function ckCardOpenHTML(card,stepIdx){
  const g=ckGearRow(card,stepIdx);
  if(card.kind==='atk'){
    const i=card.i, a=S.attacks[i], cSum=atkSummary(a);
    return `<div class="ck-body">
      <div class="ck-desc">${esc(cSum.breakdown)} · damage ${esc(cSum.dmgBreakdown||cSum.dmg)}</div>
      ${a.note?`<div class="ck-note">✎ ${esc(a.note)}</div>`:''}
      <p class="prep-note" style="margin:4px 0 0">Full editing (buffs, magic, dice) in the Attacks panel below.</p>${g}</div>`;
  }
  if(card.kind==='sp'){
    const sp=ckRef(card.key), L=card.L;
    const castable=[];
    if(L>0) S.spellLevels.forEach((lv,k)=>{ if(k>=L&&lv.total>lv.used) castable.push(k); });
    const castRow = L===0
      ? `<span class="cf-tag">at will</span>`
      : castable.length
        ? `<span class="ck-castlbl">Cast with slot:</span>`+castable.map(k=>`<button class="ck-cast" data-ckcast="${card.key}:${k}">${ordinalLevel(k)}</button>`).join('')
        : `<span class="prep-note" style="margin:0">No free slots of ${ordinalLevel(L)}+</span>`;
    return `<div class="ck-body">
      ${sp.desc?`<div class="ck-desc">${esc(sp.desc)}</div>`:''}
      ${card.conc?`<div class="ck-note">◉ Concentration — casting this drops anything you're already concentrating on.</div>`:''}
      <div class="ck-castrow">${castRow}</div>${g}</div>`;
  }
  if(card.kind==='ft'){
    const f=ckRef(card.key);
    return `<div class="ck-body">
      ${f.desc?`<div class="ck-desc">${esc(f.desc)}</div>`:''}
      ${num(f.usesMax)>0?`<div class="ck-note">Recharges on a ${f.usesPer==='long'?'long':'short'} rest.</div>`:''}${g}</div>`;
  }
  if(card.kind==='cc'){
    const i=card.i, cc=S.customCards[i];
    return `<div class="ck-body">
      <input type="text" value="${esc(cc.title)}" data-cct="${i}" placeholder="Card name">
      <textarea data-ccb="${i}" placeholder="Anything — a maneuver, an item, a pact boon...">${esc(cc.body||'')}</textarea>
      <div class="fx-addrow" style="margin-top:4px">
        <span class="prep-note" style="margin:0">Uses</span>
        <input type="number" min="0" style="width:56px" value="${num(cc.usesMax)}" data-ccu="${i}" title="0 = not tracked">
        <button class="del-btn" data-ccdel="${i}" title="Delete card">✕</button>
      </div>${g}</div>`;
  }
  if(card.kind==='it'){
    const e=S.equipment[card.i], tracked=String(e.qty??'').trim()!=='', q=num(e.qty);
    const useRow = !tracked
      ? `<button class="ck-cast" data-ckituse="${card.i}">Use</button><span class="prep-note" style="margin:0">no count tracked — set a Qty on the Inventory tab to track uses</span>`
      : q>0
        ? `<button class="ck-cast" data-ckituse="${card.i}">Use 1 (×${q} left)</button>`
        : `<span class="prep-note" style="margin:0">None left — restock on the Inventory tab.</span>`;
    return `<div class="ck-body">
      ${e.desc?`<div class="ck-desc">${esc(e.desc)}</div>`:''}
      <div class="ck-castrow">${useRow}</div>${g}</div>`;
  }
  return g;
}
// The one-line "what you need to know" strip for a card — shared by the grid cards and the
// turn-plan steps, so both always show the same live numbers and pips.
function ckSubHTML(card,withRoll){
  if(card.kind==='atk'){
    const i=card.i, a=S.attacks[i], cSum=atkSummary(a);
    // withRoll (plan steps): type what the damage dice showed, the total auto-calcs live —
    // same S.attacks[i].rolled the attack editor uses, so the two stay in sync.
    const roll=withRoll?` <span class="ck-roll">🎲<input type="number" value="${esc(a.rolled)}" data-ckroll="${i}" placeholder="${esc(cSum.die||'roll')}" title="What the damage dice showed — total adds your modifiers and active buffs">= <b data-atkfinal="${i}">${cSum.finalDamage!=null?cSum.finalDamage:'—'}</b></span>`:'';
    return `Hit <b class="ck-atkhit" data-atkview="${i}">${esc(cSum.bonus)}</b> · <span class="ck-atkdmg" data-atkdmg="${i}">${esc(cSum.dmg)}</span>${roll}`;
  }
  if(card.kind==='sp'){
    const sp=ckRef(card.key);
    // Same "what you need to know without opening the card" bar the weapon-attack branch above
    // gives Hit/Damage — a save spell shows its DC, an attack spell shows the spell attack bonus,
    // and any damage/healing line (sp.dmg) rides along either way. Resolve heuristic is the same
    // one already used by the Spells-tab modal (spellRulesCallout), just surfaced here too.
    const bits=[`${card.L===0?'Cantrip':ordinalLevel(card.L)+' level'}${sp.meta?' · '+esc(sp.meta):''}`];
    const resolve=spellRulesCallout(sp.desc).resolve;
    const sca=spellDCAtk();
    if(resolve) bits.push(`${resolve.glyph} ${esc(resolve.label)}${sca.dc!=null?' DC '+sca.dc:''}`);
    else if(sp.dmg&&!sp.heal&&sca.atk!=null) bits.push(`✨ Attack ${fmt(sca.atk)}`);
    if(sp.dmg) bits.push(`${sp.heal?'✨':'🔥'} ${esc(sp.dmg)}`);
    return bits.join(' · ')+(card.L>0?' '+ckSlotPips(card.L):'');
  }
  if(card.kind==='ft'){
    const f=ckRef(card.key), max=num(f.usesMax), used=Math.min(num(f.usesUsed),max);
    return max>0
      ? `<span class="cf-count">${max-used}/${max}</span> <span class="pips ck-pips">${Array.from({length:max},(_,k)=>
          `<button class="pip ${k<used?'used':''}" data-ckuse="${card.gi}.${k}"></button>`).join('')}</span>`
      : `<span class="cf-tag">passive</span>`;
  }
  if(card.kind==='cc'){
    const cc=S.customCards[card.i], max=num(cc.usesMax), used=Math.min(num(cc.usesUsed),max);
    return (cc.body?esc(cc.body.split('\n')[0]):'')+(max>0?` <span class="pips ck-pips">${Array.from({length:max},(_,k)=>
      `<button class="pip ${k<used?'used':''}" data-ccpip="${card.i}.${k}"></button>`).join('')}</span>`:'');
  }
  if(card.kind==='it'){
    const e=S.equipment[card.i], tracked=String(e.qty??'').trim()!=='', q=num(e.qty);
    return `${tracked?`<span class="cf-count" title="Quantity left">×${q}</span>`:''}${tracked&&q<=0?' <span class="cf-tag">out</span>':''}${e.desc?' '+esc(e.desc.split('\n')[0]):''}`;
  }
  return '';
}
function ckCardHTML(card){
  const active=CK_OPEN_KEY===card.key;
  const sub=ckSubHTML(card);
  const tl=Object.fromEntries(CK_TYPES);
  // One pill per tag — usually just one, but a card tagged for more than one economy slot
  // (Action + Bonus Action) shows both right here, no need to open it to see where it lives.
  const pills=card.types.map(v=>`<span class="sp-pill ${CK_PILL[v]||'pill-cast'}">${tl[v]||'Other'}</span>`).join('');
  return `<div class="ck-card ck-card-${card.type||'other'} ${card.kind==='sp'?'ck-card-spell':''} ${card.isFeat?'ck-card-feat':''} ${card.cond?'ck-cond':''} ${card.out?'ck-out':''} ${active?'ck-active':''}" data-ckopen="${card.key}" data-ckdrag="${card.key}">
    <div class="ck-card-head">
      <span class="ck-drag-handle" data-ckdraghandle title="Drag to place in your turn plan">⠿</span>
      <span class="ck-card-name">${card.pin?'📌 ':''}${card.conc?'◉ ':''}${esc(card.name)}</span>
      <span class="ck-pillgroup">${pills}</span>
      ${card.kind==='it'&&!card.out?`<button class="ck-quickuse" data-ckituse="${card.i}" title="Use one — no need to open the card">Use</button>`:''}
      <button class="ck-plan-add" data-ckplan="${card.key}" title="Add to end of turn plan (or drag the ⠿ handle to place it precisely)">⤵</button>
    </div>
    ${sub?`<div class="ck-card-sub">${sub}</div>`:''}
    ${card.cond?`<div class="ck-card-cond">⏱ ${esc(card.cond)}</div>`:''}
  </div>`;
}
function renderCockpitCards(){
  const box=$('#ckCards'); if(!box) return;
  const c=ck();
  let cards=cockpitCards();
  // Free-text search narrows the whole pool first — the type dropdown, the zone chips, and
  // their counts all work off whatever it leaves, same as the type filter always has.
  const q=CK_SEARCH.trim().toLowerCase();
  if(q) cards=cards.filter(x=>x.name.toLowerCase().includes(q));
  const counts={all:cards.length};
  // A card tagged with more than one economy slot counts (and shows up) under every filter it's
  // tagged for, rather than being forced into one exclusive bucket.
  CK_TYPES.forEach(([v])=>counts[v]=cards.filter(x=>x.types.includes(v)).length);
  // Zone (source) counts are computed from the full list too, same reasoning as the economy
  // counts above — the rail's numbers shouldn't jump around as the economy filter changes.
  const zoneCounts=Object.fromEntries(CK_ZONES.map(([z])=>[z,cards.filter(x=>x.zone===z).length]));
  if(CK_FILTER!=='all') cards=cards.filter(x=>x.types.includes(CK_FILTER));
  cards.sort((a,b)=>(b.pin-a.pin)||(CK_TYPE_ORDER[a.type]-CK_TYPE_ORDER[b.type])||((a.cond?1:0)-(b.cond?1:0))||a.name.localeCompare(b.name));
  // The action-economy filter used to be its own row of pills; now it's a themed <select> (tap
  // opens the app's own big-rowed option sheet — see wireSelectSheets) so it never competes with
  // the zone chips for a full row of its own.
  const typeWrap=$('#ckTypeWrap');
  if(typeWrap){
    typeWrap.innerHTML=`<select class="ck-pill-sel" id="ckTypeDd" title="Filter by action type">${[['all','All types'],...CK_TYPES].map(([v,l])=>
      `<option value="${v}" ${CK_FILTER===v?'selected':''}>${l}${counts[v]?` (${counts[v]})`:''}</option>`).join('')}</select>`;
    $('#ckTypeDd').addEventListener('change',e=>{ CK_FILTER=e.target.value; renderCockpitCards(); });
  }
  const hiddenZones=new Set(c.hiddenZones||[]);
  const chipsBox=$('#ckZoneChips');
  // Only a category the character actually has anything in earns a chip — an empty "Weapons"
  // chip for a caster with no melee options is a control with nothing to control.
  if(chipsBox) chipsBox.innerHTML=CK_ZONES.filter(([z])=>zoneCounts[z]>0).map(([z,icon,label])=>{
    const hidden=hiddenZones.has(z);
    return `<button class="ck-zone-chip ck-zc-${z} ${hidden?'':'on'}" data-ckzone="${z}" title="${hidden?'Show':'Hide'} ${esc(label)}">
      ${icon} ${esc(label)} <i>${zoneCounts[z]}</i>
    </button>`;
  }).join('');
  const groups=CK_ZONES.map(([z,icon,label])=>({z,icon,label,list:cards.filter(x=>x.zone===z)})).filter(g=>g.list.length);
  const visible=groups.filter(g=>!hiddenZones.has(g.z));
  box.innerHTML = !cards.length
    ? (q
      ? `<p class="prep-note" style="margin:0">No actions match “${esc(CK_SEARCH.trim())}”.</p>`
      : '<p class="prep-note" style="margin:0">Nothing here yet — add attacks below, pick spells on the Spells tab, add a feat on the Build tab, or add a custom card.</p>')
    : !visible.length
      ? '<p class="prep-note" style="margin:0">Every category is hidden — tap one above to bring it back.</p>'
      : visible.map(g=>`<div class="ck-zone ck-zone-${g.z}">
          <div class="ck-zone-lbl">${g.icon} ${esc(g.label)}</div>
          <div class="ck-cards">${g.list.map(ckCardHTML).join('')}</div>
        </div>`).join('');
  $('#ckUndo').innerHTML = CK_UNDO
    ? `<div class="ck-undo">${esc(CK_UNDO.msg)} <button data-ckundo>Undo</button><button data-ckundox>✕</button></div>` : '';
  const anyPrep=S.spellLevels.some((lv,L)=>L>0&&lv.spells.some(s=>s.prep));
  const st=$('#ckSpellsToggle');
  st.style.display=anyPrep?'':'none';
  st.textContent=c.showAllSpells?'Showing all spells — tap for prepared only':'Prepared spells only — tap for all';
  renderCockpitPlan();
  renderCkPopover();
}
// ---------- "Do Something" card detail — a popover anchored to the tapped card, not an inline
// expand. A grid that grows one tile full-width and shoves every card after it down the page
// reads as broken; a small panel floating next to the card you tapped doesn't touch the grid at
// all. Exactly one can be open at a time (re-tapping the same card, tapping elsewhere, or Escape
// closes it) — the same ckCardOpenHTML body every card has always had (cast-with-slot buttons,
// the condition field, pin, action-type tags, feature-use pips, custom-card editing, item use),
// just relocated, so nothing that used to live in the expanded card is lost.
function ckPopEl(){ return $('#ckPop'); }
function closeCkPop(){
  CK_OPEN_KEY=null;
  const pop=ckPopEl(); if(pop){ pop.classList.remove('open'); pop.innerHTML=''; }
  $$('.ck-card.ck-active').forEach(el=>el.classList.remove('ck-active'));
}
function positionCkPop(anchorEl){
  const pop=ckPopEl(); if(!pop||!anchorEl) return;
  const r=anchorEl.getBoundingClientRect();
  const popW=pop.offsetWidth||300, popH=pop.offsetHeight||120;
  const spaceBelow=window.innerHeight-r.bottom;
  let top,caret;
  if(spaceBelow>=popH+14 || spaceBelow>=r.top){ top=r.bottom+10; caret='ck-pop-up'; }
  else{ top=Math.max(10,r.top-popH-10); caret='ck-pop-down'; }
  const left=Math.min(Math.max(10,r.left),window.innerWidth-popW-10);
  pop.style.top=top+'px'; pop.style.left=left+'px';
  pop.classList.remove('ck-pop-up','ck-pop-down'); pop.classList.add(caret);
  const caretX=Math.min(Math.max(18,r.left+r.width/2-left),popW-18);
  pop.style.setProperty('--ckpopx',caretX+'px');
}
function openCkPop(key,anchorEl){
  const card=cockpitCards().find(x=>x.key===key); if(!card) return;
  CK_OPEN_KEY=key;
  const pop=ckPopEl();
  pop.innerHTML=`<button class="ck-pop-close" data-ckpopclose title="Close">✕</button><div class="ck-pop-name">${card.conc?'◉ ':''}${esc(card.name)}</div>${ckCardOpenHTML(card)}`;
  pop.classList.add('open');
  $$('.ck-card').forEach(el=>el.classList.toggle('ck-active',el.dataset.ckopen===key));
  positionCkPop(anchorEl);
}
// Called at the end of every cockpit re-render so a control used inside the open popover (cast
// with slot, a pip, the condition field) sees its own effect immediately, same as the rest of
// the sheet — and so the popover closes cleanly if its source card just got deleted.
function renderCkPopover(){
  if(!CK_OPEN_KEY) return;
  const anchorEl=document.querySelector(`[data-ckopen="${CSS.escape(CK_OPEN_KEY)}"]`);
  if(!anchorEl){ closeCkPop(); return; }
  openCkPop(CK_OPEN_KEY,anchorEl);
}
// The turn-plan timeline — the cockpit's main stage. Each step is a full-information row:
// name, action-type pill, the same live sub-line as its grid card (hit/damage, slot pips, use
// dots), and a tap-to-expand body with the description and cast/use controls right there — no
// jumping back to the card grid mid-fight. Steps are snapshots {key,name}: the name survives
// even if the source card is later deleted, like pencil on paper.
const CK_PLAN_OPEN=new Set();
// Toggled by the ✎ button in the plan toolbar: swaps the plan-switcher <select> for a plain
// rename input for the active plan. Reset (back to the switcher) whenever the active plan
// changes, since renaming a plan you've just switched away from makes no sense.
let CK_PLAN_RENAME=false;
// renderCockpitPlan() runs on every cockpit re-render (search, zone toggle, a pip click anywhere
// on the page), not just when the rename box itself is touched — so the box gets rebuilt often
// while it's open. Only steal focus into it right after ✎ is pressed, never on a rebuild caused
// by something unrelated (typing in the search box, say), or every one of those keystrokes would
// yank focus away from wherever the player actually is.
let CK_PLAN_RENAME_FOCUS=false;
function renderCockpitPlan(){
  const box=$('#ckPlan'); if(!box) return;
  const cur=ckPlan();
  // One plan per situation — "Default", "Boss fight", "Defensive"... Used to be a row of tabs
  // (one pill per plan, plus its own rename input and ✕) that grew without bound and wrapped
  // the moment there were more than a couple. A <select> scales to any number of plans without
  // taking more row space; renaming swaps it for a plain text input instead, toggled by ✎.
  const canDel=S.turnPlans.length>1;
  const switchEl=$('#ckPlanSwitch');
  if(switchEl){
    switchEl.innerHTML=CK_PLAN_RENAME
      ? `<input type="text" class="ck-plan-name-in" id="ckPlanNameIn" value="${esc(cur.name)}" data-cktplname maxlength="24" placeholder="Plan name">`
      : `<select class="ck-pill-sel" id="ckPlanSel" title="Switch turn plan">${S.turnPlans.map((p,i)=>
          `<option value="${i}" ${i===num(S.turnPlanIdx)?'selected':''}>${esc(p.name)||'Plan '+(i+1)}</option>`).join('')}</select>`;
    if(CK_PLAN_RENAME){
      const nameIn=$('#ckPlanNameIn');
      if(nameIn){
        if(CK_PLAN_RENAME_FOCUS){ nameIn.focus(); nameIn.select(); CK_PLAN_RENAME_FOCUS=false; }
        nameIn.addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); CK_PLAN_RENAME=false; renderCockpitPlan(); } });
      }
    }else{
      const sel=$('#ckPlanSel');
      if(sel) sel.addEventListener('change',e=>{
        S.turnPlanIdx=+e.target.value; CK_PLAN_OPEN.clear(); CK_PLAN_RENAME=false;
        renderCockpitPlan(); save();
      });
    }
  }
  const renBtn=$('#ckPlanRenameBtn');
  if(renBtn){ renBtn.textContent=CK_PLAN_RENAME?'✓':'✎'; renBtn.title=CK_PLAN_RENAME?'Done renaming':'Rename this plan'; }
  const delBtn=$('#ckPlanDelBtn');
  if(delBtn) delBtn.style.display=canDel?'':'none';
  const all=cockpitCards();
  const tl=Object.fromEntries(CK_TYPES);
  box.innerHTML = cur.steps.length
    ? cur.steps.map((p,i)=>{
        const card=all.find(x=>x.key===p.key);
        const open=CK_PLAN_OPEN.has(i);
        const noteIn=`<input type="text" class="ck-ps-note" value="${esc(p.note||'')}" data-plannote="${i}" placeholder="✎ quick note…" title="Free text for this step — e.g. 'only if he saves', 'target the caster'">`;
        if(!card) return `<div class="ck-plan-step ck-ps-gone" data-planstep="${i}">
          <span class="ck-drag-handle" data-ckdraghandle title="Drag to reorder">⠿</span>
          <i>${i+1}</i>
          <div class="ck-ps-main"><span class="ck-ps-name">${esc(p.name)}</span>
          ${noteIn}
          <span class="ck-ps-sub">source card was removed — step kept as a note</span></div>
          <button data-plandel="${i}" title="Remove step">✕</button></div>`;
        // A step's own type (set independently below) wins over the card's — the same weapon can
        // be one step's Action and another step's Bonus Action within the same planned turn.
        const stepType=p.type||card.type;
        return `<div class="ck-plan-step ck-ps-${stepType} ${card.kind==='sp'?'ck-card-spell':''} ${open?'open':''}" data-planstep="${i}">
          <span class="ck-drag-handle" data-ckdraghandle title="Drag to reorder">⠿</span>
          <i>${i+1}</i>
          <div class="ck-ps-main">
            <div class="ck-ps-head">
              <span class="ck-ps-name">${card.conc?'◉ ':''}${esc(card.name)}</span>
              ${noteIn}
              <span class="sp-pill ${CK_PILL[stepType]||'pill-cast'}">${tl[stepType]||'Other'}</span>
            </div>
            <div class="ck-ps-sub">${ckSubHTML(card,true)}</div>
            ${card.cond?`<div class="ck-card-cond">⏱ ${esc(card.cond)}</div>`:''}
            ${open?ckCardOpenHTML(card,i):''}
          </div>
          <button data-plandel="${i}" title="Remove step">✕</button>
        </div>`;
      }).join('')
    : '<div class="ck-plan-empty">Script your ideal turn: drag a card\'s ⠿ handle up here, or tap ⤵ on a card — e.g. Dread Ambusher → Shortsword → Hunter\'s Mark. Tap a step for its full info and cast/use buttons. Make templates (+) for different situations: boss fight, defensive, stealth...</div>';
  const clr=$('#ckPlanClear');
  if(clr) clr.style.display=cur.steps.length?'':'none';
  const wiz=$('#ckPlanWizard');
  if(wiz) wiz.style.display=cur.steps.some(p=>p.key.startsWith('atk:'))?'':'none';
  const cc=$('#ckPlanCollapsedCount');
  if(cc) cc.textContent=cur.steps.length?String(cur.steps.length):'';
  const duo=$('#ckDuo');
  if(duo) duo.classList.toggle('ck-plan-collapsed',!!ck().planCollapsed);
}
// Concentration banner, state chips, ★ reminders feed, rules drawer. Concentration/top-states/
// full-states-list each render into every instance found (Combat's HUD + reference zone, and
// Overview's identity banner + states card) — same data, several homes.
function renderCockpitExtras(){
  if(!$('#ckCards')) return;
  ck();
  const concHtml = S.concentration
    ? `◉ Concentrating: <b>${esc(S.concentration.name)}</b> <button data-ckconcdrop title="Drop concentration">✕</button><span class="ck-conc-tip">CON save when you take damage — DC 10 or half the damage, whichever is higher</span>`
    : '';
  $$('.ck-conc').forEach(el=>el.innerHTML=concHtml);
  const topHtml=S.states.map(s=>`<span class="ck-state">${esc(s)}</span>`).join('');
  $$('.ck-topstates').forEach(el=>el.innerHTML=topHtml);
  const listHtml = S.states.length
    ? S.states.map((s,i)=>`<span class="fx-chip">${esc(s)}<button data-stdel="${i}">✕</button></span>`).join('')
    : '<p class="prep-note" style="margin:0">Nothing active.</p>';
  $$('.ck-states-list').forEach(el=>el.innerHTML=listHtml);
  const rems=allFx().filter(x=>x.t==='statnote');
  $('#ckRems').innerHTML = rems.length
    ? rems.map(r=>{
        const amt=(r.n!=null&&String(r.n).trim()!=='')?` <b>${fmt(fxAmount(r.n))}</b>`:'';
        return `<div class="ck-rem">★ ${esc(r.src)} — ${FX_STATS[r.stat]||r.stat}${amt}${r.cond?`<span class="ck-rem-cond">${esc(r.cond)}</span>`:''}</div>`;
      }).join('')
    : '<p class="prep-note" style="margin:0">★ Stat reminders you add on the Features tab show up here and on their stat.</p>';
  const rulesBox=$('#ckRules');
  if(rulesBox && typeof RULES_DB!=='undefined'){
    rulesBox.innerHTML=RULES_DB.map((sec,si)=>{
      const open=CK_RULES_OPEN.has(si);
      return `<div class="ck-rsec ${open?'open':''}">
        <button class="ck-rsec-head" data-ckrsec="${si}">${open?'▾':'▸'} ${esc(sec.s)}</button>
        ${open?`<div class="ck-rsec-body">${sec.items.map(([n,d])=>`<div class="ck-rule"><b>${esc(n)}.</b> ${esc(d)}</div>`).join('')}</div>`:''}
      </div>`;
    }).join('');
  }
}
// Kept name: every existing call site (rests, fxRefresh, tab switch, level-up) now refreshes
// the whole cockpit through this.
function renderCombatFeatures(){ renderCockpitCards(); renderCockpitExtras(); }
function wireCombatFeatures(){
  const box=$('#ckCards'); if(!box) return;
  const refresh=()=>{ renderCombatFeatures(); save(); };
  // Delegated on the whole document, not just #page-combat: several of these controls (state
  // delete, drop-concentration, slot pips) are now mirrored onto Overview's identity banner and
  // right column too, via the same data-ck*/data-stdel attributes.
  document.addEventListener('click',e=>{
    const t=e.target;
    const slot=t.closest('[data-ckslot]');
    if(slot){ const [L,k]=slot.dataset.ckslot.split('.').map(Number);
      const lv=S.spellLevels[L]; lv.used=(k<lv.used)?k:k+1;
      renderSpellLevels(); save(); return; }
    const use=t.closest('[data-ckuse]');
    if(use){ const [gi,k]=use.dataset.ckuse.split('.').map(Number);
      const f=S.features[gi]; if(!f) return;
      f.usesUsed=(k<num(f.usesUsed))?k:k+1; refresh(); return; }
    const cpip=t.closest('[data-ccpip]');
    if(cpip){ const [i,k]=cpip.dataset.ccpip.split('.').map(Number);
      const cc=S.customCards[i]; cc.usesUsed=(k<num(cc.usesUsed))?k:k+1; refresh(); return; }
    const cast=t.closest('[data-ckcast]');
    if(cast){ const raw=cast.dataset.ckcast; // "sp:L.i:k"
      const cut=raw.lastIndexOf(':');
      const fullKey=raw.slice(0,cut), k=+raw.slice(cut+1);
      const sp=ckRef(fullKey); if(!sp) return;
      S.spellLevels[k].used=Math.min(S.spellLevels[k].total,S.spellLevels[k].used+1);
      const prevConc=S.concentration;
      if(spellIsConc(sp)) S.concentration={name:sp.name};
      CK_UNDO={msg:`Cast ${sp.name} — spent a ${ordinalLevel(k)}-level slot.`,slot:k,prevConc};
      renderSpellLevels(); renderCombatFeatures(); save(); return; }
    const ituse=t.closest('[data-ckituse]');
    if(ituse){ const i=+ituse.dataset.ckituse, e=S.equipment[i]; if(!e) return;
      if(String(e.qty??'').trim()===''){ // untracked — nothing to count down
        CK_UNDO={msg:`Used ${e.name}.`,itemIdx:null,noop:true};
        renderCombatFeatures(); return; }
      e.qty=String(Math.max(0,num(e.qty)-1));
      CK_UNDO={msg:`Used ${e.name} — ${num(e.qty)} left.`,itemIdx:i};
      renderEquipment(); renderCombatFeatures(); save(); return; }
    if(t.closest('[data-ckundo]')){
      if(CK_UNDO){
        if(CK_UNDO.noop){ CK_UNDO=null; renderCockpitCards(); return; }
        if(CK_UNDO.itemIdx!=null){
          const e=S.equipment[CK_UNDO.itemIdx];
          if(e) e.qty=String(num(e.qty)+1);
          CK_UNDO=null;
          renderEquipment(); renderCombatFeatures(); save();
        }else{
          const lv=S.spellLevels[CK_UNDO.slot]; lv.used=Math.max(0,lv.used-1);
          S.concentration=CK_UNDO.prevConc||null; CK_UNDO=null;
          renderSpellLevels(); renderCombatFeatures(); save();
        }
      } return; }
    if(t.closest('[data-ckundox]')){ CK_UNDO=null; renderCockpitCards(); return; }
    const plan=t.closest('[data-ckplan]');
    if(plan){ const key=plan.dataset.ckplan;
      const c=cockpitCards().find(x=>x.key===key);
      // Seeded from the card's current type, then independent — editing this step later never
      // touches the card, or any other step that happens to reference the same card.
      ckPlan().steps.push({key,name:c?c.name:key,type:c?c.type:'action'});
      CK_PLAN_OPEN.clear();
      renderCockpitPlan(); save(); return; }
    const pdel=t.closest('[data-plandel]');
    if(pdel){ ckPlan().steps.splice(+pdel.dataset.plandel,1); CK_PLAN_OPEN.clear(); renderCockpitPlan(); save(); return; }
    if(t.closest('#ckPlanRenameBtn')){
      CK_PLAN_RENAME=!CK_PLAN_RENAME; CK_PLAN_RENAME_FOCUS=CK_PLAN_RENAME;
      renderCockpitPlan(); return; }
    if(t.closest('#ckPlanAddBtn')){
      ck(); S.turnPlans.push({name:'Plan '+(S.turnPlans.length+1),steps:[]});
      S.turnPlanIdx=S.turnPlans.length-1; CK_PLAN_OPEN.clear(); CK_PLAN_RENAME=false;
      renderCockpitPlan(); save(); return; }
    if(t.closest('#ckPlanDelBtn')){
      if(S.turnPlans.length>1){
        const di=num(S.turnPlanIdx), p=S.turnPlans[di];
        const what=`Delete plan "${p.name||'Plan '+(di+1)}"${p.steps.length?` and its ${p.steps.length} step${p.steps.length>1?'s':''}`:''}?`;
        uiConfirm(what,{title:'Delete plan',ok:'Delete',danger:true}).then(ok=>{
          if(!ok) return;
          S.turnPlans.splice(di,1);
          if(num(S.turnPlanIdx)>=di) S.turnPlanIdx=Math.max(0,num(S.turnPlanIdx)-1);
          CK_PLAN_OPEN.clear(); CK_PLAN_RENAME=false;
          renderCockpitPlan(); save();
        }); } return; }
    const pin=t.closest('[data-ckpin]');
    if(pin){ const c=ck(), key=pin.dataset.ckpin;
      c.pins=c.pins.includes(key)?c.pins.filter(x=>x!==key):[...c.pins,key]; refresh(); return; }
    const tt=t.closest('[data-cktoggletype]');
    if(tt){ const [key,val]=tt.dataset.cktoggletype.split('::');
      const obj=ckRef(key); const card=cockpitCards().find(x=>x.key===key);
      if(!obj||!card) return;
      const cur=card.types;
      if(cur.includes(val)){ if(cur.length<=1) return; obj.actionTypes=cur.filter(x=>x!==val); } // always keep at least one tag
      else obj.actionTypes=[...cur,val];
      refresh(); return; }
    const st=t.closest('[data-ckstept]');
    if(st){ const [idx,val]=st.dataset.ckstept.split('::');
      const step=ckPlan().steps[+idx]; if(!step) return;
      step.type=val; renderCockpitPlan(); save(); return; }
    const del=t.closest('[data-ccdel]');
    if(del){ uiConfirm('Delete this custom card?',{title:'Delete card',ok:'Delete',danger:true}).then(ok=>{
        if(!ok) return;
        S.customCards.splice(+del.dataset.ccdel,1); closeCkPop(); refresh();
      }); return; }
    const zone=t.closest('[data-ckzone]');
    if(zone){ const cc=ck(), z=zone.dataset.ckzone;
      cc.hiddenZones=cc.hiddenZones.includes(z)?cc.hiddenZones.filter(x=>x!==z):[...cc.hiddenZones,z];
      renderCockpitCards(); save(); return; }
    const rsec=t.closest('[data-ckrsec]');
    if(rsec){ const si=+rsec.dataset.ckrsec;
      CK_RULES_OPEN.has(si)?CK_RULES_OPEN.delete(si):CK_RULES_OPEN.add(si);
      renderCockpitExtras(); return; }
    if(t.closest('[data-ckconcdrop]')){ S.concentration=null; renderCockpitExtras(); save(); return; }
    const sdel=t.closest('[data-stdel]');
    if(sdel){ S.states.splice(+sdel.dataset.stdel,1); renderCockpitExtras(); save(); return; }
    if(t.closest('[data-ckpopclose]')){ closeCkPop(); return; }
    // Card tap opens its detail popover — but not when the tap landed on a control already
    // handled above, or inside the popover itself (accidental scroll-taps on a tablet shouldn't
    // slam it shut). This has to run after every specific data-ck* handler, not before: it matches
    // any click inside a [data-planstep] too, so checking it first swallowed clicks meant for the
    // pin/type-tag/condition controls that live inside an open turn-plan step.
    if(t.closest('input,select,textarea,button,a,.pips,.ck-body')) return;
    const cardEl=t.closest('[data-ckopen]');
    if(cardEl){ const key=cardEl.dataset.ckopen;
      CK_OPEN_KEY===key ? closeCkPop() : openCkPop(key,cardEl);
      return; }
    const pstep=t.closest('[data-planstep]');
    if(pstep){ const i=+pstep.dataset.planstep;
      CK_PLAN_OPEN.has(i)?CK_PLAN_OPEN.delete(i):CK_PLAN_OPEN.add(i);
      renderCockpitPlan(); return; }
    // Anything else — clicked elsewhere on the page — dismisses an open popover, same as tapping
    // outside any other floating panel in the app.
    if(CK_OPEN_KEY && !t.closest('.ck-pop')) closeCkPop();
  });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape' && CK_OPEN_KEY) closeCkPop(); });
  // Typing fields save without re-rendering (keeps focus); selects re-render (they re-sort).
  $('#page-combat').addEventListener('input',e=>{
    const t=e.target;
    if(t.dataset.cktplname!=null){ ckPlan().name=t.value; save(); return; }
    if(t.dataset.plannote!=null){ const p=ckPlan().steps[+t.dataset.plannote]; if(p){p.note=t.value; save();} return; }
    if(t.dataset.ckroll!=null){ const a=S.attacks[+t.dataset.ckroll];
      if(a){ a.rolled=t.value; recalc(); save(); } return; }
    if(t.dataset.ckcond!=null){ const o=ckRef(t.dataset.ckcond); if(o){o.cond=t.value; save();} return; }
    if(t.dataset.cct!=null){ S.customCards[+t.dataset.cct].title=t.value; save(); return; }
    if(t.dataset.ccb!=null){ S.customCards[+t.dataset.ccb].body=t.value; save(); return; }
    if(t.dataset.ccu!=null){ const cc=S.customCards[+t.dataset.ccu];
      cc.usesMax=Math.max(0,num(t.value)); cc.usesUsed=Math.min(num(cc.usesUsed),cc.usesMax); save(); return; }
  });
  $('#ckAddCustom').addEventListener('click',()=>{
    ck(); S.customCards.push({title:'',body:'',actionTypes:['action'],cond:'',usesMax:0,usesUsed:0});
    const key='cc:'+(S.customCards.length-1);
    renderCockpitCards(); save();
    const anchorEl=document.querySelector(`[data-ckopen="${CSS.escape(key)}"]`);
    if(anchorEl) openCkPop(key,anchorEl);
  });
  // Collapsing Turn Plan to a slim tab hands its width back to "Do Something" — a wide screen
  // has room for a card grid many columns deep, and Turn Plan doesn't need to compete with it
  // once a turn is scripted. Dragging a card in still needs the panel open (it's the drop
  // target), but the ⤵ button on every card adds to the plan regardless — collapsing never
  // removes a way to build a turn, just the one that needs the panel visible.
  $('#ckPlanCollapseBtn').addEventListener('click',()=>{ ck().planCollapsed=true; renderCockpitPlan(); save(); });
  $('#ckPlanCollapsedTab').addEventListener('click',()=>{ ck().planCollapsed=false; renderCockpitPlan(); save(); });
  $('#ckPlanWizard').addEventListener('click',openTurnWizard);
  $('#ckPlanClear').addEventListener('click',()=>{
    const n=ckPlan().steps.length;
    const go=()=>{ ckPlan().steps=[]; CK_PLAN_OPEN.clear(); renderCockpitPlan(); save(); };
    if(!n) return go();
    uiConfirm(`Clear all ${n} step${n>1?'s':''} from "${ckPlan().name}"?`,{title:'Clear plan',ok:'Clear',danger:true})
      .then(ok=>{ if(ok) go(); });
  });
  initCkDrag();
  wireCkSearch();
  $('#ckSpellsToggle').addEventListener('click',()=>{ ck().showAllSpells=!ck().showAllSpells; renderCockpitCards(); save(); });
  // Same add-a-state control lives on both Combat and Overview (#ckState*/#ovState*) — one
  // little wiring helper instead of duplicating the click+Enter logic per instance.
  const wireStateAdd=(inId,btnId)=>{
    const inp=$(inId), btn=$(btnId); if(!inp||!btn) return;
    btn.addEventListener('click',()=>{
      const v=inp.value.trim(); if(!v) return;
      ck(); S.states.push(v); inp.value='';
      renderCockpitExtras(); save();
    });
    inp.addEventListener('keydown',e=>{ if(e.key==='Enter') btn.click(); });
  };
  wireStateAdd('#ckStateIn','#ckStateAdd');
  wireStateAdd('#ovStateIn','#ovStateAdd');
  // Death saves stay out of sight while you're up; the header is always tappable to peek.
  $('#ckDeathHead').addEventListener('click',()=>{
    ck().showDeath=!ck().showDeath; recalc(); save();
  });
  $('#ckAtkHead').addEventListener('click',()=>{
    ck().atkOpen=!ck().atkOpen;
    $('#ckAtkPanel').classList.toggle('open',ck().atkOpen);
  });
  $('#ckAtkPanel').classList.toggle('open',!!ck().atkOpen);
}

// Free-text filter over the "Do Something" grid — same live-search pattern as the equipment
// pack's #packSearch: a static input outside the regenerated grid, so typing never fights a
// re-render for focus.
function wireCkSearch(){
  const input=$('#ckSearch'); if(!input||input._ckSearchInit) return; input._ckSearchInit=true;
  input.addEventListener('input',()=>{ CK_SEARCH=input.value; renderCockpitCards(); });
}
// ----- Cockpit drag & drop (Pointer Events) -----
// Native HTML5 drag/drop (dragstart/dragover/drop) never fires from a touch gesture on a
// tablet — the exact device this screen is built for — so a drag-only "add to plan" or
// "reorder steps" gesture would silently be mouse-only. Pointer Events fire identically for
// mouse, touch and pen, so one implementation covers every device. Only the ⠿ handle starts a
// drag (not the whole card/step), so tapping a card to open it or tapping a field never gets
// mistaken for a drag-in-progress. Tap-to-add (⤵) still works untouched as the one-hand
// alternative — this only replaces precise placement and reordering.
function initCkDrag(){
  const root=$('#page-combat'); if(!root||root._ckDragInit) return; root._ckDragInit=true;
  let drag=null; // {kind:'card'|'step', key|idx, stepEl, ghost, dropIndex}

  function planBox(){ return $('#ckPlan'); }
  function stepEls(box){ return [...box.querySelectorAll(':scope > [data-planstep]')].filter(el=>el!==(drag&&drag.stepEl)); }
  function makeGhost(x,y,label){
    const g=document.createElement('div');
    g.className='ck-drag-ghost';
    g.textContent=label;
    g.style.left=x+'px'; g.style.top=y+'px';
    document.body.appendChild(g);
    return g;
  }
  function clearIndicator(){ const n=root.querySelector('.ck-drop-indicator'); if(n) n.remove(); }
  function showIndicatorAt(box,index){
    clearIndicator();
    const line=document.createElement('div');
    line.className='ck-drop-indicator';
    const steps=stepEls(box);
    if(index>=steps.length) box.appendChild(line); else box.insertBefore(line,steps[index]);
  }
  function indexAtPoint(box,clientY){
    const steps=stepEls(box);
    for(let i=0;i<steps.length;i++){
      const r=steps[i].getBoundingClientRect();
      if(clientY<r.top+r.height/2) return i;
    }
    return steps.length;
  }
  function autoScroll(box,clientY){
    const r=box.getBoundingClientRect(), edge=32;
    if(clientY<r.top+edge) box.scrollTop-=16;
    else if(clientY>r.bottom-edge) box.scrollTop+=16;
  }
  function onMove(e){
    if(!drag) return;
    e.preventDefault();
    const p=e.touches?e.touches[0]:e;
    drag.ghost.style.left=(p.clientX+14)+'px';
    drag.ghost.style.top=(p.clientY+10)+'px';
    const box=planBox(); if(!box) return;
    const r=box.getBoundingClientRect();
    const inside=p.clientX>=r.left&&p.clientX<=r.right&&p.clientY>=r.top&&p.clientY<=r.bottom;
    box.classList.toggle('ck-plan-drophover',inside);
    if(inside){
      const idx=indexAtPoint(box,p.clientY);
      drag.dropIndex=idx;
      showIndicatorAt(box,idx);
      autoScroll(box,p.clientY);
    }else{
      drag.dropIndex=null; clearIndicator();
    }
  }
  function endDrag(commit){
    if(!drag) return;
    document.removeEventListener('pointermove',onMove);
    document.removeEventListener('pointerup',onUp);
    document.removeEventListener('pointercancel',onCancel);
    drag.ghost.remove();
    clearIndicator();
    const box=planBox(); if(box) box.classList.remove('ck-plan-drophover');
    if(drag.stepEl) drag.stepEl.classList.remove('ck-dragging-source');
    if(commit && drag.dropIndex!=null){
      ck();
      const steps=ckPlan().steps;
      if(drag.kind==='card'){
        const c=cockpitCards().find(x=>x.key===drag.key);
        steps.splice(drag.dropIndex,0,{key:drag.key,name:c?c.name:drag.key,type:c?c.type:'action'});
      }else{
        // dropIndex already came from indexAtPoint(), which measures against the step list
        // with the dragged step filtered out — so it's already the correct target index in
        // the post-removal array. No further shifting needed (that was double-correcting and
        // could cancel out entirely, e.g. swapping 2 steps appeared to do nothing).
        const [moved]=steps.splice(drag.idx,1);
        steps.splice(drag.dropIndex,0,moved);
      }
      CK_PLAN_OPEN.clear();
      renderCockpitPlan(); save();
    }
    drag=null;
  }
  function onUp(){ endDrag(true); }
  function onCancel(){ endDrag(false); }

  root.addEventListener('pointerdown',e=>{
    const handle=e.target.closest('[data-ckdraghandle]'); if(!handle) return;
    const cardEl=handle.closest('[data-ckdrag]');
    const stepEl=handle.closest('[data-planstep]');
    if(!cardEl && !stepEl) return;
    e.preventDefault();
    const p=e.touches?e.touches[0]:e;
    if(cardEl){
      const key=cardEl.dataset.ckdrag;
      const c=cockpitCards().find(x=>x.key===key);
      drag={kind:'card',key,dropIndex:null,ghost:makeGhost(p.clientX+14,p.clientY+10,(c?c.name:'Card'))};
    }else{
      const idx=+stepEl.dataset.planstep;
      const name=stepEl.querySelector('.ck-ps-name')?.textContent||'Step';
      stepEl.classList.add('ck-dragging-source');
      drag={kind:'step',idx,stepEl,dropIndex:null,ghost:makeGhost(p.clientX+14,p.clientY+10,name)};
    }
    document.addEventListener('pointermove',onMove,{passive:false});
    document.addEventListener('pointerup',onUp);
    document.addEventListener('pointercancel',onCancel);
  });
}

// Build a S.features entry from a FEATURE_LIB entry — shared by the class-feature/feat search
// below and the Level-Up "Feat" picker further down, so both produce identically-wired entries
// (uses, usesScale, the Tough-scales-with-level special case) instead of the two drifting apart.
function libEntryToFeature(ent,source){
  let fx=(ent.fx||[]).map(x=>({...x}));
  if(ent.n==='Tough') fx=[{t:'stat',stat:'hpmax',n:2*Math.max(1,num(S.level))}];
  const usesScale=ent.usesScale||'';
  const usesMax = usesScale ? usesScaleValue(usesScale,ent.usesScaleBonus) : (ent.usesMax||0);
  return {title:ent.n,desc:ent.d,fx,combat:!!ent.combat,actionType:ent.actionType||'',usesMax,usesPer:ent.usesPer||'short',usesUsed:0,usesScale,usesScaleBonus:ent.usesScaleBonus||0,source};
}
// Same job for RACE_LIB entries — shared by the race-trait search box below and the heritage
// auto-grant (syncGrantedFeatures), so a trait added either way comes out identically wired.
function raceEntryToFeature(ent,source){
  // deep-copy effects; Dwarven Toughness scales with current level
  let fx=(ent.fx||[]).map(x=>({...x}));
  if(ent.n==='Dwarven Toughness (Hill Dwarf)') fx=[{t:'stat',stat:'hpmax',n:Math.max(1,num(S.level))}];
  // Traits like Orc's Adrenaline Rush (proficiency) or a CHA/WIS/etc-scaled one carry usesScale
  // so their max uses stay synced to that stat automatically as you level up.
  const usesScale=ent.usesScale||'';
  const usesMax = usesScale ? usesScaleValue(usesScale,ent.usesScaleBonus) : (ent.usesMax||0);
  return {title:ent.n,desc:ent.d,fx,combat:!!ent.combat,usesMax,usesPer:ent.usesPer||'short',usesUsed:0,usesScale,usesScaleBonus:ent.usesScaleBonus||0,source};
}
// Same job for BACKGROUND_LIB entries — no level-scaling special case exists for any background.
function backgroundEntryToFeature(ent,source){
  const fx=(ent.fx||[]).map(x=>({...x}));
  const usesScale=ent.usesScale||'';
  const usesMax = usesScale ? usesScaleValue(usesScale,ent.usesScaleBonus) : (ent.usesMax||0);
  return {title:ent.n,desc:ent.d,fx,combat:!!ent.combat,usesMax,usesPer:ent.usesPer||'short',usesUsed:0,usesScale,usesScaleBonus:ent.usesScaleBonus||0,source};
}
// ----- Feature library: searchable instead of one giant native <select> (a lot of options) -----
// Both search boxes used to list the entire library — all twelve classes, every subclass, every
// heritage — no matter who you were playing, so finding your own Channel Divinity meant scrolling
// past eleven other classes' features. They now default to "yours": your class, your subclass,
// your heritage, capped at your level, plus feats (which anyone can take). The scope button flips
// back to the full list for multiclassing, homebrew, or just browsing.
let LIB_SCOPE_MINE=true;
function libEntryIsMine(e){
  const c=CLASSES[S.classId];
  if(e.g==='Feats') return true;
  if(!c) return false;
  const own = e.g===c.name || (S.subclass && e.g===c.name+' — '+S.subclass);
  return own && num(e.l)<=num(S.level);
}
function raceEntryIsMine(e){
  const ri=raceInfo(); if(!ri) return false;
  return e.g===ri.r.name && raceTraitApplies(e.n,(ri.sub&&ri.sub.name)||'');
}
function backgroundEntryIsMine(e){
  const bg=BACKGROUNDS[S.backgroundId]; return !!bg && e.g===bg.name;
}
function renderLibScope(){
  const b=$('#libScope'); if(!b) return;
  b.textContent=LIB_SCOPE_MINE?'⌾ Mine only':'◎ Whole library';
  b.classList.toggle('on',LIB_SCOPE_MINE);
}
function wireLibScope(){
  renderLibScope();
  $('#libScope')?.addEventListener('click',()=>{
    LIB_SCOPE_MINE=!LIB_SCOPE_MINE;
    renderLibScope();
    // Repaint whichever list is open so the change is visible immediately.
    $('#libSearch')?.dispatchEvent(new Event('input',{bubbles:true}));
    $('#raceSearch')?.dispatchEvent(new Event('input',{bubbles:true}));
    $('#backgroundSearch')?.dispatchEvent(new Event('input',{bubbles:true}));
  });
}
function wireLibrary(){
  const input=$('#libSearch'), panel=$('#libResults');
  const groupsOrder=[...new Set(FEATURE_LIB.map(e=>e.g))];
  const matches=(e,q)=>!q || e.n.toLowerCase().includes(q) || e.g.toLowerCase().includes(q) || (e.d||'').toLowerCase().includes(q);
  function renderResults(){
    const q=input.value.trim().toLowerCase();
    const items=FEATURE_LIB.map((e,idx)=>({...e,idx}))
      .filter(e=>(!LIB_SCOPE_MINE||libEntryIsMine(e))&&matches(e,q));
    if(!items.length){
      panel.innerHTML=`<div class="empty">No matches${LIB_SCOPE_MINE?' — "Mine only" is on, tap it to search the whole library':''}</div>`;
      return;
    }
    panel.innerHTML=groupsOrder.map(g=>{
      const inGroup=items.filter(e=>e.g===g);
      if(!inGroup.length) return '';
      return `<div class="grp">${esc(g)}</div>`+
        inGroup.map(e=>`<div class="item" data-libidx="${e.idx}">${e.combat?'⚔ ':''}${e.l?e.l+' · ':''}${esc(e.n)}<small>${esc(e.d||'')}</small></div>`).join('');
    }).join('');
  }
  const open=()=>{ renderResults(); panel.classList.add('open'); };
  const close=()=>panel.classList.remove('open');
  input.addEventListener('focus',open);
  input.addEventListener('input',open);
  panel.addEventListener('click',e=>{
    const item=e.target.closest('[data-libidx]'); if(!item) return;
    const ent=FEATURE_LIB[+item.dataset.libidx];
    // "smart" add: library entries already know if they're combat-relevant and how many uses per rest,
    // so a feature like Action Surge shows up on the Combat tab immediately, no manual setup needed.
    // A few carry usesScale (proficiency bonus or an ability mod, e.g. Bardic Inspiration = CHA)
    // so their max stays synced automatically as you level up or raise that ability.
    // Tag where this came from — class feature vs. feat — so the card can wear its source
    // as a colored wax seal instead of every feature looking identical.
    // "Cleric — Life Domain" groups are subclass features and get their own source kind, so a
    // subclass card is distinguishable from a base-class one instead of both reading as "class".
    const isSub=ent.g.includes(' — ');
    const source = ent.g==='Feats' ? {kind:'feat'}
      : {kind:isSub?'subclass':'class',classId:classIdFromGroupName(ent.g),className:ent.g,
         ...(isSub?{subclassName:ent.g.split(' — ')[1]}:{})};
    S.features.push(libEntryToFeature(ent,source));
    input.value=''; close();
    fxRefresh();
  });
  document.addEventListener('click',e=>{
    if(!e.target.closest('#libSearch') && !e.target.closest('#libResults')) close();
  });
}
// ----- Race traits: its own search box next to the class-feature library, same pick pattern -----
function wireRaceLibrary(){
  const input=$('#raceSearch'), panel=$('#raceResults'); if(!input) return;
  const groupsOrder=[...new Set(RACE_LIB.map(e=>e.g))];
  const matches=(e,q)=>!q || e.n.toLowerCase().includes(q) || e.g.toLowerCase().includes(q) || (e.d||'').toLowerCase().includes(q);
  function renderResults(){
    const q=input.value.trim().toLowerCase();
    const items=RACE_LIB.map((e,idx)=>({...e,idx}))
      .filter(e=>(!LIB_SCOPE_MINE||raceEntryIsMine(e))&&matches(e,q));
    if(!items.length){
      panel.innerHTML=`<div class="empty">No matches${LIB_SCOPE_MINE?' — "Mine only" is on, tap it to search every heritage':''}</div>`;
      return;
    }
    panel.innerHTML=groupsOrder.map(g=>{
      const inGroup=items.filter(e=>e.g===g);
      if(!inGroup.length) return '';
      return `<div class="grp">${esc(g)}</div>`+
        inGroup.map(e=>`<div class="item" data-raceidx="${e.idx}">${e.combat?'⚔ ':''}${esc(e.n)}<small>${esc(e.d||'')}</small></div>`).join('');
    }).join('');
  }
  const open=()=>{ renderResults(); panel.classList.add('open'); };
  const close=()=>panel.classList.remove('open');
  input.addEventListener('focus',open);
  input.addEventListener('input',open);
  panel.addEventListener('click',e=>{
    const item=e.target.closest('[data-raceidx]'); if(!item) return;
    const ent=RACE_LIB[+item.dataset.raceidx];
    S.features.push(raceEntryToFeature(ent,{kind:'race',raceName:ent.g}));
    input.value=''; close();
    fxRefresh();
  });
  document.addEventListener('click',e=>{
    if(!e.target.closest('#raceSearch') && !e.target.closest('#raceResults')) close();
  });
}
// ----- Background traits: same search-and-pick pattern as the race trait library above -----
function wireBackgroundLibrary(){
  const input=$('#backgroundSearch'), panel=$('#backgroundResults'); if(!input) return;
  const groupsOrder=[...new Set(BACKGROUND_LIB.map(e=>e.g))];
  const matches=(e,q)=>!q || e.n.toLowerCase().includes(q) || e.g.toLowerCase().includes(q) || (e.d||'').toLowerCase().includes(q);
  function renderResults(){
    const q=input.value.trim().toLowerCase();
    const items=BACKGROUND_LIB.map((e,idx)=>({...e,idx}))
      .filter(e=>(!LIB_SCOPE_MINE||backgroundEntryIsMine(e))&&matches(e,q));
    if(!items.length){
      panel.innerHTML=`<div class="empty">No matches${LIB_SCOPE_MINE?' — "Mine only" is on, tap it to search every background':''}</div>`;
      return;
    }
    panel.innerHTML=groupsOrder.map(g=>{
      const inGroup=items.filter(e=>e.g===g);
      if(!inGroup.length) return '';
      return `<div class="grp">${esc(g)}</div>`+
        inGroup.map(e=>`<div class="item" data-backgroundidx="${e.idx}">${esc(e.n)}<small>${esc(e.d||'')}</small></div>`).join('');
    }).join('');
  }
  const open=()=>{ renderResults(); panel.classList.add('open'); };
  const close=()=>panel.classList.remove('open');
  input.addEventListener('focus',open);
  input.addEventListener('input',open);
  panel.addEventListener('click',e=>{
    const item=e.target.closest('[data-backgroundidx]'); if(!item) return;
    const ent=BACKGROUND_LIB[+item.dataset.backgroundidx];
    S.features.push(backgroundEntryToFeature(ent,{kind:'background',backgroundName:ent.g}));
    input.value=''; close();
    fxRefresh();
  });
  document.addEventListener('click',e=>{
    if(!e.target.closest('#backgroundSearch') && !e.target.closest('#backgroundResults')) close();
  });
}
// ----- Languages: same searchable pick-list pattern as the feature library, plus removable chips -----
function renderLanguages(){
  const box=$('#langChips'); if(!box) return;
  if(!S.languages.length){ box.innerHTML='<p class="prep-note" style="margin:0">No languages picked yet — search above to add one.</p>'; return; }
  box.innerHTML = S.languages.map((l,i)=>
    `<span class="fx-chip">${esc(l)}<button data-langdel="${i}" title="Remove">✕</button></span>`).join('');
}
function wireLanguages(){
  const input=$('#langSearch'), panel=$('#langResults');
  const groupsOrder=[...new Set(LANGUAGES.map(e=>e.g))];
  function renderResults(){
    const q=input.value.trim().toLowerCase();
    const known=new Set(S.languages.map(l=>l.toLowerCase()));
    const items=LANGUAGES.filter(e=>!known.has(e.n.toLowerCase())&&(!q||e.n.toLowerCase().includes(q)));
    let html=groupsOrder.map(g=>{
      const inGroup=items.filter(e=>e.g===g);
      if(!inGroup.length) return '';
      return `<div class="grp">${esc(g)}</div>`+
        inGroup.map(e=>`<div class="item" data-langpick="${esc(e.n)}">${esc(e.n)}</div>`).join('');
    }).join('');
    // Let a typed name that isn't in the preset list be added as-is (homebrew/regional languages)
    const typed=input.value.trim();
    if(typed && !known.has(typed.toLowerCase()) && !LANGUAGES.some(e=>e.n.toLowerCase()===typed.toLowerCase())){
      html += `<div class="grp">Custom</div><div class="item" data-langpick="${esc(typed)}">+ Add "${esc(typed)}"</div>`;
    }
    panel.innerHTML = html || '<div class="empty">No matches</div>';
  }
  const open=()=>{ renderResults(); panel.classList.add('open'); };
  const close=()=>panel.classList.remove('open');
  input.addEventListener('focus',open);
  input.addEventListener('input',open);
  input.addEventListener('keydown',e=>{
    if(e.key==='Enter'){ e.preventDefault(); const hi=panel.querySelector('.item'); if(hi) hi.click(); }
  });
  panel.addEventListener('click',e=>{
    const item=e.target.closest('[data-langpick]'); if(!item) return;
    const name=item.dataset.langpick;
    if(name && !S.languages.some(l=>l.toLowerCase()===name.toLowerCase())) S.languages.push(name);
    input.value=''; close();
    renderLanguages(); save();
  });
  $('#langChips').addEventListener('click',e=>{
    const btn=e.target.closest('[data-langdel]'); if(!btn) return;
    S.languages.splice(+btn.dataset.langdel,1);
    renderLanguages(); save();
  });
  document.addEventListener('click',e=>{
    if(!e.target.closest('#langSearch') && !e.target.closest('#langResults')) close();
  });
}
// ----- Other Proficiencies: same searchable pick-list + chips pattern as Languages, sourced from
// the PHB armor/weapon/tool categories in PROFICIENCIES so picks come with a rules explanation
// instead of being freehand text. The old profLang textarea stays underneath for anything that
// doesn't fit the list (homebrew tools, a specific weapon model) so no previously typed text is lost.
function renderProficiencies(){
  const box=$('#profChips'); if(!box) return;
  if(!S.otherProfs.length){ box.innerHTML='<p class="prep-note" style="margin:0">No proficiencies picked yet — search above to add one.</p>'; return; }
  box.innerHTML = S.otherProfs.map((p,i)=>
    `<span class="fx-chip">${esc(p)}<button data-profdel="${i}" title="Remove">✕</button></span>`).join('');
}
function wireProficiencies(){
  const input=$('#profSearch'), panel=$('#profResults');
  const groupsOrder=[...new Set(PROFICIENCIES.map(e=>e.g))];
  function renderResults(){
    const q=input.value.trim().toLowerCase();
    const known=new Set(S.otherProfs.map(p=>p.toLowerCase()));
    const items=PROFICIENCIES.filter(e=>!known.has(e.n.toLowerCase())&&(!q||e.n.toLowerCase().includes(q)));
    let html=groupsOrder.map(g=>{
      const inGroup=items.filter(e=>e.g===g);
      if(!inGroup.length) return '';
      return `<div class="grp">${esc(g)}</div>`+
        inGroup.map(e=>`<div class="item" data-profpick="${esc(e.n)}">${esc(e.n)}<small>${esc(e.d||'')}</small></div>`).join('');
    }).join('');
    const typed=input.value.trim();
    if(typed && !known.has(typed.toLowerCase()) && !PROFICIENCIES.some(e=>e.n.toLowerCase()===typed.toLowerCase())){
      html += `<div class="grp">Custom</div><div class="item" data-profpick="${esc(typed)}">+ Add "${esc(typed)}"</div>`;
    }
    panel.innerHTML = html || '<div class="empty">No matches</div>';
  }
  const open=()=>{ renderResults(); panel.classList.add('open'); };
  const close=()=>panel.classList.remove('open');
  input.addEventListener('focus',open);
  input.addEventListener('input',open);
  input.addEventListener('keydown',e=>{
    if(e.key==='Enter'){ e.preventDefault(); const hi=panel.querySelector('.item'); if(hi) hi.click(); }
  });
  panel.addEventListener('click',e=>{
    const item=e.target.closest('[data-profpick]'); if(!item) return;
    const name=item.dataset.profpick;
    if(name && !S.otherProfs.some(p=>p.toLowerCase()===name.toLowerCase())) S.otherProfs.push(name);
    input.value=''; close();
    renderProficiencies(); save();
  });
  $('#profChips').addEventListener('click',e=>{
    const btn=e.target.closest('[data-profdel]'); if(!btn) return;
    S.otherProfs.splice(+btn.dataset.profdel,1);
    renderProficiencies(); save();
  });
  document.addEventListener('click',e=>{
    if(!e.target.closest('#profSearch') && !e.target.closest('#profResults')) close();
  });
}
function wireFx(){
  // ⚔ "Show in Combat tab" toggle (a compact button, not a checkbox+label) + its uses tracker config
  $$('[data-combat]').forEach(el=>el.addEventListener('click',()=>{
    const f=S.features[+el.dataset.combat];
    f.combat=!f.combat;
    if(f.usesMax==null) f.usesMax=0;
    if(!f.usesPer) f.usesPer='short';
    if(f.usesUsed==null) f.usesUsed=0;
    fxRefresh();
  }));
  $$('[data-uses]').forEach(el=>el.addEventListener('input',()=>{
    const f=S.features[+el.dataset.uses];
    f.usesMax=num(el.value);
    f.usesUsed=Math.min(num(f.usesUsed),f.usesMax);
    renderCombatFeatures(); save();
  }));
  $$('[data-usesper]').forEach(el=>el.addEventListener('change',()=>{
    S.features[+el.dataset.usesper].usesPer=el.value;
    renderCombatFeatures(); save();
  }));
  // Tie this feature's max uses to a live stat (proficiency or an ability modifier) instead of a
  // fixed number that goes stale the moment you level up or bump that ability.
  $$('[data-usesscale]').forEach(el=>el.addEventListener('change',()=>{
    const f=S.features[+el.dataset.usesscale];
    f.usesScale=el.value;
    const sv=usesScaleValue(f.usesScale,f.usesScaleBonus);
    if(sv!=null){ f.usesMax=sv; f.usesUsed=Math.min(num(f.usesUsed),f.usesMax); }
    renderFeatures(); renderCombatFeatures(); save();
  }));
  $$('[data-usesbonus]').forEach(el=>el.addEventListener('change',()=>{
    const f=S.features[+el.dataset.usesbonus];
    f.usesScaleBonus=num(el.value);
    const sv=usesScaleValue(f.usesScale,f.usesScaleBonus);
    if(sv!=null){ f.usesMax=sv; f.usesUsed=Math.min(num(f.usesUsed),f.usesMax); }
    renderFeatures(); renderCombatFeatures(); save();
  }));
  // "+ Effect" ghost button — collapsed by default so a card with no effect in progress stays
  // clean; tapping it reveals the type picker in its place.
  $$('[data-fxopen]').forEach(b=>b.addEventListener('click',()=>{
    const i=+b.dataset.fxopen;
    FX_DRAFT[i]={_pickerOpen:true};
    renderFeatures();
  }));
  $$('[data-fxtype]').forEach(s=>s.addEventListener('change',()=>{
    const i=+s.dataset.fxtype;
    FX_DRAFT[i]=s.value?{t:s.value,stat:'ac',n:s.value==='statnote'?'':1,skills:[],grant:'prof',ab:'str',text:'',kind:'dprof'}:{_pickerOpen:true};
    renderFeatures();
  }));
  $$('[data-fxk]').forEach(s=>s.addEventListener('change',()=>{
    FX_DRAFT[+s.dataset.fxk].kind=s.value;
    renderFeatures(); // flat bonus shows an extra number field
  }));
  $$('[data-fxa]').forEach(s=>s.addEventListener('change',()=>{
    const d=FX_DRAFT[+s.dataset.fxa];
    if(d.t==='stat'||d.t==='statnote') d.stat=s.value; else if(d.t==='save') d.ab=s.value;
  }));
  // multi-skill picker (used by 'skill' and 'note' effect types) — tappable chips, not checkboxes.
  // Delegated per-picker so it survives re-renders triggered by other controls (e.g. the kind select).
  $$('[data-fxskills]').forEach(box=>box.addEventListener('click',e=>{
    const chip=e.target.closest('.skpick'); if(!chip) return;
    const i=+box.dataset.fxskills;
    chip.classList.toggle('on');
    FX_DRAFT[i].skills=$$(`[data-fxskills="${i}"] .skpick.on`).map(c=>c.dataset.skillval);
  }));
  // Amounts stay raw text so formulas like "PROF" or "DEX+1" survive; the little "= N" hint
  // next to the stat-bonus field previews what the formula resolves to right now.
  $$('[data-fxn]').forEach(el=>el.addEventListener('input',()=>{
    FX_DRAFT[+el.dataset.fxn].n=el.value;
    const hint=el.parentElement&&el.parentElement.querySelector('.fx-amt-hint');
    if(hint) hint.textContent=`= ${fmt(fxAmount(el.value))}`;
  }));
  $$('[data-fxg]').forEach(el=>el.addEventListener('change',()=>{FX_DRAFT[+el.dataset.fxg].grant=el.value;}));
  $$('[data-fxt]').forEach(el=>el.addEventListener('input',()=>{FX_DRAFT[+el.dataset.fxt].text=el.value;}));
  // ✎ Edit: loads the effect into the draft AND remembers its index, so "Save changes" replaces
  // it in place instead of adding a duplicate.
  $$('[data-fxedit]').forEach(b=>b.addEventListener('click',()=>{
    const [i,j]=b.dataset.fxedit.split('.').map(Number);
    const x=S.features[i].fx[j];
    FX_DRAFT[i]={...x,skills:xSkills(x).slice(),grant:x.grant||'prof',kind:x.kind==='prof'?'dprof':(x.kind||'dprof'),text:x.cond||x.text||'',_editIdx:j};
    renderFeatures();
  }));
  // ⧉ Copy: loads the same fields but WITHOUT an edit index, so the button reads "Add" and
  // saving creates a brand-new effect — the original is untouched.
  $$('[data-fxcopy]').forEach(b=>b.addEventListener('click',()=>{
    const [i,j]=b.dataset.fxcopy.split('.').map(Number);
    const x=S.features[i].fx[j];
    FX_DRAFT[i]={...x,skills:xSkills(x).slice(),grant:x.grant||'prof',kind:x.kind==='prof'?'dprof':(x.kind||'dprof'),text:x.cond||x.text||''};
    renderFeatures();
  }));
  $$('[data-fxcancel]').forEach(b=>b.addEventListener('click',()=>{
    FX_DRAFT[+b.dataset.fxcancel]={};
    renderFeatures();
  }));
  $$('[data-fxok]').forEach(b=>b.addEventListener('click',()=>{
    const i=+b.dataset.fxok, d=FX_DRAFT[i]; if(!d||!d.t) return;
    const f=S.features[i]; f.fx=f.fx||[];
    // Keep amounts as typed: pure numbers become numbers, formulas stay strings for fxAmount()
    const rawN=v=>{const s=String(v??'').trim();return /^[+-]?\d+$/.test(s)?+s:s;};
    const x={t:d.t};
    if(d.t==='stat'){x.stat=d.stat;x.n=rawN(d.n)||0;}
    if(d.t==='skill'){
      const sk=xSkills(d); if(!sk.length) return;
      x.skills=sk;x.grant=d.grant;
    }
    if(d.t==='save'){x.ab=d.ab;}
    if(d.t==='note'){
      const sk=xSkills(d); if(!sk.length) return;
      x.skills=sk;x.kind=(d.kind==='prof'?'dprof':d.kind)||'dprof';x.cond=d.text||'';if(d.kind==='flat')x.n=rawN(d.n)||0;
    }
    if(d.t==='statnote'){
      x.stat=d.stat;x.cond=d.text||'';
      const s=String(d.n??'').trim(); if(s) x.n=rawN(s);
    }
    if(d._editIdx!=null && f.fx[d._editIdx]) f.fx[d._editIdx]=x; else f.fx.push(x);
    FX_DRAFT[i]={};
    fxRefresh();
  }));
  $$('[data-fxdel]').forEach(b=>b.addEventListener('click',()=>{
    const [i,j]=b.dataset.fxdel.split('.').map(Number);
    S.features[i].fx.splice(j,1);
    fxRefresh();
  }));
}
// A handful of common tags get a fixed elemental color (same palette as the ability cards) so
// they read consistently across a whole campaign's worth of notes; anything else falls back to
// a neutral gold-dim so custom tags still look intentional, not broken.
const NOTE_TAG_COLORS={combat:'var(--rust)',lore:'var(--blue)',npc:'var(--amber)',loot:'var(--verdant)',personal:'var(--rose)',quest:'var(--gold)'};
function noteTagColor(tag){ return NOTE_TAG_COLORS[tag.toLowerCase()] || 'var(--gold-dim)'; }
// A new note's session marker fills itself in: "Session N" where N is one past the highest
// session number already used (so it climbs on its own instead of the player tracking it by
// hand), plus today's date so the timeline entry is dated the moment it's created.
function nextSessionLabel(){
  let max=0;
  S.notes.forEach(n=>{ const m=/session\s*(\d+)/i.exec(n.session||''); if(m) max=Math.max(max,+m[1]); });
  const date=new Date().toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'});
  return `Session ${max+1} · ${date}`;
}
function escRe(s){ return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }
// "Smart" here means: every typed word has to appear SOMEWHERE across title/body/session/tags,
// in any order, in any field — not one exact substring match against the whole note. That's what
// lets "bridge combat" find a note titled "Ambush at Miller's Bridge" tagged Combat.
function noteMatches(n,terms){
  if(!terms.length) return true;
  const hay=[n.title,n.body,n.session,...(n.tags||[])].join('\n').toLowerCase();
  return terms.every(t=>hay.includes(t));
}
function renderNoteFilters(){
  const box=$('#noteTagFilters'); if(!box) return;
  const tags=[...new Set(S.notes.flatMap(n=>n.tags||[]))];
  box.innerHTML=tags.map(t=>
    `<button type="button" class="tl-filter${activeNoteFilters.has(t)?' on':''}" data-tag="${esc(t)}" style="--accent:${noteTagColor(t)}">${esc(t)}</button>`
  ).join('');
  $$('#noteTagFilters .tl-filter').forEach(b=>b.addEventListener('click',()=>{
    activeNoteFilters.has(b.dataset.tag) ? activeNoteFilters.delete(b.dataset.tag) : activeNoteFilters.add(b.dataset.tag);
    renderNotes();
  }));
}
function renderNotes(){
  renderNoteFilters();
  const terms=noteSearchQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
  // Keep each row's real index (for data-li/data-del paths) while showing most-recently-added
  // notes first — a session log reads top-down as "what just happened", not "what happened first".
  const rows=S.notes.map((n,i)=>({n,i})).filter(({n})=>
    noteMatches(n,terms) && (!activeNoteFilters.size || (n.tags||[]).some(t=>activeNoteFilters.has(t)))
  ).reverse();
  $('#noteList').innerHTML = rows.length ? rows.map(({n,i})=>`
    <div class="tl-entry">
      <div class="tl-dot"></div>
      <input type="text" class="tl-session" value="${esc(n.session)}" data-li="notes.${i}.session" placeholder="Session / date…">
      <div class="tl-card">
        <div class="tl-card-head">
          <input type="text" class="tl-note-title" value="${esc(n.title)}" data-li="notes.${i}.title" placeholder="Note title">
          <button class="del-btn" data-del="notes.${i}">✕</button>
        </div>
        <textarea data-li="notes.${i}.body" placeholder="Write anything...">${esc(n.body)}</textarea>
        <div class="tl-tag-row">
          ${(n.tags||[]).map((t,ti)=>`<span class="tl-tag" style="--accent:${noteTagColor(t)}">${esc(t)}<button type="button" data-deltag="${i}.${ti}">✕</button></span>`).join('')}
          <input type="text" class="tl-tag-add" data-tagadd="${i}" placeholder="+ tag" autocomplete="off">
        </div>
      </div>
    </div>`).join('')
    : `<p class="prep-note" style="margin:0">${S.notes.length?'No notes match your search.':'No notes yet — jot down anything with the +New note button below.'}</p>`;
  wireList('#noteList');
  wireNoteExtras();
}
function wireNoteExtras(){
  $$('#noteList [data-tagadd]').forEach(inp=>inp.addEventListener('keydown',e=>{
    if(e.key!=='Enter') return;
    e.preventDefault();
    const i=+inp.dataset.tagadd, val=inp.value.trim();
    if(val){
      const tags=S.notes[i].tags=(S.notes[i].tags||[]);
      if(!tags.some(t=>t.toLowerCase()===val.toLowerCase())) tags.push(val);
      save();
    }
    renderNotes();
  }));
  $$('#noteList [data-deltag]').forEach(b=>b.addEventListener('click',()=>{
    const [i,ti]=b.dataset.deltag.split('.').map(Number);
    S.notes[i].tags.splice(ti,1);
    renderNotes(); save();
  }));
}
function wireNotes(){
  const search=$('#noteSearch'); if(!search) return;
  search.addEventListener('input',()=>{ noteSearchQuery=search.value; renderNotes(); });
}
// Power-tier accent (mirrors the elemental accents on Ability Scores/Skills): cantrips read as
// cool silver sparks, low-level spells arcane blue, mid-level mystic violet, and 7th-9th the
// same legendary gold as the rest of the sheet's "this is powerful" language.
function spellTier(L){ return L===0?0 : L<=3?1 : L<=6?2 : 3; }
// Chapter-mark numeral for a spell level's watermark — grimoire levels are I-IX, cantrips get
// their own sigil (rendered separately since L===0 never reaches this).
function toRoman(n){ return ['','I','II','III','IV','V','VI','VII','VIII','IX'][n]||String(n); }
// "Cantrip"/"1st"/"2nd"... — shared by the search results grouping and each spell row's
// move-to-level select.
function ordinalLevel(L){ return L===0?'Cantrip':L+(L===1?'st':L===2?'nd':L===3?'rd':'th'); }
// Read-only pills built from the spell's own castTag/conc/ritual — owned, editable state (see
// the tag-picker in spellRowEdit below), not a live DB lookup, so a homebrew spell with no DB
// entry can carry pills too.
function spellTagsHTML(sp){
  let out='';
  if(sp.castTag==='action') out+='<span class="sp-pill pill-action">Action</span>';
  else if(sp.castTag==='bonus') out+='<span class="sp-pill pill-bonus">Bonus Action</span>';
  else if(sp.castTag==='reaction') out+='<span class="sp-pill pill-react">Reaction</span>';
  if(sp.conc) out+='<span class="sp-pill pill-conc">Concentration</span>';
  if(sp.ritual) out+='<span class="sp-pill pill-ritual">Ritual</span>';
  return out;
}
// Compact grid tile for locked/reading mode. Only what a player needs to decide "do I cast this"
// stays always-visible (name, action type, range/duration, damage/heal, one-line effect) — packed
// into a multi-column grid (see .tome-grid) instead of one full-width row per spell, so many more
// spells are scannable without scrolling. Tapping the card (wireSpellModal, delegated on
// #spellLevels) opens the exact same depth of detail spellRowLocked used to reveal inline —
// stats/pills/resolve/damage/description/SRD facts — now in a modal so the grid itself never
// reflows under the reader.
function spellCardHTML(sp,L,i){
  const [,rg,du]=splitMeta(sp.meta);
  const dot=L===0?'':`<button class="dot ${sp.prep?'on':''}" data-prep="${L}.${i}" title="Prepared"></button>`;
  // Spelled out, not abbreviated to a bare letter — a player scanning mid-combat shouldn't have
  // to decode a badge (or hover a tooltip that doesn't exist on a tablet) to know Action from
  // Reaction. Same .sp-pill/.pill-* the modal already uses, so the color coding matches too.
  const actWord={action:'Action',bonus:'Bonus Action',reaction:'Reaction'}[sp.castTag];
  const actPill=actWord?`<span class="sp-pill pill-${sp.castTag==='reaction'?'react':sp.castTag}">${actWord}</span>`:'';
  const meta=[rg,du].filter(Boolean).join(' · ');
  const effect=sp.dmg?`<div class="sc-effect${sp.heal?' heal':''}">${sp.heal?'✨':'🔥'} ${esc(sp.dmg)}</div>`:'';
  return `
  <div class="spell-card" data-spellcard="${L}.${i}">
    <div class="sc-head">${dot}<span class="sc-name">${esc(sp.name)||'Unnamed spell'}</span></div>
    ${actPill||meta?`<div class="sc-meta">${actPill}${meta?`<span>${esc(meta)}</span>`:''}</div>`:''}
    ${effect}
    ${sp.desc?`<p class="sc-desc">${esc(sp.desc)}</p>`:''}
  </div>`;
}
// The full-detail modal for a Tome Grid card — reuses spellRowLocked's own building blocks
// (spellTagsHTML, spellDetailHTML, spellRulesCallout) so opening a card shows literally the same
// depth of information the old inline-expand used to, just staged in an overlay instead.
function spellModalHTML(sp,L,i){
  const pills=spellTagsHTML(sp);
  const detail=spellDetailHTML(sp.name,L);
  const db=SPELL_DB[(sp.name||'').trim().toLowerCase()];
  const [t,rg,du]=splitMeta(sp.meta);
  const comp=db?db.cp.split('').join(', '):'';
  const resolve=spellRulesCallout(sp.desc).resolve;
  const dot=L===0?'':`<button class="dot ${sp.prep?'on':''}" data-prep="${L}.${i}" title="Prepared"></button>`;
  return `
  <button class="close-x" data-spellmodalclose type="button">✕</button>
  <span class="spell-modal-numeral">${L===0?'✦':toRoman(L)}</span>
  <div class="spell-modal-head">${dot}<div class="spell-modal-name">${esc(sp.name)||'Unnamed spell'}</div></div>
  <div class="spell-modal-level">${L===0?'Cantrip':ordinalLevel(L)+' Level'}</div>
  <div class="spell-modal-body">
    <div class="spell-stats">
      <div class="ss-cell"><b>Cast</b><span>${esc(t)||'—'}</span></div>
      <div class="ss-cell"><b>Range</b><span>${esc(rg)||'—'}</span></div>
      <div class="ss-cell"><b>Duration</b><span>${esc(du)||'—'}</span></div>
      <div class="ss-cell"><b>Comp.</b><span>${esc(comp)||'—'}</span></div>
    </div>
    ${pills?`<div class="spell-pills">${pills}</div>`:''}
    ${resolve?`<div class="spell-resolve">${resolve.glyph} ${esc(resolve.label)}</div>`:''}
    ${sp.dmg?`<div class="spell-damage${sp.heal?' heal':''}">${sp.heal?'✨':'🔥'} ${esc(sp.dmg)}</div>`:''}
    ${sp.desc?`<p class="spell-desc-ro">${esc(sp.desc)}</p>`:''}
    ${detail}
  </div>`;
}
// Editing-mode row — same stat-strip skeleton as the locked row above (three of its four cells
// just become inputs instead of text), so unlocking never reflows the layout, only what's inside
// the cells. Cast/Range/Duration stay one underlying `meta` string (see splitMeta) so unlocking
// never risks losing anything a player typed in there before this existed. Pills become a
// tag-picker (click to set/clear Action/Bonus/Reaction, toggle Concentration/Ritual) and the
// damage line becomes a plain text field + a heal toggle — both auto-filled once when the spell
// is picked, then fully owned by the player, same as everything else on this row.
function spellRowEdit(sp,L,i){
  const detail=spellDetailHTML(sp.name,L);
  const db=SPELL_DB[(sp.name||'').trim().toLowerCase()];
  const [t,rg,du]=splitMeta(sp.meta);
  const comp=db?db.cp.split('').join(', '):'';
  // Picked the wrong level, or a spell got reflavored to a different one? Move it in place
  // instead of deleting the row and retyping the name in the right level's section.
  const lvlSelect=`<select class="spell-lvlsel" data-spellmove="${L}.${i}" title="Move to a different level">
    ${Array.from({length:10},(_,k)=>`<option value="${k}" ${k===L?'selected':''}>${ordinalLevel(k)}</option>`).join('')}
  </select>`;
  const tagBtn=(val,label,cls)=>`<button class="tagbtn ${cls}${sp.castTag===val?' on':''}" data-tagcast="${L}.${i}.${val}">${label}</button>`;
  return `
  <div class="spell-entry">
    <div class="spell-row">
      ${L===0?'':`<button class="dot ${sp.prep?'on':''}" data-prep="${L}.${i}" title="Prepared"></button>`}
      <input type="text" value="${esc(sp.name)}" data-li="spellLevels.${L}.spells.${i}.name" data-spellrow="${L}.${i}" placeholder="Spell name…">
      ${detail?`<button class="spell-info-btn" data-spellinfo title="More info">ℹ</button>`:''}
      ${lvlSelect}
      <button class="del-btn" data-del="spellLevels.${L}.spells.${i}">✕</button>
    </div>
    <div class="spell-stats">
      <div class="ss-cell"><b>Cast</b><input type="text" value="${esc(t)}" data-metafield="${L}.${i}" placeholder="1 Action"></div>
      <div class="ss-cell"><b>Range</b><input type="text" value="${esc(rg)}" data-metafield="${L}.${i}" placeholder="60 ft"></div>
      <div class="ss-cell"><b>Duration</b><input type="text" value="${esc(du)}" data-metafield="${L}.${i}" placeholder="Instantaneous"></div>
      <div class="ss-cell"><b>Comp.</b><span>${esc(comp)||'—'}</span></div>
    </div>
    <div class="tag-picker">
      ${tagBtn('action','Action','pill-action')}
      ${tagBtn('bonus','Bonus','pill-bonus')}
      ${tagBtn('reaction','Reaction','pill-react')}
      <button class="tagbtn pill-conc${sp.conc?' on':''}" data-tagconc="${L}.${i}">Concentration</button>
      <button class="tagbtn pill-ritual${sp.ritual?' on':''}" data-tagritual="${L}.${i}">Ritual</button>
    </div>
    <div class="dmg-edit">
      <button class="heal-toggle${sp.heal?' on':''}" data-healtoggle="${L}.${i}" title="${sp.heal?'Healing — tap to switch to damage':'Damage — tap to mark as healing'}">${sp.heal?'✨':'🔥'}</button>
      <input type="text" class="dmg-input" value="${esc(sp.dmg)}" data-dmgfield="${L}.${i}" placeholder="Damage/healing, e.g. 8d6 Fire (optional)">
    </div>
    <textarea class="spell-desc" data-li="spellLevels.${L}.spells.${i}.desc" placeholder="What does this spell do?">${esc(sp.desc)}</textarea>
    ${detail?`<div class="spell-detail">${detail}</div>`:''}
  </div>`;
}
function renderSpellLevels(){
  const locked=S.spellsLocked;
  const anyContent=S.spellLevels.some(lv=>lv.total>0||lv.spells.length>0);
  $('#spellLevels').innerHTML = (locked && !anyContent)
    ? '<p class="spell-empty" style="padding:16px 14px">Your spellbook is empty — unlock to add spells and set slot totals.</p>'
    : S.spellLevels.map((lv,L)=>{
    // Reading mode skips a level entirely once it has neither slots nor spells — a 1st-level
    // wizard doesn't need to scroll past eight empty "Level 9" chapters to read their own spells.
    // Editing mode still shows every level, since that's where slots get set up ahead of time.
    if(locked && lv.total===0 && lv.spells.length===0) return '';
    const pips = L===0 ? '' : `
      <span class="slot-total">Slots ${locked?`<b>${lv.total}</b>`:`<input type="number" min="0" max="9" value="${lv.total}" data-slottotal="${L}">`}</span>
      <div class="pips">${Array.from({length:lv.total},(_,i)=>
        `<button class="pip ${i<lv.used?'used':''}" data-pip="${L}.${i}"></button>`).join('')}</div>`;
    const rowsHTML = lv.spells.map((sp,i)=>{
      // Older saves only stored {name,prep}; backfill the editable meta/description/tags/damage
      // fields from the spell index the first time this row renders. From then on every one of
      // these is fully owned by the player, same as meta/desc already were.
      if(sp.meta==null) sp.meta=spellMetaDefault(sp.name);
      if(sp.desc==null) sp.desc=spellDescDefault(sp.name);
      if(sp.castTag==null||sp.conc==null||sp.ritual==null) Object.assign(sp,spellTagsDefault(sp.name));
      if(sp.dmg==null){ const d=spellRulesCallout(sp.desc).damage; sp.dmg=d?d.label:''; sp.heal=d?d.heal:false; }
      return locked ? spellCardHTML(sp,L,i) : spellRowEdit(sp,L,i);
    }).join('');
    // Locked mode packs its cards into the responsive grid; edit mode keeps its own full-width
    // stacked rows (there's no room to spare a text-input-heavy row in a narrow grid column).
    const rows = locked ? (rowsHTML?`<div class="tome-grid">${rowsHTML}</div>`:'') : rowsHTML;
    return `
    <div class="spell-level tier${spellTier(L)}" id="spell-ch-${L}">
      <span class="spell-numeral">${L===0?'✦':toRoman(L)}</span>
      <div class="spell-level-head">
        <h3>${L===0?'Cantrips':'Level '+L}</h3>${pips}
      </div>
      ${rows || (locked?'':`<p class="spell-empty">No ${L===0?'cantrips':'level '+L+' spells'} yet.</p>`)}
      ${locked?'':`<button class="add-btn" data-addspell="${L}">+ Add ${L===0?'cantrip':'spell'}</button>`}
    </div>`;
  }).join('');
  // wire slot totals (edit mode only — the input doesn't exist when locked)
  $$('[data-slottotal]').forEach(inp=>inp.addEventListener('change',()=>{
    const L=+inp.dataset.slottotal;
    S.spellLevels[L].total=Math.max(0,Math.min(9,num(inp.value)));
    S.spellLevels[L].used=Math.min(S.spellLevels[L].used,S.spellLevels[L].total);
    // Same deal as the save tiles: typing your own slot total takes the table over from the
    // class's progression, so leveling up won't quietly overwrite it.
    bovClaim('slots');
    renderSpellLevels(); renderBuildNote(); renderBuildCustom(); save();
  }));
  // wire pips — usable in both locked and unlocked views; spending a slot mid-session isn't editing
  $$('[data-pip]').forEach(p=>p.addEventListener('click',()=>{
    const [L,i]=p.dataset.pip.split('.').map(Number);
    const lv=S.spellLevels[L];
    lv.used = (i<lv.used) ? i : i+1;
    renderSpellLevels(); save();
  }));
  // Prepared dots are wired once, delegated, in wireSpellModal — they live in two places at once
  // (the grid card and, when open, the modal) and need to stay in sync between them.
  // wire move-to-level selects
  $$('[data-spellmove]').forEach(sel=>sel.addEventListener('change',()=>{
    const [L,i]=sel.dataset.spellmove.split('.').map(Number);
    const newL=+sel.value; if(newL===L) return;
    const [sp]=S.spellLevels[L].spells.splice(i,1);
    S.spellLevels[newL].spells.push(sp);
    renderSpellLevels(); save();
  }));
  // wire add-spell buttons
  $$('[data-addspell]').forEach(b=>b.addEventListener('click',()=>{
    S.spellLevels[+b.dataset.addspell].spells.push({name:'',prep:false,meta:'',desc:'',castTag:'',conc:false,ritual:false,dmg:'',heal:false});
    renderSpellLevels(); save();
    focusLast('#spellLevels');
  }));
  // re-render after picking/typing a full spell name so pills + detail toggle appear; a
  // recognized name also refreshes the editable meta/description/tags/damage with that spell's
  // defaults — typing over a blank or reflavored row re-syncs it same as picking from search does.
  $$('[data-spellrow]').forEach(inp=>inp.addEventListener('change',()=>{
    const [L,i]=inp.dataset.spellrow.split('.').map(Number);
    const sp=S.spellLevels[L].spells[i];
    if(sp && SPELL_DB[(sp.name||'').trim().toLowerCase()]){
      sp.meta=spellMetaDefault(sp.name);
      sp.desc=spellDescDefault(sp.name);
      Object.assign(sp,spellTagsDefault(sp.name));
      const d=spellRulesCallout(sp.desc).damage;
      sp.dmg=d?d.label:''; sp.heal=d?d.heal:false;
      save();
    }
    renderSpellLevels();
  }));
  // wire the cast-type tag buttons (Action/Bonus/Reaction) — click the active one again to clear
  // it back to "no tag", click a different one to switch.
  $$('[data-tagcast]').forEach(b=>b.addEventListener('click',()=>{
    const [L,i,val]=b.dataset.tagcast.split('.');
    const sp=S.spellLevels[+L].spells[+i];
    sp.castTag = sp.castTag===val ? '' : val;
    renderSpellLevels(); save();
  }));
  // wire the Concentration/Ritual toggles — independent booleans, either can be on with any
  // cast-type tag or with none at all.
  $$('[data-tagconc]').forEach(b=>b.addEventListener('click',()=>{
    const [L,i]=b.dataset.tagconc.split('.').map(Number);
    const sp=S.spellLevels[L].spells[i];
    sp.conc=!sp.conc; renderSpellLevels(); save();
  }));
  $$('[data-tagritual]').forEach(b=>b.addEventListener('click',()=>{
    const [L,i]=b.dataset.tagritual.split('.').map(Number);
    const sp=S.spellLevels[L].spells[i];
    sp.ritual=!sp.ritual; renderSpellLevels(); save();
  }));
  // wire the damage/healing text field and its heal toggle — a plain field, not re-derived from
  // the description once touched, so correcting or clearing it here always sticks.
  $$('[data-dmgfield]').forEach(inp=>inp.addEventListener('input',()=>{
    const [L,i]=inp.dataset.dmgfield.split('.').map(Number);
    S.spellLevels[L].spells[i].dmg=inp.value;
    save();
  }));
  $$('[data-healtoggle]').forEach(b=>b.addEventListener('click',()=>{
    const [L,i]=b.dataset.healtoggle.split('.').map(Number);
    const sp=S.spellLevels[L].spells[i];
    sp.heal=!sp.heal; renderSpellLevels(); save();
  }));
  // wire the three cast/range/duration cells (edit mode) — they're a view over the single
  // `meta` string, not separate fields, so editing any of the three just rejoins all three.
  $$('.spell-stats').forEach(grid=>{
    const inputs=grid.querySelectorAll('input[data-metafield]');
    if(!inputs.length) return;
    inputs.forEach(inp=>inp.addEventListener('input',()=>{
      const [L,i]=inp.dataset.metafield.split('.').map(Number);
      const vals=[...inputs].map(x=>x.value.trim());
      S.spellLevels[L].spells[i].meta=vals.filter(Boolean).join(' · ');
      save();
    }));
  });
  wireList('#spellLevels');
  syncSpellJumpChips();
  renderCombatSlots();
}
// Bookmark-tab row in the ledger header (static markup, one per level) — greys out a level with
// nothing in it, and hides it outright while locked, matching which chapters actually render.
function syncSpellJumpChips(){
  $$('.jump-chip').forEach(chip=>{
    const L=+chip.dataset.jump;
    const lv=S.spellLevels[L];
    const has=lv.total>0||lv.spells.length>0;
    chip.classList.toggle('empty',!has);
    chip.style.display=(S.spellsLocked && !has)?'none':'';
  });
}
function wireSpellJump(){
  $$('.jump-chip').forEach(chip=>chip.addEventListener('click',()=>{
    const el=document.getElementById('spell-ch-'+chip.dataset.jump);
    if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
  }));
}
// Lock toggle (compact read-only view) — same pattern as Features' lock, just swaps the panel
// chrome and re-renders the list.
function wireSpellsLock(){
  const syncChrome=()=>{
    const locked=!!S.spellsLocked;
    const btn=$('#spellsLockBtn');
    btn.textContent=locked?'🔒':'🔓';
    btn.title=locked?'Locked — tap to unlock editing':'Unlocked — tap to lock into a compact reading view';
    btn.classList.toggle('locked',locked);
  };
  $('#spellsLockBtn').addEventListener('click',()=>{
    S.spellsLocked=!S.spellsLocked;
    syncChrome(); renderSpellLevels(); save();
  });
  syncChrome();
}
// Compact slot tracker mirrored onto the Combat tab — a caster needs to spend slots mid-fight far
// more often than they need to edit the spellbook, so this reads the same S.spellLevels data as
// the Spells tab instead of asking the player to tab away and back for every slot spent. Hidden
// entirely for non-casters and re-rendered by renderSpellLevels() so both stay in sync no matter
// which tab the click happened on.
function renderCombatSlots(){
  const panels=$$('.ov-spellslots-panel'), lists=$$('.ov-spellslots-list');
  if(!panels.length||!lists.length) return; // Combat/Overview may not be built yet on first boot
  const isCaster=!!S.spellAbility;
  panels.forEach(p=>p.style.display=isCaster?'':'none');
  if(!isCaster) return;
  const levels=S.spellLevels.map((lv,L)=>({lv,L})).filter(x=>x.L>0&&x.lv.total>0);
  const html = levels.length ? levels.map(({lv,L})=>`
    <div class="cslot-row tier${spellTier(L)}">
      <span class="cslot-lvl">${toRoman(L)}</span>
      <div class="pips cslot-pips">${Array.from({length:lv.total},(_,i)=>
        `<button class="pip ${i<lv.used?'used':''}" data-cslotpip="${L}.${i}" title="Level ${L} slot"></button>`).join('')}</div>
    </div>`).join('') : '<p class="prep-note" style="margin:0">No slot totals set yet — set them on the Spells tab.</p>';
  lists.forEach(l=>l.innerHTML=html);
  renderCockpitCards(); // spell-card slot pips mirror this data — keep them in step
}
function wireCombatSlots(){
  document.addEventListener('click',e=>{
    const p=e.target.closest('[data-cslotpip]'); if(!p) return;
    const [L,i]=p.dataset.cslotpip.split('.').map(Number);
    const lv=S.spellLevels[L];
    lv.used = (i<lv.used) ? i : i+1;
    renderSpellLevels(); save(); // also refreshes this tracker — keeps Combat/Spells/Overview in sync
  });
}
// Tap-to-expand detail (range/duration/DC/wikidot link) for edit mode's ℹ button — delegated
// once on the persistent container so it survives every renderSpellLevels() re-render. Locked/
// reading mode gets the same depth of detail through the Tome Grid's modal instead (see
// wireSpellModal) rather than an inline expand, since there's no row left to expand in place.
function wireSpellDetails(){
  $('#spellLevels').addEventListener('click',e=>{
    const btn=e.target.closest('[data-spellinfo]');
    if(btn) btn.closest('.spell-entry').classList.toggle('open');
  });
}
// Prepared toggles for a Tome Grid card, wired once here for both places its dot can appear —
// the grid card itself, and (when open) the modal showing the same spell — so tapping either one
// updates both without a full re-render of either.
function togglePrep(L,i){
  const sp=S.spellLevels[L].spells[i]; if(!sp) return;
  sp.prep=!sp.prep;
  $$(`[data-prep="${L}.${i}"]`).forEach(d=>d.classList.toggle('on',sp.prep));
  save();
}
function openSpellModal(L,i){
  const sp=S.spellLevels[L].spells[i]; if(!sp) return;
  const panel=$('#spellModalPanel');
  panel.className='modal spell-modal tier'+spellTier(L);
  panel.innerHTML=spellModalHTML(sp,L,i);
  $('#spellModalBg').classList.add('open');
}
function closeSpellModal(){ $('#spellModalBg').classList.remove('open'); }
// Whole card is the tap target — clicking a Tome Grid card opens its full detail as a modal
// instead of reflowing the grid in place. Delegated on #spellLevels (survives every
// renderSpellLevels() re-render) and checks data-prep first so tapping the dot never also
// opens the card underneath it.
function wireSpellModal(){
  $('#spellLevels').addEventListener('click',e=>{
    const dot=e.target.closest('[data-prep]');
    if(dot){ e.stopPropagation(); const [L,i]=dot.dataset.prep.split('.').map(Number); togglePrep(L,i); return; }
    const card=e.target.closest('[data-spellcard]');
    if(card){ const [L,i]=card.dataset.spellcard.split('.').map(Number); openSpellModal(L,i); }
  });
  $('#spellModalPanel').addEventListener('click',e=>{
    const dot=e.target.closest('[data-prep]');
    if(dot){ const [L,i]=dot.dataset.prep.split('.').map(Number); togglePrep(L,i); }
  });
  $('#spellModalBg').addEventListener('click',e=>{
    if(e.target.id==='spellModalBg'||e.target.closest('[data-spellmodalclose]')) closeSpellModal();
  });
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&$('#spellModalBg').classList.contains('open')) closeSpellModal();
  });
}
// Searchable spell index — same tap-to-add pattern as the Feature/Race library search. Picking
// a result auto-places it in its correct level bucket, so you don't have to know which section
// to scroll to first.
function wireSpellLibrary(){
  const input=$('#spellSearch'), panel=$('#spellResults'); if(!input) return;
  const levelLabel=lv=>lv===0?'Cantrips':lv+(lv===1?'st':lv===2?'nd':lv===3?'rd':'th')+' Level';
  const list=Object.values(SPELL_DB);
  const matches=(e,q)=>!q||e.n.toLowerCase().includes(q)||SP_SCHOOL[e.sc].toLowerCase().includes(q);
  function renderResults(){
    const q=input.value.trim().toLowerCase();
    const items=list.filter(e=>matches(e,q)).sort((a,b)=>a.lv-b.lv||a.n.localeCompare(b.n));
    if(!items.length){ panel.innerHTML='<div class="empty">No matches</div>'; return; }
    let lastLv=null, html='';
    items.forEach(e=>{
      if(e.lv!==lastLv){ html+=`<div class="grp">${levelLabel(e.lv)}</div>`; lastLv=e.lv; }
      html+=`<div class="item tier${spellTier(e.lv)}" data-spellpick="${esc(e.n)}"><span class="sp-badge">${SP_ICON[e.sc]||''}</span> ${esc(e.n)}<small>${esc(SP_SCHOOL[e.sc])}${e.t.endsWith('r')?' · ritual':''}</small></div>`;
    });
    panel.innerHTML=html;
  }
  const open=()=>{ renderResults(); panel.classList.add('open'); };
  const close=()=>panel.classList.remove('open');
  input.addEventListener('focus',open);
  input.addEventListener('input',open);
  panel.addEventListener('click',e=>{
    const item=e.target.closest('[data-spellpick]'); if(!item) return;
    const sp=SPELL_DB[item.dataset.spellpick.toLowerCase()]; if(!sp) return;
    const desc=spellDescDefault(sp.n), dmg=spellRulesCallout(desc).damage;
    S.spellLevels[sp.lv].spells.push({name:sp.n,prep:false,meta:spellMetaDefault(sp.n),desc,
      ...spellTagsDefault(sp.n),dmg:dmg?dmg.label:'',heal:dmg?dmg.heal:false});
    input.value=''; close();
    renderSpellLevels(); save();
  });
  document.addEventListener('click',e=>{
    if(!e.target.closest('#spellSearch') && !e.target.closest('#spellResults')) close();
  });
}

// Free-text boxes (spell desc, feature desc, notes) default to a couple lines tall with a manual
// drag-handle to resize. Left alone, anything typed past that default height just gets clipped
// out of view until you notice and drag it open yourself. Grow the box to fit what's actually in
// it instead, so typed text is never hidden behind a resize you have to remember to do.
function autoGrow(el){ el.style.height='auto'; el.style.height=el.scrollHeight+'px'; }
// Shared wiring for list inputs and delete buttons
const RERENDER = {attacks:renderAttacks,features:fxRefresh,
                  notes:renderNotes,spellLevels:renderSpellLevels};
function wireList(container){
  $$(container+' [data-li]').forEach(el=>{
    if(el.tagName==='TEXTAREA') autoGrow(el);
    el.addEventListener('input',()=>{
      setPath(S,el.dataset.li,el.value);
      if(el.tagName==='TEXTAREA') autoGrow(el);
      save();
    });
  });
  $$(container+' [data-del]').forEach(b=>{
    b.addEventListener('click',()=>{
      const parts=b.dataset.del.split('.');
      const idx=+parts.pop();
      const arr=getPath(S,parts.join('.'));
      arr.splice(idx,1);
      RERENDER[parts[0]](); save();
    });
  });
}
function focusLast(container){
  const inputs=$$(container+' input[type=text]');
  if(inputs.length) inputs[inputs.length-1].focus();
}

// ---------- Calculations ----------
function recalc(){
  renderBuildTheme();
  const P=num(S.profBonus);
  // Features whose uses-per-rest are tied to a stat (proficiency bonus — Orc's Adrenaline Rush,
  // Harengon's Rabbit Hop — or an ability modifier — Bardic Inspiration, Divine Sense) auto-rescale
  // here, so leveling up or raising that ability keeps their max uses correct without the player
  // having to edit the number by hand.
  let scaledUsesChanged=false;
  S.features.forEach(f=>{
    const sv=usesScaleValue(f.usesScale,f.usesScaleBonus);
    if(sv==null) return;
    if(num(f.usesMax)!==sv){ f.usesMax=sv; scaledUsesChanged=true; }
    if(num(f.usesUsed)>f.usesMax){ f.usesUsed=f.usesMax; scaledUsesChanged=true; }
  });
  // Both views read the same f.usesMax — without renderFeatures() here, the Features tab's own
  // "= N" badge went stale after an ability score change until something else forced a re-render.
  if(scaledUsesChanged){ renderFeatures(); renderCombatFeatures(); }
  // ability modifiers (base score + racial bonus)
  ABILITIES.forEach(([k])=>{
    $$(`[data-abmod="${k}"]`).forEach(el=>el.textContent=fmt(amod(k)));
    const rb=racialBonus(k), ab=asiBonus(k), tot=score(k);
    const parts=[];
    if(rb) parts.push(`<b>+${rb}</b> race`);
    if(ab) parts.push(`<b>+${ab}</b> ASI`);
    let txt=parts.length?parts.join(' ')+` → ${tot}`:'';
    if(tot>20) txt+=` <span style="color:var(--red)">over 20!</span>`;
    $$(`[data-abrace="${k}"]`).forEach(el=>el.innerHTML=txt);
  });
  // saving throws (manual proficiency OR granted by a feature effect)
  ABILITIES.forEach(([k])=>{
    const b=amod(k)+((S.saveProf[k]||fxSaveProf(k))?P:0);
    $$(`[data-savebonus="${k}"]`).forEach(el=>el.textContent=fmt(b));
  });
  // skills (manual proficiency OR granted by a feature effect)
  SKILLS.forEach(([k,,ab])=>{
    const b=amod(ab)+effSkill(k)*P;
    $$(`[data-skillbonus="${k}"]`).forEach(el=>el.textContent=fmt(b));
    // keep situational badges fresh (each visible badge = one note whose effect still changes the number, in order)
    const visNotes=fxNotes(k).filter(n=>noteBadge(k,ab,n)!=null);
    $$(`[data-notemath="${k}"]`).forEach((el,i)=>{
      const n=visNotes[i]; if(!n) return;
      const tip=n.cond?`<span class="sk-tip">${esc(n.cond)}</span>`:'';
      el.innerHTML=`★ ${esc(n.src)} <b>${esc(noteBadge(k,ab,n))}</b>${tip}`;
    });
  });
  // derived stats (with flat feature bonuses)
  const dex=amod('dex');
  const perception=10+amod('wis')+effSkill('perception')*P+fxStat('passive');
  setCalc('initiative',fmt(dex+num(S.initiativeMisc)+fxStat('init')));
  setCalc('passive',perception);
  setCalc('prof',fmt(P));
  // hit dice remaining
  const hdc=hdCount();
  setCalc('hd',hdc.n?`${Math.max(0,hdc.n-num(S.hdUsed))}/${hdc.n}${hdc.die}`:'—');
  // AC engine: when auto mode is on, armor + DEX + shield drives the AC field
  const eq=S.equip||{};
  if(eq.acAuto){
    S.ac=computedBaseAC()+fxStat('ac');
    $$('[data-bind="ac"]').forEach(el=>{if(el!==document.activeElement)el.value=S.ac;});
  }
  const hudAC=$('#hudAC');
  if(hudAC){
    const a=ARMORS[eq.armor]||ARMORS.none;
    const dexB=Math.min(amod('dex'),a.dex===99?999:a.dex);
    const total=computedBaseAC()+fxStat('ac');
    hudAC.textContent='AC '+total;
    const bits=[`${a.n.split(' (')[0]} ${a.base}`,`DEX ${fmt(dexB)}`];
    if(num(eq.armorMagic)) bits.push(`magic ${fmt(num(eq.armorMagic))}`);
    if(eq.shield) bits.push(`shield +${2+num(eq.shieldMagic)}`);
    if(fxStat('ac')) bits.push(`features ${fmt(fxStat('ac'))}`);
    const warns=[];
    if(a.str&&score('str')<a.str) warns.push(`needs STR ${a.str} — speed −10 ft`);
    if(a.sd) warns.push('stealth disadvantage');
    $('#hudACnote').innerHTML=bits.join(' · ')+(warns.length?` <span style="color:var(--red)">⚠ ${warns.join(' · ')}</span>`:'')+(eq.acAuto?'':' (preview — enable to apply)');
  }
  // HUD formulas — a short, always-visible breakdown under each value, no tapping required.
  // Comma-separated, not "+"-joined: "10 + Wis +2 + trained +3" reads as one ambiguous run of
  // plus signs; "10, Wis +2, trained +3" has an unambiguous boundary around each term.
  //
  // Two different kinds of feature contribution get folded in, and they are NOT the same thing:
  // an fx of type 'stat' is unconditional and already inside the number shown, so it joins the
  // base line like any other term. An fx of type 'statnote' is situational (e.g. Dread Ambusher's
  // "+2 at the start of the fight") — it is deliberately left OUT of the total (that's the whole
  // point of a reminder vs. a bonus), so it can't just join the same line as the base terms without
  // looking counted when it isn't. Instead its amount becomes a big "+N" beside the value itself
  // (data-fxmod — impossible to miss) and its source/condition drops to a plain line underneath.
  const alwaysText=k=>allFx().filter(x=>x.t==='stat'&&x.stat===k).map(x=>`${x.src} ${fmt(fxAmount(x.n))}`);
  const condList=k=>fxStatRems(k).map(r=>({
    amt: (r.n!=null&&String(r.n).trim()!=='') ? fxAmount(r.n) : null,
    label: r.src+(r.cond?` — ${r.cond}`:'')
  }));
  const acA=ARMORS[eq.armor]||ARMORS.none;
  const acDexB=Math.min(amod('dex'),acA.dex===99?999:acA.dex);
  const acParts=[`${acA.n.split(' (')[0]} ${acA.base}`,`Dex ${fmt(acDexB)}`];
  if(num(eq.armorMagic)) acParts.push(`magic ${fmt(num(eq.armorMagic))}`);
  if(eq.shield) acParts.push(`shield +${2+num(eq.shieldMagic)}`);
  acParts.push(...alwaysText('ac'));
  const acFormulaTotal=computedBaseAC()+fxStat('ac');
  // AC is a manually-typed field (nothing here is enforced), so the formula's own total can
  // legitimately differ from the number above it — spell that out instead of implying they match.
  const acSuffix=acFormulaTotal===num(S.ac)?'':` = ${acFormulaTotal}`;
  const HUD_BASE={
    ac: acParts.join(', ')+acSuffix,
    init: [`Dex ${fmt(dex)}`].concat(num(S.initiativeMisc)?[`misc ${fmt(num(S.initiativeMisc))}`]:[]).concat(alwaysText('init')).join(', '),
    speed: alwaysText('speed').join(', '),
    prof: `Level ${num(S.level)||1}`,
    passive: [`10`,`Wis ${fmt(amod('wis'))}`].concat(effSkill('perception')?[`${effSkill('perception')===2?'expertise':'trained'} ${fmt(effSkill('perception')*P)}`]:[]).concat(alwaysText('passive')).join(', '),
    vision: alwaysText('vision').join(', '),
    hpmax: alwaysText('hpmax').join(', ')
  };
  const HUD_COND={ac:condList('ac'),init:condList('init'),speed:condList('speed'),passive:condList('passive'),vision:condList('vision'),hpmax:condList('hpmax')};
  Object.keys(HUD_BASE).forEach(k=>{
    const cond=HUD_COND[k]||[];
    const condHtml=cond.length?`<span class="ckv-cond">${cond.map(c=>esc(c.label)).join('<br>')}</span>`:'';
    $$(`[data-fxform="${k}"]`).forEach(el=>el.innerHTML=esc(HUD_BASE[k])+condHtml);
    const amts=cond.map(c=>c.amt).filter(a=>a!=null);
    const modText=amts.length?amts.map(fmt).join('/'):'';
    $$(`[data-fxmod="${k}"]`).forEach(el=>el.textContent=modText);
  });
  // spellcasting
  const sca=spellDCAtk();
  setCalc('spellDC', sca.dc!=null?sca.dc:'—');
  setCalc('spellAtk', sca.atk!=null?fmt(sca.atk):'—');
  // Attack rows stay in sync with ability/proficiency/magic/buff/roll changes. Each of these
  // data-atk* markers can appear more than once for the same attack at the same time (the
  // Attacks panel row, its "Do Something" grid card, and — if queued up — its Turn Plan step
  // all show Hit/Damage; the grid card and plan step skip the roll/Final bit). A single `$`
  // lookup only touches the first match in DOM order, so whichever of those happened to render
  // first silently "won" and the rest went stale — most visibly Final never updating in the
  // Attacks panel itself once that same attack was also queued on the turn plan. `$$` updates
  // every instance instead.
  S.attacks.forEach((a,i)=>{
    const s=atkSummary(a);
    $$(`[data-atkview="${i}"]`).forEach(el=>el.textContent=s.bonus);
    $$(`[data-atkbreak="${i}"]`).forEach(el=>el.textContent=s.breakdown);
    $$(`[data-atkdmg="${i}"]`).forEach(el=>el.textContent=s.dmg);
    $$(`[data-atkdmgbreak="${i}"]`).forEach(el=>el.textContent=s.dmgBreakdown);
    $$(`[data-atkfinal="${i}"]`).forEach(el=>el.textContent=s.finalDamage!=null?s.finalDamage:'—');
  });
  // hp bar + clamp (effective max includes feature bonuses like Tough)
  const max=Math.max(0,num(S.hpMax)+fxStat('hpmax'));
  const cur=Math.max(0,num(S.hpCurrent));
  const temp=Math.max(0,num(S.hpTemp));
  // Temp HP rides the same bar as a blue segment stacked after current HP. The bar's scale
  // widens to fit (max HP + temp) whenever temp is active, so the blue segment stays visible
  // even at full HP instead of being squeezed into whatever room was left under 100%.
  const scale=Math.max(max,cur)+temp;
  const curPct=scale?cur/scale*100:0;
  const tmpPct=scale?Math.min(100-curPct,temp/scale*100):0;
  $$('.hp-fill').forEach(f=>f.style.width=curPct+'%');
  $$('.hp-temp-fill').forEach(f=>{ f.style.left=curPct+'%'; f.style.width=tmpPct+'%'; });
  $$('.hp-bar').forEach(bar=>bar.classList.toggle('has-temp',num(S.hpTemp)>0));
  // bloodied / critical feedback directly on the real HP bar(s) — no separate decorative copy
  const hpPct=max?cur/max:1;
  $$('.hp-bar').forEach(bar=>{ bar.classList.toggle('low',hpPct<=.5&&hpPct>.25); bar.classList.toggle('critical',hpPct<=.25); });
  // Combat tab's sticky mini-HUD — the one thing you always need in sight while scrolling
  setCalc('chudHp',`${cur}/${max}`);
  setCalc('chudAc',num(S.ac));
  // Death saves takeover: out of sight while up, front and center at 0 HP.
  const dp=$('#ckDeathPanel');
  if(dp){
    const down=cur<=0;
    dp.classList.toggle('ck-collapsed',!down&&!(S.cockpit&&S.cockpit.showDeath));
    dp.classList.toggle('ck-down',down);
  }
  // inspiration
  const insp=$('#inspBtn');
  if(insp){insp.classList.toggle('on',!!S.inspiration);
    insp.textContent=S.inspiration?'★ Inspired':'Inspiration';}
  renderOverviewIdentity(); renderOverviewSkillChips(); renderOverviewWealth(); renderOverviewWhisper();
  document.title=(S.name?S.name+' — ':'')+'Character Binder';
}
function setCalc(key,val){ $$(`[data-calc="${key}"]`).forEach(el=>el.textContent=val); }

// ---------- Overview identity banner: crest, level-up outlook, XP ----------
// Level-up outlook (next ASI/feat, next proficiency bump) is level-based, not XP-based, so it
// still means something for tables that level by milestone and never touch the XP field below.
function renderOverviewIdentity(){
  const panel=$('#ovIdentity'); if(!panel) return;
  const accent=CLASS_COLOR[S.classId]||'#c9a227';
  panel.style.setProperty('--accent',accent);
  panel.style.setProperty('--accent-dim',accent+'30');
  const icon=$('#ovIdIcon');
  if(icon) icon.textContent = CLASS_ICON[S.classId] || ((S.name||'').trim()[0]||'?').toUpperCase();
  const lvl=Math.max(1,Math.min(20,num(S.level)||1));
  const nextAsi=asiLevels(S.classId).find(L=>L>lvl);
  const nextBump=[5,9,13,17].find(L=>L>lvl);
  const outlook=[];
  if(nextAsi) outlook.push(`Next ASI/Feat at level ${nextAsi}`);
  if(nextBump) outlook.push(`Proficiency +${2+Math.floor((nextBump-1)/4)} at level ${nextBump}`);
  const outlookEl=$('#ovOutlook');
  if(outlookEl){ outlookEl.textContent=outlook.join(' · '); outlookEl.style.display=outlook.length?'':'none'; }
  // XP: the input always sits here for tables that track it; the bar/threshold text only shows
  // once there's a real number in it, so milestone-leveling tables just never see it.
  const xpVal=num(S.xp), next=XP_THRESHOLDS[lvl+1];
  let xpHtml=`<input type="text" class="ov-xp-in" data-li="xp" value="${esc(S.xp)}" placeholder="XP">`;
  if(xpVal>0 && lvl<20 && next!=null){
    const prev=XP_THRESHOLDS[lvl]||0;
    const pct=Math.max(0,Math.min(100,(xpVal-prev)/Math.max(1,next-prev)*100));
    xpHtml+=`<div class="ov-xp-bar"><div class="ov-xp-fill" style="width:${pct}%"></div></div>
      <span class="ov-xp-note">${(next-xpVal).toLocaleString()} to level ${lvl+1}</span>`;
  }
  const xpBox=$('#ovXp');
  if(xpBox){ xpBox.innerHTML=xpHtml; wireList('#ovXp'); }
}
// ---------- Overview trained-skill chips: proficient/expertise, plus pinned favorites ----------
// Computes its own bonus text (rather than the data-skillbonus multi-target trick) since chips
// are (re)created inside recalc() itself — a data-skillbonus span born after recalc()'s skill
// loop already ran would sit at its "+0" placeholder until the next keystroke elsewhere.
// Every chip — trained or pinned — can be hidden from this card (✕). Trained skills go into
// ovHidden (the actual proficiency on the Skills tab is untouched, just suppressed here);
// pinned favorites are simply un-pinned. Both come back through the one "+ Show a skill…"
// picker, so there's a single place to manage what this card is allowed to clutter itself with.
function renderOverviewSkillChips(){
  const box=$('#ovSkillChips'); if(!box) return;
  S.favSkills=S.favSkills||[];
  S.ovHidden=S.ovHidden||[];
  const P=num(S.profBonus);
  const withBonus=([k,label,ab])=>({k,label,ab,eff:effSkill(k),b:amod(ab)+effSkill(k)*P});
  const trained=SKILLS.map(withBonus).filter(r=>r.eff>0&&!S.ovHidden.includes(r.k));
  const hiddenTrained=SKILLS.map(withBonus).filter(r=>r.eff>0&&S.ovHidden.includes(r.k));
  // A favorite that later becomes proficient just shows through the "trained" row above instead
  // of a second copy — favSkills itself is left untouched so it re-appears here if un-trained.
  const pinned=SKILLS.filter(([k])=>S.favSkills.includes(k)).map(withBonus).filter(r=>r.eff===0);
  // Feature effects read straight off the chip's own line ("+3 or +6 if ★ Natural Explorer")
  // via skillInlineFxHTML — plain text, always visible, nothing to tap open. That's the whole
  // point of this card: everything relevant to the skill in one glance.
  // Each row's background carries a faint fade in its own ability's color — the exact same
  // STR/DEX/CON/INT/WIS/CHA accents the Skills tab colors its ability groups with — so a skill's
  // governing ability reads at a glance here too, without needing a legend.
  const chipHtml=r=>{
    const fx=skillInlineFxHTML(r.k,r.ab);
    return `<div class="ov-skrow ab-${r.ab}">
      <button class="ov-skchip" data-ovsktab>
        <span class="ov-skname">${esc(r.label)}</span>
        <span class="ov-skbonus">${fmt(r.b)}</span>
        <span class="ov-skdots">${r.eff===2?'●●':'●'}</span>
      </button>
      ${fx?`<span class="ov-skfx">${fx}</span>`:''}
      <button class="ov-skhide" data-ovskhide="${r.k}" title="Hide from Overview">✕</button>
    </div>`;
  };
  const pinHtml=r=>{
    const fx=skillInlineFxHTML(r.k,r.ab);
    return `<div class="ov-skrow fav ab-${r.ab}">
      <span class="ov-skchip fav">
        <span class="ov-skpin" title="Pinned — not currently trained">◈</span>
        <span class="ov-skname">${esc(r.label)}</span>
        <span class="ov-skbonus">${fmt(r.b)}</span>
      </span>
      ${fx?`<span class="ov-skfx">${fx}</span>`:''}
      <button class="ov-skhide" data-ovskunfav="${r.k}" title="Unpin from Overview">✕</button>
    </div>`;
  };
  const rows=trained.map(chipHtml).join('')+pinned.map(pinHtml).join('');
  const pickable=SKILLS.filter(([k])=>!S.favSkills.includes(k)&&effSkill(k)===0);
  const addOptions=hiddenTrained.map(r=>`<option value="h:${r.k}">${esc(r.label)} (trained, hidden)</option>`).join('')
    + pickable.map(([k,label])=>`<option value="p:${k}">${esc(label)}</option>`).join('');
  box.innerHTML = (rows||'<p class="prep-note" style="margin:0 0 6px">No skills shown — pick proficiencies on the Skills tab, or add one below.</p>')
    + (addOptions ? `<select class="add-btn" data-ovskadd>
        <option value="">+ Show a skill…</option>
        ${addOptions}
      </select>` : '');
  $$('[data-ovsktab]').forEach(b=>b.addEventListener('click',()=>showTab('skills')));
  $$('[data-ovskhide]').forEach(b=>b.addEventListener('click',()=>{
    if(!S.ovHidden.includes(b.dataset.ovskhide)) S.ovHidden.push(b.dataset.ovskhide);
    renderOverviewSkillChips(); save();
  }));
  $$('[data-ovskunfav]').forEach(b=>b.addEventListener('click',()=>{
    S.favSkills=S.favSkills.filter(k=>k!==b.dataset.ovskunfav);
    renderOverviewSkillChips(); save();
  }));
  const picker=$('[data-ovskadd]');
  if(picker) picker.addEventListener('change',()=>{
    if(!picker.value) return;
    const [kind,key]=picker.value.split(':');
    if(kind==='h') S.ovHidden=S.ovHidden.filter(k=>k!==key);
    else S.favSkills.push(key);
    renderOverviewSkillChips(); save();
  });
}
// ---------- Overview wealth + attunement ----------
function renderOverviewWealth(){
  const box=$('#ovWealth'); if(!box) return;
  const gold=S.money.gp+S.money.pp*10+Math.floor((S.money.sp+S.money.ep*5)/10+S.money.cp/100);
  const attuned=S.equipment.filter(e=>e.att&&(e.name||'').trim());
  box.innerHTML=`
    <div class="ov-wealth-total">${gold.toLocaleString()}<span> gp equiv.</span></div>
    <div class="ov-wealth-coins">${['cp','sp','ep','gp','pp'].map(c=>`<span>${num(S.money[c])} ${c.toUpperCase()}</span>`).join('')}</div>
    <div class="ov-attune-head">✦ Attunement <b class="${attuned.length>3?'ov-attune-over':''}">${attuned.length}/3</b></div>
    ${attuned.length
      ? `<ul class="ov-attune-list">${attuned.map(e=>`<li>${esc(e.name)}</li>`).join('')}</ul>`
      : '<p class="prep-note" style="margin:0">Nothing attuned — flag a Magic item with ✦ on the Inventory tab.</p>'}`;
}
// ---------- Overview character whisper: one line per non-empty personality field ----------
function renderOverviewWhisper(){
  const box=$('#ovWhisper'); if(!box) return;
  // Secrets stay off this at-a-glance strip on purpose — everything else here is a quick
  // reminder of how to play the character, but a secret is something they're keeping quiet.
  const fields=[['personality','Traits'],['ideals','Ideals'],['bonds','Bonds'],['flaws','Flaws'],
    ['goals','Goals']]
    .filter(([k])=>(S[k]||'').trim());
  box.style.display = fields.length ? '' : 'none';
  box.innerHTML = fields.map(([k,label])=>{
    const v=S[k].trim().split('\n')[0];
    return `<p class="ov-whisper-line" data-ovwhisper><b>${label}.</b> ${esc(v.slice(0,140))}${v.length>140?'…':''}</p>`;
  }).join('');
  $$('[data-ovwhisper]').forEach(p=>p.addEventListener('click',()=>showTab('character')));
}
// Stress is tracked, not wired into every ability/save/skill/attack number the way a feature
// effect would be — same idea as every other situational modifier on this sheet (see the ★
// reminders elsewhere): the sheet tells you the penalty, you apply it yourself when you roll.
// Baking it into 20-odd bonus displays across four tabs would be a much bigger, riskier change
// for a homebrew rule that's really just "read this number, subtract it."
const STRESS_MAX=10;
function renderOverviewStress(){
  const ring=$('#stressRing'); if(!ring) return;
  const val=Math.max(0,Math.min(STRESS_MAX,num(S.stress)));
  const pct=Math.round(val/STRESS_MAX*100);
  ring.style.setProperty('--pct',pct);
  ring.classList.toggle('mid',pct>=40&&pct<70);
  ring.classList.toggle('high',pct>=70);
  $('#stressNum').textContent=val;
  $('#stressNote').textContent = val>0
    ? `Apply −${val} to every d20 roll while stressed.`
    : 'No stress — rolls are unaffected.';
}
function renderOverview(){
  renderOverviewIdentity(); renderOverviewSkillChips(); renderOverviewWealth(); renderOverviewWhisper();
  renderOverviewStress();
}
function wireStress(){
  $$('[data-stress]').forEach(b=>b.addEventListener('click',()=>{
    S.stress=Math.max(0,Math.min(STRESS_MAX,num(S.stress)+(+b.dataset.stress)));
    renderOverviewStress(); save();
  }));
}

// ---------- Character tab: portrait upload ----------
// Stored as a data URL right on S.portrait (so it rides along with export/import and the
// roster's per-character localStorage slot like any other field), but downscaled through a
// canvas first — an unscaled phone photo would blow past localStorage's ~5MB quota fast.
function renderCharacterPortrait(){
  const box=$('#cpPortraitImg'), rm=$('#cpPortraitRemove'); if(!box) return;
  if(S.portrait){
    box.style.backgroundImage=`url("${S.portrait}")`;
    box.textContent='';
    if(rm) rm.style.display='';
  }else{
    box.style.backgroundImage='none';
    box.textContent='🎭';
    if(rm) rm.style.display='none';
  }
}
function wireCharacterPortrait(){
  const btn=$('#cpPortraitBtn'), file=$('#cpPortraitFile'), rm=$('#cpPortraitRemove');
  if(!btn || btn._bound) return; btn._bound=true;
  btn.addEventListener('click',()=>file.click());
  file.addEventListener('change',()=>{
    const f=file.files[0]; file.value=''; if(!f) return;
    const reader=new FileReader();
    reader.onload=()=>{
      const img=new Image();
      img.onload=()=>{
        const max=360, scale=Math.min(1,max/Math.max(img.width,img.height));
        const w=Math.round(img.width*scale), h=Math.round(img.height*scale);
        const cv=document.createElement('canvas'); cv.width=w; cv.height=h;
        cv.getContext('2d').drawImage(img,0,0,w,h);
        S.portrait=cv.toDataURL('image/jpeg',.85);
        renderCharacterPortrait(); save();
      };
      img.src=reader.result;
    };
    reader.readAsDataURL(f);
  });
  rm.addEventListener('click',()=>{ S.portrait=''; renderCharacterPortrait(); save(); });
}

// ---------- Character tab: Backstory editor (drop cap, word count, expand) ----------
// A plain <textarea> can't host a real drop cap — ::first-letter plus float, which is what
// actually lets a book's opening letter sit tall while the next few LINES wrap around it, only
// applies to real rendered text, and a textarea's value isn't that; it's opaque to CSS. Backstory
// is a contenteditable div instead so ::first-letter can do the genuine multi-line wrap, with
// data-bind's job (state -> DOM -> state) done by hand in render/syncBackstoryFromEditor below.
// Codepoint ranges (not a regex literal, to keep the Hebrew/Arabic bounds unambiguous in source):
// Hebrew U+0591-U+07FF, Arabic Presentation Forms-A U+FB1D-U+FDFD, Forms-B U+FE70-U+FEFC.
function isRtlChar(ch){
  if(!ch) return false;
  const c=ch.codePointAt(0);
  return (c>=0x0591&&c<=0x07FF)||(c>=0xFB1D&&c<=0xFDFD)||(c>=0xFE70&&c<=0xFEFC);
}
// State -> DOM. Skipped while the box is focused so a character-switch mid-edit (or any other
// renderAll()) can't clobber the cursor position of an edit already in progress.
function renderBackstoryEditor(){
  const el=$('#cpBackstoryEdit'); if(!el || document.activeElement===el) return;
  el.innerHTML = esc(S.backstory||'').replace(/\n/g,'<br>');
  updateBackstoryMeta();
}
// DOM -> state, on every keystroke. innerText (not textContent) is what turns each <br> or block
// boundary the browser inserted for Enter back into a '\n' — textContent would silently drop them
// and glue every line into one run-on paragraph.
function syncBackstoryFromEditor(){
  const el=$('#cpBackstoryEdit'); if(!el) return;
  const text=el.innerText.replace(/\n+$/,'');
  S.backstory=text;
  // A browser can leave a stray empty line (a bare <br>) behind after deleting everything back to
  // nothing, which defeats the :empty CSS selector the placeholder depends on — force it clean.
  if(!text) el.innerHTML='';
  save();
  updateBackstoryMeta();
}
// Word count, the RTL flip (cap + whole block, since a float's side is a real layout commitment,
// not something plaintext auto-detection can make per line), and whether there's enough text for
// the "more below" fade + Expand button to earn their keep.
function updateBackstoryMeta(){
  const el=$('#cpBackstoryEdit'), wrap=$('#cpScrollBody'), count=$('#cpWordCount'), scroll=$('#cpScroll');
  if(!el) return;
  const text=S.backstory||'';
  if(wrap) wrap.classList.toggle('rtl',isRtlChar(text.trimStart().slice(0,1)));
  if(count){
    const words=text.trim()?text.trim().split(/\s+/).length:0;
    count.textContent = words ? `${words.toLocaleString()} word${words===1?'':'s'}` : '';
  }
  if(scroll) scroll.classList.toggle('cp-scroll-long', el.scrollHeight>el.clientHeight+4);
}
function wireBackstoryEditor(){
  const el=$('#cpBackstoryEdit'); if(!el || el._bound) return; el._bound=true;
  el.addEventListener('input',syncBackstoryFromEditor);
  // Force plain-text paste — otherwise pasting from Word/a web page drags in its own fonts,
  // colors and stray markup that would fight (and outlive, on every future render) the app's own.
  el.addEventListener('paste',e=>{
    e.preventDefault();
    document.execCommand('insertText',false,(e.clipboardData||window.clipboardData).getData('text/plain'));
  });
}
// Long backstories default to a capped, scrollable box (so one sprawling character doesn't push
// every panel below it halfway down the page) with an Expand button to read/write it in full.
function wireBackstoryExpand(){
  const btn=$('#cpExpandBtn'), scroll=$('#cpScroll'); if(!btn || btn._bound) return; btn._bound=true;
  btn.addEventListener('click',()=>{
    const open=scroll.classList.toggle('expanded');
    btn.textContent = open ? '⤡ Collapse' : '⤢ Expand';
    updateBackstoryMeta(); // recheck cp-scroll-long now that the height cap just changed
  });
}

// ---------- Add buttons (attacks / equipment / features / notes) ----------
const ADD_TEMPLATES = {
  attacks:()=>({name:'',weapon:'custom',die:'',dmgStat:'auto',magic:0,miscAtk:0,miscDmg:0,rolled:'',buffs:[]}),
  features:()=>({title:'',desc:'',fx:[],combat:false,usesMax:0,usesPer:'short',usesUsed:0,usesScale:'',source:{kind:'custom'}}),
  notes:()=>({title:'',body:'',tags:[],session:nextSessionLabel()})
};
function wireAddButtons(){
  $$('[data-add]').forEach(b=>b.addEventListener('click',()=>{
    const key=b.dataset.add;
    S[key].push(ADD_TEMPLATES[key]());
    RERENDER[key](); save();
    // Notes render newest-first (the Session Timeline reads top-down as most-recent-first), so
    // the just-added note is the FIRST title field in the list, not the last — everywhere else
    // a fresh row lands at the bottom, so focusLast's "grab the last input" still applies there.
    if(key==='notes') $('#noteList .tl-note-title')?.focus();
    else focusLast('#'+({attacks:'attackList',features:'featureList'})[key]);
  }));
  // Its own button rather than the generic data-add path above: a custom feat needs
  // source:{kind:'feat'} (not the generic 'custom') so it gets the "Feat" byline on this tab and
  // shows up under the Combat cockpit's Feats filter — everything else about it (title, description,
  // effects, combat tracking) is the same free-form editor as any other hand-written feature.
  $('#addFeatBtn')?.addEventListener('click',()=>{
    S.features.push({title:'',desc:'',fx:[],combat:false,usesMax:0,usesPer:'short',usesUsed:0,usesScale:'',source:{kind:'feat',custom:true}});
    renderFeatures(); renderCombatFeatures(); save();
    focusLast('#featureList');
  });
}

// ---------- HP quick buttons ----------
function applyHpDelta(d){
  if(d<0){ // damage soaks temp HP first (5e rule)
    let dmg=-d;
    const soak=Math.min(num(S.hpTemp),dmg);
    S.hpTemp=num(S.hpTemp)-soak; dmg-=soak;
    S.hpCurrent=Math.max(0,num(S.hpCurrent)-dmg);
  }else{
    S.hpCurrent=Math.min(num(S.hpMax)+fxStat('hpmax'),num(S.hpCurrent)+d);
  }
  syncBound(); recalc(); save();
}
function wireHpButtons(){
  $$('[data-hp]').forEach(b=>b.addEventListener('click',()=>applyHpDelta(num(b.dataset.hp))));
  // The preset ±1/5/10 buttons cover the common cases; this is the escape hatch for anything
  // else — type the number a hit/heal actually did, apply it either direction, done.
  $$('[data-hpcustom]').forEach(b=>b.addEventListener('click',()=>{
    const inp=b.closest('.chud-custom')?.querySelector('.chud-customin'); if(!inp) return;
    const amt=Math.abs(num(inp.value)); if(!amt) return;
    applyHpDelta(num(b.dataset.hpcustom)*amt);
    inp.value='';
  }));
}

// ---------- Smart build: class & race presets ----------
const AB_NAMES=Object.fromEntries(ABILITIES);

// Fill the dropdowns to match current state (called on load & import)
const CLASS_ORDER=Object.keys(CLASSES);
const RACE_ORDER_BUILD=Object.keys(RACES);
// Which A/B image layer is currently on top for each hero, and the id last painted onto it —
// renderBuildTheme() only crossfades when the id actually changes (it's called on every recalc(),
// including level/subclass edits that shouldn't retrigger the portrait swap).
let bClassFront='A', bRaceFront='A', bLastClassId=null, bLastRaceId=null;

// Swaps which of an A/B <img> pair is on top. from/to are resolved once by the caller and
// applied to every layer-pair together (bg + portrait), so paired layers can't drift out of
// sync the way they would if each call independently flipped a shared tracker.
function crossfadeImg(prefix,from,to,src){
  const show=$('#'+prefix+to), hide=$('#'+prefix+from);
  if(!show||!hide) return;
  if(src) show.src=src;
  show.classList.add('visible'); hide.classList.remove('visible');
}

function renderBuildSelectors(){
  renderClassRail();
  renderRaceRail();
  $('#levelIn').value=S.level||1;
  renderSubraceAndFlex();
  renderSubclassField();
  renderBuildNote();
  renderBuildCustom();
  renderBuildTheme();
}
function renderClassRail(){
  const rail=$('#classRail'); if(!rail) return;
  if(!rail.children.length){
    rail.innerHTML=CLASS_ORDER.map(id=>`
      <div class="bRailItem" data-id="${id}" style="--c:${CLASS_COLOR[id]}">
        <div class="bThumb" style="background-image:url(class-art/${id}-portrait.jpg)"></div>
        <span class="bLabel">${CLASSES[id].name}</span>
      </div>`).join('');
    [...rail.children].forEach(el=>el.addEventListener('click',()=>{
      if(el.dataset.id===S.classId) return;
      S.classId=el.dataset.id; applyBuild();
    }));
  }
  [...rail.children].forEach(el=>el.classList.toggle('active',el.dataset.id===S.classId));
}
function renderRaceRail(){
  const rail=$('#raceRail'); if(!rail) return;
  if(!rail.children.length){
    // 46 races is too many for a single scroll row — group into Common/Exotic/Monstrous
    // (RACES already carries this grouping) and let the grid wrap+scroll vertically instead.
    let lastGroup=null;
    rail.innerHTML=RACE_ORDER_BUILD.map(id=>{
      const grp=RACES[id].group;
      const label=grp!==lastGroup?`<span class="bRailGroupLabel">${grp}</span>`:'';
      lastGroup=grp;
      return label+`
      <div class="bRailItem" data-id="${id}">
        <div class="bThumb bThumbSm" style="background-image:url(race-art/${RACE_IMG[id]}.jpg)"></div>
        <span class="bLabel bLabelSm">${RACES[id].name}</span>
      </div>`;
    }).join('');
    $$('#raceRail .bRailItem').forEach(el=>el.addEventListener('click',()=>{
      if(el.dataset.id===S.raceId) return;
      S.raceId=el.dataset.id; S.subraceId=''; S.flexBonus=['',''];
      renderSubraceAndFlex(); applyBuild();
    }));
  }
  $$('#raceRail .bRailItem').forEach(el=>el.classList.toggle('active',el.dataset.id===S.raceId));
}
function stepClass(delta){
  if(!CLASS_ORDER.length) return;
  const i=CLASS_ORDER.indexOf(S.classId);
  S.classId=CLASS_ORDER[(i<0?0:i+delta+CLASS_ORDER.length)%CLASS_ORDER.length];
  applyBuild();
}
function stepRace(delta){
  if(!RACE_ORDER_BUILD.length) return;
  const i=RACE_ORDER_BUILD.indexOf(S.raceId);
  S.raceId=RACE_ORDER_BUILD[(i<0?0:i+delta+RACE_ORDER_BUILD.length)%RACE_ORDER_BUILD.length];
  S.subraceId=''; S.flexBonus=['',''];
  renderSubraceAndFlex(); applyBuild();
}

// Class-flavored theming for the Build screen — accent color + a big crossfading portrait
// banner, so picking a class feels like forging a character, not filling a form.
// (The Subclass field's suggestion list reads subclassNamesForClass(S.classId) live on focus,
// so it always matches the currently chosen class with no syncing needed here.)
function renderBuildTheme(){
  const panel=$('#buildPanel'); if(!panel) return;
  const c=CLASSES[S.classId];
  const accent=CLASS_COLOR[S.classId]||'#c9a227';
  panel.style.setProperty('--accent',accent);
  panel.style.setProperty('--accent-dim',accent+'30');

  if(c&&S.classId!==bLastClassId){
    const bgSrc='class-art/'+S.classId+'-hero.jpg';
    if(bLastClassId===null){ $('#bBgA').src=bgSrc; } // first paint — A is already .visible
    else{
      const to=bClassFront==='A'?'B':'A';
      crossfadeImg('bBg',bClassFront,to,bgSrc);
      bClassFront=to;
      const flash=$('#bFlash');
      flash.style.setProperty('--c',accent);
      flash.classList.remove('pulse'); void flash.offsetWidth; flash.classList.add('pulse');
    }
    bLastClassId=S.classId;
  }
  $('#bEyebrow').textContent=c?`Level ${num(S.level)||1}`:'Choose your class';
  $('#bName').textContent=c?(c.name+(S.subclass?' — '+S.subclass:'')):'—';

  const lvl=Math.max(1,Math.min(20,num(S.level)||1)), tier=Math.min(5,Math.ceil(lvl/4));
  $('#bLevelStars').innerHTML=c?('Lv '+lvl+' '+'★'.repeat(tier)+'☆'.repeat(5-tier)):'';

  const bars=c?classPowerBars(S.classId):null;
  $('#bStatBars').innerHTML=bars?bars.map(b=>
    `<div class="bStatBar"><span class="bStatBarLbl">${b.label}</span>
      <span class="bStatBarTrack"><span class="bStatBarFill" style="width:${b.pct}%"></span></span></div>`).join(''):'';

  $('#bFlavor').textContent=c?(CLASS_FLAVOR[S.classId]||''):'Pick a class from the roster to see how they fight.';
  $('#bSelectedPill').classList.toggle('show',!!c);

  const ri=raceInfo();
  if(ri&&S.raceId!==bLastRaceId){
    const img=RACE_IMG[S.raceId];
    if(img){
      const src='race-art/'+img+'.jpg';
      if(bLastRaceId===null){ $('#bMbgA').src=src; $('#bMportA').src=src; }
      else{
        const to=bRaceFront==='A'?'B':'A';
        crossfadeImg('bMbg',bRaceFront,to,src); crossfadeImg('bMport',bRaceFront,to,src);
        bRaceFront=to;
      }
    }
    bLastRaceId=S.raceId;
  }
  $('#bRaceName').textContent=ri?((ri.sub&&ri.sub.name)||ri.r.name):'—';
  $('#bRaceChips').innerHTML=ri?liveRaceChips().map(t=>`<span class="bChip">${esc(t)}</span>`).join(''):'';

  renderClassRail();
  renderRaceRail();
}
function renderSubraceAndFlex(){
  const r=RACES[S.raceId];
  const fld=$('#subraceFld'), wrap=$('#subracePills');
  if(r&&r.subs){
    fld.style.display='';
    if(!r.subs[S.subraceId]) S.subraceId=Object.keys(r.subs)[0];
    wrap.innerHTML=Object.entries(r.subs).map(([id,s])=>
      `<button type="button" class="bPill ${id===S.subraceId?'active':''}" data-subid="${id}">${s.name}</button>`).join('');
    $$('#subracePills [data-subid]').forEach(b=>b.addEventListener('click',()=>{
      S.subraceId=b.dataset.subid; S.flexBonus=['','']; renderSubraceAndFlex(); applyBuild();
    }));
  }else{ fld.style.display='none'; S.subraceId=''; }
  // flexible bonus pickers: MotM lineages (+2 / +1) or Half-Elf / Variant Human (two +1s).
  // Hidden while the ability bonuses are being set by hand in Build ▸ Customize — the pills would
  // still light up but change nothing, since racialBonus() reads the override instead.
  const n=bovHas('raceBonus')?0:flexCount();
  const motm=r&&r.motm;
  const flexFld=$('#flexFld'), flexWrap=$('#flexPills');
  if(n>0){
    flexFld.style.display='';
    $('#flexLbl').textContent=motm?'Flexible Bonus — +2 to one ability, +1 to another':'Flexible Bonus — +1 to two different abilities';
    const ri=raceInfo();
    // can't pick an ability with a fixed racial bonus, or the same ability twice
    const fixed=k=>motm?false:(((ri.r.bonus&&ri.r.bonus[k])||0)+((ri.sub&&ri.sub.bonus&&ri.sub.bonus[k])||0))>0;
    flexWrap.innerHTML=Array.from({length:n},(_,i)=>{
      const label=motm?(i===0?'+2 to':'+1 to'):'+1 (choice '+(i+1)+')';
      return `<div class="bFlexGroup"><span class="bFlexGroupLbl">${label}</span>`+
        ABILITIES.filter(([k])=>!fixed(k)&&S.flexBonus[1-i]!==k).map(([k,l])=>
          `<button type="button" class="bPill ${S.flexBonus[i]===k?'active':''}" data-flexi="${i}" data-flexab="${k}">${l}</button>`).join('')+
        `</div>`;
    }).join('');
    $$('#flexPills [data-flexab]').forEach(b=>b.addEventListener('click',()=>{
      S.flexBonus[+b.dataset.flexi]=b.dataset.flexab; renderSubraceAndFlex(); applyBuild();
    }));
  // Only wipe the picks when the lineage genuinely has no flexible bonus — not when they're
  // merely hidden behind a custom spread, so resetting that override gets them back.
  }else{ flexFld.style.display='none'; if(!flexCount()) S.flexBonus=['','']; }
}
// The heritage chips under the portrait describe *this character*, not the textbook lineage, so
// they read live values — an overridden speed, darkvision or ability spread shows up here rather
// than the chips quietly contradicting the sheet.
function liveRaceChips(){
  const ri=raceInfo(); if(!ri) return [];
  const chips=[ri.r.group+' lineage','Speed '+(S.speed||raceSpeedValue()+' ft.')];
  ABILITIES.forEach(([k])=>{ const b=racialBonus(k); if(b) chips.push(fmt(b)+' '+abbr3(k)); });
  const picked=S.flexBonus.filter(Boolean).length;
  if(!bovHas('raceBonus') && flexCount()>picked)
    chips.push(ri.r.motm?'+2/+1 (your choice)':'+'+(flexCount()-picked)+' (your choice)');
  const dv=(S.vision||'').trim();
  if(dv && dv.toLowerCase()!=='none') chips.push('Darkvision '+dv);
  if(ri.r.move) chips.push(ri.r.move[0].toUpperCase()+ri.r.move.slice(1));
  return chips;
}
// Plain-text summary for the Character tab's Background picker — no chips/badges, just sentences,
// per the simpler treatment requested over the Build tab's rail+hero styling used for Class/Race.
function backgroundSummaryText(bg){
  const parts=[];
  parts.push('Skills: '+bg.skills.map(k=>SKILL_NAMES[k]||k).join(', ')+'.'+(bg.skillNote?' ('+bg.skillNote+')':''));
  if(bg.tools.length) parts.push('Proficiencies: '+bg.tools.join(', ')+'.');
  if(bg.languages) parts.push(`+${bg.languages} language${bg.languages>1?'s':''} of your choice.`);
  parts.push(`Starting gold: ${bg.gold} gp.`);
  const itemNames=(bg.equipment.items||[]).map(([n,q])=>q>1?`${n} ×${q}`:n);
  if(itemNames.length) parts.push('Equipment: '+itemNames.join(', ')+'.');
  parts.push(`Feature — ${bg.featureName}: `+(BACKGROUND_LIB.find(e=>e.g===bg.name&&e.n===bg.featureName)||{}).d);
  return parts.join(' ');
}
function renderBackgroundInfo(){
  const sel=$('#backgroundSelect'), info=$('#backgroundInfo'), btn=$('#bgGrantBtn');
  if(!sel) return;
  sel.value=S.backgroundId||'';
  const bg=BACKGROUNDS[S.backgroundId];
  info.textContent=bg?backgroundSummaryText(bg):'Pick a background to see what it grants.';
  btn.style.display=bg?'':'none';
}
function wireBackgroundSelect(){
  $('#backgroundSelect')?.addEventListener('change',e=>{
    S.backgroundId=e.target.value;
    applyBuild();
  });
}

// ---------- ASI / Feat rows ----------
// A "Feat" pick here used to be a bare label — typing a name into this table did nothing but
// sit there; the actual feat (description, effects, combat tracking) had to be added separately
// via the Features tab search, by hand, and the two could drift out of sync. Now each row's feat
// is mirrored 1:1 into a real S.features entry the moment a name is entered — pulling full data
// from FEATURE_LIB when the name matches an official feat, or starting a blank editable entry
// when it doesn't (a DM-granted feat, house rule, etc.). That entry is the single source of
// truth from then on: this field just displays/renames it.
//
// Two kinds of row share one template (renderAsiRow) and one linking scheme:
//  - the fixed per-level rows the class rules grant (4/8/12/16/19, extras for Fighter/Rogue) —
//    identified by ref {L: level number}, always present, can't be removed.
//  - "bonus" rows in S.asiExtra — a DM handing out "take a feat" or "+2 to an ability" outside
//    the normal progression doesn't fit a level slot, so these are freely added/removed, each
//    identified by ref {id: a stable id on the entry} so a link survives other bonus rows being
//    added or removed around it (an array index would not).
function asiRefKey(ref){ return ref.L!=null ? 'L:'+ref.L : 'X:'+ref.id; }
function parseAsiRef(key){ return key[0]==='L' ? {L:+key.slice(2)} : {id:key.slice(2)}; }
function asiEntry(ref){
  if(ref.L!=null) return S.asi[ref.L]||(S.asi[ref.L]={choice:'',a:'',b:'',feat:''});
  return (S.asiExtra||[]).find(x=>x.id===ref.id);
}
function asiLinkedFeat(ref){
  return S.features.find(f=>f.source&&f.source.kind==='feat'&&
    (ref.L!=null ? f.source.asiLevel===ref.L : f.source.asiExtraId===ref.id));
}
function featLibEntry(name){
  const q=name.trim().toLowerCase();
  return FEATURE_LIB.find(e=>e.g==='Feats'&&e.n.toLowerCase()===q);
}
function buildFeatFeature(name,ref){
  const ent=featLibEntry(name);
  const source = ref.L!=null ? {kind:'feat',asiLevel:ref.L} : {kind:'feat',asiExtraId:ref.id};
  if(ent) return libEntryToFeature(ent,source);
  return {title:name.trim(),desc:'',fx:[],combat:false,usesMax:0,usesPer:'short',usesUsed:0,usesScale:'',source:{...source,custom:true}};
}
function syncAsiFeat(ref){
  if(asiLinkedFeat(ref)) return; // already linked — further edits just rename it in place (below)
  const name=((asiEntry(ref)||{}).feat||'').trim();
  if(!name) return;
  S.features.push(buildFeatFeature(name,ref));
  fxRefresh();
}
function asiFeatLinkHTML(ref){
  if(!asiLinkedFeat(ref)) return '';
  return `<div class="asi-feat-link-row"><button type="button" class="asi-feat-link" data-asifeatjump="${asiRefKey(ref)}" title="Edit this feat's description, effects, or combat tracking on the Features tab">✓ Added — tap to edit</button></div>`;
}
function abOpts(sel){
  return '<option value="">— pick —</option>'+ABILITIES
    .map(([k,l])=>`<option value="${k}" ${sel===k?'selected':''}>${l}</option>`).join('');
}
// leadHTML fills the row's left-most slot (a fixed "LV 4" label, or a bonus row's editable
// name field); trailHTML adds anything after the choice fields (a bonus row's ✕ remove button).
function renderAsiRow(ref,leadHTML,trailHTML){
  const e=asiEntry(ref); if(!e) return '';
  const key=asiRefKey(ref);
  const linked=asiLinkedFeat(ref);
  const featName=linked?(linked.title||''):(e.feat||'');
  return `
    <div class="list-row asi-row">
      ${leadHTML}
      <select class="narrow asi-choice-sel" data-asichoice="${key}">
        <option value="" ${!e.choice?'selected':''}>— choose —</option>
        <option value="asi" ${e.choice==='asi'?'selected':''}>Ability Score Improvement</option>
        <option value="feat" ${e.choice==='feat'?'selected':''}>Feat</option>
      </select>
      ${e.choice==='asi'?`
        <span class="asi-ab-pair">
          <select class="asi-ab-sel" data-asia="${key}">${abOpts(e.a)}</select>
          <select class="asi-ab-sel" data-asib="${key}">${abOpts(e.b)}</select>
        </span>`:''}
      ${e.choice==='feat'?`
        <span class="sug-wrap asi-feat-wrap"><input type="text" value="${esc(featName)}" data-asifeat="${key}" autocomplete="off" placeholder="Tap to choose a feat…" readonly></span>`:''}
      ${trailHTML||''}
    </div>
    ${e.choice==='feat'?asiFeatLinkHTML(ref):''}`;
}
function renderAsi(){
  const panel=$('#asiPanel');
  const lvls=asiLevels(S.classId).filter(L=>L<=num(S.level));
  S.asiExtra=S.asiExtra||[];
  if(!S.classId && !S.asiExtra.length){ panel.style.display='none'; return; }
  panel.style.display='';
  // The feat inputs below get fully rebuilt — an open suggestion popover would be left
  // pointing at a detached node, so close it first rather than track it through the rebuild.
  closeSuggest();
  // drop stale entries from levels no longer earned (e.g. level lowered)
  Object.keys(S.asi).forEach(L=>{ if(!lvls.includes(+L)) delete S.asi[L]; });
  const lvlRows=lvls.map(L=>renderAsiRow({L},
    `<span class="asi-lv">LV ${L}</span>`
  )).join('');
  const bonusRows=S.asiExtra.map(e=>renderAsiRow({id:e.id},
    `<input type="text" class="asi-bonus-label" value="${esc(e.label||'')}" data-asibonuslabel="${e.id}" placeholder="e.g. DM boon">`,
    `<button type="button" class="del-btn" data-asibonusdel="${e.id}" title="Remove this bonus pick">✕</button>`
  )).join('');
  $('#asiList').innerHTML =
    (lvls.length?lvlRows:'<p class="prep-note" style="margin:0 0 10px">Bonus picks below still work.</p>')
    + (S.asiExtra.length?`<div class="asi-bonus-hdr">Bonus picks</div>${bonusRows}`:'')
    + `<button type="button" class="add-btn" id="asiBonusAdd" style="margin-top:4px">+ Add bonus ASI/Feat</button>`;
  $$('[data-asichoice]').forEach(s=>s.addEventListener('change',()=>{
    asiEntry(parseAsiRef(s.dataset.asichoice)).choice=s.value;
    renderAsi(); recalc(); save();
  }));
  $$('[data-asia]').forEach(s=>s.addEventListener('change',()=>{
    asiEntry(parseAsiRef(s.dataset.asia)).a=s.value; recalc(); save();
  }));
  $$('[data-asib]').forEach(s=>s.addEventListener('change',()=>{
    asiEntry(parseAsiRef(s.dataset.asib)).b=s.value; recalc(); save();
  }));
  $$('[data-asifeat]').forEach(inp=>{
    inp.addEventListener('input',()=>{
      const ref=parseAsiRef(inp.dataset.asifeat), linked=asiLinkedFeat(ref);
      // Once linked, this field just renames the real entry in place; until then it's caching
      // the in-progress name for syncAsiFeat to pick up on blur (see the 'change' listener below).
      if(linked) linked.title=inp.value; else asiEntry(ref).feat=inp.value;
      save();
    });
    inp.addEventListener('change',()=>{
      const ref=parseAsiRef(inp.dataset.asifeat), linked=asiLinkedFeat(ref);
      if(linked && !inp.value.trim()){ delete linked.source.asiLevel; delete linked.source.asiExtraId; save(); } // cleared — unlink, keep the entry itself
      else syncAsiFeat(ref);
      renderAsi();
    });
  });
  $$('[data-asifeatjump]').forEach(b=>b.addEventListener('click',()=>{
    const idx=S.features.findIndex(f=>f===asiLinkedFeat(parseAsiRef(b.dataset.asifeatjump)));
    showTab('features');
    if(idx<0) return;
    const card=$$('#featureList .feature-card')[idx];
    if(card){ card.scrollIntoView({behavior:'smooth',block:'center'}); card.classList.add('flash'); setTimeout(()=>card.classList.remove('flash'),900); }
  }));
  $$('[data-asibonuslabel]').forEach(inp=>inp.addEventListener('input',()=>{
    const e=(S.asiExtra||[]).find(x=>x.id===inp.dataset.asibonuslabel);
    if(e){ e.label=inp.value; save(); }
  }));
  $$('[data-asibonusdel]').forEach(b=>b.addEventListener('click',()=>{
    const id=b.dataset.asibonusdel;
    // The feat this bonus row created stays on the Features tab (same paper-trail philosophy as
    // deleting an attack/spell doesn't retroactively erase a turn-plan step referencing it) —
    // just unlinked, so removing a bonus pick can't silently delete a feat you've since edited.
    const linked=S.features.find(f=>f.source&&f.source.kind==='feat'&&f.source.asiExtraId===id);
    if(linked) delete linked.source.asiExtraId;
    S.asiExtra=(S.asiExtra||[]).filter(x=>x.id!==id);
    renderAsi(); recalc(); save();
  }));
  $('#asiBonusAdd')?.addEventListener('click',()=>{
    S.asiExtra=S.asiExtra||[];
    S.asiExtra.push({id:'x'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),choice:'',a:'',b:'',feat:'',label:''});
    renderAsi(); save();
    $('#asiList .asi-bonus-label:last-of-type')?.focus();
  });
}

// ---------- Build overrides ----------
// applyBuild() used to stamp its computed values straight over proficiency bonus, hit dice, save
// proficiencies, spell slots, speed and darkvision every single time you touched the Build tab.
// The fields stayed editable, but nothing *remembered* the edit — so a hand-set speed or an extra
// save proficiency silently reverted the next time you tapped a rail arrow, and line "saveProf[k]=
// c.saves.includes(k)" assigned all six at once, wiping a manually-added save rather than merging.
//
// Every derived field now routes through this one table. applyBuild always computes the rules
// value (still shown, greyed, as the reference), but only *writes* it when the player hasn't taken
// that field over. Taking it over = the key exists in S.buildOverride, set either by editing the
// field in Build ▸ Customize or by editing it in its natural home (tapping a save tile, typing a
// slot total) — so a manual change can never be clobbered without you asking for it back with ↺.
// Same auto-vs-manual split the AC engine already uses (S.equip.acAuto).
function raceDisplayName(){
  const ri=raceInfo(); if(!ri) return '';
  return (ri.sub&&ri.sub.name)||ri.r.name;
}
function raceSpeedValue(){ const ri=raceInfo(); return ri?((ri.sub&&ri.sub.speed)||ri.r.speed):0; }
// Darkvision range: subrace overrides the race default (e.g. Drow 120 ft. vs. base Elf 60 ft.);
// races with no "dark" field at all (Human, Halfling, Dragonborn...) have no darkvision.
function raceDarkValue(){
  const ri=raceInfo(); if(!ri) return 0;
  return (ri.sub&&ri.sub.dark!=null)?ri.sub.dark:(ri.r.dark||0);
}
// A class with no casting progression grants an empty table, not "no opinion" — otherwise
// switching from Cleric to Fighter would leave the cleric's 4/3 slots sitting on a Fighter sheet
// forever. Slots you set yourself are protected the normal way, by being an override.
function rulesSlots(){
  const c=CLASSES[S.classId]; if(!c||!c.cast) return Array(9).fill(0);
  const s = c.cast==='pact' ? pactSlots(S.level)
          : c.cast==='half' ? (S.level<2?[]:FULL_SLOTS[Math.ceil(S.level/2)])
          : FULL_SLOTS[S.level];
  return Array.from({length:9},(_,i)=>s[i]||0);
}
const abbr3=k=>AB_NAMES[k].slice(0,3).toUpperCase();
// type drives the Customize panel's editor: 'text'/'num' a plain input, 'abset' a row of six
// toggle pills, 'ability' a row of six pick-one pills, 'slots' nine little number boxes.
const BUILD_FIELDS=[
  {key:'classLevel',label:'Class & Level',type:'text',hint:'Free text — write "Cleric 3 / Rogue 2" for a multiclass.',
   avail:()=>!!CLASSES[S.classId],
   rules:()=>CLASSES[S.classId].name+' '+S.level,
   get:()=>S.classLevel||'', set:v=>S.classLevel=String(v??'').trim(), show:v=>v||'—'},
  {key:'profBonus',label:'Proficiency Bonus',type:'num',hint:'5e progression is +2 at level 1, +1 more every 4 levels.',
   avail:()=>true,
   rules:()=>2+Math.floor((Math.max(1,num(S.level))-1)/4),
   get:()=>num(S.profBonus), set:v=>S.profBonus=Math.max(0,num(v)), show:v=>fmt(num(v))},
  {key:'hdTotal',label:'Hit Dice',type:'text',hint:'Total pool, e.g. "5d10" — or "3d8 + 2d6" if you multiclass.',
   avail:()=>!!CLASSES[S.classId],
   rules:()=>S.level+'d'+CLASSES[S.classId].hd,
   get:()=>S.hdTotal||'', set:v=>S.hdTotal=String(v??'').trim(), show:v=>v||'—'},
  {key:'saves',label:'Saving Throws',type:'abset',hint:'Tap to add or drop one — your class defaults stop applying once you do.',
   avail:()=>!!CLASSES[S.classId],
   rules:()=>CLASSES[S.classId].saves.slice(),
   get:()=>ABILITIES.filter(([k])=>S.saveProf[k]).map(([k])=>k),
   set:v=>{const on=v||[];ABILITIES.forEach(([k])=>S.saveProf[k]=on.includes(k));},
   show:v=>(v&&v.length)?v.map(abbr3).join('/')+' saves':'no save proficiencies'},
  // Spellcasting is offered whatever your class is. Plenty of characters cast without their class
  // table saying so — Eldritch Knight, Arcane Trickster, a multiclass dip, a race or item that
  // grants slots, homebrew — and gating these two on CLASSES[...].cast meant those players had no
  // way to set them here at all. A non-casting class still grants nothing (so a class switch
  // clears the old table); noRules() only changes how the reference is worded, since "rules: none"
  // reads like a rule about spellcasting rather than the absence of one.
  {key:'spellAbility',label:'Spellcasting Ability',type:'ability',hint:'Drives spell save DC and attack bonus.',
   avail:()=>true, noRules:()=>!(CLASSES[S.classId]&&CLASSES[S.classId].cast),
   rules:()=>{const c=CLASSES[S.classId];return (c&&c.cast)?c.ab:'';},
   get:()=>S.spellAbility||'', set:v=>S.spellAbility=v||'', show:v=>v?AB_NAMES[v]:'—'},
  {key:'slots',label:'Spell Slots',type:'slots',hint:'Slots per spell level 1–9.',
   avail:()=>true, noRules:()=>!(CLASSES[S.classId]&&CLASSES[S.classId].cast),
   rules:rulesSlots,
   get:()=>Array.from({length:9},(_,i)=>num(S.spellLevels[i+1].total)),
   set:v=>{for(let L=1;L<=9;L++){const lv=S.spellLevels[L];lv.total=Math.max(0,num((v||[])[L-1]));lv.used=Math.min(num(lv.used),lv.total);}},
   show:v=>{const on=(v||[]).map((n,i)=>n?`${n}×L${i+1}`:'').filter(Boolean);return on.length?on.join(' '):'none';}},
  {key:'race',label:'Race',type:'text',hint:'The name shown in the header — rename it freely, e.g. "Tiefling (Bloodline of Dispater)".',
   avail:()=>!!raceInfo(),
   rules:raceDisplayName,
   get:()=>S.race||'', set:v=>S.race=String(v??'').trim(), show:v=>v||'—'},
  {key:'background',label:'Background',type:'text',hint:'The name shown in the header — rename it freely.',
   avail:()=>!!BACKGROUNDS[S.backgroundId],
   rules:()=>BACKGROUNDS[S.backgroundId].name,
   get:()=>S.background||'', set:v=>S.background=String(v??'').trim(), show:v=>v||'—'},
  // The only field with no home of its own on the sheet: racial bonuses are never written into
  // S.abilities (so changing heritage can't double-apply them), they're added live by
  // racialBonus(). That reads the override directly, so there is nothing for set() to write.
  {key:'raceBonus',label:'Ability Bonuses',type:'abmap',hint:'',
   avail:()=>!!raceInfo(),
   rules:()=>Object.fromEntries(ABILITIES.map(([k])=>[k,racialBonusRules(k)])),
   get:()=>Object.fromEntries(ABILITIES.map(([k])=>[k,racialBonus(k)])),
   set:()=>{},
   show:v=>{
     const on=ABILITIES.filter(([k])=>num((v||{})[k])).map(([k])=>`${fmt(num(v[k]))} ${abbr3(k)}`);
     return on.length?on.join(' '):'none';
   }},
  {key:'speed',label:'Speed',type:'text',hint:'Feature bonuses (e.g. Fast Movement) are added on top of this.',
   avail:()=>!!raceInfo(),
   rules:()=>raceSpeedValue()+' ft.',
   get:()=>S.speed||'', set:v=>S.speed=String(v??'').trim(), show:v=>v||'—'},
  {key:'vision',label:'Darkvision',type:'text',hint:'"None" if you have none.',
   avail:()=>!!raceInfo(),
   rules:()=>{const dv=raceDarkValue();return dv>0?dv+' ft.':'None';},
   get:()=>S.vision||'', set:v=>S.vision=String(v??'').trim(), show:v=>v||'—'},
];
const buildField=key=>BUILD_FIELDS.find(f=>f.key===key);
function bovHas(key){ return !!S.buildOverride && Object.prototype.hasOwnProperty.call(S.buildOverride,key); }
// Take a field over at its current value. Called from the Customize panel and from the fields'
// natural homes (save tiles, slot inputs) so editing one in place is enough to keep it.
function bovClaim(key){
  const f=buildField(key); if(!f) return;
  (S.buildOverride||(S.buildOverride={}))[key]=f.get();
}
function bovSet(key,val){
  const f=buildField(key); if(!f) return;
  (S.buildOverride||(S.buildOverride={}))[key]=val;
  f.set(val);
}
function bovReset(key){ if(S.buildOverride) delete S.buildOverride[key]; }

// Apply class/level/race choices to the sheet.
// Only writes the fields these choices control, and only those you haven't taken over above.
function applyBuild(){
  S.level=Math.max(1,Math.min(20,num(S.level)||1));
  const c=CLASSES[S.classId];
  // Settle subrace and flexible bonuses first — speed, darkvision and the ability spread all
  // read them, and this is also what shows/hides the flex picker when its override changes.
  renderSubraceAndFlex();
  BUILD_FIELDS.forEach(f=>{
    if(!f.avail()) return;
    f.set(bovHas(f.key) ? S.buildOverride[f.key] : f.rules());
  });
  if(c&&c.cast&&!S.spellClass) S.spellClass=c.name;
  syncSubclass();
  syncGrantedFeatures();
  renderBuildNote();
  renderBuildCustom();
  renderBackgroundInfo();
  renderAsi(); renderSaves(); renderSpellLevels(); renderFeatures(); syncBound(); recalc(); save();
}
// The build summary line. Each derived value reads from the sheet (so an override shows *your*
// number, not the rules one) and is marked ✎ when you've taken it over, so the summary never
// claims to have set something it didn't.
function renderBuildNote(){
  const el=$('#buildNote'); if(!el) return;
  const mark=key=>bovHas(key)?'✎':'';
  const val=key=>{const f=buildField(key);return f.show(f.get());};
  const c=CLASSES[S.classId], notes=[];
  if(c){
    const bits=[`proficiency ${val('profBonus')}${mark('profBonus')}`,`hit dice ${val('hdTotal')}${mark('hdTotal')}`,`${val('saves')}${mark('saves')}`];
    // Mentioned for a non-casting class too once you've set slots or an ability yourself.
    if(c.cast||bovHas('slots')||bovHas('spellAbility'))
      bits.push(`${c.name==='Warlock'?'pact magic':'spell'} slots set (${val('spellAbility')}${mark('spellAbility')})${mark('slots')}`);
    notes.push(`${val('classLevel')||c.name+' '+S.level}${mark('classLevel')}: ${bits.join(', ')}`);
  }
  const ri=raceInfo();
  if(ri){
    const bs=ABILITIES.filter(([k])=>racialBonus(k)>0).map(([k])=>`+${racialBonus(k)} ${abbr3(k)}`);
    const dv=val('vision');
    notes.push(`${val('race')||raceDisplayName()}${mark('race')}: ${val('speed')}${mark('speed')}${ri.r.move?' ('+ri.r.move+')':''}`+
      `${dv&&dv!=='None'?', darkvision '+dv+mark('vision'):''}${bs.length?', '+bs.join(' '):''}`+
      (flexCount()>0&&S.flexBonus.filter(Boolean).length<flexCount()?' — pick your bonus abilities above!':''));
  }
  el.textContent=notes.join('  ·  ')||'Choose a class and level to auto-set proficiency, hit dice, saving throws and spell slots. Choose a race for speed and ability bonuses.';
}

// ---------- Build ▸ Customize panel ----------
// One row per BUILD_FIELDS entry: the live value as an editor, the rules value beside it as a
// greyed reference, and ↺ to hand the field back to the class/race defaults. Editing any row
// claims that field (see bovClaim) so applyBuild stops writing it. Folded away behind a button
// by default — the summary line above stays the everyday view, this is the "actually, mine is
// different" drawer underneath it.
function bcEditorHTML(f){
  const v=f.get(), k=f.key;
  if(f.type==='abset'){
    const on=Array.isArray(v)?v:[];
    return `<div class="bPillRow">${ABILITIES.map(([a,label])=>
      `<button type="button" class="bPill ${on.includes(a)?'active':''}" data-bcab="${k}.${a}" title="${esc(label)}">${abbr3(a)}</button>`).join('')}</div>`;
  }
  if(f.type==='ability'){
    return `<div class="bPillRow">${ABILITIES.map(([a,label])=>
      `<button type="button" class="bPill ${v===a?'active':''}" data-bcabone="${k}.${a}" title="${esc(label)}">${abbr3(a)}</button>`).join('')}</div>`;
  }
  if(f.type==='slots'){
    const on=Array.isArray(v)?v:[];
    return `<div class="bcSlots">${Array.from({length:9},(_,i)=>
      `<label class="bcSlot"><span>L${i+1}</span><input type="number" min="0" max="9" value="${num(on[i])}" data-bcslot="${k}.${i}"></label>`).join('')}</div>`;
  }
  if(f.type==='abmap'){
    const m=v||{};
    return `<div class="bcSlots">${ABILITIES.map(([a,label])=>
      `<label class="bcSlot" title="${esc(label)}"><span>${abbr3(a)}</span><input type="number" min="-5" max="10" value="${num(m[a])}" data-bcabmap="${k}.${a}"></label>`).join('')}</div>`;
  }
  const type=f.type==='num'?'number':'text';
  return `<input class="bcIn" type="${type}" value="${esc(v)}" data-bcin="${k}">`;
}
// Where a field's reference value comes from. A class that doesn't cast grants no slots at all,
// which is worth wording as "your class doesn't grant this" rather than "rules: none" — the
// latter reads like a rule about spellcasting instead of the absence of one.
function bcRulesLabel(f){
  if(f.noRules&&f.noRules()) return 'not granted by your class';
  return 'rules: '+f.show(f.rules());
}
function renderBuildCustom(){
  const box=$('#buildCustomBody'), btn=$('#buildCustomBtn'); if(!box||!btn) return;
  const open=!!S.buildCustomOpen;
  btn.textContent=open?'✕ Done customizing':'✎ Customize defaults';
  btn.classList.toggle('on',open);
  box.style.display=open?'':'none';
  if(!open) return;
  const rows=BUILD_FIELDS.filter(f=>f.avail());
  if(!rows.length){ box.innerHTML='<p class="prep-note" style="margin:0">Pick a class or heritage above and its defaults show up here, ready to be overridden.</p>'; return; }
  box.innerHTML=rows.map(f=>{
    const on=bovHas(f.key);
    return `
    <div class="bcRow ${on?'on':''}">
      <div class="bcTop">
        <span class="bcLbl">${esc(f.label)}</span>
        ${on?'<span class="bcTag">custom</span>':''}
        <span class="bcRules" title="What the class/heritage rules give you">${esc(bcRulesLabel(f))}</span>
        ${on?`<button type="button" class="bcReset" data-bcreset="${f.key}" title="Drop your version and follow the rules value again">↺</button>`:''}
      </div>
      ${bcEditorHTML(f)}
      ${f.hint?`<div class="bcHint">${esc(f.hint)}</div>`:''}
    </div>`;
  }).join('')
  + `<label class="bcAuto"><input type="checkbox" id="bcAutoGrant" ${S.autoGrant?'checked':''}>
       <span><b>Auto-add features</b> — grant the class, subclass, heritage and background features you qualify for, on the Features tab. They stay fully editable; the ones you've edited are kept even if you change your mind later.</span></label>`;
  wireBuildCustomRows();
}
function wireBuildCustomRows(){
  const commit=()=>{ applyBuild(); };
  $$('[data-bcin]').forEach(inp=>inp.addEventListener('change',()=>{
    bovSet(inp.dataset.bcin,inp.value); commit();
  }));
  $$('[data-bcab]').forEach(b=>b.addEventListener('click',()=>{
    const [key,ab]=b.dataset.bcab.split('.');
    const f=buildField(key), cur=f.get();
    bovSet(key,cur.includes(ab)?cur.filter(x=>x!==ab):[...cur,ab]);
    commit();
  }));
  $$('[data-bcabone]').forEach(b=>b.addEventListener('click',()=>{
    const [key,ab]=b.dataset.bcabone.split('.');
    bovSet(key,buildField(key).get()===ab?'':ab); commit();
  }));
  $$('[data-bcslot]').forEach(inp=>inp.addEventListener('change',()=>{
    const [key,i]=inp.dataset.bcslot.split('.');
    const next=buildField(key).get(); next[+i]=Math.max(0,Math.min(9,num(inp.value)));
    bovSet(key,next); commit();
  }));
  $$('[data-bcabmap]').forEach(inp=>inp.addEventListener('change',()=>{
    const [key,ab]=inp.dataset.bcabmap.split('.');
    const next=buildField(key).get(); next[ab]=Math.max(-5,Math.min(10,num(inp.value)));
    bovSet(key,next); commit();
  }));
  $$('[data-bcreset]').forEach(b=>b.addEventListener('click',()=>{
    bovReset(b.dataset.bcreset); commit();
  }));
  $('#bcAutoGrant')?.addEventListener('change',e=>{
    S.autoGrant=e.target.checked;
    // Turning it off doesn't rip anything out — granted cards just stop being managed (see
    // syncGrantedFeatures), same unlink-not-delete rule the rest of the sheet follows.
    if(!S.autoGrant) S.features.forEach(f=>{ if(f.source) delete f.source.grantKey; });
    applyBuild();
  });
}
function wireBuildCustom(){
  $('#buildCustomBtn')?.addEventListener('click',()=>{
    S.buildCustomOpen=!S.buildCustomOpen;
    renderBuildCustom(); save();
  });
}

// ---------- Subclass ----------
// The subclass used to be a bare string with no owner: switching from Ranger to Cleric left
// "Gloom Stalker" sitting in the field, so "Cleric — Gloom Stalker" was reachable. It now
// remembers which class it was picked for and clears itself when that class changes.
// Level gate is advisory only (a DM handing one out early is a legitimate thing to want) —
// it just annotates the field rather than blocking the pick.
const SUBCLASS_LEVEL={cleric:1,sorcerer:1,warlock:1,druid:2,wizard:2};
function subclassLevel(classId){ return SUBCLASS_LEVEL[classId]||3; }
function syncSubclass(){
  if(!S.subclass){ S.subclassClassId=''; return; }
  if(S.subclassClassId && S.subclassClassId!==S.classId){ S.subclass=''; S.subclassClassId=''; return; }
  if(!S.subclassClassId) S.subclassClassId=S.classId;
}
function renderSubclassField(){
  const inp=$('#subclassIn'); if(!inp) return;
  inp.value=S.subclass||'';
  const c=CLASSES[S.classId];
  const need=c?subclassLevel(S.classId):0;
  inp.placeholder = c ? (subclassNamesForClass(S.classId).length?`Tap to choose — ${c.name} picks at level ${need}`:'Tap to type your own') : 'Pick a class first';
  const lbl=inp.closest('.bFld')?.querySelector('span');
  if(lbl) lbl.textContent = (c&&S.subclass&&num(S.level)<need) ? `Subclass (normally level ${need})` : 'Subclass';
}

// ---------- Granted features (class / subclass / heritage) ----------
// Choosing a class, subclass or heritage used to grant exactly nothing — you had to know to go to
// the Features tab and search each entry out by hand, and the subclass in particular had no CRUD
// at all: nothing created its features, nothing listed them, nothing cleaned them up when you
// changed your mind. Every entry you qualify for is now mirrored into S.features automatically,
// stamped with a grantKey saying where it came from, and is a completely normal editable card
// from that moment on.
//
// The retire rule is the same paper-trail philosophy as the ASI feat mirror above: a granted card
// you never touched is removed when you stop qualifying for it (no litter after a level-down or a
// subclass swap), but one you've *edited* is only unlinked — it stays on the sheet as a plain
// feature, because deleting someone's writing to tidy up is never the right trade.
const GRANT_SEP='|';
const GENERIC_SUB_WORDS=new Set(['elf','dwarf','halfling','human','gnome','orc','aasimar','of','the']);
// Race traits mark subrace-only entries with a parenthetical suffix — "Fleet of Foot (Wood Elf)",
// "Elf Weapon Training (High/Wood Elf)". Unmarked traits belong to everyone; a marked one is
// granted only when the chosen subrace shares a distinctive word with the marker, so a High Elf
// gets Cantrip but not Superior Darkvision. A marker that's really a level note ("3rd level+")
// isn't a subrace marker at all, so it counts as unmarked.
function raceTraitApplies(name,subName){
  const m=/\(([^)]*)\)\s*$/.exec(name||'');
  if(!m) return true;
  const marker=m[1];
  if(/level/i.test(marker)) return true;
  if(!subName) return false;
  const words=s=>String(s).toLowerCase().split(/[^a-z]+/).filter(w=>w&&!GENERIC_SUB_WORDS.has(w));
  const sub=new Set(words(subName));
  return words(marker).some(w=>sub.has(w));
}
// Everything the current class + level + subclass + heritage entitles you to, as {key,ent,source}.
function grantedPlan(){
  const out=[], L=num(S.level), c=CLASSES[S.classId];
  if(c){
    FEATURE_LIB.forEach(e=>{
      if(e.g===c.name && num(e.l)<=L)
        out.push({key:['class',S.classId,e.n].join(GRANT_SEP),ent:e,lib:'feature',
          source:{kind:'class',classId:S.classId,className:c.name}});
    });
    if(S.subclass){
      const g=c.name+' — '+S.subclass;
      FEATURE_LIB.forEach(e=>{
        if(e.g===g && num(e.l)<=L)
          out.push({key:['sub',S.classId,S.subclass,e.n].join(GRANT_SEP),ent:e,lib:'feature',
            source:{kind:'subclass',classId:S.classId,className:g,subclassName:S.subclass}});
      });
    }
  }
  const ri=raceInfo();
  if(ri){
    const g=ri.r.name, subName=(ri.sub&&ri.sub.name)||'';
    RACE_LIB.forEach(e=>{
      if(e.g===g && raceTraitApplies(e.n,subName))
        out.push({key:['race',g,e.n].join(GRANT_SEP),ent:e,lib:'race',source:{kind:'race',raceName:g}});
    });
  }
  const bg=BACKGROUNDS[S.backgroundId];
  if(bg){
    BACKGROUND_LIB.forEach(e=>{
      if(e.g===bg.name)
        out.push({key:['background',bg.name,e.n].join(GRANT_SEP),ent:e,lib:'background',source:{kind:'background',backgroundName:bg.name}});
    });
  }
  return out;
}
function grantLibEntry(key){
  const parts=String(key).split(GRANT_SEP), name=parts[parts.length-1];
  const lib = parts[0]==='race' ? RACE_LIB : parts[0]==='background' ? BACKGROUND_LIB : FEATURE_LIB;
  return lib.find(e=>e.n===name);
}
// "Still exactly what the library handed you" — safe to remove without losing anyone's work.
function featureIsPristine(f){
  const ent=grantLibEntry((f.source||{}).grantKey||'');
  if(!ent) return false;
  return (f.title||'')===ent.n && (f.desc||'')===(ent.d||'') && !num(f.usesUsed) && !f.combatEdited;
}
function syncGrantedFeatures(){
  if(!S.autoGrant) return;
  const plan=grantedPlan();
  const want=new Set(plan.map(p=>p.key));
  S.features=S.features.filter(f=>{
    const k=f.source&&f.source.grantKey;
    if(!k||want.has(k)) return true;
    if(featureIsPristine(f)) return false;
    delete f.source.grantKey;   // edited — keep the card, just stop managing it
    return true;
  });
  const have=new Set(S.features.map(f=>(f.source||{}).grantKey).filter(Boolean));
  let added=0;
  plan.forEach(p=>{
    if(have.has(p.key)) return;
    // Already added by hand from the search box? Adopt that card instead of stacking a twin.
    const dup=S.features.find(f=>!(f.source&&f.source.grantKey)&&(f.title||'').trim().toLowerCase()===p.ent.n.toLowerCase());
    if(dup){ dup.source={...(dup.source||{}),...p.source,grantKey:p.key}; return; }
    const f = p.lib==='race' ? raceEntryToFeature(p.ent,p.source)
      : p.lib==='background' ? backgroundEntryToFeature(p.ent,p.source)
      : libEntryToFeature(p.ent,p.source);
    f.source.grantKey=p.key;
    S.features.push(f); added++;
  });
  // defaultState() seeds one blank feature row; once real cards land it's just an empty box at
  // the top of the list. Only swept when something was actually granted, so a blank row you just
  // added yourself on the Features tab isn't yanked out from under you.
  if(added) S.features=S.features.filter(f=>(f.title||'').trim()||(f.desc||'').trim()||(f.fx||[]).length);
}

function wireBuild(){
  $('#levelIn').addEventListener('change',e=>{
    S.level=Math.max(1,Math.min(20,num(e.target.value)||1));
    e.target.value=S.level; applyBuild();
  });
  $('#classPrevBtn').addEventListener('click',()=>stepClass(-1));
  $('#classNextBtn').addEventListener('click',()=>stepClass(1));
  $('#racePrevBtn').addEventListener('click',()=>stepRace(-1));
  $('#raceNextBtn').addEventListener('click',()=>stepRace(1));
  // Either Subclass field (Build or Overview header) runs the full build pass, so picking one
  // grants its features immediately instead of leaving the choice as a label with nothing behind
  // it. Delegated because the Overview field is re-rendered with the rest of that tab.
  document.addEventListener('change',e=>{
    if(!isSubclassInput(e.target)) return;
    S.subclass=e.target.value.trim();
    S.subclassClassId=S.subclass?S.classId:'';
    renderSubclassField(); applyBuild();
  });
}

// ---------- Hit dice & rests ----------
// Total hit dice: class+level when set, otherwise parsed from the old "5d8" text field
function hdCount(){
  const c=CLASSES[S.classId];
  if(c) return {n:Math.max(1,num(S.level)),die:'d'+c.hd};
  const m=String(S.hdTotal||'').match(/(\d+)\s*d\s*(\d+)/i);
  return m?{n:+m[1],die:'d'+m[2]}:{n:0,die:''};
}
function wireRest(){
  $('#hdSpend').addEventListener('click',()=>{
    const {n}=hdCount();
    S.hdUsed=Math.min(n,num(S.hdUsed)+1);
    recalc(); save();
  });
  $('#hdRegain').addEventListener('click',()=>{
    S.hdUsed=Math.max(0,num(S.hdUsed)-1);
    recalc(); save();
  });
  $('#shortRestBtn').addEventListener('click',()=>{
    if(CLASSES[S.classId]&&CLASSES[S.classId].cast==='pact') S.spellLevels.forEach(lv=>lv.used=0);
    S.features.forEach(f=>{ if(f.combat && num(f.usesMax)>0 && f.usesPer!=='long') f.usesUsed=0; });
    renderSpellLevels(); renderCombatFeatures(); recalc(); save();
  });
  $('#longRestBtn').addEventListener('click',()=>{
    S.hpCurrent=num(S.hpMax)+fxStat('hpmax');
    S.hpTemp=0;
    S.spellLevels.forEach(lv=>lv.used=0);
    const {n}=hdCount();
    const regained=Math.max(1,Math.floor(n/2));
    S.hdUsed=Math.max(0,num(S.hdUsed)-regained);
    S.deathS=[false,false,false]; S.deathF=[false,false,false];
    S.features.forEach(f=>{ if(f.combat && num(f.usesMax)>0) f.usesUsed=0; }); // long rest recharges everything
    renderSpellLevels(); renderDeathSaves(); renderCombatFeatures(); syncBound(); recalc(); save();
  });
}

// ---------- Character HUD: armor & AC engine ----------
function renderHudControls(){
  const eq=S.equip;
  const sel=$('#armorSel');
  // Grouped by weight class, each option carrying its own AC formula and drawbacks — the
  // choice explains itself instead of sending you back to the PHB table.
  const cat=a=>/light/.test(a.n)?'Light armor':/medium/.test(a.n)?'Medium armor':/heavy/.test(a.n)?'Heavy armor':'Unarmored';
  const label=a=>{
    const f=a.dex===99?`${a.base} + DEX`:a.dex===0?`${a.base} flat`:`${a.base} + DEX (max ${a.dex})`;
    return `${a.n.split(' (')[0]} — ${f}${a.sd?' · stealth −':''}${a.str?` · needs STR ${a.str}`:''}`;
  };
  const cats=['Unarmored','Light armor','Medium armor','Heavy armor'];
  sel.innerHTML=cats.map(c=>{
    const opts=Object.entries(ARMORS).filter(([,a])=>cat(a)===c);
    if(!opts.length) return '';
    return `<optgroup label="${c}">${opts.map(([id,a])=>`<option value="${id}" ${eq.armor===id?'selected':''}>${label(a)}</option>`).join('')}</optgroup>`;
  }).join('');
  $('#armorMagic').value=num(eq.armorMagic);
  $('#shieldChk').checked=!!eq.shield;
  $('#shieldMagic').value=num(eq.shieldMagic);
  $('#acAutoChk').checked=!!eq.acAuto;
}
function wireHud(){
  renderHudControls();
  $('#armorSel').addEventListener('change',e=>{S.equip.armor=e.target.value;recalc();save();});
  $('#armorMagic').addEventListener('input',e=>{S.equip.armorMagic=num(e.target.value);recalc();save();});
  $('#shieldChk').addEventListener('change',e=>{S.equip.shield=e.target.checked;recalc();save();});
  $('#shieldMagic').addEventListener('input',e=>{S.equip.shieldMagic=num(e.target.value);recalc();save();});
  $('#acAutoChk').addEventListener('change',e=>{S.equip.acAuto=e.target.checked;recalc();save();});
}
// ---------- Themed dialogs & option sheets ----------
// Native confirm()/alert() and the OS <select> dropdown look nothing like the binder and give
// tiny tap targets on a tablet. Both get an in-theme replacement:
//  · uiAlert / uiConfirm — promise-based modals in the binder's own chrome; callers .then().
//  · every <select> opens as a big-rowed option sheet. The real <select> stays in the DOM and
//    receives value + input/change events, so all existing listeners work unchanged. Only
//    taps are intercepted — opening with the keyboard keeps the native, accessible control.
function uiDialog(o){
  return new Promise(res=>{
    const wrap=document.createElement('div');
    wrap.className='ui-dlg-bg open';
    wrap.innerHTML=`<div class="ui-dlg" role="dialog" aria-modal="true">
      <h3>${esc(o.title||'Are you sure?')}</h3>
      <p>${esc(o.msg||'')}</p>
      <div class="ui-dlg-btns">
        ${o.cancel?`<button class="ui-dlg-cancel">${esc(o.cancel)}</button>`:''}
        <button class="ui-dlg-ok ${o.danger?'danger':''}">${esc(o.ok||'OK')}</button>
      </div></div>`;
    const onKey=e=>{ if(e.key==='Escape') done(false); };
    const done=v=>{ wrap.remove(); document.removeEventListener('keydown',onKey); res(v); };
    wrap.addEventListener('click',e=>{
      if(e.target===wrap) return done(false);
      if(e.target.closest('.ui-dlg-ok')) return done(true);
      if(e.target.closest('.ui-dlg-cancel')) return done(false);
    });
    document.addEventListener('keydown',onKey);
    document.body.appendChild(wrap);
    wrap.querySelector('.ui-dlg-ok').focus();
  });
}
const uiAlert=(msg,title='Heads up')=>uiDialog({title,msg,ok:'OK'});
const uiConfirm=(msg,o={})=>uiDialog(Object.assign({msg,title:'Are you sure?',ok:'Yes',cancel:'Cancel'},o));
// The sheet's heading: the select's own title, or the field label it sits inside.
function selectSheetLabel(sel){
  if(sel.title) return sel.title;
  const fld=sel.closest('label.fld'), sp=fld&&fld.querySelector('span');
  return (sp&&sp.textContent.trim())||'Choose an option';
}
let SEL_OPEN=false;
function openSelectSheet(sel){
  SEL_OPEN=true;
  const wrap=document.createElement('div');
  wrap.className='ui-dlg-bg sel-sheet-bg open';
  const rows=[];
  const opt=o=>rows.push(`<button class="sel-opt ${o.value===sel.value?'on':''}" ${o.disabled?'disabled':''} data-selval="${esc(o.value)}"><span>${esc(o.textContent.trim()||'—')}</span>${o.value===sel.value?'<i>✦</i>':''}</button>`);
  [...sel.children].forEach(ch=>{
    if(ch.tagName==='OPTGROUP'){ rows.push(`<div class="sel-group">${esc(ch.label)}</div>`); [...ch.children].forEach(opt); }
    else if(ch.tagName==='OPTION') opt(ch);
  });
  wrap.innerHTML=`<div class="sel-sheet" role="listbox" aria-label="${esc(selectSheetLabel(sel))}">
    <h3>${esc(selectSheetLabel(sel))}</h3>
    <div class="sel-opts">${rows.join('')}</div></div>`;
  const onKey=e=>{ if(e.key==='Escape') done(); };
  const done=()=>{ wrap.remove(); document.removeEventListener('keydown',onKey); SEL_OPEN=false; };
  wrap.addEventListener('click',e=>{
    if(e.target===wrap) return done();
    const b=e.target.closest('[data-selval]');
    if(b){
      sel.value=b.dataset.selval;
      // Both events, bubbling — data-bind fields listen to 'input', everything else to 'change'.
      sel.dispatchEvent(new Event('input',{bubbles:true}));
      sel.dispatchEvent(new Event('change',{bubbles:true}));
      done();
    }
  });
  document.addEventListener('keydown',onKey);
  document.body.appendChild(wrap);
  const on=wrap.querySelector('.sel-opt.on'); if(on) on.scrollIntoView({block:'center'});
}
// ---------- Turn Wizard: "The Reckoning Table" — guided physical-dice resolution for a whole
// planned turn. Walks the current Turn Plan's attack steps in order, asking what the player
// rolled on the d20 (never rolls anything itself — same physical-dice-in, math-out philosophy as
// the rest of the app) and on the damage dice, doubling every die (weapon + active buffs) on a
// crit. Entirely self-contained: reads S.attacks/S.turnPlans but never writes back to them —
// closing the wizard discards its state, so it can never disagree with what the Attacks panel
// already shows. No target-AC field: a player rarely knows a monster's AC, so the wizard only
// ever calls a nat 1 / nat-in-crit-range automatically — anything else is just "here's your
// total," and the DM's own "hit" or "blocked" call is recorded via the skip toggle.
let TURN_WIZ=null;
// "1d8" -> {count:1,size:8}. Notation the app can't parse (custom text) returns null — those
// fall back to a single "type the total" box since there's no way to know how many dice to split.
function parseDice(dieStr){
  const m=/^(\d+)d(\d+)$/i.exec(String(dieStr||'').trim());
  return m?{count:+m[1],size:+m[2]}:null;
}
// Pads/trims a per-die roll array to exactly `count` entries, keeping whatever was already typed.
function ensureDiceArray(res,key,count){
  let arr=res.dmgRolls[key];
  if(!Array.isArray(arr)) arr=[];
  else arr=arr.slice(0,count);
  while(arr.length<count) arr.push('');
  res.dmgRolls[key]=arr;
  return arr;
}
function sumDice(arr){ return Array.isArray(arr)?arr.reduce((n,v)=>n+num(v),0):0; }
function openTurnWizard(){
  const cur=ckPlan();
  const steps=cur.steps.map((p,i)=>({p,i})).filter(({p})=>p.key.startsWith('atk:'))
    .map(({p,i})=>({stepIdx:i,atkIdx:+p.key.split(':')[1],name:p.name}));
  if(!steps.length) return;
  const wrap=document.createElement('div');
  wrap.className='ui-dlg-bg turn-wiz-bg open';
  TURN_WIZ={
    wrap, steps, cur:0,
    results:steps.map(()=>({nat:'',critRange:20,skipped:false,dmgRolls:{},_dmgShown:false,_dmgCrit:false}))
  };
  const onKey=e=>{ if(e.key==='Escape') closeTurnWizard(); };
  TURN_WIZ.onKey=onKey;
  wrap.addEventListener('click',turnWizOnClick);
  wrap.addEventListener('input',turnWizOnInput);
  wrap.addEventListener('change',turnWizOnChange);
  document.addEventListener('keydown',onKey);
  wrap.innerHTML=`<div class="ui-dlg turn-wiz" role="dialog" aria-modal="true">
    <span class="tw-corner tl">◆</span><span class="tw-corner tr">◆</span>
    <span class="tw-corner bl">◆</span><span class="tw-corner br">◆</span>
    <button type="button" class="tw-close" data-twclose title="Close">✕</button>
    <h2 class="tw-title">🕯 Roll This Turn</h2>
    <div class="tw-medallions" id="twMedallions"></div>
    <div class="tw-cardwrap"><div class="tw-card" id="twCard"></div></div>
  </div>`;
  document.body.appendChild(wrap);
  paintTurnWizard(false);
}
function closeTurnWizard(){
  if(!TURN_WIZ) return;
  document.removeEventListener('keydown',TURN_WIZ.onKey);
  TURN_WIZ.wrap.remove();
  TURN_WIZ=null;
}
// Everything the current step needs to know, derived fresh from S.attacks each time — never
// cached across renders, so an edited buff or magic bonus mid-wizard is picked up immediately.
function turnWizResolve(idx){
  const st=TURN_WIZ.steps[idx], res=TURN_WIZ.results[idx];
  const a=S.attacks[st.atkIdx];
  if(!a) return {missing:true};
  const c=atkSummary(a);
  const nat=(res.nat===''||res.nat==null)?null:Number(res.nat);
  const isNum=nat!=null&&!isNaN(nat);
  const critRange=num(res.critRange)||20;
  let hit=null,crit=false,total=null,label='',cls='tw-neutral';
  if(isNum){
    total=nat+c.toHit;
    if(nat<=1){ hit=false; label='Fate turns aside — a critical miss.'; cls='tw-miss'; }
    else if(nat>=critRange){ hit=true; crit=true; label='A masterstroke — critical hit!'; cls='tw-crit'; }
    else{ label=`The die shows ${total}, all told.`; cls='tw-neutral'; }
  }
  return {a,c,nat,isNum,critRange,hit,crit,total,label,cls};
}
function turnWizDamage(idx){
  const r=turnWizResolve(idx); if(r.missing||!r.isNum||r.hit===false) return null;
  const res=TURN_WIZ.results[idx];
  const buffs=(r.a.buffs||[]).filter(b=>b.on&&(b.dice||'').trim());
  let sum=sumDice(res.dmgRolls.base);
  buffs.forEach((b,j)=>{ sum+=sumDice(res.dmgRolls['b'+j]); });
  return sum+r.c.dmgMod;
}
// One dice source (the weapon's own die, or one buff's die) as a row of small per-die boxes —
// "2d8" on a crit means two physical d8s, so it's two boxes to add, not mental math the player
// has to do before typing one number. Notation the app can't parse (free-text custom dice) falls
// back to a single wide "total" box, since there's no die count to split it into.
function diceRowHTML(res,key,label,dieStr,crit){
  const p=parseDice(dieStr);
  if(!p){
    const arr=ensureDiceArray(res,key,1);
    return `<div class="tw-dmg-row">
      <span class="tw-dmg-label">${label}<i>${esc(dieStr)}${crit?' ×2':''}</i></span>
      <div class="tw-dice-inputs"><input type="number" class="tw-die-in tw-die-wide" data-twdmg="${key}.0" value="${esc(arr[0]||'')}" placeholder="total"></div>
    </div>`;
  }
  const count=crit?p.count*2:p.count;
  const arr=ensureDiceArray(res,key,count);
  const inputs=Array.from({length:count},(_,k)=>
    `<input type="number" class="tw-die-in" data-twdmg="${key}.${k}" value="${esc(arr[k]||'')}" placeholder="d${p.size}">`).join('');
  return `<div class="tw-dmg-row">
    <span class="tw-dmg-label">${label}<i>${count}d${p.size}${crit?' crit':''}</i></span>
    <div class="tw-dice-inputs">${inputs}</div>
  </div>`;
}
function twDmgBoxHTML(idx,r){
  const res=TURN_WIZ.results[idx], a=r.a, c=r.c;
  const buffs=(a.buffs||[]).filter(b=>b.on&&(b.dice||'').trim());
  const d=turnWizDamage(idx);
  return `<div class="tw-dmgbox">
    ${diceRowHTML(res,'base',c.dmgType?esc(c.dmgType):'Weapon',c.die,r.crit)}
    ${buffs.map((b,j)=>diceRowHTML(res,'b'+j,`+ ${esc(b.name||'buff')}${b.type?' '+esc(b.type):''}`,b.dice,r.crit)).join('')}
    <div class="tw-dmg-total">Damage: <b id="twDmgTotal">${d!=null?d:'—'}</b></div>
  </div>`;
}
// Every attack's current status, purely derived (never stored) — cheap enough to recompute for
// the whole plan on every keystroke, and what drives both the medallion chain and the closing
// report, so the player never has to wait for the final screen to see where the turn stands.
function turnWizStepStatus(i){
  const res=TURN_WIZ.results[i];
  if(res.skipped) return {icon:'—',cls:'tw-skip',dmg:null};
  const r=turnWizResolve(i);
  if(r.missing||!r.isNum) return {icon:'·',cls:'',dmg:null};
  if(r.hit===false) return {icon:'✕',cls:'tw-miss',dmg:null};
  return {icon:r.crit?'✸':'✓',cls:r.crit?'tw-crit':'tw-hit',dmg:turnWizDamage(i)};
}
function turnWizRunningTotal(){
  return TURN_WIZ.steps.reduce((n,_,i)=>n+(turnWizStepStatus(i).dmg||0),0);
}
// The medallion chain above the card — progress marker and live per-attack summary in one,
// so the player never needs the final report just to see how the turn is going so far.
function twMedallionsHTML(){
  const N=TURN_WIZ.steps.length, bits=[];
  TURN_WIZ.steps.forEach((st,i)=>{
    if(i>0) bits.push('<span class="tw-medal-link"></span>');
    const s=turnWizStepStatus(i), isCur=i===TURN_WIZ.cur&&TURN_WIZ.cur<N;
    bits.push(`<span class="tw-medal ${s.cls} ${isCur?'cur':''}" id="twMedal${i}" title="${esc(st.name)}">${s.dmg!=null?s.dmg:s.icon}</span>`);
  });
  return bits.join('');
}
function twRepaintMedallions(){
  const box=TURN_WIZ.wrap.querySelector('#twMedallions');
  if(box) box.innerHTML=twMedallionsHTML();
}
function twUpdateDmgTotal(idx){
  const el=TURN_WIZ.wrap.querySelector('#twDmgTotal');
  if(el){ const d=turnWizDamage(idx); el.textContent=d!=null?d:'—'; }
  twRepaintMedallions();
}
// Scatters a handful of embers out from a crit's rune stone — plays once, right when a roll
// first turns out to be a crit (not on every repaint, so it doesn't replay while the player
// keeps typing digits or flips back and forth on the crit-range select).
function twEmberBurst(container){
  if(!container) return;
  const wrap=document.createElement('div');
  wrap.className='tw-embers';
  for(let k=0;k<10;k++){
    const b=document.createElement('span');
    b.className='tw-ember-bit';
    const angle=Math.random()*Math.PI*2, dist=36+Math.random()*40;
    b.style.setProperty('--ex',Math.cos(angle)*dist+'px');
    b.style.setProperty('--ey',Math.sin(angle)*dist+'px');
    b.style.animationDelay=(Math.random()*0.12)+'s';
    wrap.appendChild(b);
  }
  container.appendChild(wrap);
  setTimeout(()=>wrap.remove(),1100);
}
// Cheap path for every keystroke in the nat-roll / crit-range fields: repaint only the rune
// glow + verdict text, and only rebuild the damage box (destroying whatever was typed into it)
// when the hit/crit state actually flips — a same-state total change never touches the damage
// inputs, so the player never loses a damage roll they already typed.
function twComputeAndPaint(){
  if(!TURN_WIZ||TURN_WIZ.cur>=TURN_WIZ.steps.length) return;
  const idx=TURN_WIZ.cur, res=TURN_WIZ.results[idx];
  const r=turnWizResolve(idx);
  const runeBox=TURN_WIZ.wrap.querySelector('#twRune');
  if(runeBox) runeBox.className='tw-rune '+(r.isNum?'filled ':'')+(r.crit?'tw-crit ':'')+(r.hit===false?'tw-miss':'');
  const vEl=TURN_WIZ.wrap.querySelector('#twVerdict');
  if(vEl){ vEl.className='tw-verdict '+(r.isNum?'show '+r.cls:''); vEl.textContent=r.isNum?r.label:''; }
  const showDmg=r.isNum&&r.hit!==false;
  if(showDmg!==res._dmgShown||(showDmg&&r.crit!==res._dmgCrit)){
    const slot=TURN_WIZ.wrap.querySelector('#twDmgSlot');
    if(slot) slot.innerHTML=showDmg?twDmgBoxHTML(idx,r):'';
    res._dmgShown=showDmg; res._dmgCrit=r.crit;
  }else if(showDmg){
    twUpdateDmgTotal(idx);
  }
  twRepaintMedallions();
}
function twStepHTML(idx){
  const st=TURN_WIZ.steps[idx], res=TURN_WIZ.results[idx], N=TURN_WIZ.steps.length;
  if(res.skipped){
    return `
      <div class="tw-eyebrow">Attack ${idx+1} of ${N} · opponent blocked</div>
      <h2 class="tw-name" style="opacity:.55">${esc(st.name)}</h2>
      <p class="tw-skip-note">The opponent blocked this attack — no roll needed.</p>
      <button type="button" class="tw-skipbtn" data-twskip>↺ Undo — it wasn't blocked</button>
      <div class="tw-nav">
        <button type="button" class="tw-back" data-twback ${idx===0?'disabled':''}>← Back</button>
        <button type="button" class="tw-next" data-twnext>${idx===N-1?'See the Reckoning →':'Next Strike →'}</button>
      </div>`;
  }
  const r=turnWizResolve(idx);
  if(r.missing){
    return `<p class="prep-note">This attack was removed from your character sheet.</p>
      <button type="button" class="tw-skipbtn" data-twskip>Skip</button>`;
  }
  const {c}=r;
  const showDmg=r.isNum&&r.hit!==false;
  res._dmgShown=showDmg; res._dmgCrit=r.crit;
  return `
    <div class="tw-eyebrow">Attack ${idx+1} of ${N}</div>
    <h2 class="tw-name">${esc(st.name)}</h2>
    <div class="tw-flourish"><span></span></div>
    <p class="tw-ref">Strikes true on <b>${esc(c.bonus)}</b> · deals <b>${esc(c.dmg)}</b></p>
    <div class="tw-critrow"><span>Crits on natural</span>
      <select data-twcrit>
        <option value="20" ${res.critRange==20?'selected':''}>20</option>
        <option value="19" ${res.critRange==19?'selected':''}>19-20</option>
        <option value="18" ${res.critRange==18?'selected':''}>18-20</option>
      </select>
    </div>
    <div class="tw-rune-label">Cast the die, then speak its number</div>
    <div class="tw-rune-stage"><div class="tw-rune ${r.isNum?'filled':''} ${r.crit?'tw-crit':''} ${r.hit===false?'tw-miss':''}" id="twRune">
      <input type="number" min="1" max="20" class="tw-nat-in" data-twnat value="${esc(res.nat)}" placeholder="1–20" autocomplete="off">
    </div></div>
    <div class="tw-verdict-wrap"><div class="tw-verdict ${r.isNum?'show '+r.cls:''}" id="twVerdict">${r.isNum?r.label:''}</div></div>
    <div id="twDmgSlot">${showDmg?twDmgBoxHTML(idx,r):''}</div>
    <button type="button" class="tw-skipbtn" data-twskip>Opponent blocked this attack</button>
    <div class="tw-nav">
      <button type="button" class="tw-back" data-twback ${idx===0?'disabled':''}>← Back</button>
      <button type="button" class="tw-next" data-twnext>${idx===N-1?'See the Reckoning →':'Next Strike →'}</button>
    </div>`;
}
function twReportHTML(){
  const rows=TURN_WIZ.steps.map((st,i)=>{
    const s=turnWizStepStatus(i);
    const label=s.cls==='tw-skip'?'Opponent blocked':s.cls==='tw-crit'?'Critical hit':s.cls==='tw-hit'?'Struck true':s.cls==='tw-miss'?'Missed':'Not cast';
    return `<div class="tw-srow"><span class="tw-sname">${esc(st.name)}</span><span class="tw-sverdict ${s.cls}">${label}</span><span class="tw-sdmg">${s.dmg!=null?s.dmg:'—'}</span></div>`;
  }).join('');
  const hits=TURN_WIZ.steps.filter((_,i)=>['tw-hit','tw-crit'].includes(turnWizStepStatus(i).cls)).length;
  const crits=TURN_WIZ.steps.filter((_,i)=>turnWizStepStatus(i).cls==='tw-crit').length;
  const misses=TURN_WIZ.steps.filter((_,i)=>turnWizStepStatus(i).cls==='tw-miss').length;
  return `
    <div class="tw-eyebrow">The turn is spent</div>
    <h2 class="tw-name">The Reckoning</h2>
    <div class="tw-flourish"><span></span></div>
    <div class="tw-summary">${rows}</div>
    <div class="tw-seal-wrap">
      <div class="tw-seal stamp" id="twSeal"><b id="twSealTotal">0</b><i>Damage</i></div>
      <p class="tw-seal-caption">${hits} strike${hits===1?'':'s'} landed${crits?`, ${crits} of them critical`:''}${misses?`, ${misses} missed`:''}.</p>
    </div>
    <div class="tw-nav">
      <button type="button" class="tw-back" data-twback>← Revisit</button>
      <button type="button" class="tw-next" data-twclose>Close</button>
    </div>`;
}
// Repaints the card (step or closing report) in place; withEnter plays the "dealt in" animation
// — used after navigation, never after a plain keystroke (see twComputeAndPaint for that path).
function paintTurnWizard(withEnter){
  if(!TURN_WIZ) return;
  const N=TURN_WIZ.steps.length, isSummary=TURN_WIZ.cur>=N;
  const cardEl=TURN_WIZ.wrap.querySelector('#twCard');
  cardEl.className='tw-card'+(withEnter?' enter':'');
  cardEl.innerHTML=isSummary?twReportHTML():twStepHTML(TURN_WIZ.cur);
  twRepaintMedallions();
  if(isSummary){
    const total=turnWizRunningTotal();
    requestAnimationFrame(()=>{
      const t=TURN_WIZ.wrap.querySelector('#twSealTotal'); if(!t) return;
      let shown=0; const step=Math.max(1,Math.round(total/16));
      const tick=()=>{ shown=Math.min(total,shown+step); t.textContent=shown; if(shown<total) requestAnimationFrame(tick); };
      setTimeout(()=>requestAnimationFrame(tick),300);
    });
  }else{
    const natEl=TURN_WIZ.wrap.querySelector('[data-twnat]'); if(natEl) natEl.focus();
    const r=turnWizResolve(TURN_WIZ.cur);
    if(r.crit) twEmberBurst(TURN_WIZ.wrap.querySelector('#twRune'));
  }
}
function twGoTo(next){
  const cardEl=TURN_WIZ.wrap.querySelector('#twCard');
  cardEl.classList.add('leave');
  setTimeout(()=>{ TURN_WIZ.cur=next; paintTurnWizard(true); },280);
}
function turnWizOnClick(e){
  if(!TURN_WIZ) return;
  if(e.target===TURN_WIZ.wrap) return closeTurnWizard();
  if(e.target.closest('[data-twclose]')) return closeTurnWizard();
  if(e.target.closest('[data-twback]')){ if(TURN_WIZ.cur>0) twGoTo(TURN_WIZ.cur-1); return; }
  if(e.target.closest('[data-twnext]')){ if(TURN_WIZ.cur<TURN_WIZ.steps.length) twGoTo(TURN_WIZ.cur+1); return; }
  if(e.target.closest('[data-twskip]')){ TURN_WIZ.results[TURN_WIZ.cur].skipped=!TURN_WIZ.results[TURN_WIZ.cur].skipped; paintTurnWizard(false); return; }
}
function turnWizOnInput(e){
  if(!TURN_WIZ) return;
  const t=e.target;
  if(t.dataset.twnat!=null){
    const wasCrit=turnWizResolve(TURN_WIZ.cur).crit;
    TURN_WIZ.results[TURN_WIZ.cur].nat=t.value;
    twComputeAndPaint();
    const r=turnWizResolve(TURN_WIZ.cur);
    if(r.isNum){
      const runeBox=TURN_WIZ.wrap.querySelector('#twRune');
      if(runeBox){
        runeBox.classList.remove('settle'); void runeBox.offsetWidth; runeBox.classList.add('settle');
        if(r.crit&&!wasCrit){
          twEmberBurst(runeBox);
          const cardEl=TURN_WIZ.wrap.querySelector('#twCard');
          cardEl.classList.add('shake'); setTimeout(()=>cardEl.classList.remove('shake'),400);
        }
      }
    }
    return;
  }
  if(t.dataset.twdmg!=null){
    const dot=t.dataset.twdmg.lastIndexOf('.');
    const key=t.dataset.twdmg.slice(0,dot), ix=+t.dataset.twdmg.slice(dot+1);
    const res=TURN_WIZ.results[TURN_WIZ.cur];
    const arr=Array.isArray(res.dmgRolls[key])?res.dmgRolls[key]:(res.dmgRolls[key]=[]);
    arr[ix]=t.value;
    twUpdateDmgTotal(TURN_WIZ.cur);
    return;
  }
}
function turnWizOnChange(e){
  if(!TURN_WIZ) return;
  const t=e.target;
  if(t.dataset.twcrit!=null){ TURN_WIZ.results[TURN_WIZ.cur].critRange=+t.value; twComputeAndPaint(); return; }
}
function wireSelectSheets(){
  // Preventing the compat 'mousedown' is the one reliable way to stop the OS dropdown for both
  // mouse and touch; 'touchend' is also intercepted for browsers that open the picker earlier.
  const handler=e=>{
    const sel=e.target.closest&&e.target.closest('select');
    if(!sel||sel.disabled) return;
    e.preventDefault();
    if(!SEL_OPEN) openSelectSheet(sel);
  };
  document.addEventListener('mousedown',handler);
  document.addEventListener('touchend',handler,{passive:false});
}
// ---------- Themed suggestion dropdowns (subclass & feats) ----------
// The last two native pickers: Subclass and the ASI feat inputs used <datalist>, the browser's
// own unthemed autocomplete popup. Replaced with the same .lib-results dropdown every other
// search in the app already uses — but rendered as a single popover appended to <body> with
// position:fixed, computed from the input's own screen position, rather than the normal
// "absolute sibling" pattern the other search boxes use. Reason: the Subclass field lives
// inside .build-panel, which has overflow:hidden for its class-color glow effect — an absolute
// dropdown anchored inside that panel gets clipped against its edge, which is what looked like
// the dropdown "overlapping" the field. Escaping to <body> sidesteps any clipped ancestor,
// current or future, instead of special-casing this one panel.
// Feat suggestions merge FEATURE_LIB's detailed "Feats" group (name + mechanical blurb, so you
// can tell Alert from Mobile without alt-tabbing to look it up) with the fuller plain-name feat
// list, so every official feat is offered even though only some have a description pre-attached.
const FEAT_SUGGESTIONS=(()=>{
  const detailed=FEATURE_LIB.filter(e=>e.g==='Feats').map(e=>({n:e.n,d:e.d||''}));
  const known=new Set(detailed.map(e=>e.n.toLowerCase()));
  const extra=FEATS.filter(n=>!known.has(n.toLowerCase())).map(n=>({n,d:''}));
  return [...detailed,...extra].sort((a,b)=>a.n.localeCompare(b.n));
})();
// Both Subclass fields — the Build tab's and the Overview header's — go through the same picker.
// They used to behave differently (Build opened this modal, Overview was a bare text box), which
// meant the same field offered its own class's subclasses in one place and nothing in the other.
const isSubclassInput=el=>!!el&&(el.id==='subclassIn'||el.id==='subclassOv');
function suggestSourceFor(el){
  if(!el||el.tagName!=='INPUT') return null;
  if(isSubclassInput(el)) return subclassNamesForClass(S.classId);
  if(el.dataset&&el.dataset.asifeat!=null) return FEAT_SUGGESTIONS;
  return null;
}
// A themed, always-centered modal — the same .sel-sheet shell the "— choose —" selects above
// use, plus its own live search box since these two fields (Subclass, Feat name) take free text
// too, not just a pick from the list. Replaces an earlier version that anchored a small popover
// right below the field: fine when the field is near the top of the screen, but the ASI/Feat
// table sits well down a tall page, so that popover routinely had nowhere to open into and ran
// off the bottom of the screen — a modal is centered and fully visible no matter where the field
// that opened it happens to be scrolled to.
let SUG_MODAL=null;
function closeSuggest(){
  if(!SUG_MODAL) return;
  SUG_MODAL.remove(); SUG_MODAL=null;
  document.removeEventListener('keydown',suggestKeydown);
}
function suggestKeydown(e){ if(e.key==='Escape') closeSuggest(); }
function openSuggestModal(inp){
  const src=suggestSourceFor(inp); if(!src) return;
  const all=src.map(x=>typeof x==='string'?{n:x,d:''}:x);
  const label=isSubclassInput(inp)?'Choose a Subclass':'Choose a Feat';
  const wrap=document.createElement('div');
  wrap.className='ui-dlg-bg sel-sheet-bg open';
  wrap.innerHTML=`<div class="sel-sheet sug-sheet" role="dialog" aria-label="${esc(label)}">
    <h3>${esc(label)}</h3>
    <input type="text" class="sug-sheet-search" placeholder="Search — or type your own" autocomplete="off">
    <div class="sel-opts sug-sheet-opts"></div>
  </div>`;
  document.body.appendChild(wrap);
  SUG_MODAL=wrap;
  const search=wrap.querySelector('.sug-sheet-search'), list=wrap.querySelector('.sug-sheet-opts');
  search.value=inp.value;
  const paint=()=>{
    const q=search.value.trim(), ql=q.toLowerCase();
    const items=all.filter(x=>!ql||x.n.toLowerCase().includes(ql));
    const exact=all.some(x=>x.n.toLowerCase()===ql);
    const customRow=q&&!exact
      ?`<button type="button" class="sel-opt sel-opt-custom" data-sugpick="${esc(q)}"><span>Use "${esc(q)}"</span><small>Not in the list — free text works too</small></button>`:'';
    // Clearing the field was previously only reachable by pressing Enter on an empty search box —
    // undiscoverable, and the field is readonly so there was no other way out of a wrong pick.
    const clearRow=inp.value.trim()
      ?`<button type="button" class="sel-opt sel-opt-clear" data-sugclear="1"><span>None</span><small>Clear this field${isSubclassInput(inp)?' — its granted features go with it':''}</small></button>`:'';
    list.innerHTML=clearRow+customRow+(items.length
      ?items.slice(0,80).map(x=>`<button type="button" class="sel-opt" data-sugpick="${esc(x.n)}"><span>${esc(x.n)}</span>${x.d?`<small>${esc(x.d)}</small>`:''}</button>`).join('')
      :(q?'':'<div class="empty">Start typing to search…</div>'));
  };
  const commit=val=>{
    inp.value=val;
    // Both events, bubbling — data-bind fields listen to 'input', the ASI feat field's own sync
    // listens to 'change' (see renderAsi) to link/create the Features entry right away.
    inp.dispatchEvent(new Event('input',{bubbles:true}));
    inp.dispatchEvent(new Event('change',{bubbles:true}));
    closeSuggest();
  };
  search.addEventListener('input',paint);
  search.addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); commit(search.value); } });
  wrap.addEventListener('click',e=>{
    if(e.target===wrap) return closeSuggest(); // backdrop tap cancels, leaves the field as it was
    if(e.target.closest('[data-sugclear]')) return commit('');
    const b=e.target.closest('[data-sugpick]');
    if(b) commit(b.dataset.sugpick);
  });
  document.addEventListener('keydown',suggestKeydown);
  paint();
  search.focus();
}
function wireSuggest(){
  // Same interception pattern as wireSelectSheets: stop the field from taking focus/typing
  // directly (which would just be typing into thin air on mobile — no popover chasing the
  // caret) and open the modal instead. Both fields are marked readonly in the HTML so a
  // keyboard Tab still lands on them without letting a stray keystroke type straight into a
  // field that isn't showing any suggestions — Enter/Space below opens the modal instead.
  const handler=e=>{
    const inp=e.target.closest&&e.target.closest('input');
    if(!inp||!suggestSourceFor(inp)) return;
    e.preventDefault();
    if(!SUG_MODAL) openSuggestModal(inp);
  };
  document.addEventListener('mousedown',handler);
  document.addEventListener('touchend',handler,{passive:false});
  document.addEventListener('keydown',e=>{
    if(SUG_MODAL) return; // the open modal's own keydown handler owns Enter/Escape while it's up
    const inp=e.target;
    if((e.key==='Enter'||e.key===' ')&&inp&&inp.tagName==='INPUT'&&suggestSourceFor(inp)){
      e.preventDefault(); openSuggestModal(inp);
    }
  });
}

// ---------- Character select screen ----------
// A full-screen "party roster" rather than a dropdown: each character is a class-flavored card
// (same elemental icon + color language as the Build panel), tap to play. Duplicate / export /
// delete live on each card; New and Import are cards of the same size so the empty roster
// still looks like a roster, not a form. Shown at boot only when there's actually a choice to
// make (2+ characters) — a single-character player goes straight to their sheet.
function charSummary(id){
  try{
    const d=JSON.parse(localStorage.getItem(charKey(id))||'{}');
    const cls=CLASSES[d.classId];
    return {
      name:(d.name||'').trim()||'Unnamed hero',
      cls:cls?cls.name:(d.classLevel||'').trim(),
      lvl:cls?num(d.level)||1:'',
      race:(d.race||'').trim(),
      hp:num(d.hpCurrent), hpMax:num(d.hpMax),
      icon:CLASS_ICON[d.classId]||'⚔',
      color:CLASS_COLOR[d.classId]||'#c9a227',
    };
  }catch(e){ return {name:'Corrupted save',cls:'',lvl:'',race:'',hp:0,hpMax:0,icon:'⚠',color:'#c05046'}; }
}
function renderCharSelect(){
  const grid=$('#csGrid'); if(!grid) return;
  // Active character first, then most recently played — the card you want is always near the top.
  const t=id=>(ROSTER.meta[id]||{}).t||0;
  const ids=[...ROSTER.list].sort((a,b)=>((b===ROSTER.active)-(a===ROSTER.active))||(t(b)-t(a)));
  grid.innerHTML=ids.map(id=>{
    const c=charSummary(id), active=id===ROSTER.active;
    const hpPct=c.hpMax>0?Math.max(0,Math.min(100,Math.round(c.hp/c.hpMax*100))):0;
    const line=[c.cls?(c.lvl?`Level ${c.lvl} ${c.cls}`:c.cls):'',c.race].filter(Boolean).join(' · ');
    return `<div class="cs-card ${active?'active':''}" data-csplay="${id}" style="--cs-accent:${c.color}">
      ${active?'<span class="cs-badge">now playing</span>':''}
      <div class="cs-icon">${c.icon}</div>
      <div class="cs-name">${esc(c.name)}</div>
      <div class="cs-line">${esc(line)||'A blank sheet'}</div>
      ${c.hpMax>0?`<div class="cs-hp ${hpPct<=25?'low':''}"><div style="width:${hpPct}%"></div></div><div class="cs-hpnum">${c.hp} / ${c.hpMax} HP</div>`:''}
      <div class="cs-actions">
        <button data-csdup="${id}" title="Duplicate this character">⧉ Copy</button>
        <button data-csexp="${id}" title="Download as JSON backup">⬇ Export</button>
        <button class="cs-del" data-csdel="${id}" title="Delete this character">✕</button>
      </div>
    </div>`;
  }).join('')
  +`<button class="cs-card cs-new" data-csnew>
      <span class="cs-icon">+</span><span class="cs-name">New Character</span><span class="cs-line">Start a blank sheet</span>
    </button>
    <button class="cs-card cs-new wiz-entry" data-cswizard>
      <span class="cs-icon">🧙</span><span class="cs-name">Smart Wizard</span><span class="cs-line">Guided creation, step by step</span>
    </button>
    <button class="cs-card cs-new" data-csimportbtn>
      <span class="cs-icon">⬆</span><span class="cs-name">Import</span><span class="cs-line">From a JSON export</span>
    </button>`;
}
function openCharSelect(){ renderCharSelect(); $('#charSelect').classList.add('open'); }
function closeCharSelect(){ $('#charSelect').classList.remove('open'); }
function switchChar(id){
  if(id===ROSTER.active){ closeCharSelect(); return; }
  flushSave();                    // pending edits land in the OLD slot first
  ROSTER.active=id; ROSTER.meta[id]={t:Date.now()}; saveRoster();
  load(); renderAll(); showTab('overview');
  closeCharSelect();
}
function createChar(data){
  flushSave();                    // pending edits land in the OLD slot first
  const id=newCharId();
  try{ localStorage.setItem(charKey(id),JSON.stringify(data||defaultState())); }
  catch(e){ uiAlert('Could not save a new character — browser storage may be full.','Storage problem'); return; }
  ROSTER.list.push(id);
  ROSTER.active=id; ROSTER.meta[id]={t:Date.now()}; saveRoster();
  load(); renderAll();
  showTab(data?'overview':'build'); // fresh hero → Build tab; imported hero is complete → Overview
  closeCharSelect();
}
function exportChar(id){
  const raw=localStorage.getItem(charKey(id)); if(!raw) return;
  let name='character';
  try{ name=(JSON.parse(raw).name||'character').replace(/[^\w\- ]/g,'').trim()||'character'; }catch(e){}
  const blob=new Blob([raw],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob); a.download=name+'.json';
  a.click(); URL.revokeObjectURL(a.href);
}
function wireCharSelect(){
  $('#charsBtn').addEventListener('click',openCharSelect);
  $('#csBack').addEventListener('click',closeCharSelect);
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&$('#charSelect').classList.contains('open')) closeCharSelect();
  });
  $('#charSelect').addEventListener('click',e=>{
    const t=e.target;
    const dup=t.closest('[data-csdup]');
    if(dup){ e.stopPropagation();
      const raw=localStorage.getItem(charKey(dup.dataset.csdup)); if(!raw) return;
      try{
        const d=JSON.parse(raw); d.name=(d.name||'Unnamed hero')+' (copy)';
        const id=newCharId();
        localStorage.setItem(charKey(id),JSON.stringify(d));
        ROSTER.list.push(id); saveRoster(); renderCharSelect();
      }catch(err){ uiAlert('This save appears corrupted — could not duplicate it.','Duplicate failed'); }
      return; }
    const exp=t.closest('[data-csexp]');
    if(exp){ e.stopPropagation(); exportChar(exp.dataset.csexp); return; }
    const del=t.closest('[data-csdel]');
    if(del){ e.stopPropagation();
      const id=del.dataset.csdel, c=charSummary(id);
      uiConfirm(`Delete ${c.name}? This cannot be undone — export a backup first if unsure.`,
        {title:'Delete character',ok:'Delete forever',danger:true}).then(ok=>{
        if(!ok) return;
        localStorage.removeItem(charKey(id));
        ROSTER.list=ROSTER.list.filter(x=>x!==id);
        delete ROSTER.meta[id];
        if(ROSTER.active===id){
          // The character being played was deleted: fall back to another, or a fresh blank one.
          if(!ROSTER.list.length){
            const nid=newCharId();
            try{ localStorage.setItem(charKey(nid),JSON.stringify(defaultState())); }catch(err){}
            ROSTER.list=[nid];
          }
          ROSTER.active=ROSTER.list[0]; saveRoster();
          load(); renderAll(); showTab('overview');
        }else saveRoster();
        renderCharSelect();
      }); return; }
    if(t.closest('[data-csnew]')){ createChar(); return; }
    if(t.closest('[data-cswizard]')){ closeCharSelect(); openWizard(); return; }
    if(t.closest('[data-csimportbtn]')){ $('#csImportFile').click(); return; }
    const play=t.closest('[data-csplay]');
    if(play){ switchChar(play.dataset.csplay); return; }
  });
  $('#csImportFile').addEventListener('change',e=>{
    const file=e.target.files[0]; if(!file) return;
    const r=new FileReader();
    r.onload=()=>{
      try{
        const d=Object.assign(defaultState(),JSON.parse(r.result));
        createChar(d);
      }catch(err){ uiAlert('That file is not a valid character JSON.','Import failed'); }
      e.target.value='';
    };
    r.readAsText(file);
  });
}

function wireSettings(){
  $('#settingsBtn').addEventListener('click',()=>$('#settingsModal').classList.add('open'));
  $('#settingsClose').addEventListener('click',()=>$('#settingsModal').classList.remove('open'));
  $('#settingsModal').addEventListener('click',e=>{
    if(e.target.id==='settingsModal') $('#settingsModal').classList.remove('open');
  });
  $('#exportBtn').addEventListener('click',()=>{
    const blob=new Blob([JSON.stringify(S,null,2)],{type:'application/json'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download=(S.name||'character').replace(/[^\w\- ]/g,'').trim()||'character';
    a.download+='.json';
    a.click(); URL.revokeObjectURL(a.href);
  });
  $('#importBtn').addEventListener('click',()=>$('#importFile').click());
  // Import never overwrites the sheet you're on anymore — it lands as a NEW character on the
  // roster and switches to it, so a mis-click can't wipe hours of play.
  $('#importFile').addEventListener('change',e=>{
    const file=e.target.files[0]; if(!file) return;
    const r=new FileReader();
    r.onload=()=>{
      try{
        const d=Object.assign(defaultState(),JSON.parse(r.result));
        createChar(d);
        $('#settingsModal').classList.remove('open');
      }catch(err){ uiAlert('That file is not a valid character JSON.','Import failed'); }
      e.target.value='';
    };
    r.readAsText(file);
  });
  $('#resetBtn').addEventListener('click',()=>{
    const who=(S.name||'').trim()||'this character';
    uiConfirm(`Erase ${who}'s sheet and start it blank? Other characters are untouched. Export a backup first if unsure.`,
      {title:'Reset character',ok:'Erase sheet',danger:true}).then(ok=>{
      if(!ok) return;
      S=defaultState();
      renderAll(); saveNow();
      $('#settingsModal').classList.remove('open');
    });
  });
  $('#inspBtn').addEventListener('click',()=>{
    S.inspiration=!S.inspiration; recalc(); save();
  });
}

// ---------- Boot ----------
function renderAll(){
  renderAbilityCards(); renderSaves(); renderSkills(); renderDeathSaves();
  renderAttacks(); renderEquipment(); renderFeatures(); renderNotes();
  renderSpellLevels(); renderOverview(); renderCombatFeatures(); renderLanguages(); renderProficiencies();
  renderBuildSelectors(); renderAsi(); renderHudControls(); renderCharacterPortrait(); renderBackstoryEditor();
  renderBackgroundInfo();
  bindAll(); syncBound(); recalc();
}
// Tablet-first: skill-badge "when" tooltips open on TAP, not hover. One delegated listener on
// the document handles every badge (present and future re-renders) plus tap-away-to-close.
function wireSkillFx(){
  document.addEventListener('click',e=>{
    const chip=e.target.closest('.sk-fx');
    $$('.sk-fx.open').forEach(o=>{ if(o!==chip) o.classList.remove('open'); });
    if(chip) chip.classList.toggle('open');
  });
}
// ---------- Wide-mode toggle ----------
// A UI-only preference, not part of the character sheet — the 1180px column is comfortable for
// most panels but cramped for the Combat tab's card grid and turn plan on a big screen, so a
// single button in the header (present on every tab, not just Combat/Overview) widens the whole
// layout. Kept in its own localStorage key, independent of which character/roster slot is active.
const WIDE_KEY='dnd5e-binder-wide-v1';
function applyWideMode(on){
  document.body.classList.toggle('wide-mode',on);
  $$('[data-widetoggle]').forEach(b=>{
    b.classList.toggle('on',on);
    b.setAttribute('aria-pressed',on?'true':'false');
    b.title=on?'Back to normal width':'Widen the layout for more room';
  });
}
function wireWideMode(){
  let on=false;
  try{ on=localStorage.getItem(WIDE_KEY)==='1'; }catch(e){}
  applyWideMode(on);
  $$('[data-widetoggle]').forEach(b=>b.addEventListener('click',()=>{
    on=!document.body.classList.contains('wide-mode');
    applyWideMode(on);
    try{ localStorage.setItem(WIDE_KEY,on?'1':'0'); }catch(e){}
  }));
}
initRoster();
load();
buildShell();
renderAll();
wireAddButtons(); wireHpButtons(); wireStress(); wireSettings(); wireCharSelect(); wireSelectSheets(); wireSuggest(); wireBuild(); wireBuildCustom(); wireLibrary(); wireLibScope(); wireRaceLibrary(); wireBackgroundLibrary(); wireBackgroundSelect(); wireBackgroundGrantBtn(); wireLanguages(); wireProficiencies(); wireFeaturesLock(); wireHud(); wireRest(); wireSkillFx(); wireCombatFeatures(); wireCombatSlots(); wireSpellDetails(); wireSpellModal(); wireSpellLibrary(); wireSpellsLock(); wireSpellJump(); wireWeaponSearch(); wireItemIndexModal(); wirePackSearch(); wirePackModal(); wireEquipmentDrawer(); wireEqSelect(); wireCharacterPortrait(); wireBackstoryEditor(); wireBackstoryExpand(); wireNotes(); wireWideMode();
showTab('overview');
// With a real choice to make (2+ heroes), boot lands on the roster; with one, straight to play.
if(ROSTER.list.length>1) openCharSelect();

