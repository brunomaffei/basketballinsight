import { styled } from "@mui/material";

interface StatusIndicatorProps {
  status?: "finished" | "live" | "scheduled";
}

export const StatusIndicator = styled("span")<StatusIndicatorProps>(
  ({ status }) => ({
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    display: "inline-block",
    marginRight: "4px",
    backgroundColor:
      status === "finished"
        ? "#48bb78"
        : status === "live"
        ? "#fc8181"
        : status === "scheduled"
        ? "#f6e05e"
        : "#718096",
  })
);
