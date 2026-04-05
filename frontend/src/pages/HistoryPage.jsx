import { useEffect, useState } from "react";
import { RiErrorWarningLine } from "react-icons/ri";

import ForecastChart from "../components/charts/ForecastChart";
import { apiClient } from "../lib/api";
import { formatDemand } from "../lib/formatters";

export default function HistoryPage() {
  const [filters, setFilters] = useState({ fuel: "petrol", mode: "year" });
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadHistory() {
      setLoading(true);
      try {
        const response = await apiClient.getHistory(filters);
        setHistory(response);
        setError("");
      } catch (requestError) {
        setError(requestError.message || "Unable to load historical data.");
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, [filters]);

  return (
    <div className="space-y-6 pb-6">
      {error ? (
        <div className="glass-panel flex items-center gap-3 rounded-[1.8rem] border border-amber-400/20 p-5 text-amber-200">
          <RiErrorWarningLine className="text-xl" />
          <span>{error}</span>
        </div>
      ) : null}

      <section className="glass-panel rounded-[2rem] p-8">
        <p className="section-label mb-4">Historical Explorer</p>
        <h1 className="card-title text-4xl font-bold text-white">Inspect past petroleum demand and compare modes</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
          Switch between petrol, diesel, and combined demand. Year mode shows observed annual values; month mode shows
          the calibrated historical monthly view derived from annual series.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:max-w-2xl">
          <label className="space-y-2">
            <span className="text-sm text-slate-400">Fuel Type</span>
            <select
              value={filters.fuel}
              onChange={(event) => setFilters((current) => ({ ...current, fuel: event.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
            >
              <option value="petrol">Petrol</option>
              <option value="diesel">Diesel</option>
              <option value="combined">Combined</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm text-slate-400">View Mode</span>
            <select
              value={filters.mode}
              onChange={(event) => setFilters((current) => ({ ...current, mode: event.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
            >
              <option value="year">Year-wise</option>
              <option value="month">Month-wise</option>
            </select>
          </label>
        </div>
      </section>

      {loading ? (
        <div className="glass-panel rounded-[2rem] p-8 text-slate-300">Loading historical series...</div>
      ) : (
        <>
          <ForecastChart
            title="Historical Demand Curve"
            subtitle={history?.derived_monthly ? "Derived monthly view" : "Observed annual view"}
            historical={history?.records}
            forecast={[]}
            accent={filters.fuel === "diesel" ? "#38bdf8" : filters.fuel === "combined" ? "#f59e0b" : "#34d399"}
          />

          <section className="glass-panel rounded-[2rem] p-6">
            <div className="mb-5">
              <p className="section-label mb-3">Historical Table</p>
              <h3 className="card-title text-2xl font-semibold text-white">Year | Month | Value</h3>
            </div>

            <div className="scrollbar-thin overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-slate-400">
                  <tr>
                    <th className="pb-4 pr-4">Year</th>
                    <th className="pb-4 pr-4">Month</th>
                    <th className="pb-4">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {history?.records?.map((row) => (
                    <tr key={`${row.year}-${row.month}`} className="border-t border-white/5 text-slate-200">
                      <td className="py-4 pr-4">{row.year}</td>
                      <td className="py-4 pr-4">{row.month}</td>
                      <td className="py-4">{formatDemand(row.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
