const nflTenYearAnchors20260826Raw = `
bart-starr|Bart Starr|QB|#203731|1956|196|Green Bay Packers,1956,1972
paul-hornung|Paul Hornung|RB/K|#203731|1957|104|Green Bay Packers,1957,1967
ray-nitschke|Ray Nitschke|LB|#203731|1958|190|Green Bay Packers,1958,1973
forrest-gregg|Forrest Gregg|OL|#203731|1956|193|Green Bay Packers,1956,1971;Dallas Cowboys,1971,1972
willie-davis|Willie Davis|DL|#203731|1958|162|Cleveland Browns,1958,1960;Green Bay Packers,1960,1970
willie-wood|Willie Wood|DB|#203731|1960|166|Green Bay Packers,1960,1972
johnny-unitas|Johnny Unitas|QB|#002c5f|1956|211|Baltimore Colts,1956,1973;San Diego Chargers,1973,1974
raymond-berry|Raymond Berry|WR|#002c5f|1955|154|Baltimore Colts,1955,1967
lenny-moore|Lenny Moore|RB|#002c5f|1956|143|Baltimore Colts,1956,1968
gino-marchetti|Gino Marchetti|DL|#002c5f|1952|161|Dallas Texans,1952,1953;Baltimore Colts,1953,1967
jim-parker|Jim Parker|OL|#002c5f|1957|135|Baltimore Colts,1957,1968
bob-lilly|Bob Lilly|DL|#003594|1961|196|Dallas Cowboys,1961,1975
mel-renfro|Mel Renfro|DB|#003594|1964|174|Dallas Cowboys,1964,1978
bob-hayes|Bob Hayes|WR|#003594|1965|132|Dallas Cowboys,1965,1975;San Francisco 49ers,1975,1976
larry-little|Larry Little|OL|#008e97|1967|183|San Diego Chargers,1967,1969;Miami Dolphins,1969,1981
bobby-bell|Bobby Bell|LB|#e31837|1963|168|Kansas City Chiefs,1963,1975
len-dawson|Len Dawson|QB|#e31837|1957|211|Pittsburgh Steelers,1957,1960;Cleveland Browns,1960,1962;Dallas Texans,1962,1963;Kansas City Chiefs,1963,1976
buck-buchanan|Buck Buchanan|DL|#e31837|1963|182|Kansas City Chiefs,1963,1976
willie-lanier|Willie Lanier|LB|#e31837|1967|149|Kansas City Chiefs,1967,1978
jan-stenerud|Jan Stenerud|K|#e31837|1967|263|Kansas City Chiefs,1967,1980;Green Bay Packers,1980,1984;Minnesota Vikings,1984,1986
will-shields|Will Shields|OL|#e31837|1993|224|Kansas City Chiefs,1993,2007
jim-otto|Jim Otto|C|#000000|1960|210|Oakland Raiders,1960,1975
gene-upshaw|Gene Upshaw|OL|#000000|1967|217|Oakland Raiders,1967,1982
art-shell|Art Shell|OL|#000000|1968|207|Oakland Raiders,1968,1983;Los Angeles Raiders,1982,1983
fred-biletnikoff|Fred Biletnikoff|WR|#000000|1965|190|Oakland Raiders,1965,1980
`.trim();

const nflTenYearAnchors20260826Rows = nflTenYearAnchors20260826Raw.split("\n").map((line) => {
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

const nflTenYearAnchorSport20260826 = window.lineageSports.nfl;
const existingNflTenYearAnchorIds20260826 = new Set(nflTenYearAnchorSport20260826.players.map((player) => player.id));
const existingNflTenYearAnchorNames20260826 = new Set(nflTenYearAnchorSport20260826.players.map((player) => player.name));
const uniqueNflTenYearAnchors20260826Rows = nflTenYearAnchors20260826Rows.filter(
  ([id, name]) => !existingNflTenYearAnchorIds20260826.has(id) && !existingNflTenYearAnchorNames20260826.has(name),
);

nflTenYearAnchorSport20260826.players.push(
  ...uniqueNflTenYearAnchors20260826Rows.map(([id, name, position, color, teams]) => ({
    id,
    name,
    position,
    color,
    teams: teams.map(([team, from, to]) => ({ team, from, to })),
  })),
);
Object.assign(
  nflTenYearAnchorSport20260826.careerStats,
  Object.fromEntries(uniqueNflTenYearAnchors20260826Rows.map(([id, , , , , debut, games]) => [id, [debut, games]])),
);
