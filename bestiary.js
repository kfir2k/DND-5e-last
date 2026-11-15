// ---------- Bestiary: the creatures and people the party has met ----------
// Loaded after app.js and media.js — reuses their globals ($, $$, esc, uiAlert, uiConfirm,
// deliverFile, dateStamp, MEDIA, mediaReadImage). The tab's markup is PAGES.bestiary in app.js.
//
// This is the party's own field notes, not a rules reference: every number is a guess until the
// players mark it confirmed, so each stat carries a "sure" flag and shows "≈" while it is a guess.
// Like the maps, it belongs to the device rather than to one character (a campaign's knowledge is
// shared by whoever is played), so it is not part of S or of a character export. It has its own
// export/import file instead, which also lets one player hand the bestiary to the others.
//
// Storage: the entries (text only) are in localStorage under BEAST_KEY; each picture is in the
// picture store (MEDIA, key 'beast:<id>').

const BEAST_KEY = 'dnd5e-binder-bestiary-v1';
const BEAST_FORMAT = 'dnd5e-binder-bestiary';
const BEAST_STATS = [['ac', 'Armor Class'], ['hp', 'Hit Points'], ['speed', 'Speed'], ['hit', 'To hit'], ['dmg', 'Damage'], ['dc', 'Save DC']];
const BEAST_KINDS = [['monster', 'Monster'], ['person', 'Person']];
const BEAST_ATT = [['hostile', 'Hostile'], ['neutral', 'Neutral'], ['friendly', 'Friendly']];
let BEASTS = [];
const BEAST_IMG = {};            // id -> data URL, filled as pictures are read from the store
let beastQuery = '', beastKind = '', beastOpenId = null, beastSaveTimer = null;

function beastBlank() {
  return { id: 'b' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name: '', kind: 'monster', type: '', where: '',
    attitude: '', defeated: false, stats: {}, sure: {}, resist: '', weak: '', abilities: '', notes: '', img: false, t: Date.now() };
}
function beastNormalize(b) {
  const base = beastBlank();
  const out = Object.assign(base, b || {});
  if (!out.stats || typeof out.stats !== 'object') out.stats = {};
  if (!out.sure || typeof out.sure !== 'object') out.sure = {};
  if (out.kind !== 'person') out.kind = 'monster';
  return out;
}
function beastSaveNow() {
  clearTimeout(beastSaveTimer);
  try { localStorage.setItem(BEAST_KEY, JSON.stringify({ list: BEASTS })); }
  catch (e) { uiAlert('Could not save the bestiary — this browser\'s storage is full.'); }
}
function beastSave() { clearTimeout(beastSaveTimer); beastSaveTimer = setTimeout(beastSaveNow, 350); }
function beastLoad() {
  try {
    const d = JSON.parse(localStorage.getItem(BEAST_KEY) || 'null');
    BEASTS = d && Array.isArray(d.list) ? d.list.map(beastNormalize) : [];
  } catch (e) { BEASTS = []; }
}
function beastGet(id) { return BEASTS.find(b => b.id === id) || null; }
// Read a picture once and hand it to whoever asked; later calls answer from memory.
function beastImage(id) {
  if (BEAST_IMG[id]) return Promise.resolve(BEAST_IMG[id]);
  return MEDIA.get('beast:' + id).then(url => { if (url) BEAST_IMG[id] = url; return url; });
}
const cssUrl = url => `url("${String(url).replace(/"/g, '%22')}")`;

