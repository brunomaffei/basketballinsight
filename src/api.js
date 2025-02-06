const BASE_URL = "https://v1.basketball.api-sports.io";
const API_HEADERS = {
  "x-rapidapi-host": "v1.basketball.api-sports.io",
  "x-apisports-key": import.meta.env.VITE_APISPORTS_KEY,
};

// Modifique a função formatSeasonForApi
const formatSeasonForApi = (season, leagueId) => {
  // Cache para armazenar quais ligas funcionam com qual formato
  if (!window.leagueSeasonFormat) {
    window.leagueSeasonFormat = {};
  }

  // Se já sabemos o formato que funciona para esta liga, use-o
  if (window.leagueSeasonFormat[leagueId]) {
    const format = window.leagueSeasonFormat[leagueId];
    const year = season.split("-")[0];
    return format === "full" ? `${year}-${parseInt(year) + 1}` : year;
  }

  // Se não sabemos, vamos tentar o formato ano simples primeiro
  const year = season.split("-")[0];
  return year;
};

export async function buscarJogosBasquete(teamId, season = "2023") {
  try {
    const response = await fetch(
      `${BASE_URL}/games?team=${teamId}&season=${season}`,
      {
        headers: API_HEADERS,
      }
    );
    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }
    const data = await response.json();
    if (data.response) {
      data.response = data.response.slice(0, 5);
    }
    return data;
  } catch (error) {
    console.error("Erro ao buscar os dados do basquete:", error);
    throw error;
  }
}

