import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function MonthlyShareChart({ data = [] }) {
  return (
    <section className="glass-panel rounded-[2rem] p-6">
      <div className="mb-5">
        <p className="section-label mb-3">Monthly Trend</p>
        <h3 className="card-title text-2xl font-semibold text-white">Derived Monthly Distribution</h3>
      </div>

      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                background: "rgba(8, 15, 28, 0.92)",
                border: "1px solid rgba(148, 163, 184, 0.12)",
                borderRadius: 18,
              }}
            />
            <Legend />
            <Bar dataKey="petrol_share" fill="#34d399" radius={[10, 10, 0, 0]} />
            <Bar dataKey="diesel_share" fill="#38bdf8" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
