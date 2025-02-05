import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { analisarOverUnder } from "../api";

const formatarData = (data) => {
  return new Date(data).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
};

function AnaliseOverUnder({ games, defaultLinha }) {
  const [linhaBet, setLinhaBet] = useState(defaultLinha || 200.5);
  const [analise, setAnalise] = useState(null);

  useEffect(() => {
    if (defaultLinha) {
      setLinhaBet(defaultLinha);
    }
  }, [defaultLinha]);

  useEffect(() => {
    const fazerAnalise = async () => {
      try {
        const resultado = await analisarOverUnder(games, linhaBet);
        setAnalise(resultado);
      } catch (error) {
        console.error("Erro na análise:", error);
      }
    };

    if (games && games.length > 0) {
      fazerAnalise();
    }
  }, [games, linhaBet]);

  // Verificações iniciais
  if (!games || games.length === 0) {
    return (
      <div className="analise-overunder">
        <p>Sem jogos disponíveis para análise</p>
      </div>
    );
  }

  if (!analise) {
    return (
      <div className="analise-overunder">
        <p>Carregando análise...</p>
      </div>
    );
  }

  const totalJogos = analise.over.total + analise.under.total;
  const overPercentage =
    totalJogos > 0
      ? ((analise.over.total / totalJogos) * 100).toFixed(1)
      : "0.0";
  const underPercentage =
    totalJogos > 0
      ? ((analise.under.total / totalJogos) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="analise-overunder">
      <div className="linha-bet-container">
        <label>LINHA OVER/UNDER</label>
        <input
          type="number"
          step="0.5"
          value={linhaBet}
          onChange={(e) => setLinhaBet(parseFloat(e.target.value || 0))}
        />
      </div>

      <div className="analise-stats-grid">
        <div className="analise-section over">
          <div className="analise-header">
            <h4>OVER {linhaBet}</h4>
            <span className="percentage">{overPercentage}%</span>
          </div>
          <div className="jogos-list">
            {analise.over.jogos.map((jogo, idx) => (
              <div key={idx} className="jogo-item">
                <span className="data">{formatarData(jogo.data)}</span>
                <span className="times">{jogo.times}</span>
                <span className="placar">{jogo.placar}</span>
                <div className="total-container">
                  <span className="total">{jogo.total}</span>
                  <span className="diferenca">+{jogo.diferenca}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="analise-section under">
          <div className="analise-header">
            <h4>UNDER {linhaBet}</h4>
            <span className="percentage">{underPercentage}%</span>
          </div>
          <div className="jogos-list">
            {analise.under.jogos.map((jogo, idx) => (
              <div key={idx} className="jogo-item">
                <span className="data">{formatarData(jogo.data)}</span>
                <span className="times">{jogo.times}</span>
                <span className="placar">{jogo.placar}</span>
                <div className="total-container">
                  <span className="total">{jogo.total}</span>
                  <span className="diferenca">-{jogo.diferenca}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

AnaliseOverUnder.propTypes = {
  games: PropTypes.array,
  defaultLinha: PropTypes.number,
};

AnaliseOverUnder.defaultProps = {
  games: [],
  defaultLinha: 200.5,
};

export default AnaliseOverUnder;
