// ---------- Default state (mirrors the PDF fields) ----------
function defaultState(){
  return {
    // Page 1 header
    name:'', classLevel:'', background:'', playerName:'', race:'', alignment:'', xp:'',
    inspiration:false, profBonus:2,
    // Smart build (class/race presets)
    classId:'', level:1, subclass:'', raceId:'', subraceId:'', flexBonus:['',''], asi:{},
    abilities:{str:10,dex:10,con:10,int:10,wis:10,cha:10},
    saveProf:{str:false,dex:false,con:false,int:false,wis:false,cha:false},
    skills:Object.fromEntries(SKILLS.map(s=>[s[0],0])), // 0 none, 1 proficient, 2 expertise
    // Combat
    ac:10, initiativeMisc:0, speed:'30 ft.', vision:'None',
    hpMax:10, hpCurrent:10, hpTemp:0, hdTotal:'', hd:'', hdUsed:0,
    deathS:[false,false,false], deathF:[false,false,false],
    attacks:[{name:'Longsword',weapon:'longsword',die:'1d8',dmgStat:'auto',magic:0,miscAtk:0,miscDmg:0,rolled:'',buffs:[]}], atkNotes:'',
    // Inventory
    equip:{armor:'none',armorMagic:0,shield:false,shieldMagic:0,acAuto:false,
           head:'',neck:'',cloak:'',hands:'',ring1:'',ring2:'',boots:'',mainhand:'',offhand:''},
    money:{cp:0,sp:0,ep:0,gp:0,pp:0},
    equipment:[{qty:'',name:''}], treasure:'',
    // Features
    features:[{title:'',desc:'',fx:[]}], profLang:'', languages:[], featuresLocked:false,
    // Spells (page 3): level 0 = cantrips
    spellClass:'', spellAbility:'',
    spellLevels:Array.from({length:10},()=>({total:0,used:0,spells:[]})),
    // Inventory UI: active pack tab, folded categories (All view), folded Equipped panel
    eqTab:'ALL', eqCollapse:{}, invEqOpen:true,
    // Combat cockpit
    customCards:[], states:[], concentration:null,
    turnPlans:[{name:'Default',steps:[]}], turnPlanIdx:0,
    cockpit:{hidden:[],pins:[],showAllSpells:false,showDeath:false,atkOpen:false},
    // Page 2
    age:'',height:'',weight:'',eyes:'',skin:'',hair:'',
    personality:'', ideals:'', bonds:'', flaws:'',
    allies:'', factionName:'', backstory:'',
    notes:[{title:'Session notes',body:''}]
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
function racialBonus(k){
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
// Bonuses from Ability Score Improvements chosen at ASI levels
function asiBonus(k){
  let b=0;
  const lvls=asiLevels(S.classId);
  for(const L of lvls){
    if(L>num(S.level)) continue;
    const e=S.asi[L];
    if(e&&e.choice==='asi'){ if(e.a===k)b+=1; if(e.b===k)b+=1; }
  }
  return b;
}
function score(k){ return (Number(S.abilities[k])||0)+racialBonus(k)+asiBonus(k); }
function amod(k){ return mod(score(k)); }

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
function hpPanelHTML(){
  return `
  <div class="hp-panel">
    <div class="hp-main">
      <div class="hp-numbers">
        <input type="number" class="hp-cur" data-bind="hpCurrent">
        <span class="hp-slash">/</span>
        <input type="number" class="hp-max-in" data-bind="hpMax" title="Hit point maximum">
      </div>
      <div class="hp-bar"><div class="hp-fill"></div><span class="hp-temp-fill"></span></div>
      <span class="fx-note" data-fxnote="hpmax" style="text-align:center"></span>
      <span class="fx-rems" data-fxrem="hpmax" style="justify-content:center"></span>
      <div class="hp-btns">
        <button class="hp-btn dmg" data-hp="-10">−10</button>
        <button class="hp-btn dmg" data-hp="-5">−5</button>
        <button class="hp-btn dmg" data-hp="-1">−1</button>
        <button class="hp-btn heal" data-hp="1">+1</button>
        <button class="hp-btn heal" data-hp="5">+5</button>
        <button class="hp-btn heal" data-hp="10">+10</button>
      </div>
    </div>
    <div class="temp-box">
      <label class="fld"><span>Temp HP</span>
        <input type="number" data-bind="hpTemp">
      </label>
    </div>
  </div>`;
}
// Vitals stat tiles carry the same elemental accent colors as the ability cards (AC=steel,
// Initiative=amber, Speed=verdant, Perception=violet) — no separate summary card duplicating
// these numbers, just the real editable tiles dressed up in place. AC and Initiative are the two
// numbers a player needs instantly in a fight, so they get their own larger "primary" row;
// Speed/Proficiency/Passive Perception/Darkvision are checked far less often mid-combat and sit
// smaller underneath instead of competing for the same visual weight.
function vitalsHTML(){
  return `
  <div class="vitals-primary">
    <div class="stat stat-ac"><span class="stat-label">🛡 Armor Class</span><input type="number" data-bind="ac"><span class="fx-note" data-fxnote="ac"></span><span class="fx-rems" data-fxrem="ac"></span></div>
    <div class="stat computed stat-init"><span class="stat-label">⚡ Initiative</span><span class="big" data-calc="initiative">+0</span><span class="fx-rems" data-fxrem="init"></span></div>
  </div>
  <div class="stats-row vitals-secondary">
    <div class="stat stat-speed"><span class="stat-label">💨 Speed</span><input type="text" data-bind="speed"><span class="fx-note" data-fxnote="speed"></span><span class="fx-rems" data-fxrem="speed"></span></div>
    <div class="stat"><span class="stat-label">Proficiency</span><input type="number" data-bind="profBonus"></div>
    <div class="stat computed stat-perc"><span class="stat-label">👁 Passive Perception</span><span class="big" data-calc="passive">10</span><span class="fx-rems" data-fxrem="passive"></span></div>
    <div class="stat stat-vision"><span class="stat-label">🌙 Darkvision</span><input type="text" data-bind="vision"><span class="fx-note" data-fxnote="vision"></span><span class="fx-rems" data-fxrem="vision"></span></div>
  </div>`;
}

const PAGES = {
overview:`
  <div class="panel"><h2>Ability Scores</h2><div class="abilities" id="abilityCards"></div></div>
  <div class="panel"><h2>Vitals</h2>${vitalsHTML()}</div>
  <div class="grid g2">
    <div class="panel"><h2>Hit Points</h2>${hpPanelHTML()}</div>
    <div class="panel"><h2>Inspiration &amp; Experience</h2>
      <button class="insp-btn" id="inspBtn">Inspiration</button>
      <div style="margin-top:12px" class="grid g3">
        <label class="fld"><span>Experience Points</span><input type="text" data-bind="xp"></label>
        <label class="fld"><span>Alignment</span><input type="text" data-bind="alignment"></label>
      </div>
    </div>
  </div>
  <div class="panel"><h2>At a Glance</h2><div class="ov-quick" id="ovQuick"></div></div>`,

build:`
  <div class="panel build-panel" id="buildPanel">
    <div class="build-icon" id="buildIcon">⚔</div>
    <h2>Build — Class &amp; Race</h2>
    <div class="build-title" id="buildTitle"></div>
    <div class="grid g3">
      <label class="fld"><span>Class</span><select id="classSel"><option value="">— choose —</option></select></label>
      <label class="fld"><span>Level</span><input type="number" id="levelIn" min="1" max="20" value="1"></label>
      <label class="fld sug-wrap"><span>Subclass</span><input type="text" id="subclassIn" data-bind="subclass" autocomplete="off" placeholder="e.g. Gloom Stalker"></label>
      <label class="fld"><span>Race</span><select id="raceSel"><option value="">— choose —</option></select></label>
      <label class="fld" id="subraceFld" style="display:none"><span>Subrace</span><select id="subraceSel"></select></label>
      <label class="fld flex-fld" id="flex0Fld" style="display:none"><span id="flex0Lbl">Bonus +1 (choice 1)</span><select id="flex0"></select></label>
      <label class="fld flex-fld" id="flex1Fld" style="display:none"><span id="flex1Lbl">Bonus +1 (choice 2)</span><select id="flex1"></select></label>
    </div>
    <p class="prep-note" id="buildNote">Choose a class and level to auto-set proficiency, hit dice, saving throws and spell slots. Choose a race for speed and ability bonuses. Subclass features are searchable in the Features tab once picked here.</p>
  </div>
  <div class="panel" id="asiPanel" style="display:none"><h2>Level-Up Choices — ASI &amp; Feats</h2>
    <p class="prep-note" style="margin:0 0 10px">At each of these levels you chose either an Ability Score Improvement (two +1s — pick the same ability twice for +2) or a feat. Ability picks are added to your scores automatically.</p>
    <div id="asiList"></div>
  </div>`,

combat:`
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
      </div>
      <div class="hp-bar chud-bar"><div class="hp-fill"></div><span class="hp-temp-fill"></span></div>
    </div>
    <span class="chud-sep"></span>
    <div class="ckv ckv-primary"><span class="ckv-l">🛡 AC</span><input type="number" data-bind="ac"></div>
    <div class="ckv ckv-primary computed"><span class="ckv-l">⚡ Init</span><span class="ckv-big" data-calc="initiative">+0</span></div>
    <span class="chud-sep chud-sep-conc"></span>
    <span class="ck-conc" id="ckConc"></span>
    <span class="ck-topstates" id="ckTopStates"></span>
    </div>
    <div class="chud-senses">
      <span class="chud-senses-lbl">Senses &amp; Movement</span>
      <div class="ckv ckv-sec"><span class="ckv-l">💨 Speed</span><input type="text" class="ckv-wide" data-bind="speed"></div>
      <div class="ckv ckv-sec"><span class="ckv-l">📖 Prof</span><input type="number" data-bind="profBonus"></div>
      <div class="ckv ckv-sec computed"><span class="ckv-l">👁 Passive</span><span class="ckv-big" data-calc="passive">10</span></div>
      <div class="ckv ckv-sec"><span class="ckv-l">🌙 Vision</span><input type="text" class="ckv-wide" data-bind="vision"></div>
    </div>
    <div class="chud-extra">
      <span class="chud-x"><i>AC</i><span class="fx-note" data-fxnote="ac"></span><span class="fx-rems" data-fxrem="ac"></span></span>
      <span class="chud-x"><i>Init</i><span class="fx-rems" data-fxrem="init"></span></span>
      <span class="chud-x"><i>Speed</i><span class="fx-note" data-fxnote="speed"></span><span class="fx-rems" data-fxrem="speed"></span></span>
      <span class="chud-x"><i>Passive</i><span class="fx-rems" data-fxrem="passive"></span></span>
      <span class="chud-x"><i>Vision</i><span class="fx-note" data-fxnote="vision"></span><span class="fx-rems" data-fxrem="vision"></span></span>
      <span class="chud-x"><i>Max HP</i><span class="fx-note" data-fxnote="hpmax"></span><span class="fx-rems" data-fxrem="hpmax"></span></span>
    </div>
  </div>
  <div class="ck-duo">
    <div class="panel ck-actions-panel"><h2>⚡ Do Something</h2>
      <div id="ckUndo"></div>
      <div class="ck-filters" id="ckFilters"></div>
      <div class="ck-cards" id="ckCards"></div>
      <div class="fx-addrow" style="margin-top:8px">
        <button class="add-btn" id="ckAddCustom">+ Custom card</button>
        <button class="add-btn" id="ckSpellsToggle"></button>
      </div>
    </div>
    <div class="panel ck-plan-panel"><h2>🗺 Turn Plan</h2>
      <div class="ck-plan-head"><div class="ck-plan-tabs" id="ckPlanTabs"></div><button id="ckPlanClear" style="display:none">Clear</button></div>
      <div class="ck-plan" id="ckPlan"></div>
    </div>
  </div>
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
      <div class="panel" id="combatSlotsPanel"><h2>🔮 Spell Slots</h2>
        <div id="combatSlots"></div>
      </div>
      <div class="panel"><h2>🏷 States</h2>
        <div id="ckStates"></div>
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
  <div class="panel"><h2>Spellcasting</h2>
    <div class="grid g3">
      <label class="fld"><span>Spellcasting Class</span><input type="text" data-bind="spellClass"></label>
      <label class="fld"><span>Spellcasting Ability</span>
        <select data-bind="spellAbility">
          <option value="">— none —</option>
          <option value="int">Intelligence</option>
          <option value="wis">Wisdom</option>
          <option value="cha">Charisma</option>
        </select>
      </label>
      <div class="stats-row" style="grid-template-columns:1fr 1fr">
        <div class="stat computed stat-dc"><span class="stat-label">🔮 Spell Save DC</span><span class="big" data-calc="spellDC">—</span></div>
        <div class="stat computed stat-dc"><span class="stat-label">✨ Spell Attack</span><span class="big" data-calc="spellAtk">—</span></div>
      </div>
    </div>
  </div>
  <div class="fx-addrow" id="spellSearchBar" style="margin:0 0 12px;position:relative">
    <div style="position:relative;flex:1 1 300px;max-width:420px">
      <input type="text" id="spellSearch" style="width:100%" placeholder="+ Search your spellbook…" autocomplete="off">
      <div id="spellResults" class="lib-results"></div>
    </div>
    <span class="prep-note" style="margin:0">Tap a result to add it at the right level · ● = prepared · ◆ = slots remaining</span>
  </div>
  <div id="spellLevels"></div>`,

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
    <div class="fx-addrow" style="margin:0 0 8px;position:relative">
      <div style="position:relative;flex:1 1 300px;max-width:420px">
        <input type="text" id="itemSearch" style="width:100%" placeholder="+ Search adventuring gear…" autocomplete="off">
        <div id="itemResults" class="lib-results"></div>
      </div>
      <span class="prep-note" style="margin:0">tap a result to add it · ⚔ on a row = usable card on the Combat tab</span>
    </div>
    <div class="eq-tabs" id="eqTabs"></div>
    <div id="equipList"></div>
    <button class="add-btn" data-add="equipment" id="eqAddBtn">+ Add item</button>
    <div id="eqTreasure" style="display:none">
      <textarea data-bind="treasure" placeholder="Gems, art objects, deeds, favors owed, that suspicious idol..."></textarea>
    </div>
  </div>`,

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
      <span class="prep-note" style="margin:0">effects come pre-attached</span>
    </div>
    <div id="featureList"></div>
    <button class="add-btn" data-add="features" id="addFeatureBtn">+ Add feature</button>
  </div>
  <div class="grid g2">
    <div class="panel"><h2>Other Proficiencies</h2>
      <textarea data-bind="profLang" placeholder="Armor, weapons, tools..."></textarea>
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
  <div class="panel"><h2>Identity</h2>
    <div class="grid g3">
      <label class="fld"><span>Player Name</span><input type="text" data-bind="playerName"></label>
      <label class="fld"><span>Faction / Organization</span><input type="text" data-bind="factionName"></label>
      <label class="fld"><span>Age</span><input type="text" data-bind="age"></label>
      <label class="fld"><span>Height</span><input type="text" data-bind="height"></label>
      <label class="fld"><span>Weight</span><input type="text" data-bind="weight"></label>
      <label class="fld"><span>Eyes</span><input type="text" data-bind="eyes"></label>
      <label class="fld"><span>Skin</span><input type="text" data-bind="skin"></label>
      <label class="fld"><span>Hair</span><input type="text" data-bind="hair"></label>
    </div>
  </div>
  <div class="grid g2">
    <div class="panel"><h2>Personality Traits</h2><textarea data-bind="personality"></textarea></div>
    <div class="panel"><h2>Ideals</h2><textarea data-bind="ideals"></textarea></div>
    <div class="panel"><h2>Bonds</h2><textarea data-bind="bonds"></textarea></div>
    <div class="panel"><h2>Flaws</h2><textarea data-bind="flaws"></textarea></div>
  </div>
  <div class="panel"><h2>Allies &amp; Organizations</h2><textarea data-bind="allies"></textarea></div>
  <div class="panel"><h2>Backstory</h2><textarea data-bind="backstory" style="min-height:160px"></textarea></div>`,

notes:`
  <div id="noteList"></div>
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
  if(id==='overview') renderOverviewQuick();
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
function renderSaves(){
  $('#saveList').innerHTML = ABILITIES.map(([k,label])=>{
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
  $$('[data-save]').forEach(b=>b.addEventListener('click',()=>{
    S.saveProf[b.dataset.save]=!S.saveProf[b.dataset.save];
    renderSaves(); recalc(); save();
  }));
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
      const badges=[];
      if(g>man){
        const srcs=allFx().filter(x=>x.t==='skill'&&xSkills(x).includes(k)).map(x=>x.src).join(', ');
        badges.push(`<span class="sk-fx perm">✦ ${esc(srcs)}<span class="sk-tip">Always active — already counted in the bonus</span></span>`);
      }
      fxNotes(k).forEach(n=>{
        const b=noteBadge(k,abKey,n);
        if(b==null) return; // effect makes no difference here (e.g. already at expertise) — nothing to show
        const tip=n.cond?`<span class="sk-tip">${esc(n.cond)}</span>`:'';
        badges.push(`<span class="sk-fx" data-notemath="${k}">★ ${esc(n.src)} <b>${esc(b)}</b>${tip}</span>`);
      });
      return `
      <div class="skill-item">
        <div class="skill-row">
          <button class="dot ${dotCls}" data-skill="${k}" title="${dotTitle}"></button>
          <span class="bonus" data-skillbonus="${k}">+0</span>
          <span class="sk-name">${label}</span>
        </div>
        ${badges.length?`<div class="skill-fx-row">${badges.join('')}</div>`:''}
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
// One compact strip per attack: weapon identity, then Hit (left) and Damage (right) — that
// reading order never changes — with buffs tucked into a slim line underneath.
function attackRowHTML(a,i){
  const c=atkSummary(a);
  const isCustom=a.weapon==='custom'||!WEAPONS[a.weapon];
  const statOpts=ATK_STATS.map(([v,l])=>`<option value="${v}" ${(a.dmgStat||'auto')===v?'selected':''}>${l}</option>`).join('');
  const buffs=a.buffs||[];
  const icon=isCustom?'✏':(c.w&&c.w.rng?'🏹':'⚔');
  return `
  <div class="atk-card">
  <div class="atk-row">
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
      <div class="atk-roll">
        <input type="number" value="${esc(a.rolled)}" placeholder="roll" data-rolled="${i}" title="What you rolled on the weapon's damage dice">
        ${buffs.map((b,j)=>({b,j})).filter(({b})=>b.on&&(b.dice||'').trim()).map(({b,j})=>`
        <span class="atk-plus">+</span>
        <input type="number" class="atk-buffroll" value="${esc(b.rolled)}" placeholder="${esc(b.dice)}" data-buffrolled="${i}.${j}" title="What you rolled on ${esc(b.name||'this buff')}'s ${esc(b.dice)} damage dice">`).join('')}
        <span class="atk-eq">=</span>
        <span class="atk-final" data-atkfinal="${i}">${c.finalDamage!=null?c.finalDamage:'—'}</span>
      </div>
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
  <input type="text" class="atk-note" value="${esc(a.note||'')}" data-li="attacks.${i}.note" placeholder="✎ notes — reach, thrown 20/60, silvered, two-handed…">
  </div>`;
}
function renderAttacks(){
  $('#attackList').innerHTML = S.attacks.map((a,i)=>attackRowHTML(a,i)).join('');
  wireList('#attackList');
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
      renderWeaponResults(i);
      inp.nextElementSibling.classList.add('open');
      const norm=inp.value.trim().toLowerCase();
      const matchId=Object.keys(WEAPONS).find(id=>WEAPONS[id].n.toLowerCase()===norm);
      if(matchId && a.weapon!==matchId){
        a.weapon=matchId; a.die=WEAPONS[matchId].d; a.dmgStat='auto';
        renderAttacks(); save(); return;
      }
      if(!matchId && a.weapon!=='custom'){
        a.weapon='custom';
        renderAttacks(); save(); return;
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
// Typed inventory: rows carry a type (consumable/gear/ammo/…), an expandable description, and
// a ⚔ flag that projects the item into the Combat tab as a usable card. Free-text rows still
// work exactly like the old paper list — they're just "Gear" until told otherwise.
const EQ_OPEN=new Set();
function renderEquipment(){
  const list=$('#equipList'); if(!list) return;
  S.equipment=S.equipment||[];
  // backfill rows saved before items had types
  S.equipment.forEach(e=>{ if(e.type==null)e.type=(ITEM_TYPES[S.eqTab]?S.eqTab:'G'); if(e.desc==null)e.desc=''; if(e.combat==null)e.combat=false; });
  const order=Object.keys(ITEM_TYPES);
  const rowHTML=({e,i})=>`
    <div class="eq-row ${EQ_OPEN.has(i)?'open':''}">
      <input type="text" class="narrow eq-qty" value="${esc(e.qty)}" data-li="equipment.${i}.qty" placeholder="Qty" title="Quantity">
      <input type="text" class="eq-name" value="${esc(e.name)}" data-li="equipment.${i}.name" placeholder="Item">
      <select class="eq-type" data-eqtype="${i}" title="Item type">${order.map(t=>`<option value="${t}" ${e.type===t?'selected':''}>${ITEM_TYPES[t][0]}</option>`).join('')}</select>
      <button class="spell-info-btn" data-eqinfo="${i}" title="Notes / description">ℹ</button>
      <button class="combat-flag ${e.combat?'on':''}" data-eqcombat="${i}" title="${e.combat?'Shown on the Combat tab — tap to remove':'Tap to show on the Combat tab as a usable card'}">⚔</button>
      <button class="del-btn" data-del="equipment.${i}">✕</button>
      <div class="eq-desc"><textarea data-li="equipment.${i}.desc" placeholder="Notes / what it does…">${esc(e.desc)}</textarea></div>
    </div>`;
  S.eqCollapse=S.eqCollapse||{};
  if(!S.eqTab) S.eqTab='ALL';
  // One smart tab rail instead of a scroll of sections: All · each category (with count) ·
  // Treasure. A tab shows only its own rows; new custom items adopt the open tab's type.
  const counts=Object.fromEntries(order.map(ty=>[ty,S.equipment.filter(e=>e.type===ty).length]));
  const tabs=[['ALL','All',S.equipment.length],...order.map(ty=>[ty,ITEM_TYPES[ty][1],counts[ty]]),['TR','Treasure',null]];
  $('#eqTabs').innerHTML=tabs.map(([id,label,n])=>
    `<button class="eq-tab ${S.eqTab===id?'on':''}" data-eqtab="${id}">${label}${n?` <i>${n}</i>`:''}</button>`).join('');
  $$('[data-eqtab]').forEach(b=>b.addEventListener('click',()=>{
    S.eqTab=b.dataset.eqtab;
    renderEquipment(); save();
  }));
  const treasure=S.eqTab==='TR';
  $('#eqTreasure').style.display=treasure?'':'none';
  $('#eqAddBtn').style.display=treasure?'none':'';
  list.style.display=treasure?'none':'';
  if(treasure){ const ta=$('#eqTreasure textarea'); if(ta) autoGrow(ta); return; }
  if(S.eqTab==='ALL'){
    const groups=order
      .map(ty=>({ty,rows:S.equipment.map((e,i)=>({e,i})).filter(x=>x.e.type===ty)}))
      .filter(g=>g.rows.length);
    list.innerHTML = groups.length
      ? groups.map(g=>{
          const closed=!!S.eqCollapse[g.ty];
          return `<div class="eq-group ${closed?'closed':''}">
            <div class="eq-group-head" data-eqgroup="${g.ty}"><span>${ITEM_TYPES[g.ty][1]}</span><b class="eq-count">${g.rows.length}</b><i class="eq-chev">${closed?'▸':'▾'}</i></div>
            <div class="eq-rows">${g.rows.map(rowHTML).join('')}</div>
          </div>`;
        }).join('')
      : '<p class="prep-note" style="margin:0">Empty pack — search the gear index above or add a custom item.</p>';
  }else{
    const rows=S.equipment.map((e,i)=>({e,i})).filter(x=>x.e.type===S.eqTab);
    list.innerHTML = rows.length
      ? rows.map(rowHTML).join('')
      : `<p class="prep-note" style="margin:0">No ${ITEM_TYPES[S.eqTab][1].toLowerCase()} yet — "+ Add item" creates one right in this tab.</p>`;
  }
  wireList('#equipList');
  $$('[data-eqgroup]').forEach(h=>h.addEventListener('click',()=>{
    const ty=h.dataset.eqgroup;
    S.eqCollapse[ty]=!S.eqCollapse[ty];
    renderEquipment(); save();
  }));
  $$('[data-eqtype]').forEach(s=>s.addEventListener('change',()=>{
    S.equipment[+s.dataset.eqtype].type=s.value;
    renderEquipment(); save();
  }));
  $$('[data-eqcombat]').forEach(b=>b.addEventListener('click',()=>{
    const e=S.equipment[+b.dataset.eqcombat];
    e.combat=!e.combat;
    if(e.combat&&!e.actionType) e.actionType='item'; // lands in combat as an Item card
    renderEquipment(); renderCombatFeatures(); save();
  }));
  $$('[data-eqinfo]').forEach(b=>b.addEventListener('click',()=>{
    const i=+b.dataset.eqinfo;
    EQ_OPEN.has(i)?EQ_OPEN.delete(i):EQ_OPEN.add(i);
    renderEquipment();
  }));
  if($('#ckCards')) renderCockpitCards(); // combat item cards mirror qty/flag changes
}
// Item index search — same tap-to-add pattern as the spellbook and feature libraries.
function wireItemLibrary(){
  const input=$('#itemSearch'), panel=$('#itemResults'); if(!input) return;
  const list=Object.values(ITEM_DB);
  function renderResults(){
    const q=input.value.trim().toLowerCase();
    const items=list.filter(it=>!q||it.n.toLowerCase().includes(q)||(it.d||'').toLowerCase().includes(q));
    if(!items.length){ panel.innerHTML='<div class="empty">No matches — "+ Add item" makes it a custom row</div>'; return; }
    let html='';
    Object.keys(ITEM_TYPES).forEach(ty=>{
      const g=items.filter(it=>it.t===ty);
      if(!g.length) return;
      html+=`<div class="grp">${ITEM_TYPES[ty][1]}</div>`+
        g.map(it=>`<div class="item" data-itempick="${esc(it.n)}">${it.cb?'⚔ ':''}${esc(it.n)}<small>${esc(it.d)}</small></div>`).join('');
    });
    panel.innerHTML=html;
  }
  const open=()=>{ renderResults(); panel.classList.add('open'); };
  const close=()=>panel.classList.remove('open');
  input.addEventListener('focus',open);
  input.addEventListener('input',open);
  panel.addEventListener('click',e=>{
    const el=e.target.closest('[data-itempick]'); if(!el) return;
    const it=ITEM_DB[el.dataset.itempick.toLowerCase()]; if(!it) return;
    S.equipment.push({qty:String(it.q),name:it.n,type:it.t,desc:it.d,combat:it.cb});
    if(S.eqTab!=='ALL'&&S.eqTab!==it.t) S.eqTab=it.t; // jump to where it landed
    input.value=''; close();
    renderEquipment(); save();
  });
  document.addEventListener('click',e=>{
    if(!e.target.closest('#itemSearch')&&!e.target.closest('#itemResults')) close();
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
  if(s.kind==='race') return {byline:s.raceName||'',color:'#7dc26a'};
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
          ${f.usesScale==='prof'
            ? `<span class="prof-uses-val" title="Auto-set from your proficiency bonus (+${num(S.profBonus)}) — updates when you level up">= ${num(S.profBonus)}</span>`
            : `<input type="number" min="0" style="width:50px" value="${num(f.usesMax)}" data-uses="${i}" title="0 = not tracked (passive/at-will)">`}
          <select data-usesper="${i}"><option value="short" ${f.usesPer!=='long'?'selected':''}>per short rest</option><option value="long" ${f.usesPer==='long'?'selected':''}>per long rest</option></select>
          <button class="uses-prof-toggle ${f.usesScale==='prof'?'on':''}" data-usesprof="${i}" title="${f.usesScale==='prof'?'Tap to set a fixed number of uses instead':'Tap to auto-scale uses with your proficiency bonus (updates on level up)'}">= PROF</button>
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
const CK_TYPES=[['action','Action'],['bonus','Bonus Action'],['reaction','Reaction'],['item','Item'],['other','Other']];
const CK_TYPE_ORDER={action:0,bonus:1,reaction:2,item:3,other:4};
const CK_PILL={action:'pill-action',bonus:'pill-bonus',reaction:'pill-react',item:'pill-item',other:'pill-cast'};
let CK_FILTER='all', CK_UNDO=null;
const CK_OPEN=new Set(), CK_RULES_OPEN=new Set();
// Older saves may lack the cockpit fields entirely — normalize on every access.
function ck(){
  S.cockpit=S.cockpit||{};
  const c=S.cockpit;
  c.hidden=c.hidden||[]; c.pins=c.pins||[];
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
  if(db){
    const b=db.t.endsWith('r')?db.t.slice(0,-1):db.t;
    return b==='A'?'action':b==='B'?'bonus':b==='R'?'reaction':'other';
  }
  const m=(sp.meta||'').toLowerCase();
  return m.startsWith('bonus')?'bonus':m.startsWith('reaction')?'reaction':m.includes('action')?'action':'other';
}
function spellIsConc(sp){
  const db=SPELL_DB[(sp.name||'').trim().toLowerCase()];
  if(db) return (SP_DUR[db.du]||'').startsWith('Conc');
  return (sp.meta||'').toLowerCase().includes('conc');
}
// Assemble every card the grid can show, from all four sources.
function cockpitCards(){
  const c=ck(), cards=[];
  (S.attacks||[]).forEach((a,i)=>{
    if(!(a.name||'').trim()) return;
    cards.push({key:'atk:'+i,kind:'atk',i,name:a.name,type:a.actionType||'action',cond:a.cond||''});
  });
  const anyPrep=S.spellLevels.some((lv,L)=>L>0&&lv.spells.some(s=>s.prep));
  S.spellLevels.forEach((lv,L)=>lv.spells.forEach((sp,i)=>{
    if(!(sp.name||'').trim()) return;
    if(L>0&&anyPrep&&!c.showAllSpells&&!sp.prep) return;
    cards.push({key:`sp:${L}.${i}`,kind:'sp',L,i,name:sp.name,type:spellActionType(sp),cond:sp.cond||'',conc:spellIsConc(sp)});
  }));
  S.features.forEach((f,gi)=>{
    if(!f.combat) return;
    cards.push({key:'ft:'+gi,kind:'ft',gi,name:f.title||'Feature',
      type:f.actionType||(num(f.usesMax)>0?'action':'other'),cond:f.cond||''});
  });
  S.customCards.forEach((cc,i)=>{
    cards.push({key:'cc:'+i,kind:'cc',i,name:cc.title||'Custom',type:cc.type||'action',cond:cc.cond||''});
  });
  (S.equipment||[]).forEach((e,i)=>{
    if(!e.combat||!(e.name||'').trim()) return;
    // Blank qty = untracked (always usable); only an explicit 0 counts as "out of stock".
    const tracked=String(e.qty??'').trim()!=='';
    cards.push({key:'it:'+i,kind:'it',i,name:e.name,type:e.actionType||'item',cond:e.cond||'',out:tracked&&num(e.qty)<=0});
  });
  cards.forEach(x=>{ x.pin=c.pins.includes(x.key); });
  return cards;
}
function ckSlotPips(L){
  const lv=S.spellLevels[L]; if(!lv||!lv.total) return '';
  return `<span class="pips ck-pips">${Array.from({length:lv.total},(_,k)=>
    `<button class="pip ${k<lv.used?'used':''}" data-ckslot="${L}.${k}"></button>`).join('')}</span>`;
}
function ckGearRow(card){
  const obj=ckRef(card.key); if(!obj) return '';
  return `<div class="ck-gear">
    <select data-cktype="${card.key}">${CK_TYPES.map(([v,l])=>`<option value="${v}" ${card.type===v?'selected':''}>${l}</option>`).join('')}</select>
    <input type="text" value="${esc(obj.cond||'')}" data-ckcond="${card.key}" placeholder="Condition — e.g. first turn of combat, once per turn">
    <button data-ckpin="${card.key}">${card.pin?'📌 Unpin':'📌 Pin'}</button>
  </div>`;
}
function ckCardOpenHTML(card){
  const g=ckGearRow(card);
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
    return `Hit <b data-atkview="${i}">${esc(cSum.bonus)}</b> · <span data-atkdmg="${i}">${esc(cSum.dmg)}</span>${roll}`;
  }
  if(card.kind==='sp'){
    const sp=ckRef(card.key);
    return `${card.L===0?'Cantrip':ordinalLevel(card.L)+' level'}${sp.meta?' · '+esc(sp.meta):''}${card.L>0?' '+ckSlotPips(card.L):''}`;
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
  const open=CK_OPEN.has(card.key);
  const sub=ckSubHTML(card);
  const tl=Object.fromEntries(CK_TYPES);
  return `<div class="ck-card ck-card-${card.type||'other'} ${card.cond?'ck-cond':''} ${card.out?'ck-out':''} ${open?'open':''}" data-ckopen="${card.key}" data-ckdrag="${card.key}">
    <div class="ck-card-head">
      <span class="ck-drag-handle" data-ckdraghandle title="Drag to place in your turn plan">⠿</span>
      <span class="ck-card-name">${card.pin?'📌 ':''}${card.conc?'◉ ':''}${esc(card.name)}</span>
      <span class="sp-pill ${CK_PILL[card.type]||'pill-cast'}">${tl[card.type]||'Other'}</span>
      ${card.kind==='it'&&!card.out?`<button class="ck-quickuse" data-ckituse="${card.i}" title="Use one — no need to open the card">Use</button>`:''}
      <button class="ck-plan-add" data-ckplan="${card.key}" title="Add to end of turn plan (or drag the ⠿ handle to place it precisely)">⤵</button>
    </div>
    ${sub?`<div class="ck-card-sub">${sub}</div>`:''}
    ${card.cond?`<div class="ck-card-cond">⏱ ${esc(card.cond)}</div>`:''}
    ${open?ckCardOpenHTML(card):''}
  </div>`;
}
function renderCockpitCards(){
  const box=$('#ckCards'); if(!box) return;
  const c=ck();
  let cards=cockpitCards();
  const counts={all:cards.length};
  CK_TYPES.forEach(([v])=>counts[v]=cards.filter(x=>x.type===v).length);
  if(CK_FILTER!=='all') cards=cards.filter(x=>x.type===CK_FILTER);
  cards.sort((a,b)=>(b.pin-a.pin)||(CK_TYPE_ORDER[a.type]-CK_TYPE_ORDER[b.type])||((a.cond?1:0)-(b.cond?1:0))||a.name.localeCompare(b.name));
  $('#ckFilters').innerHTML=[['all','All'],...CK_TYPES].map(([v,l])=>
    `<button class="ck-filter ${CK_FILTER===v?'on':''}" data-ckfilter="${v}">${l}${counts[v]?` <i>${counts[v]}</i>`:''}</button>`).join('');
  box.innerHTML = cards.length
    ? cards.map(ckCardHTML).join('')
    : '<p class="prep-note" style="margin:0">Nothing here yet — add attacks below, pick spells on the Spells tab, flag features with ⚔ on the Features tab, or add a custom card.</p>';
  $('#ckUndo').innerHTML = CK_UNDO
    ? `<div class="ck-undo">${esc(CK_UNDO.msg)} <button data-ckundo>Undo</button><button data-ckundox>✕</button></div>` : '';
  const anyPrep=S.spellLevels.some((lv,L)=>L>0&&lv.spells.some(s=>s.prep));
  const st=$('#ckSpellsToggle');
  st.style.display=anyPrep?'':'none';
  st.textContent=c.showAllSpells?'Showing all spells — tap for prepared only':'Prepared spells only — tap for all';
  renderCockpitPlan();
}
// The turn-plan timeline — the cockpit's main stage. Each step is a full-information row:
// name, action-type pill, the same live sub-line as its grid card (hit/damage, slot pips, use
// dots), and a tap-to-expand body with the description and cast/use controls right there — no
// jumping back to the card grid mid-fight. Steps are snapshots {key,name}: the name survives
// even if the source card is later deleted, like pencil on paper.
const CK_PLAN_OPEN=new Set();
function renderCockpitPlan(){
  const box=$('#ckPlan'); if(!box) return;
  const cur=ckPlan();
  // Template tabs: one plan per situation — "Default", "Boss fight", "Defensive"... The active
  // tab's name is directly editable; ✕ deletes it (never the last one); + starts a new one.
  const canDel=S.turnPlans.length>1;
  $('#ckPlanTabs').innerHTML=S.turnPlans.map((p,i)=> i===num(S.turnPlanIdx)
    ? `<span class="ck-tpl on"><input type="text" value="${esc(p.name)}" data-cktplname maxlength="24" title="Template name — e.g. Boss fight, Defensive">${canDel?`<button data-cktpldel="${i}" title="Delete this plan">✕</button>`:''}</span>`
    : `<span class="ck-tpl"><button data-cktpl="${i}">${esc(p.name)||'Plan '+(i+1)}</button>${canDel?`<button data-cktpldel="${i}" title="Delete this plan">✕</button>`:''}</span>`
  ).join('')+`<button class="ck-tpl ck-tpl-add" data-cktpladd title="New plan">+</button>`;
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
        return `<div class="ck-plan-step ck-ps-${card.type} ${open?'open':''}" data-planstep="${i}">
          <span class="ck-drag-handle" data-ckdraghandle title="Drag to reorder">⠿</span>
          <i>${i+1}</i>
          <div class="ck-ps-main">
            <div class="ck-ps-head">
              <span class="ck-ps-name">${card.conc?'◉ ':''}${esc(card.name)}</span>
              ${noteIn}
              <span class="sp-pill ${CK_PILL[card.type]||'pill-cast'}">${tl[card.type]||'Other'}</span>
            </div>
            <div class="ck-ps-sub">${ckSubHTML(card,true)}</div>
            ${card.cond?`<div class="ck-card-cond">⏱ ${esc(card.cond)}</div>`:''}
            ${open?ckCardOpenHTML(card):''}
          </div>
          <button data-plandel="${i}" title="Remove step">✕</button>
        </div>`;
      }).join('')
    : '<div class="ck-plan-empty">Script your ideal turn: drag a card\'s ⠿ handle up here, or tap ⤵ on a card — e.g. Dread Ambusher → Shortsword → Hunter\'s Mark. Tap a step for its full info and cast/use buttons. Make templates (+) for different situations: boss fight, defensive, stealth...</div>';
  const clr=$('#ckPlanClear');
  if(clr) clr.style.display=cur.steps.length?'':'none';
}
// Concentration banner, state chips, ★ reminders feed, rules drawer.
function renderCockpitExtras(){
  if(!$('#ckConc')) return;
  ck();
  $('#ckConc').innerHTML = S.concentration
    ? `◉ Concentrating: <b>${esc(S.concentration.name)}</b> <button data-ckconcdrop title="Drop concentration">✕</button><span class="ck-conc-tip">CON save when you take damage — DC 10 or half the damage, whichever is higher</span>`
    : '';
  $('#ckTopStates').innerHTML=S.states.map(s=>`<span class="ck-state">${esc(s)}</span>`).join('');
  $('#ckStates').innerHTML = S.states.length
    ? S.states.map((s,i)=>`<span class="fx-chip">${esc(s)}<button data-stdel="${i}">✕</button></span>`).join('')
    : '<p class="prep-note" style="margin:0">Nothing active.</p>';
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
  $('#page-combat').addEventListener('click',e=>{
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
      ckPlan().steps.push({key,name:c?c.name:key});
      CK_PLAN_OPEN.clear();
      renderCockpitPlan(); save(); return; }
    const pdel=t.closest('[data-plandel]');
    if(pdel){ ckPlan().steps.splice(+pdel.dataset.plandel,1); CK_PLAN_OPEN.clear(); renderCockpitPlan(); save(); return; }
    const tpl=t.closest('[data-cktpl]');
    if(tpl){ S.turnPlanIdx=+tpl.dataset.cktpl; CK_PLAN_OPEN.clear(); renderCockpitPlan(); save(); return; }
    if(t.closest('[data-cktpladd]')){
      ck(); S.turnPlans.push({name:'Plan '+(S.turnPlans.length+1),steps:[]});
      S.turnPlanIdx=S.turnPlans.length-1; CK_PLAN_OPEN.clear();
      renderCockpitPlan(); save(); return; }
    const tdel=t.closest('[data-cktpldel]');
    if(tdel){
      if(S.turnPlans.length>1){
        const di=+tdel.dataset.cktpldel, p=S.turnPlans[di];
        const what=`Delete plan "${p.name||'Plan '+(di+1)}"${p.steps.length?` and its ${p.steps.length} step${p.steps.length>1?'s':''}`:''}?`;
        uiConfirm(what,{title:'Delete plan',ok:'Delete',danger:true}).then(ok=>{
          if(!ok) return;
          S.turnPlans.splice(di,1);
          if(num(S.turnPlanIdx)>=di) S.turnPlanIdx=Math.max(0,num(S.turnPlanIdx)-1);
          CK_PLAN_OPEN.clear();
          renderCockpitPlan(); save();
        }); } return; }
    const pstep=t.closest('[data-planstep]');
    if(pstep){ // tap a step → unfold its full info right here in the timeline
      if(t.closest('input,select,textarea,button,a,.pips,.ck-body')) return;
      const i=+pstep.dataset.planstep;
      CK_PLAN_OPEN.has(i)?CK_PLAN_OPEN.delete(i):CK_PLAN_OPEN.add(i);
      renderCockpitPlan(); return; }
    const pin=t.closest('[data-ckpin]');
    if(pin){ const c=ck(), key=pin.dataset.ckpin;
      c.pins=c.pins.includes(key)?c.pins.filter(x=>x!==key):[...c.pins,key]; refresh(); return; }
    const del=t.closest('[data-ccdel]');
    if(del){ uiConfirm('Delete this custom card?',{title:'Delete card',ok:'Delete',danger:true}).then(ok=>{
        if(!ok) return;
        S.customCards.splice(+del.dataset.ccdel,1); CK_OPEN.clear(); refresh();
      }); return; }
    const filt=t.closest('[data-ckfilter]');
    if(filt){ CK_FILTER=filt.dataset.ckfilter; renderCockpitCards(); return; }
    const rsec=t.closest('[data-ckrsec]');
    if(rsec){ const si=+rsec.dataset.ckrsec;
      CK_RULES_OPEN.has(si)?CK_RULES_OPEN.delete(si):CK_RULES_OPEN.add(si);
      renderCockpitExtras(); return; }
    if(t.closest('[data-ckconcdrop]')){ S.concentration=null; renderCockpitExtras(); save(); return; }
    const sdel=t.closest('[data-stdel]');
    if(sdel){ S.states.splice(+sdel.dataset.stdel,1); renderCockpitExtras(); save(); return; }
    // Card head tap toggles open — but not when the tap landed on a control or inside the
    // opened body (accidental scroll-taps on a tablet shouldn't slam the card shut).
    if(t.closest('input,select,textarea,button,a,.pips,.ck-body')) return;
    const cardEl=t.closest('[data-ckopen]');
    if(cardEl){ const key=cardEl.dataset.ckopen;
      CK_OPEN.has(key)?CK_OPEN.delete(key):CK_OPEN.add(key);
      renderCockpitCards(); return; }
  });
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
  $('#page-combat').addEventListener('change',e=>{
    const t=e.target;
    if(t.dataset.cktype!=null){ const o=ckRef(t.dataset.cktype); if(o){o.actionType=t.value; renderCombatFeatures(); save();} }
  });
  $('#ckAddCustom').addEventListener('click',()=>{
    ck(); S.customCards.push({title:'',body:'',type:'action',cond:'',usesMax:0,usesUsed:0});
    CK_OPEN.add('cc:'+(S.customCards.length-1));
    renderCockpitCards(); save();
  });
  $('#ckPlanClear').addEventListener('click',()=>{
    const n=ckPlan().steps.length;
    const go=()=>{ ckPlan().steps=[]; CK_PLAN_OPEN.clear(); renderCockpitPlan(); save(); };
    if(!n) return go();
    uiConfirm(`Clear all ${n} step${n>1?'s':''} from "${ckPlan().name}"?`,{title:'Clear plan',ok:'Clear',danger:true})
      .then(ok=>{ if(ok) go(); });
  });
  initCkDrag();
  $('#ckSpellsToggle').addEventListener('click',()=>{ ck().showAllSpells=!ck().showAllSpells; renderCockpitCards(); save(); });
  $('#ckStateAdd').addEventListener('click',()=>{
    const inp=$('#ckStateIn'), v=inp.value.trim(); if(!v) return;
    ck(); S.states.push(v); inp.value='';
    renderCockpitExtras(); save();
  });
  $('#ckStateIn').addEventListener('keydown',e=>{ if(e.key==='Enter') $('#ckStateAdd').click(); });
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
        steps.splice(drag.dropIndex,0,{key:drag.key,name:c?c.name:drag.key});
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

// ----- Feature library: searchable instead of one giant native <select> (a lot of options) -----
function wireLibrary(){
  const input=$('#libSearch'), panel=$('#libResults');
  const groupsOrder=[...new Set(FEATURE_LIB.map(e=>e.g))];
  const matches=(e,q)=>!q || e.n.toLowerCase().includes(q) || e.g.toLowerCase().includes(q) || (e.d||'').toLowerCase().includes(q);
  function renderResults(){
    const q=input.value.trim().toLowerCase();
    const items=FEATURE_LIB.map((e,idx)=>({...e,idx})).filter(e=>matches(e,q));
    if(!items.length){ panel.innerHTML='<div class="empty">No matches</div>'; return; }
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
    // deep-copy effects; Tough scales with current level
    let fx=(ent.fx||[]).map(x=>({...x}));
    if(ent.n==='Tough') fx=[{t:'stat',stat:'hpmax',n:2*Math.max(1,num(S.level))}];
    // "smart" add: library entries already know if they're combat-relevant and how many uses per rest,
    // so a feature like Action Surge shows up on the Combat tab immediately, no manual setup needed.
    // A few (uses = proficiency bonus) carry usesScale:'prof' so their max stays synced on level-up.
    const usesScale=ent.usesScale||'';
    const usesMax = usesScale==='prof' ? Math.max(1,num(S.profBonus)) : (ent.usesMax||0);
    // Tag where this came from — class feature vs. feat — so the card can wear its source
    // as a colored wax seal instead of every feature looking identical.
    const source = ent.g==='Feats' ? {kind:'feat'} : {kind:'class',classId:classIdFromGroupName(ent.g),className:ent.g};
    S.features.push({title:ent.n,desc:ent.d,fx,combat:!!ent.combat,usesMax,usesPer:ent.usesPer||'short',usesUsed:0,usesScale,source});
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
    const items=RACE_LIB.map((e,idx)=>({...e,idx})).filter(e=>matches(e,q));
    if(!items.length){ panel.innerHTML='<div class="empty">No matches</div>'; return; }
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
    // deep-copy effects; Dwarven Toughness scales with current level
    let fx=(ent.fx||[]).map(x=>({...x}));
    if(ent.n==='Dwarven Toughness (Hill Dwarf)') fx=[{t:'stat',stat:'hpmax',n:Math.max(1,num(S.level))}];
    // Traits like Orc's Adrenaline Rush or Harengon's Rabbit Hop carry usesScale:'prof' so their
    // max uses stay synced to your proficiency bonus automatically as you level up.
    const usesScale=ent.usesScale||'';
    const usesMax = usesScale==='prof' ? Math.max(1,num(S.profBonus)) : (ent.usesMax||0);
    const source={kind:'race',raceName:ent.g};
    S.features.push({title:ent.n,desc:ent.d,fx,combat:!!ent.combat,usesMax,usesPer:ent.usesPer||'short',usesUsed:0,usesScale,source});
    input.value=''; close();
    fxRefresh();
  });
  document.addEventListener('click',e=>{
    if(!e.target.closest('#raceSearch') && !e.target.closest('#raceResults')) close();
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
  // Toggle: tie this feature's max uses to the proficiency-bonus stat instead of a fixed number
  $$('[data-usesprof]').forEach(el=>el.addEventListener('click',()=>{
    const f=S.features[+el.dataset.usesprof];
    f.usesScale = f.usesScale==='prof' ? '' : 'prof';
    if(f.usesScale==='prof'){
      f.usesMax=Math.max(1,num(S.profBonus));
      f.usesUsed=Math.min(num(f.usesUsed),f.usesMax);
    }
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
function renderNotes(){
  $('#noteList').innerHTML = S.notes.map((n,i)=>`
    <div class="panel">
      <div class="list-row">
        <input type="text" value="${esc(n.title)}" data-li="notes.${i}.title" placeholder="Note title" style="font-size:1.1rem">
        <button class="del-btn" data-del="notes.${i}">✕</button>
      </div>
      <textarea data-li="notes.${i}.body" style="min-height:120px" placeholder="Write anything...">${esc(n.body)}</textarea>
    </div>`).join('');
  wireList('#noteList');
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
function renderSpellLevels(){
  $('#spellLevels').innerHTML = S.spellLevels.map((lv,L)=>{
    const pips = L===0 ? '' : `
      <span class="slot-total">Slots <input type="number" min="0" max="9" value="${lv.total}" data-slottotal="${L}"></span>
      <div class="pips">${Array.from({length:lv.total},(_,i)=>
        `<button class="pip ${i<lv.used?'used':''}" data-pip="${L}.${i}"></button>`).join('')}</div>`;
    const rows = lv.spells.map((sp,i)=>{
      // Older saves only stored {name,prep}; backfill the editable meta/description fields
      // from the spell index the first time this row renders.
      if(sp.meta==null) sp.meta=spellMetaDefault(sp.name);
      if(sp.desc==null) sp.desc=spellDescDefault(sp.name);
      const pills=spellPillsHTML(sp.name);
      const detail=spellDetailHTML(sp.name,L);
      // Picked the wrong level, or a spell got reflavored to a different one? Move it in place
      // instead of deleting the row and retyping the name in the right level's section.
      const lvlSelect=`<select class="spell-lvlsel" data-spellmove="${L}.${i}" title="Move to a different level">
        ${Array.from({length:10},(_,k)=>`<option value="${k}" ${k===L?'selected':''}>${ordinalLevel(k)}</option>`).join('')}
      </select>`;
      return `
      <div class="spell-entry">
        <div class="spell-row">
          ${L===0?'':`<button class="dot ${sp.prep?'on':''}" data-prep="${L}.${i}" title="Prepared"></button>`}
          <input type="text" value="${esc(sp.name)}" data-li="spellLevels.${L}.spells.${i}.name" data-spellrow="${L}.${i}" placeholder="Spell name…">
          ${detail?`<button class="spell-info-btn" data-spellinfo title="More info">ℹ</button>`:''}
          ${lvlSelect}
          <button class="del-btn" data-del="spellLevels.${L}.spells.${i}">✕</button>
        </div>
        ${pills?`<div class="spell-pills">${pills}</div>`:''}
        <input type="text" class="spell-meta" value="${esc(sp.meta)}" data-li="spellLevels.${L}.spells.${i}.meta" placeholder="Casting time · range · duration">
        <textarea class="spell-desc" data-li="spellLevels.${L}.spells.${i}.desc" placeholder="What does this spell do?">${esc(sp.desc)}</textarea>
        ${detail?`<div class="spell-detail">${detail}</div>`:''}
      </div>`;
    }).join('');
    return `
    <div class="spell-level tier${spellTier(L)}">
      <span class="spell-numeral">${L===0?'✦':toRoman(L)}</span>
      <div class="spell-level-head">
        <h3>${L===0?'Cantrips':'Level '+L}</h3>${pips}
      </div>
      ${rows}
      <button class="add-btn" data-addspell="${L}">+ Add ${L===0?'cantrip':'spell'}</button>
    </div>`;
  }).join('');
  // wire slot totals
  $$('[data-slottotal]').forEach(inp=>inp.addEventListener('change',()=>{
    const L=+inp.dataset.slottotal;
    S.spellLevels[L].total=Math.max(0,Math.min(9,num(inp.value)));
    S.spellLevels[L].used=Math.min(S.spellLevels[L].used,S.spellLevels[L].total);
    renderSpellLevels(); save();
  }));
  // wire pips
  $$('[data-pip]').forEach(p=>p.addEventListener('click',()=>{
    const [L,i]=p.dataset.pip.split('.').map(Number);
    const lv=S.spellLevels[L];
    lv.used = (i<lv.used) ? i : i+1;
    renderSpellLevels(); save();
  }));
  // wire prepared dots
  $$('[data-prep]').forEach(d=>d.addEventListener('click',()=>{
    const [L,i]=d.dataset.prep.split('.').map(Number);
    const sp=S.spellLevels[L].spells[i];
    sp.prep=!sp.prep; d.classList.toggle('on'); save();
  }));
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
    S.spellLevels[+b.dataset.addspell].spells.push({name:'',prep:false,meta:'',desc:''});
    renderSpellLevels(); save();
    focusLast('#spellLevels');
  }));
  // re-render after picking/typing a full spell name so pills + detail toggle appear; a
  // recognized name also refreshes the editable meta/description with that spell's defaults
  $$('[data-spellrow]').forEach(inp=>inp.addEventListener('change',()=>{
    const [L,i]=inp.dataset.spellrow.split('.').map(Number);
    const sp=S.spellLevels[L].spells[i];
    if(sp && SPELL_DB[(sp.name||'').trim().toLowerCase()]){
      sp.meta=spellMetaDefault(sp.name);
      sp.desc=spellDescDefault(sp.name);
      save();
    }
    renderSpellLevels();
  }));
  wireList('#spellLevels');
  renderCombatSlots();
}
// Compact slot tracker mirrored onto the Combat tab — a caster needs to spend slots mid-fight far
// more often than they need to edit the spellbook, so this reads the same S.spellLevels data as
// the Spells tab instead of asking the player to tab away and back for every slot spent. Hidden
// entirely for non-casters and re-rendered by renderSpellLevels() so both stay in sync no matter
// which tab the click happened on.
function renderCombatSlots(){
  const panel=$('#combatSlotsPanel'), list=$('#combatSlots');
  if(!panel||!list) return; // Combat tab may not be built yet on first boot
  const isCaster=!!S.spellAbility;
  panel.style.display = isCaster ? '' : 'none';
  if(!isCaster) return;
  const levels=S.spellLevels.map((lv,L)=>({lv,L})).filter(x=>x.L>0&&x.lv.total>0);
  list.innerHTML = levels.length ? levels.map(({lv,L})=>`
    <div class="cslot-row tier${spellTier(L)}">
      <span class="cslot-lvl">${toRoman(L)}</span>
      <div class="pips cslot-pips">${Array.from({length:lv.total},(_,i)=>
        `<button class="pip ${i<lv.used?'used':''}" data-cslotpip="${L}.${i}" title="Level ${L} slot"></button>`).join('')}</div>
    </div>`).join('') : '<p class="prep-note" style="margin:0">No slot totals set yet — set them on the Spells tab.</p>';
  renderCockpitCards(); // spell-card slot pips mirror this data — keep them in step
}
function wireCombatSlots(){
  $('#combatSlots').addEventListener('click',e=>{
    const p=e.target.closest('[data-cslotpip]'); if(!p) return;
    const [L,i]=p.dataset.cslotpip.split('.').map(Number);
    const lv=S.spellLevels[L];
    lv.used = (i<lv.used) ? i : i+1;
    renderSpellLevels(); save(); // also refreshes this tracker — keeps Combat/Spells in sync
  });
}
// Tap-to-expand detail (range/duration/DC/wikidot link) — delegated once on the persistent
// container so it survives every renderSpellLevels() re-render.
function wireSpellDetails(){
  $('#spellLevels').addEventListener('click',e=>{
    const btn=e.target.closest('[data-spellinfo]'); if(!btn) return;
    btn.closest('.spell-entry').classList.toggle('open');
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
    S.spellLevels[sp.lv].spells.push({name:sp.n,prep:false,meta:spellMetaDefault(sp.n),desc:spellDescDefault(sp.n)});
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
const RERENDER = {attacks:renderAttacks,equipment:renderEquipment,features:fxRefresh,
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
  // features whose uses-per-rest are tied to proficiency bonus (e.g. Orc's Adrenaline Rush,
  // Harengon's Rabbit Hop) auto-rescale here, so leveling up (which changes profBonus) keeps
  // their max uses correct without the player having to edit the number by hand.
  let profUsesChanged=false;
  S.features.forEach(f=>{
    if(f.usesScale==='prof'){
      const p=Math.max(1,P);
      if(num(f.usesMax)!==p){ f.usesMax=p; profUsesChanged=true; }
      if(num(f.usesUsed)>f.usesMax){ f.usesUsed=f.usesMax; profUsesChanged=true; }
    }
  });
  if(profUsesChanged) renderCombatFeatures();
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
    S.ac=computedBaseAC();
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
  // AC / speed / max HP annotations from feature effects
  const acFx=fxStat('ac');
  $$(`[data-fxnote="ac"]`).forEach(el=>el.textContent=acFx?`${fmt(acFx)} features → ${num(S.ac)+acFx}`:'');
  const spFx=fxStat('speed');
  $$(`[data-fxnote="speed"]`).forEach(el=>el.textContent=spFx?`${fmt(spFx)} ft. from features`:'');
  const hmFx=fxStat('hpmax');
  $$(`[data-fxnote="hpmax"]`).forEach(el=>el.textContent=hmFx?`${fmt(hmFx)} features → max ${num(S.hpMax)+hmFx}`:'');
  const visFx=fxStat('vision');
  $$(`[data-fxnote="vision"]`).forEach(el=>el.textContent=visFx?`${fmt(visFx)} ft. from features`:'');
  // ★ Stat reminders — badge next to the stat naming the feature (and optional bonus);
  // tap unfolds the "when" text. Same tap-to-open chrome as the skill-row badges, and the
  // same document-level listener (wireSkillFx) already handles the toggling.
  Object.keys(FX_STATS).forEach(k=>{
    const rems=fxStatRems(k);
    $$(`[data-fxrem="${k}"]`).forEach(el=>el.innerHTML=rems.map(r=>{
      const hasAmt=r.n!=null&&String(r.n).trim()!=='';
      const amt=hasAmt?` <b>${fmt(fxAmount(r.n))}</b>`:'';
      const tip=r.cond?`<span class="sk-tip">${esc(r.cond)}</span>`:'';
      return `<span class="sk-fx">★ ${esc(r.src)}${amt}${tip}</span>`;
    }).join(''));
  });
  // HUD's second line only exists when something is on it — hide empty stat wrappers
  $$('.chud-x').forEach(x=>{
    const has=[...x.querySelectorAll('[data-fxrem],[data-fxnote]')].some(el=>el.innerHTML.trim());
    x.style.display=has?'':'none';
  });
  // spellcasting
  if(S.spellAbility){
    const m=amod(S.spellAbility);
    setCalc('spellDC',8+P+m);
    setCalc('spellAtk',fmt(P+m));
  }else{
    setCalc('spellDC','—'); setCalc('spellAtk','—');
  }
  // attack rows stay in sync with ability/proficiency/magic/buff/roll changes
  $$('[data-atkview]').forEach(el=>{
    const i=+el.dataset.atkview, a=S.attacks[i]; if(!a) return;
    const s=atkSummary(a);
    el.textContent=s.bonus;
    const brk=$(`[data-atkbreak="${i}"]`); if(brk) brk.textContent=s.breakdown;
    const dmgEl=$(`[data-atkdmg="${i}"]`); if(dmgEl) dmgEl.textContent=s.dmg;
    const dmgBrk=$(`[data-atkdmgbreak="${i}"]`); if(dmgBrk) dmgBrk.textContent=s.dmgBreakdown;
    const finalEl=$(`[data-atkfinal="${i}"]`); if(finalEl) finalEl.textContent=s.finalDamage!=null?s.finalDamage:'—';
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
  document.title=(S.name?S.name+' — ':'')+'Character Binder';
}
function setCalc(key,val){ $$(`[data-calc="${key}"]`).forEach(el=>el.textContent=val); }

// ---------- Overview "At a Glance" ----------
function renderOverviewQuick(){
  const preparedCount=S.spellLevels.reduce((n,lv,L)=>n+(L===0?0:lv.spells.filter(s=>s.prep).length),0);
  const slotsLeft=S.spellLevels.reduce((n,lv,L)=>n+(L===0?0:Math.max(0,lv.total-lv.used)),0);
  const gold=S.money.gp+S.money.pp*10+Math.floor((S.money.sp+S.money.ep*5)/10+S.money.cp/100);
  const feats=S.features.filter(f=>f.title.trim());
  const atks=S.attacks.filter(a=>(a.name||'').trim()||a.weapon).map(a=>{
    const s=atkSummary(a);
    return {name:(a.name||'').trim()||(WEAPONS[a.weapon]?.n??'Attack'),bonus:s.bonus||'',dmg:s.dmg||''};
  });
  $('#ovQuick').innerHTML=`
    <div class="ov-card ov-combat"><h3>⚔ Combat</h3>
      <ul class="ov-list">
        ${atks.length?atks.map(a=>`<li><span>${esc(a.name)}</span><span class="k">${esc(a.bonus)} · ${esc(a.dmg)}</span></li>`).join(''):'<li class="ov-empty">No attacks yet — add them in Combat</li>'}
        <li><span class="k">Hit dice</span><span>${(()=>{const h=hdCount();return h.n?`${Math.max(0,h.n-num(S.hdUsed))}/${h.n}${h.die}`:'—';})()}</span></li>
      </ul></div>
    <div class="ov-card ov-magic"><h3>✦ Magic</h3>
      <ul class="ov-list">
        <li><span class="k">Prepared spells</span><span>${preparedCount}</span></li>
        <li><span class="k">Slots remaining</span><span>${slotsLeft}</span></li>
        <li><span class="k">Save DC / Attack</span><span>${S.spellAbility?(8+num(S.profBonus)+amod(S.spellAbility))+' / '+fmt(num(S.profBonus)+amod(S.spellAbility)):'—'}</span></li>
      </ul></div>
    <div class="ov-card ov-char"><h3>📜 Character</h3>
      <ul class="ov-list">
        <li><span class="k">Wealth (approx.)</span><span>${gold} gp</span></li>
        <li><span class="k">Features</span><span>${feats.length?esc(feats.slice(0,3).map(f=>f.title).join(', '))+(feats.length>3?'…':''):'—'}</span></li>
        <li><span class="k">Traits</span><span>${S.personality?esc(S.personality.slice(0,60))+(S.personality.length>60?'…':''):'—'}</span></li>
      </ul></div>`;
}

// ---------- Add buttons (attacks / equipment / features / notes) ----------
const ADD_TEMPLATES = {
  attacks:()=>({name:'Longsword',weapon:'longsword',die:'1d8',dmgStat:'auto',magic:0,miscAtk:0,miscDmg:0,rolled:'',buffs:[]}),
  equipment:()=>({qty:'',name:''}),
  features:()=>({title:'',desc:'',fx:[],combat:false,usesMax:0,usesPer:'short',usesUsed:0,usesScale:'',source:{kind:'custom'}}),
  notes:()=>({title:'',body:''})
};
function wireAddButtons(){
  $$('[data-add]').forEach(b=>b.addEventListener('click',()=>{
    const key=b.dataset.add;
    S[key].push(ADD_TEMPLATES[key]());
    RERENDER[key](); save();
    focusLast('#'+({attacks:'attackList',equipment:'equipList',features:'featureList',notes:'noteList'})[key]);
  }));
}

// ---------- HP quick buttons ----------
function wireHpButtons(){
  $$('[data-hp]').forEach(b=>b.addEventListener('click',()=>{
    let d=num(b.dataset.hp);
    if(d<0){ // damage soaks temp HP first (5e rule)
      let dmg=-d;
      const soak=Math.min(num(S.hpTemp),dmg);
      S.hpTemp=num(S.hpTemp)-soak; dmg-=soak;
      S.hpCurrent=Math.max(0,num(S.hpCurrent)-dmg);
    }else{
      S.hpCurrent=Math.min(num(S.hpMax)+fxStat('hpmax'),num(S.hpCurrent)+d);
    }
    syncBound(); recalc(); save();
  }));
}

// ---------- Smart build: class & race presets ----------
const AB_NAMES=Object.fromEntries(ABILITIES);

// Fill the dropdowns to match current state (called on load & import)
function renderBuildSelectors(){
  const cs=$('#classSel');
  cs.innerHTML='<option value="">— choose —</option>'+
    Object.entries(CLASSES).map(([id,c])=>`<option value="${id}">${CLASS_ICON[id]||''} ${c.name}</option>`).join('');
  cs.value=S.classId||'';
  $('#levelIn').value=S.level||1;
  const rs=$('#raceSel');
  const groups=['Common','Exotic','Monstrous'];
  rs.innerHTML='<option value="">— choose —</option>'+groups.map(g=>
    `<optgroup label="${g}">`+
    Object.entries(RACES).filter(([,r])=>r.group===g)
      .map(([id,r])=>`<option value="${id}">${r.name}</option>`).join('')+
    '</optgroup>').join('');
  rs.value=S.raceId||'';
  renderSubraceAndFlex();
  renderBuildTheme();
}
// Class-flavored theming for the Build screen — accent color + icon + a "Level X Class —
// Subclass" nameplate, so picking a class feels like forging a character, not filling a form.
// (The Subclass field's suggestion list reads subclassNamesForClass(S.classId) live on focus,
// so it always matches the currently chosen class with no syncing needed here.)
function renderBuildTheme(){
  const panel=$('#buildPanel'); if(!panel) return;
  const c=CLASSES[S.classId];
  const accent=CLASS_COLOR[S.classId]||'#c9a227';
  panel.style.setProperty('--accent',accent);
  panel.style.setProperty('--accent-dim',accent+'30');
  $('#buildIcon').textContent=CLASS_ICON[S.classId]||'⚔';
  const title=$('#buildTitle');
  if(c){
    title.textContent=`Level ${num(S.level)||1} ${c.name}${S.subclass?' — '+S.subclass:''}`;
    title.style.display='block';
  }else{
    title.style.display='none';
  }
}
function renderSubraceAndFlex(){
  const r=RACES[S.raceId];
  const fld=$('#subraceFld'), sel=$('#subraceSel');
  if(r&&r.subs){
    fld.style.display='';
    sel.innerHTML=Object.entries(r.subs).map(([id,s])=>`<option value="${id}">${s.name}</option>`).join('');
    if(!r.subs[S.subraceId]) S.subraceId=Object.keys(r.subs)[0];
    sel.value=S.subraceId;
  }else{ fld.style.display='none'; S.subraceId=''; }
  // flexible bonus pickers: MotM lineages (+2 / +1) or Half-Elf / Variant Human (two +1s)
  const n=flexCount();
  const motm=r&&r.motm;
  $('#flex0Lbl').textContent=motm?'Bonus +2 to':'Bonus +1 (choice 1)';
  $('#flex1Lbl').textContent=motm?'Bonus +1 to':'Bonus +1 (choice 2)';
  [0,1].forEach(i=>{
    const f=$('#flex'+i+'Fld'), s=$('#flex'+i);
    if(i<n){
      f.style.display='';
      const ri=raceInfo();
      // can't pick an ability with a fixed racial bonus, or the same ability twice
      const fixed=k=>motm?false:(((ri.r.bonus&&ri.r.bonus[k])||0)+((ri.sub&&ri.sub.bonus&&ri.sub.bonus[k])||0))>0;
      s.innerHTML='<option value="">— pick —</option>'+ABILITIES
        .filter(([k])=>!fixed(k)&&S.flexBonus[1-i]!==k)
        .map(([k,l])=>`<option value="${k}">${l}</option>`).join('');
      s.value=S.flexBonus[i]||'';
    }else{ f.style.display='none'; S.flexBonus[i]=''; }
  });
}

// ---------- ASI / Feat rows ----------
function renderAsi(){
  const panel=$('#asiPanel');
  const lvls=asiLevels(S.classId).filter(L=>L<=num(S.level));
  if(!S.classId||!lvls.length){ panel.style.display='none'; return; }
  panel.style.display='';
  // The feat inputs below get fully rebuilt — an open suggestion popover would be left
  // pointing at a detached node, so close it first rather than track it through the rebuild.
  closeSuggest();
  // drop stale entries from levels no longer earned (e.g. level lowered)
  Object.keys(S.asi).forEach(L=>{ if(!lvls.includes(+L)) delete S.asi[L]; });
  const abOpts=sel=>'<option value="">— pick —</option>'+ABILITIES
    .map(([k,l])=>`<option value="${k}" ${sel===k?'selected':''}>${l}</option>`).join('');
  $('#asiList').innerHTML=lvls.map(L=>{
    const e=S.asi[L]||{choice:'',a:'',b:'',feat:''};
    return `
    <div class="list-row" style="align-items:center">
      <span style="flex:0 0 70px;color:var(--gold);font-family:'Cinzel',serif;font-size:.85rem">LV ${L}</span>
      <select class="narrow" style="flex:0 0 200px" data-asichoice="${L}">
        <option value="" ${!e.choice?'selected':''}>— choose —</option>
        <option value="asi" ${e.choice==='asi'?'selected':''}>Ability Score Improvement</option>
        <option value="feat" ${e.choice==='feat'?'selected':''}>Feat</option>
      </select>
      ${e.choice==='asi'?`
        <select data-asia="${L}">${abOpts(e.a)}</select>
        <select data-asib="${L}">${abOpts(e.b)}</select>`:''}
      ${e.choice==='feat'?`
        <span class="sug-wrap" style="flex:1 1 220px;min-width:180px"><input type="text" value="${esc(e.feat)}" data-asifeat="${L}" autocomplete="off" placeholder="Feat name (start typing…)" style="width:100%"></span>`:''}
    </div>`;
  }).join('');
  const entry=L=>S.asi[L]||(S.asi[L]={choice:'',a:'',b:'',feat:''});
  $$('[data-asichoice]').forEach(s=>s.addEventListener('change',()=>{
    entry(+s.dataset.asichoice).choice=s.value;
    renderAsi(); recalc(); save();
  }));
  $$('[data-asia]').forEach(s=>s.addEventListener('change',()=>{
    entry(+s.dataset.asia).a=s.value; recalc(); save();
  }));
  $$('[data-asib]').forEach(s=>s.addEventListener('change',()=>{
    entry(+s.dataset.asib).b=s.value; recalc(); save();
  }));
  $$('[data-asifeat]').forEach(inp=>inp.addEventListener('input',()=>{
    entry(+inp.dataset.asifeat).feat=inp.value; save();
  }));
}

// Apply class/level/race choices to the sheet.
// Only overwrites the fields these choices control; everything stays editable.
function applyBuild(){
  S.level=Math.max(1,Math.min(20,num(S.level)||1));
  S.profBonus=2+Math.floor((S.level-1)/4);   // 5e proficiency progression
  const c=CLASSES[S.classId];
  const notes=[];
  if(c){
    S.hdTotal=S.level+'d'+c.hd;
    ABILITIES.forEach(([k])=>S.saveProf[k]=c.saves.includes(k));
    S.classLevel=c.name+' '+S.level;
    if(c.cast){
      S.spellClass=c.name; S.spellAbility=c.ab;
      const slots = c.cast==='pact' ? pactSlots(S.level)
                  : c.cast==='half' ? (S.level<2?[]:FULL_SLOTS[Math.ceil(S.level/2)])
                  : FULL_SLOTS[S.level];
      for(let L=1;L<=9;L++){
        const lv=S.spellLevels[L];
        lv.total=slots[L-1]||0;
        lv.used=Math.min(lv.used,lv.total);
      }
    }
    notes.push(`${c.name} ${S.level}: proficiency +${S.profBonus}, hit dice ${S.hdTotal}, ${c.saves.map(k=>AB_NAMES[k].slice(0,3).toUpperCase()).join('/')} saves`+
      (c.cast?`, ${c.name==='Warlock'?'pact magic':'spell'} slots set (${AB_NAMES[c.ab]})`:''));
  }
  const ri=raceInfo();
  if(ri){
    const spd=(ri.sub&&ri.sub.speed)||ri.r.speed;
    S.speed=spd+' ft.';
    // Darkvision range: subrace overrides the race default (e.g. Drow 120 ft. vs. base Elf 60 ft.);
    // races with no "dark" field at all (Human, Halfling, Dragonborn...) have no darkvision.
    const dv=(ri.sub&&ri.sub.dark!=null)?ri.sub.dark:(ri.r.dark||0);
    S.vision = dv>0 ? dv+' ft.' : 'None';
    const bs=ABILITIES.filter(([k])=>racialBonus(k)>0).map(([k])=>`+${racialBonus(k)} ${AB_NAMES[k].slice(0,3).toUpperCase()}`);
    notes.push(`${(ri.sub&&ri.sub.name)||ri.r.name}: ${spd} ft.${ri.r.move?' ('+ri.r.move+')':''}${dv>0?', darkvision '+dv+' ft.':''}${bs.length?', '+bs.join(' '):''}`+
      (flexCount()>0&&S.flexBonus.filter(Boolean).length<flexCount()?' — pick your bonus abilities above!':''));
  }
  $('#buildNote').textContent=notes.join('  ·  ')||'Choose a class and level to auto-set proficiency, hit dice, saving throws and spell slots. Choose a race for speed and ability bonuses.';
  renderAsi(); renderSaves(); renderSpellLevels(); syncBound(); recalc(); save();
}

function wireBuild(){
  $('#classSel').addEventListener('change',e=>{ S.classId=e.target.value; applyBuild(); });
  $('#levelIn').addEventListener('change',e=>{
    S.level=Math.max(1,Math.min(20,num(e.target.value)||1));
    e.target.value=S.level; applyBuild();
  });
  $('#raceSel').addEventListener('change',e=>{
    S.raceId=e.target.value; S.subraceId=''; S.flexBonus=['',''];
    renderSubraceAndFlex(); applyBuild();
  });
  $('#subraceSel').addEventListener('change',e=>{
    S.subraceId=e.target.value; S.flexBonus=['',''];
    renderSubraceAndFlex(); applyBuild();
  });
  [0,1].forEach(i=>$('#flex'+i).addEventListener('change',e=>{
    S.flexBonus[i]=e.target.value;
    renderSubraceAndFlex(); applyBuild();
  }));
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
    const notes=['Short rest taken.'];
    if(CLASSES[S.classId]&&CLASSES[S.classId].cast==='pact'){
      S.spellLevels.forEach(lv=>lv.used=0);
      notes.push('Pact magic slots restored.');
    }
    let combatRestored=0;
    S.features.forEach(f=>{ if(f.combat && num(f.usesMax)>0 && f.usesPer!=='long'){ f.usesUsed=0; combatRestored++; } });
    if(combatRestored) notes.push(`${combatRestored} combat feature${combatRestored>1?'s':''} recharged.`);
    notes.push('Spend hit dice (− button above) to heal: roll the die + CON mod.');
    $('#restNote').textContent=notes.join(' ');
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
    $('#restNote').textContent=`Long rest: HP restored, all spell slots back, regained ${regained} hit dice, death saves cleared, combat features recharged.`;
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
function suggestSourceFor(el){
  if(!el||el.tagName!=='INPUT') return null;
  if(el.id==='subclassIn') return subclassNamesForClass(S.classId);
  if(el.dataset&&el.dataset.asifeat!=null) return FEATS;
  return null;
}
let SUG_SILENT=false, SUG_POP=null; // SUG_POP: the one open popover, tagged with ._inputEl
function positionSuggest(inp,p){
  const r=inp.getBoundingClientRect();
  const width=Math.max(r.width,240);
  const left=Math.max(8,Math.min(r.left,window.innerWidth-8-width));
  p.style.left=left+'px';
  p.style.top=(r.bottom+4)+'px';
  p.style.width=width+'px';
}
function closeSuggest(){
  if(!SUG_POP) return;
  SUG_POP.remove(); SUG_POP=null;
  window.removeEventListener('scroll',repositionSuggest,true);
  window.removeEventListener('resize',repositionSuggest);
}
function repositionSuggest(){
  if(!SUG_POP) return;
  // The field this popover belongs to may have scrolled away or been re-rendered out from
  // under it (e.g. choosing a different ASI option rebuilds the panel) — bail cleanly rather
  // than position a dropdown that no longer has anything to anchor to.
  if(!SUG_POP._inputEl.isConnected) return closeSuggest();
  positionSuggest(SUG_POP._inputEl,SUG_POP);
}
function renderSuggest(inp){
  const src=suggestSourceFor(inp); if(!src) return;
  if(!SUG_POP||SUG_POP._inputEl!==inp){
    closeSuggest();
    SUG_POP=document.createElement('div');
    SUG_POP.className='lib-results sug-results open';
    SUG_POP._inputEl=inp;
    document.body.appendChild(SUG_POP);
    window.addEventListener('scroll',repositionSuggest,true);
    window.addEventListener('resize',repositionSuggest);
  }
  const q=inp.value.trim().toLowerCase();
  const items=src.filter(n=>!q||n.toLowerCase().includes(q));
  SUG_POP.innerHTML=(items.length?items.slice(0,50).map(n=>`<div class="item" data-sugpick="${esc(n)}">${esc(n)}</div>`).join(''):'')
    +((!items.length||(q&&!src.some(n=>n.toLowerCase()===q)))
      ?`<div class="empty">${items.length?'':'No matches — '}free text works too</div>`:'');
  positionSuggest(inp,SUG_POP);
}
function wireSuggest(){
  document.addEventListener('focusin',e=>{ if(suggestSourceFor(e.target)) renderSuggest(e.target); });
  document.addEventListener('input',e=>{ if(!SUG_SILENT&&suggestSourceFor(e.target)) renderSuggest(e.target); });
  document.addEventListener('click',e=>{
    const pick=e.target.closest('[data-sugpick]');
    if(pick&&SUG_POP){
      const inp=SUG_POP._inputEl;
      inp.value=pick.dataset.sugpick;
      // Fire the input event so data-bind / renderAsi listeners update state, but flag it so
      // our own delegated handler doesn't immediately reopen the list we're closing.
      SUG_SILENT=true;
      inp.dispatchEvent(new Event('input',{bubbles:true}));
      SUG_SILENT=false;
      closeSuggest();
      return;
    }
    if(SUG_POP && !e.target.closest('.sug-results') && e.target!==SUG_POP._inputEl) closeSuggest();
  });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&SUG_POP) closeSuggest(); });
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
  renderSpellLevels(); renderOverviewQuick(); renderCombatFeatures(); renderLanguages();
  renderBuildSelectors(); renderAsi(); renderHudControls();
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
initRoster();
load();
buildShell();
renderAll();
wireAddButtons(); wireHpButtons(); wireSettings(); wireCharSelect(); wireSelectSheets(); wireSuggest(); wireBuild(); wireLibrary(); wireRaceLibrary(); wireLanguages(); wireFeaturesLock(); wireHud(); wireRest(); wireSkillFx(); wireCombatFeatures(); wireCombatSlots(); wireSpellDetails(); wireSpellLibrary(); wireWeaponSearch(); wireItemLibrary();
showTab('overview');
// With a real choice to make (2+ heroes), boot lands on the roster; with one, straight to play.
if(ROSTER.list.length>1) openCharSelect();

