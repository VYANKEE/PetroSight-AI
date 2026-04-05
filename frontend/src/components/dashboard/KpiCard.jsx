import { motion } from "framer-motion";
import { RiInformation2Line } from "react-icons/ri";

import { formatCompact } from "../../lib/formatters";

export default function KpiCard({ title, value, suffix = "", tone = "emerald", detail, explain }) {
  const hasValue = value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value));
  const toneStyles = {
    emerald: "from-emerald-400/20 to-emerald-500/5 text-emerald-300",
    cyan: "from-sky-400/20 to-sky-500/5 text-sky-300",
    amber: "from-amber-400/20 to-amber-500/5 text-amber-300",
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className={`glass-panel premium-card rounded-[1.75rem] bg-gradient-to-br p-5 ${toneStyles[tone] || toneStyles.emerald}`}
    >
      <p className="text-sm font-medium text-slate-300">{title}</p>
      <div className="mt-4 flex items-end gap-2">
        <span className="card-title text-3xl font-bold text-white">{hasValue ? formatCompact(value) : "--"}</span>
        {hasValue ? <span className="pb-1 text-sm text-slate-400">{suffix}</span> : null}
      </div>
      {detail ? <p className="mt-3 text-sm text-slate-400">{detail}</p> : null}
      {explain ? (
        <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-white/5 px-3 py-3 text-xs leading-6 text-slate-300">
          <span className="mb-1 inline-flex items-center gap-2 font-semibold text-white">
            <RiInformation2Line className="text-cyan-300" />
            What this means
          </span>
          <p>{explain}</p>
        </div>
      ) : null}
    </motion.article>
  );
}
