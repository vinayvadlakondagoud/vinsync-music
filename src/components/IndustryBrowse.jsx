import { useState, useEffect, useCallback } from 'react';
import { useMusic } from '../context/MusicContext';
import { Play, Plus, Globe, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { INDUSTRIES, fetchIndustrySongs, searchAll } from '../utils/musicDiscoveryApi';
import { motion } from 'framer-motion';

const SONG_CACHE = {};

const IndustryBrowse = () => {
  const { playSearchedSong, addToQueue, openPlaylistModal } = useMusic();
  const [activeIndustry, setActiveIndustry] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const loadIndustry = useCallback(async (industryId) => {
    setActiveIndustry(industryId);
    setSearchQuery('');
    setSearchResults([]);

    if (SONG_CACHE[industryId]) {
      setSongs(SONG_CACHE[industryId]);
      return;
    }

    setLoading(true);
    try {
      const results = await fetchIndustrySongs(industryId);
      SONG_CACHE[industryId] = results;
      setSongs(results);
    } catch {
      setSongs([]);
    }
    setLoading(false);
  }, []);

  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query);
    if (query.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const results = await searchAll(query);
      setSearchResults(results);
    } catch { setSearchResults([]); }
    setSearching(false);
  }, []);

  useEffect(() => {
    if (searchQuery) return;
    if (!activeIndustry && !songs.length && INDUSTRIES.length) {
      loadIndustry('bollywood');
    }
  }, [activeIndustry, songs, loadIndustry, searchQuery]);

  const displaySongs = searchQuery ? searchResults : songs;

  return (
    <div className="space-y-6">
      {/* Global Search bar */}
      <div className="relative max-w-xl">
        <input
          type="text"
          placeholder="Search any industry, artist, or song worldwide..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400/50 text-sm"
        />
        {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400 animate-spin" size={16} />}
      </div>

      {/* Industry Chips */}
      <div className="flex flex-wrap gap-2">
        {INDUSTRIES.map(ind => (
          <button
            key={ind.id}
            onClick={() => loadIndustry(ind.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
              activeIndustry === ind.id && !searchQuery
                ? 'bg-cyan-400/20 text-cyan-400 border-cyan-400/30'
                : 'bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span>{ind.flag}</span>
            {ind.label}
          </button>
        ))}
      </div>

      {/* Active Industry Header */}
      {activeIndustry && !searchQuery && (
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${INDUSTRIES.find(i => i.id === activeIndustry)?.color} flex items-center justify-center`}>
            <Globe size={18} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{INDUSTRIES.find(i => i.id === activeIndustry)?.label} Hits</h3>
            <p className="text-[10px] text-zinc-500">30s previews from Apple Music</p>
          </div>
        </div>
      )}

      {/* Songs Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {displaySongs.slice(0, 20).map((song, i) => (
            <motion.div
              key={song.id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              whileHover={{ y: -6 }}
              onClick={() => playSearchedSong(song)}
              className="bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 p-3 rounded-2xl transition-all cursor-pointer group"
            >
              <div className="relative mb-3 aspect-square">
                <img
                  src={song.image || '/img/default.png'}
                  alt={song.name}
                  className="w-full h-full object-cover rounded-xl shadow-lg"
                  onError={(e) => { e.target.src = '/img/default.png'; }}
                />
                <div className="absolute bottom-2 right-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                  <button
                    onClick={(e) => { e.stopPropagation(); playSearchedSong(song); }}
                    className="bg-cyan-400 rounded-full p-2 shadow-xl hover:scale-110 text-black transition-all"
                  >
                    <Play size={14} fill="currentColor" />
                  </button>
                </div>
                {song.source === 'itunes' && (
                  <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-[8px] px-1.5 py-0.5 rounded font-bold text-zinc-300">
                    PREVIEW
                  </span>
                )}
              </div>
              <h4 className="font-bold text-xs text-white truncate group-hover:text-cyan-400 transition-colors">{song.name}</h4>
              <p className="text-[10px] text-zinc-400 truncate">{song.artist}</p>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && displaySongs.length === 0 && !searchQuery && (
        <div className="text-center py-16 text-zinc-500">
          <Globe size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-bold">Select an industry above to discover music</p>
          <p className="text-xs mt-1">Songs from Apple Music's global catalog</p>
        </div>
      )}

      {searchQuery && searchResults.length === 0 && !searching && (
        <div className="text-center py-16 text-zinc-500">
          <p className="font-bold">No results found</p>
          <p className="text-xs mt-1">Try a different search term</p>
        </div>
      )}
    </div>
  );
};

export default IndustryBrowse;
