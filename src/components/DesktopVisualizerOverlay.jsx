import { motion, AnimatePresence } from 'framer-motion';
import { useMusic } from '../context/MusicContext';
import Visualizer from './Visualizer';
import { X } from 'lucide-react';

const DesktopVisualizerOverlay = () => {
    const { showVisualizer, toggleVisualizer, currentSong } = useMusic();

    // Only render on desktop potentially? Or handle via CSS media queries.
    // We'll use CSS to hide on mobile since mobile has its own integrated one.
    
    return (
        <AnimatePresence>
            {showVisualizer && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="fixed inset-0 z-[40] hidden md:flex flex-col items-center justify-center pointer-events-none"
                >
                     {/* Backdrop - Click to close */}
                     <div 
                        className="absolute inset-0 bg-black/80 backdrop-blur-md pointer-events-auto" 
                        onClick={toggleVisualizer}
                     />

                     {/* Content */}
                     <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-4xl px-8 pointer-events-none">
                        
                        {/* Song Info */}
                        {currentSong && (
                             <div className="text-center space-y-2 animate-pulse-slow">
                                <img 
                                    src={currentSong.image} 
                                    alt="Album Art" 
                                    className="w-64 h-64 rounded-2xl shadow-2xl mx-auto mb-6 object-cover"
                                />
                                <h2 className="text-4xl font-bold text-white tracking-tight">{currentSong.name}</h2>
                                <p className="text-xl text-white/50">{currentSong.artist}</p>
                             </div>
                        )}

                        {/* Visualizer Canvas */}
                        <div className="w-full h-64 rounded-3xl overflow-hidden bg-white/5 border border-white/10 shadow-2xl backdrop-blur-sm">
                            <Visualizer height={256} barColor="cyan" />
                        </div>
                     </div>

                     {/* Close Button */}
                     <button 
                        onClick={toggleVisualizer}
                        className="absolute top-8 right-8 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all pointer-events-auto"
                     >
                        <X size={24} />
                     </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DesktopVisualizerOverlay;
