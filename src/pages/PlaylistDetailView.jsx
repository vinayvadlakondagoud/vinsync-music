import { useMusic } from '../context/MusicContext';
import { Play, ArrowLeft, Music2, Heart, X } from 'lucide-react';
import { motion } from 'framer-motion';

const PlaylistDetailView = ({ playlistId, onBack }) => {
    const { playlist, playSong, userPlaylists, toggleLike, likedSongs, removeSongFromPlaylist } = useMusic();
    
    const currentPlaylist = userPlaylists.find(p => p.id === playlistId);
    
    if (!currentPlaylist) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <Music2 size={48} className="text-zinc-600 mb-4" />
                <h2 className="text-2xl font-bold mb-2 text-white">Playlist Not Found</h2>
                <button 
                    onClick={onBack}
                    className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                >
                    Go Back
                </button>
            </div>
        );
    }

    // Get song objects from playlist_songs
    const playlistSongs = currentPlaylist.playlist_songs
        ?.map(ps => {
            const song = playlist.find(s => s.id === ps.song_id);
            return song ? { ...song, originalIndex: playlist.indexOf(song), recordId: ps.id } : null;
        })
        .filter(Boolean) || [];

    const formatDuration = (seconds) => {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleRemove = async (e, recordId) => {
        e.stopPropagation();
        await removeSongFromPlaylist(playlistId, recordId);
    };

    return (
        <div className="space-y-6 pb-24 h-full overflow-y-auto no-scrollbar px-3 md:px-1">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 mb-8 p-6 md:p-8 bg-gradient-to-br from-cyan-900/20 to-black/40 rounded-[2rem] border border-white/5 relative overflow-hidden group">
                {/* Background Decor */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                
                <button
                    onClick={onBack}
                    className="absolute top-4 left-4 p-2.5 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white transition-all hover:scale-105 active:scale-95 z-20 border border-white/10"
                >
                    <ArrowLeft size={20} />
                </button>
                
                <div className="w-48 h-48 md:w-56 md:h-56 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-black/40 relative z-10 group-hover:scale-[1.02] transition-transform duration-500">
                    <Music2 size={80} className="text-white drop-shadow-lg" />
                    <div className="absolute inset-0 bg-white/10 rounded-2xl md:opacity-0 md:group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left relative z-10 w-full min-w-0">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400 mb-2 bg-cyan-950/30 px-3 py-1 rounded-full border border-cyan-500/20">Playlist</span>
                    <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white mb-4 leading-tight tracking-tight break-words w-full">
                        {currentPlaylist.name}
                    </h1>
                    <div className="flex items-center gap-2 text-sm md:text-base text-zinc-300 font-medium">
                        <span className="text-white">Created by You</span>
                        <span className="w-1 h-1 bg-zinc-500 rounded-full" />
                        <span>{playlistSongs.length} songs</span>
                    </div>
                </div>
            </div>

            {playlistSongs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                    <Music2 size={48} className="text-zinc-600 mb-4" />
                    <p className="text-zinc-500 text-sm">This playlist is empty</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {playlistSongs.map(({ originalIndex, recordId, ...song }, index) => {
                        const isLiked = likedSongs.some(id => String(id) === String(song.id));
                        
                        return (
                            <motion.div
                                key={recordId || song.id}
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

                                {/* Actions */}
                                <div className="flex items-center gap-1 md:gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleLike(song.id); }}
                                        className={`p-2 rounded-full hover:bg-white/10 active:bg-white/20 transition-all ${isLiked ? 'text-cyan-400' : 'text-zinc-400 hover:text-white'}`}
                                    >
                                        <Heart size={18} fill={isLiked ? "currentColor" : "none"} className="md:w-5 md:h-5" />
                                    </button>
                                    <button
                                        onClick={(e) => handleRemove(e, recordId)}
                                        className="p-2 rounded-full hover:bg-red-500/20 active:bg-red-500/30 text-zinc-400 hover:text-red-400 transition-all"
                                    >
                                        <X size={18} className="md:w-5 md:h-5" />
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

export default PlaylistDetailView;
