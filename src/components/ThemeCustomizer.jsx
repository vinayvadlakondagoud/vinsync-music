import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Palette, Type, X } from 'lucide-react';
import { ACCENTS, FONT_SIZES, loadTheme, saveTheme, applyTheme } from '../utils/themeUtils';

const ThemeCustomizer = ({ isOpen, onClose }) => {
    const [theme, setTheme] = useState(loadTheme);

    useEffect(() => {
        if (isOpen) setTheme(loadTheme());
    }, [isOpen]);

    const update = (partial) => {
        const next = { ...theme, ...partial };
        setTheme(next);
        saveTheme(next);
        applyTheme(next);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        onClick={e => e.stopPropagation()}
                        className="w-full max-w-sm bg-zinc-900 border border-white/10 rounded-[2rem] p-6 shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Palette size={18} className="text-cyan-400" />
                                <h2 className="text-lg font-black text-white uppercase tracking-tight">Theme</h2>
                            </div>
                            <button onClick={onClose} className="p-1.5 hover:bg-white/5 rounded-full transition-colors">
                                <X size={18} className="text-zinc-500" />
                            </button>
                        </div>

                        {/* Mode Toggle */}
                        <div className="mb-5">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Mode</label>
                            <div className="flex gap-2">
                                {[
                                    { id: 'dark', icon: Moon, label: 'Dark' },
                                    { id: 'light', icon: Sun, label: 'Light' },
                                ].map(mode => {
                                    const Icon = mode.icon;
                                    const isActive = theme.mode === mode.id;
                                    return (
                                        <button
                                            key={mode.id}
                                            onClick={() => update({ mode: mode.id })}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all border ${
                                                isActive
                                                    ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                                                    : 'bg-white/5 text-zinc-500 border-white/5 hover:text-white hover:bg-white/10'
                                            }`}
                                        >
                                            <Icon size={16} />
                                            {mode.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Accent Color */}
                        <div className="mb-5">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <Palette size={12} /> Accent Color
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(ACCENTS).map(([key, accent]) => (
                                    <button
                                        key={key}
                                        onClick={() => update({ accent: key })}
                                        className={`w-8 h-8 rounded-full transition-all border-2 ${
                                            theme.accent === key ? 'border-white scale-110' : 'border-transparent hover:scale-110'
                                        }`}
                                        style={{ backgroundColor: accent.primary }}
                                        title={accent.name}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Font Size */}
                        <div>
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <Type size={12} /> Font Size
                            </label>
                            <div className="flex gap-2">
                                {Object.entries(FONT_SIZES).map(([key, fs]) => (
                                    <button
                                        key={key}
                                        onClick={() => update({ fontSize: key })}
                                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                                            theme.fontSize === key
                                                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                                                : 'bg-white/5 text-zinc-500 border-white/5 hover:text-white hover:bg-white/10'
                                        }`}
                                    >
                                        {fs.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ThemeCustomizer;
