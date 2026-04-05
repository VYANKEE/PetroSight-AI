import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import gsap from "gsap";
import {
  RiAiGenerate,
  RiArrowRightUpLine,
  RiBarChartGroupedLine,
  RiBrainLine,
  RiBuilding2Line,
  RiFlashlightLine,
  RiLineChartLine,
  RiPulseLine,
  RiRadarLine,
  RiShieldCheckLine,
  RiStackLine,
  RiTimeLine,
} from "react-icons/ri";

import AnimatedBackdrop from "../components/layout/AnimatedBackdrop";
import { useTheme } from "../hooks/useTheme.jsx";
import { apiClient } from "../lib/api";
import { formatDemand } from "../lib/formatters";

const marqueeItems = [
  "Forecast confidence bands",
  "Explainable model metrics",
  "Petrol and diesel outlooks",
  "2030 planning scenarios",
  "Boardroom-ready storytelling",
  "AI-powered trend summaries",
  "Monthly derived planning view",
  "Industrial glassmorphism UI",
];

const featureCards = [
  {
    title: "Live scenario generation",
    description: "Run year-wise and month-wise outlooks with visible confidence bounds and animated transitions.",
    icon: RiLineChartLine,
  },
  {
    title: "AI narrative layer",
    description: "Turn forecast curves into plain-language business insight using the integrated analyst chatbot.",
    icon: RiBrainLine,
  },
  {
    title: "Premium dashboard surface",
    description: "Sticky navigation, cinematic cards, premium charts, and better signal hierarchy for enterprise demos.",
    icon: RiBarChartGroupedLine,
  },
  {
    title: "Operational transparency",
    description: "RMSE, likely range, monthly derivation notes, and updated-history refitting are surfaced clearly.",
    icon: RiShieldCheckLine,
  },
  {
    title: "Decision speed",
    description: "Planning teams can compare fuels, periods, and growth without waiting on manual analysis decks.",
    icon: RiTimeLine,
  },
  {
    title: "Enterprise-ready structure",
    description: "FastAPI backend, modular frontend, environment-based keys, and production-style separation of concerns.",
    icon: RiStackLine,
  },
];

const plainEnglishItems = [
  {
    term: "Confidence interval",
    heading: "Likely range",
    body: "This shows the range where the forecast is reasonably expected to fall. A tighter band means more certainty.",
  },
  {
    term: "RMSE",
    heading: "Average model error",
    body: "RMSE tells you how far the model predictions usually were from actual values in past data. Lower is better.",
  },
  {
    term: "Forecast growth",
    heading: "Expected rise",
    body: "This compares the latest actual total demand with the projected demand at the end of the forecast horizon.",
  },
  {
    term: "Month-wise mode",
    heading: "Planning-friendly split",
    body: "Because the supplied models are yearly, monthly outputs are derived from the annual forecast using calibrated monthly shares.",
  },
];

const useCases = [
  {
    title: "Refinery and supply planning",
    description: "Estimate forward demand pressure before budgeting throughput, logistics, or allocation decisions.",
    icon: RiBuilding2Line,
  },
  {
    title: "Executive review packs",
    description: "Use premium visuals and plain-English explanations to present trends to leadership without reworking charts manually.",
    icon: RiPulseLine,
  },
  {
    title: "What-if horizon analysis",
    description: "Compare near-term and decade-long views across petrol, diesel, and combined petroleum demand.",
    icon: RiRadarLine,
  },
];

const pipeline = [
  "Data Collection",
  "Cleaning",
  "Feature Engineering",
  "Model Training",
  "Forecast Generation",
  "Visualization",
];

