const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };
  const res = await fetch(url, config);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `API Error ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Dashboard
  health: () => request('/api/health'),
  dashboardStats: () => request('/api/dashboard-stats'),

  // Players
  getPlayers: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/api/players?${q}`);
  },
  getPlayer: (id) => request(`/api/players/${id}`),

  // Positions & Formations
  getPositions: () => request('/api/positions'),
  getFormations: () => request('/api/formations'),

  // ML Predictions
  predictPosition: (playerId, modelName = 'logistic_regression') =>
    request('/api/predict-position', {
      method: 'POST',
      body: JSON.stringify({ player_id: playerId, model_name: modelName }),
    }),

  // Analysis
  analyzePlayer: (playerId) =>
    request('/api/analyze-player', {
      method: 'POST',
      body: JSON.stringify({ player_id: playerId }),
    }),

  comparePlayers: (playerIds) =>
    request('/api/compare-players', {
      method: 'POST',
      body: JSON.stringify({ player_ids: playerIds }),
    }),

  // Opponent
  opponentAnalysis: (data) =>
    request('/api/opponent-analysis', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  recommendPosition: (data) =>
    request('/api/recommend-position', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Tactical
  tacticalFormation: (playerIds, formation) =>
    request('/api/tactical-formation', {
      method: 'POST',
      body: JSON.stringify({ player_ids: playerIds, formation }),
    }),

  // Model Evaluation
  modelMetrics: () => request('/api/model-metrics'),
  featureImportance: () => request('/api/model-feature-importance'),
};
