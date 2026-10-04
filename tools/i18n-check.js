#!/usr/bin/env node
// Dev-only helper for translating the GAME DATA (spells, features, race traits…) into Hebrew.
// The app never loads this. Run from the repo root:
//
//   node tools/i18n-check.js                      coverage + validation summary (exit 1 on errors)
//   node tools/i18n-check.js -v                   ...and list every problem
//   node tools/i18n-check.js --todo spells:0      next untranslated spells of level 0 (name + description)
//   node tools/i18n-check.js --todo features:Bard --limit 40
//   node tools/i18n-check.js --groups             list the groups available to --todo
//   node tools/i18n-check.js --glossary           the rules glossary as a markdown table (for review)
//
// What "accurate" means here, mechanically: every translated entry is compared with its English
// source for the things that are easy to get wrong and expensive to get wrong at the table —
// numbers and dice, damage types, conditions, ability names, number words (two, half, twice…),
// the glossary terms in tools/i18n-terms.js, and any English left over. It cannot judge style;
// that is still a human's call.
const fs=require('fs'), path=require('path'), vm=require('vm');
const ROOT=path.join(__dirname,'..');
const args=process.argv.slice(2);
const flag=n=>args.includes(n), opt=n=>{ const i=args.indexOf(n); return i>=0?args[i+1]:null; };
const VERBOSE=flag('-v')||flag('--verbose');

// ---------- load the real data + dictionary files into one sandbox ----------
const ctx=vm.createContext({console});
const run=f=>vm.runInContext(fs.readFileSync(path.join(ROOT,f),'utf8'),ctx,{filename:f});
['data-classes-races.js','data-spells.js','data-rules.js','data-items.js','data-equipment.js','data-libraries.js','data-backgrounds.js','i18n-he.js']
  .forEach(run);
const dictFiles=fs.readdirSync(ROOT).filter(f=>/^i18n-he-.+\.js$/.test(f)).sort();
dictFiles.forEach(run);
const get=n=>vm.runInContext(n,ctx);
const HE=get('I18N_HE');
const CONFLICTS=get('typeof I18N_HE_CONFLICTS!=="undefined"?I18N_HE_CONFLICTS:[]');
const norm=s=>s.replace(/\s+/g,' ').trim();
const DICT=new Map(Object.keys(HE).map(k=>[norm(k),HE[k]]));
const TERMS=require('./i18n-terms.js');

// ---------- what needs translating ----------
// An "item" is one English string, with the entries (kind + group) that show it.
const items=new Map();
function add(kind,group,field,en){
  if(!en||typeof en!=='string') return;
  const key=norm(en);
  if(!items.has(key)) items.set(key,{en:key,uses:[]});
  items.get(key).uses.push({kind,group,field});
}
const SPELLS=Object.values(get('SPELL_DB'));
SPELLS.forEach(s=>{ const g=String(s.lv); add('spells',g,'name',s.n); add('spells',g,'desc',s.d); });
get('FEATURE_LIB').forEach(e=>{ const g=e.g.split(' — ')[0]; add('features',g,'name',e.n); add('features',g,'desc',e.d); });
get('RACE_LIB').forEach(e=>{ add('races',e.g,'name',e.n); add('races',e.g,'desc',e.d); });
get('BACKGROUND_LIB').forEach(e=>{ add('backgrounds',e.g,'name',e.n); add('backgrounds',e.g,'desc',e.d); });
const T=(o)=>Object.values(o).forEach(v=>add('spell-facts','tables','name',v));
T(get('SP_SCHOOL')); T(get('SP_TIME')); T(get('SP_DUR'));

const kinds=[...new Set([...items.values()].flatMap(i=>i.uses.map(u=>u.kind)))];
const groupsOf=k=>[...new Set([...items.values()].flatMap(i=>i.uses.filter(u=>u.kind===k).map(u=>u.group)))];

if(flag('--groups')){
  kinds.forEach(k=>console.log(k.padEnd(12),groupsOf(k).join(' | ')));
  process.exit(0);
}
if(flag('--glossary')){
  console.log('| Hebrew term | English trigger | must contain |\n|---|---|---|');
  TERMS.forEach(t=>console.log(`| ${t.say} | \`${t.en.source.replace(/\|/g,'\\|')}\` | \`${t.has.source.replace(/\|/g,'\\|')}\` |`));
  process.exit(0);
}

