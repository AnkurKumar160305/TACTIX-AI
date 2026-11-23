import { useState } from 'react';
import { usePlayers, usePlayer } from '../hooks/useApi';
import { Card, Badge, Loader, ErrorBox } from '../components/ui';
import { PlayerRadar } from '../charts/Charts';
import PlayerSearch from '../components/PlayerSearch';
import { Search, ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';

function PlayerProfile({ player }) {
  if (!player) return null;
  const radarData = player.performance_scores
    ? Object.entries(player.performance_scores).map(([k, v]) => ({
        attribute: k.replace('_score', '').replace(/_/g, ' '),
        value: Math.round(v),
      }))
    : [];

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00FF87] to-cyan-500 flex items-center justify-center text-black font-bold text-xl">
          {player.overall}
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">{player.long_name}</h3>
          <p className="text-sm text-slate-400">{player.club_name || 'Free Agent'} • {player.nationality}</p>
          <div className="flex gap-2 mt-2">
            <Badge>{player.primary_position}</Badge>
            <Badge color="blue">{player.age} yrs</Badge>
            <Badge color="purple">{player.preferred_foot}</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[{ l: 'Overall', v: player.overall }, { l: 'Potential', v: player.potential },
          { l: 'Height', v: `${player.height_cm}cm` }, { l: 'Weight', v: `${player.weight_kg}kg` }].map(s => (
          <div key={s.l} className="bg-[#0A0F1E] rounded-md p-2.5 text-center">
            <p className="text-lg font-bold text-white">{s.v}</p>
            <p className="text-[10px] text-slate-500 uppercase">{s.l}</p>
          </div>
        ))}
      </div>

      <Card className="p-4">
        <h4 className="text-sm font-semibold text-white mb-3">Performance Radar</h4>
        <PlayerRadar data={radarData} name={player.short_name} />
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <h4 className="text-sm font-semibold text-[#00FF87] mb-2 flex items-center gap-1"><TrendingUp size={14} /> Strengths</h4>
          <div className="space-y-1.5">
            {player.strengths?.slice(0, 6).map(s => (
              <div key={s.attribute} className="flex justify-between text-xs">
                <span className="text-slate-300">{s.attribute.replace(/_/g, ' ')}</span>
                <span className="text-[#00FF87] font-mono">{s.value} <span className="text-slate-500">({s.percentile}%)</span></span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-4">
          <h4 className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-1"><TrendingDown size={14} /> Weaknesses</h4>
          <div className="space-y-1.5">
            {player.weaknesses?.slice(0, 6).map(s => (
              <div key={s.attribute} className="flex justify-between text-xs">
                <span className="text-slate-300">{s.attribute.replace(/_/g, ' ')}</span>
                <span className="text-red-400 font-mono">{s.value} <span className="text-slate-500">({s.percentile}%)</span></span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {player.suitability_scores && (
        <Card className="p-4">
          <h4 className="text-sm font-semibold text-white mb-3">Position Suitability (Heuristic Scores)</h4>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(player.suitability_scores)
              .sort(([,a],[,b]) => b - a)
              .map(([pos, score]) => (
              <div key={pos} className={`text-center p-2 rounded-md border ${score > 60 ? 'border-[#00FF87]/40 bg-[#00FF87]/5' : score > 40 ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                <p className="text-xs font-bold text-white">{pos}</p>
                <p className={`text-sm font-mono ${score > 60 ? 'text-[#00FF87]' : score > 40 ? 'text-yellow-400' : 'text-red-400'}`}>{score.toFixed(1)}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

export default function PlayersPage() {
  const { players, total, page, setPage, loading, error, setParams, params } = usePlayers({});
  const [selectedId, setSelectedId] = useState(null);
  const { player: selectedPlayer, loading: playerLoading } = usePlayer(selectedId);
  const [filters, setFilters] = useState({ position: '', search: '' });

  const applyFilters = () => {
    const p = {};
    if (filters.search) p.search = filters.search;
    if (filters.position) p.position = filters.position;
    setParams(p);
    setPage(1);
  };

  const positions = ['', 'GK', 'CB', 'LB', 'RB', 'LWB', 'RWB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'CF', 'ST'];

  return (
    <div className="flex gap-6 h-[calc(100vh-2rem)]">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-white">Player Analysis</h2>
          <p className="text-sm text-slate-400">Search, filter, and analyze player profiles</p>
        </div>

        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search players..."
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && applyFilters()}
              className="w-full bg-[#0F172A] border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:border-[#00FF87]/50 focus:outline-none"
            />
          </div>
          <select
            value={filters.position}
            onChange={e => { setFilters(f => ({ ...f, position: e.target.value })); }}
            className="bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
          >
            {positions.map(p => <option key={p} value={p}>{p || 'All Positions'}</option>)}
          </select>
          <button onClick={applyFilters} className="px-4 py-2 bg-[#00FF87] text-black font-medium text-sm rounded-lg hover:bg-[#00FF87]/90 transition">
            Filter
          </button>
        </div>

        {loading ? <Loader /> : error ? <ErrorBox message={error} /> : (
          <>
            <div className="flex-1 overflow-y-auto space-y-1">
              {players.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between transition ${selectedId === p.id ? 'bg-[#00FF87]/10 border border-[#00FF87]/30' : 'hover:bg-white/5 border border-transparent'}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-lg font-bold text-[#00FF87] w-8 text-center">{p.overall}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{p.short_name}</p>
                      <p className="text-xs text-slate-500 truncate">{p.club_name || 'Free Agent'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge>{p.primary_position}</Badge>
                    <span className="text-xs text-slate-500">{p.nationality}</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-800">
              <span className="text-xs text-slate-500">{total.toLocaleString()} players</span>
              <div className="flex gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-1.5 rounded hover:bg-white/5 disabled:opacity-30"><ChevronLeft size={16} className="text-slate-400" /></button>
                <span className="text-xs text-slate-400 px-2 py-1.5">Page {page}</span>
                <button onClick={() => setPage(p => p + 1)}
                  className="p-1.5 rounded hover:bg-white/5"><ChevronRight size={16} className="text-slate-400" /></button>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="w-[420px] overflow-y-auto">
        {playerLoading ? <Loader /> : selectedPlayer ? <PlayerProfile player={selectedPlayer} /> : (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-600 text-sm">Select a player to view profile</p>
          </div>
        )}
      </div>
    </div>
  );
}
