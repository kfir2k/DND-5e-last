// ---------- World Map: upload a map image, pin party/waypoints/quests on it ----------
// Loaded after app.js — reuses its globals ($, $$, esc, uiAlert, uiConfirm).
// Own localStorage key, independent of character-sheet state.

const MAP_KEY = 'dnd5e-binder-map-v2';
let MAP = { image: '', w: 0, h: 0, pins: [] };
let mapSaveTimer = null;
function mapSaveNow() {
  try { localStorage.setItem(MAP_KEY, JSON.stringify(MAP)); }
  catch (e) { uiAlert("Could not save the map — it may be too large for this browser's storage. Try a smaller image."); }
}
function mapSave() { clearTimeout(mapSaveTimer); mapSaveTimer = setTimeout(mapSaveNow, 350); }
function mapLoad() {
  try {
    const raw = localStorage.getItem(MAP_KEY);
    MAP = raw ? Object.assign({ image: '', w: 0, h: 0, pins: [] }, JSON.parse(raw)) : { image: '', w: 0, h: 0, pins: [] };
  } catch (e) { MAP = { image: '', w: 0, h: 0, pins: [] }; }
}

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ---- View state (pan/zoom) ----
const view = { scale: 1, tx: 0, ty: 0 };
function applyTransform() {
  $('#mapViewport').style.transform = `translate(${view.tx}px,${view.ty}px) scale(${view.scale})`;
}
function fitView() {
  if (!MAP.w || !MAP.h) return;
  const stage = $('#mapStage');
  const w = stage.clientWidth || 800, h = stage.clientHeight || 500;
  view.scale = Math.min(w / MAP.w, h / MAP.h, 1);
  view.tx = (w - MAP.w * view.scale) / 2;
  view.ty = (h - MAP.h * view.scale) / 2;
  applyTransform();
}
function zoomAt(stageX, stageY, factor) {
  const newScale = Math.min(4, Math.max(0.2, view.scale * factor));
  const mapX = (stageX - view.tx) / view.scale, mapY = (stageY - view.ty) / view.scale;
  view.tx = stageX - mapX * newScale;
  view.ty = stageY - mapY * newScale;
  view.scale = newScale;
  applyTransform();
}
// Client coords -> unscaled map-image-space coords.
function clientToMap(clientX, clientY) {
  const rect = $('#mapStage').getBoundingClientRect();
  const sx = clientX - rect.left, sy = clientY - rect.top;
  return { x: (sx - view.tx) / view.scale, y: (sy - view.ty) / view.scale };
}

