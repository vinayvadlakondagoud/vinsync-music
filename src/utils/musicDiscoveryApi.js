const ITUNES_API = 'https://itunes.apple.com/search';
const CACHE_DURATION = 1000 * 60 * 30;

const INDUSTRIES = [
  { id: 'bollywood', label: 'Bollywood', query: 'bollywood hindi song', color: 'from-orange-500 to-red-600', flag: '🇮🇳' },
  { id: 'hollywood', label: 'Hollywood', query: 'pop rock hit', color: 'from-blue-500 to-purple-600', flag: '🇺🇸' },
  { id: 'tollywood', label: 'Tollywood', query: 'telugu song', color: 'from-yellow-500 to-red-500', flag: '🇮🇳' },
  { id: 'kollywood', label: 'Kollywood', query: 'tamil song', color: 'from-red-600 to-orange-500', flag: '🇮🇳' },
  { id: 'mollywood', label: 'Mollywood', query: 'malayalam song', color: 'from-green-500 to-emerald-600', flag: '🇮🇳' },
  { id: 'sandalwood', label: 'Sandalwood', query: 'kannada song', color: 'from-amber-500 to-yellow-600', flag: '🇮🇳' },
  { id: 'pollywood', label: 'Pollywood', query: 'punjabi song', color: 'from-lime-500 to-green-600', flag: '🇮🇳' },
  { id: 'bhojpuri', label: 'Bhojpuri', query: 'bhojpuri song', color: 'from-rose-500 to-pink-600', flag: '🇮🇳' },
  { id: 'marathi', label: 'Marathi', query: 'marathi song', color: 'from-indigo-500 to-violet-600', flag: '🇮🇳' },
  { id: 'gujarati', label: 'Gujarati', query: 'gujarati song', color: 'from-teal-500 to-cyan-600', flag: '🇮🇳' },
  { id: 'bengali', label: 'Bengali', query: 'bengali song', color: 'from-sky-400 to-indigo-500', flag: '🇮🇳' },
  { id: 'pakistani', label: 'Pakistani', query: 'pakistani song', color: 'from-emerald-500 to-teal-600', flag: '🇵🇰' },
  { id: 'nepali', label: 'Nepali', query: 'nepali song', color: 'from-red-500 to-blue-600', flag: '🇳🇵' },
  { id: 'kpop', label: 'K-Pop', query: 'kpop korean song', color: 'from-pink-400 to-purple-500', flag: '🇰🇷' },
  { id: 'jpop', label: 'J-Pop', query: 'jpop japanese song', color: 'from-red-400 to-white', flag: '🇯🇵' },
  { id: 'afrobeats', label: 'Afrobeats', query: 'afrobeats nigerian song', color: 'from-green-600 to-yellow-500', flag: '🇳🇬' },
  { id: 'latin', label: 'Latin', query: 'latin reggaeton song', color: 'from-red-500 to-yellow-400', flag: '🇪🇸' },
  { id: 'arabic', label: 'Arabic', query: 'arabic song', color: 'from-green-500 to-red-600', flag: '🇸🇦' },
  { id: 'russian', label: 'Russian', query: 'russian pop song', color: 'from-blue-500 to-red-500', flag: '🇷🇺' },
  { id: 'chinese', label: 'Chinese', query: 'chinese pop song', color: 'from-red-600 to-yellow-500', flag: '🇨🇳' },
];

const getCacheKey = (key) => `vini_cache_${key}`;

const loadCache = (key) => {
  try {
    const raw = localStorage.getItem(getCacheKey(key));
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_DURATION) {
      localStorage.removeItem(getCacheKey(key));
      return null;
    }
    return data;
  } catch { return null; }
};

const saveCache = (key, data) => {
  try {
    localStorage.setItem(getCacheKey(key), JSON.stringify({ data, ts: Date.now() }));
  } catch { /* ignore */ }
};

const searchiTunes = async (term, limit = 25) => {
  const cacheKey = `itunes_${term}_${limit}`;
  const cached = loadCache(cacheKey);
  if (cached) return cached;

  const url = `${ITUNES_API}?term=${encodeURIComponent(term)}&limit=${limit}&media=music&entity=song`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('iTunes API failed');
  const json = await res.json();

  const results = (json.results || [])
    .filter(item => item.previewUrl)
    .map(item => ({
      id: `itunes_${item.trackId}`,
      name: item.trackName,
      artist: item.artistName,
      album: item.collectionName || '',
      image: item.artworkUrl100?.replace('100x100', '400x400') || '',
      audio: item.previewUrl,
      genre: item.primaryGenreName || '',
      source: 'itunes',
    }));

  saveCache(cacheKey, results);
  return results;
};

const fetchIndustrySongs = async (industryId) => {
  const industry = INDUSTRIES.find(i => i.id === industryId);
  if (!industry) return [];
  return searchiTunes(industry.query, 25);
};

const fetchAllIndustries = async () => {
  const results = {};
  const batches = [];
  for (let i = 0; i < INDUSTRIES.length; i += 4) {
    batches.push(INDUSTRIES.slice(i, i + 4));
  }
  for (const batch of batches) {
    const promises = batch.map(ind => fetchIndustrySongs(ind.id).then(songs => ({ id: ind.id, songs })));
    const settled = await Promise.allSettled(promises);
    settled.forEach(r => {
      if (r.status === 'fulfilled') results[r.value.id] = r.value.songs;
    });
  }
  return results;
};

const searchAll = async (query) => {
  return searchiTunes(query, 50);
};

export {
  INDUSTRIES,
  searchiTunes,
  fetchIndustrySongs,
  fetchAllIndustries,
  searchAll,
};
