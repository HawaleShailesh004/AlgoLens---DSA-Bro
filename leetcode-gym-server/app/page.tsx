export default function Home() {
  return (
    <div style={{ 
      height: "100vh", 
      display: "flex", 
      flexDirection: "column",
      alignItems: "center", 
      justifyContent: "center", 
      backgroundColor: "#09090b", 
      color: "#e4e4e7",
      fontFamily: "monospace"
    }}>
      <div style={{ 
        padding: "2rem", 
        border: "1px solid #27272a", 
        borderRadius: "12px",
        textAlign: "center"
      }}>
        <h1 style={{ color: "#f97316" }}>AlgoLens API 🚀</h1>
        <p>Status: <span style={{ color: "#4ade80" }}>Operational</span></p>
        <p style={{ fontSize: "0.8rem", color: "#71717a", marginTop: "1rem" }}>
          Ready to serve requests.
        </p>
      </div>
    </div>
  );
}