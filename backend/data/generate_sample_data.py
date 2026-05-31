import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta
import os

random.seed(42)
np.random.seed(42)

N_PARTNERS, N_LEADS = 80, 400
REGIONS = ["North", "South", "East", "West", "Central"]
CITIES  = {
    "North":   ["Delhi", "Chandigarh", "Lucknow", "Jaipur", "Agra"],
    "South":   ["Bangalore", "Chennai", "Hyderabad", "Kochi", "Coimbatore"],
    "East":    ["Kolkata", "Bhubaneswar", "Patna", "Guwahati", "Ranchi"],
    "West":    ["Mumbai", "Pune", "Ahmedabad", "Surat", "Nagpur"],
    "Central": ["Indore", "Bhopal", "Raipur", "Jabalpur", "Gwalior"],
}
PRODUCTS     = ["Firewall","EDR","SIEM","DLP","IAM","Cloud Security","Vuln Mgmt"]
LEAD_SOURCES = ["Referral","Event","Cold Call","Web","Partner Referral","LinkedIn"]
SUFFIXES     = ["Pvt Ltd","Solutions","Technologies","Systems","Networks","IT Services"]

def rand_date(ago_max, ago_min=0):
    base = datetime(2026, 6, 1)
    return (base - timedelta(days=random.randint(ago_min, ago_max))).strftime("%Y-%m-%d")

def rand_name():
    firsts = ["Rajesh","Priya","Amit","Sneha","Vikram","Kavita","Arjun","Meena","Deepak","Pooja"]
    lasts  = ["Kumar","Sharma","Singh","Patel","Gupta","Mehta","Joshi","Nair","Reddy","Verma"]
    return f"{random.choice(firsts)} {random.choice(lasts)}"

def rand_email(name, company):
    fn = name.split()[0].lower()
    co = company.lower().replace(" ","")[:8]
    return f"{fn}@{co}.{random.choice(['com','in','co.in'])}"

# Generate Partners
partners = []
PNAMES = ["TechSecure","SafeNet","GuardIT","CyberShield","InfoProtect",
          "NetSafe","DataGuard","SecureEdge","TrustNet","CipherTech",
          "AlphaSecure","BetaNet","GammaTech","DeltaSystems","EpsilonIT"]

for i in range(N_PARTNERS):
    region = random.choice(REGIONS)
    city   = random.choice(CITIES[region])
    pname  = random.choice(PNAMES) + " " + random.choice(SUFFIXES)
    cname  = rand_name()
    rev    = round(random.lognormvariate(14.5, 1.2))
    deals  = max(1, int(rev / random.randint(80000, 300000)))
    tier   = "Gold" if rev>=2_000_000 and deals>=12 else "Silver" if rev>=800_000 and deals>=5 else "Bronze"
    partners.append({
        "partner_id": f"P-2024-{i+1:03d}", "company_name": pname,
        "contact_name": cname, "contact_email": rand_email(cname, pname),
        "phone": f"+91-{random.randint(7000000000,9999999999)}",
        "region": region, "city": city, "tier": tier,
        "annual_revenue_inr": rev, "deal_count": deals,
        "active_leads": random.randint(0, 20),
        "last_activity_date": rand_date(180),
        "onboarded_date": rand_date(1460, 200),
        "product_categories": ", ".join(random.sample(PRODUCTS, random.randint(1,4))),
        "status": "Active" if random.random() > 0.1 else "Inactive",
    })

df_p = pd.DataFrame(partners)

# Generate Leads
LEAD_COS = ["InfoGuard Corp","SecureVault Pvt Ltd","DataFort Systems",
            "NetArmor Solutions","CyberCastle Technologies","IronWall Networks",
            "ShieldTech IT","FireWatch Systems","QuantumSafe Solutions","NexGen Infosec"]

leads = []
for i in range(N_LEADS):
    partner = random.choice(partners)
    source  = random.choice(LEAD_SOURCES)
    ttc     = random.randint(0, 14)   # time to first contact (days)
    fups    = random.randint(0, 10)   # follow-up count
    value   = round(random.lognormvariate(12.5, 0.8), -3)

    # Conversion probability model (realistic business logic)
    prob  = 0.3 if source=="Referral" else 0.1
    prob += 0.2 if ttc <= 2 else 0.0
    prob += min(fups * 0.03, 0.15)
    prob += 0.1 if partner["tier"]=="Gold" else 0.05 if partner["tier"]=="Silver" else 0.0
    prob += random.uniform(0, 0.2)
    converted = 1 if prob > 0.45 and random.random() < prob else 0
    status    = "Converted" if converted else random.choice(["New","Contacted","Qualified","Lost"])
    lname, lco = rand_name(), random.choice(LEAD_COS)
    leads.append({
        "lead_id": f"L-2026-{i+1:04d}", "partner_id": partner["partner_id"],
        "company_name": lco, "contact_name": lname,
        "contact_email": rand_email(lname, lco),
        "region": partner["region"], "lead_source": source,
        "product_interest": random.choice(PRODUCTS),
        "deal_value_inr": value, "status": status,
        "created_date": rand_date(365, 30), "last_contacted": rand_date(60),
        "follow_up_count": fups, "time_to_first_contact": ttc,
        "converted": converted, "conversion_date": rand_date(30) if converted else None,
        "ml_score": None, "notes": "",
    })

df_l = pd.DataFrame(leads)

os.makedirs("data/sample", exist_ok=True)
df_p.to_csv("data/sample/partners.csv", index=False)
df_l.to_csv("data/sample/leads.csv", index=False)

with pd.ExcelWriter("data/sample/vyana_data.xlsx") as w:
    df_p.to_excel(w, sheet_name="Partners", index=False)
    df_l.to_excel(w, sheet_name="Leads", index=False)

print(f"Partners: {len(df_p)} | Leads: {len(df_l)}")
print(f"Tier breakdown:\n{df_p['tier'].value_counts()}")
print(f"Conversion rate: {df_l['converted'].mean():.1%}")
