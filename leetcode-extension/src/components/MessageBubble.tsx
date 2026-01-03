import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { User, Bot, AlertCircle } from "lucide-react";
import { CodeBlock } from "./CodeBlock";
import { Mermaid } from "./Mermaid";
import { QuotaCard } from "./QuotaCard"; // Import the new card

// Add isError and onAction props
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

  // 1. RENDER QUOTA CARD IF ERROR
  if (isError && content.includes("limit")) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-6 px-2"
      >
        <QuotaCard onEnterKey={onAction || (() => {})} />
      </motion.div>
    );
  }

  // 2. RENDER STANDARD ERROR BUBBLE
  if (isError) {
    return (
      <div className="flex w-full justify-start mb-6 px-2">
        <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-xl flex gap-3 items-start max-w-[90%]">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-200">{content}</p>
        </div>
      </div>
    );
  }

  // 3. STANDARD CHAT BUBBLE (Existing Code)
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"} mb-6`}
    >
      <div
        className={`flex max-w-[95%] ${
          isUser ? "flex-row-reverse" : "flex-row"
        } gap-3`}
      >
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
            isUser ? "bg-orange-600" : "bg-zinc-800 border border-zinc-700"
          }`}
        >
          {isUser ? (
            <User size={14} className="text-white" />
          ) : (
            <Bot size={14} className="text-zinc-400" />
          )}
        </div>

        <div
          className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm min-w-0 ${
            isUser
              ? "bg-orange-600 text-white rounded-tr-none"
              : "bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-none"
          }`}
        >
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || "");

                const codeContent = String(children).replace(/\n$/, "");

                if (!inline && match && match[1] === "mermaid") {
                  return <Mermaid chart={codeContent} />;
                }

                return !inline && match ? (
                  <CodeBlock language={match[1]} value={codeContent} />
                ) : (
                  <code
                    className="bg-zinc-950/50 text-orange-200 px-1.5 py-0.5 rounded font-mono text-xs border border-zinc-800"
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </motion.div>
  );
};
