// UI language overlay (Hebrew). Loads after i18n-he.js and before app.js.
//
// The app itself is written in English and never knows about this file: in Hebrew mode a
// MutationObserver swaps English UI text for the Hebrew in I18N_HE as it appears in the DOM
// (buttons, labels, placeholders, tooltips, dialogs, toasts — the app rebuilds its HTML in a lot of
// places, so a one-shot pass would go stale at once). Anything with no entry just stays English, so
// the dictionary can grow a piece at a time. Spells, features, race traits and backgrounds have
// entries (i18n-he-spells.js / i18n-he-features.js); items, weapons and languages do not — and since
// only exact strings match, text the player typed or edited is never touched. The page itself is
// mirrored to right-to-left (see dirBox below).
//
// English mode installs nothing at all: no observer, no work. The only global effects are the
// I18N object and the preference key below.
//
// The language is a UI-only preference like wide mode: its own localStorage key, never part of a
// character sheet or an export. It is switched from Settings or the character-select screen
// (wireLanguage in app.js), which saves, stores the key and reloads — so there is never a
// half-translated page to undo.
const LANG_KEY='dnd5e-binder-lang-v1';
const LANG_RELOAD_KEY='dnd5e-binder-lang-reload';
const I18N=(function(){
  let lang='en';
  try{ if(localStorage.getItem(LANG_KEY)==='he') lang='he'; }catch(e){}

  const api={
    lang,
    t:s=>s,
    missing:()=>[],
    missingSkeleton:()=>'',
    // `from` names the screen the switch was made on ('settings' or 'chars'), so the reload can
    // put the user back there.
    setLang(next,from){
      try{
        localStorage.setItem(LANG_KEY,next==='he'?'he':'en');
        sessionStorage.setItem(LANG_RELOAD_KEY,from||'settings');
      }catch(e){}
      location.reload();
    },
    // Once after a language switch's reload: the screen it was made on ('settings' / 'chars'), so boot
    // reopens that instead of what it would normally show. '' otherwise.
    consumeReload(){
      try{
        const v=sessionStorage.getItem(LANG_RELOAD_KEY);
        if(v){ sessionStorage.removeItem(LANG_RELOAD_KEY); return v==='1'?'settings':v; }
      }catch(e){}
      return '';
    },
  };
  if(lang!=='he'||typeof I18N_HE==='undefined') return api;

  const norm=s=>s.replace(/\s+/g,' ').trim();
  const DICT=new Map();
  for(const k in I18N_HE) DICT.set(norm(k),I18N_HE[k]);
  const RX=typeof I18N_HE_RX!=='undefined'?I18N_HE_RX:[];
  // Strings that are meant to stay as they are (credits, proper names): not reported as missing.
  const KEEP=new Set((typeof I18N_HE_KEEP!=='undefined'?I18N_HE_KEEP:[]).map(norm));
  const LATIN=/[A-Za-z]{2}/;
  const HEB=/[\u0590-\u05FF]/;
  // Everything this file has produced. A translation is itself a DOM change the observer sees, so
  // it must never be treated as new English (or reported as "missing").
  const OUT=new Set();
  const MISS=new Map();
  // Inside Hebrew text, each run of Latin/number text ("1d4+4", "Bard 6", "+1 DEX +2 CHA") becomes an
  // LTR island, so it stays in one piece and "+2" / "30 ft." don't flip. The island stops at its last
  // letter/digit, leaving the sentence's own punctuation outside it.
  // Parentheses stay balanced: an island never keeps a "(" or ")" whose partner is outside it, or
  // the paragraph's mirroring and the island's own would disagree and double the bracket up.
  const ISLAND=/\(?(?:[A-Za-z0-9+\u2212][A-Za-z0-9+\u2212.,'’\/()×·→%&:\-\s]*[A-Za-z0-9)%]|[A-Za-z0-9])/g;
  const parenBalance=x=>{ let d=0; for(const c of x){ if(c==='(') d++; else if(c===')') d--; } return d; };
  const isolate=s=>!HEB.test(s)?s:s.replace(ISLAND,t=>{
    let pre='',post='';
    if(t[0]==='('&&parenBalance(t)>0){ pre='('; t=t.slice(1); }
    while(t.endsWith(')')&&parenBalance(t)<0){ post=')'+post; t=t.slice(0,-1); }
    return t?pre+'\u2066'+t+'\u2069'+post:pre+post;
  });

  // Defense in depth for the patterns. A long English sentence that is game data — a feature, spell,
  // race, background or rules description — is never run through them, however it happens to start.
  // (The dictionary's exact entries are unaffected: those are deliberate, whole-string matches.)
  const PROSE=new Set();
  (function(){
    const seen=new Set();
    const take=s=>{ if(s.length>=28&&s.split(' ').length>=5) PROSE.add(norm(s)); };
    const walk=(o,d)=>{
      if(o==null||d>5) return;
      if(typeof o==='string'){ take(o); return; }
      if(typeof o!=='object'||seen.has(o)) return;
      seen.add(o);
      for(const k in o) walk(o[k],d+1);
    };
    // typeof guards: a global that isn't there yet (or was renamed) just contributes nothing.
    walk(typeof FEATURE_LIB!=='undefined'?FEATURE_LIB:null,0);
    walk(typeof RACE_LIB!=='undefined'?RACE_LIB:null,0);
    walk(typeof BACKGROUND_LIB!=='undefined'?BACKGROUND_LIB:null,0);
    walk(typeof BACKGROUNDS!=='undefined'?BACKGROUNDS:null,0);
    walk(typeof SPELL_DB!=='undefined'?SPELL_DB:null,0);
    walk(typeof RULES_DB!=='undefined'?RULES_DB:null,0);
    walk(typeof ITEM_RAW!=='undefined'?ITEM_RAW:null,0);
    walk(typeof CLASS_FLAVOR!=='undefined'?CLASS_FLAVOR:null,0);
  })();

  let depth=0;
  function lookup(core,exact){
    if(OUT.has(core)) return null;
    let r=DICT.get(core);
    if(r!==undefined) return r;
    if(exact||depth>3||PROSE.has(core)) return null;
    depth++;
    try{
      for(let i=0;i<RX.length;i++){
        const m=RX[i][0].exec(core);
        if(m){ const o=RX[i][1](m,tr,has); if(o!=null) return o; }
      }
    }finally{ depth--; }
    // A spell's meta line is stored as "<time> · <range> · <duration>" and shown whole or in parts.
    // Translate it only when EVERY part translates, so a hand-edited line is never half-rewritten.
    // A part with no letters ("1", "⚔ 3" — the level in a library row "1 · Favored Enemy") passes through.
    if(core.indexOf(' · ')>0){
      const parts=core.split(' · '), out=[];
      let words=0;
      depth++;
      try{
        for(const p of parts){
          if(!/[A-Za-z]/.test(p)){ out.push(p); continue; }
          const t=lookup(p); if(t==null) return null; out.push(t); words++;
        }
      }
      finally{ depth--; }
      return words?out.join(' · '):null;
    }
    return null;
  }
  // For patterns that only accept known vocabulary: does this piece have a translation?
  function has(s){ return lookup(norm(String(s)))!=null; }
  // Handed to patterns so they can translate the pieces they capture (a skill name, a stat…). A piece
  // with no entry is reported as missing, so English left inside an otherwise translated sentence
  // ("בחר Path") shows up in I18N.missing() too (a game name captured this way is noise there).
  function tr(s){
    const key=norm(String(s)), r=lookup(key);
    if(r==null){ miss(key); return s; }
    return r;
  }
  // Finished translation of one whole string, or null when there isn't one. `exact` skips the
  // patterns (used for context-keyed entries, whose key isn't real text).
  function translate(core,exact){
    let r=lookup(core,exact);
    if(r==null){
      if(exact) return null;   // a context key ("bPill|STR") is not text
      // No entry, but a short UI line built around ability abbreviations ("+2 CHA", "Dex +0",
      // "STR/DEX") still reads in Hebrew once they're written out.
      const a=abFull(core);
      if(a===core) return null;
      r=a;
    }
    else r=abFull(r);
    const out=isolate(r);
    OUT.add(norm(out));
    return out;
  }
  // Ability abbreviations are written out in full in Hebrew ("CHA" → "כריזמה"). Not where they are
  // formula tokens — anything mentioning PROF or LVL is formula help or a formula ("8+PROF+STR"), and
  // the formula fields only understand the Latin tokens — and not inside English prose, which would
  // come out half-translated. Title-case forms ("Dex") only next to a number ("Dex +0", "+2 Wis"),
  // so an ordinary word like "Con" in a name is left alone.
  const AB_HE={STR:'כוח',DEX:'זריזות',CON:'חוסן',INT:'אינטליגנציה',WIS:'חוכמה',CHA:'כריזמה'};
  const AB_UP=/\b(STR|DEX|CON|INT|WIS|CHA)\b/g;
  const AB_TC=/\b(Str|Dex|Con|Int|Wis|Cha)\b(?=\s*[+\-−±]?\d)|(?<=[+\-−±]?\d\s*)\b(Str|Dex|Con|Int|Wis|Cha)\b/g;
  const ENGLISH_PROSE=/\b[a-z]{2,}\s+[a-z]{2,}\s+[a-z]{2,}\b/;
  function abFull(s){
    if(!/[A-Z][A-Za-z]{2}/.test(s)||/\b(PROF|LVL)\b/.test(s)||ENGLISH_PROSE.test(s.replace(/[֐-׿]+/g,' '))) return s;
    return s.replace(AB_UP,m=>AB_HE[m]).replace(AB_TC,m=>AB_HE[m.toUpperCase()]);
  }
  // Only a string with a real word is reported as missing: "STR +0" or "d8 5 +3 CON =" need no Hebrew.
  const ABBR=new Set(['Str','Dex','Con','Int','Wis','Cha','Prof','Lvl']);
  const hasWord=s=>(s.match(/[A-Za-z]{3,}/g)||[]).some(w=>!/^[A-Z]+$/.test(w)&&!ABBR.has(w));
  // (A string that already holds Hebrew was put together from translated pieces, or typed that way.)
  function miss(core){
    if(hasWord(core)&&!HEB.test(core)&&!OUT.has(core)&&!KEEP.has(core)) MISS.set(core,(MISS.get(core)||0)+1);
  }

  // In Hebrew the whole page is laid out right-to-left (<html dir="rtl">, and styles.css uses logical
  // properties, so every margin/border/inset follows). Text the page shows in English — game data
  // with no translation yet, what the player typed — still reads left-to-right, and left in an RTL
  // box an English sentence gets its punctuation on the wrong end. dir="auto" lets a text box take
  // its direction from its own text. It goes only on text boxes — elements whose children are all
  // inline — never on a layout container, because dir also mirrors flex/grid rows and would flip the
  // icon/label order of every button.
  const BOXED=new WeakSet();
  function dirBox(node){
    let el=node.parentElement;
    while(el&&el!==document.body&&getComputedStyle(el).display==='inline') el=el.parentElement;
    if(!el||el===document.body||BOXED.has(el)||el.hasAttribute('dir')) return;
    BOXED.add(el);
    // An element with only text in it is always safe (a flex chip holding one text node has nothing to
    // mirror). One with child elements must be a plain block whose children are all inline.
    if(el.children.length){
      const d=getComputedStyle(el).display;
      if(d.indexOf('flex')>=0||d.indexOf('grid')>=0||(d.indexOf('table')>=0&&d.indexOf('cell')<0)) return;
      for(const c of el.children){
        const cd=getComputedStyle(c).display;
        if(cd!=='inline'&&cd!=='inline-block'&&cd!=='none') return;
      }
    }
    // "auto" follows the first strong letter. A line that opens with an English name but is mostly
    // Hebrew ("Bard 6: מיומנות +3, …") would then read left-to-right and scramble, so force RTL.
    const t=el.textContent;
    const heb=(t.match(/[\u0590-\u05FF]/g)||[]).length, lat=(t.match(/[A-Za-z]/g)||[]).length;
    el.setAttribute('dir',heb>lat&&/^[^\u0590-\u05FFA-Za-z]*[A-Za-z]/.test(t)?'rtl':'auto');
  }

  // A bare number with a sign or symbol ("+4", "-10", "±0", "+2 / 3") in the RTL page would show its
  // sign on the wrong side ("4+"); an LTR island keeps it as typed. Text only — no alignment changes.
  const NUMERIC=/^[\s\d+\-−±.,\/×%():]*\d[\s\d+\-−±.,\/×%():]*$/;
  function txt(node){
    const v=node.nodeValue;
    if(v&&NUMERIC.test(v)&&/[^\d\s]/.test(v)&&v.indexOf('⁦')<0){
      const m=/^(\s*)([\s\S]*?)(\s*)$/.exec(v);
      node.nodeValue=m[1]+'⁦'+m[2]+'⁩'+m[3];
      return;
    }
    if(!v||!LATIN.test(v)) return;
    const m=/^(\s*)([\s\S]*?)(\s*)$/.exec(v);
    const core=norm(m[2]);
    if(!core) return;
    // An entry keyed "<first class of the parent>|<text>" wins over the plain one, for a word that
    // means something else elsewhere (the weapon tag "Light" vs the cantrip Light).
    const p=node.parentElement;
    let r=p&&p.classList.length?translate(p.classList[0]+'|'+core,true):null;
    if(r==null) r=translate(core);
    if(r==null){
      miss(core);
      // A lone English word or name reads fine right-aligned in an RTL box; a sentence, or anything
      // that opens or closes on punctuation ("Bonds.", "Radiant Soul (3rd level)"), needs its own LTR.
      if(core.split(' ').length>=4||/^[^A-Za-z0-9]|[^A-Za-z0-9]$/.test(core)) dirBox(node);
      return;
    }
    node.nodeValue=m[1]+r+m[3];
    if(HEB.test(r)) dirBox(node);
  }
  const ATTRS=['placeholder','title','aria-label','alt','data-placeholder','label'];
  function attr(el,name){
    if(name==='label'&&el.tagName!=='OPTION'&&el.tagName!=='OPTGROUP') return;
    const v=el.getAttribute(name);
    if(!v||!LATIN.test(v)) return;
    const core=norm(v);
    const r=translate(core);
    if(r==null){ miss(core); return; }
    el.setAttribute(name,r);
  }
  function attrs(el){
    if(!el.attributes||!el.attributes.length) return;
    for(let i=0;i<ATTRS.length;i++) if(el.hasAttribute(ATTRS[i])) attr(el,ATTRS[i]);
  }

  // Editable fields holding untouched library text — a feature's name and description on the
  // unlocked Features tab, the class name it's filed under — show the Hebrew instead. Only the
  // field's displayed value changes: S keeps the English until the player actually types there
  // (these fields write to S on 'input'/'change' only), and from then on the text is theirs.
  // Only exact game-data strings qualify, never something the player wrote.
  // Feature fields only: features are tracked by source.grantKey, so an edited Hebrew title just makes
  // the feature the player's own. Spell rows are NOT included — the app finds a spell's data by its
  // English name (SPELL_DB) and reads its English description for the save/attack chips, so a spell
  // edited in Hebrew would lose both.
  const FIELD='input[data-li^="features."],textarea[data-li^="features."],input[data-srcname]';
  const GAME=new Set();
  (function(){
    const add=s=>{ if(typeof s==='string'&&s) GAME.add(norm(s)); };
    const each=(o,f)=>{ if(o) (Array.isArray(o)?o:Object.values(o)).forEach(f); };
    each(typeof FEATURE_LIB!=='undefined'?FEATURE_LIB:null,e=>{ add(e.n); add(e.d); add(e.g); (e.g||'').split(' — ').forEach(add); });
    each(typeof RACE_LIB!=='undefined'?RACE_LIB:null,e=>{ add(e.n); add(e.d); add(e.g); });
    each(typeof BACKGROUND_LIB!=='undefined'?BACKGROUND_LIB:null,e=>{ add(e.n); add(e.d); add(e.g); });
    each(typeof SPELL_DB!=='undefined'?SPELL_DB:null,s=>{ add(s.n); add(s.d); });
    each(typeof CLASSES!=='undefined'?CLASSES:null,c=>add(c.name));
    each(typeof RACES!=='undefined'?RACES:null,r=>{ add(r.name); each(r.subs,s=>add(s.name)); });
    each(typeof BACKGROUNDS!=='undefined'?BACKGROUNDS:null,b=>add(b.name));
    each(typeof WEAPONS!=='undefined'?WEAPONS:null,w=>add(w.n));
  })();
  function field(el){
    const v=el.value;
    if(!v||!LATIN.test(v)) return;
    const core=norm(v);
    if(!GAME.has(core)) return;
    const r=DICT.get(core);
    if(r==null) return;
    el.value=r;
    // A description textarea was already grown to fit the English.
    if(el.tagName==='TEXTAREA'&&el.style.height){ el.style.height='auto'; el.style.height=el.scrollHeight+'px'; }
  }
  // Elements as the walk meets them. A textarea's own text is never touched (see SKIP), but its
  // placeholder/tooltip are UI text, and a [data-li] one may hold library text (field above).
  function elem(el){
    attrs(el);
    if(el.matches(FIELD)) field(el);
  }

  // Never translate inside: a contenteditable (the backstory editor reads its innerText straight
  // into the saved sheet), a textarea, or anything marked translate="no" (the Language row itself).
  // Also skipped: containers that show game data we have NOT translated (items, languages,
  // proficiencies), so a UI word that happens to equal one never rewrites it. Spells, features, weapons, race
  // traits and backgrounds are translated now (i18n-he-*.js), so their names and descriptions are
  // NOT skipped: an entry with a translation shows it, one without stays English.
  const SKIP='[contenteditable]:not([contenteditable="false"]),[translate="no"],textarea,script,style,noscript,'
    +'.eq-card-name,[data-langpick],[data-profpick],'
    +'#itemIndexList,#packModalList';
  const skipped=el=>!!(el&&el.closest&&el.closest(SKIP));
  const isTextarea=el=>el.tagName==='TEXTAREA'&&!el.closest('[translate="no"]');
  function tree(root){
    if(root.nodeType===3){ if(!skipped(root.parentElement)) txt(root); return; }
    if(root.nodeType!==1) return;
    if(skipped(root)){ if(isTextarea(root)) elem(root); return; }
    elem(root);
    const w=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT,{
      acceptNode:n=>{
        if(n.nodeType===1&&n.matches(SKIP)){ if(isTextarea(n)) elem(n); return NodeFilter.FILTER_REJECT; }
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    let n;
    while((n=w.nextNode())){ if(n.nodeType===3) txt(n); else elem(n); }
  }

  api.t=function(s){
    const core=norm(String(s));
    const r=translate(core);
    return r==null?s:r;
  };
  api.missing=()=>[...MISS.entries()].sort((a,b)=>b[1]-a[1]||(a[0]<b[0]?-1:1)).map(e=>e[0]);
  // Paste-ready dictionary lines for whatever is still untranslated: copy(I18N.missingSkeleton())
  api.missingSkeleton=()=>api.missing().map(k=>'  '+JSON.stringify(k)+': \'\',').join('\n');

  document.documentElement.lang='he';
  document.documentElement.dir='rtl';
  document.body.classList.add('lang-he');
  new MutationObserver(recs=>{
    for(const r of recs){
      if(r.type==='childList') r.addedNodes.forEach(tree);
      else if(r.type==='characterData'){ if(!skipped(r.target.parentElement)) txt(r.target); }
      else if(!skipped(r.target)||isTextarea(r.target)) attr(r.target,r.attributeName);
    }
  }).observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:ATTRS});
  tree(document.body);

  // app.js rewrites document.title on every sheet render, and <title> sits outside <body>.
  const titleEl=document.querySelector('head > title');
  const retitle=()=>{
    const v=document.title;
    if(!v||!LATIN.test(v)) return;
    const r=translate(norm(v));
    if(r!=null&&r!==v) document.title=r;
  };
  if(titleEl) new MutationObserver(retitle).observe(titleEl,{childList:true,characterData:true,subtree:true});
  retitle();

  return api;
})();