export async function buscarLeagues() {
  try {
    const response = await fetch(`${BASE_URL}/leagues`, {
      headers: API_HEADERS,
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar ligas:", error);
    throw error;
  }
}

// Modifique a função buscarTeams para lidar com a validação do formato
export async function buscarTeams(leagueId, season) {
  try {
    let formattedSeason = formatSeasonForApi(season, leagueId);
    let response = await fetch(
      `${BASE_URL}/teams?league=${leagueId}&season=${formattedSeason}`,
      {
        headers: API_HEADERS,
      }
    );
    let data = await response.json();

    // Se não encontrou dados com o primeiro formato e ainda não sabemos o formato correto
    if (
      (!data.response || data.response.length === 0) &&
      !window.leagueSeasonFormat[leagueId]
    ) {
      // Tente o outro formato
      const year = formattedSeason;
      formattedSeason = `${year}-${parseInt(year) + 1}`;

      response = await fetch(
        `${BASE_URL}/teams?league=${leagueId}&season=${formattedSeason}`,
        {
          headers: API_HEADERS,
        }
      );
      data = await response.json();

      // Salve o formato que funcionou
      if (data.response && data.response.length > 0) {
        window.leagueSeasonFormat[leagueId] = "full";
      } else {
        window.leagueSeasonFormat[leagueId] = "year";
      }
    } else if (data.response && data.response.length > 0) {
      // Se funcionou com o primeiro formato, salve essa informação
      window.leagueSeasonFormat[leagueId] = "year";
    }

    return data;
  } catch (error) {
    console.error("Erro ao buscar times:", error);
    throw error;
  }
}

// // Função auxiliar para buscar times através dos jogos
// async function buscarTimesPorJogos(leagueId, season) {
//   const url = `${BASE_URL}/games?league=${leagueId}&season=${season}`;

//   const response = await fetch(url, {
//     headers: API_HEADERS,
//   });

//   const data = await response.json();

//   if (!data.response || data.response.length === 0) {
//     return { response: [] };
//   }

//   // Extrair times únicos dos jogos
//   const uniqueTeams = new Map();

//   data.response.forEach((game) => {
//     if (game.teams?.home) {
//       uniqueTeams.set(game.teams.home.id, game.teams.home);
//     }
//     if (game.teams?.away) {
//       uniqueTeams.set(game.teams.away.id, game.teams.away);
//     }
//   });

//   return { response: Array.from(uniqueTeams.values()) };
// }

// Função auxiliar para calcular o total sem overtime
function calcularTotalSemOvertime(scores) {
  return (
    (scores.quarter_1 || 0) +
    (scores.quarter_2 || 0) +
    (scores.quarter_3 || 0) +
    (scores.quarter_4 || 0)
  );
}

// Modifique as outras funções para usar o formato já conhecido
export async function buscarEstatisticasTime(teamId, leagueId, season) {
  try {
    const formattedSeason = formatSeasonForApi(season, leagueId);
    const url = `${BASE_URL}/games?team=${teamId}&league=${leagueId}&season=${formattedSeason}`;

    const response = await fetch(url, { headers: API_HEADERS });
    const data = await response.json();

    if (!data.response || !Array.isArray(data.response)) {
      return { response: null };
    }

    // Calculate statistics from games
    const stats = data.response.reduce(
      (acc, game) => {
        const isHome = game.teams.home.id === parseInt(teamId);
        const scores = isHome ? game.scores.home : game.scores.away;
        const opponentScores = isHome ? game.scores.away : game.scores.home;

        // Calcular pontos sem overtime
        const teamScore = calcularTotalSemOvertime(scores);
        const opponentScore = calcularTotalSemOvertime(opponentScores);

        const isWin = teamScore > opponentScore;

        // Update games played
        acc.games.played.all += 1;
        acc.games.played[isHome ? "home" : "away"] += 1;

        // Update wins
        if (isWin) {
          acc.games.wins.all.total += 1;
          acc.games.wins[isHome ? "home" : "away"].total += 1;
        }

        // Update points
        acc.points.for.total.all += teamScore;
        acc.points.for.total[isHome ? "home" : "away"] += teamScore;
        acc.points.against.total.all += opponentScore;
        acc.points.against.total[isHome ? "home" : "away"] += opponentScore;

        return acc;
      },
      {
        league: { name: data.response[0]?.league?.name || "N/A" },
        games: {
          played: { all: 0, home: 0, away: 0 },
          wins: {
            all: { total: 0, percentage: 0 },
            home: { total: 0, percentage: 0 },
            away: { total: 0, percentage: 0 },
          },
        },
        points: {
          for: {
            total: { all: 0, home: 0, away: 0 },
            average: { all: 0, home: 0, away: 0 },
          },
          against: {
            total: { all: 0, home: 0, away: 0 },
            average: { all: 0, home: 0, away: 0 },
          },
        },
      }
    );

    // Calculate percentages and averages
    const games = stats.games;
    const points = stats.points;

    // Calculate win percentages
    if (games.played.all > 0) {
      games.wins.all.percentage = games.wins.all.total / games.played.all;
      games.wins.home.percentage =
        games.played.home > 0 ? games.wins.home.total / games.played.home : 0;
      games.wins.away.percentage =
        games.played.away > 0 ? games.wins.away.total / games.played.away : 0;
    }

    // Calculate point averages
    ["all", "home", "away"].forEach((type) => {
      if (games.played[type] > 0) {
        points.for.average[type] = (
          points.for.total[type] / games.played[type]
        ).toFixed(1);
        points.against.average[type] = (
          points.against.total[type] / games.played[type]
        ).toFixed(1);
      }
    });

    return { response: stats };
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    return { response: null };
  }
}

// Modifique as outras funções para usar o formato já conhecido
export async function buscarUltimosJogos(teamId, season, leagueId) {
  try {
    const formattedSeason = formatSeasonForApi(season, leagueId);
    const url = `${BASE_URL}/games?team=${teamId}&league=${leagueId}&season=${formattedSeason}`;

    const response = await fetch(url, {
      headers: API_HEADERS,
    });

    const data = await response.json();

    if (data.response && Array.isArray(data.response)) {
      const jogosValidos = data.response
        .filter(
          (game) =>
            game.teams?.home?.name &&
            game.teams?.away?.name &&
            game.scores?.home?.total != null &&
            game.scores?.away?.total != null &&
            game.date &&
            game.league?.id === parseInt(leagueId)
        )
        .map((game) => ({
          ...game,
          scores: {
            ...game.scores,
            home: {
              ...game.scores.home,
              totalSemOT: calcularTotalSemOvertime(game.scores.home),
              hasOvertime: game.scores.home.over_time != null,
            },
            away: {
              ...game.scores.away,
              totalSemOT: calcularTotalSemOvertime(game.scores.away),
              hasOvertime: game.scores.away.over_time != null,
            },
          },
        }))
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

      return { ...data, response: jogosValidos };
    }

    return { ...data, response: [] };
  } catch (error) {
    console.error("Erro ao buscar últimos jogos:", error);
    throw error;
  }
}

export async function buscarSeasons() {
  try {
    const response = await fetch(`${BASE_URL}/seasons`, {
      headers: API_HEADERS,
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    const data = await response.json();

    // Filtrar apenas as temporadas no formato "YYYY-YYYY"
    const temporadasValidas = data.response
      .filter((season) => typeof season === "string" && season.includes("-"))
      .filter((season) => {
        const [inicio, fim] = season.split("-");
        return parseInt(fim) === parseInt(inicio) + 1;
      })
      // Remover duplicatas
      .filter((season, index, self) => self.indexOf(season) === index)
      // Ordenar do mais recente para o mais antigo
      .sort((a, b) => {
        const yearA = parseInt(a.split("-")[0]);
        const yearB = parseInt(b.split("-")[0]);
        return yearB - yearA;
      });

    return { ...data, response: temporadasValidas };
  } catch (error) {
    console.error("Erro ao buscar temporadas:", error);
    throw error;
  }
}

export async function buscarOdds(leagueId, season) {
  try {
    const url = `${BASE_URL}/odds?league=${leagueId}&season=${season}`;
    const response = await fetch(url, { headers: API_HEADERS });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar odds:", error);
    throw error;
  }
}

export async function buscarBets() {
  try {
    const response = await fetch(`${BASE_URL}/bets`, { headers: API_HEADERS });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar tipos de apostas:", error);
    throw error;
  }
}
export function analisarOverUnder(games, linhaBet = 200.5) {
  if (!games || !Array.isArray(games)) {
    console.warn("Nenhum jogo disponível para análise", { games });
    return null;
  }
  try {
    const analise = games.reduce(
      (acc, game) => {
        const totalPontos =
          game.scores.home.totalSemOT + game.scores.away.totalSemOT;
        if (totalPontos > linhaBet) {
          acc.over.total++;
          acc.over.jogos.push({
            data: game.date,
            total: totalPontos,
            diferenca: (totalPontos - linhaBet).toFixed(1),
            times: `${game.teams.home.name} vs ${game.teams.away.name}`,
            placar: `${game.scores.home.totalSemOT}-${game.scores.away.totalSemOT}`,
          });
        } else {
          acc.under.total++;
          acc.under.jogos.push({
            data: game.date,
            total: totalPontos,
            diferenca: (linhaBet - totalPontos).toFixed(1),
            times: `${game.teams.home.name} vs ${game.teams.away.name}`,
            placar: `${game.scores.home.totalSemOT}-${game.scores.away.totalSemOT}`,
          });
        }

        return acc;
      },
      {
        over: { total: 0, jogos: [] },
        under: { total: 0, jogos: [] },
        linhaBet,
      }
    );

    return analise;
  } catch (error) {
    console.error("Erro ao analisar Over/Under:", error);
    return null;
  }
}
