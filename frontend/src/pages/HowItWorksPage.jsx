import { useEffect } from "react";
import gsap from "gsap";
import {
  RiArchiveDrawerLine,
  RiBarChartGroupedLine,
  RiBubbleChartLine,
  RiDatabase2Line,
  RiFilterLine,
  RiRobot2Line,
} from "react-icons/ri";

const steps = [
  {
    title: "Data Collection",
    description: "Historical petroleum demand is loaded from curated annual consumption files for petrol and diesel.",
    icon: RiDatabase2Line,
  },
  {
    title: "Cleaning",
    description: "Series are normalized, typed, aligned, and validated before forecasting workflows run.",
    icon: RiFilterLine,
  },
  {
    title: "Feature Engineering",
    description: "Temporal indexing and structured profiles help create comparable historical and monthly analytics views.",
    icon: RiBubbleChartLine,
  },
  {
    title: "Model Training",
    description: "The supplied SARIMA checkpoint order is extracted and re-fitted on the latest full history for production use.",
    icon: RiArchiveDrawerLine,
  },
  {
    title: "Forecast Generation",
    description: "Forecast values and confidence intervals are generated for petrol, diesel, and combined demand horizons.",
    icon: RiBarChartGroupedLine,
  },
  {
    title: "Visualization",
    description: "Interactive charts, KPI cards, tables, and AI narration translate forecasts into business decisions.",
    icon: RiRobot2Line,
  },
];

export default function HowItWorksPage() {
  useEffect(() => {
    const context = gsap.context(() => {
      gsap.from(".pipeline-card", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.08,
        ease: "power3.out",
      });
    });
    return () => context.revert();
  }, []);

  return (
    <div className="space-y-6 pb-6">
      <section className="glass-panel rounded-[2rem] p-8">
        <p className="section-label mb-4">Explainability</p>
        <h1 className="card-title text-4xl font-bold text-white">From historical demand to AI-driven insights</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
          The platform combines refitted SARIMA forecasting, calibrated monthly disaggregation, and NVIDIA-backed AI
          analysis so the dashboard tells both the number and the story behind the number.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {steps.map(({ title, description, icon: Icon }, index) => (
          <article key={title} className="pipeline-card glass-panel rounded-[2rem] p-6">
            <div className="mb-5 flex items-center justify-between">
              <span className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-2xl text-cyan-300">
                <Icon />
              </span>
              <span className="metric-chip">Step {index + 1}</span>
            </div>
            <h2 className="card-title text-2xl font-semibold text-white">{title}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-400">{description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
