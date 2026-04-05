import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  RiArrowRightUpLine,
  RiBarChartGroupedLine,
  RiBrainLine,
  RiFlashlightLine,
  RiLineChartLine,
  RiRadarLine,
  RiShieldCheckLine,
  RiSparklingLine,
  RiStackLine,
  RiVerifiedBadgeLine,
} from "react-icons/ri";

import AnimatedBackdrop from "../components/layout/AnimatedBackdrop";
import { usePremiumScroll } from "../hooks/usePremiumScroll.jsx";
import { useTheme } from "../hooks/useTheme.jsx";
import { apiClient } from "../lib/api";
import { formatDemand } from "../lib/formatters";

gsap.registerPlugin(ScrollTrigger);

const signals = [
  "PPAC benchmark alignment",
  "Petrol and diesel demand trends",
  "Historical and forecast analytics",
  "AI petroleum analyst",
  "Industry workflow visibility",
  "Explainable forecast bands",
  "Planning-ready outlooks",
];

const features = [
  {
    title: "Official benchmark validation",
    description: "Historical totals are compared to PPAC annual figures to check whether the base data stays close to public industry numbers.",
    icon: RiVerifiedBadgeLine,
  },
  {
    title: "Demand workflow visibility",
    description: "The platform maps how petroleum demand moves from historical data to forecasting, AI analysis, and planning output.",
    icon: RiSparklingLine,
  },
  {
    title: "Forecast clarity",
    description: "RMSE, likely range, and month-wise planning views are explained in plain language for business users.",
    icon: RiLineChartLine,
  },
  {
    title: "AI narrative layer",
    description: "The chatbot explains demand drops, recovery phases, growth momentum, and long-horizon projections.",
    icon: RiBrainLine,
  },
  {
    title: "Transport and energy planning",
    description: "Useful for petroleum companies, policy teams, downstream planning, and mobility demand reviews.",
    icon: RiBarChartGroupedLine,
  },
  {
    title: "Scalable data product",
    description: "FastAPI, React, env-based configuration, and diagnostics keep the forecasting platform extensible.",
    icon: RiStackLine,
  },
];

