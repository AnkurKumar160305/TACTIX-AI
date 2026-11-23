import { useState } from 'react';
import { api } from '../services/api';
import { Card, Badge, Loader, ErrorBox } from '../components/ui';
import PlayerSearch from '../components/PlayerSearch';
import { FileText, Download, Printer, CheckCircle, FileSpreadsheet, Shield } from 'lucide-react';

export default function ReportsPage() {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSelectPlayer = async (p) => {
    setSelectedPlayer(p);
    setLoading(true);
    try {
      const data = await api.analyzePlayer(p.id);
      setPlayerData(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Export current player data as CSV
  const exportCSV = () => {
    if (!playerData) return;
    const headers = ['Attribute', 'Value', 'Percentile'];
    const rows = Object.entries(playerData.attributes || {}).map(([k, v]) => [
      k,
      v,
      playerData.all_percentiles?.[k] || 'N/A'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${playerData.short_name}_tactix_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export complete tactical squad CSV
  const exportSquadCSV = async () => {
    try {
      const res = await api.getPlayers({ per_page: 50, sort_by: 'overall', sort_order: 'desc' });
      const headers = ['ID', 'Name', 'Position', 'Overall', 'Potential', 'Club', 'Nationality'];
      const rows = res.players.map(p => [
        p.id,
        `"${p.short_name}"`,
        p.primary_position,
        p.overall,
        p.potential,
        `"${p.club_name || ''}"`,
        `"${p.nationality}"`
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', 'tactix_ai_top50_squad.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      setError(e.message);
    }
  };

  // Browser Print trigger for PDF generation
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText size={24} className="text-[#00FF87]" /> Tactical Intelligence Reports & Export
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Generate formal scouting dossiers, tactical analyses, and export dataset statistics (PDF/CSV)
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={exportSquadCSV}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
          >
            <FileSpreadsheet size={14} className="text-[#00FF87]" /> Export Top 50 CSV
          </button>
          <button
            onClick={handlePrint}
            disabled={!playerData}
            className="px-4 py-2 bg-[#00FF87] hover:bg-[#00FF87]/90 text-black text-xs font-bold rounded-lg transition flex items-center gap-1.5 disabled:opacity-40"
          >
            <Printer size={14} /> Print / Save PDF
          </button>
        </div>
      </div>

      <Card className="p-4 print:hidden">
        <label className="text-xs text-slate-400 uppercase tracking-wider block mb-2 font-semibold">Select Player for Dossier</label>
        <PlayerSearch onSelect={handleSelectPlayer} placeholder="Search player to generate comprehensive dossier..." />
      </Card>

      {loading && <Loader />}
      {error && <ErrorBox message={error} />}

      {/* Printable Player Report Dossier */}
      {playerData && (
        <div id="printable-report" className="space-y-5 bg-[#0F172A] p-6 rounded-lg border border-slate-800 print:bg-white print:text-black print:border-none print:p-0">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-800 pb-4 print:border-black">
            <div>
              <span className="text-xs text-[#00FF87] font-mono uppercase tracking-widest font-bold">TACTIX AI Scouting Report</span>
              <h3 className="text-2xl font-bold text-white print:text-black mt-1">{playerData.long_name}</h3>
              <p className="text-sm text-slate-400 print:text-gray-600">
                {playerData.club_name || 'Free Agent'} • {playerData.nationality} • Age {playerData.age}
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-[#00FF87] font-mono print:text-black">{playerData.overall}</span>
              <p className="text-[10px] text-slate-500 uppercase print:text-gray-600">Overall Rating</p>
              <Badge color="green">{playerData.primary_position}</Badge>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="bg-[#0A0F1E] p-2.5 rounded border border-slate-800 print:border-gray-300 print:bg-gray-50">
              <span className="text-[10px] text-slate-500 block uppercase">POTENTIAL</span>
              <span className="text-lg font-bold text-white print:text-black">{playerData.potential}</span>
            </div>
            <div className="bg-[#0A0F1E] p-2.5 rounded border border-slate-800 print:border-gray-300 print:bg-gray-50">
              <span className="text-[10px] text-slate-500 block uppercase">PREFERRED FOOT</span>
              <span className="text-lg font-bold text-white print:text-black">{playerData.preferred_foot}</span>
            </div>
            <div className="bg-[#0A0F1E] p-2.5 rounded border border-slate-800 print:border-gray-300 print:bg-gray-50">
              <span className="text-[10px] text-slate-500 block uppercase">HEIGHT / WEIGHT</span>
              <span className="text-lg font-bold text-white print:text-black">{playerData.height_cm}cm / {playerData.weight_kg}kg</span>
            </div>
            <div className="bg-[#0A0F1E] p-2.5 rounded border border-slate-800 print:border-gray-300 print:bg-gray-50">
              <span className="text-[10px] text-slate-500 block uppercase">VALUE</span>
              <span className="text-lg font-bold text-[#00FF87] print:text-black font-mono">€{(playerData.value_eur/1000000).toFixed(1)}M</span>
            </div>
          </div>

          {/* Machine Learning Position Forecast Summary */}
          {playerData.predictions && (
            <div className="p-4 bg-[#0A0F1E] rounded-lg border border-slate-800 print:border-gray-300 print:bg-gray-50">
              <h4 className="text-xs font-bold text-white print:text-black uppercase tracking-wider mb-2">
                Multi-Model Position Classification Consensus
              </h4>
              <div className="grid grid-cols-3 gap-3 text-xs">
                {Object.entries(playerData.predictions).map(([mName, pRes]) => (
                  <div key={mName} className="p-2.5 bg-[#111827] rounded border border-slate-800 print:border-gray-200">
                    <span className="text-[10px] text-slate-400 capitalize block">{mName.replace(/_/g, ' ')}</span>
                    <span className="text-sm font-bold text-[#00FF87] print:text-black">{pRes.predicted_position || 'N/A'}</span>
                    <span className="text-slate-500 text-[11px] ml-1.5">({pRes.confidence}%)</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3.5 bg-[#0A0F1E] rounded-lg border border-[#00FF87]/20 print:border-gray-300">
              <h4 className="text-xs font-bold text-[#00FF87] print:text-green-700 uppercase mb-2">Observed Tactical Strengths</h4>
              <div className="space-y-1 text-xs">
                {playerData.strengths?.slice(0, 5).map(s => (
                  <div key={s.attribute} className="flex justify-between text-slate-300 print:text-black">
                    <span>{s.attribute.replace(/_/g, ' ')}</span>
                    <span className="text-[#00FF87] print:text-green-700 font-mono font-bold">{s.value} (Top {100 - s.percentile}%)</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 bg-[#0A0F1E] rounded-lg border border-red-500/20 print:border-gray-300">
              <h4 className="text-xs font-bold text-red-400 print:text-red-700 uppercase mb-2">Tactical Vulnerabilities</h4>
              <div className="space-y-1 text-xs">
                {playerData.weaknesses?.slice(0, 5).map(w => (
                  <div key={w.attribute} className="flex justify-between text-slate-300 print:text-black">
                    <span>{w.attribute.replace(/_/g, ' ')}</span>
                    <span className="text-red-400 print:text-red-700 font-mono font-bold">{w.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex justify-between items-center pt-3 border-t border-slate-800 print:hidden">
            <span className="text-xs text-slate-500">Report generated via TACTIX AI Analytics Engine</span>
            <button
              onClick={exportCSV}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded transition flex items-center gap-1.5"
            >
              <Download size={13} /> Export Player Attributes CSV
            </button>
          </div>
        </div>
      )}

      {!playerData && !loading && (
        <Card className="p-12 text-center border-dashed border-slate-800">
          <FileText size={36} className="mx-auto text-slate-600 mb-2" />
          <p className="text-sm text-slate-400">Search and select a player to compile an academic and tactical scouting dossier.</p>
        </Card>
      )}
    </div>
  );
}
