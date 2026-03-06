import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { PrismAsyncLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { useTheme } from "../contexts/ThemeContext";

// Import languages
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import python     from "react-syntax-highlighter/dist/esm/languages/prism/python";
import java       from "react-syntax-highlighter/dist/esm/languages/prism/java";
import cpp        from "react-syntax-highlighter/dist/esm/languages/prism/cpp";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import go         from "react-syntax-highlighter/dist/esm/languages/prism/go";
import rust       from "react-syntax-highlighter/dist/esm/languages/prism/rust";

SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("js",         javascript);
SyntaxHighlighter.registerLanguage("python",     python);
SyntaxHighlighter.registerLanguage("py",         python);
SyntaxHighlighter.registerLanguage("java",       java);
SyntaxHighlighter.registerLanguage("cpp",        cpp);
SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("ts",         typescript);
SyntaxHighlighter.registerLanguage("go",         go);
SyntaxHighlighter.registerLanguage("rust",       rust);

// Language display labels
const langLabel: Record<string, string> = {
  javascript: "js", typescript: "ts", python: "py", cpp: "c++",
  java: "java", go: "go", rust: "rs",
};

// Use chat theme vars when inside MessageBubble (--chat-code-*) for high-contrast text
const codeVar = (name: string, fallback: string) => `var(--chat-${name}, var(--${name}, ${fallback}))`;

const getSyntaxStyle = (theme: "dark" | "light", useChatTheme: boolean) => {
  const base = useChatTheme
    ? {
        "code[class*=\"language-\"]": { color: codeVar("code-text", "#e5e7eb"), background: "transparent", textShadow: "none" },
        "pre[class*=\"language-\"]": { color: codeVar("code-text", "#e5e7eb"), background: "transparent", textShadow: "none" },
        comment: { color: codeVar("code-comment", "#9ca3af") },
        prolog: { color: codeVar("code-comment", "#9ca3af") },
        doctype: { color: codeVar("code-comment", "#9ca3af") },
        cdata: { color: codeVar("code-comment", "#9ca3af") },
        punctuation: { color: codeVar("code-text", "#e5e7eb") },
        property: { color: codeVar("code-keyword", "#c084fc") },
        tag: { color: codeVar("code-keyword", "#c084fc") },
        boolean: { color: codeVar("code-number", "#fcd34d") },
        number: { color: codeVar("code-number", "#fcd34d") },
        constant: { color: codeVar("code-number", "#fcd34d") },
        symbol: { color: codeVar("code-number", "#fcd34d") },
        deleted: { color: codeVar("code-variable", "#f9a8d4") },
        selector: { color: codeVar("code-keyword", "#c084fc") },
        "attr-name": { color: codeVar("code-keyword", "#c084fc") },
        string: { color: codeVar("code-string", "#86efac") },
        char: { color: codeVar("code-string", "#86efac") },
        builtin: { color: codeVar("code-function", "#7dd3fc") },
        inserted: { color: codeVar("code-string", "#86efac") },
        operator: { color: codeVar("code-operator", "#67e8f9") },
        entity: { color: codeVar("code-text", "#e5e7eb") },
        url: { color: codeVar("code-string", "#86efac") },
        variable: { color: codeVar("code-variable", "#f9a8d4") },
        atrule: { color: codeVar("code-keyword", "#c084fc") },
        "attr-value": { color: codeVar("code-string", "#86efac") },
        function: { color: codeVar("code-function", "#7dd3fc") },
        "class-name": { color: codeVar("code-function", "#7dd3fc") },
        keyword: { color: codeVar("code-keyword", "#c084fc") },
        regex: { color: codeVar("code-string", "#86efac") },
        important: { color: codeVar("code-variable", "#f9a8d4") },
        bold: { fontWeight: "bold" },
        italic: { fontStyle: "italic" },
      }
    : {
        "code[class*=\"language-\"]": { color: "var(--code-text)", background: "transparent", textShadow: "none" },
        "pre[class*=\"language-\"]": { color: "var(--code-text)", background: "transparent", textShadow: "none" },
        comment: { color: "var(--code-comment)" },
        prolog: { color: "var(--code-comment)" },
        doctype: { color: "var(--code-comment)" },
        cdata: { color: "var(--code-comment)" },
        punctuation: { color: "var(--code-text)" },
        property: { color: "var(--code-keyword)" },
        tag: { color: "var(--code-keyword)" },
        boolean: { color: "var(--code-number)" },
        number: { color: "var(--code-number)" },
        constant: { color: "var(--code-number)" },
        symbol: { color: "var(--code-number)" },
        deleted: { color: "var(--code-variable)" },
        selector: { color: "var(--code-keyword)" },
        "attr-name": { color: "var(--code-keyword)" },
        string: { color: "var(--code-string)" },
        char: { color: "var(--code-string)" },
        builtin: { color: "var(--code-function)" },
        inserted: { color: "var(--code-string)" },
        operator: { color: "var(--code-operator)" },
        entity: { color: "var(--code-text)" },
        url: { color: "var(--code-string)" },
        variable: { color: "var(--code-variable)" },
        atrule: { color: "var(--code-keyword)" },
        "attr-value": { color: "var(--code-string)" },
        function: { color: "var(--code-function)" },
        "class-name": { color: "var(--code-function)" },
        keyword: { color: "var(--code-keyword)" },
        regex: { color: "var(--code-string)" },
        important: { color: "var(--code-variable)" },
        bold: { fontWeight: "bold" },
        italic: { fontStyle: "italic" },
      };
  return base;
};

export const CodeBlock = ({
  language,
  value,
  compact = false,
  useChatTheme = false,
}: {
  language: string;
  value: string;
  compact?: boolean;
  useChatTheme?: boolean;
}) => {
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayLang = langLabel[language?.toLowerCase()] ?? language ?? "text";
  const codeBg = useChatTheme ? "var(--chat-code-bg, var(--code-bg))" : "var(--code-bg)";

  return (
    <div
      className={`relative overflow-hidden border ${compact ? "my-1.5 rounded" : "my-2.5 rounded-[8px]"}`}
      style={{
        backgroundColor: codeBg,
        borderColor: "var(--border)",
      }}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between border-b ${compact ? "px-2 py-1" : "px-3 py-1.5"}`}
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        <span className="font-mono tracking-wide" style={{ color: "var(--muted)", fontSize: compact ? "9px" : "10px" }}>
          {displayLang}
        </span>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1 transition-colors font-sans ${compact ? "text-[9px]" : "text-[10px]"}`}
          style={{ color: "var(--text-2)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--green)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-2)";
          }}
        >
          {copied ? (
            <><Check size={10} style={{ color: "var(--green)" }} /> Copied</>
          ) : (
            <><Copy size={10} /> Copy</>
          )}
        </button>
      </div>

      {/* Code — high contrast text, no overlay */}
      <SyntaxHighlighter
        language={language?.toLowerCase() || "text"}
        style={getSyntaxStyle(theme, useChatTheme) as React.CSSProperties}
        customStyle={{
          margin: 0,
          padding: compact ? "6px 8px" : "10px 12px",
          fontSize: compact ? "10px" : "11px",
          lineHeight: "1.5",
          background: "transparent",
          overflowX: "auto",
        }}
        wrapLines
        wrapLongLines
      >
        {value || " "}
      </SyntaxHighlighter>
    </div>
  );
};
