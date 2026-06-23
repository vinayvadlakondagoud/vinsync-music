import { Volume2, VolumeX, Maximize2, Minimize2, ArrowLeftRight, Gauge, Brain, Timer, Crosshair, RotateCcw } from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const VolumeSuite = ({ isOpen, onClose }) => {
  const {
    volume, setVolume, boost, setBoost, balance, setBalance,
    normalization, setNormalization, reverbAmount, setReverb,
    crossfadeDuration, setCrossfadeDuration, toggleMute,
  } = useMusic();

  const [activeTab, setActiveTab] = useState('volume');

  if (!isOpen) return null;

  const tabs = [
    { id: 'volume', label: 'Volume', icon: Volume2 },
    { id: 'booster', label: 'Booster', icon: Maximize2 },
    { id: 'balance', label: 'Balance', icon: ArrowLeftRight },
    { id: 'effects', label: 'Effects', icon: Gauge },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl p-6 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Volume2 className="text-cyan-400" size={24} />
              <h2 className="text-xl font-bold text-white">Volume Suite</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-zinc-400 transition-colors">
              <RotateCcw size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-black/30 rounded-xl p-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-cyan-400/20 text-cyan-400'
                      : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="min-h-[200px]">
            {activeTab === 'volume' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-zinc-400">
                    <span>Main Volume</span>
                    <span className="text-white">{Math.round(volume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0" max="1" step="0.01"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-full accent-cyan-400 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-600">
                    <button onClick={toggleMute} className="flex items-center gap-1 hover:text-white transition-colors">
                      {volume === 0 ? <VolumeX size={12} /> : <Volume2 size={12} />}
                      {volume === 0 ? 'Unmute' : 'Mute'}
                    </button>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'booster' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-zinc-400">
                    <span>Volume Booster</span>
                    <span className={boost > 1.0 ? 'text-cyan-400' : 'text-white'}>{Math.round(boost * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5" max="2.0" step="0.05"
                    value={boost}
                    onChange={(e) => setBoost(Number(e.target.value))}
                    className="w-full accent-cyan-400 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-600">
                    <span>50%</span>
                    <span className="text-cyan-400/60 font-bold">BOOST</span>
                    <span>200%</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'balance' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-zinc-400">
                    <span>Left</span>
                    <span className="text-white">{balance === 0 ? 'Center' : balance < 0 ? `${Math.round(Math.abs(balance) * 100)}% L` : `${Math.round(balance * 100)}% R`}</span>
                    <span>Right</span>
                  </div>
                  <input
                    type="range"
                    min="-1" max="1" step="0.01"
                    value={balance}
                    onChange={(e) => setBalance(Number(e.target.value))}
                    className="w-full accent-cyan-400 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex items-center justify-center gap-4 text-[10px] text-zinc-600">
                    <span>L</span>
                    <div className="flex-1 h-1 bg-white/10 rounded-full relative">
                      <div className="absolute h-full bg-cyan-400 rounded-full transition-all" style={{ left: '50%', width: `${Math.abs(balance) * 50}%`, transform: balance < 0 ? 'translateX(-100%)' : 'none' }} />
                    </div>
                    <span>R</span>
                  </div>
                  <button
                    onClick={() => setBalance(0)}
                    className="w-full text-[10px] font-bold text-zinc-500 hover:text-white transition-colors py-1"
                  >
                    Reset to Center
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'effects' && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <Gauge size={12} /> Normalization
                    </div>
                    <button
                      onClick={() => setNormalization(!normalization)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                        normalization ? 'bg-cyan-400 text-black' : 'bg-white/10 text-zinc-400'
                      }`}
                    >
                      {normalization ? 'ON' : 'OFF'}
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-600">Auto-adjust volume for consistent loudness</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <Timer size={12} /> Crossfade
                    </div>
                    <span className="text-white">{crossfadeDuration}s</span>
                  </div>
                  <input
                    type="range"
                    min="0" max="10" step="0.5"
                    value={crossfadeDuration}
                    onChange={(e) => setCrossfadeDuration(Number(e.target.value))}
                    className="w-full accent-cyan-400 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-600">
                    <span>Off</span>
                    <span>10s</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <Brain size={12} /> Reverb
                    </div>
                    <span className={reverbAmount > 0 ? 'text-cyan-400' : 'text-white'}>{reverbAmount}%</span>
                  </div>
                  <input
                    type="range"
                    min="0" max="100" step="1"
                    value={reverbAmount}
                    onChange={(e) => setReverb(Number(e.target.value))}
                    className="w-full accent-cyan-400 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-600">
                    <span>Dry</span>
                    <span className="text-cyan-400/60 font-bold">ROOM</span>
                    <span>Wet</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-center gap-4 text-[10px] text-zinc-600">
            <span className="flex items-center gap-1"><Volume2 size={10} /> Vol: {Math.round(volume * 100)}%</span>
            <span className="flex items-center gap-1"><Maximize2 size={10} /> Boost: {Math.round(boost * 100)}%</span>
            <span className="flex items-center gap-1"><Brain size={10} /> Reverb: {reverbAmount}%</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default VolumeSuite;
