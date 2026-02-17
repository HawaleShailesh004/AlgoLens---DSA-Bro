// settings.jsx — AlgoLens (Redesigned)

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, Loader2, CheckCircle, Eye, EyeOff, Key, Globe, MessageSquarePlus, Plus, Trash2 } from "lucide-react";
import { getStoredToken } from "../layout";

type QuickPromptItem = { label: string; text: string };

export default function SettingsPage() {
  const router = useRouter();
  const [currentPassword,  setCurrentPassword]  = useState("");
  const [newPassword,      setNewPassword]      = useState("");
  const [confirmPassword,  setConfirmPassword]  = useState("");
  const [loading,          setLoading]          = useState(false);
  const [error,            setError]            = useState("");
  const [success,          setSuccess]          = useState(false);
  const [showCurrent,      setShowCurrent]      = useState(false);
  const [showNew,          setShowNew]          = useState(false);

  // Shared settings (mirror extension)
  const [preferredLanguage, setPreferredLanguage] = useState("cpp");
  const [groqApiKey, setGroqApiKey] = useState("");
  const [groqApiKeySet, setGroqApiKeySet] = useState(false);
  const [quickPrompts, setQuickPrompts] = useState<QuickPromptItem[]>([]);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsError, setSettingsError] = useState("");
  const [newPromptLabel, setNewPromptLabel] = useState("");
  const [newPromptText, setNewPromptText] = useState("");

  useEffect(() => {
    if (!getStoredToken()) router.push("/login");
  }, [router]);

  // Load settings
  useEffect(() => {
    const token = getStoredToken();
    if (!token) return;
    setSettingsLoading(true);
    setSettingsError("");
    fetch("/api/settings", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load settings");
        return res.json();
      })
      .then((data: { preferredLanguage?: string; groqApiKeySet?: boolean; quickPrompts?: QuickPromptItem[] }) => {
        if (data.preferredLanguage) setPreferredLanguage(data.preferredLanguage);
        setGroqApiKeySet(!!data.groqApiKeySet);
        if (Array.isArray(data.quickPrompts)) setQuickPrompts(data.quickPrompts);
      })
      .catch(() => setSettingsError("Could not load settings"))
      .finally(() => setSettingsLoading(false));
  }, []);

  const saveSettings = async (updates: { preferredLanguage?: string; groqApiKey?: string | null; quickPrompts?: QuickPromptItem[] }) => {
    const token = getStoredToken();
    if (!token) return;
    setSettingsSaving(true);
    setSettingsError("");
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to save");
      if (updates.groqApiKey !== undefined) {
        setGroqApiKey("");
        setGroqApiKeySet(updates.groqApiKey !== null);
      }
    } catch {
      setSettingsError("Failed to save settings");
    } finally {
      setSettingsSaving(false);
    }
  };

  const addQuickPrompt = () => {
    const label = newPromptLabel.trim();
    const text = newPromptText.trim();
    if (!label || !text) return;
    const next = [...quickPrompts, { label, text }];
    setQuickPrompts(next);
    setNewPromptLabel("");
    setNewPromptText("");
    saveSettings({ quickPrompts: next });
  };

  const removeQuickPrompt = (index: number) => {
    const next = quickPrompts.filter((_, i) => i !== index);
    setQuickPrompts(next);
    saveSettings({ quickPrompts: next });
  };

  const defaultQuickPrompts: QuickPromptItem[] = [
    { label: "Hint",       text: "Give me a small hint to get started, but don't give the answer." },
    { label: "Complexity", text: "What is the Time and Space complexity of my approach?" },
    { label: "Edge Cases", text: "What are some critical edge cases I should handle?" },
    { label: "Find Bug",   text: "I suspect there's a bug in my logic. Can you help me find it?" },
    { label: "Approach",   text: "Explain the high-level logic for this problem without code." },
    { label: "Optimize",   text: "Is there a more optimized way to solve this?" },
    { label: "Rate Code",  text: "Here is my approach. Rate my code on Cleanliness, Time Complexity, and Space Complexity. Be strict." },
    { label: "Visualize",  text: "Visualize this data structure or algorithm logic with a diagram." },
  ];

  const loadDefaultPrompts = () => {
    setQuickPrompts(defaultQuickPrompts);
    saveSettings({ quickPrompts: defaultQuickPrompts });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (newPassword !== confirmPassword) { setError("New passwords do not match"); return; }
    const token = getStoredToken();
    if (!token) { router.push("/login"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update password");
      setSuccess(true);
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const strengthScore = (() => {
    if (!newPassword) return 0;
    let s = 0;
    if (newPassword.length >= 6)  s++;
    if (newPassword.length >= 10) s++;
    if (/[A-Z]/.test(newPassword)) s++;
    if (/[0-9]/.test(newPassword)) s++;
    if (/[^A-Za-z0-9]/.test(newPassword)) s++;
    return s;
  })();

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong", "Great"][strengthScore] || "";
  const strengthColor = ["", "bg-rose-500", "bg-amber-500", "bg-yellow-400", "bg-emerald-400", "bg-emerald-400"][strengthScore] || "";
  const strengthText  = ["", "text-rose-400", "text-amber-400", "text-yellow-400", "text-emerald-400", "text-emerald-400"][strengthScore] || "";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[500px] h-[400px] bg-violet-600/4 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

        {/* Back */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-violet-400 mb-8 transition-colors"
        >
          <ArrowLeft size={14} /> Dashboard
        </Link>

        {/* Page header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
          <p className="mt-1.5 text-slate-500 text-base">Manage your account preferences.</p>
        </div>

        {settingsError && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-300">
            {settingsError}
          </div>
        )}

        {/* Groq API Key */}
        <section className="mb-10">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center">
              <Key size={14} className="text-violet-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-200">Groq API Key (Optional)</h2>
          </div>
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6">
            {settingsLoading ? (
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <Loader2 size={14} className="animate-spin" /> Loading…
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="password"
                  value={groqApiKey}
                  onChange={(e) => setGroqApiKey(e.target.value)}
                  placeholder={groqApiKeySet ? "Enter new key to replace, or leave blank" : "gsk_..."}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-slate-100 placeholder-slate-600 focus:border-violet-500/60 outline-none"
                />
                <button
                  type="button"
                  disabled={settingsSaving}
                  onClick={() => saveSettings({ groqApiKey: groqApiKey.trim() || null })}
                  className="py-2 px-4 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  {settingsSaving ? <Loader2 size={14} className="animate-spin inline" /> : "Save"}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Preferred Language */}
        <section className="mb-10">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center">
              <Globe size={14} className="text-violet-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-200">Preferred Language</h2>
          </div>
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6">
            <select
              value={preferredLanguage}
              onChange={(e) => {
                const v = e.target.value;
                setPreferredLanguage(v);
                saveSettings({ preferredLanguage: v });
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-slate-100 focus:border-violet-500/60 outline-none"
            >
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
            </select>
          </div>
        </section>

        {/* Quick Prompts */}
        <section className="mb-10">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center">
              <MessageSquarePlus size={14} className="text-violet-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-200">Quick Prompts</h2>
          </div>
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 space-y-4">
            <p className="text-sm text-slate-500">Manage the quick prompt buttons shown in the extension. These sync with the extension when you’re logged in.</p>
            <button
              type="button"
              onClick={loadDefaultPrompts}
              disabled={settingsSaving}
              className="text-sm text-violet-400 hover:text-violet-300 font-medium disabled:opacity-50"
            >
              Load default prompts
            </button>
            <ul className="space-y-2">
              {quickPrompts.map((p, i) => (
                <li key={i} className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5">
                  <span className="font-medium text-slate-200 text-sm shrink-0">{p.label}</span>
                  <span className="text-slate-500 text-xs truncate flex-1">{p.text}</span>
                  <button
                    type="button"
                    onClick={() => removeQuickPrompt(i)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors shrink-0"
                    title="Remove"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newPromptLabel}
                onChange={(e) => setNewPromptLabel(e.target.value)}
                placeholder="Label (e.g. Hint)"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-slate-100 placeholder-slate-600 focus:border-violet-500/60 outline-none"
              />
              <input
                type="text"
                value={newPromptText}
                onChange={(e) => setNewPromptText(e.target.value)}
                placeholder="Prompt text"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-slate-100 placeholder-slate-600 focus:border-violet-500/60 outline-none"
              />
              <button
                type="button"
                onClick={addQuickPrompt}
                disabled={!newPromptLabel.trim() || !newPromptText.trim()}
                className="inline-flex items-center justify-center gap-1.5 py-2 px-4 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <Plus size={14} /> Add
              </button>
            </div>
          </div>
        </section>

        {/* Password section */}
        <section>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center">
              <Lock size={14} className="text-violet-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-200">Change Password</h2>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6">
            {success ? (
              <div className="flex flex-col items-center text-center py-6 gap-3">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <CheckCircle size={24} className="text-emerald-400" />
                </div>
                <div>
                  <p className="font-semibold text-slate-200">Password updated</p>
                  <p className="text-sm text-slate-500 mt-1">Use your new password next time you sign in.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSuccess(false)}
                  className="mt-2 text-xs text-slate-500 hover:text-violet-400 transition-colors"
                >
                  Change again
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 font-medium">
                    {error}
                  </div>
                )}

                {/* Current password */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 w-3.5 h-3.5" />
                    <input
                      type={showCurrent ? "text" : "password"}
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-sm text-slate-100 placeholder-slate-600 focus:border-violet-500/60 focus:bg-slate-900/80 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(p => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                    >
                      {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* New password */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 w-3.5 h-3.5" />
                    <input
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      required
                      minLength={6}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-sm text-slate-100 placeholder-slate-600 focus:border-violet-500/60 focus:bg-slate-900/80 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(p => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                    >
                      {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>

                  {/* Strength meter */}
                  {newPassword && (
                    <div className="mt-2.5">
                      <div className="flex gap-1 h-1 mb-1.5">
                        {[1,2,3,4,5].map(i => (
                          <div
                            key={i}
                            className={`flex-1 rounded-full transition-all ${i <= strengthScore ? strengthColor : "bg-slate-800"}`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs font-semibold ${strengthText}`}>{strengthLabel}</p>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 w-3.5 h-3.5" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                      minLength={6}
                      className={`w-full bg-slate-950 border rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all ${
                        confirmPassword && confirmPassword !== newPassword
                          ? "border-rose-500/50 focus:border-rose-500"
                          : confirmPassword && confirmPassword === newPassword
                          ? "border-emerald-500/50 focus:border-emerald-500"
                          : "border-slate-800 focus:border-violet-500/60"
                      } focus:bg-slate-900/80`}
                    />
                    {confirmPassword && (
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                        {confirmPassword === newPassword
                          ? <CheckCircle size={14} className="text-emerald-400" />
                          : <span className="text-rose-400 text-xs font-bold">✕</span>
                        }
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-900/20 border border-violet-500/30 mt-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}