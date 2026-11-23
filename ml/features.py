"""
TACTIX AI - Football Feature Engineering Module
Calculates tactical performance dimensions and 15 position suitability scores.
"""
import numpy as np
import pandas as pd

POSITION_LIST = ['GK', 'CB', 'LB', 'RB', 'LWB', 'RWB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'CF', 'ST']

def calculate_performance_scores(df: pd.DataFrame) -> pd.DataFrame:
    """
    Computes 12 standardized tactical performance dimensions (0-100 scale).
    """
    res = pd.DataFrame(index=df.index)
    
    # Normalized height score (160cm -> 0, 205cm -> 100)
    norm_height = np.clip((df['height_cm'] - 160) / (205 - 160) * 100, 0, 100)
    
    # 1. Attacking Score
    res['attacking_score'] = (
        0.30 * df['attacking_finishing'] +
        0.25 * df['attacking_crossing'] +
        0.20 * df['power_shot_power'] +
        0.15 * df['attacking_volleys'] +
        0.10 * df['mentality_positioning']
    )
    
    # 2. Defensive Score
    res['defensive_score'] = (
        0.35 * df['defending_standing_tackle'] +
        0.30 * df['defending_sliding_tackle'] +
        0.20 * df['defending_marking'] +
        0.15 * df['mentality_interceptions']
    )
    
    # 3. Playmaking Score
    res['playmaking_score'] = (
        0.35 * df['attacking_short_passing'] +
        0.25 * df['skill_long_passing'] +
        0.25 * df['mentality_vision'] +
        0.15 * df['skill_ball_control']
    )
    
    # 4. Dribbling Score
    res['dribbling_score'] = (
        0.40 * df['skill_dribbling'] +
        0.30 * df['skill_ball_control'] +
        0.15 * df['movement_agility'] +
        0.15 * df['movement_balance']
    )
    
    # 5. Physical Score
    res['physical_score'] = (
        0.40 * df['power_strength'] +
        0.35 * df['power_stamina'] +
        0.15 * df['power_jumping'] +
        0.10 * df['mentality_aggression']
    )
    
    # 6. Speed Score
    res['speed_score'] = (
        0.50 * df['movement_sprint_speed'] +
        0.50 * df['movement_acceleration']
    )
    
    # 7. Aerial Score
    res['aerial_score'] = (
        0.50 * df['attacking_heading_accuracy'] +
        0.30 * df['power_jumping'] +
        0.20 * norm_height
    )
    
    # 8. Finishing Score
    res['finishing_score'] = (
        0.50 * df['attacking_finishing'] +
        0.25 * df['power_shot_power'] +
        0.15 * df['power_long_shots'] +
        0.10 * df['mentality_penalties']
    )
    
    # 9. Creativity Score
    res['creativity_score'] = (
        0.40 * df['mentality_vision'] +
        0.30 * df['skill_curve'] +
        0.15 * df['skill_fk_accuracy'] +
        0.15 * df['skill_dribbling']
    )
    
    # 10. Ball Control Score
    res['ball_control_score'] = (
        0.60 * df['skill_ball_control'] +
        0.25 * df['skill_dribbling'] +
        0.15 * df['movement_reactions']
    )
    
    # 11. Tactical Awareness Score
    res['tactical_awareness_score'] = (
        0.35 * df['mentality_interceptions'] +
        0.35 * df['mentality_positioning'] +
        0.30 * df['movement_reactions']
    )
    
    # 12. Goalkeeping Score
    res['goalkeeping_score'] = (
        0.25 * df['goalkeeping_diving'] +
        0.25 * df['goalkeeping_reflexes'] +
        0.20 * df['goalkeeping_handling'] +
        0.15 * df['goalkeeping_positioning'] +
        0.15 * df['goalkeeping_kicking']
    )
    
    return res

def calculate_position_suitability(scores: pd.DataFrame) -> pd.DataFrame:
    """
    Computes heuristic suitability scores (0-100) for all 15 standardized positions.
    Note: Suitability scores represent domain-knowledge role fit, not ML ground truth.
    """
    suit = pd.DataFrame(index=scores.index)
    
    suit['GK'] = scores['goalkeeping_score']
    suit['CB'] = (
        0.40 * scores['defensive_score'] +
        0.25 * scores['aerial_score'] +
        0.20 * scores['physical_score'] +
        0.15 * scores['tactical_awareness_score']
    )
    suit['LB'] = (
        0.30 * scores['defensive_score'] +
        0.25 * scores['speed_score'] +
        0.20 * scores['playmaking_score'] +
        0.15 * scores['dribbling_score'] +
        0.10 * scores['physical_score']
    )
    suit['RB'] = suit['LB']
    suit['LWB'] = (
        0.25 * scores['speed_score'] +
        0.25 * scores['defensive_score'] +
        0.20 * scores['playmaking_score'] +
        0.15 * scores['dribbling_score'] +
        0.15 * scores['physical_score']
    )
    suit['RWB'] = suit['LWB']
    suit['CDM'] = (
        0.35 * scores['defensive_score'] +
        0.25 * scores['playmaking_score'] +
        0.20 * scores['physical_score'] +
        0.20 * scores['tactical_awareness_score']
    )
    suit['CM'] = (
        0.30 * scores['playmaking_score'] +
        0.20 * scores['tactical_awareness_score'] +
        0.20 * scores['dribbling_score'] +
        0.15 * scores['defensive_score'] +
        0.15 * scores['physical_score']
    )
    suit['CAM'] = (
        0.35 * scores['creativity_score'] +
        0.25 * scores['playmaking_score'] +
        0.20 * scores['dribbling_score'] +
        0.20 * scores['attacking_score']
    )
    suit['LM'] = (
        0.30 * scores['speed_score'] +
        0.25 * scores['dribbling_score'] +
        0.25 * scores['playmaking_score'] +
        0.20 * scores['attacking_score']
    )
    suit['RM'] = suit['LM']
    suit['LW'] = (
        0.35 * scores['speed_score'] +
        0.30 * scores['dribbling_score'] +
        0.20 * scores['finishing_score'] +
        0.15 * scores['creativity_score']
    )
    suit['RW'] = suit['LW']
    suit['CF'] = (
        0.30 * scores['finishing_score'] +
        0.25 * scores['dribbling_score'] +
        0.25 * scores['playmaking_score'] +
        0.20 * scores['attacking_score']
    )
    suit['ST'] = (
        0.40 * scores['finishing_score'] +
        0.25 * scores['aerial_score'] +
        0.20 * scores['physical_score'] +
        0.15 * scores['speed_score']
    )
    
    return suit
