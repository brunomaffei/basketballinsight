import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { analisarOverUnder } from "../api";
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  TextField,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  Grid,
  Paper,
  Stack,
  Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

const StyledCard = styled(Card)(({ theme, variant }) => ({
  background:
    variant === "over"
      ? "linear-gradient(145deg, rgba(56, 161, 105, 0.1), rgba(26, 32, 44, 0.9))"
      : "linear-gradient(145deg, rgba(229, 62, 62, 0.1), rgba(26, 32, 44, 0.9))",
  borderRadius: theme.spacing(2),
  border: "1px solid rgba(255, 255, 255, 0.1)",
}));

const StyledChip = styled(Chip)(({ variant }) => ({
  backgroundColor:
    variant === "over" ? "rgba(72, 187, 120, 0.2)" : "rgba(252, 129, 129, 0.2)",
  color: variant === "over" ? "#48bb78" : "#fc8181",
  fontWeight: 600,
  height: "20px",
  minWidth: "auto",
  "& .MuiChip-label": {
    padding: "0 4px",
    fontSize: "0.75rem",
  },
  "& .MuiChip-labelSmall": {
    padding: "0 4px",
    fontSize: "0.75rem",
  },
  "& .MuiChip-icon": {
    color: "inherit",
    fontSize: "16px",
    margin: "0 2px",
  },
}));

const GameItem = styled(ListItem)(({ theme }) => ({
  backgroundColor: "rgba(0, 0, 0, 0.2)",
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

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

  if (!games || games.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="text.secondary" align="center">
          Sem jogos disponíveis para análise
        </Typography>
      </Box>
    );
  }

  if (!analise) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="text.secondary" align="center">
          Carregando análise...
        </Typography>
      </Box>
    );
  }

  const totalJogos = analise.over.total + analise.under.total;
  const overPercentage = ((analise.over.total / totalJogos) * 100).toFixed(1);
  const underPercentage = ((analise.under.total / totalJogos) * 100).toFixed(1);

  return (
    <Box sx={{ p: 2 }}>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          background: "#212939",
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Typography variant="h6" component="label" sx={{ color: "#fff" }}>
          LINHA O/U
        </Typography>
        <TextField
          value={linhaBet}
          onChange={(e) => setLinhaBet(parseFloat(e.target.value || 0))}
          type="number"
          inputProps={{ step: "0.5" }}
          variant="outlined"
          size="small"
          sx={{
            maxWidth: 120,
            "& .MuiOutlinedInput-root": {
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              color: "#fff",
              "& fieldset": {
                borderColor: "rgba(255, 255, 255, 0.2)",
              },
            },
          }}
        />
      </Paper>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <StyledCard variant="over">
            <CardHeader
              title={
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="h6" sx={{ color: "#fff" }}>
                    OVER {linhaBet}
                  </Typography>
                  <StyledChip
                    variant="over"
                    icon={<TrendingUpIcon />}
                    label={`${overPercentage}%`}
                  />
                </Stack>
              }
              subheader={
                <Typography color="rgba(255, 255, 255, 0.7)" variant="caption">
                  {analise.over.total}/{totalJogos} jogos
                </Typography>
              }
            />
            <Divider sx={{ opacity: 0.1 }} />
            <CardContent>
              <List disablePadding>
                {analise.over.jogos.map((jogo, idx) => (
                  <GameItem key={idx} disablePadding>
                    <ListItemText
                      primary={
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          marginRight="10px"
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            marginLeft="10px"
                            marginRight="10px"
                          >
                            <CalendarTodayIcon
                              sx={{ fontSize: 16, opacity: 0.7, color: "#fff" }}
                            />
                            <Typography variant="body2" sx={{ color: "#fff" }}>
                              {formatarData(jogo.data)}
                            </Typography>
                          </Stack>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: "#fff" }}
                          >
                            {jogo.total}
                            <StyledChip
                              variant="over"
                              size="small"
                              label={`+${jogo.diferenca}`}
                              sx={{ ml: 1 }}
                            />
                          </Typography>
                        </Stack>
                      }
                    />
                  </GameItem>
                ))}
              </List>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <StyledCard variant="under">
            <CardHeader
              title={
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="h6" sx={{ color: "#fff" }}>
                    UNDER {linhaBet}
                  </Typography>
                  <StyledChip
                    variant="under"
                    icon={<TrendingDownIcon />}
                    label={`${underPercentage}%`}
                  />
                </Stack>
              }
              subheader={
                <Typography color="rgba(255, 255, 255, 0.7)" variant="caption">
                  {analise.under.total}/{totalJogos} jogos
                </Typography>
              }
            />
            <Divider sx={{ opacity: 0.1 }} />
            <CardContent>
              <List disablePadding>
                {analise.under.jogos.map((jogo, idx) => (
                  <GameItem key={idx} disablePadding>
                    <ListItemText
                      primary={
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          marginRight="10px"
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            marginLeft="10px"
                            marginRight="10px"
                          >
                            <CalendarTodayIcon
                              sx={{ fontSize: 16, opacity: 0.7, color: "#fff" }}
                            />
                            <Typography variant="body2" sx={{ color: "#fff" }}>
                              {formatarData(jogo.data)}
                            </Typography>
                          </Stack>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: "#fff" }}
                          >
                            {jogo.total}
                            <StyledChip
                              variant="under"
                              size="small"
                              label={`-${jogo.diferenca}`}
                              sx={{ ml: 1 }}
                            />
                          </Typography>
                        </Stack>
                      }
                    />
                  </GameItem>
                ))}
              </List>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
    </Box>
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
