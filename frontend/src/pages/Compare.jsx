import { useState } from 'react';
import { api } from '../services/api';
import { Card, Badge, Loader, ErrorBox } from '../components/ui';
import { CompareRadar } from '../charts/Charts';
import PlayerSearch from '../components/PlayerSearch';
import { GitCompare, X, UserPlus, TrendingUp } from 'lucide-react';

export default function ComparePage() {
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addPlayer = async (p) => {
    if (selectedPlayers.some(sp => sp.id === p.id) || selectedPlayers.length >= 4) return;
    const nextList = [...selectedPlayers, p];
    setSelectedPlayers(nextList);
    fetchComparison(nextList.map(item => item.id));
  };

  const removePlayer = (id) => {
    const nextList = selectedPlayers.filter(p => p.id !== id);
    setSelectedPlayers(nextList);
    if (nextList.length >= 2) {
      fetchComparison(nextList.map(item => item.id));
    } else {
      setComparisonData([]);
    }
  };

  const fetchComparison = async (ids) => {
    if (ids.length < 2) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.comparePlayers(ids);
      setComparisonData(res.players);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const colors = ['#00FF87', '#00E5FF', '#A855F7', '#F97316'];
  const coreAttrs = [
    'attacking_crossing', 'attacking_finishing', 'attacking_short_passing',
    'skill_dribbling', 'skill_ball_control', 'movement_sprint_speed',
    'movement_acceleration', 'power_shot_power', 'power_stamina',
    'power_strength', 'mentality_vision', 'mentality_interceptions',
    'defending_standing_tackle'
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <GitCompare size={24} className="text-[#00FF87]" /> Player Head-to-Head Comparison Engine
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Select 2 to 4 players to compare performance radars, technical attributes, and tactical suitability
        </p>
      </div>

      {/* Selector Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="md:col-span-2">
            <PlayerSearch onSelect={addPlayer} placeholder="Search player to add to comparison..." />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Comparing: {selectedPlayers.length}/4</span>
            {selectedPlayers.length < 2 && (
              <span className="text-xs text-amber-400 italic">Select at least 2 players</span>
            )}
          </div>
        </div>

        {/* Selected Player Chips */}
        {selectedPlayers.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-800">
            {selectedPlayers.map((p, i) => (
              <div
                key={p.id}
                style={{ borderColor: colors[i % colors.length] }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0A0F1E] border text-xs"
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
                <span className="font-bold text-white">{p.short_name}</span>
                <span className="text-slate-400">({p.primary_position} • {p.overall})</span>
                <button onClick={() => removePlayer(p.id)} className="text-slate-500 hover:text-red-400 ml-1">
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {loading && <Loader />}
      {error && <ErrorBox message={error} />}

      {comparisonData.length >= 2 && (
        <div className="space-y-6">
          {/* Overlaid Radar Chart */}
          <Card className="p-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-white">Multidimensional Tactical Radar Comparison</h3>
              <div className="flex gap-4 text-xs">
                {comparisonData.map((p, i) => (
                  <span key={p.id} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors[i] }} />
                    <span className="text-white font-medium">{p.short_name}</span>
                  </span>
                ))}
              </div>
            </div>
            <CompareRadar players={comparisonData} />
          </Card>

          {/* Quick Header Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {comparisonData.map((p, i) => (
              <Card key={p.id} className="p-4 border-t-2" style={{ borderTopColor: colors[i] }}>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-white text-base">{p.short_name}</h4>
                    <p className="text-xs text-slate-400">{p.club_name || 'Free Agent'}</p>
                  </div>
                  <span className="text-xl font-bold font-mono" style={{ color: colors[i] }}>{p.overall}</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="bg-[#0A0F1E] p-1.5 rounded">
                    <span className="text-[10px] text-slate-500 block">ROLE</span>
                    <span className="font-bold text-white">{p.primary_position}</span>
                  </div>
                  <div className="bg-[#0A0F1E] p-1.5 rounded">
                    <span className="text-[10px] text-slate-500 block">AGE</span>
                    <span className="font-bold text-white">{p.age}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Granular Attribute Differential Matrix */}
          <Card className="p-5 overflow-x-auto">
            <h3 className="text-sm font-semibold text-white mb-3">Attribute Comparison Table</h3>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3">Football Attribute</th>
                  {comparisonData.map((p, i) => (
                    <th key={p.id} className="py-2.5 px-3 text-center" style={{ color: colors[i] }}>
                      {p.short_name}
                    </th>
                  ))}
                  <th className="py-2.5 px-3 text-right">Attribute Leader</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {coreAttrs.map(attr => {
                  const values = comparisonData.map(p => p.attributes?.[attr] || 0);
                  const maxVal = Math.max(...values);
                  const leaderIdx = values.indexOf(maxVal);

                  return (
                    <tr key={attr} className="hover:bg-white/5">
                      <td className="py-2.5 px-3 font-sans text-slate-300 capitalize">
                        {attr.replace(/_/g, ' ')}
                      </td>
                      {comparisonData.map((p, i) => {
                        const val = p.attributes?.[attr] || 0;
                        const isLeader = val === maxVal;
                        return (
                          <td key={p.id} className={`py-2.5 px-3 text-center ${isLeader ? 'font-bold text-white bg-[#00FF87]/5' : 'text-slate-400'}`}>
                            {val}
                          </td>
                        );
                      })}
                      <td className="py-2.5 px-3 text-right font-sans">
                        <span className="font-semibold text-xs" style={{ color: colors[leaderIdx] }}>
                          {comparisonData[leaderIdx].short_name} ({maxVal})
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {selectedPlayers.length < 2 && (
        <Card className="p-12 text-center border-dashed border-slate-800">
          <GitCompare size={36} className="mx-auto text-slate-600 mb-2" />
          <p className="text-sm text-slate-400">Search and select at least two players to compare tactical metrics and radar charts.</p>
        </Card>
      )}
    </div>
  );
}