export default function LandingPage() {
  const [dashboard, setDashboard] = useState(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const context = gsap.context(() => {
      gsap.from(".hero-reveal", {
        y: 36,
        opacity: 0,
        duration: 0.9,
        stagger: 0.1,
        ease: "power3.out",
      });
      gsap.from(".reveal-section", {
        y: 28,
        opacity: 0,
        duration: 0.8,
        stagger: 0.08,
        ease: "power2.out",
        delay: 0.25,
      });
    });
    return () => context.revert();
  }, []);

  useEffect(() => {
    apiClient.getDashboard(10).then(setDashboard).catch(() => {});
  }, []);

  const dashboardKpis = dashboard?.kpis;

  return (
    <div className="page-shell px-4 py-4 sm:px-6">
      <AnimatedBackdrop />
      <div className="relative mx-auto max-w-[1480px] space-y-8">
        <header className="glass-panel premium-card flex flex-col gap-4 rounded-[2rem] px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="section-label mb-2">AI Petroleum Forecast Platform</p>
            <h1 className="card-title text-2xl font-bold text-white">PetroSight AI</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-white transition hover:border-cyan-400/30"
            >
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>
            <Link
              to="/app/how-it-works"
              className="rounded-2xl border border-white/10 px-5 py-3 font-semibold text-white transition hover:border-emerald-400/30 hover:bg-white/5"
            >
              See Workflow
            </Link>
            <Link
              to="/app/dashboard"
              className="rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 py-3 font-semibold text-slate-950"
            >
              Open Dashboard
            </Link>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="glass-panel premium-card hero-reveal rounded-[2.6rem] p-8 lg:p-12">
            <div className="glow-orb left-10 top-8 h-28 w-28 bg-emerald-400/40" />
            <div className="glow-orb right-12 top-24 h-24 w-24 bg-cyan-400/35" />
            <p className="section-label mb-5">Industrial-grade SaaS Experience</p>
            <h2 className="hero-reveal card-title max-w-4xl text-4xl font-bold leading-tight text-white md:text-6xl">
              <span className="accent-text">AI Petroleum Forecast Platform</span>
              <br />
              built to look sharp, explain itself, and feel premium from first scroll.
            </h2>
            <p className="hero-reveal mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Forecast Indian petrol and diesel demand, understand why curves move, and present future outlooks with a
              cinematic SaaS interface that still keeps the numbers readable for non-technical users.
            </p>

            <div className="hero-reveal mt-8 flex flex-wrap gap-3">
              <Link
                to="/app/forecast"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-6 py-3 font-semibold text-slate-950"
              >
                Launch Forecast Studio
                <RiArrowRightUpLine />
              </Link>
              <Link
                to="/app/chatbot"
                className="rounded-2xl border border-white/10 px-6 py-3 font-semibold text-white transition hover:border-emerald-400/30 hover:bg-white/5"
              >
                Open AI Copilot
              </Link>
            </div>

            <div className="hero-reveal mt-10 grid gap-4 md:grid-cols-3">
              <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Latest Petrol</p>
                <p className="card-title mt-3 text-3xl font-bold text-white">
                  {dashboardKpis ? formatDemand(dashboardKpis.latest_petrol_demand) : "--"}
                </p>
              </div>
              <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Latest Diesel</p>
                <p className="card-title mt-3 text-3xl font-bold text-white">
                  {dashboardKpis ? formatDemand(dashboardKpis.latest_diesel_demand) : "--"}
                </p>
              </div>
              <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Growth Outlook</p>
                <p className="card-title mt-3 text-3xl font-bold text-white">
                  {dashboardKpis ? `${dashboardKpis.forecast_growth_pct}%` : "--"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <motion.article
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.15 }}
              className="glass-panel premium-card floating-card rounded-[2.2rem] p-7"
            >
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="section-label mb-3">Live Forecast Snapshot</p>
                  <h3 className="card-title text-2xl font-semibold text-white">2035 horizon pulse</h3>
                </div>
                <span className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-emerald-300">
                  <RiAiGenerate />
                </span>
              </div>
              <div className="space-y-4">
                <div className="rounded-[1.6rem] border border-emerald-400/15 bg-emerald-400/10 p-5">
                  <p className="text-sm text-emerald-100">Model RMSE</p>
                  <p className="card-title mt-3 text-3xl font-bold text-white">
                    {dashboardKpis ? dashboardKpis.model_rmse : "--"}
                  </p>
                  <p className="mt-2 text-sm text-emerald-50/80">Lower RMSE means the model was closer to real historical values.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5">
                    <p className="text-sm text-slate-400">Last updated year</p>
                    <p className="card-title mt-3 text-2xl font-bold text-white">
                      {dashboardKpis ? dashboardKpis.last_updated_year : "--"}
                    </p>
                  </div>
                  <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5">
                    <p className="text-sm text-slate-400">Data clarity</p>
                    <p className="card-title mt-3 text-2xl font-bold text-white">High</p>
                  </div>
                </div>
              </div>
            </motion.article>

            <motion.article
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.26 }}
              className="glass-panel premium-card floating-card delay rounded-[2.2rem] p-7"
            >
              <p className="section-label mb-3">Why it feels premium</p>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-white">Moving text bands</p>
                  <p className="mt-2 text-sm leading-7 text-slate-400">Adds motion without making the data hard to read.</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-white">Animated scenario states</p>
                  <p className="mt-2 text-sm leading-7 text-slate-400">Forecast actions now feel active and responsive.</p>
                </div>
              </div>
            </motion.article>
          </div>
        </section>

        <section className="reveal-section glass-panel rounded-[2rem] p-4">
          <div className="marquee-shell">
            <div className="marquee-track">
              {[...marqueeItems, ...marqueeItems].map((item, index) => (
                <span key={`${item}-${index}`} className="marquee-pill">
                  <RiFlashlightLine className="text-cyan-300" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="glass-panel premium-card reveal-section rounded-[2.2rem] p-8 lg:sticky lg:top-6 lg:h-fit">
            <p className="section-label mb-4">Clear by default</p>
            <h3 className="card-title text-4xl font-semibold text-white">A forecast product that explains itself while it sells the vision</h3>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              The platform now leans more into premium SaaS storytelling: stronger spacing, more motion, clearer labels,
              richer scroll depth, and a friendlier explanation layer for terms like confidence interval and RMSE.
            </p>
            <div className="mt-8 space-y-3">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">Confidence interval</p>
                <p className="mt-2 text-sm text-slate-400">Think of it as the likely range around the main forecast number.</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">RMSE</p>
                <p className="mt-2 text-sm text-slate-400">This is the model's average error when compared with known past values.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {featureCards.map(({ title, description, icon: Icon }) => (
              <motion.article
                key={title}
                whileHover={{ y: -6 }}
                className="glass-panel premium-card reveal-section rounded-[1.9rem] p-6"
              >
                <div className="mb-5 inline-flex rounded-2xl border border-white/10 bg-white/5 p-3 text-2xl text-cyan-300">
                  <Icon />
                </div>
                <h4 className="card-title text-xl font-semibold text-white">{title}</h4>
                <p className="mt-3 text-sm leading-7 text-slate-400">{description}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-4">
          {plainEnglishItems.map((item) => (
            <article key={item.term} className="glass-panel premium-card reveal-section rounded-[1.9rem] p-6">
              <p className="section-label mb-4">{item.heading}</p>
              <h4 className="card-title text-2xl font-semibold text-white">{item.term}</h4>
              <p className="mt-4 text-sm leading-7 text-slate-300">{item.body}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="glass-panel premium-card reveal-section rounded-[2rem] p-8">
            <p className="section-label mb-4">SaaS Feel</p>
            <h3 className="card-title text-3xl font-semibold text-white">Premium motion without losing readability</h3>
            <p className="mt-4 text-lg leading-8 text-slate-300">
              Cards float subtly, text bands move, charts remain readable, and loading interactions feel deliberate.
              The aim is to make the product demo-worthy while keeping the data approachable.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {useCases.map(({ title, description, icon: Icon }) => (
                <div key={title} className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5">
                  <span className="mb-4 inline-flex rounded-2xl border border-white/10 bg-white/5 p-3 text-cyan-300">
                    <Icon />
                  </span>
                  <p className="card-title text-lg font-semibold text-white">{title}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-400">{description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel premium-card reveal-section rounded-[2rem] p-8">
            <p className="section-label mb-4">Model Flow</p>
            <h3 className="card-title text-3xl font-semibold text-white">How the platform turns raw history into premium analytics</h3>
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {pipeline.map((step, index) => (
                <div key={step} className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5">
                  <div className="mb-4 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                    Step {index + 1}
                  </div>
                  <p className="card-title text-lg font-semibold text-white">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="reveal-section glass-panel rounded-[2rem] p-4">
          <div className="marquee-shell">
            <div className="marquee-track reverse">
              {[...marqueeItems, ...marqueeItems].map((item, index) => (
                <span key={`reverse-${item}-${index}`} className="marquee-pill">
                  <RiPulseLine className="text-emerald-300" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <footer className="glass-panel premium-card reveal-section mb-10 rounded-[2.2rem] p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="section-label mb-3">Ready to demo</p>
              <h3 className="card-title text-3xl font-semibold text-white">Sharper visuals, stronger motion, clearer language</h3>
              <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-300">
                Use the landing page to sell the product, then move into the dashboard to show the actual forecast engine,
                explainers, and AI analysis in a way normal users can follow.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/app/dashboard"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 py-3 font-semibold text-slate-950"
              >
                Enter Platform
                <RiArrowRightUpLine />
              </Link>
              <Link
                to="/app/forecast"
                className="rounded-2xl border border-white/10 px-5 py-3 font-semibold text-white transition hover:border-emerald-400/30 hover:bg-white/5"
              >
                Run Forecast
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
