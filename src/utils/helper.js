// Adicione esta função de formatação de nomes
export const formatTeamName = (name) => {
  // Mapa de abreviações comuns
  const abbreviations = {
    Philadelphia: "PHI",
    Milwaukee: "MIL",
    Boston: "BOS",
    Lakers: "LAL",
    Warriors: "GSW",
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

export const formatarData = (dataString) => {
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

export const standardizeSeason = (seasonStr) => {
  // If it's already in YYYY-YYYY format, return it
  if (seasonStr.includes("-")) {
    return seasonStr;
  }
  const year = parseInt(seasonStr);
  return `${year}-${year + 1}`;
};

export const formatSeasonForApi = (seasonStr, leagueId) => {
  const leaguesRequiringFullSeason = [1, 12];
  const year = seasonStr.split("-")[0];
  if (leaguesRequiringFullSeason.includes(leagueId)) {
    return `${year}-${parseInt(year) + 1}`;
  }
  return year;
};

export const calcularTotaisJogos = (games) => {
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

export const calcularTotalPartida = (game) => {
  return game.scores.home.totalSemOT + game.scores.away.totalSemOT;
};
