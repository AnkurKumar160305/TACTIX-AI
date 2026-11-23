# TACTIX AI: AI-Powered Football Strategic Planner
**Comprehensive Final-Year Academic Capstone Report**  
*Degree: Bachelor of Technology (B.Tech) in Computer Science & Engineering (Specialization: Artificial Intelligence & Machine Learning)*  
*System Tagline: Analyze Players. Predict Positions. Outsmart Opponents.*

---

## Abstract
Modern association football has undergone a paradigm shift driven by data analytics and spatial tactics. Traditional scouting relies heavily on qualitative visual assessments, which are prone to observer bias and unable to process large multi-dimensional attribute spectra. This project presents **TACTIX AI**, an end-to-end intelligent football analytics and strategic planning system. Leveraging a comprehensive dataset of 16,155 professional football players across 81 attributes, the system implements a leak-free machine learning pipeline that standardizes tactical roles into 15 discrete positions (`GK`, `CB`, `LB`, `RB`, `LWB`, `RWB`, `CDM`, `CM`, `CAM`, `LM`, `RM`, `LW`, `RW`, `CF`, `ST`). Three machine learning architectures—Multinomial Logistic Regression with balanced weighting, Random Forest with MDI feature attribution, and Histogram Gradient Boosting Trees—were systematically trained, tuned, and evaluated on a held-out test split. Empirical results demonstrate that Multinomial Logistic Regression achieves the highest Macro F1 score of **0.4399** and Weighted F1 of **0.6539** with an OvR ROC-AUC of **0.9147**, successfully handling extreme class imbalances (e.g., wing-backs vs. center-backs). Additionally, the system introduces a transparent opponent-aware strategic recommendation engine combining ML predictions, heuristic suitability priors, and direct 1v1 attribute differential scoring. The platform renders interactive 3D tactical formations on a realistically proportioned pitch built with Three.js and React Three Fiber, backed by a production-ready FastAPI service and modern dark-mode React interface.

---

## 1. Introduction & Problem Statement
### 1.1 Context
Tactical preparation in football requires head coaches and performance analysts to evaluate three interdependent dimensions:
1. Individual technical, physical, and psychological capabilities of squad members.
2. The optimal tactical position that maximizes an athlete's strengths while masking vulnerabilities.
3. Structural weaknesses in upcoming opponents' tactical formations.

### 1.2 Problem Statement
While elite European clubs employ dedicated data science departments, open, reproducible, and explainable tactical decision-support tools remain sparse in literature. Existing commercial scouting platforms (e.g., Wyscout, StatsBomb) operate as closed proprietary platforms with high licensing barriers. Furthermore, standard machine learning classification models often suffer from data leakage (incorporating club prestige or wage proxies as predictive features) and lack explainability, leaving tactical recommendations opaque to coaches.

### 1.3 Project Objectives
- **Data Engineering:** Ingest and clean 16,155 player records, establishing a zero-leakage feature pipeline across 29 foundational in-game attributes.
- **Domain Feature Engineering:** Formulate 12 composite tactical performance dimensions and 15 position suitability heuristics.
- **Model Training & Rigorous Evaluation:** Train, tune, and benchmark three multiclass ML classifiers using strict stratified 70:15:15 splits, comparing accuracy, precision, recall, macro F1, weighted F1, log loss, and ROC-AUC.
- **Explainable AI:** Formulate linear attribute margin attributions to explain positive and negative factors influencing each position recommendation.
- **Opponent Matchup Algorithm:** Develop a configurable composite recommendation formula ($FinalScore = \alpha \cdot ML + \beta \cdot Suitability + \gamma \cdot Matchup$).
- **Realistic 3D Visualization:** Build an interactive 3D football pitch (105m × 68m proportions) supporting dynamic formation switching and player inspection.

---

## 2. Dataset Architecture & Exploratory Data Analysis (EDA)
### 2.1 Dataset Inventory
- **Primary Source:** FIFA Player Database (`fifa.csv`).
- **Dimensions:** 16,155 player instances, 81 feature dimensions.
- **Null Value Inspection:**
  - `release_clause_eur` and `mentality_composure`: 100% missing (dropped).
  - Outfield summary cards (`pace`, `shooting`, `passing`, `dribbling`, `defending`, `physic`): Absent exclusively for the 1,775 Goalkeepers (10.98%).
  - Goalkeeper face attributes: Absent for the 14,380 outfield players (89.02%).
  - In-game technical/movement/defending attributes (cols 47–80): **0 missing values across all 16,155 records**.

### 2.2 Target Standardization & Tactical Class Imbalance
The multi-position strings were extracted and standardized into 15 tactical roles. Class distribution exhibits heavy real-world tactical skewness:
- `CB`: 2,698 (16.70%)
- `ST`: 2,470 (15.29%)
- `CM`: 1,955 (12.10%)
- `GK`: 1,775 (10.98%)
- `LWB`: 17 (0.11%)
- `RWB`: 15 (0.09%)

*Methodological Impact:* Severe class imbalance precludes standard raw accuracy as the sole selection metric. Models must be tuned for **Macro F1** and trained using inverse frequency class weighting.

---

## 3. Methodology & System Architecture

