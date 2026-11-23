# TACTIX AI — REST API Documentation

## Base URL
- Local Development: `http://localhost:8000`
- Production: `https://<deployed-url>`

---

## 1. System & Health
### `GET /api/health`
Checks server health, dataset loading status, and registered machine learning models.
- **Response (200 OK):**
```json
{
  "status": "healthy",
  "players_loaded": 16155,
  "models_loaded": ["logistic_regression", "random_forest", "gradient_boosting"],
  "version": "1.0.0"
}
```

### `GET /api/dashboard-stats`
Retrieves summary metrics across the FIFA database.
- **Response (200 OK):**
```json
{
  "total_players": 16155,
  "avg_overall": 63.8,
  "avg_potential": 69.1,
  "avg_age": 24.3,
  "position_distribution": { "CB": 2698, "ST": 2470, "CM": 1955, "GK": 1775, ... },
  "best_model": "Logistic Regression",
  "best_model_f1": 0.4399
}
```

---

## 2. Players
### `GET /api/players`
Query, search, filter, and paginate player profiles.
- **Query Parameters:**
  - `search` (string): Search by player name
  - `position` (string): Filter by 15 standard positions (`GK`, `CB`, `ST`, etc.)
  - `club` (string): Filter by club name
  - `nationality` (string): Filter by country
  - `min_overall` / `max_overall` (int): Rating range
  - `page` (int, default: 1)
  - `per_page` (int, default: 20)
- **Response (200 OK):**
```json
{
  "players": [ ... ],
  "total": 16155,
  "page": 1,
  "per_page": 20,
  "total_pages": 808
}
```

### `GET /api/players/{player_id}`
Returns complete granular attributes, percentiles, strengths, and weaknesses for an individual player.

---

## 3. Predictions & AI Position Engine
### `POST /api/predict-position`
- **Request Body:**
```json
{
  "player_id": 0,
  "model_name": "logistic_regression"
}
```
- **Response (200 OK):**
```json
{
  "player": { "short_name": "L. Messi", "primary_position": "CF", "overall": 93 },
  "prediction": {
    "predicted_position": "CF",
    "confidence": 75.94,
    "top_predictions": [
      { "position": "CF", "probability": 75.94 },
      { "position": "LW", "probability": 8.35 },
      { "position": "RW", "probability": 6.48 }
    ],
    "explanation": {
      "positive_factors": [ ... ],
      "negative_factors": [ ... ]
    }
  }
}
```

---

## 4. Opponent Matchup & Tactical Planning
### `POST /api/opponent-analysis`
Evaluates direct 1v1 attribute differentials against opposing backline and aggregates team weaknesses.
- **Request Body:**
```json
{
  "player_id": 0,
  "opponent_lineup": [
    { "player_id": 100, "position": "CB" },
    { "player_id": 101, "position": "LB" }
  ],
  "formation": "4-3-3"
}
```

### `POST /api/recommend-position`
Computes composite recommendation:
$$\text{FinalScore}(\text{pos}) = \alpha \cdot \text{MLProb} + \beta \cdot \text{Suitability} + \gamma \cdot \text{Matchup}$$

### `POST /api/tactical-formation`
Assigns squad players to 2D/3D pitch coordinates with suitability color coding (`green`, `yellow`, `red`).
- **Request Body:**
```json
{
  "player_ids": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  "formation": "4-3-3"
}
```

---

## 5. Model Evaluation
### `GET /api/model-metrics`
Returns test accuracy, precision, recall, macro F1, weighted F1, log loss, ROC-AUC, confusion matrices, and classification reports.

### `GET /api/model-feature-importance`
Returns global tree MDI feature importance and position-specific linear coefficients.
