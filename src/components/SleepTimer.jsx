import { useState, useMemo, useEffect } from 'react';
import { Timer, Power } from 'lucide-react';
import { useMusic } from '../context/MusicContext';

const PRESETS = [
  { label: '5 min', value: 5 },
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '1 hr', value: 60 },
  { label: 'End of song', value: 0 },
];

const SleepTimer = () => {
  const { sleepTimer, setSleepTimer } = useMusic();
  const [customMinutes, setCustomMinutes] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const isActive = sleepTimer !== null;
  const remaining = useMemo(() => {
    if (!isActive) return 0;
    return Math.max(0, Math.floor((sleepTimer.endTime - now) / 60000));
  }, [isActive, sleepTimer, now]);

  useEffect(() => {
    if (!isActive) return;
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, [isActive]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all w-full ${
          isActive ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/30' : 'text-zinc-400 hover:text-white hover:bg-white/5'
        }`}
      >
        <Timer size={14} />
        {isActive ? `${remaining}m` : 'Sleep'}
      </button>

      {isActive && (
        <button
          onClick={() => { setSleepTimer(null); setIsOpen(false); }}
          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
          title="Cancel sleep timer"
        >
          <Power size={8} className="text-white" />
        </button>
      )}

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-48 bg-zinc-800 border border-white/10 rounded-2xl p-3 shadow-2xl z-50">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Sleep Timer</div>
          <div className="space-y-1">
            {PRESETS.map(preset => (
              <button
                key={preset.label}
                onClick={() => {
                  setSleepTimer(preset.value);
                  setIsOpen(false);
                }}
                className="block w-full text-left px-3 py-1.5 rounded-lg text-xs text-zinc-300 hover:bg-white/10 transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-white/5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const val = parseInt(customMinutes);
                if (val > 0) { setSleepTimer(val); setIsOpen(false); setCustomMinutes(''); }
              }}
              className="flex gap-1"
            >
              <input
                type="number"
                min="1"
                max="999"
                placeholder="Custom"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(e.target.value)}
                className="flex-1 bg-white/5 rounded-lg px-2 py-1 text-xs text-white placeholder-zinc-500 border border-white/5 focus:outline-none focus:border-cyan-400/50"
              />
              <button
                type="submit"
                className="px-2 py-1 bg-cyan-400/20 text-cyan-400 rounded-lg text-[10px] font-bold hover:bg-cyan-400/30 transition-colors"
              >
                Go
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SleepTimer;
