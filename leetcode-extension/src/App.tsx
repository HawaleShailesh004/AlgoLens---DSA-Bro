import { useState, useEffect, useRef } from "react";
import { Send, Loader2, Code2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

// Imports
import { useProblemContext } from "./hooks/useProblemContext";
import { useChatStream } from "./hooks/useChatStream";
import { Header } from "./components/Header";
import { MessageBubble } from "./components/MessageBubble";
import { QuickPrompts } from "./components/QuickPrompts";
import { WorkoutLogger } from "./components/WorkoutLogger";
import { Dashboard } from "./components/Dashboard"; // ✅ Imported cleanly

export default function App() {
  const { slug, problemData } = useProblemContext();
  const [userKey, setUserKey] = useState("");
  const [userId, setUserId] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showLogger, setShowLogger] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Initialize User & Key
  useEffect(() => {
    chrome.storage.local.get(["groqKey", "gymUserId"], (res) => {
      if (res.groqKey) setUserKey(res.groqKey as string);

      // User Identity for Database
      if (res.gymUserId) {
        setUserId(res.gymUserId as string);
      } else {
        const newId = crypto.randomUUID();
        chrome.storage.local.set({ gymUserId: newId });
        setUserId(newId);
      }
    });
  }, []);

  // 2. Chat Logic
  const { messages, loading, sendMessage, setMessages } = useChatStream(
    problemData,
    userKey,
    slug
  );

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleClear = () => {
    if (confirm("Clear conversation?")) {
      setMessages([]);
      if (slug) chrome.storage.local.remove([`chat_${slug}`]);
    }
  };

  const handleSend = (text = input) => {
    if (!text.trim()) return;
    sendMessage(text);
    setInput("");
  };

  // --- VIEW CONTROLLER ---

  // 1. Show Dashboard if no problem is detected on screen
  if (!slug) {
    return <Dashboard userId={userId} />;
  }

  // 2. Show Problem View (Chat)
  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-zinc-100 font-sans selection:bg-orange-500/30">
      <Header
        title={problemData?.title}
        difficulty={problemData?.difficulty}
        onSettings={() => setShowSettings(!showSettings)}
        onClear={handleClear}
      />

      {/* Settings Drawer */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-zinc-900 border-b border-zinc-800 overflow-hidden"
          >
            <div className="p-4 space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Groq API Key (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={userKey}
                  onChange={(e) => setUserKey(e.target.value)}
                  placeholder="gsk_..."
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-md px-3 py-1.5 text-xs focus:border-orange-500 outline-none transition-colors"
                />
                <button
                  onClick={() => {
                    chrome.storage.local.set({ groqKey: userKey });
                    setShowSettings(false);
                  }}
                  className="bg-orange-600 hover:bg-orange-500 text-white px-3 py-1.5 rounded-md text-xs font-bold transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-100 mt-4">
            <div className="bg-zinc-900/50 p-4 rounded-full mb-4 ring-1 ring-white/5">
              <Code2 className="w-8 h-8 text-zinc-500" />
            </div>
            <p className="text-sm font-medium text-zinc-300">Ready to code.</p>
            <p className="text-xs text-zinc-500 max-w-[200px] mt-1">
              Select a quick prompt below or type your question.
            </p>
          </div>
        )}

        {messages.map((m, i) => (
          <MessageBubble
            key={i}
            role={m.role}
            content={m.content}
            isError={m.isError} // Pass the error flag
            onAction={() => setShowSettings(true)} // Opens the settings drawer!
          />
        ))}

        {loading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex items-center gap-2 text-zinc-500 text-xs ml-2">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Analyzing...</span>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Footer Section */}
      <div className="bg-zinc-900/50 border-t border-zinc-800 backdrop-blur-sm">
        {/* Toggle between Input and Logger */}
        {showLogger ? (
          <WorkoutLogger
            slug={slug}
            title={problemData?.title}
            userId={userId}
            onLogComplete={() => setShowLogger(false)}
          />
        ) : (
          <>
            {/* Quick Prompts */}
            {!loading && <QuickPrompts onSelect={handleSend} />}

            {/* Input Bar */}
            <div className="px-4 pb-2 pt-1 flex gap-2 items-center">
              <button
                onClick={() => setShowLogger(true)}
                title="Log Workout"
                className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-500 hover:text-green-500 hover:border-green-500/50 transition-all group"
              >
                <Code2
                  size={16}
                  className="group-hover:scale-110 transition-transform"
                />
              </button>

              <div className="relative flex-1">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask your gym bro..."
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm rounded-xl pl-4 pr-12 py-3 focus:border-orange-500/40 focus:ring-1 focus:ring-orange-500/40 outline-none shadow-inner transition-all placeholder:text-zinc-600"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={loading || !input.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-500 disabled:opacity-0 disabled:scale-90 transition-all shadow-lg shadow-orange-900/20"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
