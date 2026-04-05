export default function AnimatedBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="grid-lines absolute inset-0 opacity-40" />
      <div className="absolute left-[-8rem] top-20 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute right-[-4rem] top-[-3rem] h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="absolute bottom-[-8rem] left-1/3 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />
    </div>
  );
}