// ---- The gallery ----
function beastStatText(b, k) {
  const v = String(b.stats[k] || '').trim();
  return v ? (b.sure[k] ? '' : '≈') + v : '';
}
function beastMatches(b, terms) {
  if (!terms.length) return true;
  const hay = [b.name, b.type, b.where, b.resist, b.weak, b.abilities, b.notes].join('\n').toLowerCase();
  return terms.every(t => hay.includes(t));
}
function renderBestiary() {
  const grid = $('#bsGrid'); if (!grid) return;
  $$('#bsKinds [data-bskind]').forEach(b => b.classList.toggle('on', b.dataset.bskind === beastKind));
  const terms = beastQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const rows = BEASTS.filter(b => (!beastKind || b.kind === beastKind) && beastMatches(b, terms))
    .sort((a, b) => (a.name || '').localeCompare(b.name || '') || a.t - b.t);
  const count = $('#bsCount');
  if (count) count.textContent = !BEASTS.length ? '' : rows.length === BEASTS.length
    ? `${BEASTS.length} entr${BEASTS.length === 1 ? 'y' : 'ies'}` : `${rows.length} of ${BEASTS.length} entries`;
  if (!rows.length) {
    grid.innerHTML = `<div class="bs-none"><span class="bs-none-mark">${BEASTS.length ? '🔍' : '🐉'}</span>
      <p>${BEASTS.length ? 'Nothing here matches your search.' : 'Nothing recorded yet. Add the first creature or person your party meets.'}</p></div>`;
    return;
  }
  grid.innerHTML = rows.map(b => {
    const ac = beastStatText(b, 'ac'), hp = beastStatText(b, 'hp');
    const sub = [b.type, b.where].map(x => (x || '').trim()).filter(Boolean).join(' · ');
    return `<button type="button" class="bs-card kind-${b.kind}${b.defeated ? ' defeated' : ''}${b.attitude ? ' att-' + b.attitude : ''}" data-bsopen="${b.id}">
      <span class="bs-card-art" data-bsart="${b.img ? b.id : ''}"><span class="bs-card-glyph" aria-hidden="true">${b.kind === 'person' ? '👤' : '🐉'}</span></span>
      ${b.defeated ? `<span class="bs-card-flag">Defeated</span>` : ''}
      <span class="bs-card-body">
        <span class="bs-card-name" dir="auto">${(b.name || '').trim() ? esc(b.name) : '<i>Unnamed</i>'}</span>
        ${sub ? `<span class="bs-card-sub" dir="auto">${esc(sub)}</span>` : ''}
        ${ac || hp ? `<span class="bs-card-stats">${ac ? `<span><i>AC</i> ${esc(ac)}</span>` : ''}${hp ? `<span><i>HP</i> ${esc(hp)}</span>` : ''}</span>` : ''}
      </span>
    </button>`;
  }).join('');
  $$('#bsGrid [data-bsart]').forEach(el => {
    const id = el.dataset.bsart; if (!id) return;
    beastImage(id).then(url => { if (url && el.isConnected) { el.style.backgroundImage = cssUrl(url); el.classList.add('has-img'); } });
  });
}

