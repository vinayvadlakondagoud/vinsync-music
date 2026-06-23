import { useMusic } from '../context/MusicContext';
import { Clock, Music4, Heart, BarChart3, TrendingUp, Headphones } from 'lucide-react';
import { useMemo } from 'react';

const StatsDashboard = () => {
  const { history, playlist, likedSongs } = useMusic();

  const stats = useMemo(() => {
    const songPlays = {};
    let totalListeningMs = 0;

    history.forEach(entry => {
      const sid = String(entry.song_id);
      songPlays[sid] = (songPlays[sid] || 0) + 1;
      if (entry.played_at) {
        const prev = history[history.indexOf(entry) - 1];
        if (prev?.played_at) {
          totalListeningMs += new Date(entry.played_at) - new Date(prev.played_at);
        }
      }
    });

    const sorted = Object.entries(songPlays)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([id, count]) => {
        const song = playlist.find(s => String(s.id) === id);
        return song ? { ...song, plays: count } : null;
      })
      .filter(Boolean);

    const totalHours = Math.floor(totalListeningMs / 3600000);
    const totalMinutes = Math.floor((totalListeningMs % 3600000) / 60000);
    const uniqueSongs = Object.keys(songPlays).length;

    return { sorted, totalHours, totalMinutes, uniqueSongs, totalPlays: history.length };
  }, [history, playlist]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-cyan-400 mb-4">
        <BarChart3 size={20} />
        <h3 className="text-lg font-bold text-white">Listening Stats</h3>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <Clock size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Time</span>
          </div>
          <p className="text-2xl font-black text-white">
            {stats.totalHours}h <span className="text-lg text-zinc-400">{stats.totalMinutes}m</span>
          </p>
        </div>

        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <Music4 size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Songs Played</span>
          </div>
          <p className="text-2xl font-black text-white">{stats.uniqueSongs}</p>
          <p className="text-[10px] text-zinc-500">unique tracks</p>
        </div>

        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <TrendingUp size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Plays</span>
          </div>
          <p className="text-2xl font-black text-white">{stats.totalPlays}</p>
        </div>

        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <Heart size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Liked</span>
          </div>
          <p className="text-2xl font-black text-white">{likedSongs.length}</p>
        </div>
      </div>

      {/* Top Songs */}
      {stats.sorted.length > 0 && (
        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
          <div className="flex items-center gap-2 text-cyan-400 mb-3">
            <Headphones size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Top Played</span>
          </div>
          <div className="space-y-2">
            {stats.sorted.map((song, i) => (
              <div key={song.id} className="flex items-center gap-3">
                <span className="text-xs font-black text-zinc-500 w-4">{i + 1}</span>
                <div className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0 bg-zinc-800">
                  <img src={song.image} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{song.name}</p>
                  <p className="text-[10px] text-zinc-400 truncate">{song.artist}</p>
                </div>
                <span className="text-xs font-bold text-cyan-400">{song.plays}x</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsDashboard;
