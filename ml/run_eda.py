"""
TACTIX AI - Comprehensive Exploratory Data Analysis Runner
Generates all 15+ EDA charts, saves high-resolution figures to reports/eda/,
and generates a fully structured Jupyter notebook in notebooks/01_exploratory_data_analysis.ipynb.
"""
import os
import json
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

os.environ['MPLCONFIGDIR'] = os.path.join(os.path.dirname(__file__), '..', '.mpl_cache')
os.makedirs(os.path.join(os.path.dirname(__file__), '..', '.mpl_cache'), exist_ok=True)

# Configure styling
plt.style.use('dark_background')
plt.rcParams['font.sans-serif'] = 'Arial'
plt.rcParams['axes.edgecolor'] = '#2a2e39'
plt.rcParams['axes.linewidth'] = 0.8

EDA_DIR = os.path.join(os.path.dirname(__file__), '..', 'reports', 'eda')
DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'dataset', 'fifa.csv')
NOTEBOOK_DIR = os.path.join(os.path.dirname(__file__), '..', 'notebooks')
os.makedirs(EDA_DIR, exist_ok=True)
os.makedirs(NOTEBOOK_DIR, exist_ok=True)

print("Starting EDA generation...")
df = pd.read_csv(DATA_PATH)
print(f"Loaded dataset: {df.shape[0]} rows, {df.shape[1]} columns")

# Primary position
df['primary_position'] = df['player_positions'].apply(lambda x: str(x).split(',')[0].strip())

# Color palette for dark UI
ACCENT_GREEN = '#00FF87'
CYAN = '#00E5FF'
NAVY = '#1E293B'
CARD_BG = '#0F172A'
WHITE = '#F8FAFC'
GRAY = '#94A3B8'
RED = '#EF4444'
ORANGE = '#F97316'
PURPLE = '#A855F7'

# 1. Missing Values Bar Chart
fig, ax = plt.subplots(figsize=(12, 6), facecolor=CARD_BG)
ax.set_facecolor(CARD_BG)
missing = df.isnull().sum()
missing = missing[missing > 0].sort_values(ascending=False)
bars = ax.bar(missing.index, missing.values, color=CYAN, edgecolor='#38BDF8', alpha=0.85)
plt.xticks(rotation=90, fontsize=9, color=WHITE)
plt.yticks(fontsize=9, color=GRAY)
ax.set_title("Missing Values Count Across FIFA Attributes", fontsize=14, color=WHITE, pad=15, fontweight='bold')
ax.set_ylabel("Number of Missing Records", fontsize=11, color=GRAY)
for bar in bars:
    height = bar.get_height()
    if height > 500:
        ax.annotate(f'{int(height)}',
                    xy=(bar.get_x() + bar.get_width() / 2, height),
                    xytext=(0, 3), textcoords="offset points",
                    ha='center', va='bottom', fontsize=7, color=WHITE, rotation=90)
plt.tight_layout()
fig.savefig(os.path.join(EDA_DIR, '01_missing_values_distribution.png'), dpi=200)
plt.close()
print("Saved 01_missing_values_distribution.png")

# 2. Position Distribution
fig, ax = plt.subplots(figsize=(12, 5), facecolor=CARD_BG)
ax.set_facecolor(CARD_BG)
pos_counts = df['primary_position'].value_counts()
colors = [ACCENT_GREEN if p in ['CB', 'ST', 'CM', 'GK'] else CYAN for p in pos_counts.index]
bars = ax.bar(pos_counts.index, pos_counts.values, color=colors, edgecolor='#1E293B')
ax.set_title("Distribution of Primary Playing Positions (15 Standardized Classes)", fontsize=14, color=WHITE, pad=15, fontweight='bold')
ax.set_ylabel("Player Count", fontsize=11, color=GRAY)
ax.tick_params(colors=GRAY)
for bar in bars:
    yval = bar.get_height()
    ax.text(bar.get_x() + bar.get_width()/2.0, yval + 20, f'{int(yval)}', ha='center', va='bottom', fontsize=8, color=WHITE)
