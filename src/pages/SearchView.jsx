import { useState, useEffect, useMemo } from 'react';
import { useMusic } from '../context/MusicContext';
import { Search as SearchIcon, Play, Loader2, ListPlus, Plus, Globe, Filter, X, Disc3, Download, WifiOff } from 'lucide-react';
import { searchSongs } from '../utils/musicApi';
import { searchAll, INDUSTRIES } from '../utils/musicDiscoveryApi';
import { playlist } from '../data';
import { motion } from 'framer-motion';
import Skeleton from '../components/Skeleton';

const SearchView = ({ setCurrentView, setSelectedArtist, setSelectedAlbum }) => {
    const { 
        searchResults, 
        setSearchResults, 
        playSearchedSong, 
        addToQueue,
        openPlaylistModal,
        downloadSong,
        isSongDownloaded,
        isSongDownloading,
    } = useMusic();
    const [query, setQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [apiResults, setApiResults] = useState([]);
    const [apiSearching, setApiSearching] = useState(false);
    const [sourceFilter, setSourceFilter] = useState('all');
    const [industryFilter, setIndustryFilter] = useState('all');
    const [moodFilter, setMoodFilter] = useState('all');

    // Local search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.trim().length > 1) {
                setIsSearching(true);
                searchSongs(query).then(results => {
                    setSearchResults(results);
                    setIsSearching(false);
                });
            } else {
                setSearchResults([]);
            }
        }, 200);
        return () => clearTimeout(timer);
    }, [query, setSearchResults]);

    // Global search via iTunes
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.trim().length > 1) {
                setApiSearching(true);
                searchAll(query).then(results => {
                    setApiResults(results);
                    setApiSearching(false);
                }).catch(() => setApiSearching(false));
            } else {
                setApiResults([]);
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [query]);

    const allResults = useMemo(() => [
        ...searchResults.map(s => ({ ...s, source: 'local' })),
        ...apiResults.filter(a => !searchResults.some(l => String(l.id) === String(a.id))),
    ], [searchResults, apiResults]);

    // Normalize results with industry derived from genre/industry field
    const normalizedResults = useMemo(() => {
        return allResults.map(song => {
            let industry = song.industry || '';
            if (!industry && song.genre) {
                const g = song.genre.toLowerCase();
                const matched = INDUSTRIES.find(ind =>
                    ind.query.split(' ').some(w => g.includes(w)) ||
                    g.includes(ind.label.toLowerCase())
                );
                if (matched) industry = matched.id;
            }
            return { ...song, industry };
        });
    }, [allResults]);

    // Available filter options
    const filterOptions = useMemo(() => {
        const industries = new Set();
        const moods = new Set();
        normalizedResults.forEach(s => {
            if (s.industry) industries.add(s.industry);
            if (s.mood) moods.add(s.mood);
        });
        return {
            industries: [...industries].sort(),
            moods: [...moods].sort(),
        };
    }, [normalizedResults]);

    // Apply filters
    const filteredResults = useMemo(() => {
        return normalizedResults.filter(s => {
            if (sourceFilter !== 'all' && s.source !== sourceFilter) return false;
            if (industryFilter !== 'all' && s.industry !== industryFilter) return false;
            if (moodFilter !== 'all' && s.mood !== moodFilter) return false;
            return true;
        });
    }, [normalizedResults, sourceFilter, industryFilter, moodFilter]);

    const hasActiveFilter = sourceFilter !== 'all' || industryFilter !== 'all' || moodFilter !== 'all';

    const clearFilters = () => {
        setSourceFilter('all');
        setIndustryFilter('all');
        setMoodFilter('all');
    };

    const genres = [
        { name: 'Pop', color: 'from-pink-500 to-rose-500' },
        { name: 'Hip-Hop', color: 'from-orange-500 to-amber-500' },
        { name: 'Indie', color: 'from-emerald-500 to-teal-500' },
        { name: 'Rock', color: 'from-red-600 to-red-800' },
        { name: 'Chill', color: 'from-blue-500 to-indigo-500' },
        { name: 'Workout', color: 'from-cyan-500 to-blue-600' },
        { name: 'Focus', color: 'from-violet-500 to-purple-600' },
        { name: 'Jazz', color: 'from-yellow-600 to-yellow-800' },
    ];

    return (
        <div className="pb-24 pt-2 md:pt-4 space-y-6 md:space-y-8 h-full overflow-y-auto no-scrollbar px-3 md:px-6">
            
            {/* Search Input Hero */}
            <div className="relative max-w-2xl mx-auto group">
                <div className="relative flex items-center bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-5 py-3 md:px-6 md:py-4 transition-all group-focus-within:bg-white/10 group-focus-within:border-white/20 shadow-xl">
                    {isSearching || apiSearching ? (
                        <Loader2 className="text-cyan-400 mr-3 md:mr-4 animate-spin" size={20} />
                    ) : (
                        <SearchIcon className="text-zinc-500 mr-3 md:mr-4 group-focus-within:text-white transition-colors" size={20} />
                    )}
                    <input 
                        type="text" 
                        placeholder="Search across all industries worldwide..." 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full bg-transparent text-white text-base md:text-lg placeholder:text-zinc-500 focus:outline-none font-medium" 
                    />
                </div>
            </div>

            {query ? (
                <div className="space-y-4">
                     {/* Header */}
                     <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">
                            Results: <span className="text-cyan-400">{filteredResults.length}</span>
                            {filteredResults.length !== allResults.length && (
                                <span className="text-sm text-zinc-500 font-normal ml-2">(filtered from {allResults.length})</span>
                            )}
                        </h2>
                        {(isSearching || apiSearching) && <span className="text-xs text-zinc-500 animate-pulse">Searching global catalog...</span>}
                     </div>

                     {/* Filter Bar */}
                     {allResults.length > 0 && (
                        <div className="flex flex-wrap items-center gap-3 bg-white/5 rounded-2xl p-3 border border-white/5">
                            <Filter size={14} className="text-zinc-500 shrink-0" />
                            {/* Source filter */}
                            <div className="flex gap-1 bg-black/20 rounded-lg p-0.5">
                                {['all', 'local', 'itunes'].map(src => (
                                    <button
                                        key={src}
                                        onClick={() => setSourceFilter(src)}
                                        className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                                            sourceFilter === src
                                                ? 'bg-cyan-500/20 text-cyan-400'
                                                : 'text-zinc-500 hover:text-white'
                                        }`}
                                    >
                                        {src === 'all' ? 'All' : src === 'local' ? 'Local' : 'iTunes'}
                                    </button>
                                ))}
                            </div>
                            {/* Industry chips */}
                            {filterOptions.industries.length > 1 && (
                                <div className="flex gap-1.5 overflow-x-auto no-scrollbar max-w-[40vw]">
                                    <button
                                        onClick={() => setIndustryFilter('all')}
                                        className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                                            industryFilter === 'all'
                                                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                                                : 'text-zinc-500 border-white/5 hover:text-white hover:border-white/10'
                                        }`}
                                    >
                                        All Industries
                                    </button>
                                    {filterOptions.industries.map(ind => {
                                        const info = INDUSTRIES.find(i => i.id === ind);
                                        return (
                                            <button
                                                key={ind}
                                                onClick={() => setIndustryFilter(industryFilter === ind ? 'all' : ind)}
                                                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                                                    industryFilter === ind
                                                        ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                                                        : 'text-zinc-500 border-white/5 hover:text-white hover:border-white/10'
                                                }`}
                                            >
                                                {info?.flag && <span>{info.flag}</span>}
                                                {info?.label || ind}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                            {/* Mood chips */}
                            {filterOptions.moods.length > 1 && (
                                <div className="flex gap-1.5 overflow-x-auto no-scrollbar max-w-[30vw]">
                                    <button
                                        onClick={() => setMoodFilter('all')}
                                        className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                                            moodFilter === 'all'
                                                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                                                : 'text-zinc-500 border-white/5 hover:text-white hover:border-white/10'
                                        }`}
                                    >
                                        All Moods
                                    </button>
                                    {filterOptions.moods.map(mood => (
                                        <button
                                            key={mood}
                                            onClick={() => setMoodFilter(moodFilter === mood ? 'all' : mood)}
                                            className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize whitespace-nowrap transition-all border ${
                                                moodFilter === mood
                                                    ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                                                    : 'text-zinc-500 border-white/5 hover:text-white hover:border-white/10'
                                            }`}
                                        >
                                            {mood}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {hasActiveFilter && (
                                <button onClick={clearFilters} className="text-zinc-500 hover:text-white transition-colors" title="Clear filters">
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                     )}

                     {/* Results Grid */}
                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                        {(isSearching && query) ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="space-y-4">
                                    <Skeleton className="aspect-square rounded-2xl" />
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                            ))
                        ) : (
                            filteredResults.map((song) => (
                                <motion.div 
                                    key={song.id} 
                                    whileHover={{ y: -8, scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    onClick={() => playSearchedSong(song)}
                                    className="bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 p-3 md:p-4 rounded-2xl transition-all cursor-pointer group backdrop-blur-md shadow-lg flex flex-col"
                                >
                                <div className="relative mb-3 md:mb-4 w-full aspect-square">
                                    <img src={song.image || '/img/default.png'} alt={song.name} className="w-full h-full object-cover rounded-xl shadow-lg group-hover:shadow-cyan-500/20 transition-all" onError={(e) => { e.target.src = '/img/default.png'; }} />
                                    <div className="absolute bottom-2 right-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex gap-1.5">
                                        {!isSongDownloaded(song.id) && !isSongDownloading(song.id) && (
                                            <button 
                                                onClick={async (e) => { e.stopPropagation(); await downloadSong(song); }}
                                                className="bg-zinc-800/80 backdrop-blur-md rounded-full p-1.5 shadow-xl hover:scale-110 hover:bg-white hover:text-black text-white transition-all"
                                                title="Save Offline"
                                            >
                                                <Download size={12} />
                                            </button>
                                        )}
                                        {isSongDownloading(song.id) && (
                                            <span className="bg-cyan-500/20 backdrop-blur-md rounded-full p-1.5 shadow-xl animate-pulse">
                                                <Loader2 size={12} className="text-cyan-400 animate-spin" />
                                            </span>
                                        )}
                                        {isSongDownloaded(song.id) && (
                                            <span className="bg-emerald-500/20 backdrop-blur-md rounded-full p-1.5 shadow-xl" title="Available Offline">
                                                <WifiOff size={12} className="text-emerald-400" />
                                            </span>
                                        )}
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); addToQueue(song); }}
                                            className="bg-zinc-800/80 backdrop-blur-md rounded-full p-1.5 shadow-xl hover:scale-110 hover:bg-white hover:text-black text-white transition-all"
                                            title="Add to Queue"
                                        >
                                            <ListPlus size={12} />
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); openPlaylistModal(song.id); }}
                                            className="bg-zinc-800/80 backdrop-blur-md rounded-full p-1.5 shadow-xl hover:scale-110 hover:bg-white hover:text-black text-white transition-all"
                                            title="Add to Playlist"
                                        >
                                            <Plus size={12} />
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); playSearchedSong(song); }}
                                            className="bg-cyan-400 rounded-full p-1.5 shadow-xl hover:scale-110 hover:bg-white text-black transition-all"
                                            title="Play Now"
                                        >
                                            <Play size={12} fill="currentColor" stroke="currentColor" />
                                        </button>
                                    </div>
                                    {song.source === 'itunes' && (
                                        <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-[8px] px-1.5 py-0.5 rounded font-bold text-zinc-300 flex items-center gap-1">
                                            PREVIEW <span className="text-cyan-400">30s</span>
                                        </span>
                                    )}
                                    {song.album && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); const albumTracks = allResults.filter(t => t.album === song.album); setSelectedAlbum({ name: song.album, artist: song.artist, image: song.image, tracks: albumTracks }); setCurrentView('album'); }}
                                            className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-[8px] px-1.5 py-0.5 rounded font-bold text-zinc-300 hover:text-cyan-400 transition-colors truncate max-w-[100px]"
                                            title={song.album}
                                        >
                                            {song.album}
                                        </button>
                                    )}
                                    {!song.album && song.industry && (() => {
                                        const info = INDUSTRIES.find(i => i.id === song.industry);
                                        return info ? (
                                            <span className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-[8px] px-1.5 py-0.5 rounded font-bold text-zinc-300 flex items-center gap-1">
                                                {info.flag} {info.label}
                                            </span>
                                        ) : null;
                                    })()}
                                </div>
                                <h3 className="font-bold truncate text-sm md:text-base text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight">
                                    {song.name}
                                </h3>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setSelectedArtist(song.artist); setCurrentView('artist'); }}
                                    className="text-xs text-zinc-500 truncate hover:text-cyan-400 transition-colors text-left"
                                >
                                    {song.artist}
                                </button>
                            </motion.div>
                        ))
                    )}
                        
                        {!isSearching && !apiSearching && query && filteredResults.length === 0 && (
                            <div className="col-span-full text-center py-20 bg-white/5 rounded-3xl border border-white/5">
                                <SearchIcon size={48} className="mx-auto text-zinc-700 mb-4" />
                                <p className="text-zinc-500 text-lg">
                                    {allResults.length === 0
                                        ? `No results found for "${query}"`
                                        : `No results match the selected filters`}
                                </p>
                                <p className="text-zinc-600 text-sm mt-2">
                                    {allResults.length === 0
                                        ? 'Try searching for something else'
                                        : 'Try changing or clearing the filters above'}
                                </p>
                                {hasActiveFilter && (
                                    <button onClick={clearFilters} className="mt-4 px-4 py-2 bg-white/10 rounded-full text-sm font-bold text-white hover:bg-white/20 transition-all">
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        )}
                     </div>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Industry Quick Browse */}
                    <div className="bg-white/5 border border-white/5 rounded-2xl md:rounded-[2rem] p-4 md:p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Globe size={18} className="text-cyan-400" />
                            <h2 className="text-lg font-black text-white uppercase tracking-tight">Browse by Industry</h2>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {INDUSTRIES.map(ind => (
                                <button
                                    key={ind.id}
                                    onClick={() => { setQuery(ind.label); setShowGlobal(true); }}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10 hover:text-white`}
                                >
                                    <span>{ind.flag}</span>
                                    {ind.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Browse Artists */}
                    <div>
                        <h2 className="text-lg font-black text-white uppercase tracking-tight mb-3 px-2 flex items-center gap-2">
                            <Disc3 size={16} className="text-cyan-400" /> Artists
                        </h2>
                        <div className="flex flex-wrap gap-2 px-2">
                            {[...new Set(playlist.map(s => s.artist))].map(artist => (
                                <button
                                    key={artist}
                                    onClick={() => { setSelectedArtist(artist); setCurrentView('artist'); }}
                                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-xs font-bold text-zinc-400 hover:text-white transition-all"
                                >
                                    {artist}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Genre Cards */}
                    <h2 className="text-2xl font-bold px-2">Browse by Genre</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {genres.map((genre, i) => (
                            <motion.div 
                                key={i} 
                                whileHover={{ scale: 1.05, y: -5, rotateZ: 1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setQuery(genre.name)}
                                className={`aspect-[4/3] rounded-2xl p-4 md:p-6 font-bold text-lg md:text-xl relative overflow-hidden cursor-pointer bg-gradient-to-br ${genre.color} shadow-lg group`}
                            >
                                <span className="relative z-10 text-white drop-shadow-md">{genre.name}</span>
                                <div className="absolute -bottom-4 -right-4 w-20 h-20 md:w-24 md:h-24 bg-white/20 rotate-[25deg] rounded-2xl blur-sm group-hover:rotate-12 transition-transform duration-500" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchView;
