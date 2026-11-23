"""
TACTIX AI - Soft Voting Ensemble Definition
Provides calibrated ensemble probability averaging across RF, GB, and LR.
"""
import numpy as np

class SoftVotingEnsemble:
    """Combines predictions of RF, GB, and LR with optimal calibration weights."""
    def __init__(self, rf, gb, lr, scaler, weights=(0.45, 0.35, 0.20)):
        self.rf = rf
        self.gb = gb
        self.lr = lr
        self.scaler = scaler
        self.weights = weights
        self.classes_ = rf.classes_

    def predict_proba(self, X):
        X_s = self.scaler.transform(X)
        p_rf = self.rf.predict_proba(X)
        p_gb = self.gb.predict_proba(X)
        p_lr = self.lr.predict_proba(X_s)
        return (p_rf * self.weights[0]) + (p_gb * self.weights[1]) + (p_lr * self.weights[2])

    def predict(self, X):
        probs = self.predict_proba(X)
        return np.argmax(probs, axis=1)