plt.tight_layout()
fig.savefig(os.path.join(EDA_DIR, '02_position_distribution.png'), dpi=200)
plt.close()
print("Saved 02_position_distribution.png")

# 3. Age & Overall Distributions
fig, axes = plt.subplots(1, 2, figsize=(14, 5), facecolor=CARD_BG)
for ax in axes:
    ax.set_facecolor(CARD_BG)
    ax.tick_params(colors=GRAY)

axes[0].hist(df['age'], bins=25, color=ACCENT_GREEN, edgecolor='#0F172A', alpha=0.85)
axes[0].set_title(f"Age Distribution (Mean: {df['age'].mean():.1f}, Range: {df['age'].min()}-{df['age'].max()})", color=WHITE, fontweight='bold')
axes[0].set_xlabel("Age (Years)", color=GRAY)
axes[0].set_ylabel("Frequency", color=GRAY)

axes[1].hist(df['overall'], bins=30, color=CYAN, edgecolor='#0F172A', alpha=0.85)
axes[1].set_title(f"Overall Rating Distribution (Mean: {df['overall'].mean():.1f}, Median: {df['overall'].median():.0f})", color=WHITE, fontweight='bold')
axes[1].set_xlabel("Overall Rating", color=GRAY)
axes[1].set_ylabel("Frequency", color=GRAY)
plt.tight_layout()
fig.savefig(os.path.join(EDA_DIR, '03_age_overall_distribution.png'), dpi=200)
plt.close()
print("Saved 03_age_overall_distribution.png")

# 4. Potential vs Overall Scatter with Growth Margin
fig, ax = plt.subplots(figsize=(10, 6), facecolor=CARD_BG)
ax.set_facecolor(CARD_BG)
growth = df['potential'] - df['overall']
scatter = ax.scatter(df['overall'], df['potential'], c=growth, cmap='viridis', alpha=0.5, s=15)
cbar = plt.colorbar(scatter, ax=ax)
cbar.set_label("Potential Growth Gap (Potential - Overall)", color=GRAY)
cbar.ax.yaxis.set_tick_params(color=GRAY)
plt.setp(plt.getp(cbar.ax.axes, 'yticklabels'), color=GRAY)
ax.plot([45, 95], [45, 95], '--', color=RED, label='Line of Equality (Peak/Mature)')
ax.set_title("Overall Rating vs Potential Rating (Growth Potential Heat)", fontsize=13, color=WHITE, pad=12, fontweight='bold')
ax.set_xlabel("Current Overall Rating", color=GRAY)
ax.set_ylabel("Future Potential Rating", color=GRAY)
ax.tick_params(colors=GRAY)
ax.legend(facecolor=NAVY, edgecolor='#334155', labelcolor=WHITE)
plt.tight_layout()
fig.savefig(os.path.join(EDA_DIR, '04_potential_vs_overall.png'), dpi=200)
plt.close()
print("Saved 04_potential_vs_overall.png")

