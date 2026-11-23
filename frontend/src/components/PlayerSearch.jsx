import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function PlayerSearch({ onSelect, placeholder = 'Search players...' }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const t = setTimeout(async () => {
      try {
        const data = await api.getPlayers({ search: query, per_page: 8 });
        setResults(data.players);
        setOpen(true);
      } catch { setResults([]); }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => results.length && setOpen(true)}
        placeholder={placeholder}
        className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#00FF87]/50 focus:outline-none focus:ring-1 focus:ring-[#00FF87]/30 transition"
      />
      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-[#111827] border border-slate-700 rounded-lg shadow-xl max-h-64 overflow-y-auto">
          {results.map(p => (
            <button
              key={p.id}
              onClick={() => { onSelect(p); setQuery(p.short_name); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 hover:bg-[#00FF87]/8 flex items-center justify-between transition text-sm"
            >
              <div>
                <span className="text-white font-medium">{p.short_name}</span>
                <span className="text-slate-500 ml-2 text-xs">{p.club_name || 'Free Agent'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#00FF87] text-xs font-mono">{p.primary_position}</span>
                <span className="text-slate-400 text-xs">{p.overall} OVR</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
