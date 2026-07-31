// ---------- Battle Map: hex-grid token tracker ----------
// Loaded after app.js — reuses its globals ($, $$, ROSTER, charSummary, uiConfirm).
// Own localStorage key, independent of character-sheet state.

// ---- Grid geometry (flat-top hexes, "odd-q" offset columns) ----
const MAP_COLS = 61, MAP_ROWS = 45; // a 60-hex span across = a clean 300 ft, at 5 ft/hex
const HEX_S = 34;                       // center-to-vertex size, in unscaled map-space px
const HEX_H = Math.sqrt(3) * HEX_S;     // flat-to-flat height
const COL_SPACING = HEX_S * 1.5;
const HEX_PAD = HEX_S;
const FT_PER_HEX = 5;

function hexPixel(col, row) {
  const x = HEX_PAD + COL_SPACING * col;
  const y = HEX_PAD + HEX_H * (row + 0.5 * (col & 1));
  return { x, y };
}
function hexCorner(cx, cy, i) {
  const rad = Math.PI / 180 * (60 * i);
  return [cx + HEX_S * Math.cos(rad), cy + HEX_S * Math.sin(rad)];
}
function hexPolygonPoints(cx, cy) {
  const pts = [];
  for (let i = 0; i < 6; i++) pts.push(hexCorner(cx, cy, i).join(','));
  return pts.join(' ');
}
// Offset (col,row) -> axial (q,r), for distance math only.
function offsetToAxial(col, row) {
  return { q: col, r: row - (col - (col & 1)) / 2 };
}
function hexDistance(a, b) {
  const A = offsetToAxial(a.col, a.row), B = offsetToAxial(b.col, b.row);
  return (Math.abs(A.q - B.q) + Math.abs(A.q + A.r - B.q - B.r) + Math.abs(A.r - B.r)) / 2;
}
function nearestHex(x, y) {
  let best = null, bestD = Infinity;
  for (let col = 0; col < MAP_COLS; col++) {
    for (let row = 0; row < MAP_ROWS; row++) {
      const p = hexPixel(col, row);
      const d = (p.x - x) * (p.x - x) + (p.y - y) * (p.y - y);
      if (d < bestD) { bestD = d; best = { col, row }; }
    }
  }
  return best;
}
let GRID_W = 0, GRID_H = 0;
(function computeGridBounds() {
  const last = hexPixel(MAP_COLS - 1, MAP_ROWS - 1);
  GRID_W = last.x + HEX_S * 1.5;
  GRID_H = last.y + HEX_H;
})();

// ---- Persistence ----
const MAP_KEY = 'dnd5e-binder-map-v1';
let MAP_TOKENS = [];
let mapSaveTimer = null;
function mapSaveNow() { try { localStorage.setItem(MAP_KEY, JSON.stringify(MAP_TOKENS)); } catch (e) {} }
function mapSave() { clearTimeout(mapSaveTimer); mapSaveTimer = setTimeout(mapSaveNow, 350); }
function mapLoad() {
  try { const raw = localStorage.getItem(MAP_KEY); MAP_TOKENS = raw ? JSON.parse(raw) : []; }
  catch (e) { MAP_TOKENS = []; }
}

// ---- View state (pan/zoom) ----
const view = { scale: 1, tx: 0, ty: 0 };
function applyTransform() {
  $('#mapViewport').style.transform = `translate(${view.tx}px,${view.ty}px) scale(${view.scale})`;
}
function fitView() {
  const stage = $('#mapStage');
  const w = stage.clientWidth || 800, h = stage.clientHeight || 500;
  view.scale = Math.min(w / GRID_W, h / GRID_H, 1);
  view.tx = (w - GRID_W * view.scale) / 2;
  view.ty = (h - GRID_H * view.scale) / 2;
  applyTransform();
}
function zoomAt(stageX, stageY, factor) {
  const newScale = Math.min(2.5, Math.max(0.4, view.scale * factor));
  const mapX = (stageX - view.tx) / view.scale, mapY = (stageY - view.ty) / view.scale;
  view.tx = stageX - mapX * newScale;
  view.ty = stageY - mapY * newScale;
  view.scale = newScale;
  applyTransform();
}
// Client coords -> unscaled map-space coords.
function clientToMap(clientX, clientY) {
  const rect = $('#mapStage').getBoundingClientRect();
  const sx = clientX - rect.left, sy = clientY - rect.top;
  return { x: (sx - view.tx) / view.scale, y: (sy - view.ty) / view.scale };
}

