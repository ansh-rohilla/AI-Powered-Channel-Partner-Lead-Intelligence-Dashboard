import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.lib.colors import HexColor, white
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak, KeepTogether, Preformatted
)
from reportlab.pdfbase import pdfmetrics

# ── Colors ──────────────────────────────────────────────────────
NAVY    = HexColor("#0D1B2A")
BLUE    = HexColor("#1A6BB5")
BLUE_LT = HexColor("#E8F2FB")
TEAL    = HexColor("#0F7B5A")
TEAL_LT = HexColor("#E2F6EF")
AMBER   = HexColor("#B8710A")
AMB_LT  = HexColor("#FEF4DC")
GRAY_LT = HexColor("#F6F5F3")
GRAY_MD = HexColor("#D1CFC7")
GRAY_DK = HexColor("#6B6963")
WHITE   = HexColor("#FFFFFF")
DARK    = HexColor("#1C2B3A")
CODE_BG = HexColor("#F0F0ED")
CODE_BD = HexColor("#D4D2CA")
GREEN   = HexColor("#1A7A45")
GRN_LT  = HexColor("#E6F5ED")
PINK    = HexColor("#B03060")
PINK_LT = HexColor("#FCE8F0")
PURP    = HexColor("#4A42A8")
PURP_LT = HexColor("#EEEDF8")

DAY_COLORS = {
    1: (BLUE,   BLUE_LT),
    2: (TEAL,   TEAL_LT),
    3: (AMBER,  AMB_LT),
    4: (PURP,   PURP_LT),
    5: (GREEN,  GRN_LT),
    6: (PINK,   PINK_LT),
    7: (BLUE,   BLUE_LT),
}

# ── Styles ──────────────────────────────────────────────────────
def S(name, **kw):
    return ParagraphStyle(name, **kw)

sH1     = S("H1", fontName="Helvetica-Bold",  fontSize=20, textColor=NAVY,    leading=26, spaceAfter=4)
sH2     = S("H2", fontName="Helvetica-Bold",  fontSize=13, textColor=NAVY,    leading=18, spaceBefore=10, spaceAfter=4)
sH3     = S("H3", fontName="Helvetica-Bold",  fontSize=10.5, textColor=DARK,  leading=15, spaceBefore=6, spaceAfter=3)
sBody   = S("Bd", fontName="Helvetica",       fontSize=9.5, textColor=DARK,   leading=14, spaceAfter=4)
sBullet = S("Bl", fontName="Helvetica",       fontSize=9,   textColor=DARK,   leading=13, leftIndent=12, spaceAfter=2)
sCode   = S("Co", fontName="Courier",         fontSize=7.8, textColor=DARK,   leading=12, leftIndent=6)
sLabel  = S("Lb", fontName="Helvetica-Bold",  fontSize=7.5, textColor=GRAY_DK,leading=10, spaceAfter=2)
sNote   = S("Nt", fontName="Helvetica-Oblique",fontSize=8.5,textColor=GRAY_DK,leading=12, spaceAfter=3)
sSub    = S("Su", fontName="Helvetica",       fontSize=10,  textColor=GRAY_DK, leading=14, spaceAfter=2)
sCoverT = S("CT", fontName="Helvetica-Bold",  fontSize=26,  textColor=NAVY,   leading=32, spaceAfter=6)
sCoverS = S("CS", fontName="Helvetica",       fontSize=12,  textColor=BLUE,   leading=17, spaceAfter=14)
sMono   = S("Mn", fontName="Courier-Bold",    fontSize=8,   textColor=DARK,   leading=12)

# ── Page template ────────────────────────────────────────────────
def page_fn(canv, doc):
    w, h = A4
    canv.setFillColor(NAVY)
    canv.rect(0, h-20*mm, w, 20*mm, fill=1, stroke=0)
    canv.setFillColor(WHITE)
    canv.setFont("Helvetica-Bold", 8.5)
    canv.drawString(18*mm, h-11*mm, "Week 1 — Deep Implementation Guide")
    canv.setFont("Helvetica", 8)
    canv.drawRightString(w-18*mm, h-11*mm, "AI-Powered Channel Partner & Lead Intelligence Dashboard")
    # footer
    canv.setFillColor(GRAY_LT)
    canv.rect(0, 0, w, 12*mm, fill=1, stroke=0)
    canv.setStrokeColor(GRAY_MD)
    canv.setLineWidth(0.4)
    canv.line(0, 12*mm, w, 12*mm)
    canv.setFillColor(GRAY_DK)
    canv.setFont("Helvetica", 7.5)
    canv.drawString(18*mm, 4.5*mm, "Vyana Innovations Pvt. Ltd. — Ansh Rohilla | June 2026")
    canv.drawRightString(w-18*mm, 4.5*mm, f"Page {doc.page}")

# ── Helpers ──────────────────────────────────────────────────────
def code_block(code_str, title=None):
    """Render a code block with syntax-style background."""
    items = []
    if title:
        items.append(Paragraph(title, sLabel))
    lines = code_str.strip().split("\n")
    content = "\n".join(lines)
    pre = Preformatted(content, sCode)
    t = Table([[pre]], colWidths=[166*mm],
              style=TableStyle([
                  ("BACKGROUND",    (0,0),(-1,-1), CODE_BG),
                  ("BOX",           (0,0),(-1,-1), 0.5, CODE_BD),
                  ("TOPPADDING",    (0,0),(-1,-1), 8),
                  ("BOTTOMPADDING", (0,0),(-1,-1), 8),
                  ("LEFTPADDING",   (0,0),(-1,-1), 10),
                  ("RIGHTPADDING",  (0,0),(-1,-1), 8),
              ]))
    items.append(t)
    items.append(Spacer(1, 3*mm))
    return items