// ---- The dossier (one entry, opened from its card) ----
function beastSegHTML(field, opts, cur) {
  return `<div class="bs-seg" data-bsseg="${field}">${opts.map(([v, l]) =>
    `<button type="button" class="${cur === v ? 'on' : ''}" data-v="${v}">${l}</button>`).join('')}</div>`;
}
function renderDossier() {
  const b = beastGet(beastOpenId), panel = $('#bsPanel'); if (!b || !panel) return;
  const fld = (label, html) => `<label class="bs-fld"><span>${label}</span>${html}</label>`;
  // One sheet in two halves: the picture fills the whole left side with the name written across
  // its foot (so the entry reads as a portrait first), and everything the party has learned
  // scrolls on the right. On a narrow screen the picture becomes a banner on top.
  panel.innerHTML = `
    <div class="bs-sheet" id="bsSheet" data-kind="${b.kind}" data-att="${b.attitude}">
      <div class="bs-art" id="bsPortrait">
        <button type="button" class="bs-art-empty" data-bspick><b>＋</b><span>Add a picture</span></button>
        <div class="bs-art-tools">
          <button type="button" class="bs-art-btn" data-bspick title="Add or change the picture" aria-label="Add or change the picture">🖼</button>
          <button type="button" class="bs-art-btn" data-bsimgdel id="bsImgDel" title="Remove picture" aria-label="Remove picture">🗑</button>
        </div>
        <div class="bs-art-foot">
          ${beastSegHTML('kind', BEAST_KINDS, b.kind)}
          <input type="text" class="bs-name" data-bf="name" value="${esc(b.name)}" placeholder="Name — or what you call it for now" dir="auto" maxlength="80">
          <input type="text" class="bs-type" data-bf="type" value="${esc(b.type)}" placeholder="e.g. undead, beast, noble, merchant" dir="auto" maxlength="80" aria-label="Type">
        </div>
      </div>
      <div class="bs-body">
        <button class="close-x bs-close" type="button" data-bsclose aria-label="Close">✕</button>
        <div class="bs-row">
          ${beastSegHTML('attitude', BEAST_ATT, b.attitude)}
          <button type="button" class="bs-defeated${b.defeated ? ' on' : ''}" data-bsdefeated>☠ <span>Defeated</span></button>
        </div>
        ${fld('Where we met', `<input type="text" data-bf="where" value="${esc(b.where)}" placeholder="Place, session…" dir="auto">`)}
        <div class="bs-sec-h"><span>What we think we know</span><small>Each number is a guess (≈) until you tap its mark to confirm it (✓)</small></div>
        <div class="bs-stats">
          ${BEAST_STATS.map(([k, l]) => `<div class="bs-stat${b.sure[k] ? ' sure' : ''}">
            <span class="bs-stat-l">${l}</span>
            <input type="text" data-bs="${k}" value="${esc(b.stats[k] || '')}" placeholder="?" inputmode="text" autocomplete="off">
            <button type="button" class="bs-sure" data-bssure="${k}" title="Guess or confirmed" aria-label="Guess or confirmed">${b.sure[k] ? '✓' : '≈'}</button>
          </div>`).join('')}
        </div>
        <div class="bs-two">
          <label class="bs-fld bs-fld-resist"><span>🛡 <i>Resists or is immune to</i></span><input type="text" data-bf="resist" value="${esc(b.resist)}" placeholder="e.g. fire, non-magical weapons" dir="auto"></label>
          <label class="bs-fld bs-fld-weak"><span>🎯 <i>Weak to</i></span><input type="text" data-bf="weak" value="${esc(b.weak)}" placeholder="e.g. radiant, low Wisdom saves" dir="auto"></label>
        </div>
        ${fld('Attacks and abilities we have seen', `<textarea data-bf="abilities" rows="4" placeholder="Bite, a breath weapon about 30 ft., turns invisible…" dir="auto">${esc(b.abilities)}</textarea>`)}
        ${fld('Notes and lore', `<textarea data-bf="notes" rows="4" placeholder="What it wants, who it serves, what happened when we met…" dir="auto">${esc(b.notes)}</textarea>`)}
        <div class="bs-foot">
          <button type="button" class="icon-btn sm danger" data-bsdelete>Delete entry</button>
          <button type="button" class="icon-btn bs-done" data-bsclose>Done</button>
        </div>
      </div>
    </div>`;
  paintPortrait();
}
function paintPortrait() {
  const b = beastGet(beastOpenId), el = $('#bsPortrait'); if (!b || !el) return;
  const del = $('#bsImgDel'); if (del) del.style.display = b.img ? '' : 'none';
  el.classList.toggle('has-img', false); el.style.backgroundImage = '';
  if (!b.img) return;
  beastImage(b.id).then(url => {
    if (!url || beastOpenId !== b.id || !el.isConnected) return;
    el.style.backgroundImage = cssUrl(url); el.classList.add('has-img');
  });
}
function openBeast(id) {
  beastOpenId = id;
  renderDossier();
  $('#bsModal').classList.add('open');
}
function closeBeast() {
  if (!beastOpenId) return;
  beastOpenId = null;
  $('#bsModal').classList.remove('open');
  beastSaveNow();
  renderBestiary();
}
function addBeast() {
  const b = beastBlank();
  if (beastKind) b.kind = beastKind;
  BEASTS.push(b); beastSaveNow();
  openBeast(b.id);
  requestAnimationFrame(() => { const n = $('#bsPanel .bs-name'); if (n) n.focus(); });
}
async function setBeastPicture(file) {
  const b = beastGet(beastOpenId); if (!b || !file) return;
  let pic;
  try { pic = await mediaReadImage(file, 900, 0.82); }
  catch (e) { uiAlert('Could not load that image file.'); return; }
  const ok = await MEDIA.set('beast:' + b.id, pic.url);
  if (!ok) { uiAlert('Could not save the picture — this device\'s storage is full.'); return; }
  BEAST_IMG[b.id] = pic.url; b.img = true;
  beastSaveNow(); paintPortrait();
}

// ---- Export / import (a file that carries the pictures too) ----
async function exportBestiary() {
  if (!BEASTS.length) { uiAlert('The bestiary is empty — there is nothing to export yet.'); return; }
  const entries = [];
  for (const b of BEASTS) entries.push(Object.assign({}, b, { image: b.img ? (await beastImage(b.id)) || '' : '' }));
  deliverFile(JSON.stringify({ format: BEAST_FORMAT, version: 1, exported: new Date().toISOString(), entries }), `Bestiary ${dateStamp()}.json`);
}
// Import only ever adds: an entry already here (same id) is left alone, so importing a friend's
// file, or the same file twice, cannot overwrite what this player wrote.
async function importBestiary(file) {
  let d;
  try { d = JSON.parse(await file.text()); } catch (e) { uiAlert('That file could not be read as a bestiary.'); return; }
  if (!d || d.format !== BEAST_FORMAT || !Array.isArray(d.entries)) { uiAlert('That file is not a bestiary export.'); return; }
  let added = 0;
  for (const raw of d.entries) {
    if (!raw || typeof raw !== 'object' || (raw.id && beastGet(raw.id))) continue;
    const image = typeof raw.image === 'string' && raw.image.startsWith('data:image/') ? raw.image : '';
    const b = beastNormalize(Object.assign({}, raw, { image: undefined }));
    delete b.image;
    b.img = false;
    if (image && await MEDIA.set('beast:' + b.id, image)) { BEAST_IMG[b.id] = image; b.img = true; }
    BEASTS.push(b); added++;
  }
  beastSaveNow(); renderBestiary();
  uiAlert(added ? `Added ${added} entr${added === 1 ? 'y' : 'ies'} to the bestiary.` : 'Everything in that file is already in your bestiary.');
}

