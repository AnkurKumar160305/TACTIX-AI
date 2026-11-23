import { useDashboard } from '../hooks/useApi';
import { Card, StatCard, Loader, ErrorBox } from '../components/ui';
import { PositionPie } from '../charts/Charts';
import { Users, Target, Brain, TrendingUp, Activity, Zap } from 'lucide-react';

export default function Dashboard() {
  const { stats, loading, error } = useDashboard();

  if (loading) return <Loader />;
  if (error) return <ErrorBox message={error} />;
  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Overview Dashboard</h2>
        <p className="text-sm text-slate-400 mt-1">Real-time football analytics from {stats.total_players.toLocaleString()} FIFA players</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Players" value={stats.total_players.toLocaleString()} icon={Users} sub="In database" />
        <StatCard label="Avg Overall" value={stats.avg_overall} icon={Target} sub={`Range: ${stats.overall_range.min}–${stats.overall_range.max}`} />
        <StatCard label="Avg Potential" value={stats.avg_potential} icon={TrendingUp} sub={`Growth: +${(stats.avg_potential - stats.avg_overall).toFixed(1)}`} />
        <StatCard label="Best Model F1" value={(stats.best_model_f1 * 100).toFixed(1) + '%'} icon={Brain} sub={stats.best_model} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Activity size={14} className="text-[#00FF87]" /> Position Distribution
          </h3>
          <PositionPie distribution={stats.position_distribution} />
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Zap size={14} className="text-cyan-400" /> Top Nationalities
          </h3>
          <div className="space-y-2">
            {Object.entries(stats.top_nationalities).map(([nat, count]) => (
              <div key={nat} className="flex items-center justify-between">
                <span className="text-sm text-slate-300">{nat}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[#00FF87] rounded-full" style={{ width: `${(count / Object.values(stats.top_nationalities)[0]) * 100}%` }} />
                  </div>
                  <span className="text-xs text-slate-500 w-10 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-white mb-3">ML Models Available</h3>
          <div className="space-y-2">
            {stats.models_available.map(m => (
              <div key={m} className={`flex items-center justify-between px-3 py-2 rounded-md ${m === stats.best_model.toLowerCase().replace(/ /g, '_') ? 'bg-[#00FF87]/10 border border-[#00FF87]/30' : 'bg-slate-800/50'}`}>
                <span className="text-sm text-slate-300 capitalize">{m.replace(/_/g, ' ')}</span>
                {m === stats.best_model.toLowerCase().replace(/ /g, '_') && (
                  <span className="text-[10px] text-[#00FF87] font-medium">BEST</span>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Age Demographics</h3>
          <div className="text-center py-4">
            <p className="text-4xl font-bold text-white">{stats.avg_age}</p>
            <p className="text-xs text-slate-500 mt-1">Average Age</p>
            <p className="text-xs text-slate-400 mt-2">{stats.age_range.min} – {stats.age_range.max} years</p>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Top Clubs</h3>
          <div className="space-y-1.5">
            {Object.entries(stats.top_clubs).slice(0, 6).map(([club, count]) => (
              <div key={club} className="flex justify-between text-xs">
                <span className="text-slate-300 truncate max-w-[150px]">{club}</span>
                <span className="text-slate-500">{count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
