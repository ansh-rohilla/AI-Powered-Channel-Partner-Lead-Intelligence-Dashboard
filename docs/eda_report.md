# Exploratory Data Analysis (EDA) Report

**Project:** AI-Powered Channel Partner & Lead Intelligence Dashboard  
**Date:** June 2026  
**Author:** Ansh Rohilla | Vyana Innovations Pvt. Ltd.

---

## 1. Introduction
This report documents the Exploratory Data Analysis (EDA) performed on the historical lead and partner database (Day 16). The purpose of this analysis is to identify key variables that correlate with lead conversion and to verify statistical assumptions before training the XGBoost classifier.

---

## 2. Statistical Findings

### A. Class Balance Analysis
In the current lead database (406 historical leads), the target variable `converted` shows the following class distribution:
*   **Unconverted Leads (Class 0):** 313 leads (77.1%)
*   **Converted Leads (Class 1):** 93 leads (22.9%)

This confirms a **class imbalance** (approx. 3.4:1 ratio of negative to positive cases). This ratio is standard for enterprise B2B sales cycles. To prevent the ML model from prioritizing the majority class, we will configure the training step using the `scale_pos_weight` parameter in XGBoost (set to $\approx 3.36$).

![Class Balance](file:///Users/anshrohilla/Documents/AI-Powered%20Channel%20Partner%20&%20Lead%20Intelligence%20Dashboard/docs/eda/class_balance.png)

---

### B. Correlation Analysis
The correlation matrix computed for numerical features (`deal_value_inr`, `follow_up_count`, `time_to_first_contact`, `converted`) reveals these insights:
*   **Follow-Up Count (`follow_up_count`):** Exhibits the strongest positive correlation with lead conversion ($r \approx 0.32$). This confirms that structured follow-ups significantly drive conversion success.
*   **Time to First Contact (`time_to_first_contact`):** Exhibits a negative correlation with conversion ($r \approx -0.21$). Shorter contact times (prompt response within 1–2 days) heavily increase conversion rates.
*   **Deal Value (`deal_value_inr`):** Shows a very weak correlation with conversion ($r \approx 0.05$). Lead value is a metric of size but is not a primary driver of the probability of closing.

![Correlation Heatmap](file:///Users/anshrohilla/Documents/AI-Powered%20Channel%20Partner%20&%20Lead%20Intelligence%20Dashboard/docs/eda/correlation_heatmap.png)

---

### C. Conversion Rate by Partner Tier
Analyzing conversion rates based on the partner's tier confirms that partner quality heavily influences pipeline outcomes:
*   **Gold Tier Partners:** Conversion rate is $\approx 36.8\%$.
*   **Silver Tier Partners:** Conversion rate is $\approx 17.6\%$.
*   **Bronze Tier Partners:** Conversion rate is $\approx 5.6\%$.

This validates the tier-classification logic and suggests that leads assigned to Gold partners convert at a rate **6x higher** than those assigned to Bronze partners.

![Conversion by Tier](file:///Users/anshrohilla/Documents/AI-Powered%20Channel%20Partner%20&%20Lead%20Intelligence%20Dashboard/docs/eda/conversion_by_tier.png)

---

### D. Conversion Rate by Geographical Region
Analyzing geographical performance helps identify regional sales efficiency:
*   **Central Region:** Shows the highest conversion rate ($\approx 33.3\%$).
*   **West & South Regions:** Show balanced performance ($\approx 25-28\%$).
*   **East & North Regions:** Show slightly lower performance ($\approx 15-20\%$).

These variance metrics will help the classification model adjust predictions based on location-specific factors.

![Conversion by Region](file:///Users/anshrohilla/Documents/AI-Powered%20Channel%20Partner%20&%20Lead%20Intelligence%20Dashboard/docs/eda/conversion_by_region.png)

---

### E. Conversion Rate by Lead Acquisition Source
*   **Referrals:** Demonstrate the highest conversion rate ($\approx 43.1\%$), which aligns with standard sales dynamics.
*   **LinkedIn & Web:** Show moderate performance ($\approx 18-22\%$).
*   **Cold Calling:** Demonstrates the lowest conversion rate ($\approx 8.5\%$).

Selecting `lead_source` as a categorical feature for the XGBoost model is statistically justified by this high variance.

![Conversion by Source](file:///Users/anshrohilla/Documents/AI-Powered%20Channel%20Partner%20&%20Lead%20Intelligence%20Dashboard/docs/eda/conversion_by_source.png)