export default function LandingPagePremium() {
  const [dashboard, setDashboard] = useState(null);
  const { theme, toggleTheme } = useTheme();

  usePremiumScroll(true);

  useEffect(() => {
    const context = gsap.context(() => {
      gsap.fromTo(
        ".premium-hero-line span",
        { y: 120, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 1, ease: "power4.out" },
      );

      gsap.utils.toArray(".scroll-reveal").forEach((item) => {
        gsap.fromTo(
          item,
          { y: 56, opacity: 0, clipPath: "inset(0% 0% 18% 0%)" },
          {
            y: 0,
            opacity: 1,
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: {
              trigger: item,
              start: "top 82%",
            },
          },
        );
      });

      gsap.utils.toArray(".parallax-card").forEach((item, index) => {
        gsap.to(item, {
          yPercent: index % 2 === 0 ? -8 : 8,
          ease: "none",
          scrollTrigger: {
            trigger: item,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });
    });

    return () => context.revert();
  }, []);

  useEffect(() => {
    apiClient.getDashboard(10).then(setDashboard).catch(() => {});
  }, []);

  const kpis = dashboard?.kpis;
  const reality = dashboard?.reality_check;

  return (
    <div className="page-shell backdrop-noise px-4 py-4 sm:px-6">
      <AnimatedBackdrop />
      <div className="relative mx-auto max-w-[1500px] space-y-8">
        <header className="glass-panel landing-frame premium-card flex flex-col gap-4 rounded-[2rem] px-6 py-4 md:flex-row md:items-center md:justify-between">
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
            <Link to="/app/dashboard" className="rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 py-3 font-semibold text-slate-950">
              Open Dashboard
            </Link>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="glass-panel landing-frame premium-card spot-card rounded-[2.8rem] px-8 py-10 lg:px-12 lg:py-14">
            <p className="section-label mb-5">Petroleum Demand Intelligence</p>
            <div className="text-reveal-line premium-hero-line">
              <span className="card-title text-4xl font-bold text-white md:text-6xl">Petrol and diesel</span>
            </div>
            <div className="text-reveal-line premium-hero-line">
              <span className="serif-kicker text-5xl font-semibold italic text-emerald-200 md:text-7xl">forecasting</span>
            </div>
            <div className="text-reveal-line premium-hero-line">
              <span className="card-title text-4xl font-bold text-white md:text-6xl">for Indian petroleum</span>
            </div>
            <div className="text-reveal-line premium-hero-line">
              <span className="accent-text card-title text-4xl font-bold md:text-6xl">planning and analytics.</span>
            </div>

            <p className="mt-8 max-w-3xl text-lg leading-8 text-slate-300">
              Explore historical petroleum demand, compare petrol and diesel outlooks, validate annual figures against
              PPAC reports, and understand how the forecasting workflow supports downstream planning decisions.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/app/forecast" className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-6 py-3 font-semibold text-slate-950">
                Launch Forecast Studio
                <RiArrowRightUpLine />
              </Link>
              <Link to="/app/chatbot" className="rounded-2xl border border-white/10 px-6 py-3 font-semibold text-white transition hover:border-emerald-400/30 hover:bg-white/5">
                Open AI Copilot
              </Link>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <div className="neo-panel rounded-[1.7rem] p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Latest Petrol</p>
                <p className="card-title mt-3 text-3xl font-bold text-white">{kpis ? formatDemand(kpis.latest_petrol_demand) : "--"}</p>
              </div>
              <div className="neo-panel rounded-[1.7rem] p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Latest Diesel</p>
                <p className="card-title mt-3 text-3xl font-bold text-white">{kpis ? formatDemand(kpis.latest_diesel_demand) : "--"}</p>
              </div>
              <div className="neo-panel rounded-[1.7rem] p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Model RMSE</p>
                <p className="card-title mt-3 text-3xl font-bold text-white">{kpis ? kpis.model_rmse : "--"}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-panel landing-frame premium-card parallax-card rounded-[2.2rem] p-7">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="section-label mb-3">Data Validation</p>
                  <h3 className="card-title text-2xl font-semibold text-white">Dataset vs official PPAC annual totals</h3>
                </div>
                <span className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-emerald-300">
                  <RiVerifiedBadgeLine />
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="premium-stat rounded-[1.6rem] border border-white/10 p-5">
                  <p className="text-sm text-slate-300">Petrol dataset gap</p>
                  <p className="card-title mt-3 text-3xl font-bold text-white">{reality ? `${reality.dataset_alignment.petrol_gap_pct}%` : "--"}</p>
                  <p className="mt-2 text-xs text-slate-500">37219.362 vs 37219 official</p>
                </div>
                <div className="premium-stat rounded-[1.6rem] border border-white/10 p-5">
                  <p className="text-sm text-slate-300">Diesel dataset gap</p>
                  <p className="card-title mt-3 text-3xl font-bold text-white">{reality ? `${reality.dataset_alignment.diesel_gap_pct}%` : "--"}</p>
                  <p className="mt-2 text-xs text-slate-500">89626.171 vs 89655 official</p>
                </div>
              </div>
            </div>

            <div className="glass-panel landing-frame premium-card parallax-card rounded-[2.2rem] p-7">
              <p className="section-label mb-3">Forecast vs Actual</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-white">Petrol 2024 model gap</p>
                  <p className="card-title mt-3 text-3xl font-bold text-white">{reality ? `${reality.forecast_alignment.petrol_2024_error_pct}%` : "--"}</p>
                  <p className="mt-2 text-xs text-slate-500">38746 model vs 40005 PPAC</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-white">Diesel 2024 model gap</p>
                  <p className="card-title mt-3 text-3xl font-bold text-white">{reality ? `${reality.forecast_alignment.diesel_2024_error_pct}%` : "--"}</p>
                  <p className="mt-2 text-xs text-slate-500">86811 model vs 91407 PPAC</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="glass-panel rounded-[2rem] p-4 scroll-reveal">
          <div className="marquee-shell">
            <div className="marquee-track">
              {[...signals, ...signals].map((item, index) => (
                <span key={`${item}-${index}`} className="marquee-pill">
                  <RiFlashlightLine className="text-cyan-300" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="story-grid premium-section">
          <div className="glass-panel landing-frame premium-card pin-copy rounded-[2.2rem] p-8 scroll-reveal">
            <p className="section-label mb-4">Industry Workflow</p>
            <p className="serif-kicker text-3xl font-semibold text-emerald-200 md:text-4xl">From demand history to planning insight.</p>
            <h3 className="card-title mt-3 text-4xl font-semibold text-white">This platform is built to show how petroleum demand data becomes a usable forecast for planning teams.</h3>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              Historical demand is validated, tuned annual models generate petrol and diesel outlooks, and the result is
              surfaced through charts, tables, and AI summaries that support transport, supply, and downstream reviews.
            </p>
          </div>

          <div className="space-y-5">
            <article className="glass-panel landing-frame premium-card parallax-card scroll-reveal rounded-[2rem] p-6">
              <p className="section-label mb-3">Petrol Demand</p>
              <h4 className="card-title text-2xl font-semibold text-white">Petrol demand reflects passenger mobility, retail fuel offtake, and long-term consumption growth.</h4>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                In India, petrol consumption is strongly linked with personal mobility, two-wheelers, cars, and urban transport demand. That is why relative growth in petrol can stay strong even when total diesel volume remains larger.
              </p>
            </article>

            <article className="glass-panel landing-frame premium-card parallax-card scroll-reveal rounded-[2rem] p-6">
              <p className="section-label mb-3">Diesel Demand</p>
              <h4 className="card-title text-2xl font-semibold text-white">Diesel remains the larger fuel block because freight, agriculture, logistics, and industry still lean heavily on it.</h4>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                Diesel is central to trucking, mining, construction, irrigation, backup power, and parts of industrial movement. That makes diesel demand structurally important in petroleum planning.
              </p>
            </article>

            <article className="glass-panel landing-frame premium-card parallax-card scroll-reveal rounded-[2rem] p-6">
              <p className="section-label mb-3">Forecast Workflow</p>
              <h4 className="card-title text-2xl font-semibold text-white">The current workflow moves from validated annual data to tuned forecasting, then into planning visuals and AI interpretation.</h4>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                This gives users one place to inspect historical levels, compare future outlooks, and understand what the model is saying without digging through raw files.
              </p>
            </article>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {features.map(({ title, description, icon: Icon }) => (
            <motion.article key={title} whileHover={{ y: -6 }} className="glass-panel landing-frame premium-card scroll-reveal rounded-[1.9rem] p-6">
              <div className="mb-5 inline-flex rounded-2xl border border-white/10 bg-white/5 p-3 text-2xl text-cyan-300">
                <Icon />
              </div>
              <h4 className="card-title text-xl font-semibold text-white">{title}</h4>
              <p className="mt-3 text-sm leading-7 text-slate-400">{description}</p>
            </motion.article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="glass-panel landing-frame premium-card scroll-reveal rounded-[2rem] p-8">
            <p className="section-label mb-4">Workflow Snapshot</p>
            <h3 className="card-title text-3xl font-semibold text-white">How the petroleum forecasting flow works inside the platform</h3>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="neo-panel rounded-[1.6rem] p-5">
                <RiShieldCheckLine className="text-2xl text-cyan-300" />
                <p className="card-title mt-4 text-lg font-semibold text-white">Validate source data</p>
              </div>
              <div className="neo-panel rounded-[1.6rem] p-5">
                <RiRadarLine className="text-2xl text-cyan-300" />
                <p className="card-title mt-4 text-lg font-semibold text-white">Generate forecast range</p>
              </div>
              <div className="neo-panel rounded-[1.6rem] p-5">
                <RiBarChartGroupedLine className="text-2xl text-cyan-300" />
                <p className="card-title mt-4 text-lg font-semibold text-white">Review planning charts</p>
              </div>
            </div>
          </div>

          <div className="glass-panel landing-frame premium-card scroll-reveal rounded-[2rem] p-8">
            <p className="section-label mb-4">Petroleum Notes</p>
            <h3 className="card-title text-3xl font-semibold text-white">Terms and context that matter on this website</h3>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="neo-panel rounded-[1.6rem] p-5">
                <p className="text-sm font-semibold text-white">Confidence interval</p>
                <p className="mt-3 text-sm leading-7 text-slate-400">The likely range around the central forecast number.</p>
              </div>
              <div className="neo-panel rounded-[1.6rem] p-5">
                <p className="text-sm font-semibold text-white">RMSE</p>
                <p className="mt-3 text-sm leading-7 text-slate-400">Average model error against known past values.</p>
              </div>
              <div className="neo-panel rounded-[1.6rem] p-5">
                <p className="text-sm font-semibold text-white">Benchmark source</p>
                <p className="mt-3 text-sm leading-7 text-slate-400">PPAC annual industry consumption figures are used as the main public reality check.</p>
              </div>
              <div className="neo-panel rounded-[1.6rem] p-5">
                <p className="text-sm font-semibold text-white">Month-wise mode</p>
                <p className="mt-3 text-sm leading-7 text-slate-400">A planning-friendly split derived from annual forecasts.</p>
              </div>
            </div>
          </div>
        </section>

        <footer className="glass-panel landing-frame premium-card scroll-reveal mb-10 rounded-[2.2rem] p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="section-label mb-3">Petroleum Planning Platform</p>
              <h3 className="card-title text-3xl font-semibold text-white">Explore validated data, forecasting workflow, and petrol-diesel demand outlooks in one place</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/app/dashboard" className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 py-3 font-semibold text-slate-950">
                Enter Platform
                <RiArrowRightUpLine />
              </Link>
              <Link to="/app/forecast" className="rounded-2xl border border-white/10 px-5 py-3 font-semibold text-white transition hover:border-emerald-400/30 hover:bg-white/5">
                Run Forecast
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
