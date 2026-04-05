import { useEffect, useState } from "react";
import { RiErrorWarningLine } from "react-icons/ri";

import ForecastChart from "../components/charts/ForecastChart";
import ForecastControls from "../components/dashboard/ForecastControls";
import ForecastTable from "../components/dashboard/ForecastTable";
import MetricGuide from "../components/dashboard/MetricGuide";
import { apiClient } from "../lib/api";
import { formatDemand } from "../lib/formatters";

const starterScenario = {
  fuel: "diesel",
  mode: "year",
  year: 2032,
  month: undefined,
  years: 10,
};

const guideItems = [
  {
    term: "Confidence interval",
    short: "Likely forecast range",
    meaning: "Use this as the expected range around the main forecast number, not as a guaranteed minimum or maximum.",
  },
  {
    term: "Lower bound / Upper bound",
    short: "Range edges",
    meaning: "These two values define the lower and upper edge of the confidence interval shown in the charts and result card.",
  },
  {
    term: "Month-wise forecast",
    short: "Derived monthly planning view",
    meaning: "Monthly outputs are split from yearly forecasts using calibrated month shares because the supplied models are annual.",
  },
];

export default function ForecastPage() {
  const [prediction, setPrediction] = useState(null);
  const [range, setRange] = useState(null);
  const [payload, setPayload] = useState(starterScenario);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    runScenario(starterScenario);
  }, []);

  async function runScenario(nextPayload) {
    setPayload(nextPayload);
    setLoading(true);
    try {
      const [predictionResponse, rangeResponse] = await Promise.all([
        apiClient.getPrediction({
          fuel: nextPayload.fuel,
          mode: nextPayload.mode,
          year: nextPayload.year,
          month: nextPayload.mode === "month" ? nextPayload.month : undefined,
        }),
        apiClient.getForecastRange({
          fuel: nextPayload.fuel,
          years: nextPayload.years,
          mode: nextPayload.mode,
          month: nextPayload.mode === "month" ? nextPayload.month : undefined,
        }),
      ]);

      setPrediction(predictionResponse);
      setRange(rangeResponse);
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Unable to generate forecast.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 pb-6">
      {error ? (
        <div className="glass-panel flex items-center gap-3 rounded-[1.8rem] border border-amber-400/20 p-5 text-amber-200">
          <RiErrorWarningLine className="text-xl" />
          <span>{error}</span>
        </div>
      ) : null}

      <section className="glass-panel rounded-[2rem] p-8">
        <p className="section-label mb-4">Forecast Studio</p>
        <h1 className="card-title text-4xl font-bold text-white">Build year-wise and month-wise petroleum scenarios</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
          Select fuel type, mode, target year, and horizon to generate a fresh forecast output with confidence
          intervals, chart visualization, and exportable tables.
        </p>
      </section>

      <ForecastControls onSubmit={runScenario} loading={loading} />

      {loading ? (
        <section className="grid gap-5 lg:grid-cols-3">
          <div className="scan-line glass-panel rounded-[2rem] p-6 lg:col-span-2">
            <p className="section-label mb-3">Forecasting</p>
            <h2 className="card-title text-3xl font-semibold text-white">Preparing your premium forecast view</h2>
            <div className="mt-6 flex items-center gap-3 text-slate-200">
              <span className="loader-grid text-cyan-300">
                <span />
                <span />
                <span />
              </span>
              Running model calculation, building confidence range, and refreshing chart transitions...
            </div>
          </div>

          <div className="glass-panel rounded-[2rem] p-6">
            <p className="section-label mb-3">Status</p>
            <div className="space-y-3 text-sm leading-7 text-slate-300">
              <p>1. Forecast API is calculating selected scenario.</p>
              <p>2. Range values are being assembled.</p>
              <p>3. Cards, chart, and table will refresh together.</p>
            </div>
          </div>
        </section>
      ) : prediction ? (
        <section className="grid gap-5 lg:grid-cols-3">
          <div className="glass-panel premium-card rounded-[2rem] p-6 lg:col-span-2">
            <p className="section-label mb-3">Prediction Output</p>
            <h2 className="card-title text-3xl font-semibold text-white">
              Predicted {payload.fuel} demand for {payload.mode === "month" ? `${payload.month} ${payload.year}` : payload.year}
            </h2>
            <p className="mt-6 card-title text-5xl font-bold text-white">{formatDemand(prediction.forecast_value)}</p>
            <p className="mt-3 text-sm text-slate-400">Unit: {prediction.unit}</p>
            <div className="mt-5 rounded-[1.35rem] border border-white/10 bg-white/5 px-4 py-4 text-sm leading-7 text-slate-300">
              This is the main forecast number. Treat it as the center estimate, and use the likely range card beside it
              for uncertainty awareness.
            </div>
          </div>

          <div className="glass-panel premium-card rounded-[2rem] p-6">
            <p className="section-label mb-3">Likely Range</p>
            <h3 className="card-title text-2xl font-semibold text-white">Confidence interval</h3>
            <div className="space-y-4">
              <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-400">Lower bound</p>
                <p className="card-title mt-2 text-2xl font-bold text-white">{formatDemand(prediction.confidence_lower)}</p>
              </div>
              <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-400">Upper bound</p>
                <p className="card-title mt-2 text-2xl font-bold text-white">{formatDemand(prediction.confidence_upper)}</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              In simple language: the forecast is most likely to fall somewhere between these two values.
            </p>
          </div>
        </section>
      ) : null}

      <MetricGuide title="Forecast terms explained simply" items={guideItems} />

      {range ? (
        <>
          <ForecastChart
            title="Scenario Forecast Curve"
            subtitle="Historical baseline, selected horizon, and confidence band"
            historical={range.historical}
            forecast={range.rows}
            accent={payload.fuel === "diesel" ? "#38bdf8" : payload.fuel === "combined" ? "#f59e0b" : "#34d399"}
          />
          <ForecastTable title="Scenario Forecast Table" rows={range.rows} />
        </>
      ) : null}
    </div>
  );
}
