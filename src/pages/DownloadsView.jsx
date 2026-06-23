import { useState, useEffect } from 'react';
import { useMusic } from '../context/MusicContext';
import { Download, Play, Trash2, ListPlus, Plus, HardDrive, Music4, WifiOff } from 'lucide-react';
import { getDownloadedSongs, getStorageUsage } from '../utils/offlineStorage';
import { motion } from 'framer-motion';

const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const DownloadsView = ({ setCurrentView }) => {
    const { playSearchedSong, addToQueue, removeDownload, openPlaylistModal } = useMusic();
    const [downloadedSongs, setDownloadedSongs] = useState([]);
    const [storageUsed, setStorageUsed] = useState(0);

    const loadDownloads = async () => {
        const [songs, usage] = await Promise.all([getDownloadedSongs(), getStorageUsage()]);
        setDownloadedSongs(songs);
        setStorageUsed(usage);
    };

    useEffect(() => { loadDownloads(); }, []);

    if (downloadedSongs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full px-6">
                <HardDrive size={64} className="text-zinc-800 mb-4" />
                <h2 className="text-2xl font-bold text-zinc-600 mb-2">No Downloads</h2>
                <p className="text-zinc-700 text-center text-sm max-w-xs">
                    Download songs to listen offline anytime, anywhere
                </p>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto no-scrollbar pb-24">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-[#050505]/80 backdrop-blur-xl px-4 pt-4 pb-3 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                        <Download size={20} className="text-cyan-400" /> Downloads
                    </h1>
                    <p className="text-xs text-zinc-500 mt-0.5">
                        {downloadedSongs.length} songs · {formatBytes(storageUsed)}
                    </p>
                </div>
                <button
                    onClick={loadDownloads}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-bold transition-colors"
                >
                    Refresh
                </button>
            </div>

            {/* Storage Bar */}
            <div className="px-4 mb-4">
                <div className="bg-white/5 rounded-full h-1.5 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (storageUsed / (50 * 1024 * 1024)) * 100)}%` }}
                    />
                </div>
                <p className="text-[10px] text-zinc-600 mt-1">
                    {formatBytes(storageUsed)} / 50 MB used
                </p>
            </div>

            {/* Song List */}
            <div className="px-4 space-y-0.5">
                {downloadedSongs.map((song, i) => (
                    <motion.div
                        key={song.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer"
                        onClick={() => playSearchedSong(song)}
                    >
                        <img
                            src={song.image || (import.meta.env.BASE_URL || '/') + 'img/default.png'}
                            alt={song.name}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                            onError={(e) => { e.target.src = (import.meta.env.BASE_URL || '/') + 'img/default.png'; }}
                        />
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-white truncate group-hover:text-cyan-400 transition-colors">
                                {song.name}
                            </h4>
                            <p className="text-xs text-zinc-500 truncate">{song.artist}</p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={(e) => { e.stopPropagation(); addToQueue(song); }}
                                className="p-1.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                                title="Add to Queue"
                            >
                                <ListPlus size={12} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); openPlaylistModal(song.id); }}
                                className="p-1.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                                title="Add to Playlist"
                            >
                                <Plus size={12} />
                            </button>
                            <button
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    await removeDownload(song.id);
                                    loadDownloads();
                                }}
                                className="p-1.5 bg-red-500/20 rounded-full hover:bg-red-500/40 transition-colors text-red-400"
                                title="Remove Download"
                            >
                                <Trash2 size={12} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); playSearchedSong(song); }}
                                className="p-1.5 bg-cyan-400 rounded-full hover:bg-cyan-300 transition-colors text-black"
                                title="Play"
                            >
                                <Play size={12} fill="currentColor" />
                            </button>
                        </div>
                        <span className="text-[10px] text-zinc-600 flex items-center gap-1">
                            <WifiOff size={10} /> Offline
                        </span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default DownloadsView;