// ---------- --character <exported .json> ----------
// "Translate only what this player actually uses": lists the English text on a saved character that has
// no Hebrew yet — feature cards, spells (name / description / meta line), items — and flags the ones
// whose stored text is an OLDER VERSION of the library entry (the sheet keeps a copy of the description
// from the day the spell/feature was picked, and the library has been edited since). Those need their own
// dictionary entry, written to match the library translation.
if(opt('--character')){
  const S=JSON.parse(fs.readFileSync(path.resolve(opt('--character')),'utf8'));
  const libSpell=new Map(SPELLS.map(s=>[s.n.toLowerCase(),s]));
  const libFeat=new Map(); get('FEATURE_LIB').concat(get('RACE_LIB'),get('BACKGROUND_LIB')).forEach(e=>{ (libFeat.get(e.n.toLowerCase())||libFeat.set(e.n.toLowerCase(),[]).get(e.n.toLowerCase())).push(e); });
  const rows=[]; const seenKey=new Set();
  const want=(what,en,lib)=>{
    if(!en||typeof en!=='string') return; const k=norm(en);
    if(!/[A-Za-z]{3}/.test(k)||DICT.has(k)||seenKey.has(k)) return;
    if(/ · /.test(k)&&k.split(' · ').every(p=>DICT.has(p)||/^\d+ ft$/.test(p)||/^Self \d+ft/.test(p)||/^\d+ miles?$/.test(p)||/ \(Ritual\)$/.test(p))) return; // composed meta line
    seenKey.add(k); rows.push({what,en:k,lib});
  };
  (S.features||[]).forEach(f=>{
    const cands=libFeat.get((f.title||'').toLowerCase())||[];
    want('feature name',f.title);
    const same=cands.some(c=>norm(c.d||'')===norm(f.desc||''));
    want(same||!cands.length?'feature text':'feature text — OLDER/EDITED VERSION of the library entry',f.desc,same||!cands.length?null:cands[0].d);
  });
  (S.spellLevels||[]).forEach((L,i)=>(L.spells||[]).forEach(sp=>{
    const lib=libSpell.get((sp.name||'').toLowerCase());
    want('spell name',sp.name);
    const same=lib&&norm(lib.d||'')===norm(sp.desc||'');
    want(!lib||same?'spell text':'spell text — OLDER/EDITED VERSION of the library entry',sp.desc,lib&&!same?lib.d:null);
    want('spell meta line',sp.meta);
  }));
  (S.equipment||[]).forEach(e=>{ want('item name',e.name); want('item text',e.desc); });
  (S.attacks||[]).forEach(a=>want('attack name',a.name));
  (S.customCards||[]).forEach(c=>{ want('custom card',c.name); want('custom card text',c.text||c.note); });
  console.log(`# ${rows.length} English strings on this character still have no Hebrew (${path.basename(opt('--character'))})`);
  rows.forEach((r,i)=>{ console.log(`${i+1}. [${r.what}] ${r.en}`); if(r.lib) console.log(`      library now says: ${norm(r.lib)}`); });
  process.exit(0);
}

// ---------- --todo kind:group ----------
if(opt('--todo')){
  const [k,g]=opt('--todo').split(':');
  const limit=+(opt('--limit')||40);
  // pair names with their descriptions per entry, in source order, skipping what's already done
  let rows=[];
  const seen=new Set();
  const push=(name,desc)=>{
    const nk=name&&norm(name), dk=desc&&norm(desc);
    const needN=nk&&!DICT.has(nk)&&!seen.has('n|'+nk), needD=dk&&!DICT.has(dk)&&!seen.has('d|'+dk);
    if(!needN&&!needD) return;
    if(needN) seen.add('n|'+nk); if(needD) seen.add('d|'+dk);
    rows.push({name:needN?nk:null,desc:needD?dk:null,knownName:needN?null:(DICT.get(nk)||nk)});
  };
  if(k==='spells') SPELLS.filter(s=>String(s.lv)===g).forEach(s=>push(s.n,s.d));
  else if(k==='features') get('FEATURE_LIB').filter(e=>e.g.split(' — ')[0]===g||e.g===g).forEach(e=>push(e.n,e.d));
  else if(k==='races') get('RACE_LIB').filter(e=>e.g===g).forEach(e=>push(e.n,e.d));
  else if(k==='backgrounds') get('BACKGROUND_LIB').filter(e=>e.g===g).forEach(e=>push(e.n,e.d));
  else { console.error('unknown kind',k); process.exit(2); }
  console.log(`# ${rows.length} entries still to do in ${k}:${g}${rows.length>limit?` (showing ${limit})`:''}`);
  rows.slice(0,limit).forEach((r,i)=>{
    console.log(`${i+1}. ${r.name||'(name done: '+r.knownName+')'}${r.desc?'\n   '+r.desc:''}`);
  });
  process.exit(0);
}

