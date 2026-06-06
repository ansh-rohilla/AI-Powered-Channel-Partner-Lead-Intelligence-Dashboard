def calculate_tier(annual_revenue_inr, deal_count):
    """
    Classifies channel partners into tiers based on annual revenue and deal count:
    - Gold: Revenue >= 2,000,000 INR AND Deal Count >= 12
    - Silver: Revenue >= 800,000 INR AND Deal Count >= 5
    - Bronze: All other active partners
    """
    rev = float(annual_revenue_inr or 0.0)
    deals = int(deal_count or 0)
    
    if rev >= 2000000.0 and deals >= 12:
        return "Gold"
    elif rev >= 800000.0 and deals >= 5:
        return "Silver"
    else:
        return "Bronze"
