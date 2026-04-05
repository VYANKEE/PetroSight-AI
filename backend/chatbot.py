from __future__ import annotations

import json
import os
from typing import Iterable

try:
    import httpx
except ImportError:  # pragma: no cover
    httpx = None


class NvidiaChatbotClient:
    def __init__(self) -> None:
        self.api_key = os.getenv("NVIDIA_API_KEY")
        self.model = os.getenv("NVIDIA_MODEL", "meta/llama-3.1-70b-instruct")
        self.base_url = os.getenv("NVIDIA_API_BASE_URL", "https://integrate.api.nvidia.com/v1")
        self.timeout = float(os.getenv("NVIDIA_API_TIMEOUT", "60"))

    @property
    def is_enabled(self) -> bool:
        return bool(self.api_key and httpx is not None)

    def _system_prompt(self, context: dict) -> str:
        return (
            "You are an AI petroleum demand analyst for an industrial forecasting SaaS platform. "
            "Use the supplied India petroleum demand history and forecast context to answer clearly and concisely. "
            "Prefer evidence-backed explanations, mention notable changes like the 2020 disruption when relevant, "
            "and present numeric insights in plain English. If the user asks about monthly behavior, explicitly note "
            "that monthly values are derived from annual model outputs using a calibrated monthly share profile.\n\n"
            f"Analytics context:\n{json.dumps(context, ensure_ascii=True)}"
        )

    @staticmethod
    def _fallback_response(message: str, context: dict) -> str:
        summaries = {item["fuel"]: item for item in context.get("history_summaries", [])}
        forecasts = {item["fuel"]: item for item in context.get("forecast_summaries", [])}
        lowered = message.lower()

        if "2030" in lowered:
            parts = []
            for fuel in ("petrol", "diesel"):
                if fuel in forecasts:
                    span = forecasts[fuel]
                    growth = ((span["forecast_end_value"] - span["forecast_start_value"]) / span["forecast_start_value"]) * 100
                    parts.append(
                        f"{fuel.title()} is on a rising trajectory through {span['forecast_end_year']}, "
                        f"with the current forecast window implying roughly {growth:.1f}% growth from "
                        f"{span['forecast_start_year']} to {span['forecast_end_year']}."
                    )
            return " ".join(parts) or "Forecast context is available, but I could not derive a focused 2030 summary."

        if "drop" in lowered or "2020" in lowered:
            parts = []
            for fuel in ("petrol", "diesel"):
                if fuel in summaries:
                    parts.append(
                        f"{summaries[fuel]['label']} saw an estimated {summaries[fuel]['covid_drop_pct']:.1f}% drop in 2020 versus 2019, "
                        "which is consistent with pandemic-era mobility and logistics disruption."
                    )
            return " ".join(parts) or "The main visible break in the series is around 2020, which aligns with pandemic disruption."

        focus = "petrol" if "petrol" in lowered else "diesel" if "diesel" in lowered else None
        if focus and focus in summaries and focus in forecasts:
            summary = summaries[focus]
            forecast = forecasts[focus]
            return (
                f"{summary['label']} rises from {summary['history_end_value']:.3f} in {summary['history_end_year']} "
                f"to about {forecast['forecast_end_value']:.3f} by {forecast['forecast_end_year']}. "
                f"The latest historical peak is {summary['peak_value']:.3f} in {summary['peak_year']}, and the long-term trend remains upward."
            )

        return (
            "The historical series shows a long-term upward demand trend for both fuels, with a visible 2020 dip and recovery afterward. "
            "The forecast window continues that recovery path, with diesel staying larger in absolute volume while petrol also grows steadily."
        )

    def _payload(self, message: str, context: dict, conversation: list[dict] | None, stream: bool) -> dict:
        history = conversation or []
        messages = [{"role": "system", "content": self._system_prompt(context)}]
        messages.extend(history)
        messages.append({"role": "user", "content": message})
        return {
            "model": self.model,
            "temperature": 0.3,
            "top_p": 0.85,
            "max_tokens": 700,
            "stream": stream,
            "messages": messages,
        }

    def get_completion(self, message: str, context: dict, conversation: list[dict] | None = None) -> dict:
        if not self.is_enabled:
            return {
                "provider": "local-fallback",
                "model": "heuristic-summary",
                "content": self._fallback_response(message, context),
            }

        response = httpx.post(
            f"{self.base_url}/chat/completions",
            headers={"Authorization": f"Bearer {self.api_key}"},
            json=self._payload(message, context, conversation, stream=False),
            timeout=self.timeout,
        )
        response.raise_for_status()
        payload = response.json()
        return {
            "provider": "nvidia",
            "model": self.model,
            "content": payload["choices"][0]["message"]["content"],
            "raw": payload,
        }

    def stream_completion(self, message: str, context: dict, conversation: list[dict] | None = None) -> Iterable[str]:
        if not self.is_enabled:
            content = self._fallback_response(message, context)
            for token in content.split():
                yield f"{token} "
            return

        with httpx.stream(
            "POST",
            f"{self.base_url}/chat/completions",
            headers={"Authorization": f"Bearer {self.api_key}"},
            json=self._payload(message, context, conversation, stream=True),
            timeout=self.timeout,
        ) as response:
            response.raise_for_status()
            for line in response.iter_lines():
                if not line:
                    continue
                if line.startswith("data: "):
                    chunk = line.removeprefix("data: ").strip()
                    if chunk == "[DONE]":
                        break
                    payload = json.loads(chunk)
                    delta = payload["choices"][0]["delta"].get("content", "")
                    if delta:
                        yield delta
