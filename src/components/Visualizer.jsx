import { useEffect, useRef, useState } from 'react';
import { useMusic } from '../context/MusicContext';
import { BarChart3, CircleDot, AudioWaveform, Sparkles } from 'lucide-react';

const MODES = [
  { id: 'bars', icon: BarChart3, label: 'Bars' },
  { id: 'circle', icon: CircleDot, label: 'Circle' },
  { id: 'waveform', icon: AudioWaveform, label: 'Wave' },
  { id: 'particles', icon: Sparkles, label: 'Particles' },
];

const Visualizer = ({ height = 100, barColor }) => {
  const { analyser, isPlaying } = useMusic();
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [mode, setMode] = useState('bars');
  const particlesRef = useRef([]);
  const timeRef = useRef(0);

  useEffect(() => {
    if (!analyser || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;

      if (mode === 'bars') {
        const barWidth = (w / bufferLength) * 2.5;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
          const barH = (dataArray[i] / 255) * h;
          const hue = (i / bufferLength) * 360;
          ctx.fillStyle = barColor || `hsla(${hue}, 100%, 50%, 0.8)`;
          ctx.beginPath();
          ctx.roundRect(x, h - barH, barWidth - 2, barH, [4, 4, 0, 0]);
          ctx.fill();
          x += barWidth + 1;
        }
      } else if (mode === 'waveform') {
        const sliceW = w / bufferLength;
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 255;
          const y = h / 2 + (v - 0.5) * h * 0.8;
          ctx.lineTo(i * sliceW, y);
        }
        ctx.strokeStyle = barColor || '#06b6d4';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 255;
          const y = h / 2 + (0.5 - v) * h * 0.8;
          ctx.lineTo(i * sliceW, y);
        }
        ctx.strokeStyle = barColor || 'rgba(6, 182, 212, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else if (mode === 'circle') {
        const cx = w / 2, cy = h / 2;
        const maxR = Math.min(w, h) * 0.35;
        ctx.beginPath();
        ctx.arc(cx, cy, maxR + 4, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        ctx.stroke();

        for (let i = 0; i < bufferLength; i++) {
          const angle = (i / bufferLength) * Math.PI * 2;
          const val = dataArray[i] / 255;
          const r = maxR + val * 30;
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;
          ctx.fillStyle = `hsla(${(i / bufferLength) * 360}, 100%, 50%, ${0.3 + val * 0.5})`;
          ctx.beginPath();
          ctx.arc(x, y, 2 + val * 4, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(cx, cy, maxR, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (mode === 'particles') {
        timeRef.current += 0.02;
        const avg = dataArray.reduce((a, b) => a + b, 0) / bufferLength / 255;

        if (particlesRef.current.length < 100) {
          for (let i = 0; i < 3; i++) {
            particlesRef.current.push({
              x: Math.random() * w,
              y: Math.random() * h,
              vx: (Math.random() - 0.5) * 2,
              vy: (Math.random() - 0.5) * 2 - 1,
              size: 1 + Math.random() * 3,
              hue: Math.random() * 360,
            });
          }
        }

        particlesRef.current.forEach((p, i) => {
          p.x += p.vx * (0.5 + avg);
          p.y += p.vy * (0.5 + avg);
          p.size = 1 + avg * 4;

          dataArray.forEach((val, j) => {
            const force = (val / 255) * 0.5;
            const dx = p.x - (j / bufferLength) * w;
            const dy = p.y - h / 2;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 50 && dist > 0) {
              p.vx += (dx / dist) * force * 0.05;
              p.vy += (dy / dist) * force * 0.05;
            }
          });

          p.vx *= 0.98;
          p.vy *= 0.98;

          if (p.x < 0 || p.x > w || p.y < 0 || p.y > h) {
            particlesRef.current.splice(i, 1);
          }

          ctx.fillStyle = `hsla(${(p.hue + timeRef.current * 20) % 360}, 100%, 60%, ${0.3 + avg * 0.5})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    };

    draw();
    return () => cancelAnimationFrame(animationRef.current);
  }, [analyser, isPlaying, mode, barColor]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        width={600}
        height={height}
        className="w-full h-full"
      />
      {/* Mode Switcher */}
      <div className="absolute top-2 right-2 flex gap-1">
        {MODES.map(m => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`p-1.5 rounded-lg transition-all ${
                mode === m.id ? 'bg-cyan-400/20 text-cyan-400' : 'bg-white/5 text-zinc-500 hover:text-white'
              }`}
              title={m.label}
            >
              <Icon size={14} />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Visualizer;
