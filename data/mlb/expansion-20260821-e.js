const mlbExpansion20260821ERaw = `
john-olerud|John Olerud|1B|#134a8e|1989|2234|Toronto Blue Jays,1989,1997;New York Mets,1997,2000;Seattle Mariners,2000,2005;New York Yankees,2004,2005;Boston Red Sox,2005,2006
gregg-jefferies|Gregg Jefferies|INF/OF|#ff5910|1987|1465|New York Mets,1987,1992;Kansas City Royals,1992,1993;St. Louis Cardinals,1993,1995;Philadelphia Phillies,1995,1999;Anaheim Angels,1998,1999;Detroit Tigers,1999,2000
raul-mondesi|Raul Mondesi|OF|#005a9c|1993|1525|Los Angeles Dodgers,1993,2000;Toronto Blue Jays,2000,2002;New York Yankees,2002,2003;Arizona Diamondbacks,2003,2004;Pittsburgh Pirates,2004,2005;Anaheim Angels,2004,2005;Atlanta Braves,2005,2006
kevin-seitzer|Kevin Seitzer|3B|#004687|1986|1439|Kansas City Royals,1986,1992;Milwaukee Brewers,1992,1997;Cleveland Indians,1996,1997;Oakland Athletics,1997,1998;Cleveland Indians,1998,1999
bip-roberts|Bip Roberts|2B/OF|#2f241d|1986|1202|San Diego Padres,1986,1992;Cincinnati Reds,1992,1994;Kansas City Royals,1994,1996;Cleveland Indians,1996,1998;Detroit Tigers,1998,1999;Oakland Athletics,1998,1999
`.trim();

const mlbExpansion20260821ERows = mlbExpansion20260821ERaw.split("\n").map((line) => {
  const [id, name, position, color, debut, games, teamsRaw] = line.split("|");
  return [
    id,
    name,
    position,
    color,
    teamsRaw.split(";").map((teamLine) => {
      const [team, from, to] = teamLine.split(",");
      return [team, Number(from), Number(to)];
    }),
    Number(debut),
    Number(games),
  ];
});

const mlbExpansionSport20260821E = window.lineageSports.mlb;
const existingMlbExpansion20260821EIds = new Set(mlbExpansionSport20260821E.players.map((player) => player.id));
const existingMlbExpansion20260821ENames = new Set(mlbExpansionSport20260821E.players.map((player) => player.name));
const uniqueMlbExpansion20260821ERows = mlbExpansion20260821ERows.filter(([id, name]) => (
  !existingMlbExpansion20260821EIds.has(id) && !existingMlbExpansion20260821ENames.has(name)
));

mlbExpansionSport20260821E.players.push(
  ...uniqueMlbExpansion20260821ERows.map(([id, name, position, color, teams]) => ({
    id,
    name,
    position,
    color,
    teams: teams.map(([team, from, to]) => ({ team, from, to })),
  })),
);
Object.assign(
  mlbExpansionSport20260821E.careerStats,
  Object.fromEntries(uniqueMlbExpansion20260821ERows.map(([id, , , , , debut, games]) => [id, [debut, games]])),
);
