const DB_NAME = 'vini_offline';
const DB_VERSION = 1;
const AUDIO_STORE = 'audio';
const META_STORE = 'metadata';

const openDB = () => new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(AUDIO_STORE)) {
            db.createObjectStore(AUDIO_STORE, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(META_STORE)) {
            db.createObjectStore(META_STORE, { keyPath: 'id' });
        }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
});

const STORAGE_QUOTA = 50 * 1024 * 1024;

const getStorageUsage = async () => {
    const db = await openDB();
    const tx = db.transaction(AUDIO_STORE, 'readonly');
    const store = tx.objectStore(AUDIO_STORE);
    const all = await new Promise((resolve) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result);
    });
    db.close();
    return all.reduce((sum, entry) => sum + (entry.blob?.size || 0), 0);
};

const saveAudio = async (id, blob, metadata) => {
    const usage = await getStorageUsage();
    if (usage + blob.size > STORAGE_QUOTA) {
        throw new Error('Storage full. Free up space first.');
    }
    const db = await openDB();
    const tx = db.transaction([AUDIO_STORE, META_STORE], 'readwrite');
    tx.objectStore(AUDIO_STORE).put({ id, blob, savedAt: Date.now() });
    tx.objectStore(META_STORE).put({ id, ...metadata, savedAt: Date.now() });
    await new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
    });
    db.close();
};

const getAudioBlob = async (id) => {
    const db = await openDB();
    const tx = db.transaction(AUDIO_STORE, 'readonly');
    const req = tx.objectStore(AUDIO_STORE).get(id);
    const result = await new Promise((resolve) => { req.onsuccess = () => resolve(req.result); });
    db.close();
    return result?.blob || null;
};

const getAudioUrl = async (id) => {
    const blob = await getAudioBlob(id);
    if (!blob) return null;
    return URL.createObjectURL(blob);
};

const removeAudio = async (id) => {
    const db = await openDB();
    const tx = db.transaction([AUDIO_STORE, META_STORE], 'readwrite');
    tx.objectStore(AUDIO_STORE).delete(id);
    tx.objectStore(META_STORE).delete(id);
    await new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
    });
    db.close();
};

const getDownloadedSongs = async () => {
    const db = await openDB();
    const tx = db.transaction(META_STORE, 'readonly');
    const req = tx.objectStore(META_STORE).getAll();
    const result = await new Promise((resolve) => { req.onsuccess = () => resolve(req.result); });
    db.close();
    return result || [];
};

const isDownloaded = async (id) => {
    const db = await openDB();
    const tx = db.transaction(META_STORE, 'readonly');
    const req = tx.objectStore(META_STORE).get(id);
    const result = await new Promise((resolve) => { req.onsuccess = () => resolve(req.result); });
    db.close();
    return !!result;
};

const clearAll = async () => {
    const db = await openDB();
    const tx = db.transaction([AUDIO_STORE, META_STORE], 'readwrite');
    tx.objectStore(AUDIO_STORE).clear();
    tx.objectStore(META_STORE).clear();
    await new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
    });
    db.close();
};

const fetchAndStoreAudio = async (song, onProgress) => {
    const id = String(song.id);
    const isOffline = await isDownloaded(id);
    if (isOffline) return;

    const response = await fetch(song.audio);
    if (!response.ok) throw new Error('Failed to fetch audio');

    const reader = response.body.getReader();
    const contentLength = Number(response.headers.get('Content-Length')) || 0;
    const chunks = [];
    let loaded = 0;

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        loaded += value.length;
        if (onProgress && contentLength > 0) {
            onProgress(loaded / contentLength);
        }
    }

    const blob = new Blob(chunks, { type: response.headers.get('Content-Type') || 'audio/mpeg' });
    await saveAudio(id, blob, {
        name: song.name,
        artist: song.artist,
        image: song.image,
        industry: song.industry || '',
        mood: song.mood || '',
        genre: song.genre || '',
        source: song.source || 'local',
        album: song.album || '',
    });
};

export {
    saveAudio,
    getAudioBlob,
    getAudioUrl,
    removeAudio,
    getDownloadedSongs,
    isDownloaded,
    clearAll,
    fetchAndStoreAudio,
    getStorageUsage,
};
