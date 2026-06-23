import { useState } from 'react';
import { useMusic } from '../context/MusicContext';
import { X, Plus, Music2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PlaylistModal = ({ isOpen, onClose, songId }) => {
    const { userPlaylists, createPlaylist, addSongToPlaylist } = useMusic();
    const [newPlaylistName, setNewPlaylistName] = useState("");
    const [showCreate, setShowCreate] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    if (!isOpen) return null;

    const handleCreate = async (e) => {
        e.preventDefault();
        if (newPlaylistName.trim()) {
            setIsCreating(true);
            const result = await createPlaylist(newPlaylistName.trim());
            setIsCreating(false);
            if (result.success) {
                setNewPlaylistName("");
                setShowCreate(false);
            }
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center pointer-events-none">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm pointer-events-auto"
                />
                
                <motion.div 
                    initial={{ opacity: 0, y: "100%" }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-md bg-zinc-900 border-t md:border border-white/10 rounded-t-[2rem] md:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] pointer-events-auto"
                >
                    <div className="p-6 md:p-6 pb-2 flex-shrink-0">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-white">Add to Playlist</h2>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-zinc-400 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="px-6 pb-8 overflow-y-auto custom-scrollbar">

                        {!showCreate ? (
                            <div className="space-y-2">
                                <button 
                                    onClick={() => setShowCreate(true)}
                                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-dashed border-white/20 transition-all text-white group"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-cyan-400/10 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-400 group-hover:text-black transition-all">
                                        <Plus size={24} />
                                    </div>
                                    <span className="font-bold">Create New Playlist</span>
                                </button>

                                {userPlaylists.map(playlist => (
                                    <button 
                                        key={playlist.id}
                                        onClick={async () => {
                                            const result = await addSongToPlaylist(playlist.id, songId);
                                            if (result?.success) {
                                                onClose();
                                            }
                                        }}
                                        className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-white group"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-500">
                                            <Music2 size={24} />
                                        </div>
                                        <div className="flex flex-col items-start overflow-hidden">
                                            <span className="font-bold truncate w-full">{playlist.name}</span>
                                            <span className="text-xs text-zinc-500">
                                                {playlist.playlist_songs?.length || 0} songs
                                            </span>
                                        </div>
                                    </button>
                                ))}

                                {userPlaylists.length === 0 && !showCreate && (
                                    <p className="text-center py-8 text-zinc-500 text-sm">You haven't created any playlists yet.</p>
                                )}
                            </div>
                        ) : (
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Playlist Name</label>
                                    <input 
                                        autoFocus
                                        type="text"
                                        placeholder="Enter playlist name..."
                                        value={newPlaylistName}
                                        onChange={(e) => setNewPlaylistName(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button 
                                        type="button"
                                        onClick={() => setShowCreate(false)}
                                        className="flex-1 py-3 px-4 rounded-xl bg-zinc-800 text-white font-bold hover:bg-zinc-700 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={!newPlaylistName.trim()}
                                        className="flex-[2] py-3 px-4 rounded-xl bg-cyan-400 text-black font-bold hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        Create Playlist
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default PlaylistModal;