// ---- Grid rendering (static, drawn once per open) ----
function renderGrid() {
  const svg = $('#mapSvg');
  svg.setAttribute('width', GRID_W);
  svg.setAttribute('height', GRID_H);
  svg.setAttribute('viewBox', `0 0 ${GRID_W} ${GRID_H}`);
  let hexes = '';
  for (let col = 0; col < MAP_COLS; col++) {
    for (let row = 0; row < MAP_ROWS; row++) {
      const { x, y } = hexPixel(col, row);
      hexes += `<polygon class="map-hex" points="${hexPolygonPoints(x, y)}" data-col="${col}" data-row="${row}"></polygon>`;
    }
  }
  svg.innerHTML = `<g id="mapHexes">${hexes}</g><g id="mapMeasureLayer"></g>`;
  $('#mapTokenLayer').style.width = GRID_W + 'px';
  $('#mapTokenLayer').style.height = GRID_H + 'px';
}

// ---- Tokens ----
const TOKEN_R = 20;
// 5e size categories -> token diameter multiplier. Footprint is purely visual (a bigger circle
// still snaps to a single hex center) — full multi-hex occupancy isn't worth the complexity here.
const SIZES = ['tiny', 'small', 'medium', 'large', 'huge', 'gargantuan'];
const SIZE_SCALE = { tiny: 0.6, small: 0.8, medium: 1, large: 1.6, huge: 2.2, gargantuan: 3 };
function tokenRadius(t) { return Math.round(TOKEN_R * (SIZE_SCALE[t.size] || 1)); }
function sizeLabel(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function populateSizeSelect(sel) {
  sel.innerHTML = SIZES.map(s => `<option value="${s}"${s === 'medium' ? ' selected' : ''}>${sizeLabel(s)}</option>`).join('');
}

// Best-effort read of a saved character's speed, so the movement-preview badge can flag "too far"
// (a plain 5 ft/hex distance doesn't know a token's budget without this).
function characterSpeedFt(charId) {
  try {
    const raw = localStorage.getItem(charKey(charId));
    if (!raw) return null;
    const m = String(JSON.parse(raw).speed || '').match(/(\d+)/);
    return m ? Number(m[1]) : null;
  } catch (e) { return null; }
}

function initials(name) {
  return (name || '?').trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';
}
function newTokenId() { return 'tok' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function uniqueName(base, team) {
  base = (base || (team === 'enemy' ? 'Enemy' : 'Friend')).trim() || (team === 'enemy' ? 'Enemy' : 'Friend');
  const taken = new Set(MAP_TOKENS.filter(t => t.team === team).map(t => t.name));
  let label = base, n = 1;
  while (taken.has(label)) { n++; label = `${base} ${n}`; }
  return label;
}

function nextSpot(team) {
  const count = MAP_TOKENS.filter(t => t.team === team).length;
  const row = count % MAP_ROWS;
  const lane = Math.floor(count / MAP_ROWS);
  const col = team === 'party' ? lane : (MAP_COLS - 1 - lane);
  return { col: Math.max(0, Math.min(MAP_COLS - 1, col)), row };
}

function addTokenSilent(t) { MAP_TOKENS.push(t); }
function addToken(t) {
  addTokenSilent(t);
  mapSave();
  renderTokens();
}
function addPlayerToken(charId, summary) {
  if (MAP_TOKENS.some(t => t.charId === charId)) return;
  const spot = nextSpot('party');
  addToken({
    id: newTokenId(), name: summary.name, initials: initials(summary.name),
    color: summary.color || '#c9a227', team: 'party', charId, size: 'medium',
    speedFt: characterSpeedFt(charId),
    col: spot.col, row: spot.row,
  });
}
function addFriendlyToken(name, color, size) {
  const label = uniqueName(name, 'party');
  const spot = nextSpot('party');
  addToken({
    id: newTokenId(), name: label, initials: initials(label),
    color: color || '#4a7a9e', team: 'party', charId: null, size: size || 'medium',
    col: spot.col, row: spot.row,
  });
}
function addEnemyTokens(name, color, size, count) {
  count = Math.max(1, Math.min(20, Number(count) || 1));
  for (let i = 0; i < count; i++) {
    const label = uniqueName(name, 'enemy');
    const spot = nextSpot('enemy');
    addTokenSilent({
      id: newTokenId(), name: label, initials: initials(label),
      color: color || '#b0392f', team: 'enemy', charId: null, size: size || 'medium',
      col: spot.col, row: spot.row,
    });
  }
  mapSave();
  renderTokens();
}
function removeToken(id) {
  MAP_TOKENS = MAP_TOKENS.filter(t => t.id !== id);
  if (selectedId === id) selectToken(null);
  mapSave();
  renderTokens();
}

function tokenEl(id) { return $(`.map-token[data-id="${id}"]`); }
// Multiple creatures sharing a hex (grapples, mounts, a crowded doorway) is legal in 5e — rather
// than blocking the move, fan overlapping tokens out a little so each stays visible and clickable.
function stackOffset(t) {
  const group = MAP_TOKENS.filter(x => x.col === t.col && x.row === t.row).sort((a, b) => a.id < b.id ? -1 : 1);
  if (group.length <= 1) return { dx: 0, dy: 0 };
  const idx = group.findIndex(x => x.id === t.id);
  const radius = Math.min(tokenRadius(t) * 0.55, HEX_S * 0.4);
  const angle = (Math.PI * 2 * idx) / group.length - Math.PI / 2;
  return { dx: Math.cos(angle) * radius, dy: Math.sin(angle) * radius };
}
function positionTokenEl(el, t) {
  const { x, y } = hexPixel(t.col, t.row);
  const r = tokenRadius(t);
  const off = stackOffset(t);
  el.style.left = (x + off.dx - r) + 'px';
  el.style.top = (y + off.dy - r) + 'px';
}
function renderTokens() {
  const layer = $('#mapTokenLayer');
  layer.innerHTML = '';
  MAP_TOKENS.forEach(t => {
    const el = document.createElement('div');
    const r = tokenRadius(t);
    el.className = 'map-token ' + t.team + (t.id === selectedId ? ' selected' : '');
    el.dataset.id = t.id;
    el.style.background = t.color;
    el.style.width = el.style.height = r * 2 + 'px';
    el.style.fontSize = Math.round(11 * Math.sqrt(SIZE_SCALE[t.size] || 1)) + 'px';
    el.title = t.name + (t.size && t.size !== 'medium' ? ` (${sizeLabel(t.size)})` : '');
    el.textContent = t.initials;
    positionTokenEl(el, t);
    wireTokenPointer(el, t);
    layer.appendChild(el);
  });
  updateDistanceLabels();
}

// ---- Selection / distance labels ----
let selectedId = null;
let moveOrigin = null; // token's hex at the moment it was selected, for the movement-preview badge
function selectToken(id) {
  selectedId = id;
  $$('.map-token').forEach(el => el.classList.toggle('selected', el.dataset.id === id));
  const bar = $('#mapSelectedBar');
  if (id) {
    const t = MAP_TOKENS.find(x => x.id === id);
    bar.classList.add('open');
    $('#mapSelectedName').textContent = t ? t.name : '';
    moveOrigin = t ? { col: t.col, row: t.row } : null;
  } else {
    bar.classList.remove('open');
    moveOrigin = null;
    $('#mapMoveBadge').style.display = 'none';
  }
  updateDistanceLabels();
}
// Live "how far would this move be" readout that follows the cursor while a token is selected —
// covers both the hover-before-tap and mid-drag cases, so you can see the ft before committing.
function updateMoveBadge(clientX, clientY) {
  const badge = $('#mapMoveBadge');
  if (!selectedId || !moveOrigin) { badge.style.display = 'none'; return; }
  const rect = $('#mapStage').getBoundingClientRect();
  if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
    badge.style.display = 'none';
    return;
  }
  const m = clientToMap(clientX, clientY);
  const hex = nearestHex(m.x, m.y);
  const ft = hexDistance(moveOrigin, hex) * FT_PER_HEX;
  const t = MAP_TOKENS.find(x => x.id === selectedId);
  badge.textContent = ft + ' ft';
  badge.classList.remove('in-budget', 'over-budget');
  if (t && t.speedFt) badge.classList.add(ft > t.speedFt ? 'over-budget' : 'in-budget');
  badge.style.left = (clientX - rect.left + 16) + 'px';
  badge.style.top = (clientY - rect.top - 32) + 'px';
  badge.style.display = 'block';
}
function updateDistanceLabels() {
  const g = $('#mapMeasureLayer');
  if (!g) return;
  g.innerHTML = '';
  if (!selectedId) return;
  const sel = MAP_TOKENS.find(t => t.id === selectedId);
  if (!sel) return;
  const a = hexPixel(sel.col, sel.row);
  MAP_TOKENS.forEach(t => {
    if (t.id === sel.id) return;
    const b = hexPixel(t.col, t.row);
    const ft = hexDistance(sel, t) * FT_PER_HEX;
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    g.innerHTML +=
      `<line class="map-dist-line" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"></line>
       <g class="map-dist-label" transform="translate(${mx},${my})">
         <rect x="-20" y="-10" width="40" height="20" rx="6"></rect>
         <text x="0" y="4" text-anchor="middle">${ft} ft</text>
       </g>`;
  });
}

// ---- Measure tool (standalone ruler, no token needed) ----
let measureMode = false, measureA = null;
function toggleMeasure(on) {
  measureMode = on !== undefined ? on : !measureMode;
  $('#mapMeasureBtn').classList.toggle('active', measureMode);
  measureA = null;
  clearMeasureRuler();
  if (measureMode) selectToken(null);
}
function clearMeasureRuler() {
  const g = $('#mapMeasureLayer');
  if (g) g.querySelectorAll('.map-ruler').forEach(n => n.remove());
}
function measureTap(col, row) {
  const g = $('#mapMeasureLayer');
  if (!measureA) {
    measureA = { col, row };
    clearMeasureRuler();
    const p = hexPixel(col, row);
    g.innerHTML += `<circle class="map-ruler" cx="${p.x}" cy="${p.y}" r="6"></circle>`;
    return;
  }
  const b = { col, row };
  const ft = hexDistance(measureA, b) * FT_PER_HEX;
  const a = hexPixel(measureA.col, measureA.row), p = hexPixel(b.col, b.row);
  clearMeasureRuler();
  const mx = (a.x + p.x) / 2, my = (a.y + p.y) / 2;
  g.innerHTML +=
    `<circle class="map-ruler" cx="${a.x}" cy="${a.y}" r="6"></circle>
     <line class="map-ruler map-dist-line" x1="${a.x}" y1="${a.y}" x2="${p.x}" y2="${p.y}"></line>
     <circle class="map-ruler" cx="${p.x}" cy="${p.y}" r="6"></circle>
     <g class="map-ruler map-dist-label" transform="translate(${mx},${my})">
       <rect x="-22" y="-11" width="44" height="22" rx="6"></rect>
       <text x="0" y="4" text-anchor="middle">${ft} ft</text>
     </g>`;
  measureA = b; // chain: next tap measures from this point
}

// ---- Pointer interaction ----
const DRAG_THRESHOLD = 6;

function wireTokenPointer(el, t) {
  const r = tokenRadius(t);
  let startX = 0, startY = 0, dragging = false;
  el.addEventListener('pointerdown', e => {
    e.stopPropagation();
    el.setPointerCapture(e.pointerId);
    startX = e.clientX; startY = e.clientY; dragging = false;
  });
  el.addEventListener('pointermove', e => {
    if (!el.hasPointerCapture(e.pointerId)) return;
    if (!dragging && Math.hypot(e.clientX - startX, e.clientY - startY) > DRAG_THRESHOLD) {
      dragging = true;
      if (measureMode) toggleMeasure(false);
      selectToken(t.id);
    }
    if (dragging) {
      const m = clientToMap(e.clientX, e.clientY);
      el.style.left = (m.x - r) + 'px';
      el.style.top = (m.y - r) + 'px';
      const live = MAP_TOKENS.find(x => x.id === t.id);
      const hex = nearestHex(m.x, m.y);
      live.col = hex.col; live.row = hex.row;
      updateDistanceLabels();
      updateMoveBadge(e.clientX, e.clientY);
    }
  });
  el.addEventListener('pointerup', e => {
    if (!el.hasPointerCapture(e.pointerId)) return;
    el.releasePointerCapture(e.pointerId);
    if (dragging) {
      mapSave();
      dragging = false;
      renderTokens(); // re-lay-out everyone in case the drop landed on an occupied hex
      selectToken(null); // a completed drag is a finished move, not a pending tap-to-move
      return;
    }
    // Plain tap: measure-mode -> pick point; else toggle selection for tap-to-move.
    if (measureMode) { measureTap(t.col, t.row); return; }
    if (selectedId === t.id) { selectToken(null); return; }
    if (selectedId) {
      // Another token is already pending a move — tapping this one completes the move onto its
      // hex (sharing a space is legal in 5e) instead of just switching selection to it, since this
      // token's element would otherwise swallow every tap aimed at an occupied destination.
      const moving = MAP_TOKENS.find(x => x.id === selectedId);
      moving.col = t.col; moving.row = t.row;
      mapSave();
      renderTokens();
      selectToken(null);
      return;
    }
    selectToken(t.id);
  });
}

function wireStagePointer() {
  const stage = $('#mapStage');
  let startX = 0, startY = 0, panning = false, startTx = 0, startTy = 0, pointerId = null;
  stage.addEventListener('pointerdown', e => {
    if (e.target.closest('.map-token')) return;
    pointerId = e.pointerId;
    stage.setPointerCapture(pointerId);
    startX = e.clientX; startY = e.clientY; panning = false;
    startTx = view.tx; startTy = view.ty;
  });
  stage.addEventListener('pointermove', e => {
    if (pointerId === null || !stage.hasPointerCapture(e.pointerId)) return;
    const dx = e.clientX - startX, dy = e.clientY - startY;
    if (!panning && Math.hypot(dx, dy) > DRAG_THRESHOLD) panning = true;
    if (panning) {
      view.tx = startTx + dx; view.ty = startTy + dy;
      applyTransform();
    }
  });
  stage.addEventListener('pointerup', e => {
    if (pointerId === null) return;
    stage.releasePointerCapture(pointerId);
    const wasPanning = panning;
    pointerId = null; panning = false;
    if (wasPanning) return;
    // Plain tap on empty grid/background.
    const m = clientToMap(e.clientX, e.clientY);
    const hex = nearestHex(m.x, m.y);
    if (measureMode) { measureTap(hex.col, hex.row); return; }
    if (selectedId) {
      const t = MAP_TOKENS.find(x => x.id === selectedId);
      t.col = hex.col; t.row = hex.row;
      mapSave();
      renderTokens(); // re-lay-out everyone in case the destination hex was occupied
      selectToken(null);
    }
  });
  stage.addEventListener('wheel', e => {
    e.preventDefault();
    const rect = stage.getBoundingClientRect();
    zoomAt(e.clientX - rect.left, e.clientY - rect.top, e.deltaY < 0 ? 1.1 : 1 / 1.1);
  }, { passive: false });

  // Movement-preview badge: hovering with a token selected previews the ft before you commit.
  stage.addEventListener('pointermove', e => updateMoveBadge(e.clientX, e.clientY));
  stage.addEventListener('pointerleave', () => { $('#mapMoveBadge').style.display = 'none'; });
}

// ---- Toolbar wiring ----
// Quick-add the character currently being played, optionally the rest of the saved roster, and a
// custom-friendly form for allies (hirelings, NPCs) that aren't full character sheets.
function renderAllyDropdown() {
  const dd = $('#mapAllyDropdown');
  const placed = new Set(MAP_TOKENS.map(t => t.charId).filter(Boolean));
  const activeId = ROSTER.active;
  let html = '';
  if (activeId && !placed.has(activeId)) {
    const s = charSummary(activeId);
    html += `<button class="map-dropdown-item map-dropdown-current" data-charid="${activeId}"><i style="background:${s.color}"></i>Add ${esc(s.name)} <small>(current)</small></button>`;
  }
  const others = ROSTER.list.filter(id => id !== activeId && !placed.has(id));
  if (others.length) {
    html += `<div class="map-dropdown-sep">Other saved characters</div>`;
    html += others.map(id => {
      const s = charSummary(id);
      return `<button class="map-dropdown-item" data-charid="${id}"><i style="background:${s.color}"></i>${esc(s.name)}</button>`;
    }).join('');
  }
  if (!html) html = `<div class="map-dropdown-empty">All your characters are on the map</div>`;
  html += `<div class="map-dropdown-sep">Custom friendly</div>
    <div class="map-inline-form">
      <input type="text" id="mapFriendName" placeholder="Name (e.g. Hired guard)" maxlength="30">
      <input type="color" id="mapFriendColor" value="#4a7a9e" title="Token color">
      <select id="mapFriendSize" title="Size"></select>
      <button class="icon-btn sm" id="mapFriendAdd">Add</button>
    </div>`;
  dd.innerHTML = html;
  populateSizeSelect($('#mapFriendSize'));
  dd.querySelectorAll('.map-dropdown-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.charid;
      addPlayerToken(id, charSummary(id));
      dd.classList.remove('open');
    });
  });
  $('#mapFriendAdd').addEventListener('click', () => {
    addFriendlyToken($('#mapFriendName').value, $('#mapFriendColor').value, $('#mapFriendSize').value);
    dd.classList.remove('open');
  });
  $('#mapFriendName').addEventListener('keydown', e => { if (e.key === 'Enter') $('#mapFriendAdd').click(); });
}

