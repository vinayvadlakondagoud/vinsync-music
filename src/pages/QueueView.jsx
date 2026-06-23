import { useState, useRef } from 'react';
import { useMusic } from '../context/MusicContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Trash2, ListMusic, ArrowUp, ArrowDown, X } from 'lucide-react';

const QueueView = () => {
    const { queue, playSearchedSong, removeFromQueue, clearQueue, reorderQueue, currentSong } = useMusic();
    const [dragIndex, setDragIndex] = useState(null);
    const [overIndex, setOverIndex] = useState(null);
    const dragItem = useRef(null);

    const handleDragStart = (index) => {
        dragItem.current = index;
        setDragIndex(index);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        setOverIndex(index);
    };

    const handleDrop = (index) => {
        if (dragItem.current !== null && dragItem.current !== index) {
            reorderQueue(dragItem.current, index);
        }
        setDragIndex(null);
        setOverIndex(null);
        dragItem.current = null;
    };

    const handleDragEnd = () => {
        setDragIndex(null);
        setOverIndex(null);
        dragItem.current = null;
    };

    if (queue.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full px-6">
                <ListMusic size={64} className="text-zinc-800 mb-4" />
                <h2 className="text-2xl font-bold text-zinc-600 mb-2">Queue is Empty</h2>
                <p className="text-zinc-700 text-center text-sm max-w-xs">
                    Add songs to your queue and they'll play next
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
                        <ListMusic size={20} className="text-cyan-400" /> Queue
                    </h1>
                    <p className="text-xs text-zinc-500 mt-0.5">{queue.length} songs</p>
                </div>
                <div className="flex gap-2">
                    <span className="text-[10px] text-zinc-600 self-center">Drag to reorder</span>
                    <button
                        onClick={clearQueue}
                        className="text-xs text-red-400 hover:text-red-300 font-bold transition-colors"
                    >
                        Clear all
                    </button>
                </div>
            </div>

            {/* Now Playing Indicator */}
            {currentSong && (
                <div className="px-4 mb-3">
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex items-center gap-3">
                        <div className="w-1 h-8 bg-cyan-400 rounded-full animate-pulse" />
                        <img src={currentSong.image} alt={currentSong.name} className="w-10 h-10 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Now Playing</p>
                            <h4 className="text-sm font-bold text-white truncate">{currentSong.name}</h4>
                        </div>
                    </div>
                </div>
            )}

            {/* Queue List */}
            <div className="px-4 space-y-1">
                <AnimatePresence>
                    {queue.map((song, index) => (
                        <motion.div
                            key={`${song.id}-${index}`}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{
                                opacity: 1,
                                x: 0,
                                scale: dragIndex === index ? 1.02 : 1,
                                borderColor: overIndex === index ? 'rgba(34,211,238,0.3)' : 'transparent',
                            }}
                            exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDrop={() => handleDrop(index)}
                            onDragEnd={handleDragEnd}
                            className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors cursor-grab active:cursor-grabbing border ${
                                dragIndex === index ? 'bg-white/10 border-cyan-500/30 shadow-lg shadow-cyan-500/10' : 'hover:bg-white/5 border-transparent'
                            }`}
                        >
                            {/* Drag Handle */}
                            <div className="flex flex-col gap-0.5 text-zinc-600">
                                <ArrowUp size={10} />
                                <ArrowDown size={10} />
                            </div>

                            <img
                                src={song.image || (import.meta.env.BASE_URL || '/') + 'img/default.png'}
                                alt={song.name}
                                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                onError={(e) => { e.target.src = (import.meta.env.BASE_URL || '/') + 'img/default.png'; }}
                            />
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-white truncate">{song.name}</h4>
                                <p className="text-xs text-zinc-500 truncate">{song.artist}</p>
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => playSearchedSong(song)}
                                    className="p-1.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                                    title="Play Now"
                                >
                                    <Play size={12} />
                                </button>
                                <button
                                    onClick={() => removeFromQueue(index)}
                                    className="p-1.5 bg-red-500/20 rounded-full hover:bg-red-500/40 transition-colors text-red-400"
                                    title="Remove"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                            <span className="text-[10px] text-zinc-600 font-mono w-4 text-right">{index + 1}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default QueueView;
