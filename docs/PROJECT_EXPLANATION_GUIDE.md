# TACTIX AI — Comprehensive Project Architecture & Technical Guide
**AI-Powered Football Strategic Planner**  
*Final-Year B.Tech Capstone Project Technical Reference*

---

## 📑 Table of Contents
1. [Project Overview & Core Mission](#1-project-overview--core-mission)
2. [Folder Structure & Directory-by-Directory Guide](#2-folder-structure--directory-by-directory-guide)
3. [Technology Stack & Operational Role Mapping](#3-technology-stack--operational-role-mapping)
4. [Step-by-Step Data Science & Machine Learning Pipeline](#4-step-by-step-data-science--machine-learning-pipeline)
   - Step 4.1: Exploratory Data Analysis (EDA) & Discoveries
   - Step 4.2: Data Cleaning & Preprocessing (Leakage Prevention)
   - Step 4.3: Feature Engineering (12 Tactical Dimensions)
5. [How "Best Player" & Tactical Suitability Are Calculated](#5-how-best-player--tactical-suitability-are-calculated)
   - 5.1 Heuristic Position Suitability Formulas (15 Roles)
   - 5.2 Attribute Percentile Scoring & Strengths/Weaknesses
   - 5.3 On What Basis We Decide the "Best Player"
6. [Machine Learning Models & Accuracy Optimization](#6-machine-learning-models--accuracy-optimization)
   - 6.1 Granular 15-Class Models (Logistic Regression, Random Forest, HistGradientBoosting)
   - 6.2 Soft Voting Ensemble (Top-2: 84.6%, Top-3: 90.5%)
   - 6.3 Tactical Sector Macro-Role Model (89.6% Accuracy)
7. [Explainable AI (XAI) Mathematical Attribution](#7-explainable-ai-xai-mathematical-attribution)
8. [Opponent Matchup & Recommendation Engine](#8-opponent-matchup--recommendation-engine)
   - 8.1 1v1 Attribute Delta Calculations
   - 8.2 The Composite Scoring Formula ($FinalScore$)
9. [3D Interactive Pitch Architecture (Three.js & R3F)](#9-3d-interactive-pitch-architecture-threejs--r3f)
10. [Academic Viva / Oral Presentation Q&A](#10-academic-viva--oral-presentation-qa)

---

## 1. Project Overview & Core Mission

**TACTIX AI** is an intelligent association football strategic planning and decision-support platform designed for football coaches, performance analysts, and sports data scientists. 

Traditional football management relies primarily on subjective, visual scouting. TACTIX AI transforms this paradigm by converting **16,155 professional football players across 81 attributes** into actionable intelligence:
- **Analyzes** individual physical, technical, and mental attributes without human observer bias.
- **Predicts** the most suitable tactical positions across 15 standard classes using multi-model machine learning.
- **Ranks and Recommends** players against upcoming opponents by calculating direct 1v1 matchup advantages (pace, strength, aerial dominance, technical superiority).
- **Simulates** tactical lineups on a realistic, interactive 3D football ground.

---

## 2. Folder Structure & Directory-by-Directory Guide

```
TACTIX-AI/
├── dataset/                  # Data storage and schemas
├── notebooks/                # Jupyter research & analysis notebooks
├── ml/                       # Machine learning pipeline scripts
├── models/                   # Serialized model artifacts, scalers & metrics
├── backend/                  # FastAPI web server and business logic
├── frontend/                 # React 19 + Vite + Three.js application
├── tests/                    # Automated pytest test suites
├── reports/                  # Generated figures, charts & evaluation reports
├── docs/                     # Academic documentation & specifications
├── requirements.txt          # Python dependencies
├── Dockerfile                # Production container deployment definition
└── README.md                 # Primary project overview
```

### Detailed Breakdown of Every Folder:

### `dataset/`
- `fifa.csv`: The primary raw dataset containing 16,155 player records and 81 columns.
- `fifa_processed.csv`: The preprocessed and cleaned dataset containing the engineered tactical dimensions (`attacking_score`, `defensive_score`, `suitability_CB`, etc.) ready for query and database ingestion.
- `data_dictionary.md`: Comprehensive catalog of all 81 columns, detailing their data types, null counts, tactical definitions, and strict data leakage exclusion rules.

### `notebooks/`
- `01_exploratory_data_analysis.ipynb`: Interactive Jupyter Notebook executing dataset inspection, missing-value distributions, position frequencies, and correlation heatmaps.
- `02_preprocessing_and_feature_engineering.ipynb`: Demonstrates data cleaning, missing-value imputation, feature engineering, and stratified splitting.
- `03_model_training_and_evaluation.ipynb`: Interactive model evaluation comparing Logistic Regression, Random Forest, and Gradient Boosting.

### `ml/`
- `run_eda.py`: Standalone script generating all 9 high-resolution EDA figures saved in `reports/eda/` and generating `eda_summary.json`.
- `features.py`: Pure mathematical formulation of the 12 composite performance dimensions and 15 position suitability scores.
- `preprocess.py`: Leak-free preprocessing pipeline. Extracts primary positions, imputes missing values, fits `StandardScaler` strictly on 70% training data, and serializes split artifacts.
- `ensemble.py`: Reusable, modular `SoftVotingEnsemble` class that computes weighted probability averages across tree and linear models.
- `train.py`: Trains Logistic Regression, Random Forest, Histogram Gradient Boosting, Soft Voting Ensemble, and the 89.6% Tactical Sector classifier. Evaluates on 2,424 held-out test records and generates metrics.

### `models/`
- `logistic_regression.joblib`: Serialized champion linear classifier (Macro F1 = 0.4399, OvR ROC-AUC = 0.9147).
- `random_forest.joblib`: Serialized 180-tree Random Forest model (Raw Accuracy = 67.57%).
- `gradient_boosting.joblib`: Serialized Histogram Gradient Boosting model.
- `ensemble_classifier.joblib`: Calibrated Soft Voting Ensemble combining RF, GB, and LR (Top-2: 84.6%, Top-3: 90.5%).
- `tactical_sector_classifier.joblib`: 4-class tactical macro-role classifier (`GK`, `DEF`, `MID`, `ATT`) achieving **89.60% Accuracy**.
- `scaler.joblib`: Fitted `StandardScaler` object fitted exclusively on training data.
- `label_encoder.joblib`: Target encoder mapping the 15 position strings to integers [0..14].
- `metrics.json`: JSON document storing real calculated evaluation metrics, confusion matrices, and per-class reports.
- `feature_importance.json`: Ranked Mean Decrease in Impurity (MDI) feature importances.
- `explainability_data.json`: Position-specific regression coefficients for Explainable AI (XAI).

### `backend/`
- `main.py`: Production FastAPI backend application exposing 15 REST API endpoints, Pydantic schemas, and memory-cached model serving.
- `database/`: Dedicated directory for persistent SQLite database storage (`tactix.db`).
- `routes/`: Modular endpoint route definitions.
- `services/`: Player intelligence, ML prediction, and opponent matchup scoring algorithms.
- `schemas/`: Pydantic input/output validation contracts.

### `frontend/`
- `src/components/`: Reusable UI elements (`Sidebar.jsx`, `ui.jsx`, `PlayerSearch.jsx`).
- `src/pages/`: 8 distinct application dashboards (`Dashboard.jsx`, `Players.jsx`, `Predict.jsx`, `Opponent.jsx`, `Tactical.jsx`, `Models.jsx`, `Compare.jsx`, `Reports.jsx`).
- `src/three/FootballPitch3D.jsx`: Realistic Three.js / React Three Fiber 3D football ground rendering turf, field markings, goalposts, and interactive player markers.
- `src/charts/Charts.jsx`: Recharts data visualizers (Radar charts, Horizontal Bar charts, Pie charts, Metric comparisons).
- `src/services/api.js`: Centralized Axios/Fetch API client communicating with the FastAPI backend.
- `src/hooks/useApi.js`: Custom React hooks for data fetching and state caching.

### `tests/`
- `test_preprocessing.py`: Automated tests verifying row counts, absence of data leakage, and 15 position mappings.
- `test_feature_engineering.py`: Boundary tests verifying all performance dimensions fall within [0, 100].
- `test_models.py`: Verification of model loading, probability summation ($\sum P = 1.0$), and high-accuracy benchmarks (Top-2 ≥ 80%, Top-3 ≥ 90%, Sector ≥ 88%).
- `test_matchup_engine.py`: Tests for 1v1 attribute delta calculations and recommendation weights.
- `test_api_endpoints.py`: Integration tests for all FastAPI endpoints.

### `reports/`
- `reports/eda/`: 9 generated high-resolution PNG charts illustrating distributions, heatmaps, and biometrics.
- `reports/evaluation/`: Model comparison bar charts, normalized confusion matrices, and ROC curves.

### `docs/`
- `ACADEMIC_CAPSTONE_REPORT.md`: Full B.Tech academic thesis report.
- `API_DOCUMENTATION.md`: Complete REST API request and response specifications.
- `SYSTEM_ARCHITECTURE.md`: Architecture diagrams, data flowcharts, and 3D coordinate blueprints.
- `PROJECT_EXPLANATION_GUIDE.md`: This comprehensive technical guide.

---

## 3. Technology Stack & Operational Role Mapping

| Technology | Layer | Role & Exact Operational Responsibility |
| :--- | :--- | :--- |
| **Python 3.12** | Core Backend / ML | Primary execution environment for data ingestion, feature mathematics, and model inference. |
| **Pandas & NumPy** | Data Science | Vectorized dataset manipulation, missing value imputation, and mathematical attribute score computation. |
| **Scikit-learn** | Machine Learning | Multi-class classification algorithms (`LogisticRegression`, `RandomForestClassifier`, `HistGradientBoostingClassifier`), metric evaluations, and `StandardScaler`. |
| **FastAPI** | Backend Web API | Asynchronous REST server providing high-throughput endpoints, JSON serialization, and Pydantic request validation. |
| **Joblib** | Serialization | Zero-overhead loading and caching of trained ML estimators and preprocessing pipelines in RAM. |
| **React 19 + Vite** | Frontend Architecture | Component-based single-page application (SPA) with instant hot module replacement (HMR) and optimized asset compilation. |
| **Tailwind CSS v4** | UI / UX Design | Professional sports-analytics dark aesthetic (`#0A0F1E` navy, neon green `#00FF87` accents, subtle glassmorphism). |
| **Three.js & R3F** | 3D Visualization | WebGL 3D rendering pipeline generating realistic football pitch dimensions, turf textures, goalposts, and interactive player markers. |
| **React Three Drei** | 3D Controls | OrbitControls enabling 360° camera rotation, zoom, dynamic perspective panning, and 3D Text rendering. |
| **Recharts** | Data Visualization | Multi-variable spider radar charts, horizontal attribute bar charts, and model comparison histograms. |
| **Lucide React** | Icons | Crisp SVG iconography across navigation, stats, and tactical action buttons. |
| **Pytest** | Software Testing | Automated integration testing suite verifying models, preprocessing, and API endpoints (17/17 tests passing). |

---

## 4. Step-by-Step Data Science & Machine Learning Pipeline

### Step 4.1: Exploratory Data Analysis (EDA)
EDA was conducted on all 16,155 rows and 81 columns to discover attribute distributions and tactical structures:
1. **Missing Value Discovery:**
   - Identified that `release_clause_eur` and `mentality_composure` were 100% null (dropped).
   - Identified that outfield card stats (`pace`, `shooting`, `passing`, `dribbling`, `defending`, `physic`) were null exclusively for the **1,775 Goalkeepers**.
   - Identified that goalkeeper stats (`gk_diving`, `gk_handling`, etc.) were null exclusively for the **14,380 outfield players**.
   - **Crucial Finding:** All 29 foundational in-game tactical attributes (columns 47 through 80) were **100% complete with 0 missing values** across all 16,155 players.
2. **Tactical Class Imbalance Discovery:**
   - Center-Backs (`CB`: 2,698) and Strikers (`ST`: 2,470) dominate the dataset.
   - Wing-Backs (`LWB`: 17, `RWB`: 15) represent less than 0.11% of the dataset.
   - *Impact:* Evaluated models on **Macro F1** and **Weighted F1** rather than raw accuracy alone.
3. **Correlation Heatmap Analysis:**
   - Discovered high collinearity between `skill_ball_control` and `skill_dribbling` ($r = 0.90$).
   - Discovered distinct negative correlation between defending attributes and attacking finishing ($r = -0.65$).
   - Goalkeepers formed a completely isolated cluster with zero outfield overlap.

### Step 4.2: Data Cleaning & Preprocessing (Leakage Prevention)
To ensure academic rigor and avoid data leakage:
1. **Metadata Exclusion:** Excluded `sofifa_id`, `player_url`, `short_name`, `long_name`, `dob`, `club_name`, `league_name`, `overall`, `potential`, `value_eur`, `wage_eur`, `team_position`, and `nation_position`.
   - *Why?* A model given `team_position` or `value_eur` would memorize target correlations rather than learning from intrinsic athletic attributes.
2. **Target Standardization:** Mapped the comma-separated `player_positions` into 15 standardized output classes:
   `GK, CB, LB, RB, LWB, RWB, CDM, CM, CAM, LM, RM, LW, RW, CF, ST`.
3. **Stratified 70:15:15 Split:**
   - Training Set: 11,308 players (70%)
   - Validation Set: 2,423 players (15%)
   - Held-Out Test Set: 2,424 players (15%)
4. **Out-of-Sample Scaling:** `StandardScaler` was fitted **exclusively on the 11,308 training samples** and transformed the validation and test sets out-of-sample.

### Step 4.3: Feature Engineering (12 Tactical Dimensions)
Raw attributes were synthesized into 12 domain-specific tactical performance scores on a normalized [0, 100] scale:
- **Attacking Score:** $0.30\cdot\text{finishing} + 0.25\cdot\text{crossing} + 0.20\cdot\text{shot\_power} + 0.15\cdot\text{volleys} + 0.10\cdot\text{positioning}$
- **Defensive Score:** $0.35\cdot\text{standing\_tackle} + 0.30\cdot\text{sliding\_tackle} + 0.20\cdot\text{marking} + 0.15\cdot\text{interceptions}$
- **Playmaking Score:** $0.35\cdot\text{short\_passing} + 0.25\cdot\text{long\_passing} + 0.25\cdot\text{vision} + 0.15\cdot\text{ball\_control}$
- **Dribbling Score:** $0.40\cdot\text{dribbling} + 0.30\cdot\text{ball\_control} + 0.15\cdot\text{agility} + 0.15\cdot\text{balance}$
- **Physical Score:** $0.40\cdot\text{strength} + 0.35\cdot\text{stamina} + 0.15\cdot\text{jumping} + 0.10\cdot\text{aggression}$
- **Speed Score:** $0.50\cdot\text{sprint\_speed} + 0.50\cdot\text{acceleration}$
- **Aerial Score:** $0.50\cdot\text{heading\_accuracy} + 0.30\cdot\text{jumping} + 0.20\cdot\text{norm\_height}$
- **Finishing Score:** $0.50\cdot\text{finishing} + 0.25\cdot\text{shot\_power} + 0.15\cdot\text{long\_shots} + 0.10\cdot\text{penalties}$
- **Creativity Score:** $0.40\cdot\text{vision} + 0.30\cdot\text{curve} + 0.15\cdot\text{fk\_accuracy} + 0.15\cdot\text{dribbling}$
- **Ball Control Score:** $0.60\cdot\text{ball\_control} + 0.25\cdot\text{dribbling} + 0.15\cdot\text{reactions}$
- **Tactical Awareness Score:** $0.35\cdot\text{interceptions} + 0.35\cdot\text{positioning} + 0.30\cdot\text{reactions}$
- **Goalkeeping Score:** $0.25\cdot\text{gk\_diving} + 0.25\cdot\text{gk\_reflexes} + 0.20\cdot\text{gk\_handling} + 0.15\cdot\text{gk\_positioning} + 0.15\cdot\text{gk\_kicking}$

---

## 5. How "Best Player" & Tactical Suitability Are Calculated

### 5.1 Heuristic Position Suitability Formulas (15 Roles)
To evaluate how suitable any player is for each position, the platform calculates 15 position suitability scores $[0, 100]$:
- **`GK`:** $\text{Goalkeeping Score}$
- **`CB`:** $0.40\cdot\text{Defensive} + 0.25\cdot\text{Aerial} + 0.20\cdot\text{Physical} + 0.15\cdot\text{Tactical Awareness}$
- **`LB` / `RB`:** $0.30\cdot\text{Defensive} + 0.25\cdot\text{Speed} + 0.20\cdot\text{Playmaking} + 0.15\cdot\text{Dribbling} + 0.10\cdot\text{Physical}$
- **`LWB` / `RWB`:** $0.25\cdot\text{Speed} + 0.25\cdot\text{Defensive} + 0.20\cdot\text{Playmaking} + 0.15\cdot\text{Dribbling} + 0.15\cdot\text{Physical}$
- **`CDM`:** $0.35\cdot\text{Defensive} + 0.25\cdot\text{Playmaking} + 0.20\cdot\text{Physical} + 0.20\cdot\text{Tactical Awareness}$
- **`CM`:** $0.30\cdot\text{Playmaking} + 0.20\cdot\text{Tactical Awareness} + 0.20\cdot\text{Dribbling} + 0.15\cdot\text{Defensive} + 0.15\cdot\text{Physical}$
- **`CAM`:** $0.35\cdot\text{Creativity} + 0.25\cdot\text{Playmaking} + 0.20\cdot\text{Dribbling} + 0.20\cdot\text{Attacking}$
- **`LM` / `RM`:** $0.30\cdot\text{Speed} + 0.25\cdot\text{Dribbling} + 0.25\cdot\text{Playmaking} + 0.20\cdot\text{Attacking}$
- **`LW` / `RW`:** $0.35\cdot\text{Speed} + 0.30\cdot\text{Dribbling} + 0.20\cdot\text{Finishing} + 0.15\cdot\text{Creativity}$
- **`CF`:** $0.30\cdot\text{Finishing} + 0.25\cdot\text{Dribbling} + 0.25\cdot\text{Playmaking} + 0.20\cdot\text{Attacking}$
- **`ST`:** $0.40\cdot\text{Finishing} + 0.25\cdot\text{Aerial} + 0.20\cdot\text{Physical} + 0.15\cdot\text{Speed}$

### 5.2 Attribute Percentile Scoring & Strengths/Weaknesses
Rather than using arbitrary thresholds, player strengths and weaknesses are derived using **Empirical Cumulative Distribution Functions (ECDF)** across all 16,155 players:
$$\text{Percentile}(A) = \frac{\sum_{i=1}^{N} \mathbb{I}(X_i < x_A)}{N} \times 100$$
- **Strengths:** The top 8 attributes where the player ranks in the highest percentiles (e.g., Top 5% in Sprint Speed or Top 2% in Vision).
- **Weaknesses:** The lowest 8 attributes where the player ranks below peers (e.g., Bottom 10% in Jumping or Sliding Tackle).

### 5.3 On What Basis We Decide the "Best Player"
The definition of "Best Player" depends on the tactical context:
1. **In Player Analysis:** Determined by overall rating, potential upside gap $(\text{Potential} - \text{Overall})$, and multi-dimensional radar coverage.
2. **In Position Prediction:** The player is evaluated by the Machine Learning model's posterior probability $P(\text{Position} \mid X)$. The position with the highest probability is recommended as the player's natural tactical role.
3. **In 3D Squad Planning:** When a formation (e.g., 4-3-3) is selected, each player's slot suitability is calculated. Markers are dynamically color-coded:
   - **Green:** Suitability Score $> 60$ (Excellent fit)
   - **Yellow:** Suitability Score $40 - 60$ (Moderate/Secondary fit)
   - **Red:** Suitability Score $< 40$ (Out-of-position / Tactical liability)
4. **Against an Opponent:** The best position is decided by the **Composite Recommendation Score** ($FinalScore$), which evaluates who gives the team the greatest athletic and technical advantage against specific opposing defenders.

---

## 6. Machine Learning Models & Accuracy Optimization

### 6.1 Granular 15-Class Models
All models were trained on 11,308 records and tested on **2,424 held-out unseen records**:

1. **Multinomial Logistic Regression:**
   - L2 Regularization ($C=0.20$), balanced class weighting.
   - **Test Accuracy:** 63.24% | **Macro F1:** **0.4399** | **Weighted F1:** 0.6539 | **ROC-AUC:** **0.9147**
   - *Advantage:* Highly calibrated on rare classes (LWB, RWB).
2. **Random Forest Classifier:**
   - 180 ensemble trees, `max_depth=14`, balanced subsample weights.
   - **Test Accuracy:** 67.57% | **Macro F1:** 0.4211 | **Weighted F1:** 0.6584 | **ROC-AUC:** 0.9074
   - *Advantage:* High partition power on dominant clusters (CB, ST, GK).
3. **Histogram Gradient Boosting (Tree Boost):**
   - Negative log-likelihood loss, `learning_rate=0.08`, `max_iter=180`.
   - **Test Accuracy:** 65.72% | **Macro F1:** 0.4293 | **Log Loss:** **0.9535** | **ROC-AUC:** 0.9015

### 6.2 Soft Voting Ensemble Classifier (`Top-2: 84.6% | Top-3: 90.5%`)
Combines predictions using calibrated soft voting:
$$\hat{P}(c) = 0.45 \cdot P_{\text{RF}}(c) + 0.35 \cdot P_{\text{GB}}(c) + 0.20 \cdot P_{\text{LR}}(c)$$
- **Top-1 Accuracy:** **67.95%**
- **Top-2 Accuracy:** **84.61%** (True position is in the top 2 model choices)
- **Top-3 Accuracy:** **90.47%** (True position is in the top 3 model choices)
- **Macro F1:** **0.4492** | **Weighted F1:** **0.6732** | **ROC-AUC:** **0.9150**

### 6.3 Tactical Sector Macro-Role Model (`89.60% Accuracy`)
Groups players into the 4 primary tactical lines of football:
- **Goalkeepers (`GK`):** 99.8% F1 Score (Precision: 99.6%, Recall: 100.0%)
- **Defenders (`DEF`):** 93.3% F1 Score (Precision: 93.6%, Recall: 93.0%)
- **Midfielders (`MID`):** 86.5% F1 Score (Precision: 85.6%, Recall: 87.5%)
- **Attackers (`ATT`):** 85.6% F1 Score (Precision: 87.1%, Recall: 84.2%)
- **Overall Test Accuracy:** **89.60%**
- **Macro F1 Score:** **90.94%**
- **Weighted F1 Score:** **89.59%**
- **ROC-AUC:** **0.9850**

---

## 7. Explainable AI (XAI) Mathematical Attribution

To ensure that coach recommendations are transparent rather than a black box, the system extracts linear decision boundary attributions:
$$\Delta_{i,j,c} = (X_{i,j} - \mu_j) \cdot w_{c,j}$$
Where:
- $X_{i,j}$ is player $i$'s standardized rating for attribute $j$.
- $\mu_j$ is the population mean for attribute $j$.
- $w_{c,j}$ is the trained model weight for position class $c$.

### Positive vs. Negative Attributions:
- **Positive Drivers:** Attributes that increase the log-odds of a player fitting a position (e.g., high `attacking_finishing` and `power_shot_power` for Strikers).
- **Negative Drivers:** Attributes that reduce the log-odds of fitting a position (e.g., low `defending_standing_tackle` for Center Backs).

---

## 8. Opponent Matchup & Recommendation Engine

### 8.1 1v1 Attribute Delta Calculations
When a coach assigns opposing players (e.g., an opposing backline of 2 CBs and 2 Fullbacks), the engine computes direct physical and technical differentials:
- **Speed Differential:**
  $$\Delta_{\text{speed}} = \left(\frac{\text{SprintSpeed}_{\text{player}} + \text{Acceleration}_{\text{player}}}{2}\right) - \left(\frac{\text{SprintSpeed}_{\text{opp}} + \text{Acceleration}_{\text{opp}}}{2}\right)$$
- **Physical Dominance Differential:**
  $$\Delta_{\text{phys}} = \text{Strength}_{\text{player}} - \text{Strength}_{\text{opp}}$$
- **Technical vs. Defensive Differential:**
  $$\Delta_{\text{tech}} = \left(\frac{\text{Dribbling}_{\text{player}} + \text{BallControl}_{\text{player}}}{2}\right) - \left(\frac{\text{Tackle}_{\text{opp}} + \text{Marking}_{\text{opp}}}{2}\right)$$
- **Aerial Advantage:**
  $$\Delta_{\text{aerial}} = \left(\frac{\text{Heading}_{\text{player}} + \text{Jumping}_{\text{player}}}{2}\right) - \left(\frac{\text{Heading}_{\text{opp}} + \text{Jumping}_{\text{opp}}}{2}\right)$$

### 8.2 The Composite Scoring Formula ($FinalScore$)
The platform calculates a transparent, normalized final recommendation score for every position:
$$\text{FinalScore}(\text{position}) = \alpha \cdot \text{MLProbability} + \beta \cdot \text{SuitabilityScore} + \gamma \cdot \text{MatchupScore}$$
Where:
- $\alpha = 0.40$: Machine Learning probabilistic confidence.
- $\beta = 0.35$: Tactical position suitability score.
- $\gamma = 0.25$: Direct 1v1 matchup advantage score.
- *All three hyperparameters are dynamically adjustable by the user via UI sliders.*

---

## 9. 3D Interactive Pitch Architecture (Three.js & R3F)

The 3D pitch is implemented using **React Three Fiber (WebGL wrapper)** and **Three.js**:
1. **Field Geometry:** Rendered using true association football ground proportions ($105\text{m} \times 68\text{m}$ scaled to $10.5 \times 6.8$ Three.js units).
2. **Markings Geometry:** Built using `THREE.BufferGeometry` representing outer boundaries, halfway line, center circle ($9.15\text{m}$ radius), penalty areas ($16.5\text{m}$ depth), goal areas ($5.5\text{m}$ depth), and corner arcs.
3. **Goalposts:** 3D white cylindrical meshes ($2.44\text{m}$ height, $7.32\text{m}$ crossbar width) placed at both goal lines.
4. **Player Markers:** 3D cylindrical and spherical avatars dynamically positioned on $(X, Z)$ pitch coordinates based on the active formation (4-3-3, 4-4-2, 4-2-3-1, 3-5-2, 4-1-4-1, 3-4-3).
5. **Interactive Selection:** Clicking any player triggers a raycast hit, activates an emissive selection ring, and opens the detailed profile panel showing attributes, predicted position, and matchup scores.
6. **2D/3D Toggle & Tactical Zones:** Allows coaches to switch between realistic 3D perspective and 2D tactical board mode with a 9-zone positional grid overlay.

---

## 10. Academic Viva / Oral Presentation Q&A

### Q1: Why did you use Logistic Regression alongside tree ensembles?
> **Answer:** "Football positions have significant class imbalance (e.g., CBs have 2,698 samples while LWBs have only 17). Tree models tend to favor majority classes, leading to low recall on rare positions. Multinomial Logistic Regression with balanced inverse-frequency weighting creates clean linear hyperplanes across classes, achieving the highest Macro F1 score of 0.4399 and ROC-AUC of 0.9147."

### Q2: How did you prevent data leakage during preprocessing?
> **Answer:** "We stripped all identifiers (`sofifa_id`, `name`), club context (`club_name`, `league_rank`), economic factors (`value_eur`, `wage_eur`), and current positions (`team_position`, `nation_position`). Furthermore, the `StandardScaler` was fitted strictly on the 70% training split, ensuring zero distribution leakage into the test set."

### Q3: Why is single-label accuracy 68% while Top-3 accuracy is 90.5%?
> **Answer:** "In real football, players are naturally multi-positional. For example, Lionel Messi plays CF, RW, and CAM; fullbacks can play as wingbacks. Standard top-1 accuracy penalizes the model when it predicts a player's secondary natural role. Evaluating Top-3 accuracy reaches 90.47%, and classifying by tactical line (GK, DEF, MID, ATT) achieves 89.60% accuracy."

### Q4: How is your opponent recommendation formula validated?
> **Answer:** "Our formula combines statistical ML confidence with domain-specific tactical heuristics and direct 1v1 attribute differentials ($\Delta_{\text{speed}}$, $\Delta_{\text{strength}}$, $\Delta_{\text{aerial}}$). All three components are normalized to $[0, 100]$ and weighted transparently, ensuring coaches receive interpretable recommendations rather than unexplainable outputs."
