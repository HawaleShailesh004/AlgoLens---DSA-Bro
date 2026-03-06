import { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";

export const Login = ({
  onLogin,
}: {
  onLogin: (userId: string, token: string) => void;
}) => {
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: isSignup ? "signup" : "login",
          email: formData.email,
          password: formData.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      if (!data.token) throw new Error("No token received");
      onLogin(data.id, data.token);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Spec: Header 48px, then centered login form — Grindset, Sign in to start training, inputs, Sign In, Forgot password?, Create account →
  return (
    <div
      className="h-screen flex flex-col"
      style={{
        backgroundColor: "var(--bg)",
        color: "var(--text)",
        fontFamily: "var(--mono)",
      }}
    >
      <header
        className="shrink-0 border-b"
        style={{
          height: "48px",
          padding: "12px 16px",
          backgroundColor: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        <h1 className="font-bold text-base" style={{ color: "var(--text)" }}>
          Grindset
        </h1>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-5 py-6">
        <div className="w-full max-w-[248px]">
          <h2 className="text-center font-bold text-lg mb-1" style={{ color: "var(--text)" }}>
            Grindset
          </h2>
          <p className="text-center text-sm mb-6" style={{ color: "var(--muted)" }}>
            Sign in to start training
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              placeholder="Email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded border px-3 py-2.5 text-[13px] outline-none transition-all"
              style={{
                backgroundColor: "var(--card)",
                borderColor: "var(--border)",
                color: "var(--text)",
                fontFamily: "var(--mono)",
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
            <input
              type="password"
              placeholder="Password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full rounded border px-3 py-2.5 text-[13px] outline-none transition-all"
              style={{
                backgroundColor: "var(--card)",
                borderColor: "var(--border)",
                color: "var(--text)",
                fontFamily: "var(--mono)",
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
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded font-bold text-[13px] flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              style={{
                backgroundColor: "var(--green)",
                color: "#000000",
              }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isSignup ? "Create Account" : "Sign In"}
            </button>
          </form>

          {error && (
            <div
              className="mt-3 flex items-center gap-2 px-3 py-2 rounded border text-[11px]"
              style={{
                backgroundColor: "var(--red-dim)",
                borderColor: "var(--red)",
                color: "var(--red)",
              }}
            >
              <AlertCircle size={12} className="shrink-0" />
              {error}
            </div>
          )}

          <div className="mt-4 flex flex-col items-center gap-1 text-[11px]" style={{ color: "var(--muted)" }}>
            <a
              href="#"
              className="underline transition-colors hover:text-[var(--text-2)]"
              onClick={(e) => {
                e.preventDefault();
                // Forgot password — could open website /forgot-password
                window.open(`${(import.meta.env.VITE_API_URL || "").replace(/\/api\/?$/, "")}/forgot-password`, "_blank");
              }}
            >
              Forgot password?
            </a>
            {isSignup ? (
              <button
                type="button"
                onClick={() => { setIsSignup(false); setError(""); }}
                className="underline transition-colors hover:text-[var(--text-2)]"
              >
                Already have an account? Sign in
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { setIsSignup(true); setError(""); }}
                className="underline transition-colors hover:text-[var(--text-2)]"
              >
                Create account →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
