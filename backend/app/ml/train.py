import os
import sys
import numpy as np
import pandas as pd
import joblib

# Set matplotlib backend to Agg to prevent GUI window issues on headless/sandbox terminals
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.model_selection import GridSearchCV
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, 
    roc_auc_score, roc_curve
)

def run_training_pipeline():
    # Setup paths
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    processed_dir = os.path.join(base_dir, "data", "processed")
    models_dir = os.path.join(base_dir, "app", "ml", "models")
    ml_docs_dir = os.path.join(base_dir, "..", "docs", "ml")
    
    os.makedirs(models_dir, exist_ok=True)
    os.makedirs(ml_docs_dir, exist_ok=True)

    # 1. Load Processed Datasets
    train_path = os.path.join(processed_dir, "train_processed.csv")
    test_path = os.path.join(processed_dir, "test_processed.csv")

    if not os.path.exists(train_path) or not os.path.exists(test_path):
        print("Error: Processed training/testing CSV files not found. Run preprocessing.py first.")
        return

    train_df = pd.read_csv(train_path)
    test_df = pd.read_csv(test_path)

    X_train = train_df.drop('converted', axis=1)
    y_train = train_df['converted']
    X_test = test_df.drop('converted', axis=1)
    y_test = test_df['converted']

    print(f"Loaded train features {X_train.shape} and test features {X_test.shape}")

    # Calculate scale weight for XGBoost to balance positive classes
    scale_weight = float(np.sum(y_train == 0) / np.sum(y_train == 1))
    print(f"Computed scale_pos_weight for XGBoost: {scale_weight:.2f}")

    # 2. Define Baseline Models
    baselines = {
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42, class_weight='balanced'),
        "Random Forest": RandomForestClassifier(random_state=42, class_weight='balanced', n_estimators=100),
        "XGBoost (Baseline)": XGBClassifier(random_state=42, scale_pos_weight=scale_weight, eval_metric='logloss')
    }

    # Evaluate baselines
    results = []
    roc_curves = {}

    print("\nTraining and evaluating baseline models...")
    for name, model in baselines.items():
        model.fit(X_train, y_train)
        
        # Predictions
        y_pred = model.predict(X_test)
        y_probs = model.predict_proba(X_test)[:, 1]

        # Calculate metrics
        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred)
        rec = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        auc = roc_auc_score(y_test, y_probs)

        results.append({
            "Model": name,
            "Accuracy": acc,
            "Precision": prec,
            "Recall": rec,
            "F1-Score": f1,
            "AUC-ROC": auc
        })
        print(f"-> {name} | F1: {f1:.3f} | AUC-ROC: {auc:.3f}")

        # Store ROC curve data
        fpr, tpr, _ = roc_curve(y_test, y_probs)
        roc_curves[name] = (fpr, tpr, auc)

    # 3. Hyperparameter Tuning using 5-Fold GridSearchCV on XGBoost
    print("\nRunning hyperparameter tuning via 5-Fold GridSearchCV on XGBoost...")
    param_grid = {
        'n_estimators': [50, 100, 150],
        'max_depth': [3, 5, 6],
        'learning_rate': [0.05, 0.1, 0.2],
        'subsample': [0.8, 1.0]
    }

    xgb = XGBClassifier(random_state=42, scale_pos_weight=scale_weight, eval_metric='logloss')
    
    grid_search = GridSearchCV(
        estimator=xgb,
        param_grid=param_grid,
        cv=5,
        scoring='roc_auc',
        n_jobs=-1,
        verbose=1
    )
    
    grid_search.fit(X_train, y_train)

    print(f"Best hyperparameters found: {grid_search.best_params_}")
    print(f"Best Cross-Validation AUC-ROC: {grid_search.best_score_:.3f}")

    # Evaluate tuned model
    best_model = grid_search.best_estimator_
    y_pred_tuned = best_model.predict(X_test)
    y_probs_tuned = best_model.predict_proba(X_test)[:, 1]

    acc_t = accuracy_score(y_test, y_pred_tuned)
    prec_t = precision_score(y_test, y_pred_tuned)
    rec_t = recall_score(y_test, y_pred_tuned)
    f1_t = f1_score(y_test, y_pred_tuned)
    auc_t = roc_auc_score(y_test, y_probs_tuned)

    results.append({
        "Model": "XGBoost (Tuned & Optimized)",
        "Accuracy": acc_t,
        "Precision": prec_t,
        "Recall": rec_t,
        "F1-Score": f1_t,
        "AUC-ROC": auc_t
    })
    print(f"-> Tuned XGBoost | F1: {f1_t:.3f} | AUC-ROC: {auc_t:.3f}")

    # Add tuned model ROC curve data
    fpr_t, tpr_t, _ = roc_curve(y_test, y_probs_tuned)
    roc_curves["XGBoost (Tuned & Optimized)"] = (fpr_t, tpr_t, auc_t)

    # 4. Save Final Tuned Model
    model_export_path = os.path.join(models_dir, "best_model.joblib")
    joblib.dump(best_model, model_export_path)
    print(f"\nFinal tuned model checkpoint saved to: {model_export_path}")

    # 5. Plot ROC Curves
    plt.figure(figsize=(8, 6))
    colors = {
        "Logistic Regression": "gray",
        "Random Forest": "blue",
        "XGBoost (Baseline)": "orange",
        "XGBoost (Tuned & Optimized)": "green"
    }
    
    for name, (fpr, tpr, auc) in roc_curves.items():
        lw = 2 if "Tuned" in name else 1
        ls = "-" if "Tuned" in name else "--"
        plt.plot(fpr, tpr, color=colors.get(name, "black"), linestyle=ls, lw=lw,
                 label=f"{name} (AUC = {auc:.3f})")

    plt.plot([0, 1], [0, 1], color='navy', lw=1.5, linestyle=':')
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel('False Positive Rate (FPR)')
    plt.ylabel('True Positive Rate (TPR)')
    plt.title('Receiver Operating Characteristic (ROC) Curves')
    plt.legend(loc="lower right")
    plt.grid(True, linestyle='--', alpha=0.6)
    
    roc_plot_path = os.path.join(ml_docs_dir, "roc_curves.png")
    plt.savefig(roc_plot_path, dpi=300)
    plt.close()
    print(f"ROC Curves plot saved to: {roc_plot_path}")

    # 6. Save Comparison Metrics as CSV for Justification Report
    df_results = pd.DataFrame(results)
    results_csv_path = os.path.join(processed_dir, "model_comparison_metrics.csv")
    df_results.to_csv(results_csv_path, index=False)
    print(f"Comparison metrics exported to: {results_csv_path}")

if __name__ == "__main__":
    run_training_pipeline()
