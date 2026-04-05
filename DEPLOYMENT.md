# Deployment Guide

## Recommended Setup

- Backend: Render Web Service
- Frontend: Vercel

This split works well for the current project structure:

- `backend/` is a FastAPI API
- `frontend/` is a Vite React SPA

## Git Setup

Run these commands from the repo root:

```powershell
cd C:\Users\vyank\OneDrive\Desktop\venky
git init
git add .
git commit -m "Initial petroleum forecast platform"
git branch -M main
```

Then create an empty GitHub repo and connect it:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## Backend Deploy on Render

Official docs:

- https://render.com/docs/deploy-fastapi
- https://render.com/docs/python-version

Use the repo you pushed to GitHub, then create a new Render Web Service.

Recommended settings:

- Root Directory: `backend`
- Build Command: `pip install -r requirements.txt`
- Start Command: `python -m uvicorn app:app --host 0.0.0.0 --port $PORT`
- Health Check Path: `/health`

Set these environment variables in Render:

- `PYTHON_VERSION=3.10.16`
- `NVIDIA_API_KEY=your_actual_key`
- `NVIDIA_MODEL=meta/llama-3.1-70b-instruct`
- `NVIDIA_API_BASE_URL=https://integrate.api.nvidia.com/v1`
- `NVIDIA_API_TIMEOUT=60`
- `FRONTEND_ORIGINS=https://YOUR-FRONTEND-DOMAIN.vercel.app`

After deploy, you will get a backend URL like:

```text
https://petrosight-api.onrender.com
```

## Frontend Deploy on Vercel

Official docs:

- https://vercel.com/docs/frameworks/vite

Import the same GitHub repo into Vercel.

Set:

- Framework Preset: `Vite`
- Root Directory: `frontend`

Set this environment variable in Vercel:

- `VITE_API_BASE_URL=https://YOUR-RENDER-BACKEND.onrender.com`

The included `frontend/vercel.json` handles SPA rewrites for React Router.

## Final Check

After both deploy:

1. Open frontend URL
2. Open chatbot/dashboard pages
3. Confirm backend health endpoint works:

```text
https://YOUR-RENDER-BACKEND.onrender.com/health
```
