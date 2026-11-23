export function Card({ children, className = '', ...props }) {
  return (
    <div className={`bg-[#111827]/80 backdrop-blur border border-slate-800 rounded-lg ${className}`} {...props}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, sub, icon: Icon }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        {Icon && (
          <div className="p-2 rounded-md bg-[#00FF87]/10">
            <Icon size={18} className="text-[#00FF87]" />
          </div>
        )}
      </div>
    </Card>
  );
}

export function Badge({ children, color = 'green' }) {
  const colors = {
    green: 'bg-[#00FF87]/15 text-[#00FF87] border-[#00FF87]/30',
    blue: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    red: 'bg-red-500/15 text-red-400 border-red-500/30',
    yellow: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    purple: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    gray: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded border ${colors[color] || colors.green}`}>
      {children}
    </span>
  );
}

export function Loader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-[#00FF87]/30 border-t-[#00FF87] rounded-full animate-spin" />
    </div>
  );
}

export function ErrorBox({ message }) {
  return (
    <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
      {message}
    </div>
  );
}
