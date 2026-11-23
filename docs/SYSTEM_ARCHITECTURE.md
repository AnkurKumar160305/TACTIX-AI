# TACTIX AI — System Architecture & Data Flow

## 1. High-Level Architecture Overview

```mermaid
graph TD
    A["Raw Dataset (fifa.csv)<br>16,155 Records x 81 Columns"] --> B["Preprocessing Pipeline<br>(ml/preprocess.py)"]
    B --> C["12 Tactical Performance Dimensions<br>& 15 Position Suitability Scores"]
    C --> D["Stratified 70:15:15 Partition<br>Train: 11,308 | Val: 2,423 | Test: 2,424"]
    D --> E["Model Training Suite<br>(Logistic Regression, Random Forest, Gradient Boosting)"]
    E --> F["Trained Models & Artifacts (/models)"]

    F --> G["FastAPI Backend Service (/backend/main.py)"]
    G --> H["REST API Endpoints (/api/...)"]
    H --> I["React + Vite Frontend (React 19 + Tailwind v4)"]
    I --> J["Interactive 3D Football Pitch (Three.js / React Three Fiber)"]
    I --> K["Player & Opponent Strategic Matchup Engine"]
```

---

## 2. Recommendation Engine Scoring Pipeline

```mermaid
flowchart LR
    P["Selected Player Profile"] --> ML["ML Classifier<br>(Trained Champion Model)"]
    P --> SUIT["Heuristic Suitability Engine<br>(Domain Weighted Heuristics)"]
    P --> OPP["Opponent Lineup<br>(Direct 1v1 Attribute Differentials)"]

    ML -->|ML Probability (0-100%)| COMB["Composite Score Aggregator<br>FinalScore = alpha*ML + beta*Suit + gamma*Match"]
    SUIT -->|Suitability Score (0-100)| COMB
    OPP -->|Matchup Advantage Score (0-100)| COMB

    COMB --> RANK["Ranked Tactical Role Recommendations<br>with Positive & Negative Drivers"]
```

---

## 3. 3D Football Pitch Coordinate System

```mermaid
graph LR
    Origin["Field Center (0, 0, 0)"] --> Length["X-Axis: Length (-5.25m to +5.25m)"]
    Origin --> Width["Z-Axis: Width (-3.40m to +3.40m)"]
    Origin --> Height["Y-Axis: Elevation (0 = Turf Level)"]
    
    Sub["Sub-components"] --> Markings["Field Markings (Lines, Center Circle, Penalty Boxes)"]
    Sub --> Posts["Goalposts (Left & Right Goalmouths)"]
    Sub --> Players["Player Cylinders & Selection Emissive Rings"]
    Sub --> Camera["OrbitControls Camera (Perspective FOV 50)"]
```
