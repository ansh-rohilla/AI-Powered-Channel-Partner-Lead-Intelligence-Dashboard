# Vyana AI - Production Deployment Guide

This guide outlines the step-by-step procedure to deploy the **AI-Powered Channel Partner & Lead Intelligence Dashboard** to a production environment. 

Since the application consists of a **React/Vite Frontend** and a **Flask Backend (with SQLite & ML models)**, the recommended approach is a decoupled architecture:
1. **Frontend Deployment**: Host on **Netlify** or **Vercel** (optimized for static SPAs, fast CDN distribution).
2. **Backend Deployment**: Host on **Render** or **Railway** (supports Python, Gunicorn execution, and persistent storage for SQLite).

---

## 🏗️ Architecture Overview

```mermaid
graph LR
    User[Browser Client] -- 1. Loaded from CDN --> Netlify[Netlify Static Frontend]
    User -- 2. HTTPS REST Requests --> Render[Render Python Backend]
    Render -- 3. Read/Write --> SQLite[(Persistent SQLite DB)]
    Render -- 4. Load Models --> ML[XGBoost Classifier]
```

---

## 🐍 1. Backend Deployment (Render.com)

Render is an excellent platform for deploying the Flask backend. Since we are using an SQLite database file and file uploads, we need to configure a **Persistent Disk** so that data is not lost when the Render service restarts or rebuilds.

### Step 1: Create a Render Web Service
1. Log in to [Render](https://render.com) and click **New > Web Service**.
2. Connect your GitHub repository.
3. Configure the following service settings:
   - **Name**: `vyana-backend`
   - **Environment**: `Python 3`
   - **Root Directory**: `backend` *(This builds only the backend folder)*
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn "app:create_app()"`
   - **Instance Type**: `Free` or `Starter`

### Step 2: Environment Variables
Add the following Environment Variables under the **Variables** tab:

| Variable | Recommended Production Value | Description |
| :--- | :--- | :--- |
| `FLASK_APP` | `app` | Tells Flask how to load the application factory. |
| `FLASK_ENV` | `production` | Enables production mode and disables debug logging. |
| `DATABASE_URL` | `sqlite:////var/data/vyana_prod.db` | Points to the SQLite database file on the persistent disk. |
| `UPLOAD_FOLDER` | `/var/data/uploads` | Stores uploaded CSV files on the persistent disk. |
| `MAX_CONTENT_LENGTH` | `16777216` | Restricts CSV uploads to a maximum of 16MB. |
| `SECRET_KEY` | `[generate-a-secure-random-32-char-string]` | Used to sign session keys and tokens securely. |

### Step 3: Add a Persistent Disk (CRITICAL)
Because SQLite databases are stored in a file, you **MUST** attach a persistent volume to prevent data loss.
1. In your Web Service settings, navigate to the **Disks** tab.
2. Click **Add Disk** and configure:
   - **Name**: `vyana-storage`
   - **Mount Path**: `/var/data`
   - **Size**: `1 GB` (More than enough for hundreds of thousands of SQLite rows and uploaded CSVs).
3. Under the hood, this mounts a persistent directory at `/var/data`. The `DATABASE_URL` and `UPLOAD_FOLDER` environment variables configured above will write directly to this disk, ensuring data survives restarts.

> [!NOTE]
> **Database Auto-Seeding**: Upon startup, the Flask backend will automatically check if the database is empty. If it is, it will auto-populate the database with the core Gold, Silver, and Bronze partners and initial leads. No manual migration or seeding command is required.

---

## ⚡ 2. Frontend Deployment (Netlify)

Netlify is the recommended choice for hosting the static React frontend due to its instant global CDN caching and built-in redirects.

### Step 1: Create a Netlify Site
1. Log in to [Netlify](https://netlify.com) and click **Add new site > Import an existing project**.
2. Connect your GitHub repository.
3. Configure the following build settings:
   - **Base Directory**: `frontend` *(This isolates the Vite project)*
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist` *(Relative to the base directory, i.e., `frontend/dist`)*

### Step 2: Environment Variables
Add the following environment variable under the **Site Configuration > Environment variables** tab in Netlify:

| Variable | Value | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `https://vyana-backend.onrender.com` | **The HTTPS URL of your deployed Render service.** (Do not include a trailing slash). |

This environment variable instructs the compiled Axios client inside [api.js](file:///Users/anshrohilla/Documents/AI-Powered%2520Channel%2520Partner%2520%26%2520Lead%2520Intelligence%2520Dashboard/frontend/src/services/api.js) to direct all API requests to the Render backend, while falling back to the local `/api` proxy when running locally.

### Step 3: SPA Routing Redirects (CRITICAL)
Since the React application uses client-side routing (`react-router-dom`), reload requests on deep routes (e.g., `/leads` or `/insights`) will return a `404 Not Found` on Netlify by default. To fix this, create a redirect rule:
1. Create a new file inside the `frontend/public/` directory named `_redirects` containing:
   ```text
   /*    /index.html   200
   ```
2. During the Vite build, this file is copied to the root of the output `dist` folder. It tells Netlify to redirect all navigation paths to `index.html` so that React Router can handle them.

---

## 🛡️ 3. Security, CORS, & Production Checklist

1. **CORS Configuration**: The Flask backend has `Flask-CORS` enabled by default. In production, requests from your Netlify domain (`https://vyana-dashboard.netlify.app`) will be accepted.
2. **HTTPS Only**: Both Render and Netlify enforce HTTPS by default. Do not downgrade connection URLs to HTTP.
3. **ML Model Preloading**: The backend is configured to preload the XGBoost and scaler models at startup. Ensure that your hosting service has at least 512MB RAM (the Render Free tier is sufficient) to load the models into memory without hitting OOM (Out Of Memory) limits.
4. **Database Backups**: If you wish to migrate to a scalable multi-node backend, simply spin up a managed PostgreSQL database (e.g., on Render or AWS RDS) and change the `DATABASE_URL` environment variable to a PostgreSQL connection string (e.g., `postgresql://user:pass@host:5432/db`). The codebase is fully compatible with PostgreSQL.
