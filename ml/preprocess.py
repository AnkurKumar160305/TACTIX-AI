"""
TACTIX AI - Data Preprocessing & Splitting Pipeline
Implements leak-free preprocessing, standardized position target mapping,
stratified 70:15:15 split, and persistence of preprocessor objects.
"""
import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from features import calculate_performance_scores, calculate_position_suitability, POSITION_LIST

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, '..'))
DATA_PATH = os.path.join(PROJECT_ROOT, 'dataset', 'fifa.csv')
MODELS_DIR = os.path.join(PROJECT_ROOT, 'models')
PROCESSED_DATA_DIR = os.path.join(PROJECT_ROOT, 'dataset')
os.makedirs(MODELS_DIR, exist_ok=True)

# 33 In-game base attributes
BASE_NUMERICAL_FEATURES = [
    'height_cm', 'weight_kg', 'weak_foot', 'skill_moves',
    # Attacking
    'attacking_crossing', 'attacking_finishing', 'attacking_heading_accuracy',
    'attacking_short_passing', 'attacking_volleys',
    # Skill
    'skill_dribbling', 'skill_curve', 'skill_fk_accuracy',
    'skill_long_passing', 'skill_ball_control',
    # Movement
    'movement_acceleration', 'movement_sprint_speed', 'movement_agility',
    'movement_reactions', 'movement_balance',
    # Power
    'power_shot_power', 'power_jumping', 'power_stamina',
    'power_strength', 'power_long_shots',
    # Mentality
    'mentality_aggression', 'mentality_interceptions', 'mentality_positioning',
    'mentality_vision', 'mentality_penalties',
    # Defending
    'defending_marking', 'defending_standing_tackle', 'defending_sliding_tackle',
    # Goalkeeping
    'goalkeeping_diving', 'goalkeeping_handling', 'goalkeeping_kicking',
    'goalkeeping_positioning', 'goalkeeping_reflexes'
]

def load_and_clean_data(file_path: str = DATA_PATH):
    """
    Loads raw CSV, removes duplicate records, extracts positions, and engineers features.
    """
    print(f"Loading raw dataset from {file_path}...")
    df = pd.read_csv(file_path)
    initial_count = len(df)
    
    # Check duplicates by sofifa_id
    df = df.drop_duplicates(subset=['sofifa_id'])
    print(f"Removed {initial_count - len(df)} duplicate records. Total records: {len(df)}")
    
    # Position mapping
    df['primary_position'] = df['player_positions'].apply(lambda x: str(x).split(',')[0].strip())
    df['secondary_positions'] = df['player_positions'].apply(
        lambda x: [p.strip() for p in str(x).split(',')[1:]] if len(str(x).split(',')) > 1 else []
    )
    
    # Filter to only the 15 standard positions
    df = df[df['primary_position'].isin(POSITION_LIST)].copy()
    print(f"Records matching standard 15 positions: {len(df)}")
    
    # Impute missing values if any in base numerical features
    for col in BASE_NUMERICAL_FEATURES:
        if col in df.columns and df[col].isnull().sum() > 0:
            median_val = df[col].median()
            df[col] = df[col].fillna(median_val)
            print(f"Imputed {col} with median {median_val}")
            
    # Engineer performance dimensions
    scores_df = calculate_performance_scores(df)
    suit_df = calculate_position_suitability(scores_df)
    
    # Combine engineered scores into full dataframe
    for col in scores_df.columns:
        df[col] = scores_df[col]
    for col in suit_df.columns:
        df[f'suitability_{col}'] = suit_df[col]
        
    return df

def prepare_pipeline(df: pd.DataFrame):
    """
    Constructs feature matrix X and target y, performs stratified 70:15:15 split,
    fits StandardScaler on train set only, and saves artifacts.
    """
    # 33 base features + 12 engineered dimensions = 45 features
    feature_cols = BASE_NUMERICAL_FEATURES + [
        'attacking_score', 'defensive_score', 'playmaking_score',
        'dribbling_score', 'physical_score', 'speed_score',
        'aerial_score', 'finishing_score', 'creativity_score',
        'ball_control_score', 'tactical_awareness_score', 'goalkeeping_score'
    ]
    
    X = df[feature_cols].copy()
    y_raw = df['primary_position'].copy()
    
    # Fit LabelEncoder
    le = LabelEncoder()
    # Ensure all 15 positions are indexed consistently
    le.fit(POSITION_LIST)
    y = le.transform(y_raw)
    
    # Stratified Split: 70% Train, 30% Temp (15% Val, 15% Test)
    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y, test_size=0.30, random_state=42, stratify=y
    )
    
    # Split Temp 50:50 into Val and Test
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.50, random_state=42, stratify=y_temp
    )
    
    print(f"Train size: {X_train.shape[0]} (70%)")
    print(f"Validation size: {X_val.shape[0]} (15%)")
    print(f"Test size: {X_test.shape[0]} (15%)")
    
    # Fit Scaler strictly on X_train (Zero Data Leakage)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_val_scaled = scaler.transform(X_val)
    X_test_scaled = scaler.transform(X_test)
    
    # Save artifacts
    joblib.dump(scaler, os.path.join(MODELS_DIR, 'scaler.joblib'))
    joblib.dump(le, os.path.join(MODELS_DIR, 'label_encoder.joblib'))
    
    split_data = {
        'X_train': X_train,
        'X_val': X_val,
        'X_test': X_test,
        'X_train_scaled': X_train_scaled,
        'X_val_scaled': X_val_scaled,
        'X_test_scaled': X_test_scaled,
        'y_train': y_train,
        'y_val': y_val,
        'y_test': y_test,
        'feature_names': feature_cols,
        'classes': le.classes_.tolist()
    }
    joblib.dump(split_data, os.path.join(MODELS_DIR, 'split_data.joblib'))
    
    # Save processed dataframe for backend and database ingestion
    processed_csv_path = os.path.join(PROCESSED_DATA_DIR, 'fifa_processed.csv')
    df.to_csv(processed_csv_path, index=False)
    print(f"Saved processed database with engineered features to {processed_csv_path}")
    
    metadata = {
        "train_samples": int(X_train.shape[0]),
        "val_samples": int(X_val.shape[0]),
        "test_samples": int(X_test.shape[0]),
        "features_count": len(feature_cols),
        "feature_names": feature_cols,
        "classes": le.classes_.tolist(),
        "leakage_prevention": "StandardScaler fitted strictly on training data; metadata identifiers and target attributes excluded."
    }
    with open(os.path.join(MODELS_DIR, 'pipeline_metadata.json'), 'w') as f:
        json.dump(metadata, f, indent=2)
        
    print("Preprocessing and feature pipeline completed successfully!")
    return split_data

if __name__ == '__main__':
    df = load_and_clean_data()
    prepare_pipeline(df)
