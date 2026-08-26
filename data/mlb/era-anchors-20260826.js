const mlbEraAnchors20260826Raw = `
ryan-zimmerman|Ryan Zimmerman|3B/1B|#ab0003|2005|1799|Washington Nationals,2005,2022
stephen-strasburg|Stephen Strasburg|P|#ab0003|2010|247|Washington Nationals,2010,2023
anthony-rendon|Anthony Rendon|3B|#ab0003|2013|1135|Washington Nationals,2013,2020;Los Angeles Angels,2020,2026
ryan-braun|Ryan Braun|OF|#ffc52f|2007|1766|Milwaukee Brewers,2007,2021
jonathan-lucroy|Jonathan Lucroy|C|#ffc52f|2010|1210|Milwaukee Brewers,2010,2016;Texas Rangers,2016,2017;Colorado Rockies,2017,2018;Oakland Athletics,2018,2019;Los Angeles Angels,2019,2020;Chicago Cubs,2019,2020;Boston Red Sox,2020,2021;Washington Nationals,2021,2022;Atlanta Braves,2021,2022
joe-mauer|Joe Mauer|C/1B|#002b5c|2004|1858|Minnesota Twins,2004,2019
brian-roberts|Brian Roberts|2B|#df4601|2001|1418|Baltimore Orioles,2001,2014;New York Yankees,2014,2015
matt-wieters|Matt Wieters|C|#df4601|2009|1336|Baltimore Orioles,2009,2017;Washington Nationals,2017,2019;St. Louis Cardinals,2019,2021
jorge-posada|Jorge Posada|C|#132448|1995|1829|New York Yankees,1995,2012
andy-pettitte|Andy Pettitte|P|#132448|1995|531|New York Yankees,1995,2004;Houston Astros,2004,2007;New York Yankees,2007,2011;New York Yankees,2012,2014
bernie-williams|Bernie Williams|OF|#132448|1991|2076|New York Yankees,1991,2007
mark-teixeira|Mark Teixeira|1B|#132448|2003|1862|Texas Rangers,2003,2007;Atlanta Braves,2007,2008;Los Angeles Angels,2008,2009;New York Yankees,2009,2017
dustin-pedroia|Dustin Pedroia|2B|#bd3039|2006|1512|Boston Red Sox,2006,2020
jon-lester|Jon Lester|P|#bd3039|2006|452|Boston Red Sox,2006,2014;Oakland Athletics,2014,2015;Chicago Cubs,2015,2021;Washington Nationals,2021,2022;St. Louis Cardinals,2021,2022
brandon-crawford|Brandon Crawford|SS|#fd5a1e|2011|1682|San Francisco Giants,2011,2024;St. Louis Cardinals,2024,2025
brandon-belt|Brandon Belt|1B|#fd5a1e|2011|1472|San Francisco Giants,2011,2023;Toronto Blue Jays,2023,2024
tim-lincecum|Tim Lincecum|P|#fd5a1e|2007|278|San Francisco Giants,2007,2016;Los Angeles Angels,2016,2017
cole-hamels|Cole Hamels|P|#e81828|2006|423|Philadelphia Phillies,2006,2015;Texas Rangers,2015,2018;Chicago Cubs,2018,2020;Atlanta Braves,2020,2021
ryan-howard|Ryan Howard|1B|#e81828|2004|1572|Philadelphia Phillies,2004,2017
dustin-may|Dustin May|P|#005a9c|2019|70|Los Angeles Dodgers,2019,2026
kenley-jansen|Kenley Jansen|P|#005a9c|2010|870|Los Angeles Dodgers,2010,2022;Atlanta Braves,2022,2023;Boston Red Sox,2023,2025;Los Angeles Angels,2025,2026
andrelton-simmons|Andrelton Simmons|SS|#ce1141|2012|1226|Atlanta Braves,2012,2016;Los Angeles Angels,2016,2021;Minnesota Twins,2021,2022;Chicago Cubs,2022,2023
eric-hosmer|Eric Hosmer|1B|#004687|2011|1689|Kansas City Royals,2011,2018;San Diego Padres,2018,2022;Boston Red Sox,2022,2023;Chicago Cubs,2023,2024
mike-moustakas|Mike Moustakas|3B|#004687|2011|1427|Kansas City Royals,2011,2018;Milwaukee Brewers,2018,2020;Cincinnati Reds,2020,2023;Colorado Rockies,2023,2024;Los Angeles Angels,2023,2024;Chicago White Sox,2024,2025
alex-gordon|Alex Gordon|OF|#004687|2007|1753|Kansas City Royals,2007,2020
josh-harrison|Josh Harrison|INF/OF|#fdb827|2011|1208|Pittsburgh Pirates,2011,2019;Detroit Tigers,2019,2020;Washington Nationals,2020,2021;Oakland Athletics,2021,2022;Chicago White Sox,2022,2023;Philadelphia Phillies,2023,2024
jordy-mercer|Jordy Mercer|SS|#fdb827|2012|950|Pittsburgh Pirates,2012,2019;Detroit Tigers,2019,2021;Washington Nationals,2021,2022
andruw-jones|Andruw Jones|OF|#ce1141|1996|2196|Atlanta Braves,1996,2008;Los Angeles Dodgers,2008,2009;Texas Rangers,2009,2010;Chicago White Sox,2010,2011;New York Yankees,2011,2013
mike-sweeney|Mike Sweeney|1B/DH|#004687|1995|1454|Kansas City Royals,1995,2008;Oakland Athletics,2008,2009;Seattle Mariners,2009,2010;Philadelphia Phillies,2010,2011
billy-butler|Billy Butler|DH/1B|#004687|2007|1414|Kansas City Royals,2007,2015;Oakland Athletics,2015,2016;New York Yankees,2016,2017
`.trim();

const mlbEraAnchors20260826Rows = mlbEraAnchors20260826Raw.split("\n").map((line) => {
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

const mlbEraAnchorsSport20260826 = window.lineageSports.mlb;
const existingMlbEraAnchorIds20260826 = new Set(mlbEraAnchorsSport20260826.players.map((player) => player.id));
const existingMlbEraAnchorNames20260826 = new Set(mlbEraAnchorsSport20260826.players.map((player) => player.name));
const newMlbEraAnchorIds20260826 = new Set();
const newMlbEraAnchorNames20260826 = new Set();
const uniqueMlbEraAnchors20260826Rows = mlbEraAnchors20260826Rows.filter(([id, name]) => {
  if (
    existingMlbEraAnchorIds20260826.has(id) ||
    existingMlbEraAnchorNames20260826.has(name) ||
    newMlbEraAnchorIds20260826.has(id) ||
    newMlbEraAnchorNames20260826.has(name)
  ) {
    return false;
  }
  newMlbEraAnchorIds20260826.add(id);
  newMlbEraAnchorNames20260826.add(name);
  return true;
});

mlbEraAnchorsSport20260826.players.push(
  ...uniqueMlbEraAnchors20260826Rows.map(([id, name, position, color, teams]) => ({
    id,
    name,
    position,
    color,
    teams: teams.map(([team, from, to]) => ({ team, from, to })),
  })),
);
Object.assign(
  mlbEraAnchorsSport20260826.careerStats,
  Object.fromEntries(uniqueMlbEraAnchors20260826Rows.map(([id, , , , , debut, games]) => [id, [debut, games]])),
);
