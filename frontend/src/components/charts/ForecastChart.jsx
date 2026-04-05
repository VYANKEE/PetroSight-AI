import {
  Area,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ComposedChart,
} from "recharts";

import { formatDemand, mergeForecastSeries } from "../../lib/formatters";

export default function ForecastChart({
  title,
  subtitle,
  historical = [],
  forecast = [],
  accent = "#34d399",
}) {
  const data = mergeForecastSeries(historical, forecast);
  const gradientId = `shade-${title.toLowerCase().replaceAll(" ", "-")}`;

  return (
    <section className="glass-panel premium-card rounded-[2rem] p-6">
      <div className="mb-5">
        <p className="section-label mb-3">Forecast Chart</p>
        <h3 className="card-title text-2xl font-semibold text-white">{title}</h3>
        {subtitle ? <p className="mt-2 text-sm text-slate-400">{subtitle}</p> : null}
      </div>

      <div className="h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 10 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accent} stopOpacity={0.22} />
                <stop offset="100%" stopColor={accent} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatDemand(value)}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(8, 15, 28, 0.92)",
                border: "1px solid rgba(148, 163, 184, 0.12)",
                borderRadius: 18,
              }}
              formatter={(value, name) => [formatDemand(value), name]}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="lower"
              stackId="confidence"
              stroke="transparent"
              fill="rgba(0,0,0,0)"
              activeDot={false}
            />
            <Area
              type="monotone"
              dataKey="confidenceGap"
              stackId="confidence"
              stroke="transparent"
              fill={`url(#${gradientId})`}
              activeDot={false}
              name="Likely Range"
            />
            <Line
              type="monotone"
              dataKey="historical"
              stroke="#94a3b8"
              strokeWidth={2.5}
              dot={false}
              name="Historical"
              animationDuration={900}
            />
            <Line
              type="monotone"
              dataKey="forecast"
              stroke={accent}
              strokeWidth={3}
              dot={false}
              name="Forecast"
              animationDuration={1200}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
