# AI Petroleum Forecast Platform

Production-style petroleum demand forecasting platform with a FastAPI backend and a React + Vite frontend.

## Stack

- Backend: FastAPI, Pandas, NumPy, Statsmodels, Pickle, dotenv, NVIDIA API integration
- Frontend: React, Vite, TailwindCSS, Recharts, React Router, Axios, Framer Motion, GSAP

## What It Does

- Forecast petrol and diesel demand from 2024 to 2035
- Support year-wise and month-wise prediction modes
- Show forecast values with confidence intervals
- Render historical, fuel-specific, and combined forecast charts
- Export forecast data as CSV
- Provide an AI analytics chatbot for trend explanation

## Important Note

The supplied model artifacts are annual SARIMA models. Month-wise forecasts in this platform are derived from annual forecasts using calibrated month-share profiles, and the UI calls that out explicitly.

## Backend Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app:app --reload
```

## Frontend Setup

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

## Environment Variables

Backend `.env`

```env
NVIDIA_API_KEY=your_nvidia_api_key_here
NVIDIA_MODEL=meta/llama-3.1-70b-instruct
NVIDIA_API_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_API_TIMEOUT=60
FRONTEND_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Frontend `.env`

```env
VITE_API_BASE_URL=http://localhost:8000
```

## Core API Endpoints

- `GET /dashboard`
- `GET /predict`
- `GET /forecast_range`
- `GET /history`
- `POST /chat`
- `POST /chat/stream`

## Project Structure

```text
backend/
  app.py
  chatbot.py
  utils.py
  models/
  data/

frontend/
  src/
    components/
    pages/
    hooks/
    lib/
```
