import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  PieChart, Pie
} from 'recharts';

const GREEN = '#00FF87';
const CYAN = '#00E5FF';
const PURPLE = '#A855F7';
const ORANGE = '#F97316';

export function PlayerRadar({ data, name = 'Player' }) {
  if (!data || !data.length) return null;
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data} outerRadius="75%">
        <PolarGrid stroke="#1E293B" />
        <PolarAngleAxis dataKey="attribute" tick={{ fill: '#94A3B8', fontSize: 10 }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#475569', fontSize: 9 }} />
        <Radar name={name} dataKey="value" stroke={GREEN} fill={GREEN} fillOpacity={0.2} strokeWidth={2} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

export function CompareRadar({ players }) {
  if (!players || players.length < 2) return null;
  const colors = [GREEN, CYAN, PURPLE, ORANGE];
  const attrs = ['attacking_score', 'defensive_score', 'playmaking_score', 'dribbling_score',
    'physical_score', 'speed_score', 'aerial_score', 'finishing_score', 'creativity_score'];
  const data = attrs.map(a => {
    const item = { attribute: a.replace('_score', '').replace(/_/g, ' ') };
    players.forEach((p, i) => { item[`p${i}`] = p.performance_scores?.[a] || 0; });
    return item;
  });

  return (
    <ResponsiveContainer width="100%" height={350}>
      <RadarChart data={data} outerRadius="70%">
        <PolarGrid stroke="#1E293B" />
        <PolarAngleAxis dataKey="attribute" tick={{ fill: '#94A3B8', fontSize: 10 }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
        {players.map((p, i) => (
          <Radar key={i} name={p.short_name} dataKey={`p${i}`} stroke={colors[i % colors.length]}
            fill={colors[i % colors.length]} fillOpacity={0.1} strokeWidth={2} />
        ))}
      </RadarChart>
    </ResponsiveContainer>
  );
}

export function HorizontalBar({ data, labelKey = 'name', valueKey = 'value', color = GREEN }) {
  if (!data || !data.length) return null;
  return (
    <ResponsiveContainer width="100%" height={Math.max(200, data.length * 30)}>
      <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
        <XAxis type="number" tick={{ fill: '#94A3B8', fontSize: 10 }} domain={[0, 100]} />
        <YAxis type="category" dataKey={labelKey} tick={{ fill: '#CBD5E1', fontSize: 11 }} width={120} />
        <Tooltip contentStyle={{ background: '#111827', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: '#F8FAFC' }} />
        <Bar dataKey={valueKey} fill={color} radius={[0, 4, 4, 0]} barSize={16} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function PositionPie({ distribution }) {
  if (!distribution) return null;
  const data = Object.entries(distribution).map(([name, value]) => ({ name, value }));
  const COLORS = ['#00FF87', '#00E5FF', '#A855F7', '#F97316', '#EF4444', '#3B82F6',
    '#14B8A6', '#F59E0B', '#EC4899', '#8B5CF6', '#06B6D4', '#10B981', '#6366F1', '#F43F5E', '#22D3EE'];
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={50}
          stroke="#0F172A" strokeWidth={2} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip contentStyle={{ background: '#111827', border: '1px solid #334155', borderRadius: 8 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function MetricBar({ data, colors }) {
  if (!data?.length) return null;
  const barColors = colors || [GREEN, CYAN, ORANGE];
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
        <XAxis dataKey="metric" tick={{ fill: '#94A3B8', fontSize: 10 }} />
        <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} domain={[0, 1]} />
        <Tooltip contentStyle={{ background: '#111827', border: '1px solid #334155', borderRadius: 8 }} />
        {Object.keys(data[0] || {}).filter(k => k !== 'metric').map((key, i) => (
          <Bar key={key} dataKey={key} fill={barColors[i % barColors.length]} radius={[4, 4, 0, 0]} barSize={20} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
