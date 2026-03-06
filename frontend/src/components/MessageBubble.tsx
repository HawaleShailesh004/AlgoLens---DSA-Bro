import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { User, Bot, AlertCircle } from "lucide-react";
import { CodeBlock } from "./CodeBlock";
import { Mermaid } from "./Mermaid";
import { QuotaCard } from "./QuotaCard";

export const MessageBubble = ({
  role,
  content,
  isError,
  onAction,
}: {
  role: string;
  content: string;
  isError?: boolean;
  onAction?: () => void;
}) => {
  const isUser = role === "user";

  // ── Quota / rate-limit error ──────────────────────────────────────────────
  if (isError && content.includes("limit")) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="px-1"
      >
        <QuotaCard onEnterKey={onAction ?? (() => {})} />
      </motion.div>
    );
  }

  // ── Generic error ─────────────────────────────────────────────────────────
  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-2 px-1"
      >
        <div 
          className="w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5"
          style={{ 
            backgroundColor: 'rgba(251, 113, 133, 0.1)', 
            borderColor: 'rgba(251, 113, 133, 0.3)' 
          }}
        >
          <AlertCircle size={11} style={{ color: 'var(--red)' }} />
        </div>
        <div
          className="px-3 py-2.5 border rounded text-center"
          style={{
            backgroundColor: "var(--red-dim)",
            borderColor: "rgba(239, 68, 68, 0.3)",
            color: "var(--red)",
            fontFamily: "var(--mono)",
            fontSize: "11px",
          }}
        >
          {content}
        </div>
      </motion.div>
    );
  }

  // ── Standard chat bubble ──────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className={`flex items-start gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div
        className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center border mt-0.5"
        style={{
          backgroundColor: isUser ? "var(--green)" : "var(--card)",
          borderColor: isUser ? "transparent" : "var(--border)",
        }}
      >
        {isUser
          ? <User size={12} style={{ color: "#000000" }} />
          : <Bot size={12} style={{ color: "var(--text-2)" }} />
        }
      </div>

      {/* Bubble: smaller text, high-contrast code (opposite colors for clarity) */}
      <div
        className="max-w-[92%] min-w-0 overflow-hidden border rounded-lg wrap-break-word chat-bubble"
        style={{
          backgroundColor: isUser ? "var(--green)" : "var(--card)",
          borderColor: isUser ? "transparent" : "var(--border)",
          color: isUser ? "#111827" : "var(--text)",
          padding: "8px 10px",
          margin: isUser ? "0 0 0 auto" : "0",
          fontFamily: "var(--mono)",
          fontSize: "11px",
          lineHeight: 1.5,
          fontWeight: isUser ? 500 : 400,
          // High-contrast code in assistant: bright text on dark block, no overlay
          ...(isUser
            ? {}
            : {
                ["--chat-code-bg" as string]: "#0f0f14",
                ["--chat-code-text" as string]: "#e5e7eb",
                ["--chat-code-keyword" as string]: "#c084fc",
                ["--chat-code-function" as string]: "#7dd3fc",
                ["--chat-code-string" as string]: "#86efac",
                ["--chat-code-number" as string]: "#fcd34d",
                ["--chat-code-comment" as string]: "#9ca3af",
                ["--chat-code-variable" as string]: "#f9a8d4",
                ["--chat-code-operator" as string]: "#67e8f9",
              }),
        }}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Tables — clear text on contrasting background
            table: ({ children }) => (
              <div className="overflow-x-auto my-1.5 rounded border" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}>
                <table className="w-full text-left border-collapse" style={{ fontSize: "11px" }}>{children}</table>
              </div>
            ),
            thead: ({ children }) => (
              <thead style={{ backgroundColor: "var(--border-2)", color: "var(--text)" }}>{children}</thead>
            ),
            th: ({ children }) => (
              <th className="px-2 py-1 font-semibold border-b" style={{ borderColor: "var(--border)", color: "var(--text)" }}>{children}</th>
            ),
            td: ({ children }) => (
              <td className="px-2 py-1 border-b" style={{ borderColor: "var(--border)", color: "var(--text)" }}>{children}</td>
            ),
            strong: ({ children }) => (
              <strong className="font-bold" style={{ color: isUser ? "#111827" : "var(--text)" }}>{children}</strong>
            ),
            // Code blocks + inline: proper contrast (use chat overrides when in assistant bubble)
            code: ({ node, inline, className, children, ...props }: any) => {
              const match = /language-(\w+)/.exec(className || "");
              const codeContent = String(children).replace(/\n$/, "");

              if (!inline && match?.[1] === "mermaid") {
                return <Mermaid chart={codeContent} />;
              }

              if (!inline && match) {
                return <CodeBlock language={match[1]} value={codeContent} compact useChatTheme={!isUser} />;
              }

              // Inline code: opposite contrast — text clearly visible (dark on light in user, bright on dark in assistant)
              return (
                <code
                  className="px-1 py-0.5 rounded font-mono border"
                  style={{
                    backgroundColor: isUser ? "rgba(255,255,255,0.35)" : "var(--chat-code-bg, var(--code-bg))",
                    color: isUser ? "#0f172a" : "var(--chat-code-text, var(--code-text))",
                    borderColor: isUser ? "rgba(0,0,0,0.12)" : "var(--border)",
                    fontSize: "10px",
                  }}
                  {...props}
                >
                  {children}
                </code>
              );
            },
            p: ({ children }) => <p className="mb-1.5 last:mb-0" style={{ fontSize: "11px" }}>{children}</p>,
            ul: ({ children }) => <ul className="list-disc list-inside space-y-0.5 mb-1 pl-1" style={{ fontSize: "11px" }}>{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside space-y-0.5 mb-1 pl-1" style={{ fontSize: "11px" }}>{children}</ol>,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </motion.div>
  );
};