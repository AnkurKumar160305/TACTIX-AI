"""
TACTIX AI - FastAPI Backend Application
Complete backend with player analysis, ML prediction, opponent analysis, and tactical recommendations.
"""
import os
import json
import logging
import joblib
import numpy as np
import pandas as pd
from pathlib import Path

from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("tactix_api")

# Paths
BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
MODELS_DIR = PROJECT_ROOT / "models"
DATA_DIR = PROJECT_ROOT / "dataset"
DB_PATH = PROJECT_ROOT / "backend" / "database" / "tactix.db"


import sys
from ml.ensemble import SoftVotingEnsemble
# Alias both 'ensemble' and '__main__' so unpickler finds SoftVotingEnsemble regardless of invocation path
sys.modules['ensemble'] = sys.modules['ml.ensemble']
setattr(sys.modules.get('__main__', sys.modules[__name__]), 'SoftVotingEnsemble', SoftVotingEnsemble)

SECTOR_MAP = {
    'GK': 'Goalkeeper',
    'CB': 'Defender', 'LB': 'Defender', 'RB': 'Defender', 'LWB': 'Defender', 'RWB': 'Defender',
    'CDM': 'Midfielder', 'CM': 'Midfielder', 'CAM': 'Midfielder', 'LM': 'Midfielder', 'RM': 'Midfielder',
    'LW': 'Attacker', 'RW': 'Attacker', 'CF': 'Attacker', 'ST': 'Attacker'
}

def _do_load_resources():
    """Load dataset, models, and metadata."""
    logger.info("Loading TACTIX AI resources...")

    csv_path = DATA_DIR / "fifa_processed.csv"
    if csv_path.exists():
        state.df = pd.read_csv(str(csv_path))
        logger.info(f"Loaded {len(state.df)} players from processed dataset")
    else:
        raise RuntimeError(f"Processed dataset not found at {csv_path}. Run ml/preprocess.py first.")

    state.scaler = joblib.load(str(MODELS_DIR / "scaler.joblib"))
    state.label_encoder = joblib.load(str(MODELS_DIR / "label_encoder.joblib"))
    state.position_list = state.label_encoder.classes_.tolist()

    model_files = {
        "logistic_regression": "logistic_regression.joblib",
        "random_forest": "random_forest.joblib",
        "gradient_boosting": "gradient_boosting.joblib",
        "ensemble": "ensemble_classifier.joblib",
        "tactical_sector": "tactical_sector_classifier.joblib",
    }
    for name, filename in model_files.items():
        path = MODELS_DIR / filename
        if path.exists():
            state.models[name] = joblib.load(str(path))
            logger.info(f"Loaded model: {name}")

    metrics_path = MODELS_DIR / "metrics.json"
    if metrics_path.exists():
        with open(str(metrics_path)) as f:
            state.metrics = json.load(f)

    explain_path = MODELS_DIR / "explainability_data.json"
    if explain_path.exists():
        with open(str(explain_path)) as f:
            state.explainability = json.load(f)

    fi_path = MODELS_DIR / "feature_importance.json"
    if fi_path.exists():
        with open(str(fi_path)) as f:
            state.feature_importance = json.load(f)

    meta_path = MODELS_DIR / "pipeline_metadata.json"
    if meta_path.exists():
        with open(str(meta_path)) as f:
            meta = json.load(f)
            state.feature_names = meta.get("feature_names", ALL_FEATURES)

    logger.info("All resources loaded successfully!")


@asynccontextmanager
async def lifespan(application: FastAPI):
    _do_load_resources()
    yield


