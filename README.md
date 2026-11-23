# TACTIX AI — AI-Powered Football Strategic Planner
> **Tagline:** Analyze Players. Predict Positions. Outsmart Opponents.

[![Python](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r187-black.svg)](https://threejs.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-38B2AC.svg)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-17%20Passed-00FF87.svg)](https://docs.pytest.org/)

---

> 📖 **Comprehensive Project & Viva Guide:** A complete technical walkthrough explaining how best players are calculated, EDA steps, tech stack mapping, and folder architecture is available in [`docs/PROJECT_EXPLANATION_GUIDE.md`](docs/PROJECT_EXPLANATION_GUIDE.md).  
> 🎓 **Academic Capstone Report:** Formal B.Tech thesis format available in [`docs/ACADEMIC_CAPSTONE_REPORT.md`](docs/ACADEMIC_CAPSTONE_REPORT.md).

---

## 📌 Project Overview
**TACTIX AI** is an advanced football analytics and strategic planning system developed as a final-year B.Tech CSE (AI/ML) Capstone Project. The platform synthesizes machine learning classification, domain-specific feature engineering, opponent-aware tactical algorithms, and an interactive 3D football pitch simulation.

Built upon a real-world dataset of **16,155 professional football players across 81 attributes**, TACTIX AI predicts optimal playing positions across **15 standardized tactical roles**, isolates player strengths and weaknesses, exposes opponent backline vulnerabilities, and provides tactical recommendations on a realistic 3D pitch.

---

## 🏆 Key Features

1. **Exploratory Data Analysis (EDA):** Complete statistical profiling, missing-value treatment, attribute correlation heatmaps, and role clustering saved in `reports/eda/` and executed in Jupyter notebooks.
2. **Leak-Free Preprocessing Pipeline:** Strict 70:15:15 stratified split (11,308 Train / 2,423 Validation / 2,424 Test). All identity, club, and wage metadata are excluded from model inputs.
3. **Domain Feature Engineering:** 12 composite tactical performance dimensions (Attacking, Defensive, Playmaking, Dribbling, Physical, Speed, Aerial, Finishing, Creativity, Ball Control, Tactical Awareness, Goalkeeping) and 15 position suitability heuristics.
4. **Multi-Model Machine Learning:**
   - **Tactical Sector Macro-Role Classifier:** **89.60% Accuracy**, **90.94% Macro F1** across fundamental tactical lines (`GK`, `DEF`, `MID`, `ATT`).
   - **Soft Voting Ensemble:** Top-1 Accuracy: **67.95%**, Top-2 Accuracy: **84.61%**, Top-3 Accuracy: **90.47%**, ROC-AUC: **0.9150**.
   - **Logistic Regression (Champion Granular):** Macro F1 = **0.4399**, Weighted F1 = **0.6539**, ROC-AUC = **0.9147**.
   - **Random Forest Classifier (180 trees):** Top-1 Accuracy: **67.57%**, Top-3: **90.39%**.
   - **Histogram Gradient Boosting (Tree Boost):** Lowest log loss of **0.9535**.
5. **Explainable AI (XAI):** Linear attribute decision margins decompose positive and negative factors for any player recommendation.
6. **Opponent Strategic Recommendation Engine:**
   $$\text{FinalScore}(\text{pos}) = \alpha \cdot \text{MLProb} + \beta \cdot \text{Suitability} + \gamma \cdot \text{Matchup}$$
   Calculates 1v1 pace, strength, aerial, and technical differentials against user-configured opponent lineups.
7. **Interactive 3D Football Pitch:** Built with Three.js and React Three Fiber. Features realistic FIFA proportions (105m × 68m), goalposts, markings, camera rotation/zoom, formation switching (4-3-3, 4-4-2, 4-2-3-1, 3-5-2, 4-1-4-1, 3-4-3), 2D/3D toggle, tactical zones overlay, and suitability color-coding.
8. **Comprehensive 8-Page Dashboard:**
   - Overview Dashboard
   - Player Intelligence & Search
   - AI Position Predictor
   - Opponent Matchup Engine
   - 3D Tactical Pitch & Squad Planner
   - Model Evaluation & Benchmark Matrix
   - Head-to-Head Player Comparison (Radar charts)
   - Tactical Reports & CSV/PDF Export

---

## 📁 Repository Structure

```
TACTIX-AI/
├── dataset/
│   ├── fifa.csv                     # Original raw FIFA dataset (16,155 x 81)
│   ├── fifa_processed.csv           # Cleaned dataset with engineered features
│   └── data_dictionary.md           # Complete 81-column inventory & leakage rules
├── notebooks/
│   ├── 01_exploratory_data_analysis.ipynb
│   ├── 02_preprocessing_and_feature_engineering.ipynb
│   └── 03_model_training_and_evaluation.ipynb
├── ml/
│   ├── run_eda.py                   # Automated EDA chart & notebook generator
│   ├── features.py                  # 12 tactical performance & 15 suitability formulas
│   ├── preprocess.py                # Zero-leakage pipeline & stratified 70:15:15 split
│   ├── ensemble.py                  # Calibrated Soft Voting Ensemble definition
│   └── train.py                     # Training, tuning & evaluation for all ML models
├── models/
│   ├── tactical_sector_classifier.joblib # 89.60% Accuracy macro-role classifier
│   ├── ensemble_classifier.joblib   # Top-3: 90.47% Soft Voting Ensemble
│   ├── logistic_regression.joblib   # Trained champion linear classifier
│   ├── random_forest.joblib         # Trained Random Forest ensemble
│   ├── gradient_boosting.joblib     # Trained Gradient Boosting model
│   ├── scaler.joblib                # Fitted StandardScaler on training partition
│   ├── label_encoder.joblib         # 15 position class encoder
│   ├── metrics.json                 # Real calculated evaluation metrics
│   ├── feature_importance.json      # MDI feature importance rankings
│   └── explainability_data.json     # Position-specific coefficients
├── backend/
│   ├── main.py                      # FastAPI application with 15 REST endpoints
│   ├── database/                    # SQLite database storage
│   ├── routes/                      # Modular endpoint routes
│   ├── schemas/                     # Pydantic request/response schemas
│   └── services/                    # Player, ML, and matchup business logic
├── frontend/
│   ├── src/
│   │   ├── components/              # Sidebar, PlayerSearch, UI cards, Badges
│   │   ├── pages/                   # 8 full dashboard views
│   │   ├── three/                   # 3D Football Pitch (Three.js & R3F)
│   │   ├── charts/                  # Recharts Radars, BarCharts, PieCharts
│   │   ├── hooks/                   # Custom React API hooks
│   │   └── services/                # API client configuration
│   ├── index.html                   # HTML entry point
│   ├── vite.config.js               # Vite + Tailwind v4 build configuration
│   └── package.json                 # Frontend dependencies
├── tests/
│   ├── test_preprocessing.py        # Dataset integrity & zero-leakage tests
│   ├── test_feature_engineering.py  # Performance formula boundary tests
│   ├── test_models.py               # Model loading, probability & calibration tests
│   ├── test_matchup_engine.py       # Differential scoring & formula tests
│   └── test_api_endpoints.py        # FastAPI integration tests
├── reports/
│   ├── eda/                         # 9 high-resolution EDA figures & summary JSON
│   └── evaluation/                  # Confusion matrices, ROC curves, comparison charts
├── docs/
│   ├── PROJECT_EXPLANATION_GUIDE.md # Comprehensive guide explaining full project
│   ├── ACADEMIC_CAPSTONE_REPORT.md  # Formal B.Tech Capstone Thesis Document
│   ├── API_DOCUMENTATION.md         # Complete REST API reference
│   └── SYSTEM_ARCHITECTURE.md       # Architectural blueprints & Mermaid diagrams
├── requirements.txt                 # Backend Python dependencies
├── Dockerfile                       # Production container specification
├── .env.example                     # Environment variable template
└── README.md                        # Project documentation
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- Python 3.10+ (tested on Python 3.12)
- Node.js 18+ (tested on Node.js 22)
- npm or pnpm

### 2. Backend Setup
```bash
# Clone the repository
git clone https://github.com/your-username/TACTIX-AI.git
cd TACTIX-AI

# Install Python dependencies
pip install -r requirements.txt

# (Optional) Re-run data pipeline and model training
python ml/run_eda.py
python ml/preprocess.py
python ml/train.py

# Start FastAPI backend server
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
API docs available at: `http://localhost:8000/docs`

### 3. Frontend Setup
```bash
# In a separate terminal
cd frontend

# Install npm dependencies
npm install

# Start Vite development server
npm run dev
```
Open your browser at: `http://localhost:5173`

---

## 🧪 Automated Testing
Run the comprehensive pytest suite verifying data integrity, feature formulas, model inference, matchup differentials, and API endpoints:

```bash
python -m pytest tests/ -v
```
**Result:** `17 passed in 6.74s (100% pass rate)`

---

## 📊 Empirical Machine Learning Evaluation

Evaluated on held-out test partition (**2,424 unseen FIFA players**):

| Model Architecture | Task Scope | Top-1 Accuracy | Top-2 Accuracy | Top-3 Accuracy | Macro F1 | ROC-AUC |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Tactical Sector Model** | **4 Macro Roles (GK, DEF, MID, ATT)** | **89.60%** | **100.0%** | **100.0%** | **0.9094** | **0.9850** |
| **Ensemble (Soft Voting)** | **15 Granular Positions** | **67.95%** | **84.61%** | **90.47%** | **0.4492** | **0.9150** |
| **Random Forest** | 15 Granular Positions | 67.57% | 83.66% | 90.39% | 0.4211 | 0.9074 |
| **Histogram Gradient Boosting** | 15 Granular Positions | 65.72% | 83.37% | 89.60% | 0.4293 | 0.9015 |
| **Logistic Regression** | 15 Granular Positions | 63.24% | 80.65% | 87.83% | 0.4399 | 0.9147 |

---

## 📜 License
Released under the MIT License. Developed for academic and research evaluation.
