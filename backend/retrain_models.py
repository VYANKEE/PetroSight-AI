from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import pandas as pd
from statsmodels.tsa.statespace.sarimax import SARIMAX

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"
DIAGNOSTICS_PATH = MODELS_DIR / "model_diagnostics.json"

MODEL_CONFIGS = {
    "petrol": {
        "data_path": DATA_DIR / "petrol_past_data.csv",
        "model_path": MODELS_DIR / "petrol_model.pkl",
        "order": (0, 1, 0),
        "seasonal_order": (0, 0, 0, 0),
        "trend": "c",
    },
    "diesel": {
        "data_path": DATA_DIR / "diesel_past_data.csv",
        "model_path": MODELS_DIR / "diesel_model.pkl",
        "order": (0, 0, 2),
        "seasonal_order": (0, 0, 0, 0),
        "trend": "ct",
    },
}


def load_series(path: Path) -> pd.Series:
    df = pd.read_csv(path)
    df["Year"] = pd.to_datetime(df["Year"])
    return pd.Series(df["Consumption"].astype(float).values, index=df["Year"]).asfreq("YS-JAN")


def metric_bundle(actual: np.ndarray, predicted: np.ndarray) -> dict[str, float]:
    actual = np.asarray(actual, dtype=float)
    predicted = np.asarray(predicted, dtype=float)
    mae = float(np.mean(np.abs(actual - predicted)))
    rmse = float(np.sqrt(np.mean(np.square(actual - predicted))))
    mape = float(np.mean(np.abs((actual - predicted) / actual)) * 100)
    return {
        "rmse": round(rmse, 3),
        "mae": round(mae, 3),
        "mape": round(mape, 3),
    }


def evaluate_model(series: pd.Series, order: tuple[int, int, int], seasonal_order: tuple[int, int, int, int], trend: str | None) -> dict:
    train_size = int(len(series) * 0.8)
    train = series.iloc[:train_size]
    test = series.iloc[train_size:]

    holdout_fit = SARIMAX(
        train,
        order=order,
        seasonal_order=seasonal_order,
        trend=trend,
        enforce_stationarity=False,
        enforce_invertibility=False,
    ).fit(disp=False)
    holdout_pred = holdout_fit.predict(start=test.index[0], end=test.index[-1])

    initial_train = max(8, len(series) // 2)
    walk_actuals = []
    walk_preds = []
    for index in range(initial_train, len(series)):
        rolling_train = series.iloc[:index]
        rolling_fit = SARIMAX(
            rolling_train,
            order=order,
            seasonal_order=seasonal_order,
            trend=trend,
            enforce_stationarity=False,
            enforce_invertibility=False,
        ).fit(disp=False)
        walk_preds.append(float(rolling_fit.forecast(1).iloc[0]))
        walk_actuals.append(float(series.iloc[index]))

    fitted_full = SARIMAX(
        series,
        order=order,
        seasonal_order=seasonal_order,
        trend=trend,
        enforce_stationarity=False,
        enforce_invertibility=False,
    ).fit(disp=False)

    return {
        "holdout": metric_bundle(test.to_numpy(), holdout_pred.to_numpy()),
        "walk_forward": metric_bundle(np.array(walk_actuals), np.array(walk_preds)),
        "history_start_year": int(series.index.min().year),
        "history_end_year": int(series.index.max().year),
        "model_aic": round(float(fitted_full.aic), 3),
        "model_bic": round(float(fitted_full.bic), 3),
        "fitted_model": fitted_full,
    }


def main() -> None:
    diagnostics: dict[str, dict] = {}

    for fuel, config in MODEL_CONFIGS.items():
        series = load_series(config["data_path"])
        evaluation = evaluate_model(
            series=series,
            order=config["order"],
            seasonal_order=config["seasonal_order"],
            trend=config["trend"],
        )

        with config["model_path"].open("wb") as model_file:
            import pickle

            pickle.dump(evaluation["fitted_model"], model_file)

        diagnostics[fuel] = {
            "selected_model": {
                "order": list(config["order"]),
                "seasonal_order": list(config["seasonal_order"]),
                "trend": config["trend"],
            },
            "holdout": evaluation["holdout"],
            "walk_forward": evaluation["walk_forward"],
            "history_start_year": evaluation["history_start_year"],
            "history_end_year": evaluation["history_end_year"],
            "model_aic": evaluation["model_aic"],
            "model_bic": evaluation["model_bic"],
            "notes": [
                "Original notebook used a single 80/20 split and saved models trained only on the training slice.",
                "Website now uses tuned models fitted on the full available history after benchmarking alternatives.",
                "These are non-seasonal annual models even though the notebook refers to them as SARIMA.",
            ],
        }

    DIAGNOSTICS_PATH.write_text(json.dumps(diagnostics, indent=2), encoding="utf-8")
    print(f"Saved tuned models and diagnostics to {MODELS_DIR}")


if __name__ == "__main__":
    main()
