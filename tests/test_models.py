"""
TACTIX AI - Machine Learning Model Inference & Calibration Tests
"""
import os
import joblib
import json
import pytest
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, '..'))
MODELS_DIR = os.path.join(PROJECT_ROOT, 'models')

def test_model_artifacts_exist():
    required_files = [
        'logistic_regression.joblib',
        'random_forest.joblib',
        'gradient_boosting.joblib',
        'ensemble_classifier.joblib',
        'tactical_sector_classifier.joblib',
        'scaler.joblib',
        'label_encoder.joblib',
        'metrics.json',
        'feature_importance.json',
        'explainability_data.json'
    ]
    for fname in required_files:
        fpath = os.path.join(MODELS_DIR, fname)
        assert os.path.exists(fpath), f"Missing required artifact: {fname}"

def test_model_predictions_and_probabilities():
    lr = joblib.load(os.path.join(MODELS_DIR, 'logistic_regression.joblib'))
    rf = joblib.load(os.path.join(MODELS_DIR, 'random_forest.joblib'))
    gb = joblib.load(os.path.join(MODELS_DIR, 'gradient_boosting.joblib'))
    scaler = joblib.load(os.path.join(MODELS_DIR, 'scaler.joblib'))
    le = joblib.load(os.path.join(MODELS_DIR, 'label_encoder.joblib'))

    split_data = joblib.load(os.path.join(MODELS_DIR, 'split_data.joblib'))
    X_sample = split_data['X_test'][:5]
    X_sample_s = scaler.transform(X_sample)

    for name, model, inp in [
        ('Logistic Regression', lr, X_sample_s),
        ('Random Forest', rf, X_sample),
        ('Gradient Boosting', gb, X_sample)
    ]:
        preds = model.predict(inp)
        probs = model.predict_proba(inp)

        assert len(preds) == 5, f"{name} predicted length mismatch"
        assert probs.shape == (5, 15), f"{name} probability shape mismatch: expected (5, 15), got {probs.shape}"

        # Probabilities must sum to ~1.0 per sample
        for row in probs:
            assert np.sum(row) == pytest.approx(1.0, abs=1e-3), f"{name} probabilities do not sum to 1"

def test_evaluation_metrics_validity():
    with open(os.path.join(MODELS_DIR, 'metrics.json')) as f:
        metrics = json.load(f)

    assert 'best_model' in metrics
    assert 'metrics' in metrics
    assert len(metrics['metrics']) >= 4

    for model_name, m in metrics['metrics'].items():
        assert 0.5 <= m['accuracy'] <= 1.0, f"{model_name} accuracy abnormal: {m['accuracy']}"
        assert 0.3 <= m['macro_f1'] <= 1.0, f"{model_name} macro_f1 abnormal: {m['macro_f1']}"

    # Verify high-accuracy benchmarks
    ens = metrics['metrics'].get('Ensemble (Soft Voting)', {})
    assert ens.get('top2_accuracy', 0) >= 0.80, "Ensemble Top-2 accuracy should be >= 80%"
    assert ens.get('top3_accuracy', 0) >= 0.90, "Ensemble Top-3 accuracy should be >= 90%"

    sec = metrics['metrics'].get('Tactical Sector Model (Macro)', {})
    assert sec.get('accuracy', 0) >= 0.88, "Tactical Sector accuracy should be >= 88%"
