import { useState, useEffect } from 'react';
import { api } from '../services/api';
import FootballPitch3D from '../three/FootballPitch3D';
import { Card, Badge, Loader, ErrorBox } from '../components/ui';
import PlayerSearch from '../components/PlayerSearch';
import { Box, Layers, Users, Zap, Shield, Sparkles, ChevronRight, Info } from 'lucide-react';

const FORMATIONS = ['4-3-3', '4-4-2', '4-2-3-1', '3-5-2', '4-1-4-1', '3-4-3'];

export default function TacticalPage() {
  const [formation, setFormation] = useState('4-3-3');
  const [viewMode, setViewMode] = useState('3D'); // '3D' or '2D'
  const [squad, setSquad] = useState([]);
  const [tacticalAssignments, setTacticalAssignments] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [playerDetail, setPlayerDetail] = useState(null);
  const [showZones, setShowZones] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize with top rated players across positions if squad empty
  useEffect(() => {
    async function initSquad() {
      try {
        setLoading(true);
        // Fetch top players
        const res = await api.getPlayers({ per_page: 11, sort_by: 'overall', sort_order: 'desc' });
        setSquad(res.players);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    initSquad();
  }, []);

  // Update tactical formation assignments whenever squad or formation changes
  useEffect(() => {
    if (!squad.length) return;
    async function updateFormation() {
      try {
        const pids = squad.map(p => p.id);
        const res = await api.tacticalFormation(pids, formation);
        
        // Enrich assignments with 3D marker coordinates and names
        const enriched = res.assignments.map(a => ({
          ...a.player,
          x: a.x,
          y: a.y,
          position_label: a.position,
          suitability: a.suitability,
          color: a.color,
          team: 'home',
        }));
        setTacticalAssignments(enriched);
      } catch (e) {
        setError(e.message);
      }
    }
    updateFormation();
  }, [squad, formation]);

  // Load detailed player info when selected
  const handleSelectPlayer = async (p) => {
    setSelectedPlayer(p);
    try {
      const detail = await api.getPlayer(p.id);
      setPlayerDetail(detail);
    } catch {
      setPlayerDetail(null);
    }
  };

  const handleAddPlayer = (newPlayer) => {
    setSquad(prev => {
      if (prev.some(p => p.id === newPlayer.id)) return prev;
      return [...prev.slice(0, 10), newPlayer];
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Box size={24} className="text-[#00FF87]" /> 3D Tactical Pitch & Squad Strategic Planner
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time interactive 3D tactical simulation with realistic FIFA proportions and dynamic position suitability
          </p>
        </div>

        {/* Controls: Formations and View Mode */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#0F172A] border border-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('3D')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${viewMode === '3D' ? 'bg-[#00FF87] text-black' : 'text-slate-400 hover:text-white'}`}
            >
              3D Perspective
            </button>
            <button
              onClick={() => setViewMode('2D')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${viewMode === '2D' ? 'bg-[#00FF87] text-black' : 'text-slate-400 hover:text-white'}`}
            >
              2D Tactical Board
            </button>
          </div>

          <button
            onClick={() => setShowZones(z => !z)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition flex items-center gap-1.5 ${showZones ? 'border-[#00FF87] text-[#00FF87] bg-[#00FF87]/10' : 'border-slate-800 text-slate-400 bg-[#0F172A]'}`}
          >
            <Layers size={13} /> {showZones ? 'Hide Zones' : 'Show Zones'}
          </button>

          <select
            value={formation}
            onChange={e => setFormation(e.target.value)}
            className="bg-[#0F172A] border border-slate-700 text-white rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none"
          >
            {FORMATIONS.map(f => (
              <option key={f} value={f}>Formation: {f}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <ErrorBox message={error} />}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main Pitch Area */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="p-3 bg-[#0A0F1E] border-slate-800 relative">
            {viewMode === '3D' ? (
              <FootballPitch3D
                players={tacticalAssignments}
                onPlayerClick={handleSelectPlayer}
                selectedPlayerId={selectedPlayer?.id}
              />
            ) : (
              /* 2D Tactical Pitch Representation */
              <div className="relative w-full h-[500px] bg-[#1a5e1a] rounded-lg border-2 border-white/20 overflow-hidden select-none">
                {/* 2D Pitch Lines */}
                <div className="absolute inset-4 border border-white/40 pointer-events-none" />
                <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-white/40 -translate-y-1/2 pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 w-28 h-28 border border-white/40 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                
                {/* Tactical Zones Overlay */}
                {showZones && (
                  <div className="absolute inset-4 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-20">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="border border-yellow-400/50 flex items-center justify-center text-[10px] text-yellow-300">
                        Zone {i + 1}
                      </div>
                    ))}
                  </div>
                )}

                {/* 2D Player Markers */}
                {tacticalAssignments.map(p => {
                  const isSel = selectedPlayer?.id === p.id;
                  const colorBg = p.color === 'green' ? 'bg-[#00FF87] text-black' : p.color === 'yellow' ? 'bg-yellow-400 text-black' : 'bg-red-500 text-white';
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectPlayer(p)}
                      style={{ left: `${p.x}%`, top: `${p.y}%` }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-125 flex flex-col items-center z-10`}
                    >
                      <div className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center shadow-lg border-2 ${isSel ? 'ring-4 ring-white border-black scale-110' : 'border-slate-900'} ${colorBg}`}>
                        {p.position_label || p.primary_position}
                      </div>
                      <span className="text-[10px] font-bold text-white bg-black/80 px-1 rounded mt-0.5 whitespace-nowrap shadow">
                        {p.short_name?.split(' ').pop()}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pitch Legend */}
            <div className="mt-3 flex items-center justify-between text-xs text-slate-400 px-2">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#00FF87]" /> High Suitability (&gt;60)</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400" /> Moderate Suitability (40-60)</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Low Suitability (&lt;40)</span>
              </div>
              <span className="text-[11px] text-slate-500">Click any player to inspect tactical profile</span>
            </div>
          </Card>

          {/* Tactical Recommendations Bar */}
          <Card className="p-4 bg-gradient-to-r from-[#111827] to-[#0A0F1E]">
            <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <Sparkles size={14} className="text-[#00FF87]" /> Formation Tactical Analysis ({formation})
            </h3>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 bg-[#0F172A] rounded border border-slate-800">
                <p className="text-slate-400">Wing Overload Potential</p>
                <p className="text-[#00FF87] font-bold mt-0.5">{formation === '4-3-3' || formation === '3-4-3' ? 'High Exploitation' : 'Moderate Channel'}</p>
              </div>
              <div className="p-2.5 bg-[#0F172A] rounded border border-slate-800">
                <p className="text-slate-400">Central Midfield Control</p>
                <p className="text-cyan-400 font-bold mt-0.5">{formation === '4-2-3-1' || formation === '3-5-2' ? 'High Density Dominance' : 'Standard Width'}</p>
              </div>
              <div className="p-2.5 bg-[#0F172A] rounded border border-slate-800">
                <p className="text-slate-400">Defensive Transition Shape</p>
                <p className="text-orange-400 font-bold mt-0.5">{formation.startsWith('3') ? '3-Centerback Resiliency' : 'Flat Back 4 Coverage'}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Sidebar: Selected Player Detail & Squad Management */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-white mb-2 flex items-center justify-between">
              <span>Substitute / Add Player</span>
              <Users size={14} className="text-slate-400" />
            </h3>
            <PlayerSearch onSelect={handleAddPlayer} placeholder="Search player to slot into squad..." />
          </Card>

          {selectedPlayer ? (
            <Card className="p-4 border-[#00FF87]/30 bg-[#0F172A] space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">{selectedPlayer.short_name}</h3>
                  <p className="text-xs text-slate-400">{selectedPlayer.club_name || 'Free Agent'} • {selectedPlayer.nationality}</p>
                </div>
                <div className="text-right">
                  <Badge>{selectedPlayer.position_label || selectedPlayer.primary_position}</Badge>
                  <p className="text-lg font-bold text-[#00FF87] font-mono mt-0.5">{selectedPlayer.overall} OVR</p>
                </div>
              </div>

              {selectedPlayer.suitability != null && (
                <div className="p-2.5 bg-[#0A0F1E] rounded-md border border-slate-800">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-slate-400">Role Fit in {selectedPlayer.position_label}:</span>
                    <span className="font-bold text-white font-mono">{selectedPlayer.suitability.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${selectedPlayer.suitability > 60 ? 'bg-[#00FF87]' : selectedPlayer.suitability > 40 ? 'bg-yellow-400' : 'bg-red-500'}`}
                      style={{ width: `${selectedPlayer.suitability}%` }}
                    />
                  </div>
                </div>
              )}

              {playerDetail && (
                <>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-[#0A0F1E] p-2 rounded border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">POTENTIAL</span>
                      <span className="text-white font-bold">{playerDetail.potential}</span>
                    </div>
                    <div className="bg-[#0A0F1E] p-2 rounded border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">PREFERRED FOOT</span>
                      <span className="text-white font-bold">{playerDetail.preferred_foot}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-[#00FF87] mb-1.5 flex items-center gap-1">
                      <Zap size={12} /> Key Strengths
                    </p>
                    <div className="space-y-1">
                      {playerDetail.strengths?.slice(0, 3).map(s => (
                        <div key={s.attribute} className="flex justify-between text-xs text-slate-300">
                          <span className="truncate max-w-[150px]">{s.attribute.replace(/_/g, ' ')}</span>
                          <span className="text-[#00FF87] font-mono">{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-red-400 mb-1.5 flex items-center gap-1">
                      <Shield size={12} /> Vulnerabilities
                    </p>
                    <div className="space-y-1">
                      {playerDetail.weaknesses?.slice(0, 3).map(w => (
                        <div key={w.attribute} className="flex justify-between text-xs text-slate-300">
                          <span className="truncate max-w-[150px]">{w.attribute.replace(/_/g, ' ')}</span>
                          <span className="text-red-400 font-mono">{w.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </Card>
          ) : (
            <Card className="p-8 text-center border-dashed border-slate-800">
              <Info size={28} className="mx-auto text-slate-600 mb-2" />
              <p className="text-xs text-slate-500">Select a player marker on the 3D pitch to inspect detailed attributes and tactical suitability.</p>
            </Card>
          )}

          {/* Current Starting XI Roster */}
          <Card className="p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Starting Lineup ({squad.length}/11)</h3>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {tacticalAssignments.map(p => (
                <div
                  key={p.id}
                  onClick={() => handleSelectPlayer(p)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded text-xs cursor-pointer transition ${selectedPlayer?.id === p.id ? 'bg-[#00FF87]/15 border border-[#00FF87]/40' : 'bg-[#0A0F1E] hover:bg-white/5 border border-slate-800'}`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-5 text-center font-bold text-[#00FF87]">{p.position_label || p.primary_position}</span>
                    <span className="text-white truncate">{p.short_name}</span>
                  </div>
                  <span className="text-slate-400 font-mono">{p.overall}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
