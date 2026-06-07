import os
import sqlite3
import pandas as pd
import numpy as np

# Set matplotlib backend to Agg to prevent GUI window issues on headless/sandbox terminals
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns

def run_eda():
    db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "instance", "vyana_dev.db")
    docs_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "docs")
    eda_dir = os.path.join(docs_dir, "eda")
    
    os.makedirs(eda_dir, exist_ok=True)
    print(f"Connecting to database at: {db_path}")
    
    if not os.path.exists(db_path):
        print(f"Error: Database file does not exist at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    
    # Query leads combined with partner tier
    query = """
        SELECT l.*, p.tier AS partner_tier 
        FROM leads l
        JOIN partners p ON l.partner_id = p.partner_id
    """
    df = pd.read_sql_query(query, conn)
    conn.close()
    
    print(f"Successfully loaded {len(df)} leads for analysis.")

    # Apply modern styling
    sns.set_theme(style="whitegrid")
    plt.rcParams.update({
        'font.size': 10,
        'axes.labelsize': 11,
        'axes.titlesize': 13,
        'xtick.labelsize': 9,
        'ytick.labelsize': 9,
        'figure.titlesize': 15
    })

    # ────────────────────────────────────────────────────────
    # 1. Class Balance Analysis
    # ────────────────────────────────────────────────────────
    print("Generating Class Balance Chart...")
    plt.figure(figsize=(6, 4.5))
    counts = df['converted'].value_counts()
    percentage = df['converted'].value_counts(normalize=True) * 100
    
    ax = sns.barplot(x=counts.index, y=counts.values, palette=["#1A6BB5", "#2A9D8F"])
    plt.title("Lead Conversion Class Balance")
    plt.xlabel("Conversion Status (0 = Unconverted, 1 = Converted)")
    plt.ylabel("Number of Leads")
    plt.xticks([0, 1], [f"Unconverted\n({counts[0]} / {percentage[0]:.1f}%)", 
                        f"Converted\n({counts[1]} / {percentage[1]:.1f}%)"])
    
    # Add count values on top of bars
    for p in ax.patches:
        height = p.get_height()
        ax.text(p.get_x() + p.get_width()/2., height + 5, f'{int(height)}', ha="center")
        
    plt.tight_layout()
    plt.savefig(os.path.join(eda_dir, "class_balance.png"), dpi=300)
    plt.close()

    # ────────────────────────────────────────────────────────
    # 2. Correlation Matrix Heatmap
    # ────────────────────────────────────────────────────────
    print("Generating Correlation Heatmap...")
    plt.figure(figsize=(7, 5))
    numerical_cols = ['deal_value_inr', 'follow_up_count', 'time_to_first_contact', 'converted']
    corr_df = df[numerical_cols].corr()
    
    # Create mask for upper triangle
    mask = np.triu(np.ones_like(corr_df, dtype=bool))
    
    sns.heatmap(corr_df, mask=mask, annot=True, cmap="coolwarm", fmt=".2f", vmin=-1, vmax=1, 
                square=True, linewidths=0.5, cbar_kws={"shrink": 0.8})
    plt.title("Numerical Features Correlation Heatmap")
    plt.tight_layout()
    plt.savefig(os.path.join(eda_dir, "correlation_heatmap.png"), dpi=300)
    plt.close()

    # ────────────────────────────────────────────────────────
    # 3. Conversion Rate by Partner Tier
    # ────────────────────────────────────────────────────────
    print("Generating Conversion by Partner Tier Chart...")
    plt.figure(figsize=(6, 4.5))
    # Calculate conversion rate per tier
    tier_stats = df.groupby('partner_tier')['converted'].mean().reset_index()
    tier_stats['converted'] *= 100  # Convert to percentage
    
    # Sort order
    tier_stats['partner_tier'] = pd.Categorical(tier_stats['partner_tier'], categories=["Gold", "Silver", "Bronze"], ordered=True)
    tier_stats = tier_stats.sort_values('partner_tier')

    ax = sns.barplot(data=tier_stats, x='partner_tier', y='converted', palette=["#FFD700", "#C0C0C0", "#CD7F32"])
    plt.title("Conversion Rate (%) by Partner Tier")
    plt.xlabel("Partner Tier")
    plt.ylabel("Conversion Rate (%)")
    
    for p in ax.patches:
        height = p.get_height()
        ax.text(p.get_x() + p.get_width()/2., height + 0.5, f'{height:.1f}%', ha="center")

    plt.ylim(0, max(tier_stats['converted']) + 5)
    plt.tight_layout()
    plt.savefig(os.path.join(eda_dir, "conversion_by_tier.png"), dpi=300)
    plt.close()

    # ────────────────────────────────────────────────────────
    # 4. Conversion Rate by Region
    # ────────────────────────────────────────────────────────
    print("Generating Conversion by Region Chart...")
    plt.figure(figsize=(7, 4.5))
    region_stats = df.groupby('region')['converted'].mean().reset_index()
    region_stats['converted'] *= 100
    
    # Sort by conversion rate descending
    region_stats = region_stats.sort_values(by='converted', ascending=False)

    ax = sns.barplot(data=region_stats, x='region', y='converted', palette="viridis")
    plt.title("Conversion Rate (%) by Geographical Region")
    plt.xlabel("Region")
    plt.ylabel("Conversion Rate (%)")

    for p in ax.patches:
        height = p.get_height()
        ax.text(p.get_x() + p.get_width()/2., height + 0.5, f'{height:.1f}%', ha="center")

    plt.ylim(0, max(region_stats['converted']) + 5)
    plt.tight_layout()
    plt.savefig(os.path.join(eda_dir, "conversion_by_region.png"), dpi=300)
    plt.close()

    # ────────────────────────────────────────────────────────
    # 5. Conversion Rate by Lead Source
    # ────────────────────────────────────────────────────────
    print("Generating Conversion by Lead Source Chart...")
    plt.figure(figsize=(8, 5))
    source_stats = df.groupby('lead_source')['converted'].mean().reset_index()
    source_stats['converted'] *= 100
    source_stats = source_stats.sort_values(by='converted', ascending=False)

    ax = sns.barplot(data=source_stats, x='lead_source', y='converted', palette="crest")
    plt.title("Conversion Rate (%) by Lead Acquisition Source")
    plt.xlabel("Lead Source")
    plt.ylabel("Conversion Rate (%)")
    plt.xticks(rotation=15)

    for p in ax.patches:
        height = p.get_height()
        ax.text(p.get_x() + p.get_width()/2., height + 0.5, f'{height:.1f}%', ha="center")

    plt.ylim(0, max(source_stats['converted']) + 5)
    plt.tight_layout()
    plt.savefig(os.path.join(eda_dir, "conversion_by_source.png"), dpi=300)
    plt.close()

    print(f"EDA Generation complete. All diagnostic plots saved successfully under {eda_dir}")

if __name__ == "__main__":
    run_eda()
