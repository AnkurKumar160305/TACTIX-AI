"""
TACTIX AI - Opponent Matchup and Final Score Formula Tests
"""
import pytest
import pandas as pd
from backend.main import calculate_matchup_score, POSITION_LIST

def test_matchup_score_speed_advantage():
    player_fast = pd.Series({
        'movement_sprint_speed': 92,
        'movement_acceleration': 90,
        'power_strength': 70,
        'skill_dribbling': 85,
        'skill_ball_control': 84,
        'defending_standing_tackle': 30,
        'defending_marking': 30,
        'attacking_heading_accuracy': 60,
        'power_jumping': 65,
    })

    opponent_slow = pd.Series({
        'movement_sprint_speed': 60,
        'movement_acceleration': 58,
        'power_strength': 75,
        'skill_dribbling': 50,
        'skill_ball_control': 50,
        'defending_standing_tackle': 70,
        'defending_marking': 68,
        'attacking_heading_accuracy': 70,
        'power_jumping': 70,
    })

    res = calculate_matchup_score(player_fast, opponent_slow, 'LW')
    assert res['matchup_advantages']['speed'] > 20, "Expected significant speed advantage"
    assert res['matchup_score'] > 50, "Expected overall favorable matchup score"
    assert any('pace advantage' in r for r in res['tactical_recommendations'])

def test_final_recommendation_formula_weights():
    alpha, beta, gamma = 0.40, 0.35, 0.25
    ml_prob = 80.0
    suitability = 70.0
    matchup = 60.0

    final_score = alpha * ml_prob + beta * suitability + gamma * matchup
    assert final_score == pytest.approx(0.40 * 80 + 0.35 * 70 + 0.25 * 60)
    assert 0 <= final_score <= 100