// ---- Map image upload ----
const MAP_MAX_DIM = 2400;
function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('bad image'));
      img.onload = () => resolve(img);
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
async function handleMapFile(file) {
  if (!file || !file.type.startsWith('image/')) return;
  if (MAP.pins.length) {
    const ok = await uiConfirm('Uploading a new map replaces the current one and clears its pins. Continue?',
      { title: 'Replace map', ok: 'Replace', danger: true });
    if (!ok) return;
  }
  let img;
  try { img = await readImageFile(file); }
  catch (e) { uiAlert('Could not load that image file.'); return; }
  const scale = Math.min(1, MAP_MAX_DIM / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.round(img.naturalWidth * scale), h = Math.round(img.naturalHeight * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  canvas.getContext('2d').drawImage(img, 0, 0, w, h);
  MAP = { image: canvas.toDataURL('image/jpeg', 0.85), w, h, pins: [] };
  mapSaveNow();
  renderMapImage();
  deselectPin();
  requestAnimationFrame(fitView);
}
function removeMapImage() {
  if (!MAP.image) return;
  uiConfirm('Remove the uploaded map and all its pins?', { title: 'Remove map', ok: 'Remove', danger: true }).then(ok => {
    if (!ok) return;
    MAP = { image: '', w: 0, h: 0, pins: [] };
    mapSaveNow();
    renderMapImage();
    deselectPin();
  });
}
function renderMapImage() {
  const has = !!MAP.image;
  const img = $('#mapImg');
  img.src = MAP.image || '';
  img.style.width = MAP.w + 'px';
  img.style.height = MAP.h + 'px';
  $('#mapPinLayer').style.width = MAP.w + 'px';
  $('#mapPinLayer').style.height = MAP.h + 'px';
  $('#mapEmpty').style.display = has ? 'none' : 'flex';
  $('#mapViewport').style.display = has ? '' : 'none';
  $('#mapPinTools').style.display = has ? '' : 'none';
  $('#mapViewTools').style.display = has ? '' : 'none';
  $('#mapRemoveImageBtn').style.display = has ? '' : 'none';
  renderPins();
}

// ---- Pins ----
const PIN_ICON = { party: '📍', waypoint: '🚩', quest: '⭐' };
const PIN_NAME = { party: 'Party', waypoint: 'Waypoint', quest: 'Quest' };
function newPinId() { return 'pin' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function positionPinEl(el, p) {
  el.style.left = (p.x / 100 * MAP.w) + 'px';
  el.style.top = (p.y / 100 * MAP.h) + 'px';
}
function renderPins() {
  const layer = $('#mapPinLayer');
  layer.innerHTML = '';
  MAP.pins.forEach(p => {
    const el = document.createElement('div');
    el.className = 'map-pin ' + p.type + (p.id === selectedPinId ? ' selected' : '');
    el.dataset.id = p.id;
    el.title = p.label || PIN_NAME[p.type];
    el.innerHTML = `<span class="map-pin-ico">${PIN_ICON[p.type] || '📍'}</span>` +
      (p.label ? `<span class="map-pin-label">${esc(p.label)}</span>` : '');
    positionPinEl(el, p);
    wirePinPointer(el, p);
    layer.appendChild(el);
  });
}

// ---- Selection / edit bar ----
let selectedPinId = null;
function selectPin(id, focusLabel) {
  selectedPinId = id;
  const p = MAP.pins.find(x => x.id === id);
  const bar = $('#mapSelectedBar');
  if (!p) { bar.classList.remove('open'); renderPins(); return; }
  bar.classList.add('open');
  $('#mapSelIcon').textContent = PIN_ICON[p.type] || '📍';
  $('#mapSelLabel').value = p.label;
  $('#mapSelNote').value = p.note;
  renderPins();
  if (focusLabel) requestAnimationFrame(() => $('#mapSelLabel').focus());
}
function deselectPin() { selectedPinId = null; $('#mapSelectedBar').classList.remove('open'); renderPins(); }
function removeSelectedPin() {
  if (!selectedPinId) return;
  MAP.pins = MAP.pins.filter(x => x.id !== selectedPinId);
  mapSave();
  deselectPin();
}

// ---- Placement mode (arm a pin type, tap the map to drop it) ----
let armedType = null;
function armPin(type) {
  armedType = armedType === type ? null : type;
  $$('.map-pintool').forEach(b => b.classList.toggle('active', b.dataset.pintype === armedType));
  $('#mapStage').classList.toggle('placing', !!armedType);
}
function disarmPin() { armedType = null; $$('.map-pintool').forEach(b => b.classList.remove('active')); $('#mapStage').classList.remove('placing'); }

// ---- Pointer interaction ----
const DRAG_THRESHOLD = 6;

function wirePinPointer(el, p) {
  let startX = 0, startY = 0, dragging = false;
  el.addEventListener('pointerdown', e => {
    e.stopPropagation();
    el.setPointerCapture(e.pointerId);
    startX = e.clientX; startY = e.clientY; dragging = false;
  });
  el.addEventListener('pointermove', e => {
    if (!el.hasPointerCapture(e.pointerId)) return;
    if (!dragging && Math.hypot(e.clientX - startX, e.clientY - startY) > DRAG_THRESHOLD) dragging = true;
    if (dragging) {
      const m = clientToMap(e.clientX, e.clientY);
      const live = MAP.pins.find(x => x.id === p.id);
      live.x = clamp(m.x / MAP.w * 100, 0, 100);
      live.y = clamp(m.y / MAP.h * 100, 0, 100);
      positionPinEl(el, live);
    }
  });
  el.addEventListener('pointerup', e => {
    if (!el.hasPointerCapture(e.pointerId)) return;
    el.releasePointerCapture(e.pointerId);
    if (dragging) { dragging = false; mapSave(); return; }
    selectPin(p.id);
  });
}

function wireStagePointer() {
  const stage = $('#mapStage');
  let startX = 0, startY = 0, panning = false, startTx = 0, startTy = 0, pointerId = null;
  stage.addEventListener('pointerdown', e => {
    if (e.target.closest('.map-pin')) return;
    pointerId = e.pointerId;
    stage.setPointerCapture(pointerId);
    startX = e.clientX; startY = e.clientY; panning = false;
    startTx = view.tx; startTy = view.ty;
  });
  stage.addEventListener('pointermove', e => {
    if (pointerId === null || !stage.hasPointerCapture(e.pointerId)) return;
    const dx = e.clientX - startX, dy = e.clientY - startY;
    if (!panning && Math.hypot(dx, dy) > DRAG_THRESHOLD) panning = true;
    if (panning) { view.tx = startTx + dx; view.ty = startTy + dy; applyTransform(); }
  });
  stage.addEventListener('pointerup', e => {
    if (pointerId === null) return;
    stage.releasePointerCapture(pointerId);
    const wasPanning = panning;
    pointerId = null; panning = false;
    if (wasPanning) return;
    if (!MAP.image) return;
    if (armedType) {
      const m = clientToMap(e.clientX, e.clientY);
      const pin = {
        id: newPinId(), type: armedType, label: '', note: '',
        x: clamp(m.x / MAP.w * 100, 0, 100), y: clamp(m.y / MAP.h * 100, 0, 100),
      };
      MAP.pins.push(pin);
      renderPins();
      mapSave();
      selectPin(pin.id, true);
      return;
    }
    if (selectedPinId) deselectPin();
  });
  stage.addEventListener('wheel', e => {
    if (!MAP.image) return;
    e.preventDefault();
    const rect = stage.getBoundingClientRect();
    zoomAt(e.clientX - rect.left, e.clientY - rect.top, e.deltaY < 0 ? 1.1 : 1 / 1.1);
  }, { passive: false });
}

// ---- Toolbar wiring ----
function wireMapToolbar() {
  $('#mapBtn').addEventListener('click', openMap);
  $('#mapClose').addEventListener('click', closeMap);
  $('#mapModal').addEventListener('click', e => { if (e.target.id === 'mapModal') closeMap(); });

  const pickFile = () => $('#mapImageFile').click();
  $('#mapUploadBtn').addEventListener('click', pickFile);
  $('#mapUploadBtnBig').addEventListener('click', pickFile);
  $('#mapImageFile').addEventListener('change', e => {
    const file = e.target.files[0];
    handleMapFile(file);
    e.target.value = '';
  });
  $('#mapRemoveImageBtn').addEventListener('click', removeMapImage);

  $('#mapAddPartyBtn').addEventListener('click', () => armPin('party'));
  $('#mapAddWaypointBtn').addEventListener('click', () => armPin('waypoint'));
  $('#mapAddQuestBtn').addEventListener('click', () => armPin('quest'));

  $('#mapZoomIn').addEventListener('click', () => { const r = $('#mapStage').getBoundingClientRect(); zoomAt(r.width / 2, r.height / 2, 1.2); });
  $('#mapZoomOut').addEventListener('click', () => { const r = $('#mapStage').getBoundingClientRect(); zoomAt(r.width / 2, r.height / 2, 1 / 1.2); });
  $('#mapZoomReset').addEventListener('click', fitView);

  $('#mapSelLabel').addEventListener('input', e => {
    const p = MAP.pins.find(x => x.id === selectedPinId); if (!p) return;
    p.label = e.target.value; renderPins(); mapSave();
  });
  $('#mapSelNote').addEventListener('input', e => {
    const p = MAP.pins.find(x => x.id === selectedPinId); if (!p) return;
    p.note = e.target.value; mapSave();
  });
  $('#mapSelLabel').addEventListener('keydown', e => { if (e.key === 'Enter') $('#mapPinDoneBtn').click(); });
  $('#mapPinRemoveBtn').addEventListener('click', removeSelectedPin);
  $('#mapPinDoneBtn').addEventListener('click', deselectPin);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && $('#mapModal').classList.contains('open')) {
      if (armedType) disarmPin();
      else if (selectedPinId) deselectPin();
      else closeMap();
    }
  });
}

function openMap() {
  $('#mapModal').classList.add('open');
  renderMapImage();
  if (MAP.image) requestAnimationFrame(fitView);
}
function closeMap() {
  $('#mapModal').classList.remove('open');
  disarmPin();
  deselectPin();
}

function initMap() {
  mapLoad();
  wireStagePointer();
  wireMapToolbar();
  renderMapImage();
}
initMap();
