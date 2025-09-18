import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { buscarLeagues, buscarSeasons, buscarCountries } from "../api";
import { standardizeSeason } from "../utils/helper";

const SelectorsWrapper = styled(Box)`
  display: flex;
  gap: 1rem;
  width: 100%;
  max-width: 800px;
  margin-bottom: 1rem;
  flex-direction: column;
  ${({ theme }) => theme.breakpoints.up("md")} {
    flex-direction: row;
  }
`;

const StyledFormControl = styled(FormControl)({
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
});

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

const BASKETBALL_EMOJI = "🏀";
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: 48 * 4.5 + 8,
      width: 250,
      backgroundColor: "rgba(26, 32, 44, 0.95)",
    },
  },
};

interface League {
  id: number;
  name: string;
  logo?: string;
}

interface Country {
  id: number;
  name: string;
  flag?: string;
  code: string;
}

const Selectors = ({ onSelectionsChange }) => {
  const [years, setYears] = useState<string[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [loading, setLoading] = useState({
    years: true,
    leagues: true,
    countries: true,
  });

  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const data = await buscarSeasons();
        setYears(data.response);
        if (data.response.length > 0) {
          setSelectedYear(data.response[0]);
        }
        setLoading((prev) => ({ ...prev, years: false }));
      } catch (error) {
        console.error("Error fetching seasons:", error);
        setLoading((prev) => ({ ...prev, years: false }));
      }
    };
    fetchSeasons();
  }, []);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const data = await buscarCountries();
        setCountries(
          data.response.sort((a, b) => a.name.localeCompare(b.name))
        );
        setLoading((prev) => ({ ...prev, countries: false }));
      } catch (error) {
        console.error("Error fetching countries:", error);
        setLoading((prev) => ({ ...prev, countries: false }));
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    const fetchLeagues = async () => {
      if (!selectedCountry) return;

      try {
        setLoading((prev) => ({ ...prev, leagues: true }));
        const data = await buscarLeagues(selectedCountry.id);
        setLeagues(data.response.sort((a, b) => a.name.localeCompare(b.name)));
        setLoading((prev) => ({ ...prev, leagues: false }));
      } catch (error) {
        console.error("Error fetching leagues:", error);
        setLoading((prev) => ({ ...prev, leagues: false }));
      }
    };
    fetchLeagues();
  }, [selectedCountry]);

  const handleYearChange = (event) => {
    const year = event.target.value;
    setSelectedYear(year);
    if (onSelectionsChange) {
      onSelectionsChange({
        year: standardizeSeason(year),
        country: selectedCountry,
        league: selectedLeague,
      });
    }
  };

  const handleCountryChange = (event) => {
    const country = event.target.value ? JSON.parse(event.target.value) : null;
    setSelectedCountry(country);
    setSelectedLeague(null);
    if (onSelectionsChange) {
      onSelectionsChange({
        year: standardizeSeason(selectedYear),
        country,
        league: null,
      });
    }
  };

  const handleLeagueChange = (event) => {
    const league = event.target.value ? JSON.parse(event.target.value) : null;
    setSelectedLeague(league);
    if (onSelectionsChange) {
      onSelectionsChange({
        year: standardizeSeason(selectedYear),
        country: selectedCountry,
        league,
      });
    }
  };

  return (
    <SelectorsWrapper>
      <StyledFormControl disabled={loading.years}>
        <InputLabel>Temporada</InputLabel>
        <Select
          value={selectedYear}
          onChange={handleYearChange}
          label="Temporada"
          MenuProps={MenuProps}
        >
          {years.map((year) => (
            <StyledMenuItem key={year} value={year}>
              {year}
            </StyledMenuItem>
          ))}
        </Select>
      </StyledFormControl>

      <StyledFormControl disabled={loading.countries}>
        <InputLabel>País</InputLabel>
        <Select
          value={selectedCountry ? JSON.stringify(selectedCountry) : ""}
          onChange={handleCountryChange}
          label="País"
          MenuProps={MenuProps}
        >
          <StyledMenuItem value="">Escolha um país</StyledMenuItem>
          {countries.map((country) => (
            <StyledMenuItem key={country.id} value={JSON.stringify(country)}>
              {country.flag ? (
                <img
                  src={country.flag}
                  alt={country.name}
                  style={{ width: 24, height: 16, marginRight: 8 }}
                />
              ) : (
                "🌍"
              )}
              {country.name}
            </StyledMenuItem>
          ))}
        </Select>
      </StyledFormControl>

      <StyledFormControl disabled={loading.leagues || !selectedCountry}>
        <InputLabel>Liga</InputLabel>
        <Select
          value={selectedLeague ? JSON.stringify(selectedLeague) : ""}
          onChange={handleLeagueChange}
          label="Liga"
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
          {leagues.map((league) => (
            <StyledMenuItem key={league.id} value={JSON.stringify(league)}>
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
    </SelectorsWrapper>
  );
};

Selectors.propTypes = {
  onSelectionsChange: PropTypes.func,
};

export default Selectors;
