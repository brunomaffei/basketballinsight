import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Skeleton as MuiSkeleton,
  Typography,
  Paper,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  buscarEstatisticasTime,
  buscarLeagues,
  buscarSeasons,
  buscarTeams,
  buscarUltimosJogos,
} from "../api";
import "../styles/BasketballStats.css";
import AnaliseOverUnder from "./AnaliseOverUnder";

// Add this constant at the top of the file for skeleton theme
const skeletonTheme = {
  baseColor: "rgba(26, 32, 44, 0.3)",
  highlightColor: "rgba(44, 55, 82, 0.3)",
  borderRadius: "12px",
  duration: 1.5,
};

// Styled components
const SelectorsWrapper = styled(Box)({
  display: "flex",
  gap: "1rem",
  width: "100%",
  maxWidth: "800px",
  marginBottom: "1rem",
  flexDirection: { xs: "column", md: "row" },
});

const StyledFormControl = styled(FormControl)(() => ({
  width: "100%",
  marginBottom: "1rem",
  maxWidth: { xs: "400px", md: "350px" }, // Adjust maxWidth for different screen sizes

  "& .MuiOutlinedInput-root": {
    backgroundColor: "rgba(26, 32, 44, 0.8)",
    color: "#e2e8f0",
    "&:hover": {
      backgroundColor: "rgba(44, 55, 82, 0.9)",
    },
    "&.Mui-focused": {
      backgroundColor: "rgba(44, 55, 82, 0.9)",
    },
  },
  "& .MuiInputLabel-root": {
    color: "#a5b4fc",
    "&.Mui-focused": {
      color: "#a5b4fc",
    },
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "#a5b4fc",
  },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#a5b4fc",
  },
}));

const StyledMenuItem = styled(MenuItem)(() => ({
  backgroundColor: "rgba(26, 32, 44, 0.8)",
  color: "#e2e8f0",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  "&:hover": {
    backgroundColor: "rgba(44, 55, 82, 0.9)",
  },
  "&.Mui-selected": {
    backgroundColor: "rgba(44, 55, 82, 0.9)",
  },
  "& img": {
    width: "24px",
    height: "24px",
    objectFit: "contain",
  },
}));

// Add this constant for menu props
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
      backgroundColor: "rgba(26, 32, 44, 0.95)",
    },
  },
};

// Add a styled component for the favorite indicator
const FavoriteIndicator = styled("span")({
  color: "#48bb78",
  marginLeft: "4px",
  fontSize: "0.8rem",
  fontWeight: "bold",
});

// Adicione estas constantes no topo do arquivo
const BASKETBALL_EMOJI = "🏀";

// Adicione esta função de utilidade
const preloadImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(url);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = url;
  });
};

// Adicione este componente de status estilizado
const StatusIndicator = styled("span")(({ status }) => ({
  width: "8px",
  height: "8px",
  borderRadius: "50%",
  display: "inline-block",
  marginRight: "4px",
  backgroundColor:
    status === "finished"
      ? "#48bb78" // verde para finalizado
      : status === "live"
      ? "#fc8181" // vermelho para ao vivo
      : status === "scheduled"
      ? "#f6e05e" // amarelo para agendado
      : "#718096", // cinza para outros estados
}));

const StatusWrapper = styled("div")({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "4px",
  fontSize: "0.75rem",
  padding: "4px 8px",
  borderRadius: "4px",
  backgroundColor: "rgba(0, 0, 0, 0.2)",
  width: "fit-content",
  margin: "0 auto",
});

// Adicione esta função de formatação de nomes
const formatTeamName = (name) => {
  // Mapa de abreviações comuns
  const abbreviations = {
    Philadelphia: "PHI",
    Milwaukee: "MIL",
    Boston: "BOS",
    Lakers: "LAL",
    Warriors: "GSW",
    // Adicione mais conforme necessário
  };

  // Se for um nome conhecido, usa a abreviação
  for (const [full, abbr] of Object.entries(abbreviations)) {
    if (name.includes(full)) return abbr;
  }

  // Se o nome tiver mais de 15 caracteres, abrevia
  if (name.length > 15) {
    const words = name.split(" ");
    if (words.length > 1) {
      // Pega a primeira letra de cada palavra, exceto a última
      return (
        words
          .slice(0, -1)
          .map((word) => word[0])
          .join("") +
        " " +
        words[words.length - 1]
      );
    }
  }

  return name;
};

