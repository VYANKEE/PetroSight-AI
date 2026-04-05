from __future__ import annotations

import math
import pickle
import warnings
from dataclasses import dataclass
from functools import lru_cache
import json
from pathlib import Path
from typing import Literal

import numpy as np
import pandas as pd
from statsmodels.tsa.statespace.sarimax import SARIMAX

BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "models"
DATA_DIR = BASE_DIR / "data"
DIAGNOSTICS_PATH = MODELS_DIR / "model_diagnostics.json"

FuelType = Literal["petrol", "diesel", "combined"]
ModeType = Literal["year", "month"]

MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
]

FUEL_META = {
    "petrol": {
        "label": "Petrol (MS)",
        "history_path": DATA_DIR / "petrol_past_data.csv",
        "model_path": MODELS_DIR / "petrol_model.pkl",
        "monthly_profile": np.array(
            [0.080, 0.074, 0.081, 0.082, 0.087, 0.089, 0.086, 0.084, 0.081, 0.087, 0.086, 0.083]
        ),
        "accent": "#2dd4bf",
    },
    "diesel": {
        "label": "Diesel (HSD)",
        "history_path": DATA_DIR / "diesel_past_data.csv",
        "model_path": MODELS_DIR / "diesel_model.pkl",
        "monthly_profile": np.array(
            [0.083, 0.076, 0.082, 0.078, 0.081, 0.084, 0.086, 0.089, 0.083, 0.087, 0.089, 0.082]
        ),
        "accent": "#38bdf8",
    },
}

DEFAULT_MODEL_SPECS = {
    "petrol": {
        "order": (0, 1, 0),
        "seasonal_order": (0, 0, 0, 0),
        "trend": "c",
    },
    "diesel": {
        "order": (0, 0, 2),
        "seasonal_order": (0, 0, 0, 0),
        "trend": "ct",
    },
}

OFFICIAL_REALITY_CHECK = {
    "source": "PPAC industry consumption reports for FY2023-24 and FY2024-25 (Government of India).",
    "note": (
        "The supplied series appears to align with financial-year totals reported by PPAC, even though the CSV year column "
        "looks like a calendar date. Forecast-vs-actual comparison for 2024 should therefore be read as an FY2024-25 "
        "approximation, not a pure calendar-year validation."
    ),
    "dataset_reference_fy_2023_24": {
        "petrol_official_tmt": 37219.0,
        "diesel_official_tmt": 89655.0,
    },
    "actual_fy_2024_25": {
        "petrol_official_tmt": 40005.0,
        "diesel_official_tmt": 91407.0,
    },
}

for fuel_name in ("petrol", "diesel"):
    profile_sum = float(FUEL_META[fuel_name]["monthly_profile"].sum())
    if not math.isclose(profile_sum, 1.0, rel_tol=0.0, abs_tol=1e-9):
        raise ValueError(f"Monthly profile for {fuel_name} must sum to 1.0; got {profile_sum}")


@dataclass(frozen=True)
class ModelSpec:
    order: tuple[int, int, int]
    seasonal_order: tuple[int, int, int, int]
    trend: str | None


def _safe_float(value: float | int | np.floating) -> float:
    if pd.isna(value):
        return 0.0
    return round(float(value), 3)


def _normalize_month(month: str | int | None) -> str | None:
    if month is None:
        return None
    if isinstance(month, int):
        if 1 <= month <= 12:
            return MONTHS[month - 1]
        raise ValueError("Month integer must be between 1 and 12.")
    cleaned = month.strip().title()[:3]
    for candidate in MONTHS:
        if cleaned == candidate:
            return candidate
    raise ValueError("Month must be a valid month name such as Jan, Feb, or Mar.")


def _normalise_fuel(fuel: str) -> FuelType:
    lowered = fuel.strip().lower()
    if lowered not in {"petrol", "diesel", "combined"}:
        raise ValueError("Fuel must be one of: petrol, diesel, combined.")
    return lowered  # type: ignore[return-value]


