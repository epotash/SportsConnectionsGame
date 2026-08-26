const mlbTenYearAnchors20260826Raw = `
brooks-robinson|Brooks Robinson|3B|#df4601|1955|2896|Baltimore Orioles,1955,1978
frank-white|Frank White|2B|#004687|1973|2324|Kansas City Royals,1973,1991
jim-gantner|Jim Gantner|2B|#ffc52f|1976|1801|Milwaukee Brewers,1976,1993
robin-roberts|Robin Roberts|P|#e81828|1948|676|Philadelphia Phillies,1948,1962;Baltimore Orioles,1962,1966;Houston Astros,1965,1966;Chicago Cubs,1966,1967
mike-schmidt|Mike Schmidt|3B|#e81828|1972|2404|Philadelphia Phillies,1972,1989
richie-ashburn|Richie Ashburn|OF|#e81828|1948|2189|Philadelphia Phillies,1948,1960;Chicago Cubs,1960,1962;New York Mets,1962,1963
kirk-gibson|Kirk Gibson|OF|#0c2340|1979|1635|Detroit Tigers,1979,1988;Los Angeles Dodgers,1988,1991;Kansas City Royals,1991,1992;Pittsburgh Pirates,1992,1993;Detroit Tigers,1993,1996
al-kaline|Al Kaline|OF|#0c2340|1953|2834|Detroit Tigers,1953,1974
willie-mays|Willie Mays|OF|#fd5a1e|1951|2992|New York Giants,1951,1958;San Francisco Giants,1958,1972;New York Mets,1972,1974
willie-mccovey|Willie McCovey|1B|#fd5a1e|1959|2588|San Francisco Giants,1959,1974;San Diego Padres,1974,1977;Oakland Athletics,1976,1977;San Francisco Giants,1977,1981
juan-marichal|Juan Marichal|P|#fd5a1e|1960|471|San Francisco Giants,1960,1974;Boston Red Sox,1974,1975;Los Angeles Dodgers,1975,1976
gaylord-perry|Gaylord Perry|P|#fd5a1e|1962|777|San Francisco Giants,1962,1972;Cleveland Indians,1972,1976;Texas Rangers,1975,1978;San Diego Padres,1978,1980;New York Yankees,1980,1981;Atlanta Braves,1981,1982;Seattle Mariners,1982,1983;Kansas City Royals,1983,1984
ozzie-smith|Ozzie Smith|SS|#c41e3a|1978|2573|San Diego Padres,1978,1982;St. Louis Cardinals,1982,1997
lou-brock|Lou Brock|OF|#c41e3a|1961|2616|Chicago Cubs,1961,1964;St. Louis Cardinals,1964,1979
bob-gibson|Bob Gibson|P|#c41e3a|1959|528|St. Louis Cardinals,1959,1976
stan-musial|Stan Musial|OF/1B|#c41e3a|1941|3026|St. Louis Cardinals,1941,1964
pete-rose|Pete Rose|INF/OF|#c6011f|1963|3562|Cincinnati Reds,1963,1979;Philadelphia Phillies,1979,1984;Montreal Expos,1984,1985;Cincinnati Reds,1984,1987
jim-palmer|Jim Palmer|P|#df4601|1965|558|Baltimore Orioles,1965,1985
boog-powell|Boog Powell|1B|#df4601|1961|2042|Baltimore Orioles,1961,1975;Cleveland Indians,1975,1977;Los Angeles Dodgers,1977,1978
frank-robinson|Frank Robinson|OF|#c6011f|1956|2808|Cincinnati Reds,1956,1966;Baltimore Orioles,1966,1972;Los Angeles Dodgers,1972,1973;California Angels,1973,1975;Cleveland Indians,1974,1977
roberto-clemente|Roberto Clemente|OF|#fdb827|1955|2433|Pittsburgh Pirates,1955,1973
willie-stargell|Willie Stargell|OF/1B|#fdb827|1962|2360|Pittsburgh Pirates,1962,1983
bill-mazeroski|Bill Mazeroski|2B|#fdb827|1956|2163|Pittsburgh Pirates,1956,1973
al-oliver|Al Oliver|OF/1B|#fdb827|1968|2368|Pittsburgh Pirates,1968,1978;Texas Rangers,1978,1982;Montreal Expos,1982,1984;San Francisco Giants,1984,1985;Philadelphia Phillies,1984,1985;Los Angeles Dodgers,1985,1986;Toronto Blue Jays,1985,1986
barry-larkin|Barry Larkin|SS|#c6011f|1986|2180|Cincinnati Reds,1986,2005
`.trim();

const mlbTenYearAnchors20260826Rows = mlbTenYearAnchors20260826Raw.split("\n").map((line) => {
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

const mlbTenYearAnchorSport20260826 = window.lineageSports.mlb;
const existingMlbTenYearAnchorIds20260826 = new Set(mlbTenYearAnchorSport20260826.players.map((player) => player.id));
const existingMlbTenYearAnchorNames20260826 = new Set(mlbTenYearAnchorSport20260826.players.map((player) => player.name));
const uniqueMlbTenYearAnchors20260826Rows = mlbTenYearAnchors20260826Rows.filter(
  ([id, name]) => !existingMlbTenYearAnchorIds20260826.has(id) && !existingMlbTenYearAnchorNames20260826.has(name),
);

mlbTenYearAnchorSport20260826.players.push(
  ...uniqueMlbTenYearAnchors20260826Rows.map(([id, name, position, color, teams]) => ({
    id,
    name,
    position,
    color,
    teams: teams.map(([team, from, to]) => ({ team, from, to })),
  })),
);
Object.assign(
  mlbTenYearAnchorSport20260826.careerStats,
  Object.fromEntries(uniqueMlbTenYearAnchors20260826Rows.map(([id, , , , , debut, games]) => [id, [debut, games]])),
);