function BasketballStats() {
  // Loading states
  const [loadingStates, setLoadingStates] = useState({
    leagues: true,
    seasons: true,
    teams: false,
    gameData: false,
  });

  // State definitions (alphabetically ordered)
  const [error, setError] = useState(null);
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [season, setSeason] = useState("2023-2024");
  const [seasons, setSeasons] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [selectedTeams, setSelectedTeams] = useState({
    team1: null,
    team2: null,
  });
  const [team1Data, setTeam1Data] = useState(null);
  const [team2Data, setTeam2Data] = useState(null);
  const [teams, setTeams] = useState([]);
  const [isDataFetching, setIsDataFetching] = useState(false);
  const [mediaGeral, setMediaGeral] = useState(null);

  const updateLoadingState = (key, value) => {
    setLoadingStates((prev) => ({ ...prev, [key]: value }));
  };

  // Helper functions (alphabetically ordered)
  // Modifique a função calcularComparacao para incluir a diferença da média
  const calcularComparacao = (team1Games, team2Games) => {
    if (!team1Games?.length || !team2Games?.length) return null;

    const comparacoes = team1Games.map((game1, index) => {
      const game2 = team2Games[index];
      const pontosFavorito =
        game1.teams.home.id === selectedTeams.team1.id
          ? game1.scores.home.totalSemOT
          : game1.scores.away.totalSemOT;

      const pontosTomadosAdversario =
        game2.teams.home.id === selectedTeams.team2.id
          ? game2.scores.away.totalSemOT
          : game2.scores.home.totalSemOT;

      const totalCombinado = pontosFavorito + pontosTomadosAdversario;

      const hasOvertime =
        game1.scores.home.hasOvertime ||
        game1.scores.away.hasOvertime ||
        game2.scores.home.hasOvertime ||
        game2.scores.away.hasOvertime;

      return {
        data: formatarData(game1.date),
        time1: {
          nome: selectedTeams.team1.name,
          pontos: pontosFavorito,
        },
        time2: {
          nome: selectedTeams.team2.name,
          pontosTomados: pontosTomadosAdversario,
        },
        totalCombinado,
        hasOvertime,
      };
    });

    // Calcular a média para poder comparar cada jogo
    const media =
      comparacoes.reduce((acc, comp) => acc + comp.totalCombinado, 0) /
      comparacoes.length;

    // Adicionar a diferença da média para cada jogo
    return comparacoes.map((comp) => ({
      ...comp,
      diferencaDaMedia: comp.totalCombinado - media,
    }));
  };

  const calcularTotaisJogos = (games) => {
    if (!games || games.length === 0)
      return { pontosFeitos: 0, pontosSofridos: 0, total: 0 };

    return games.reduce(
      (acc, game) => {
        const isHome = game.teams.home.id === game.id;
        const pontosFeitos = isHome
          ? game.scores.home.total
          : game.scores.away.total;
        const pontosSofridos = isHome
          ? game.scores.away.total
          : game.scores.home.total;

        return {
          pontosFeitos: acc.pontosFeitos + pontosFeitos,
          pontosSofridos: acc.pontosSofridos + pontosSofridos,
          total: acc.total + pontosFeitos + pontosSofridos,
        };
      },
      { pontosFeitos: 0, pontosSofridos: 0, total: 0 }
    );
  };

  const calcularTotalPartida = (game) => {
    return game.scores.home.totalSemOT + game.scores.away.totalSemOT;
  };

  const formatarData = (dataString) => {
    try {
      const data = new Date(dataString);
      return data.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (e) {
      console.error("Erro ao formatar data:", e);
      return "Data inválida";
    }
  };

  // Modifique a função getGameStatus
  const getGameStatus = (status) => {
    switch (status.short) {
      case "LIVE":
      case "INPLAY":
        return (
          <StatusWrapper>
            <StatusIndicator status="live" />
            <span>Live</span>
          </StatusWrapper>
        );
      case "HT":
        return (
          <StatusWrapper>
            <StatusIndicator status="live" />
            <span>HT</span>
          </StatusWrapper>
        );
      case "FT":
      case "FINISHED":
      case "END":
        return (
          <StatusWrapper>
            <StatusIndicator status="finished" />
            <span>FT</span>
          </StatusWrapper>
        );
      case "NS":
      case "SCHED":
        return (
          <StatusWrapper>
            <StatusIndicator status="scheduled" />
            <span>Agd</span>
          </StatusWrapper>
        );
      default:
        return (
          <StatusWrapper>
            <StatusIndicator />
            <span>{status.short || "?"}</span>
          </StatusWrapper>
        );
    }
  };

  const handleLeagueSelect = (event) => {
    const selectedValue = event.target.value;
    const league = selectedValue ? JSON.parse(selectedValue) : null;
    setSelectedLeague(league);
    setSelectedTeams({ team1: null, team2: null });
  };

  const handleTeamSelect = (team, position) => {
    setSelectedTeams((prev) => ({
      ...prev,
      [position]: team,
    }));
  };

  const isWinner = (game, teamId) => {
    const isHome = game.teams.home.id === teamId;
    const homeScore = game.scores.home.total;
    const awayScore = game.scores.away.total;

    if (isHome) {
      return homeScore > awayScore;
    }
    return awayScore > homeScore;
  };

  // Atualize o renderComparacao para mostrar a diferença
  const renderComparacao = () => {
    if (!team1Data || !team2Data) return null;

    const comparacoes = calcularComparacao(team1Data.games, team2Data.games);

    if (!comparacoes || comparacoes.length === 0) {
      return (
        <div className="comparison-section">
          <h3>Comparação de Jogos - Favorito + Tomados</h3>
          <p>Não há dados suficientes para comparação</p>
        </div>
      );
    }

    const totalGeral = comparacoes.reduce(
      (acc, comp) => acc + comp.totalCombinado,
      0
    );
    const mediaAtual = (totalGeral / comparacoes.length).toFixed(2);

    return (
      <div className="comparison-section">
        <h3>Comparação de Jogos - Favorito + Tomados</h3>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>
                <div className="team-header-cell">
                  <img
                    src={team1Data.logo}
                    alt={team1Data.name}
                    className="team-mini-logo"
                  />
                  <span>{formatTeamName(team1Data.name)} (F)</span>
                </div>
              </th>
              <th>
                <div className="team-header-cell">
                  <img
                    src={team2Data.logo}
                    alt={team2Data.name}
                    className="team-mini-logo"
                  />
                  <span>Pts {formatTeamName(team2Data.name)}</span>
                </div>
              </th>
              <th>Total</th>
              <th>Var.</th>
            </tr>
          </thead>
          <tbody>
            {comparacoes.map((comp, index) => (
              <tr key={index}>
                <td>{comp.data}</td>
                <td className="pontos-feitos">
                  {comp.time1.pontos}
                  {comp.hasOvertime && <span className="overtime">*</span>}
                </td>
                <td className="pontos-tomados">
                  {comp.time2.pontosTomados}
                  {comp.hasOvertime && <span className="overtime">*</span>}
                </td>
                <td className="total-combined">
                  {comp.totalCombinado}
                  {comp.hasOvertime && <span className="overtime">*</span>}
                </td>
                <td
                  className={`variacao ${
                    comp.diferencaDaMedia > 0 ? "over" : "under"
                  }`}
                >
                  {comp.diferencaDaMedia > 0 ? "+" : ""}
                  {comp.diferencaDaMedia.toFixed(1)}
                </td>
              </tr>
            ))}
            <tr className="grand-total-row">
              <td colSpan="3">Média</td>
              <td>{mediaAtual}</td>
              <td>-</td>
            </tr>
          </tbody>
        </table>
        {comparacoes.some((comp) => comp.hasOvertime) && (
          <div className="overtime-note">
            * Jogo com prorrogação (pontos da prorrogação não incluídos no
            total)
          </div>
        )}
      </div>
    );
  };

  const TeamStatsSkeleton = () => (
    <div className="team-stats">
      <div className="team-header">
        <Skeleton circle width={60} height={60} {...skeletonTheme} />
        <h3>
          <Skeleton width={200} height={30} {...skeletonTheme} />
        </h3>
        <p className="team-league">
          <Skeleton width={150} height={20} {...skeletonTheme} />
        </p>
      </div>
      <div className="stats-grid">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="stats-section">
            <h4>
              <Skeleton width={120} height={24} {...skeletonTheme} />
            </h4>
            {[...Array(3)].map((_, j) => (
              <div key={j} className="stat-row">
                <Skeleton
                  width="100%"
                  height={30}
                  {...skeletonTheme}
                  style={{ marginBottom: "8px" }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  const LastGamesSkeleton = () => (
    <div className="last-games">
      <h3>
        <Skeleton
          width={300}
          height={32}
          {...skeletonTheme}
          style={{ marginBottom: "20px" }}
        />
      </h3>
      <table>
        <thead>
          <tr>
            {[
              "Data",
              "Status",
              "Time Casa",
              "Placar",
              "Time Visitante",
              "Total",
            ].map((_, i) => (
              <th key={i}>
                <Skeleton
                  width={i === 2 || i === 4 ? 150 : 100}
                  height={24}
                  {...skeletonTheme}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, i) => (
            <tr key={i}>
              <td>
                <Skeleton width={80} height={24} {...skeletonTheme} />
              </td>
              <td>
                <Skeleton width={90} height={24} {...skeletonTheme} />
              </td>
              <td>
                <Skeleton width={150} height={24} {...skeletonTheme} />
              </td>
              <td>
                <Skeleton width={100} height={24} {...skeletonTheme} />
              </td>
              <td>
                <Skeleton width={150} height={24} {...skeletonTheme} />
              </td>
              <td>
                <Skeleton width={80} height={24} {...skeletonTheme} />
              </td>
            </tr>
          ))}
          <tr className="totals-row">
            <td colSpan={2}>
              <Skeleton width={100} height={24} {...skeletonTheme} />
            </td>
            <td>
              <Skeleton width={120} height={24} {...skeletonTheme} />
            </td>
            <td>
              <Skeleton width={120} height={24} {...skeletonTheme} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  const renderTeamStats = (teamData) => {
    if (loading) return <TeamStatsSkeleton />;
    if (!teamData?.stats) {
      return (
        <div className="no-stats">
          <p>Estatísticas não disponíveis</p>
        </div>
      );
    }

    const stats = teamData.stats;
    return (
      <div className="team-stats">
        <div className="team-header">
          <img src={teamData.logo} alt={teamData.name} className="team-logo" />
          <h3>{teamData.name}</h3>
          <p className="team-league">{stats.league.name}</p>
        </div>

        <div className="stats-grid">
          <div className="stats-section">
            <h4>Jogos</h4>
            <div className="stat-row">
              <label>Total de Jogos:</label>
              <span>{stats.games.played.all || 0}</span>
            </div>
            <div className="stat-row">
              <label>Casa:</label>
              <span>{stats.games.played.home || 0}</span>
            </div>
            <div className="stat-row">
              <label>Fora:</label>
              <span>{stats.games.played.away || 0}</span>
            </div>
          </div>

          <div className="stats-section">
            <h4>Vitórias</h4>
            <div className="stat-row">
              <label>Total:</label>
              <span>
                {stats.games.wins.all.total || 0} (
                {((stats.games.wins.all.percentage || 0) * 100).toFixed(1)}%)
              </span>
            </div>
            <div className="stat-row">
              <label>Casa:</label>
              <span>
                {stats.games.wins.home.total || 0} (
                {((stats.games.wins.home.percentage || 0) * 100).toFixed(1)}%)
              </span>
            </div>
            <div className="stat-row">
              <label>Fora:</label>
              <span>
                {stats.games.wins.away.total || 0} (
                {((stats.games.wins.away.percentage || 0) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>

          <div className="stats-section">
            <h4>Pontuação</h4>
            <div className="stat-row">
              <label>Média (Geral):</label>
              <span>{stats.points.for.average.all || 0}</span>
            </div>
            <div className="stat-row">
              <label>Média (Casa):</label>
              <span>{stats.points.for.average.home || 0}</span>
            </div>
            <div className="stat-row">
              <label>Média (Fora):</label>
              <span>{stats.points.for.average.away || 0}</span>
            </div>
          </div>

          <div className="stats-section">
            <h4>Pontos Sofridos</h4>
            <div className="stat-row">
              <label>Média (Geral):</label>
              <span>{stats.points.against.average.all || 0}</span>
            </div>
            <div className="stat-row">
              <label>Média (Casa):</label>
              <span>{stats.points.against.average.home || 0}</span>
            </div>
            <div className="stat-row">
              <label>Média (Fora):</label>
              <span>{stats.points.against.average.away || 0}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Modifique o render da tabela de últimos jogos
  const renderUltimosJogos = (teamData) => {
    if (loading) return <LastGamesSkeleton />;
    if (!teamData?.games || teamData.games.length === 0) {
      return (
        <div className="no-games">
          <p>Não há jogos disponíveis para esta temporada</p>
        </div>
      );
    }

    const totais = calcularTotaisJogos(teamData.games);

    return (
      <div className="last-games">
        <h3>
          Últimos 5 Jogos - {teamData.name}{" "}
          {teamData.id === selectedTeams.team1.id && "(Favorito)"}
        </h3>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Status</th>
              <th>Time Casa</th>
              <th>Placar</th>
              <th>Time Visitante</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {teamData.games.map((game) => (
              <tr
                key={game.id}
                className={isWinner(game, teamData.id) ? "victory" : "defeat"}
              >
                <td>{formatarData(game.date)}</td>
                <td>{getGameStatus(game.status)}</td>
                <td
                  className={
                    game.teams.home.id === teamData.id ? "highlight" : ""
                  }
                >
                  {formatTeamName(game.teams.home.name)}
                </td>
                <td className="score">
                  {game.scores.home.totalSemOT}
                  {game.scores.home.hasOvertime && (
                    <span className="overtime">*</span>
                  )}{" "}
                  - {game.scores.away.totalSemOT}
                  {game.scores.away.hasOvertime && (
                    <span className="overtime">*</span>
                  )}
                </td>
                <td
                  className={
                    game.teams.away.id === teamData.id ? "highlight" : ""
                  }
                >
                  {formatTeamName(game.teams.away.name)}
                </td>
                <td className="total-score">{calcularTotalPartida(game)}</td>
              </tr>
            ))}
            <tr className="totals-row">
              <td colSpan="6">
                {" "}
                {/* Ajustado para cobrir todas as colunas */}
                <div className="totals-content">
                  <span>Total de pontos nos jogos: {totais.total}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  // useEffect hooks (keep original order as they may have dependencies)
  useEffect(() => {
    async function fetchLeagues() {
      updateLoadingState("leagues", true);
      try {
        const data = await buscarLeagues();

        // Tenta pré-carregar todas as imagens
        const leaguesWithValidImages = await Promise.all(
          data.response.map(async (league) => {
            if (!league.logo) return league;

            try {
              // Tenta carregar a imagem
              await preloadImage(league.logo);
              return league;
            } catch (error) {
              // Se falhar, retorna a liga sem o logo
              console.warn(`Failed to load logo for ${league.name}:`, error);
              return { ...league, logo: null };
            }
          })
        );

        setLeagues(leaguesWithValidImages);
        setError(null);
      } catch (e) {
        setError(`Erro ao carregar ligas: ${e.message}`);
        setLeagues([]);
      } finally {
        updateLoadingState("leagues", false);
      }
    }
    fetchLeagues();
  }, []);

  useEffect(() => {
    async function fetchSeasons() {
      updateLoadingState("seasons", true);
      try {
        const data = await buscarSeasons();
        if (data.response && data.response.length > 0) {
          setSeasons(data.response);
          setSeason(data.response[0]);
        }
      } catch (e) {
        console.error(e);
        setError(`Erro ao carregar temporadas disponíveis: ${e.message}`);
      } finally {
        updateLoadingState("seasons", false);
      }
    }
    fetchSeasons();
  }, []);

  useEffect(() => {
    async function fetchTeams() {
      if (!selectedLeague) return;
      updateLoadingState("teams", true);
      try {
        setLoading(true);
        // Passar a temporada completa
        const data = await buscarTeams(selectedLeague.id, season);

        if (!data.response || data.response.length === 0) {
          setError(
            `Nenhum time encontrado para a liga ${selectedLeague.name} na temporada ${season}`
          );
          setTeams([]);
        } else {
          setTeams(data.response);
          setError(null);
        }
      } catch (e) {
        setError(`Erro ao carregar times: ${e.message}`);
        setTeams([]);
      } finally {
        updateLoadingState("teams", false);
      }
    }
    if (selectedLeague) {
      fetchTeams();
    }
  }, [selectedLeague, season]);

  useEffect(() => {
    async function fetchTeamData() {
      if (!selectedTeams.team1 || !selectedTeams.team2) return;

      setIsDataFetching(true); // Set to true only when actually fetching
      setLoading(true);

      try {
        const [team1Games, team2Games, team1Stats, team2Stats] =
          await Promise.all([
            buscarUltimosJogos(
              selectedTeams.team1.id,
              season,
              selectedLeague.id
            ),
            buscarUltimosJogos(
              selectedTeams.team2.id,
              season,
              selectedLeague.id
            ),
            buscarEstatisticasTime(
              selectedTeams.team1.id,
              selectedLeague.id,
              season
            ),
            buscarEstatisticasTime(
              selectedTeams.team2.id,
              selectedLeague.id,
              season
            ),
          ]);

        setTeam1Data({
          ...selectedTeams.team1,
          games: team1Games.response,
          stats: team1Stats.response,
        });

        setTeam2Data({
          ...selectedTeams.team2,
          games: team2Games.response,
          stats: team2Stats.response,
        });
      } catch (e) {
        setError(`Erro ao carregar dados dos times: ${e.message}`);
        console.error("Erro detalhado:", e);
      } finally {
        setLoading(false);
        setIsDataFetching(false); // Reset after fetch completes
      }
    }

    if (selectedTeams.team1 && selectedTeams.team2) {
      fetchTeamData();
    }
  }, [selectedTeams, selectedLeague, season]);

  // Add useEffect for mediaGeral calculation
  useEffect(() => {
    if (team1Data && team2Data) {
      const comparacoes = calcularComparacao(team1Data.games, team2Data.games);
      if (comparacoes && comparacoes.length > 0) {
        const totalGeral = comparacoes.reduce(
          (acc, comp) => acc + comp.totalCombinado,
          0
        );
        const calculatedMedia = (totalGeral / comparacoes.length).toFixed(2);
        setMediaGeral(parseFloat(calculatedMedia));
      }
    }
  }, [team1Data, team2Data]);

  const LoadingIndicator = ({ loading, children }) => (
    <Box className="select-wrapper">
      {loading ? (
        <MuiSkeleton
          variant="rectangular"
          height={56}
          sx={{
            backgroundColor: "rgba(26, 32, 44, 0.3)",
            borderRadius: 1,
          }}
        />
      ) : (
        children
      )}
    </Box>
  );

  LoadingIndicator.propTypes = {
    loading: PropTypes.bool.isRequired,
    children: PropTypes.node.isRequired,
  };

  // Add this sorting function
  const sortedLeagues = leagues.sort((a, b) => a.name.localeCompare(b.name));

  // Return statement (main render)
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="basketball-stats-container">
      <Paper
        elevation={0}
        className="selectors-container"
        sx={{
          background: "rgba(165, 164, 164, 0.05)",
          backdropFilter: "blur(10px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* New wrapper for season and league selectors */}
        <SelectorsWrapper>
          <LoadingIndicator loading={loadingStates.seasons}>
            <StyledFormControl>
              <InputLabel>Selecione a Temporada</InputLabel>
              <Select
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                disabled={loadingStates.seasons || loadingStates.leagues}
                label="Selecione a Temporada"
                MenuProps={MenuProps}
              >
                {seasons.map((seasonOption) => (
                  <StyledMenuItem key={seasonOption} value={seasonOption}>
                    {seasonOption}
                  </StyledMenuItem>
                ))}
              </Select>
            </StyledFormControl>
          </LoadingIndicator>

          <LoadingIndicator loading={loadingStates.leagues}>
            <StyledFormControl>
              <InputLabel>Selecione a Liga</InputLabel>
              <Select
                value={selectedLeague ? JSON.stringify(selectedLeague) : ""}
                onChange={handleLeagueSelect}
                disabled={loadingStates.leagues || loadingStates.seasons}
                label="Selecione a Liga"
                MenuProps={MenuProps}
                renderValue={(selected) => {
                  if (!selected) return "Escolha uma liga";
                  const league = JSON.parse(selected);
                  return (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography
                        component="span"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          width: 24,
                          height: 24,
                          justifyContent: "center",
                          fontSize: "1.2rem",
                        }}
                      >
                        {league.logo ? (
                          <img
                            src={league.logo}
                            alt={league.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "contain",
                            }}
                          />
                        ) : (
                          BASKETBALL_EMOJI
                        )}
                      </Typography>
                      {league.name}
                    </Box>
                  );
                }}
              >
                <StyledMenuItem value="">Escolha uma liga</StyledMenuItem>
                {sortedLeagues.map((league) => (
                  <StyledMenuItem
                    key={league.id}
                    value={JSON.stringify(league)}
                  >
                    <Typography
                      component="span"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        width: 24,
                        height: 24,
                        justifyContent: "center",
                        fontSize: "1.2rem",
                      }}
                    >
                      {league.logo ? (
                        <img
                          src={league.logo}
                          alt={league.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                          }}
                        />
                      ) : (
                        BASKETBALL_EMOJI
                      )}
                    </Typography>
                    {league.name}
                  </StyledMenuItem>
                ))}
              </Select>
            </StyledFormControl>
          </LoadingIndicator>
        </SelectorsWrapper>

        {selectedLeague && (
          <LoadingIndicator loading={loadingStates.teams}>
            <Box
              className="teams-selector"
              sx={{
                width: "100%",
                maxWidth: "800px",
                gap: { xs: "1rem", sm: "2rem" },
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              }}
            >
              <StyledFormControl>
                <InputLabel>
                  Time 1{" "}
                  <FavoriteIndicator component="span">
                    (Favorito)
                  </FavoriteIndicator>
                </InputLabel>
                <Select
                  onChange={(e) =>
                    handleTeamSelect(JSON.parse(e.target.value), "team1")
                  }
                  disabled={loadingStates.teams}
                  label="Time 1 (Favorito)"
                  defaultValue=""
                  MenuProps={MenuProps}
                >
                  <StyledMenuItem value="">
                    Selecione o Time Favorito
                  </StyledMenuItem>
                  {teams.map((team) => (
                    <StyledMenuItem key={team.id} value={JSON.stringify(team)}>
                      {team.name}
                    </StyledMenuItem>
                  ))}
                </Select>
              </StyledFormControl>

              <StyledFormControl>
                <InputLabel>Time 2</InputLabel>
                <Select
                  onChange={(e) =>
                    handleTeamSelect(JSON.parse(e.target.value), "team2")
                  }
                  disabled={loadingStates.teams || !selectedTeams.team1}
                  label="Time 2"
                  defaultValue=""
                  MenuProps={MenuProps}
                >
                  <StyledMenuItem value="">Selecione o Time 2</StyledMenuItem>
                  {teams.map((team) => (
                    <StyledMenuItem
                      key={team.id}
                      value={JSON.stringify(team)}
                      disabled={team.id === selectedTeams.team1?.id}
                    >
                      {team.name}
                    </StyledMenuItem>
                  ))}
                </Select>
              </StyledFormControl>
            </Box>
          </LoadingIndicator>
        )}
      </Paper>

      {isDataFetching && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "200px",
          }}
        >
          <Typography
            className="loading"
            variant="h6"
            sx={{
              textAlign: "center",
              color: "#a5b4fc",
              animation: "fadeIn 0.3s ease-out",
              padding: "2rem",
              background: "rgba(26, 32, 44, 0.7)",
              borderRadius: "12px",
              minWidth: "300px",
            }}
          >
            Carregando dados dos jogos...
          </Typography>
        </Box>
      )}

      {!isDataFetching && team1Data && team2Data && (
        <>
          <div className="stats-tables-container">
            {[team1Data, team2Data].map((teamData) => {
              return (
                <div key={teamData.id} className="team-data-container">
                  <h2>
                    {loading ? (
                      <Skeleton
                        width={250}
                        height={36}
                        {...skeletonTheme}
                        style={{ marginBottom: "20px" }}
                      />
                    ) : (
                      teamData.name
                    )}
                  </h2>
                  {renderTeamStats(teamData)}
                  {renderUltimosJogos(teamData)}
                </div>
              );
            })}
          </div>

          {/* Render comparison first */}
          {loading ? (
            <div style={{ margin: "20px 0" }}>
              <Skeleton
                count={5}
                height={40}
                {...skeletonTheme}
                style={{ marginBottom: "12px" }}
              />
            </div>
          ) : (
            renderComparacao()
          )}

          {/* Then render Over/Under analysis */}
          <div className="stats-tables-container">
            {[team1Data, team2Data].map((teamData) => (
              <div key={teamData.id}>
                {loading ? (
                  <div style={{ margin: "20px 0" }}>
                    <Skeleton
                      count={3}
                      height={40}
                      {...skeletonTheme}
                      style={{ marginBottom: "12px" }}
                    />
                  </div>
                ) : (
                  <AnaliseOverUnder
                    games={teamData.games}
                    defaultLinha={mediaGeral}
                  />
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default BasketballStats;