// ---------- validation ----------
// The six abilities, damage types and conditions are read from the UI dictionary so there is one
// Hebrew word for each across the whole app.
const ui=k=>DICT.get(k)||null;
const DAMAGE=['Acid','Cold','Fire','Force','Lightning','Necrotic','Poison','Psychic','Radiant','Thunder','Bludgeoning','Piercing','Slashing'];
const AMBIGUOUS=new Set(['Cold','Fire','Force','Poison']); // need "damage/resistance/immunity" next to them to count
const CONDITIONS=['Blinded','Charmed','Deafened','Frightened','Grappled','Incapacitated','Invisible','Paralyzed','Petrified','Poisoned','Prone','Restrained','Stunned','Unconscious','Exhaustion'];
const ABIL={Str:'Strength',Dex:'Dexterity',Con:'Constitution',Int:'Intelligence',Wis:'Wisdom',Cha:'Charisma'};
const stem=w=>w.length>4?w.slice(0,w.length-1):w; // lets plurals / inflections pass
const hasHe=(he,word)=>{ const w=ui(word); return !w||he.includes(stem(w))||he.includes(w); };

const NUMWORDS=[
  [/\btwo\b/i,/שני|שתי|שניים|שתיים|זוג|2/],[/\bthree\b/i,/שלוש|שלושה|3/],[/\bfour\b/i,/ארבע|ארבעה|4/],
  [/\bfive\b/i,/חמש|חמישה|5/],[/\bsix\b/i,/שש|שישה|6/],[/\bseven\b/i,/שבע|שבעה|7/],[/\beight\b/i,/שמונה|8/],
  [/\bnine\b/i,/תשע|תשעה|9/],[/\bten\b/i,/עשר|עשרה|10/],[/\btwice\b/i,/פעמיים|כפול|פי 2|פי שניים/],
  [/\bhalf\b/i,/חצי|מחצית|חצאי/],[/\bdouble(d)?\b/i,/כפול|הכפל|פי 2|פי שניים|כפליים/],[/\btriple(d)?\b/i,/משולש|פי 3|פי שלוש|שלוש/],
];
const ALLOW_LATIN=new Set(['STR','DEX','CON','INT','WIS','CHA','DC','HP','AC','PROF','LVL','PHB','DM','AoE','GP','SP','CP','EP','PP','NPC','XP','GM']);
const BIDI=/[\u200b-\u200f\u202a-\u202e\u2060-\u2069\ufeff]/;

