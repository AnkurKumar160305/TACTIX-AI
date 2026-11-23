# TACTIX AI — FIFA Dataset Data Dictionary

## 1. Overview
- **Dataset File:** `dataset/fifa.csv`
- **Total Records:** 16,155
- **Total Columns:** 81
- **Domain:** Professional Association Football (FIFA Player Database)
- **Primary Use:** Player attribute analysis, multi-class position prediction, tactical matchup evaluation, and interactive 3D squad planning.

---

## 2. Feature Categories & Column Inventory

### Category A: Player Identification & Metadata (Non-ML Features — Leakage Risk / Identification Only)
*These fields are strictly excluded from predictive model inputs to prevent data leakage and memorization.*
| Column | Type | Null Count | Description | Modeling Role |
| :--- | :--- | :--- | :--- | :--- |
| `Unnamed: 0` | int64 | 0 | Dataset row index | Excluded |
| `sofifa_id` | int64 | 0 | Unique player identifier | Excluded |
| `player_url` | string | 0 | External profile URL | Excluded |
| `short_name` | string | 0 | Common player name | Display / Filter |
| `long_name` | string | 0 | Full legal player name | Display / Filter |
| `dob` | string | 0 | Date of birth (YYYY-MM-DD) | Excluded (Age used) |
| `nationality` | string | 0 | Country represented | Display / Filter |
| `club_name` | string | 239 | Current registered club | Display / Filter |
| `league_name` | string | 239 | Club league competition | Display / Filter |
| `league_rank` | float64 | 239 | League tier ranking | Display / Filter |
| `team_position` | string | 239 | Tactical position at current club | Excluded (Target leakage) |
| `team_jersey_number` | float64 | 239 | Squad shirt number | Display only |
| `loaned_from` | string | 15,243 | Loaning parent club | Excluded |
| `joined` | string | 1,151 | Date joined current club | Excluded |
| `contract_valid_until` | float64 | 239 | Contract expiration year | Excluded |
| `nation_position` | string | 15,074 | National squad tactical position | Excluded (Target leakage) |
| `nation_jersey_number` | float64 | 15,074 | National squad shirt number | Excluded |
| `player_tags` | string | 14,919 | EA descriptive badge tags | Excluded |
| `player_traits` | string | 9,556 | Special player traits | Feature / Excluded |
| `body_type` | string | 0 | Player physique archetype | Excluded / Descriptive |
| `real_face` | string | 0 | 3D scanned face indicator (Yes/No) | Excluded |
| `release_clause_eur` | float64 | 16,155 | 100% missing in this release | Dropped |
| `mentality_composure` | float64 | 16,155 | 100% missing in this release | Dropped |

### Category B: Core Target Variable
| Column | Type | Target Mapping | Notes |
| :--- | :--- | :--- | :--- |
| `player_positions` | string | Primary position extracted (e.g. "CF, ST" -> "CF") mapped to 15 standard classes: `GK, CB, LB, RB, LWB, RWB, CDM, CM, CAM, LM, RM, LW, RW, CF, ST`. Secondary positions preserved for multi-role flexibility analysis. |

### Category C: Physical & Demographics (General Player Attributes)
| Column | Type | Null Count | Description |
| :--- | :--- | :--- | :--- |
| `age` | int64 | 0 | Player age in years (16–44) |
| `height_cm` | int64 | 0 | Player height in centimeters (155–205) |
| `weight_kg` | int64 | 0 | Player weight in kilograms (50–110) |
| `preferred_foot` | string | 0 | 'Left' or 'Right' foot preference |
| `weak_foot` | int64 | 0 | Weak foot ability rating (1–5) |
| `skill_moves` | int64 | 0 | Skill moves stars rating (1–5) |
| `work_rate` | string | 0 | Attacking / Defensive work rate (e.g., 'High/Medium') |
| `international_reputation` | int64 | 0 | Prestige rating (1–5) |

### Category D: Financial & Economic Attributes
| Column | Type | Null Count | Description |
| :--- | :--- | :--- | :--- |
| `overall` | int64 | 0 | Overall FIFA rating (47–93) |
| `potential` | int64 | 0 | Future potential rating (48–95) |
| `value_eur` | int64 | 0 | Market transfer value in Euros |
| `wage_eur` | int64 | 0 | Weekly wage in Euros |

### Category E: Summary Face Attributes (Missing for Goalkeepers)
| Column | Type | Missing Count | Handling Strategy |
| :--- | :--- | :--- | :--- |
| `pace` | float64 | 1,775 | Missing for GKs; imputed with GK speed/scaled minimums |
| `shooting` | float64 | 1,775 | Missing for GKs; imputed with 0 or domain GK equivalent |
| `passing` | float64 | 1,775 | Missing for GKs; imputed from short/long passing attributes |
| `dribbling` | float64 | 1,775 | Missing for GKs; imputed from ball control/reactions |
| `defending` | float64 | 1,775 | Missing for GKs; imputed with GK outfield defensive baseline |
| `physic` | float64 | 1,775 | Missing for GKs; imputed from strength/jumping |

### Category F: Goalkeeper Face Attributes (Missing for Outfield Players)
| Column | Type | Missing Count | Handling Strategy |
| :--- | :--- | :--- | :--- |
| `gk_diving` | float64 | 14,380 | Missing for outfielders; imputed with base outfield GK level |
| `gk_handling` | float64 | 14,380 | Imputed with base outfield GK level |
| `gk_kicking` | float64 | 14,380 | Imputed with base outfield GK level |
| `gk_reflexes` | float64 | 14,380 | Imputed with base outfield GK level |
| `gk_speed` | float64 | 14,380 | Imputed with pace/movement acceleration |
| `gk_positioning` | float64 | 14,380 | Imputed with base outfield GK level |

### Category G: Detailed In-Game Attributes (Complete for All 16,155 Players - 0 Missing Values)
*These 29 core football attributes form the primary foundation for ML modeling and feature engineering:*
- **Attacking:** `attacking_crossing`, `attacking_finishing`, `attacking_heading_accuracy`, `attacking_short_passing`, `attacking_volleys`
- **Skill:** `skill_dribbling`, `skill_curve`, `skill_fk_accuracy`, `skill_long_passing`, `skill_ball_control`
- **Movement:** `movement_acceleration`, `movement_sprint_speed`, `movement_agility`, `movement_reactions`, `movement_balance`
- **Power:** `power_shot_power`, `power_jumping`, `power_stamina`, `power_strength`, `power_long_shots`
- **Mentality:** `mentality_aggression`, `mentality_interceptions`, `mentality_positioning`, `mentality_vision`, `mentality_penalties`
- **Defending:** `defending_marking`, `defending_standing_tackle`, `defending_sliding_tackle`
- **Goalkeeping:** `goalkeeping_diving`, `goalkeeping_handling`, `goalkeeping_kicking`, `goalkeeping_positioning`, `goalkeeping_reflexes`

---

## 3. Position Standardization Mapping
The 15 standardized output classes are:
1. `GK` — Goalkeeper
2. `CB` — Centre-Back
3. `LB` — Left-Back
4. `RB` — Right-Back
5. `LWB` — Left Wing-Back
6. `RWB` — Right Wing-Back
7. `CDM` — Central Defensive Midfielder
8. `CM` — Central Midfielder
9. `CAM` — Central Attacking Midfielder
10. `LM` — Left Midfielder
11. `RM` — Right Midfielder
12. `LW` — Left Winger
13. `RW` — Right Winger
14. `CF` — Centre Forward
15. `ST` — Striker
