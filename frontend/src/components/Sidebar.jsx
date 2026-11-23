import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Brain, Crosshair, Box, BarChart3, GitCompare, FileText } from 'lucide-react';

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/players', icon: Users, label: 'Player Analysis' },
  { to: '/predict', icon: Brain, label: 'AI Predictor' },
  { to: '/opponent', icon: Crosshair, label: 'Opponent Analysis' },
  { to: '/tactical', icon: Box, label: '3D Tactical Planner' },
  { to: '/models', icon: BarChart3, label: 'Model Evaluation' },
  { to: '/compare', icon: GitCompare, label: 'Player Comparison' },
  { to: '/reports', icon: FileText, label: 'Reports' },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-[#0A0F1E] border-r border-slate-800 flex flex-col z-50">
      <div className="p-5 border-b border-slate-800">
        <h1 className="text-xl font-bold tracking-tight">
          <span className="text-[#00FF87]">TACTIX</span>
          <span className="text-white"> AI</span>
        </h1>
        <p className="text-[10px] text-slate-500 mt-0.5 tracking-widest uppercase">Strategic Football Planner</p>
      </div>
      <nav className="flex-1 py-3 overflow-y-auto">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-2.5 text-sm transition-all duration-200 ${
                isActive
                  ? 'text-[#00FF87] bg-[#00FF87]/8 border-r-2 border-[#00FF87] font-medium'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Icon size={16} strokeWidth={1.8} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800">
        <p className="text-[10px] text-slate-600 text-center">v1.0 — Capstone Project</p>
      </div>
    </aside>
  );
}
