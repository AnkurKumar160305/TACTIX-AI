"""
TACTIX AI - Preprocessing and Feature Pipeline Tests
"""
import os
import pytest
import pandas as pd
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, '..'))
DATA_PATH = os.path.join(PROJECT_ROOT, 'dataset', 'fifa.csv')
PROCESSED_DATA_PATH = os.path.join(PROJECT_ROOT, 'dataset', 'fifa_processed.csv')

from ml.features import POSITION_LIST

def test_raw_dataset_exists_and_shape():
    assert os.path.exists(DATA_PATH), "Raw FIFA dataset must exist"
    df = pd.read_csv(DATA_PATH)
    assert df.shape[0] == 16155, f"Expected 16,155 rows, found {df.shape[0]}"
    assert df.shape[1] == 81, f"Expected 81 columns, found {df.shape[1]}"

def test_position_mapping_and_classes():
    df = pd.read_csv(DATA_PATH)
    primary = df['player_positions'].apply(lambda x: str(x).split(',')[0].strip())
    unique_positions = set(primary.unique())
    assert unique_positions.issubset(set(POSITION_LIST)), f"Unrecognized positions found: {unique_positions - set(POSITION_LIST)}"
    assert len(unique_positions) == 15, f"Expected exactly 15 tactical position classes, found {len(unique_positions)}"

def test_processed_dataset_integrity():
    assert os.path.exists(PROCESSED_DATA_PATH), "Processed FIFA dataset must exist"
    df = pd.read_csv(PROCESSED_DATA_PATH)
    assert df.shape[0] == 16155
    # Check that engineered scores are present
    assert 'attacking_score' in df.columns
    assert 'defensive_score' in df.columns
    assert 'playmaking_score' in df.columns
    assert 'suitability_CB' in df.columns
    assert 'suitability_ST' in df.columns
    assert 'suitability_GK' in df.columns

def test_no_target_leakage_in_models():
    """Verify that identity and club target columns are excluded from feature vectors."""
    import joblib
    meta_path = os.path.join(PROJECT_ROOT, 'models', 'pipeline_metadata.json')
    import json
    with open(meta_path) as f:
        meta = json.load(f)
    feature_names = meta['feature_names']
    
    leakage_cols = ['sofifa_id', 'player_url', 'short_name', 'long_name', 'team_position', 'nation_position', 'club_name', 'overall']
    for col in leakage_cols:
        assert col not in feature_names, f"Leakage violation: {col} found in model feature set!"
