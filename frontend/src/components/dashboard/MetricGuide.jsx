import { motion } from "framer-motion";
import { RiInformation2Line } from "react-icons/ri";

export default function MetricGuide({ title = "Quick Guide", items = [] }) {
  return (
    <section className="glass-panel premium-card rounded-[2rem] p-6">
      <div className="mb-5">
        <p className="section-label mb-3">Plain-English Guide</p>
        <h3 className="card-title text-2xl font-semibold text-white">{title}</h3>
      </div>

      <div className="explain-grid">
        {items.map((item, index) => (
          <motion.article
            key={item.term}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.08 }}
            className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5"
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-2 text-cyan-300">
                <RiInformation2Line />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{item.term}</p>
                {item.short ? <p className="text-xs text-slate-400">{item.short}</p> : null}
              </div>
            </div>
            <p className="text-sm leading-7 text-slate-300">{item.meaning}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