function wireMapToolbar() {
  $('#mapBtn').addEventListener('click', openMap);
  $('#mapClose').addEventListener('click', closeMap);
  $('#battleMap').addEventListener('click', e => { if (e.target.id === 'battleMap') closeMap(); });

  $('#mapAddAllyBtn').addEventListener('click', () => {
    renderAllyDropdown();
    $('#mapAllyDropdown').classList.toggle('open');
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.map-add-ally')) $('#mapAllyDropdown').classList.remove('open');
  });

  populateSizeSelect($('#mapEnemySize'));
  $('#mapAddEnemyBtn').addEventListener('click', () => $('#mapEnemyForm').classList.toggle('open'));
  $('#mapEnemyCancel').addEventListener('click', () => $('#mapEnemyForm').classList.remove('open'));
  $('#mapEnemyAdd').addEventListener('click', () => {
    addEnemyTokens($('#mapEnemyName').value, $('#mapEnemyColor').value, $('#mapEnemySize').value, $('#mapEnemyCount').value);
    $('#mapEnemyName').value = '';
    $('#mapEnemyCount').value = '1';
    $('#mapEnemyForm').classList.remove('open');
  });
  $('#mapEnemyName').addEventListener('keydown', e => { if (e.key === 'Enter') $('#mapEnemyAdd').click(); });

  $('#mapMeasureBtn').addEventListener('click', () => toggleMeasure());
  $('#mapZoomIn').addEventListener('click', () => { const r = $('#mapStage').getBoundingClientRect(); zoomAt(r.width / 2, r.height / 2, 1.2); });
  $('#mapZoomOut').addEventListener('click', () => { const r = $('#mapStage').getBoundingClientRect(); zoomAt(r.width / 2, r.height / 2, 1 / 1.2); });
  $('#mapZoomReset').addEventListener('click', fitView);

  $('#mapRemoveBtn').addEventListener('click', () => { if (selectedId) removeToken(selectedId); });

  $('#mapClearBtn').addEventListener('click', () => {
    if (!MAP_TOKENS.length) return;
    uiConfirm('Remove every token from the battle map? Characters themselves are untouched.',
      { title: 'Clear map', ok: 'Clear map', danger: true }).then(ok => {
      if (!ok) return;
      MAP_TOKENS = [];
      selectToken(null);
      mapSave();
      renderTokens();
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && $('#battleMap').classList.contains('open')) {
      if (measureMode) toggleMeasure(false);
      else if (selectedId) selectToken(null);
      else closeMap();
    }
  });
}

function openMap() {
  $('#battleMap').classList.add('open');
  renderTokens();
  requestAnimationFrame(fitView);
}
function closeMap() {
  $('#battleMap').classList.remove('open');
  toggleMeasure(false);
  selectToken(null);
}

function initMap() {
  mapLoad();
  renderGrid();
  wireStagePointer();
  wireMapToolbar();
}
initMap();
