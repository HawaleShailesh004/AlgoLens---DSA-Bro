export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 18% 20%, rgba(248,113,113,0.16), transparent 26%), radial-gradient(circle at 82% 10%, rgba(74,222,128,0.18), transparent 24%), linear-gradient(145deg, #0b0c10 0%, #0f1116 52%, #0b0c10 100%)",
        color: "#e4e4e7",
        fontFamily: "'Segoe UI','SF Pro Text',system-ui,sans-serif",
        padding: "48px 0",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "0 24px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "-80px -120px 0 -120px",
            background:
              "radial-gradient(circle at 50% 0%, rgba(249,115,22,0.08), transparent 42%)",
            filter: "blur(48px)",
            zIndex: 0,
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
              marginBottom: "28px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg,#f97316,#fb923c)",
                  display: "grid",
                  placeItems: "center",
                  color: "#0b0c10",
                  fontWeight: 800,
                  letterSpacing: "0.5px",
                }}
              >
                AL
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "0.9rem", color: "#a1a1aa" }}>
                  AlgoLens Gym Server
                </p>
                <p style={{ margin: 0, fontWeight: 700 }}>API Control Room</p>
              </div>
            </div>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(74,222,128,0.12)",
                color: "#4ade80",
                border: "1px solid rgba(74,222,128,0.35)",
                padding: "10px 14px",
                borderRadius: "999px",
                fontWeight: 600,
                boxShadow:
                  "0 0 0 1px rgba(12,183,84,0.18), 0 10px 30px rgba(12,183,84,0.12)",
              }}
            >
              <span
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "999px",
                  background: "#4ade80",
                  boxShadow: "0 0 12px rgba(74,222,128,0.85)",
                }}
              />
              Operational
            </span>
          </header>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "20px",
            }}
          >
            <section
              style={{
                background: "rgba(24,24,27,0.82)",
                border: "1px solid #27272a",
                borderRadius: "18px",
                padding: "28px",
                boxShadow: "0 20px 45px rgba(0,0,0,0.35)",
                backdropFilter: "blur(6px)",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(99,102,241,0.12)",
                  color: "#c7d2fe",
                  padding: "8px 12px",
                  borderRadius: "999px",
                  border: "1px solid rgba(99,102,241,0.3)",
                  marginBottom: "16px",
                  fontSize: "0.9rem",
                }}
              >
                Chrome + API stack
              </div>
              <h1
                style={{
                  margin: "0 0 12px",
                  fontSize: "2.4rem",
                  lineHeight: 1.1,
                }}
              >
                LeetCode Gym: spotter, coach, and review queue.
              </h1>
              <p
                style={{
                  margin: "0 0 20px",
                  color: "#a1a1aa",
                  maxWidth: "560px",
                }}
              >
                Chrome overlay for live LeetCode problems, Groq-powered tough-love chat, and a
                spaced-repetition workout logger backed by this API surface.
              </p>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <a
                  href="/api/health"
                  style={{
                    textDecoration: "none",
                    background: "linear-gradient(135deg,#f97316,#fb923c)",
                    color: "#0b0c10",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    fontWeight: 700,
                    boxShadow: "0 14px 34px rgba(249,115,22,0.25)",
                  }}
                >
                  Check API health
                </a>
                <a
                  href="/login"
                  style={{
                    textDecoration: "none",
                    background: "linear-gradient(135deg,#f97316,#fb923c)",
                    color: "#0b0c10",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    fontWeight: 700,
                    boxShadow: "0 14px 34px rgba(249,115,22,0.25)",
                  }}
                >
                  Log in
                </a>
                <a
                  href="/dashboard"
                  style={{
                    textDecoration: "none",
                    background: "rgba(255,255,255,0.04)",
                    color: "#e4e4e7",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    fontWeight: 700,
                    border: "1px solid #27272a",
                  }}
                >
                  Dashboard
                </a>
                <a
                  href="/how-it-works"
                  style={{
                    textDecoration: "none",
                    background: "rgba(255,255,255,0.04)",
                    color: "#e4e4e7",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    fontWeight: 700,
                    border: "1px solid #27272a",
                  }}
                >
                  How it works
                </a>
                <a
                  href="https://leetcode.com"
                  style={{
                    textDecoration: "none",
                    background: "rgba(255,255,255,0.04)",
                    color: "#e4e4e7",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    fontWeight: 700,
                    border: "1px solid #27272a",
                  }}
                >
                  LeetCode
                </a>
              </div>
              <ul
                style={{
                  margin: "22px 0 0",
                  padding: 0,
                  listStyle: "none",
                  display: "grid",
                  gap: "10px",
                }}
              >
                {[
                  "Tough-love coach over the active LeetCode problem tab",
                  "Flashcard logger with spaced repetition scheduling",
                  "Backend endpoints: /api/chat, /api/generate-notes, /api/log, /api/health",
                ].map((item) => (
                  <li
                    key={item}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      color: "#d4d4d8",
                    }}
                  >
                    <span
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "999px",
                        background: "#f97316",
                        boxShadow: "0 0 10px rgba(249,115,22,0.7)",
                      }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section
              style={{
                background: "rgba(18,18,20,0.9)",
                border: "1px solid #1f1f23",
                borderRadius: "18px",
                padding: "24px",
                boxShadow: "0 18px 40px rgba(0,0,0,0.4)",
                backdropFilter: "blur(8px)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <p
                    style={{ margin: 0, color: "#a1a1aa", fontSize: "0.9rem" }}
                  >
                    Control room
                  </p>
                  <p style={{ margin: 0, fontWeight: 700 }}>
                    Realtime readiness
                  </p>
                </div>
                <span
                  style={{
                    padding: "8px 12px",
                    borderRadius: "10px",
                    background: "rgba(52,211,153,0.16)",
                    border: "1px solid rgba(52,211,153,0.28)",
                    color: "#34d399",
                    fontWeight: 700,
                  }}
                >
                  Stable
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                {[
                  { label: "Queued reviews", value: "Spaced by confidence" },
                  { label: "Chat model", value: process.env.AI_MODEL || "N/A" },
                  { label: "Community quota", value: "10 free msgs / IP" },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      padding: "12px",
                      borderRadius: "12px",
                      border: "1px solid #27272a",
                      background: "rgba(39,39,42,0.5)",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        color: "#a1a1aa",
                        fontSize: "0.9rem",
                      }}
                    >
                      {item.label}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 800,
                        fontSize: "1.15rem",
                      }}
                    >
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <div
                style={{
                  background: "#0b0c10",
                  border: "1px solid #1f1f23",
                  borderRadius: "14px",
                  padding: "14px",
                  fontFamily: "SFMono-Regular,Consolas,monospace",
                  fontSize: "0.95rem",
                  color: "#d4d4d8",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
                }}
              >
                <p
                  style={{
                    margin: "0 0 8px",
                    color: "#a1a1aa",
                    fontSize: "0.85rem",
                  }}
                >
                  Quick check (health)
                </p>
                <pre
                  style={{
                    margin: 0,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  curl -s http://localhost:3000/api/health | jq
                </pre>
                <p
                  style={{
                    margin: "12px 0 6px",
                    color: "#a1a1aa",
                    fontSize: "0.85rem",
                  }}
                >
                  Stream chat
                </p>
                <pre
                  style={{
                    margin: 0,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  curl -N -X POST http://localhost:3000/api/chat -d 
                </pre>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
