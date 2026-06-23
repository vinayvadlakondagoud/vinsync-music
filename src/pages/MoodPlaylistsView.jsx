import { useState, useMemo } from 'react';
import { useMusic } from '../context/MusicContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Shuffle, ListPlus, Plus, Heart, ArrowLeft, Sparkles, Music4 } from 'lucide-react';
import { playlist } from '../data';

const MOODS_CONFIG = [
    { id: 'chill', label: 'Chill', emoji: '😎', gradient: 'from-blue-500 to-cyan-400', desc: 'Relax and unwind' },
    { id: 'energetic', label: 'Energetic', emoji: '⚡', gradient: 'from-orange-500 to-red-500', desc: 'High energy bangers' },
    { id: 'romantic', label: 'Romantic', emoji: '❤️', gradient: 'from-pink-500 to-rose-400', desc: 'Love songs' },
    { id: 'dark', label: 'Dark', emoji: '🌙', gradient: 'from-purple-700 to-indigo-900', desc: 'Moody & atmospheric' },
    { id: 'happy', label: 'Happy', emoji: '🌈', gradient: 'from-yellow-400 to-green-400', desc: 'Feel good tunes' },
    { id: 'sad', label: 'Sad', emoji: '💧', gradient: 'from-slate-500 to-blue-900', desc: 'Emotional moments' },
    { id: 'focus', label: 'Focus', emoji: '🎯', gradient: 'from-emerald-500 to-teal-500', desc: 'Concentration mode' },
    { id: 'party', label: 'Party', emoji: '🎉', gradient: 'from-fuchsia-500 to-pink-600', desc: 'Turn up the volume' },
    { id: 'workout', label: 'Workout', emoji: '💪', gradient: 'from-red-600 to-orange-600', desc: 'Push your limits' },
];

const MoodPlaylistsView = () => {
    const { playSearchedSong, addToQueue, addSongToPlaylist, openPlaylistModal, likedSongs, toggleLike } = useMusic();
    const [selectedMood, setSelectedMood] = useState(null);
    const [playAllLoading, setPlayAllLoading] = useState(false);

    const moodSongs = useMemo(() => {
        const map = {};
        playlist.forEach(song => {
            const mood = song.mood || 'other';
            if (!map[mood]) map[mood] = [];
            map[mood].push(song);
        });
        return map;
    }, []);

    const moodData = useMemo(() => {
        return MOODS_CONFIG.map(m => ({
            ...m,
            songs: moodSongs[m.id] || [],
            count: (moodSongs[m.id] || []).length,
        }));
    }, [moodSongs]);

    const selectedMoodData = useMemo(() => {
        if (!selectedMood) return null;
        return moodData.find(m => m.id === selectedMood);
    }, [selectedMood, moodData]);

    const playAll = async (songs) => {
        if (songs.length === 0) return;
        setPlayAllLoading(true);
        playSearchedSong(songs[0]);
        songs.slice(1).forEach(s => addToQueue(s));
        setTimeout(() => setPlayAllLoading(false), 300);
    };

    const shufflePlay = async (songs) => {
        if (songs.length === 0) return;
        const copy = [...songs];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        setPlayAllLoading(true);
        playSearchedSong(copy[0]);
        copy.slice(1).forEach(s => addToQueue(s));
        setTimeout(() => setPlayAllLoading(false), 300);
    };

    return (
        <div className="h-full overflow-y-auto no-scrollbar pb-24">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-[#050505]/80 backdrop-blur-xl px-4 pt-4 pb-3 flex items-center gap-3">
                {selectedMood ? (
                    <>
                        <button onClick={() => setSelectedMood(null)} className="p-1.5 hover:bg-white/5 rounded-full transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-xl font-black text-white uppercase tracking-tight">{selectedMoodData?.label}</h1>
                            <p className="text-xs text-zinc-500">{selectedMoodData?.desc} · {selectedMoodData?.count} songs</p>
                        </div>
                    </>
                ) : (
                    <>
                        <Sparkles size={20} className="text-cyan-400" />
                        <div>
                            <h1 className="text-xl font-black text-white uppercase tracking-tight">Mood Playlists</h1>
                            <p className="text-xs text-zinc-500">Discover songs by your vibe</p>
                        </div>
                    </>
                )}
            </div>

            {!selectedMood ? (
                /* Mood Grid */
                <div className="px-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {moodData.map((mood, i) => (
                        <motion.button
                            key={mood.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => mood.count > 0 && setSelectedMood(mood.id)}
                            className={`relative overflow-hidden rounded-2xl p-4 text-left aspect-[4/3] bg-gradient-to-br ${mood.gradient} shadow-lg group ${
                                mood.count === 0 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.02] transition-transform'
                            }`}
                        >
                            <span className="text-2xl mb-2 block">{mood.emoji}</span>
                            <h3 className="font-black text-white text-lg uppercase tracking-tight">{mood.label}</h3>
                            <p className="text-white/70 text-xs mt-0.5">{mood.desc}</p>
                            <span className="absolute bottom-3 right-3 text-white/40 text-xs font-bold">
                                {mood.count} {mood.count === 1 ? 'song' : 'songs'}
                            </span>
                            <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
                        </motion.button>
                    ))}
                </div>
            ) : (
                /* Mood Detail */
                <div className="px-4 space-y-3">
                    {/* Actions */}
                    {selectedMoodData && selectedMoodData.count > 0 && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => playAll(selectedMoodData.songs)}
                                disabled={playAllLoading}
                                className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-black rounded-full text-xs font-bold hover:bg-cyan-400 transition-colors disabled:opacity-50"
                            >
                                <Play size={14} fill="currentColor" /> Play All
                            </button>
                            <button
                                onClick={() => shufflePlay(selectedMoodData.songs)}
                                disabled={playAllLoading}
                                className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-xs font-bold hover:bg-white/20 transition-colors disabled:opacity-50"
                            >
                                <Shuffle size={14} /> Shuffle
                            </button>
                        </div>
                    )}

                    {/* Song List */}
                    {selectedMoodData?.songs.map((song, i) => {
                        const isLiked = likedSongs.some(id => String(id) === String(song.id));
                        return (
                            <motion.div
                                key={song.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.03 }}
                                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer"
                                onClick={() => playSearchedSong(song)}
                            >
                                <span className="text-zinc-600 text-xs font-mono w-5 text-right">{i + 1}</span>
                                <img src={song.image} alt={song.name} className="w-10 h-10 rounded-lg object-cover" />
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-white truncate group-hover:text-cyan-400 transition-colors">{song.name}</h4>
                                    <p className="text-xs text-zinc-500 truncate">{song.artist}</p>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); addToQueue(song); }}
                                        className="p-1.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                                    >
                                        <ListPlus size={12} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); openPlaylistModal(song.id); }}
                                        className="p-1.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                                    >
                                        <Plus size={12} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleLike(song.id); }}
                                        className={`p-1.5 rounded-full transition-colors ${isLiked ? 'bg-pink-500/20 text-pink-400' : 'bg-white/10 hover:bg-white/20'}`}
                                    >
                                        <Heart size={12} fill={isLiked ? 'currentColor' : 'none'} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); playSearchedSong(song); }}
                                        className="p-1.5 bg-cyan-400 rounded-full hover:bg-cyan-300 transition-colors text-black"
                                    >
                                        <Play size={12} fill="currentColor" />
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MoodPlaylistsView;
