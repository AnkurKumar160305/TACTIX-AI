"""
TACTIX AI - FastAPI Integration & Endpoint Verification Tests
"""
import pytest
import asyncio
import httpx
from backend.main import app, _do_load_resources

@pytest.fixture(scope="module", autouse=True)
def setup_app():
    _do_load_resources()

def run_async(coro):
    return asyncio.run(coro)

def test_health_endpoint():
    async def _test():
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url='http://test') as client:
            res = await client.get('/api/health')
            assert res.status_code == 200
            data = res.json()
            assert data['status'] == 'healthy'
            assert data['players_loaded'] == 16155
            assert len(data['models_loaded']) >= 3
    run_async(_test())

def test_dashboard_stats():
    async def _test():
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url='http://test') as client:
            res = await client.get('/api/dashboard-stats')
            assert res.status_code == 200
            data = res.json()
            assert data['total_players'] == 16155
            assert 'avg_overall' in data
            assert len(data['position_distribution']) == 15
    run_async(_test())

def test_players_query_and_search():
    async def _test():
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url='http://test') as client:
            res = await client.get('/api/players', params={'search': 'Messi', 'per_page': 5})
            assert res.status_code == 200
            data = res.json()
            assert len(data['players']) >= 1
            assert any('Messi' in p['short_name'] for p in data['players'])
    run_async(_test())

def test_predict_position_endpoint():
    async def _test():
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url='http://test') as client:
            payload = {'player_id': 0, 'model_name': 'logistic_regression'}
            res = await client.post('/api/predict-position', json=payload)
            assert res.status_code == 200
            data = res.json()
            assert 'prediction' in data
            assert data['prediction']['predicted_position'] in data['prediction']['all_probabilities']
            assert len(data['prediction']['top_predictions']) == 3
    run_async(_test())

def test_tactical_formation_endpoint():
    async def _test():
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url='http://test') as client:
            payload = {'player_ids': list(range(11)), 'formation': '4-3-3'}
            res = await client.post('/api/tactical-formation', json=payload)
            assert res.status_code == 200
            data = res.json()
            assert len(data['assignments']) == 11
            assert data['formation'] == '4-3-3'
    run_async(_test())

def test_invalid_player_id_handling():
    async def _test():
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url='http://test') as client:
            res = await client.get('/api/players/99999999')
            assert res.status_code == 404
    run_async(_test())
