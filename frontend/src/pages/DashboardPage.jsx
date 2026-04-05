import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RiArrowUpLine, RiErrorWarningLine, RiSparklingLine } from "react-icons/ri";

import ForecastChart from "../components/charts/ForecastChart";
import GrowthRateChart from "../components/charts/GrowthRateChart";
import MonthlyShareChart from "../components/charts/MonthlyShareChart";
import ChatbotPanel from "../components/chatbot/ChatbotPanel";
import ForecastControls from "../components/dashboard/ForecastControls";
import ForecastTable from "../components/dashboard/ForecastTable";
import KpiCard from "../components/dashboard/KpiCard";
import MetricGuide from "../components/dashboard/MetricGuide";
import { apiClient } from "../lib/api";
import { formatDemand } from "../lib/formatters";

const defaultScenario = {
  fuel: "petrol",
  mode: "year",
  year: 2030,
  month: undefined,
  years: 10,
};

const metricGuideItems = [
  {
    term: "Confidence interval",
    short: "Likely forecast range",
    meaning: "This is the range where the forecast is reasonably expected to land. Wider range means more uncertainty.",
  },
  {
    term: "RMSE",
    short: "Average model error",
    meaning: "RMSE shows how far the model's past predictions were from actual values on average. Lower is better.",
  },
  {
    term: "Forecast growth",
    short: "Expected increase over horizon",
    meaning: "This compares today's total demand with the projected total demand at the end of the current outlook window.",
  },
  {
    term: "Monthly mode",
    short: "Derived planning view",
    meaning: "Monthly values are split from annual model outputs using calibrated monthly shares because the supplied training models are yearly.",
  },
];

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [scenario, setScenario] = useState(defaultScenario);
  const [scenarioPrediction, setScenarioPrediction] = useState(null);
  const [scenarioRange, setScenarioRange] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scenarioLoading, setScenarioLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const dashboardData = await apiClient.getDashboard(10);
        setDashboard(dashboardData);
        setError("");
      } catch (fetchError) {
        setError(fetchError.message || "Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
    runScenario(defaultScenario);
  }, []);

  async function runScenario(payload) {
    setScenario(payload);
    setScenarioLoading(true);
    try {
      const [prediction, range] = await Promise.all([
        apiClient.getPrediction({
          fuel: payload.fuel,
          mode: payload.mode,
          year: payload.year,
          month: payload.mode === "month" ? payload.month : undefined,
        }),
        apiClient.getForecastRange({
          fuel: payload.fuel,
          years: payload.years,
          mode: payload.mode,
          month: payload.mode === "month" ? payload.month : undefined,
        }),
      ]);

      setScenarioPrediction(prediction);
      setScenarioRange(range);
      setError("");
    } catch (fetchError) {
      setError(fetchError.message || "Unable to run forecast scenario.");
    } finally {
      setScenarioLoading(false);
    }
  }

  if (loading && !dashboard) {
    return (
      <div className="glass-panel rounded-[2rem] p-8">
        <p className="section-label mb-4">Loading</p>
        <h1 className="card-title text-3xl font-semibold text-white">Building your analytics workspace...</h1>
      </div>
    );
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
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="section-label mb-4">Operational Forecast Hub</p>
            <h1 className="card-title text-4xl font-bold text-white">Petroleum demand forecasting at decision speed</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
              Monitor historical demand, run new forecast scenarios, compare combined outlooks, and ask the AI copilot
              for trend interpretation without leaving the dashboard.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.7rem] border border-emerald-400/15 bg-emerald-400/10 p-5">
              <p className="text-sm text-emerald-200">Last Updated Year</p>
              <p className="card-title mt-3 text-3xl font-bold text-white">{dashboard?.kpis.last_updated_year}</p>
            </div>
            <div className="rounded-[1.7rem] border border-cyan-400/15 bg-cyan-400/10 p-5">
              <p className="text-sm text-cyan-100">Forecast Growth</p>
              <p className="card-title mt-3 text-3xl font-bold text-white">{dashboard?.kpis.forecast_growth_pct}%</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        <KpiCard
          title="Latest Petrol Demand"
          value={dashboard?.kpis.latest_petrol_demand}
          detail="2023 actual demand"
          explain="This is the latest observed petrol demand value in the dataset."
        />
        <KpiCard
          title="Latest Diesel Demand"
          value={dashboard?.kpis.latest_diesel_demand}
          tone="cyan"
          detail="2023 actual demand"
          explain="This is the latest observed diesel demand value in the dataset."
        />
        <KpiCard
          title="Forecast Growth %"
          value={dashboard?.kpis.forecast_growth_pct}
          suffix="%"
          tone="amber"
          detail="Combined demand growth in current horizon"
          explain="This shows how much total petroleum demand is expected to grow over the active forecast horizon."
        />
        <KpiCard
          title="Model RMSE"
          value={dashboard?.kpis.model_rmse}
          detail="Average of petrol and diesel error"
          explain="RMSE is the model's average historical error. Lower RMSE usually means better accuracy."
        />
        <KpiCard
          title="Last Updated Year"
          value={dashboard?.kpis.last_updated_year}
          tone="cyan"
          detail="Most recent observed history year"
          explain="This is the latest year of actual demand data used before forecasting begins."
        />
      </section>

      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.4fr)_420px]">
        <div className="space-y-6">
          <ForecastControls onSubmit={runScenario} loading={scenarioLoading} />

          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel premium-card rounded-[2rem] p-6"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="section-label mb-3">Scenario Result</p>
                <h3 className="card-title text-2xl font-semibold text-white">Instant demand insight</h3>
              </div>
              <span className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xl text-emerald-300">
                <RiSparklingLine />
              </span>
            </div>

            {scenarioLoading ? (
              <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="scan-line rounded-[1.8rem] border border-cyan-400/20 bg-cyan-400/10 p-6">
                  <p className="text-sm uppercase tracking-[0.18em] text-cyan-100">Forecast engine active</p>
                  <div className="mt-5 flex items-center gap-3 text-cyan-50">
                    <span className="loader-grid">
                      <span />
                      <span />
                      <span />
                    </span>
                    Running model, assembling confidence band, and preparing chart animation...
                  </div>
                </div>
                <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-6">
                  <p className="text-sm font-semibold text-white">What happens now</p>
                  <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
                    <p>1. Selected fuel and horizon are sent to the forecast API.</p>
                    <p>2. Forecast value and likely range are calculated.</p>
                    <p>3. Charts and result cards refresh with the new scenario.</p>
                  </div>
                </div>
              </div>
            ) : scenarioPrediction ? (
              <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5">
                  <p className="text-sm uppercase tracking-[0.18em] text-slate-400">
                    Predicted {scenario.fuel} demand for {scenario.mode === "month" ? `${scenario.month} ${scenario.year}` : scenario.year}
                  </p>
                  <p className="card-title mt-4 text-4xl font-bold text-white">
                    {formatDemand(scenarioPrediction.forecast_value)}
                  </p>
                  <p className="mt-3 text-sm text-slate-400">Unit: {scenarioPrediction.unit}</p>
                </div>
                <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5">
                  <p className="text-sm text-slate-400">Likely Range (Confidence Interval)</p>
                  <p className="mt-4 flex items-center gap-3 text-lg font-semibold text-white">
                    {formatDemand(scenarioPrediction.confidence_lower)}
                    <RiArrowUpLine className="rotate-45 text-emerald-300" />
                    {formatDemand(scenarioPrediction.confidence_upper)}
                  </p>
                  <p className="mt-4 text-sm leading-7 text-slate-400">
                    {scenario.mode === "month"
                      ? "Monthly values are derived from annual model outputs through the calibrated profile layer."
                      : "Annual values are generated from the refitted SARIMA forecast service."}
                  </p>
                  <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-black/10 px-3 py-3 text-sm leading-7 text-slate-300">
                    In simple terms: this band shows the range where the forecast is most likely to sit.
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-400">Run a scenario to generate forecast output.</p>
            )}
          </motion.section>

          <MetricGuide title="Understand the numbers before you present them" items={metricGuideItems} />

          <div className="grid gap-6 xl:grid-cols-2">
            <ForecastChart
              title="Petrol Forecast"
              subtitle="Historical vs future petrol demand"
              historical={dashboard?.petrol?.historical}
              forecast={dashboard?.petrol?.rows}
              accent="#34d399"
            />
            <ForecastChart
              title="Diesel Forecast"
              subtitle="Historical vs future diesel demand"
              historical={dashboard?.diesel?.historical}
              forecast={dashboard?.diesel?.rows}
              accent="#38bdf8"
            />
          </div>

          <ForecastChart
            title="Combined Forecast"
            subtitle="Total petroleum demand outlook"
            historical={dashboard?.combined?.historical}
            forecast={dashboard?.combined?.rows}
            accent="#f59e0b"
          />

          {scenarioRange ? (
            <ForecastChart
              title="Scenario Outlook"
              subtitle="Your selected fuel and forecast mode"
              historical={scenarioRange.historical}
              forecast={scenarioRange.rows}
              accent={scenario.fuel === "diesel" ? "#38bdf8" : scenario.fuel === "combined" ? "#f59e0b" : "#34d399"}
            />
          ) : null}

          <div className="grid gap-6 xl:grid-cols-2">
            <GrowthRateChart data={dashboard?.growth_rate} />
            <MonthlyShareChart data={dashboard?.monthly_distribution} />
          </div>

          <ForecastTable title="Forecast Table" rows={scenarioRange?.rows || dashboard?.combined?.rows || []} />
        </div>

        <ChatbotPanel className="sticky top-6 h-fit" fuel={scenario.fuel} />
      </section>
    </div>
  );
}
