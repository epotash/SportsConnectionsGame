const nbaEraAnchors20260826Raw = `
tim-duncan|Tim Duncan|PF/C|#c4ced4|1997|1392|San Antonio Spurs,1997,2016
manu-ginobili|Manu Ginobili|SG|#c4ced4|2002|1057|San Antonio Spurs,2002,2018
tony-parker|Tony Parker|PG|#c4ced4|2001|1254|San Antonio Spurs,2001,2018;Charlotte Hornets,2018,2019
dirk-nowitzki|Dirk Nowitzki|PF|#00538c|1998|1522|Dallas Mavericks,1998,2019
kobe-bryant|Kobe Bryant|SG|#552583|1996|1346|Los Angeles Lakers,1996,2016
udonis-haslem|Udonis Haslem|PF|#98002e|2003|879|Miami Heat,2003,2023
dwyane-wade|Dwyane Wade|SG|#98002e|2003|1054|Miami Heat,2003,2016;Chicago Bulls,2016,2017;Cleveland Cavaliers,2017,2018;Miami Heat,2018,2019
kyle-lowry|Kyle Lowry|PG|#ce1141|2006|1138|Memphis Grizzlies,2006,2009;Houston Rockets,2009,2012;Toronto Raptors,2012,2021;Miami Heat,2021,2024;Philadelphia 76ers,2024,2026
demar-derozan|DeMar DeRozan|SG/SF|#ce1141|2009|1180|Toronto Raptors,2009,2018;San Antonio Spurs,2018,2021;Chicago Bulls,2021,2024;Sacramento Kings,2024,2026
mike-conley|Mike Conley|PG|#5d76a9|2007|1170|Memphis Grizzlies,2007,2019;Utah Jazz,2019,2023;Minnesota Timberwolves,2023,2026
marc-gasol|Marc Gasol|C|#5d76a9|2008|891|Memphis Grizzlies,2008,2019;Toronto Raptors,2019,2020;Los Angeles Lakers,2020,2021
zach-randolph|Zach Randolph|PF|#5d76a9|2001|1116|Portland Trail Blazers,2001,2007;New York Knicks,2007,2008;Los Angeles Clippers,2008,2009;Memphis Grizzlies,2009,2017;Sacramento Kings,2017,2019
tony-allen|Tony Allen|SG|#5d76a9|2004|820|Boston Celtics,2004,2010;Memphis Grizzlies,2010,2017;New Orleans Pelicans,2017,2018
damian-lillard|Damian Lillard|PG|#e03a3e|2012|900|Portland Trail Blazers,2012,2023;Milwaukee Bucks,2023,2025;Portland Trail Blazers,2025,2026
c-j-mccollum|CJ McCollum|SG|#e03a3e|2013|820|Portland Trail Blazers,2013,2022;New Orleans Pelicans,2022,2026
lamarcus-aldridge|LaMarcus Aldridge|PF/C|#e03a3e|2006|1076|Portland Trail Blazers,2006,2015;San Antonio Spurs,2015,2021;Brooklyn Nets,2021,2022
russell-westbrook|Russell Westbrook|PG|#007ac1|2008|1237|Oklahoma City Thunder,2008,2019;Houston Rockets,2019,2020;Washington Wizards,2020,2021;Los Angeles Lakers,2021,2023;Los Angeles Clippers,2023,2024;Denver Nuggets,2024,2025;Sacramento Kings,2025,2026
nick-collison|Nick Collison|PF/C|#007ac1|2003|910|Seattle SuperSonics,2003,2008;Oklahoma City Thunder,2008,2018
serge-ibaka|Serge Ibaka|PF/C|#007ac1|2009|919|Oklahoma City Thunder,2009,2016;Orlando Magic,2016,2017;Toronto Raptors,2017,2020;Los Angeles Clippers,2020,2022;Milwaukee Bucks,2022,2023
klay-thompson|Klay Thompson|SG|#1d428a|2011|793|Golden State Warriors,2011,2024;Dallas Mavericks,2024,2026
draymond-green|Draymond Green|PF|#1d428a|2012|850|Golden State Warriors,2012,2026
andre-iguodala|Andre Iguodala|SF|#1d428a|2004|1231|Philadelphia 76ers,2004,2012;Denver Nuggets,2012,2013;Golden State Warriors,2013,2019;Miami Heat,2019,2021;Golden State Warriors,2021,2023
al-horford|Al Horford|C/PF|#e03a3e|2007|1138|Atlanta Hawks,2007,2016;Boston Celtics,2016,2019;Philadelphia 76ers,2019,2020;Oklahoma City Thunder,2020,2021;Boston Celtics,2021,2026
paul-millsap|Paul Millsap|PF|#e03a3e|2006|1085|Utah Jazz,2006,2013;Atlanta Hawks,2013,2017;Denver Nuggets,2017,2021;Brooklyn Nets,2021,2022;Philadelphia 76ers,2022,2023
brook-lopez|Brook Lopez|C|#000000|2008|1100|New Jersey Nets,2008,2012;Brooklyn Nets,2012,2017;Los Angeles Lakers,2017,2018;Milwaukee Bucks,2018,2026
norris-cole|Norris Cole|PG|#98002e|2011|360|Miami Heat,2011,2015;New Orleans Pelicans,2015,2016;Oklahoma City Thunder,2016,2017
michael-cooper|Michael Cooper|SG|#552583|1978|873|Los Angeles Lakers,1978,1990
bill-cartwright|Bill Cartwright|C|#006bb6|1979|963|New York Knicks,1979,1988;Chicago Bulls,1988,1994;Seattle SuperSonics,1994,1995
`.trim();

const nbaEraAnchors20260826Rows = nbaEraAnchors20260826Raw.split("\n").map((line) => {
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

const nbaEraAnchorsSport20260826 = window.lineageSports.nba;
const existingNbaEraAnchorIds20260826 = new Set(nbaEraAnchorsSport20260826.players.map((player) => player.id));
const existingNbaEraAnchorNames20260826 = new Set(nbaEraAnchorsSport20260826.players.map((player) => player.name));
const newNbaEraAnchorIds20260826 = new Set();
const newNbaEraAnchorNames20260826 = new Set();
const uniqueNbaEraAnchors20260826Rows = nbaEraAnchors20260826Rows.filter(([id, name]) => {
  if (
    existingNbaEraAnchorIds20260826.has(id) ||
    existingNbaEraAnchorNames20260826.has(name) ||
    newNbaEraAnchorIds20260826.has(id) ||
    newNbaEraAnchorNames20260826.has(name)
  ) {
    return false;
  }
  newNbaEraAnchorIds20260826.add(id);
  newNbaEraAnchorNames20260826.add(name);
  return true;
});

nbaEraAnchorsSport20260826.players.push(
  ...uniqueNbaEraAnchors20260826Rows.map(([id, name, position, color, teams]) => ({
    id,
    name,
    position,
    color,
    teams: teams.map(([team, from, to]) => ({ team, from, to })),
  })),
);
Object.assign(
  nbaEraAnchorsSport20260826.careerStats,
  Object.fromEntries(uniqueNbaEraAnchors20260826Rows.map(([id, , , , , debut, games]) => [id, [debut, games]])),
);
