import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function GrowthRateChart({ data = [] }) {
  return (
    <section className="glass-panel rounded-[2rem] p-6">
      <div className="mb-5">
        <p className="section-label mb-3">Growth Rate</p>
        <h3 className="card-title text-2xl font-semibold text-white">Projected Growth Momentum</h3>
      </div>

      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
            <XAxis dataKey="year" tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                background: "rgba(8, 15, 28, 0.92)",
                border: "1px solid rgba(148, 163, 184, 0.12)",
                borderRadius: 18,
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="petrol_growth" stroke="#34d399" strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="diesel_growth" stroke="#38bdf8" strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="combined_growth" stroke="#f59e0b" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
