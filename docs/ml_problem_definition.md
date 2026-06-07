# Machine Learning Lead Priority Model Spec

This document details the Machine Learning Problem Definition and Feature Engineering Plan for the Vyana BI Dashboard lead prioritization engine (Day 15).

---

## 1. Machine Learning Problem Definition

The core objective is to improve sales efficiency by predicting which incoming leads are most likely to convert into customers, allowing sales representatives to prioritize high-value opportunities.

*   **Learning Task:** Supervised Binary Classification.
*   **Target Variable ($y$):** `converted` (integer)
    *   `1`: Lead converted (Won).
    *   `0`: Lead not converted (Lost, or currently stalled in the pipeline).
*   **Evaluation Metrics:**
    *   **Primary Metric:** **AUC-ROC (Area Under the Receiver Operating Characteristic curve)**. This measures the model's ability to rank leads correctly by probability, independent of classification threshold choices.
    *   **Secondary Metrics:** F1-score (balanced precision/recall), Precision (to minimize wasted sales calls on false positives), and Recall (to ensure high-probability leads are not missed).

---

## 2. Feature Selection & Input Mapping

We selected 7 core features that combine channel partner metrics and lead engagement history:

| Feature Name | Source Table | Data Type | Description |
| :--- | :--- | :--- | :--- |
| **deal_value_inr** | `leads` | Numerical | Estimated deal value in Indian Rupees. |
| **follow_up_count** | `leads` | Numerical | Total number of interactions/outreach attempts. |
| **time_to_first_contact** | `leads` | Numerical | Days elapsed from lead creation to the first contact. |
| **partner_tier** | `partners` | Categorical | Assigned partner tier (Gold, Silver, Bronze). |
| **region** | `leads` | Categorical | Geographical area of operation (North, South, East, etc.). |
| **lead_source** | `leads` | Categorical | Acquisition channel (Referral, Web, LinkedIn, etc.). |
| **product_interest** | `leads` | Categorical | Cybersecurity product category (Firewall, EDR, SIEM, etc.). |

---

## 3. Feature Engineering & Preprocessing Pipeline

To ensure maximum performance when training the **XGBoost Classifier**, we designed a preprocessing pipeline using Scikit-Learn’s `ColumnTransformer`:

### A. Categorical Encoding (One-Hot Encoding)
*   **Process:** Transform categorical text labels into binary column vectors using `OneHotEncoder(handle_unknown='ignore')`.
*   **Rationale:** Tree-based models like XGBoost handle binary indicators natively without assuming ordinal relationships (unlike label encoding which can introduce arbitrary numeric scales).

### B. Numerical Scaling (Standardization)
*   **Process:** Normalize the numeric ranges of `deal_value_inr`, `follow_up_count`, and `time_to_first_contact` using `StandardScaler()`.
*   **Rationale:** Scales inputs to a mean of 0 and a standard deviation of 1. While decision trees are scale-invariant, standardizing numerical features is standard practice, aids model convergence, and is essential if we benchmark against models like Logistic Regression or Support Vector Machines.

### C. Missing Value Imputation
*   **Process:** Impute missing values (e.g. `time_to_first_contact` will be null for leads that haven't been contacted yet) using `SimpleImputer(strategy='median')`.
*   **Rationale:** Avoids discarding incomplete rows. The median is chosen to prevent skewing from outliers.

### D. Class Imbalance Handling
*   **Plan:** The lead dataset shows a natural class imbalance (approx. 22-25% conversion rate).
*   *   **Approach A:** Use the native `scale_pos_weight` parameter in the XGBoost classifier (calculated as `sum(negative_cases) / sum(positive_cases)`).
*   *   **Approach B:** Benchmark against **SMOTE** (Synthetic Minority Over-sampling Technique) to generate synthetic converted lead cases in the training subset.