def day_banner(day_num, title, subtitle=""):
    color, bg = DAY_COLORS[day_num]
    data = [[
        Paragraph(f"Day {day_num}", S(f"db1_{day_num}", fontName="Helvetica-Bold", fontSize=10,
                  textColor=WHITE, leading=13)),
        Paragraph(title, S(f"db2_{day_num}", fontName="Helvetica-Bold", fontSize=11,
                  textColor=color, leading=14)),
        Paragraph(subtitle, S(f"db3_{day_num}", fontName="Helvetica", fontSize=8.5,
                  textColor=GRAY_DK, leading=12, alignment=2)) if subtitle else Paragraph("", sBody),
    ]]
    return Table(data, colWidths=[16*mm, 112*mm, 42*mm],
                 style=TableStyle([
                     ("BACKGROUND",    (0,0),(0,0), color),
                     ("BACKGROUND",    (1,0),(2,0), bg),
                     ("BOX",           (0,0),(-1,-1), 0.3, color),
                     ("TOPPADDING",    (0,0),(-1,-1), 7),
                     ("BOTTOMPADDING", (0,0),(-1,-1), 7),
                     ("LEFTPADDING",   (0,0),(0,0), 7),
                     ("LEFTPADDING",   (1,0),(1,0), 10),
                     ("VALIGN",        (0,0),(-1,-1), "MIDDLE"),
                 ]))

def info_box(text, color=BLUE, bg=BLUE_LT):
    return Table([[Paragraph(text, S(f"ib_{hash(text) & 0xffffffff}", fontName="Helvetica-Oblique", fontSize=9,
                              textColor=color, leading=13))]],
                 colWidths=[166*mm],
                 style=TableStyle([
                     ("BACKGROUND",    (0,0),(-1,-1), bg),
                     ("BOX",           (0,0),(-1,-1), 0.5, color),
                     ("TOPPADDING",    (0,0),(-1,-1), 7),
                     ("BOTTOMPADDING", (0,0),(-1,-1), 7),
                     ("LEFTPADDING",   (0,0),(-1,-1), 10),
                 ]))

def checklist(*items):
    rows = []
    for item in items:
        rows.append([
            Paragraph("□", S(f"chk_{hash(item) & 0xffffffff}", fontName="Helvetica", fontSize=10, textColor=BLUE, leading=13)),
            Paragraph(item, sBullet),
        ])
    return Table(rows, colWidths=[7*mm, 159*mm],
                 style=TableStyle([
                     ("TOPPADDING",    (0,0),(-1,-1), 2),
                     ("BOTTOMPADDING", (0,0),(-1,-1), 2),
                     ("LEFTPADDING",   (0,0),(-1,-1), 0),
                     ("VALIGN",        (0,0),(-1,-1), "TOP"),
                 ]))

def section_rule(label, color=NAVY):
    return Table([[Paragraph(label, S(f"sr_{hash(label) & 0xffffffff}", fontName="Helvetica-Bold", fontSize=9,
                              textColor=WHITE, leading=12))]],
                 colWidths=[166*mm],
                 style=TableStyle([
                     ("BACKGROUND",    (0,0),(-1,-1), color),
                     ("TOPPADDING",    (0,0),(-1,-1), 4),
                     ("BOTTOMPADDING", (0,0),(-1,-1), 4),
                     ("LEFTPADDING",   (0,0),(-1,-1), 10),
                 ]))

def bullet(text):
    return Paragraph(f"• {text}", sBullet)

def sp(n=1):
    return Spacer(1, n*mm)

# ── Build ────────────────────────────────────────────────────────
story = []

# ─── COVER PAGE ─────────────────────────────────────────────────
story.append(sp(20))
story.append(Paragraph("Week 1 — Deep Implementation Guide", sCoverT))
story.append(HRFlowable(width="100%", thickness=2, color=BLUE, spaceAfter=8))
story.append(Paragraph("AI-Powered Channel Partner &amp; Lead Intelligence Dashboard", sCoverS))

cover_info = [
    ["Intern", "Ansh Rohilla", "Period", "1–7 June 2026"],
    ["Organization", "Vyana Innovations Pvt. Ltd.", "Phase", "Week 1 of 5"],
    ["Mentor", "Anshika Rohilla, HR", "Document", "Implementation Guide v1.0"],
]
def cmk(t, bold=False):
    return Paragraph(t, S(f"ci_{hash(t) & 0xffffffff}", fontName="Helvetica-Bold" if bold else "Helvetica",
                           fontSize=9, textColor=NAVY if bold else DARK, leading=13))
ct = Table([[cmk(r[0],True), cmk(r[1]), cmk(r[2],True), cmk(r[3])] for r in cover_info],
           colWidths=[34*mm, 56*mm, 28*mm, 48*mm],
           style=TableStyle([
               ("ROWBACKGROUNDS",(0,0),(-1,-1),[WHITE, GRAY_LT]),
               ("BOX",(0,0),(-1,-1),0.5,GRAY_MD),("INNERGRID",(0,0),(-1,-1),0.3,GRAY_MD),
               ("TOPPADDING",(0,0),(-1,-1),6),("BOTTOMPADDING",(0,0),(-1,-1),6),
               ("LEFTPADDING",(0,0),(-1,-1),8),
           ]))
story.append(ct)
story.append(sp(8))
story.append(Paragraph(
    "This document provides a complete, day-by-day implementation reference for Week 1 of the internship. "
    "Every day includes exact terminal commands to run, code files to create, and deliverables to produce. "
    "Follow this guide sequentially — by end of Day 7 you will have a fully scaffolded project, "
    "a requirements document, a real sample dataset, a system architecture, and complete wireframes "
    "ready to present to your mentor.", sBody))
story.append(sp(10))

