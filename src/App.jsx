import BasketballStats from "./components/BasketballStats";
import analyticsBg from '../public/analytics.webp'; // Ajuste o caminho conforme necessário

function App() {
  return (
    <div
      className="app-container"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #131722 0%, #1A2035 100%)",
        padding: "2rem 1rem",
        position: "relative",
      }}
    >
      {/* Elemento decorativo de bola de basquete atualizado */}
      <div
        style={{
          position: "absolute",
          top: "5%",
          right: "5%",
          width: "300px",
          height: "300px",
          background: "radial-gradient(circle at 30% 30%, #FF8C42 0%, #FF4B1F 70%)",
          borderRadius: "50%",
          opacity: "0.15",
          filter: "blur(40px)",
          zIndex: "0",
        }}
      />

      <div
        style={{
          width: "100%",
          margin: "0 auto",
          padding: "0 1rem",
        }}
      >
        <header
          className="app-header"
          style={{
            textAlign: "center",
            marginBottom: "2rem",
            padding: "2rem",
            background: "linear-gradient(145deg, rgba(26, 32, 53, 0.95) 0%, rgba(36, 43, 69, 0.95) 100%)",
            borderRadius: "16px",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 75, 31, 0.2)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Background de textura de basquete */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url(${analyticsBg})`,
              opacity: 0.15,
              zIndex: 0,
            }}
          />

          {/* Elementos decorativos de bola de basquete */}
          <div
            style={{
              position: "absolute",
              top: "-20px",
              left: "-20px",
              width: "100px",
              height: "100px",
              background: "radial-gradient(circle at 30% 30%, #FF8C42 0%, #FF4B1F 70%)",
              borderRadius: "50%",
              opacity: "0.1",
              filter: "blur(20px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-30px",
              right: "-30px",
              width: "150px",
              height: "150px",
              background: "radial-gradient(circle at 70% 70%, #FF8C42 0%, #FF4B1F 70%)",
              borderRadius: "50%",
              opacity: "0.1",
              filter: "blur(25px)",
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 1,
              padding: "1rem",
              borderRadius: "12px",
              border: "1px solid rgba(255, 75, 31, 0.2)",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
              background: `linear-gradient(rgba(26, 32, 53, 0.95), rgba(36, 43, 69, 0.95)), url(${analyticsBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundBlendMode: 'overlay',
              isolation: 'isolate',
            }}
          >
            {/* Camada de sobreposição para melhor legibilidade */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(145deg, rgba(26, 32, 53, 0.95) 0%, rgba(36, 43, 69, 0.95) 100%)',
                borderRadius: 'inherit',
                zIndex: -1,
              }}
            />
            
            <h1
              style={{
                fontSize: "3rem",
                background: "linear-gradient(90deg, #FF4B1F 0%, #FF8C42 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
                marginBottom: "1.5rem",
                fontWeight: "800",
                textTransform: "uppercase",
                letterSpacing: "2px",
                textShadow: "0 2px 30px rgba(255, 75, 31, 0.3)",
              }}
            >
              PRO Basketball Analytics
            </h1>

            {/* Subtítulo com estilo melhorado */}
            <p
              style={{
                fontSize: "1.2rem",
                color: "#FFD700",
                maxWidth: "700px",
                margin: "0 auto 1.5rem",
                lineHeight: "1.6",
                fontWeight: "500",
                textShadow: "0 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              Análise avançada de dados e estatísticas para tomada de decisão
              estratégica no basquete profissional
            </p>

            {/* Features em cards */}
            <div
              style={{
                display: "flex",
                gap: "1.5rem",
                justifyContent: "center",
                marginTop: "2rem",
                flexWrap: "wrap",
              }}
            >
              {["Métricas Avançadas", "Análise de Performance", "Insights Estratégicos"].map((feature) => (
                <div
                  key={feature}
                  style={{
                    background: "rgba(255, 75, 31, 0.1)",
                    padding: "1rem 1.5rem",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 75, 31, 0.2)",
                    color: "#FFD700",
                    fontSize: "0.9rem",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    transition: "all 0.3s ease",
                    cursor: "default",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  }}
                >
                  <span style={{ color: "#FF4B1F" }}>•</span>
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </header>

        <div
          className="stats-container"
          style={{
            background: "rgba(17, 25, 40, 0.9)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 75, 31, 0.2)",
            borderRadius: "24px",
            padding: "2rem",
            width: "100%",
            overflowX: "visible",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
            position: "relative",
            zIndex: "1",
          }}
        >
          <BasketballStats />
        </div>
      </div>
    </div>
  );
}

export default App;
