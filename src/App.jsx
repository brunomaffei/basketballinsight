import BasketballStats from "./components/BasketballStats";

function App() {
  return (
    <div
      className="app-container"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1a1f35 0%, #2d3756 100%)",
        padding: "2rem 1rem",
      }}
    >
      <div className="content-wrapper">
        <header
          className="app-header"
          style={{
            textAlign: "center",
            marginBottom: "2rem",
            padding: "1rem",
            background: "rgba(17, 25, 40, 0.75)",
            borderRadius: "12px",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <h1
            style={{
              fontSize: "2.5rem",
              background: "linear-gradient(90deg, #a5b4fc 0%, #818cf8 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
              marginBottom: "1rem",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            PRO Basketball Analytics
          </h1>
          <p
            style={{
              fontSize: "1.1rem",
              color: "#94a3b8",
              maxWidth: "600px",
              margin: "0 auto",
              lineHeight: "1.5",
              fontWeight: "500",
            }}
          >
            Análise avançada de dados e estatísticas para tomada de decisão
            estratégica no basquete profissional
          </p>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              marginTop: "1rem",
              color: "#64748b",
              fontSize: "0.875rem",
            }}
          >
            <span>• Métricas Avançadas</span>
            <span>• Análise de Performance</span>
            <span>• Insights Estratégicos</span>
          </div>
        </header>

        <div
          className="stats-container"
          style={{
            background: "rgba(17, 25, 40, 0.75)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.125)",
          }}
        >
          <BasketballStats />
        </div>
      </div>
    </div>
  );
}

export default App;
