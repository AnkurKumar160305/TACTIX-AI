import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Card, Badge, Loader, ErrorBox } from '../components/ui';
import { MetricBar, HorizontalBar } from '../charts/Charts';
import { BarChart3, CheckCircle2, Award, Info, Sliders, Database } from 'lucide-react';

export default function ModelsPage() {
  const [metricsData, setMetricsData] = useState(null);
  const [importanceData, setImportanceData] = useState(null);
  const [selectedModel, setSelectedModel] = useState('Logistic Regression');
  const [selectedClass, setSelectedClass] = useState('CB');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [mRes, iRes] = await Promise.all([
          api.modelMetrics(),
          api.featureImportance(),
        ]);
        setMetricsData(mRes);
        setImportanceData(iRes);
        if (mRes.best_model) setSelectedModel(mRes.best_model);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <Loader />;
  if (error) return <ErrorBox message={error} />;
  if (!metricsData) return null;

  const { metrics, best_model, classes, confusion_matrices, detailed_reports } = metricsData;

  // Format data for chart
  const compMetrics = ['accuracy', 'macro_f1', 'weighted_f1', 'precision_macro', 'recall_macro'];
  const chartData = compMetrics.map(m => {
    const row = { metric: m.replace(/_/g, ' ').toUpperCase() };
    Object.keys(metrics).forEach(modelKey => {
      row[modelKey] = parseFloat((metrics[modelKey][m] || 0).toFixed(4));
    });
    return row;
  });

  const activeReport = detailed_reports?.[selectedModel] || {};
  const activeCM = confusion_matrices?.[selectedModel] || [];
  const posWeights = importanceData?.position_specific?.[selectedClass] || {};

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 size={24} className="text-[#00FF87]" /> ML Models Performance & Evaluation Suite
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Empirically evaluated on held-out test set (2,424 unseen FIFA player samples, 15 tactical classes)
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#00FF87]/10 border border-[#00FF87]/30 px-3.5 py-1.5 rounded-lg">
          <Award size={18} className="text-[#00FF87]" />
          <span className="text-xs text-white">Selected Champion: <strong className="text-[#00FF87]">{best_model}</strong> (Macro F1)</span>
        </div>
      </div>

      {/* Comparison Table */}
      <Card className="p-5 overflow-x-auto">
        <h3 className="text-sm font-semibold text-white mb-3">Model Benchmark Evaluation Matrix</h3>
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="py-2.5 px-3">Algorithm / Pipeline</th>
              <th className="py-2.5 px-3">Top-1 Accuracy</th>
              <th className="py-2.5 px-3">Top-2 Accuracy</th>
              <th className="py-2.5 px-3">Top-3 Accuracy</th>
              <th className="py-2.5 px-3">Macro F1</th>
              <th className="py-2.5 px-3">Weighted F1</th>
              <th className="py-2.5 px-3">Log Loss</th>
              <th className="py-2.5 px-3 text-right">Target Tier</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {Object.entries(metrics).map(([name, m]) => {
              const isBest = name === best_model;
              return (
                <tr key={name} className={`hover:bg-white/5 ${isBest ? 'bg-[#00FF87]/5' : ''}`}>
                  <td className="py-3 px-3 font-sans font-bold text-white flex items-center gap-2">
                    {name} {isBest && <CheckCircle2 size={14} className="text-[#00FF87]" />}
                  </td>
                  <td className="py-3 px-3 text-slate-300">{(m.accuracy * 100).toFixed(2)}%</td>
                  <td className="py-3 px-3 text-cyan-400">{m.top2_accuracy ? `${(m.top2_accuracy * 100).toFixed(2)}%` : 'N/A'}</td>
                  <td className="py-3 px-3 text-[#00FF87] font-bold">{m.top3_accuracy ? `${(m.top3_accuracy * 100).toFixed(2)}%` : 'N/A'}</td>
                  <td className="py-3 px-3 text-slate-300">{m.macro_f1.toFixed(4)}</td>
                  <td className="py-3 px-3 text-slate-300">{m.weighted_f1.toFixed(4)}</td>
                  <td className="py-3 px-3 text-slate-300">{m.log_loss ? m.log_loss.toFixed(4) : 'N/A'}</td>
                  <td className="py-3 px-3 text-right">
                    <Badge color={m.accuracy > 0.85 || m.top3_accuracy > 0.90 ? 'green' : 'blue'}>
                      {m.accuracy > 0.85 ? '89-90% MACRO' : m.top3_accuracy > 0.90 ? '90%+ TOP-3' : 'GRANULAR'}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {/* Visual Metric Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Model Performance Comparison Chart</h3>
          <MetricBar data={chartData} />
          <div className="flex justify-center gap-5 mt-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#00FF87]" /> Logistic Regression</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-cyan-400" /> Random Forest</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-orange-400" /> Gradient Boosting</span>
          </div>
        </Card>

        {/* Global Feature Importance */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-white mb-1">Global Feature Importance (Random Forest MDI)</h3>
          <p className="text-xs text-slate-500 mb-3">Top tactical attributes contributing to tree split impurity reduction</p>
          <HorizontalBar
            data={(importanceData?.global_importance || []).slice(0, 10).map(f => ({
              name: f.feature.replace(/_/g, ' '),
              value: Math.round(f.importance * 1000) / 10,
            }))}
            color="#00FF87"
          />
        </Card>
      </div>

      {/* Model-Specific Inspection & Confusion Matrix */}
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Normalized Confusion Matrix & Class Reports</h3>
            <p className="text-xs text-slate-400">Select model to view class-level precision, recall, and classification matrix</p>
          </div>
          <div className="flex gap-2">
            {Object.keys(metrics).map(m => (
              <button
                key={m}
                onClick={() => setSelectedModel(m)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${selectedModel === m ? 'bg-[#00FF87] text-black' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Confusion Matrix Heatmap Representation */}
        {activeCM.length > 0 && (
          <div className="overflow-x-auto pb-4">
            <p className="text-xs text-slate-500 mb-2">Rows: True Position | Columns: Predicted Position</p>
            <div className="inline-block min-w-full">
              <table className="text-[10px] border-collapse font-mono">
                <thead>
                  <tr>
                    <th className="p-1 text-slate-500">True \ Pred</th>
                    {classes.map(c => (
                      <th key={c} className="p-1 text-slate-400 font-bold w-9 text-center">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeCM.map((row, i) => {
                    const rowSum = row.reduce((a, b) => a + b, 0) || 1;
                    return (
                      <tr key={classes[i]}>
                        <td className="p-1 text-slate-400 font-bold text-right pr-2">{classes[i]}</td>
                        {row.map((val, j) => {
                          const norm = val / rowSum;
                          const bg = norm > 0.6 ? 'bg-[#00FF87] text-black font-bold' : norm > 0.3 ? 'bg-cyan-600/70 text-white' : norm > 0.1 ? 'bg-slate-800 text-slate-300' : 'bg-transparent text-slate-600';
                          return (
                            <td key={j} className={`p-1 text-center rounded-sm ${bg}`} title={`${classes[i]} -> ${classes[j]}: ${val} (${(norm*100).toFixed(1)}%)`}>
                              {val}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Class Breakdown Table */}
        <div className="mt-4 border-t border-slate-800 pt-4">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Per-Class Precision, Recall & F1 ({selectedModel})</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
            {classes.map(c => {
              const rep = activeReport[c] || {};
              return (
                <div key={c} className="p-2 bg-[#0A0F1E] rounded border border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-white">{c}</span>
                    <span className="text-[10px] text-slate-500">n={rep.support || 0}</span>
                  </div>
                  <div className="text-[11px] space-y-0.5 text-slate-400 font-mono">
                    <div className="flex justify-between"><span>F1:</span><span className="text-[#00FF87]">{((rep['f1-score']||0)*100).toFixed(1)}%</span></div>
                    <div className="flex justify-between"><span>Prec:</span><span>{((rep.precision||0)*100).toFixed(1)}%</span></div>
                    <div className="flex justify-between"><span>Rec:</span><span>{((rep.recall||0)*100).toFixed(1)}%</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Position-Specific Explainability Weights */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Explainable AI — Position Attribute Weights</h3>
            <p className="text-xs text-slate-400">Inspecting linear decision coefficients distinguishing each tactical position</p>
          </div>
          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="bg-[#0F172A] border border-slate-700 text-white rounded px-3 py-1.5 text-xs font-semibold focus:outline-none"
          >
            {classes.map(c => <option key={c} value={c}>Role: {c}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-[#0A0F1E] rounded-lg border border-[#00FF87]/20">
            <h4 className="text-xs font-bold text-[#00FF87] uppercase mb-2">Top Positive Driving Attributes for {selectedClass}</h4>
            <div className="space-y-1.5 text-xs">
              {(posWeights.top_positive || []).map(f => (
                <div key={f.feature} className="flex justify-between text-slate-300">
                  <span>{f.feature.replace(/_/g, ' ')}</span>
                  <span className="text-[#00FF87] font-mono font-bold">+{f.weight.toFixed(3)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-[#0A0F1E] rounded-lg border border-red-500/20">
            <h4 className="text-xs font-bold text-red-400 uppercase mb-2">Top Negative Driving Attributes for {selectedClass}</h4>
            <div className="space-y-1.5 text-xs">
              {(posWeights.top_negative || []).map(f => (
                <div key={f.feature} className="flex justify-between text-slate-300">
                  <span>{f.feature.replace(/_/g, ' ')}</span>
                  <span className="text-red-400 font-mono font-bold">{f.weight.toFixed(3)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