class ForecastService:
    def __init__(self) -> None:
        self.diagnostics = self._load_diagnostics()
        self.model_specs = {
            fuel: self._extract_model_spec(fuel, FUEL_META[fuel]["model_path"]) for fuel in ("petrol", "diesel")
        }
        self.annual_history = {fuel: self._load_annual_history(fuel) for fuel in ("petrol", "diesel")}
        self.combined_history = self._build_combined_history()
        self._persist_combined_dataset()

    def _extract_model_spec(self, fuel: Literal["petrol", "diesel"], model_path: Path) -> ModelSpec:
        try:
            with model_path.open("rb") as model_file:
                model_wrapper = pickle.load(model_file)
            return ModelSpec(
                order=tuple(model_wrapper.model.order),
                seasonal_order=tuple(model_wrapper.model.seasonal_order),
                trend=model_wrapper.model.trend,
            )
        except Exception:
            diagnostics = self.diagnostics.get(fuel, {})
            selected_model = diagnostics.get("selected_model", DEFAULT_MODEL_SPECS[fuel])
            return ModelSpec(
                order=tuple(selected_model["order"]),
                seasonal_order=tuple(selected_model["seasonal_order"]),
                trend=selected_model.get("trend"),
            )

    @staticmethod
    def _load_diagnostics() -> dict:
        if not DIAGNOSTICS_PATH.exists():
            return {}
        try:
            return json.loads(DIAGNOSTICS_PATH.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return {}

    @staticmethod
    def _annual_series(df: pd.DataFrame) -> pd.Series:
        return pd.Series(
            df["value"].values,
            index=pd.to_datetime(df["year"].astype(str), format="%Y"),
            name="consumption",
        ).asfreq("YS-JAN")

    def _load_annual_history(self, fuel: Literal["petrol", "diesel"]) -> pd.DataFrame:
        history_path = FUEL_META[fuel]["history_path"]
        raw = pd.read_csv(history_path)
        renamed = raw.rename(columns={raw.columns[0]: "date", raw.columns[-1]: "value"})
        renamed["date"] = pd.to_datetime(renamed["date"])
        renamed["year"] = renamed["date"].dt.year.astype(int)
        frame = renamed[["year", "value"]].copy()
        frame["month"] = "Annual"
        frame["month_index"] = 0
        frame["fuel"] = fuel
        frame["type"] = "historical"
        frame["value"] = pd.to_numeric(frame["value"], errors="coerce")
        frame = frame.dropna(subset=["value"]).sort_values("year").reset_index(drop=True)
        return frame

    def _build_combined_history(self) -> pd.DataFrame:
        petrol = self.annual_history["petrol"][["year", "value"]].rename(columns={"value": "Petrol"})
        diesel = self.annual_history["diesel"][["year", "value"]].rename(columns={"value": "Diesel"})
        combined = petrol.merge(diesel, how="outer", on="year").sort_values("year")
        combined["Month"] = "Annual"
        combined = combined.rename(columns={"year": "Year"})
        ordered = combined[["Year", "Month", "Petrol", "Diesel"]]
        return ordered.reset_index(drop=True)

    def _persist_combined_dataset(self) -> None:
        export_path = DATA_DIR / "petroleum_consumption.csv"
        self.combined_history.to_csv(export_path, index=False)

    @lru_cache(maxsize=8)
    def get_refit_model(self, fuel: Literal["petrol", "diesel"]):
        series = self._annual_series(self.annual_history[fuel])
        spec = self.model_specs[fuel]
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            model = SARIMAX(
                series.astype(float),
                order=spec.order,
                seasonal_order=spec.seasonal_order,
                trend=spec.trend,
                enforce_stationarity=False,
                enforce_invertibility=False,
            )
            fitted = model.fit(disp=False)
        return fitted

    @lru_cache(maxsize=32)
    def get_model_rmse(self, fuel: Literal["petrol", "diesel"]) -> float:
        diagnostics = self.diagnostics.get(fuel, {})
        walk_forward = diagnostics.get("walk_forward", {})
        if "rmse" in walk_forward:
            return _safe_float(walk_forward["rmse"])
        series = self._annual_series(self.annual_history[fuel]).astype(float)
        fitted = self.get_refit_model(fuel)
        predictions = fitted.get_prediction(start=series.index[1], end=series.index[-1]).predicted_mean
        aligned = series.loc[predictions.index]
        rmse = np.sqrt(np.mean(np.square(aligned - predictions)))
        return _safe_float(rmse)

    def get_model_diagnostics(self, fuel: Literal["petrol", "diesel"]) -> dict:
        diagnostics = self.diagnostics.get(fuel)
        if diagnostics:
            return diagnostics
        return {
            "selected_model": {
                "order": list(self.model_specs[fuel].order),
                "seasonal_order": list(self.model_specs[fuel].seasonal_order),
                "trend": self.model_specs[fuel].trend,
            },
            "walk_forward": {"rmse": self.get_model_rmse(fuel)},
        }

    def _forecast_until_year(self, fuel: Literal["petrol", "diesel"], target_year: int) -> pd.DataFrame:
        history = self.annual_history[fuel]
        last_historical_year = int(history["year"].max())
        if target_year <= last_historical_year:
            actual_rows = history[history["year"] <= target_year].copy()
            actual_rows["confidence_lower"] = actual_rows["value"]
            actual_rows["confidence_upper"] = actual_rows["value"]
            return actual_rows

        steps = target_year - last_historical_year
        result = self.get_refit_model(fuel)
        forecast = result.get_forecast(steps=steps)
        interval = forecast.conf_int()
        lower_col, upper_col = interval.columns[:2]

        frame = pd.DataFrame(
            {
                "year": forecast.predicted_mean.index.year,
                "month": "Annual",
                "month_index": 0,
                "fuel": fuel,
                "type": "forecast",
                "value": forecast.predicted_mean.values,
                "confidence_lower": interval[lower_col].values,
                "confidence_upper": interval[upper_col].values,
            }
        )
        frame["value"] = frame["value"].astype(float)
        frame["confidence_lower"] = frame["confidence_lower"].astype(float)
        frame["confidence_upper"] = frame["confidence_upper"].astype(float)
        return frame.reset_index(drop=True)

    def _disaggregate_monthly(self, fuel: Literal["petrol", "diesel"], frame: pd.DataFrame) -> pd.DataFrame:
        profile = FUEL_META[fuel]["monthly_profile"]
        records: list[dict[str, float | int | str]] = []

        for row in frame.itertuples(index=False):
            lower = getattr(row, "confidence_lower", getattr(row, "value"))
            upper = getattr(row, "confidence_upper", getattr(row, "value"))
            for month_index, month_name in enumerate(MONTHS, start=1):
                weight = float(profile[month_index - 1])
                records.append(
                    {
                        "year": int(row.year),
                        "month": month_name,
                        "month_index": month_index,
                        "fuel": fuel,
                        "type": getattr(row, "type", "forecast"),
                        "value": float(row.value) * weight,
                        "confidence_lower": float(lower) * weight,
                        "confidence_upper": float(upper) * weight,
                        "annual_value": float(row.value),
                    }
                )

        monthly = pd.DataFrame.from_records(records)
        return monthly.sort_values(["year", "month_index"]).reset_index(drop=True)

    def _combine_fuel_frames(self, left: pd.DataFrame, right: pd.DataFrame, mode: ModeType) -> pd.DataFrame:
        keys = ["year", "month", "month_index"]
        merged = left.merge(
            right,
            how="outer",
            on=keys,
            suffixes=("_petrol", "_diesel"),
        ).sort_values(keys)
        merged["value"] = merged["value_petrol"].fillna(0.0) + merged["value_diesel"].fillna(0.0)
        merged["confidence_lower"] = merged["confidence_lower_petrol"].fillna(0.0) + merged[
            "confidence_lower_diesel"
        ].fillna(0.0)
        merged["confidence_upper"] = merged["confidence_upper_petrol"].fillna(0.0) + merged[
            "confidence_upper_diesel"
        ].fillna(0.0)
        merged["fuel"] = "combined"
        merged["type"] = "forecast"
        merged["mode"] = mode
        return merged[keys + ["fuel", "type", "mode", "value", "confidence_lower", "confidence_upper"]]

    def get_history(self, fuel: FuelType = "combined", mode: ModeType = "year") -> dict:
        fuel = _normalise_fuel(fuel)
        if fuel == "combined":
            records = []
            for row in self.combined_history.to_dict(orient="records"):
                value = 0.0
                if pd.notna(row["Petrol"]):
                    value += float(row["Petrol"])
                if pd.notna(row["Diesel"]):
                    value += float(row["Diesel"])
                records.append(
                    {
                        "year": int(row["Year"]),
                        "month": "Annual",
                        "month_index": 0,
                        "fuel": "combined",
                        "value": _safe_float(value),
                        "petrol": _safe_float(row["Petrol"]) if pd.notna(row["Petrol"]) else None,
                        "diesel": _safe_float(row["Diesel"]) if pd.notna(row["Diesel"]) else None,
                    }
                )
            history_frame = pd.DataFrame.from_records(records)
        else:
            history_frame = self.annual_history[fuel].copy()

        derived_monthly = False
        if mode == "month":
            derived_monthly = True
            if fuel == "combined":
                petrol = self._disaggregate_monthly("petrol", self.annual_history["petrol"])
                diesel = self._disaggregate_monthly("diesel", self.annual_history["diesel"])
                history_frame = self._combine_fuel_frames(petrol, diesel, mode)
            else:
                history_frame = self._disaggregate_monthly(fuel, history_frame)

        values_key = "value"
        rows = []
        for row in history_frame.to_dict(orient="records"):
            rows.append(
                {
                    "year": int(row["year"]),
                    "month": row["month"],
                    "month_index": int(row["month_index"]),
                    "fuel": fuel,
                    "value": _safe_float(row[values_key]),
                    "confidence_lower": _safe_float(row.get("confidence_lower", row[values_key])),
                    "confidence_upper": _safe_float(row.get("confidence_upper", row[values_key])),
                }
            )

        return {
            "fuel": fuel,
            "mode": mode,
            "derived_monthly": derived_monthly,
            "records": rows,
            "meta": {
                "start_year": int(history_frame["year"].min()),
                "end_year": int(history_frame["year"].max()),
                "unit": "'000 Metric Tonnes",
            },
        }

    def get_forecast_range(
        self,
        fuel: FuelType = "petrol",
        years: int = 10,
        mode: ModeType = "year",
        start_year: int | None = None,
        month: str | int | None = None,
    ) -> dict:
        fuel = _normalise_fuel(fuel)
        if years < 1 or years > 20:
            raise ValueError("Years must be between 1 and 20.")

        histories = {key: self.annual_history[key] for key in ("petrol", "diesel")}
        max_history_year = int(max(hist["year"].max() for hist in histories.values()))
        effective_start_year = start_year or (max_history_year + 1)
        target_year = effective_start_year + years - 1

        if fuel == "combined":
            petrol_frame = self._forecast_until_year("petrol", target_year)
            diesel_frame = self._forecast_until_year("diesel", target_year)
            petrol_frame = petrol_frame[petrol_frame["year"] >= effective_start_year]
            diesel_frame = diesel_frame[diesel_frame["year"] >= effective_start_year]
            if mode == "month":
                petrol_frame = self._disaggregate_monthly("petrol", petrol_frame)
                diesel_frame = self._disaggregate_monthly("diesel", diesel_frame)
            forecast_frame = self._combine_fuel_frames(petrol_frame, diesel_frame, mode)
        else:
            forecast_frame = self._forecast_until_year(fuel, target_year)
            forecast_frame = forecast_frame[forecast_frame["year"] >= effective_start_year]
            if mode == "month":
                forecast_frame = self._disaggregate_monthly(fuel, forecast_frame)
                selected_month = _normalize_month(month)
                if selected_month:
                    forecast_frame = forecast_frame[forecast_frame["month"] == selected_month]

        selected_month = _normalize_month(month)
        if fuel == "combined" and mode == "month" and selected_month:
            forecast_frame = forecast_frame[forecast_frame["month"] == selected_month]

        history_payload = self.get_history(fuel=fuel, mode=mode)
        history_rows = history_payload["records"]
        if mode == "month" and selected_month:
            history_rows = [row for row in history_rows if row["month"] == selected_month]

        rows = []
        for row in forecast_frame.to_dict(orient="records"):
            rows.append(
                {
                    "year": int(row["year"]),
                    "month": row["month"],
                    "month_index": int(row["month_index"]),
                    "forecast_value": _safe_float(row["value"]),
                    "confidence_lower": _safe_float(row["confidence_lower"]),
                    "confidence_upper": _safe_float(row["confidence_upper"]),
                }
            )

        return {
            "fuel": fuel,
            "mode": mode,
            "derived_monthly": mode == "month",
            "start_year": effective_start_year,
            "end_year": target_year,
            "month": selected_month,
            "years": [row["year"] for row in rows],
            "values": [row["forecast_value"] for row in rows],
            "lower": [row["confidence_lower"] for row in rows],
            "upper": [row["confidence_upper"] for row in rows],
            "rows": rows,
            "historical": history_rows,
            "unit": "'000 Metric Tonnes",
        }

    def predict_point(
        self,
        fuel: FuelType,
        mode: ModeType,
        year: int,
        month: str | int | None = None,
    ) -> dict:
        fuel = _normalise_fuel(fuel)
        if mode == "month" and month is None:
            raise ValueError("Month is required for month-wise prediction.")
        if fuel == "combined":
            package = self.get_forecast_range(fuel=fuel, years=max(1, year - 2023), mode=mode, start_year=2024, month=month)
        else:
            package = self.get_forecast_range(
                fuel=fuel,
                years=max(1, year - int(self.annual_history[fuel]["year"].max())),
                mode=mode,
                start_year=int(self.annual_history[fuel]["year"].max()) + 1,
                month=month,
            )

        target_month = _normalize_month(month) if mode == "month" else None
        for row in package["rows"]:
            if row["year"] == year and (mode == "year" or row["month"] == target_month):
                return {
                    "fuel": fuel,
                    "mode": mode,
                    "year": year,
                    "month": row["month"],
                    "forecast_value": row["forecast_value"],
                    "confidence_lower": row["confidence_lower"],
                    "confidence_upper": row["confidence_upper"],
                    "unit": "'000 Metric Tonnes",
                }
        raise ValueError(f"No forecast available for {fuel} {year} {target_month or 'Annual'}.")

    def get_dashboard_snapshot(self, years: int = 10) -> dict:
        petrol_range = self.get_forecast_range(fuel="petrol", years=years, mode="year")
        diesel_range = self.get_forecast_range(fuel="diesel", years=years, mode="year")
        combined_range = self.get_forecast_range(fuel="combined", years=years, mode="year")

        latest_petrol = self.annual_history["petrol"].iloc[-1]
        latest_diesel = self.annual_history["diesel"].iloc[-1]
        combined_latest = _safe_float(latest_petrol["value"] + latest_diesel["value"])
        combined_future = combined_range["rows"][-1]["forecast_value"]
        growth_pct = ((combined_future - combined_latest) / combined_latest) * 100 if combined_latest else 0.0

        growth_rows = []
        previous_combined = combined_latest
        for petrol_row, diesel_row in zip(petrol_range["rows"], diesel_range["rows"]):
            combined_value = petrol_row["forecast_value"] + diesel_row["forecast_value"]
            growth_rows.append(
                {
                    "year": petrol_row["year"],
                    "petrol_growth": _safe_float(
                        ((petrol_row["forecast_value"] - latest_petrol["value"]) / latest_petrol["value"]) * 100
                    ),
                    "diesel_growth": _safe_float(
                        ((diesel_row["forecast_value"] - latest_diesel["value"]) / latest_diesel["value"]) * 100
                    ),
                    "combined_growth": _safe_float(((combined_value - previous_combined) / previous_combined) * 100),
                }
            )
            previous_combined = combined_value

        monthly_distribution = []
        for index, month_name in enumerate(MONTHS):
            monthly_distribution.append(
                {
                    "month": month_name,
                    "petrol_share": _safe_float(FUEL_META["petrol"]["monthly_profile"][index] * 100),
                    "diesel_share": _safe_float(FUEL_META["diesel"]["monthly_profile"][index] * 100),
                }
            )

        return {
            "kpis": {
                "latest_petrol_demand": _safe_float(latest_petrol["value"]),
                "latest_diesel_demand": _safe_float(latest_diesel["value"]),
                "forecast_growth_pct": _safe_float(growth_pct),
                "model_rmse": _safe_float((self.get_model_rmse("petrol") + self.get_model_rmse("diesel")) / 2),
                "petrol_rmse": self.get_model_rmse("petrol"),
                "diesel_rmse": self.get_model_rmse("diesel"),
                "last_updated_year": int(max(latest_petrol["year"], latest_diesel["year"])),
            },
            "model_diagnostics": {
                "petrol": self.get_model_diagnostics("petrol"),
                "diesel": self.get_model_diagnostics("diesel"),
            },
            "petrol": petrol_range,
            "diesel": diesel_range,
            "combined": combined_range,
            "growth_rate": growth_rows,
            "monthly_distribution": monthly_distribution,
            "highlights": self.build_context_summary(years=years),
            "reality_check": self.get_reality_check(),
        }

    def build_context_summary(self, years: int = 10) -> dict:
        summary: dict[str, dict[str, float | str | int]] = {}
        for fuel in ("petrol", "diesel"):
            history = self.annual_history[fuel]
            range_payload = self.get_forecast_range(fuel=fuel, years=years, mode="year")
            forecast_end = range_payload["rows"][-1]
            latest = history.iloc[-1]
            previous = history.iloc[-2]
            growth = ((latest["value"] - previous["value"]) / previous["value"]) * 100
            covid_drop = None
            if 2019 in history["year"].values and 2020 in history["year"].values:
                series = history.set_index("year")["value"]
                covid_drop = ((series[2020] - series[2019]) / series[2019]) * 100

            summary[fuel] = {
                "label": FUEL_META[fuel]["label"],
                "latest_year": int(latest["year"]),
                "latest_value": _safe_float(latest["value"]),
                "recent_growth_pct": _safe_float(growth),
                "covid_drop_pct": _safe_float(covid_drop or 0.0),
                "forecast_end_year": int(forecast_end["year"]),
                "forecast_end_value": _safe_float(forecast_end["forecast_value"]),
            }

        return summary

    def build_llm_context(self, fuel: str | None = None, years: int = 10) -> dict:
        normalised_fuel = None
        if fuel:
            normalised_fuel = _normalise_fuel(fuel)
            if normalised_fuel == "combined":
                normalised_fuel = None

        dashboard = self.get_dashboard_snapshot(years=years)
        targets = [normalised_fuel] if normalised_fuel else ["petrol", "diesel"]

        history_summaries = []
        forecast_summaries = []
        for item in targets:
            assert item in {"petrol", "diesel"}
            history = self.annual_history[item]
            context = dashboard["highlights"][item]
            series = history.set_index("year")["value"]
            peak_year = int(series.idxmax())
            trough_year = int(series.idxmin())
            history_summaries.append(
                {
                    "fuel": item,
                    "label": FUEL_META[item]["label"],
                    "history_start_year": int(history["year"].min()),
                    "history_end_year": int(history["year"].max()),
                    "history_start_value": _safe_float(history.iloc[0]["value"]),
                    "history_end_value": _safe_float(history.iloc[-1]["value"]),
                    "peak_year": peak_year,
                    "peak_value": _safe_float(series[peak_year]),
                    "trough_year": trough_year,
                    "trough_value": _safe_float(series[trough_year]),
                    "covid_drop_pct": context["covid_drop_pct"],
                }
            )
            forecast_summaries.append(
                {
                    "fuel": item,
                    "forecast_start_year": dashboard[item]["start_year"],
                    "forecast_end_year": dashboard[item]["end_year"],
                    "forecast_start_value": dashboard[item]["rows"][0]["forecast_value"],
                    "forecast_end_value": dashboard[item]["rows"][-1]["forecast_value"],
                }
            )

        return {
            "dashboard_kpis": dashboard["kpis"],
            "history_summaries": history_summaries,
            "forecast_summaries": forecast_summaries,
            "derived_monthly_note": (
                "Month-wise values are derived from annual SARIMA forecasts using calibrated monthly share profiles "
                "because the supplied training artifacts contain annual time series."
            ),
        }

    def get_reality_check(self) -> dict:
        petrol_history_latest = float(self.annual_history["petrol"].iloc[-1]["value"])
        diesel_history_latest = float(self.annual_history["diesel"].iloc[-1]["value"])
        petrol_official_2023 = OFFICIAL_REALITY_CHECK["dataset_reference_fy_2023_24"]["petrol_official_tmt"]
        diesel_official_2023 = OFFICIAL_REALITY_CHECK["dataset_reference_fy_2023_24"]["diesel_official_tmt"]
        petrol_2024_forecast = self.predict_point("petrol", "year", 2024)["forecast_value"]
        diesel_2024_forecast = self.predict_point("diesel", "year", 2024)["forecast_value"]
        petrol_2024_actual = OFFICIAL_REALITY_CHECK["actual_fy_2024_25"]["petrol_official_tmt"]
        diesel_2024_actual = OFFICIAL_REALITY_CHECK["actual_fy_2024_25"]["diesel_official_tmt"]

        return {
            **OFFICIAL_REALITY_CHECK,
            "dataset_alignment": {
                "petrol_dataset_tmt": _safe_float(petrol_history_latest),
                "diesel_dataset_tmt": _safe_float(diesel_history_latest),
                "petrol_gap_pct": _safe_float(((petrol_history_latest - petrol_official_2023) / petrol_official_2023) * 100),
                "diesel_gap_pct": _safe_float(((diesel_history_latest - diesel_official_2023) / diesel_official_2023) * 100),
            },
            "forecast_alignment": {
                "petrol_2024_model_tmt": _safe_float(petrol_2024_forecast),
                "diesel_2024_model_tmt": _safe_float(diesel_2024_forecast),
                "petrol_2024_error_pct": _safe_float(((petrol_2024_forecast - petrol_2024_actual) / petrol_2024_actual) * 100),
                "diesel_2024_error_pct": _safe_float(((diesel_2024_forecast - diesel_2024_actual) / diesel_2024_actual) * 100),
            },
        }


forecast_service = ForecastService()
