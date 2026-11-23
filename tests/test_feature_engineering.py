"""
TACTIX AI - Feature Engineering and Suitability Calculation Tests
"""
import pytest
import pandas as pd
import numpy as np

from ml.features import calculate_performance_scores, calculate_position_suitability, POSITION_LIST

def test_performance_scores_bounds():
    # Synthetic test DataFrame with minimum and maximum values
    min_data = {
        'height_cm': [160, 205],
        'attacking_finishing': [0, 100],
        'attacking_crossing': [0, 100],
        'power_shot_power': [0, 100],
        'attacking_volleys': [0, 100],
        'mentality_positioning': [0, 100],
        'defending_standing_tackle': [0, 100],
        'defending_sliding_tackle': [0, 100],
        'defending_marking': [0, 100],
        'mentality_interceptions': [0, 100],
        'attacking_short_passing': [0, 100],
        'skill_long_passing': [0, 100],
        'mentality_vision': [0, 100],
        'skill_ball_control': [0, 100],
        'skill_dribbling': [0, 100],
        'movement_agility': [0, 100],
        'movement_balance': [0, 100],
        'power_strength': [0, 100],
        'power_stamina': [0, 100],
        'power_jumping': [0, 100],
        'mentality_aggression': [0, 100],
        'movement_sprint_speed': [0, 100],
        'movement_acceleration': [0, 100],
        'attacking_heading_accuracy': [0, 100],
        'power_long_shots': [0, 100],
        'mentality_penalties': [0, 100],
        'skill_curve': [0, 100],
        'skill_fk_accuracy': [0, 100],
        'movement_reactions': [0, 100],
        'goalkeeping_diving': [0, 100],
        'goalkeeping_reflexes': [0, 100],
        'goalkeeping_handling': [0, 100],
        'goalkeeping_positioning': [0, 100],
        'goalkeeping_kicking': [0, 100],
    }
    df = pd.DataFrame(min_data)
    scores = calculate_performance_scores(df)

    # All performance scores should be 0 for minimum row and 100 for maximum row
    for col in scores.columns:
        assert scores[col].iloc[0] == pytest.approx(0.0, abs=1e-5), f"{col} min bound failed"
        assert scores[col].iloc[1] == pytest.approx(100.0, abs=1e-5), f"{col} max bound failed"

def test_position_suitability_all_positions():
    synthetic_scores = pd.DataFrame({
        'attacking_score': [80.0],
        'defensive_score': [20.0],
        'playmaking_score': [70.0],
        'dribbling_score': [85.0],
        'physical_score': [60.0],
        'speed_score': [90.0],
        'aerial_score': [40.0],
        'finishing_score': [75.0],
        'creativity_score': [85.0],
        'ball_control_score': [88.0],
        'tactical_awareness_score': [50.0],
        'goalkeeping_score': [10.0]
    })
    
    suitability = calculate_position_suitability(synthetic_scores)
    assert len(suitability.columns) == 15, "Suitability must cover all 15 positions"
    for pos in POSITION_LIST:
        assert pos in suitability.columns
        val = suitability[pos].iloc[0]
        assert 0 <= val <= 100, f"Suitability for {pos} out of range [0, 100]: {val}"
    
    # A fast, dribbling winger should score significantly higher in LW/RW than CB or GK
    assert suitability['LW'].iloc[0] > suitability['CB'].iloc[0]
    assert suitability['LW'].iloc[0] > suitability['GK'].iloc[0]
