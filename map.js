// ---------- Atlas: several campaign maps, each a picture with pins on it ----------
// Loaded after app.js and media.js — reuses their globals ($, $$, esc, uiAlert, uiConfirm, MEDIA,
// mediaReadImage). Independent of character-sheet state: the maps belong to the device, not to
// one character.
//
// Storage: the list of maps (name, size, pins) is small and lives in localStorage under
// MAPS_KEY; each map's picture is in the picture store (MEDIA, key 'map:<id>'). The older
// single-map save (dnd5e-binder-map-v2, picture inline) is moved across once by mapMigrate().

const MAPS_KEY = 'dnd5e-binder-maps-v3';
const MAP_OLD_KEY = 'dnd5e-binder-map-v2';
let MAPS = { maps: [], active: null };
const MAP_IMG = {};              // id -> data URL, filled as pictures are read from the store
let mapSaveTimer = null;
function mapSaveNow() {
  clearTimeout(mapSaveTimer);
  try { localStorage.setItem(MAPS_KEY, JSON.stringify(MAPS)); }
  catch (e) { uiAlert('Could not save the map pins — this browser\'s storage is full.'); }
}
function mapSave() { clearTimeout(mapSaveTimer); mapSaveTimer = setTimeout(mapSaveNow, 350); }
function mapLoad() {
  try {
    const d = JSON.parse(localStorage.getItem(MAPS_KEY) || 'null');
    if (d && Array.isArray(d.maps)) MAPS = { maps: d.maps, active: d.active };
  } catch (e) {}
  MAPS.maps.forEach(m => { if (!Array.isArray(m.pins)) m.pins = []; });
  if (!MAPS.maps.some(m => m.id === MAPS.active)) MAPS.active = MAPS.maps.length ? MAPS.maps[0].id : null;
}
// One-time move of the old single map into the atlas. The old key is only removed once its
// picture is safely in the picture store, so a failure half-way loses nothing.
function mapMigrate() {
  let old;
  try { old = JSON.parse(localStorage.getItem(MAP_OLD_KEY) || 'null'); } catch (e) { return Promise.resolve(); }
  if (!old || !old.image) return Promise.resolve();
  const id = newMapId();
  return MEDIA.set('map:' + id, old.image).then(ok => {
    if (!ok) return;
    MAP_IMG[id] = old.image;
    MAPS.maps.push({ id, name: 'World map', w: old.w, h: old.h, pins: Array.isArray(old.pins) ? old.pins : [] });
    if (!MAPS.active) MAPS.active = id;
    mapSaveNow();
    try { localStorage.removeItem(MAP_OLD_KEY); } catch (e) {}
  });
}
function newMapId() { return 'map' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function curMap() { return MAPS.maps.find(m => m.id === MAPS.active) || null; }

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ---- View state (pan/zoom) ----
// The viewport is translated and scaled as one piece; pins are scaled back by --inv so they stay
// the same size on screen however far the map is zoomed.
const view = { scale: 1, tx: 0, ty: 0 };
const MAP_MAX_SCALE = 6;
function fitScale() {
  const m = curMap(), stage = $('#mapStage'); if (!m) return 1;
  return Math.min((stage.clientWidth || 800) / m.w, (stage.clientHeight || 500) / m.h);
}
function minScale() { return Math.min(fitScale() * 0.6, 1); }
function applyTransform() {
  const vp = $('#mapViewport');
  vp.style.transform = `translate(${view.tx}px,${view.ty}px) scale(${view.scale})`;
  vp.style.setProperty('--inv', 1 / view.scale);
}
function fitView(animate) {
  const m = curMap(); if (!m) return;
  const stage = $('#mapStage');
  const w = stage.clientWidth || 800, h = stage.clientHeight || 500;
  view.scale = Math.min(fitScale(), 1.5);
  view.tx = (w - m.w * view.scale) / 2;
  view.ty = (h - m.h * view.scale) / 2;
  glide(animate); applyTransform();
}
// A short eased move for button-driven changes (fit, zoom buttons, jumping to a pin). Finger
// gestures never use it — the map has to stay glued to the fingers.
let glideTimer = null;
function glide(on) {
  const vp = $('#mapViewport');
  clearTimeout(glideTimer);
  vp.classList.toggle('gliding', !!on);
  if (on) glideTimer = setTimeout(() => vp.classList.remove('gliding'), 320);
}
function zoomAt(stageX, stageY, factor, animate) {
  const newScale = clamp(view.scale * factor, minScale(), MAP_MAX_SCALE);
  const mapX = (stageX - view.tx) / view.scale, mapY = (stageY - view.ty) / view.scale;
  view.tx = stageX - mapX * newScale;
  view.ty = stageY - mapY * newScale;
  view.scale = newScale;
  glide(animate); applyTransform();
}
function stagePoint(clientX, clientY) {
  const rect = $('#mapStage').getBoundingClientRect();
  return { x: clientX - rect.left, y: clientY - rect.top };
}
// Client coords -> unscaled map-image-space coords.
function clientToMap(clientX, clientY) {
  const s = stagePoint(clientX, clientY);
  return { x: (s.x - view.tx) / view.scale, y: (s.y - view.ty) / view.scale };
}
function centerOnPin(p) {
  const m = curMap(), stage = $('#mapStage'); if (!m) return;
  view.scale = clamp(Math.max(view.scale, Math.min(1, fitScale() * 2.2)), minScale(), MAP_MAX_SCALE);
  view.tx = stage.clientWidth / 2 - (p.x / 100 * m.w) * view.scale;
  view.ty = stage.clientHeight / 2 - (p.y / 100 * m.h) * view.scale;
  glide(true); applyTransform();
}

// ---- Adding, replacing, renaming and deleting maps ----
const MAP_MAX_DIM = 2400;
let mapFileMode = 'new';         // what the hidden file input is about to do: 'new' | 'replace'
function pickMapFile(mode) { mapFileMode = mode; $('#mapImageFile').click(); }
async function handleMapFile(file) {
  if (!file) return;
  let pic;
  try { pic = await mediaReadImage(file, MAP_MAX_DIM, 0.85); }
  catch (e) { uiAlert('Could not load that image file.'); return; }
  const replacing = mapFileMode === 'replace' && curMap();
  const id = replacing ? curMap().id : newMapId();
  const ok = await MEDIA.set('map:' + id, pic.url);
  if (!ok) { uiAlert('Could not save the map picture — this device\'s storage is full. Try a smaller image.'); return; }
  MAP_IMG[id] = pic.url;
  if (replacing) {
    // Pins are stored as percentages of the picture, so they keep their relative place on a
    // redrawn or higher-quality version of the same map.
    const m = curMap(); m.w = pic.w; m.h = pic.h;
  } else {
    const name = (file.name || '').replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim().slice(0, 40) || `Map ${MAPS.maps.length + 1}`;
    MAPS.maps.push({ id, name, w: pic.w, h: pic.h, pins: [] });
    MAPS.active = id;
  }
  mapSaveNow();
  closeMapMenu(); deselectPin();
  renderAtlas();
  requestAnimationFrame(() => fitView(false));
}
function deleteCurMap() {
  const m = curMap(); if (!m) return;
  const pins = m.pins.length;
  uiConfirm(`Delete the map "${m.name}"${pins ? ` and its ${pins} pin${pins === 1 ? '' : 's'}` : ''}? This can't be undone.`,
    { title: 'Delete map', ok: 'Delete', danger: true }).then(ok => {
    if (!ok) return;
    const i = MAPS.maps.indexOf(m);
    MAPS.maps.splice(i, 1);
    delete MAP_IMG[m.id];
    MEDIA.del('map:' + m.id);
    MAPS.active = MAPS.maps.length ? MAPS.maps[Math.min(i, MAPS.maps.length - 1)].id : null;
    mapSaveNow();
    closeMapMenu(); deselectPin();
    renderAtlas();
    requestAnimationFrame(() => fitView(false));
  });
}
function switchMap(id) {
  if (id === MAPS.active) return;
  MAPS.active = id;
  mapSave();
  closeMapMenu(); disarmPin(); deselectPin();
  renderAtlas();
  requestAnimationFrame(() => fitView(false));
}
function openMapMenu() {
  const m = curMap(); if (!m) return;
  $('#mapNameInput').value = m.name;
  $('#mapMenu').hidden = false;
  $('#mapMenuBtn').classList.add('active');
}
function closeMapMenu() { $('#mapMenu').hidden = true; $('#mapMenuBtn').classList.remove('active'); }

// ---- Rendering ----
function renderMapTabs() {
  $('#mapTabs').innerHTML = MAPS.maps.map(m =>
    `<button type="button" class="map-tab${m.id === MAPS.active ? ' on' : ''}" data-mapid="${m.id}" dir="auto">${esc(m.name || 'Map')}` +
    `${m.pins.length ? `<span class="map-tab-n">${m.pins.length}</span>` : ''}</button>`
  ).join('') + `<button type="button" class="map-tab map-tab-add" id="mapAddBtn">+ Add map</button>`;
  const on = $('#mapTabs .map-tab.on');
  if (on && on.scrollIntoView) on.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}
function renderAtlas() {
  const m = curMap(), has = !!m;
  renderMapTabs();
  $('#mapEmpty').style.display = has ? 'none' : 'flex';
  $('#mapViewport').style.display = has ? '' : 'none';
  $('#mapDock').style.display = has ? '' : 'none';
  $('#mapMenuBtn').style.display = has ? '' : 'none';
  if (!has) { closePinList(); return; }
  const img = $('#mapImg'), layer = $('#mapPinLayer');
  img.style.width = m.w + 'px'; img.style.height = m.h + 'px';
  layer.style.width = m.w + 'px'; layer.style.height = m.h + 'px';
  const show = url => { if (curMap() === m) img.src = url || ''; };
  if (MAP_IMG[m.id]) show(MAP_IMG[m.id]);
  else {
    img.removeAttribute('src');
    MEDIA.get('map:' + m.id).then(url => { if (url) MAP_IMG[m.id] = url; show(url); });
  }
  renderPins();
}

// ---- Pins ----
const PIN_ICON = { party: '📍', waypoint: '🚩', quest: '⭐', place: '🏰', danger: '☠️' };
const PIN_NAME = { party: 'Party', waypoint: 'Waypoint', quest: 'Quest', place: 'Place', danger: 'Danger' };
function newPinId() { return 'pin' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function positionPinEl(el, p) {
  const m = curMap();
  el.style.left = (p.x / 100 * m.w) + 'px';
  el.style.top = (p.y / 100 * m.h) + 'px';
}
function renderPins() {
  const layer = $('#mapPinLayer'), m = curMap();
  layer.innerHTML = '';
  if (!m) return;
  m.pins.forEach(p => {
    const el = document.createElement('div');
    el.className = 'map-pin ' + p.type + (p.id === selectedPinId ? ' selected' : '');
    el.dataset.id = p.id;
    el.innerHTML = `<span class="map-pin-ico">${PIN_ICON[p.type] || '📍'}</span>` +
      (p.label ? `<span class="map-pin-label" dir="auto">${esc(p.label)}</span>` : '');
    positionPinEl(el, p);
    wirePinPointer(el, p);
    layer.appendChild(el);
  });
  renderPinList();
  // The tab's pin count follows along without rebuilding the strip mid-gesture.
  const n = $('#mapTabs .map-tab.on .map-tab-n');
  if (n) n.textContent = m.pins.length;
}
// The list of this map's pins: on a big map it is the quick way to find one again.
function renderPinList() {
  const box = $('#mapPinList'), m = curMap(); if (!box || box.hidden || !m) return;
  box.innerHTML = `<div class="map-pinlist-h"><span>Pins on this map</span><button type="button" class="close-x" id="mapPinListClose" aria-label="Close">✕</button></div>` +
    (m.pins.length ? m.pins.map(p =>
      `<button type="button" class="map-pinrow${p.id === selectedPinId ? ' on' : ''}" data-pinrow="${p.id}">
        <span class="map-pinrow-ico">${PIN_ICON[p.type] || '📍'}</span>
        <span class="map-pinrow-txt"><b dir="auto">${p.label ? esc(p.label) : esc(PIN_NAME[p.type] || 'Pin')}</b>${p.note ? `<small dir="auto">${esc(p.note)}</small>` : ''}</span>
      </button>`).join('')
      : `<p class="map-pinlist-empty">No pins yet — pick a pin below, then tap the map.</p>`);
}
function togglePinList() {
  const box = $('#mapPinList');
  box.hidden = !box.hidden;
  $('#mapPinsBtn').classList.toggle('active', !box.hidden);
  renderPinList();
}
function closePinList() { $('#mapPinList').hidden = true; $('#mapPinsBtn').classList.remove('active'); }

// ---- Selection / edit bar ----
let selectedPinId = null;
function selectPin(id, focusLabel) {
  selectedPinId = id;
  const m = curMap(), p = m && m.pins.find(x => x.id === id);
  const bar = $('#mapSelectedBar');
  if (!p) { bar.classList.remove('open'); renderPins(); return; }
  bar.classList.add('open');
  $('#mapSelType').innerHTML = Object.keys(PIN_ICON).map(t =>
    `<button type="button" class="map-typebtn${p.type === t ? ' on' : ''}" data-settype="${t}" title="${PIN_NAME[t]}" aria-label="${PIN_NAME[t]}">${PIN_ICON[t]}</button>`).join('');
  $('#mapSelLabel').value = p.label;
  $('#mapSelNote').value = p.note;
  renderPins();
  if (focusLabel) requestAnimationFrame(() => $('#mapSelLabel').focus());
}
function deselectPin() { selectedPinId = null; $('#mapSelectedBar').classList.remove('open'); renderPins(); }
function removeSelectedPin() {
  const m = curMap(); if (!selectedPinId || !m) return;
  m.pins = m.pins.filter(x => x.id !== selectedPinId);
  mapSave();
  deselectPin();
}

// ---- Placement mode (pick a pin type, tap the map to drop it) ----
let armedType = null;
function setHint(text) {
  const h = $('#mapHint');
  h.hidden = !text;
  h.innerHTML = text ? `<span>${text}</span><button type="button" id="mapHintCancel">Cancel</button>` : '';
}
function armPin(type) {
  armedType = armedType === type ? null : type;
  $$('.map-pintool').forEach(b => b.classList.toggle('active', b.dataset.pintype === armedType));
  $('#mapStage').classList.toggle('placing', !!armedType);
  setHint(armedType ? `${PIN_ICON[armedType]} Tap the map where this pin goes` : '');
}
function disarmPin() {
  armedType = null;
  $$('.map-pintool').forEach(b => b.classList.remove('active'));
  $('#mapStage').classList.remove('placing');
  setHint('');
}

// ---- Pointer interaction ----
const DRAG_THRESHOLD = 8;

function wirePinPointer(el, p) {
  let startX = 0, startY = 0, dragging = false;
  el.addEventListener('pointerdown', e => {
    e.stopPropagation();
    el.setPointerCapture(e.pointerId);
    startX = e.clientX; startY = e.clientY; dragging = false;
  });
  el.addEventListener('pointermove', e => {
    if (!el.hasPointerCapture(e.pointerId)) return;
    if (!dragging && Math.hypot(e.clientX - startX, e.clientY - startY) > DRAG_THRESHOLD) { dragging = true; el.classList.add('dragging'); }
    if (dragging) {
      const m = curMap(), c = clientToMap(e.clientX, e.clientY);
      const live = m.pins.find(x => x.id === p.id); if (!live) return;
      live.x = clamp(c.x / m.w * 100, 0, 100);
      live.y = clamp(c.y / m.h * 100, 0, 100);
      positionPinEl(el, live);
    }
  });
  const end = e => {
    if (!el.hasPointerCapture(e.pointerId)) return;
    el.releasePointerCapture(e.pointerId);
    el.classList.remove('dragging');
    if (dragging) { dragging = false; mapSave(); return; }
    if (e.type === 'pointerup') selectPin(p.id);
  };
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', end);
}

// One finger drags the map, two fingers pinch-zoom it around the point between them (and drag it
// at the same time), a mouse wheel or trackpad pinch zooms at the cursor, and a double tap zooms
// in on the spot. A touch that never moved is a tap: it places the armed pin, or clears the
// selection.
function wireStagePointer() {
  const stage = $('#mapStage');
  const ptrs = new Map();          // pointerId -> {x,y} in stage coords
  let moved = false, pan = null, pinch = null, lastTap = 0, lastTapAt = null;
  const startPan = () => {
    const p = [...ptrs.values()][0];
    pan = { x: p.x, y: p.y, tx: view.tx, ty: view.ty }; pinch = null;
  };
  const startPinch = () => {
    const [a, b] = [...ptrs.values()];
    pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, scale: view.scale, tx: view.tx, ty: view.ty };
    pan = null; moved = true;
  };
  stage.addEventListener('pointerdown', e => {
    if (e.target.closest('.map-pin,.map-dock,.map-pinlist,.map-hint,.map-empty')) return;
    if (!curMap()) return;
    if (!ptrs.size) moved = false;
    ptrs.set(e.pointerId, stagePoint(e.clientX, e.clientY));
    try { stage.setPointerCapture(e.pointerId); } catch (err) {}
    glide(false);
    if (ptrs.size === 1) startPan(); else if (ptrs.size === 2) startPinch();
  });
  stage.addEventListener('pointermove', e => {
    if (!ptrs.has(e.pointerId)) return;
    const p = stagePoint(e.clientX, e.clientY);
    ptrs.set(e.pointerId, p);
    if (pinch && ptrs.size >= 2) {
      const [a, b] = [...ptrs.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y) || 1, mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      const scale = clamp(pinch.scale * d / pinch.d, minScale(), MAP_MAX_SCALE);
      // The map point that was between the fingers when the pinch began stays between them.
      const mapX = (pinch.mx - pinch.tx) / pinch.scale, mapY = (pinch.my - pinch.ty) / pinch.scale;
      view.scale = scale; view.tx = mx - mapX * scale; view.ty = my - mapY * scale;
      applyTransform();
    } else if (pan) {
      const dx = p.x - pan.x, dy = p.y - pan.y;
      if (!moved && Math.hypot(dx, dy) > DRAG_THRESHOLD) moved = true;
      if (moved) { view.tx = pan.tx + dx; view.ty = pan.ty + dy; applyTransform(); }
    }
  });
  const up = e => {
    if (!ptrs.has(e.pointerId)) return;
    ptrs.delete(e.pointerId);
    try { stage.releasePointerCapture(e.pointerId); } catch (err) {}
    if (ptrs.size === 1) { startPan(); return; }   // one finger of a pinch lifted: carry on dragging
    if (ptrs.size) return;
    pan = pinch = null;
    if (moved || e.type === 'pointercancel') return;
    const m = curMap(); if (!m) return;
    if (armedType) {
      const c = clientToMap(e.clientX, e.clientY);
      const pin = { id: newPinId(), type: armedType, label: '', note: '', x: clamp(c.x / m.w * 100, 0, 100), y: clamp(c.y / m.h * 100, 0, 100) };
      m.pins.push(pin);
      disarmPin();
      mapSave();
      selectPin(pin.id, true);
      return;
    }
    const now = Date.now(), s = stagePoint(e.clientX, e.clientY);
    if (now - lastTap < 320 && lastTapAt && Math.hypot(s.x - lastTapAt.x, s.y - lastTapAt.y) < 40) {
      lastTap = 0; zoomAt(s.x, s.y, 2, true); return;
    }
    lastTap = now; lastTapAt = s;
    if (selectedPinId) deselectPin();
  };
  stage.addEventListener('pointerup', up);
  stage.addEventListener('pointercancel', up);
  stage.addEventListener('wheel', e => {
    if (!curMap() || e.target.closest('.map-pinlist')) return;
    e.preventDefault();
    const s = stagePoint(e.clientX, e.clientY);
    // A trackpad pinch arrives as a ctrl+wheel with small deltas; a mouse wheel in big steps.
    const factor = e.ctrlKey ? Math.exp(-e.deltaY / 100) : (e.deltaY < 0 ? 1.15 : 1 / 1.15);
    zoomAt(s.x, s.y, factor, false);
  }, { passive: false });
  // Safari's own page-zoom gesture would otherwise fight the pinch.
  ['gesturestart', 'gesturechange'].forEach(t => stage.addEventListener(t, e => e.preventDefault()));
}

// ---- Toolbar wiring ----
function wireMapToolbar() {
  $('#mapBtn').addEventListener('click', openMap);
  $('#mapClose').addEventListener('click', closeMap);

  $('#mapImageFile').addEventListener('change', e => { const file = e.target.files[0]; e.target.value = ''; handleMapFile(file); });
  $('#mapUploadBtnBig').addEventListener('click', () => pickMapFile('new'));
  $('#mapTabs').addEventListener('click', e => {
    if (e.target.closest('#mapAddBtn')) { pickMapFile('new'); return; }
    const t = e.target.closest('[data-mapid]'); if (t) switchMap(t.dataset.mapid);
  });
  $('#mapMenuBtn').addEventListener('click', () => { $('#mapMenu').hidden ? openMapMenu() : closeMapMenu(); });
  $('#mapNameInput').addEventListener('input', e => {
    const m = curMap(); if (!m) return;
    m.name = e.target.value.trim() || 'Map';
    mapSave(); renderMapTabs();
  });
  $('#mapNameInput').addEventListener('keydown', e => { if (e.key === 'Enter') closeMapMenu(); });
  $('#mapReplaceBtn').addEventListener('click', () => pickMapFile('replace'));
  $('#mapDeleteBtn').addEventListener('click', deleteCurMap);
  $('#mapMenuDone').addEventListener('click', closeMapMenu);

  $$('.map-pintool').forEach(b => b.addEventListener('click', () => armPin(b.dataset.pintype)));
  $('#mapHint').addEventListener('click', e => { if (e.target.closest('#mapHintCancel')) disarmPin(); });
  $('#mapPinsBtn').addEventListener('click', togglePinList);
  $('#mapPinList').addEventListener('click', e => {
    if (e.target.closest('#mapPinListClose')) { closePinList(); return; }
    const row = e.target.closest('[data-pinrow]'); if (!row) return;
    const p = curMap().pins.find(x => x.id === row.dataset.pinrow); if (!p) return;
    selectPin(p.id); centerOnPin(p);
    if (window.matchMedia('(max-width:700px)').matches) closePinList();
  });

  const mid = () => { const r = $('#mapStage').getBoundingClientRect(); return [r.width / 2, r.height / 2]; };
  $('#mapZoomIn').addEventListener('click', () => zoomAt(...mid(), 1.5, true));
  $('#mapZoomOut').addEventListener('click', () => zoomAt(...mid(), 1 / 1.5, true));
  $('#mapZoomReset').addEventListener('click', () => fitView(true));

  const selPin = () => { const m = curMap(); return m && m.pins.find(x => x.id === selectedPinId); };
  $('#mapSelType').addEventListener('click', e => {
    const b = e.target.closest('[data-settype]'), p = selPin(); if (!b || !p) return;
    p.type = b.dataset.settype; mapSave(); selectPin(p.id);
  });
  $('#mapSelLabel').addEventListener('input', e => { const p = selPin(); if (!p) return; p.label = e.target.value; renderPins(); mapSave(); });
  $('#mapSelNote').addEventListener('input', e => { const p = selPin(); if (!p) return; p.note = e.target.value; renderPinList(); mapSave(); });
  $('#mapSelLabel').addEventListener('keydown', e => { if (e.key === 'Enter') $('#mapPinDoneBtn').click(); });
  $('#mapPinRemoveBtn').addEventListener('click', removeSelectedPin);
  $('#mapPinDoneBtn').addEventListener('click', deselectPin);

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape' || !$('#mapModal').classList.contains('open')) return;
    if (armedType) disarmPin();
    else if (!$('#mapMenu').hidden) closeMapMenu();
    else if (selectedPinId) deselectPin();
    else closeMap();
  });
  // Turning the tablet changes the stage's shape; keep the whole map in view.
  window.addEventListener('resize', () => { if ($('#mapModal').classList.contains('open') && curMap()) fitView(false); });
}

function openMap() {
  $('#mapModal').classList.add('open');
  renderAtlas();
  if (curMap()) requestAnimationFrame(() => fitView(false));
}
function closeMap() {
  $('#mapModal').classList.remove('open');
  disarmPin(); closeMapMenu(); closePinList();
  deselectPin();
  mapSaveNow();
}

function initMap() {
  mapLoad();
  wireStagePointer();
  wireMapToolbar();
  renderAtlas();
  mapMigrate().then(() => { if ($('#mapModal').classList.contains('open')) { renderAtlas(); fitView(false); } });
}
initMap();
