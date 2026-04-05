import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { RiCpuLine, RiRadarLine, RiSparklingLine } from "react-icons/ri";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const years = Array.from({ length: 12 }, (_, index) => 2024 + index);

export default function ForecastControls({ onSubmit, loading }) {
  const [form, setForm] = useState({
    fuel: "petrol",
    mode: "year",
    year: 2030,
    month: "Jan",
    years: 10,
  });

  const payload = useMemo(
    () => ({
      fuel: form.fuel,
      mode: form.mode,
      year: Number(form.year),
      month: form.mode === "month" ? form.month : undefined,
      years: Number(form.years),
    }),
    [form],
  );

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="glass-panel rounded-[2rem] p-6"
    >
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="section-label mb-3">Forecast Engine</p>
          <h3 className="card-title text-2xl font-semibold text-white">Scenario Builder</h3>
        </div>
        <span className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-emerald-300">
          <RiSparklingLine />
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <label className="space-y-2">
          <span className="text-sm text-slate-400">Fuel Type</span>
          <select
            value={form.fuel}
            onChange={(event) => updateField("fuel", event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
          >
            <option value="petrol">Petrol</option>
            <option value="diesel">Diesel</option>
            <option value="combined">Combined</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm text-slate-400">Prediction Mode</span>
          <select
            value={form.mode}
            onChange={(event) => updateField("mode", event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
          >
            <option value="year">Year-wise</option>
            <option value="month">Month-wise</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm text-slate-400">Target Year</span>
          <select
            value={form.year}
            onChange={(event) => updateField("year", event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>

        <label className={`space-y-2 ${form.mode === "month" ? "" : "opacity-50"}`}>
          <span className="text-sm text-slate-400">Month</span>
          <select
            value={form.month}
            disabled={form.mode !== "month"}
            onChange={(event) => updateField("month", event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none disabled:cursor-not-allowed"
          >
            {months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm text-slate-400">Forecast Horizon</span>
          <select
            value={form.years}
            onChange={(event) => updateField("years", event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
          >
            {[5, 10, 12].map((yearCount) => (
              <option key={yearCount} value={yearCount}>
                {yearCount} years
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="metric-chip inline-flex items-center gap-2">
            <RiRadarLine className="text-cyan-300" />
            Confidence interval = likely range
          </span>
          <span className="metric-chip inline-flex items-center gap-2">
            <RiCpuLine className="text-emerald-300" />
            RMSE = average model error
          </span>
        </div>
        <motion.button
          type="button"
          onClick={() => onSubmit(payload)}
          disabled={loading}
          whileTap={{ scale: 0.98 }}
          className={`scan-line relative overflow-hidden rounded-[1.25rem] px-5 py-3 font-semibold text-slate-950 transition ${
            loading
              ? "bg-white/90 text-slate-900 shadow-[0_0_0_1px_rgba(255,255,255,0.2),0_18px_50px_rgba(56,189,248,0.18)]"
              : "bg-gradient-to-r from-emerald-400 to-cyan-400 hover:scale-[1.02]"
          } disabled:cursor-not-allowed`}
        >
          <span className="relative z-10 inline-flex min-w-[168px] items-center justify-center gap-3">
            {loading ? (
              <>
                <span className="loader-grid">
                  <span />
                  <span />
                  <span />
                </span>
                Forecasting now...
              </>
            ) : (
              <>
                <RiSparklingLine />
                Run Forecast
              </>
            )}
          </span>
        </motion.button>
      </div>

      <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-300">
        Monthly mode uses annual SARIMA forecasts and disaggregates them through calibrated month-share profiles, so
        you still get a usable monthly planning view even though the supplied training artifacts are yearly.
      </div>
    </motion.section>
  );
}
