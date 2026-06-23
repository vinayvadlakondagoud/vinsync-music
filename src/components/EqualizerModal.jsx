import { X, Sliders, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMusic } from '../context/MusicContext';
import { useRef, useEffect, useCallback } from 'react';

const EQ_FREQUENCIES = [31, 62, 125, 250, 500, '1K', '2K', '4K', '8K', '16K'];

const EqualizerModal = ({ isOpen, onClose }) => {
  const { eqBands, eqPresetName, eqPresets, setEQPreset, setEQBand } = useMusic();
  const canvasRef = useRef(null);

  const drawResponseCurve = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    const midY = h / 2;
    const padding = 20;
    const graphW = w - padding * 2;

    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(padding, midY);
    ctx.lineTo(w - padding, midY);
    ctx.stroke();
    ctx.setLineDash([]);

    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, 'rgba(6, 182, 212, 0.4)');
    gradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.1)');
    gradient.addColorStop(1, 'rgba(6, 182, 212, 0.4)');

    ctx.beginPath();
    const points = eqBands.map((val, i) => ({
      x: padding + (i / (eqBands.length - 1)) * graphW,
      y: midY - (val / 12) * (h / 2 - 10),
    }));

    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const xc = (points[i].x + points[i - 1].x) / 2;
      const yc = (points[i].y + points[i - 1].y) / 2;
      ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);

    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.lineTo(points[points.length - 1].x, midY);
    ctx.lineTo(points[0].x, midY);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    points.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#06b6d4';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }, [eqBands]);

  useEffect(() => {
    if (isOpen) drawResponseCurve();
  }, [isOpen, drawResponseCurve, eqBands]);

  if (!isOpen) return null;

  const presetKeys = Object.keys(eqPresets);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
          className="relative w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-3xl p-6 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Sliders className="text-cyan-400" size={24} />
              <h2 className="text-xl font-bold text-white">10-Band Equalizer</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-zinc-400 transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Frequency Response Canvas */}
          <div className="mb-6 bg-black/40 rounded-2xl p-4 border border-white/5">
            <canvas
              ref={canvasRef}
              width={600}
              height={180}
              className="w-full h-[140px]"
            />
          </div>

          {/* Presets */}
          <div className="flex flex-wrap gap-2 mb-6">
            {presetKeys.map(key => (
              <button
                key={key}
                onClick={() => setEQPreset(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  eqPresetName === eqPresets[key].name
                    ? 'bg-cyan-400 text-black border-cyan-400'
                    : 'bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10 hover:text-white'
                }`}
              >
                {eqPresets[key].name}
              </button>
            ))}
            <button
              onClick={() => setEQPreset('Flat')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold border bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10 hover:text-white flex items-center gap-1"
            >
              <RotateCcw size={12} /> Reset
            </button>
          </div>

          {/* 10-Band Sliders */}
          <div className="flex items-end justify-between gap-1 h-48 px-2">
            {eqBands.map((val, i) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-1">
                <span className={`text-[10px] font-bold ${val > 0 ? 'text-cyan-400' : val < 0 ? 'text-red-400' : 'text-zinc-500'}`}>
                  {val > 0 ? '+' : ''}{val}dB
                </span>
                <div className="relative h-32 w-full flex items-center justify-center">
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    value={val}
                    onChange={(e) => setEQBand(i, e.target.value)}
                    className="absolute w-32 h-full origin-center -rotate-90 cursor-pointer opacity-0 z-10"
                  />
                  <div className="w-1.5 h-full bg-white/10 rounded-full relative overflow-hidden">
                    <div
                      className="absolute left-0 right-0 transition-all duration-75"
                      style={{
                        height: `${Math.abs(val) / 12 * 100}%`,
                        bottom: val >= 0 ? '50%' : 'auto',
                        top: val < 0 ? '50%' : 'auto',
                        backgroundColor: val > 0 ? 'rgb(6, 182, 212)' : val < 0 ? 'rgb(248, 113, 113)' : 'rgb(113, 113, 122)',
                      }}
                    />
                    <div
                      className="absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-lg border-2 border-cyan-400"
                      style={{ top: `${100 - (val + 12) / 24 * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold">{EQ_FREQUENCIES[i]}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 text-center text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
            {eqPresetName !== 'Custom' ? `Preset: ${eqPresetName}` : 'Custom'}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EqualizerModal;
