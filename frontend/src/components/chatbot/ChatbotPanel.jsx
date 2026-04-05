import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiArrowUpLine, RiRobot2Line, RiSubtractLine } from "react-icons/ri";

import { streamChat } from "../../lib/api";

const starterPrompts = [
  "Show petrol growth trend",
  "Explain diesel demand change",
  "What will happen in 2030?",
  "Why did demand drop in 2020?",
];

export default function ChatbotPanel({ className = "", title = "AI Analytics Copilot", fuel = "combined" }) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Ask me about petroleum demand trends, forecast movement, growth drivers, or historical changes. I can explain the chart behavior in plain language.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  async function sendMessage(promptText = input) {
    const nextMessage = promptText.trim();
    if (!nextMessage || isThinking) {
      return;
    }

    const outgoing = { role: "user", content: nextMessage };
    const history = [...messages, outgoing];
    setMessages(history);
    setInput("");
    setIsThinking(true);

    try {
      let reply = "";
      setMessages((current) => [...current, { role: "assistant", content: "" }]);

      await streamChat(
        {
          message: nextMessage,
          fuel,
          years: 10,
          conversation: history.slice(-6).map(({ role, content }) => ({ role, content })),
        },
        (chunk) => {
          reply += chunk;
          setMessages((current) => {
            const updated = [...current];
            updated[updated.length - 1] = { role: "assistant", content: reply };
            return updated;
          });
        },
      );
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: error.message || "I could not fetch analysis right now.",
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  }

  return (
    <section className={`glass-panel rounded-[2rem] p-5 ${className}`}>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="section-label mb-3">AI Chatbot</p>
          <h3 className="card-title text-xl font-semibold text-white">{title}</h3>
        </div>
        <button
          type="button"
          onClick={() => setIsMinimized((current) => !current)}
          className="rounded-2xl border border-white/10 p-3 text-slate-200 transition hover:border-cyan-400/30 hover:text-white"
          aria-label="Minimize chatbot"
        >
          <RiSubtractLine />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {!isMinimized ? (
          <motion.div
            key="chat-open"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <div className="scrollbar-thin h-[420px] space-y-3 overflow-y-auto pr-1">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[88%] rounded-[1.4rem] px-4 py-3 text-sm leading-6 ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950"
                        : "border border-white/10 bg-white/5 text-slate-100"
                    }`}
                  >
                    <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.18em] opacity-75">
                      {message.role === "assistant" ? <RiRobot2Line /> : null}
                      {message.role}
                    </div>
                    <p>{message.content || (isThinking ? "Thinking..." : "")}</p>
                  </div>
                </div>
              ))}
              {isThinking ? (
                <div className="flex justify-start">
                  <div className="rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-300 [animation-delay:-0.2s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-300 [animation-delay:-0.1s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-amber-300" />
                    </span>
                  </div>
                </div>
              ) : null}
              <div ref={endRef} />
            </div>

            <div className="flex flex-wrap gap-2">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  className="rounded-full border border-white/10 px-3 py-2 text-xs text-slate-300 transition hover:border-emerald-400/30 hover:text-white"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <textarea
                rows={3}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask for demand insight, trend explanation, or 2030 forecast..."
                className="min-h-[84px] flex-1 rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
              />
              <button
                type="button"
                onClick={() => sendMessage()}
                disabled={isThinking}
                className="self-end rounded-[1.5rem] bg-gradient-to-r from-emerald-400 to-cyan-400 p-4 text-xl text-slate-950 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Send message"
              >
                <RiArrowUpLine />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="chat-closed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            type="button"
            onClick={() => setIsMinimized(false)}
            className="w-full rounded-[1.6rem] border border-dashed border-white/10 py-6 text-sm text-slate-300 transition hover:border-emerald-400/30 hover:text-white"
          >
            Open chatbot
          </motion.button>
        )}
      </AnimatePresence>
    </section>
  );
}
