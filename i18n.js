// UI language overlay (Hebrew). Loads after i18n-he.js and before app.js.
//
// The app itself is written in English and never knows about this file: in Hebrew mode a
// MutationObserver swaps English UI text for the Hebrew in I18N_HE as it appears in the DOM
// (buttons, labels, placeholders, tooltips, dialogs, toasts — the app rebuilds its HTML in a lot of
// places, so a one-shot pass would go stale at once). Anything with no entry just stays English, so
// the dictionary can grow a piece at a time. Game data (spells, features, items, class/race names…)
// is deliberately not translated — and since only exact UI strings match, text the player typed or
// edited is never touched.
//
// English mode installs nothing at all: no observer, no work. The only global effects are the
// I18N object and the preference key below.
//
// The language is a UI-only preference like wide mode: its own localStorage key, never part of a
// character sheet or an export. It is switched from the Settings dialog only (wireLanguage in app.js),
// which saves, stores the key and reloads — so there is never a half-translated page to undo.
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
    setLang(next){
      try{
        localStorage.setItem(LANG_KEY,next==='he'?'he':'en');
        sessionStorage.setItem(LANG_RELOAD_KEY,'1');
      }catch(e){}
      location.reload();
    },
    // True once after a language switch's reload, so boot can put the user back in Settings instead
    // of on the roster screen it would normally open for a multi-hero device.
    consumeReload(){
      try{ if(sessionStorage.getItem(LANG_RELOAD_KEY)){ sessionStorage.removeItem(LANG_RELOAD_KEY); return true; } }catch(e){}
      return false;
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
        if(m){ const o=RX[i][1](m,tr); if(o!=null) return o; }
      }
    }finally{ depth--; }
    return null;
  }
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
    const r=lookup(core,exact);
    if(r==null) return null;
    const out=isolate(r);
    OUT.add(norm(out));
    return out;
  }
  // Only a string with a real word is reported as missing: "STR +0" or "d8 5 +3 CON =" need no Hebrew.
  const ABBR=new Set(['Str','Dex','Con','Int','Wis','Cha','Prof','Lvl']);
  const hasWord=s=>(s.match(/[A-Za-z]{3,}/g)||[]).some(w=>!/^[A-Z]+$/.test(w)&&!ABBR.has(w));
  // (A string that already holds Hebrew was put together from translated pieces, or typed that way.)
  function miss(core){
    if(hasWord(core)&&!HEB.test(core)&&!OUT.has(core)&&!KEEP.has(core)) MISS.set(core,(MISS.get(core)||0)+1);
  }

  // The page stays laid out left-to-right, but Hebrew reads right-to-left. Left in an LTR box, a
  // Hebrew sentence gets its punctuation, numbers and any bold/italic pieces in the wrong order.
  // dir="auto" lets a text box take its direction from its own text. It goes only on text boxes —
  // elements whose children are all inline — never on a layout container, because dir also
  // mirrors flex/grid rows and would flip the icon/label order of every button.
  const BOXED=new WeakSet();
  function rtlBox(node){
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

  function txt(node){
    const v=node.nodeValue;
    if(!v||!LATIN.test(v)) return;
    const m=/^(\s*)([\s\S]*?)(\s*)$/.exec(v);
    const core=norm(m[2]);
    if(!core) return;
    // An entry keyed "<first class of the parent>|<text>" wins over the plain one, for a word that
    // means something else elsewhere (the weapon tag "Light" vs the cantrip Light).
    const p=node.parentElement;
    let r=p&&p.classList.length?translate(p.classList[0]+'|'+core,true):null;
    if(r==null) r=translate(core);
    if(r==null){ miss(core); return; }
    node.nodeValue=m[1]+r+m[3];
    if(HEB.test(r)) rtlBox(node);
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

  // Never translate inside: a contenteditable (the backstory editor reads its innerText straight
  // into the saved sheet), a textarea, or anything marked translate="no" (the Language row itself).
  // Also skipped: the containers that show game-data names (spell, item, library picks, roster
  // names), so a UI word that happens to equal one — the weapon tag "Light" vs the cantrip Light —
  // never rewrites it.
  const SKIP='[contenteditable]:not([contenteditable="false"]),[translate="no"],textarea,script,style,noscript,'
    +'.sc-name,.spell-modal-name,.eq-card-name,.feature-title,'
    +'.lvlup-feat-body b,.lvlup-feat-body small,.lvlup-pool-chip,'
    +'[data-spellpick],[data-libidx],[data-raceidx],[data-backgroundidx],[data-langpick],[data-profpick],'
    +'#weaponModalList,#itemIndexList,#packModalList';
  const skipped=el=>!!(el&&el.closest&&el.closest(SKIP));
  function tree(root){
    if(root.nodeType===3){ if(!skipped(root.parentElement)) txt(root); return; }
    if(root.nodeType!==1||skipped(root)) return;
    attrs(root);
    const w=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT,{
      acceptNode:n=>n.nodeType===1&&n.matches(SKIP)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT,
    });
    let n;
    while((n=w.nextNode())){ if(n.nodeType===3) txt(n); else attrs(n); }
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
  document.body.classList.add('lang-he');
  new MutationObserver(recs=>{
    for(const r of recs){
      if(r.type==='childList') r.addedNodes.forEach(tree);
      else if(r.type==='characterData'){ if(!skipped(r.target.parentElement)) txt(r.target); }
      else if(!skipped(r.target)) attr(r.target,r.attributeName);
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