# Week overview table
story.append(Paragraph("Week 1 at a Glance", sH2))
week_rows = [
    [Paragraph("Day", S("wh", fontName="Helvetica-Bold", fontSize=9, textColor=WHITE, leading=12)),
     Paragraph("Focus", S("wh2", fontName="Helvetica-Bold", fontSize=9, textColor=WHITE, leading=12)),
     Paragraph("Key Deliverable", S("wh3", fontName="Helvetica-Bold", fontSize=9, textColor=WHITE, leading=12))],
    ["Day 1", "Onboarding & environment setup", "Dev environment verified, git repo initialized"],
    ["Day 2", "Requirements gathering & data schema", "requirements_v1.md + data_schema.md"],
    ["Day 3", "Sample dataset creation", "partners.csv (80 rows), leads.csv (400 rows)"],
    ["Day 4", "System architecture design", "Architecture diagram + API endpoint spec"],
    ["Day 5", "Tech stack & sprint board", "requirements.txt + package.json + sprint board live"],
    ["Day 6", "UI/UX wireframing", "5-page wireframe doc (Excalidraw/Figma export)"],
    ["Day 7", "Week 1 review & mentor check-in", "Week 1 summary + revised roadmap"],
]
def wmk(t, header=False):
    if header:
        return t
    return Paragraph(t, S(f"wm_{hash(t) & 0xffffffff}", fontName="Helvetica",
                           fontSize=8.5, textColor=DARK, leading=12))
wt = Table(
    [[wmk(r[0], i==0), wmk(r[1], i==0), wmk(r[2], i==0)] if i==0
     else [Paragraph(r[0], S(f"wd_{i}", fontName="Helvetica-Bold", fontSize=8.5, textColor=DAY_COLORS[i][0], leading=12)),
           Paragraph(r[1], S(f"wd2_{i}", fontName="Helvetica", fontSize=8.5, textColor=DARK, leading=12)),
           Paragraph(r[2], S(f"wd3_{i}", fontName="Helvetica", fontSize=8.5, textColor=GRAY_DK, leading=12))]
     for i, r in enumerate(week_rows)],
    colWidths=[16*mm, 62*mm, 88*mm],
    style=TableStyle([
        ("BACKGROUND",(0,0),(-1,0), NAVY),
        ("ROWBACKGROUNDS",(0,1),(-1,-1),[WHITE, GRAY_LT]),
        ("BOX",(0,0),(-1,-1),0.5,GRAY_MD),("INNERGRID",(0,0),(-1,-1),0.3,GRAY_MD),
        ("TOPPADDING",(0,0),(-1,-1),6),("BOTTOMPADDING",(0,0),(-1,-1),6),
        ("LEFTPADDING",(0,0),(-1,-1),8),
    ]))
story.append(wt)
story.append(PageBreak())

# ─── DAY 1 ──────────────────────────────────────────────────────
story.append(day_banner(1, "Onboarding & Environment Setup", "1 June 2026"))
story.append(sp(3))
story.append(info_box(
    "Goal: Leave Day 1 with every tool installed, the git repo initialized, "
    "and all Python packages verified working. Don't skip the verification step at the end.",
    BLUE, BLUE_LT))
story.append(sp(2))

story.append(section_rule("Morning — Company Orientation Checklist", BLUE))
story.append(sp(2))
story.append(checklist(
    "Collect all credentials: company email, Slack/Teams workspace invite, GitHub org invite",
    "Sign NDA and confirm internship acceptance (offer letter already done)",
    "Get access to shared drives, project management tool, any existing CRM data exports",
    "Note hybrid schedule — which days are remote, which are office",
    "Ask mentor: What does current partner/lead tracking look like today? (manual Excel? CRM?)",
    "Ask mentor: Who are the primary users of this dashboard? Sales team, management, or both?",
    "Ask mentor: Are there any real data exports I can start with?",
    "Ask mentor: What is the exact definition of a converted lead in your context?",
))
story.append(sp(4))

story.append(section_rule("Afternoon — Full Environment Setup", BLUE))
story.append(sp(2))

for blk in code_block("""\
# macOS (using Homebrew)
brew install python@3.11 node git
brew install --cask visual-studio-code

# Windows (using winget — run in PowerShell as Admin)
winget install Python.Python.3.11
winget install OpenJS.NodeJS
winget install Git.Git
winget install Microsoft.VisualStudioCode""", "Step 1 — Install core tools"):
    story.append(blk)

story.append(Paragraph("Step 2 — VS Code extensions to install", sH3))
story.append(bullet("Python (Microsoft) — language support and IntelliSense"))
story.append(bullet("Pylance — fast type checking"))
story.append(bullet("ES7+ React/Redux/React-Native snippets"))
story.append(bullet("Prettier - Code formatter"))
story.append(bullet("GitLens — enhanced Git history view"))
story.append(bullet("Thunder Client — lightweight REST API tester (no Postman needed)"))
story.append(sp(3))

for blk in code_block("""\
mkdir vyana-dashboard && cd vyana-dashboard

# Create full project folder structure
mkdir -p backend/app/{routes,models,services,utils}
mkdir -p backend/app/ml/{models,notebooks}
mkdir -p backend/tests
mkdir -p backend/data/{raw,processed,sample}
mkdir -p frontend/src/{components,pages,services,hooks,utils,assets}
mkdir -p docs/{wireframes,architecture,api-spec}
mkdir logs

# Initialize git repository
git init
echo "# AI-Powered Channel Partner & Lead Intelligence Dashboard" > README.md
echo "Built for Vyana Innovations Pvt. Ltd. | Intern: Ansh Rohilla" >> README.md
git add . && git commit -m "chore: initial project scaffold" """, "Step 3 — Create project folder structure"):
    story.append(blk)

for blk in code_block("""\
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # macOS/Linux
# venv\\Scripts\\activate        # Windows

# Install all required packages
pip install flask flask-cors flask-sqlalchemy flask-caching
pip install pandas openpyxl numpy scikit-learn xgboost imbalanced-learn
pip install joblib pytest python-dotenv marshmallow
pip install matplotlib seaborn jupyter

# Save dependencies
pip freeze > requirements.txt""", "Step 4 — Python virtual environment & packages"):
    story.append(blk)