// ---- Wiring (once: the containers persist, their contents are rebuilt) ----
function wireBestiary() {
  const grid = $('#bsGrid'); if (!grid) return;
  $('#bsSearch').addEventListener('input', e => { beastQuery = e.target.value; renderBestiary(); });
  $('#bsKinds').addEventListener('click', e => { const b = e.target.closest('[data-bskind]'); if (!b) return; beastKind = b.dataset.bskind; renderBestiary(); });
  $('#bsAdd').addEventListener('click', addBeast);
  $('#bsExport').addEventListener('click', exportBestiary);
  $('#bsImport').addEventListener('click', () => $('#bsImportFile').click());
  $('#bsImportFile').addEventListener('change', e => { const f = e.target.files[0]; e.target.value = ''; if (f) importBestiary(f); });
  $('#bsImageFile').addEventListener('change', e => { const f = e.target.files[0]; e.target.value = ''; setBeastPicture(f); });
  grid.addEventListener('click', e => { const c = e.target.closest('[data-bsopen]'); if (c) openBeast(c.dataset.bsopen); });

  const modal = $('#bsModal'), panel = $('#bsPanel');
  modal.addEventListener('click', e => { if (e.target === modal) closeBeast(); });
  panel.addEventListener('input', e => {
    const b = beastGet(beastOpenId); if (!b) return;
    const el = e.target;
    if (el.dataset.bf) b[el.dataset.bf] = el.value;
    else if (el.dataset.bs) b.stats[el.dataset.bs] = el.value;
    else return;
    beastSave();
  });
  panel.addEventListener('click', e => {
    const b = beastGet(beastOpenId); if (!b) return;
    const t = e.target;
    if (t.closest('[data-bsclose]')) { closeBeast(); return; }
    if (t.closest('[data-bspick]')) { $('#bsImageFile').click(); return; }
    if (t.closest('[data-bsimgdel]')) {
      b.img = false; delete BEAST_IMG[b.id]; MEDIA.del('beast:' + b.id);
      beastSaveNow(); paintPortrait(); return;
    }
    const seg = t.closest('[data-bsseg] button');
    if (seg) {
      const field = seg.parentElement.dataset.bsseg;
      // The attitude can be switched back off by tapping it again; the kind is always one or the other.
      b[field] = (field === 'attitude' && b[field] === seg.dataset.v) ? '' : seg.dataset.v;
      [...seg.parentElement.querySelectorAll('button')].forEach(x => x.classList.toggle('on', x.dataset.v === b[field]));
      const sheet = $('#bsSheet'); if (sheet) { sheet.dataset.kind = b.kind; sheet.dataset.att = b.attitude; }
      beastSave(); return;
    }
    const def = t.closest('[data-bsdefeated]');
    if (def) { b.defeated = !b.defeated; def.classList.toggle('on', b.defeated); beastSave(); return; }
    const sure = t.closest('[data-bssure]');
    if (sure) {
      const k = sure.dataset.bssure;
      b.sure[k] = !b.sure[k];
      sure.textContent = b.sure[k] ? '✓' : '≈';
      sure.parentElement.classList.toggle('sure', !!b.sure[k]);
      beastSave(); return;
    }
    if (t.closest('[data-bsdelete]')) {
      const name = (b.name || '').trim() || 'this entry';
      uiConfirm(`Delete "${name}" from the bestiary? This can't be undone.`, { title: 'Delete?', ok: 'Delete', danger: true }).then(ok => {
        if (!ok) return;
        BEASTS = BEASTS.filter(x => x !== b);
        delete BEAST_IMG[b.id]; MEDIA.del('beast:' + b.id);
        closeBeast();
      });
    }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && beastOpenId && !document.querySelector('.ui-dlg-bg.open')) closeBeast();
  });
}

beastLoad();
wireBestiary();
renderBestiary();
