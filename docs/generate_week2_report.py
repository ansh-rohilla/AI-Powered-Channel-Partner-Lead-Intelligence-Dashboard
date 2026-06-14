import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.lib.colors import HexColor, white
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak, KeepTogether
)

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
GREEN   = HexColor("#1A7A45")
GRN_LT  = HexColor("#E6F5ED")
PINK    = HexColor("#B03060")
PINK_LT = HexColor("#FCE8F0")
PURP    = HexColor("#4A42A8")
PURP_LT = HexColor("#EEEDF8")

# Day colors for Day 8 to 14
DAY_COLORS = {
    8: (BLUE,   BLUE_LT),
    9: (TEAL,   TEAL_LT),
    10: (AMBER,  AMB_LT),
    11: (PURP,   PURP_LT),
    12: (GREEN,  GRN_LT),
    13: (PINK,   PINK_LT),
    14: (BLUE,   BLUE_LT),
}

# ── Styles ──────────────────────────────────────────────────────
def S(name, **kw):
    return ParagraphStyle(name, **kw)

sH1     = S("H1", fontName="Helvetica-Bold",  fontSize=22, textColor=NAVY,    leading=28, alignment=TA_CENTER, spaceAfter=4)
sH2     = S("H2", fontName="Helvetica-Bold",  fontSize=12, textColor=NAVY,    leading=16, spaceBefore=8, spaceAfter=4)
sH3     = S("H3", fontName="Helvetica-Bold",  fontSize=10, textColor=DARK,  leading=14, spaceBefore=6, spaceAfter=3)
sBody   = S("Bd", fontName="Helvetica",       fontSize=9.2, textColor=DARK,   leading=13, spaceAfter=4)
sBullet = S("Bl", fontName="Helvetica",       fontSize=9,   textColor=DARK,   leading=13, leftIndent=12, spaceAfter=2)
sLabel  = S("Lb", fontName="Helvetica-Bold",  fontSize=7.5, textColor=GRAY_DK,leading=10, spaceAfter=2)
sSub    = S("Su", fontName="Helvetica-Bold",  fontSize=12,  textColor=BLUE,   leading=16, alignment=TA_CENTER, spaceAfter=14)
sCoverT = S("CT", fontName="Helvetica-Bold",  fontSize=24,  textColor=NAVY,   leading=30, alignment=TA_CENTER, spaceAfter=6)

# ── Page templates ────────────────────────────────────────────────
def page_fn_first(canv, doc):
    # Cover page has no header/footer
    pass

def page_fn_later(canv, doc):
    # Footers/trailers removed
    pass

