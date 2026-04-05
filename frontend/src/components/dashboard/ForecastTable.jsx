import { RiDownload2Line } from "react-icons/ri";

import { createCsvDownload, formatDemand } from "../../lib/formatters";

export default function ForecastTable({ title, rows = [] }) {
  function handleExport() {
    const csvRows = [
      ["Year", "Month", "Forecast Value", "Confidence Lower", "Confidence Upper"],
      ...rows.map((row) => [
        row.year,
        row.month,
        row.forecast_value,
        row.confidence_lower,
        row.confidence_upper,
      ]),
    ];
    createCsvDownload("petroleum-forecast.csv", csvRows);
  }

  return (
    <section className="glass-panel rounded-[2rem] p-6">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="section-label mb-3">Data Grid</p>
          <h3 className="card-title text-2xl font-semibold text-white">{title}</h3>
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-white transition hover:border-cyan-400/30 hover:bg-white/5"
        >
          <RiDownload2Line />
          Download CSV
        </button>
      </div>

      <div className="scrollbar-thin overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-400">
            <tr>
              <th className="pb-4 pr-4">Year</th>
              <th className="pb-4 pr-4">Month</th>
              <th className="pb-4 pr-4">Forecast Value</th>
              <th className="pb-4 pr-4">Confidence Lower</th>
              <th className="pb-4">Confidence Upper</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.year}-${row.month}`} className="border-t border-white/5 text-slate-200">
                <td className="py-4 pr-4">{row.year}</td>
                <td className="py-4 pr-4">{row.month}</td>
                <td className="py-4 pr-4">{formatDemand(row.forecast_value)}</td>
                <td className="py-4 pr-4">{formatDemand(row.confidence_lower)}</td>
                <td className="py-4">{formatDemand(row.confidence_upper)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
