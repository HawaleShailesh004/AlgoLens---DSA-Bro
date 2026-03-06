"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Lock,
  Loader2,
  CheckCircle,
  Key,
  Globe,
  MessageSquare,
  Plus,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { getStoredToken } from "../layout";

const LANGUAGES = [
  { value: "cpp", label: "C++" },
  { value: "java", label: "Java" },
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
];

const DEFAULT_QUICK_PROMPTS: { label: string; text: string }[] = [
  { label: "Hint", text: "Give me a small hint to get started, but don't give the answer." },
  { label: "Complexity", text: "What is the Time and Space complexity of my approach?" },
  { label: "Edge Cases", text: "What are some critical edge cases I should handle?" },
  { label: "Find Bug", text: "I suspect there's a bug in my logic. Can you help me find it?" },
  { label: "Approach", text: "Explain the high-level logic for this problem without code." },
  { label: "Optimize", text: "Is there a more optimized way to solve this?" },
  { label: "Rate Code", text: "Here is my approach. Rate my code on Cleanliness, Time Complexity, and Space Complexity. Be strict." },
  { label: "Visualize", text: "Visualize this data structure or algorithm logic with a diagram." },
];

type QuickPromptRow = { label: string; text: string };

export default function SettingsPage() {
  const router = useRouter();
  const token = getStoredToken();

  // Password section
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Account & preferences (synced with extension)
  const [preferredLanguage, setPreferredLanguage] = useState("cpp");
  const [aiProvider, setAiProvider] = useState<"groq" | "openai">("groq");
  const [apiKey, setApiKey] = useState("");
  const [quickPrompts, setQuickPrompts] = useState<QuickPromptRow[]>([]);
  const [prefsLoading, setPrefsLoading] = useState(true);
  const [prefsSaving, setPrefsSaving] = useState(false);
  const [prefsSuccess, setPrefsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    fetch("/api/settings", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { preferredLanguage?: string; aiProvider?: string; quickPrompts?: QuickPromptRow[] } | null) => {
        if (!data) return;
        if (data.preferredLanguage) setPreferredLanguage(data.preferredLanguage);
        if (data.aiProvider === "openai" || data.aiProvider === "groq") setAiProvider(data.aiProvider);
        if (Array.isArray(data.quickPrompts) && data.quickPrompts.length > 0) {
          setQuickPrompts(data.quickPrompts);
        } else {
          setQuickPrompts([]);
        }
      })
      .catch(() => {})
      .finally(() => setPrefsLoading(false));
  }, [token, router]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    if (!token) {
      router.push("/login");
      return;
    }
    setPasswordLoading(true);
    setPasswordError("");
    setPasswordSuccess(false);
    try {
      const res = await fetch("/api/auth/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update password");
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      setPasswordError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPasswordLoading(false);
    }
  };

  const savePrefs = async (updates: {
    preferredLanguage?: string;
    aiProvider?: "groq" | "openai";
    groqApiKey?: string | null;
    openaiApiKey?: string | null;
    quickPrompts?: QuickPromptRow[];
  }) => {
    if (!token) return;
    setPrefsSaving(true);
    setPrefsSuccess(false);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to save");
      setPrefsSuccess(true);
      setTimeout(() => setPrefsSuccess(false), 2000);
    } catch {
      // silent
    } finally {
      setPrefsSaving(false);
    }
  };

  const handleLanguageChange = (val: string) => {
    setPreferredLanguage(val);
    savePrefs({ preferredLanguage: val });
  };

  const handleAiProviderChange = (val: "groq" | "openai") => {
    setAiProvider(val);
    savePrefs({ aiProvider: val });
  };

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) return;
    savePrefs({
      [aiProvider === "groq" ? "groqApiKey" : "openaiApiKey"]: apiKey.trim(),
    });
    setApiKey("");
  };

  const handleLoadDefaultPrompts = () => {
    setQuickPrompts([...DEFAULT_QUICK_PROMPTS]);
    savePrefs({ quickPrompts: DEFAULT_QUICK_PROMPTS });
  };

  const handleAddPrompt = () => {
    const next = [...quickPrompts, { label: "", text: "" }];
    setQuickPrompts(next);
    savePrefs({ quickPrompts: next });
  };

  const handleRemovePrompt = (index: number) => {
    const next = quickPrompts.filter((_, i) => i !== index);
    setQuickPrompts(next);
    savePrefs({ quickPrompts: next });
  };

  const handlePromptChange = (index: number, field: "label" | "text", value: string) => {
    const next = quickPrompts.map((p, i) =>
      i === index ? { ...p, [field]: value } : p
    );
    setQuickPrompts(next);
  };

  const handleSaveQuickPrompts = () => {
    savePrefs({ quickPrompts });
  };

  const inputClass =
    "w-full rounded-lg px-4 py-2.5 text-sm border outline-none transition-all focus:ring-2 focus:ring-offset-0 focus:ring-[var(--green)]";
  const inputStyle = {
    backgroundColor: "var(--surface)",
    borderColor: "var(--border)",
    color: "var(--text)",
  };
  const labelClass = "block text-xs font-medium uppercase tracking-wider mb-1.5";
  const labelStyle = { color: "var(--muted)" };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm mb-8 transition-colors hover:opacity-90"
          style={{ color: "var(--text-2)" }}
        >
          <ArrowLeft size={14} />
          Back to Dashboard
        </Link>

        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
          Settings
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
          Manage your account and preferences. Changes sync with the extension.
        </p>

        {/* ─── Preferred Language & AI (same as extension) ─────────────────── */}
        <section className="mt-10">
          <div className="flex items-center gap-2 mb-4">
            <Globe size={20} style={{ color: "var(--green)" }} />
            <h2 className="text-lg font-semibold" style={{ color: "var(--text)" }}>
              Preferred language
            </h2>
          </div>
          <div
            className="p-6 rounded-xl border"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
          >
            <label className={labelClass} style={labelStyle}>
              Code language for hints and snippets
            </label>
            <select
              value={preferredLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              disabled={prefsLoading}
              className={inputClass}
              style={inputStyle}
            >
              {LANGUAGES.map(({ value, label }) => (
                <option key={value} value={value} style={inputStyle}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* ─── AI Provider & API Key ────────────────────────────────────────── */}
        <section className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Key size={20} style={{ color: "var(--green)" }} />
            <h2 className="text-lg font-semibold" style={{ color: "var(--text)" }}>
              AI provider & API key
            </h2>
          </div>
          <div
            className="p-6 rounded-xl border space-y-4"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
          >
            <div>
              <label className={labelClass} style={labelStyle}>
                Provider
              </label>
              <select
                value={aiProvider}
                onChange={(e) => handleAiProviderChange(e.target.value as "groq" | "openai")}
                disabled={prefsLoading}
                className={inputClass}
                style={inputStyle}
              >
                <option value="groq" style={inputStyle}>Groq</option>
                <option value="openai" style={inputStyle}>OpenAI</option>
              </select>
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>
                {aiProvider === "groq" ? "Groq" : "OpenAI"} API key (optional)
              </label>
              <p className="text-xs mb-2" style={{ color: "var(--muted)" }}>
                Enter a new key and click Save. Leave blank to use community pool. Your existing key is not shown.
              </p>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={aiProvider === "groq" ? "gsk_..." : "sk-..."}
                  className={inputClass + " flex-1"}
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={handleSaveApiKey}
                  disabled={prefsSaving || !apiKey.trim()}
                  className="px-4 py-2.5 rounded-lg text-sm font-bold border shrink-0 disabled:opacity-50"
                  style={{
                    backgroundColor: "var(--green)",
                    color: "#000000",
                    borderColor: "var(--green)",
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Quick prompts (extension quick prompts) ──────────────────────── */}
        <section className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare size={20} style={{ color: "var(--green)" }} />
            <h2 className="text-lg font-semibold" style={{ color: "var(--text)" }}>
              Quick prompts
            </h2>
          </div>
          <div
            className="p-6 rounded-xl border"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
          >
            <p className="text-xs mb-4" style={{ color: "var(--muted)" }}>
              One-click prompts in the extension chat. Same list on website and extension.
            </p>
            <button
              type="button"
              onClick={handleLoadDefaultPrompts}
              disabled={prefsLoading}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border mb-4 transition-colors"
              style={{
                borderColor: "var(--border)",
                color: "var(--text-2)",
              }}
            >
              <RotateCcw size={12} />
              Load default prompts
            </button>
            <div className="space-y-3">
              {quickPrompts.map((p, i) => (
                <div
                  key={i}
                  className="flex gap-2 items-start p-3 rounded-lg border"
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}
                >
                  <input
                    value={p.label}
                    onChange={(e) => handlePromptChange(i, "label", e.target.value)}
                    onBlur={handleSaveQuickPrompts}
                    placeholder="Label"
                    className="flex-1 min-w-0 rounded px-2.5 py-1.5 text-sm border"
                    style={{ ...inputStyle, maxWidth: "100px" }}
                  />
                  <input
                    value={p.text}
                    onChange={(e) => handlePromptChange(i, "text", e.target.value)}
                    onBlur={handleSaveQuickPrompts}
                    placeholder="Prompt text"
                    className="flex-2 min-w-0 rounded px-2.5 py-1.5 text-sm border"
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePrompt(i)}
                    className="p-1.5 rounded border shrink-0 transition-colors"
                    style={{ borderColor: "var(--border)", color: "var(--muted)" }}
                    title="Remove"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddPrompt}
              disabled={prefsLoading}
              className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
              style={{
                borderColor: "var(--border)",
                color: "var(--text-2)",
              }}
            >
              <Plus size={12} />
              Add prompt
            </button>
            {prefsSuccess && (
              <p className="mt-3 flex items-center gap-2 text-xs" style={{ color: "var(--green)" }}>
                <CheckCircle size={14} />
                Saved. Extension will use these on next load.
              </p>
            )}
          </div>
        </section>

        {/* ─── Change password ───────────────────────────────────────────────── */}
        <section className="mt-10">
          <div className="flex items-center gap-2 mb-4">
            <Lock size={20} style={{ color: "var(--green)" }} />
            <h2 className="text-lg font-semibold" style={{ color: "var(--text)" }}>
              Change password
            </h2>
          </div>
          <div
            className="p-6 rounded-xl border"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
          >
            {passwordSuccess ? (
              <p className="flex items-center gap-2" style={{ color: "var(--green)" }}>
                <CheckCircle size={18} />
                Password updated. Use your new password next time you sign in.
              </p>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {passwordError && (
                  <p
                    className="text-sm rounded-lg px-3 py-2 border"
                    style={{
                      color: "var(--red)",
                      backgroundColor: "var(--red-dim)",
                      borderColor: "rgba(239, 68, 68, 0.3)",
                    }}
                  >
                    {passwordError}
                  </p>
                )}
                <div>
                  <label className={labelClass} style={labelStyle}>
                    Current password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelClass} style={labelStyle}>
                    New password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelClass} style={labelStyle}>
                    Confirm new password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    minLength={6}
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 border"
                  style={{
                    backgroundColor: "var(--green)",
                    color: "#000000",
                    borderColor: "var(--green)",
                  }}
                >
                  {passwordLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Update password"
                  )}
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