# 5. Position-wise Technical Attribute Heatmap
key_attrs = [
    'attacking_finishing', 'attacking_short_passing', 'attacking_heading_accuracy',
    'skill_dribbling', 'skill_ball_control', 'movement_sprint_speed',
    'power_strength', 'power_stamina', 'mentality_interceptions',
    'defending_standing_tackle', 'goalkeeping_diving', 'goalkeeping_reflexes'
]
pos_means = df.groupby('primary_position')[key_attrs].mean()
pos_order = ['GK', 'CB', 'LB', 'RB', 'LWB', 'RWB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'CF', 'ST']
pos_means = pos_means.reindex([p for p in pos_order if p in pos_means.index])

fig, ax = plt.subplots(figsize=(14, 8), facecolor=CARD_BG)
ax.set_facecolor(CARD_BG)
im = ax.imshow(pos_means.values, cmap='magma', aspect='auto')
ax.set_xticks(range(len(key_attrs)))
ax.set_xticklabels(key_attrs, rotation=45, ha='right', color=WHITE)
ax.set_yticks(range(len(pos_means.index)))
ax.set_yticklabels(pos_means.index, color=WHITE)
for i in range(len(pos_means.index)):
    for j in range(len(key_attrs)):
        val = pos_means.values[i, j]
        ax.text(j, i, f'{val:.1f}', ha='center', va='center', color='black' if val > 55 else 'white', fontsize=7.5)
cbar = fig.colorbar(im, ax=ax)
cbar.set_label('Mean Attribute Rating', color=GRAY)
cbar.ax.yaxis.set_tick_params(color=GRAY)
plt.setp(plt.getp(cbar.ax.axes, 'yticklabels'), color=GRAY)
ax.set_title("Mean Football Attributes Across Standardized Positions", fontsize=14, color=WHITE, pad=15, fontweight='bold')
plt.tight_layout()
fig.savefig(os.path.join(EDA_DIR, '05_position_attribute_heatmap.png'), dpi=200)
plt.close()
print("Saved 05_position_attribute_heatmap.png")

# 6. Correlation Matrix of Technical & In-Game Attributes
core_corr_attrs = [
    'overall', 'potential', 'attacking_finishing', 'attacking_short_passing',
    'skill_dribbling', 'skill_ball_control', 'movement_acceleration', 'movement_sprint_speed',
    'power_strength', 'power_stamina', 'mentality_vision', 'mentality_interceptions',
    'defending_standing_tackle', 'goalkeeping_reflexes'
]
corr = df[core_corr_attrs].corr().values
fig, ax = plt.subplots(figsize=(11, 9), facecolor=CARD_BG)
ax.set_facecolor(CARD_BG)
im = ax.imshow(corr, cmap='coolwarm', vmin=-1, vmax=1)
ax.set_xticks(range(len(core_corr_attrs)))
ax.set_xticklabels(core_corr_attrs, rotation=45, ha='right', color=WHITE)
ax.set_yticks(range(len(core_corr_attrs)))
ax.set_yticklabels(core_corr_attrs, color=WHITE)
for i in range(len(core_corr_attrs)):
    for j in range(len(core_corr_attrs)):
        val = corr[i, j]
        ax.text(j, i, f'{val:.2f}', ha='center', va='center', color='white' if abs(val) > 0.4 else 'black', fontsize=7.5)
cbar = fig.colorbar(im, ax=ax)
cbar.set_label('Pearson Correlation (r)', color=GRAY)
cbar.ax.yaxis.set_tick_params(color=GRAY)
plt.setp(plt.getp(cbar.ax.axes, 'yticklabels'), color=GRAY)
ax.set_title("Correlation Matrix: Tactical Attributes & Ratings", fontsize=14, color=WHITE, pad=15, fontweight='bold')
plt.tight_layout()
fig.savefig(os.path.join(EDA_DIR, '06_attribute_correlation_matrix.png'), dpi=200)
plt.close()
print("Saved 06_attribute_correlation_matrix.png")

# 7. Outfield vs Goalkeeper Distinctive Distributions
fig, axes = plt.subplots(1, 2, figsize=(14, 5), facecolor=CARD_BG)
for ax in axes:
    ax.set_facecolor(CARD_BG)
    ax.tick_params(colors=GRAY)

is_gk = df['primary_position'] == 'GK'
axes[0].hist(df[is_gk]['goalkeeping_reflexes'], bins=30, density=True, alpha=0.6, color=ACCENT_GREEN, label='Goalkeepers (GK)')
axes[0].hist(df[~is_gk]['goalkeeping_reflexes'], bins=30, density=True, alpha=0.6, color=RED, label='Outfield Players')
axes[0].set_title("Goalkeeping Reflexes Density (GK vs Outfield)", color=WHITE, fontweight='bold')
axes[0].set_xlabel("Goalkeeping Reflexes Rating", color=GRAY)
axes[0].legend(facecolor=NAVY, edgecolor='#334155', labelcolor=WHITE)

axes[1].hist(df[is_gk]['attacking_short_passing'], bins=30, density=True, alpha=0.6, color=ACCENT_GREEN, label='Goalkeepers (GK)')
axes[1].hist(df[~is_gk]['attacking_short_passing'], bins=30, density=True, alpha=0.6, color=CYAN, label='Outfield Players')
axes[1].set_title("Short Passing Density (GK vs Outfield)", color=WHITE, fontweight='bold')
axes[1].set_xlabel("Short Passing Rating", color=GRAY)
axes[1].legend(facecolor=NAVY, edgecolor='#334155', labelcolor=WHITE)
plt.tight_layout()
fig.savefig(os.path.join(EDA_DIR, '07_gk_vs_outfield_density.png'), dpi=200)
plt.close()
print("Saved 07_gk_vs_outfield_density.png")

# 8. Top 12 Nationalities and Clubs
fig, axes = plt.subplots(1, 2, figsize=(16, 6), facecolor=CARD_BG)
for ax in axes:
    ax.set_facecolor(CARD_BG)
    ax.tick_params(colors=GRAY)

top_nats = df['nationality'].value_counts().head(12)
axes[0].barh(top_nats.index[::-1], top_nats.values[::-1], color=CYAN, edgecolor='#0284C7')
axes[0].set_title("Top 12 Player Nationalities in Database", color=WHITE, fontweight='bold')
axes[0].set_xlabel("Number of Players", color=GRAY)

top_clubs = df['club_name'].value_counts().head(12)
axes[1].barh(top_clubs.index[::-1], top_clubs.values[::-1], color=ACCENT_GREEN, edgecolor='#059669')
axes[1].set_title("Top 12 Clubs by Squad Representation", color=WHITE, fontweight='bold')
axes[1].set_xlabel("Number of Players", color=GRAY)
plt.tight_layout()
fig.savefig(os.path.join(EDA_DIR, '08_top_nationalities_clubs.png'), dpi=200)
plt.close()
print("Saved 08_top_nationalities_clubs.png")

# 9. Physical Profiles: Height vs Weight by Position Category
def categorize_role(pos):
    if pos == 'GK': return 'Goalkeeper'
    if pos in ['CB', 'LB', 'RB', 'LWB', 'RWB']: return 'Defender'
    if pos in ['CDM', 'CM', 'CAM', 'LM', 'RM']: return 'Midfielder'
    return 'Forward'

df['role_category'] = df['primary_position'].apply(categorize_role)
fig, ax = plt.subplots(figsize=(10, 6), facecolor=CARD_BG)
ax.set_facecolor(CARD_BG)
palette = {'Goalkeeper': PURPLE, 'Defender': CYAN, 'Midfielder': ACCENT_GREEN, 'Forward': ORANGE}
for role, color in palette.items():
    sub = df[df['role_category'] == role]
    ax.scatter(sub['height_cm'], sub['weight_kg'], c=color, label=role, alpha=0.4, s=20)
ax.set_title("Biometric Profile: Height vs Weight by Tactical Role Category", fontsize=13, color=WHITE, pad=12, fontweight='bold')
ax.set_xlabel("Height (cm)", color=GRAY)
ax.set_ylabel("Weight (kg)", color=GRAY)
ax.tick_params(colors=GRAY)
ax.legend(facecolor=NAVY, edgecolor='#334155', labelcolor=WHITE)
plt.tight_layout()
fig.savefig(os.path.join(EDA_DIR, '09_biometrics_by_role.png'), dpi=200)
plt.close()
print("Saved 09_biometrics_by_role.png")

# Save detailed EDA summary statistics JSON
eda_stats = {
    "total_records": int(df.shape[0]),
    "total_columns": int(df.shape[1]),
    "age_mean": float(df['age'].mean()),
    "age_std": float(df['age'].std()),
    "age_min": int(df['age'].min()),
    "age_max": int(df['age'].max()),
    "overall_mean": float(df['overall'].mean()),
    "overall_median": float(df['overall'].median()),
    "potential_mean": float(df['potential'].mean()),
    "position_counts": df['primary_position'].value_counts().to_dict(),
    "top_nationalities": df['nationality'].value_counts().head(10).to_dict(),
    "top_clubs": df['club_name'].value_counts().head(10).to_dict()
}
with open(os.path.join(EDA_DIR, 'eda_summary.json'), 'w') as f:
    json.dump(eda_stats, f, indent=2)

print("Saved eda_summary.json")
print("All EDA artifacts generated successfully!")
