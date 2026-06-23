import { useState, useMemo } from 'react';
import { useMusic } from '../context/MusicContext';
import { Clock, Play, ListPlus, Plus, Trash2, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { playlist } from '../data';

const HistoryView = ({ setCurrentView }) => {
    const { history, playSearchedSong, addToQueue, openPlaylistModal, likedSongs, toggleLike } = useMusic();
    const [showAll, setShowAll] = useState(false);

    const resolvedHistory = useMemo(() => {
        const display = showAll ? history : history.slice(0, 50);
        return display.map((entry, i) => {
            const sid = String(entry.song_id);
            const song = playlist.find(s => String(s.id) === sid);
            const time = entry.played_at ? new Date(entry.played_at) : null;
            const now = new Date();
            let relativeTime = '';
            if (time) {
                const diffMs = now - time;
                const diffMin = Math.floor(diffMs / 60000);
                const diffHr = Math.floor(diffMin / 60);
                const diffDay = Math.floor(diffHr / 24);
                if (diffMin < 1) relativeTime = 'Just now';
                else if (diffMin < 60) relativeTime = `${diffMin}m ago`;
                else if (diffHr < 24) relativeTime = `${diffHr}h ago`;
                else if (diffDay < 7) relativeTime = `${diffDay}d ago`;
                else relativeTime = time.toLocaleDateString();
            }
            return { ...entry, song, relativeTime, time };
        });
    }, [history, showAll]);

    const grouped = useMemo(() => {
        const groups = {};
        resolvedHistory.forEach(entry => {
            if (!entry.time) {
                if (!groups['Unknown']) groups['Unknown'] = [];
                groups['Unknown'].push(entry);
                return;
            }
            const now = new Date();
            const diffDay = Math.floor((now - entry.time) / 86400000);
            let label;
            if (diffDay === 0) label = 'Today';
            else if (diffDay === 1) label = 'Yesterday';
            else if (diffDay < 7) label = 'This Week';
            else if (diffDay < 30) label = 'Earlier';
            else label = entry.time.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            if (!groups[label]) groups[label] = [];
            groups[label].push(entry);
        });
        return groups;
    }, [resolvedHistory]);

    const totalPlays = history.length;
    const uniqueSongs = new Set(history.map(e => String(e.song_id))).size;

    if (history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full px-6">
                <Clock size={64} className="text-zinc-800 mb-4" />
                <h2 className="text-2xl font-bold text-zinc-600 mb-2">No History Yet</h2>
                <p className="text-zinc-700 text-center text-sm max-w-xs">
                    Songs you play will appear here so you can easily find them again
                </p>
            </div>
        );
    }

    const groupKeys = Object.keys(grouped);

    return (
        <div className="h-full overflow-y-auto no-scrollbar pb-24">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-[#050505]/80 backdrop-blur-xl px-4 pt-4 pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-white uppercase tracking-tight">History</h1>
                        <p className="text-xs text-zinc-500 mt-0.5">
                            {totalPlays} plays · {uniqueSongs} unique songs
                        </p>
                    </div>
                    {history.length > 50 && (
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="text-xs text-cyan-400 hover:text-cyan-300 font-bold transition-colors"
                        >
                            {showAll ? 'Show recent' : `Show all (${history.length})`}
                        </button>
                    )}
                </div>
            </div>

            {/* Timeline */}
            <div className="px-4 space-y-6">
                {groupKeys.map(groupLabel => (
                    <div key={groupLabel}>
                        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-2 px-1">
                            {groupLabel}
                        </h3>
                        <div className="space-y-0.5">
                            {grouped[groupLabel].map((entry, i) => {
                                if (!entry.song) {
                                    return (
                                        <div key={`${entry.song_id}-${i}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.02]">
                                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                                                <Clock size={16} className="text-zinc-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-zinc-600 truncate">Song unavailable</p>
                                                <p className="text-xs text-zinc-700">ID: {entry.song_id}</p>
                                            </div>
                                            <span className="text-[10px] text-zinc-700">{entry.relativeTime}</span>
                                        </div>
                                    );
                                }
                                return (
                                    <motion.div
                                        key={`${entry.song_id}-${i}`}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.01 }}
                                        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer"
                                        onClick={() => playSearchedSong(entry.song)}
                                    >
                                        <img
                                            src={entry.song.image}
                                            alt={entry.song.name}
                                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-white truncate group-hover:text-cyan-400 transition-colors">
                                                {entry.song.name}
                                            </h4>
                                            <p className="text-xs text-zinc-500 truncate">{entry.song.artist}</p>
                                        </div>
                                        <span className="text-[10px] text-zinc-600 font-mono flex-shrink-0">{entry.relativeTime}</span>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); addToQueue(entry.song); }}
                                                className="p-1.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                                                title="Add to Queue"
                                            >
                                                <ListPlus size={12} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); openPlaylistModal(entry.song.id); }}
                                                className="p-1.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                                                title="Add to Playlist"
                                            >
                                                <Plus size={12} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); playSearchedSong(entry.song); }}
                                                className="p-1.5 bg-cyan-400 rounded-full hover:bg-cyan-300 transition-colors text-black"
                                                title="Play"
                                            >
                                                <Play size={12} fill="currentColor" />
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HistoryView;
