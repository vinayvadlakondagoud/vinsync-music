import { useMusic } from '../context/MusicContext';
import { Play, Music2, Plus, Clock, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const LibraryView = ({ setCurrentView, setSelectedPlaylist }) => {
    const { playlist, playSong, userPlaylists, openPlaylistModal, history, toggleLike, likedSongs } = useMusic();

    const handlePlaylistClick = (playlistId) => {
        setSelectedPlaylist(playlistId);
        setCurrentView('playlistDetail');
    };

    return (
        <div className="space-y-8 md:space-y-12 pb-32 md:pb-24 min-h-[calc(100vh-140px)] h-full overflow-y-auto overflow-x-hidden no-scrollbar px-3 md:px-1 relative">
            
            {/* Playlists Section */}
            <div className="space-y-4 md:space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl md:text-2xl font-bold text-white/90">Your Playlists</h2>
                    <button 
                        onClick={() => openPlaylistModal(null)}
                        className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 transition-all text-xs md:text-sm font-bold"
                    >
                        <Plus size={14} className="md:w-4 md:h-4" />
                        <span className="hidden sm:inline">Create New</span>
                        <span className="sm:hidden">New</span>
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {userPlaylists.map(playlist => (
                        <motion.div 
                            key={playlist.id}
                            whileHover={{ y: -5, scale: 1.02 }}
                            onClick={() => handlePlaylistClick(playlist.id)}
                            className="bg-zinc-900/50 border border-white/5 p-4 rounded-2xl hover:bg-zinc-800/50 transition-all cursor-pointer group backdrop-blur-md"
                        >
                            <div className="aspect-square rounded-xl bg-zinc-800 mb-4 flex items-center justify-center text-zinc-600 group-hover:text-cyan-400 transition-colors relative overflow-hidden">
                                <Music2 size={48} />
                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <h3 className="font-bold truncate text-white">{playlist.name}</h3>
                            <p className="text-xs text-zinc-500">{playlist.playlist_songs?.length || 0} songs</p>
                        </motion.div>
                    ))}
                    {userPlaylists.length === 0 && (
                        <div className="col-span-full py-12 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                            <p className="text-zinc-500 text-sm">No playlists yet. Start creating!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Library Section */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white/90">All Songs</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                    {playlist.map((song, i) => (
                        <motion.div 
                            key={song.id} 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            onClick={() => playSong(i)}
                            className={`
                                cursor-pointer group transition-all
                                /* Mobile: List View */
                                flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 active:bg-white/15 border border-transparent hover:border-white/5
                                /* Desktop: Card View */
                                md:flex-col md:p-5 md:bg-white/5 md:border-white/5 md:hover:bg-white/10 md:hover:border-white/10 md:items-start md:gap-4 md:shadow-lg md:hover:-translate-y-2 md:hover:scale-[1.02]
                            `}
                        >
                            {/* Song Image & Play Overlay */}
                            <div className="relative w-12 h-12 flex-shrink-0 md:w-full md:h-auto md:aspect-square md:mb-0">
                                <img src={song.image} alt={song.name} className="w-full h-full object-cover rounded-lg md:rounded-xl shadow-md md:shadow-2xl md:group-hover:shadow-2xl transition-all duration-500" />
                                
                                {/* Desktop Hover Overlay */}
                                <div className="absolute inset-0 bg-black/40 rounded-lg md:rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 md:hidden">
                                    <Play size={18} fill="white" className="text-white" />
                                </div>

                                {/* Desktop Floating Action Button Position */}
                                <div className="hidden md:flex absolute bottom-3 right-3 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 gap-2 z-20">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); openPlaylistModal(song.id); }}
                                        className="bg-zinc-800/80 backdrop-blur-md rounded-full p-2 shadow-xl hover:scale-110 hover:bg-white hover:text-black text-white transition-all"
                                    >
                                        <Plus size={16} />
                                    </button>
                                    <div className="bg-cyan-400 rounded-full p-3 shadow-xl hover:scale-105 hover:bg-cyan-300 shadow-black/30 text-black">
                                        <Play size={20} fill="black" className="ml-0.5" />
                                    </div>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0 md:w-full">
                                <h3 className="font-bold truncate text-sm md:text-base text-white group-hover:text-cyan-400 transition-colors md:uppercase md:tracking-tight md:mb-1">
                                    {song.name}
                                </h3>
                                <p className="text-xs md:text-sm text-zinc-400 truncate">{song.artist}</p>
                            </div>

                            {/* Mobile Only Actions */}
                            <div className="flex items-center gap-1 md:hidden">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); toggleLike(song.id); }}
                                    className={`p-2 rounded-full transition-all ${likedSongs.some(id => String(id) === String(song.id)) ? 'text-cyan-400' : 'text-zinc-400 hover:text-white'}`}
                                >
                                    <Heart size={20} fill={likedSongs.some(id => String(id) === String(song.id)) ? "currentColor" : "none"} />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); openPlaylistModal(song.id); }}
                                    className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LibraryView;