### 3.1 Zero-Data-Leakage Preprocessing Pipeline
To prevent information leakage:
1. All identifiers (`sofifa_id`, `player_url`, `short_name`, `dob`) and club contexts (`club_name`, `team_position`, `nation_position`, `overall`, `value_eur`) are strictly excluded from the feature matrix $X$.
2. Feature vectors comprise 33 base physical/in-game ratings + 12 engineered performance dimensions = **45 total numerical features**.
3. Splitting follows a stratified 70% Train (11,308 samples), 15% Validation (2,423 samples), and 15% Test (2,424 samples) partition.
4. `StandardScaler` is fitted **strictly on the 70% training partition** and applied out-of-sample to validation and test partitions.

### 3.2 Feature Engineering Formulations
#### 12 Tactical Performance Dimensions:
$$\text{Attacking} = 0.30\cdot\text{finishing} + 0.25\cdot\text{crossing} + 0.20\cdot\text{shot\_power} + 0.15\cdot\text{volleys} + 0.10\cdot\text{positioning}$$
$$\text{Defensive} = 0.35\cdot\text{standing\_tackle} + 0.30\cdot\text{sliding\_tackle} + 0.20\cdot\text{marking} + 0.15\cdot\text{interceptions}$$
$$\text{Playmaking} = 0.35\cdot\text{short\_passing} + 0.25\cdot\text{long\_passing} + 0.25\cdot\text{vision} + 0.15\cdot\text{ball\_control}$$
$$\text{Speed} = 0.50\cdot\text{sprint\_speed} + 0.50\cdot\text{acceleration}$$
$$\text{Aerial} = 0.50\cdot\text{heading\_accuracy} + 0.30\cdot\text{jumping} + 0.20\cdot\text{norm\_height}$$

---

## 4. Machine Learning Models & Empirical Evaluation

### 4.1 Algorithms Evaluated
1. **Multinomial Logistic Regression:** L2 regularization with $C=0.20$, balanced class weighting, L-BFGS solver.
2. **Random Forest Classifier:** 180 ensemble estimators, `max_depth=12`, `min_samples_split=4`, balanced subsample weighting.
3. **Histogram Gradient Boosting (Tree Boost):** Histogram-binned gradient descent trees with sample re-weighting, `learning_rate=0.10`, `max_iter=160`.

### 4.2 Held-Out Test Evaluation Results (2,424 Unseen Players)

| Metric | Logistic Regression | Random Forest | Gradient Boosting |
| :--- | :--- | :--- | :--- |
| **Accuracy** | 63.24% | **66.05%** | 64.15% |
| **Macro F1 (Primary Metric)** | **0.4399** | 0.4180 | 0.4108 |
| **Weighted F1** | **0.6539** | 0.6459 | 0.6419 |
| **Macro Recall** | **0.4529** | 0.4251 | 0.4124 |
| **Macro Precision** | 0.4537 | **0.4785** | 0.4101 |
| **Log Loss** | 0.9833 | 0.9893 | **0.9535** |
| **ROC-AUC (One-vs-Rest)** | **0.9147** | 0.9046 | 0.9062 |

### 4.3 Model Selection Discussion
While **Random Forest** achieved the highest raw accuracy (66.05%), **Logistic Regression** demonstrated superior generalization across rare tactical classes (LWB, RWB, CF), achieving the champion **Macro F1 of 0.4399** and **ROC-AUC of 0.9147**. Its linear hyperplanes provided well-calibrated class boundaries without overfitting majority classes (CB, ST).

---

## 5. Opponent-Aware Strategic Recommendation Engine
The platform calculates direct 1v1 attribute differentials between the selected player and opposing defenders:
- **Speed Differential:** $\Delta_{\text{speed}} = \text{Speed}_{\text{player}} - \text{Speed}_{\text{opponent}}$
- **Physical Differential:** $\Delta_{\text{phys}} = \text{Strength}_{\text{player}} - \text{Strength}_{\text{opponent}}$
- **Technical Advantage:** $\Delta_{\text{tech}} = \text{Dribbling}_{\text{player}} - \text{Tackle}_{\text{opponent}}$

Composite tactical recommendation score:
$$\text{FinalScore}(\text{pos}) = \alpha \cdot \text{MLProb}(\text{pos}) + \beta \cdot \text{Suitability}(\text{pos}) + \gamma \cdot \text{MatchupScore}$$
Where default weights are $\alpha=0.40, \beta=0.35, \gamma=0.25$ (fully user-configurable in the UI).

---

## 6. Full-Stack System Architecture
- **Backend:** FastAPI (Python 3.12) delivering 15 REST endpoints, asynchronous request pipelines, Pydantic data schemas, and Joblib model caching.
- **Frontend:** React 19 + Vite with Tailwind CSS v4, Three.js, React Three Fiber, Lucide icons, and Recharts.
- **3D Pitch:** Complete FIFA-standard field marking geometry, orbital controls, dynamic tactical zone toggles, and color-coded player markers.

---

## 7. Limitations & Future Scope
- **Dataset Boundaries:** FIFA attribute ratings are static approximations and do not encompass temporal tracking coordinates or spatio-temporal pass vectors.
- **Future Scope:** Ingest optical tracking data (e.g., Metrica Sports) and implement Graph Neural Networks (GNNs) for dynamic passing lane simulation.

---

## 8. Conclusion
TACTIX AI demonstrates the practical application of machine learning, domain-guided feature engineering, and 3D computer graphics to association football strategic planning. The system fulfills all functional, mathematical, and aesthetic specifications required of a professional capstone project.
