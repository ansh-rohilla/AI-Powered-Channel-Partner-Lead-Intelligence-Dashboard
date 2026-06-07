import os
import joblib
import pandas as pd
from app.database import db
from app.models.partner import Partner

_model = None
_preprocessor = None

def load_artifacts():
    global _model, _preprocessor
    if _model is None or _preprocessor is None:
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        model_path = os.path.join(base_dir, "app", "ml", "models", "best_model.joblib")
        preprocessor_path = os.path.join(base_dir, "app", "ml", "models", "preprocessor.joblib")
        
        if not os.path.exists(model_path) or not os.path.exists(preprocessor_path):
            raise FileNotFoundError("Machine Learning model or preprocessor artifact not found. Run train.py first.")
            
        _model = joblib.load(model_path)
        _preprocessor = joblib.load(preprocessor_path)
    return _model, _preprocessor

def predict_single_lead(lead_data):
    """
    Computes a lead conversion probability score on a 0-100 scale,
    assigns a priority label (High/Medium/Low), and generates a plain-text explanation.
    """
    import time
    from flask import current_app
    
    start_time = time.time()
    
    # 1. Load artifacts
    model, preprocessor = load_artifacts()

    # 2. Fetch partner tier dynamically (or use pre-fetched tier)
    partner_tier = lead_data.get('partner_tier')
    partner_id = lead_data.get('partner_id')
    
    if not partner_tier:
        if not partner_id:
            raise ValueError("Missing 'partner_id' required for lead prediction.")
        partner = db.session.get(Partner, partner_id)
        partner_tier = partner.tier if partner else "Bronze"

    # 3. Assemble features (column order must match training features list)
    features = {
        'deal_value_inr': float(lead_data.get('deal_value_inr', 0.0)),
        'follow_up_count': int(lead_data.get('follow_up_count', 0)),
        'time_to_first_contact': None if lead_data.get('time_to_first_contact') is None else int(lead_data['time_to_first_contact']),
        'partner_tier': partner_tier,
        'region': lead_data.get('region', 'North'),
        'lead_source': lead_data.get('lead_source', 'Web'),
        'product_interest': lead_data.get('product_interest', 'Firewall')
    }

    df = pd.DataFrame([features])

    # 4. Transform features and execute prediction
    transformed_X = preprocessor.transform(df)
    prob = model.predict_proba(transformed_X)[0, 1]
    ml_score = float(prob * 100)

    # 5. Determine priority label
    if ml_score >= 75:
        priority_label = "High"
    elif ml_score >= 40:
        priority_label = "Medium"
    else:
        priority_label = "Low"

    # 6. Generate explainability insights
    explanations = []
    
    # Analyze Time to Contact
    ttc = features['time_to_first_contact']
    if ttc is not None and ttc <= 2:
        explanations.append("prompt contact outreach (<= 2 days)")
    elif ttc is not None and ttc >= 7:
        explanations.append("delayed contact outreach (>= 7 days)")

    # Analyze Lead Source
    source = features['lead_source']
    if source == 'Referral':
        explanations.append("referral origin source channel")
    elif source == 'Cold Call':
        explanations.append("historically low-yield Cold Calling channel")

    # Analyze Partner Tier
    if partner_tier == 'Gold':
        explanations.append("assignment to a top-tier Gold partner")
    elif partner_tier == 'Bronze':
        explanations.append("assignment to a Bronze partner")

    # Analyze Follow-Up Counts
    fups = features['follow_up_count']
    if fups >= 5:
        explanations.append("high amount of customer follow-ups (>= 5)")
    elif fups <= 1:
        explanations.append("low customer follow-up engagement (<= 1)")

    if priority_label == "High":
        explanation = f"High priority score driven by {', '.join(explanations) if explanations else 'strong overall feature profiles'}."
    elif priority_label == "Low":
        explanation = f"Low priority score due to {', '.join(explanations) if explanations else 'weak overall feature profiles'}."
    else:
        explanation = f"Medium priority score driven by moderate {', '.join(explanations) if explanations else 'feature alignments'}."

    latency = (time.time() - start_time) * 1000
    try:
        current_app.logger.info(
            f"ML Prediction | Lead ID: {lead_data.get('lead_id', 'N/A')} | "
            f"Score: {ml_score:.2f} | Label: {priority_label} | Latency: {latency:.2f}ms"
        )
    except Exception:
        pass

    return {
        "ml_score": round(ml_score, 2),
        "priority_label": priority_label,
        "explanation": explanation
    }
