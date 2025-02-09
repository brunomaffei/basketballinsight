/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from "react";
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
  Button,
} from "@mui/material";
import RefreshIcon from '@mui/icons-material/Refresh';
import { styled } from "@mui/material/styles";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  buscarEstatisticasTime,
  buscarLeagues,
  buscarSeasons,
  buscarTeams,
  buscarUltimosJogos,
  buscarProximoJogo,
  buscarHistoricoEProximoJogo,
} from "../api";
import "../styles/BasketballStats.css";
import AnaliseOverUnder from "./AnaliseOverUnder";
import { StatusIndicator } from "./StatusIndicator";
import {
  calcularTotaisJogos,
  calcularTotalPartida,
  formatarData,
  formatSeasonForApi,
  formatTeamName,
  standardizeSeason,
} from "../utils/helper";
import Selectors from "./Selector";

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
  maxWidth: { xs: "400px", md: "350px" },

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

// Adicione este styled component para o indicador de próximo adversário
const NextOpponentIndicator = styled("div")({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  color: "#48bb78",
  fontSize: "0.875rem",
  fontWeight: "500",
});

function BasketballStats() {
  const [loadingStates, setLoadingStates] = useState({
    leagues: true,
    seasons: true,
    teams: false,
    gameData: false,
  });
  const [error, setError] = useState(null);
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [season, setSeason] = useState("2024-2025");
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
  const [proximoJogo, setProximoJogo] = useState(null);
  const [historicoTime1, setHistoricoTime1] = useState(null);
  const [linhasOverUnder, setLinhasOverUnder] = useState({});

  const updateLoadingState = (key, value) => {
    setLoadingStates((prev) => ({ ...prev, [key]: value }));
  };

  // Adicionar função de reload
  const handleReload = () => {
    window.location.reload();
  };

  // Modifique a função calcularComparacao para incluir a diferença da média
  const calcularComparacao = useCallback(
    (team1Games, team2Games) => {
      if (!team1Games?.length || !team2Games?.length) return null;

      const linhaTeam1 = linhasOverUnder[selectedTeams.team1?.id] || 0;
      const linhaTeam2 = linhasOverUnder[selectedTeams.team2?.id] || 0;

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

        const mediaLinhas = (linhaTeam1 + linhaTeam2) / 2; // Média das duas linhas
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
          // Calcular a diferença em relação à linha de O/U ao invés da média
          diferencaDaLinha: totalCombinado - mediaLinhas // Usar a média das linhas
        };
      });

      return comparacoes;
    },
    [selectedTeams, linhasOverUnder] // Adicione linhaOverUnder como dependência
  );

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

  const handleTeamSelect = async (team, position) => {
    if (position === 'team1') {
      setSelectedTeams(prev => ({ ...prev, team1: team }));
      
      try {
        // Apenas busca e mostra o próximo jogo
        const nextGame = await buscarProximoJogo(
          team.id,
          selectedLeague.id,
          season
        );
        
        if (nextGame) {
          setProximoJogo(nextGame);
        }
      } catch (error) {
        console.error("Erro ao buscar próximo jogo:", error);
      }
    } else {
      setSelectedTeams(prev => ({ ...prev, team2: team }));
    }
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
                    comp.diferencaDaLinha > 0 ? "over" : "under"
                  }`}
                >
                  {comp.diferencaDaLinha > 0 ? "+" : ""}
                  {comp.diferencaDaLinha.toFixed(1)}
                </td>
              </tr>
            ))}
            <tr className="totals-row">
              <td colSpan="3">Média</td>
              <td className="media">{mediaAtual}</td>
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
        <div className="flex bg-black-200">
          <h3>{teamData.name}</h3>
          <p className="team-league">{stats.league.name}</p>
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
          // Standardize all seasons to YYYY-YYYY format
          const standardizedSeasons = data.response.map((season) =>
            standardizeSeason(season)
          );
          setSeasons(standardizedSeasons);
          setSeason(standardizedSeasons[0]);
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
        // Use a nova função para formatar a temporada
        const formattedSeason = formatSeasonForApi(season, selectedLeague.id);
        const data = await buscarTeams(selectedLeague.id, formattedSeason);

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

      setIsDataFetching(true);
      setLoading(true);

      try {
        // Use a nova função para formatar a temporada
        const formattedSeason = formatSeasonForApi(season, selectedLeague.id);
        const [team1Games, team2Games, team1Stats, team2Stats] =
          await Promise.all([
            buscarUltimosJogos(
              selectedTeams.team1.id,
              formattedSeason,
              selectedLeague.id
            ),
            buscarUltimosJogos(
              selectedTeams.team2.id,
              formattedSeason,
              selectedLeague.id
            ),
            buscarEstatisticasTime(
              selectedTeams.team1.id,
              selectedLeague.id,
              formattedSeason
            ),
            buscarEstatisticasTime(
              selectedTeams.team2.id,
              selectedLeague.id,
              formattedSeason
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
  }, [team1Data, team2Data, calcularComparacao]);

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

  const handleSelectionsChange = ({ year, league }) => {
    if (year) setSeason(year);
    if (league !== undefined) {
      setSelectedLeague(league);
      setSelectedTeams({ team1: null, team2: null });
    }
  };

  // Adicione este componente para renderizar o histórico
  const renderHistorico = () => {
    if (!historicoTime1) return null;

    return (
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          background: "rgba(26, 32, 44, 0.8)",
          borderRadius: 2,
          color: "#fff"
        }}
      >
        <Typography variant="h6" gutterBottom>
          Análise dos Últimos 5 Jogos
        </Typography>
        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
          <div>
            <Typography variant="subtitle2">Média de pontos marcados:</Typography>
            <Typography variant="h5" color="#48bb78">
              {historicoTime1.mediaPontosFeitos.toFixed(1)}
            </Typography>
          </div>
          <div>
            <Typography variant="subtitle2">Média de pontos sofridos:</Typography>
            <Typography variant="h5" color="#fc8181">
              {historicoTime1.mediaPontosSofridos.toFixed(1)}
            </Typography>
          </div>
        </Box>
      </Paper>
    );
  };

  // Atualizar o valor da linha quando mudar no AnaliseOverUnder
  const handleLinhaChange = (novaLinha, teamId) => {
    setLinhasOverUnder(prev => ({
      ...prev,
      [teamId]: novaLinha
    }));
  };

  // Return statement (main render)
  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={handleReload}
          sx={{
            marginTop: '1rem',
            background: 'linear-gradient(90deg, #FF4B1F 0%, #FF8C42 100%)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(90deg, #FF8C42 0%, #FF4B1F 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(255, 75, 31, 0.3)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          Tentar Novamente
        </Button>
      </div>
    );
  }

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
        <Selectors onSelectionsChange={handleSelectionsChange} />

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
                  {selectedTeams.team1 
                    ? selectedTeams.team1.name 
                    : "Time 1"} 
                  <FavoriteIndicator component="span">
                    (Favorito)
                  </FavoriteIndicator>
                </InputLabel>
                <Select
                  onChange={(e) =>
                    handleTeamSelect(JSON.parse(e.target.value), "team1")
                  }
                  disabled={loadingStates.teams}
                  label={`${selectedTeams.team1 ? selectedTeams.team1.name : "Time 1"} (Favorito)`}
                  value={selectedTeams.team1 ? JSON.stringify(selectedTeams.team1) : ""}
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
                <InputLabel>Time 2 {proximoJogo && `(Próximo jogo: ${formatarData(proximoJogo.date)})`}</InputLabel>
                <Select
                  onChange={(e) =>
                    handleTeamSelect(JSON.parse(e.target.value), "team2")
                  }
                  disabled={loadingStates.teams || !selectedTeams.team1}
                  value={selectedTeams.team2 ? JSON.stringify(selectedTeams.team2) : ""}
                  label={`Time 2 ${proximoJogo ? `(Próximo jogo: ${formatarData(proximoJogo.date)})` : ''}`}
                  defaultValue=""
                  MenuProps={MenuProps}
                >
                  <StyledMenuItem value="">
                    {proximoJogo ? (
                      <NextOpponentIndicator>
                        <span>Selecione o Time 2</span>
                        <span style={{ color: "#48bb78" }}>
                          (Próximo adversário: {proximoJogo.opponent.name})
                        </span>
                      </NextOpponentIndicator>
                    ) : (
                      "Selecione o Time 2"
                    )}
                  </StyledMenuItem>
                  {teams.map((team) => (
                    <StyledMenuItem
                      key={team.id}
                      value={JSON.stringify(team)}
                      disabled={team.id === selectedTeams.team1?.id}
                      sx={{
                        backgroundColor: proximoJogo?.opponent?.id === team.id 
                          ? "rgba(72, 187, 120, 0.1)" 
                          : "inherit",
                        "&:hover": {
                          backgroundColor: proximoJogo?.opponent?.id === team.id 
                            ? "rgba(72, 187, 120, 0.2)" 
                            : "rgba(44, 55, 82, 0.9)",
                        }
                      }}
                    >
                      {team.name}
                      {proximoJogo && proximoJogo.opponent.id === team.id && (
                        <Typography
                          component="span"
                          sx={{
                            ml: 1,
                            fontSize: '0.8rem',
                            color: '#48bb78',
                            fontWeight: 'bold'
                          }}
                        >
                          (Próximo adversário)
                        </Typography>
                      )}
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
          <div className="stats-tables-container"></div>
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
                    teamId={teamData.id}
                    defaultLinha={linhasOverUnder[teamData.id] || 200.5}
                    onLinhaChange={(novaLinha) => handleLinhaChange(novaLinha, teamData.id)}
                  />
                )}
              </div>
            ))}
        </>
      )}
      {historicoTime1 && renderHistorico()}
    </div>
  );
}

export default BasketballStats;
