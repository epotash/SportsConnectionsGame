const nbaTenYearAnchors20260826Raw = `
bob-cousy|Bob Cousy|PG|#007a33|1950|924|Boston Celtics,1950,1963;Cincinnati Royals,1969,1970
sam-jones|Sam Jones|SG|#007a33|1957|871|Boston Celtics,1957,1969
dave-cowens|Dave Cowens|C|#007a33|1970|766|Boston Celtics,1970,1980;Milwaukee Bucks,1982,1983
jo-jo-white|Jo Jo White|PG|#007a33|1969|837|Boston Celtics,1969,1979;Golden State Warriors,1979,1980;Kansas City Kings,1980,1981
john-havlicek|John Havlicek|SF|#007a33|1962|1270|Boston Celtics,1962,1978
robert-parish|Robert Parish|C|#007a33|1976|1611|Golden State Warriors,1976,1980;Boston Celtics,1980,1994;Charlotte Hornets,1994,1996;Chicago Bulls,1996,1997
elgin-baylor|Elgin Baylor|SF|#552583|1958|846|Minneapolis Lakers,1958,1960;Los Angeles Lakers,1960,1972
jerry-west|Jerry West|PG/SG|#552583|1960|932|Los Angeles Lakers,1960,1974
willis-reed|Willis Reed|C|#006bb6|1964|650|New York Knicks,1964,1974
maurice-cheeks|Maurice Cheeks|PG|#006bb6|1978|1101|Philadelphia 76ers,1978,1989;San Antonio Spurs,1989,1990;New York Knicks,1990,1991;Atlanta Hawks,1991,1992;New Jersey Nets,1992,1993
hal-greer|Hal Greer|SG|#006bb6|1958|1122|Syracuse Nationals,1958,1963;Philadelphia 76ers,1963,1973
dolph-schayes|Dolph Schayes|PF|#006bb6|1949|996|Syracuse Nationals,1949,1963;Philadelphia 76ers,1963,1964
wes-unseld|Wes Unseld|C|#002b5c|1968|984|Baltimore Bullets,1968,1973;Capital Bullets,1973,1974;Washington Bullets,1974,1981
nate-thurmond|Nate Thurmond|C|#1d428a|1963|964|San Francisco Warriors,1963,1971;Golden State Warriors,1971,1974;Chicago Bulls,1974,1976;Cleveland Cavaliers,1976,1977
al-attles|Al Attles|PG|#1d428a|1960|711|Philadelphia Warriors,1960,1962;San Francisco Warriors,1962,1971
bob-lanier|Bob Lanier|C|#1d42ba|1970|959|Detroit Pistons,1970,1980;Milwaukee Bucks,1980,1984
dan-issel|Dan Issel|C/PF|#0e2240|1975|718|Denver Nuggets,1975,1985
alex-english|Alex English|SF|#0e2240|1976|1193|Milwaukee Bucks,1976,1978;Indiana Pacers,1978,1980;Denver Nuggets,1980,1990;Dallas Mavericks,1990,1991
walter-davis|Walter Davis|SG/SF|#e56020|1977|1033|Phoenix Suns,1977,1988;Denver Nuggets,1988,1991;Portland Trail Blazers,1991,1992
alvan-adams|Alvan Adams|C/PF|#e56020|1975|988|Phoenix Suns,1975,1988
mark-eaton|Mark Eaton|C|#002b5c|1982|875|Utah Jazz,1982,1993
darrell-griffith|Darrell Griffith|SG|#002b5c|1980|765|Utah Jazz,1980,1991
sidney-moncrief|Sidney Moncrief|SG|#00471b|1979|767|Milwaukee Bucks,1979,1989;Atlanta Hawks,1990,1991
calvin-murphy|Calvin Murphy|PG|#ce1141|1970|1002|San Diego Rockets,1970,1971;Houston Rockets,1971,1983
rudy-tomjanovich|Rudy Tomjanovich|SF/PF|#ce1141|1970|768|San Diego Rockets,1970,1971;Houston Rockets,1971,1981
jerry-sloan|Jerry Sloan|SG|#ce1141|1965|755|Baltimore Bullets,1965,1966;Chicago Bulls,1966,1976
tree-rollins|Tree Rollins|C|#e03a3e|1977|1156|Atlanta Hawks,1977,1988;Cleveland Cavaliers,1988,1990;Detroit Pistons,1990,1991;Houston Rockets,1991,1992;Orlando Magic,1993,1995
`.trim();

const nbaTenYearAnchors20260826Rows = nbaTenYearAnchors20260826Raw.split("\n").map((line) => {
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

const nbaTenYearAnchorSport20260826 = window.lineageSports.nba;
const existingNbaTenYearAnchorIds20260826 = new Set(nbaTenYearAnchorSport20260826.players.map((player) => player.id));
const existingNbaTenYearAnchorNames20260826 = new Set(nbaTenYearAnchorSport20260826.players.map((player) => player.name));
const uniqueNbaTenYearAnchors20260826Rows = nbaTenYearAnchors20260826Rows.filter(
  ([id, name]) => !existingNbaTenYearAnchorIds20260826.has(id) && !existingNbaTenYearAnchorNames20260826.has(name),
);

nbaTenYearAnchorSport20260826.players.push(
  ...uniqueNbaTenYearAnchors20260826Rows.map(([id, name, position, color, teams]) => ({
    id,
    name,
    position,
    color,
    teams: teams.map(([team, from, to]) => ({ team, from, to })),
  })),
);
Object.assign(
  nbaTenYearAnchorSport20260826.careerStats,
  Object.fromEntries(uniqueNbaTenYearAnchors20260826Rows.map(([id, , , , , debut, games]) => [id, [debut, games]])),
);