# ── Helpers ──────────────────────────────────────────────────────
def day_banner(day_num, title, subtitle=""):
    color, bg = DAY_COLORS[day_num]
    data = [[
        Paragraph(f"Day {day_num}", S(f"db1_{day_num}", fontName="Helvetica-Bold", fontSize=10,
                  textColor=WHITE, leading=13)),
        Paragraph(title, S(f"db2_{day_num}", fontName="Helvetica-Bold", fontSize=11,
                  textColor=color, leading=14)),
        Paragraph(subtitle, S(f"db3_{day_num}", fontName="Helvetica", fontSize=8.5,
                  textColor=GRAY_DK, leading=12, alignment=TA_RIGHT)) if subtitle else Paragraph("", sBody),
    ]]
    return Table(data, colWidths=[16*mm, 108*mm, 42*mm],
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

def bullet(text):
    return Paragraph(f"• {text}", sBullet)

def sp(n=1):
    return Spacer(1, n*mm)

# ── Build Flow ──────────────────────────────────────────────────
story = []

# ─── COVER PAGE ─────────────────────────────────────────────────
story.append(sp(4))
story.append(Paragraph("Internship Weekly Progress Report", sCoverT))
story.append(Paragraph("Week 2", sSub))

cover_info = [
    ["Intern Name", "Ansh Rohilla", "Enrollment No.", "ADT24SOCB0169"],
    ["Programme", "B.Tech CSE (AI & Edge<br/>Computing)", "Year / Sem", "2nd Year, Sem 4"],
    ["University", "MIT-ADT University, Pune", "CGPA", "9.87"],
    ["Organization", "Vyana Innovations Pvt.<br/>Ltd.", "Department", "Strategy &<br/>Technology"],
    ["Designation", "AI & Business Intelligence<br/>Intern", "Mode", "Remote"],
    ["Mentor", "Anshika Rohilla, HR", "Report Period", "8 June – 14 June 2026"],
    ["Project Title", "AI-Powered Channel Partner & Lead Intelligence Dashboard", "", ""],
]

def cmk(t, bold=False):
    return Paragraph(t, S(f"ci_{hash(t) & 0xffffffff}", fontName="Helvetica-Bold" if bold else "Helvetica",
                           fontSize=9, textColor=NAVY if bold else DARK, leading=13))

ct_data = []
for i, r in enumerate(cover_info):
    if i == 6: # Project Title row spans 3 columns
        ct_data.append([cmk(r[0], True), cmk(r[1]), "", ""])
    else:
        ct_data.append([cmk(r[0], True), cmk(r[1]), cmk(r[2], True), cmk(r[3])])

ct = Table(ct_data, colWidths=[32*mm, 51*mm, 32*mm, 51*mm],
           style=TableStyle([
               ("SPAN", (1, 6), (3, 6)),
               ("ROWBACKGROUNDS",(0,0),(-1,-1),[WHITE, GRAY_LT]),
               ("BOX",(0,0),(-1,-1),0.5,GRAY_MD),("INNERGRID",(0,0),(-1,-1),0.3,GRAY_MD),
               ("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),5),
               ("LEFTPADDING",(0,0),(-1,-1),8),
               ("VALIGN", (0,0), (-1,-1), "TOP"),
           ]))
story.append(ct)
story.append(sp(6))

# Description block in callout box
desc_text = (
    "This report documents the activities, deliverables, and learnings of Week 2 (8-14 June 2026) of "
    "the internship at Vyana Innovations Private Limited. The week was dedicated entirely to building "
    "the Flask REST API backend. This included setting up the SQLAlchemy database models, implementing the "
    "CSV/Excel data ingestion pipeline, building all partner and lead management endpoints, creating "
    "the analytics aggregation APIs, writing Pytest unit tests, and producing Postman/Swagger API "
    "documentation. All seven days were completed as planned with no blockers or delays."
)
story.append(info_box(desc_text, BLUE, BLUE_LT))
story.append(sp(6))

# Glance Table
story.append(Paragraph("Week 2 — At a Glance", sH2))
week_rows = [
    [Paragraph("Day", S("wh1", fontName="Helvetica-Bold", fontSize=9, textColor=WHITE, leading=12)),
     Paragraph("Date", S("wh2", fontName="Helvetica-Bold", fontSize=9, textColor=WHITE, leading=12)),
     Paragraph("Focus Area", S("wh3", fontName="Helvetica-Bold", fontSize=9, textColor=WHITE, leading=12)),
     Paragraph("Key Deliverable", S("wh4", fontName="Helvetica-Bold", fontSize=9, textColor=WHITE, leading=12))],
    ["Day 8", "8 Jun", "Flask Architecture & DB Setup", "Flask blueprints skeleton + SQLAlchemy models"],
    ["Day 9", "9 Jun", "Ingestion Pipeline & Validation", "CSV/Excel upload API + Pandas validation"],
    ["Day 10", "10 Jun", "Partner Management APIs", "CRUD endpoints + tier classification logic"],
    ["Day 11", "11 Jun", "Lead Pipeline tracking APIs", "Kanban state transitions + lead score updates"],
    ["Day 12", "12 Jun", "Analytics Aggregation APIs", "Metrics summary, trends, and regional APIs"],
    ["Day 13", "13 Jun", "Testing & Documentation", "10 Pytest unit tests + Postman API collection"],
    ["Day 14", "14 Jun", "Mentor Review & Week 2 Close", "Sign-off received + Week 3 plan finalized"],
]

wt_data = []
for i, r in enumerate(week_rows):
    if i == 0:
        wt_data.append(r)
    else:
        wt_data.append([
            Paragraph(r[0], S(f"wd_{i}", fontName="Helvetica-Bold", fontSize=8.5, textColor=DAY_COLORS[i+7][0], leading=12)),
            Paragraph(r[1], S(f"wd1_{i}", fontName="Helvetica", fontSize=8.5, textColor=DARK, leading=12)),
            Paragraph(r[2], S(f"wd2_{i}", fontName="Helvetica-Bold", fontSize=8.5, textColor=DARK, leading=12)),
            Paragraph(r[3], S(f"wd3_{i}", fontName="Helvetica", fontSize=8.5, textColor=GRAY_DK, leading=12))
        ])

wt = Table(wt_data, colWidths=[16*mm, 16*mm, 60*mm, 74*mm],
           style=TableStyle([
               ("BACKGROUND",(0,0),(-1,0), NAVY),
               ("ROWBACKGROUNDS",(0,1),(-1,-1),[WHITE, GRAY_LT]),
               ("BOX",(0,0),(-1,-1),0.5,GRAY_MD),("INNERGRID",(0,0),(-1,-1),0.3,GRAY_MD),
               ("TOPPADDING",(0,0),(-1,-1),6),("BOTTOMPADDING",(0,0),(-1,-1),6),
               ("LEFTPADDING",(0,0),(-1,-1),8),
               ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
           ]))
story.append(wt)
story.append(PageBreak())

# ─── DAILY PAGES (Pages 3 - 9) ───────────────────────────────────

def append_daily_page(day_num, title, date_str, tasks, deliverables, reflection):
    # Day banner
    story.append(day_banner(day_num, title, date_str))
    story.append(sp(4))
    
    # Tasks
    story.append(Paragraph("TASKS COMPLETED", S(f"tc_lbl_{day_num}", fontName="Helvetica-Bold", fontSize=9.5, textColor=NAVY, leading=13)))
    story.append(sp(2))
    for t in tasks:
        story.append(bullet(t))
    story.append(sp(4))
    
    # Deliverables
    story.append(Paragraph("DELIVERABLES", S(f"del_lbl_{day_num}", fontName="Helvetica-Bold", fontSize=9.5, textColor=NAVY, leading=13)))
    story.append(sp(2))
    chk_rows = []
    for d in deliverables:
        chk_rows.append([
            Paragraph("✓", S(f"chk_v_{hash(d) & 0xffffffff}", fontName="Helvetica-Bold", fontSize=10, textColor=GREEN, leading=13)),
            Paragraph(d, sBullet),
        ])
    del_table = Table(chk_rows, colWidths=[7*mm, 159*mm],
                      style=TableStyle([
                          ("TOPPADDING",    (0,0),(-1,-1), 2),
                          ("BOTTOMPADDING", (0,0),(-1,-1), 2),
                          ("LEFTPADDING",   (0,0),(-1,-1), 0),
                          ("VALIGN",        (0,0),(-1,-1), "TOP"),
                      ]))
    story.append(del_table)
    story.append(sp(4))
    
    # Reflection
    story.append(Paragraph("REFLECTION & KEY LEARNINGS", S(f"ref_lbl_{day_num}", fontName="Helvetica-Bold", fontSize=9.5, textColor=NAVY, leading=13)))
    story.append(sp(2))
    story.append(info_box(f'"{reflection}"', DAY_COLORS[day_num][0], DAY_COLORS[day_num][1]))
    story.append(PageBreak())

# Day 8
append_daily_page(
    8, "Flask Architecture & DB Setup", "Monday, 8 June 2026",
    [
        "Attended Sprint 2 kickoff meeting with the mentor to align on the 17 REST API endpoint specifications",
        "Initialized the Flask application factory pattern (create_app) and structured app configurations in app/config.py",
        "Defined SQLAlchemy database schemas and relationships for the Partner and Lead models",
        "Set up blueprint routing, registering routes for /partners, /leads, /analytics, and /upload modules",
        "Configured database tables auto-creation logic (db.create_all()) within the application context"
    ],
    [
        "Flask application factory structure and database initialization setup",
        "SQLAlchemy schemas for Partner and Lead models with column definitions and constraints",
        "Blueprint routing skeleton with all base route handlers mapped"
    ],
    "Setting up the database models and application factory was an important architectural step. Designing relationships in SQLAlchemy is always satisfying, especially defining how leads cascade or reference their partners. Registering blueprints right away keeps the code modular from day one and prepares us for team growth."
)

# Day 9
append_daily_page(
    9, "Ingestion Pipeline & Validation", "Tuesday, 9 June 2026",
    [
        "Built file upload endpoints (/api/upload/partners and /api/upload/leads) to process multipart CSV/Excel files",
        "Integrated Pandas for raw data parsing, null value treatment, and date formatting",
        "Coded data validation schemas using Marshmallow to enforce field types, lengths, and email formats",
        "Implemented database transaction controls to roll back commits if CSV validation failures occur",
        "Handled custom error responses for invalid files, empty uploads, and duplicate headers"
    ],
    [
        "CSV/Excel upload REST endpoints for partners and leads data",
        "Pandas parsing and data cleaning pipeline functions",
        "Marshmallow request schemas for validation"
    ],
    "Data ingestion is often where real-world applications fail, so handling edge cases was my main focus. I learned that sanitizing user uploads—especially dates and emails—requires strict validation to avoid database corruption down the line. Seeing the Pandas-to-SQLAlchemy transition work cleanly was a great milestone."
)

# Day 10
append_daily_page(
    10, "Partner Management APIs", "Wednesday, 10 June 2026",
    [
        "Implemented GET /api/partners route to retrieve channel partners with dynamic query parameters",
        "Coded search indexing (by company name) and filter variables (by tier, region, and status)",
        "Built database sorting (by revenue, deal count, name) and server-side pagination wrapper",
        "Implemented GET /api/partners/<id> route returning details and chronological lead activity logs",
        "Created POST, PUT, and DELETE partner management endpoints"
    ],
    [
        "Complete Partner CRUD endpoints in backend/app/routes/partners.py",
        "Partner query filtration, sorting, and pagination logic",
        "Active partner database seeder script"
    ],
    "Developing the partner endpoints taught me how critical structured API design is. Fetching a partner should not just yield their name; attaching their complete lead timeline makes the UI much more interactive and useful. Optimizing query joins in SQLAlchemy keeps database latencies minimal."
)

# Day 11
append_daily_page(
    11, "Lead Pipeline tracking APIs", "Thursday, 11 June 2026",
    [
        "Implemented leads retrieval endpoints (GET /api/leads and GET /api/leads/<id>)",
        "Coded pipeline status transition handler via PUT /api/leads/<id> to support Kanban board movements",
        "Configured automatic ML score recalculation triggers on lead detail modifications",
        "Implemented partner lead assignments and reassignment matches",
        "Built lead creation (POST) and deletion (DELETE) endpoints"
    ],
    [
        "Complete Lead CRUD endpoints in backend/app/routes/leads.py",
        "Lead status transition handler (Kanban stage update route)",
        "Automatic lead scoring trigger integration"
    ],
    "Managing lead state transitions represents the core operations of the dashboard. Building the update endpoint to automatically recalculate the lead's conversion probability before writing to SQLite felt like bringing the dashboard to life. Emphasizing clean status transitions prevents invalid state changes."
)

# Day 12
append_daily_page(
    12, "Analytics Aggregation APIs", "Friday, 12 June 2026",
    [
        "Programmed aggregate endpoints: /api/analytics/summary (KPI counts: active partners, leads, conversion rates, pipeline value)",
        "Coded /api/analytics/regional returning lead/partner aggregates grouped by region",
        "Developed /api/analytics/trends to compute weekly lead velocity trends",
        "Integrated Flask-Caching (using SimpleCache) to store analytical metrics for 5 minutes, boosting speed",
        "Implemented caching invalidation triggers on lead create/update/delete requests"
    ],
    [
        "Summary, regional, and weekly trend endpoints",
        "Optimized database aggregation queries",
        "Cache management and cache-invalidation functions"
    ],
    "Writing efficient aggregation queries is essential for fast dashboards. Performing heavy calculations (like total pipeline value) directly in SQL is much faster than processing rows in Python. Adding Flask-Caching ensures subsequent dashboard reloads load in milliseconds rather than seconds."
)

# Day 13
append_daily_page(
    13, "Testing & Documentation", "Saturday, 13 June 2026",
    [
        "Authored an automated unit test suite inside backend/tests/test_endpoints.py containing 10 Pytest cases",
        "Tested payload boundaries, validation errors, and transactional rollbacks",
        "Compiled all REST API configurations into a Postman Collection JSON schema with mock requests",
        "Documented API setup, startup commands, and request formats in the project README"
    ],
    [
        "Pytest suite with 10 automated backend test cases",
        "Postman API Collection JSON configuration schema",
        "Completed REST API documentation in README.md"
    ],
    "Writing tests before the final review is a great safety net. I caught two minor validation bugs in my lead creation endpoint before they could cause issues. Having a fully documented Postman collection also makes testing endpoints manually much easier and acts as a clear reference for the frontend."
)

# Day 14
append_daily_page(
    14, "Mentor Review & Sprint Close", "Sunday, 14 June 2026",
    [
        "Conduct the Week 2 milestone progress check-in meeting with the mentor",
        "Demonstrate all 17 REST API endpoints using Postman (uploads, CRUD queries, cached analytics, error handling)",
        "Receive sign-off on API design, request-response schemas, and error shapes",
        "Structure the Week 2 progress report and planned the Week 3 sprint"
    ],
    [
        "Mentor sign-off on Flask REST API architecture",
        "Git commits pushed to the remote repository",
        "Weekly progress report compiled as PDF"
    ],
    "Demonstrating a functional API backend to the mentor was very rewarding. Seeing the upload endpoints process CSV files and populate the database instantly showed that the core engine of the project is solid. The mentor's feedback to return human-friendly error messages helped polish our error responses."
)

# ─── SUMMARY PAGES (Pages 10 - 11) ───────────────────────────────

# Page 10
story.append(Paragraph("Week 2 — Summary Report", S("w2_sum_title", fontName="Helvetica-Bold", fontSize=14, textColor=NAVY, leading=18, alignment=TA_CENTER, spaceAfter=8)))
story.append(HRFlowable(width="100%", thickness=0.8, color=GRAY_MD, spaceAfter=8))

story.append(Paragraph("1. Overview", sH2))
story.append(Paragraph(
    "Week 2 of the internship at Vyana Innovations Private Limited was focused entirely on backend engineering "
    "and REST API development. Following our architectural blueprints, we built a fully operational Flask API "
    "service, established SQLAlchemy database schemas with auto-seeding, created robust data validation pipelines, "
    "and integrated caching for heavy analytics. All activities were completed on schedule, providing a solid, "
    "tested backend foundation ready to support our machine learning and frontend dashboard sprints.", sBody))
story.append(sp(3))

story.append(Paragraph("2. Key Accomplishments", sH2))
acc_data = [
    [Paragraph("Accomplishment Area", S("ach1", fontName="Helvetica-Bold", fontSize=9, textColor=WHITE, leading=12)),
     Paragraph("Summary of Achievements", S("ach2", fontName="Helvetica-Bold", fontSize=9, textColor=WHITE, leading=12))],
    [Paragraph("<b>Development Environment</b>", sBody), Paragraph("Refactored virtual env dependencies, added Gunicorn support for Unix deployments, and structured environment variable configurations.", sBody)],
    [Paragraph("<b>Database Setup</b>", sBody), Paragraph("Initialized SQLite schemas, created SQLAlchemy ORM models (Partner, Lead), and set up auto-seeding logic triggered on application startup.", sBody)],
    [Paragraph("<b>API Development</b>", sBody), Paragraph("Coded and integrated 17 endpoints covering partner management, lead directories, regional calculations, and data syncs.", sBody)],
    [Paragraph("<b>Ingestion &amp; Validation</b>", sBody), Paragraph("Designed file ingestion routes using Pandas for data cleansing, date formatting, and Marshmallow for strict field schema validation.", sBody)],
    [Paragraph("<b>Testing &amp; Documentation</b>", sBody), Paragraph("Authored a backend unit testing suite containing 10 Pytest test cases, and compiled a Postman API collection for developer reference.", sBody)],
]
acc_table = Table(acc_data, colWidths=[46*mm, 120*mm],
                  style=TableStyle([
                      ("BACKGROUND",(0,0),(-1,0),NAVY),
                      ("ROWBACKGROUNDS",(0,1),(-1,-1),[WHITE,GRAY_LT]),
                      ("BOX",(0,0),(-1,-1),0.5,GRAY_MD),("INNERGRID",(0,0),(-1,-1),0.3,GRAY_MD),
                      ("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),5),
                      ("LEFTPADDING",(0,0),(-1,-1),7),
                      ("VALIGN", (0,0), (-1,-1), "TOP"),
                  ]))
story.append(acc_table)
story.append(sp(3))

story.append(Paragraph("3. Key Learnings &amp; Professional Development", sH2))
story.append(bullet("<b>Flask Factory Pattern</b>: Structuring applications via factory methods simplifies extension management and enables isolated route registry through blueprints."))
story.append(bullet("<b>Data Sanitation at the Edge</b>: Standardizing and validating incoming user uploads (CSV/Excel) using Marshmallow prevents database anomalies and application exceptions."))
story.append(bullet("<b>ORM Relationship Mappings</b>: Utilizing SQLAlchemy cascades and relational joins enables fast traversal of partner-lead activity timelines with optimal query performance."))
story.append(bullet("<b>Automated Test Automation</b>: Writing Pytest scripts for endpoints ensures that subsequent refactoring or deployment tasks do not introduce regressions."))

story.append(PageBreak())

# Page 11
story.append(bullet("<b>API Response Consistency</b>: Returning uniform JSON response envelopes (success, data, pagination, message) simplifies client-side Axios consumption."))
story.append(bullet("<b>Caching Invalidation</b>: Implementing cache clearance triggers on lead/partner write requests is essential to maintain data consistency on overview statistics."))
story.append(sp(3))

story.append(Paragraph("4. Deliverables Status", sH2))
del_rows = [
    ["#", "Deliverable", "Status"],
    ["1", "Database factory setup & SQLAlchemy models", "Complete"],
    ["2", "Marshmallow schemas & request validation", "Complete"],
    ["3", "CSV/Excel file upload ingestion routes", "Complete"],
    ["4", "Partner directory CRUD endpoints", "Complete"],
    ["5", "Lead pipeline management endpoints (Kanban update)", "Complete"],
    ["6", "Analytics summary, regional, and trends endpoints", "Complete"],
    ["7", "Flask-Caching query optimization integration", "Complete"],
    ["8", "Pytest suite with 10 automated unit tests", "Complete"],
    ["9", "Postman Collection REST API documentation", "Complete"],
    ["10", "Week 2 mentor review sign-off and git push", "Complete"],
]
def dsmk(t, header=False, status=False):
    if header:
        return Paragraph(t, S(f"dh_{hash(t) & 0xffffffff}", fontName="Helvetica-Bold", fontSize=8.5, textColor=WHITE, leading=12))
    c = GREEN if status else DARK
    return Paragraph(t, S(f"db_{hash(t) & 0xffffffff}", fontName="Helvetica-Bold" if status else "Helvetica", fontSize=8, textColor=c, leading=12))
    
del_table_data = []
for i, r in enumerate(del_rows):
    if i == 0:
        del_table_data.append([dsmk(c, True) for c in r])
    else:
        del_table_data.append([dsmk(r[0]), dsmk(r[1]), dsmk(r[2], False, True)])
        
dt = Table(del_table_data, colWidths=[12*mm, 124*mm, 30*mm],
           style=TableStyle([
               ("BACKGROUND",(0,0),(-1,0),NAVY),
               ("ROWBACKGROUNDS",(0,1),(-1,-1),[WHITE,GRAY_LT]),
               ("BOX",(0,0),(-1,-1),0.5,GRAY_MD),("INNERGRID",(0,0),(-1,-1),0.3,GRAY_MD),
               ("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),5),
               ("LEFTPADDING",(0,0),(-1,-1),7),
               ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
           ]))
story.append(dt)
story.append(sp(4))

story.append(Paragraph("5. Week 3 Plan", sH2))
story.append(Paragraph(
    "Week 3 (15-21 June 2026) will focus on **Phase 3: Machine Learning Model Development**. This includes performing "
    "Exploratory Data Analysis (EDA) on channel partner historical leads, designing feature engineering transformers, "
    "comparing multiple classification models (Logistic Regression, Random Forest, XGBoost), performing GridSearchCV "
    "hyperparameter tuning, exposing API inference endpoints, and drafting model performance diagnostics.", sBody))
story.append(sp(4))

story.append(Paragraph("6. Overall Reflection", sH2))
story.append(Paragraph(
    "Week 2 shifted my focus from project scoping and planning to core software engineering. Building database models, "
    "writing clean query joins, and sanitizing user inputs required meticulous attention to detail. This week reinforced "
    "that backend development is not just about writing code that works, but about designing scalable, secure, and "
    "performant APIs. I feel highly confident in our backend foundation as we pivot to the machine learning sprint in Week 3.", sBody))

# Build PDF
output_path = "docs/Week2_Weekly_Progress_Report.pdf"
os.makedirs("docs", exist_ok=True)
doc = SimpleDocTemplate(
    output_path,
    pagesize=A4,
    leftMargin=22*mm,
    rightMargin=22*mm,
    topMargin=20*mm,
    bottomMargin=20*mm
)

doc.build(story, onFirstPage=page_fn_first, onLaterPages=page_fn_later)
print(f"Generated Week 2 Report successfully at: {output_path}")
