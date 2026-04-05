import ChatbotPanel from "../components/chatbot/ChatbotPanel";

export default function ChatbotPage() {
  return (
    <div className="space-y-6 pb-6">
      <section className="glass-panel rounded-[2rem] p-8">
        <p className="section-label mb-4">AI Assistant</p>
        <h1 className="card-title text-4xl font-bold text-white">Ask about trends, drops, growth, and 2030 scenarios</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
          The analytics chatbot uses historical demand summaries and forecast context to explain what changed, what is
          expected next, and how the current forecast should be interpreted by planning teams.
        </p>
      </section>

      <ChatbotPanel title="Full-screen analytics chatbot" className="min-h-[720px]" />
    </div>
  );
}
