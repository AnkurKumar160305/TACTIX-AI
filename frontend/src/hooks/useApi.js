import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export function usePlayers(initialParams = {}) {
  const [players, setPlayers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetchPlayers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getPlayers({ ...params, page, per_page: 20 });
      setPlayers(data.players);
      setTotal(data.total);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [params, page]);

  useEffect(() => { fetchPlayers(); }, [fetchPlayers]);

  return { players, total, page, setPage, loading, error, setParams, params };
}

export function usePlayer(playerId) {
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (playerId == null) return;
    setLoading(true);
    api.getPlayer(playerId)
      .then(setPlayer)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [playerId]);

  return { player, loading, error };
}

export function useDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.dashboardStats()
      .then(setStats)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading, error };
}
