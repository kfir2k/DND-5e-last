// ---------- Picture store: map and bestiary images, kept out of localStorage ----------
// localStorage holds about 5 MB for the whole app, and one map picture can be a megabyte on its own,
// so several maps plus creature portraits would crowd out the character sheets. Pictures live in
// IndexedDB instead (no practical size limit); the small text records that point at them (map names
// and pins, bestiary entries) stay in localStorage where the rest of the app can read them at once.
//
// A picture is stored as a data-URL string under a key such as 'map:<id>' or 'beast:<id>'.
// If IndexedDB is not available (some private-browsing modes), it falls back to one localStorage
// key per picture, so the feature still works for a few images instead of failing outright.
const MEDIA = (() => {
  const DB_NAME = 'dnd5e-binder-media', STORE = 'kv', LS_PREFIX = 'dnd5e-binder-media:';
  let dbPromise = null;
  function open() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      let req;
      try { req = indexedDB.open(DB_NAME, 1); } catch (e) { reject(e); return; }
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
      req.onblocked = () => reject(new Error('blocked'));
    });
    // A failed open must not be cached as "the database": later calls go to the fallback.
    dbPromise.catch(() => {});
    return dbPromise;
  }
  function tx(mode, fn) {
    return open().then(db => new Promise((resolve, reject) => {
      const t = db.transaction(STORE, mode), req = fn(t.objectStore(STORE));
      t.oncomplete = () => resolve(req && req.result);
      t.onerror = t.onabort = () => reject(t.error || new Error('transaction failed'));
    }));
  }
  return {
    get(key) {
      return tx('readonly', s => s.get(key))
        .then(v => v == null ? localStorage.getItem(LS_PREFIX + key) : v)
        .catch(() => { try { return localStorage.getItem(LS_PREFIX + key); } catch (e) { return null; } });
    },
    // Resolves true when the picture is safely stored, false when neither store would take it.
    set(key, value) {
      return tx('readwrite', s => s.put(value, key)).then(() => true)
        .catch(() => { try { localStorage.setItem(LS_PREFIX + key, value); return true; } catch (e) { return false; } });
    },
    del(key) {
      try { localStorage.removeItem(LS_PREFIX + key); } catch (e) {}
      return tx('readwrite', s => s.delete(key)).then(() => true).catch(() => false);
    },
  };
})();

// Read an image file and shrink it so its longest side is at most maxDim, as a JPEG data URL.
// Returns {url, w, h}. Shared by the map and the bestiary.
function mediaReadImage(file, maxDim, quality) {
  return new Promise((resolve, reject) => {
    if (!file || !/^image\//.test(file.type || '')) { reject(new Error('not an image')); return; }
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('bad image'));
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
        const w = Math.max(1, Math.round(img.naturalWidth * scale)), h = Math.max(1, Math.round(img.naturalHeight * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve({ url: canvas.toDataURL('image/jpeg', quality || 0.85), w, h });
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
