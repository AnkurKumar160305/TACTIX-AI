import { useState } from 'react';
import { api } from '../services/api';
import { Card, Badge, Loader, ErrorBox } from '../components/ui';
import PlayerSearch from '../components/PlayerSearch';
import { Crosshair, ShieldAlert, Zap, TrendingUp, Sliders, UserPlus, Trash2 } from 'lucide-react';

export default function OpponentPage() {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [opponentLineup, setOpponentLineup] = useState([]);
  const [searchOpponent, setSearchOpponent] = useState(null);
  const [assignedPos, setAssignedPos] = useState('CB');
  const [formation, setFormation] = useState('4-3-3');
  const [weights, setWeights] = useState({ alpha: 0.40, beta: 0.35, gamma: 0.25 });
  
  const [analysisResult, setAnalysisResult] = useState(null);
  const [recommendResult, setRecommendResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addOpponentPlayer = () => {
    if (!searchOpponent) return;
    if (opponentLineup.some(p => p.player_id === searchOpponent.id)) return;
    setOpponentLineup(prev => [...prev, { player_id: searchOpponent.id, player: searchOpponent, position: assignedPos }]);
    setSearchOpponent(null);
  };

  const removeOpponent = (id) => {
    setOpponentLineup(prev => prev.filter(p => p.player_id !== id));
  };

  const runAnalysis = async () => {
    if (!selectedPlayer) return;
    setLoading(true);
    setError(null);
    try {
      const oppPayload = opponentLineup.map(p => ({ player_id: p.player_id, position: p.position }));
      
      const [oppRes, recRes] = await Promise.all([
        api.opponentAnalysis({
          player_id: selectedPlayer.id,
          opponent_lineup: oppPayload,
          formation,
          alpha: weights.alpha,
          beta: weights.beta,
          gamma: weights.gamma,
        }),
        api.recommendPosition({
          player_id: selectedPlayer.id,
          opponent_lineup: oppPayload,
          alpha: weights.alpha,
          beta: weights.beta,
          gamma: weights.gamma,
        })
      ]);

      setAnalysisResult(oppRes);
      setRecommendResult(recRes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Crosshair size={24} className="text-[#00FF87]" /> Opponent Strategic Analysis & Matchup Engine
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Simulate opponent lineups, identify structural backline weaknesses, and compute transparent composite recommendations:
          <span className="text-[#00FF87] font-mono text-xs ml-2">FinalScore = α·ML + β·Suitability + γ·Matchup</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Player Selection & Opponent Squad Builder */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-white mb-2">1. Your Tactical Player</h3>
            <PlayerSearch onSelect={setSelectedPlayer} placeholder="Search squad player..." />
            {selectedPlayer && (
              <div className="mt-3 p-3 bg-[#0A0F1E] rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">{selectedPlayer.short_name}</p>
                  <p className="text-xs text-slate-400">{selectedPlayer.club_name || 'Free Agent'}</p>
                </div>
                <div className="text-right">
                  <Badge>{selectedPlayer.primary_position}</Badge>
                  <p className="text-xs text-[#00FF87] font-mono mt-1">{selectedPlayer.overall} OVR</p>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-semibold text-white mb-2">2. Build Opponent Squad</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Opponent Formation</label>
                <select
                  value={formation}
                  onChange={e => setFormation(e.target.value)}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-md px-3 py-1.5 text-sm text-white focus:outline-none"
                >
                  <option value="4-3-3">4-3-3 Defensive Backline</option>
                  <option value="4-4-2">4-4-2 Flat Defense</option>
                  <option value="4-2-3-1">4-2-3-1 Double Pivot</option>
                  <option value="3-5-2">3-5-2 Wingbacks</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Add Opponent Player</label>
                <PlayerSearch onSelect={setSearchOpponent} placeholder="Search opponent player..." />
              </div>

              {searchOpponent && (
                <div className="flex gap-2 items-center bg-[#0F172A] p-2 rounded border border-slate-800">
                  <span className="text-xs text-white truncate flex-1">{searchOpponent.short_name} ({searchOpponent.overall})</span>
                  <select
                    value={assignedPos}
                    onChange={e => setAssignedPos(e.target.value)}
                    className="bg-[#1E293B] text-xs text-white rounded px-2 py-1 border border-slate-700"
                  >
                    {['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <button
                    onClick={addOpponentPlayer}
                    className="p-1.5 bg-[#00FF87] text-black rounded hover:bg-[#00FF87]/90 text-xs font-semibold"
                  >
                    <UserPlus size={14} />
                  </button>
                </div>
              )}

              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Active Opponents ({opponentLineup.length})</p>
                {opponentLineup.length === 0 ? (
                  <p className="text-xs text-slate-600 italic">No opponents added yet. Add CBs or fullbacks to evaluate matchups.</p>
                ) : (
                  opponentLineup.map(p => (
                    <div key={p.player_id} className="flex items-center justify-between bg-[#0A0F1E] px-2.5 py-1.5 rounded text-xs border border-slate-800">
                      <span className="text-white font-medium">{p.player.short_name}</span>
                      <div className="flex items-center gap-2">
                        <Badge color="red">{p.position}</Badge>
                        <button onClick={() => removeOpponent(p.player_id)} className="text-slate-500 hover:text-red-400">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>

          {/* Configurable Hyperparameters */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-1.5">
              <Sliders size={14} className="text-[#00FF87]" /> Recommendation Weights
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>α (ML Prob Weight): {weights.alpha.toFixed(2)}</span>
                <input
                  type="range" min="0" max="1" step="0.05"
                  value={weights.alpha}
                  onChange={e => setWeights(w => ({ ...w, alpha: parseFloat(e.target.value) }))}
                  className="w-24 accent-[#00FF87]"
                />
              </div>
              <div className="flex justify-between text-slate-400">
                <span>β (Suitability Weight): {weights.beta.toFixed(2)}</span>
                <input
                  type="range" min="0" max="1" step="0.05"
                  value={weights.beta}
                  onChange={e => setWeights(w => ({ ...w, beta: parseFloat(e.target.value) }))}
                  className="w-24 accent-cyan-400"
                />
              </div>
              <div className="flex justify-between text-slate-400">
                <span>γ (Matchup Advantage): {weights.gamma.toFixed(2)}</span>
                <input
                  type="range" min="0" max="1" step="0.05"
                  value={weights.gamma}
                  onChange={e => setWeights(w => ({ ...w, gamma: parseFloat(e.target.value) }))}
                  className="w-24 accent-orange-400"
                />
              </div>
            </div>

            <button
              onClick={runAnalysis}
              disabled={!selectedPlayer || loading}
              className="mt-4 w-full py-2.5 bg-[#00FF87] text-black font-semibold text-sm rounded-lg hover:bg-[#00FF87]/90 disabled:opacity-40 transition flex items-center justify-center gap-2"
            >
              <Zap size={15} /> Execute Strategic Analysis
            </button>
          </Card>
        </div>

        {/* Right Columns: Analysis Dashboard & Tactical Insights */}
        <div className="lg:col-span-2 space-y-5">
          {loading && <Loader />}
          {error && <ErrorBox message={error} />}

          {recommendResult && (
            <Card className="p-5 border-[#00FF87]/40 bg-gradient-to-br from-[#111827] to-[#0A0F1E]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp size={16} className="text-[#00FF87]" /> Ranked Position Recommendations Against Opponent
                </h3>
                <span className="text-xs text-slate-400">Formula-Driven Score</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {recommendResult.recommendations?.slice(0, 3).map((rec, idx) => (
                  <div key={rec.position} className={`p-3.5 rounded-lg border ${idx === 0 ? 'border-[#00FF87] bg-[#00FF87]/10' : 'border-slate-800 bg-[#0F172A]'}`}>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Rank #{idx + 1}</span>
                      <Badge color={idx === 0 ? 'green' : 'blue'}>{rec.position}</Badge>
                    </div>
                    <p className="text-2xl font-bold text-white mt-1">{rec.final_score.toFixed(1)}%</p>
                    <div className="mt-2 space-y-1 text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
                      <div className="flex justify-between">
                        <span>ML Probability:</span>
                        <span className="text-white font-mono">{rec.ml_probability.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Role Suitability:</span>
                        <span className="text-cyan-400 font-mono">{rec.suitability_score.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Matchup Edge:</span>
                        <span className="text-[#00FF87] font-mono">{rec.matchup_score.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {analysisResult && (
            <>
              {/* Detailed 1v1 Matchups */}
              <Card className="p-5">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Crosshair size={15} className="text-cyan-400" /> Direct 1v1 Matchup Differential Breakdown
                </h3>
                {analysisResult.opponent_matchups?.length === 0 ? (
                  <p className="text-xs text-slate-500">Add opponent players to view detailed attribute delta calculations.</p>
                ) : (
                  <div className="space-y-3">
                    {analysisResult.opponent_matchups.map(m => (
                      <div key={m.opponent.id} className="p-3 bg-[#0A0F1E] rounded-lg border border-slate-800 space-y-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-sm font-bold text-white">{selectedPlayer.short_name}</span>
                            <span className="text-xs text-slate-500 mx-2">vs</span>
                            <span className="text-sm font-bold text-red-400">{m.opponent.short_name} ({m.assigned_position})</span>
                          </div>
                          <Badge color={m.matchup_score > 55 ? 'green' : m.matchup_score < 45 ? 'red' : 'yellow'}>
                            Matchup Score: {m.matchup_score.toFixed(1)}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-center text-xs">
                          {Object.entries(m.matchup_advantages || {}).map(([metric, diff]) => (
                            <div key={metric} className="bg-slate-900/60 p-1.5 rounded">
                              <p className="text-[10px] text-slate-500 capitalize">{metric.replace(/_/g, ' ')}</p>
                              <p className={`font-mono font-bold ${diff > 0 ? 'text-[#00FF87]' : diff < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                                {diff > 0 ? `+${diff}` : diff}
                              </p>
                            </div>
                          ))}
                        </div>
                        {m.tactical_recommendations?.length > 0 && (
                          <div className="border-t border-slate-800/80 pt-2 space-y-1">
                            {m.tactical_recommendations.map((rec, i) => (
                              <p key={i} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                                <span className="text-[#00FF87] font-bold">›</span> {rec}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Aggregated Backline Weaknesses */}
              <Card className="p-5">
                <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <ShieldAlert size={15} className="text-orange-400" /> Exploitable Opponent Team Weaknesses
                </h3>
                {Object.keys(analysisResult.aggregate_weaknesses || {}).length === 0 ? (
                  <p className="text-xs text-slate-500">No acute defensive vulnerabilities (&lt;55 rating) identified in the selected opponent roster.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(analysisResult.aggregate_weaknesses).map(([attr, players]) => (
                      <div key={attr} className="p-2.5 bg-red-500/5 border border-red-500/20 rounded-md">
                        <p className="text-xs font-semibold text-red-400 capitalize">{attr.replace(/_/g, ' ')} Weakness</p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Exposed players: {players.map(p => `${p.player} (${p.value.toFixed(0)})`).join(', ')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </>
          )}

          {!recommendResult && !loading && (
            <div className="p-12 border border-dashed border-slate-800 rounded-lg text-center">
              <Crosshair size={32} className="mx-auto text-slate-600 mb-2" />
              <p className="text-sm text-slate-400">Select your player and add opposing defenders to generate tactical matchup recommendations.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
