import { useMusic } from '../context/MusicContext';
import { Play, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const LikedSongsView = () => {
    const { playlist, playSong, likedSongs, toggleLike } = useMusic();

    // Filter playlist to get song objects for liked IDs
    const likedPlaylistItems = playlist
        .map((song, index) => ({ song, originalIndex: index }))
        .filter(item => likedSongs.some(id => String(id) === String(item.song.id)));

    const formatDuration = (seconds) => {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (likedPlaylistItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <Heart size={40} className="text-zinc-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-white">No Liked Songs Yet</h2>
                <p className="text-zinc-400 max-w-xs">Tap the heart icon on any song to save it to your collection.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-24 h-full overflow-y-auto no-scrollbar px-3 md:px-1">
            {/* Header */}
            <div className="flex items-center gap-6 mb-8 p-8 bg-gradient-to-r from-cyan-900/40 to-black/40 rounded-3xl border border-white/5">
                <div className="w-32 md:w-48 h-32 md:h-48 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-black/20">
                    <Heart size={48} className="text-white fill-white md:w-16 md:h-16" />
                </div>
                <div className="flex-1">
                    <span className="text-sm font-bold uppercase tracking-widest text-white/60">Playlist</span>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mt-2 mb-2 md:mb-4">Liked Songs</h1>
                    <p className="text-zinc-300 font-medium">{likedPlaylistItems.length} songs</p>
                </div>
            </div>
            
            {/* Song List */}
            <div className="space-y-2">
                {likedPlaylistItems.map(({ song, originalIndex }, index) => {
                    const isLiked = true; // Always true in this view
                    
                    return (
                        <motion.div
                            key={song.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => playSong(originalIndex)}
                            className="group flex items-center gap-3 md:gap-4 p-3 rounded-xl hover:bg-white/10 active:bg-white/15 transition-all cursor-pointer border border-transparent hover:border-white/10"
                        >
                            {/* Album Art with Play Button */}
                            <div className="relative w-12 h-12 md:w-14 md:h-14 flex-shrink-0">
                                <img 
                                    src={song.image} 
                                    alt={song.name} 
                                    className="w-full h-full object-cover rounded-lg"
                                />
                                <div className="absolute inset-0 bg-black/40 md:bg-black/60 rounded-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Play size={16} fill="white" className="text-white md:w-5 md:h-5" />
                                </div>
                            </div>

                            {/* Song Info */}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-white truncate group-hover:text-cyan-400 transition-colors text-sm md:text-base">
                                    {song.name}
                                </h3>
                                <p className="text-xs md:text-sm text-zinc-400 truncate">{song.artist}</p>
                            </div>

                            {/* Duration */}
                            <div className="text-xs md:text-sm text-zinc-500 font-mono hidden sm:block">
                                {formatDuration(song.duration || 180)}
                            </div>

                            {/* Like Button */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleLike(song.id); }}
                                    className="p-2 rounded-full hover:bg-white/10 active:bg-white/20 transition-all text-cyan-400"
                                >
                                    <Heart size={18} fill="currentColor" className="md:w-5 md:h-5" />
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default LikedSongsView;
