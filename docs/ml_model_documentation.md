# Machine Learning Model & Inferences Documentation (Day 31)

This document details the Machine Learning pipeline deployed within the Vyana AI Leads prioritization engine.

---

## 📊 1. Model Architecture & Preprocessing

The lead prioritization model utilizes an **XGBoost Classifier** hyperparameter-tuned and wrapped in an offline preprocessing pipeline.

### Input Features Specification
The model processes 7 main features representing deal dynamics and channel outreach activity:

1. **`deal_value_inr`** *(Numerical)*: Total monetary value of the deal. Higher deal sizes slightly increase prioritization requirements.
2. **`follow_up_count`** *(Numerical)*: Total communication count. Touchpoints >= 5 drastically increase probability.
3. **`time_to_first_contact`** *(Numerical)*: Delay in days before first outreach. Contact speeds <= 2 days lift score by ~20%.
4. **`partner_tier`** *(Categorical)*: Classification of partner managing the lead (Gold, Silver, Bronze). Gold tier adds high closure coefficients.
5. **`region`** *(Categorical)*: North, South, East, West, Central.
6. **`lead_source`** *(Categorical)*: Referral, Website, LinkedIn, Event, Cold Call.
7. **`product_interest`** *(Categorical)*: enterprise product licensing category.

### Preprocessing Pipeline
Categorical features are mapped using **One-Hot Encoding** while numerical columns are standard-scaled inside a unified preprocessing pipeline ([preprocessor.joblib](file:///Users/anshrohilla/Documents/AI-Powered%20Channel%20Partner%20&%20Lead%20Intelligence%20Dashboard/backend/app/ml/models/preprocessor.joblib)).

---

## 🏆 2. Performance Metrics

The model was selected and evaluated against Random Forest and Logistic Regression baselines:

- **Primary Metric (AUC-ROC)**: **80.2%**
- **Precision (High Priority Category)**: **82.5%**
- **Recall (High Priority Category)**: **78.1%**

Features with the highest impact are shown in the chart below (ranked by SHAP values):
1. **Lead Source: Referral** (Positive)
2. **Contact Latency <= 1 Day** (Positive)
3. **Lead Source: Cold Call** (Negative)
4. **Partner Tier: Gold** (Positive)

---

## 🔄 3. Model Retraining Guidelines

When new sales and conversion data are collected, the model must be retrained to prevent data drift.

### Step-by-Step Retraining Execution

1. **Activate Virtual Environment**:
   ```bash
   cd backend
   source venv/bin/activate
   ```

2. **Prepare Training Script**:
   Verify that training datasets exist under `backend/data/sample/`.

3. **Execute Train command**:
   Run the training utility script:
   ```bash
   python app/ml/train.py
   ```
   *Note: This script will run GridSearchCV, evaluate AUC-ROC, overwrite `best_model.joblib` and `preprocessor.joblib` inside the `backend/app/ml/models/` folder, and save performance curves.*

4. **Verify Retrained Inference**:
   Run the API demo client validation:
   ```bash
   python app/ml/demo_api.py
   ```
   Ensure prediction latency is < 10ms and the model loads without error.