function nums(s){ return (s.match(/\d+/g)||[]).slice().sort(); }
function validate(en,he){
  const out=[]; const err=m=>out.push({lv:'error',m}), warn=m=>out.push({lv:'warn',m});
  if(!he||!he.trim()) return [{lv:'error',m:'empty translation'}];
  if(he!==he.trim()) err('leading/trailing space');
  if(/  /.test(he)) warn('double space');
  if(BIDI.test(he)) err('invisible bidi/zero-width character in the text (write it as an escape, or remove it)');
  if(/\$\{|`/.test(he)||/\$\{|`/.test(en)) err('contains ${ or a backtick');
  if(norm(he)===norm(en)) { warn('identical to the English'); return out; }
  if(!/[\u0590-\u05FF]/.test(he)) err('no Hebrew letters');
  // numbers and dice: every digit group must survive. A lone "1" may legitimately become "אחד/אחת".
  // Hebrew writes 1 and 2 as words ("דקה אחת", "שעתיים" is the dual of "שעה"), so a missing 1 or 2 is
  // fine when the matching word is there. Anything else missing — or any number the Hebrew ADDS — is an error.
  const a=nums(en), b=nums(he);
  if(a.join()!==b.join()){
    const left=b.slice(), missing=[];
    for(const n of a){ const i=left.indexOf(n); if(i>=0) left.splice(i,1); else missing.push(n); }
    const word={'1':/אחד|אחת|יחיד|יחידה/,'2':/שני|שתי|שעתיים|יומיים|שבועיים|חודשיים|שנתיים|פעמיים|זוג|צמד/};
    const real=missing.filter(n=>!(word[n]&&word[n].test(he)));
    if(real.length||left.length) err(`numbers differ: EN [${a.join(' ')}] vs HE [${b.join(' ')}]`);
  }
  const dice=s=>(s.match(/\d*d\d+/gi)||[]).map(x=>x.toLowerCase()).sort().join();
  if(dice(en)!==dice(he)) err(`dice differ: EN [${dice(en)}] vs HE [${dice(he)}]`);
  // damage types
  for(const d of DAMAGE){
    const re=AMBIGUOUS.has(d)?new RegExp(`\\b${d}\\b(?= (damage|resistance|immunity|vulnerability))`,'i'):new RegExp(`\\b${d}\\b`,'i');
    if(re.test(en)&&!hasHe(he,d)) err(`damage type "${d}" → expected "${ui(d)}"`);
  }
  // conditions
  for(const c of CONDITIONS){ if(new RegExp(`\\b${c}\\b`,'i').test(en)&&!hasHe(he,c)) err(`condition "${c}" → expected "${ui(c)}"`); }
  // abilities (full name or the app's Str/Dex… shorthand)
  for(const [ab,full] of Object.entries(ABIL)){
    if(new RegExp(`\\b(${ab}|${full})\\b`).test(en)&&!(hasHe(he,full)||new RegExp(ab.toUpperCase()).test(he)||new RegExp(`\\b${ab}\\b`).test(he)))
      warn(`ability "${full}" not found in the Hebrew (expected "${ui(full)}")`);
  }
  for(const [rx,hr] of NUMWORDS){ if(rx.test(en)&&!hr.test(he)) warn(`number word ${rx} has no Hebrew counterpart`); }
  for(const t of TERMS){ if(t.en.test(en)&&!t.has.test(he)) warn(`term "${t.say}" expected (matched ${t.en})`); }
  // leftovers: Latin words that aren't dice or an allowed abbreviation
  const latin=(he.replace(/\d*d\d+/gi,' ').match(/[A-Za-z][A-Za-z'’-]{2,}/g)||[]).filter(w=>!ALLOW_LATIN.has(w));
  if(latin.length) warn(`English left over: ${[...new Set(latin)].join(', ')}`);
  const wc=s=>s.split(/\s+/).filter(Boolean).length, r=wc(he)/Math.max(1,wc(en));
  if(wc(en)>=6&&(r<0.45||r>2.2)) warn(`length ratio ${r.toFixed(2)} (words EN ${wc(en)} / HE ${wc(he)}) — something dropped or padded?`);
  if(/[.!?]$/.test(en)&&!/[.!?]$/.test(he)) warn('English ends with punctuation, Hebrew does not');
  return out;
}

// ---------- --review kind:group [--out file.html] ----------
// A page for proofreading: English on the left, Hebrew on the right (right-to-left), one row per
// entry, problems from the checker shown under the row. Open it in a browser; nothing to install.
if(opt('--review')){
  const [k,g]=opt('--review').split(':');
  const esc=x=>String(x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  let ents=[];
  if(k==='spells') ents=SPELLS.filter(s=>String(s.lv)===g).map(s=>({n:s.n,d:s.d}));
  else if(k==='features') ents=get('FEATURE_LIB').filter(e=>e.g.split(' — ')[0]===g||e.g===g).map(e=>({n:e.n,d:e.d,grp:e.g}));
  else if(k==='races') ents=get('RACE_LIB').filter(e=>e.g===g).map(e=>({n:e.n,d:e.d}));
  else if(k==='backgrounds') ents=get('BACKGROUND_LIB').filter(e=>e.g===g).map(e=>({n:e.n,d:e.d}));
  const cell=(en,he,bold)=>'<td class="en">'+(bold?'<b>':'')+esc(en||'')+(bold?'</b>':'')+'</td><td class="he" dir="rtl">'+(he?(bold?'<b>':'')+esc(he)+(bold?'</b>':''):'<i class="todo">— לא תורגם —</i>')+'</td>';
  const rows=ents.map(e=>{
    const hn=DICT.get(norm(e.n)), hd=e.d?DICT.get(norm(e.d)):null;
    const probs=[...(hn?validate(norm(e.n),hn):[]),...(hd?validate(norm(e.d),hd):[])];
    const pr=probs.length?'<div class="p">'+probs.map(p=>'<b class="'+p.lv+'">'+p.lv+'</b> '+esc(p.m)).join('<br>')+'</div>':'';
    return '<tr class="head">'+cell(e.n,hn,true)+'</tr>'+(e.d?'<tr>'+cell(e.d,hd,false)+'</tr>':'')+(pr?'<tr><td colspan="2">'+pr+'</td></tr>':'');
  }).join('\n');
  const done=ents.filter(e=>DICT.has(norm(e.n))&&(!e.d||DICT.has(norm(e.d)))).length;
  const css='body{font:15px/1.5 system-ui,Segoe UI,Arial;margin:0;background:#15110c;color:#e9ddc7}h1{font-size:1.1rem;padding:14px 18px;margin:0;position:sticky;top:0;background:#1f1913;border-bottom:1px solid #3e3427}table{border-collapse:collapse;width:100%}td{padding:6px 18px;vertical-align:top;width:50%}tr.head td{padding-top:16px;border-top:1px solid #3e3427;color:#e3c15c}td.en{color:#a3906f;direction:ltr}td.he{font-size:1.05rem}.todo{color:#c25;font-style:normal}.p{font-size:.85rem;padding-bottom:6px}.p .error{color:#ff7b6b}.p .warn{color:#e3c15c}';
  const html='<!doctype html><meta charset="utf-8"><title>Review '+k+':'+g+'</title><style>'+css+'</style><h1>'+esc(k+' · '+g)+' — '+done+' / '+ents.length+' translated</h1><table>'+rows+'</table>';
  const out=opt('--out')||path.join(ROOT,'tools','review',k+'-'+String(g).replace(/\W+/g,'_')+'.html');
  fs.mkdirSync(path.dirname(out),{recursive:true}); fs.writeFileSync(out,html);
  console.log('wrote',out,'('+done+'/'+ents.length+' entries translated)');
  process.exit(0);
}

// ---------- report ----------
let errors=0, warns=0; const problems=[];
const cov={}; // kind -> group -> {t,n}
for(const it of items.values()){
  const he=DICT.get(it.en);
  const done=he!=null;
  for(const u of it.uses){
    cov[u.kind]??={}; cov[u.kind][u.group]??={t:0,n:0};
    cov[u.kind][u.group].t++; if(done) cov[u.kind][u.group].n++;
  }
  if(done){
    validate(it.en,he).forEach(p=>{ (p.lv==='error'?errors++:warns++); problems.push({...p,en:it.en,he}); });
  }
}
// duplicates with different values (heAdd records them)
CONFLICTS.forEach(c=>{ errors++; problems.push({lv:'error',m:`conflicting translations for the same English text: "${c.old}" vs "${c.new}"`,en:c.key,he:c.new}); });

console.log('Dictionary files:','i18n-he.js,',dictFiles.join(', ')||'(none)','—',Object.keys(HE).length,'entries');
console.log('\nCoverage (distinct English strings; a name and a description count separately)');
for(const k of kinds){
  const gs=cov[k]; let T=0,N=0; for(const g of Object.values(gs)){ T+=g.t; N+=g.n; }
  console.log(`  ${k.padEnd(12)} ${String(N).padStart(5)} / ${String(T).padEnd(5)} ${(100*N/Math.max(1,T)).toFixed(0).padStart(3)}%`);
  if(VERBOSE||flag('--by-group')) for(const [g,v] of Object.entries(gs)) console.log(`      ${g.padEnd(28)} ${v.n}/${v.t}`);
}
const shown=VERBOSE?problems:problems.filter(p=>p.lv==='error');
console.log(`\nValidation: ${errors} error(s), ${warns} warning(s)${VERBOSE?'':' (run with -v to list warnings)'}`);
shown.forEach(p=>console.log(`  [${p.lv}] ${p.m}\n      EN: ${p.en.slice(0,150)}\n      HE: ${p.he.slice(0,150)}`));
process.exit(errors?1:0);