# ============================================================
# FastAPI Application
# ============================================================
app = FastAPI(
    title="TACTIX AI — Backend API",
    description="AI-Powered Football Strategic Planner API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# Global State (loaded at startup)
# ============================================================
class AppState:
    df: pd.DataFrame = None
    scaler = None
    label_encoder = None
    models: dict = {}
    metrics: dict = {}
    explainability: dict = {}
    feature_importance: list = []
    feature_names: list = []
    position_list: list = []

state = AppState()

POSITION_LIST = ['GK', 'CB', 'LB', 'RB', 'LWB', 'RWB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'CF', 'ST']

BASE_NUMERICAL_FEATURES = [
    'height_cm', 'weight_kg', 'weak_foot', 'skill_moves',
    'attacking_crossing', 'attacking_finishing', 'attacking_heading_accuracy',
    'attacking_short_passing', 'attacking_volleys',
    'skill_dribbling', 'skill_curve', 'skill_fk_accuracy',
    'skill_long_passing', 'skill_ball_control',
    'movement_acceleration', 'movement_sprint_speed', 'movement_agility',
    'movement_reactions', 'movement_balance',
    'power_shot_power', 'power_jumping', 'power_stamina',
    'power_strength', 'power_long_shots',
    'mentality_aggression', 'mentality_interceptions', 'mentality_positioning',
    'mentality_vision', 'mentality_penalties',
    'defending_marking', 'defending_standing_tackle', 'defending_sliding_tackle',
    'goalkeeping_diving', 'goalkeeping_handling', 'goalkeeping_kicking',
    'goalkeeping_positioning', 'goalkeeping_reflexes'
]

ENGINEERED_FEATURES = [
    'attacking_score', 'defensive_score', 'playmaking_score',
    'dribbling_score', 'physical_score', 'speed_score',
    'aerial_score', 'finishing_score', 'creativity_score',
    'ball_control_score', 'tactical_awareness_score', 'goalkeeping_score'
]

ALL_FEATURES = BASE_NUMERICAL_FEATURES + ENGINEERED_FEATURES


# ============================================================
# Pydantic Schemas
# ============================================================
class PlayerSummary(BaseModel):
    id: int
    sofifa_id: int
    short_name: str
    long_name: str
    age: int
    height_cm: int
    weight_kg: int
    nationality: str
    club_name: Optional[str] = None
    overall: int
    potential: int
    primary_position: str
    preferred_foot: str
    value_eur: int
    wage_eur: int

class PredictPositionRequest(BaseModel):
    player_id: int
    model_name: str = "logistic_regression"

class AnalyzePlayerRequest(BaseModel):
    player_id: int

class ComparePlayersRequest(BaseModel):
    player_ids: List[int] = Field(..., min_length=2, max_length=5)

class OpponentPlayer(BaseModel):
    player_id: int
    position: str

class OpponentAnalysisRequest(BaseModel):
    player_id: int
    opponent_lineup: List[OpponentPlayer]
    formation: str = "4-3-3"
    alpha: float = 0.4
    beta: float = 0.35
    gamma: float = 0.25

class TacticalFormationRequest(BaseModel):
    player_ids: List[int]
    formation: str = "4-3-3"

class RecommendPositionRequest(BaseModel):
    player_id: int
    opponent_lineup: Optional[List[OpponentPlayer]] = None
    model_name: str = "logistic_regression"
    alpha: float = 0.4
    beta: float = 0.35
    gamma: float = 0.25


# ============================================================
# Helper Functions
# ============================================================
def get_player_row(player_id: int) -> pd.Series:
    """Retrieve a single player row by integer index."""
    if state.df is None:
        raise HTTPException(status_code=503, detail="Dataset not loaded")
    if player_id < 0 or player_id >= len(state.df):
        raise HTTPException(status_code=404, detail=f"Player ID {player_id} not found")
    return state.df.iloc[player_id]

def player_to_summary(idx: int, row: pd.Series) -> dict:
    return {
        "id": int(idx),
        "sofifa_id": int(row.get("sofifa_id", 0)),
        "short_name": str(row.get("short_name", "")),
        "long_name": str(row.get("long_name", "")),
        "age": int(row.get("age", 0)),
        "height_cm": int(row.get("height_cm", 0)),
        "weight_kg": int(row.get("weight_kg", 0)),
        "nationality": str(row.get("nationality", "")),
        "club_name": str(row.get("club_name", "")) if pd.notna(row.get("club_name")) else None,
        "overall": int(row.get("overall", 0)),
        "potential": int(row.get("potential", 0)),
        "primary_position": str(row.get("primary_position", "")),
        "preferred_foot": str(row.get("preferred_foot", "")),
        "value_eur": int(row.get("value_eur", 0)),
        "wage_eur": int(row.get("wage_eur", 0)),
    }

def get_player_features(row: pd.Series) -> np.ndarray:
    """Extract feature vector for ML prediction."""
    features = []
    for col in state.feature_names:
        val = row.get(col, 0)
        features.append(float(val) if pd.notna(val) else 0.0)
    return np.array(features).reshape(1, -1)

def calculate_strengths_weaknesses(row: pd.Series) -> dict:
    """Identify player strengths and weaknesses based on percentile ranking."""
    attrs = {}
    for col in BASE_NUMERICAL_FEATURES:
        if col in state.df.columns:
            val = float(row.get(col, 0))
            col_data = state.df[col].dropna()
            percentile = float((col_data < val).sum() / len(col_data) * 100)
            attrs[col] = {"value": val, "percentile": percentile}

    sorted_attrs = sorted(attrs.items(), key=lambda x: x[1]["percentile"], reverse=True)
    strengths = [{"attribute": k, "value": v["value"], "percentile": round(v["percentile"], 1)}
                 for k, v in sorted_attrs[:8]]
    weaknesses = [{"attribute": k, "value": v["value"], "percentile": round(v["percentile"], 1)}
                  for k, v in sorted_attrs[-8:]]
    return {"strengths": strengths, "weaknesses": weaknesses, "all_percentiles": {k: round(v["percentile"], 1) for k, v in attrs.items()}}

def get_suitability_scores(row: pd.Series) -> dict:
    """Get position suitability scores for a player."""
    scores = {}
    for pos in POSITION_LIST:
        col = f"suitability_{pos}"
        if col in row.index:
            scores[pos] = round(float(row[col]), 2)
    return scores

def get_performance_scores(row: pd.Series) -> dict:
    """Get engineered performance dimension scores."""
    scores = {}
    for feat in ENGINEERED_FEATURES:
        if feat in row.index:
            scores[feat] = round(float(row[feat]), 2)
    return scores

def predict_position(row: pd.Series, model_name: str = "ensemble") -> dict:
    """Run ML position prediction for a player."""
    if model_name not in state.models:
        # Fallback to ensemble or logistic regression if requested model is not found
        model_name = "ensemble" if "ensemble" in state.models else list(state.models.keys())[0]

    features = get_player_features(row)
    model = state.models[model_name]

    # Special handling for tactical_sector model
    if model_name == "tactical_sector":
        probabilities = model.predict_proba(features)[0]
        sec_classes = model.classes_.tolist()
        pred_idx = np.argmax(probabilities)
        pred_sec = sec_classes[pred_idx]
        return {
            "predicted_position": pred_sec,
            "tactical_sector": pred_sec,
            "confidence": round(float(probabilities[pred_idx]) * 100, 2),
            "top_predictions": [{"position": sec_classes[i], "probability": round(float(probabilities[i]) * 100, 2)} for i in np.argsort(probabilities)[::-1]],
            "all_probabilities": {sec_classes[i]: round(float(probabilities[i]) * 100, 2) for i in range(len(probabilities))},
            "model_used": model_name,
            "explanation": {"positive_factors": [], "negative_factors": []}
        }

    # Apply scaling for logistic regression
    if model_name == "logistic_regression":
        features_input = state.scaler.transform(features)
    else:
        features_input = features

    probabilities = model.predict_proba(features_input)[0]
    predicted_class_idx = np.argmax(probabilities)
    predicted_position = state.position_list[predicted_class_idx]

    # Top 3 predictions
    top_indices = np.argsort(probabilities)[::-1][:3]
    top_predictions = []
    for idx in top_indices:
        top_predictions.append({
            "position": state.position_list[idx],
            "probability": round(float(probabilities[idx]) * 100, 2),
        })

    # Feature explanation from LR coefficients
    explanation = []
    if "position_specific_weights" in state.explainability:
        pos_weights = state.explainability["position_specific_weights"].get(predicted_position, {})
        explanation = {
            "positive_factors": pos_weights.get("top_positive", [])[:5],
            "negative_factors": pos_weights.get("top_negative", [])[:5],
        }

    return {
        "predicted_position": predicted_position,
        "tactical_sector": SECTOR_MAP.get(predicted_position, "Field Player"),
        "confidence": round(float(probabilities[predicted_class_idx]) * 100, 2),
        "top_predictions": top_predictions,
        "all_probabilities": {state.position_list[i]: round(float(probabilities[i]) * 100, 2) for i in range(len(probabilities))},
        "model_used": model_name,
        "explanation": explanation,
    }

def calculate_matchup_score(player_row: pd.Series, opponent_row: pd.Series, position: str) -> dict:
    """Calculate tactical matchup advantage between a player and an opponent."""
    matchups = {}

    # Speed advantage
    player_speed = (float(player_row.get("movement_sprint_speed", 50)) + float(player_row.get("movement_acceleration", 50))) / 2
    opp_speed = (float(opponent_row.get("movement_sprint_speed", 50)) + float(opponent_row.get("movement_acceleration", 50))) / 2
    matchups["speed"] = round(float(player_speed - opp_speed), 1)

    # Physical advantage
    player_phys = float(player_row.get("power_strength", 50))
    opp_phys = float(opponent_row.get("power_strength", 50))
    matchups["physical"] = round(float(player_phys - opp_phys), 1)

    # Technical advantage
    player_tech = (float(player_row.get("skill_dribbling", 50)) + float(player_row.get("skill_ball_control", 50))) / 2
    opp_tech = (float(opponent_row.get("defending_standing_tackle", 50)) + float(opponent_row.get("defending_marking", 50))) / 2
    matchups["technical_vs_defensive"] = round(float(player_tech - opp_tech), 1)

    # Aerial advantage
    player_aerial = float(player_row.get("attacking_heading_accuracy", 50)) + float(player_row.get("power_jumping", 50))
    opp_aerial = float(opponent_row.get("attacking_heading_accuracy", 50)) + float(opponent_row.get("power_jumping", 50))
    matchups["aerial"] = round(float((player_aerial - opp_aerial) / 2), 1)

    # Overall matchup score (normalized to 0-100 from differences)
    raw_score = sum(matchups.values()) / len(matchups)
    normalized_score = max(0, min(100, 50 + raw_score))

    recommendations = []
    if matchups["speed"] > 5:
        recommendations.append(f"Exploit pace advantage (+{matchups['speed']:.0f} speed) with direct runs behind the opponent's defensive line")
    if matchups["physical"] > 5:
        recommendations.append(f"Leverage physical dominance (+{matchups['physical']:.0f} strength) in aerial duels and set pieces")
    if matchups["technical_vs_defensive"] > 5:
        recommendations.append(f"Use superior technical ability (+{matchups['technical_vs_defensive']:.0f}) to dribble past weaker defender in 1v1 situations")
    if matchups["aerial"] > 5:
        recommendations.append(f"Target aerial superiority (+{matchups['aerial']:.0f}) from crosses and corner kicks")
    if matchups["speed"] < -5:
        recommendations.append(f"Caution: Opponent has pace advantage ({matchups['speed']:.0f}). Avoid exposing space behind your defensive line")
    if not recommendations:
        recommendations.append("Balanced matchup. Focus on team tactics and positional play.")

    return {
        "matchup_advantages": matchups,
        "matchup_score": round(float(normalized_score), 2),
        "tactical_recommendations": recommendations,
    }


# ============================================================
# API Routes
# ============================================================
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "players_loaded": len(state.df) if state.df is not None else 0,
        "models_loaded": list(state.models.keys()),
        "version": "1.0.0",
    }

@app.get("/api/players")
def get_players(
    search: str = Query(None, description="Search by name"),
    position: str = Query(None, description="Filter by position"),
    club: str = Query(None, description="Filter by club"),
    nationality: str = Query(None, description="Filter by nationality"),
    min_overall: int = Query(None, description="Minimum overall rating"),
    max_overall: int = Query(None, description="Maximum overall rating"),
    min_age: int = Query(None, description="Minimum age"),
    max_age: int = Query(None, description="Maximum age"),
    sort_by: str = Query("overall", description="Sort field"),
    sort_order: str = Query("desc", description="asc or desc"),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
):
    df = state.df.copy()

    if search:
        mask = df["short_name"].str.contains(search, case=False, na=False) | \
               df["long_name"].str.contains(search, case=False, na=False)
        df = df[mask]
    if position:
        df = df[df["primary_position"] == position]
    if club:
        df = df[df["club_name"].str.contains(club, case=False, na=False)]
    if nationality:
        df = df[df["nationality"].str.contains(nationality, case=False, na=False)]
    if min_overall is not None:
        df = df[df["overall"] >= min_overall]
    if max_overall is not None:
        df = df[df["overall"] <= max_overall]
    if min_age is not None:
        df = df[df["age"] >= min_age]
    if max_age is not None:
        df = df[df["age"] <= max_age]

    ascending = sort_order == "asc"
    if sort_by in df.columns:
        df = df.sort_values(sort_by, ascending=ascending)

    total = len(df)
    start = (page - 1) * per_page
    end = start + per_page
    page_df = df.iloc[start:end]

    players = []
    for idx, row in page_df.iterrows():
        # Use the original dataframe index as player_id
        original_idx = state.df.index.get_loc(idx) if idx in state.df.index else idx
        players.append(player_to_summary(int(original_idx), row))

    return {
        "players": players,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": max(1, (total + per_page - 1) // per_page),
    }

@app.get("/api/players/{player_id}")
def get_player_detail(player_id: int):
    row = get_player_row(player_id)
    summary = player_to_summary(player_id, row)
    sw = calculate_strengths_weaknesses(row)
    suitability = get_suitability_scores(row)
    perf_scores = get_performance_scores(row)

    # All raw attributes
    attributes = {}
    for col in BASE_NUMERICAL_FEATURES:
        if col in row.index:
            attributes[col] = float(row[col]) if pd.notna(row[col]) else 0.0

    return {
        **summary,
        "attributes": attributes,
        "performance_scores": perf_scores,
        "suitability_scores": suitability,
        "strengths": sw["strengths"],
        "weaknesses": sw["weaknesses"],
        "all_percentiles": sw["all_percentiles"],
        "secondary_positions": row.get("secondary_positions", []),
        "work_rate": str(row.get("work_rate", "")),
        "international_reputation": int(row.get("international_reputation", 1)),
        "skill_moves": int(row.get("skill_moves", 1)),
        "weak_foot": int(row.get("weak_foot", 1)),
    }

@app.get("/api/positions")
def get_positions():
    if state.df is not None:
        counts = state.df["primary_position"].value_counts().to_dict()
    else:
        counts = {}
    return {"positions": POSITION_LIST, "distribution": counts}

@app.post("/api/predict-position")
def api_predict_position(req: PredictPositionRequest):
    row = get_player_row(req.player_id)
    prediction = predict_position(row, req.model_name)
    return {
        "player": player_to_summary(req.player_id, row),
        "prediction": prediction,
    }

@app.post("/api/analyze-player")
def api_analyze_player(req: AnalyzePlayerRequest):
    row = get_player_row(req.player_id)
    summary = player_to_summary(req.player_id, row)
    sw = calculate_strengths_weaknesses(row)
    suitability = get_suitability_scores(row)
    perf_scores = get_performance_scores(row)

    # Predict with all 3 models
    predictions = {}
    for model_name in state.models:
        try:
            predictions[model_name] = predict_position(row, model_name)
        except Exception as e:
            predictions[model_name] = {"error": str(e)}

    attributes = {}
    for col in BASE_NUMERICAL_FEATURES:
        if col in row.index:
            attributes[col] = float(row[col]) if pd.notna(row[col]) else 0.0

    return {
        **summary,
        "attributes": attributes,
        "performance_scores": perf_scores,
        "suitability_scores": suitability,
        "strengths": sw["strengths"],
        "weaknesses": sw["weaknesses"],
        "all_percentiles": sw["all_percentiles"],
        "predictions": predictions,
    }

@app.post("/api/compare-players")
def api_compare_players(req: ComparePlayersRequest):
    results = []
    for pid in req.player_ids:
        row = get_player_row(pid)
        summary = player_to_summary(pid, row)
        sw = calculate_strengths_weaknesses(row)
        suitability = get_suitability_scores(row)
        perf_scores = get_performance_scores(row)

        attributes = {}
        for col in BASE_NUMERICAL_FEATURES:
            if col in row.index:
                attributes[col] = float(row[col]) if pd.notna(row[col]) else 0.0

        results.append({
            **summary,
            "attributes": attributes,
            "performance_scores": perf_scores,
            "suitability_scores": suitability,
            "strengths": sw["strengths"],
            "weaknesses": sw["weaknesses"],
        })
    return {"players": results}

@app.post("/api/opponent-analysis")
def api_opponent_analysis(req: OpponentAnalysisRequest):
    player_row = get_player_row(req.player_id)
    player_summary = player_to_summary(req.player_id, player_row)

    opponent_analysis = []
    for opp in req.opponent_lineup:
        opp_row = get_player_row(opp.player_id)
        opp_summary = player_to_summary(opp.player_id, opp_row)
        matchup = calculate_matchup_score(player_row, opp_row, opp.position)
        opponent_analysis.append({
            "opponent": opp_summary,
            "assigned_position": opp.position,
            **matchup,
        })

    # Aggregate opponent weaknesses
    agg_weaknesses = {}
    for opp in req.opponent_lineup:
        opp_row = get_player_row(opp.player_id)
        for attr in ["movement_sprint_speed", "movement_acceleration", "power_strength",
                      "defending_standing_tackle", "defending_sliding_tackle", "attacking_heading_accuracy"]:
            val = float(opp_row.get(attr, 50))
            if val < 55:
                if attr not in agg_weaknesses:
                    agg_weaknesses[attr] = []
                agg_weaknesses[attr].append({"player": str(opp_row.get("short_name", "Unknown")), "value": val})

    return {
        "player": player_summary,
        "opponent_matchups": opponent_analysis,
        "aggregate_weaknesses": agg_weaknesses,
        "formation": req.formation,
    }

@app.post("/api/recommend-position")
def api_recommend_position(req: RecommendPositionRequest):
    """
    Combined recommendation using:
    FinalScore(pos) = alpha * MLProbability + beta * SuitabilityScore + gamma * MatchupScore
    """
    player_row = get_player_row(req.player_id)
    player_summary = player_to_summary(req.player_id, player_row)

    # 1. ML Probability
    prediction = predict_position(player_row, req.model_name)
    ml_probs = prediction["all_probabilities"]

    # 2. Suitability Scores (normalize to 0-100)
    suitability = get_suitability_scores(player_row)

    # 3. Matchup Scores (if opponent lineup provided)
    matchup_scores = {pos: 50.0 for pos in POSITION_LIST}  # Neutral baseline
    if req.opponent_lineup:
        for pos in POSITION_LIST:
            relevant_opps = [o for o in req.opponent_lineup]
            if relevant_opps:
                scores = []
                for opp in relevant_opps[:3]:  # Top 3 relevant opponents
                    opp_row = get_player_row(opp.player_id)
                    ms = calculate_matchup_score(player_row, opp_row, pos)
                    scores.append(ms["matchup_score"])
                matchup_scores[pos] = sum(scores) / len(scores) if scores else 50.0

    # Normalize all to 0-100 scale for fair combination
    max_ml = max(ml_probs.values()) if ml_probs else 1
    max_suit = max(suitability.values()) if suitability else 1

    final_scores = {}
    for pos in POSITION_LIST:
        ml_norm = (ml_probs.get(pos, 0) / max_ml * 100) if max_ml > 0 else 0
        suit_norm = (suitability.get(pos, 0) / max_suit * 100) if max_suit > 0 else 0
        match_norm = matchup_scores.get(pos, 50)

        final = req.alpha * ml_norm + req.beta * suit_norm + req.gamma * match_norm
        final_scores[pos] = round(float(final), 2)

    # Rank positions
    ranked = sorted(final_scores.items(), key=lambda x: x[1], reverse=True)
    recommendations = []
    for pos, score in ranked[:5]:
        recommendations.append({
            "position": pos,
            "final_score": score,
            "ml_probability": ml_probs.get(pos, 0),
            "suitability_score": round(suitability.get(pos, 0), 2),
            "matchup_score": round(matchup_scores.get(pos, 50), 2),
            "explanation": f"Recommended as {pos} with {score:.1f}% composite score (ML: {ml_probs.get(pos, 0):.1f}%, Suitability: {suitability.get(pos, 0):.1f}, Matchup: {matchup_scores.get(pos, 50):.1f})"
        })

    return {
        "player": player_summary,
        "recommendations": recommendations,
        "weights": {"alpha": req.alpha, "beta": req.beta, "gamma": req.gamma},
        "model_used": req.model_name,
    }

# Formation coordinate maps (normalized 0-100 pitch coordinates)
FORMATION_COORDS = {
    "4-3-3": {
        "GK": [(50, 5)],
        "DEF": [(20, 25), (40, 20), (60, 20), (80, 25)],
        "MID": [(30, 45), (50, 40), (70, 45)],
        "FWD": [(25, 70), (50, 75), (75, 70)],
        "positions": ["GK", "LB", "CB", "CB", "RB", "CM", "CM", "CM", "LW", "ST", "RW"],
    },
    "4-4-2": {
        "GK": [(50, 5)],
        "DEF": [(20, 25), (40, 20), (60, 20), (80, 25)],
        "MID": [(20, 45), (40, 42), (60, 42), (80, 45)],
        "FWD": [(35, 72), (65, 72)],
        "positions": ["GK", "LB", "CB", "CB", "RB", "LM", "CM", "CM", "RM", "ST", "ST"],
    },
    "4-2-3-1": {
        "GK": [(50, 5)],
        "DEF": [(20, 25), (40, 20), (60, 20), (80, 25)],
        "MID": [(38, 38), (62, 38)],
        "ATT_MID": [(25, 55), (50, 58), (75, 55)],
        "FWD": [(50, 75)],
        "positions": ["GK", "LB", "CB", "CB", "RB", "CDM", "CDM", "LW", "CAM", "RW", "ST"],
    },
    "3-5-2": {
        "GK": [(50, 5)],
        "DEF": [(30, 20), (50, 18), (70, 20)],
        "MID": [(15, 42), (35, 40), (50, 45), (65, 40), (85, 42)],
        "FWD": [(38, 72), (62, 72)],
        "positions": ["GK", "CB", "CB", "CB", "LWB", "CM", "CDM", "CM", "RWB", "ST", "ST"],
    },
    "4-1-4-1": {
        "GK": [(50, 5)],
        "DEF": [(20, 25), (40, 20), (60, 20), (80, 25)],
        "CDM": [(50, 35)],
        "MID": [(20, 50), (40, 48), (60, 48), (80, 50)],
        "FWD": [(50, 75)],
        "positions": ["GK", "LB", "CB", "CB", "RB", "CDM", "LM", "CM", "CM", "RM", "ST"],
    },
    "3-4-3": {
        "GK": [(50, 5)],
        "DEF": [(30, 20), (50, 18), (70, 20)],
        "MID": [(20, 42), (40, 40), (60, 40), (80, 42)],
        "FWD": [(25, 72), (50, 75), (75, 72)],
        "positions": ["GK", "CB", "CB", "CB", "LM", "CM", "CM", "RM", "LW", "ST", "RW"],
    },
}

@app.post("/api/tactical-formation")
def api_tactical_formation(req: TacticalFormationRequest):
    formation = req.formation
    if formation not in FORMATION_COORDS:
        raise HTTPException(status_code=400, detail=f"Unknown formation: {formation}. Available: {list(FORMATION_COORDS.keys())}")

    formation_data = FORMATION_COORDS[formation]
    positions = formation_data["positions"]

    # Build all coordinates flat
    all_coords = []
    for key in ["GK", "DEF", "CDM", "MID", "ATT_MID", "FWD"]:
        if key in formation_data:
            all_coords.extend(formation_data[key])

    # Assign players to positions
    assignments = []
    for i, pid in enumerate(req.player_ids[:11]):
        row = get_player_row(pid)
        pos = positions[i] if i < len(positions) else "SUB"
        x, y = all_coords[i] if i < len(all_coords) else (50, 50)

        suitability = get_suitability_scores(row)
        suit_val = suitability.get(pos, 50)
        # Color coding: green (>60), yellow (40-60), red (<40)
        if suit_val > 60:
            color = "green"
        elif suit_val > 40:
            color = "yellow"
        else:
            color = "red"

        assignments.append({
            "player": player_to_summary(pid, row),
            "position": pos,
            "x": x,
            "y": y,
            "suitability": round(float(suit_val), 2),
            "color": color,
        })

    return {
        "formation": formation,
        "assignments": assignments,
        "available_formations": list(FORMATION_COORDS.keys()),
    }

@app.get("/api/model-metrics")
def api_model_metrics():
    return state.metrics

@app.get("/api/model-feature-importance")
def api_feature_importance():
    return {
        "global_importance": state.feature_importance,
        "position_specific": state.explainability.get("position_specific_weights", {}),
    }

@app.get("/api/dashboard-stats")
def api_dashboard_stats():
    """Overview dashboard statistics computed from actual data."""
    if state.df is None:
        raise HTTPException(status_code=503, detail="Dataset not loaded")

    df = state.df
    return {
        "total_players": int(len(df)),
        "avg_overall": round(float(df["overall"].mean()), 1),
        "avg_potential": round(float(df["potential"].mean()), 1),
        "avg_age": round(float(df["age"].mean()), 1),
        "position_distribution": df["primary_position"].value_counts().to_dict(),
        "top_nationalities": df["nationality"].value_counts().head(10).to_dict(),
        "top_clubs": df["club_name"].value_counts().head(10).to_dict(),
        "models_available": list(state.models.keys()),
        "best_model": state.metrics.get("best_model", "logistic_regression"),
        "best_model_f1": state.metrics.get("metrics", {}).get(
            state.metrics.get("best_model", ""), {}
        ).get("macro_f1", 0),
        "age_range": {"min": int(df["age"].min()), "max": int(df["age"].max())},
        "overall_range": {"min": int(df["overall"].min()), "max": int(df["overall"].max())},
    }

@app.get("/api/formations")
def get_formations():
    """Return available formations and their position layouts."""
    formations = {}
    for name, data in FORMATION_COORDS.items():
        formations[name] = {
            "positions": data["positions"],
            "coordinate_count": len(data["positions"]),
        }
    return {"formations": formations}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
