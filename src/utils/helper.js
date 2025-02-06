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
