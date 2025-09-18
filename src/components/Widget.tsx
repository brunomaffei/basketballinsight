import React, { useEffect } from "react";

interface WidgetProps {
  leagueId: string;
  season: string;
}

const Widget: React.FC<WidgetProps> = ({ leagueId, season }) => {
  useEffect(() => {
    // Limpar o widget anterior
    const widgetContainer = document.getElementById(
      "basketball-standings-widget"
    );
    if (widgetContainer) {
      widgetContainer.innerHTML = "";
    }

    // Criar novo elemento do widget
    const widgetElement = document.createElement("div");
    widgetElement.setAttribute("id", "wg-api-basketball-standings");
    widgetElement.setAttribute("data-host", "v1.basketball.api-sports.io");
    widgetElement.setAttribute("data-key", import.meta.env.VITE_APISPORTS_KEY);
    widgetElement.setAttribute("data-league", leagueId);
    widgetElement.setAttribute("data-season", season);
    widgetElement.setAttribute("data-theme", "dark");
    widgetElement.setAttribute("data-show-errors", "false");
    widgetElement.setAttribute("data-show-logos", "true");
    widgetElement.className = "wg_loader";

    // Adicionar o widget ao container
    widgetContainer?.appendChild(widgetElement);

    // Recarregar o script do widget
    const script = document.createElement("script");
    script.src = "https://widgets.api-sports.io/2.0.3/widgets.js";
    script.type = "module";
    document.body.appendChild(script);

    return () => {
      // Cleanup
      script.remove();
      if (widgetContainer) {
        widgetContainer.innerHTML = "";
      }
    };
  }, [leagueId, season]);

  return <div id="basketball-standings-widget" className="widget-container" />;
};

export default Widget;
