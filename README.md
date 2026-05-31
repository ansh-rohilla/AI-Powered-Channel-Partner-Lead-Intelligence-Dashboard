# AI-Powered Channel Partner & Lead Intelligence Dashboard

Built for Vyana Innovations Pvt. Ltd. | Intern: Ansh Rohilla

This repository contains the AI-Powered Channel Partner & Lead Intelligence Dashboard, a web application designed to help sales teams and management track channel partners, score incoming leads, and gain predictive business insights.

## Project Structure

```text
vyana-dashboard/
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── services/
│   │   └── ml/
│   ├── data/
│   │   ├── sample/
│   │   │   ├── partners.csv
│   │   │   ├── leads.csv
│   │   │   └── vyana_data.xlsx
│   │   └── generate_sample_data.py
│   ├── tests/
│   ├── venv/
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── utils/
│   └── package.json
├── docs/
│   ├── requirements_v1.md
│   ├── data_schema.md
│   ├── api_spec.md
│   ├── risk_register.md
│   └── wireframes/
├── logs/
└── README.md
```

## Quick Start (Week 1 Setup)

1. Clone or navigate to the repository.
2. Initialize virtual environment in the `backend/` directory:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. Generate sample dataset:
   ```bash
   python data/generate_sample_data.py
   ```
