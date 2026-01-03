import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { PrismAsyncLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

// Optimized imports for speed & streaming stability
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java';
import cpp from 'react-syntax-highlighter/dist/esm/languages/prism/cpp';

SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('js', javascript);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('py', python);
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('cpp', cpp);

export const CodeBlock = ({ language, value }: { language: string, value: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4 rounded-lg overflow-hidden border border-zinc-700 bg-[#1e1e1e]">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-800 border-b border-zinc-700">
        <span className="text-[10px] text-zinc-400 font-mono lowercase">{language || 'text'}</span>
        <button 
          onClick={handleCopy}
          className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-white transition-colors"
        >
          {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {/* The Code Itself - using PrismAsyncLight prevents blocking the UI thread */}
      <SyntaxHighlighter
        language={language?.toLowerCase() || "text"}
        style={vscDarkPlus}
        customStyle={{ margin: 0, padding: "1rem", fontSize: "0.8rem", lineHeight: "1.5", background: "transparent" }}
        wrapLines={true}
        wrapLongLines={true} // Helps with horizontal overflow issues during stream
      >
        {value || " "} 
      </SyntaxHighlighter>
    </div>
  );
};