import os
import sys
import sqlite3
import pandas as pd
import numpy as np
import joblib

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder

def prepare_and_preprocess_data():
    # Setup paths
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    db_path = os.path.join(base_dir, "instance", "vyana_dev.db")
    processed_dir = os.path.join(base_dir, "data", "processed")
    models_dir = os.path.join(base_dir, "app", "ml", "models")
    
    os.makedirs(processed_dir, exist_ok=True)
    os.makedirs(models_dir, exist_ok=True)

    print(f"Connecting to database at: {db_path}")
    if not os.path.exists(db_path):
        print(f"Error: Database file does not exist at {db_path}")
        return

    # Load data
    conn = sqlite3.connect(db_path)
    query = """
        SELECT l.*, p.tier AS partner_tier 
        FROM leads l
        JOIN partners p ON l.partner_id = p.partner_id
    """
    df = pd.read_sql_query(query, conn)
    conn.close()

    print(f"Loaded {len(df)} records for preprocessing.")

    # 1. Define Features & Target
    # We drop metadata columns like lead_id, partner_id, company_name, contact_name, contact_email, status, created_date, last_contacted, conversion_date, notes
    # We keep: deal_value_inr, follow_up_count, time_to_first_contact, partner_tier, region, lead_source, product_interest
    features = ['deal_value_inr', 'follow_up_count', 'time_to_first_contact', 'partner_tier', 'region', 'lead_source', 'product_interest']
    target = 'converted'

    X = df[features]
    y = df[target]

    # 2. Stratified Train/Test Split (80% Train, 20% Test)
    # Stratified sampling ensures both sets maintain the ~23% conversion rate
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, stratify=y, random_state=42
    )

    print(f"Train set shape: {X_train.shape} | Test set shape: {X_test.shape}")
    print(f"Train conversion rate: {y_train.mean():.1%} | Test conversion rate: {y_test.mean():.1%}")

    # 3. Define Preprocessing Pipelines
    numerical_cols = ['deal_value_inr', 'follow_up_count', 'time_to_first_contact']
    categorical_cols = ['partner_tier', 'region', 'lead_source', 'product_interest']

    numerical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])

    categorical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
    ])

    # Bundle preprocessing for numerical and categorical data
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numerical_transformer, numerical_cols),
            ('cat', categorical_transformer, categorical_cols)
        ]
    )

    # 4. Fit Preprocessor and Transform
    print("Fitting preprocessor on training features...")
    X_train_transformed = preprocessor.fit_transform(X_train)
    X_test_transformed = preprocessor.transform(X_test)

    # 5. Extract Output Feature Names (One-hot encoded names included)
    feature_names = preprocessor.get_feature_names_out()
    print(f"Features expanded from {X_train.shape[1]} to {len(feature_names)} after one-hot encoding.")

    # 6. Save Preprocessor Artifact
    preprocessor_filename = os.path.join(models_dir, "preprocessor.joblib")
    joblib.dump(preprocessor, preprocessor_filename)
    print(f"Preprocessor artifact saved to: {preprocessor_filename}")

    # 7. Export Processed Datasets as CSV
    # Reset index to allow clean concatenation with y
    X_train_df = pd.DataFrame(X_train_transformed, columns=feature_names)
    X_test_df = pd.DataFrame(X_test_transformed, columns=feature_names)

    train_processed = pd.concat([X_train_df, y_train.reset_index(drop=True)], axis=1)
    test_processed = pd.concat([X_test_df, y_test.reset_index(drop=True)], axis=1)

    train_export_path = os.path.join(processed_dir, "train_processed.csv")
    test_export_path = os.path.join(processed_dir, "test_processed.csv")

    train_processed.to_csv(train_export_path, index=False)
    test_processed.to_csv(test_export_path, index=False)

    print(f"Exported processed training set to: {train_export_path}")
    print(f"Exported processed test set to: {test_export_path}")
    print("Preprocessing pipeline completed successfully.")

if __name__ == "__main__":
    prepare_and_preprocess_data()