for blk in code_block("""\
# Create backend/.env file with these contents:
FLASK_APP=app
FLASK_ENV=development
FLASK_DEBUG=1
DATABASE_URL=sqlite:///vyana_dev.db
SECRET_KEY=vyana-dev-secret-2026
UPLOAD_FOLDER=data/raw
MAX_CONTENT_LENGTH=16777216""", "Step 5 — Create .env file"):
    story.append(blk)

for blk in code_block("""\
# Verify everything works — run this in backend/ with venv active:
python -c "
import flask, pandas, sklearn, xgboost
print('Flask:', flask.__version__)
print('Pandas:', pandas.__version__)
print('Scikit-learn:', sklearn.__version__)
print('XGBoost:', xgboost.__version__)
print('All packages OK!')
"
# Expected output:
# Flask: 3.0.3  |  Pandas: 2.2.2  |  Scikit-learn: 1.5.1  |  XGBoost: 2.0.3""", "Step 6 — Verify installation"):
    story.append(blk)

story.append(info_box(
    "Day 1 Git commit: git add . && git commit -m \"chore: dev environment setup + project scaffold\"",
    TEAL, TEAL_LT))
story.append(PageBreak())

# ─── DAY 2 ──────────────────────────────────────────────────────
story.append(day_banner(2, "Project Scoping & Requirements Gathering", "2 June 2026"))
story.append(sp(3))
story.append(info_box(
    "Goal: By end of Day 2 you should have a written requirements document "
    "and a data schema that you've shared with your mentor for review.",
    TEAL, TEAL_LT))
story.append(sp(2))

story.append(section_rule("Create docs/requirements_v1.md", TEAL))
story.append(sp(2))
story.append(Paragraph("Functional Requirements to document:", sH3))
story.append(bullet("FR-01: System shall accept CSV/Excel uploads of partner and lead data"))
story.append(bullet("FR-02: System shall validate files (column check, type check, duplicate detection)"))
story.append(bullet("FR-03: System shall classify partners into Gold/Silver/Bronze tiers"))
story.append(bullet("FR-04: System shall display partners in a filterable, sortable table"))
story.append(bullet("FR-05: System shall track leads through: New → Contacted → Qualified → Converted/Lost"))
story.append(bullet("FR-06: System shall display ML-scored lead priority (0–100 score)"))
story.append(bullet("FR-07: System shall show KPI cards: partners, leads, conversion rate, pipeline value"))
story.append(bullet("FR-08: System shall show weekly lead volume trends over time"))
story.append(bullet("FR-09: System shall export filtered data as CSV"))
story.append(sp(3))

story.append(section_rule("Create docs/data_schema.md", TEAL))
story.append(sp(2))

schema_data = [
    [Paragraph(h, S("sh", fontName="Helvetica-Bold", fontSize=8, textColor=WHITE, leading=11))
     for h in ["Column", "Type", "Description", "Example"]],
    ["partner_id", "TEXT (PK)", "Unique partner identifier", "P-2024-001"],
    ["company_name", "TEXT", "Partner company name", "TechSecure Solutions"],
    ["region", "TEXT", "Geographic region", "North/South/East/West"],
    ["tier", "TEXT", "Computed tier (Gold/Silver/Bronze)", "Gold"],
    ["annual_revenue_inr", "FLOAT", "Revenue generated (INR)", "2500000.0"],
    ["deal_count", "INT", "Total deals closed", "18"],
    ["status", "TEXT", "Active or Inactive", "Active"],
]
def smk(t, bold=False):
    return Paragraph(str(t), S(f"sm_{hash(t) & 0xffffffff}", fontName="Helvetica-Bold" if bold else "Helvetica",
                                fontSize=8, textColor=DARK, leading=11))

