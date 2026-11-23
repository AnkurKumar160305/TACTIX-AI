import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import PlayersPage from './pages/Players';
import PredictPage from './pages/Predict';
import OpponentPage from './pages/Opponent';
import TacticalPage from './pages/Tactical';
import ModelsPage from './pages/Models';
import ComparePage from './pages/Compare';
import ReportsPage from './pages/Reports';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-[#0A0F1E] text-slate-100">
        <Sidebar />
        <main className="flex-1 ml-60 p-6 overflow-x-hidden min-w-0">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/players" element={<PlayersPage />} />
            <Route path="/predict" element={<PredictPage />} />
            <Route path="/opponent" element={<OpponentPage />} />
            <Route path="/tactical" element={<TacticalPage />} />
            <Route path="/models" element={<ModelsPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
