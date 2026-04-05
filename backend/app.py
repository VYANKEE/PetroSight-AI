from __future__ import annotations

import json
import os
from typing import Literal

try:
    from dotenv import load_dotenv
except ImportError:  # pragma: no cover
    def load_dotenv(*_args, **_kwargs):
        return False
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

try:
    from .chatbot import NvidiaChatbotClient
    from .utils import forecast_service
except ImportError:  # pragma: no cover
    from chatbot import NvidiaChatbotClient
    from utils import forecast_service

load_dotenv()

app = FastAPI(
    title="Petroleum Demand Forecast Platform",
    version="1.0.0",
    description="AI-powered petroleum demand forecasting APIs for petrol and diesel analytics.",
)

origins = os.getenv(
    "FRONTEND_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in origins if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

chat_client = NvidiaChatbotClient()


class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str = Field(min_length=1)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1)
    fuel: str | None = None
    years: int = Field(default=10, ge=1, le=20)
    conversation: list[ChatMessage] = Field(default_factory=list)


@app.get("/")
def root() -> dict:
    return {
        "service": "Petroleum Demand Forecast Platform API",
        "status": "ok",
        "docs": "/docs",
    }


@app.get("/health")
def health() -> dict:
    return {"status": "healthy"}


@app.get("/dashboard")
def dashboard(years: int = Query(default=10, ge=1, le=20)) -> dict:
    try:
        return forecast_service.get_dashboard_snapshot(years=years)
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get("/predict")
def predict(
    fuel: str = Query(..., description="petrol, diesel, or combined"),
    mode: Literal["year", "month"] = Query(default="year"),
    year: int = Query(..., ge=2024, le=2035),
    month: str | None = Query(default=None),
) -> dict:
    try:
        return forecast_service.predict_point(fuel=fuel, mode=mode, year=year, month=month)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get("/forecast_range")
def forecast_range(
    fuel: str = Query(..., description="petrol, diesel, or combined"),
    years: int = Query(default=10, ge=1, le=20),
    mode: Literal["year", "month"] = Query(default="year"),
    start_year: int | None = Query(default=None, ge=2024, le=2035),
    month: str | None = Query(default=None),
) -> dict:
    try:
        return forecast_service.get_forecast_range(
            fuel=fuel,
            years=years,
            mode=mode,
            start_year=start_year,
            month=month,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get("/history")
def history(
    fuel: str = Query(default="combined", description="petrol, diesel, or combined"),
    mode: Literal["year", "month"] = Query(default="year"),
) -> dict:
    try:
        return forecast_service.get_history(fuel=fuel, mode=mode)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/chat")
def chat(request: ChatRequest) -> dict:
    try:
        context = forecast_service.build_llm_context(fuel=request.fuel, years=request.years)
        response = chat_client.get_completion(
            message=request.message,
            context=context,
            conversation=[message.model_dump() for message in request.conversation],
        )
        return {
            "reply": response["content"],
            "provider": response["provider"],
            "model": response["model"],
            "context": context,
        }
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/chat/stream")
def chat_stream(request: ChatRequest) -> StreamingResponse:
    try:
        context = forecast_service.build_llm_context(fuel=request.fuel, years=request.years)
        conversation = [message.model_dump() for message in request.conversation]
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    def event_stream():
        try:
            for chunk in chat_client.stream_completion(
                message=request.message,
                context=context,
                conversation=conversation,
            ):
                yield f"data: {json.dumps({'token': chunk})}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as exc:  # pragma: no cover
            yield f"data: {json.dumps({'error': str(exc)})}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