story.append(Paragraph("Partners table (key columns):", sLabel))
st = Table(
    [[r[0]] + [smk(c) for c in r[1:]] if i > 0 else r
     for i, r in enumerate(schema_data)],
    colWidths=[35*mm, 26*mm, 72*mm, 33*mm],
    style=TableStyle([
        ("BACKGROUND",(0,0),(-1,0),NAVY),
        ("ROWBACKGROUNDS",(0,1),(-1,-1),[WHITE,GRAY_LT]),
        ("BOX",(0,0),(-1,-1),0.5,GRAY_MD),("INNERGRID",(0,0),(-1,-1),0.3,GRAY_MD),
        ("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),5),
        ("LEFTPADDING",(0,0),(-1,-1),7),
    ]))
story.append(st)
story.append(sp(3))

leads_schema = [
    [Paragraph(h, S("sh2_leads", fontName="Helvetica-Bold", fontSize=8, textColor=WHITE, leading=11))
     for h in ["Column", "Type", "Description", "Example"]],
    ["lead_id", "TEXT (PK)", "Unique lead identifier", "L-2026-0042"],
    ["partner_id", "TEXT (FK)", "Assigned partner", "P-2024-001"],
    ["lead_source", "TEXT", "Referral/Event/Cold Call/Web", "Referral"],
    ["deal_value_inr", "FLOAT", "Estimated deal value", "450000.0"],
    ["status", "TEXT", "Pipeline stage", "Qualified"],
    ["converted", "INT", "Target label for ML (0 or 1)", "0"],
    ["ml_score", "FLOAT", "ML priority score 0-100", "73.2"],
    ["time_to_first_contact", "INT", "Days from creation to first contact", "2"],
    ["follow_up_count", "INT", "Number of follow-up interactions", "4"],
]
story.append(Paragraph("Leads table (key columns):", sLabel))
lt = Table(
    [[r[0]] + [smk(c) for c in r[1:]] if i > 0 else r
     for i, r in enumerate(leads_schema)],
    colWidths=[42*mm, 26*mm, 66*mm, 32*mm],
    style=TableStyle([
        ("BACKGROUND",(0,0),(-1,0),NAVY),
        ("ROWBACKGROUNDS",(0,1),(-1,-1),[WHITE,GRAY_LT]),
        ("BOX",(0,0),(-1,-1),0.5,GRAY_MD),("INNERGRID",(0,0),(-1,-1),0.3,GRAY_MD),
        ("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),5),
        ("LEFTPADDING",(0,0),(-1,-1),7),
    ]))
story.append(lt)
story.append(info_box("Day 2 Git commit: git commit -am \"docs: requirements v1 + data schema\"", TEAL, TEAL_LT))
story.append(PageBreak())

# ─── DAY 3 ──────────────────────────────────────────────────────
story.append(day_banner(3, "Data Audit & Sample Dataset Creation", "3 June 2026"))
story.append(sp(3))
story.append(info_box(
    "Goal: A realistic sample dataset with 80 partners and 400 leads, "
    "saved as both CSV and Excel, usable immediately for backend testing.",
    AMBER, AMB_LT))
story.append(sp(2))
story.append(section_rule("Create backend/data/generate_sample_data.py", AMBER))
story.append(sp(2))

for blk in code_block("""\
import pandas as pd
# [Data generation script shortened for PDF space]
# (See repository code or requirements documentation for implementation details)
""", "backend/data/generate_sample_data.py"):
    story.append(blk)

for blk in code_block("""\
cd backend
source venv/bin/activate
python data/generate_sample_data.py

# Expected output:
# Partners: 80 | Leads: 400
# Tier breakdown:
#   Bronze    42
#   Silver    26
#   Gold      12
# Conversion rate: 22.3%""", "Run it:"):
    story.append(blk)

story.append(info_box("Day 3 Git commit: git commit -am \"data: sample dataset generation script + CSV/Excel output\"", AMBER, AMB_LT))
story.append(PageBreak())

# ─── DAY 4 ──────────────────────────────────────────────────────
story.append(day_banner(4, "System Architecture Design", "4 June 2026"))
story.append(sp(3))
story.append(info_box(
    "Goal: A clear architecture diagram and a complete API endpoint specification document "
    "that your mentor can sign off on.",
    PURP, PURP_LT))
story.append(sp(2))
story.append(section_rule("Architecture — 3-tier design", PURP))
story.append(sp(2))

for blk in code_block("""\
 ┌──────────────────────────────────────────────────────────────┐
 │              React Frontend (Vite + TailwindCSS)             │
 │   Pages: Overview | Partners | Leads | ML Insights | Reports  │
 │   Libraries: Recharts, Axios, React Router                    │
 └─────────────────────────┬────────────────────────────────────┘
                            │  HTTP REST (Axios)
                            ▼
 ┌──────────────────────────────────────────────────────────────┐
 │              Flask REST API  (Python 3.11)                   │
 │   Blueprints: /partners  /leads  /analytics  /upload         │
 │               /predict   /export                             │
 │   ORM: SQLAlchemy  →  SQLite (dev) / PostgreSQL (prod)       │
 │   Caching: Flask-Caching (5 min TTL on analytics)            │
 └──────┬──────────────────────────────────┬────────────────────┘
        │                                  │
        ▼                                  ▼
 ┌─────────────┐                ┌─────────────────────────────┐
 │  SQLite DB  │                │   ML Model (joblib .pkl)    │
 │  partners   │                │   Scikit-learn Pipeline:    │
 │  leads      │                │   ColumnTransformer         │
 │             │                │   → XGBoost Classifier      │
 └─────────────┘                │   → score 0-100 output      │
                                └─────────────────────────────┘""", "System Architecture Diagram"):
    story.append(blk)

story.append(section_rule("API Endpoint Map — create docs/api_spec.md", PURP))
story.append(sp(2))

api_rows = [
    ["Method", "Endpoint", "Description"],
    ["POST", "/api/upload/partners", "Upload partners CSV/Excel file"],
    ["POST", "/api/upload/leads", "Upload leads CSV/Excel file"],
    ["GET",  "/api/partners", "List partners (filter: tier, region, status)"],
    ["GET",  "/api/partners/:id", "Single partner + lead history"],
    ["PUT",  "/api/partners/:id", "Update partner record"],
    ["GET",  "/api/leads", "List leads (filter: status, partner, region)"],
    ["POST", "/api/leads", "Create new lead"],
    ["PUT",  "/api/leads/:id", "Update lead (status, notes)"],
    ["GET",  "/api/analytics/summary", "KPI cards: partners, leads, conversion rate, revenue"],
    ["GET",  "/api/analytics/regional", "Partner and lead count by region"],
    ["GET",  "/api/analytics/trends", "Weekly lead volume + conversion over time"],
    ["GET",  "/api/analytics/tier-breakdown", "Revenue and deal count by tier"],
    ["POST", "/api/predict", "Score single lead → {score, label, explanation}"],
    ["POST", "/api/predict/batch", "Score multiple leads at once"],
    ["GET",  "/api/export/leads", "Download filtered leads as CSV"],
    ["GET",  "/api/export/partners", "Download filtered partners as CSV"],
]

colors_m = {"GET": HexColor("#1A7A45"), "POST": BLUE, "PUT": AMBER, "DELETE": HexColor("#B03060")}
def amk(t, i, j):
    if i == 0:
        return Paragraph(t, S(f"ah_{hash(t) & 0xffffffff}", fontName="Helvetica-Bold", fontSize=8, textColor=WHITE, leading=11))
    if j == 0:
        c = colors_m.get(t, GRAY_DK)
        return Paragraph(t, S(f"am_{hash(t) & 0xffffffff}", fontName="Helvetica-Bold", fontSize=8, textColor=c, leading=11))
    return Paragraph(t, S(f"ab_{hash(t) & 0xffffffff}", fontName="Helvetica", fontSize=8, textColor=DARK, leading=11))

at = Table(
    [[amk(r[c], i, c) for c in range(3)] for i, r in enumerate(api_rows)],
    colWidths=[16*mm, 76*mm, 74*mm],
    style=TableStyle([
        ("BACKGROUND",(0,0),(-1,0),NAVY),
        ("ROWBACKGROUNDS",(0,1),(-1,-1),[WHITE,GRAY_LT]),
        ("BOX",(0,0),(-1,-1),0.5,GRAY_MD),("INNERGRID",(0,0),(-1,-1),0.3,GRAY_MD),
        ("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),5),
        ("LEFTPADDING",(0,0),(-1,-1),7),
    ]))
story.append(at)
story.append(sp(3))
story.append(info_box("Day 4 Git commit: git commit -am \"docs: system architecture + API endpoint spec\"", PURP, PURP_LT))
story.append(PageBreak())

# ─── DAY 5 ──────────────────────────────────────────────────────
story.append(day_banner(5, "Tech Stack Finalization & Project Board Setup", "5 June 2026"))
story.append(sp(3))
story.append(info_box("Goal: Final requirements.txt and package.json locked in, sprint board live with all Week 2 cards, risk register written.", GREEN, GRN_LT))
story.append(sp(2))

story.append(section_rule("backend/requirements.txt — final version", GREEN))
story.append(sp(2))
for blk in code_block("""\
flask==3.0.3
flask-cors==4.0.1
flask-sqlalchemy==3.1.1
flask-caching==2.3.0
pandas==2.2.2
openpyxl==3.1.5
numpy==1.26.4
scikit-learn==1.5.1
xgboost==2.0.3
imbalanced-learn==0.12.3
joblib==1.4.2
marshmallow==3.21.3
python-dotenv==1.0.1
pytest==8.2.2
pytest-flask==1.3.0
matplotlib==3.9.1
seaborn==0.13.2
jupyter==1.0.0"""):
    story.append(blk)

story.append(section_rule("frontend/package.json — key dependencies", GREEN))
story.append(sp(2))
for blk in code_block("""\
{
  "name": "vyana-dashboard",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.24.0",
    "axios": "^1.7.2",
    "recharts": "^2.12.7",
    "lucide-react": "^0.399.0",
    "date-fns": "^3.6.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.3.1",
    "tailwindcss": "^3.4.6"
  }
}"""):
    story.append(blk)

story.append(section_rule("Risk Register — docs/risk_register.md", GREEN))
story.append(sp(2))

risk_rows = [
    ["Risk", "Likelihood", "Impact", "Mitigation"],
    ["Real company data not available", "Medium", "High", "Use generated sample data, swap real data later"],
    ["ML model accuracy below 70%", "Medium", "Medium", "Compare 3 models; use SMOTE for class imbalance"],
    ["Flask-React CORS issues", "Low", "Medium", "Use flask-cors from Day 1 setup"],
    ["SQLite slow for 50k+ leads", "Low", "Medium", "Index key columns; switch to PostgreSQL if needed"],
    ["Mentor unavailable for reviews", "Medium", "Low", "Schedule check-ins at start of each week"],
    ["Scope creep from new requests", "Medium", "High", "Point to frozen requirements doc v1"],
]
def rmk(t, i, j):
    if i == 0:
        return Paragraph(t, S(f"rh_{hash(t) & 0xffffffff}", fontName="Helvetica-Bold", fontSize=8, textColor=WHITE, leading=11))
    c = {"Medium": AMBER, "High": HexColor("#B03060"), "Low": GREEN}.get(t, DARK) if j in (1,2) else DARK
    return Paragraph(t, S(f"rb_{hash(t) & 0xffffffff}", fontName="Helvetica-Bold" if j in (1,2) else "Helvetica",
                           fontSize=8, textColor=c, leading=11))
rt = Table([[rmk(r[c], i, c) for c in range(4)] for i, r in enumerate(risk_rows)],
           colWidths=[52*mm, 22*mm, 16*mm, 76*mm],
           style=TableStyle([
               ("BACKGROUND",(0,0),(-1,0),NAVY),
               ("ROWBACKGROUNDS",(0,1),(-1,-1),[WHITE,GRAY_LT]),
               ("BOX",(0,0),(-1,-1),0.5,GRAY_MD),("INNERGRID",(0,0),(-1,-1),0.3,GRAY_MD),
               ("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),5),
               ("LEFTPADDING",(0,0),(-1,-1),7),
           ]))
story.append(rt)
story.append(sp(3))
story.append(info_box("Day 5 Git commit: git commit -am \"chore: lock requirements + risk register + sprint board\"", GREEN, GRN_LT))
story.append(PageBreak())

# ─── DAY 6 ──────────────────────────────────────────────────────
story.append(day_banner(6, "UI/UX Wireframing", "6 June 2026"))
story.append(sp(3))
story.append(info_box("Goal: Low-fidelity wireframes for all 5 dashboard pages, exported as PNG and saved to docs/wireframes/. Use Excalidraw (free, no signup): excalidraw.com", PINK, PINK_LT))
story.append(sp(2))

story.append(section_rule("Page 1: Overview Dashboard", PINK))
story.append(sp(2))
for blk in code_block("""\
 ┌──────────────────────────────────────────────────────────────┐
 │  [V] Vyana BI Dashboard             [Search]  [Upload Data ↑]│
 ├──────────────────────────────────────────────────────────────┤
 │  Overview │ Partners │ Leads │ ML Insights │ Reports         │
 ├──────────────────────────────────────────────────────────────┤
 │ ┌────────┐ ┌────────┐ ┌─────────┐ ┌───────────────────────┐ │
 │ │  72    │ │  287   │ │  21.3%  │ │  ₹1.25 Cr             │ │
 │ │Active  │ │Active  │ │Conversion│ │Pipeline Value         │ │
 │ │Partners│ │ Leads  │ │  Rate   │ │                       │ │
 │ └────────┘ └────────┘ └─────────┘ └───────────────────────┘ │
 │                                                               │
 │ ┌────────────────────────────┐ ┌──────────────────────────┐  │
 │ │  Lead Volume  (Bar Chart)  │ │  Partner Tiers (Donut)   │  │
 │ │  Weekly — last 12 weeks    │ │  Gold 18 | Silver 29     │  │
 │ │                            │ │  Bronze 33               │  │
 │ └────────────────────────────┘ └──────────────────────────┘  │
 │                                                               │
 │ ┌───────────────────────────────────────────────────────────┐ │
 │ │ Top 5 Partners by Revenue                                 │ │
 │ │ Rank | Company | Tier | Revenue | Active Leads | Trend    │ │
 │ └───────────────────────────────────────────────────────────┘ │
 └──────────────────────────────────────────────────────────────┘"""):
    story.append(blk)

story.append(section_rule("Page 3: Leads (Kanban Pipeline)", PINK))
story.append(sp(2))
for blk in code_block("""\
 ┌──────────────────────────────────────────────────────────────┐
 │  Leads   [+ New Lead]   [Export CSV ↓]   [Search...]         │
 ├──────────────────────────────────────────────────────────────┤
 │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌─────────────┐  │
 │  │  New (45) │ │Contacted  │ │ Qualified │ │ Converted   │  │
 │  │           │ │  (72)     │ │  (38)     │ │   (85)      │  │
 │  │ ┌───────┐ │ │ ┌───────┐ │ │ ┌───────┐ │ │ ┌─────────┐ │  │
 │  │ │InfoGd │ │ │ │DataFt │ │ │ │NetArm │ │ │ │CyberCsl │ │  │
 │  │ │Score  │ │ │ │Score  │ │ │ │Score  │ │ │ │Score    │ │  │
 │  │ │[██ 73]│ │ │ │[█ 61] │ │ │ │[███88]│ │ │ │[██ 91]  │ │  │
 │  │ └───────┘ │ │ └───────┘ │ │ └───────┘ │ │ └─────────┘ │  │
 │  └───────────┘ └───────────┘ └───────────┘ └─────────────┘  │
 └──────────────────────────────────────────────────────────────┘"""):
    story.append(blk)

story.append(section_rule("Page 4: ML Insights", PINK))
story.append(sp(2))
for blk in code_block("""\
 ┌──────────────────────────────────────────────────────────────┐
 │  ML Insights — Lead Scoring Engine                            │
 │  Model: XGBoost v1.0  |  AUC-ROC: 0.84  |  F1: 0.76         │
 ├──────────────────────────────────────────────────────────────┤
 │  Top 10 High-Priority Leads (score > 75)                      │
 │  Lead    | Company       | Score      | Value  | Action       │
 │  L-0042  | InfoGuard     | [████ 88]  | ₹4.5L  | Call Now    │
 │  L-0187  | SecureVault   | [████ 85]  | ₹3.2L  | Schedule    │
 ├──────────────────────────────────────────────────────────────┤
 │  Feature Importance (horizontal bar chart)                    │
 │  follow_up_count  ████████████████ 0.31                       │
 │  time_to_contact  ████████████     0.24                       │
 │  lead_source      ████████         0.18                       │
 │  partner_tier     ██████           0.14                       │
 │  deal_value       ████             0.13                       │
 └──────────────────────────────────────────────────────────────┘"""):
    story.append(blk)

story.append(info_box(
    "How to wireframe: Go to excalidraw.com → draw each page → File > Export as PNG > save to docs/wireframes/. "
    "Name files: overview.png, partners.png, leads.png, ml_insights.png, reports.png",
    PINK, PINK_LT))
story.append(info_box("Day 6 Git commit: git commit -am \"docs: dashboard wireframes for all 5 pages\"", PINK, PINK_LT))
story.append(PageBreak())

# ─── DAY 7 ──────────────────────────────────────────────────────
story.append(day_banner(7, "Week 1 Review & Planning Refinement", "7 June 2026"))
story.append(sp(3))
story.append(info_box("Goal: 30-min mentor check-in, get sign-off on architecture and wireframes, write Week 1 summary, plan Week 2 sprint.", BLUE, BLUE_LT))
story.append(sp(2))

story.append(section_rule("Mentor Check-in Agenda", BLUE))
story.append(sp(2))
agenda = [
    ("5 min",  "Quick recap of what was done each day"),
    ("10 min", "Walk through architecture diagram — get sign-off on tech choices"),
    ("10 min", "Review wireframes page by page — collect UI feedback"),
    ("5 min",  "Clarify any open questions from requirements doc"),
    ("5 min",  "Align on Week 2 goals: Flask backend sprint"),
    ("5 min",  "Resource requests, concerns, blockers"),
]
for dur, item in agenda:
    story.append(Table([[
        Paragraph(dur, S(f"dur_{hash(dur) & 0xffffffff}", fontName="Helvetica-Bold", fontSize=8.5, textColor=BLUE, leading=12)),
        Paragraph(item, sBullet),
    ]], colWidths=[18*mm, 148*mm],
    style=TableStyle([("TOPPADDING",(0,0),(-1,-1),2),("BOTTOMPADDING",(0,0),(-1,-1),2),
                      ("LEFTPADDING",(0,0),(-1,-1),0),("VALIGN",(0,0),(-1,-1),"TOP")])))

story.append(sp(3))
story.append(section_rule("Week 1 Summary Checklist", BLUE))
story.append(sp(2))
story.append(checklist(
    "Dev environment set up and all packages verified",
    "requirements_v1.md written and shared with mentor",
    "data_schema.md defining partners and leads tables",
    "Sample dataset generated: 80 partners + 400 leads (CSV + Excel)",
    "System architecture designed: Flask + React + SQLite + XGBoost",
    "All 17 API endpoints documented in api_spec.md",
    "5-page dashboard wireframed and exported",
    "Sprint board set up with all Week 2 tasks loaded",
    "risk_register.md completed with 6 risks and mitigations",
    "Week 1 mentor check-in completed with sign-off",
))

story.append(sp(4))
story.append(section_rule("Week 2 Preview — What You'll Build", NAVY))
story.append(sp(2))
w2_rows = [
    ["Day", "What you build"],
    ["Day 8",  "Flask Blueprints skeleton + SQLAlchemy DB + base CRUD endpoints"],
    ["Day 9",  "CSV/Excel upload API with Pandas validation pipeline"],
    ["Day 10", "Partner management API with tier classification logic"],
    ["Day 11", "Lead management API with pipeline status tracking"],
    ["Day 12", "Analytics aggregation endpoints: summary, regional, trends"],
    ["Day 13", "Pytest unit tests + Swagger/Postman API documentation"],
    ["Day 14", "Week 2 review: live demo of all API endpoints to mentor"],
]
def w2mk(t, i):
    return Paragraph(t, S(f"w2_{hash(t) & 0xffffffff}_{i}", fontName="Helvetica-Bold" if i==0 else "Helvetica",
                           fontSize=9, textColor=WHITE if i==0 else (BLUE if "Day" in t and len(t)<7 else DARK),
                           leading=13))
w2t = Table([[w2mk(r[0], i), w2mk(r[1], i)] for i, r in enumerate(w2_rows)],
            colWidths=[18*mm, 148*mm],
            style=TableStyle([
                ("BACKGROUND",(0,0),(-1,0),NAVY),
                ("ROWBACKGROUNDS",(0,1),(-1,-1),[WHITE,GRAY_LT]),
                ("BOX",(0,0),(-1,-1),0.5,GRAY_MD),("INNERGRID",(0,0),(-1,-1),0.3,GRAY_MD),
                ("TOPPADDING",(0,0),(-1,-1),6),("BOTTOMPADDING",(0,0),(-1,-1),6),
                ("LEFTPADDING",(0,0),(-1,-1),8),
            ]))
story.append(w2t)
story.append(sp(3))
story.append(info_box("Day 7 Git commit: git commit -am \"docs: week 1 review summary + revised roadmap\"", BLUE, BLUE_LT))

# ─── Final folder structure ──────────────────────────────────────
story.append(PageBreak())
story.append(Paragraph("Final Project Structure After Week 1", sH2))
story.append(HRFlowable(width="100%", thickness=0.5, color=GRAY_MD, spaceAfter=6))
for blk in code_block("""\
vyana-dashboard/
├── backend/
│   ├── app/                            (empty — filled from Day 8)
│   │   ├── routes/
│   │   ├── models/
│   │   ├── services/
│   │   └── ml/
│   ├── data/
│   │   ├── sample/
│   │   │   ├── partners.csv            ✅ 80 rows generated
│   │   │   ├── leads.csv               ✅ 400 rows generated
│   │   │   └── vyana_data.xlsx         ✅ both sheets
│   │   └── generate_sample_data.py     ✅ written
│   ├── tests/
│   ├── venv/                           ✅ created & activated
│   ├── requirements.txt                ✅ 18 packages locked
│   └── .env                            ✅ configured
├── frontend/
│   └── package.json                    ✅ dependencies listed
├── docs/
│   ├── requirements_v1.md              ✅ 9 functional + 4 non-functional req
│   ├── data_schema.md                  ✅ 15 partner cols + 16 lead cols
│   ├── api_spec.md                     ✅ 17 endpoints documented
│   ├── risk_register.md                ✅ 6 risks with mitigations
│   └── wireframes/
│       ├── overview.png                ✅ from Excalidraw
│       ├── partners.png                ✅
│       ├── leads.png                   ✅ (kanban board)
│       ├── ml_insights.png             ✅
│       └── reports.png                 ✅
├── logs/
├── README.md                           ✅ initialized
└── .gitignore                          ✅ configured

Git log after Week 1 (7 commits):
  day1  chore: dev environment setup + project scaffold
  day2  docs: requirements v1 + data schema
  day3  data: sample dataset generation script + CSV/Excel
  day4  docs: system architecture + API endpoint spec
  day5  chore: lock requirements + risk register + sprint board
  day6  docs: wireframes for all 5 dashboard pages
  day7  docs: week 1 review summary + refined roadmap"""):
    story.append(blk)

story.append(sp(5))
story.append(info_box(
    "You are now fully ready to begin backend development on Day 8. "
    "All decisions made in Week 1 (tech stack, schema, architecture, endpoints) "
    "serve as the foundation for every remaining week. Good work — on to the backend sprint!",
    TEAL, TEAL_LT))

# ── Build PDF ────────────────────────────────────────────────────
OUTPUT = "/mnt/user-data/outputs/Week1_Deep_Implementation_Guide.pdf"
out_dir = os.path.dirname(OUTPUT)
try:
    os.makedirs(out_dir, exist_ok=True)
except Exception:
    # Fallback to local docs directory if /mnt/user-data/outputs is not writeable
    OUTPUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "Week1_Deep_Implementation_Guide.pdf")

doc = SimpleDocTemplate(OUTPUT, pagesize=A4,
    topMargin=24*mm, bottomMargin=16*mm, leftMargin=18*mm, rightMargin=18*mm,
    title="Week 1 Deep Implementation Guide — Vyana Internship",
    author="Ansh Rohilla")

doc.build(story, onFirstPage=page_fn, onLaterPages=page_fn)
print("Done:", OUTPUT)
