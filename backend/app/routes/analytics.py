from flask import Blueprint, jsonify
from app.database import db
from app import cache
from app.models.partner import Partner
from app.models.lead import Lead
from sqlalchemy import func
from datetime import datetime, timedelta

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/summary', methods=['GET'])
@cache.cached(timeout=300)
def get_summary():
    active_partners = Partner.query.filter_by(status='Active').count()
    
    # Active leads are those in pipeline stages (New, Contacted, Qualified)
    active_leads = Lead.query.filter(Lead.status.in_(['New', 'Contacted', 'Qualified'])).count()
    
    total_leads = Lead.query.count()
    converted_leads = Lead.query.filter_by(converted=1).count()
    conversion_rate = (converted_leads / total_leads * 100) if total_leads > 0 else 0.0
    
    # Pipeline value is the sum of deal values for all active leads
    pipeline_val = db.session.query(func.sum(Lead.deal_value_inr)).filter(
        Lead.status.in_(['New', 'Contacted', 'Qualified'])
    ).scalar() or 0.0

    return jsonify({
        "success": True,
        "data": {
            "active_partners": active_partners,
            "active_leads": active_leads,
            "conversion_rate": round(conversion_rate, 2),
            "pipeline_value_inr": float(pipeline_val)
        }
    }), 200

@analytics_bp.route('/regional', methods=['GET'])
@cache.cached(timeout=300)
def get_regional():
    # Partner counts by region
    partner_counts = db.session.query(
        Partner.region, func.count(Partner.partner_id)
    ).group_by(Partner.region).all()
    
    # Lead counts by region
    lead_counts = db.session.query(
        Lead.region, func.count(Lead.lead_id)
    ).group_by(Lead.region).all()

    partner_map = {r: count for r, count in partner_counts}
    lead_map = {r: count for r, count in lead_counts}

    regions = ["North", "South", "East", "West", "Central"]
    result = []
    for r in regions:
        result.append({
            "region": r,
            "partners_count": partner_map.get(r, 0),
            "leads_count": lead_map.get(r, 0)
        })

    return jsonify({
        "success": True,
        "data": result
    }), 200

@analytics_bp.route('/trends', methods=['GET'])
@cache.cached(timeout=300)
def get_trends():
    # Rolling 12-week trends ending on June 1, 2026 (baseline date)
    end_date = datetime(2026, 6, 1).date()
    start_date = end_date - timedelta(weeks=12)

    leads = Lead.query.filter(
        Lead.created_date >= start_date,
        Lead.created_date <= end_date
    ).all()

    # Generate weekly Monday date keys in the range
    weeks = []
    current = start_date - timedelta(days=start_date.weekday())
    while current <= end_date:
        weeks.append(current)
        current += timedelta(weeks=1)

    # Group leads into weekly buckets
    weekly_data = {w: {"total": 0, "converted": 0} for w in weeks}

    for lead in leads:
        c_date = lead.created_date
        monday = c_date - timedelta(days=c_date.weekday())
        
        if monday in weekly_data:
            weekly_data[monday]["total"] += 1
            if lead.converted == 1:
                weekly_data[monday]["converted"] += 1

    # Format result for charts
    result = []
    for w in sorted(weekly_data.keys()):
        stats = weekly_data[w]
        rate = (stats["converted"] / stats["total"] * 100) if stats["total"] > 0 else 0.0
        result.append({
            "week_start": w.strftime("%Y-%m-%d"),
            "lead_volume": stats["total"],
            "conversion_rate": round(rate, 2)
        })

    return jsonify({
        "success": True,
        "data": result
    }), 200

@analytics_bp.route('/tier-breakdown', methods=['GET'])
@cache.cached(timeout=300)
def get_tier_breakdown():
    # Aggregations by partner tier
    tier_aggregations = db.session.query(
        Partner.tier,
        func.count(Partner.partner_id).label("partners_count"),
        func.sum(Partner.annual_revenue_inr).label("total_revenue"),
        func.sum(Partner.deal_count).label("total_deals")
    ).group_by(Partner.tier).all()

    result = []
    for row in tier_aggregations:
        result.append({
            "tier": row.tier,
            "partners_count": row.partners_count,
            "total_revenue_inr": float(row.total_revenue or 0.0),
            "total_deals": int(row.total_deals or 0)
        })

    return jsonify({
        "success": True,
        "data": result
    }), 200
