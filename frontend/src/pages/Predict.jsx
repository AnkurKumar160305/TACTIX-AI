import { useState } from 'react';
import { api } from '../services/api';
import { Card, Badge, Loader, ErrorBox } from '../components/ui';
import { HorizontalBar } from '../charts/Charts';
import PlayerSearch from '../components/PlayerSearch';
import { Brain, Sparkles, ArrowRight } from 'lucide-react';

export default function PredictPage() {
  const [player, setPlayer] = useState(null);
  const [model, setModel] = useState('ensemble');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const predict = async () => {
    if (!player) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.predictPosition(player.id, model);
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const models = [
    { value: 'ensemble', label: 'Soft Voting Ensemble (Top-3: 90.5%)' },
    { value: 'tactical_sector', label: 'Tactical Sector Model (89.6% Accuracy)' },
    { value: 'logistic_regression', label: 'Logistic Regression' },
    { value: 'random_forest', label: 'Random Forest' },
    { value: 'gradient_boosting', label: 'Gradient Boosting' },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Brain size={24} className="text-[#00FF87]" /> AI Position Predictor
        </h2>
        <p className="text-sm text-slate-400 mt-1">Select a player and ML model to predict their optimal tactical position</p>
      </div>

      <Card className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Select Player</label>
            <PlayerSearch onSelect={setPlayer} />
            {player && (
              <div className="mt-2 flex items-center gap-2 text-sm">
                <span className="text-white font-medium">{player.short_name}</span>
                <Badge>{player.primary_position}</Badge>
                <span className="text-slate-500">{player.overall} OVR</span>
              </div>
            )}
          </div>
          <div>
            <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">ML Model</label>
            <select
              value={model}
              onChange={e => setModel(e.target.value)}
              className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00FF87]/50"
            >
              {models.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
        </div>
        <button
          onClick={predict}
          disabled={!player || loading}
          className="mt-4 px-6 py-2.5 bg-[#00FF87] text-black font-semibold text-sm rounded-lg hover:bg-[#00FF87]/90 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-2"
        >
          <Sparkles size={14} /> Predict Position
        </button>
      </Card>

      {loading && <Loader />}
      {error && <ErrorBox message={error} />}

      {result && (
        <div className="space-y-5">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Prediction Result</h3>
              <Badge color="blue">{result.prediction.model_used.replace(/_/g, ' ')}</Badge>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-xs text-slate-500">Actual Position</p>
                <p className="text-2xl font-bold text-slate-400 mt-1">{result.player.primary_position}</p>
              </div>
              <ArrowRight size={20} className="text-[#00FF87]" />
              <div className="text-center">
                <p className="text-xs text-slate-500">Predicted Position</p>
                <p className="text-2xl font-bold text-[#00FF87] mt-1">{result.prediction.predicted_position}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs text-slate-500">Confidence</p>
                <p className="text-3xl font-bold text-white mt-1">{result.prediction.confidence}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Top 3 Predictions</h3>
            <div className="grid grid-cols-3 gap-3">
              {result.prediction.top_predictions.map((tp, i) => (
                <div key={tp.position} className={`p-4 rounded-lg border text-center ${i === 0 ? 'border-[#00FF87]/40 bg-[#00FF87]/5' : 'border-slate-700 bg-slate-800/30'}`}>
                  <p className="text-xs text-slate-500">#{i + 1}</p>
                  <p className={`text-xl font-bold mt-1 ${i === 0 ? 'text-[#00FF87]' : 'text-white'}`}>{tp.position}</p>
                  <p className="text-sm text-slate-400 mt-1">{tp.probability}%</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-white mb-3">All Position Probabilities</h3>
            <HorizontalBar
              data={Object.entries(result.prediction.all_probabilities)
                .sort(([,a],[,b]) => b - a)
                .map(([name, value]) => ({ name, value: Math.round(value) }))}
              color="#00FF87"
            />
          </Card>

          {result.prediction.explanation?.positive_factors && (
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4">
                <h4 className="text-sm font-semibold text-[#00FF87] mb-2">Positive Factors</h4>
                <div className="space-y-1.5">
                  {result.prediction.explanation.positive_factors.map(f => (
                    <div key={f.feature} className="flex justify-between text-xs">
                      <span className="text-slate-300">{f.feature.replace(/_/g, ' ')}</span>
                      <span className="text-[#00FF87] font-mono">+{f.weight.toFixed(3)}</span>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="p-4">
                <h4 className="text-sm font-semibold text-red-400 mb-2">Negative Factors</h4>
                <div className="space-y-1.5">
                  {result.prediction.explanation.negative_factors.map(f => (
                    <div key={f.feature} className="flex justify-between text-xs">
                      <span className="text-slate-300">{f.feature.replace(/_/g, ' ')}</span>
                      <span className="text-red-400 font-mono">{f.weight.toFixed(3)}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
