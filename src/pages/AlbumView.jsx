import { useMemo } from 'react';
import { useMusic } from '../context/MusicContext';
import { ArrowLeft, Play, ListPlus, Plus, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const AlbumView = ({ albumName, albumArtist, albumImage, tracks, setCurrentView, setSelectedAlbum }) => {
    const { playSearchedSong, addToQueue, openPlaylistModal } = useMusic();

    if (!tracks || tracks.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-zinc-500">Select an album</p>
            </div>
        );
    }

    const firstTrack = tracks[0];

    return (
        <div className="relative flex flex-col h-full overflow-y-auto no-scrollbar">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img
                    src={albumImage || firstTrack.image}
                    alt=""
                    className="w-full h-72 object-cover blur-2xl opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505] to-[#050505]" />
            </div>

            {/* Header */}
            <div className="relative z-10 flex items-center gap-3 p-4">
                <button
                    onClick={() => { setSelectedAlbum(null); setCurrentView('home'); }}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
            </div>

            {/* Hero */}
            <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-end gap-5 px-6 pb-6">
                <motion.img
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    src={albumImage || firstTrack.image}
                    alt={albumName}
                    className="w-44 h-44 rounded-2xl shadow-2xl object-cover border border-white/10"
                />
                <div className="text-center sm:text-left">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Album</p>
                    <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">{albumName}</h1>
                    <p className="text-zinc-400 text-sm mt-1">{albumArtist || firstTrack.artist}</p>
                    <p className="text-zinc-600 text-xs mt-1">{tracks.length} tracks</p>
                </div>
            </div>

            {/* Track List */}
            <div className="relative z-10 px-4 space-y-1 pb-24">
                <div className="flex items-center gap-3 px-3 py-2 text-xs text-zinc-600 border-b border-white/5 mb-2">
                    <span className="w-8">#</span>
                    <span className="flex-1">Title</span>
                    {firstTrack.source === 'itunes' && <Clock size={12} />}
                </div>
                {tracks.map((track, i) => (
                    <motion.div
                        key={track.id || i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer"
                        onClick={() => playSearchedSong(track)}
                    >
                        <span className="text-zinc-600 text-sm font-mono w-8">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-white truncate group-hover:text-cyan-400 transition-colors">
                                {track.name}
                            </h3>
                            <p className="text-xs text-zinc-500 truncate">{track.artist}</p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={(e) => { e.stopPropagation(); addToQueue(track); }}
                                className="p-1.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                            >
                                <ListPlus size={14} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); openPlaylistModal(track.id); }}
                                className="p-1.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                            >
                                <Plus size={14} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); playSearchedSong(track); }}
                                className="p-1.5 bg-cyan-400 rounded-full hover:bg-cyan-300 transition-colors text-black"
                            >
                                <Play size={14} fill="currentColor" />
                            </button>
                        </div>
                        {track.source === 'itunes' && (
                            <span className="text-[10px] text-zinc-600 font-mono">PREVIEW</span>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default AlbumView;
