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
import { Dashboard } from "./components/Dashboard";
import { Timer } from "./components/Timer";
import { Login } from "./components/Login"; // ✅ Imported cleanly

export default function App() {
  const { slug, problemData } = useProblemContext();
  const [userKey, setUserKey] = useState("");
  const [aiProvider, setAiProvider] = useState<"groq" | "openai">("groq");
  const [showSettings, setShowSettings] = useState(false);
  const [showLogger, setShowLogger] = useState(false);
  const [showTimerOverlay, setShowTimerOverlay] = useState(false);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [timeTaken, setTimeTaken] = useState(0);

  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);

  const [token, setToken] = useState<string | null>(null);
  const [quickPromptsFromApi, setQuickPromptsFromApi] = useState<
    { label: string; text: string }[] | null
  >(null);

  // 1. Initialize User, Token & Key
  useEffect(() => {
    chrome.storage.local.get(
      ["groqKey", "gymUserId", "gymToken", "preferredLanguage"],
      (res) => {
        if (res.groqKey) setUserKey(res.groqKey as string);
        if (res.openaiApiKey) setUserKey(res.openaiApiKey as string);
        if (res.aiProvider) setAiProvider(res.aiProvider as "groq" | "openai");
        if (res.gymUserId) setUserId(res.gymUserId as string);
        if (res.gymToken) setToken(res.gymToken as string);
        if (res.preferredLanguage) setLanguage(res.preferredLanguage as string);
        setIsAuthChecking(false);
      },
    );
  }, []);

  // Load quick prompts from API when logged in
  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_URL || "";
    if (!token || !apiBase) {
      setQuickPromptsFromApi(null);
      return;
    }
    const url = apiBase.replace(/\/api\/?$/, "") + "/api/settings";
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : null))
      .then(
        (
          data: {
            quickPrompts?: { label: string; text: string }[];
            preferredLanguage?: string;
            aiProvider?: "groq" | "openai";
          } | null,
        ) => {
          if (!data) {
            setQuickPromptsFromApi(null);
            return;
          }
          if (
            Array.isArray(data.quickPrompts) &&
            data.quickPrompts.length > 0
          ) {
            setQuickPromptsFromApi(data.quickPrompts);
          } else {
            setQuickPromptsFromApi(null);
          }
          if (data.preferredLanguage) {
            setLanguage(data.preferredLanguage);
            chrome.storage.local.set({
              preferredLanguage: data.preferredLanguage,
            });
          }
        },
      )
      .catch(() => setQuickPromptsFromApi(null));
  }, [token]);

  // Handler: When user logs in via UI
  const handleLoginSuccess = (id: string, authToken: string) => {
    chrome.storage.local.set({ gymUserId: id, gymToken: authToken });
    setUserId(id);
    setToken(authToken);
  };

  // Handler: Logout
  const handleLogout = () => {
    if (confirm("Log out?")) {
      chrome.storage.local.remove(["gymUserId", "gymToken"]);
      setUserId(null);
      setToken(null);
    }
  };

  // 2. Chat Logic
  const { messages, loading, sendMessage, setMessages } = useChatStream(
    problemData,
    userKey,
    slug,
    token,
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

  // 1. Loading Screen (While checking storage)
  if (isAuthChecking) {
    return (
      <div
        className="h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--bg)" }}
      >
        <Loader2 className="animate-spin" style={{ color: "var(--green)" }} />
      </div>
    );
  }

  // 2. Auth Gate (If no user, show Login)
  if (!userId) {
    return <Login onLogin={handleLoginSuccess} />;
  }

  // 3. Main App (Dashboard needs token for API)
  if (!slug) {
    return <Dashboard userId={userId} token={token} onLogout={handleLogout} />;
  }

  // 4. Show Problem View (Chat)
  return (
    <div
      className="h-screen flex flex-col font-sans"
      style={{
        backgroundColor: "var(--bg)",
        color: "var(--text)",
      }}
    >
      <Header
        title={problemData?.title || "Unknown Problem"}
        difficulty={problemData?.difficulty || "Unknown"}
        onToggleTimer={() => setShowTimerOverlay((v) => !v)}
        onSettings={() => setShowSettings(!showSettings)}
        onClear={handleClear}
        onLogout={handleLogout}
      />

      {/* Settings Drawer */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b overflow-hidden"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            <div className="p-4 space-y-2">
              <label
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: "var(--text-2)" }}
              >
                AI Provider & API Key
              </label>
              <div className="mb-2">
                <select
                  value={aiProvider || "groq"}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "groq" || val === "openai") {
                      setAiProvider(val);
                      chrome.storage.local.set({ aiProvider: val });
                      if (token) {
                        const apiBase = import.meta.env.VITE_API_URL || "";
                        const url =
                          apiBase.replace(/\/api\/?$/, "") + "/api/settings";
                        fetch(url, {
                          method: "PATCH",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify({ aiProvider: val }),
                        }).catch(() => {});
                      }
                    }
                  }}
                  className="w-full rounded-md px-3 py-1.5 text-xs outline-none transition-all"
                  style={{
                    backgroundColor: "var(--surface)",
                    borderColor: "var(--border)",
                    color: "var(--text)",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--green)";
                    e.target.style.boxShadow = "0 0 0 1px var(--green)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "var(--border)";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  <option
                    value="groq"
                    style={{
                      backgroundColor: "var(--surface)",
                      color: "var(--text)",
                    }}
                  >
                    Groq
                  </option>
                  <option
                    value="openai"
                    style={{
                      backgroundColor: "var(--surface)",
                      color: "var(--text)",
                    }}
                  >
                    OpenAI
                  </option>
                </select>
              </div>
              <label
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: "var(--text-2)" }}
              >
                {(aiProvider || "groq") === "groq" ? "Groq" : "OpenAI"} API Key
                (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={userKey}
                  onChange={(e) => setUserKey(e.target.value)}
                  placeholder={aiProvider === "groq" ? "gsk_..." : "sk-..."}
                  className="flex-1 rounded-md px-3 py-1.5 text-xs outline-none transition-colors border"
                  style={{
                    backgroundColor: "var(--surface)",
                    borderColor: "var(--border)",
                    color: "var(--text)",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--green)";
                    e.target.style.boxShadow = "0 0 0 1px var(--green)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "var(--border)";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  onClick={() => {
                    const keyName =
                      aiProvider === "groq" ? "groqKey" : "openaiApiKey";
                    chrome.storage.local.set({ [keyName]: userKey });
                    setShowSettings(false);
                    if (token) {
                      const apiBase = import.meta.env.VITE_API_URL || "";
                      const url =
                        apiBase.replace(/\/api\/?$/, "") + "/api/settings";
                      fetch(url, {
                        method: "PATCH",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                          [aiProvider === "groq"
                            ? "groqApiKey"
                            : "openaiApiKey"]: userKey.trim() || null,
                        }),
                      }).catch(() => {});
                    }
                  }}
                  className="px-3 py-1.5 rounded-md text-xs font-bold transition-colors"
                  style={{
                    backgroundColor: "var(--green)",
                    color: "#000000",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "var(--green-hover)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--green)";
                  }}
                >
                  Save
                </button>
              </div>
            </div>
            <div className="p-4 space-y-2 mt-2">
              <label
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: "var(--text-2)" }}
              >
                Preferred Language
              </label>
              <select
                value={language}
                onChange={(e) => {
                  const val = e.target.value;
                  setLanguage(val);
                  chrome.storage.local.set({ preferredLanguage: val });
                  if (token) {
                    const apiBase = import.meta.env.VITE_API_URL || "";
                    const url =
                      apiBase.replace(/\/api\/?$/, "") + "/api/settings";
                    fetch(url, {
                      method: "PATCH",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({ preferredLanguage: val }),
                    }).catch(() => {});
                  }
                }}
                className="w-full rounded-md px-3 py-1.5 text-xs outline-none transition-all border"
                style={{
                  backgroundColor: "var(--surface)",
                  borderColor: "var(--border)",
                  color: "var(--text)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--green)";
                  e.target.style.boxShadow = "0 0 0 1px var(--green)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--border)";
                  e.target.style.boxShadow = "none";
                }}
              >
                <option
                  value="cpp"
                  style={{
                    backgroundColor: "var(--surface)",
                    color: "var(--text)",
                  }}
                >
                  C++
                </option>
                <option
                  value="java"
                  style={{
                    backgroundColor: "var(--surface)",
                    color: "var(--text)",
                  }}
                >
                  Java
                </option>
                <option
                  value="python"
                  style={{
                    backgroundColor: "var(--surface)",
                    color: "var(--text)",
                  }}
                >
                  Python
                </option>
                <option
                  value="javascript"
                  style={{
                    backgroundColor: "var(--surface)",
                    color: "var(--text)",
                  }}
                >
                  JavaScript
                </option>
                <option
                  value="typescript"
                  style={{
                    backgroundColor: "var(--surface)",
                    color: "var(--text)",
                  }}
                >
                  TypeScript
                </option>
                <option
                  value="go"
                  style={{
                    backgroundColor: "var(--surface)",
                    color: "var(--text)",
                  }}
                >
                  Go
                </option>
                <option
                  value="rust"
                  style={{
                    backgroundColor: "var(--surface)",
                    color: "var(--text)",
                  }}
                >
                  Rust
                </option>
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Prompts (spec: between header and chat) */}
      {!loading && (
        <div
          className="shrink-0 overflow-x-auto overflow-y-hidden border-b"
          style={{
            padding: "8px 12px 4px",
            backgroundColor: "var(--bg)",
            borderColor: "var(--border)",
          }}
        >
          <QuickPrompts onSelect={handleSend} prompts={quickPromptsFromApi} />
        </div>
      )}

      {/* Chat Area (flex-1, scroll) — Timer overlay lives here */}
      <div className="flex-1 overflow-y-auto min-h-0 relative flex flex-col">
        <Timer
          slug={slug}
          difficulty={problemData?.difficulty || "Medium"}
          onTimeUpdate={(time) => setTimeTaken(time)}
          showOverlay={showTimerOverlay}
          onClose={() => setShowTimerOverlay(false)}
        />
        <div className="flex-1 min-h-0 p-3 pb-2">
          {messages.length === 0 && (
            <div
              className="flex flex-col items-center justify-center text-center py-14 px-4 rounded-lg border border-dashed"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--surface)",
              }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-3 border"
                style={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border-2)",
                  color: "var(--green)",
                }}
              >
                <span className="text-xl" aria-hidden>💬</span>
              </div>
              <p
                className="font-semibold mb-1"
                style={{ color: "var(--text)", fontSize: "14px" }}
              >
                Start a conversation
              </p>
              <p
                className="max-w-[260px] leading-relaxed"
                style={{ color: "var(--muted)", fontSize: "12px" }}
              >
                Ask a question, request a hint, or tap a quick prompt above.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {messages.map((m, i) => (
              <MessageBubble
                key={i}
                role={m.role}
                content={m.content}
                isError={m.isError}
                onAction={() => setShowSettings(true)}
              />
            ))}

            {loading && messages[messages.length - 1]?.role !== "assistant" && (
              <div
                className="flex items-start gap-2 py-1"
                style={{ color: "var(--text-2)", fontSize: "13px" }}
              >
                <div
                  className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center border"
                  style={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                  }}
                >
                  <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: "var(--green)" }} />
                </div>
                <div
                  className="px-3 py-2 rounded border"
                  style={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    fontFamily: "var(--mono)",
                  }}
                >
                  Thinking…
                </div>
              </div>
            )}
          </div>
          <div ref={scrollRef} />
        </div>
      </div>

      {/* Input Bar */}
      <div
        className="shrink-0 border-t"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border)",
          padding: "10px 12px 12px",
        }}
      >
        {showLogger ? (
          <WorkoutLogger
            slug={slug}
            title={problemData?.title}
            token={token}
            onLogComplete={() => setShowLogger(false)}
            messages={messages}
            problemContext={{
              title: problemData?.questionTitle || problemData?.title,
              difficulty: problemData?.difficulty,
              description: problemData?.content || problemData?.question,
            }}
            onCancel={() => setShowLogger(false)}
            timeTaken={timeTaken}
            language={language}
          />
        ) : (
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setShowLogger(true)}
              title="Log Workout"
              className="shrink-0 p-2.5 border rounded-md transition-all"
              style={{
                backgroundColor: "var(--card)",
                borderColor: "var(--border)",
                color: "var(--text-2)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--green)";
                e.currentTarget.style.borderColor = "var(--border-green)";
                e.currentTarget.style.backgroundColor = "var(--green-dim)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-2)";
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.backgroundColor = "var(--card)";
              }}
            >
              <Code2 size={16} />
            </button>
            <div className="relative flex-1 min-w-0">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                  if (e.key === "Escape") setInput("");
                }}
                placeholder="Ask a question or request a hint…"
                className="w-full rounded-md pl-3 pr-11 py-2.5 text-sm outline-none transition-all border resize-none"
                style={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                  color: "var(--text)",
                  fontFamily: "var(--mono)",
                  fontSize: "13px",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--green)";
                  e.target.style.boxShadow = "var(--shadow-green)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--border)";
                  e.target.style.boxShadow = "none";
                }}
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                title="Send"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-md flex items-center justify-center transition-all disabled:opacity-40"
                style={{
                  backgroundColor:
                    input.trim() && !loading ? "var(--green)" : "transparent",
                  color: input.trim() && !loading ? "#000000" : "var(--text-2)",
                }}
                onMouseEnter={(e) => {
                  if (!loading && input.trim()) {
                    e.currentTarget.style.backgroundColor =
                      "var(--green-hover)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    input.trim() && !loading ? "var(--green)" : "transparent";
                }}
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer / Status (spec: 32px, quota left, timer right) */}
      <footer
        className="shrink-0 flex items-center justify-between border-t px-3"
        style={{
          height: "32px",
          backgroundColor: "var(--bg)",
          borderColor: "var(--border)",
          fontFamily: "var(--mono)",
          fontSize: "10px",
          color: "var(--muted)",
        }}
      >
        <span>
          {userKey ? (
            <span style={{ color: "var(--green)" }}>● Unlimited</span>
          ) : (
            "Community pool"
          )}
        </span>
        {timeTaken > 0 && (
          <span className="tabular-nums" style={{ color: "var(--green)" }}>
            {Math.floor(timeTaken / 60)}:
            {(timeTaken % 60).toString().padStart(2, "0")}
          </span>
        )}
      </footer>
    </div>
  );
}
