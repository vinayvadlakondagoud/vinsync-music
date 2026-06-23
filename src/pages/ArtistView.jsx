import { useMemo } from 'react';
import { useMusic } from '../context/MusicContext';
import { ArrowLeft, Play, Plus, ListPlus, Disc3 } from 'lucide-react';
import { playlist } from '../data';
import { motion } from 'framer-motion';

const ArtistView = ({ artistName, setCurrentView, setSelectedArtist }) => {
    const { playSearchedSong, addToQueue, openPlaylistModal } = useMusic();

    const songs = useMemo(() => {
        if (!artistName) return [];
        const a = artistName.toLowerCase();
        return playlist.filter(s => s.artist.toLowerCase().includes(a));
    }, [artistName]);

    const industry = songs[0]?.industry || 'hollywood';

    const relatedArtists = useMemo(() => {
        if (!artistName) return [];
        return [...new Set(
            playlist
                .filter(s => s.industry === industry && s.artist !== artistName)
                .map(s => s.artist)
        )].slice(0, 6);
    }, [artistName, industry]);

    if (!artistName) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-zinc-500">Select an artist</p>
            </div>
        );
    }

    return (
        <div className="relative flex flex-col h-full overflow-y-auto no-scrollbar">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="w-full h-64 bg-gradient-to-b from-cyan-500/10 to-transparent" />
            </div>

            {/* Header */}
            <div className="relative z-10 flex items-center gap-3 p-4">
                <button
                    onClick={() => { setSelectedArtist(null); setCurrentView('home'); }}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
            </div>

            {/* Hero */}
            <div className="relative z-10 px-6 pb-6">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-2xl mb-4">
                    <Disc3 size={48} className="text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">{artistName}</h1>
                <p className="text-zinc-500 text-sm mt-1">{songs.length} songs</p>
            </div>

            {/* Songs */}
            <div className="relative z-10 px-4 space-y-2 pb-24">
                <h2 className="text-lg font-bold text-white uppercase tracking-wider px-2 mb-3">Songs</h2>
                {songs.map((song, i) => (
                    <motion.div
                        key={song.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer"
                        onClick={() => playSearchedSong(song)}
                    >
                        <span className="text-zinc-600 text-sm font-mono w-6 text-right">{i + 1}</span>
                        <img src={song.image} alt={song.name} className="w-10 h-10 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-white truncate">{song.name}</h3>
                            <p className="text-xs text-zinc-500 capitalize">{song.mood}</p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={(e) => { e.stopPropagation(); addToQueue(song); }}
                                className="p-1.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                            >
                                <ListPlus size={14} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); openPlaylistModal(song.id); }}
                                className="p-1.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                            >
                                <Plus size={14} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); playSearchedSong(song); }}
                                className="p-1.5 bg-cyan-400 rounded-full hover:bg-cyan-300 transition-colors text-black"
                            >
                                <Play size={14} fill="currentColor" />
                            </button>
                        </div>
                    </motion.div>
                ))}
                {songs.length === 0 && (
                    <p className="text-zinc-500 text-center py-10">No songs found for this artist</p>
                )}
            </div>

            {/* Related Artists */}
            {relatedArtists.length > 0 && (
                <div className="relative z-10 px-4 pb-24">
                    <h2 className="text-lg font-bold text-white uppercase tracking-wider px-2 mb-3">Related Artists</h2>
                    <div className="flex flex-wrap gap-2 px-2">
                        {relatedArtists.map(artist => (
                            <button
                                key={artist}
                                onClick={() => setSelectedArtist(artist)}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-sm font-bold text-zinc-300 hover:text-white transition-all border border-white/5"
                            >
                                {artist}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArtistView;
